import React, { useState } from 'react';
import { theme } from '@/shared/theme';
import { Card } from '@/shared/components/Card';
import { DeleteDialog } from '@/shared/components/DeleteDialog';
import { SearchBar } from '@/shared/components/SearchBar';
import { Search, SlidersHorizontal } from 'lucide-react-native';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { HistoryEntry, HistoryFilters } from '../../model/history_types';
import { PopUpHistoryFilterPanel } from '../components/PopUpHistoryFilterPanel';
import { PopUpScanActionPanel } from '../components/PopUpScanActionPanel';
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
        <Card key={row} className="min-h-28 flex-row items-center p-3">
          <View className="h-24 w-24 rounded-card bg-secondary/15" />
          <View className="ml-3 flex-1 gap-2.5">
            <View className="h-4 w-2/3 rounded-badge bg-border/40" />
            <View className="h-5 w-1/3 rounded-badge bg-border/40" />
            <View className="h-5 w-1/2 rounded-badge bg-border/40" />
          </View>
        </Card>
      ))}
    </View>
  );
}

export function S1HistoryList(props: HistoryListProps) {
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [targetEntryId, setTargetEntryId] = useState<string | null>(null);

  const skinTypes = [
    ...new Set(
      (props.entries ?? [])
        .map((entry) => entry?.skin_type)
        .filter((value): value is string => Boolean(value))
    ),
  ].sort();
  const conditions = [
    ...new Set(
      (props.entries ?? []).flatMap((entry) =>
        Array.isArray(entry?.conditions) ? entry.conditions : []
      )
    ),
  ].sort();
  const hasActiveFilters = Boolean(
    props.filters.startDate || props.filters.endDate || props.filters.skinTypes.length || props.filters.conditions.length
  );
  const hasQuery = Boolean(props.searchQuery.trim() || hasActiveFilters);

  const handleDeletePress = () => {
    setTargetEntryId(props.selectedEntryId);
    props.onCloseEntryActions();
    setIsConfirmDialogOpen(true);
  };

  const renderItem = ({ item }: { item: HistoryEntry }) => (
    <HistoryListItem
      entry={item}
      onPress={() => props.onOpenEntry(item.id)}
      onMorePress={() => props.onOpenEntryActions(item.id)}
    />
  );

  return (
    <View className="flex-1 bg-background">
      <SearchBar
        style={2}
        filterIcon={SlidersHorizontal}
        filterIconColor={hasActiveFilters ? theme.colors.primary : theme.colors.muted}
        value={props.searchQuery}
        onChangeText={props.onSearchChange}
        placeholder="search history"
        onFilterPress={props.onOpenFilters}
        className="px-4 pt-4 pb-2 rounded-none bg-transparent"
      />

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
          contentContainerClassName="grow px-4 pb-12 pt-1"
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

      {/* History Filter Sheet */}
      <PopUpHistoryFilterPanel
        visible={props.isFilterSheetVisible}
        filters={props.filters}
        skinTypes={skinTypes}
        conditions={conditions}
        onClose={props.onCloseFilters}
        onApply={props.onApplyFilters}
        onReset={props.onResetFilters}
      />

      {/* PopUp Scan Action Panel (triggered by 3-dots) */}
      <PopUpScanActionPanel
        visible={props.selectedEntryId !== null}
        onClose={props.onCloseEntryActions}
        onDeletePress={handleDeletePress}
      />

      {/* Discard / Delete Dialog */}
      <DeleteDialog
        visible={isConfirmDialogOpen}
        title="Delete Scan Record"
        body="Are you sure you want to delete this scan record? This action cannot be undone."
        boldPhrase="delete this scan record"
        cancelLabel="Cancel"
        confirmLabel="Delete"
        onCancel={() => {
          setIsConfirmDialogOpen(false);
          setTargetEntryId(null);
        }}
        onConfirm={() => {
          if (targetEntryId) {
            props.onDeleteEntry(targetEntryId);
          }
          setIsConfirmDialogOpen(false);
          setTargetEntryId(null);
        }}
        onClose={() => {
          setIsConfirmDialogOpen(false);
          setTargetEntryId(null);
        }}
      />
    </View>
  );
}

export default S1HistoryList;
