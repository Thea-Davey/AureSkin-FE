import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Star } from 'lucide-react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { theme } from '../theme';
import { Card } from './Card';
import { CompatibilityBadge } from './CompatibilityBadge';
import { Product, ProductListItemModel } from '../../features/library/model/library_types';
import { getProductCategoryImage, formatCategory } from '../utils/productCategory';

export interface ProductCardProps {
  item?: ProductListItemModel;
  product?: Product;
  isFavorite?: boolean;
  isCompatible?: boolean;
  isFavoriteDisabled?: boolean;
  onPress: (productId: string) => void;
  onFavoritePress: (productId: string) => void;
  className?: string;
}

/**
 * ProductCard
 * Global shared card component for rendering a skincare product row with image thumbnail,
 * brand, category pill, compact compatibility badge, and favorite toggle action.
 */
export function ProductCard({
  item,
  product: productProp,
  isFavorite: isFavoriteProp,
  isCompatible: isCompatibleProp,
  isFavoriteDisabled = false,
  onPress,
  onFavoritePress,
  className = '',
}: ProductCardProps) {
  const product = item?.product ?? productProp;
  const isFavorite = item?.isFavorite ?? isFavoriteProp ?? false;
  const isCompatible = item?.isCompatible ?? isCompatibleProp ?? false;

  if (!product) {
    return null;
  }

  return (
    <Card style={2}
      className={`mb-3 min-h-28 flex-row items-center p-3${className}`}
    >
      <Pressable

        accessibilityRole="button"
        accessibilityLabel={`${product.name}${product.brand ? ` by ${product.brand}` : ''}, ${formatCategory(product.category)}`}
        accessibilityHint="Opens product details and its ingredient list"
        onPress={() => onPress(product.id)}
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
        {isCompatible ? (
          <CompatibilityBadge status="compatible" compact />
        ) : null}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${isFavorite ? 'Remove' : 'Add'} ${product.name} ${isFavorite ? 'from' : 'to'} favorites`}
          accessibilityState={{ selected: isFavorite, disabled: isFavoriteDisabled }}
          disabled={isFavoriteDisabled}
          onPress={() => onFavoritePress(product.id)}
          hitSlop={8}
          className="p-1 active:opacity-70"
        >
          <Animated.View key={String(isFavorite)} entering={ZoomIn.duration(160)}>
            <Star
              size={20}
              color={isFavorite ? theme.colors.secondary : theme.colors.text}
              fill={isFavorite ? theme.colors.secondary : 'transparent'}
            />
          </Animated.View>
        </Pressable>
      </View>
    </Card>
  );
}

export default ProductCard;

