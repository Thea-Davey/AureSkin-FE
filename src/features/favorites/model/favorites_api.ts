import AsyncStorage from '@react-native-async-storage/async-storage';
import { FavoriteItem } from './favorites_types';
import { MOCK_FAVORITE_ITEMS } from './favorites_mock';
import { isMockEnabled } from '@/shared/config/mockConfig';
import { supabase } from '@/shared/services/supabase';
import { getCachedIngredients, getCachedProducts } from '@/shared/storage/catalogStorage';
import { MOCK_INGREDIENTS, MOCK_PRODUCTS } from '@/features/library/model/library_mock';
import { Ingredient, Product } from '@/features/library/model/library_types';

// ============================================================================
// DATA SOURCE TOGGLE (use mock)
// Set to `true` to use mock data for all Favorites screen features.
// Set to `false` to store and retrieve authentic user favorites.
export const USE_MOCK: boolean = isMockEnabled('favorites');
// ============================================================================

const FAVORITES_STORAGE_KEY_PREFIX = '@aureskin_favorites_';

export async function getFavoritesStorageKey(): Promise<string> {
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

async function getUserId(): Promise<string> {
  try {
    const { data } = await supabase.auth.getUser();
    if (data?.user?.id) {
      return data.user.id;
    }
  } catch {
    // fallback
  }
  return 'anonymous';
}

/**
 * Fetch favorite items for the authenticated user.
 * In live mode, retrieves user-persisted items and aggregates
 * ingredient-favorites and product-favorites IDs from disk cache.
 */
export async function fetchFavorites(): Promise<FavoriteItem[]> {
  if (isMockEnabled('favorites')) {
    await new Promise((resolve) => setTimeout(resolve, 80));
    return [...MOCK_FAVORITE_ITEMS];
  }

  try {
    const userKey = await getFavoritesStorageKey();
    const currentUserId = await getUserId();

    // 1. Read explicitly stored FavoriteItem objects
    const stored = await AsyncStorage.getItem(userKey);
    const storedItems: FavoriteItem[] = stored ? JSON.parse(stored) : [];

    // 2. Read ID arrays saved by useIngredients & useProducts
    const ingredientIdsRaw = await AsyncStorage.getItem(`@aureskin/ingredient-favorites/${currentUserId}`);
    const productIdsRaw = await AsyncStorage.getItem(`@aureskin/product-favorites/${currentUserId}`);

    const ingredientIds: string[] = ingredientIdsRaw ? JSON.parse(ingredientIdsRaw) : [];
    const productIds: string[] = productIdsRaw ? JSON.parse(productIdsRaw) : [];

    const existingMap = new Map<string, FavoriteItem>();
    for (const item of storedItems) {
      existingMap.set(item.id, item);
      if (item.type === 'ingredient' && item.ingredient?.id) {
        existingMap.set(item.ingredient.id, item);
      }
      if (item.type === 'product') {
        const prodId = item.product?.id ?? item.productItem?.product.id;
        if (prodId) existingMap.set(prodId, item);
      }
    }

    // 3. Resolve any ingredient IDs that aren't yet in existingMap
    const cachedIngredients = await getCachedIngredients();
    for (const id of ingredientIds) {
      if (!existingMap.has(id)) {
        const found =
          cachedIngredients?.find((i) => i.id === id) ??
          MOCK_INGREDIENTS.find((i) => i.id === id);
        if (found) {
          existingMap.set(id, {
            type: 'ingredient',
            id: found.id,
            ingredient: found,
          });
        }
      }
    }

    // 4. Resolve any product IDs that aren't yet in existingMap
    const cachedProducts = await getCachedProducts();
    for (const id of productIds) {
      if (!existingMap.has(id)) {
        const found =
          cachedProducts?.find((p) => p.id === id) ??
          MOCK_PRODUCTS.find((p) => p.id === id);
        if (found) {
          existingMap.set(id, {
            type: 'product',
            id: found.id,
            product: found,
          });
        }
      }
    }

    // Filter to only items whose IDs remain active in favorites
    const activeFavorites: FavoriteItem[] = [];
    const seen = new Set<string>();

    for (const item of existingMap.values()) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);

      if (item.type === 'ingredient') {
        if (ingredientIds.length === 0 || ingredientIds.includes(item.id) || ingredientIds.includes(item.ingredient?.id)) {
          activeFavorites.push(item);
        }
      } else if (item.type === 'product') {
        const prodId = item.product?.id ?? item.productItem?.product.id ?? item.id;
        if (productIds.length === 0 || productIds.includes(prodId)) {
          activeFavorites.push(item);
        }
      }
    }

    return activeFavorites;
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
    const currentUserId = await getUserId();
    const current = await fetchFavorites();
    const exists = current.some((f) => f.id === item.id);
    if (!exists) {
      const updated = [item, ...current];
      await AsyncStorage.setItem(key, JSON.stringify(updated));
    }

    // Also update individual ID arrays
    if (item.type === 'ingredient') {
      const idKey = `@aureskin/ingredient-favorites/${currentUserId}`;
      const raw = await AsyncStorage.getItem(idKey);
      const ids: string[] = raw ? JSON.parse(raw) : [];
      if (!ids.includes(item.id)) {
        await AsyncStorage.setItem(idKey, JSON.stringify([...ids, item.id]));
      }
    } else if (item.type === 'product') {
      const idKey = `@aureskin/product-favorites/${currentUserId}`;
      const raw = await AsyncStorage.getItem(idKey);
      const ids: string[] = raw ? JSON.parse(raw) : [];
      if (!ids.includes(item.id)) {
        await AsyncStorage.setItem(idKey, JSON.stringify([...ids, item.id]));
      }
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
    const currentUserId = await getUserId();
    const current = await fetchFavorites();
    const updated = current.filter((item) => {
      if (item.id === id) return false;
      if (item.type === 'ingredient' && item.ingredient?.id === id) return false;
      if (item.type === 'product') {
        const prodId = item.product?.id ?? item.productItem?.product.id;
        if (prodId === id) return false;
      }
      return true;
    });
    await AsyncStorage.setItem(key, JSON.stringify(updated));

    // Also clean up individual ID arrays
    const ingKey = `@aureskin/ingredient-favorites/${currentUserId}`;
    const rawIng = await AsyncStorage.getItem(ingKey);
    if (rawIng) {
      const ingIds: string[] = JSON.parse(rawIng);
      await AsyncStorage.setItem(ingKey, JSON.stringify(ingIds.filter((item) => item !== id)));
    }

    const prodKey = `@aureskin/product-favorites/${currentUserId}`;
    const rawProd = await AsyncStorage.getItem(prodKey);
    if (rawProd) {
      const prodIds: string[] = JSON.parse(rawProd);
      await AsyncStorage.setItem(prodKey, JSON.stringify(prodIds.filter((item) => item !== id)));
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Helper to sync a toggled ingredient directly with favorites.
 */
export async function syncFavoriteIngredient(ingredient: Ingredient, isFavorite: boolean): Promise<void> {
  if (isFavorite) {
    await saveFavoriteItem({
      type: 'ingredient',
      id: ingredient.id,
      ingredient,
    });
  } else {
    await removeFavoriteItem(ingredient.id);
  }
}

/**
 * Helper to sync a toggled product directly with favorites.
 */
export async function syncFavoriteProduct(product: Product, isFavorite: boolean): Promise<void> {
  if (isFavorite) {
    await saveFavoriteItem({
      type: 'product',
      id: product.id,
      product,
    });
  } else {
    await removeFavoriteItem(product.id);
  }
}
