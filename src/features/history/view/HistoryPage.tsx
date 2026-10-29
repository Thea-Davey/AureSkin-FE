import { theme } from '@/shared/theme';
import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useHistory } from '../viewmodel/useHistory';
import { S1HistoryList } from './containers/s1_HistoryList';

export function HistoryPage() {
  const router = useRouter();
  const history = useHistory();

  return (
    <View className="flex-1 bg-neutral-offwhite">
      <StatusBar style="light" backgroundColor={theme.colors.primary} />
      <S1HistoryList
        entries={history.entries}
        filteredEntries={history.filteredEntries}
        searchQuery={history.searchQuery}
        filters={history.filters}
        isLoading={history.isLoading}
        isRefreshing={history.isRefreshing}
        isFetchingNextPage={history.isFetchingNextPage}
        hasNextPage={history.hasNextPage}
        isFilterSheetVisible={history.isFilterSheetVisible}
        selectedEntryId={history.selectedEntryId}
        deletingEntryId={history.deletingEntryId}
        error={history.error}
        deleteError={history.deleteError}
        onSearchChange={history.actions.setSearchQuery}
        onOpenFilters={history.actions.openFilters}
        onCloseFilters={history.actions.closeFilters}
        onApplyFilters={history.actions.applyFilters}
        onResetFilters={history.actions.resetFilters}
        onOpenEntryActions={history.actions.openEntryActions}
        onCloseEntryActions={history.actions.closeEntryActions}
        onDeleteEntry={history.actions.deleteEntry}
        onRetry={history.actions.retry}
        onRefresh={history.actions.refresh}
        onLoadNextPage={history.actions.loadNextPage}
        onOpenEntry={(id) => router.push({ pathname: '/history/[id]', params: { id } })}
        onStartScan={() => router.push('/(tabs)/scan')}
      />
    </View>
  );
}

export default HistoryPage;