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
