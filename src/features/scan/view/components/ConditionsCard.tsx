import React from 'react';
import { View, Text } from 'react-native';
import {
  ShieldAlert,
  AlertCircle,
  AlertTriangle,
  Sun,
  Activity,
  Disc,
  Grid,
  CheckCircle2,
  LucideIcon,
} from 'lucide-react-native';
import { CardGradientHeader } from './CardGradientHeader';
import { SkinConditionResult } from '../../model/scan_types';
import { theme } from '../../../../shared/theme';

interface ConditionsCardProps {
  conditions: SkinConditionResult[];
}

/**
 * General clinical condition icon mapping with medical ShieldAlert as fallback.
 * Replaces the specific Flame icon with universal dermatological indicators.
 */
const CONDITION_ICONS: Record<string, LucideIcon> = {
  redness: ShieldAlert,
  inflammatory_acne: AlertCircle,
  blackheads: AlertCircle,
  whiteheads: AlertCircle,
  dark_spots: Sun,
  pigmentation: Disc,
  pores: Grid,
  wrinkles: Activity,
};

/**
 * ConditionsCard (Container 4 in Section 4.6).
 * Redesigned with:
 * - High-contrast "IDENTIFIED CONCERNS" header with count tag
 * - General clinical condition icons (replacing Flame)
 * - Clear visual hierarchy between description, observed symptoms, and root causes
 * - Dedicated styled callout box for "PRIMARY ROOT CAUSES"
 * - Reassurance banner if no active conditions are detected
 */
export const ConditionsCard: React.FC<ConditionsCardProps> = ({ conditions }) => {
  const hasConditions = conditions && conditions.length > 0;

  return (
    <View className="mx-4 mt-4 rounded-card border border-border bg-card overflow-hidden shadow-xs">
      {/* Red Color Token Gradient Header */}
      <CardGradientHeader color={theme.colors.error} height={46} startOpacity={0.2} />

      {/* Top Header Label: High-contrast & informative */}
      <View className="px-4 pt-4 pb-3 flex-row items-center justify-between">
        <View className="flex-row items-center gap-1.5">
          <View className="w-2 h-2 rounded-full bg-status-error" />
          <Text className="text-caption font-sans-bold text-status-error uppercase tracking-wider">
            Skin Condition
          </Text>
        </View>

        {hasConditions && (
          <View className="px-2.5 py-0.5 rounded-badge bg-status-error/15 border border-status-error/30">
            <Text className="text-caption font-sans-bold text-status-error">
              {conditions.length} {conditions.length === 1 ? 'Concern' : 'Concerns'}
            </Text>
          </View>
        )}
      </View>

      {hasConditions ? (
        conditions.map((condition, index) => {
          const normName = (condition.name || '').toLowerCase().replace(/\s+/g, '_');
          const ConditionIcon = CONDITION_ICONS[normName] || ShieldAlert;

          const confidenceText =
            typeof condition.confidence === 'number'
              ? `${Math.round(condition.confidence)}%`
              : '90%';

          return (
            <View
              key={condition.id || index}
              className={index > 0 ? 'border-t border-border/40' : ''}
            >
              {/* Condition Banner Strip */}
              <View className="bg-concern border-y border-border/40 px-3.5 py-2.5 flex-row items-center justify-between">
                {/* General Clinical Badge Icon */}
                <View className="w-9 h-9 rounded-full bg-status-error items-center justify-center mr-2.5 shadow-xs shrink-0">
                  <ConditionIcon size={19} color={theme.colors.white} aria-hidden={true} strokeWidth={2.3} />
                </View>

                {/* Condition Name */}
                <Text className="text-body font-sans-bold text-white font-bold flex-1">
                  {condition.display_name || condition.name}
                </Text>

                {/* Right Aligned Score Pill */}
                <View className="bg-card px-3 py-1 rounded-badge border border-border/30 shadow-xs">
                  <Text className="text-caption font-sans-bold text-status-error">
                    {confidenceText}
                  </Text>
                </View>
              </View>

              {/* Condition Body Details with Varied Typography & Visual Structure */}
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
                      SYMPTOMS
                    </Text>
                    <Text className="text-body-sm font-sans text-text leading-5">
                      {condition.symptoms}
                    </Text>
                  </View>
                ) : null}

                {/* Primary Causes Callout Box */}
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
            </View>
          );
        })
      ) : (
        <View className="p-5 flex-row items-center gap-3">
          <View className="w-8 h-8 rounded-full bg-note-positive items-center justify-center shrink-0">
            <CheckCircle2 size={18} color={theme.colors.note.positive.icon} />
          </View>
          <Text className="text-body-sm font-sans text-text flex-1 leading-5">
            No active skin conditions detected. Your skin barrier appears healthy and balanced.
          </Text>
        </View>
      )}
    </View>
  );
};

export default ConditionsCard;
