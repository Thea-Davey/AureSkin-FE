import React from 'react';
import { View, Text } from 'react-native';
import { Card, HealthGauge, HealthScoreBadge, getHealthScoreColor } from '@/shared/components';
import { theme } from '@/shared/theme';

interface SkinOverviewCardProps {
  skinType?: string;
  conditions?: string[];
  healthScore?: number;
}

function formatSkinTypeTitle(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  const compact = trimmed.toLowerCase().replace(/[\s_-]+/g, '');
  if (compact === 'acneprone') return 'Acne-Prone';
  return trimmed
    .replace(/[_-]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function SkinOverviewCard({
  skinType = '',
  conditions = [],
  healthScore = 0,
}: SkinOverviewCardProps) {
  const formattedSkinType = formatSkinTypeTitle(skinType);
  const hasAnalysis = formattedSkinType.length > 0;

  return (
    <Card className="p-5 mb-4">
      {/* Header Row: Skin Overview Label + HealthScoreBadge */}
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-body font-sans-bold text-secondary">
          Skin Overview
        </Text>
        {hasAnalysis ? (
          <HealthScoreBadge score={healthScore} />
        ) : null}
      </View>

      <View className="flex-row items-start justify-between">
        {/* Left Column: Skin Type & Skin Conditions */}
        <View className="flex-1 mr-4">
          <Text className="text-caption font-sans-bold text-muted uppercase tracking-wider">
            SKIN TYPE
          </Text>
          {hasAnalysis ? (
            <Text className="text-h2 font-sans-bold text-text mt-0.5">
              {formattedSkinType}
            </Text>
          ) : (
            <Text className="text-body-sm font-sans text-muted mt-1">
              Not analyzed yet
            </Text>
          )}

          <Text className="text-caption font-sans-bold text-muted uppercase tracking-wider mt-3.5">
            SKIN CONDITION/S
          </Text>
          {conditions.length > 0 ? (
            <View className="flex-row flex-wrap gap-2 mt-1.5">
              {conditions.map((condition, idx) => (
                <View
                  key={`${condition}-${idx}`}
                  className="bg-concern px-3 py-1 rounded-badge self-start"
                >
                  <Text className="text-caption font-sans-bold text-neutral-white">
                    {condition}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text className="text-body-sm font-sans text-muted mt-1">
              {hasAnalysis ? 'No adverse conditions' : 'No scan recorded yet'}
            </Text>
          )}
        </View>

        {/* Right Column: Health Gauge (Top Aligned) */}
        <View className="items-center justify-start shrink-0 pt-0.5">
          <HealthGauge
            percentage={hasAnalysis ? healthScore : 0}
            size={84}
            strokeWidth={8}
            color={hasAnalysis ? getHealthScoreColor(healthScore) : theme.colors.muted}
            showSublabel={false}
          />
        </View>
      </View>
    </Card>
  );
}
