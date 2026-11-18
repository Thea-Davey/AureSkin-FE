import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useScanStore } from '../model/scanStore';
import { QuestionnaireChoice, QuestionnaireQuestion } from '../model/scan_types';
import { MOCK_QUESTIONNAIRE_QUESTIONS } from '../model/scan_mock';
import { fetchQuestionnaireQuestions } from '../model/scan_api';

export function useScanQuestionnaire() {
  const router = useRouter();
  const params = useLocalSearchParams<{ initialQuestion?: string }>();

  const initialIndex = useMemo(() => {
    if (params.initialQuestion) {
      const qNum = parseInt(params.initialQuestion, 10);
      if (!isNaN(qNum) && qNum >= 1 && qNum <= 10) {
        return qNum - 1;
      }
    }
    return 0;
  }, [params.initialQuestion]);

  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex);
  const [questions, setQuestions] = useState<QuestionnaireQuestion[]>(MOCK_QUESTIONNAIRE_QUESTIONS);

  useEffect(() => {
    let isMounted = true;
    fetchQuestionnaireQuestions()
      .then((res) => {
        if (isMounted && res && res.length > 0) {
          setQuestions(res);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const questionnaireAnswers = useScanStore((s) => s.questionnaireAnswers);
  const setQuestionnaireAnswer = useScanStore((s) => s.setQuestionnaireAnswer);

  const currentQuestion: QuestionnaireQuestion = questions[currentIndex] || questions[0];

  const selectedAnswer = questionnaireAnswers[currentQuestion.id];
  const selectedChoiceId = selectedAnswer?.selectedChoiceId || null;
  const selectedChoiceIds = selectedAnswer?.selectedChoiceIds || (selectedChoiceId ? selectedChoiceId.split(',') : []);

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === questions.length - 1;
  const canGoNext = Boolean(selectedChoiceId) || selectedChoiceIds.length > 0;

  const selectChoice = useCallback(
    (choice: QuestionnaireChoice) => {
      if (currentQuestion.isMultiSelect) {
        let newIds = [...selectedChoiceIds];
        const isExclusive =
          choice.id === 'q9_5' ||
          choice.id === 'q9_6' ||
          choice.label === 'None of these' ||
          choice.label === 'Not sure';

        if (isExclusive) {
          newIds = [choice.id];
        } else {
          // Remove exclusive options if selecting a specific concern
          newIds = newIds.filter((id) => id !== 'q9_5' && id !== 'q9_6');
          if (newIds.includes(choice.id)) {
            newIds = newIds.filter((id) => id !== choice.id);
          } else {
            newIds.push(choice.id);
          }
        }

        const labels = currentQuestion.choices
          .filter((c) => newIds.includes(c.id))
          .map((c) => c.label);

        setQuestionnaireAnswer(currentQuestion.id, {
          questionId: currentQuestion.id,
          selectedChoiceId: newIds.join(','),
          selectedChoiceLabel: labels.join(', '),
          selectedChoiceIds: newIds,
          selectedChoiceLabels: labels,
        });
      } else {
        setQuestionnaireAnswer(currentQuestion.id, {
          questionId: currentQuestion.id,
          selectedChoiceId: choice.id,
          selectedChoiceLabel: choice.label,
          selectedChoiceIds: [choice.id],
          selectedChoiceLabels: [choice.label],
        });
      }
    },
    [currentQuestion, selectedChoiceIds, setQuestionnaireAnswer]
  );

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Completed all questions -> navigate to review answers page
      router.push('/scan/review-answers' as any);
    }
  }, [currentIndex, questions.length, router]);

  const handleBackToSetup = useCallback(() => {
    router.push('/scan/setup');
  }, [router]);

  return {
    questions,
    currentIndex,
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
  };
}

