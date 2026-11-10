import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useRef, useState } from 'react';
import Toast from 'react-native-toast-message';
import { useAuthStore } from '../../../shared/store/authStore';
import { useScanStore } from '../../scan/model/scanStore';
import { saveCachedRoutine } from '../../../shared/storage/catalogStorage';
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
import { toCanonicalCategory } from '../../../shared/utils/productCategory';

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
  const [editingSteps, setEditingSteps] = useState<RoutineStep[]>([]);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [pendingTabSwitch, setPendingTabSwitch] = useState<'morning' | 'evening' | null>(null);

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

  const userId = useAuthStore((state) => state.user?.id);

  // Queries
  const routineQuery = useQuery({
    queryKey: ['routine', 'current'],
    queryFn: async () => {
      const routine = await fetchRoutine();
      if (userId) {
        saveCachedRoutine(userId, routine);
      }
      return routine;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  // Current saved steps for the active time of day
  const activeTimeOfDaySteps = useMemo(() => {
    const allSteps = routineQuery.data?.steps ?? [];
    const filtered = allSteps.filter((step) => step.time_of_day === activeTimeOfDay);

    // Deduplicate by step_name / category to ensure at most 1 step per product type
    const seen = new Set<string>();
    const deduped: RoutineStep[] = [];
    for (const step of filtered) {
      const key = (step.step_name || '').toLowerCase().trim();
      if (!seen.has(key)) {
        seen.add(key);
        deduped.push(step);
      }
    }

    return deduped.sort((a, b) => a.step_number - b.step_number);
  }, [routineQuery.data?.steps, activeTimeOfDay]);

  // Steps currently displayed in the UI (editing draft vs saved steps)
  const displayedSteps = useMemo(() => {
    return isEditing ? editingSteps : activeTimeOfDaySteps;
  }, [isEditing, editingSteps, activeTimeOfDaySteps]);

  // Determine if there are unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    if (!isEditing) return false;
    if (editingSteps.length !== activeTimeOfDaySteps.length) return true;
    for (let i = 0; i < editingSteps.length; i++) {
      const edit = editingSteps[i];
      const orig = activeTimeOfDaySteps[i];
      if (edit.id !== orig.id) return true;
      if (edit.product_id !== orig.product_id) return true;
      if (edit.step_name !== orig.step_name) return true;
      if (edit.description !== orig.description) return true;
      if (edit.step_number !== orig.step_number) return true;
    }
    return false;
  }, [isEditing, editingSteps, activeTimeOfDaySteps]);

  const profileQuery = useQuery({
    queryKey: ['routine', 'skin-profile'],
    queryFn: fetchLatestSkinProfile,
  });

  const hasNewScanForRoutine = useScanStore((state) => state.hasNewScanForRoutine);
  const dismissedAnalysisIdRef = useRef<string | null>(null);

  const checkNewAnalysisOnFocus = useCallback(() => {
    const latestAnalysisId = profileQuery.data?.analysis_id;
    const currentRoutineAnalysisId = routineQuery.data?.based_on_analysis_id;

    if (!latestAnalysisId || dismissedAnalysisIdRef.current === latestAnalysisId) {
      return;
    }

    if (
      hasNewScanForRoutine ||
      (currentRoutineAnalysisId && currentRoutineAnalysisId !== latestAnalysisId)
    ) {
      setShowNewAnalysisDialog(true);
    }
  }, [hasNewScanForRoutine, profileQuery.data?.analysis_id, routineQuery.data?.based_on_analysis_id]);

  // Mutations
  const generationMutation = useMutation({
    mutationFn: generateRoutine,
    onMutate: () => {
      setShowDeleteRoutineDialog(false);
      setShowNewAnalysisDialog(false);
      useScanStore.getState().setHasNewScanForRoutine(false);
    },
    onSuccess: async (routine) => {
      queryClient.setQueryData<SkincareRoutine>(['routine', 'current'], routine);
      if (userId) {
        await saveCachedRoutine(userId, routine);
      }
      setShowDeleteRoutineDialog(false);
      setShowNewAnalysisDialog(false);
      setIsEditing(false);
      await queryClient.invalidateQueries({ queryKey: ['routine'] });
      Toast.show({
        type: 'success',
        text1: 'Routine Generated',
        text2: 'Your personalized skincare routine is ready!',
      });
    },
    onError: (err: any) => {
      setShowDeleteRoutineDialog(false);
      setShowNewAnalysisDialog(false);
      Toast.show({
        type: 'error',
        text1: 'Generation Failed',
        text2: err?.message || 'Could not generate routine. Please try again.',
      });
    },
  });

  const targetSwapCategory = useMemo(() => {
    return swappingStepName ? toCanonicalCategory(swappingStepName) : undefined;
  }, [swappingStepName]);

  const productOptionsQuery = useInfiniteQuery({
    queryKey: ['routine', 'product-options', targetSwapCategory, productSearch],
    enabled: swappingStepId !== null,
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      fetchProductOptions({
        category: targetSwapCategory,
        query: productSearch,
        limit: PRODUCT_PAGE_SIZE,
        offset: pageParam,
      }),
    getNextPageParam: (lastPage) => lastPage.nextOffset ?? undefined,
  });

  const updateMutation = useMutation({
    mutationFn: ({
      stepId,
      updates,
    }: {
      stepId: string;
      updates: RoutineStepUpdate;
      productFallback?: RoutineProduct | null;
    }) => updateRoutineStep(stepId, updates),
    onSuccess: (updatedStep, variables) => {
      queryClient.setQueryData<SkincareRoutine | null>(['routine', 'current'], (current) => {
        if (!current) return current;
        const mergedProduct = updatedStep.product ?? variables.productFallback ?? null;
        const updatedSteps = current.steps.map((step) =>
          step.id === variables.stepId
            ? { ...step, ...updatedStep, product: mergedProduct }
            : step
        );
        const updated = { ...current, steps: updatedSteps };
        if (userId) {
          saveCachedRoutine(userId, updated);
        }
        return updated;
      });
    },
  });

  const deleteRoutineMutation = useMutation({
    mutationFn: deleteCurrentRoutine,
    onMutate: async () => {
      setShowDeleteCurrentRoutineDialog(false);
      setShowSkinProfileMenu(false);
      queryClient.setQueryData<SkincareRoutine | null>(['routine', 'current'], null);
      if (userId) {
        await saveCachedRoutine(userId, null);
      }
    },
    onSuccess: async () => {
      setShowDeleteCurrentRoutineDialog(false);
      setShowSkinProfileMenu(false);
      queryClient.setQueryData<SkincareRoutine | null>(['routine', 'current'], null);
      if (userId) {
        await saveCachedRoutine(userId, null);
      }
      await queryClient.invalidateQueries({ queryKey: ['routine'] });
      Toast.show({
        type: 'success',
        text1: 'Routine Deleted',
        text2: 'Your skincare routine has been removed.',
      });
    },
    onError: (err: any) => {
      setShowDeleteCurrentRoutineDialog(false);
      setShowSkinProfileMenu(false);
      // Ensure local routine remains cleared even on network interruption
      queryClient.setQueryData<SkincareRoutine | null>(['routine', 'current'], null);
      if (userId) {
        saveCachedRoutine(userId, null);
      }
      Toast.show({
        type: 'info',
        text1: 'Routine Cleared',
        text2: 'Your routine has been reset.',
      });
    },
  });

  const saveAllStepsMutation = useMutation({
    mutationFn: (updatedSteps: RoutineStep[]) => saveRoutineSteps(updatedSteps),
    onSuccess: async (savedSteps) => {
      queryClient.setQueryData<SkincareRoutine | null>(['routine', 'current'], (current) => {
        if (!current) return current;
        const updated = { ...current, steps: savedSteps };
        if (userId) {
          saveCachedRoutine(userId, updated);
        }
        return updated;
      });
      setIsEditing(false);
      setEditingSteps([]);
      await queryClient.invalidateQueries({ queryKey: ['routine', 'current'] });
    },
  });

  const refresh = async () => {
    await Promise.all([routineQuery.refetch(), profileQuery.refetch()]);
  };

  // Start editing: clone the current activeTimeOfDaySteps into editingSteps draft
  const startEditing = () => {
    setEditingSteps([...activeTimeOfDaySteps]);
    setIsEditing(true);
  };

  // Immediate cancel
  const cancelEditing = () => {
    setIsEditing(false);
    setEditingSteps([]);
    setShowDiscardDialog(false);
    setPendingTabSwitch(null);
  };

  // User taps "Cancel" in header: check if dirty first
  const promptCancelEditing = () => {
    if (hasUnsavedChanges) {
      setShowDiscardDialog(true);
    } else {
      cancelEditing();
    }
  };

  // User switches Morning / Night tab
  const switchTimeOfDay = (targetTab: 'morning' | 'evening') => {
    if (targetTab === activeTimeOfDay) return;
    if (isEditing) {
      if (hasUnsavedChanges) {
        setPendingTabSwitch(targetTab);
        setShowDiscardDialog(true);
        return;
      }
      // No unsaved changes: exit editing cleanly and switch
      setIsEditing(false);
      setEditingSteps([]);
    }
    setActiveTimeOfDay(targetTab);
  };

  const confirmDiscard = () => {
    setShowDiscardDialog(false);
    setIsEditing(false);
    setEditingSteps([]);
    if (pendingTabSwitch) {
      setActiveTimeOfDay(pendingTabSwitch);
      setPendingTabSwitch(null);
    }
  };

  const cancelDiscard = () => {
    setShowDiscardDialog(false);
    setPendingTabSwitch(null);
  };

  // Step manipulation functions for edit mode
  const moveStepUp = (index: number) => {
    if (index === 0) return;
    setEditingSteps((prev) => {
      const reordered = [...prev];
      const temp = reordered[index - 1];
      reordered[index - 1] = reordered[index];
      reordered[index] = temp;
      return reordered.map((step, idx) => ({ ...step, step_number: idx + 1 }));
    });
  };

  const moveStepDown = (index: number) => {
    setEditingSteps((prev) => {
      if (index === prev.length - 1) return prev;
      const reordered = [...prev];
      const temp = reordered[index + 1];
      reordered[index + 1] = reordered[index];
      reordered[index] = temp;
      return reordered.map((step, idx) => ({ ...step, step_number: idx + 1 }));
    });
  };

  const deleteStep = (stepId: string) => {
    setEditingSteps((prev) => {
      const filtered = prev.filter((s) => s.id !== stepId);
      return filtered.map((step, idx) => ({ ...step, step_number: idx + 1 }));
    });
  };

  const addStep = (categoryName = 'Select Skincare', categoryDesc = 'Tap to choose category and product.'): string => {
    const newStepNumber = (isEditing ? editingSteps.length : activeTimeOfDaySteps.length) + 1;
    const newId = `custom-step-${Date.now()}`;
    const newStep: RoutineStep = {
      id: newId,
      step_number: newStepNumber,
      step_name: categoryName,
      description: categoryDesc,
      time_of_day: activeTimeOfDay,
      product_id: null,
      product: null,
    };
    setEditingSteps((prev) => [...prev, newStep]);
    return newId;
  };

  const updateStepCategory = (stepId: string, categoryName: string, categoryDesc: string) => {
    setEditingSteps((prev) =>
      prev.map((step) =>
        step.id === stepId
          ? {
              ...step,
              step_name: categoryName,
              description: categoryDesc,
              product_id: null,
              product: null,
            }
          : step
      )
    );
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
      (isEditing ? editingSteps : (routineQuery.data?.steps ?? [])).find((s) => s.id === stepId)?.step_name;
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

    if (isEditing) {
      // While in edit mode, update editing draft immediately
      setEditingSteps((prev) =>
        prev.map((step) =>
          step.id === swappingStepId
            ? { ...step, product_id: product?.id ?? null, product: product ?? null }
            : step
        )
      );
    } else {
      // Safety fallback outside edit mode
      const currentRoutine = routineQuery.data;
      if (currentRoutine) {
        const targetStep = currentRoutine.steps.find((s) => s.id === swappingStepId);
        if (targetStep) {
          const updatedStepWithProduct = {
            ...targetStep,
            product_id: product?.id ?? null,
            product: product ?? null,
          };
          queryClient.setQueryData<SkincareRoutine | null>(['routine', 'current'], (current) => {
            if (!current) return current;
            const updatedSteps = current.steps.map((step) =>
              step.id === swappingStepId ? updatedStepWithProduct : step
            );
            return { ...current, steps: updatedSteps };
          });
          updateMutation.mutate({
            stepId: swappingStepId,
            updates: { product_id: product?.id ?? null },
            productFallback: product,
          });
        }
      }
    }
    closeSwapProduct();
  };

  // Save steps edited for active time of day
  const handleSaveEditing = () => {
    const currentRoutine = routineQuery.data;
    if (!currentRoutine) return;

    const stepsToSave = isEditing ? editingSteps : activeTimeOfDaySteps;

    // Keep other time-of-day steps unchanged
    const otherSteps = currentRoutine.steps.filter((s) =>
      activeTimeOfDay === 'morning'
        ? s.time_of_day === 'evening'
        : s.time_of_day === 'morning'
    );

    // Number steps consistently per time of day (1..N)
    const renumberedStepsToSave = stepsToSave.map((s, idx) => ({
      ...s,
      step_number: idx + 1,
      time_of_day: activeTimeOfDay,
    }));
    const renumberedOtherSteps = otherSteps.map((s, idx) => ({
      ...s,
      step_number: idx + 1,
    }));

    const mergedSteps = [...renumberedOtherSteps, ...renumberedStepsToSave];

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
    setActiveTimeOfDay: switchTimeOfDay,
    switchTimeOfDay,

    // Steps & Inline Editing
    displayedSteps,
    isEditing,
    hasUnsavedChanges,
    startEditing,
    cancelEditing: promptCancelEditing,
    saveEditing: handleSaveEditing,
    moveStepUp,
    moveStepDown,
    deleteStep,
    addStep,
    updateStepCategory,

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
    showDiscardDialog,
    confirmDiscard,
    cancelDiscard,

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
    checkNewAnalysisOnFocus,
    openNewAnalysisDialog: () => setShowNewAnalysisDialog(true),
    dismissNewAnalysisDialog: () => {
      setShowNewAnalysisDialog(false);
      useScanStore.getState().setHasNewScanForRoutine(false);
      if (profileQuery.data?.analysis_id) {
        dismissedAnalysisIdRef.current = profileQuery.data.analysis_id;
      }
    },
    confirmNewAnalysisRoutine: () => {
      setShowNewAnalysisDialog(false);
      useScanStore.getState().setHasNewScanForRoutine(false);
      if (profileQuery.data?.analysis_id) {
        dismissedAnalysisIdRef.current = profileQuery.data.analysis_id;
      }
      setShowDeleteRoutineDialog(true);
    },

    actions: {
      generate: () => generationMutation.mutate(),
      deleteCurrentRoutine: () => deleteRoutineMutation.mutate(),
      refresh,
      retryRoutine: () => void routineQuery.refetch(),
      retryProfile: () => void profileQuery.refetch(),
      clearGenerationError: () => generationMutation.reset(),
      confirmDiscard,
      cancelDiscard,
    },
  };
}
