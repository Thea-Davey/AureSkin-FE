import AsyncStorage from '@react-native-async-storage/async-storage';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '../../../shared/store/authStore';
import { getCachedIngredients } from '../../../shared/storage/catalogStorage';
import { fetchIngredients } from '../model/library_api';
import { Ingredient, IngredientSection } from '../model/library_types';
import { fetchCompatibility, USE_MOCK as USE_SCAN_MOCK } from '../../scan/model/scan_api';
import { MOCK_COMPATIBILITY } from '../../scan/model/scan_mock';
import { fetchHistoryPage } from '../../history/model/history_api';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;
const EMPTY_FAVORITES: string[] = [];

export interface UseIngredientsResult {
  ingredients: Ingredient[];
  sections: IngredientSection[];
  favoriteIds: string[];
  compatibleIngredientIds: string[];
  searchQuery: string;
  isLoading: boolean;
  isRefreshing: boolean;
  isFetchingNextPage: boolean;
  isFetchNextPageError: boolean;
  hasNextPage: boolean;
  error: string | null;
  actions: {
    setSearchQuery: (query: string) => void;
    toggleFavorite: (ingredientId: string) => void;
    refresh: () => Promise<void>;
    retry: () => Promise<void>;
    loadNextPage: () => void;
  };
}

function getFavoritesStorageKey(userId: string | null): string {
  return `@aureskin/ingredient-favorites/${userId ?? 'anonymous'}`;
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
    throw new Error('Saved ingredient favorites could not be read. Clear the app storage and try again.');
  }

  if (!Array.isArray(parsed) || !parsed.every((id) => typeof id === 'string')) {
    throw new Error('Saved ingredient favorites are invalid. Clear the app storage and try again.');
  }

  return parsed;
}

function toggleFavoriteId(favoriteIds: string[], ingredientId: string): string[] {
  return favoriteIds.includes(ingredientId)
    ? favoriteIds.filter((id) => id !== ingredientId)
    : [...favoriteIds, ingredientId];
}

export function useIngredients(): UseIngredientsResult {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const storageKey = useMemo(() => getFavoritesStorageKey(userId), [userId]);
  const favoritesQueryKey = useMemo(
    () => ['library', 'ingredient-favorites', userId ?? 'anonymous'] as const,
    [userId]
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const query = useInfiniteQuery({
    queryKey: ['library', 'ingredients', debouncedQuery],
    queryFn: async ({ pageParam }) => {
      try {
        return await fetchIngredients({
          q: debouncedQuery,
          limit: PAGE_SIZE,
          offset: pageParam,
        });
      } catch (err) {
        // Offline / Network error fallback: load from persistent local disk cache
        const cached = await getCachedIngredients();
        if (cached && cached.length > 0) {
          const filtered = debouncedQuery
            ? cached.filter((item) =>
                item.name.toLowerCase().includes(debouncedQuery.toLowerCase())
              )
            : cached;
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
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours (instant cache access across tabs)
  });

  const favoritesQuery = useQuery({
    queryKey: favoritesQueryKey,
    queryFn: () => loadFavorites(storageKey),
    staleTime: 1000 * 60 * 5,
  });

  const favoriteIds = favoritesQuery.data ?? EMPTY_FAVORITES;

  const latestAnalysisQuery = useQuery({
    queryKey: ['library', 'ingredient-detail', 'latest-analysis'],
    queryFn: async () => {
      const page = await fetchHistoryPage({ limit: 1, offset: 0 });
      return page.items[0] ?? null;
    },
    staleTime: 1000 * 60 * 15,
  });

  const compatibilityQuery = useQuery({
    queryKey: [
      'library',
      'ingredient-compatibility',
      latestAnalysisQuery.data?.id,
    ],
    queryFn: async () => {
      const analysisId = latestAnalysisQuery.data?.id;
      if (!analysisId) {
        throw new Error('A skin analysis is required to check compatibility.');
      }

      const compatibility = await fetchCompatibility(analysisId);
      if (!USE_SCAN_MOCK && compatibility.analysis_id !== analysisId) {
        throw new Error('The compatibility service returned results for a different skin analysis.');
      }
      return compatibility;
    },
    enabled: Boolean(latestAnalysisQuery.data?.id),
    staleTime: 1000 * 60 * 30,
  });

  const compatibleIngredientIds = useMemo<string[]>(() => {
    if (compatibilityQuery.data?.compatible_ingredients?.length) {
      return compatibilityQuery.data.compatible_ingredients.map((item) => item.id);
    }
    if (USE_SCAN_MOCK) {
      return MOCK_COMPATIBILITY.compatible_ingredients.map((item) => item.id);
    }
    return [];
  }, [compatibilityQuery.data]);

  const favoriteMutation = useMutation<
    void,
    Error,
    string,
    { previousFavoriteIds: string[] }
  >({
    mutationFn: async () => {
      const currentFavoriteIds =
        queryClient.getQueryData<string[]>(favoritesQueryKey) ?? EMPTY_FAVORITES;
      await AsyncStorage.setItem(storageKey, JSON.stringify(currentFavoriteIds));
    },
    onMutate: async (ingredientId: string) => {
      await queryClient.cancelQueries({ queryKey: favoritesQueryKey });
      const previousFavoriteIds =
        queryClient.getQueryData<string[]>(favoritesQueryKey) ?? EMPTY_FAVORITES;
      const nextFavoriteIds = toggleFavoriteId(previousFavoriteIds, ingredientId);
      queryClient.setQueryData(favoritesQueryKey, nextFavoriteIds);
      return { previousFavoriteIds };
    },
    onError: (_error, _ingredientId, context) => {
      if (context?.previousFavoriteIds) {
        queryClient.setQueryData(favoritesQueryKey, context.previousFavoriteIds);
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: favoritesQueryKey });
    },
  });

  const toggleFavorite = useCallback(
    (ingredientId: string) => {
      if (favoritesQuery.isLoading || favoritesQuery.isError || favoriteMutation.isPending) {
        return;
      }
      favoriteMutation.mutate(ingredientId);
    },
    [favoriteMutation, favoritesQuery.isError, favoritesQuery.isLoading]
  );

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await query.refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [query]);

  const retry = useCallback(async () => {
    if (query.isFetchNextPageError && query.hasNextPage) {
      await query.fetchNextPage();
      return;
    }
    await query.refetch();
  }, [query]);

  const loadNextPage = useCallback(() => {
    if (query.hasNextPage && !query.isFetchingNextPage) {
      void query.fetchNextPage();
    }
  }, [query]);

  const ingredients = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data]
  );

  const sections = useMemo<IngredientSection[]>(() => {
    if (!ingredients.length) return [];
    const map = new Map<string, Ingredient[]>();

    for (const item of ingredients) {
      const firstChar = item.name.trim()[0]?.toUpperCase() ?? '#';
      const letter = /^[A-Z]$/.test(firstChar) ? firstChar : '#';
      if (!map.has(letter)) {
        map.set(letter, []);
      }
      map.get(letter)!.push(item);
    }

    return Array.from(map.entries())
      .sort(([a], [b]) => (a === '#' ? 1 : b === '#' ? -1 : a.localeCompare(b)))
      .map(([title, data]) => ({
        title,
        data: [...data].sort((a, b) => a.name.localeCompare(b.name)),
      }));
  }, [ingredients]);

  return {
    ingredients,
    sections,
    favoriteIds,
    compatibleIngredientIds,
    searchQuery,
    isLoading: query.isLoading,
    isRefreshing,
    isFetchingNextPage: query.isFetchingNextPage,
    isFetchNextPageError: query.isFetchNextPageError,
    hasNextPage: Boolean(query.hasNextPage),
    error: query.error instanceof Error ? query.error.message : null,
    actions: {
      setSearchQuery,
      toggleFavorite,
      refresh,
      retry,
      loadNextPage,
    },
  };
}
