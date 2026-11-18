import React from 'react';
import { View, Text } from 'react-native';
import { Activity } from 'lucide-react-native';
import { CardGradientHeader } from './CardGradientHeader';
import { Card, HealthGauge, HealthScoreBadge, getHealthScoreTier } from '@/shared/components';
import { theme } from '@/shared/theme';

interface HealthScoreCardProps {
  healthScore: number;
  summary?: string;
}

/**
 * HealthScoreCard (Container 2 in Section 4.6).
 * Features:
 * - Dynamic score tier gradient header
 * - Prominent Activity health pulse icon beside "Skin Health Score"
 * - Shared HealthScoreBadge
 * - Animated SVG HealthGauge (matching Home & History)
 * - Structured "ANALYSIS SUMMARY" section
 */
export const HealthScoreCard: React.FC<HealthScoreCardProps> = ({
  healthScore,
  summary,
}) => {
  const score = Math.max(0, Math.min(100, Math.round(healthScore || 0)));
  const tier = getHealthScoreTier(score);

  return (
    <Card style={2} className="mx-4 mt-4 overflow-hidden items-stretch">
      {/* Top Header Section: Gradient adjusts dynamically to expand up to the divider */}
      <View className="relative w-full">
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

            <HealthScoreBadge score={score} className="mt-2" />
          </View>

          {/* Aligned Right Score Ring using animated HealthGauge like from Home */}
          <HealthGauge
            percentage={score}
            size={64}
            strokeWidth={5.5}
            color={tier.color}
            showSublabel={false}
          />
        </View>
      </View>

      {/* Subtle Horizontal Divider */}
      <View className="border-b border-border/30 mx-4" />

      {/* Analysis Insight Body */}
      <View className="px-4 pt-3 pb-4 w-full">
        <Text className="text-caption font-sans-bold text-muted uppercase tracking-wider mb-1">
          Analysis Summary
        </Text>
        <Text className="text-body-sm font-sans text-text leading-5">
          {summary ||
            `Your skin health score of ${score}% reflects your current skin barrier stability and detected condition indicators.`}
        </Text>
      </View>
    </Card>
  );
};

export default HealthScoreCard;

