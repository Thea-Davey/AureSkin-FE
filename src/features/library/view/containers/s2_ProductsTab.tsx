import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ChevronDown, Plus, Search } from 'lucide-react-native';
import { theme } from '../../../../shared/theme';
import {
  ProductCategory,
  ProductFilterTarget,
  ProductListFilter,
  ProductListItemModel,
} from '../../model/library_types';
import { ProductFilterSheet } from '../components/ProductFilterSheet';
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
  if (!category) {
    return 'All';
  }
  return `${category.charAt(0).toUpperCase()}${category.slice(1)}s`;
}

export function S2ProductsTab({
  products,
  searchQuery,
  isSearchExpanded,
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
  onToggleSearch,
  onOpenFilters,
  onCloseFilters,
  onApplyFilters,
  onResetFilters,
  onToggleFavorite,
  onRefresh,
  onRetry,
  onRetryFavorites,
  onLoadNextPage,
  onProductPress,
  onAddProductPress,
  onDismissNotice,
}: S2ProductsTabProps) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const emptyComponent = isLoading ? (
    <ProductListSkeleton />
  ) : error ? (
    <View className="mx-5 mt-8 items-center rounded-card border border-border bg-card p-5">
      <Text className="mb-3 text-center text-body-sm font-sans-medium text-text">
        {error}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Retry loading products"
        onPress={onRetryFavorites}
        className="rounded-button bg-primary px-5 py-3 active:opacity-80"
      >
        <Text className="text-label font-sans-semibold text-neutral-white">Retry</Text>
      </Pressable>
    </View>
  ) : (
    <View className="mx-5 mt-10 items-center rounded-card bg-background px-5 py-8">
      <Search size={24} color={theme.colors.muted} />
      <Text className="mt-3 text-center text-body-sm font-sans-medium text-muted">
        No products found matching your filters
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={onResetFilters}
        className="mt-4 rounded-button bg-primary px-4 py-2 active:opacity-80"
      >
        <Text className="text-label font-sans-semibold text-neutral-white">
          Reset filters
        </Text>
      </Pressable>
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
    <View className="flex-1">
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
          <View className="px-5 pb-2 pt-4">
            <View className="flex-row items-center gap-3">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={isSearchExpanded ? 'Close product search' : 'Search products'}
                accessibilityState={{ expanded: isSearchExpanded }}
                onPress={onToggleSearch}
                className="h-10 w-10 items-center justify-center rounded-full border border-border bg-card active:opacity-70"
              >
                <Search size={20} color={theme.colors.text} />
              </Pressable>

              <View className="min-w-0 flex-1 flex-row items-center gap-1.5 rounded-full border border-border bg-white p-1">
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Filter by category: ${getCategoryLabel(selectedCategory)}`}
                  onPress={() => onOpenFilters('category')}
                  className="min-w-0 flex-[1.05] flex-row items-center gap-1 rounded-full bg-background px-2 py-1 active:opacity-80"
                >
                  <ChevronDown size={12} color={theme.colors.text} />
                  <Text numberOfLines={1} className="text-body-sm font-sans text-text">
                    {getCategoryLabel(selectedCategory)}
                  </Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Show ${selectedListFilter === 'all' ? 'all products' : 'favorites'}`}
                  onPress={() => onOpenFilters('list')}
                  className="min-w-0 flex-1 flex-row items-center gap-1 rounded-full bg-secondary/20 px-2 py-1 active:opacity-80"
                >
                  <ChevronDown size={12} color={theme.colors.text} />
                  <Text numberOfLines={1} className="text-body-sm font-sans text-text">
                    {selectedListFilter === 'all' ? 'All' : 'Favorites'}
                  </Text>
                </Pressable>
              </View>
            </View>

            {isSearchExpanded ? (
              <View
                className={`mt-3 flex-row items-center rounded-input border bg-card px-3 ${
                  isSearchFocused ? 'border-primary' : 'border-border'
                }`}
              >
                <Search size={18} color={theme.colors.muted} />
                <TextInput
                  accessibilityLabel="Search products"
                  accessibilityHint="Searches product names and brands"
                  value={searchQuery}
                  onChangeText={onSearchQueryChange}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  placeholder="search products"
                  placeholderTextColor={theme.colors.muted}
                  returnKeyType="search"
                  className="ml-2 flex-1 py-3 text-body-sm font-sans text-text"
                />
              </View>
            ) : null}

            {notice ? (
              <View
                accessibilityRole="alert"
                className="mt-3 flex-row items-center rounded-button border border-border bg-secondary/20 px-4 py-3"
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
              <View className="mt-3 rounded-button border border-status-error/30 bg-status-error/10 px-4 py-3">
                <Text className="text-body-sm font-sans-medium text-status-error">
                  {error}
                </Text>
              </View>
            ) : null}
            {favoriteError ? (
              <View className="mt-3 rounded-button border border-status-error/30 bg-status-error/10 px-4 py-3">
                <Text className="text-body-sm font-sans-medium text-status-error">
                  {favoriteError}
                </Text>
              </View>
            ) : null}
            {favoriteLoadError ? (
              <View className="mt-3 flex-row items-center gap-3 rounded-button border border-status-error/30 bg-status-error/10 px-4 py-3">
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
        onPress={onAddProductPress}
        className="absolute bottom-5 right-5 h-12 w-12 items-center justify-center rounded-full bg-primary shadow-lg active:opacity-80"
      >
        <Plus size={24} color={theme.colors.card} />
      </Pressable>

      <ProductFilterSheet
        key={`${isFilterSheetVisible}-${selectedCategory ?? 'all'}-${selectedListFilter}`}
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
