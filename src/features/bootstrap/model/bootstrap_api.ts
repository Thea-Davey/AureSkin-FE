import { QueryClient } from '@tanstack/react-query';
import {
  hydrateQueryClientFromDisk,
  downloadAndPersistFullCatalog,
  silentBackgroundSync,
  hasValidLocalCatalog,
} from './catalogSync';

export {
  hydrateQueryClientFromDisk,
  downloadAndPersistFullCatalog,
  silentBackgroundSync,
  hasValidLocalCatalog,
};

/**
 * Orchestrates prefetching and hydration of app resources.
 * Fast Path: Hydrates TanStack Query from device disk in <30ms if cached.
 * Cold Path: Downloads entire catalog, writes to disk, and primes cache.
 */
export async function prefetchAppResources(
  queryClient: QueryClient,
  onStepProgress?: (stepId: string) => void
): Promise<{ isFastPath: boolean }> {
  // Check if permanent disk cache is already present
  const isCached = await hasValidLocalCatalog();

  if (isCached) {
    onStepProgress?.('connect');
    const hydrated = await hydrateQueryClientFromDisk(queryClient);
    if (hydrated) {
      onStepProgress?.('ready');
      // Schedule silent background sync
      setTimeout(() => {
        silentBackgroundSync(queryClient).catch(() => {});
      }, 1000);
      return { isFastPath: true };
    }
  }

  // Cold Path: download full catalog and persist to disk
  await downloadAndPersistFullCatalog(queryClient, onStepProgress);
  return { isFastPath: false };
}
