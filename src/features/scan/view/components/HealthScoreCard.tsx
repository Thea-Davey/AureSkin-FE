import React from 'react';
import { View, Text } from 'react-native';
import { Activity } from 'lucide-react-native';
import { theme } from '../../../../shared/theme';

interface HealthScoreCardProps {
  healthScore: number;
  summary?: string;
}

/**
 * HealthScoreCard (Section 4.6).
 * Metric card displaying the 0-100 heuristic skin health score calculated by
 * the ML backend, complete with a visual score indicator and clinical summary.
 */
export const HealthScoreCard: React.FC<HealthScoreCardProps> = ({
  healthScore,
  summary,
}) => {
  const score = Math.max(0, Math.min(100, Math.round(healthScore || 0)));

  const getStatusLabel = (val: number) => {
    if (val >= 80) return 'Optimal Balance';
    if (val >= 60) return 'Moderate Balance';
    return 'Attention Recommended';
  };

  return (
    <View className="bg-card rounded-card border border-border p-4 mx-4 mt-4 shadow-xs">
      <View className="flex-row items-center justify-between">
        {/* Left Information */}
        <View className="flex-1 mr-4">
          <View className="flex-row items-center">
            <Activity size={18} color={theme.colors.accent} aria-hidden={true} />
            <Text className="ml-1.5 text-body font-sans-bold text-text">
              Skin Health Score
            </Text>
          </View>

          <View className="bg-accent/15 px-2.5 py-0.5 rounded-badge self-start mt-2">
            <Text className="text-accent font-sans-bold text-caption">
              {getStatusLabel(score)}
            </Text>
          </View>

          {summary ? (
            <Text className="text-body-sm font-sans text-muted mt-2.5 leading-5">
              {summary}
            </Text>
          ) : null}
        </View>

        {/* Right Circular Gauge Widget */}
        <View className="w-24 h-24 rounded-full border-4 border-accent items-center justify-center bg-background shadow-xs">
          <Text className="text-h2 font-sans-bold text-text">
            {score}%
          </Text>
          <Text className="text-caption font-sans-medium text-muted">
            SCORE
          </Text>
        </View>
      </View>
    </View>
  );
};
