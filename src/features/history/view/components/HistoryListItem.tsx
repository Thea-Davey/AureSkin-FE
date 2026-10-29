import { theme } from '@/shared/theme';
import { Image } from 'expo-image';
import { CalendarDays, MoreHorizontal, UserRound } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { HistoryEntry } from '../../model/history_types';

interface HistoryListItemProps {
  entry: HistoryEntry;
  onPress: () => void;
  onMorePress: () => void;
}

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Date unavailable'
    : date.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function HistoryListItem({ entry, onPress, onMorePress }: HistoryListItemProps) {
  const healthScore = Math.max(0, Math.min(100, Math.round(entry.health_score)));
  const visibleConditions = entry.conditions.slice(0, 2);
  const extraConditionCount = Math.max(0, entry.conditions.length - visibleConditions.length);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Skin analysis from ${formatDate(entry.created_at)}, ${healthScore}% healthy`}
      accessibilityHint="Opens this scan's results"
      className="mb-3 flex-row items-center rounded-card border border-border bg-card p-3 active:opacity-80"
    >
      <View className="h-20 w-20 overflow-hidden rounded-input bg-neutral-offwhite items-center justify-center">
        {entry.image_url ? (
          <Image
            source={{ uri: entry.image_url }}
            contentFit="cover"
            transition={150}
            accessibilityLabel="Scan photo"
            className="h-full w-full"
          />
        ) : (
          <UserRound size={30} color={theme.colors.muted} />
        )}
      </View>

      <View className="ml-3 flex-1">
        <View className="mb-2 flex-row items-center gap-1">
          <View className="mr-1 min-w-0 flex-1 flex-row items-center">
            <CalendarDays size={14} color={theme.colors.muted} />
            <Text numberOfLines={1} className="ml-1.5 flex-1 text-body-sm font-sans-semibold text-text">
              {formatDate(entry.created_at)}
            </Text>
          </View>
          <View className="rounded-badge bg-status-success/15 px-2 py-1">
            <Text className="text-caption font-sans-bold text-primary">{healthScore}% Healthy</Text>
          </View>
          <Pressable
            onPress={(event) => {
              event.stopPropagation();
              onMorePress();
            }}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="More actions for this scan"
            className="h-8 w-8 items-center justify-center"
          >
            <MoreHorizontal size={20} color={theme.colors.muted} />
          </Pressable>
        </View>

        <View className="mb-2 flex-row flex-wrap items-center gap-1.5">
          <View className="rounded-badge bg-secondary/25 px-2 py-1">
            <Text className="text-caption font-sans-medium text-text">
              {entry.skin_type ?? 'Skin type unavailable'}
            </Text>
          </View>
          {visibleConditions.map((condition) => (
            <View key={condition} className="rounded-badge bg-accent/15 px-2 py-1">
              <Text className="text-caption font-sans-medium text-text">{condition}</Text>
            </View>
          ))}
          {extraConditionCount > 0 && (
            <Text className="text-caption font-sans-medium text-muted">+{extraConditionCount}</Text>
          )}
          {entry.conditions.length === 0 && (
            <Text className="text-caption font-sans text-muted">No conditions detected</Text>
          )}
        </View>
      </View>

    </Pressable>
  );
}