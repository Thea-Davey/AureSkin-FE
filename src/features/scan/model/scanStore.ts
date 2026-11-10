import { create } from 'zustand';
import { ScanResult } from './scan_types';

/**
 * Normalizes a file path or URI to ensure it conforms to the strict triple-slash file scheme
 * required by React Native and Android Glide decoders (`file:///...`).
 * Preserves remote URLs (http/https) and Android Content URIs (content://).
 */
export function normalizeFileUri(uri?: string | null): string {
  if (!uri || typeof uri !== 'string') return '';
  const clean = uri.trim();
  if (
    clean.startsWith('content://') ||
    clean.startsWith('http://') ||
    clean.startsWith('https://')
  ) {
    return clean;
  }
  if (clean.startsWith('file:')) {
    return clean.replace(/^file:\/+/, 'file:///');
  }
  return `file://${clean.startsWith('/') ? '' : '/'}${clean}`;
}

export interface ScanStoreState {
  capturedImageUri: string | null;
  latestScanResult: ScanResult | null;
  hasNewScanForLibrary: boolean;
  hasNewScanForRoutine: boolean;
  setCapturedImageUri: (uri: string | null) => void;
  setLatestScanResult: (result: ScanResult | null) => void;
  setHasNewScanForLibrary: (hasNew: boolean) => void;
  setHasNewScanForRoutine: (hasNew: boolean) => void;
  clearCapturedImage: () => void;
  clearScan: () => void;
}

/**
 * Global In-Memory Scan Store
 *
 * Keeps the active facial scan photo URI and analyzed scan findings in memory across
 * the scan lifecycle (Camera/Upload -> Submit Preview -> Analyzing -> Results).
 *
 * Storing the clean file URI and fresh analysis payload directly avoids Expo Router URL query
 * parameter percent-encoding/decoding corruption and eliminates route-param hydration race conditions.
 */
export const useScanStore = create<ScanStoreState>((set) => ({
  capturedImageUri: null,
  latestScanResult: null,
  hasNewScanForLibrary: false,
  hasNewScanForRoutine: false,
  setCapturedImageUri: (uri) =>
    set({ capturedImageUri: uri ? normalizeFileUri(uri) : null }),
  setLatestScanResult: (result) =>
    set({
      latestScanResult: result,
      hasNewScanForLibrary: Boolean(result),
      hasNewScanForRoutine: Boolean(result),
    }),
  setHasNewScanForLibrary: (hasNew) => set({ hasNewScanForLibrary: hasNew }),
  setHasNewScanForRoutine: (hasNew) => set({ hasNewScanForRoutine: hasNew }),
  clearCapturedImage: () => set({ capturedImageUri: null }),
  clearScan: () =>
    set({
      capturedImageUri: null,
      latestScanResult: null,
      hasNewScanForLibrary: false,
      hasNewScanForRoutine: false,
    }),
}));

