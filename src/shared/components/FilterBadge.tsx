import React from 'react';
import { Pressable, Text } from 'react-native';
import { SlidersHorizontal } from 'lucide-react-native';
import { theme } from '../theme';

export interface FilterBadgeProps {
  count: number;
  onPress?: () => void;
  className?: string;
}

/**
 * FilterBadge
 * Shared AureSkin badge indicating that items were excluded/filtered by clinical rules.
 * Uses the concern color token (#FA8B89) and NativeWind presets.
 */
export function FilterBadge({
  count,
  onPress,
  className = '',
}: FilterBadgeProps) {
  if (count <= 0) return null;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Filtered ${count} ingredients, tap to view reasons`}
      className={`flex-row items-center gap-1 rounded-badge border border-concern/30 bg-concern/15 px-2.5 py-1 active:opacity-75 ${className}`}
    >
      <SlidersHorizontal size={12} color={theme.colors.concern} />
      <Text className="text-caption font-sans-bold text-concern">
        Filtered ({count})
      </Text>
    </Pressable>
  );
}

