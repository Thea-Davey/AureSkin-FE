import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useScanQuestionnaire } from '../../../viewmodel/useScanQuestionnaire';
import { QuestionnaireCard } from '../../components/QuestionnaireCard';
import { QuestionnaireFooter } from '../../components/QuestionnaireFooter';
import { FixedBackgroundPattern } from '@/shared/components';

/**
 * ScanQuestionnairePage Container (Section 4.0 / Skin Analysis Questionnaire)
 * Layout matching Image 4:
 * - Olive green primary background
 * - Top title header: "Skin Analysis Questionnaire"
 * - Centered QuestionnaireCard with radio choices and measures caption
 * - Fixed bottom navigation bar with Previous and Next/Complete buttons
 */
export const ScanQuestionnairePage: React.FC = () => {
  const {
    currentQuestion,
    selectedChoiceId,
    selectedChoiceIds,
    isFirst,
    isLast,
    canGoNext,
    selectChoice,
    handlePrevious,
    handleNext,
    handleBackToSetup,
  } = useScanQuestionnaire();

  return (
    <View className="flex-1 bg-primary relative">
      <FixedBackgroundPattern />

      {/* Top Title Header */}
      <View className="pt-16 pb-6 px-6 items-center">
        <Text className="text-h3 font-sans-bold text-neutral-white text-center">
          Skin Analysis Questionnaire
        </Text>
      </View>

      {/* Center Question Area */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          paddingBottom: 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        <QuestionnaireCard
          question={currentQuestion}
          selectedChoiceId={selectedChoiceId}
          selectedChoiceIds={selectedChoiceIds}
          onSelectChoice={selectChoice}
        />
      </ScrollView>

      {/* Fixed Bottom Navigation Footer */}
      <QuestionnaireFooter
        isFirst={isFirst}
        isLast={isLast}
        canGoNext={canGoNext}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onCancel={handleBackToSetup}
      />
    </View>
  );
};

export default ScanQuestionnairePage;
