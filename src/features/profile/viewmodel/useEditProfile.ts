import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import { useAuthStore } from '../../../shared/store/authStore';
import { supabase } from '../../../shared/services/supabase';
import { isMockEnabled } from '@/shared/config/mockConfig';
import { MOCK_USER_PROFILE } from '../model/profile_mock';
import { EditProfileDraft, CommonAllergy } from '../model/profile_types';
import { updateUserProfile, fetchCommonAllergies } from '../model/profile_api';

function getMetadataString(
  metadata: Record<string, unknown>,
  key: string,
  fallback: string | null = ''
): string | null {
  const value = metadata[key];
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : fallback;
}

function getMetadataAllergens(metadata: Record<string, unknown>, fallback: string[] = []): string[] {
  const value = metadata.allergen ?? metadata.allergens;
  if (typeof value === 'string' && value.trim()) {
    return [value.trim()];
  }
  if (Array.isArray(value)) {
    return value.filter((item): item is string =>
      typeof item === 'string' && item.trim().length > 0
    );
  }
  return fallback;
}

function getInitialDraft(
  user: { email?: string; user_metadata?: Record<string, unknown> } | null
): EditProfileDraft {
  const metadata = (user?.user_metadata ?? {}) as Record<string, unknown>;
  const mockMode = isMockEnabled('profile');

  const displayName = typeof metadata.display_name === 'string' ? metadata.display_name : '';
  const firstName =
    getMetadataString(
      metadata,
      'first_name',
      displayName ? displayName.split(' ')[0] : (mockMode ? MOCK_USER_PROFILE.firstName : '')
    ) || (mockMode ? MOCK_USER_PROFILE.firstName : '');
  const lastName = getMetadataString(metadata, 'last_name', mockMode ? MOCK_USER_PROFILE.lastName : '') || '';
  const dateOfBirth = getMetadataString(metadata, 'date_of_birth', mockMode ? MOCK_USER_PROFILE.dateOfBirth : '') || '';
  const gender = getMetadataString(metadata, 'gender', mockMode ? MOCK_USER_PROFILE.gender : '') || '';
  const email = user?.email || (mockMode ? MOCK_USER_PROFILE.email : '');
  const phoneNumber =
    getMetadataString(
      metadata,
      'phone_number',
      getMetadataString(metadata, 'phone', mockMode ? MOCK_USER_PROFILE.phoneNumber : '')
    ) || '';
  const allergens = getMetadataAllergens(metadata, mockMode ? MOCK_USER_PROFILE.allergens : []);
  const isPregnant = Boolean(
    metadata.is_pregnant ?? (mockMode ? MOCK_USER_PROFILE.isPregnant : false)
  );
  const avatarUri = getMetadataString(metadata, 'avatar_url', mockMode ? MOCK_USER_PROFILE.avatarUri : null);

  return {
    firstName,
    lastName,
    dateOfBirth,
    gender,
    email,
    phoneNumber,
    allergens,
    isPregnant,
    avatarUri,
  };
}

export function useEditProfile() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const [initialDraft] = useState(() => getInitialDraft(user));
  const [draft, setDraft] = useState<EditProfileDraft>(initialDraft);
  const [allergenInput, setAllergenInput] = useState('');
  const [commonAllergies, setCommonAllergies] = useState<CommonAllergy[]>([]);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isGenderPickerOpen, setIsGenderPickerOpen] = useState(false);
  const [isAllergenModalOpen, setIsAllergenModalOpen] = useState(false);
  const [isPickingAvatar, setIsPickingAvatar] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  // Fetch dynamic standard allergies from Supabase
  useEffect(() => {
    let isMounted = true;
    fetchCommonAllergies().then((list) => {
      if (isMounted && list && list.length > 0) {
        setCommonAllergies(list);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute live Age & Life Stage feedback from date of birth
  const { computedAge, computedLifeStage } = useMemo(() => {
    const dob = draft.dateOfBirth;
    if (!dob || !/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
      return { computedAge: null, computedLifeStage: null };
    }
    const [year, month, day] = dob.split('-').map(Number);
    const birthDate = new Date(year, month - 1, day);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    const safeAge = Math.max(0, age);
    let stage = 'Adult';
    if (safeAge < 20) stage = 'Teen';
    else if (safeAge <= 35) stage = 'Young Adult';
    else if (safeAge <= 50) stage = 'Adult';
    else stage = 'Mature';

    return { computedAge: safeAge, computedLifeStage: stage };
  }, [draft.dateOfBirth]);

  const isDirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(initialDraft),
    [draft, initialDraft]
  );

  const updateDraft = useCallback((updates: Partial<EditProfileDraft>) => {
    setDraft((current) => ({ ...current, ...updates }));
    setSaveNotice(null);
  }, []);

  const setIsPregnant = useCallback(
    (isPregnant: boolean) => {
      updateDraft({ isPregnant });
    },
    [updateDraft]
  );

  const openDatePicker = useCallback(() => {
    setIsDatePickerOpen(true);
  }, []);

  const closeDatePicker = useCallback(() => {
    setIsDatePickerOpen(false);
  }, []);

  const selectDateOfBirth = useCallback((date: string) => {
    updateDraft({ dateOfBirth: date });
    setIsDatePickerOpen(false);
  }, [updateDraft]);

  const addAllergen = useCallback((customName?: string) => {
    const allergen = (customName || allergenInput).trim();
    if (!allergen) {
      return;
    }
    if (draft.allergens.some((item) => item.toLocaleLowerCase() === allergen.toLocaleLowerCase())) {
      setSaveNotice('That allergen is already listed.');
      return;
    }

    updateDraft({ allergens: [...draft.allergens, allergen] });
    setAllergenInput('');
  }, [allergenInput, draft.allergens, updateDraft]);

  const removeAllergen = useCallback((allergen: string) => {
    updateDraft({ allergens: draft.allergens.filter((item) => item !== allergen) });
  }, [draft.allergens, updateDraft]);

  const toggleAllergen = useCallback((allergen: string) => {
    const exists = draft.allergens.some(
      (item) => item.toLocaleLowerCase() === allergen.toLocaleLowerCase()
    );
    if (exists) {
      removeAllergen(allergen);
    } else {
      updateDraft({ allergens: [...draft.allergens, allergen] });
    }
  }, [draft.allergens, removeAllergen, updateDraft]);

  const pickAvatar = useCallback(async () => {
    if (isPickingAvatar) {
      return;
    }
    setIsPickingAvatar(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        updateDraft({ avatarUri: result.assets[0].uri });
      }
    } catch (err) {
      console.warn('Avatar picker error:', err);
    } finally {
      setIsPickingAvatar(false);
    }
  }, [isPickingAvatar, updateDraft]);

  const showPasswordUnavailable = useCallback(() => {
    Alert.alert(
      'Password Reset',
      'Password modification must be performed via secure email verification in live releases.',
      [{ text: 'OK' }]
    );
  }, []);

  const returnToProfile = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/profile');
    }
  }, [router]);

  const [isDiscardVisible, setIsDiscardVisible] = useState(false);

  const promptDiscard = useCallback(() => {
    setIsDiscardVisible(true);
  }, []);

  const confirmDiscard = useCallback(() => {
    setIsDiscardVisible(false);
    setDraft(initialDraft);
    returnToProfile();
  }, [initialDraft, returnToProfile]);

  const cancelDiscard = useCallback(() => {
    setIsDiscardVisible(false);
  }, []);

  const cancel = useCallback(() => {
    if (isDirty) {
      promptDiscard();
      return;
    }
    returnToProfile();
  }, [isDirty, promptDiscard, returnToProfile]);

  const save = useCallback(async () => {
    if (!isDirty || isSaving) {
      return;
    }

    setIsSaving(true);
    try {
      const { success, updatedUser } = await updateUserProfile(draft);
      if (!success) {
        Toast.show({
          type: 'error',
          text1: 'Update Failed',
          text2: 'Could not save profile changes. Please try again.',
          position: 'bottom',
        });
        return;
      }

      // Immediately sync active auth store with returned user metadata
      if (updatedUser) {
        useAuthStore.setState((state) => ({
          ...state,
          user: updatedUser,
        }));
      }

      // Background invalidate queries without blocking navigation
      void queryClient.invalidateQueries({ queryKey: ['profile'] });
      void queryClient.invalidateQueries({ queryKey: ['library'] });
      void queryClient.invalidateQueries({ queryKey: ['scan'] });

      Toast.show({
        type: 'success',
        text1: 'Profile Updated',
        text2: 'Your profile changes have been applied.',
        position: 'bottom',
      });

      // Immediate transition back to ProfilePage
      returnToProfile();
    } finally {
      setIsSaving(false);
    }
  }, [isDirty, isSaving, draft, returnToProfile, queryClient]);

  return {
    draft,
    allergenInput,
    commonAllergies,
    computedAge,
    computedLifeStage,
    isDirty,
    isSaving,
    isPickingAvatar,
    saveNotice,
    isDatePickerOpen,
    isGenderPickerOpen,
    isAllergenModalOpen,
    isDiscardVisible,
    actions: {
      updateDraft,
      setIsPregnant,
      setAllergenInput,
      addAllergen,
      removeAllergen,
      toggleAllergen,
      pickAvatar,
      openDatePicker,
      closeDatePicker,
      selectDateOfBirth,
      setIsGenderPickerOpen,
      setIsAllergenModalOpen,
      promptDiscard,
      confirmDiscard,
      cancelDiscard,
      cancel,
      save,
      showPasswordUnavailable,
    },
  };
}
