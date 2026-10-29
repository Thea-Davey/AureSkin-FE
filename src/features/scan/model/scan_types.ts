// Supported 5 Skin Types
export type SkinType = 'normal' | 'oily' | 'dry' | 'combination' | 'acneprone';

// Supported 8 Dermatological Conditions
export type ConditionName =
  | 'dark_spots'
  | 'inflammatory_acne'
  | 'blackheads'
  | 'whiteheads'
  | 'pigmentation'
  | 'pores'
  | 'redness'
  | 'wrinkles';

export interface SkinConditionResult {
  id: string;
  name: ConditionName | string;
  display_name: string;
  confidence: number; // 0 - 100
  description: string;
  symptoms?: string;
  causes?: string;
}

export interface CompatibleIngredient {
  id: string;
  name: string;
  reason: string;
}

export interface IncompatiblePair {
  ingredient_a: string;
  ingredient_b: string;
  reason: string;
  subtitle?: string;          // e.g. "Do not use on the same day as:"
  incompatible_with?: string[]; // e.g. ["AHAs", "BHAs", "PHAs"]
  guidance?: string;          // e.g. "Use on alternate nights (once you have built up the tolerance)"
}

export interface ScanResult {
  id: string;
  user_id: string;
  image_url: string;
  skin_type: SkinType;
  skin_type_confidence: number; // 0 - 100
  health_score: number;        // 0 - 100 (weighted heuristic)
  summary: string;
  conditions: SkinConditionResult[];
  compatible_ingredients: CompatibleIngredient[];
  incompatible_pairs: IncompatiblePair[];
  created_at: string;
}

export interface CompatibilityResponse {
  analysis_id: string;
  compatible_ingredients: CompatibleIngredient[];
  incompatible_pairs: IncompatiblePair[];
}

export type ScanOverlayOption = 'camera' | 'upload' | 'exit';

// ── Camera Specific Types (Section 4.2) ──────────────────────────

export type CameraFacing = 'front' | 'back';

export type CameraPermissionStatus = 'undetermined' | 'granted' | 'denied';

export interface CameraCapturedPhoto {
  uri: string;
  width?: number;
  height?: number;
}

export interface SkinGuidanceTip {
  id: string;
  title: string;
  description: string;
  iconName: 'Sun' | 'Sparkles' | 'Smile' | 'Glasses';
}

// ── Upload Specific Types (Section 4.3) ──────────────────────────

export interface GalleryPhotoItem {
  id: string;
  uri: string;
  filename?: string;
  creationTime?: string;
  tag?: string;
}

export interface PhotoFilterOptions {
  searchQuery?: string;
}

// ── Submit Specific Types (Section 4.4) ──────────────────────────

/**
 * Route params received by the Scan Submit screen.
 * imageUri is passed from either /scan/camera (captured photo) or /scan/upload (selected photo).
 */
export interface ScanSubmitParams {
  imageUri: string;
}

/**
 * Discriminated source of the image for the Retake navigation decision.
 * 'camera' → navigate back to /scan/camera
 * 'upload' → navigate back to /scan/upload
 * 'unknown' → default fallback to /scan/camera
 */
export type ImageSource = 'camera' | 'upload' | 'unknown';

// ── Analyzing Specific Types (Section 4.5) ──────────────────────────

/**
 * Route params passed from /scan/submit to /scan/analyzing.
 */
export interface ScanAnalyzingParams {
  imageUri: string;
}

/**
 * Multi-stage pipeline progression states.
 */
export type PipelineStageKey =
  | 'MAPPING_LANDMARKS'
  | 'CLASSIFYING_CONDITIONS'
  | 'CALCULATING_SCORE'
  | 'CHECKING_COMPATIBILITY'
  | 'COMPLETE';

export interface PipelineStageInfo {
  key: PipelineStageKey;
  headline: string;
  subtext: string;
  targetProgress: number; // 0 - 100
}

/**
 * Pipeline stages mapped directly to Section 4.5 specification.
 */
export const PIPELINE_STAGES: PipelineStageInfo[] = [
  {
    key: 'MAPPING_LANDMARKS',
    headline: 'MAPPING FACIAL LANDMARKS...',
    subtext: 'Extracting 468 anatomical facial mesh points',
    targetProgress: 25,
  },
  {
    key: 'CLASSIFYING_CONDITIONS',
    headline: 'CLASSIFYING SKIN TYPE AND POSSIBLE CONCERNS...',
    subtext: 'Analyzing micro-level dermal indicators',
    targetProgress: 60,
  },
  {
    key: 'CALCULATING_SCORE',
    headline: 'CALCULATING SKIN HEALTH SCORE...',
    subtext: 'Evaluating condition severity and skin balance',
    targetProgress: 85,
  },
  {
    key: 'CHECKING_COMPATIBILITY',
    headline: 'CHECKING INGREDIENT COMPATIBILITY...',
    subtext: 'Cross-referencing safe and harmful active pairings',
    targetProgress: 98,
  },
  {
    key: 'COMPLETE',
    headline: 'ANALYSIS COMPLETE',
    subtext: 'Preparing your dermatological skin report...',
    targetProgress: 100,
  },
];

// ── Results Specific Types (Section 4.6 & 4.7) ───────────────────────

/**
 * Route params passed to /scan/results.
 */
export interface ScanResultsParams {
  analysisId?: string;
  imageUri?: string;
}

/**
 * Active tab selection on the Scan Results screen.
 */
export type ScanResultsTab = 'results' | 'compatibility';



