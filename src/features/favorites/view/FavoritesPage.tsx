import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Bookmark } from 'lucide-react-native';
import { ModalHeader } from '@/shared/components/ModalHeader';
import { Card } from '@/shared/components/Card';
import { IngredientDetailPage } from '@/shared/components/IngredientDetailPage';
import { ProductDetailPage } from '@/shared/components/ProductDetailPage';
import { theme } from '@/shared/theme';
import { useFavorites } from '../viewmodel/useFavorites';
import { FavoriteCard } from './components/FavoriteCard';
import { FavoriteFilter } from '../model/favorites_types';

export function FavoritesPage() {
  const {
    items,
    counts,
    activeFilter,
    isLoading,
    isRefreshing,
    error,
    selectedIngredientId,
    selectedProductId,
    actions,
  } = useFavorites();

  const filterTabs: { id: FavoriteFilter; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'products', label: 'Products', count: counts.products },
    { id: 'ingredients', label: 'Ingredients', count: counts.ingredients },
  ];

  return (
    <View className="flex-1 bg-background">
      <ModalHeader title="Favorites" />

      {/* Filter Tabs (3 Containers: All, Products, Ingredients) */}
      <View className="flex-row px-5 pt-4 pb-3 bg-background border-b border-border/40">
        {filterTabs.map((tab) => {
          const isActive = activeFilter === tab.id;
          return (
            <Pressable
              key={tab.id}
              onPress={() => actions.setFilter(tab.id)}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              className={`px-4 py-2 rounded-badge mr-2.5 ${
                isActive ? 'bg-primary' : 'bg-card border border-border'
              }`}
            >
              <Text
                className={`text-caption font-sans-semibold ${
                  isActive ? 'text-neutral-white' : 'text-text'
                }`}
              >
                {tab.label} ({tab.count})
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView
        className="flex-1 pt-4"
        contentContainerStyle={{ paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={actions.refresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
      >
        {isLoading ? (
          <View className="items-center justify-center py-20">
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text className="mt-3 text-body-sm font-sans text-muted">
              Loading your favorites...
            </Text>
          </View>
        ) : error ? (
          <View className="mx-5 my-6">
            <Card style={2} className="p-6 items-center">
              <Text className="text-body font-sans-bold text-status-error mb-1">
                Unable to load favorites
              </Text>
              <Text className="text-body-sm font-sans text-muted text-center mb-4">
                {error}
              </Text>
              <Pressable
                onPress={() => void actions.refresh()}
                className="bg-primary rounded-button px-5 py-2.5"
              >
                <Text className="text-label font-sans-semibold text-neutral-white">
                  Retry
                </Text>
              </Pressable>
            </Card>
          </View>
        ) : items.length === 0 ? (
          <View className="mx-5 my-12 items-center">
            <Card style={2} className="p-8 items-center w-full">
              <View className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center mb-4">
                <Bookmark size={28} color={theme.colors.primary} />
              </View>
              <Text className="text-h3 font-sans-bold text-text text-center">
                No favorites in this category
              </Text>
              <Text className="text-body-sm font-sans text-muted text-center mt-1.5 leading-5 max-w-xs">
                Tap the star icon on any ingredient or product in the Library to save it here.
              </Text>
            </Card>
          </View>
        ) : (
          items.map((item) => (
            <FavoriteCard
              key={item.id}
              item={item}
              styleVariant={item.type === 'ingredient' ? 1 : 2}
              onPress={() => actions.openItem(item)}
              onFavoritePress={() => actions.toggleFavorite(item.id)}
            />
          ))
        )}
      </ScrollView>

      {/* Ingredient Detail Sheet Modal */}
      {selectedIngredientId ? (
        <IngredientDetailPage
          visible={Boolean(selectedIngredientId)}
          ingredientId={selectedIngredientId}
          onClose={actions.closeIngredientDetail}
        />
      ) : null}

      {/* Product Detail Sheet Modal */}
      {selectedProductId ? (
        <ProductDetailPage
          visible={Boolean(selectedProductId)}
          productId={selectedProductId}
          onClose={actions.closeProductDetail}
        />
      ) : null}
    </View>
  );
}

export default FavoritesPage;
