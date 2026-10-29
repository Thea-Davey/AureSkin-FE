import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { addMockProduct } from '../model/library_api';
export interface AddProductDraft {
  name: string;
  description: string;
  ingredients: string[];
  imageUri: string | null;
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

const EMPTY_DRAFT: AddProductDraft = {
  name: '',
  description: '',
  ingredients: INITIAL_INGREDIENTS,
  imageUri: null,
};

function getImageUri(value: string | string[] | undefined): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function isDraftDirty(draft: AddProductDraft, initial: AddProductDraft): boolean {
  return JSON.stringify(draft) !== JSON.stringify(initial);
}

export function useAddProduct() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{ imageUri?: string }>();
  const [initialDraft] = useState<AddProductDraft>(() => ({
    ...EMPTY_DRAFT,
    imageUri: getImageUri(params.imageUri),
  }));
  const [draft, setDraft] = useState(initialDraft);
  const [ingredientInput, setIngredientInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessVisible, setIsSuccessVisible] = useState(false);

  const updateDraft = useCallback((updates: Partial<AddProductDraft>) => {
    setDraft((current) => ({ ...current, ...updates }));
    setError(null);
  }, []);

  const addIngredient = useCallback(() => {
    const name = ingredientInput.trim();
    if (!name) {
      return;
    }
    if (draft.ingredients.some((item) => item.toLocaleLowerCase() === name.toLocaleLowerCase())) {
      setError('That ingredient has already been added.');
      return;
    }

    updateDraft({ ingredients: [...draft.ingredients, name] });
    setIngredientInput('');
  }, [draft.ingredients, ingredientInput, updateDraft]);

  const removeIngredient = useCallback((ingredient: string) => {
    updateDraft({ ingredients: draft.ingredients.filter((item) => item !== ingredient) });
  }, [draft.ingredients, updateDraft]);

  const returnToLibrary = useCallback(() => {
    router.replace('/(tabs)/library');
  }, [router]);

  const cancel = useCallback(() => {
    if (!isDraftDirty(draft, initialDraft)) {
      returnToLibrary();
      return;
    }

    Alert.alert(
      'Discard product details?',
      'Your product details and selected photo will be lost.',
      [
        { text: 'Keep editing', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: returnToLibrary },
      ]
    );
  }, [draft, initialDraft, returnToLibrary]);

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
        ingredients: draft.ingredients,
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
    ingredientInput,
    error,
    isSubmitting,
    isSuccessVisible,
    actions: {
      updateDraft,
      setIngredientInput,
      addIngredient,
      removeIngredient,
      cancel,
      submit,
      dismissSuccess,
    },
  };
}
