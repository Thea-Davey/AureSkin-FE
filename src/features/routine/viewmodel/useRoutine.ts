import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
    fetchLatestSkinProfile,
    fetchProductOptions,
    fetchRoutine,
    generateRoutine,
    updateRoutineStep,
} from '../model/routine_api';
import { RoutineStep, RoutineStepUpdate, SkincareRoutine } from '../model/routine_types';

const PRODUCT_PAGE_SIZE = 20;

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}

export function useRoutine() {
  const queryClient = useQueryClient();
  const [selectedTimeOfDay, setSelectedTimeOfDay] = useState<'morning' | 'evening' | null>(null);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [productSearch, setProductSearch] = useState('');
  const routineQuery = useQuery({
    queryKey: ['routine', 'current'],
    queryFn: fetchRoutine,
  });
  const profileQuery = useQuery({
    queryKey: ['routine', 'skin-profile'],
    queryFn: fetchLatestSkinProfile,
  });
  const generationMutation = useMutation({
    mutationFn: generateRoutine,
    onSuccess: async (routine) => {
      queryClient.setQueryData<SkincareRoutine>(['routine', 'current'], routine);
      await queryClient.invalidateQueries({ queryKey: ['routine'] });
    },
  });
  const productOptionsQuery = useInfiniteQuery({
    queryKey: ['routine', 'product-options', selectedTimeOfDay, productSearch],
    enabled: selectedTimeOfDay !== null,
    initialPageParam: 0,
    queryFn: ({ pageParam }) => fetchProductOptions({
      query: productSearch,
      limit: PRODUCT_PAGE_SIZE,
      offset: pageParam,
    }),
    getNextPageParam: (lastPage) => lastPage.nextOffset ?? undefined,
  });
  const updateMutation = useMutation({
    mutationFn: ({ stepId, updates }: { stepId: string; updates: RoutineStepUpdate }) =>
      updateRoutineStep(stepId, updates),
    onSuccess: async (updatedStep, variables) => {
      const selectedProduct = variables.updates.product_id
        ? productOptionsQuery.data?.pages.flatMap((page) => page.items)
            .find((product) => product.id === variables.updates.product_id) ?? null
        : null;
      queryClient.setQueryData<SkincareRoutine | null>(['routine', 'current'], (currentRoutine) => {
        if (!currentRoutine) return currentRoutine;
        const updatedSteps = currentRoutine.steps.map((step): RoutineStep => {
          if (step.id !== variables.stepId) return step;
          const productId = variables.updates.product_id !== undefined
            ? variables.updates.product_id
            : updatedStep.product_id ?? step.product_id;
          const product = productId === null
            ? null
            : selectedProduct ?? updatedStep.product ?? step.product;
          return {
            ...step,
            ...updatedStep,
            ...variables.updates,
            product_id: productId,
            product,
          };
        });
        return { ...currentRoutine, steps: updatedSteps };
      });
      setSelectedTimeOfDay(null);
      setSelectedStepId(null);
      await queryClient.invalidateQueries({ queryKey: ['routine', 'current'] });
    },
  });

  const refresh = async () => {
    await Promise.all([routineQuery.refetch(), profileQuery.refetch()]);
  };

  const openStepEditor = (timeOfDay: 'morning' | 'evening', stepId?: string) => {
    updateMutation.reset();
    setProductSearch('');
    setSelectedStepId(stepId ?? null);
    setSelectedTimeOfDay(timeOfDay);
  };

  const closeStepEditor = () => {
    if (updateMutation.isPending) return;
    setSelectedTimeOfDay(null);
    setSelectedStepId(null);
  };

  const loadMoreProducts = () => {
    if (productOptionsQuery.hasNextPage && !productOptionsQuery.isFetchingNextPage) {
      void productOptionsQuery.fetchNextPage();
    }
  };

  const updateStep = (stepId: string, updates: RoutineStepUpdate) => {
    updateMutation.mutate({ stepId, updates });
  };

  return {
    routine: routineQuery.data ?? null,
    skinProfile: profileQuery.data ?? null,
    isRoutineLoading: routineQuery.isLoading,
    isSkinProfileLoading: profileQuery.isLoading,
    isRefreshing: (routineQuery.isRefetching || profileQuery.isRefetching) && !routineQuery.isLoading,
    isGenerating: generationMutation.isPending,
    routineError: routineQuery.error ? getErrorMessage(routineQuery.error) : null,
    profileError: profileQuery.error ? getErrorMessage(profileQuery.error) : null,
    generationError: generationMutation.error ? getErrorMessage(generationMutation.error) : null,
    selectedTimeOfDay,
    selectedStepId,
    productSearch,
    productOptions: productOptionsQuery.data?.pages.flatMap((page) => page.items) ?? [],
    isProductOptionsLoading: productOptionsQuery.isLoading,
    productOptionsError: productOptionsQuery.error ? getErrorMessage(productOptionsQuery.error) : null,
    isFetchingMoreProducts: productOptionsQuery.isFetchingNextPage,
    hasMoreProducts: Boolean(productOptionsQuery.hasNextPage),
    isUpdatingStep: updateMutation.isPending,
    updateError: updateMutation.error ? getErrorMessage(updateMutation.error) : null,
    actions: {
      generate: () => generationMutation.mutate(),
      refresh,
      retryRoutine: () => void routineQuery.refetch(),
      retryProfile: () => void profileQuery.refetch(),
      clearGenerationError: () => generationMutation.reset(),
      openStepEditor,
      selectStep: (stepId: string) => setSelectedStepId(stepId),
      closeStepEditor,
      setProductSearch: (query: string) => setProductSearch(query),
      loadMoreProducts,
      updateStep,
      retryProductOptions: () => void productOptionsQuery.refetch(),
    },
  };
}