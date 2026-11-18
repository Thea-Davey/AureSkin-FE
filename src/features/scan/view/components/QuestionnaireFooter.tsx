import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Button } from '@/shared/components/Button';

export interface QuestionnaireFooterProps {
  isFirst: boolean;
  isLast: boolean;
  canGoNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onCancel?: () => void;
}

/**
 * QuestionnaireFooter Component (Section 4.0 / Skin Analysis Questionnaire)
 * Fixed bottom bar with Previous, Next/Complete, and Cancel text buttons matching Image 4.
 * Both Previous and Next occupy equal width (50%/50%).
 * On Question 1, Previous is disabled.
 * On the last question, Next changes to "Complete".
 * Cancel button sits below with no stroke and no fill.
 */
export const QuestionnaireFooter: React.FC<QuestionnaireFooterProps> = ({
  isFirst,
  isLast,
  canGoNext,
  onPrevious,
  onNext,
  onCancel,
}) => {
  return (
    <View className="px-6 pb-8 pt-3 bg-transparent">
      {/* Row 1: Dual Buttons (Previous & Next) */}
      <View className="flex-row items-center gap-3">
        {/* Previous Button (Always present, disabled on Question 1) */}
        <View className="flex-1">
          <Button
            variant="white"
            size="lg"
            shape="rounded"
            fullWidth
            title="Previous"
            onPress={onPrevious}
            disabled={isFirst}
            className={isFirst ? 'opacity-40' : 'opacity-100'}
            textClassName="text-text font-sans-bold text-body"
            accessibilityLabel="Go to previous question"
          />
        </View>

        {/* Next / Complete Button */}
        <View className="flex-1">
          <Button
            variant="secondary"
            size="lg"
            shape="rounded"
            fullWidth
            title={isLast ? 'Complete' : 'Next'}
            onPress={onNext}
            disabled={!canGoNext}
            className={!canGoNext ? 'opacity-50' : 'opacity-100'}
            textClassName="text-neutral-white font-sans-bold text-body"
            accessibilityLabel={isLast ? 'Complete questionnaire and review answers' : 'Go to next question'}
          />
        </View>
      </View>

      {/* Row 2: Cancel text button (No stroke, no fill) */}
      {onCancel && (
        <Pressable
          onPress={onCancel}
          accessibilityRole="button"
          accessibilityLabel="Cancel questionnaire and return to setup"
          className="mt-3 py-2 items-center justify-center bg-transparent border-0 active:opacity-70"
        >
          <Text className="text-body font-sans-semibold text-neutral-white">
            Cancel
          </Text>
        </Pressable>
      )}
    </View>
  );
};

export default QuestionnaireFooter;

