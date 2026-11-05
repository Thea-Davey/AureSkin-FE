import { theme } from '@/shared/theme';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { S2ResultsTab } from '@/shared/pages/scan_results/containers/s2_ResultsTab';
import { HistoryDetail } from '../../model/history_types';
import { historyDetailToScanResult } from '../../model/history_adapter';

interface HistoryResultsProps {
  detail: HistoryDetail;
  isRefreshing: boolean;
  onRefresh: () => Promise<void>;
}

export function S1HistoryResults({ detail, isRefreshing, onRefresh }: HistoryResultsProps) {
  const scanResult = historyDetailToScanResult(detail);

  return (
    <S2ResultsTab
      scanResult={scanResult}
      imageUri={detail.image_url || ''}
      isRefreshing={isRefreshing}
      onRefresh={onRefresh}
    />
  );
}

interface HistoryDetailStatusProps {
  isLoading?: boolean;
  error?: string | null;
  onRetry: () => void;
  onBack: () => void;
}

export function HistoryDetailStatus({ isLoading, error, onRetry, onBack }: HistoryDetailStatusProps) {
  return (
    <View className="flex-1 items-center justify-center bg-neutral-offwhite px-8">
      {isLoading ? (
        <>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text className="mt-4 text-body-sm font-sans text-muted">Loading scan results...</Text>
        </>
      ) : (
        <>
          <Text accessibilityRole="alert" className="mb-4 text-center text-body-sm font-sans text-error">
            {error ?? 'This scan could not be found.'}
          </Text>
          <View className="w-full flex-row gap-3">
            <Pressable onPress={onBack} accessibilityRole="button" className="flex-1 items-center rounded-button border border-border px-4 py-3 active:opacity-75">
              <Text className="text-label font-sans-semibold text-text">History</Text>
            </Pressable>
            {error && (
              <Pressable onPress={onRetry} accessibilityRole="button" className="flex-1 items-center rounded-button bg-primary px-4 py-3 active:opacity-80">
                <Text className="text-label font-sans-bold text-neutral-white">Retry</Text>
              </Pressable>
            )}
          </View>
        </>
      )}
    </View>
  );
}

export default S1HistoryResults;
