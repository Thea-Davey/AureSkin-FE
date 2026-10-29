import { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { Droplet, Package, Star, X } from 'lucide-react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../../../shared/theme';
import {
  ProductCompatibilityStatus,
  ProductDetail,
} from '../../model/library_types';
import { ProductDetailSkeleton } from './ProductDetailSkeleton';

interface ProductDetailPageProps {
  visible: boolean;
  product: ProductDetail | undefined;
  isLoading: boolean;
  error: string | null;
  compatibilityStatus: ProductCompatibilityStatus;
  compatibilityError: string | null;
  isCompatibilityLoading: boolean;
  canRetryCompatibility: boolean;
  isFavorite: boolean;
  isFavoriteLoading: boolean;
  isFavoriteError: boolean;
  isTogglingFavorite: boolean;
  favoriteLoadError: string | null;
  favoriteError: string | null;
  onClose: () => void;
  onDismiss: () => void;
  onRetry: () => void;
  onRetryCompatibility: () => void;
  onRetryFavorites: () => void;
  onToggleFavorite: () => void;
  onIngredientPress: (ingredientId: string) => void;
}

function formatCategory(category: string): string {
  return category
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function CompatibilityBadge({
  status,
  isLoading,
}: {
  status: ProductCompatibilityStatus;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <View className="flex-row items-center gap-2 rounded-badge bg-background px-3 py-2">
        <ActivityIndicator size="small" color={theme.colors.muted} />
        <Text className="text-caption font-sans-medium text-muted">Checking</Text>
      </View>
    );
  }

  if (status === 'compatible') {
    return (
      <View
        accessibilityRole="text"
        accessibilityLabel="Compatible"
        className="rounded-badge bg-status-success px-3 py-2"
      >
        <Text className="text-caption font-sans-semibold text-neutral-white">
          ✓ Compatible
        </Text>
      </View>
    );
  }

  const label = status === 'scan_needed'
    ? 'Scan needed'
    : status === 'review'
      ? 'Not verified'
      : 'Not verified';

  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={label}
      className="rounded-badge bg-background px-3 py-2"
    >
      <Text className="text-caption font-sans-medium text-muted">{label}</Text>
    </View>
  );
}

export function ProductDetailPage({
  visible,
  product,
  isLoading,
  error,
  compatibilityStatus,
  compatibilityError,
  isCompatibilityLoading,
  canRetryCompatibility,
  isFavorite,
  isFavoriteLoading,
  isFavoriteError,
  isTogglingFavorite,
  favoriteLoadError,
  favoriteError,
  onClose,
  onDismiss,
  onRetry,
  onRetryCompatibility,
  onRetryFavorites,
  onToggleFavorite,
  onIngredientPress,
}: ProductDetailPageProps) {
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
  const canShowDetail = Boolean(product) && !isLoading;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      onDismiss={onDismiss}
      statusBarTranslucent
    >
      <View className="flex-1 bg-card">
        <SafeAreaView edges={['top']} className="absolute right-0 top-0 z-10">
          <View className="items-end px-4 pt-2">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close product details"
              onPress={onClose}
              hitSlop={10}
              className="rounded-full bg-card/90 p-2 active:opacity-70"
            >
              <X size={24} color={theme.colors.text} />
            </Pressable>
          </View>
        </SafeAreaView>

        {isLoading ? (
          <ScrollView
            className="flex-1"
            contentContainerClassName="pb-5"
            showsVerticalScrollIndicator={false}
          >
            <ProductDetailSkeleton />
          </ScrollView>
        ) : error || !product ? (
          <View className="flex-1 items-center justify-center px-6">
            <Text className="mb-2 text-h3 font-sans-bold text-text">
              Unable to load product
            </Text>
            <Text className="mb-5 text-center text-body-sm font-sans text-muted">
              {error ?? 'This product could not be found.'}
            </Text>
            <View className="flex-row gap-3">
              <Pressable
                accessibilityRole="button"
                onPress={onClose}
                className="rounded-button border border-border px-5 py-3 active:opacity-80"
              >
                <Text className="text-label font-sans-semibold text-text">Go Back</Text>
              </Pressable>
              {error ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={onRetry}
                  className="rounded-button bg-primary px-5 py-3 active:opacity-80"
                >
                  <Text className="text-label font-sans-semibold text-neutral-white">
                    Retry
                  </Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        ) : canShowDetail ? (
          <SafeAreaView edges={['bottom']} className="flex-1">
            <ScrollView
              className="flex-1"
              contentContainerClassName="pb-5"
              showsVerticalScrollIndicator={false}
            >
              <View className="relative h-80 items-center justify-center bg-background">
                {product.image_url && failedImageUrl !== product.image_url ? (
                  <Image
                    source={{ uri: product.image_url }}
                    contentFit="contain"
                    transition={220}
                    onError={() => setFailedImageUrl(product.image_url)}
                    style={{ width: '100%', height: '100%' }}
                    accessibilityLabel={`${product.name} packaging`}
                  />
                ) : (
                  <View className="h-24 w-24 items-center justify-center rounded-full bg-secondary/20">
                    <Package size={44} color={theme.colors.secondary} />
                  </View>
                )}
                <View className="absolute bottom-4 right-5">
                  <CompatibilityBadge
                    status={compatibilityStatus}
                    isLoading={isCompatibilityLoading}
                  />
                </View>
              </View>

              <View className="border-b border-border px-5 py-4">
                <View className="flex-row items-start gap-3">
                  <Text className="min-w-0 flex-1 text-h2 font-sans-semibold text-text">
                    {product.name}
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`${isFavorite ? 'Remove' : 'Add'} ${product.name} ${isFavorite ? 'from' : 'to'} favorites`}
                    accessibilityState={{
                      selected: isFavorite,
                      disabled: isFavoriteLoading || isFavoriteError || isTogglingFavorite,
                    }}
                    disabled={isFavoriteLoading || isFavoriteError || isTogglingFavorite}
                    onPress={onToggleFavorite}
                    hitSlop={8}
                    className="p-1 active:opacity-70"
                  >
                    <Animated.View key={String(isFavorite)} entering={ZoomIn.duration(160)}>
                      <Star
                        size={22}
                        color={isFavorite ? theme.colors.secondary : theme.colors.text}
                        fill={isFavorite ? theme.colors.secondary : 'transparent'}
                      />
                    </Animated.View>
                  </Pressable>
                </View>
                <Text className="mt-1 text-body-sm font-sans text-text">
                  {product.brand ?? 'Community product'}
                </Text>
                <View className="mt-3 self-start rounded-badge bg-secondary px-3 py-1">
                  <Text className="text-caption font-sans-medium text-neutral-white">
                    {formatCategory(product.category)}
                  </Text>
                </View>
              </View>

              {compatibilityError ? (
                <View className="mx-5 mt-3 flex-row items-center justify-between gap-3 rounded-button bg-background p-3">
                  <Text className="min-w-0 flex-1 text-body-sm font-sans text-muted">
                    {compatibilityError}
                  </Text>
                  {canRetryCompatibility ? (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Retry product compatibility"
                      onPress={onRetryCompatibility}
                      className="rounded-button px-2 py-1 active:opacity-70"
                    >
                      <Text className="text-label font-sans-semibold text-primary">Retry</Text>
                    </Pressable>
                  ) : null}
                </View>
              ) : null}

              {favoriteError ? (
                <View
                  accessibilityRole="alert"
                  className="mx-5 mt-3 rounded-button border border-status-error/30 bg-status-error/10 p-3"
                >
                  <Text className="text-body-sm font-sans-medium text-status-error">
                    {favoriteError}
                  </Text>
                </View>
              ) : null}
              {favoriteLoadError ? (
                <View className="mx-5 mt-3 flex-row items-center gap-3 rounded-button border border-status-error/30 bg-status-error/10 p-3">
                  <Text className="min-w-0 flex-1 text-body-sm font-sans-medium text-status-error">
                    {favoriteLoadError}
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Retry loading product favorites"
                    onPress={onRetryFavorites}
                    className="rounded-button px-2 py-1 active:opacity-70"
                  >
                    <Text className="text-label font-sans-semibold text-primary">Retry</Text>
                  </Pressable>
                </View>
              ) : null}

              <View className="mx-5 mt-4 rounded-card border border-border bg-card p-4 shadow-sm">
                <Text className="mb-3 text-h3 font-sans-bold text-text">Ingredients</Text>
                {product.ingredients.length === 0 ? (
                  <Text className="text-body-sm font-sans text-muted">
                    Ingredient list unavailable.
                  </Text>
                ) : (
                  product.ingredients.map((ingredient) => (
                    <Pressable
                      key={`${ingredient.id}-${ingredient.order}`}
                      accessibilityRole="button"
                      accessibilityLabel={`View ingredient details for ${ingredient.name}`}
                      onPress={() => onIngredientPress(ingredient.id)}
                      className="flex-row items-center gap-3 rounded-button py-1.5 active:bg-background"
                    >
                      <Droplet size={13} color={theme.colors.secondary} fill={theme.colors.secondary} />
                      <Text className="flex-1 text-body-sm font-sans text-text">
                        {ingredient.name}
                      </Text>
                    </Pressable>
                  ))
                )}
              </View>
              {product.good_for && product.good_for.length > 0 ? (
                <View className="mx-5 mt-3 rounded-card border border-border bg-card p-4 shadow-sm">
                  <Text className="mb-2 text-h3 font-sans-bold text-text">Good For</Text>
                  {product.good_for.map((benefit, index) => (
                    <View
                      key={`${benefit}-${index}`}
                      className="flex-row items-center gap-3 rounded-button py-1"
                    >
                      <View className="h-2 w-2 rounded-full bg-status-success" />
                      <Text className="flex-1 text-body-sm font-sans text-text">
                        {benefit}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </ScrollView>
          </SafeAreaView>
        ) : null}
      </View>
    </Modal>
  );
}
