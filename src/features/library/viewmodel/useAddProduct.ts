import { useCallback, useState } from 'react';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { addMockProduct } from '../model/library_api';
import { MOCK_INGREDIENTS } from '../model/library_mock';
import { ProductCategory } from '../../../shared/utils/productCategory';

export interface AddProductDraft {
  name: string;
  description: string;
  category: ProductCategory;
  ingredients: string[];
  skinTypes: string[];
  skinConditions: string[];
}

const INITIAL_INGREDIENTS = [
  'Salicylic acid',
  'Niacinamide',
  'Clay',
  'Hyaluronic acid',
  'Retinol',
  'Dioic acid',
  'Omega fatty acids',
  'Aloe Vera',
];

// Master list of available database ingredients for auto-suggest & validation
export const MASTER_DATABASE_INGREDIENTS = Array.from(
  new Set([
    ...MOCK_INGREDIENTS.map((i) => i.name),
    ...INITIAL_INGREDIENTS,
  ])
).sort((a, b) => a.localeCompare(b));

const EMPTY_DRAFT: AddProductDraft = {
  name: '',
  description: '',
  category: 'other',
  ingredients: INITIAL_INGREDIENTS,
  skinTypes: [],
  skinConditions: [],
};

function isDraftDirty(draft: AddProductDraft, initial: AddProductDraft): boolean {
  return JSON.stringify(draft) !== JSON.stringify(initial);
}

export function useAddProduct() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [initialDraft] = useState<AddProductDraft>(() => EMPTY_DRAFT);
  const [draft, setDraft] = useState<AddProductDraft>(initialDraft);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessVisible, setIsSuccessVisible] = useState(false);
  const [isDiscardVisible, setIsDiscardVisible] = useState(false);

  const updateDraft = useCallback((updates: Partial<AddProductDraft>) => {
    setDraft((current) => ({ ...current, ...updates }));
    setError(null);
  }, []);

  const addIngredient = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }
    // Check if ingredient exists in master database
    const matched = MASTER_DATABASE_INGREDIENTS.find(
      (item) => item.toLowerCase() === trimmed.toLowerCase()
    );
    if (!matched) {
      setError('Only ingredients from the AureSkin library database can be added.');
      return;
    }
    // Prevent duplicates
    if (draft.ingredients.some((item) => item.toLowerCase() === matched.toLowerCase())) {
      setError('That ingredient has already been added.');
      return;
    }

    updateDraft({ ingredients: [...draft.ingredients, matched] });
    setError(null);
  }, [draft.ingredients, updateDraft]);

  const removeIngredient = useCallback((ingredient: string) => {
    updateDraft({ ingredients: draft.ingredients.filter((item) => item !== ingredient) });
  }, [draft.ingredients, updateDraft]);

  const setCategory = useCallback((category: ProductCategory) => {
    updateDraft({ category });
  }, [updateDraft]);

  const addSkinType = useCallback((type: string) => {
    if (draft.skinTypes.includes(type)) {
      return;
    }
    updateDraft({ skinTypes: [...draft.skinTypes, type] });
  }, [draft.skinTypes, updateDraft]);

  const removeSkinType = useCallback((type: string) => {
    updateDraft({ skinTypes: draft.skinTypes.filter((item) => item !== type) });
  }, [draft.skinTypes, updateDraft]);

  const addSkinCondition = useCallback((condition: string) => {
    if (draft.skinConditions.includes(condition)) {
      return;
    }
    updateDraft({ skinConditions: [...draft.skinConditions, condition] });
  }, [draft.skinConditions, updateDraft]);

  const removeSkinCondition = useCallback((condition: string) => {
    updateDraft({ skinConditions: draft.skinConditions.filter((item) => item !== condition) });
  }, [draft.skinConditions, updateDraft]);

  const returnToLibrary = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/library?tab=products');
    }
  }, [router]);

  const promptDiscard = useCallback(() => {
    if (!isDraftDirty(draft, initialDraft)) {
      returnToLibrary();
      return;
    }
    setIsDiscardVisible(true);
  }, [draft, initialDraft, returnToLibrary]);

  const confirmDiscard = useCallback(() => {
    setIsDiscardVisible(false);
    returnToLibrary();
  }, [returnToLibrary]);

  const cancelDiscard = useCallback(() => {
    setIsDiscardVisible(false);
  }, []);

  const submit = useCallback(async () => {
    if (isSubmitting) {
      return;
    }

    if (!draft.name.trim()) {
      setError('Enter a product name before continuing.');
      return;
    }
    if (draft.ingredients.length === 0) {
      setError('Add at least one ingredient before continuing.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      addMockProduct({
        name: draft.name,
        description: draft.description,
        category: draft.category,
        ingredients: draft.ingredients,
        skinTypes: draft.skinTypes,
        skinConditions: draft.skinConditions,
      });
      await queryClient.invalidateQueries({ queryKey: ['library', 'products'] });
      setIsSuccessVisible(true);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? `Could not add this demo product: ${submitError.message}`
          : 'Could not add this demo product. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [draft, isSubmitting, queryClient]);

  const dismissSuccess = useCallback(() => {
    setIsSuccessVisible(false);
    returnToLibrary();
  }, [returnToLibrary]);

  return {
    draft,
    error,
    isSubmitting,
    isSuccessVisible,
    isDiscardVisible,
    availableIngredients: MASTER_DATABASE_INGREDIENTS,
    actions: {
      updateDraft,
      setCategory,
      addIngredient,
      removeIngredient,
      addSkinType,
      removeSkinType,
      addSkinCondition,
      removeSkinCondition,
      promptDiscard,
      confirmDiscard,
      cancelDiscard,
      submit,
      dismissSuccess,
    },
  };
}
