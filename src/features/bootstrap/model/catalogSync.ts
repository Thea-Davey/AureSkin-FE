import { QueryClient } from '@tanstack/react-query';
import {
  getCachedIngredients,
  saveCachedIngredients,
  getCachedProducts,
  saveCachedProducts,
  getCachedArticles,
  saveCachedArticles,
  getCachedRoutine,
  saveCachedRoutine,
  getCachedHistory,
  saveCachedHistory,
  getCatalogMetadata,
  saveCatalogMetadata,
  hasValidLocalCatalog,
  CURRENT_CATALOG_VERSION,
} from '../../../shared/storage/catalogStorage';
import { fetchAllIngredients, fetchAllProducts } from '../../library/model/library_api';
import { fetchArticles } from '../../home/model/home_api';
import { fetchRoutine } from '../../routine/model/routine_api';
import { fetchHistoryPage } from '../../history/model/history_api';
import { useAuthStore } from '../../../shared/store/authStore';

/**
 * Hydrates TanStack Query cache directly from local device storage in ~15-30ms.
 * Returns true if local data was loaded successfully.
 */
export async function hydrateQueryClientFromDisk(queryClient: QueryClient): Promise<boolean> {
  try {
    const [cachedIngredients, cachedProducts, cachedArticles] = await Promise.all([
      getCachedIngredients(),
      getCachedProducts(),
      getCachedArticles(),
    ]);

    if (!cachedIngredients || !cachedProducts) {
      return false;
    }

    // 1. Warm raw catalog arrays
    queryClient.setQueryData(['library', 'all-ingredients'], cachedIngredients);
    queryClient.setQueryData(['library', 'all-products'], cachedProducts);

    // 2. Warm initial infinite query pages for 0ms Library tab rendering
    queryClient.setQueryData(['library', 'ingredients', ''], {
      pages: [
        {
          items: cachedIngredients.slice(0, 20),
          nextOffset: cachedIngredients.length > 20 ? 20 : null,
        },
      ],
      pageParams: [0],
    });

    queryClient.setQueryData(['library', 'products', '', null], {
      pages: [
        {
          items: cachedProducts.slice(0, 20),
          nextOffset: cachedProducts.length > 20 ? 20 : null,
        },
      ],
      pageParams: [0],
    });

    // 3. Warm articles
    if (cachedArticles && cachedArticles.length > 0) {
      queryClient.setQueryData(['articles'], cachedArticles);
    }

    // 4. Warm user data if authenticated
    const authState = useAuthStore.getState();
    const userId = authState.user?.id;
    if (authState.isAuthenticated && userId) {
      const [cachedRoutine, cachedHistory] = await Promise.all([
        getCachedRoutine(userId),
        getCachedHistory(userId),
      ]);

      if (cachedRoutine !== undefined) {
        queryClient.setQueryData(['routine', 'current'], cachedRoutine);
      }
      if (cachedHistory) {
        const pagesData = (cachedHistory as any)?.pages
          ? cachedHistory
          : { pages: [cachedHistory], pageParams: [0] };
        queryClient.setQueryData(['history', 'list', userId], pagesData);
        queryClient.setQueryData(['history', 'list'], pagesData);
      }
    }

    return true;
  } catch (err) {
    console.warn('[CatalogSync] Disk hydration error:', err);
    return false;
  }
}

/**
 * Cold Boot: Fetches entire catalog from server in parallel, writes to disk,
 * and primes TanStack QueryClient.
 */
export async function downloadAndPersistFullCatalog(
  queryClient: QueryClient,
  onStepProgress?: (stepId: string) => void
): Promise<void> {
  onStepProgress?.('connect');

  // Parallel download of full catalogs
  const [ingredientsResult, productsResult, articlesResult] = await Promise.allSettled([
    (async () => {
      try {
        const items = await fetchAllIngredients();
        await saveCachedIngredients(items);
        queryClient.setQueryData(['library', 'all-ingredients'], items);
        queryClient.setQueryData(['library', 'ingredients', ''], {
          pages: [
            {
              items: items.slice(0, 20),
              nextOffset: items.length > 20 ? 20 : null,
            },
          ],
          pageParams: [0],
        });
        return items;
      } finally {
        onStepProgress?.('ingredients');
      }
    })(),

    (async () => {
      try {
        const items = await fetchAllProducts();
        await saveCachedProducts(items);
        queryClient.setQueryData(['library', 'all-products'], items);
        queryClient.setQueryData(['library', 'products', '', null], {
          pages: [
            {
              items: items.slice(0, 20),
              nextOffset: items.length > 20 ? 20 : null,
            },
          ],
          pageParams: [0],
        });
        return items;
      } finally {
        onStepProgress?.('products');
      }
    })(),

    (async () => {
      try {
        const items = await fetchArticles();
        await saveCachedArticles(items);
        queryClient.setQueryData(['articles'], items);
        return items;
      } finally {
        onStepProgress?.('articles');
      }
    })(),
  ]);

  const ingredients = ingredientsResult.status === 'fulfilled' ? ingredientsResult.value : [];
  const products = productsResult.status === 'fulfilled' ? productsResult.value : [];
  const articles = articlesResult.status === 'fulfilled' ? articlesResult.value : [];

  // Update catalog metadata
  await saveCatalogMetadata({
    version: CURRENT_CATALOG_VERSION,
    lastSyncedAt: Date.now(),
    ingredientCount: ingredients.length,
    productCount: products.length,
    articleCount: articles.length,
  });

  // If user is authenticated, also warm and persist routine & history
  const authState = useAuthStore.getState();
  const userId = authState.user?.id;
  if (authState.isAuthenticated && userId) {
    try {
      const [routine, history] = await Promise.all([
        fetchRoutine().catch(() => null),
        fetchHistoryPage({ limit: 20, offset: 0 }).catch(() => null),
      ]);

      if (routine !== undefined) {
        await saveCachedRoutine(userId, routine);
        queryClient.setQueryData(['routine', 'current'], routine);
      }
      if (history) {
        await saveCachedHistory(userId, history);
        const pagesPayload = {
          pages: [history],
          pageParams: [0],
        };
        queryClient.setQueryData(['history', 'list', userId], pagesPayload);
        queryClient.setQueryData(['history', 'list'], pagesPayload);
      }
    } catch (err) {
      console.warn('[CatalogSync] User data warmup warning:', err);
    }
  }

  onStepProgress?.('ready');
}

let isSyncInProgress = false;

/**
 * Non-blocking silent background sync: checks for new data without showing any UI spinner.
 */
export async function silentBackgroundSync(queryClient: QueryClient): Promise<void> {
  if (isSyncInProgress) return;
  isSyncInProgress = true;

  try {
    const meta = await getCatalogMetadata();
    const now = Date.now();
    const SIX_HOURS_MS = 1000 * 60 * 60 * 6;

    // Throttle silent sync to at most once every 6 hours unless version changed
    if (meta && now - meta.lastSyncedAt < SIX_HOURS_MS && meta.version === CURRENT_CATALOG_VERSION) {
      console.log('[CatalogSync] Local disk cache is fresh. Skipping background sync.');
      isSyncInProgress = false;
      return;
    }

    console.log('[CatalogSync] Starting silent background delta sync...');

    const [ingredients, products, articles] = await Promise.all([
      fetchAllIngredients().catch(() => null),
      fetchAllProducts().catch(() => null),
      fetchArticles().catch(() => null),
    ]);

    if (ingredients && ingredients.length > 0) {
      await saveCachedIngredients(ingredients);
      queryClient.setQueryData(['library', 'all-ingredients'], ingredients);
    }

    if (products && products.length > 0) {
      await saveCachedProducts(products);
      queryClient.setQueryData(['library', 'all-products'], products);
    }

    if (articles && articles.length > 0) {
      await saveCachedArticles(articles);
      queryClient.setQueryData(['articles'], articles);
    }

    await saveCatalogMetadata({
      version: CURRENT_CATALOG_VERSION,
      lastSyncedAt: now,
      ingredientCount: ingredients ? ingredients.length : meta?.ingredientCount ?? 0,
      productCount: products ? products.length : meta?.productCount ?? 0,
      articleCount: articles ? articles.length : meta?.articleCount ?? 0,
    });

    console.log('[CatalogSync] Silent background sync completed successfully.');
  } catch (err) {
    console.warn('[CatalogSync] Silent background sync failed silently (offline/network):', err);
  } finally {
    isSyncInProgress = false;
  }
}
export { hasValidLocalCatalog };

