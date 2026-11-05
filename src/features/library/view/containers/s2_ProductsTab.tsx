import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import { Plus } from 'lucide-react-native';
import { theme } from '../../../../shared/theme';
import { SearchBar } from '@/shared/components';
import {
  ProductCategory,
  ProductFilterTarget,
  ProductListFilter,
  ProductListItemModel,
} from '../../model/library_types';
import { PopUpProductCategoryPanel } from '../components/PopUpProductCategoryPanel';
import { ProductListItem } from '../components/ProductListItem';
import { ProductListSkeleton } from '../components/ProductListSkeleton';

interface S2ProductsTabProps {
  products: ProductListItemModel[];
  searchQuery: string;
  isSearchExpanded: boolean;
  selectedCategory: ProductCategory | null;
  selectedListFilter: ProductListFilter;
  filterTarget: ProductFilterTarget;
  isFilterSheetVisible: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  isFetchingNextPage: boolean;
  isFetchNextPageError: boolean;
  isFavoritesLoading: boolean;
  isFavoritesError: boolean;
  isTogglingFavorite: boolean;
  hasNextPage: boolean;
  error: string | null;
  favoriteError: string | null;
  favoriteLoadError: string | null;
  notice: string | null;
  onSearchQueryChange: (query: string) => void;
  onToggleSearch: () => void;
  onOpenFilters: (target: ProductFilterTarget) => void;
  onCloseFilters: () => void;
  onApplyFilters: (category: ProductCategory | null, listFilter: ProductListFilter) => void;
  onResetFilters: () => void;
  onToggleFavorite: (productId: string) => void;
  onRefresh: () => void;
  onRetry: () => void;
  onRetryFavorites: () => void;
  onLoadNextPage: () => void;
  onProductPress: (productId: string) => void;
  onAddProductPress: () => void;
  onDismissNotice: () => void;
}

function getCategoryLabel(category: ProductCategory | null): string {
  switch (category) {
    case 'cleanser':
      return 'Cleansers';
    case 'toner':
      return 'Toners';
    case 'moisturizer':
      return 'Moisturizers';
    case 'sunscreen':
      return 'Sunscreens';
    case 'serum':
      return 'Serums & Treatments';
    case 'other':
      return 'Other';
    default:
      return 'All Products';
  }
}

export function S2ProductsTab({
  products,
  searchQuery,
  selectedCategory,
  selectedListFilter,
  filterTarget,
  isFilterSheetVisible,
  isLoading,
  isRefreshing,
  isFetchingNextPage,
  isFetchNextPageError,
  isFavoritesLoading,
  isFavoritesError,
  isTogglingFavorite,
  hasNextPage,
  error,
  favoriteError,
  favoriteLoadError,
  notice,
  onSearchQueryChange,
  onOpenFilters,
  onCloseFilters,
  onApplyFilters,
  onToggleFavorite,
  onRefresh,
  onRetry,
  onLoadNextPage,
  onProductPress,
  onAddProductPress,
  onDismissNotice,
}: S2ProductsTabProps) {
  const emptyComponent = isLoading ? (
    <ProductListSkeleton />
  ) : error && products.length === 0 ? (
    <View className="mx-5 mt-8 items-center rounded-card border border-border bg-card p-5">
      <Text className="mb-3 text-center text-body-sm font-sans-medium text-text">
        {error}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Retry loading products"
        onPress={onRetry}
        className="rounded-button bg-primary px-4 py-2 active:opacity-80"
      >
        <Text className="text-body-sm font-sans-semibold text-neutral-white">Retry</Text>
      </Pressable>
    </View>
  ) : (
    <View className="mx-5 mt-8 items-center rounded-card bg-card p-5">
      <Text className="text-center text-body font-sans-semibold text-text">
        No products found
      </Text>
      <Text className="mt-1 text-center text-body-sm font-sans text-muted">
        Try adjusting your search or category filter.
      </Text>
    </View>
  );

  const footerComponent = isFetchingNextPage ? (
    <View className="items-center py-5">
      <ActivityIndicator size="small" color={theme.colors.primary} />
    </View>
  ) : error && products.length > 0 ? (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Retry updating products"
      onPress={onRetry}
      className="mx-5 my-3 items-center rounded-card border border-border bg-card px-4 py-3 active:opacity-80"
    >
      <Text className="text-center text-body-sm font-sans-medium text-text">
        {isFetchNextPageError
          ? 'Couldn’t load more products. Tap to retry.'
          : error}
      </Text>
    </Pressable>
  ) : undefined;

  return (
    <View className="flex-1 rounded-t-card bg-card">
      {/* 1. Permanently Pinned Style 2 SearchBar with Filter Button */}
      <SearchBar
        style={2}
        value={searchQuery}
        onChangeText={onSearchQueryChange}
        placeholder="search products"
        filterLabel={getCategoryLabel(selectedCategory)}
        onFilterPress={() => onOpenFilters('category')}
      />

      {/* 2. Scrollable Product List */}
      <FlatList
        className="flex-1"
        data={products}
        keyExtractor={(item) => item.product.id}
        renderItem={({ item }) => (
          <ProductListItem
            item={item}
            isFavoriteDisabled={isFavoritesLoading || isFavoritesError || isTogglingFavorite}
            onPress={onProductPress}
            onFavoritePress={onToggleFavorite}
          />
        )}
        ListHeaderComponent={
          notice || (error && products.length > 0 && !isFetchNextPageError) || favoriteError || favoriteLoadError ? (
            <View className="pb-3 pt-2">
              {notice ? (
                <View
                  accessibilityRole="alert"
                  className="mb-2 flex-row items-center rounded-button border border-border bg-secondary/20 px-4 py-3"
                >
                  <Text className="flex-1 text-body-sm font-sans-medium text-text">{notice}</Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Dismiss message"
                    onPress={onDismissNotice}
                    className="ml-3 px-1 py-1"
                  >
                    <Text className="text-label font-sans-semibold text-primary">Close</Text>
                  </Pressable>
                </View>
              ) : null}

              {error && products.length > 0 && !isFetchNextPageError ? (
                <View className="mb-2 rounded-button border border-status-error/30 bg-status-error/10 px-4 py-3">
                  <Text className="text-body-sm font-sans-medium text-status-error">
                    {error}
                  </Text>
                </View>
              ) : null}

              {favoriteError ? (
                <View className="mb-2 rounded-button border border-status-error/30 bg-status-error/10 px-4 py-3">
                  <Text className="text-body-sm font-sans-medium text-status-error">
                    {favoriteError}
                  </Text>
                </View>
              ) : null}

              {favoriteLoadError ? (
                <View className="mb-2 flex-row items-center gap-3 rounded-button border border-status-error/30 bg-status-error/10 px-4 py-3">
                  <Text className="flex-1 text-body-sm font-sans-medium text-status-error">
                    {favoriteLoadError}
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Retry loading product favorites"
                    onPress={onRetry}
                    className="rounded-button px-2 py-1 active:opacity-70"
                  >
                    <Text className="text-label font-sans-semibold text-primary">Retry</Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
          ) : (
            <View className="pt-2" />
          )
        }
        ListEmptyComponent={emptyComponent}
        ListFooterComponent={footerComponent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            onLoadNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-5 pb-28"
      />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Add a product"
        unstable_pressDelay={0}
        hitSlop={12}
        onPress={onAddProductPress}
        className="absolute bottom-5 right-5 h-12 w-12 items-center justify-center rounded-full bg-primary shadow-lg active:opacity-75"
      >
        <Plus size={24} color={theme.colors.card} />
      </Pressable>

      <PopUpProductCategoryPanel
        visible={isFilterSheetVisible}
        selectedCategory={selectedCategory}
        selectedListFilter={selectedListFilter}
        filterTarget={filterTarget}
        onClose={onCloseFilters}
        onApply={onApplyFilters}
      />
    </View>
  );
}
