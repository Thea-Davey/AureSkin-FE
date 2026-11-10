import { api } from '../../../shared/services/api';
import { isMockEnabled } from '@/shared/config/mockConfig';
import {
  ScanResult,
  SkinType,
  SkinConditionResult,
  CompatibleIngredient,
  IncompatiblePair,
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
import { normalizeFileUri } from './scanStore';

// ============================================================================
// DATA SOURCE TOGGLE (use mock)
// Set to `true` to use mock data for all Scan screen features (Scan Analysis,
// Camera Capture Simulation, Gallery Photos Grid, Health Score, Compatibility).
// Set to `false` to fetch real-time live data from FastAPI and Supabase.
export const USE_MOCK: boolean = isMockEnabled('scan');
// ============================================================================

function formatConditionDisplayName(name: string): string {
  return name
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Normalizes backend scan payloads into the standard frontend ScanResult structure.
 * Handles both flat and nested schemas (e.g. skin_type as string or { name, confidence }).
 */
export function normalizeScanResult(raw: any): ScanResult {
  if (!raw) {
    return MOCK_SCAN_RESULT;
  }

  // Normalize skin type
  const rawSkinType = raw.skin_type;
  let skinType: any = 'normal';
  if (typeof rawSkinType === 'string') {
    skinType = rawSkinType.toLowerCase();
  } else if (rawSkinType && typeof rawSkinType === 'object' && rawSkinType.name) {
    skinType = String(rawSkinType.name).toLowerCase();
  }

  // Normalize confidence
  let skinTypeConfidence = 90;
  if (rawSkinType && typeof rawSkinType === 'object' && typeof rawSkinType.confidence === 'number') {
    skinTypeConfidence = rawSkinType.confidence;
  } else if (typeof raw.skin_type_confidence === 'number') {
    skinTypeConfidence = raw.skin_type_confidence;
  }

  // Normalize conditions
  const rawConditions = Array.isArray(raw.conditions) ? raw.conditions : [];
  const conditions: SkinConditionResult[] = rawConditions.map((c: any, index: number) => {
    const condName = typeof c === 'string' ? c : c?.name || 'concern';
    const displayName =
      (typeof c === 'object' && c?.display_name)
        ? c.display_name
        : formatConditionDisplayName(condName);
    const confidence =
      typeof c === 'object' && typeof c?.confidence === 'number'
        ? c.confidence
        : 85;
    const description =
      (typeof c === 'object' && c?.description)
        ? c.description
        : `Identified characteristics of ${displayName.toLowerCase()} across facial target zones.`;

    return {
      id: (typeof c === 'object' && (c?.id || c?.condition_id)) || `condition-${index}`,
      name: condName,
      display_name: displayName,
      confidence,
      description,
      symptoms: typeof c === 'object' ? c?.symptoms : undefined,
      causes: typeof c === 'object' ? c?.causes : undefined,
    };
  });

  // Normalize compatible ingredients
  const rawCompatible = Array.isArray(raw.compatible_ingredients)
    ? raw.compatible_ingredients
    : [];
  const compatible_ingredients: CompatibleIngredient[] = rawCompatible.map(
    (item: any, index: number) => ({
      id: item.id || item.ingredient_id || `compat-${index}`,
      name: item.name || item.ingredient?.name || 'Skincare Active',
      reason: item.reason || 'Supports barrier repair and cellular turnover.',
    })
  );

  // Normalize incompatible pairs
  const rawIncompatible = Array.isArray(raw.incompatible_pairs)
    ? raw.incompatible_pairs
    : [];
  const incompatible_pairs: IncompatiblePair[] = rawIncompatible.map(
    (item: any) => ({
      ingredient_a: item.ingredient_a || 'Active A',
      ingredient_b: item.ingredient_b || 'Active B',
      reason: item.reason || 'Potential irritation or reduced efficacy when layered.',
      subtitle: item.subtitle,
      incompatible_with: item.incompatible_with,
      guidance: item.guidance,
    })
  );

  return {
    id: raw.id || '',
    user_id: raw.user_id || '',
    image_url: raw.image_url || '',
    skin_type: skinType,
    skin_type_confidence: skinTypeConfidence,
    health_score: typeof raw.health_score === 'number' ? raw.health_score : 85,
    summary: raw.summary || '',
    conditions,
    compatible_ingredients,
    incompatible_pairs,
    created_at: raw.created_at || new Date().toISOString(),
  };
}

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
  if (isMockEnabled('scan')) {
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

  const cleanUri = normalizeFileUri(imageUri);
  const formData = new FormData();
  const filename = cleanUri.split('/').pop() || 'face_scan.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : 'image/jpeg';

  formData.append('file', {
    uri: cleanUri,
    name: filename,
    type,
  } as unknown as Blob);

  const response = await api.post('/scan', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    signal,
    timeout: 60000, // 60 seconds to accommodate landmark extraction & CNN inference
  });

  return normalizeScanResult(response.data?.data);
}

/**
 * Fetch ingredient compatibility recommendations for a specific scan record.
 * - Live: GET /scan/{analysisId}/compatibility
 * - Mock: returns compatibility slice from MOCK_COMPATIBILITY
 */
export async function fetchCompatibility(analysisId: string): Promise<CompatibilityResponse> {
  if (isMockEnabled('scan')) {
    return {
      ...MOCK_COMPATIBILITY,
      analysis_id: analysisId || MOCK_COMPATIBILITY.analysis_id,
    };
  }

  const response = await api.get(`/scan/${analysisId}/compatibility`);
  const data = response.data?.data || {};
  const rawList = Array.isArray(data.compatible_ingredients) ? data.compatible_ingredients : [];
  const compatible_ingredients = rawList.map((item: any) => ({
    id: item.id || item.ingredient_id,
    name: item.name || '',
    reason: item.reason || '',
  }));

  return {
    analysis_id: analysisId,
    compatible_ingredients,
    incompatible_pairs: data.incompatible_pairs || [],
  };
}

/**
 * Fetch most recent thumbnail from device gallery for quick camera preview.
 * Returns null if not available or permission denied.
 */
export async function getRecentGalleryThumbnail(): Promise<string | null> {
  if (isMockEnabled('scan')) {
    return MOCK_GALLERY_THUMBNAIL;
  }
  return null;
}

/**
 * Fetch skin analysis capture guidelines for the guidance modal.
 */
export async function getSkinGuidanceTips(): Promise<SkinGuidanceTip[]> {
  if (isMockEnabled('scan')) {
    return MOCK_SKIN_GUIDANCE_TIPS;
  }
  return MOCK_SKIN_GUIDANCE_TIPS;
}

/**
 * Fetch gallery photos for the Scan Upload photo grid (Section 4.3).
 * Supports optional client-side query string filtering.
 */
export async function fetchGalleryPhotos(query?: string): Promise<GalleryPhotoItem[]> {
  if (isMockEnabled('scan')) {
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
 * - Live: GET /scan/{analysisId} (with fallback to /history/{analysisId})
 * - Mock: returns MOCK_SCAN_RESULT
 */
export async function fetchScanResult(analysisId?: string): Promise<ScanResult> {
  if (isMockEnabled('scan')) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return MOCK_SCAN_RESULT;
  }

  let targetId = analysisId;
  // If no analysisId was provided (or 'latest'), fetch the user's most recent scan record ID from history
  if (!targetId || targetId === 'latest') {
    try {
      const historyRes = await api.get('/history', { params: { limit: 1, offset: 0 } });
      const items = historyRes.data?.data?.items;
      if (Array.isArray(items) && items.length > 0 && items[0]?.id) {
        targetId = items[0].id;
      }
    } catch (hErr) {
      console.warn('Failed to resolve latest scan ID from history:', hErr);
    }
  }

  if (!targetId) {
    throw new Error('Analysis ID is required to fetch scan results.');
  }

  let rawData: any = null;
  try {
    const response = await api.get(`/scan/${targetId}`);
    rawData = response.data?.data;
  } catch (err: any) {
    // Graceful fallback to history endpoint if /scan/{id} is unavailable
    const fallbackRes = await api.get(`/history/${targetId}`);
    rawData = fallbackRes.data?.data;
  }

  if (!rawData) {
    throw new Error('Scan result not found.');
  }

  const result = normalizeScanResult(rawData);

  // If compatible ingredients list is missing or empty, attempt compatibility endpoint fetch
  if (
    (!result.compatible_ingredients || result.compatible_ingredients.length === 0) &&
    targetId
  ) {
    try {
      const comp = await fetchCompatibility(targetId);
      if (comp?.compatible_ingredients?.length) {
        result.compatible_ingredients = comp.compatible_ingredients;
      }
      if (comp?.incompatible_pairs?.length) {
        result.incompatible_pairs = comp.incompatible_pairs;
      }
    } catch {
      // Ignore secondary compatibility fetch error and return primary findings
    }
  }

  return result;
}


