import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { MoreHorizontal } from 'lucide-react-native';
import { theme } from '@/shared/theme';
import { RoutineSkinProfile } from '../../model/routine_types';

interface RoutineActiveSkinProfileCardProps {
  profile: RoutineSkinProfile | null;
  onOpenMenu: () => void;
}

export function RoutineActiveSkinProfileCard({
  profile,
  onOpenMenu,
}: RoutineActiveSkinProfileCardProps) {
  const analysisDate = profile?.analysis_date ?? 'May 1, 2026';
  const skinType = profile?.skin_type ?? 'Oily';
  const concerns = profile?.concerns && profile.concerns.length > 0
    ? profile.concerns
    : ['Redness', 'Inflammatory Acne', 'Blackheads'];

  return (
    <View className="rounded-card border border-neutral-border bg-card p-3.5 shadow-xs">
      {/* Top Row: Title, Date, and Three-Dots Action Button */}
      <View className="mb-3 flex-row items-center justify-between">
        <View className="flex-row items-baseline">
          <Text className="text-body-sm font-sans-bold text-text">Skin Profile</Text>
          <Text className="ml-2 text-caption font-sans text-muted">
            Last updated: {analysisDate}
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open routine options menu"
          onPress={onOpenMenu}
          hitSlop={10}
          className="p-1 active:opacity-70"
        >
          <MoreHorizontal size={20} color={theme.colors.text} />
        </Pressable>
      </View>

      {/* Bottom Row: Dual Split Pills (Same Height as Concerns Stretches) */}
      <View className="flex-row items-stretch gap-2.5">
        {/* Type Pill (matches Concerns height via items-stretch) */}
        <View className="flex-row items-stretch overflow-hidden rounded-badge border border-border/40 bg-neutral-white shadow-xs">
          <View className="bg-primary/10 px-3 py-2 items-center justify-center">
            <Text className="text-caption font-sans text-muted">Type</Text>
          </View>
          <View className="bg-neutral-white px-3.5 py-2 items-center justify-center">
            <Text className="text-caption font-sans-bold text-text">{skinType}</Text>
          </View>
        </View>

        {/* Concerns Pill (multi-line content stretches container) */}
        <View className="flex-1 flex-row items-stretch overflow-hidden rounded-badge border border-border/40 bg-neutral-white shadow-xs">
          <View className="bg-primary/10 px-3 py-2 items-center justify-center">
            <Text className="text-caption font-sans text-muted">Concerns</Text>
          </View>
          <View className="flex-1 bg-neutral-white px-3 py-1.5 justify-center">
            {concerns.map((concern, index) => (
              <Text
                key={`${concern}-${index}`}
                className="text-caption font-sans-bold text-text leading-4"
                numberOfLines={1}
              >
                {concern}
              </Text>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}
