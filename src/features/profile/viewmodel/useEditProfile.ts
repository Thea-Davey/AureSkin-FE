import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../../../shared/store/authStore';

export interface EditProfileDraft {
  firstName: string;
  lastName: string;
  age: string;
  username: string;
  pregnant: boolean | null;
  allergens: string[];
  avatarUri: string | null;
}

function getMetadataString(metadata: Record<string, unknown>, key: string): string {
  const value = metadata[key];
  return typeof value === 'string' ? value : '';
}

function getMetadataAge(metadata: Record<string, unknown>): string {
  const age = metadata.age;
  return typeof age === 'string' || typeof age === 'number' ? String(age) : '';
}

function getMetadataPregnancy(metadata: Record<string, unknown>): boolean | null {
  const value = metadata.pregnant;
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    const normalized = value.trim().toLocaleLowerCase();
    if (normalized === 'yes' || normalized === 'true') {
      return true;
    }
    if (normalized === 'no' || normalized === 'false') {
      return false;
    }
  }
  return null;
}

function getMetadataAllergens(metadata: Record<string, unknown>): string[] {
  const value = metadata.allergen ?? metadata.allergens;
  if (typeof value === 'string') {
    return value.trim() ? [value.trim()] : [];
  }
  if (Array.isArray(value)) {
    return value.filter((item): item is string =>
      typeof item === 'string' && item.trim().length > 0
    );
  }
  return [];
}

function getInitialDraft(metadata: Record<string, unknown>): EditProfileDraft {
  return {
    firstName: getMetadataString(metadata, 'first_name'),
    lastName: getMetadataString(metadata, 'last_name'),
    age: getMetadataAge(metadata),
    username: getMetadataString(metadata, 'username'),
    pregnant: getMetadataPregnancy(metadata),
    allergens: getMetadataAllergens(metadata),
    avatarUri: getMetadataString(metadata, 'avatar_url') || null,
  };
}

export function useEditProfile() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const metadata = (user?.user_metadata ?? {}) as Record<string, unknown>;
  const [initialDraft] = useState(() => getInitialDraft(metadata));
  const [draft, setDraft] = useState(initialDraft);
  const [allergenInput, setAllergenInput] = useState('');
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

  const addAllergen = useCallback(() => {
    const allergen = allergenInput.trim();
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

  const cancel = useCallback(() => {
    if (!isDirty) {
      returnToProfile();
      return;
    }

    Alert.alert(
      'Discard profile changes?',
      'Your edits have not been saved.',
      [
        { text: 'Keep editing', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: returnToProfile },
      ]
    );
  }, [isDirty, returnToProfile]);

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
    setSaveNotice(
      'Profile updates are not connected yet. Your edits and selected photo are only a local preview and have not been saved to your account.'
    );
  }, [isDirty]);

  return {
    draft,
    allergenInput,
    isDirty,
    isPickingAvatar,
    saveNotice,
    actions: {
      updateDraft,
      setAllergenInput,
      addAllergen,
      removeAllergen,
      pickAvatar,
      cancel,
      save,
      showPasswordUnavailable,
    },
  };
}
