import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import {
  deleteCurrentRoutine,
  fetchLatestSkinProfile,
  fetchProductOptions,
  fetchRoutine,
  generateRoutine,
  saveRoutineSteps,
  updateRoutineStep,
} from '../model/routine_api';
import { RoutineProduct, RoutineStep, RoutineStepUpdate, SkincareRoutine } from '../model/routine_types';

const PRODUCT_PAGE_SIZE = 20;

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}

export function useRoutine() {
  const queryClient = useQueryClient();

  // Active time of day toggle
  const [activeTimeOfDay, setActiveTimeOfDay] = useState<'morning' | 'evening'>('morning');

  // Inline Step Editing State
  const [isEditing, setIsEditing] = useState(false);

  // Product Swapping Bottom Sheet State
  const [swappingStepId, setSwappingStepId] = useState<string | null>(null);
  const [swappingProductId, setSwappingProductId] = useState<string | null>(null);
  const [swappingStepName, setSwappingStepName] = useState<string | undefined>(undefined);
  const [productSearch, setProductSearch] = useState('');

  // Dialog & Modal Visibilities
  const [showSkinProfileMenu, setShowSkinProfileMenu] = useState(false);
  const [showNewAnalysisDialog, setShowNewAnalysisDialog] = useState(false);
  const [showDeleteRoutineDialog, setShowDeleteRoutineDialog] = useState(false);
  const [showDeleteCurrentRoutineDialog, setShowDeleteCurrentRoutineDialog] = useState(false);

  // Queries
  const routineQuery = useQuery({
    queryKey: ['routine', 'current'],
    queryFn: fetchRoutine,
  });

  const profileQuery = useQuery({
    queryKey: ['routine', 'skin-profile'],
    queryFn: fetchLatestSkinProfile,
  });

  // Mutations
  const generationMutation = useMutation({
    mutationFn: generateRoutine,
    onSuccess: async (routine) => {
      queryClient.setQueryData<SkincareRoutine>(['routine', 'current'], routine);
      setShowDeleteRoutineDialog(false);
      setShowNewAnalysisDialog(false);
      setIsEditing(false);
      await queryClient.invalidateQueries({ queryKey: ['routine'] });
    },
  });

  const productOptionsQuery = useInfiniteQuery({
    queryKey: ['routine', 'product-options', productSearch],
    enabled: swappingStepId !== null,
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      fetchProductOptions({
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
      queryClient.setQueryData<SkincareRoutine | null>(['routine', 'current'], (current) => {
        if (!current) return current;
        const updatedSteps = current.steps.map((step) =>
          step.id === variables.stepId ? { ...step, ...updatedStep } : step
        );
        return { ...current, steps: updatedSteps };
      });
      await queryClient.invalidateQueries({ queryKey: ['routine', 'current'] });
    },
  });

  const deleteRoutineMutation = useMutation({
    mutationFn: deleteCurrentRoutine,
    onSuccess: async () => {
      queryClient.setQueryData<SkincareRoutine | null>(['routine', 'current'], null);
      setShowDeleteCurrentRoutineDialog(false);
      await queryClient.invalidateQueries({ queryKey: ['routine', 'current'] });
    },
  });

  const saveAllStepsMutation = useMutation({
    mutationFn: (updatedSteps: RoutineStep[]) => saveRoutineSteps(updatedSteps),
    onSuccess: async (savedSteps) => {
      queryClient.setQueryData<SkincareRoutine | null>(['routine', 'current'], (current) => {
        if (!current) return current;
        return { ...current, steps: savedSteps };
      });
      setIsEditing(false);
      await queryClient.invalidateQueries({ queryKey: ['routine', 'current'] });
    },
  });

  const refresh = async () => {
    await Promise.all([routineQuery.refetch(), profileQuery.refetch()]);
  };

  // Swapping product handlers
  const openSwapProduct = (
    stepId: string,
    currentProductId: string | null,
    stepName?: string
  ) => {
    setSwappingStepId(stepId);
    setSwappingProductId(currentProductId);
    const resolvedName =
      stepName ||
      routineQuery.data?.steps.find((s) => s.id === stepId)?.step_name;
    setSwappingStepName(resolvedName);
    setProductSearch('');
  };

  const closeSwapProduct = () => {
    setSwappingStepId(null);
    setSwappingProductId(null);
    setSwappingStepName(undefined);
    setProductSearch('');
  };

  const selectProductForStep = (product: RoutineProduct | null) => {
    if (!swappingStepId) return;
    const currentRoutine = routineQuery.data;
    if (!currentRoutine) return;

    const targetStep = currentRoutine.steps.find((s) => s.id === swappingStepId);
    if (!targetStep) return;

    // Update step via mutation or local update
    updateMutation.mutate({
      stepId: swappingStepId,
      updates: { product_id: product?.id ?? null },
    });
    closeSwapProduct();
  };

  // Save steps edited for active time of day
  const handleSaveEditing = (updatedTimeOfDaySteps: RoutineStep[]) => {
    const currentRoutine = routineQuery.data;
    if (!currentRoutine) return;

    // Keep other time-of-day steps unchanged
    const otherSteps = currentRoutine.steps.filter((s) =>
      activeTimeOfDay === 'morning'
        ? s.time_of_day === 'evening'
        : s.time_of_day === 'morning'
    );

    const mergedSteps = [...otherSteps, ...updatedTimeOfDaySteps].sort(
      (a, b) => a.step_number - b.step_number
    );

    saveAllStepsMutation.mutate(mergedSteps);
  };

  return {
    routine: routineQuery.data ?? null,
    skinProfile: profileQuery.data ?? null,
    isRoutineLoading: routineQuery.isLoading,
    isSkinProfileLoading: profileQuery.isLoading,
    isRefreshing:
      (routineQuery.isRefetching || profileQuery.isRefetching) && !routineQuery.isLoading,
    isGenerating: generationMutation.isPending,
    routineError: routineQuery.error ? getErrorMessage(routineQuery.error) : null,
    profileError: profileQuery.error ? getErrorMessage(profileQuery.error) : null,
    generationError: generationMutation.error ? getErrorMessage(generationMutation.error) : null,

    // Day / Night Tab
    activeTimeOfDay,
    setActiveTimeOfDay,

    // Inline Editing
    isEditing,
    startEditing: () => setIsEditing(true),
    cancelEditing: () => setIsEditing(false),
    saveEditing: handleSaveEditing,

    // Product Swapping
    swapSheetVisible: swappingStepId !== null,
    swappingStepId,
    swappingStepName,
    swappingProductId,
    openSwapProduct,
    closeSwapProduct,
    selectProductForStep,
    productSearch,
    setProductSearch,
    productOptions: productOptionsQuery.data?.pages.flatMap((page) => page.items) ?? [],
    isProductOptionsLoading: productOptionsQuery.isLoading,

    // Dialogs
    showSkinProfileMenu,
    openSkinProfileMenu: () => setShowSkinProfileMenu(true),
    closeSkinProfileMenu: () => setShowSkinProfileMenu(false),

    showDeleteRoutineDialog,
    openDeleteRoutineDialog: () => {
      setShowSkinProfileMenu(false);
      setShowDeleteRoutineDialog(true);
    },
    closeDeleteRoutineDialog: () => setShowDeleteRoutineDialog(false),

    showDeleteCurrentRoutineDialog,
    openDeleteCurrentRoutineDialog: () => {
      setShowSkinProfileMenu(false);
      setShowDeleteCurrentRoutineDialog(true);
    },
    closeDeleteCurrentRoutineDialog: () => setShowDeleteCurrentRoutineDialog(false),

    showNewAnalysisDialog,
    openNewAnalysisDialog: () => setShowNewAnalysisDialog(true),
    dismissNewAnalysisDialog: () => setShowNewAnalysisDialog(false),
    confirmNewAnalysisRoutine: () => {
      setShowNewAnalysisDialog(false);
      setShowDeleteRoutineDialog(true);
    },

    actions: {
      generate: () => generationMutation.mutate(),
      deleteCurrentRoutine: () => deleteRoutineMutation.mutate(),
      refresh,
      retryRoutine: () => void routineQuery.refetch(),
      retryProfile: () => void profileQuery.refetch(),
      clearGenerationError: () => generationMutation.reset(),
    },
  };
}
