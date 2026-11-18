import React, { useCallback, useMemo, useRef } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  SectionList,
  Text,
  View,
} from 'react-native';
import { Search } from 'lucide-react-native';
import { theme } from '@/shared/theme';
import { IngredientCard, SearchBar } from '@/shared/components';
import { Ingredient, IngredientSection } from '../../model/library_types';
import { AlphabetHeader } from '../components/AlphabetHeader';
import { AlphabetScrubber } from '../components/AlphabetScrubber';
import { IngredientListSkeleton } from '../components/IngredientListSkeleton';

interface S1IngredientsTabProps {
  ingredients: Ingredient[];
  sections: IngredientSection[];
  favoriteIds: string[];
  compatibleIngredientIds?: string[];
  filteredIngredientIds?: string[];
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
  filteredIngredientIds = [],
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
  const sectionListRef = useRef<SectionList<Ingredient, IngredientSection>>(null);

  const availableLetters = useMemo(
    () => sections.map((s) => s.title.toUpperCase()),
    [sections]
  );

  const HEADER_HEIGHT = 38;
  const ITEM_HEIGHT = 136;

  const { flatLayouts, sectionOffsets } = useMemo(() => {
    const layouts: { length: number; offset: number; index: number }[] = [];
    const offsets: number[] = [];
    let currentOffset = 0;
    let flatIndex = 0;

    for (let s = 0; s < sections.length; s++) {
      offsets[s] = currentOffset;

      // 1. Section Header
      layouts.push({
        length: HEADER_HEIGHT,
        offset: currentOffset,
        index: flatIndex,
      });
      currentOffset += HEADER_HEIGHT;
      flatIndex++;

      // 2. Items in section
      const count = sections[s].data.length;
      for (let i = 0; i < count; i++) {
        layouts.push({
          length: ITEM_HEIGHT,
          offset: currentOffset,
          index: flatIndex,
        });
        currentOffset += ITEM_HEIGHT;
        flatIndex++;
      }
    }

    return { flatLayouts: layouts, sectionOffsets: offsets };
  }, [sections]);

  const handleSelectLetter = useCallback(
    (letter: string) => {
      if (!sections.length) return;
      const targetLetter = letter.toUpperCase();

      // 1. Try exact match
      let targetIndex = sections.findIndex(
        (s) => s.title.toUpperCase() === targetLetter
      );

      // 2. '#' or fallback to closest prior section
      if (targetLetter === '#') {
        const hashIndex = sections.findIndex((s) => s.title === '#');
        targetIndex = hashIndex !== -1 ? hashIndex : sections.length - 1;
      } else if (targetIndex === -1) {
        for (let i = sections.length - 1; i >= 0; i--) {
          if (sections[i].title.toUpperCase() <= targetLetter) {
            targetIndex = i;
            break;
          }
        }
      }

      // 3. Fallback to first section if letter is before the first section
      if (targetIndex === -1 && sections.length > 0) {
        targetIndex = 0;
      }

      if (targetIndex !== -1) {
        // Direct instant scroll to precomputed pixel offset
        const targetOffset = sectionOffsets[targetIndex];
        if (typeof targetOffset === 'number') {
          const scrollResponder = sectionListRef.current?.getScrollResponder() as any;
          scrollResponder?.scrollTo({
            y: Math.max(0, targetOffset),
            animated: false,
          });
        }

        try {
          sectionListRef.current?.scrollToLocation({
            sectionIndex: targetIndex,
            itemIndex: 0,
            viewPosition: 0,
            animated: false,
          });
        } catch {
          // Handled smoothly by pixel offset scroll
        }
      }
    },
    [sections, sectionOffsets]
  );

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
    <View className="mx-5 mt-12 items-center py-6">
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
    <View className="flex-1 rounded-t-card bg-background">
      {/* 1. Permanently Pinned SearchBar */}
      <SearchBar
        style={1}
        value={searchQuery}
        onChangeText={onSearchQueryChange}
        placeholder="search ingredients"
        className="bg-background"
      // inputClassName="bg-card"
      />

      {/* 2. Scrollable SectionList with Sticky Alphabet Headers and Alphabet Scrubber */}
      <View className="relative flex-1">
        <SectionList
          ref={sectionListRef}
          className="flex-1"
          sections={sections}
          keyExtractor={(item) => item.id}
          stickySectionHeadersEnabled={true}
          renderSectionHeader={({ section: { title } }) => (
            <AlphabetHeader letter={title} />
          )}
          renderItem={({ item, index }) => (
            <IngredientCard
              ingredient={item}
              isFavorite={favoriteIds.includes(item.id)}
              isCompatible={compatibleIngredientIds.includes(item.id)}
              hasClinicalWarning={filteredIngredientIds.includes(item.id)}
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
          getItemLayout={(_data, index) =>
            flatLayouts[index] ?? {
              length: ITEM_HEIGHT,
              offset: index * ITEM_HEIGHT,
              index,
            }
          }
          onScrollToIndexFailed={(info) => {
            const targetOffset = sectionOffsets[info.index] ?? info.highestMeasuredFrameIndex * ITEM_HEIGHT;
            const scrollResponder = sectionListRef.current?.getScrollResponder() as any;
            scrollResponder?.scrollTo({
              y: Math.max(0, targetOffset),
              animated: false,
            });
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerClassName="pb-28"
        />

        {/* 3. Alphabet Scrubber (shown when browsing catalog without search filter) */}
        {!searchQuery.trim() && sections.length > 1 ? (
          <AlphabetScrubber
            availableSections={availableLetters}
            onSelectLetter={handleSelectLetter}
          />
        ) : null}
      </View>
    </View>
  );
}
