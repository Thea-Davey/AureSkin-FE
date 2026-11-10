import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { Droplet, Star, X } from 'lucide-react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { theme } from '../theme';
import { DeleteDialog } from './DeleteDialog';
import {
  ProductCompatibilityStatus,
  ProductDetail,
} from '../../features/library/model/library_types';
import { getProductCategoryImage, formatCategory } from '../utils/productCategory';
import { DescriptionCard } from '../../features/library/view/components/DescriptionCard';
import { ProductDetailSkeleton } from '../../features/library/view/components/ProductDetailSkeleton';
import { useProductDetail } from '../../features/library/viewmodel/useProductDetail';
import { useAuthStore } from '../store/authStore';
import { IngredientDetailPage } from './IngredientDetailPage';
import { CompatibilityBadge } from './CompatibilityBadge';
import { CloseButton } from './CloseButton';

export interface ProductDetailPageProps {
  visible: boolean;
  onClose: () => void;
  // Option A: Standalone mode (just provide productId)
  productId?: string | null;

  // Option B: Controlled mode (provide product & state)
  product?: ProductDetail;
  isLoading?: boolean;
  error?: string | null;
  compatibilityStatus?: ProductCompatibilityStatus;
  compatibilityError?: string | null;
  isCompatibilityLoading?: boolean;
  canRetryCompatibility?: boolean;
  isFavorite?: boolean;
  isFavoriteLoading?: boolean;
  isFavoriteError?: boolean;
  isTogglingFavorite?: boolean;
  favoriteLoadError?: string | null;
  favoriteError?: string | null;
  onDismiss?: () => void;
  onRetry?: () => void;
  onRetryCompatibility?: () => void;
  onRetryFavorites?: () => void;
  onToggleFavorite?: () => void;
  onIngredientPress?: (ingredientId: string) => void;
  onDeleteProduct?: (productId: string) => void;
}

interface InternalProductDetailViewProps {
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
  onDismiss?: () => void;
  onRetry: () => void;
  onRetryCompatibility: () => void;
  onRetryFavorites: () => void;
  onToggleFavorite: () => void;
  onIngredientPress: (ingredientId: string) => void;
  onDeleteProduct?: (productId: string) => void;
}

function ProductDetailView({
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
  onDeleteProduct,
}: InternalProductDetailViewProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const canShowDetail = !isLoading && !error && product;

  const handleClose = () => {
    setIsDeleteDialogOpen(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
      onDismiss={onDismiss}
    >
      <View className="flex-1 bg-card relative">
        {/* Floating Top-Right Close Button with Translucent Circle Container */}
        <SafeAreaView edges={['top']} className="absolute top-2 right-4 z-30 bg-primary rounded-full mt-4">
          <CloseButton
            onPress={handleClose}
            iconSize={22}
            accessibilityLabel="Close product details"
          />
        </SafeAreaView>

        {isLoading ? (
          <ProductDetailSkeleton />
        ) : error && !product ? (
          <View className="flex-1 items-center justify-center px-6">
            <Text className="text-center text-body font-sans-semibold text-text">
              Couldn’t load product
            </Text>
            <Text className="mt-2 text-center text-body-sm font-sans text-muted">
              {error}
            </Text>
            <View className="mt-5 flex-row gap-3">
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
              contentContainerClassName="pb-8"
              showsVerticalScrollIndicator={false}
            >
              {/* Packaging Hero Illustration */}
              <View className="relative h-72 items-center justify-center bg-background p-6">
                <Image
                  source={getProductCategoryImage(product.category)}
                  contentFit="contain"
                  transition={220}
                  style={{ width: '100%', height: '100%' }}
                  accessibilityLabel={`${product.name} ${formatCategory(product.category)} illustration`}
                />
                <View className="absolute bottom-4 right-5">
                  <CompatibilityBadge
                    status={compatibilityStatus}
                    isLoading={isCompatibilityLoading}
                    showScanNeeded
                  />
                </View>
              </View>

              {/* Product Header Information: 4-Row Format */}
              <View className="border-b border-border px-5 py-4">
                {/* Row 1: [Col 1: "Product" label] [Col 2: Favorite Star] */}
                <View className="flex-row items-center justify-between gap-3">
                  <Text className="text-body-sm font-sans-medium text-muted">
                    Product
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

                {/* Row 2: Actual name of the product */}
                <Text className="mt-1 text-h2 font-sans-bold text-text">
                  {product.name}
                </Text>

                {/* Row 3: Brand name */}
                <Text className="mt-1 text-body-sm font-sans text-muted">
                  {product.brand ?? 'Community product'}
                </Text>

                {/* Row 4: Category badge + Actual type if 'other' */}
                <View className="mt-3 flex-row items-center gap-2.5">
                  <View className="self-start rounded-badge bg-secondary px-4 py-1.5 shadow-xs">
                    <Text className="text-body-sm font-sans-semibold text-neutral-white">
                      {formatCategory(product.category)}
                    </Text>
                  </View>
                  {product.category?.toLowerCase() === 'other' && product.type ? (
                    <Text className="text-body-sm font-sans text-muted">
                      {product.type.replace(/_/g, ' ')}
                    </Text>
                  ) : null}
                </View>
              </View>

              {/* Alerts & Retries */}
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

              {/* Card 1: Ingredients using DescriptionCard */}
              <DescriptionCard title="Ingredients" className="mx-5 mt-4">
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
              </DescriptionCard>

              {/* Card 2: Compatible Skin Types */}
              {product.compatible_skin_types && product.compatible_skin_types.length > 0 ? (
                <DescriptionCard
                  title="Compatible Skin Types"
                  variant="bulleted"
                  bullets={product.compatible_skin_types}
                  bulletTone="positive"
                  className="mx-5 mt-3"
                />
              ) : null}

              {/* Card 3: Target Skin Conditions */}
              {((product.target_skin_conditions && product.target_skin_conditions.length > 0) || (product.good_for && product.good_for.length > 0)) ? (
                <DescriptionCard
                  title="Target Skin Conditions"
                  variant="bulleted"
                  bullets={product.target_skin_conditions && product.target_skin_conditions.length > 0 ? product.target_skin_conditions : product.good_for}
                  bulletTone="negative"
                  className="mx-5 mt-3"
                />
              ) : null}

              {/* Delete Product Button (User-added custom products only) */}
              {product.is_user_added ? (
                <View className="mx-5 mt-6 mb-2">
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Delete Product"
                    onPress={() => setIsDeleteDialogOpen(true)}
                    className="items-center justify-center rounded-button border border-error bg-card py-3.5 active:bg-error/10"
                  >
                    <Text className="text-body-sm font-sans-semibold text-error">
                      Delete Product
                    </Text>
                  </Pressable>
                </View>
              ) : null}
            </ScrollView>

            {/* Delete Confirmation Dialog */}
            {product.is_user_added ? (
              <DeleteDialog
                visible={isDeleteDialogOpen}
                title="Delete Product"
                body="This action will permanently delete your custom added product to your library"
                cancelLabel="Keep"
                confirmLabel="Delete"
                onCancel={() => setIsDeleteDialogOpen(false)}
                onConfirm={() => {
                  setIsDeleteDialogOpen(false);
                  onDeleteProduct?.(product.id);
                }}
              />
            ) : null}
          </SafeAreaView>
        ) : null}
      </View>
    </Modal>
  );
}

function ProductDetailSelfFetching({
  productId,
  visible,
  onClose,
  onIngredientPress,
  onDeleteProduct,
}: {
  productId: string;
  visible: boolean;
  onClose: () => void;
  onIngredientPress?: (ingredientId: string) => void;
  onDeleteProduct?: (productId: string) => void;
}) {
  const detail = useProductDetail(productId);
  const [selectedIngredientId, setSelectedIngredientId] = useState<string | null>(null);

  // Favorites handling synchronized with user favorites
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const storageKey = useMemo(() => `@aureskin/product-favorites/${userId ?? 'anonymous'}`, [userId]);
  const favoritesQueryKey = useMemo(
    () => ['library', 'product-favorites', userId ?? 'anonymous'] as const,
    [userId]
  );

  const favoritesQuery = useQuery({
    queryKey: favoritesQueryKey,
    queryFn: async () => {
      const saved = await AsyncStorage.getItem(storageKey);
      if (!saved) return [];
      try {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? (parsed as string[]) : [];
      } catch {
        return [];
      }
    },
  });

  const favoriteIds = favoritesQuery.data ?? [];
  const isFavorite = favoriteIds.includes(productId);

  const favoriteMutation = useMutation<void, Error, void, { prev: string[] }>({
    mutationFn: async () => {
      const current = queryClient.getQueryData<string[]>(favoritesQueryKey) ?? [];
      await AsyncStorage.setItem(storageKey, JSON.stringify(current));
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: favoritesQueryKey });
      const prev = queryClient.getQueryData<string[]>(favoritesQueryKey) ?? [];
      const next = prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId];
      queryClient.setQueryData(favoritesQueryKey, next);
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) {
        queryClient.setQueryData(favoritesQueryKey, ctx.prev);
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: favoritesQueryKey });
      await queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  const handleToggleFavorite = useCallback(() => {
    if (favoritesQuery.isLoading || favoriteMutation.isPending) return;
    favoriteMutation.mutate();
  }, [favoritesQuery.isLoading, favoriteMutation]);

  const handleIngredientPress = useCallback((ingId: string) => {
    if (onIngredientPress) {
      onIngredientPress(ingId);
    } else {
      setSelectedIngredientId(ingId);
    }
  }, [onIngredientPress]);

  return (
    <>
      <ProductDetailView
        visible={visible}
        product={detail.product}
        isLoading={detail.isLoading}
        error={detail.error}
        compatibilityStatus={detail.compatibilityStatus}
        compatibilityError={detail.compatibilityError}
        isCompatibilityLoading={detail.isCompatibilityLoading}
        canRetryCompatibility={detail.canRetryCompatibility}
        isFavorite={isFavorite}
        isFavoriteLoading={favoritesQuery.isLoading}
        isFavoriteError={favoritesQuery.isError}
        isTogglingFavorite={favoriteMutation.isPending}
        favoriteLoadError={favoritesQuery.error instanceof Error ? favoritesQuery.error.message : null}
        favoriteError={null}
        onClose={onClose}
        onRetry={() => void detail.actions.retry()}
        onRetryCompatibility={() => void detail.actions.retryCompatibility()}
        onRetryFavorites={() => void favoritesQuery.refetch()}
        onToggleFavorite={handleToggleFavorite}
        onIngredientPress={handleIngredientPress}
        onDeleteProduct={onDeleteProduct}
      />

      {/* Internal Ingredient Detail Page fallback if no external onIngredientPress was provided */}
      {selectedIngredientId ? (
        <IngredientDetailPage
          visible={Boolean(selectedIngredientId)}
          ingredientId={selectedIngredientId}
          onClose={() => setSelectedIngredientId(null)}
        />
      ) : null}
    </>
  );
}

export function ProductDetailPage(props: ProductDetailPageProps) {
  if (props.product !== undefined || !props.productId) {
    return (
      <ProductDetailView
        visible={props.visible}
        product={props.product}
        isLoading={props.isLoading ?? false}
        error={props.error ?? null}
        compatibilityStatus={props.compatibilityStatus ?? 'unavailable'}
        compatibilityError={props.compatibilityError ?? null}
        isCompatibilityLoading={props.isCompatibilityLoading ?? false}
        canRetryCompatibility={props.canRetryCompatibility ?? false}
        isFavorite={props.isFavorite ?? false}
        isFavoriteLoading={props.isFavoriteLoading ?? false}
        isFavoriteError={props.isFavoriteError ?? false}
        isTogglingFavorite={props.isTogglingFavorite ?? false}
        favoriteLoadError={props.favoriteLoadError ?? null}
        favoriteError={props.favoriteError ?? null}
        onClose={props.onClose}
        onDismiss={props.onDismiss}
        onRetry={props.onRetry ?? (() => { })}
        onRetryCompatibility={props.onRetryCompatibility ?? (() => { })}
        onRetryFavorites={props.onRetryFavorites ?? (() => { })}
        onToggleFavorite={props.onToggleFavorite ?? (() => { })}
        onIngredientPress={props.onIngredientPress ?? (() => { })}
        onDeleteProduct={props.onDeleteProduct}
      />
    );
  }

  return (
    <ProductDetailSelfFetching
      productId={props.productId}
      visible={props.visible}
      onClose={props.onClose}
      onIngredientPress={props.onIngredientPress}
      onDeleteProduct={props.onDeleteProduct}
    />
  );
}

