import AsyncStorage from '@react-native-async-storage/async-storage';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '../../../shared/store/authStore';
import { getCachedProducts } from '../../../shared/storage/catalogStorage';
import { toCanonicalCategory } from '../../../shared/utils/productCategory';
import { fetchProducts } from '../model/library_api';
import { fetchHistoryPage } from '../../history/model/history_api';
import { fetchCompatibility, USE_MOCK as USE_SCAN_MOCK } from '../../scan/model/scan_api';
import { MOCK_COMPATIBILITY } from '../../scan/model/scan_mock';
import {
  Product,
  ProductCategory,
  ProductFilterTarget,
  ProductListFilter,
  ProductListItemModel,
} from '../model/library_types';

const MOCK_COMPATIBLE_PRODUCT_IDS = new Set([
  'product-glycolic-toning-solution',
  'product-niacinamide-serum',
  'product-foaming-cleanser',
  'product-centella-serum',
  'product-hydrating-serum',
  'product-mineral-sunscreen',
  'product-daily-moisturizer',
]);

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;
const EMPTY_FAVORITES: string[] = [];

interface UseProductsResult {
  products: ProductListItemModel[];
  favoriteIds: string[];
  searchQuery: string;
  isSearchExpanded: boolean;
  selectedCategory: ProductCategory | null;
  selectedListFilter: ProductListFilter;
  filterTarget: ProductFilterTarget;
  isFilterSheetVisible: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  isFetchingNextPage: boolean;
  isFetchNextPageError: boolean;
  isFavoritesLoading: boolean;
  isFavoritesError: boolean;
  favoriteLoadError: string | null;
  isTogglingFavorite: boolean;
  hasNextPage: boolean;
  error: string | null;
  favoriteError: string | null;
  actions: {
    setSearchQuery: (query: string) => void;
    toggleSearch: () => void;
    openFilters: (target: ProductFilterTarget) => void;
    closeFilters: () => void;
    applyFilters: (category: ProductCategory | null, listFilter: ProductListFilter) => void;
    resetFilters: () => void;
    toggleFavorite: (productId: string) => void;
    refresh: () => Promise<void>;
    retry: () => Promise<void>;
    retryFavorites: () => Promise<void>;
    loadNextPage: () => void;
  };
}

function getFavoritesStorageKey(userId: string | null): string {
  return `@aureskin/product-favorites/${userId ?? 'anonymous'}`;
}

async function loadFavorites(storageKey: string): Promise<string[]> {
  const savedFavorites = await AsyncStorage.getItem(storageKey);
  if (!savedFavorites) {
    return [];
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(savedFavorites);
  } catch {
    throw new Error('Saved product favorites could not be read. Clear the app storage and try again.');
  }

  if (!Array.isArray(parsed) || !parsed.every((id) => typeof id === 'string')) {
    throw new Error('Saved product favorites are invalid. Clear the app storage and try again.');
  }

  return parsed;
}

function toggleFavoriteId(favoriteIds: string[], productId: string): string[] {
  return favoriteIds.includes(productId)
    ? favoriteIds.filter((id) => id !== productId)
    : [...favoriteIds, productId];
}

export function useProducts(): UseProductsResult {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const favoritesStorageKey = useMemo(() => getFavoritesStorageKey(userId), [userId]);
  const favoritesQueryKey = useMemo(
    () => ['library', 'product-favorites', userId ?? 'anonymous'] as const,
    [userId]
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);
  const [selectedListFilter, setSelectedListFilter] = useState<ProductListFilter>('all');
  const [filterTarget, setFilterTarget] = useState<ProductFilterTarget>('category');
  const [isFilterSheetVisible, setIsFilterSheetVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [favoriteError, setFavoriteError] = useState<string | null>(null);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const favoritesQuery = useQuery({
    queryKey: favoritesQueryKey,
    queryFn: () => loadFavorites(favoritesStorageKey),
    staleTime: 1000 * 60 * 5,
  });
  const {
    data: savedFavoriteIds,
    error: favoritesError,
    isError: isFavoritesError,
    isLoading: isFavoritesLoading,
    isSuccess: areFavoritesLoaded,
    refetch: refetchFavorites,
  } = favoritesQuery;

  const productsQuery = useInfiniteQuery({
    queryKey: ['library', 'products', debouncedQuery, selectedCategory],
    queryFn: async ({ pageParam }) => {
      try {
        return await fetchProducts({
          q: debouncedQuery,
          category: selectedCategory,
          limit: PAGE_SIZE,
          offset: pageParam,
        });
      } catch (err) {
        // Offline / Network fallback: read from local disk cache
        const cached = await getCachedProducts();
        if (cached && cached.length > 0) {
          const filtered = cached.filter((item) => {
            const matchesQuery =
              debouncedQuery.length === 0 ||
              item.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
              (item.brand ? item.brand.toLowerCase().includes(debouncedQuery.toLowerCase()) : false);
            const matchesCategory =
              selectedCategory === null || toCanonicalCategory(item.category) === selectedCategory;
            return matchesQuery && matchesCategory;
          });
          const items = filtered.slice(pageParam, pageParam + PAGE_SIZE);
          return {
            items,
            nextOffset: pageParam + items.length < filtered.length ? pageParam + items.length : null,
          };
        }
        throw err;
      }
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset ?? undefined,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours (instant cache access across tabs)
  });
  const {
    data: productPages,
    error: productError,
    fetchNextPage,
    hasNextPage,
    isFetchNextPageError,
    isFetchingNextPage,
    isLoading: isProductsLoading,
    refetch: refetchProducts,
  } = productsQuery;

  const favoriteMutation = useMutation<
    void,
    Error,
    string,
    { previousFavoriteIds: string[] }
  >({
    mutationFn: async () => {
      const currentFavorites = queryClient.getQueryData<string[]>(favoritesQueryKey) ?? [];
      await AsyncStorage.setItem(favoritesStorageKey, JSON.stringify(currentFavorites));
    },
    onMutate: async (productId) => {
      await queryClient.cancelQueries({ queryKey: favoritesQueryKey });
      const previousFavoriteIds = queryClient.getQueryData<string[]>(favoritesQueryKey) ?? [];
      queryClient.setQueryData(
        favoritesQueryKey,
        toggleFavoriteId(previousFavoriteIds, productId)
      );
      setFavoriteError(null);
      return { previousFavoriteIds };
    },
    onError: (error, _productId, context) => {
      if (context) {
        queryClient.setQueryData(favoritesQueryKey, context.previousFavoriteIds);
      }
      setFavoriteError(error.message || 'Unable to save this favorite. Please try again.');
    },
    onSuccess: () => setFavoriteError(null),
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: favoritesQueryKey });
      await queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  const latestAnalysisQuery = useQuery({
    queryKey: ['library', 'product-list', 'latest-analysis'],
    queryFn: async () => {
      const page = await fetchHistoryPage({ limit: 1, offset: 0 });
      return page.items[0] ?? null;
    },
    staleTime: 1000 * 60 * 15,
  });

  const latestAnalysisId = latestAnalysisQuery.data?.id;
  const compatibilityQuery = useQuery({
    queryKey: ['library', 'product-list-compatibility', latestAnalysisId],
    queryFn: async () => {
      if (!latestAnalysisId) return null;
      return fetchCompatibility(latestAnalysisId);
    },
    enabled: Boolean(latestAnalysisId),
    staleTime: 1000 * 60 * 30,
  });

  const favoriteIds = savedFavoriteIds ?? EMPTY_FAVORITES;
  const favoriteIdSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);
  const loadedProducts = useMemo(
    () => productPages?.pages.flatMap((page) => page.items) ?? [],
    [productPages]
  );
  const products = useMemo(() => {
    const compatibility = compatibilityQuery.data ?? (USE_SCAN_MOCK ? MOCK_COMPATIBILITY : undefined);
    const analysis = latestAnalysisQuery.data;
    const userSkinType = (analysis?.skin_type ?? (USE_SCAN_MOCK ? 'combination' : null))?.toLowerCase();

    const compatibleNames = new Set(
      (compatibility?.compatible_ingredients ?? [])
        .map((ci) => ci.name.toLowerCase().trim())
        .filter(Boolean)
    );
    const incompatiblePairs = compatibility?.incompatible_pairs ?? [];

    const isProductCompatible = (product: Product): boolean => {
      if (USE_SCAN_MOCK && MOCK_COMPATIBLE_PRODUCT_IDS.has(product.id)) {
        return true;
      }
      if (!analysis && !USE_SCAN_MOCK) {
        return false;
      }

      const rawIngs = (product.raw_ingredients || '').toLowerCase();

      // Check for incompatible conflicts
      if (rawIngs && incompatiblePairs.length > 0) {
        const hasConflict = incompatiblePairs.some((pair) => {
          const a = (pair.ingredient_a || '').toLowerCase().trim();
          const b = (pair.ingredient_b || '').toLowerCase().trim();
          return a && b && rawIngs.includes(a) && rawIngs.includes(b);
        });
        if (hasConflict) {
          return false;
        }
      }

      // Check skin type match
      const productTypes = Array.isArray(product.skin_types)
        ? product.skin_types.map((t) => t.toLowerCase().trim())
        : [];
      const skinTypeMatches = userSkinType
        ? productTypes.length === 0 || productTypes.includes(userSkinType) || productTypes.includes('all')
        : false;

      // Check if product contains any known compatible active ingredients
      let hasCompatibleIngredient = false;
      if (rawIngs && compatibleNames.size > 0) {
        for (const name of compatibleNames) {
          if (name && rawIngs.includes(name)) {
            hasCompatibleIngredient = true;
            break;
          }
        }
      }

      return skinTypeMatches || hasCompatibleIngredient;
    };

    const listItems: ProductListItemModel[] = loadedProducts.map((product: Product) => ({
      product,
      isFavorite: favoriteIdSet.has(product.id),
      isCompatible: isProductCompatible(product),
    }));

    return selectedListFilter === 'favorites'
      ? listItems.filter((item) => item.isFavorite)
      : listItems;
  }, [
    favoriteIdSet,
    loadedProducts,
    selectedListFilter,
    compatibilityQuery.data,
    latestAnalysisQuery.data,
  ]);

  useEffect(() => {
    if (
      selectedListFilter === 'favorites'
      && areFavoritesLoaded
      && productPages
      && products.length === 0
      && hasNextPage
      && !isFetchingNextPage
      && !isFetchNextPageError
    ) {
      void fetchNextPage();
    }
  }, [
    areFavoritesLoaded,
    products.length,
    productPages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
    selectedListFilter,
  ]);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetchProducts();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetchProducts]);

  const retry = useCallback(async () => {
    if (isFetchNextPageError && hasNextPage) {
      await fetchNextPage();
      return;
    }

    if (isFavoritesError) {
      await refetchFavorites();
      return;
    }

    await refetchProducts();
  }, [
    isFavoritesError,
    refetchFavorites,
    fetchNextPage,
    hasNextPage,
    isFetchNextPageError,
    refetchProducts,
  ]);

  const retryFavorites = useCallback(async () => {
    await refetchFavorites();
  }, [refetchFavorites]);

  const loadNextPage = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const toggleSearch = useCallback(() => {
    if (isSearchExpanded) {
      setSearchQuery('');
    }
    setIsSearchExpanded((expanded) => !expanded);
  }, [isSearchExpanded]);

  const toggleFavorite = useCallback((productId: string) => {
    if (isFavoritesLoading || isFavoritesError || favoriteMutation.isPending) {
      return;
    }
    favoriteMutation.mutate(productId);
  }, [favoriteMutation, isFavoritesError, isFavoritesLoading]);

  const error = productError instanceof Error
    ? productError.message
    : favoritesError instanceof Error
      ? favoritesError.message
      : null;

  return {
    products,
    favoriteIds,
    searchQuery,
    isSearchExpanded,
    selectedCategory,
    selectedListFilter,
    filterTarget,
    isFilterSheetVisible,
    isLoading: isProductsLoading || isFavoritesLoading,
    isRefreshing,
    isFetchingNextPage,
    isFetchNextPageError,
    isFavoritesLoading,
    isFavoritesError,
    favoriteLoadError: favoritesError instanceof Error ? favoritesError.message : null,
    isTogglingFavorite: favoriteMutation.isPending,
    hasNextPage: Boolean(hasNextPage),
    error,
    favoriteError,
    actions: {
      setSearchQuery,
      toggleSearch,
      openFilters: (target) => {
        setFilterTarget(target);
        setIsFilterSheetVisible(true);
      },
      closeFilters: () => setIsFilterSheetVisible(false),
      applyFilters: (category, listFilter) => {
        setSelectedCategory(category);
        setSelectedListFilter(listFilter);
        setIsFilterSheetVisible(false);
      },
      resetFilters: () => {
        setSelectedCategory(null);
        setSelectedListFilter('all');
        setIsFilterSheetVisible(false);
      },
      toggleFavorite,
      refresh,
      retry,
      retryFavorites,
      loadNextPage,
    },
  };
}
