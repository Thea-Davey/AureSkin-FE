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
import { Search } from 'lucide-react-native';
import { theme } from '../../../../shared/theme';
import { Ingredient } from '../../model/library_types';
import { IngredientListItem } from '../components/IngredientListItem';
import { IngredientListSkeleton } from '../components/IngredientListSkeleton';

interface S1IngredientsTabProps {
  ingredients: Ingredient[];
  searchQuery: string;
  isLoading: boolean;
  isRefreshing: boolean;
  isFetchingNextPage: boolean;
  isFetchNextPageError: boolean;
  hasNextPage: boolean;
  error: string | null;
  onSearchQueryChange: (query: string) => void;
  onRefresh: () => void;
  onRetry: () => void;
  onLoadNextPage: () => void;
  onIngredientPress: (id: string) => void;
}

export function S1IngredientsTab({
  ingredients,
  searchQuery,
  isLoading,
  isRefreshing,
  isFetchingNextPage,
  isFetchNextPageError,
  hasNextPage,
  error,
  onSearchQueryChange,
  onRefresh,
  onRetry,
  onLoadNextPage,
  onIngredientPress,
}: S1IngredientsTabProps) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

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
    <FlatList
      className="flex-1"
      data={ingredients}
      keyExtractor={(ingredient) => ingredient.id}
      renderItem={({ item, index }) => (
        <IngredientListItem
          ingredient={item}
          index={index}
          onPress={onIngredientPress}
        />
      )}
      ListHeaderComponent={
        <View className="px-5 pb-1 pt-4">
          <View
            className={`flex-row items-center rounded-full border bg-card px-4 ${
              isSearchFocused ? 'border-primary' : 'border-border'
            }`}
          >
            <Search size={20} color={theme.colors.text} />
            <TextInput
              accessibilityLabel="Search ingredients"
              accessibilityHint="Filters the ingredient list by name"
              value={searchQuery}
              onChangeText={onSearchQueryChange}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              placeholder="search ingredient"
              placeholderTextColor={theme.colors.muted}
              returnKeyType="search"
              className="ml-3 flex-1 py-3 text-body-sm font-sans text-text"
            />
          </View>
        </View>
      }
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
  );
}
