import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchHistoryPage, USE_MOCK as USE_HISTORY_MOCK } from '../../history/model/history_api';
import { fetchCompatibility } from '../../scan/model/scan_api';
import { ProductCompatibilityStatus, ProductDetail } from '../model/library_types';
import { fetchProductById } from '../model/library_api';

interface UseProductDetailResult {
  product: ProductDetail | undefined;
  isLoading: boolean;
  error: string | null;
  compatibilityStatus: ProductCompatibilityStatus;
  compatibilityError: string | null;
  isCompatibilityLoading: boolean;
  canRetryCompatibility: boolean;
  actions: {
    retry: () => Promise<void>;
    retryCompatibility: () => Promise<void>;
  };
}

export function useProductDetail(productId: string): UseProductDetailResult {
  const productQuery = useQuery({
    queryKey: ['library', 'product', productId],
    queryFn: () => fetchProductById(productId),
    enabled: productId.trim().length > 0,
  });

  const latestAnalysisQuery = useQuery({
    queryKey: ['library', 'product-detail', 'latest-analysis'],
    queryFn: async () => {
      if (!USE_HISTORY_MOCK) {
        throw new Error('The history service does not document latest-scan ordering.');
      }

      const page = await fetchHistoryPage({ limit: 1, offset: 0 });
      return page.items[0] ?? null;
    },
  });

  const latestAnalysisId = latestAnalysisQuery.data?.id;
  const compatibilityQuery = useQuery({
    queryKey: ['library', 'product-compatibility', latestAnalysisId],
    queryFn: async () => {
      if (!latestAnalysisId) {
        throw new Error('A skin analysis is required to review product compatibility.');
      }

      const compatibility = await fetchCompatibility(latestAnalysisId);
      if (compatibility.analysis_id !== latestAnalysisId) {
        throw new Error('The compatibility service returned results for a different skin analysis.');
      }
      return compatibility;
    },
    enabled: Boolean(latestAnalysisId),
  });

  const compatibilityStatus: ProductCompatibilityStatus =
    latestAnalysisQuery.isLoading
      ? 'unavailable'
      : latestAnalysisQuery.isError
        ? 'unavailable'
        : !latestAnalysisQuery.data
          ? 'scan_needed'
          : compatibilityQuery.isLoading || compatibilityQuery.isError
            ? 'unavailable'
            : 'review';

  const retry = useCallback(async () => {
    await productQuery.refetch();
  }, [productQuery]);

  const retryCompatibility = useCallback(async () => {
    if (latestAnalysisQuery.isError) {
      await latestAnalysisQuery.refetch();
      return;
    }

    if (latestAnalysisQuery.data) {
      await compatibilityQuery.refetch();
    }
  }, [compatibilityQuery, latestAnalysisQuery]);

  return {
    product: productQuery.data,
    isLoading: productQuery.isLoading,
    error: productQuery.error instanceof Error
      ? productQuery.error.message
      : null,
    compatibilityStatus,
    compatibilityError: latestAnalysisQuery.error instanceof Error
      ? latestAnalysisQuery.error.message
      : compatibilityQuery.error instanceof Error
        ? compatibilityQuery.error.message
        : null,
    isCompatibilityLoading: latestAnalysisQuery.isLoading
      || (Boolean(latestAnalysisQuery.data) && compatibilityQuery.isLoading),
    canRetryCompatibility: USE_HISTORY_MOCK
    && (latestAnalysisQuery.isError || Boolean(latestAnalysisQuery.data)),
    actions: {
      retry,
      retryCompatibility,
    },
  };
}
