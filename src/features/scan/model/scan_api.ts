import { api } from '../../../shared/services/api';
import {
  ScanResult,
  CompatibilityResponse,
  SkinGuidanceTip,
  GalleryPhotoItem,
} from './scan_types';
import {
  MOCK_SCAN_RESULT,
  MOCK_COMPATIBILITY,
  MOCK_GALLERY_THUMBNAIL,
  MOCK_SKIN_GUIDANCE_TIPS,
  MOCK_GALLERY_PHOTOS,
} from './scan_mock';

// ============================================================================
// DATA SOURCE TOGGLE (use mock)
// Set to `true` to use mock data for all Scan screen features (Scan Analysis,
// Camera Capture Simulation, Gallery Photos Grid, Health Score, Compatibility).
// Set to `false` to fetch real-time live data from FastAPI and Supabase.
export const USE_MOCK: boolean = true;
// ============================================================================

/**
 * Upload face photo for end-to-end deep learning analysis.
 * Supports cancellation via AbortSignal.
 * - Live: POST /scan (multipart/form-data)
 * - Mock: returns MOCK_SCAN_RESULT after simulated multi-stage delay with cancellation support
 */
export async function uploadScan(
  imageUri: string,
  signal?: AbortSignal
): Promise<ScanResult> {
  if (USE_MOCK) {
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        resolve();
      }, 2500);

      if (signal) {
        if (signal.aborted) {
          clearTimeout(timeout);
          reject(new DOMException('Aborted', 'AbortError'));
          return;
        }
        signal.addEventListener('abort', () => {
          clearTimeout(timeout);
          reject(new DOMException('Aborted', 'AbortError'));
        });
      }
    });
    return MOCK_SCAN_RESULT;
  }

  const formData = new FormData();
  const filename = imageUri.split('/').pop() || 'face_scan.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : 'image/jpeg';

  formData.append('image', {
    uri: imageUri,
    name: filename,
    type,
  } as unknown as Blob);

  const response = await api.post('/scan', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    signal,
  });

  return response.data?.data as ScanResult;
}

/**
 * Fetch ingredient compatibility recommendations for a specific scan record.
 * - Live: GET /scan/{analysisId}/compatibility
 * - Mock: returns compatibility slice from MOCK_COMPATIBILITY
 */
export async function fetchCompatibility(analysisId: string): Promise<CompatibilityResponse> {
  if (USE_MOCK) {
    return MOCK_COMPATIBILITY;
  }

  const response = await api.get(`/scan/${analysisId}/compatibility`);
  return response.data?.data as CompatibilityResponse;
}

/**
 * Fetch most recent thumbnail from device gallery for quick camera preview.
 * Returns null if not available or permission denied.
 */
export async function getRecentGalleryThumbnail(): Promise<string | null> {
  if (USE_MOCK) {
    return MOCK_GALLERY_THUMBNAIL;
  }
  return null;
}

/**
 * Fetch skin analysis capture guidelines for the guidance modal.
 */
export async function getSkinGuidanceTips(): Promise<SkinGuidanceTip[]> {
  if (USE_MOCK) {
    return MOCK_SKIN_GUIDANCE_TIPS;
  }
  return MOCK_SKIN_GUIDANCE_TIPS;
}

/**
 * Fetch gallery photos for the Scan Upload photo grid (Section 4.3).
 * Supports optional client-side query string filtering.
 */
export async function fetchGalleryPhotos(query?: string): Promise<GalleryPhotoItem[]> {
  if (USE_MOCK) {
    // Artificial brief loading delay for realistic transition
    await new Promise((resolve) => setTimeout(resolve, 200));
    if (!query || query.trim() === '') {
      return MOCK_GALLERY_PHOTOS;
    }
    const lower = query.toLowerCase();
    return MOCK_GALLERY_PHOTOS.filter(
      (p) =>
        p.filename?.toLowerCase().includes(lower) ||
        p.tag?.toLowerCase().includes(lower)
    );
  }

  // Live fallback returns curated photos
  return MOCK_GALLERY_PHOTOS;
}

/**
 * Fetch a completed scan result record by analysis ID.
 * - Live: GET /scan/{analysisId}
 * - Mock: returns MOCK_SCAN_RESULT
 */
export async function fetchScanResult(analysisId?: string): Promise<ScanResult> {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return MOCK_SCAN_RESULT;
  }

  if (!analysisId) {
    throw new Error('Analysis ID is required to fetch scan results.');
  }

  const response = await api.get(`/scan/${analysisId}`);
  return response.data?.data as ScanResult;
}


