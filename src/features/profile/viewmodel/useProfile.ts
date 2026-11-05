import { useMemo } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../../shared/store/authStore';
import { MOCK_USER_PROFILE } from '../model/profile_mock';
import { UserProfile } from '../model/profile_types';

function calculateAge(dateOfBirthString?: string): number {
  if (!dateOfBirthString || !/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirthString)) {
    return 20;
  }
  const [year, month, day] = dateOfBirthString.split('-').map(Number);
  const birthDate = new Date(year, month - 1, day);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return Math.max(0, age);
}

export function useProfile() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const metadata = (user?.user_metadata ?? {}) as Record<string, unknown>;

  const profile: UserProfile = useMemo(() => {
    const displayName = typeof metadata.display_name === 'string' ? metadata.display_name : '';
    const firstName =
      typeof metadata.first_name === 'string' && metadata.first_name.trim()
        ? metadata.first_name.trim()
        : displayName
        ? displayName.split(' ')[0]
        : MOCK_USER_PROFILE.firstName;

    const lastName =
      typeof metadata.last_name === 'string' && metadata.last_name.trim()
        ? metadata.last_name.trim()
        : MOCK_USER_PROFILE.lastName;

    const username =
      typeof metadata.username === 'string' && metadata.username.trim()
        ? metadata.username.trim()
        : MOCK_USER_PROFILE.username;

    const email = user?.email || MOCK_USER_PROFILE.email;

    const phoneNumber =
      typeof metadata.phone_number === 'string' && metadata.phone_number.trim()
        ? metadata.phone_number.trim()
        : typeof metadata.phone === 'string' && metadata.phone.trim()
        ? metadata.phone.trim()
        : MOCK_USER_PROFILE.phoneNumber;

    const dateOfBirth =
      typeof metadata.date_of_birth === 'string' && metadata.date_of_birth.trim()
        ? metadata.date_of_birth.trim()
        : MOCK_USER_PROFILE.dateOfBirth;

    const age =
      typeof metadata.age === 'number' || typeof metadata.age === 'string'
        ? String(metadata.age)
        : calculateAge(dateOfBirth);

    const avatarUri =
      typeof metadata.avatar_url === 'string' && metadata.avatar_url.trim()
        ? metadata.avatar_url.trim()
        : MOCK_USER_PROFILE.avatarUri;

    const rawAllergens = metadata.allergen ?? metadata.allergens;
    const allergens: string[] = Array.isArray(rawAllergens)
      ? rawAllergens.filter((a): a is string => typeof a === 'string' && a.trim().length > 0)
      : typeof rawAllergens === 'string' && rawAllergens.trim()
      ? [rawAllergens.trim()]
      : MOCK_USER_PROFILE.allergens;

    return {
      id: user?.id || MOCK_USER_PROFILE.id,
      firstName,
      lastName,
      username,
      email,
      phoneNumber,
      gender: (metadata.gender as any) || MOCK_USER_PROFILE.gender,
      dateOfBirth,
      age,
      avatarUri,
      skinType: MOCK_USER_PROFILE.skinType,
      healthScore: MOCK_USER_PROFILE.healthScore,
      skinConditions: MOCK_USER_PROFILE.skinConditions,
      allergens,
    };
  }, [user, metadata]);

  const openEditProfile = () => {
    router.push('/edit-profile');
  };

  const closeProfile = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  return {
    profile,
    actions: {
      openEditProfile,
      closeProfile,
    },
  };
}
