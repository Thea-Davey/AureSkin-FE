/**
 * Master API Mock Configuration
 *
 * Controls whether API functions across all features return local mock fixtures
 * or make live HTTP / Supabase network requests.
 *
 * How it works:
 * 1. MASTER_OVERRIDE:
 *    - `false` -> Forces ALL features to use the LIVE backend (overrides all feature toggles)
 *    - `true`  -> Forces ALL features to use MOCK fixtures (overrides all feature toggles)
 *    - `null`  -> No master override; lets each feature's local toggle decide
 *
 * 2. FEATURE_OVERRIDES:
 *    - Set an individual feature to `true` or `false` to override just that feature
 *    - Set to `undefined` to follow MASTER_OVERRIDE (or local feature default)
 */

export type FeatureKey =
  | 'home'
  | 'library'
  | 'scan'
  | 'history'
  | 'routine'
  | 'favorites'
  | 'about'
  | 'help'
  | 'profile';

// ============================================================================
// 1. MASTER OVERRIDE SWITCH
// Set to `false` to force all features to LIVE backend APIs.
// Set to `true` to force all features to MOCK fixtures.
// Set to `null` to let each feature use its own local toggle.
// ============================================================================
export const MASTER_OVERRIDE: boolean | null = false;

// ============================================================================
// 2. PER-FEATURE OVERRIDES
// Overrides specific features individually (takes effect when MASTER_OVERRIDE is null).
// ============================================================================
export const FEATURE_OVERRIDES: Partial<Record<FeatureKey, boolean>> = {
  home: undefined,
  library: undefined,
  scan: undefined,
  history: undefined,
  routine: undefined,
  favorites: undefined,
  about: undefined,
  help: undefined,
  profile: undefined,
};

/**
 * Resolves whether mock mode is enabled for a given feature.
 *
 * Priority:
 * 1. MASTER_OVERRIDE (if true or false)
 * 2. FEATURE_OVERRIDES[feature] (if true or false)
 * 3. localFeatureToggle (the local toggle passed by the feature itself)
 */
export function resolveMockMode(
  feature: FeatureKey,
  localDefault: boolean = true
): boolean {
  // 1. Check Master Override first
  if (MASTER_OVERRIDE !== null && MASTER_OVERRIDE !== undefined) {
    return MASTER_OVERRIDE;
  }

  // 2. Check Feature-specific Override
  if (FEATURE_OVERRIDES[feature] !== undefined) {
    return FEATURE_OVERRIDES[feature]!;
  }

  // 3. Fall back to the feature's local default
  return localDefault;
}

// Backwards-compatible aliases
export const MASTER_USE_MOCK: boolean = MASTER_OVERRIDE ?? true;
export const FEATURE_MOCK_OVERRIDES = FEATURE_OVERRIDES;
export function isMockEnabled(feature: FeatureKey): boolean {
  return resolveMockMode(feature, true);
}
