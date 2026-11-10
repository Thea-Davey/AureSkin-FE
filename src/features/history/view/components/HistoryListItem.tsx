import React, { useState, useEffect } from 'react';
import { theme } from '@/shared/theme';
import { Card } from '@/shared/components/Card';
import { HealthGauge } from '@/shared/components/HealthGauge';
import { Image } from 'expo-image';
import { CalendarDays, MoreHorizontal, UserRound } from 'lucide-react-native';
import { Pressable, Text, View, Image as RNImage } from 'react-native';
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
    : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getScoreColor(val: number): string {
  if (val >= 80) return theme.colors.accent;
  if (val >= 60) return theme.colors.status.warning;
  return theme.colors.status.error;
}

export function HistoryListItem({ entry, onPress, onMorePress }: HistoryListItemProps) {
  const [useRNImage, setUseRNImage] = useState<boolean>(false);
  const [imageFailed, setImageFailed] = useState<boolean>(false);
  const healthScore = Math.max(0, Math.min(100, Math.round(entry.health_score)));
  const visibleConditions = entry.conditions.slice(0, 2);
  const extraConditionCount = Math.max(0, entry.conditions.length - visibleConditions.length);

  const cleanImageUrl = (entry.image_url || '').trim().replace(/\?$/, '');

  useEffect(() => {
    setUseRNImage(false);
    setImageFailed(false);
  }, [cleanImageUrl]);

  const handleExpoError = (err: any) => {
    console.warn('[HistoryListItem] expo-image error on:', cleanImageUrl, err);
    if (!useRNImage) {
      setUseRNImage(true);
      return;
    }
    setImageFailed(true);
  };

  const handleRNError = (err: any) => {
    console.warn('[HistoryListItem] RNImage error on:', cleanImageUrl, err);
    setImageFailed(true);
  };

  return (
    <Card
      style={2}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Skin analysis from ${formatDate(entry.created_at)}, ${healthScore}% healthy`}
      accessibilityHint="Opens this scan's results"
      className="mb-3 min-h-28 flex-row items-center p-3"
    >
      {/* ── COL 1: IMAGE ── */}
      <View className="h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-card bg-secondary/15">
        {cleanImageUrl && !imageFailed ? (
          !useRNImage ? (
            <Image
              key={`expo-${cleanImageUrl}`}
              source={{ uri: cleanImageUrl }}
              contentFit="cover"
              transition={150}
              style={{ width: '100%', height: '100%' }}
              onError={handleExpoError}
              accessibilityLabel="Scan photo"
            />
          ) : (
            <RNImage
              key={`rn-${cleanImageUrl}`}
              source={{ uri: cleanImageUrl }}
              resizeMode="cover"
              style={{ width: '100%', height: '100%' }}
              onError={handleRNError}
              accessibilityLabel="Scan photo"
            />
          )
        ) : (
          <UserRound size={32} color={theme.colors.muted} />
        )}
      </View>

      {/* ── COL 2: [ROW 1: date + health score + 3 dot menu] [ROW 2: skin type + skin condition/s] ── */}
      <View className="min-w-0 flex-1 self-stretch pl-3.5 justify-start py-0.5">
        {/* ROW 1: date + health score + 3 dot menu */}
        <View className="flex-row items-center justify-between">
          {/* Date with Calendar icon */}
          <View className="flex-row items-center gap-1.5 flex-1 min-w-0 pr-1.5">
            <CalendarDays size={14} color={theme.colors.muted} />
            <Text numberOfLines={1} className="text-body-sm font-sans-medium text-text">
              {formatDate(entry.created_at)}
            </Text>
          </View>

          {/* Health score + 3 dot menu */}
          <View className="flex-row items-center gap-1.5 shrink-0">
            <HealthGauge
              percentage={healthScore}
              size={22}
              strokeWidth={2}
              color={getScoreColor(healthScore)}
              showSublabel={false}
              duration={0}
            />

            <Pressable
              onPress={(event) => {
                event.stopPropagation?.();
                onMorePress();
              }}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="More actions for this scan"
              className="h-8 w-8 items-center justify-center -mr-1 active:opacity-60"
            >
              <MoreHorizontal size={20} color={theme.colors.muted} />
            </Pressable>
          </View>
        </View>

        {/* ROW 2: skin type + skin condition/s */}
        <View className="mt-2 flex-row flex-wrap items-center gap-1.5">
          {entry.skin_type ? (
            <View className="rounded-badge bg-secondary px-3 py-0.5">
              <Text className="text-caption font-sans-medium capitalize text-neutral-white">
                {entry.skin_type}
              </Text>
            </View>
          ) : null}

          {visibleConditions.map((condition) => (
            <View
              key={condition}
              style={{ backgroundColor: theme.colors.concern }}
              className="rounded-badge bg-concern px-3 py-0.5"
            >
              <Text className="text-caption font-sans-medium capitalize text-neutral-white">
                {condition}
              </Text>
            </View>
          ))}

          {extraConditionCount > 0 && (
            <Text className="text-caption font-sans-medium text-muted">
              +{extraConditionCount}
            </Text>
          )}

          {!entry.skin_type && entry.conditions.length === 0 && (
            <Text className="text-caption font-sans text-muted">No conditions detected</Text>
          )}
        </View>
      </View>
    </Card>
  );
}

export default HistoryListItem;
