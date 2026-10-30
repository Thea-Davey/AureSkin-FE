import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  SectionList,
  Text,
  View,
} from 'react-native';
import { Search } from 'lucide-react-native';
import { theme } from '../../../../shared/theme';
import { Ingredient, IngredientSection } from '../../model/library_types';
import { AlphabetHeader } from '../components/AlphabetHeader';
import { IngredientListItem } from '../components/IngredientListItem';
import { IngredientListSkeleton } from '../components/IngredientListSkeleton';
import { SearchBar } from '../components/SearchBar';

interface S1IngredientsTabProps {
  ingredients: Ingredient[];
  sections: IngredientSection[];
  favoriteIds: string[];
  compatibleIngredientIds?: string[];
  searchQuery: string;
  isLoading: boolean;
  isRefreshing: boolean;
  isFetchingNextPage: boolean;
  isFetchNextPageError: boolean;
  hasNextPage: boolean;
  error: string | null;
  onSearchQueryChange: (query: string) => void;
  onToggleFavorite: (id: string) => void;
  onRefresh: () => void;
  onRetry: () => void;
  onLoadNextPage: () => void;
  onIngredientPress: (id: string) => void;
}

export function S1IngredientsTab({
  ingredients,
  sections,
  favoriteIds,
  compatibleIngredientIds = [],
  searchQuery,
  isLoading,
  isRefreshing,
  isFetchingNextPage,
  isFetchNextPageError,
  hasNextPage,
  error,
  onSearchQueryChange,
  onToggleFavorite,
  onRefresh,
  onRetry,
  onLoadNextPage,
  onIngredientPress,
}: S1IngredientsTabProps) {
  const listEmptyComponent = isLoading ? (
    <IngredientListSkeleton />
  ) : error ? (
    <View className="mx-5 mt-8 items-center rounded-card border border-border bg-card p-5">
      <Text className="mb-3 text-center text-body-sm font-sans-medium text-text">
        {error}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Retry loading ingredients"
        onPress={onRetry}
        className="rounded-button bg-primary px-5 py-3 active:opacity-80"
      >
        <Text className="text-label font-sans-semibold text-neutral-white">Retry</Text>
      </Pressable>
    </View>
  ) : (
    <View className="mx-5 mt-10 items-center rounded-card bg-background px-5 py-8">
      <Search size={24} color={theme.colors.muted} />
      <Text className="mt-3 text-center text-body-sm font-sans-medium text-muted">
        {searchQuery.trim() ? 'No ingredients found' : 'No ingredients available'}
      </Text>
    </View>
  );

  const listFooterComponent = isFetchingNextPage ? (
    <View className="items-center py-5">
      <ActivityIndicator size="small" color={theme.colors.primary} />
    </View>
  ) : error && ingredients.length > 0 ? (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Retry loading more ingredients"
      onPress={onRetry}
      className="mx-5 my-3 items-center rounded-card border border-border bg-card px-4 py-3 active:opacity-80"
    >
      <Text className="text-body-sm font-sans-medium text-text">
        {isFetchNextPageError
          ? 'Couldn’t load more ingredients. Tap to retry.'
          : 'Unable to update ingredients. Tap to retry.'}
      </Text>
    </Pressable>
  ) : undefined;

  return (
    <View className="flex-1 rounded-t-card bg-card">
      {/* 1. Permanently Pinned SearchBar */}
      <SearchBar
        value={searchQuery}
        onChangeText={onSearchQueryChange}
        placeholder="search ingredients"
      />

      {/* 2. Scrollable SectionList with Sticky Alphabet Headers */}
      <SectionList
        className="flex-1"
        sections={sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={true}
        renderSectionHeader={({ section: { title } }) => (
          <AlphabetHeader letter={title} />
        )}
        renderItem={({ item, index }) => (
          <IngredientListItem
            ingredient={item}
            isFavorite={favoriteIds.includes(item.id)}
            isCompatible={compatibleIngredientIds.includes(item.id)}
            isFirstInSection={index === 0}
            onPress={onIngredientPress}
            onFavoritePress={onToggleFavorite}
          />
        )}
        ListEmptyComponent={listEmptyComponent}
        ListFooterComponent={listFooterComponent}
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
        contentContainerClassName="pb-6"
      />
    </View>
  );
}
