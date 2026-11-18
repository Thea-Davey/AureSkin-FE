import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useScanReviewAnswers } from '../../../viewmodel/useScanReviewAnswers';
import { ReviewQuestionCard } from '../../components/ReviewQuestionCard';
import { ReviewAnswersFooter } from '../../components/ReviewAnswersFooter';
import { QuestionnaireQuestion } from '../../../model/scan_types';

/**
 * ScanReviewAnswersPage Container (Section 4.0 / Review Answers)
 * Layout matching Image 5:
 * - Neutral offwhite background
 * - Top title header: "Review Answers"
 * - Scrollable list of 10 ReviewQuestionCards with inline edit triggers
 * - Fixed bottom bar with Discard Changes and Save actions
 */
export const ScanReviewAnswersPage: React.FC = () => {
  const {
    questions,
    stagedAnswers,
    handleEdit,
    handleDiscardChanges,
    handleSave,
  } = useScanReviewAnswers();

  return (
    <View className="flex-1 bg-background">
      {/* Top Header */}
      <View className="pt-12 pb-3 px-6 bg-background">
        <Text className="text-h2 font-sans-bold text-text">
          Review Answers
        </Text>
      </View>

      {/* 10 Question Cards List */}
      <ScrollView
        className="flex-1 px-5 pt-2"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {questions.map((q: QuestionnaireQuestion) => (
          <ReviewQuestionCard
            key={q.id}
            question={q}
            answer={stagedAnswers[q.id]}
            onEdit={handleEdit}
          />
        ))}
      </ScrollView>

      {/* Fixed Bottom Action Bar */}
      <ReviewAnswersFooter
        onDiscard={handleDiscardChanges}
        onSave={handleSave}
      />
    </View>
  );
};

export default ScanReviewAnswersPage;

