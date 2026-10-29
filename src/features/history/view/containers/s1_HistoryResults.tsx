import { theme } from '@/shared/theme';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { HistoryDetail } from '../../model/history_types';
import { HistoryAnalysisHero } from '../components/HistoryAnalysisHero';
import { HistoryConditionCard } from '../components/HistoryConditionCard';

interface HistoryResultsProps {
  detail: HistoryDetail;
  isRefreshing: boolean;
  onRefresh: () => Promise<void>;
}

export function S1HistoryResults({ detail, isRefreshing, onRefresh }: HistoryResultsProps) {
  return (
    <ScrollView
      className="flex-1 bg-neutral-offwhite"
      contentContainerClassName="px-4 pb-10 pt-4"
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          tintColor={theme.colors.primary}
          colors={[theme.colors.primary]}
        />
      }
    >
      <HistoryAnalysisHero
        imageUrl={detail.image_url}
        skinType={detail.skin_type}
        healthScore={detail.health_score}
      />

      {detail.summary && (
        <View className="mt-4 rounded-card border border-border bg-card p-4">
          <Text className="mb-1 text-h3 font-sans-bold text-text">Analysis summary</Text>
          <Text className="text-body-sm font-sans text-text">{detail.summary}</Text>
        </View>
      )}

      <View className="mt-5">
        <Text className="mb-3 text-h2 font-sans-bold text-text">Concern/s</Text>
        {detail.conditions.length > 0 ? (
          detail.conditions.map((condition) => (
            <HistoryConditionCard key={condition.id} condition={condition} />
          ))
        ) : (
          <View className="rounded-card border border-border bg-card p-4">
            <Text className="text-body-sm font-sans text-muted">No concerns detected in this scan.</Text>
          </View>
        )}
      </View>
    </ScrollView>
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