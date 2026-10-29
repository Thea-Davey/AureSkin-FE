import AsyncStorage from '@react-native-async-storage/async-storage';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '../../../shared/store/authStore';
import { fetchProducts } from '../model/library_api';
import {
  Product,
  ProductCategory,
  ProductFilterTarget,
  ProductListFilter,
  ProductListItemModel,
} from '../model/library_types';

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
    queryFn: ({ pageParam }) => fetchProducts({
      q: debouncedQuery,
      category: selectedCategory,
      limit: PAGE_SIZE,
      offset: pageParam,
    }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset ?? undefined,
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
  });

  const favoriteIds = savedFavoriteIds ?? EMPTY_FAVORITES;
  const favoriteIdSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);
  const loadedProducts = useMemo(
    () => productPages?.pages.flatMap((page) => page.items) ?? [],
    [productPages]
  );
  const products = useMemo(() => {
    const listItems: ProductListItemModel[] = loadedProducts.map((product: Product) => ({
      product,
      isFavorite: favoriteIdSet.has(product.id),
    }));

    return selectedListFilter === 'favorites'
      ? listItems.filter((item) => item.isFavorite)
      : listItems;
  }, [favoriteIdSet, loadedProducts, selectedListFilter]);

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
