import { useState, useCallback } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchScanResult } from '../model/scan_api';
import { MOCK_SCAN_RESULT } from '../model/scan_mock';
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

  const queryKey = ['scanResult', params.analysisId || 'latest'];

  const {
    data: scanResult = null,
    isLoading,
    error: queryError,
    refetch,
  } = useQuery<ScanResult>({
    queryKey,
    queryFn: () => fetchScanResult(params.analysisId),
  });

  const displayImageUri =
    params.imageUri ||
    scanResult?.image_url ||
    MOCK_SCAN_RESULT.image_url;

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
    (id?: string) => {
      if (!id) return;
      try {
        router.push({
          pathname: '/library/ingredient/[id]' as any,
          params: { id },
        });
      } catch {
        // Safe navigation fallback
      }
    },
    [router]
  );

  const retry = useCallback(() => {
    void refetch();
  }, [refetch]);

  const errorMessage = queryError instanceof Error ? queryError.message : null;

  return {
    scanResult: scanResult || MOCK_SCAN_RESULT,
    displayImageUri,
    activeTab,
    isLoading,
    isRefreshing,
    error: errorMessage,
    setTab: setActiveTab,
    handleClose,
    handleIngredientPress,
    onRefresh,
    retry,
  };
}
