import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import { useAuthStore } from '../../../shared/store/authStore';
import { MOCK_USER_PROFILE } from '../model/profile_mock';
import { EditProfileDraft } from '../model/profile_types';

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

  const displayName = typeof metadata.display_name === 'string' ? metadata.display_name : '';
  const firstName =
    getMetadataString(
      metadata,
      'first_name',
      displayName ? displayName.split(' ')[0] : MOCK_USER_PROFILE.firstName
    ) || MOCK_USER_PROFILE.firstName;
  const lastName = getMetadataString(metadata, 'last_name', MOCK_USER_PROFILE.lastName) || '';
  const username = getMetadataString(metadata, 'username', MOCK_USER_PROFILE.username) || '';
  const dateOfBirth = getMetadataString(metadata, 'date_of_birth', MOCK_USER_PROFILE.dateOfBirth) || '';
  const gender = getMetadataString(metadata, 'gender', MOCK_USER_PROFILE.gender) || '';
  const email = user?.email || MOCK_USER_PROFILE.email;
  const phoneNumber =
    getMetadataString(
      metadata,
      'phone_number',
      getMetadataString(metadata, 'phone', MOCK_USER_PROFILE.phoneNumber)
    ) || '';
  const allergens = getMetadataAllergens(metadata, MOCK_USER_PROFILE.allergens);
  const avatarUri = getMetadataString(metadata, 'avatar_url', MOCK_USER_PROFILE.avatarUri);

  return {
    firstName,
    lastName,
    username,
    dateOfBirth,
    gender,
    email,
    phoneNumber,
    allergens,
    avatarUri,
  };
}

export function useEditProfile() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [initialDraft] = useState(() => getInitialDraft(user));
  const [draft, setDraft] = useState<EditProfileDraft>(initialDraft);

  const [allergenInput, setAllergenInput] = useState('');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isGenderPickerOpen, setIsGenderPickerOpen] = useState(false);
  const [isAllergenModalOpen, setIsAllergenModalOpen] = useState(false);
  const [isPickingAvatar, setIsPickingAvatar] = useState(false);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  const isDirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(initialDraft),
    [draft, initialDraft]
  );

  const updateDraft = useCallback((updates: Partial<EditProfileDraft>) => {
    setDraft((current) => ({ ...current, ...updates }));
    setSaveNotice(null);
  }, []);

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
      updateDraft({
        allergens: draft.allergens.filter(
          (item) => item.toLocaleLowerCase() !== allergen.toLocaleLowerCase()
        ),
      });
    } else {
      updateDraft({ allergens: [...draft.allergens, allergen] });
    }
  }, [draft.allergens, updateDraft]);

  const pickAvatar = useCallback(async () => {
    if (isPickingAvatar) {
      return;
    }

    setIsPickingAvatar(true);
    setSaveNotice(null);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        updateDraft({ avatarUri: result.assets[0].uri });
      }
    } catch (error) {
      setSaveNotice(
        error instanceof Error
          ? `Could not open photo picker: ${error.message}`
          : 'Could not open photo picker.'
      );
    } finally {
      setIsPickingAvatar(false);
    }
  }, [isPickingAvatar, updateDraft]);

  const returnToProfile = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/profile');
  }, [router]);

  const [isDiscardVisible, setIsDiscardVisible] = useState(false);

  const promptDiscard = useCallback(() => {
    setIsDiscardVisible(true);
  }, []);

  const confirmDiscard = useCallback(() => {
    setIsDiscardVisible(false);
    returnToProfile();
  }, [returnToProfile]);

  const cancelDiscard = useCallback(() => {
    setIsDiscardVisible(false);
  }, []);

  const cancel = promptDiscard;

  const showPasswordUnavailable = useCallback(() => {
    Alert.alert(
      'Change Password',
      'Password changes are not configured in this app yet.'
    );
  }, []);

  const save = useCallback(() => {
    if (!isDirty) {
      return;
    }
    Toast.show({
      type: 'success',
      text1: 'Profile Updated',
      text2: 'Your profile changes have been applied.',
      position: 'bottom',
    });
    setSaveNotice(
      'Profile preview updated locally. Remote profile syncing will be available in future releases.'
    );
    // Smooth return to profile
    setTimeout(() => {
      returnToProfile();
    }, 600);
  }, [isDirty, returnToProfile]);

  return {
    draft,
    allergenInput,
    isDirty,
    isPickingAvatar,
    saveNotice,
    isDatePickerOpen,
    isGenderPickerOpen,
    isAllergenModalOpen,
    isDiscardVisible,
    actions: {
      updateDraft,
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
