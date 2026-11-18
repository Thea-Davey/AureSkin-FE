import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { useScanStore } from '../model/scanStore';
import { QuestionnaireAnswer, QuestionnaireQuestion } from '../model/scan_types';
import { MOCK_QUESTIONNAIRE_QUESTIONS, MOCK_DEFAULT_ANSWERS } from '../model/scan_mock';
import { fetchQuestionnaireQuestions } from '../model/scan_api';

export function useScanReviewAnswers() {
  const router = useRouter();

  const questionnaireAnswers = useScanStore((s) => s.questionnaireAnswers);
  const setAllQuestionnaireAnswers = useScanStore((s) => s.setAllQuestionnaireAnswers);

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

  // If user navigated here with empty answers, provide default answers for review
  const initialAnswers = useMemo(() => {
    if (Object.keys(questionnaireAnswers).length === 10) {
      return questionnaireAnswers;
    }
    return { ...MOCK_DEFAULT_ANSWERS, ...questionnaireAnswers };
  }, [questionnaireAnswers]);

  const [stagedAnswers, setStagedAnswers] = useState<Record<number, QuestionnaireAnswer>>(initialAnswers);

  const handleEdit = useCallback(
    (questionNumber: number) => {
      router.push(`/scan/questionnaire?initialQuestion=${questionNumber}`);
    },
    [router]
  );

  const handleDiscardChanges = useCallback(() => {
    router.push('/scan/setup');
  }, [router]);

  const handleSave = useCallback(() => {
    setAllQuestionnaireAnswers(stagedAnswers);
    router.push('/scan/setup');
  }, [stagedAnswers, setAllQuestionnaireAnswers, router]);

  return {
    questions,
    stagedAnswers,
    handleEdit,
    handleDiscardChanges,
    handleSave,
  };
}

