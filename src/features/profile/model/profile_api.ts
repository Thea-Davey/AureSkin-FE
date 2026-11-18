import { api } from '../../../shared/services/api';
import { supabase } from '../../../shared/services/supabase';
import { isMockEnabled } from '@/shared/config/mockConfig';
import { UserProfile, EditProfileDraft, CommonAllergy, COMMON_ALLERGENS } from './profile_types';
import { MOCK_USER_PROFILE } from './profile_mock';

// ============================================================================
// DATA SOURCE TOGGLE (use mock)
// Set to `true` to use mock profile data (Cathy Reyes, Oily, 89 score).
// Set to `false` to fetch real profile data and scan stats.
export const USE_MOCK: boolean = isMockEnabled('profile');
// ============================================================================

export interface UserSkinOverview {
  skinType: string;
  healthScore: number;
  conditions: string[];
}

/**
 * Fetch skin overview stats from the user's latest skin analysis.
 * In live mode, queries `/history?limit=1`. Returns empty stats if no scans exist.
 */
export async function fetchUserSkinOverview(): Promise<UserSkinOverview> {
  if (isMockEnabled('profile')) {
    return {
      skinType: MOCK_USER_PROFILE.skinType,
      healthScore: MOCK_USER_PROFILE.healthScore,
      conditions: MOCK_USER_PROFILE.skinConditions,
    };
  }

  try {
    const res = await api.get('/history?limit=1&offset=0');
    const payload = res.data?.data;
    const items = Array.isArray(payload) ? payload : (Array.isArray(payload?.items) ? payload.items : []);

    if (items.length === 0) {
      return {
        skinType: '',
        healthScore: 0,
        conditions: [],
      };
    }

    const latest = items[0];
    let conditions: string[] = [];

    try {
      const detailRes = await api.get(`/history/${encodeURIComponent(latest.id)}`);
      const detail = detailRes.data?.data;
      const rawConds = detail?.conditions?.length ? detail.conditions : detail?.analysis_conditions ?? [];
      if (Array.isArray(rawConds)) {
        conditions = rawConds.map((c: any) => c.display_name || c.name || c.condition?.display_name || '').filter(Boolean);
      }
    } catch {
      conditions = [];
    }

    return {
      skinType: latest.skin_type || '',
      healthScore: latest.health_score ?? 0,
      conditions,
    };
  } catch {
    return {
      skinType: '',
      healthScore: 0,
      conditions: [],
    };
  }
}

/**
 * Update authenticated user's profile metadata in Supabase and backend concurrently.
 */
export async function updateUserProfile(
  draft: EditProfileDraft
): Promise<{ success: boolean; updatedUser?: any }> {
  if (isMockEnabled('profile')) {
    return { success: true };
  }

  try {
    const displayName = `${draft.firstName} ${draft.lastName}`.trim();

    // 1. Run Supabase Auth update and Backend API update concurrently in parallel
    const authPromise = supabase.auth.updateUser({
      data: {
        first_name: draft.firstName,
        last_name: draft.lastName,
        display_name: displayName,
        date_of_birth: draft.dateOfBirth,
        gender: draft.gender,
        phone_number: draft.phoneNumber,
        allergens: draft.allergens,
        is_pregnant: draft.isPregnant,
        avatar_url: draft.avatarUri,
      },
    });

    const apiPromise = api.put('/profile', {
      first_name: draft.firstName || undefined,
      last_name: draft.lastName || undefined,
      display_name: displayName || undefined,
      date_of_birth: draft.dateOfBirth || undefined,
      gender: draft.gender || undefined,
      phone_number: draft.phoneNumber || undefined,
      allergens: draft.allergens,
      is_pregnant: draft.isPregnant,
      avatar_url: draft.avatarUri || undefined,
    });

    const [supaRes, apiRes] = await Promise.allSettled([authPromise, apiPromise]);

    let updatedUser: any = null;
    if (supaRes.status === 'fulfilled') {
      if (supaRes.value.error) {
        console.warn('Supabase updateUser error:', supaRes.value.error);
      } else {
        updatedUser = supaRes.value.data.user;
      }
    } else {
      console.warn('Supabase updateUser rejected:', supaRes.reason);
    }

    if (apiRes.status === 'rejected') {
      console.warn('Backend PUT /profile rejected:', apiRes.reason);
    }

    const success =
      (supaRes.status === 'fulfilled' && !supaRes.value.error) ||
      apiRes.status === 'fulfilled';

    return { success, updatedUser };
  } catch (err) {
    console.warn('updateUserProfile failed:', err);
    return { success: false };
  }
}

/**
 * Fetch common medical allergies from backend GET /profile/allergies
 * (backed by Supabase common_allergies table).
 */
export async function fetchCommonAllergies(): Promise<CommonAllergy[]> {
  if (isMockEnabled('profile')) {
    return COMMON_ALLERGENS.map((name) => ({
      code: name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      name,
      category: 'General',
    }));
  }

  try {
    const res = await api.get('/profile/allergies');
    const items = res.data?.data;
    if (Array.isArray(items) && items.length > 0) {
      return items;
    }
    return COMMON_ALLERGENS.map((name) => ({
      code: name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      name,
      category: 'General',
    }));
  } catch (err) {
    console.warn('fetchCommonAllergies error, using fallback list:', err);
    return COMMON_ALLERGENS.map((name) => ({
      code: name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      name,
      category: 'General',
    }));
  }
}

export interface ClinicalFilterItem {
  ingredient_id: string;
  name: string;
  filter_type: 'allergen' | 'pregnancy' | 'age' | string;
  reason: string;
  details?: string;
}

/**
 * Fetch all catalog ingredients filtered by the authenticated user's clinical profile
 * (allergens, pregnancy status, and age group) from GET /profile/clinical-filters.
 */
export async function fetchUserClinicalFilters(): Promise<ClinicalFilterItem[]> {
  if (isMockEnabled('profile')) {
    return [];
  }

  try {
    const res = await api.get('/profile/clinical-filters');
    const items = res.data?.data?.filtered_ingredients;
    if (Array.isArray(items)) {
      return items.map((item: Record<string, unknown>) => ({
        ingredient_id: String(item.ingredient_id ?? item.id ?? ''),
        name: String(item.name ?? ''),
        filter_type: String(item.filter_type ?? 'allergen'),
        reason: String(item.reason ?? ''),
        details: typeof item.details === 'string' ? item.details : undefined,
      })).filter((item) => Boolean(item.ingredient_id || item.name));
    }
    return [];
  } catch (err) {
    console.warn('fetchUserClinicalFilters error:', err);
    return [];
  }
}

