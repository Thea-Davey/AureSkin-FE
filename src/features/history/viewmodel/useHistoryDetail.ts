import { useQuery } from '@tanstack/react-query';
import { fetchHistoryDetail } from '../model/history_api';

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unable to load this scan. Please try again.';
}

export function useHistoryDetail(id: string) {
  const query = useQuery({
    queryKey: ['history', 'detail', id],
    queryFn: () => fetchHistoryDetail(id),
    enabled: Boolean(id),
  });

  return {
    detail: query.data ?? null,
    isLoading: query.isLoading,
    isRefreshing: query.isRefetching && !query.isLoading,
    error: query.error ? getErrorMessage(query.error) : null,
    refresh: async () => {
      await query.refetch();
    },
    retry: () => {
      void query.refetch();
    },
  };
}