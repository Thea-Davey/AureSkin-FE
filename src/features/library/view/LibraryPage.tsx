import { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  ProductCategory,
  ProductListFilter,
} from '../model/library_types';
import { useIngredients } from '../viewmodel/useIngredients';
import { useIngredientDetail } from '../viewmodel/useIngredientDetail';
import { useProducts } from '../viewmodel/useProducts';
import { useProductDetail } from '../viewmodel/useProductDetail';
import { S1IngredientsTab } from './containers/s1_IngredientsTab';
import { S2ProductsTab } from './containers/s2_ProductsTab';
import { IngredientDetailPage } from './components/IngredientDetailPage';
import { ProductDetailPage } from './components/ProductDetailPage';

type LibraryTab = 'ingredients' | 'products';

interface ProductsTabContentProps {
  notice: string | null;
  selectedProductId: string | null;
  isProductDetailVisible: boolean;
  onProductPress: (productId: string) => void;
  onProductClose: () => void;
  onProductDismiss: () => void;
  onIngredientPress: (ingredientId: string) => void;
  onAddProductPress: () => void;
  onDismissNotice: () => void;
}

function ProductDetailSheet({
  productId,
  visible,
  favoriteIds,
  isFavoriteLoading,
  isFavoriteError,
  isTogglingFavorite,
  favoriteLoadError,
  favoriteError,
  onClose,
  onDismiss,
  onToggleFavorite,
  onRetryFavorites,
  onIngredientPress,
}: {
  productId: string;
  visible: boolean;
  favoriteIds: string[];
  isFavoriteLoading: boolean;
  isFavoriteError: boolean;
  isTogglingFavorite: boolean;
  favoriteLoadError: string | null;
  favoriteError: string | null;
  onClose: () => void;
  onDismiss: () => void;
  onToggleFavorite: (productId: string) => void;
  onRetryFavorites: () => void;
  onIngredientPress: (ingredientId: string) => void;
}) {
  const detail = useProductDetail(productId);
  const isFavorite = favoriteIds.includes(productId);

  return (
    <ProductDetailPage
      visible={visible}
      product={detail.product}
      isLoading={detail.isLoading}
      error={detail.error}
      compatibilityStatus={detail.compatibilityStatus}
      compatibilityError={detail.compatibilityError}
      isCompatibilityLoading={detail.isCompatibilityLoading}
      canRetryCompatibility={detail.canRetryCompatibility}
      isFavorite={isFavorite}
      isFavoriteLoading={isFavoriteLoading}
      isFavoriteError={isFavoriteError}
      isTogglingFavorite={isTogglingFavorite}
      favoriteLoadError={favoriteLoadError}
      favoriteError={favoriteError}
      onClose={onClose}
      onDismiss={onDismiss}
      onRetry={() => void detail.actions.retry()}
      onRetryCompatibility={() => void detail.actions.retryCompatibility()}
      onRetryFavorites={onRetryFavorites}
      onToggleFavorite={() => onToggleFavorite(productId)}
      onIngredientPress={onIngredientPress}
    />
  );
}

function ProductsTabContent({
  notice,
  selectedProductId,
  isProductDetailVisible,
  onProductPress,
  onProductClose,
  onProductDismiss,
  onIngredientPress,
  onAddProductPress,
  onDismissNotice,
}: ProductsTabContentProps) {
  const products = useProducts();

  return (
    <>
      <S2ProductsTab
        products={products.products}
        searchQuery={products.searchQuery}
        isSearchExpanded={products.isSearchExpanded}
        selectedCategory={products.selectedCategory}
        selectedListFilter={products.selectedListFilter}
        filterTarget={products.filterTarget}
        isFilterSheetVisible={products.isFilterSheetVisible}
        isLoading={products.isLoading}
        isRefreshing={products.isRefreshing}
        isFetchingNextPage={products.isFetchingNextPage}
        isFetchNextPageError={products.isFetchNextPageError}
        isFavoritesLoading={products.isFavoritesLoading}
        isFavoritesError={products.isFavoritesError}
        isTogglingFavorite={products.isTogglingFavorite}
        favoriteError={products.favoriteError}
        favoriteLoadError={products.favoriteLoadError}
        hasNextPage={products.hasNextPage}
        error={products.error}
        notice={notice}
        onSearchQueryChange={products.actions.setSearchQuery}
        onToggleSearch={products.actions.toggleSearch}
        onOpenFilters={products.actions.openFilters}
        onCloseFilters={products.actions.closeFilters}
        onApplyFilters={(category: ProductCategory | null, listFilter: ProductListFilter) =>
          products.actions.applyFilters(category, listFilter)}
        onResetFilters={products.actions.resetFilters}
        onToggleFavorite={products.actions.toggleFavorite}
        onRefresh={products.actions.refresh}
        onRetry={products.actions.retry}
        onRetryFavorites={products.actions.retryFavorites}
        onLoadNextPage={products.actions.loadNextPage}
        onProductPress={onProductPress}
        onAddProductPress={onAddProductPress}
        onDismissNotice={onDismissNotice}
      />
      {selectedProductId ? (
        <ProductDetailSheet
          productId={selectedProductId}
          visible={isProductDetailVisible}
          favoriteIds={products.favoriteIds}
          isFavoriteLoading={products.isFavoritesLoading}
          isFavoriteError={products.isFavoritesError}
          isTogglingFavorite={products.isTogglingFavorite}
          favoriteLoadError={products.favoriteLoadError}
          favoriteError={products.favoriteError}
          onClose={onProductClose}
          onDismiss={onProductDismiss}
          onToggleFavorite={products.actions.toggleFavorite}
          onRetryFavorites={() => void products.actions.retryFavorites()}
          onIngredientPress={onIngredientPress}
        />
      ) : null}
    </>
  );
}

function IngredientDetailSheet({
  ingredientId,
  onClose,
}: {
  ingredientId: string;
  onClose: () => void;
}) {
  const detail = useIngredientDetail(ingredientId);

  return (
    <IngredientDetailPage
      visible
      ingredient={detail.ingredient}
      isLoading={detail.isLoading}
      error={detail.error}
      compatibilityStatus={detail.compatibilityStatus}
      compatibilityError={detail.compatibilityError}
      isCompatibilityLoading={detail.isCompatibilityLoading}
      isFavorite={detail.isFavorite}
      isFavoriteLoading={detail.isFavoriteLoading}
      isTogglingFavorite={detail.isTogglingFavorite}
      favoriteError={detail.favoriteError}
      onClose={onClose}
      onRetry={() => void detail.actions.retry()}
      onRetryCompatibility={() => void detail.actions.retryCompatibility()}
      onToggleFavorite={detail.actions.toggleFavorite}
    />
  );
}

export function LibraryPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<LibraryTab>('ingredients');
  const [notice, setNotice] = useState<string | null>(null);
  const [selectedIngredientId, setSelectedIngredientId] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isProductDetailVisible, setIsProductDetailVisible] = useState(false);
  const pendingIngredientId = useRef<string | null>(null);
  const productDismissFallback = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ingredients = useIngredients();

  const clearProductDismissFallback = () => {
    if (productDismissFallback.current) {
      clearTimeout(productDismissFallback.current);
      productDismissFallback.current = null;
    }
  };

  const completeProductIngredientHandoff = () => {
    clearProductDismissFallback();
    const ingredientId = pendingIngredientId.current;
    if (!ingredientId) {
      return;
    }
    pendingIngredientId.current = null;
    setSelectedIngredientId(ingredientId);
  };

  const handleProductIngredientPress = (ingredientId: string) => {
    pendingIngredientId.current = ingredientId;
    setIsProductDetailVisible(false);
    clearProductDismissFallback();
    productDismissFallback.current = setTimeout(
      completeProductIngredientHandoff,
      Platform.OS === 'android' ? 500 : 350
    );
  };

  useEffect(() => () => clearProductDismissFallback(), []);

  return (
    <View className="flex-1 bg-primary">
      <View className="flex-row items-center justify-center gap-16 px-5 pb-2 pt-1">
        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'ingredients' }}
          onPress={() => {
            setNotice(null);
            setSelectedProductId(null);
            setIsProductDetailVisible(false);
            setSelectedIngredientId(null);
            setActiveTab('ingredients');
          }}
          className={`rounded-badge px-4 py-1 ${
            activeTab === 'ingredients' ? 'bg-secondary' : 'bg-transparent'
          }`}
        >
          <Text
            className={`text-label ${
              activeTab === 'ingredients'
                ? 'font-sans-semibold text-neutral-white'
                : 'font-sans text-neutral-white'
            }`}
          >
            Ingredients
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'products' }}
          onPress={() => {
            setNotice(null);
            setSelectedIngredientId(null);
            setActiveTab('products');
          }}
          className={`rounded-badge px-4 py-1 ${
            activeTab === 'products' ? 'bg-secondary' : 'bg-transparent'
          }`}
        >
          <Text
            className={`text-label ${
              activeTab === 'products'
                ? 'font-sans-semibold text-neutral-white'
                : 'font-sans text-neutral-white'
            }`}
          >
            Products
          </Text>
        </Pressable>
      </View>

      <View className="flex-1 rounded-t-card bg-card">
        {activeTab === 'ingredients' ? (
          <S1IngredientsTab
            ingredients={ingredients.ingredients}
            searchQuery={ingredients.searchQuery}
            isLoading={ingredients.isLoading}
            isRefreshing={ingredients.isRefreshing}
            isFetchingNextPage={ingredients.isFetchingNextPage}
            isFetchNextPageError={ingredients.isFetchNextPageError}
            hasNextPage={ingredients.hasNextPage}
            error={ingredients.error}
            onSearchQueryChange={ingredients.actions.setSearchQuery}
            onRefresh={ingredients.actions.refresh}
            onRetry={ingredients.actions.retry}
            onLoadNextPage={ingredients.actions.loadNextPage}
            onIngredientPress={setSelectedIngredientId}
          />
        ) : (
          <ProductsTabContent
            notice={notice}
            selectedProductId={selectedProductId}
            isProductDetailVisible={isProductDetailVisible}
            onProductPress={(productId) => {
              pendingIngredientId.current = null;
              clearProductDismissFallback();
              setSelectedIngredientId(null);
              setSelectedProductId(productId);
              setIsProductDetailVisible(true);
            }}
            onProductClose={() => {
              pendingIngredientId.current = null;
              clearProductDismissFallback();
              setIsProductDetailVisible(false);
              setSelectedProductId(null);
            }}
            onProductDismiss={completeProductIngredientHandoff}
            onIngredientPress={handleProductIngredientPress}
            onAddProductPress={() => {
              router.push('/library/add-product-camera');
            }}
            onDismissNotice={() => setNotice(null)}
          />
        )}
      </View>
      {selectedIngredientId ? (
        <IngredientDetailSheet
          ingredientId={selectedIngredientId}
          onClose={() => {
            setSelectedIngredientId(null);
            if (selectedProductId) {
              setIsProductDetailVisible(true);
            }
          }}
        />
      ) : null}
    </View>
  );
}

export default LibraryPage;
