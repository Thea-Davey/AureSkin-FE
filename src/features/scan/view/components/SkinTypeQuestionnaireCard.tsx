import React from 'react';
import { Image, ImageSourcePropType, View, Text } from 'react-native';
import { CheckCircle2 } from 'lucide-react-native';
import { theme } from '@/shared/theme';
import { Card } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';

const QUESTIONNAIRE_ICON: ImageSourcePropType = require('../../../../../assets/images/questionnaire.png');
const QUESTIONNAIRE_COMPLETE_ICON: ImageSourcePropType = require('../../../../../assets/images/questionnaire-complete.png');

export interface SkinTypeQuestionnaireCardProps {
  isCompleted: boolean;
  onAnswer: () => void;
  onRetake: () => void;
  onReview: () => void;
}

/**
 * SkinTypeQuestionnaireCard Component (Section 4.0 / Set Up Your Skin Analysis)
 * Row 1: Label
 * Row 2: Dynamic icon + Dynamic title & description
 * Row 3: Hidden dynamic complete note ("Completed" with checkmark)
 * Row 4: Dynamic button (Answer Questionnaire vs. Retake + Review Answers)
 */
export const SkinTypeQuestionnaireCard: React.FC<SkinTypeQuestionnaireCardProps> = ({
  isCompleted,
  onAnswer,
  onRetake,
  onReview,
}) => {
  return (
    <Card className="p-4 bg-card mb-3">
      {/* Row 1: Label */}
      <Text className="text-caption font-sans-medium text-muted mb-2">
        Skin Type Questionnaire
      </Text>

      {/* Row 2: Symbol + Title & Description */}
      <View className="flex-row items-center gap-3">
        <View className="w-12 h-12 rounded-input bg-neutral-offwhite items-center justify-center">
          <Image
            source={isCompleted ? QUESTIONNAIRE_COMPLETE_ICON : QUESTIONNAIRE_ICON}
            style={{ width: 34, height: 34 }}
            resizeMode="contain"
          />
        </View>

        <View className="flex-1">
          <Text className="text-body font-sans-bold text-text">
            {isCompleted ? '10 of 10 questions answered' : '10 questions'}
          </Text>
          <Text className="mt-0.5 text-caption font-sans text-muted">
            {isCompleted
              ? 'Your responses will be included in your skin analysis.'
              : 'Answer a few questions about how your skin feels and behaves to complement your facial scan.'}
          </Text>
        </View>
      </View>

      {/* Row 3: Hidden dynamic complete note */}
      {isCompleted && (
        <View className="flex-row items-center gap-1.5 mt-2.5">
          <CheckCircle2 size={15} color={theme.colors.accent} strokeWidth={2.2} />
          <Text className="text-caption font-sans-semibold text-accent">
            Completed
          </Text>
        </View>
      )}

      {/* Row 4: Action Buttons */}
      <View className="mt-4">
        {isCompleted ? (
          <View className="flex-row items-center gap-3">
            <Button
              variant="outline"
              size="md"
              shape="rounded"
              title="RETAKE"
              onPress={onRetake}
              className="flex-1"
              textClassName="text-muted font-sans-bold text-caption"
              accessibilityLabel="Retake skin questionnaire"
            />
            <Button
              variant="secondary"
              size="md"
              shape="rounded"
              title="REVIEW ANSWERS"
              onPress={onReview}
              className="flex-1"
              textClassName="text-neutral-white font-sans-bold text-caption"
              accessibilityLabel="Review questionnaire answers"
            />
          </View>
        ) : (
          <Button
            variant="secondary"
            size="md"
            shape="rounded"
            fullWidth
            title="ANSWER QUESTIONNAIRE"
            onPress={onAnswer}
            textClassName="text-neutral-white font-sans-bold text-caption"
            accessibilityLabel="Answer skin questionnaire"
          />
        )}
      </View>
    </Card>
  );
};

export default SkinTypeQuestionnaireCard;

