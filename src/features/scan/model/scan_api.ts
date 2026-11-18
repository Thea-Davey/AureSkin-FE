import { api } from '../../../shared/services/api';
import { supabase } from '@/shared/services/supabase';
import { isMockEnabled } from '@/shared/config/mockConfig';
import {
  ScanResult,
  SkinType,
  SkinConditionResult,
  CompatibleIngredient,
  FilteredIngredient,
  IncompatiblePair,
  CompatibilityResponse,
  SkinGuidanceTip,
  GalleryPhotoItem,
  QuestionnaireQuestion,
  ShotType,
  SetupPhotos,
  QuestionnaireAnswer,
} from './scan_types';
import {
  MOCK_SCAN_RESULT,
  MOCK_COMPATIBILITY,
  MOCK_GALLERY_THUMBNAIL,
  MOCK_SKIN_GUIDANCE_TIPS,
  MOCK_GALLERY_PHOTOS,
  MOCK_QUESTIONNAIRE_QUESTIONS,
} from './scan_mock';
import { useScanStore, normalizeFileUri } from './scanStore';

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
    if (isMockEnabled('scan')) {
      return MOCK_SCAN_RESULT;
    }
    throw new Error('No scan analysis payload received from the server.');
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
    (item: any, index: number) => {
      const resolvedId = item.id || item.ingredient_id;
      return {
        id: resolvedId || item.name || `compat-${index}`,
        ingredient_id: resolvedId || undefined,
        name: item.name || item.ingredient?.name || 'Skincare Active',
        reason: item.reason || 'Supports barrier repair and cellular turnover.',
      };
    }
  );

  // Normalize filtered ingredients (excluded by allergen, pregnancy, or age)
  const rawFiltered = Array.isArray(raw.filtered_ingredients)
    ? raw.filtered_ingredients
    : [];
  const filtered_ingredients: FilteredIngredient[] = rawFiltered.map(
    (item: any, index: number) => ({
      id: item.id || item.ingredient_id || `filtered-${index}`,
      ingredient_id: item.ingredient_id || item.id || '',
      name: item.name || item.ingredient?.name || 'Filtered Active',
      filter_type: item.filter_type || 'allergen',
      reason: item.reason || '',
      details: item.details || undefined,
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

  const skinTypeDescription: string | undefined =
    (typeof raw.skin_type_description === 'string' && raw.skin_type_description.trim().length > 0)
      ? raw.skin_type_description
      : (rawSkinType && typeof rawSkinType === 'object' && typeof rawSkinType.description === 'string' && rawSkinType.description.trim().length > 0)
        ? rawSkinType.description
        : undefined;

  return {
    id: raw.id || '',
    user_id: raw.user_id || '',
    image_url: raw.image_url || '',
    shot_type: raw.shot_type || 'single',
    enhanced_analysis: Boolean(raw.enhanced_analysis),
    image_urls: raw.image_urls || undefined,
    skin_type: skinType,
    skin_type_confidence: skinTypeConfidence,
    skin_type_description: skinTypeDescription,
    health_score: typeof raw.health_score === 'number' ? raw.health_score : 85,
    summary: raw.summary || '',
    conditions,
    questionnaire_score: raw.questionnaire_score || undefined,
    vision_confidence: typeof raw.vision_confidence === 'number' ? raw.vision_confidence : undefined,
    fused_confidence: typeof raw.fused_confidence === 'number' ? raw.fused_confidence : undefined,
    acne_tendency: Boolean(raw.acne_tendency),
    compatible_ingredients,
    incompatible_pairs,
    filtered_ingredients,
    created_at: raw.created_at || new Date().toISOString(),
  };
}

export interface UploadScanOptions {
  imageUri?: string;
  shotType?: ShotType | null;
  enhancedSkinAnalysis?: boolean;
  photos?: SetupPhotos;
  questionnaireAnswers?: Record<number, QuestionnaireAnswer>;
  signal?: AbortSignal;
}

/**
 * Upload face photo(s) for end-to-end deep learning analysis and optional clinical questionnaire fusion.
 * Supports cancellation via AbortSignal.
 * - Live: POST /scan (multipart/form-data)
 * - Mock: returns MOCK_SCAN_RESULT after simulated multi-stage delay with cancellation support
 */
export async function uploadScan(
  imageUriOrOptions: string | UploadScanOptions,
  signal?: AbortSignal
): Promise<ScanResult> {
  const options: UploadScanOptions =
    typeof imageUriOrOptions === 'string'
      ? { imageUri: imageUriOrOptions, signal }
      : imageUriOrOptions;

  const activeSignal = options.signal || signal;

  if (isMockEnabled('scan')) {
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        resolve();
      }, 2500);

      if (activeSignal) {
        if (activeSignal.aborted) {
          clearTimeout(timeout);
          reject(new DOMException('Aborted', 'AbortError'));
          return;
        }
        activeSignal.addEventListener('abort', () => {
          clearTimeout(timeout);
          reject(new DOMException('Aborted', 'AbortError'));
        });
      }
    });
    return MOCK_SCAN_RESULT;
  }

  // Pull active state from store if not provided in options
  const storeState = useScanStore.getState();
  const shotType = options.shotType || storeState.shotType || 'single';
  const enhancedSkinAnalysis =
    typeof options.enhancedSkinAnalysis === 'boolean'
      ? options.enhancedSkinAnalysis
      : storeState.enhancedSkinAnalysis;
  const photos = options.photos || storeState.photos;
  const questionnaireAnswers =
    options.questionnaireAnswers || storeState.questionnaireAnswers;

  const frontUri = photos?.front || options.imageUri || storeState.capturedImageUri || '';
  const cleanFrontUri = normalizeFileUri(frontUri);

  const formData = new FormData();
  formData.append('shot_type', shotType);
  formData.append('enhanced_analysis', enhancedSkinAnalysis ? 'true' : 'false');

  if (enhancedSkinAnalysis && questionnaireAnswers && Object.keys(questionnaireAnswers).length > 0) {
    formData.append('questionnaire_answers', JSON.stringify(questionnaireAnswers));
  }

  // Helper to append local file or remote URL to FormData safely
  const appendPhotoToForm = async (fieldName: string, uri: string, defaultName: string) => {
    const cleanUri = normalizeFileUri(uri);
    if (!cleanUri) return;

    if (cleanUri.startsWith('http://') || cleanUri.startsWith('https://')) {
      try {
        const res = await fetch(cleanUri);
        const blob = await res.blob();
        formData.append(fieldName, blob, defaultName);
      } catch (e) {
        console.warn(`Failed to fetch remote photo for ${fieldName}:`, e);
      }
      return;
    }

    const filename = cleanUri.split('/').pop() || defaultName;
    const match = /\.(\w+)$/.exec(filename);
    const ext = match ? match[1].toLowerCase() : 'jpeg';
    const type = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;
    formData.append(fieldName, {
      uri: cleanUri,
      name: filename,
      type,
    } as unknown as Blob);
  };

  // Attach frontal photo (backend checks file_front or file)
  if (cleanFrontUri) {
    await appendPhotoToForm('file_front', cleanFrontUri, 'front_scan.jpg');
  }

  // If triple shot, attach left and right profiles
  if (shotType === 'triple' && photos) {
    if (photos.left) {
      await appendPhotoToForm('file_left', photos.left, 'left_scan.jpg');
    }
    if (photos.right) {
      await appendPhotoToForm('file_right', photos.right, 'right_scan.jpg');
    }
  }

  const response = await api.post('/scan', formData, {
    headers: {
      Accept: 'application/json',
    },
    transformRequest: (data, headers) => {
      // Let React Native / Axios automatically set multipart/form-data with boundary
      if (headers) {
        delete headers['Content-Type'];
      }
      return data;
    },
    signal: activeSignal,
    timeout: 90000, // 90 seconds for multi-image upload, preprocessing, and ML inference
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

  const rawFiltered = Array.isArray(data.filtered_ingredients) ? data.filtered_ingredients : [];
  const filtered_ingredients = rawFiltered.map((item: any, index: number) => ({
    id: item.id || item.ingredient_id || `filtered-${index}`,
    ingredient_id: item.ingredient_id || item.id || '',
    name: item.name || item.ingredient?.name || 'Filtered Active',
    filter_type: item.filter_type || 'allergen',
    reason: item.reason || '',
    details: item.details || undefined,
  }));

  return {
    analysis_id: analysisId,
    compatible_ingredients,
    incompatible_pairs: data.incompatible_pairs || [],
    filtered_ingredients,
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
      if (comp?.filtered_ingredients?.length) {
        result.filtered_ingredients = comp.filtered_ingredients;
      }
    } catch {
      // Ignore secondary compatibility fetch error and return primary findings
    }
  }

  return result;
}

/**
 * Fetches the 10 diagnostic questionnaire questions.
 * Prioritizes direct Supabase cloud query (always accessible from phone/emulator),
 * then FastAPI backend endpoint (/scan/questionnaire),
 * and finally falls back to bundled MOCK_QUESTIONNAIRE_QUESTIONS.
 */
export async function fetchQuestionnaireQuestions(): Promise<QuestionnaireQuestion[]> {
  // 1. Attempt direct live fetch from Supabase cloud database
  try {
    const { data: qData, error: qErr } = await supabase
      .from('questionnaire_questions')
      .select('id, question_number, section, section_title, question_text, is_multi_select, measures')
      .order('question_number', { ascending: true });

    if (!qErr && Array.isArray(qData) && qData.length > 0) {
      const { data: cData, error: cErr } = await supabase
        .from('questionnaire_choices')
        .select('id, question_id, choice_order, label')
        .order('choice_order', { ascending: true });

      if (!cErr && Array.isArray(cData) && cData.length > 0) {
        const choicesByQ: Record<number, { id: string; label: string }[]> = {};
        for (const c of cData) {
          const qId = c.question_id;
          if (!choicesByQ[qId]) choicesByQ[qId] = [];
          choicesByQ[qId].push({ id: c.id, label: c.label });
        }

        return qData.map((q: any) => ({
          id: q.id || q.question_number,
          questionNumber: q.question_number || q.id,
          question: q.question_text || q.question,
          section: q.section,
          sectionTitle: q.section_title,
          isMultiSelect: q.is_multi_select,
          measures: q.measures || '',
          choices: choicesByQ[q.id] || [],
        }));
      }
    }
  } catch (supabaseErr) {
    console.warn('Direct Supabase fetch for questionnaire failed:', supabaseErr);
  }

  // 2. Attempt fetch via FastAPI backend endpoint
  try {
    const response = await api.get('/scan/questionnaire');
    const rawList = response.data?.data;
    if (Array.isArray(rawList) && rawList.length > 0) {
      return rawList.map((q: any) => ({
        id: q.id || q.question_number,
        questionNumber: q.question_number || q.id,
        question: q.question_text || q.question,
        section: q.section,
        sectionTitle: q.section_title,
        isMultiSelect: q.is_multi_select,
        measures: q.measures || '',
        choices: (q.choices || []).map((c: any) => ({
          id: c.id,
          label: c.label,
        })),
      }));
    }
  } catch (apiErr) {
    console.warn('Backend API fetch for questionnaire failed, falling back to mock:', apiErr);
  }

  // 3. Fallback to bundled clinical questionnaire questions
  return MOCK_QUESTIONNAIRE_QUESTIONS;
}


