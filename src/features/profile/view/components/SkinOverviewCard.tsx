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
  skinType = '',
  conditions = [],
  healthScore = 0,
}: SkinOverviewCardProps) {
  const hasAnalysis = Boolean(skinType && skinType.trim().length > 0);

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
          {hasAnalysis ? (
            <Text className="text-h2 font-sans-bold text-text mt-0.5">
              {skinType}
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
                  style={{ backgroundColor: theme.colors.concern }}
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

        {/* Right Column: Health Gauge */}
        <View className="items-center justify-start shrink-0">
          <HealthGauge
            percentage={hasAnalysis ? healthScore : 0}
            size={84}
            strokeWidth={8}
            color={hasAnalysis ? theme.colors.accent : theme.colors.muted}
            showSublabel={true}
            sublabel={hasAnalysis ? 'Healthy' : 'No Scan'}
          />
        </View>
      </View>
    </Card>
  );
}
