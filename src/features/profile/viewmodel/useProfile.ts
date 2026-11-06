import { useMemo } from 'react';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../../shared/store/authStore';
import { isMockEnabled } from '@/shared/config/mockConfig';
import { MOCK_USER_PROFILE } from '../model/profile_mock';
import { UserProfile } from '../model/profile_types';
import { fetchUserSkinOverview } from '../model/profile_api';

function calculateAge(dateOfBirthString?: string): number | string {
  if (!dateOfBirthString || !/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirthString)) {
    return '';
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
  const mockMode = isMockEnabled('profile');

  // Query latest scan overview for live users
  const { data: skinOverview } = useQuery({
    queryKey: ['profile', 'skin-overview', user?.id],
    queryFn: fetchUserSkinOverview,
    staleTime: 1000 * 60 * 2,
  });

  const profile: UserProfile = useMemo(() => {
    const displayName = typeof metadata.display_name === 'string' ? metadata.display_name : '';
    const emailPrefix = user?.email
      ? user.email.split('@')[0].split('.')[0].replace(/[^a-zA-Z0-9]/g, '')
      : '';
    const fallbackName = emailPrefix
      ? emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1)
      : 'User';

    const firstName =
      typeof metadata.first_name === 'string' && metadata.first_name.trim()
        ? metadata.first_name.trim()
        : displayName
        ? displayName.split(' ')[0]
        : mockMode
        ? MOCK_USER_PROFILE.firstName
        : fallbackName;

    const lastName =
      typeof metadata.last_name === 'string' && metadata.last_name.trim()
        ? metadata.last_name.trim()
        : mockMode
        ? MOCK_USER_PROFILE.lastName
        : '';

    const username =
      typeof metadata.username === 'string' && metadata.username.trim()
        ? metadata.username.trim()
        : mockMode
        ? MOCK_USER_PROFILE.username
        : '';

    const email = user?.email || (mockMode ? MOCK_USER_PROFILE.email : '');

    const phoneNumber =
      typeof metadata.phone_number === 'string' && metadata.phone_number.trim()
        ? metadata.phone_number.trim()
        : typeof metadata.phone === 'string' && metadata.phone.trim()
        ? metadata.phone.trim()
        : mockMode
        ? MOCK_USER_PROFILE.phoneNumber
        : '';

    const dateOfBirth =
      typeof metadata.date_of_birth === 'string' && metadata.date_of_birth.trim()
        ? metadata.date_of_birth.trim()
        : mockMode
        ? MOCK_USER_PROFILE.dateOfBirth
        : '';

    const age =
      typeof metadata.age === 'number' || (typeof metadata.age === 'string' && metadata.age)
        ? String(metadata.age)
        : dateOfBirth
        ? calculateAge(dateOfBirth)
        : mockMode
        ? 20
        : '';

    const avatarUri =
      typeof metadata.avatar_url === 'string' && metadata.avatar_url.trim()
        ? metadata.avatar_url.trim()
        : mockMode
        ? MOCK_USER_PROFILE.avatarUri
        : null;

    const rawAllergens = metadata.allergen ?? metadata.allergens;
    const allergens: string[] = Array.isArray(rawAllergens)
      ? rawAllergens.filter((a): a is string => typeof a === 'string' && a.trim().length > 0)
      : typeof rawAllergens === 'string' && rawAllergens.trim()
      ? [rawAllergens.trim()]
      : mockMode
      ? MOCK_USER_PROFILE.allergens
      : [];

    const skinType = mockMode
      ? MOCK_USER_PROFILE.skinType
      : (skinOverview?.skinType || '');

    const healthScore = mockMode
      ? MOCK_USER_PROFILE.healthScore
      : (skinOverview?.healthScore || 0);

    const skinConditions = mockMode
      ? MOCK_USER_PROFILE.skinConditions
      : (skinOverview?.conditions || []);

    return {
      id: user?.id || (mockMode ? MOCK_USER_PROFILE.id : ''),
      firstName,
      lastName,
      username,
      email,
      phoneNumber,
      gender: (metadata.gender as any) || (mockMode ? MOCK_USER_PROFILE.gender : ''),
      dateOfBirth,
      age,
      avatarUri,
      skinType,
      healthScore,
      skinConditions,
      allergens,
    };
  }, [user, metadata, mockMode, skinOverview]);

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
