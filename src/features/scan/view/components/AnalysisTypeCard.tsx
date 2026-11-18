import React from 'react';
import { View, Text, Switch } from 'react-native';
import { CheckCircle2, Scan } from 'lucide-react-native';
import { theme } from '@/shared/theme';
import { Card } from '@/shared/components/Card';

export interface AnalysisTypeCardProps {
  enabled: boolean;
  onToggle: () => void;
}

/**
 * AnalysisTypeCard Component (Section 4.0 / Set Up Your Skin Analysis)
 * Row 1: Label
 * Row 2: Title & description + Switch toggle
 * Row 3: Dynamic footer note (Scan + Questionnaire vs Facial scan only)
 */
export const AnalysisTypeCard: React.FC<AnalysisTypeCardProps> = ({
  enabled,
  onToggle,
}) => {
  return (
    <Card className="p-4 bg-card mb-3">
      {/* Row 1: Label */}
      <Text className="text-caption font-sans-medium text-muted mb-2">
        Analysis Type
      </Text>

      {/* Row 2: Title & Toggle (Top aligned on the same row) */}
      <View className="flex-row items-center justify-between">
        <Text className="flex-1 mr-3 text-body font-sans-bold text-text">
          Enable Enhanced Skin Analysis
        </Text>

        <Switch
          value={enabled}
          onValueChange={onToggle}
          trackColor={{
            false: theme.colors.border,
            true: theme.colors.secondary,
          }}
          thumbColor={theme.colors.card}
          accessibilityLabel="Enable enhanced skin analysis"
        />
      </View>

      {/* Description below title & toggle */}
      <Text className="mt-1 text-caption font-sans text-muted">
        Include a short skin questionnaire alongside your facial scan for a more
        personalized skin-type assessment.
      </Text>

      {/* Row 3: Dynamic Footer Note */}
      <View className="mt-4 flex-row items-center gap-1.5 pt-3 border-t border-border">
        {enabled ? (
          <>
            <CheckCircle2 size={16} color={theme.colors.accent} strokeWidth={2.2} />
            <Text className="text-caption font-sans text-muted">
              Facial scan + skin type questionnaire
            </Text>
          </>
        ) : (
          <>
            <Scan size={16} color={theme.colors.muted} strokeWidth={2} />
            <Text className="text-caption font-sans text-muted">
              Facial scan only
            </Text>
          </>
        )}
      </View>
    </Card>
  );
};

export default AnalysisTypeCard;

