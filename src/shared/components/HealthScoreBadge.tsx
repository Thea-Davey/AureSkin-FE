import React from 'react';
import { View, Text } from 'react-native';
import { theme } from '../theme';

export type HealthScoreTierKey = 'optimal' | 'moderate' | 'attention' | 'compromised';

export interface HealthScoreTier {
  key: HealthScoreTierKey;
  label: 'Optimal Balance' | 'Moderate Balance' | 'Needs Attention' | 'Compromised Barrier';
  color: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
}

/**
 * Score range mapping:
 * - Green (80-100): Optimal Balance
 * - Yellow (60-79): Moderate Balance
 * - Orange (40-59): Needs Attention
 * - Red (0-39): Compromised Barrier
 */
export function getHealthScoreTier(score: number): HealthScoreTier {
  const val = Math.max(0, Math.min(100, Math.round(isNaN(score) ? 0 : score)));

  if (val >= 80) {
    return {
      key: 'optimal',
      label: 'Optimal Balance',
      color: theme.colors.healthScore.optimal,
      badgeBg: 'bg-note-positive',
      badgeBorder: 'border-note-positive-border',
      badgeText: 'text-note-positive-title',
    };
  }
  if (val >= 60) {
    return {
      key: 'moderate',
      label: 'Moderate Balance',
      color: theme.colors.healthScore.moderate,
      badgeBg: 'bg-note-warning',
      badgeBorder: 'border-note-warning-border',
      badgeText: 'text-note-warning-title',
    };
  }
  if (val >= 40) {
    return {
      key: 'attention',
      label: 'Needs Attention',
      color: theme.colors.healthScore.attention,
      badgeBg: 'bg-note-warning',
      badgeBorder: 'border-note-warning-border',
      badgeText: 'text-note-warning-title',
    };
  }
  return {
    key: 'compromised',
    label: 'Compromised Barrier',
    color: theme.colors.healthScore.compromised,
    badgeBg: 'bg-note-negative',
    badgeBorder: 'border-note-negative-border',
    badgeText: 'text-note-negative-title',
  };
}

export function getHealthScoreColor(score: number): string {
  return getHealthScoreTier(score).color;
}

export interface HealthScoreBadgeProps {
  score: number;
  className?: string;
  textClassName?: string;
}

/**
 * HealthScoreBadge
 * Global shared badge indicating the health score tier:
 * - Optimal Balance (80-100, Green)
 * - Moderate Balance (60-79, Yellow)
 * - Needs Attention (40-59, Orange)
 * - Compromised Barrier (0-39, Red)
 */
export function HealthScoreBadge({
  score,
  className = '',
  textClassName = '',
}: HealthScoreBadgeProps) {
  const tier = getHealthScoreTier(score);

  return (
    <View
      className={`self-start px-3 py-0.5 rounded-badge border ${tier.badgeBg} ${tier.badgeBorder} ${className}`}
      accessibilityRole="text"
      accessibilityLabel={`Skin health status: ${tier.label}`}
    >
      <Text className={`text-caption font-sans-bold ${tier.badgeText} ${textClassName}`}>
        {tier.label}
      </Text>
    </View>
  );
}

export default HealthScoreBadge;

