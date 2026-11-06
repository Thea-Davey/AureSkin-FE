import React from 'react';
import { View, Text } from 'react-native';
import { IngredientCard } from '@/shared/components/IngredientCard';
import { ProductCard } from '@/shared/components/ProductCard';
import { FavoriteItem } from '../../model/favorites_types';

export interface FavoriteCardProps {
  item: FavoriteItem;
  styleVariant?: 1 | 2;
  onPress: (id: string) => void;
  onFavoritePress: (id: string) => void;
}

/**
 * FavoriteCard
 * Local component for FavoritesPage.
 * Wraps global shared IngredientCard and ProductCard, prepending an explicit
 * header label indicating "INGREDIENT" or "PRODUCT".
 * - Style 1 ("ingredient"): Header label INGREDIENT + IngredientCard
 * - Style 2 ("product"): Header label PRODUCT + ProductCard
 */
export function FavoriteCard({
  item,
  styleVariant,
  onPress,
  onFavoritePress,
}: FavoriteCardProps) {
  const isIngredient = (styleVariant === 1) || item.type === 'ingredient';

  if (isIngredient && item.type === 'ingredient') {
    return (
      <View className="mb-4">
        {/* Style 1 Header: INGREDIENT */}
        <View className="flex-row items-center justify-between mb-1.5 px-5">
          <View className="flex-row items-center gap-1.5">
            <View className="w-2 h-2 rounded-full bg-primary" />
            <Text className="text-caption font-sans-bold text-primary uppercase tracking-wider">
              INGREDIENT
            </Text>
          </View>
          {item.ingredient.skin_types?.[0] ? (
            <Text className="text-caption font-sans-medium text-muted">
              {item.ingredient.skin_types[0]}
            </Text>
          ) : null}
        </View>

        {/* Global Shared IngredientCard */}
        <IngredientCard
          ingredient={item.ingredient}
          isFavorite={true}
          isCompatible={item.isCompatible}
          onPress={() => onPress(item.ingredient.id)}
          onFavoritePress={() => onFavoritePress(item.ingredient.id)}
        />
      </View>
    );
  }

  if (item.type === 'product') {
    const product = item.product ?? item.productItem?.product;
    const productId = product?.id ?? item.id;

    return (
      <View className="mb-4">
        {/* Style 2 Header: PRODUCT */}
        <View className="flex-row items-center justify-between mb-1.5 px-5">
          <View className="flex-row items-center gap-1.5">
            <View className="w-2 h-2 rounded-full bg-secondary" />
            <Text className="text-caption font-sans-bold text-secondary uppercase tracking-wider">
              PRODUCT
            </Text>
          </View>
          {product?.brand ? (
            <Text className="text-caption font-sans-medium text-muted">
              {product.brand}
            </Text>
          ) : null}
        </View>

        {/* Global Shared ProductCard */}
        <View className="px-5">
          <ProductCard
            product={item.product}
            item={item.productItem}
            isFavorite={true}
            isCompatible={item.isCompatible}
            onPress={() => onPress(productId)}
            onFavoritePress={() => onFavoritePress(productId)}
          />
        </View>
      </View>
    );
  }

  return null;
}

export default FavoriteCard;
