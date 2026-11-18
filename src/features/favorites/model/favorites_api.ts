import AsyncStorage from '@react-native-async-storage/async-storage';
import { FavoriteItem } from './favorites_types';
import { MOCK_FAVORITE_ITEMS } from './favorites_mock';
import { isMockEnabled } from '@/shared/config/mockConfig';
import { supabase } from '@/shared/services/supabase';
import { useAuthStore } from '@/shared/store/authStore';
import { getCachedIngredients, getCachedProducts } from '@/shared/storage/catalogStorage';
import {
  fetchIngredientById,
  fetchProductById,
} from '@/features/library/model/library_api';
import { Ingredient, Product } from '@/features/library/model/library_types';

// ============================================================================
// DATA SOURCE TOGGLE (use mock)
// Set to `true` to use mock data for all Favorites screen features.
// Set to `false` to store and retrieve authentic user favorites.
export const USE_MOCK: boolean = isMockEnabled('favorites');
// ============================================================================

const FAVORITES_STORAGE_KEY_PREFIX = '@aureskin_favorites_';

/**
 * Resolves the active user ID consistently across all Library & Favorites hooks.
 * Prioritizes explicit userId -> Zustand authStore (synchronous, matches Library)
 * -> active Supabase session -> 'anonymous'.
 */
async function resolveUserId(explicitUserId?: string | null): Promise<string> {
  if (explicitUserId && explicitUserId.trim().length > 0) {
    return explicitUserId;
  }

  const storeUserId = useAuthStore.getState().user?.id;
  if (storeUserId) {
    return storeUserId;
  }

  try {
    const { data } = await supabase.auth.getSession();
    if (data?.session?.user?.id) {
      return data.session.user.id;
    }
  } catch {
    // fallback
  }

  return 'anonymous';
}

function getIngredientIdsKey(userId: string): string {
  return `@aureskin/ingredient-favorites/${userId}`;
}

function getProductIdsKey(userId: string): string {
  return `@aureskin/product-favorites/${userId}`;
}

function getMetadataCacheKey(userId: string): string {
  return `${FAVORITES_STORAGE_KEY_PREFIX}${userId}`;
}

export async function getFavoritesStorageKey(explicitUserId?: string | null): Promise<string> {
  const userId = await resolveUserId(explicitUserId);
  return getMetadataCacheKey(userId);
}

function safeParseStringArray(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
    }
  } catch {
    // ignore corrupt storage
  }
  return [];
}

function safeParseFavorites(raw: string | null): FavoriteItem[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed as FavoriteItem[];
    }
  } catch {
    // ignore corrupt storage
  }
  return [];
}

/**
 * Fetch favorite items for the authenticated user.
 * Treats the per-user ID arrays written by Library (`ingredient-favorites` & `product-favorites`)
 * as the strict source of truth so unfavoriting (including the last item) and switching accounts
 * always remain 100% synchronized.
 */
export async function fetchFavorites(explicitUserId?: string | null): Promise<FavoriteItem[]> {
  if (isMockEnabled('favorites')) {
    await new Promise((resolve) => setTimeout(resolve, 80));
    return [...MOCK_FAVORITE_ITEMS];
  }

  try {
    const currentUserId = await resolveUserId(explicitUserId);
    const metaKey = getMetadataCacheKey(currentUserId);
    const ingKey = getIngredientIdsKey(currentUserId);
    const prodKey = getProductIdsKey(currentUserId);

    // 1. Read authoritative per-user ID lists + cached metadata objects
    const [storedRaw, ingredientIdsRaw, productIdsRaw] = await Promise.all([
      AsyncStorage.getItem(metaKey),
      AsyncStorage.getItem(ingKey),
      AsyncStorage.getItem(prodKey),
    ]);

    const storedItems = safeParseFavorites(storedRaw);
    const ingredientIds = Array.from(new Set(safeParseStringArray(ingredientIdsRaw)));
    const productIds = Array.from(new Set(safeParseStringArray(productIdsRaw)));

    // Build quick lookup from previously cached FavoriteItem metadata
    const cachedIngredientMeta = new Map<string, Ingredient>();
    const cachedProductMeta = new Map<string, Product>();
    for (const item of storedItems) {
      if (item.type === 'ingredient' && item.ingredient?.id) {
        cachedIngredientMeta.set(item.ingredient.id, item.ingredient);
      } else if (item.type === 'product') {
        const prod = item.product ?? item.productItem?.product;
        if (prod?.id) {
          cachedProductMeta.set(prod.id, prod);
        }
      }
    }

    const activeFavorites: FavoriteItem[] = [];

    // 2. Resolve every active favorite ingredient ID
    if (ingredientIds.length > 0) {
      const diskIngredients = await getCachedIngredients().catch(() => null);
      const resolvedIngredients = await Promise.all(
        ingredientIds.map(async (id): Promise<FavoriteItem | null> => {
          const fromMeta = cachedIngredientMeta.get(id);
          if (fromMeta) {
            return { type: 'ingredient', id: fromMeta.id, ingredient: fromMeta };
          }
          const fromDisk = diskIngredients?.find((i) => i.id === id);
          if (fromDisk) {
            return { type: 'ingredient', id: fromDisk.id, ingredient: fromDisk };
          }
          // Live API fallback so favorites ALWAYS work on any account even without local disk cache
          try {
            const liveIng = await fetchIngredientById(id);
            return { type: 'ingredient', id: liveIng.id, ingredient: liveIng };
          } catch {
            return null;
          }
        })
      );

      for (const item of resolvedIngredients) {
        if (item) activeFavorites.push(item);
      }
    }

    // 3. Resolve every active favorite product ID
    if (productIds.length > 0) {
      const diskProducts = await getCachedProducts().catch(() => null);
      const resolvedProducts = await Promise.all(
        productIds.map(async (id): Promise<FavoriteItem | null> => {
          const fromMeta = cachedProductMeta.get(id);
          if (fromMeta) {
            return { type: 'product', id: fromMeta.id, product: fromMeta };
          }
          const fromDisk = diskProducts?.find((p) => p.id === id);
          if (fromDisk) {
            return { type: 'product', id: fromDisk.id, product: fromDisk };
          }
          // Live API fallback (essential for custom user products & fresh accounts)
          try {
            const liveProd = await fetchProductById(id);
            return { type: 'product', id: liveProd.id, product: liveProd };
          } catch {
            return null;
          }
        })
      );

      for (const item of resolvedProducts) {
        if (item) activeFavorites.push(item);
      }
    }

    // Keep metadata cache pruned & synchronized with active IDs
    await AsyncStorage.setItem(metaKey, JSON.stringify(activeFavorites)).catch(() => {});

    return activeFavorites;
  } catch {
    return [];
  }
}

/**
 * Save an item to favorites in live storage.
 */
export async function saveFavoriteItem(
  item: FavoriteItem,
  explicitUserId?: string | null
): Promise<boolean> {
  if (isMockEnabled('favorites')) {
    return true;
  }

  try {
    const currentUserId = await resolveUserId(explicitUserId);
    const metaKey = getMetadataCacheKey(currentUserId);

    // Update authoritative ID list first
    if (item.type === 'ingredient') {
      const idKey = getIngredientIdsKey(currentUserId);
      const ids = safeParseStringArray(await AsyncStorage.getItem(idKey));
      if (!ids.includes(item.id)) {
        await AsyncStorage.setItem(idKey, JSON.stringify([...ids, item.id]));
      }
    } else if (item.type === 'product') {
      const idKey = getProductIdsKey(currentUserId);
      const ids = safeParseStringArray(await AsyncStorage.getItem(idKey));
      if (!ids.includes(item.id)) {
        await AsyncStorage.setItem(idKey, JSON.stringify([...ids, item.id]));
      }
    }

    // Update metadata cache
    const stored = safeParseFavorites(await AsyncStorage.getItem(metaKey));
    if (!stored.some((f) => f.id === item.id)) {
      await AsyncStorage.setItem(metaKey, JSON.stringify([item, ...stored]));
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Remove an item from favorites across all storage keys for the active user.
 */
export async function removeFavoriteItem(
  id: string,
  explicitUserId?: string | null
): Promise<boolean> {
  if (isMockEnabled('favorites')) {
    return true;
  }

  try {
    const currentUserId = await resolveUserId(explicitUserId);
    const metaKey = getMetadataCacheKey(currentUserId);
    const ingKey = getIngredientIdsKey(currentUserId);
    const prodKey = getProductIdsKey(currentUserId);

    const [storedRaw, rawIng, rawProd] = await Promise.all([
      AsyncStorage.getItem(metaKey),
      AsyncStorage.getItem(ingKey),
      AsyncStorage.getItem(prodKey),
    ]);

    const updatedMeta = safeParseFavorites(storedRaw).filter((item) => {
      if (item.id === id) return false;
      if (item.type === 'ingredient' && item.ingredient?.id === id) return false;
      if (item.type === 'product') {
        const prodId = item.product?.id ?? item.productItem?.product.id;
        if (prodId === id) return false;
      }
      return true;
    });

    const updatedIngIds = safeParseStringArray(rawIng).filter((item) => item !== id);
    const updatedProdIds = safeParseStringArray(rawProd).filter((item) => item !== id);

    await Promise.all([
      AsyncStorage.setItem(metaKey, JSON.stringify(updatedMeta)),
      AsyncStorage.setItem(ingKey, JSON.stringify(updatedIngIds)),
      AsyncStorage.setItem(prodKey, JSON.stringify(updatedProdIds)),
    ]);

    return true;
  } catch {
    return false;
  }
}

/**
 * Helper to sync a toggled ingredient directly with favorites.
 */
export async function syncFavoriteIngredient(
  ingredient: Ingredient,
  isFavorite: boolean,
  explicitUserId?: string | null
): Promise<void> {
  if (isFavorite) {
    await saveFavoriteItem(
      {
        type: 'ingredient',
        id: ingredient.id,
        ingredient,
      },
      explicitUserId
    );
  } else {
    await removeFavoriteItem(ingredient.id, explicitUserId);
  }
}

/**
 * Helper to sync a toggled product directly with favorites.
 */
export async function syncFavoriteProduct(
  product: Product,
  isFavorite: boolean,
  explicitUserId?: string | null
): Promise<void> {
  if (isFavorite) {
    await saveFavoriteItem(
      {
        type: 'product',
        id: product.id,
        product,
      },
      explicitUserId
    );
  } else {
    await removeFavoriteItem(product.id, explicitUserId);
  }
}
