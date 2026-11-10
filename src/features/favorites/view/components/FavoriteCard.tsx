import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Star } from 'lucide-react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { Card } from '@/shared/components/Card';
import { CompatibilityBadge } from '@/shared/components/CompatibilityBadge';
import { theme } from '@/shared/theme';
import { getProductCategoryImage, formatCategory } from '@/shared/utils/productCategory';
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
 * Features an integrated top header banner flush with the top of the card
 * (matching Reference Image 1) for either PRODUCT or INGREDIENT.
 * - Style 1 / "ingredient": Mint/green top banner with INGREDIENT label + Ingredient details
 * - Style 2 / "product": Warm peach/tan top banner with PRODUCT label + Product details
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
      <Card style={2} className="mx-5 mb-3 overflow-hidden p-0 items-stretch">
        {/* Style 1 Integrated Header: INGREDIENT */}
        <View className="w-full flex-row items-center justify-between px-4 py-2.5 bg-note-positive border-b border-note-positive-border rounded-t-card">
          <View className="flex-row items-center gap-2">
            <View className="w-2 h-2 rounded-full bg-note-positive-element" />
            <Text className="text-caption font-sans-bold text-note-positive-title uppercase tracking-wider">
              INGREDIENT
            </Text>
          </View>
          {item.ingredient.skin_types?.[0] ? (
            <Text className="text-caption font-sans-medium text-muted">
              {item.ingredient.skin_types[0]}
            </Text>
          ) : null}
        </View>

        {/* Card Body */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`View details for ${item.ingredient.name}`}
          accessibilityHint="Opens ingredient details"
          onPress={() => onPress(item.ingredient.id)}
          className="w-full p-4 active:opacity-85"
        >
          {/* Row 1: [Ingredient Name] [CompatibilityBadge + Star] */}
          <View className="w-full flex-row items-start justify-between gap-3">
            <Text className="min-w-0 flex-1 text-body font-sans-bold text-text">
              {item.ingredient.name}
            </Text>

            <View className="flex-row items-center gap-2 shrink-0 self-start pt-0.5">
              {item.isCompatible ? (
                <CompatibilityBadge status="compatible" compact />
              ) : null}

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Remove ${item.ingredient.name} from favorites`}
                accessibilityState={{ selected: true }}
                onPress={() => onFavoritePress(item.ingredient.id)}
                hitSlop={8}
                className="active:opacity-70"
              >
                <Animated.View entering={ZoomIn.duration(160)}>
                  <Star
                    size={20}
                    color={theme.colors.secondary}
                    fill={theme.colors.secondary}
                  />
                </Animated.View>
              </Pressable>
            </View>
          </View>

          {/* Row 2: Description */}
          <Text
            numberOfLines={3}
            className="w-full mt-2 text-body-sm font-sans text-muted leading-5"
          >
            {item.ingredient.preview_description ??
              item.ingredient.description ??
              'Learn more about this ingredient in the detail view.'}
          </Text>
        </Pressable>
      </Card>
    );
  }

  if (item.type === 'product') {
    const product = item.product ?? item.productItem?.product;
    const productId = product?.id ?? item.id;

    if (!product) {
      return null;
    }

    return (
      <Card style={2} className="mx-5 mb-3 overflow-hidden p-0 items-stretch">
        {/* Style 2 Integrated Header: PRODUCT */}
        <View className="w-full flex-row items-center justify-between px-4 py-2.5 bg-secondary/25 border-b border-border/40 rounded-t-card">
          <View className="flex-row items-center gap-2">
            <View className="w-2 h-2 rounded-full bg-secondary-dark" />
            <Text className="text-caption font-sans-bold text-secondary-dark uppercase tracking-wider">
              PRODUCT
            </Text>
          </View>
          {product.brand ? (
            <Text className="text-caption font-sans-medium text-muted">
              {product.brand}
            </Text>
          ) : null}
        </View>

        {/* Card Body */}
        <View className="w-full flex-row items-center p-3">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${product.name}${product.brand ? ` by ${product.brand}` : ''}, ${formatCategory(product.category)}`}
            accessibilityHint="Opens product details and its ingredient list"
            onPress={() => onPress(productId)}
            className="min-w-0 flex-1 flex-row items-center active:opacity-80"
          >
            <View className="h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-button bg-secondary/15 p-2">
              <Image
                source={getProductCategoryImage(product.category)}
                contentFit="contain"
                transition={180}
                style={{ width: '100%', height: '100%' }}
                accessibilityLabel={`${product.name} ${formatCategory(product.category)}`}
              />
            </View>

            <View className="min-w-0 flex-1 self-stretch px-4 py-1">
              <Text numberOfLines={2} className="text-body-sm font-sans-medium text-text">
                {product.name}
              </Text>
              <Text numberOfLines={1} className="mt-1 text-caption font-sans text-muted">
                {product.brand ?? 'Community product'}
              </Text>
              <View className="mt-2 self-start rounded-badge bg-secondary px-3 py-1">
                <Text className="text-caption font-sans-medium text-neutral-white">
                  {formatCategory(product.category)}
                </Text>
              </View>
            </View>
          </Pressable>

          <View className="flex-row items-center gap-2 self-start">
            {item.isCompatible ? (
              <CompatibilityBadge status="compatible" compact />
            ) : null}

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Remove ${product.name} from favorites`}
              accessibilityState={{ selected: true }}
              onPress={() => onFavoritePress(productId)}
              hitSlop={8}
              className="p-1 active:opacity-70"
            >
              <Animated.View entering={ZoomIn.duration(160)}>
                <Star
                  size={20}
                  color={theme.colors.secondary}
                  fill={theme.colors.secondary}
                />
              </Animated.View>
            </Pressable>
          </View>
        </View>
      </Card>
    );
  }

  return null;
}

export default FavoriteCard;
