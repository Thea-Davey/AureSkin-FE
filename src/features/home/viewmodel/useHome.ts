import { useState, useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchLatestAnalysis, fetchTodayRoutine, fetchArticles } from '../model/home_api';
import { STATIC_FAQS, SKIN_TEST_GUIDANCE } from '../model/home_faqs';
import { LatestAnalysis, RoutineStep, Article, FAQ } from '../model/home_types';

export function useHome() {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Time-of-day logic
  const { routineLabel, routineSubtitle, timePeriod } = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 17) {
      return {
        routineLabel: 'Morning Routine',
        routineSubtitle: 'Protect & hydrate your skin',
        timePeriod: 'morning',
      };
    }
    return {
      routineLabel: 'Evening Routine',
      routineSubtitle: 'Repair & nourish your skin',
      timePeriod: 'evening',
    };
  }, []);

  // 1. Latest Scan Analysis Query
  const {
    data: latestAnalysis,
    isLoading: isLatestAnalysisLoading,
    error: latestAnalysisError,
  } = useQuery<LatestAnalysis | null>({
    queryKey: ['history', 'latest'],
    queryFn: fetchLatestAnalysis,
  });

  // 2. Today's Routine Query
  const {
    data: routineSteps = [],
    isLoading: isRoutineLoading,
  } = useQuery<RoutineStep[]>({
    queryKey: ['routine', 'current', timePeriod],
    queryFn: () => fetchTodayRoutine(timePeriod),
  });

  // 3. Articles Query
  const {
    data: articles = [],
    isLoading: isArticlesLoading,
    error: articlesError,
  } = useQuery<Article[]>({
    queryKey: ['articles'],
    queryFn: fetchArticles,
  });

  // Pull-to-refresh
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['history', 'latest'] }),
      queryClient.invalidateQueries({ queryKey: ['routine', 'current'] }),
      queryClient.invalidateQueries({ queryKey: ['articles'] }),
    ]);
    setIsRefreshing(false);
  }, [queryClient]);

  return {
    latestAnalysis: latestAnalysis ?? null,
    isLatestAnalysisLoading,
    latestAnalysisError: latestAnalysisError ? (latestAnalysisError as Error).message : null,
    routineSteps,
    routineLabel,
    routineSubtitle,
    isRoutineLoading,
    articles,
    isArticlesLoading,
    articlesError: articlesError ? (articlesError as Error).message : null,
    faqs: STATIC_FAQS,
    guidance: SKIN_TEST_GUIDANCE,
    isRefreshing,
    onRefresh,
  };
}
