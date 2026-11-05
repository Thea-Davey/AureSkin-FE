import React from 'react';
import { View, Text } from 'react-native';
import { Activity } from 'lucide-react-native';
import { CardGradientHeader } from './CardGradientHeader';
import { HealthGauge } from '@/shared/components/HealthGauge';
import { theme } from '@/shared/theme';

interface HealthScoreCardProps {
  healthScore: number;
  summary?: string;
}

interface ScoreTier {
  label: string;
  color: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
}

/**
 * HealthScoreCard (Container 2 in Section 4.6).
 * Redesigned with:
 * - Dynamic score tier gradient header
 * - Prominent Activity health pulse icon beside "Skin Health Score"
 * - Status tier pill badge
 * - Animated SVG HealthGauge (matching Home)
 * - Tightly balanced vertical spacing (eliminating large gaps)
 * - Structured "ANALYSIS INSIGHT" subtitle for improved visual hierarchy
 */
export const HealthScoreCard: React.FC<HealthScoreCardProps> = ({
  healthScore,
  summary,
}) => {
  const score = Math.max(0, Math.min(100, Math.round(healthScore || 0)));

  // Define score range mapping: Green (80-100), Yellow (60-79), Orange (40-59), Red (0-39)
  const getScoreTier = (val: number): ScoreTier => {
    if (val >= 80) {
      return {
        label: 'Optimal Balance',
        color: theme.colors.accent,
        badgeBg: 'bg-note-positive',
        badgeBorder: 'border-note-positive-border',
        badgeText: 'text-note-positive-title',
      };
    }
    if (val >= 60) {
      return {
        label: 'Moderate Balance',
        color: theme.colors.status.warning,
        badgeBg: 'bg-note-warning',
        badgeBorder: 'border-note-warning-border',
        badgeText: 'text-note-warning-title',
      };
    }
    if (val >= 40) {
      return {
        label: 'Needs Attention',
        color: theme.colors.note.warning.icon,
        badgeBg: 'bg-note-warning',
        badgeBorder: 'border-note-warning-border',
        badgeText: 'text-note-warning-title',
      };
    }
    return {
      label: 'Compromised Barrier',
      color: theme.colors.status.error,
      badgeBg: 'bg-note-negative',
      badgeBorder: 'border-note-negative-border',
      badgeText: 'text-note-negative-title',
    };
  };

  const tier = getScoreTier(score);

  return (
    <View className="mx-4 mt-4 rounded-card border border-border bg-card overflow-hidden shadow-xs">
      {/* Top Header Section: Gradient adjusts dynamically to expand up to the divider */}
      <View className="relative">
        <CardGradientHeader color={tier.color} height="100%" startOpacity={0.25} />

        {/* Header Row: Icon + Title + Status Badge (Left) & Animated Gauge (Right) */}
        <View className="px-4 pt-4 pb-3 flex-row items-center justify-between">
          <View className="flex-1 mr-3">
            <View className="flex-row items-center gap-2">
              <View
                style={{ backgroundColor: tier.color }}
                className="w-7 h-7 rounded-full items-center justify-center shrink-0"
              >
                <Activity size={15} color={theme.colors.white} strokeWidth={2.4} />
              </View>
              <Text className="text-h3 font-sans-bold text-text">
                Skin Health Score
              </Text>
            </View>

            <View
              className={`self-start mt-2 px-3 py-0.5 rounded-badge border ${tier.badgeBg} ${tier.badgeBorder}`}
            >
              <Text className={`text-caption font-sans-bold ${tier.badgeText}`}>
                {tier.label}
              </Text>
            </View>
          </View>

          {/* Aligned Right Score Ring using animated HealthGauge like from Home */}
          <HealthGauge
            percentage={score}
            size={64}
            strokeWidth={5.5}
            color={tier.color}
          />
        </View>
      </View>

      {/* Subtle Horizontal Divider */}
      <View className="border-b border-border/30 mx-4" />

      {/* Analysis Insight Body */}
      <View className="px-4 pt-3 pb-4">
        <Text className="text-caption font-sans-bold text-muted uppercase tracking-wider mb-1">
          Analysis Summary
        </Text>
        <Text className="text-body-sm font-sans text-text leading-5">
          {summary ||
            `Your skin health score of ${score}% reflects your current skin barrier stability and detected condition indicators.`}
        </Text>
      </View>
    </View>
  );
};

export default HealthScoreCard;

