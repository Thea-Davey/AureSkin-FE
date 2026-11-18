import { useState, useCallback, useRef } from 'react';
import { NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { isMockEnabled } from '@/shared/config/mockConfig';
import { deleteHistoryEntry } from '../../history/model/history_api';
import { fetchScanResult } from '../model/scan_api';
import { MOCK_SCAN_RESULT } from '../model/scan_mock';
import { useScanStore, normalizeFileUri } from '../model/scanStore';
import {
  ScanResult,
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
  isDiscarding: boolean;
  isSaveSuccessOpen: boolean;
  isDiscardDialogOpen: boolean;
  isFooterVisible: boolean;
  error: string | null;

  // Actions
  setTab: (tab: ScanResultsTab) => void;
  handleClose: () => void;
  handleIngredientPress: (id?: string) => void;
  handleSavePress: () => void;
  handleSuccessGoHome: () => void;
  handleSuccessViewHistory: () => void;
  openDiscardDialog: () => void;
  closeDiscardDialog: () => void;
  handleConfirmDiscard: () => Promise<void>;
  handleScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
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

  const [activeTab, setActiveTabState] = useState<ScanResultsTab>('results');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isDiscarding, setIsDiscarding] = useState<boolean>(false);
  const [isSaveSuccessOpen, setIsSaveSuccessOpen] = useState<boolean>(false);
  const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState<boolean>(false);
  const [isFooterVisible, setIsFooterVisible] = useState<boolean>(true);

  const lastScrollYRef = useRef<number>(0);
  const lastScrollTimeRef = useRef<number>(0);

  const setTab = useCallback((tab: ScanResultsTab) => {
    setActiveTabState(tab);
    lastScrollYRef.current = 0;
    lastScrollTimeRef.current = Date.now();
    setIsFooterVisible(true);
  }, []);

  const rawIdParam = params.analysisId;
  const analysisId = Array.isArray(rawIdParam) ? rawIdParam[0] : rawIdParam;

  const storeResult = useScanStore((state) => state.latestScanResult);
  const storeUri = useScanStore((state) => state.capturedImageUri);
  const storeShotType = useScanStore((state) => state.shotType);
  const storePhotos = useScanStore((state) => state.photos);
  const resetScanSetup = useScanStore((state) => state.resetScanSetup);
  const setLatestScanResult = useScanStore((state) => state.setLatestScanResult);

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
  const baseScanResult: ScanResult | null =
    fetchedResult || matchingStoreResult || (isMockEnabled('scan') ? MOCK_SCAN_RESULT : null);

  // Enrich with shotType and photos from store if not already populated on result
  const activeScanResult: ScanResult | null = baseScanResult
    ? {
        ...baseScanResult,
        shot_type: baseScanResult.shot_type || storeShotType || undefined,
        image_urls:
          baseScanResult.image_urls ||
          (storePhotos && (storePhotos.front || storePhotos.left || storePhotos.right)
            ? {
                ...(storePhotos.front ? { front: storePhotos.front } : {}),
                ...(storePhotos.left ? { left: storePhotos.left } : {}),
                ...(storePhotos.right ? { right: storePhotos.right } : {}),
              }
            : undefined),
      }
    : null;

  // Determine display image URI:
  // 1. Fresh in-memory capture if it matches current result
  // 2. Explicit route param rawUri (normalized)
  // 3. activeScanResult.image_urls?.front or activeScanResult.image_url (from Supabase or mock)
  // 4. storeUri fallback (if no specific analysisId was targeted)
  const candidateUri =
    (matchingStoreResult && storeUri) ||
    (rawUri ? normalizeFileUri(rawUri) : '') ||
    activeScanResult?.image_urls?.front ||
    activeScanResult?.image_url ||
    (!analysisId ? storeUri : '') ||
    '';

  const displayImageUri = (candidateUri || '').trim().replace(/\?$/, '');

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.race([
        queryClient.invalidateQueries({ queryKey }),
        new Promise((resolve) => setTimeout(resolve, 2500)),
      ]);
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

  const handleSavePress = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ['history'] });
    void queryClient.invalidateQueries({ queryKey: ['home'] });
    void queryClient.invalidateQueries({ queryKey: ['library'] });
    void queryClient.invalidateQueries({ queryKey: ['routine'] });
    setIsSaveSuccessOpen(true);
  }, [queryClient]);

  const handleSuccessGoHome = useCallback(() => {
    setIsSaveSuccessOpen(false);
    resetScanSetup();
    router.replace('/(tabs)');
  }, [resetScanSetup, router]);

  const handleSuccessViewHistory = useCallback(() => {
    setIsSaveSuccessOpen(false);
    resetScanSetup();
    router.replace('/(tabs)/history');
  }, [resetScanSetup, router]);

  const openDiscardDialog = useCallback(() => {
    setIsDiscardDialogOpen(true);
  }, []);

  const closeDiscardDialog = useCallback(() => {
    setIsDiscardDialogOpen(false);
  }, []);

  const handleConfirmDiscard = useCallback(async () => {
    setIsDiscardDialogOpen(false);
    setIsDiscarding(true);
    try {
      if (activeScanResult?.id) {
        await deleteHistoryEntry(activeScanResult.id);
      }
      void queryClient.invalidateQueries({ queryKey: ['history'] });
      void queryClient.invalidateQueries({ queryKey: ['home'] });
      void queryClient.invalidateQueries({ queryKey: ['library'] });
      void queryClient.invalidateQueries({ queryKey: ['routine'] });
    } catch {
      // Proceed cleanly even if mock/offline deletion fails
    } finally {
      setLatestScanResult(null);
      resetScanSetup();
      setIsDiscarding(false);
      router.replace('/(tabs)');
    }
  }, [activeScanResult?.id, queryClient, setLatestScanResult, resetScanSetup, router]);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const y = Math.max(0, contentOffset.y);
    const now = Date.now();
    const prevY = lastScrollYRef.current;
    const prevTime = lastScrollTimeRef.current || now - 16;

    const dy = y - prevY;
    const dt = Math.max(now - prevTime, 1);
    const velocity = Math.abs(dy) / dt; // px per ms (0.75 px/ms = 750 px/sec)

    lastScrollYRef.current = y;
    lastScrollTimeRef.current = now;

    // Always reveal at the very top of the page
    if (y <= 16) {
      setIsFooterVisible(true);
      return;
    }

    // Always reveal when the user reaches the bottom of the report
    const isScrollable = contentSize.height > layoutMeasurement.height + 24;
    if (isScrollable && y + layoutMeasurement.height >= contentSize.height - 36) {
      setIsFooterVisible(true);
      return;
    }

    // Swiping finger UP (reading further down the page) -> collapse footer
    if (dy > 6 && y > 40) {
      setIsFooterVisible(false);
      return;
    }

    // Swiping finger DOWN (scrolling back up) -> only reveal on fast intentional flick
    if (dy < -6 && (velocity >= 0.75 || dy <= -28)) {
      setIsFooterVisible(true);
    }
  }, []);

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
    isDiscarding,
    isSaveSuccessOpen,
    isDiscardDialogOpen,
    isFooterVisible,
    error: errorMessage,
    setTab,
    handleClose,
    handleIngredientPress,
    handleSavePress,
    handleSuccessGoHome,
    handleSuccessViewHistory,
    openDiscardDialog,
    closeDiscardDialog,
    handleConfirmDiscard,
    handleScroll,
    onRefresh,
    retry,
  };
}
