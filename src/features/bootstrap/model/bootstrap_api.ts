import { QueryClient } from '@tanstack/react-query';
import { fetchIngredients, fetchProducts } from '../../library/model/library_api';
import { fetchArticles } from '../../home/model/home_api';
import { fetchRoutine } from '../../routine/model/routine_api';
import { fetchHistoryPage } from '../../history/model/history_api';
import { useAuthStore } from '../../../shared/store/authStore';

/**
 * Orchestrates parallel prefetching of critical app resources into TanStack QueryClient.
 * Warms the cache for:
 * 1. Skincare Ingredients catalog (initial page)
 * 2. Products catalog (initial page)
 * 3. Skincare educational articles
 * 4. User routine & history (if authenticated)
 *
 * Each task catches its own errors so one sluggish request never blocks the app startup.
 */
export async function prefetchAppResources(
  queryClient: QueryClient,
  onStepProgress?: (stepId: string) => void
): Promise<void> {
  const isAuth = useAuthStore.getState().isAuthenticated;

  // 1. Connection step
  onStepProgress?.('connect');

  // 2. Prefetch Public Catalogs in parallel
  const publicPrefetches = [
    (async () => {
      try {
        await queryClient.prefetchInfiniteQuery({
          queryKey: ['library', 'ingredients', ''],
          queryFn: () => fetchIngredients({ limit: 20, offset: 0, q: '' }),
          initialPageParam: 0,
        });
      } catch (err) {
        console.warn('[Bootstrap] Ingredients prefetch caught:', err);
      } finally {
        onStepProgress?.('ingredients');
      }
    })(),

    (async () => {
      try {
        await queryClient.prefetchInfiniteQuery({
          queryKey: ['library', 'products', '', null],
          queryFn: () => fetchProducts({ limit: 20, offset: 0, q: '', category: null }),
          initialPageParam: 0,
        });
      } catch (err) {
        console.warn('[Bootstrap] Products prefetch caught:', err);
      } finally {
        onStepProgress?.('products');
      }
    })(),

    (async () => {
      try {
        await queryClient.prefetchQuery({
          queryKey: ['articles'],
          queryFn: fetchArticles,
        });
      } catch (err) {
        console.warn('[Bootstrap] Articles prefetch caught:', err);
      } finally {
        onStepProgress?.('articles');
      }
    })(),
  ];

  // 3. If authenticated, also warm user routine and latest scan in parallel
  if (isAuth) {
    publicPrefetches.push(
      (async () => {
        try {
          await queryClient.prefetchQuery({
            queryKey: ['routine', 'current'],
            queryFn: fetchRoutine,
          });
        } catch (err) {
          console.warn('[Bootstrap] Routine prefetch caught:', err);
        }
      })(),
      (async () => {
        try {
          await queryClient.prefetchQuery({
            queryKey: ['history', 'list'],
            queryFn: () => fetchHistoryPage({ limit: 10, offset: 0 }),
          });
        } catch (err) {
          console.warn('[Bootstrap] History prefetch caught:', err);
        }
      })()
    );
  }

  // Await all parallel warmups
  await Promise.all(publicPrefetches);
  onStepProgress?.('ready');
}
