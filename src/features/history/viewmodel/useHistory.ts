import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { deleteHistoryEntry, fetchHistoryPage } from '../model/history_api';
import { HistoryEntry, HistoryFilters } from '../model/history_types';

const PAGE_SIZE = 20;

const EMPTY_FILTERS: HistoryFilters = {
  startDate: null,
  endDate: null,
  skinTypes: [],
  conditions: [],
};

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}

function formatDateForSearch(date: string): string {
  const parsedDate = new Date(date);
  return Number.isNaN(parsedDate.getTime())
    ? date
    : parsedDate.toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' });
}

export function useHistory() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<HistoryFilters>(EMPTY_FILTERS);
  const [isFilterSheetVisible, setFilterSheetVisible] = useState(false);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);

  const historyQuery = useInfiniteQuery({
    queryKey: ['history', 'list'],
    initialPageParam: 0,
    queryFn: ({ pageParam }) => fetchHistoryPage({ limit: PAGE_SIZE, offset: pageParam }),
    getNextPageParam: (lastPage) => lastPage?.nextOffset ?? undefined,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteHistoryEntry,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['history'] });
      setSelectedEntryId(null);
    },
  });

  const entries = useMemo(() => {
    const pages = historyQuery.data?.pages;
    if (!Array.isArray(pages)) return [];
    return pages.flatMap((page) => (Array.isArray(page?.items) ? page.items : []));
  }, [historyQuery.data]);

  const filteredEntries = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase();
    return entries.filter((entry) => {
      if (!entry) return false;
      const createdAt = typeof entry.created_at === 'string' ? entry.created_at : '';
      const dateValue = createdAt.slice(0, 10);
      const matchesSearch =
        !normalizedQuery ||
        [formatDateForSearch(createdAt), entry.skin_type ?? ''].some((value) =>
          value.toLocaleLowerCase().includes(normalizedQuery)
        );
      const matchesStartDate = !filters.startDate || (dateValue && dateValue >= filters.startDate);
      const matchesEndDate = !filters.endDate || (dateValue && dateValue <= filters.endDate);
      const matchesSkinType =
        filters.skinTypes.length === 0 || filters.skinTypes.includes(entry.skin_type ?? '');
      const entryConditions = Array.isArray(entry.conditions) ? entry.conditions : [];
      const matchesConditions =
        filters.conditions.length === 0 ||
        filters.conditions.some((condition) => entryConditions.includes(condition));

      return (
        matchesSearch &&
        matchesStartDate &&
        matchesEndDate &&
        matchesSkinType &&
        matchesConditions
      );
    });
  }, [entries, filters, searchQuery]);

  const refresh = async () => {
    await historyQuery.refetch();
  };

  const retry = () => {
    void historyQuery.refetch();
  };

  const loadNextPage = () => {
    if (historyQuery.hasNextPage && !historyQuery.isFetchingNextPage) {
      void historyQuery.fetchNextPage();
    }
  };

  const applyFilters = (nextFilters: HistoryFilters) => {
    setFilters(nextFilters);
    setFilterSheetVisible(false);
  };

  const resetFilters = () => {
    setFilters(EMPTY_FILTERS);
    setFilterSheetVisible(false);
  };

  const deleteEntry = (id: string) => {
    deleteMutation.reset();
    deleteMutation.mutate(id);
  };

  return {
    entries,
    filteredEntries,
    searchQuery,
    filters,
    isFilterSheetVisible,
    selectedEntryId,
    isLoading: historyQuery.isLoading,
    isRefreshing: historyQuery.isRefetching && !historyQuery.isLoading,
    isFetchingNextPage: historyQuery.isFetchingNextPage,
    hasNextPage: Boolean(historyQuery.hasNextPage),
    error: historyQuery.error ? getErrorMessage(historyQuery.error) : null,
    deleteError: deleteMutation.error ? getErrorMessage(deleteMutation.error) : null,
    deletingEntryId: deleteMutation.isPending ? deleteMutation.variables : null,
    actions: {
      setSearchQuery,
      openFilters: () => setFilterSheetVisible(true),
      closeFilters: () => setFilterSheetVisible(false),
      applyFilters,
      resetFilters,
      openEntryActions: (id: string) => {
        deleteMutation.reset();
        setSelectedEntryId(id);
      },
      closeEntryActions: () => setSelectedEntryId(null),
      deleteEntry,
      retry,
      refresh,
      loadNextPage,
      openEntry: () => undefined,
    },
  };
}

export type HistoryViewModel = ReturnType<typeof useHistory>;
export type HistoryListItemData = HistoryEntry;
