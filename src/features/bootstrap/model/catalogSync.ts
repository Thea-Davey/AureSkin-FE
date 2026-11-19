import { QueryClient } from '@tanstack/react-query';
import { Ingredient, Product } from '../../library/model/library_types';
import { Article } from '../../home/model/home_types';
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
  isInitialCatalogDownloaded,
  setInitialCatalogDownloaded,
  clearAllCatalogCache,
  isMockCatalogItemId,
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

    // Guard against mock data pollution in persistent cache
    if (
      cachedIngredients.some((i) => isMockCatalogItemId(i?.id)) ||
      cachedProducts.some((p) => isMockCatalogItemId(p?.id)) ||
      cachedArticles?.some((a) => isMockCatalogItemId(a?.id))
    ) {
      console.warn('[CatalogSync] Found legacy mock data in disk cache. Purging and downloading real data.');
      await clearAllCatalogCache();
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
 * Cold Boot: Sequentially downloads the entire catalog (ingredients then products),
 * persists directly to device storage, and primes TanStack QueryClient.
 * Strict sequential execution prevents cloud container OOM memory spikes.
 */
export async function downloadAndPersistFullCatalog(
  queryClient: QueryClient,
  onStepProgress?: (stepId: string, customLabel?: string) => void
): Promise<void> {
  onStepProgress?.('connect', 'Connecting to AureSkin service...');

  // 1. Sequentially fetch and persist Ingredients
  onStepProgress?.('ingredients', 'Downloading ingredients directory...');
  let ingredients: Ingredient[] = [];
  try {
    ingredients = await fetchAllIngredients((count) => {
      onStepProgress?.('ingredients', `Downloading ingredients (${count} items)...`);
    });
    if (ingredients.length > 0) {
      await saveCachedIngredients(ingredients);
      queryClient.setQueryData(['library', 'all-ingredients'], ingredients);
      queryClient.setQueryData(['library', 'ingredients', ''], {
        pages: [
          {
            items: ingredients.slice(0, 20),
            nextOffset: ingredients.length > 20 ? 20 : null,
          },
        ],
        pageParams: [0],
      });
    }
  } catch (err) {
    console.warn('[CatalogSync] Ingredients sequential download error:', err);
  }

  // 2. Sequentially fetch and persist Products (only after ingredients complete)
  onStepProgress?.('products', 'Syncing skincare product catalog...');
  let products: Product[] = [];
  try {
    products = await fetchAllProducts((count) => {
      onStepProgress?.('products', `Syncing skincare products (${count} items)...`);
    });
    if (products.length > 0) {
      await saveCachedProducts(products);
      queryClient.setQueryData(['library', 'all-products'], products);
      queryClient.setQueryData(['library', 'products', '', null], {
        pages: [
          {
            items: products.slice(0, 20),
            nextOffset: products.length > 20 ? 20 : null,
          },
        ],
        pageParams: [0],
      });
    }
  } catch (err) {
    console.warn('[CatalogSync] Products sequential download error:', err);
  }

  // 3. Fetch and persist Articles
  onStepProgress?.('articles', 'Preparing skincare guides & routines...');
  let articles: Article[] = [];
  try {
    articles = await fetchArticles();
    if (articles.length > 0) {
      await saveCachedArticles(articles);
      queryClient.setQueryData(['articles'], articles);
    }
  } catch (err) {
    console.warn('[CatalogSync] Articles download error:', err);
  }

  // 4. Update catalog metadata and flag one-time download as completed
  await saveCatalogMetadata({
    version: CURRENT_CATALOG_VERSION,
    lastSyncedAt: Date.now(),
    ingredientCount: ingredients.length,
    productCount: products.length,
    articleCount: articles.length,
  });

  if (ingredients.length > 0 || products.length > 0) {
    await setInitialCatalogDownloaded(true);
  }

  // 5. If user is authenticated, warm and persist routine & history
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

  onStepProgress?.('ready', 'Welcome to AureSkin!');
}

let isSyncInProgress = false;

/**
 * Non-blocking silent background sync: refreshes lightweight articles and user-scoped data.
 * Does NOT re-download the product or ingredient catalog (catalog is downloaded once).
 */
export async function silentBackgroundSync(queryClient: QueryClient): Promise<void> {
  if (isSyncInProgress) return;
  isSyncInProgress = true;

  try {
    const authState = useAuthStore.getState();
    const userId = authState.user?.id;

    const tasks: Promise<unknown>[] = [
      fetchArticles()
        .then(async (articles) => {
          if (articles && articles.length > 0) {
            await saveCachedArticles(articles);
            queryClient.setQueryData(['articles'], articles);
          }
        })
        .catch(() => null),
    ];

    if (authState.isAuthenticated && userId) {
      tasks.push(
        fetchRoutine()
          .then(async (routine) => {
            if (routine !== undefined) {
              await saveCachedRoutine(userId, routine);
              queryClient.setQueryData(['routine', 'current'], routine);
            }
          })
          .catch(() => null),
        fetchHistoryPage({ limit: 20, offset: 0 })
          .then(async (history) => {
            if (history) {
              await saveCachedHistory(userId, history);
              const pagesPayload = { pages: [history], pageParams: [0] };
              queryClient.setQueryData(['history', 'list', userId], pagesPayload);
              queryClient.setQueryData(['history', 'list'], pagesPayload);
            }
          })
          .catch(() => null)
      );
    }

    await Promise.allSettled(tasks);
  } catch (err) {
    console.warn('[CatalogSync] Silent background sync notice:', err);
  } finally {
    isSyncInProgress = false;
  }
}
export { hasValidLocalCatalog };

