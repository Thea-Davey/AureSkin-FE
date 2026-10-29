import { useInfiniteQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { fetchIngredients } from '../model/library_api';
import { Ingredient } from '../model/library_types';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

interface UseIngredientsResult {
  ingredients: Ingredient[];
  searchQuery: string;
  isLoading: boolean;
  isRefreshing: boolean;
  isFetchingNextPage: boolean;
  isFetchNextPageError: boolean;
  hasNextPage: boolean;
  error: string | null;
  actions: {
    setSearchQuery: (query: string) => void;
    refresh: () => Promise<void>;
    retry: () => Promise<void>;
    loadNextPage: () => void;
  };
}

export function useIngredients(): UseIngredientsResult {
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
    queryFn: ({ pageParam }) => fetchIngredients({
      q: debouncedQuery,
      limit: PAGE_SIZE,
      offset: pageParam,
    }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset ?? undefined,
    placeholderData: (previousData) => previousData,
  });

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

  return {
    ingredients: query.data?.pages.flatMap((page) => page.items) ?? [],
    searchQuery,
    isLoading: query.isLoading,
    isRefreshing,
    isFetchingNextPage: query.isFetchingNextPage,
    isFetchNextPageError: query.isFetchNextPageError,
    hasNextPage: Boolean(query.hasNextPage),
    error: query.error instanceof Error ? query.error.message : null,
    actions: {
      setSearchQuery,
      refresh,
      retry,
      loadNextPage,
    },
  };
}
