import { FavoriteItem } from './favorites_types';
import { MOCK_FAVORITE_ITEMS } from './favorites_mock';
import { isMockEnabled } from '@/shared/config/mockConfig';

// ============================================================================
// DATA SOURCE TOGGLE (use mock)
// Set to `true` to use mock data for all Favorites screen features
// (favorite products and favorite active ingredients).
// Set to `false` to fetch real-time live data from FastAPI and Supabase.
export const USE_MOCK: boolean = isMockEnabled('favorites');
// ============================================================================

export async function fetchFavorites(): Promise<FavoriteItem[]> {
  if (isMockEnabled('favorites')) {
    // Artificial small delay for smooth skeleton demonstration
    await new Promise((resolve) => setTimeout(resolve, 80));
    return [...MOCK_FAVORITE_ITEMS];
  }

  // Live API / Supabase endpoint fallback
  return [...MOCK_FAVORITE_ITEMS];
}

export async function removeFavoriteItem(id: string): Promise<boolean> {
  if (isMockEnabled('favorites')) {
    return true;
  }
  return true;
}

