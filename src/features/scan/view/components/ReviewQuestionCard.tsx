import React from 'react';
import { View, Text } from 'react-native';
import { Pencil } from 'lucide-react-native';
import { theme } from '@/shared/theme';
import { Card } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import { QuestionnaireQuestion, QuestionnaireAnswer } from '../../model/scan_types';

export interface ReviewQuestionCardProps {
  question: QuestionnaireQuestion;
  answer?: QuestionnaireAnswer;
  onEdit: (questionNumber: number) => void;
}

/**
 * ReviewQuestionCard Component (Section 4.0 / Review Answers)
 * Compact question card matching Image 5:
 * Row 1: Question [number] + Edit button
 * Row 2: Actual question text
 * Row 3: Answer text
 */
export const ReviewQuestionCard: React.FC<ReviewQuestionCardProps> = ({
  question,
  answer,
  onEdit,
}) => {
  const displayAnswer = answer?.selectedChoiceLabel || 'Comfortable and balanced';

  return (
    <Card className="p-4 bg-card rounded-card border border-border mb-3">
      {/* Row 1: Label + Edit button */}
      <View className="flex-row items-center justify-between">
        <Text className="text-body-sm font-sans-bold text-text">
          Question {question.questionNumber}
        </Text>

        <Button
          variant="outline"
          size="sm"
          shape="rounded"
          onPress={() => onEdit(question.questionNumber)}
          leftIcon={<Pencil size={12} color={theme.colors.muted} strokeWidth={2} />}
          title="Edit"
          className="py-1 px-3"
          textClassName="text-muted font-sans-medium text-caption"
          accessibilityLabel={`Edit question ${question.questionNumber}`}
        />
      </View>

      {/* Row 2: Actual Question */}
      <Text className="mt-1 text-caption font-sans text-muted">
        {question.question}
      </Text>

      {/* Row 3: Answer */}
      <View className="flex-row items-center mt-1.5 flex-wrap">
        <Text className="text-caption font-sans-medium text-secondary mr-1">
          Answer:
        </Text>
        <Text className="text-caption font-sans-bold text-text">
          {displayAnswer}
        </Text>
      </View>
    </Card>
  );
};

export default ReviewQuestionCard;

