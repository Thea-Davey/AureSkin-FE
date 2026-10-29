import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Star } from 'lucide-react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { theme } from '../../../../shared/theme';
import { ProductListItemModel } from '../../model/library_types';

interface ProductListItemProps {
  item: ProductListItemModel;
  isFavoriteDisabled: boolean;
  onPress: (productId: string) => void;
  onFavoritePress: (productId: string) => void;
}

function formatCategory(category: string): string {
  return category
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function ProductListItem({
  item,
  isFavoriteDisabled,
  onPress,
  onFavoritePress,
}: ProductListItemProps) {
  const [hasImageError, setHasImageError] = useState(false);
  const product = item.product;

  return (
    <View className="mb-3 min-h-28 flex-row items-center rounded-card border border-border bg-card p-3 shadow-sm">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${product.name}${product.brand ? ` by ${product.brand}` : ''}, ${formatCategory(product.category)}`}
        accessibilityHint="Opens product details and its ingredient list"
        onPress={() => onPress(product.id)}
        className="min-w-0 flex-1 flex-row items-center active:opacity-80"
      >
        <View className="h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-button bg-secondary/20">
          {product.image_url && !hasImageError ? (
            <Image
              source={{ uri: product.image_url }}
              contentFit="contain"
              transition={180}
              onError={() => setHasImageError(true)}
              style={{ width: '100%', height: '100%' }}
              accessibilityLabel={`${product.name} product image`}
            />
          ) : null}
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

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${item.isFavorite ? 'Remove' : 'Add'} ${product.name} ${item.isFavorite ? 'from' : 'to'} favorites`}
        accessibilityState={{ selected: item.isFavorite, disabled: isFavoriteDisabled }}
        disabled={isFavoriteDisabled}
        onPress={() => onFavoritePress(product.id)}
        hitSlop={8}
        className="self-start p-1 active:opacity-70"
      >
        <Animated.View key={String(item.isFavorite)} entering={ZoomIn.duration(160)}>
          <Star
            size={20}
            color={item.isFavorite ? theme.colors.secondary : theme.colors.text}
            fill={item.isFavorite ? theme.colors.secondary : 'transparent'}
          />
        </Animated.View>
      </Pressable>
    </View>
  );
}
