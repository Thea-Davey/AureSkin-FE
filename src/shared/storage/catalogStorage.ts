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
  CATALOG_INGREDIENTS: '@aureskin/catalog/ingredients_v2',
  CATALOG_PRODUCTS: '@aureskin/catalog/products_v2',
  CATALOG_ARTICLES: '@aureskin/catalog/articles_v2',
  CATALOG_METADATA: '@aureskin/catalog/metadata_v2',
  CATALOG_INITIAL_DOWNLOADED: '@aureskin/catalog/initial_download_completed_v2',
  USER_ROUTINE: (userId: string) => `@aureskin/user/${userId}/routine_v2`,
  USER_HISTORY: (userId: string) => `@aureskin/user/${userId}/history_v2`,
  USER_HISTORY_DETAIL: (userId: string, id: string) => `@aureskin/user/${userId}/history_detail_${id}_v2`,
} as const;

const LEGACY_V1_KEYS = [
  '@aureskin/catalog/ingredients_v1',
  '@aureskin/catalog/products_v1',
  '@aureskin/catalog/articles_v1',
  '@aureskin/catalog/metadata_v1',
];

export const CURRENT_CATALOG_VERSION = 2;

const LEGACY_MOCK_ARTICLE_IDS = new Set([
  '5f90dc32-2a19-4bfb-996f-b1108215a8',
  '6ea71df2-90e5-4dba-88fa-fce37f76cc',
  'a44c464e-81f4-4008-b20c-7f97fe632',
  'f83fcc09-b01d-4552-ba8c-5ebca7a65',
]);

/**
 * Checks if an item ID corresponds to legacy mock fixtures
 * (e.g. 'ingredient-alanine', 'product-glycolic-toning-solution', 'mock-*', legacy mock articles).
 */
export function isMockCatalogItemId(id?: string | null): boolean {
  if (!id) return false;
  const lower = id.toLowerCase();
  return (
    lower.startsWith('ingredient-') ||
    lower.startsWith('product-') ||
    lower.startsWith('mock-') ||
    LEGACY_MOCK_ARTICLE_IDS.has(lower)
  );
}

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
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    // Discard immediately if legacy mock data was stored
    if (parsed.some((item) => isMockCatalogItemId(item?.id))) {
      await AsyncStorage.removeItem(STORAGE_KEYS.CATALOG_INGREDIENTS).catch(() => {});
      return null;
    }
    return parsed;
  } catch (err) {
    console.warn('[CatalogStorage] Error reading cached ingredients:', err);
    return null;
  }
}

export async function saveCachedIngredients(items: Ingredient[]): Promise<void> {
  try {
    // Only persist authentic database items, never mock items
    const cleanItems = items.filter((item) => !isMockCatalogItemId(item?.id));
    await AsyncStorage.setItem(STORAGE_KEYS.CATALOG_INGREDIENTS, JSON.stringify(cleanItems));
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
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    // Discard immediately if legacy mock data was stored
    if (parsed.some((item) => isMockCatalogItemId(item?.id))) {
      await AsyncStorage.removeItem(STORAGE_KEYS.CATALOG_PRODUCTS).catch(() => {});
      return null;
    }
    return parsed;
  } catch (err) {
    console.warn('[CatalogStorage] Error reading cached products:', err);
    return null;
  }
}

export async function saveCachedProducts(items: Product[]): Promise<void> {
  try {
    // Only persist authentic database items, never mock items
    const cleanItems = items.filter((item) => !isMockCatalogItemId(item?.id));
    await AsyncStorage.setItem(STORAGE_KEYS.CATALOG_PRODUCTS, JSON.stringify(cleanItems));
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
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    const cleaned = parsed.filter((item) => !isMockCatalogItemId(item?.id));
    return cleaned.length > 0 ? cleaned : null;
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
 * Checks if the initial catalog download has already completed successfully.
 */
export async function isInitialCatalogDownloaded(): Promise<boolean> {
  try {
    const val = await AsyncStorage.getItem(STORAGE_KEYS.CATALOG_INITIAL_DOWNLOADED);
    return val === 'true';
  } catch {
    return false;
  }
}

/**
 * Marks the one-time catalog download as completed (or resets it).
 */
export async function setInitialCatalogDownloaded(completed: boolean = true): Promise<void> {
  try {
    if (completed) {
      await AsyncStorage.setItem(STORAGE_KEYS.CATALOG_INITIAL_DOWNLOADED, 'true');
    } else {
      await AsyncStorage.removeItem(STORAGE_KEYS.CATALOG_INITIAL_DOWNLOADED);
    }
  } catch (err) {
    console.warn('[CatalogStorage] Error saving initial download flag:', err);
  }
}

/**
 * Checks whether valid permanent catalog data exists on device disk.
 */
export async function hasValidLocalCatalog(): Promise<boolean> {
  try {
    // 1. Instant check: If initial download was already completed, return fast true
    const isCompleted = await isInitialCatalogDownloaded();
    if (isCompleted) {
      return true;
    }

    const meta = await getCatalogMetadata();
    if (!meta || meta.version !== CURRENT_CATALOG_VERSION) {
      return false;
    }
    // Check that at least ingredients and products exist
    const [ingredients, products] = await Promise.all([
      getCachedIngredients(),
      getCachedProducts(),
    ]);
    if (!ingredients || ingredients.length === 0 || !products || products.length === 0) {
      return false;
    }
    // Guard against mock data pollution in persistent cache
    const hasMock =
      ingredients.some((item) => isMockCatalogItemId(item?.id)) ||
      products.some((item) => isMockCatalogItemId(item?.id));
    if (hasMock) {
      console.warn('[CatalogStorage] Detected legacy mock items in local cache. Invalidating cache.');
      await clearAllCatalogCache();
      return false;
    }

    // Persist completion flag for future app opens
    await setInitialCatalogDownloaded(true);
    return true;
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

export async function getCachedHistoryDetail<T = unknown>(
  userId: string,
  id: string
): Promise<T | null> {
  if (!userId || !id) return null;
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.USER_HISTORY_DETAIL(userId, id));
    if (!raw) return null;
    return safeJsonParse<T | null>(raw, null);
  } catch (err) {
    console.warn('[CatalogStorage] Error reading cached history detail:', err);
    return null;
  }
}

export async function saveCachedHistoryDetail<T = unknown>(
  userId: string,
  id: string,
  detail: T | null
): Promise<void> {
  if (!userId || !id) return;
  try {
    if (detail) {
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_HISTORY_DETAIL(userId, id),
        JSON.stringify(detail)
      );
    } else {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_HISTORY_DETAIL(userId, id));
    }
  } catch (err) {
    console.warn('[CatalogStorage] Error writing history detail to disk:', err);
  }
}

/**
 * Clears all cached catalog data (scrubs both v2 and legacy v1 keys).
 */
export async function clearAllCatalogCache(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.CATALOG_INGREDIENTS,
      STORAGE_KEYS.CATALOG_PRODUCTS,
      STORAGE_KEYS.CATALOG_ARTICLES,
      STORAGE_KEYS.CATALOG_METADATA,
      STORAGE_KEYS.CATALOG_INITIAL_DOWNLOADED,
      ...LEGACY_V1_KEYS,
    ]);
  } catch (err) {
    console.warn('[CatalogStorage] Error clearing catalog cache:', err);
  }
}

