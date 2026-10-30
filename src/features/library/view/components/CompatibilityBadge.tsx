import React from 'react';
import { View, Text } from 'react-native';
import { BadgeCheck } from 'lucide-react-native';
import { theme } from '@/shared/theme';
import type { IngredientCompatibilityStatus } from '../../model/library_types';

interface CompatibilityBadgeProps {
  status: IngredientCompatibilityStatus;
  isLoading?: boolean;
  compact?: boolean;
}

export function CompatibilityBadge({
  status,
  isLoading,
  compact = false,
}: CompatibilityBadgeProps) {
  // Only "Compatible" status is visible. Hidden for not_listed, scan_needed, unavailable, or loading.
  if (isLoading || status !== 'compatible') {
    return null;
  }

  if (compact) {
    return (
      <View
        accessibilityRole="text"
        accessibilityLabel="Compatible with your latest skin analysis"
        className="h-6 w-6 items-center justify-center rounded-full bg-status-success"
      >
        <BadgeCheck size={14} color={theme.colors.white} strokeWidth={2.2} />
      </View>
    );
  }

  return (
    <View
      accessibilityRole="text"
      accessibilityLabel="Compatible with your latest skin analysis"
      className="flex-row items-center gap-1 rounded-badge bg-status-success px-2.5 py-1.5"
    >
      <BadgeCheck size={14} color={theme.colors.white} strokeWidth={2.2} />
      <Text className="text-caption font-sans-semibold text-neutral-white">
        Compatible
      </Text>
    </View>
  );
}
