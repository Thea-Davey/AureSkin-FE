import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ingredient, Product } from '../../features/library/model/library_types';
import { Article } from '../../features/home/model/home_types';
import { SkincareRoutine } from '../../features/routine/model/routine_types';

export interface CatalogMetadata {
  version: number;
  lastSyncedAt: number;
  ingredientCount: number;
  productCount: number;
  articleCount: number;
}

const STORAGE_KEYS = {
  CATALOG_INGREDIENTS: '@aureskin/catalog/ingredients_v1',
  CATALOG_PRODUCTS: '@aureskin/catalog/products_v1',
  CATALOG_ARTICLES: '@aureskin/catalog/articles_v1',
  CATALOG_METADATA: '@aureskin/catalog/metadata_v1',
  USER_ROUTINE: (userId: string) => `@aureskin/user/${userId}/routine_v1`,
  USER_HISTORY: (userId: string) => `@aureskin/user/${userId}/history_v1`,
} as const;

export const CURRENT_CATALOG_VERSION = 1;

/**
 * Safely parse JSON from AsyncStorage with a fallback.
 */
function safeJsonParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn('[CatalogStorage] Failed to parse cached JSON:', err);
    return fallback;
  }
}

// ============================================================================
// INGREDIENTS CACHE
// ============================================================================

export async function getCachedIngredients(): Promise<Ingredient[] | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.CATALOG_INGREDIENTS);
    if (!raw) return null;
    const parsed = safeJsonParse<Ingredient[] | null>(raw, null);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
  } catch (err) {
    console.warn('[CatalogStorage] Error reading cached ingredients:', err);
    return null;
  }
}

export async function saveCachedIngredients(items: Ingredient[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.CATALOG_INGREDIENTS, JSON.stringify(items));
  } catch (err) {
    console.warn('[CatalogStorage] Error writing ingredients to disk:', err);
  }
}

// ============================================================================
// PRODUCTS CACHE
// ============================================================================

export async function getCachedProducts(): Promise<Product[] | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.CATALOG_PRODUCTS);
    if (!raw) return null;
    const parsed = safeJsonParse<Product[] | null>(raw, null);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
  } catch (err) {
    console.warn('[CatalogStorage] Error reading cached products:', err);
    return null;
  }
}

export async function saveCachedProducts(items: Product[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.CATALOG_PRODUCTS, JSON.stringify(items));
  } catch (err) {
    console.warn('[CatalogStorage] Error writing products to disk:', err);
  }
}

// ============================================================================
// ARTICLES CACHE
// ============================================================================

export async function getCachedArticles(): Promise<Article[] | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.CATALOG_ARTICLES);
    if (!raw) return null;
    const parsed = safeJsonParse<Article[] | null>(raw, null);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
  } catch (err) {
    console.warn('[CatalogStorage] Error reading cached articles:', err);
    return null;
  }
}

export async function saveCachedArticles(items: Article[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.CATALOG_ARTICLES, JSON.stringify(items));
  } catch (err) {
    console.warn('[CatalogStorage] Error writing articles to disk:', err);
  }
}

// ============================================================================
// METADATA
// ============================================================================

export async function getCatalogMetadata(): Promise<CatalogMetadata | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.CATALOG_METADATA);
    if (!raw) return null;
    return safeJsonParse<CatalogMetadata | null>(raw, null);
  } catch (err) {
    console.warn('[CatalogStorage] Error reading catalog metadata:', err);
    return null;
  }
}

export async function saveCatalogMetadata(metadata: CatalogMetadata): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.CATALOG_METADATA, JSON.stringify(metadata));
  } catch (err) {
    console.warn('[CatalogStorage] Error writing catalog metadata:', err);
  }
}

/**
 * Checks whether valid permanent catalog data exists on device disk.
 */
export async function hasValidLocalCatalog(): Promise<boolean> {
  try {
    const meta = await getCatalogMetadata();
    if (!meta || meta.version !== CURRENT_CATALOG_VERSION) {
      return false;
    }
    // Check that at least ingredients and products exist
    const [ingredients, products] = await Promise.all([
      getCachedIngredients(),
      getCachedProducts(),
    ]);
    return !!(ingredients && ingredients.length > 0 && products && products.length > 0);
  } catch {
    return false;
  }
}

// ============================================================================
// USER-SCOPED PERSISTENCE (Stale-While-Revalidate)
// ============================================================================

export async function getCachedRoutine(userId: string): Promise<SkincareRoutine | null> {
  if (!userId) return null;
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.USER_ROUTINE(userId));
    if (!raw) return null;
    return safeJsonParse<SkincareRoutine | null>(raw, null);
  } catch (err) {
    console.warn('[CatalogStorage] Error reading cached routine:', err);
    return null;
  }
}

export async function saveCachedRoutine(
  userId: string,
  routine: SkincareRoutine | null
): Promise<void> {
  if (!userId) return;
  try {
    if (routine) {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_ROUTINE(userId), JSON.stringify(routine));
    } else {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_ROUTINE(userId));
    }
  } catch (err) {
    console.warn('[CatalogStorage] Error writing routine to disk:', err);
  }
}

export async function getCachedHistory<T = unknown>(userId: string): Promise<T | null> {
  if (!userId) return null;
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.USER_HISTORY(userId));
    if (!raw) return null;
    return safeJsonParse<T | null>(raw, null);
  } catch (err) {
    console.warn('[CatalogStorage] Error reading cached history:', err);
    return null;
  }
}

export async function saveCachedHistory<T = unknown>(
  userId: string,
  history: T | null
): Promise<void> {
  if (!userId) return;
  try {
    if (history) {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_HISTORY(userId), JSON.stringify(history));
    } else {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_HISTORY(userId));
    }
  } catch (err) {
    console.warn('[CatalogStorage] Error writing history to disk:', err);
  }
}

/**
 * Clears all cached catalog data (used for debugging or explicit cache invalidation).
 */
export async function clearAllCatalogCache(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.CATALOG_INGREDIENTS,
      STORAGE_KEYS.CATALOG_PRODUCTS,
      STORAGE_KEYS.CATALOG_ARTICLES,
      STORAGE_KEYS.CATALOG_METADATA,
    ]);
  } catch (err) {
    console.warn('[CatalogStorage] Error clearing catalog cache:', err);
  }
}

