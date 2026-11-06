import React from 'react';
import { View, Text } from 'react-native';
import {
  Flame,
  ShieldAlert,
  AlertCircle,
  AlertTriangle,
  Sun,
  Activity,
  Disc,
  Grid,
  LucideIcon,
} from 'lucide-react-native';
import { theme } from '@/shared/theme';
import { Card } from '@/shared/components';
import { SkinConditionResult } from '@/features/scan/model/scan_types';

interface ConditionDetailCardProps {
  condition: SkinConditionResult;
}

const CONDITION_ICONS: Record<string, LucideIcon> = {
  redness: Flame,
  inflammatory_acne: AlertCircle,
  blackheads: AlertCircle,
  whiteheads: AlertCircle,
  dark_spots: Sun,
  pigmentation: Disc,
  pores: Grid,
  wrinkles: Activity,
};

/**
 * ConditionDetailCard (Section 4.6).
 * Detailed dermatological card for a single detected skin condition, featuring
 * a coral header strip with circular clinical badge, clinical description,
 * associated symptoms, and a distinct callout for root causes.
 */
export const ConditionDetailCard: React.FC<ConditionDetailCardProps> = ({
  condition,
}) => {
  const normName = (condition.name || '').toLowerCase().replace(/\s+/g, '_');
  const ConditionIcon = CONDITION_ICONS[normName] || ShieldAlert;

  const confidenceText =
    typeof condition.confidence === 'number'
      ? `${Math.round(condition.confidence)}%`
      : '90%';

  return (
    <Card style={2} className="overflow-hidden items-stretch">
      {/* Condition Banner Strip */}
      <View className="bg-status-concern border-b border-border/40 px-3.5 py-2.5 flex-row items-center justify-between">
        {/* General Clinical Badge Icon */}
        <View className="w-9 h-9 rounded-full bg-status-error items-center justify-center mr-2.5 shadow-xs shrink-0">
          <ConditionIcon size={19} color={theme.colors.white} aria-hidden={true} strokeWidth={2.3} />
        </View>

        {/* Condition Name */}
        <Text className="text-body font-sans-bold text-text flex-1">
          {condition.display_name || condition.name}
        </Text>

        {/* Right Aligned Score Pill */}
        <View className="bg-card px-3 py-1 rounded-badge border border-border/30 shadow-xs">
          <Text className="text-caption font-sans-bold text-status-error">
            {confidenceText}
          </Text>
        </View>
      </View>

      {/* Card Body Details */}
      <View className="p-4">
        {/* Clinical Description */}
        {condition.description ? (
          <Text className="text-body-sm font-sans text-text leading-5 mb-2.5">
            {condition.description}
          </Text>
        ) : null}

        {/* Observed Symptoms */}
        {condition.symptoms ? (
          <View className="mt-1">
            <Text className="text-caption font-sans-bold text-muted uppercase tracking-wider mb-1">
              OBSERVED SYMPTOMS
            </Text>
            <Text className="text-body-sm font-sans text-text leading-5">
              {condition.symptoms}
            </Text>
          </View>
        ) : null}

        {/* Primary Root Causes Callout */}
        {condition.causes ? (
          <View className="mt-3 rounded-button bg-note-warning/60 border border-note-warning-border/70 p-3">
            <View className="flex-row items-center gap-1.5 mb-1">
              <AlertTriangle size={14} color={theme.colors.note.warning.icon} strokeWidth={2.4} />
              <Text className="text-caption font-sans-bold text-note-warning-title uppercase tracking-wider">
                CAUSES
              </Text>
            </View>
            <Text className="text-body-sm font-sans text-text leading-5">
              {condition.causes}
            </Text>
          </View>
        ) : null}
      </View>
    </Card>
  );
};

export default ConditionDetailCard;

