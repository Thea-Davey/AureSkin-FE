import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Check } from 'lucide-react-native';
import { theme } from '@/shared/theme';
import { Card } from '@/shared/components/Card';
import { QuestionnaireChoice, QuestionnaireQuestion } from '../../model/scan_types';

export interface QuestionnaireCardProps {
  question: QuestionnaireQuestion;
  selectedChoiceId: string | null;
  selectedChoiceIds?: string[];
  onSelectChoice: (choice: QuestionnaireChoice) => void;
}

/**
 * QuestionnaireCard Component (Section 4.0 / Skin Analysis Questionnaire)
 * Renders the question card matching Image 4:
 * Row 1: "QUESTION [number]" in secondary terracotta font
 * Row 2: Actual question text
 * Row 3: "Select one answer" or "Select all that apply" + selectable radio or checkbox choices
 * Row 4: Below card text "Measures: ..."
 */
export const QuestionnaireCard: React.FC<QuestionnaireCardProps> = ({
  question,
  selectedChoiceId,
  selectedChoiceIds,
  onSelectChoice,
}) => {
  return (
    <View className="w-full">
      {/* Main Card */}
      <Card className="p-6 bg-card rounded-card shadow-sm mx-5">
        {/* Row 1: Label */}
        <Text className="text-secondary font-sans-bold text-label uppercase tracking-wider">
          QUESTION {question.questionNumber}
        </Text>

        {/* Row 2: Actual Question */}
        <Text className="mt-2 mb-4 text-h3 font-sans-semibold text-text">
          {question.question}
        </Text>

        {/* Row 3: Choices */}
        <View className="pt-1">
          <Text className="text-caption font-sans text-muted mb-3">
            {question.isMultiSelect ? 'Select all that apply' : 'Select one answer'}
          </Text>

          <View className="gap-3">
            {question.choices.map((choice) => {
              const isSelected = question.isMultiSelect
                ? Boolean(
                    selectedChoiceIds?.includes(choice.id) ||
                      selectedChoiceId?.split(',').includes(choice.id)
                  )
                : selectedChoiceId === choice.id;

              return (
                <Pressable
                  key={choice.id}
                  onPress={() => onSelectChoice(choice)}
                  accessibilityRole={question.isMultiSelect ? 'checkbox' : 'radio'}
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={choice.label}
                  className="flex-row items-center py-1 active:opacity-75"
                >
                  {question.isMultiSelect ? (
                    /* Checkbox Indicator */
                    <View
                      className={`w-5 h-5 rounded-sm border-2 items-center justify-center mr-3 ${
                        isSelected ? 'border-secondary bg-secondary' : 'border-muted'
                      }`}
                    >
                      {isSelected && (
                        <Check size={13} color={theme.colors.card} strokeWidth={3} />
                      )}
                    </View>
                  ) : (
                    /* Radio Indicator */
                    <View
                      className={`w-5 h-5 rounded-full border-2 items-center justify-center mr-3 ${
                        isSelected ? 'border-secondary' : 'border-muted'
                      }`}
                    >
                      {isSelected && (
                        <View className="w-2.5 h-2.5 rounded-full bg-secondary" />
                      )}
                    </View>
                  )}

                  {/* Choice Label */}
                  <Text className="flex-1 text-body-sm font-sans text-text">
                    {choice.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </Card>

      {/* Row 4: Measures text below card */}
      {Boolean(question.measures) && (
        <View className="px-6 mt-4">
          <Text className="text-caption font-sans text-neutral-white/90">
            {question.measures}
          </Text>
        </View>
      )}
    </View>
  );
};

export default QuestionnaireCard;

