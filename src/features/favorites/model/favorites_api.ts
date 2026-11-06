import AsyncStorage from '@react-native-async-storage/async-storage';
import { FavoriteItem } from './favorites_types';
import { MOCK_FAVORITE_ITEMS } from './favorites_mock';
import { isMockEnabled } from '@/shared/config/mockConfig';
import { supabase } from '@/shared/services/supabase';

// ============================================================================
// DATA SOURCE TOGGLE (use mock)
// Set to `true` to use mock data for all Favorites screen features.
// Set to `false` to store and retrieve authentic user favorites.
export const USE_MOCK: boolean = isMockEnabled('favorites');
// ============================================================================

const FAVORITES_STORAGE_KEY_PREFIX = '@aureskin_favorites_';

async function getFavoritesStorageKey(): Promise<string> {
  try {
    const { data } = await supabase.auth.getUser();
    if (data?.user?.id) {
      return `${FAVORITES_STORAGE_KEY_PREFIX}${data.user.id}`;
    }
  } catch {
    // fallback
  }
  return `${FAVORITES_STORAGE_KEY_PREFIX}guest`;
}

/**
 * Fetch favorite items for the authenticated user.
 * In live mode, retrieves user-persisted items from AsyncStorage.
 * For fresh accounts, returns an empty array.
 */
export async function fetchFavorites(): Promise<FavoriteItem[]> {
  if (isMockEnabled('favorites')) {
    // Artificial small delay for smooth skeleton demonstration
    await new Promise((resolve) => setTimeout(resolve, 80));
    return [...MOCK_FAVORITE_ITEMS];
  }

  try {
    const key = await getFavoritesStorageKey();
    const stored = await AsyncStorage.getItem(key);
    if (!stored) {
      return [];
    }
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? (parsed as FavoriteItem[]) : [];
  } catch {
    return [];
  }
}

/**
 * Save an item to favorites in live storage.
 */
export async function saveFavoriteItem(item: FavoriteItem): Promise<boolean> {
  if (isMockEnabled('favorites')) {
    return true;
  }

  try {
    const key = await getFavoritesStorageKey();
    const current = await fetchFavorites();
    const exists = current.some((f) => f.id === item.id);
    if (!exists) {
      const updated = [item, ...current];
      await AsyncStorage.setItem(key, JSON.stringify(updated));
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Remove an item from favorites in live storage.
 */
export async function removeFavoriteItem(id: string): Promise<boolean> {
  if (isMockEnabled('favorites')) {
    return true;
  }

  try {
    const key = await getFavoritesStorageKey();
    const current = await fetchFavorites();
    const updated = current.filter((item) => item.id !== id);
    await AsyncStorage.setItem(key, JSON.stringify(updated));
    return true;
  } catch {
    return false;
  }
}
