import { useState, useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FavoriteFilter, FavoriteItem, FavoriteCounts } from '../model/favorites_types';
import { fetchFavorites, removeFavoriteItem } from '../model/favorites_api';

export function useFavorites() {
  const queryClient = useQueryClient();
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
    queryKey: ['favorites'],
    queryFn: fetchFavorites,
    staleTime: 1000 * 60 * 5,
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
      // Optimistically update query client state
      queryClient.setQueryData<FavoriteItem[]>(['favorites'], (old = []) =>
        old.filter((item) => {
          if (item.type === 'ingredient') {
            return item.ingredient.id !== id && item.id !== id;
          }
          const prodId = item.product?.id ?? item.productItem?.product.id;
          return prodId !== id && item.id !== id;
        })
      );
      await removeFavoriteItem(id);
    },
    [queryClient]
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
