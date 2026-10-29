import { api } from '../../../shared/services/api';
import { ScanResult, CompatibilityResponse, SkinGuidanceTip } from './scan_types';
import {
  MOCK_SCAN_RESULT,
  MOCK_COMPATIBILITY,
  MOCK_GALLERY_THUMBNAIL,
  MOCK_SKIN_GUIDANCE_TIPS,
} from './scan_mock';

// ============================================================================
// DATA SOURCE TOGGLE (use mock)
// Set to `true` to use mock data for all Scan screen features (Scan Analysis,
// Camera Capture Simulation, Health Score, Ingredient Compatibility).
// Set to `false` to fetch real-time live data from FastAPI and Supabase.
export const USE_MOCK: boolean = true;
// ============================================================================

/**
 * Upload face photo for end-to-end deep learning analysis.
 * - Live: POST /scan (multipart/form-data)
 * - Mock: returns MOCK_SCAN_RESULT after an artificial delay
 */
export async function uploadScan(imageUri: string): Promise<ScanResult> {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 1500));
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
