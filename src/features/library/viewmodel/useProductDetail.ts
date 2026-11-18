import { useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../../shared/store/authStore';
import { fetchHistoryPage } from '../../history/model/history_api';
import { fetchCompatibility, USE_MOCK as USE_SCAN_MOCK } from '../../scan/model/scan_api';
import { MOCK_COMPATIBILITY } from '../../scan/model/scan_mock';
import { fetchUserClinicalFilters } from '../../profile/model/profile_api';
import {
  ClinicalFilterWarning,
  ProductCompatibilityStatus,
  ProductDetail,
} from '../model/library_types';
import { fetchProductById } from '../model/library_api';

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function rawIngredientsContains(rawIngs: string, ingredientName: string): boolean {
  const target = ingredientName.toLowerCase().trim();
  if (!rawIngs || !target) return false;
  if (target.length <= 3) {
    return new RegExp(`(^|[,;/()\\s])${escapeRegex(target)}($|[,;/()\\s])`, 'i').test(rawIngs);
  }
  return rawIngs.includes(target);
}

interface UseProductDetailResult {
  product: ProductDetail | undefined;
  isLoading: boolean;
  error: string | null;
  compatibilityStatus: ProductCompatibilityStatus;
  clinicalFilterWarnings: ClinicalFilterWarning[];
  compatibilityError: string | null;
  isCompatibilityLoading: boolean;
  canRetryCompatibility: boolean;
  actions: {
    retry: () => Promise<void>;
    retryCompatibility: () => Promise<void>;
  };
}

export function useProductDetail(productId: string): UseProductDetailResult {
  const userId = useAuthStore((state) => state.user?.id ?? null);

  const productQuery = useQuery({
    queryKey: ['library', 'product', productId],
    queryFn: () => fetchProductById(productId),
    enabled: productId.trim().length > 0,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  const latestAnalysisQuery = useQuery({
    queryKey: ['library', 'product-detail', 'latest-analysis', userId ?? 'anonymous'],
    queryFn: async () => {
      const page = await fetchHistoryPage({ limit: 1, offset: 0 });
      return page.items[0] ?? null;
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  const latestAnalysisId = latestAnalysisQuery.data?.id;
  const compatibilityQuery = useQuery({
    queryKey: ['library', 'product-compatibility', userId ?? 'anonymous', latestAnalysisId],
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

  const clinicalFiltersQuery = useQuery({
    queryKey: ['profile', 'clinical-filters', userId ?? 'anonymous'],
    queryFn: fetchUserClinicalFilters,
    enabled: Boolean(userId),
    staleTime: 1000 * 60 * 15,
  });

  const clinicalFilterWarnings = useMemo<ClinicalFilterWarning[]>(() => {
    const product = productQuery.data;
    if (!product) return [];

    const combined = [
      ...(clinicalFiltersQuery.data ?? []),
      ...(compatibilityQuery.data?.filtered_ingredients ?? []),
    ];
    if (combined.length === 0) return [];

    const productIngIds = new Set(
      (product.ingredients ?? []).map((i) => String(i.id || '').trim()).filter(Boolean)
    );
    const productIngNames = (product.ingredients ?? [])
      .map((i) => i.name.toLowerCase().trim())
      .filter(Boolean);
    const rawIngs = (product.raw_ingredients ?? '').toLowerCase();

    const warnings: ClinicalFilterWarning[] = [];
    const seen = new Set<string>();

    for (const item of combined) {
      const fid = String(item.ingredient_id || ('id' in item && item.id ? item.id : '')).trim();
      const fname = String(item.name || '').trim();
      const fnameLower = fname.toLowerCase();
      if (!fname && !fid) continue;

      const matchesById = Boolean(fid && productIngIds.has(fid));
      const matchesByIngredientList = Boolean(
        fnameLower &&
        productIngNames.some((n) => n === fnameLower || (fnameLower.length > 3 && n.includes(fnameLower)))
      );
      const matchesByRaw = Boolean(fnameLower && rawIngredientsContains(rawIngs, fnameLower));

      if (matchesById || matchesByIngredientList || matchesByRaw) {
        const dedupeKey = `${fnameLower || fid}|${String(item.filter_type || '').toLowerCase()}`;
        if (seen.has(dedupeKey)) continue;
        seen.add(dedupeKey);
        warnings.push({
          ingredientId: fid,
          ingredientName: fname || 'Ingredient',
          filterType: item.filter_type || 'allergen',
          reason: item.reason || 'Flagged by your profile clinical filters.',
          details: item.details,
        });
      }
    }

    return warnings;
  }, [
    productQuery.data,
    clinicalFiltersQuery.data,
    compatibilityQuery.data?.filtered_ingredients,
  ]);

  const compatibilityStatus = useMemo<ProductCompatibilityStatus>(() => {
    if (productQuery.isLoading || latestAnalysisQuery.isLoading || compatibilityQuery.isLoading) {
      return 'unavailable';
    }
    if (productQuery.isError) {
      return 'unavailable';
    }

    // Clinical filters (allergen, pregnancy, age) always take precedence over scan compatibility
    if (clinicalFilterWarnings.length > 0) {
      return 'review';
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
      (compatibility.compatible_ingredients ?? []).map((item) => item.id || item.ingredient_id)
    );
    const hasCompatibleIngredient = (product.ingredients ?? []).some((i) =>
      compatibleIngredientIds.has(i.id)
    );

    if (skinTypeMatches || hasCompatibleIngredient) {
      return 'compatible';
    }

    return 'review';
  }, [
    clinicalFilterWarnings.length,
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
    clinicalFilterWarnings,
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
