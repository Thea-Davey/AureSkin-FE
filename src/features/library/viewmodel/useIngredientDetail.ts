import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { useAuthStore } from '../../../shared/store/authStore';
import { fetchCompatibility } from '../../scan/model/scan_api';
import { fetchHistoryPage } from '../../history/model/history_api';
import {
  Ingredient,
  IngredientCompatibilityStatus,
} from '../model/library_types';
import { fetchIngredientById } from '../model/library_api';

const EMPTY_FAVORITES: string[] = [];

interface UseIngredientDetailResult {
  ingredient: Ingredient | undefined;
  isLoading: boolean;
  error: string | null;
  compatibilityStatus: IngredientCompatibilityStatus;
  compatibilityError: string | null;
  isCompatibilityLoading: boolean;
  isFavorite: boolean;
  isFavoriteLoading: boolean;
  isTogglingFavorite: boolean;
  favoriteError: string | null;
  actions: {
    retry: () => Promise<void>;
    retryCompatibility: () => Promise<void>;
    toggleFavorite: () => void;
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

export function useIngredientDetail(ingredientId: string): UseIngredientDetailResult {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const storageKey = useMemo(() => getFavoritesStorageKey(userId), [userId]);
  const favoritesQueryKey = useMemo(
    () => ['library', 'ingredient-favorites', userId ?? 'anonymous'] as const,
    [userId]
  );
  const [favoriteError, setFavoriteError] = useState<string | null>(null);

  const ingredientQuery = useQuery({
    queryKey: ['library', 'ingredient', ingredientId],
    queryFn: () => fetchIngredientById(ingredientId),
    enabled: ingredientId.length > 0,
  });

  const latestAnalysisQuery = useQuery({
    queryKey: ['library', 'ingredient-detail', 'latest-analysis'],
    queryFn: async () => {
      const page = await fetchHistoryPage({ limit: 1, offset: 0 });
      return page.items[0] ?? null;
    },
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
      if (compatibility.analysis_id !== analysisId) {
        throw new Error('The compatibility service returned results for a different skin analysis.');
      }
      return compatibility;
    },
    enabled: Boolean(latestAnalysisQuery.data?.id),
  });

  const favoritesQuery = useQuery({
    queryKey: favoritesQueryKey,
    queryFn: () => loadFavorites(storageKey),
  });

  const favoriteMutation = useMutation<
    void,
    Error,
    void,
    { previousFavoriteIds: string[] }
  >({
    mutationFn: async () => {
      const currentFavoriteIds =
        queryClient.getQueryData<string[]>(favoritesQueryKey) ?? EMPTY_FAVORITES;
      await AsyncStorage.setItem(storageKey, JSON.stringify(currentFavoriteIds));
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: favoritesQueryKey });
      const previousFavoriteIds =
        queryClient.getQueryData<string[]>(favoritesQueryKey) ?? EMPTY_FAVORITES;
      queryClient.setQueryData(
        favoritesQueryKey,
        toggleFavoriteId(previousFavoriteIds, ingredientId)
      );
      setFavoriteError(null);
      return { previousFavoriteIds };
    },
    onError: (error, _variables, context) => {
      if (context) {
        queryClient.setQueryData(favoritesQueryKey, context.previousFavoriteIds);
      }
      setFavoriteError(error.message || 'Unable to save this favorite. Please try again.');
    },
    onSuccess: () => setFavoriteError(null),
  });

  const savedFavoriteIds = favoritesQuery.data ?? EMPTY_FAVORITES;
  const isFavorite = savedFavoriteIds.includes(ingredientId);
  const compatibilityStatus: IngredientCompatibilityStatus =
    latestAnalysisQuery.isLoading
      ? 'unavailable'
      : latestAnalysisQuery.isError
      ? 'unavailable'
      : !latestAnalysisQuery.data
        ? 'scan_needed'
        : compatibilityQuery.isLoading || compatibilityQuery.isError
          ? 'unavailable'
          : compatibilityQuery.data?.compatible_ingredients.some(
              (item) => item.id === ingredientId
            )
            ? 'compatible'
            : 'not_listed';

  const retry = useCallback(async () => {
    await ingredientQuery.refetch();
  }, [ingredientQuery]);

  const retryCompatibility = useCallback(async () => {
    if (latestAnalysisQuery.isError) {
      await latestAnalysisQuery.refetch();
      return;
    }
    if (latestAnalysisQuery.data) {
      await compatibilityQuery.refetch();
    }
  }, [compatibilityQuery, latestAnalysisQuery]);

  const toggleFavorite = useCallback(() => {
    if (
      favoritesQuery.isLoading
      || favoritesQuery.isError
      || favoriteMutation.isPending
    ) {
      return;
    }
    favoriteMutation.mutate();
  }, [favoriteMutation, favoritesQuery.isError, favoritesQuery.isLoading]);

  return {
    ingredient: ingredientQuery.data,
    isLoading: ingredientQuery.isLoading,
    error: ingredientQuery.error instanceof Error
      ? ingredientQuery.error.message
      : null,
    compatibilityStatus,
    compatibilityError: latestAnalysisQuery.error instanceof Error
      ? latestAnalysisQuery.error.message
      : compatibilityQuery.error instanceof Error
        ? compatibilityQuery.error.message
        : null,
    isCompatibilityLoading: latestAnalysisQuery.isLoading
      || (Boolean(latestAnalysisQuery.data) && compatibilityQuery.isLoading),
    isFavorite,
    isFavoriteLoading: favoritesQuery.isLoading || favoritesQuery.isError,
    isTogglingFavorite: favoriteMutation.isPending,
    favoriteError: favoriteError ?? (
      favoritesQuery.error instanceof Error ? favoritesQuery.error.message : null
    ),
    actions: {
      retry,
      retryCompatibility,
      toggleFavorite,
    },
  };
}
