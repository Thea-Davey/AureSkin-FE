import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { fetchLatestAnalysis } from '../../home/model/home_api';
import { LatestAnalysis } from '../../home/model/home_types';
import { fetchRoutine, generateRoutine, USE_MOCK } from '../model/routine_api';
import { Routine, RoutineSkinProfile } from '../model/routine_types';

export type RoutineScreenState = 'loading' | 'empty' | 'error' | 'active';

interface UseRoutineResult {
  skinProfile: RoutineSkinProfile | null;
  routine: Routine | null;
  screenState: RoutineScreenState;
  errorMessage: string | null;
  isGenerating: boolean;
  isRefreshing: boolean;
  onGenerate: () => void;
  onRetry: () => Promise<void>;
  onRefresh: () => Promise<void>;
}

export function useRoutine(): UseRoutineResult {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const analysisQuery = useQuery<LatestAnalysis | null>({
    queryKey: ['history', 'latest'],
    queryFn: fetchLatestAnalysis,
  });

  const routineQuery = useQuery<Routine | null>({
    queryKey: ['routine'],
    queryFn: fetchRoutine,
  });

  const generateMutation = useMutation({
    mutationFn: generateRoutine,
    onMutate: () => setGenerationError(null),
    onSuccess: (routine) => {
      queryClient.setQueryData(['routine'], routine);
      if (!USE_MOCK) {
        void queryClient.invalidateQueries({ queryKey: ['routine', 'current'] });
      }
    },
    onError: (error) => {
      setGenerationError(error instanceof Error ? error.message : 'Unable to generate your routine.');
    },
  });

  const skinProfile: RoutineSkinProfile | null = analysisQuery.data
    ? {
        skinType: analysisQuery.data.skin_type || null,
        concerns: analysisQuery.data.conditions,
        healthScore: analysisQuery.data.health_score,
      }
    : null;

  const screenState: RoutineScreenState = routineQuery.isLoading || analysisQuery.isLoading
    ? 'loading'
    : routineQuery.error
      ? 'error'
      : routineQuery.data
        ? 'active'
        : 'empty';

  const onGenerate = useCallback(() => {
    if (!analysisQuery.data) {
      setGenerationError('Complete a skin scan before generating your routine.');
      return;
    }

    generateMutation.mutate();
  }, [analysisQuery.data, generateMutation]);

  const onRetry = useCallback(async () => {
    setGenerationError(null);
    await Promise.all([analysisQuery.refetch(), routineQuery.refetch()]);
  }, [analysisQuery, routineQuery]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['history', 'latest'] }),
        queryClient.invalidateQueries({ queryKey: ['routine'] }),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient]);

  return {
    skinProfile,
    routine: routineQuery.data ?? null,
    screenState,
    errorMessage: generationError,
    isGenerating: generateMutation.isPending,
    isRefreshing,
    onGenerate,
    onRetry,
    onRefresh,
  };
}