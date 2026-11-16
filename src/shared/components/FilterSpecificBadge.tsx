import React from 'react';
import { View, Text } from 'react-native';
import { X } from 'lucide-react-native';
import { theme } from '../theme';

export type FilterSpecificType =
  | 'age'
  | 'pregnant'
  | 'pregnancy'
  | 'allergen'
  | 'allergies'
  | string;

export interface FilterSpecificBadgeProps {
  type: FilterSpecificType;
  className?: string;
}

function getBadgeLabel(type: FilterSpecificType): string {
  const normalized = type.toLowerCase();
  if (normalized === 'age') return 'Age';
  if (normalized === 'pregnant' || normalized === 'pregnancy') return 'Pregnant';
  if (normalized === 'allergen' || normalized === 'allergies') return 'Allergen';
  return type.charAt(0).toUpperCase() + type.slice(1);
}

/**
 * FilterSpecificBadge
 * Shared AureSkin pill badge indicating a specific clinical contraindication
 * ("✕ Age", "✕ Pregnant", "✕ Allergen").
 * Uses a cross symbol and concern color token (#FA8B89).
 */
export function FilterSpecificBadge({
  type,
  className = '',
}: FilterSpecificBadgeProps) {
  const label = getBadgeLabel(type);

  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={`Contraindicated by ${label}`}
      className={`flex-row items-center gap-1 rounded-badge border border-concern/30 bg-concern/15 px-2 py-0.5 ${className}`}
    >
      <X size={10} color={theme.colors.concern} strokeWidth={2.5} />
      <Text className="text-caption font-sans-bold text-concern">
        {label}
      </Text>
    </View>
  );
}

