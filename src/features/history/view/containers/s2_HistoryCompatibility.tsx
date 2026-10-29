import { theme } from '@/shared/theme';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { HistoryCompatibleIngredient, HistoryIncompatiblePair } from '../../model/history_types';
import { CompatibleIngredientItem } from '../components/CompatibleIngredientItem';
import { IncompatiblePairCard } from '../components/IncompatiblePairCard';

interface HistoryCompatibilityProps {
  compatibleIngredients: HistoryCompatibleIngredient[] | null;
  incompatiblePairs: HistoryIncompatiblePair[] | null;
  refreshError: string | null;
  isRefreshing: boolean;
  onRefresh: () => Promise<void>;
  onRetry: () => void;
}

function EmptySection({ message }: { message: string }) {
  return (
    <View className="px-4 py-5">
      <Text className="text-body-sm font-sans text-muted">{message}</Text>
    </View>
  );
}

export function S2HistoryCompatibility({
  compatibleIngredients,
  incompatiblePairs,
  refreshError,
  isRefreshing,
  onRefresh,
  onRetry,
}: HistoryCompatibilityProps) {
  const hasSavedCompatibility = compatibleIngredients !== null || incompatiblePairs !== null;

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
      {refreshError && (
        <View className="mb-4 rounded-card border border-status-error/30 bg-card p-4">
          <Text accessibilityRole="alert" className="mb-2 text-body-sm font-sans text-error">{refreshError}</Text>
          <Pressable onPress={onRetry} accessibilityRole="button" className="self-start py-1">
            <Text className="text-label font-sans-semibold text-primary">Retry</Text>
          </Pressable>
        </View>
      )}
      {!hasSavedCompatibility ? (
        <View className="rounded-card border border-border bg-card p-5">
          <Text className="mb-2 text-h3 font-sans-bold text-text">Compatibility unavailable</Text>
          <Text className="text-body-sm font-sans text-muted">
            No routine was active for this scan, so compatibility data is unavailable.
          </Text>
        </View>
      ) : (
        <>
          <View className="mb-5 overflow-hidden rounded-card border border-border bg-card">
            <View className="border-b border-border px-4 py-4">
              <Text className="text-h3 font-sans-bold text-text">Compatible Ingredients to Skin Type</Text>
            </View>
            {compatibleIngredients === null ? (
              <EmptySection message="Compatible ingredient data was not provided for this scan." />
            ) : compatibleIngredients.length > 0 ? (
              compatibleIngredients.map((ingredient, index) => (
                <CompatibleIngredientItem key={ingredient.id} ingredient={ingredient} index={index} />
              ))
            ) : (
              <EmptySection message="No compatible ingredients were recorded for this scan." />
            )}
          </View>

          <View>
            <Text className="mb-3 text-h3 font-sans-bold text-text">Incompatible Ingredients to mix</Text>
            {incompatiblePairs === null ? (
              <View className="rounded-card border border-border bg-card">
                <EmptySection message="Incompatible pair data was not provided for this scan." />
              </View>
            ) : incompatiblePairs.length > 0 ? (
              incompatiblePairs.map((pair) => <IncompatiblePairCard key={pair.id} pair={pair} />)
            ) : (
              <View className="rounded-card border border-border bg-card">
                <EmptySection message="No incompatible ingredient pairs were recorded for this scan." />
              </View>
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
}