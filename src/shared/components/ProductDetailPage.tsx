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
import { AlertCircle, AlertTriangle, Droplet, Star, X } from 'lucide-react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { theme } from '../theme';
import { DeleteDialog } from './DeleteDialog';
import {
  ClinicalFilterWarning,
  ProductCompatibilityStatus,
  ProductDetail,
} from '../../features/library/model/library_types';
import { getProductCategoryImage, formatCategory } from '../utils/productCategory';
import { DescriptionCard } from '../../features/library/view/components/DescriptionCard';
import { ProductDetailSkeleton } from '../../features/library/view/components/ProductDetailSkeleton';
import { CompatibleNote } from '../../features/library/view/components/CompatibleNote';
import { WarningNote } from './WarningNote';
import { NegativeNote } from './NegativeNote';
import { useProductDetail } from '../../features/library/viewmodel/useProductDetail';
import { useAuthStore } from '../store/authStore';
import { IngredientDetailPage } from './IngredientDetailPage';
import { CompatibilityBadge } from './CompatibilityBadge';
import { CloseButton } from './CloseButton';
import { Button } from './Button';

function formatSkinTypeLabel(raw: string): string {
  const cleaned = raw.replace(/[\[\]'"]/g, '').trim();
  if (!cleaned) return '';
  const lower = cleaned.toLowerCase().replace(/[\s_-]+/g, '');
  if (lower === 'acneprone') return 'Acne-prone';
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
}

function formatConditionLabel(raw: string): string {
  const cleaned = raw.replace(/[\[\]'"]/g, '').trim();
  if (!cleaned) return '';
  const lower = cleaned.toLowerCase();
  if (lower === 'pores') return 'Enlarged Pores';
  return cleaned
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

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
  clinicalFilterWarnings?: ClinicalFilterWarning[];
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
  clinicalFilterWarnings: ClinicalFilterWarning[];
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
  clinicalFilterWarnings,
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
              <Button
                variant="outline"
                size="md"
                title="Go Back"
                onPress={onClose}
                textClassName="text-label"
              />
              {error ? (
                <Button
                  variant="primary"
                  size="md"
                  title="Retry"
                  onPress={onRetry}
                  textClassName="text-label"
                />
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
                    <Button
                      variant="ghost"
                      size="sm"
                      title="Retry"
                      accessibilityLabel="Retry product compatibility"
                      onPress={onRetryCompatibility}
                      className="px-2 py-1"
                      textClassName="text-label font-sans-semibold text-primary"
                    />
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
                  <Button
                    variant="ghost"
                    size="sm"
                    title="Retry"
                    accessibilityLabel="Retry loading product favorites"
                    onPress={onRetryFavorites}
                    className="px-2 py-1"
                    textClassName="text-label font-sans-semibold text-primary"
                  />
                </View>
              ) : null}

              {/* Intro Description from Supabase (no card, matching IngredientDetailPage) */}
              {product.description?.trim() ? (
                <Text className="mx-5 mt-4 text-body-sm font-sans text-muted leading-relaxed">
                  {product.description.trim()}
                </Text>
              ) : null}

              {/* Card 1: Ingredients using DescriptionCard */}
              <DescriptionCard title="Ingredients" className="mx-5 mt-4">
                {product.ingredients.length === 0 ? (
                  <Text className="text-body-sm font-sans text-muted">
                    Ingredient list unavailable.
                  </Text>
                ) : (
                  product.ingredients.map((ingredient) => {
                    const matchedWarning = clinicalFilterWarnings.find(
                      (w) =>
                        (w.ingredientId && w.ingredientId === ingredient.id) ||
                        w.ingredientName.toLowerCase().trim() === ingredient.name.toLowerCase().trim()
                    );
                    const isHighRisk =
                      matchedWarning &&
                      ['allergen', 'pregnancy'].includes((matchedWarning.filterType || '').toLowerCase());
                    return (
                      <Pressable
                        key={`${ingredient.id}-${ingredient.order}`}
                        accessibilityRole="button"
                        accessibilityLabel={`View ingredient details for ${ingredient.name}`}
                        onPress={() => onIngredientPress(ingredient.id)}
                        className="flex-row items-center gap-3 rounded-button py-1.5 active:bg-background"
                      >
                        {matchedWarning ? (
                          isHighRisk ? (
                            <AlertCircle size={14} color={theme.colors.note.negative.icon} />
                          ) : (
                            <AlertTriangle size={14} color={theme.colors.note.warning.icon} />
                          )
                        ) : (
                          <Droplet size={13} color={theme.colors.secondary} fill={theme.colors.secondary} />
                        )}
                        <Text
                          className={`flex-1 text-body-sm ${
                            matchedWarning
                              ? isHighRisk
                                ? 'font-sans-semibold text-note-negative-title'
                                : 'font-sans-semibold text-note-warning-title'
                              : 'font-sans text-text'
                          }`}
                        >
                          {ingredient.name}
                        </Text>
                      </Pressable>
                    );
                  })
                )}
              </DescriptionCard>

              {/* Card 2: Compatible Skin Types */}
              {(() => {
                const rawTypes =
                  product.compatible_skin_types && product.compatible_skin_types.length > 0
                    ? product.compatible_skin_types
                    : Array.isArray(product.skin_types)
                      ? product.skin_types
                      : [];
                const formattedTypes = rawTypes.map(formatSkinTypeLabel).filter(Boolean);
                if (formattedTypes.length === 0) return null;
                return (
                  <DescriptionCard
                    title="Compatible Skin Types"
                    variant="bulleted"
                    bullets={formattedTypes}
                    bulletTone="positive"
                    className="mx-5 mt-3"
                  />
                );
              })()}

              {/* Card 3: Target Skin Conditions */}
              {(() => {
                const rawConditions =
                  product.target_skin_conditions && product.target_skin_conditions.length > 0
                    ? product.target_skin_conditions
                    : Array.isArray(product.skin_conditions) && product.skin_conditions.length > 0
                      ? product.skin_conditions
                      : product.good_for && product.good_for.length > 0
                        ? product.good_for
                        : [];
                const formattedConditions = rawConditions.map(formatConditionLabel).filter(Boolean);
                if (formattedConditions.length === 0) return null;
                return (
                  <DescriptionCard
                    title="Target Skin Conditions"
                    variant="bulleted"
                    bullets={formattedConditions}
                    bulletTone="negative"
                    className="mx-5 mt-3"
                  />
                );
              })()}

              {/* Card 4: Who should avoid? (Hidden automatically when it has no content) */}
              {(() => {
                const rawAvoid =
                  product.avoid && product.avoid.length > 0
                    ? product.avoid
                    : typeof product.who_should_avoid === 'string' && product.who_should_avoid.trim().length > 0
                      ? product.who_should_avoid
                          .split(',')
                          .map((s) => s.replace(/[\[\]'"]/g, '').trim())
                          .filter((s) => {
                            const lower = s.toLowerCase();
                            return Boolean(s) && lower !== 'none' && lower !== 'n/a' && lower !== 'null';
                          })
                      : [];
                const rawCaution = (product.caution ?? '').trim();
                const cautionStripped = rawCaution.replace(/[\[\]'",\s]/g, '');
                const isRawArrayLiteral = rawCaution.startsWith('[') && rawCaution.endsWith(']');
                const cautionText =
                  cautionStripped &&
                  !isRawArrayLiteral &&
                  !['none', 'n/a', 'null'].includes(rawCaution.toLowerCase())
                    ? rawCaution
                    : '';
                if (rawAvoid.length === 0 && !cautionText) {
                  return null;
                }
                return (
                  <DescriptionCard
                    title="Who should avoid?"
                    variant="description"
                    className="mx-5 mt-3"
                  >
                    {rawAvoid.map((item, idx) => (
                      <View key={`${item}-${idx}`} className="mb-2 flex-row items-center gap-2.5">
                        <View className="h-2 w-2 rounded-full bg-status-error shrink-0" />
                        <Text className="flex-1 text-body-sm font-sans text-text">
                          {item}
                        </Text>
                      </View>
                    ))}
                    {cautionText ? (
                      <Text className="text-body-sm font-sans text-text leading-5">
                        {cautionText}
                      </Text>
                    ) : null}
                  </DescriptionCard>
                );
              })()}

              {/* Clinical Profile Filter Warnings (Allergen / Pregnancy / Age) */}
              {clinicalFilterWarnings.map((warning, idx) => {
                const type = (warning.filterType || '').toLowerCase();
                const isNegative = type === 'allergen' || type === 'pregnancy';
                const warningTitle =
                  type === 'allergen'
                    ? 'Flagged for Allergen'
                    : type === 'pregnancy'
                      ? 'Flagged for Pregnancy'
                      : 'Flagged for Age';
                const description = `${warning.ingredientName}: ${warning.reason}`;

                return isNegative ? (
                  <NegativeNote
                    key={`${warning.ingredientName}-${warning.filterType}-${idx}`}
                    style={2}
                    title={warningTitle}
                    description={description}
                    className="mx-5 mt-3"
                  />
                ) : (
                  <WarningNote
                    key={`${warning.ingredientName}-${warning.filterType}-${idx}`}
                    style={2}
                    title={warningTitle}
                    description={description}
                    className="mx-5 mt-3"
                  />
                );
              })}

              {/* Compatible Note */}
              {compatibilityStatus === 'compatible' && clinicalFilterWarnings.length === 0 ? (
                <CompatibleNote className="mx-5 mt-3" />
              ) : null}

              {/* Delete Product Button (Custom user-added products only) */}
              {product.is_user_added === true && Boolean(onDeleteProduct) ? (
                <View className="mx-5 mt-6 mb-2">
                  <Button
                    variant="outline-danger"
                    size="lg"
                    fullWidth
                    title="Delete Product"
                    accessibilityLabel="Delete Product"
                    onPress={() => setIsDeleteDialogOpen(true)}
                    className="py-3.5"
                    textClassName="text-body-sm font-sans-semibold text-error"
                  />
                </View>
              ) : null}
            </ScrollView>

            {/* Delete Confirmation Dialog */}
            {product.is_user_added === true && Boolean(onDeleteProduct) ? (
              <DeleteDialog
                visible={isDeleteDialogOpen}
                title="Delete Product"
                body="This action will permanently delete your custom added product from your library."
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
        clinicalFilterWarnings={detail.clinicalFilterWarnings}
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
        clinicalFilterWarnings={props.clinicalFilterWarnings ?? []}
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

