import React from 'react';
import { View, Text } from 'react-native';
import { Flame } from 'lucide-react-native';
import { theme } from '../../../../shared/theme';
import { SkinConditionResult } from '../../model/scan_types';

interface ConditionDetailCardProps {
  condition: SkinConditionResult;
}

/**
 * ConditionDetailCard (Section 4.6).
 * Detailed dermatological card for a detected skin condition, featuring
 * a coral header strip with circular flame badge, clinical description,
 * associated symptoms, and root causes.
 */
export const ConditionDetailCard: React.FC<ConditionDetailCardProps> = ({
  condition,
}) => {
  return (
    <View className="rounded-card border border-border bg-card overflow-hidden mx-4 mb-4 shadow-xs">
      {/* Coral Condition Header Strip */}
      <View className="bg-status-error/25 border-b border-border px-4 py-2.5 flex-row items-center">
        {/* Flame Badge Icon */}
        <View className="w-9 h-9 rounded-full bg-status-error items-center justify-center mr-3 shadow-xs">
          <Flame size={20} color={theme.colors.white} aria-hidden={true} />
        </View>

        {/* Condition Display Name */}
        <Text className="text-text font-sans-bold text-body flex-1">
          {condition.display_name}
        </Text>

        {/* Confidence Percentage Badge */}
        {typeof condition.confidence === 'number' && (
          <View className="bg-card px-2 py-0.5 rounded-badge border border-border">
            <Text className="text-caption font-sans-semibold text-muted">
              {Math.round(condition.confidence)}%
            </Text>
          </View>
        )}
      </View>

      {/* Card Body Details */}
      <View className="p-4">
        {/* Clinical Description */}
        {condition.description ? (
          <Text className="text-body-sm font-sans text-text leading-5 mb-3">
            {condition.description}
          </Text>
        ) : null}

        {/* Symptoms Bullet */}
        {condition.symptoms ? (
          <Text className="text-body-sm font-sans text-text leading-5 mb-3">
            {condition.symptoms}
          </Text>
        ) : null}

        {/* Root Causes */}
        {condition.causes ? (
          <View className="mt-1 pt-2 border-t border-border/40">
            <Text className="text-body-sm font-sans-bold text-text">
              Causes:
            </Text>
            <Text className="text-body-sm font-sans text-muted leading-5 mt-1">
              {condition.causes}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
};
