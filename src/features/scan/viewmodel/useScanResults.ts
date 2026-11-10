import { useState, useCallback } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { isMockEnabled } from '@/shared/config/mockConfig';
import { fetchScanResult } from '../model/scan_api';
import { MOCK_SCAN_RESULT } from '../model/scan_mock';
import { useScanStore, normalizeFileUri } from '../model/scanStore';
import {
  ScanResult,
  ScanResultsParams,
  ScanResultsTab,
} from '../model/scan_types';

export interface UseScanResultsReturn {
  // Data
  scanResult: ScanResult | null;
  displayImageUri: string;
  activeTab: ScanResultsTab;

  // States
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;

  // Actions
  setTab: (tab: ScanResultsTab) => void;
  handleClose: () => void;
  handleIngredientPress: (id?: string) => void;
  onRefresh: () => Promise<void>;
  retry: () => void;
}

/**
 * ViewModel hook for Scan Results screen (Section 4.6 & 4.7).
 * Ingests analysis ID & photo URI from route parameters, orchestrates
 * React Query data hydration with cache invalidation, and controls dual-tab switching.
 */
export function useScanResults(): UseScanResultsReturn {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{ analysisId?: string; imageUri?: string }>();

  const [activeTab, setActiveTab] = useState<ScanResultsTab>('results');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const rawIdParam = params.analysisId;
  const analysisId = Array.isArray(rawIdParam) ? rawIdParam[0] : rawIdParam;

  const storeResult = useScanStore((state) => state.latestScanResult);
  const storeUri = useScanStore((state) => state.capturedImageUri);

  const rawParam = params.imageUri;
  const rawUri = Array.isArray(rawParam) ? rawParam[0] : rawParam;

  // Prefer in-memory fresh scan result if it matches or if analysisId was omitted
  const matchingStoreResult =
    (analysisId && storeResult?.id === analysisId) || (!analysisId && storeResult)
      ? storeResult
      : null;

  const targetId = analysisId || storeResult?.id;
  const queryKey = ['scanResult', targetId || 'latest'];

  const {
    data: fetchedResult = null,
    isLoading: isQueryLoading,
    error: queryError,
    refetch,
  } = useQuery<ScanResult>({
    queryKey,
    queryFn: () => fetchScanResult(targetId),
    initialData: matchingStoreResult || undefined,
    staleTime: matchingStoreResult ? 1000 * 60 * 5 : 0,
  });

  // Determine final scan result: live queried result > fresh in-memory result > mock fallback (only if mock is enabled!)
  const activeScanResult: ScanResult | null =
    fetchedResult || matchingStoreResult || (isMockEnabled('scan') ? MOCK_SCAN_RESULT : null);

  // Determine display image URI:
  // 1. Fresh in-memory capture if it matches current result
  // 2. Explicit route param rawUri (normalized)
  // 3. activeScanResult.image_url (from Supabase or mock)
  // 4. storeUri fallback (if no specific analysisId was targeted)
  const candidateUri =
    (matchingStoreResult && storeUri) ||
    (rawUri ? normalizeFileUri(rawUri) : '') ||
    activeScanResult?.image_url ||
    (!analysisId ? storeUri : '') ||
    '';

  const displayImageUri = (candidateUri || '').trim().replace(/\?$/, '');

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey });
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient, queryKey]);

  const handleClose = useCallback(() => {
    try {
      router.replace('/(tabs)');
    } catch {
      router.replace('/(tabs)');
    }
  }, [router]);

  const handleIngredientPress = useCallback(
    (_id?: string) => {
      // Handled directly via modal sheet in compatibility tab
    },
    []
  );

  const retry = useCallback(() => {
    void refetch();
  }, [refetch]);

  const errorMessage = queryError instanceof Error ? queryError.message : null;

  return {
    scanResult: activeScanResult,
    displayImageUri,
    activeTab,
    isLoading: isQueryLoading && !activeScanResult,
    isRefreshing,
    error: errorMessage,
    setTab: setActiveTab,
    handleClose,
    handleIngredientPress,
    onRefresh,
    retry,
  };
}
