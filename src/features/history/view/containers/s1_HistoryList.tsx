import { theme } from '@/shared/theme';
import { Filter, Search, X } from 'lucide-react-native';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, TextInput, View } from 'react-native';
import { HistoryEntry, HistoryFilters } from '../../model/history_types';
import { HistoryEntryActionSheet } from '../components/HistoryEntryActionSheet';
import { HistoryFilterSheet } from '../components/HistoryFilterSheet';
import { HistoryListItem } from '../components/HistoryListItem';

interface HistoryListProps {
  entries: HistoryEntry[];
  filteredEntries: HistoryEntry[];
  searchQuery: string;
  filters: HistoryFilters;
  isLoading: boolean;
  isRefreshing: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  isFilterSheetVisible: boolean;
  selectedEntryId: string | null;
  deletingEntryId: string | null;
  error: string | null;
  deleteError: string | null;
  onSearchChange: (query: string) => void;
  onOpenFilters: () => void;
  onCloseFilters: () => void;
  onApplyFilters: (filters: HistoryFilters) => void;
  onResetFilters: () => void;
  onOpenEntryActions: (id: string) => void;
  onCloseEntryActions: () => void;
  onDeleteEntry: (id: string) => void;
  onRetry: () => void;
  onRefresh: () => Promise<void>;
  onLoadNextPage: () => void;
  onOpenEntry: (id: string) => void;
  onStartScan: () => void;
}

function ListEmptyState({
  hasQuery,
  hasEntries,
  onStartScan,
}: {
  hasQuery: boolean;
  hasEntries: boolean;
  onStartScan: () => void;
}) {
  if (hasEntries && hasQuery) {
    return (
      <View className="items-center px-8 py-12">
        <Text className="mb-2 text-h3 font-sans-bold text-text">No history found</Text>
        <Text className="text-center text-body-sm font-sans text-muted">Try another search or reset your filters.</Text>
      </View>
    );
  }

  return (
    <View className="items-center px-8 py-12">
      <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <Search size={28} color={theme.colors.primary} />
      </View>
      <Text className="mb-2 text-h3 font-sans-bold text-text">You have no scan history yet</Text>
      <Text className="mb-5 text-center text-body-sm font-sans text-muted">Your completed skin analyses will appear here.</Text>
      <Pressable onPress={onStartScan} accessibilityRole="button" className="rounded-button bg-primary px-5 py-3 active:opacity-80">
        <Text className="text-label font-sans-bold text-neutral-white">Start your first scan</Text>
      </Pressable>
    </View>
  );
}

function HistorySkeleton() {
  return (
    <View accessibilityLabel="Loading scan history" className="gap-3 px-4 pt-3">
      {[0, 1, 2].map((row) => (
        <View key={row} className="h-28 flex-row items-center rounded-card border border-border bg-card p-3">
          <View className="h-20 w-20 rounded-input bg-background" />
          <View className="ml-3 flex-1 gap-3">
            <View className="h-4 w-2/3 rounded-badge bg-background" />
            <View className="h-4 w-1/2 rounded-badge bg-background" />
          </View>
        </View>
      ))}
    </View>
  );
}

export function S1HistoryList(props: HistoryListProps) {
  const skinTypes = [...new Set(props.entries.map((entry) => entry.skin_type).filter((value): value is string => Boolean(value)))].sort();
  const conditions = [...new Set(props.entries.flatMap((entry) => entry.conditions))].sort();
  const hasActiveFilters = Boolean(
    props.filters.startDate || props.filters.endDate || props.filters.skinTypes.length || props.filters.conditions.length
  );
  const hasQuery = Boolean(props.searchQuery.trim() || hasActiveFilters);

  const renderItem = ({ item }: { item: HistoryEntry }) => (
    <HistoryListItem
      entry={item}
      onPress={() => props.onOpenEntry(item.id)}
      onMorePress={() => props.onOpenEntryActions(item.id)}
    />
  );

  return (
    <View className="flex-1 bg-neutral-offwhite">
      <View className="px-4 pb-3 pt-4">
        <View className="flex-row items-center rounded-input border border-border bg-card px-3">
          <Search size={19} color={theme.colors.muted} />
          <TextInput
            value={props.searchQuery}
            onChangeText={props.onSearchChange}
            placeholder="search history"
            placeholderTextColor={theme.colors.muted}
            accessibilityLabel="Search history by date or skin type"
            returnKeyType="search"
            className="ml-2 min-w-0 flex-1 py-3 text-body-sm font-sans text-text"
          />
          {props.searchQuery.length > 0 && (
            <Pressable onPress={() => props.onSearchChange('')} accessibilityRole="button" accessibilityLabel="Clear search" className="h-10 w-10 items-center justify-center">
              <X size={18} color={theme.colors.muted} />
            </Pressable>
          )}
          <Pressable onPress={props.onOpenFilters} accessibilityRole="button" accessibilityLabel="Filter history" className="ml-1 h-10 w-10 items-center justify-center">
            <Filter size={19} color={hasActiveFilters ? theme.colors.primary : theme.colors.muted} />
          </Pressable>
        </View>
        {hasActiveFilters && (
          <Pressable onPress={props.onResetFilters} className="mt-2 self-start">
            <Text className="text-body-sm font-sans-medium text-primary">Clear filters</Text>
          </Pressable>
        )}
      </View>

      {props.isLoading ? (
        <HistorySkeleton />
      ) : props.error && props.entries.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text accessibilityRole="alert" className="mb-3 text-center text-body-sm font-sans text-error">{props.error}</Text>
          <Pressable onPress={props.onRetry} accessibilityRole="button" className="rounded-button bg-primary px-5 py-3 active:opacity-80">
            <Text className="text-label font-sans-bold text-neutral-white">Retry</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={props.filteredEntries}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerClassName="grow px-4 pb-8"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={props.isRefreshing}
              onRefresh={props.onRefresh}
              tintColor={theme.colors.primary}
              colors={[theme.colors.primary]}
            />
          }
          onEndReached={props.onLoadNextPage}
          onEndReachedThreshold={0.4}
          ListEmptyComponent={<ListEmptyState hasQuery={hasQuery} hasEntries={props.entries.length > 0} onStartScan={props.onStartScan} />}
          ListFooterComponent={
            props.isFetchingNextPage ? (
              <ActivityIndicator color={theme.colors.primary} className="py-4" />
            ) : props.error && props.entries.length > 0 ? (
              <Pressable onPress={props.onRetry} accessibilityRole="button" className="items-center py-4">
                <Text className="text-body-sm font-sans-medium text-error">Could not load more. Tap to retry.</Text>
              </Pressable>
            ) : undefined
          }
        />
      )}

      <HistoryFilterSheet
        visible={props.isFilterSheetVisible}
        filters={props.filters}
        skinTypes={skinTypes}
        conditions={conditions}
        onClose={props.onCloseFilters}
        onApply={props.onApplyFilters}
        onReset={props.onResetFilters}
      />
      <HistoryEntryActionSheet
        visible={props.selectedEntryId !== null}
        entryId={props.selectedEntryId}
        deletingEntryId={props.deletingEntryId}
        error={props.deleteError}
        onClose={props.onCloseEntryActions}
        onDelete={props.onDeleteEntry}
      />
    </View>
  );
}