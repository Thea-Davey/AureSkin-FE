import { api } from '../../../shared/services/api';
import { supabase } from '../../../shared/services/supabase';
import { isMockEnabled } from '@/shared/config/mockConfig';
import { UserProfile, EditProfileDraft } from './profile_types';
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
 * Update authenticated user's profile metadata in Supabase and backend.
 */
export async function updateUserProfile(draft: EditProfileDraft): Promise<boolean> {
  if (isMockEnabled('profile')) {
    return true;
  }

  try {
    const displayName = `${draft.firstName} ${draft.lastName}`.trim() || draft.username || '';

    // 1. Update Supabase Auth user metadata
    const { error: supaErr } = await supabase.auth.updateUser({
      data: {
        first_name: draft.firstName,
        last_name: draft.lastName,
        display_name: displayName,
        username: draft.username,
        date_of_birth: draft.dateOfBirth,
        gender: draft.gender,
        phone_number: draft.phoneNumber,
        allergens: draft.allergens,
        avatar_url: draft.avatarUri,
      },
    });

    if (supaErr) {
      console.warn('Supabase updateUser error:', supaErr);
    }

    // 2. Sync with backend PUT /profile
    try {
      await api.put('/profile', {
        display_name: displayName,
        avatar_url: draft.avatarUri || undefined,
      });
    } catch (apiErr) {
      console.warn('Backend PUT /profile error:', apiErr);
    }

    return true;
  } catch (err) {
    console.warn('updateUserProfile failed:', err);
    return false;
  }
}

