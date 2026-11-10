import { useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchHistoryPage } from '../../history/model/history_api';
import { fetchCompatibility, USE_MOCK as USE_SCAN_MOCK } from '../../scan/model/scan_api';
import { MOCK_COMPATIBILITY } from '../../scan/model/scan_mock';
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
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  const latestAnalysisQuery = useQuery({
    queryKey: ['library', 'product-detail', 'latest-analysis'],
    queryFn: async () => {
      const page = await fetchHistoryPage({ limit: 1, offset: 0 });
      return page.items[0] ?? null;
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  const latestAnalysisId = latestAnalysisQuery.data?.id;
  const compatibilityQuery = useQuery({
    queryKey: ['library', 'product-compatibility', latestAnalysisId],
    queryFn: async () => {
      if (!latestAnalysisId) {
        throw new Error('A skin analysis is required to review product compatibility.');
      }

      const compatibility = await fetchCompatibility(latestAnalysisId);
      if (!USE_SCAN_MOCK && compatibility.analysis_id !== latestAnalysisId) {
        throw new Error('The compatibility service returned results for a different skin analysis.');
      }
      return compatibility;
    },
    enabled: Boolean(latestAnalysisId),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  const compatibilityStatus = useMemo<ProductCompatibilityStatus>(() => {
    if (productQuery.isLoading || latestAnalysisQuery.isLoading || compatibilityQuery.isLoading) {
      return 'unavailable';
    }
    if (productQuery.isError) {
      return 'unavailable';
    }

    // In mock mode fallback or with loaded data:
    const compatibility = compatibilityQuery.data ?? (
      USE_SCAN_MOCK ? MOCK_COMPATIBILITY : undefined
    );
    const analysis = latestAnalysisQuery.data;

    if (!analysis && !USE_SCAN_MOCK) {
      return 'scan_needed';
    }

    const product = productQuery.data;
    if (!product || !compatibility) {
      return 'review';
    }

    // Check 1: Incompatible pairs check
    const ingredientNames = (product.ingredients ?? []).map((i) => i.name.toLowerCase());
    const hasIncompatibleConflict = (compatibility.incompatible_pairs ?? []).some((pair) => {
      const a = pair.ingredient_a.toLowerCase();
      const b = pair.ingredient_b.toLowerCase();
      const containsA = ingredientNames.some((name) => name.includes(a) || a.includes(name));
      const containsB = ingredientNames.some((name) => name.includes(b) || b.includes(name));
      return containsA && containsB;
    });

    if (hasIncompatibleConflict) {
      return 'review';
    }

    // Check 2: Skin type matching
    const userSkinType = (analysis?.skin_type ?? (USE_SCAN_MOCK ? 'combination' : null))?.toLowerCase();
    const productSkinTypes = (product.compatible_skin_types ?? []).map((t) => t.toLowerCase());
    const skinTypeMatches = userSkinType
      ? productSkinTypes.length === 0 || productSkinTypes.includes(userSkinType) || productSkinTypes.includes('all')
      : true;

    // Check 3: Check if product contains any compatible ingredients
    const compatibleIngredientIds = new Set(
      (compatibility.compatible_ingredients ?? []).map((item) => item.id)
    );
    const hasCompatibleIngredient = (product.ingredients ?? []).some((i) =>
      compatibleIngredientIds.has(i.id)
    );

    if (skinTypeMatches || hasCompatibleIngredient) {
      return 'compatible';
    }

    return 'review';
  }, [
    productQuery.isLoading,
    productQuery.isError,
    productQuery.data,
    latestAnalysisQuery.isLoading,
    latestAnalysisQuery.isError,
    latestAnalysisQuery.data,
    compatibilityQuery.isLoading,
    compatibilityQuery.isError,
    compatibilityQuery.data,
  ]);

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
    canRetryCompatibility: Boolean(latestAnalysisQuery.isError || latestAnalysisQuery.data),
    actions: {
      retry,
      retryCompatibility,
    },
  };
}
