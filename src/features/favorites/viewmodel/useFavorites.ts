import { useState, useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/shared/store/authStore';
import { FavoriteFilter, FavoriteItem, FavoriteCounts } from '../model/favorites_types';
import { fetchFavorites, removeFavoriteItem } from '../model/favorites_api';

export function useFavorites() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const userScope = userId ?? 'anonymous';

  const favoritesQueryKey = useMemo(() => ['favorites', userScope] as const, [userScope]);
  const ingredientFavoritesKey = useMemo(
    () => ['library', 'ingredient-favorites', userScope] as const,
    [userScope]
  );
  const productFavoritesKey = useMemo(
    () => ['library', 'product-favorites', userScope] as const,
    [userScope]
  );

  const [activeFilter, setActiveFilter] = useState<FavoriteFilter>('all');
  const [selectedIngredientId, setSelectedIngredientId] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const {
    data: items = [],
    isLoading,
    isRefetching,
    error,
    refetch,
  } = useQuery<FavoriteItem[]>({
    queryKey: favoritesQueryKey,
    queryFn: () => fetchFavorites(userId),
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const counts: FavoriteCounts = useMemo(() => {
    const productsCount = items.filter((i) => i.type === 'product').length;
    const ingredientsCount = items.filter((i) => i.type === 'ingredient').length;
    return {
      all: items.length,
      products: productsCount,
      ingredients: ingredientsCount,
    };
  }, [items]);

  const filteredItems = useMemo(() => {
    if (activeFilter === 'products') return items.filter((i) => i.type === 'product');
    if (activeFilter === 'ingredients') return items.filter((i) => i.type === 'ingredient');
    return items;
  }, [items, activeFilter]);

  const handleToggleFavorite = useCallback(
    async (id: string) => {
      // 1. Optimistically remove from Favorites list
      queryClient.setQueryData<FavoriteItem[]>(favoritesQueryKey, (old = []) =>
        old.filter((item) => {
          if (item.type === 'ingredient') {
            return item.ingredient.id !== id && item.id !== id;
          }
          const prodId = item.product?.id ?? item.productItem?.product.id;
          return prodId !== id && item.id !== id;
        })
      );

      // 2. Optimistically remove from BOTH Library favorite ID caches so Library updates immediately
      queryClient.setQueryData<string[]>(ingredientFavoritesKey, (old) =>
        Array.isArray(old) ? old.filter((favId) => favId !== id) : old
      );
      queryClient.setQueryData<string[]>(productFavoritesKey, (old) =>
        Array.isArray(old) ? old.filter((favId) => favId !== id) : old
      );

      // 3. Persist removal to AsyncStorage for the active account
      await removeFavoriteItem(id, userId);

      // 4. Invalidate all favorite queries across Favorites & Library
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['favorites'] }),
        queryClient.invalidateQueries({ queryKey: ['library', 'ingredient-favorites'] }),
        queryClient.invalidateQueries({ queryKey: ['library', 'product-favorites'] }),
      ]);
    },
    [queryClient, favoritesQueryKey, ingredientFavoritesKey, productFavoritesKey, userId]
  );

  const handleOpenItem = useCallback((item: FavoriteItem) => {
    if (item.type === 'ingredient') {
      setSelectedIngredientId(item.ingredient.id);
    } else if (item.type === 'product') {
      const prodId = item.product?.id ?? item.productItem?.product.id;
      if (prodId) setSelectedProductId(prodId);
    }
  }, []);

  return {
    items: filteredItems,
    counts,
    activeFilter,
    isLoading,
    isRefreshing: isRefetching,
    error: error ? 'Failed to load your favorites' : null,
    selectedIngredientId,
    selectedProductId,
    actions: {
      setFilter: setActiveFilter,
      toggleFavorite: handleToggleFavorite,
      openItem: handleOpenItem,
      closeIngredientDetail: () => setSelectedIngredientId(null),
      closeProductDetail: () => setSelectedProductId(null),
      refresh: async () => {
        await refetch();
      },
    },
  };
}

export default useFavorites;
