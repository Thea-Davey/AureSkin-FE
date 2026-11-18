import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { createProduct } from '../model/library_api';
import { getCachedIngredients } from '../../../shared/storage/catalogStorage';
import { ProductCategory } from '../../../shared/utils/productCategory';

export interface AddProductDraft {
  name: string;
  description: string;
  category: ProductCategory;
  ingredients: string[];
  skinTypes: string[];
  skinConditions: string[];
}

const COMMON_INGREDIENT_SUGGESTIONS = [
  'Aloe Vera',
  'Centella Asiatica',
  'Ceramides',
  'Glycolic Acid',
  'Hyaluronic Acid',
  'Lactic Acid',
  'Niacinamide',
  'Panthenol',
  'Peptides',
  'Retinol',
  'Salicylic Acid',
  'Squalane',
  'Vitamin C',
  'Zinc Oxide',
];

// Initial ingredient suggestions for auto-suggest before cache hydration
export const MASTER_DATABASE_INGREDIENTS = [...COMMON_INGREDIENT_SUGGESTIONS].sort((a, b) =>
  a.localeCompare(b)
);

const EMPTY_DRAFT: AddProductDraft = {
  name: '',
  description: '',
  category: 'other',
  ingredients: [],
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
  const [availableIngredients, setAvailableIngredients] = useState<string[]>(
    MASTER_DATABASE_INGREDIENTS
  );

  // Hydrate autocomplete suggestions with the live cached ingredients catalog
  useEffect(() => {
    let mounted = true;
    getCachedIngredients()
      .then((cached) => {
        if (!mounted || !cached || cached.length === 0) return;
        const merged = Array.from(
          new Set([
            ...MASTER_DATABASE_INGREDIENTS,
            ...cached.map((item) => item.name).filter(Boolean),
          ])
        ).sort((a, b) => a.localeCompare(b));
        setAvailableIngredients(merged);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const updateDraft = useCallback((updates: Partial<AddProductDraft>) => {
    setDraft((current) => ({ ...current, ...updates }));
    setError(null);
  }, []);

  const addIngredient = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }
    // Prefer canonical casing if matched in known ingredients catalog; allow custom names too
    const matched =
      availableIngredients.find(
        (item) => item.toLowerCase() === trimmed.toLowerCase()
      ) ?? trimmed;

    // Prevent duplicates
    if (draft.ingredients.some((item) => item.toLowerCase() === matched.toLowerCase())) {
      setError('That ingredient has already been added.');
      return;
    }

    updateDraft({ ingredients: [...draft.ingredients, matched] });
    setError(null);
  }, [availableIngredients, draft.ingredients, updateDraft]);

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
      await createProduct({
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
          ? submitError.message
          : 'Could not add this product. Please try again.'
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
    availableIngredients,
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
