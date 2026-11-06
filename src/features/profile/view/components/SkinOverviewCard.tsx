import React from 'react';
import { View, Text } from 'react-native';
import { Card } from '../../../../shared/components/Card';
import { HealthGauge } from '../../../../shared/components/HealthGauge';
import { theme } from '../../../../shared/theme';

interface SkinOverviewCardProps {
  skinType?: string;
  conditions?: string[];
  healthScore?: number;
}

export function SkinOverviewCard({
  skinType = 'Oily',
  conditions = ['Skin Condition'],
  healthScore = 89,
}: SkinOverviewCardProps) {
  return (
    <Card className="p-5 mb-4">
      <Text className="text-body font-sans-bold text-secondary mb-3">
        Skin Overview
      </Text>

      <View className="flex-row items-center justify-between">
        {/* Left Column: Skin Type & Skin Conditions */}
        <View className="flex-1 mr-4">
          <Text className="text-caption font-sans-bold text-muted uppercase tracking-wider">
            SKIN TYPE
          </Text>
          <Text className="text-h2 font-sans-bold text-text mt-0.5">
            {skinType}
          </Text>

          <Text className="text-caption font-sans-bold text-muted uppercase tracking-wider mt-3.5">
            SKIN CONDITION/S
          </Text>
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
        </View>

        {/* Right Column: Health Gauge */}
        <View className="items-center justify-start shrink-0">
          <HealthGauge
            percentage={healthScore}
            size={84}
            strokeWidth={8}
            color={theme.colors.accent}
            showSublabel={true}
            sublabel="Healthy"
          />
        </View>
      </View>
    </Card>
  );
}
