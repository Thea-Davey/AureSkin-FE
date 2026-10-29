# AureSkin — Scan Screen (Scan Overlay) Implementation Plan
### Architecture, Component Breakdown & API-Ready Specifications
**Target Screen:** 4.1 Scan Overlay (Take a Photo / Upload a Photo)  
**Reference Document:** `frontend/design_references/ui_design_reference.md` (§4.1)  
**Reference Image:** `frontend/design_references/scan_overlay.png`  
**Feature Module Path:** `frontend/src/features/scan/`  
**Route Entry Point:** `frontend/src/app/(tabs)/scan.tsx`  

---

## 1. Overview & Reference Mapping

The **Scan Overlay** is the primary gateway to AureSkin's flagship facial skin analysis pipeline. Activated when the user taps the elevated center **Scan** button on the bottom navigation bar, it dims the current screen and presents two immediate pathways for submitting a facial photo:
1. **Take a Photo:** Launches the live camera viewfinder (`4.2 Scan Camera`).
2. **Upload a Photo:** Opens the device photo library grid (`4.3 Scan Upload`).
3. **Exit:** Clicking the center button (which morphs from Scan to Exit) or tapping the dimmed backdrop dismisses the overlay and returns to the active tab screen without initiating a scan.

```
┌─────────────────────────────────────────────────────────────────┐
│               Scan Screen (Scan Overlay Architecture)          │
│                                                                 │
│   (tabs)/_layout.tsx (Persistent Tab Bar & Overlays)            │
│         │                                                       │
│         ├── Center Elevated Button (Toggles Scan ⟷ Exit)        │
│         │                                                       │
│         ▼                                                       │
│    useAppStore (isScanOverlayOpen state)                        │
│         │                                                       │
│         ▼                                                       │
│    ScanOverlay.tsx (Positioned Above Tab Bar)                   │
│         │                                                       │
│         ▼                                                       │
│    s1_ScanOptions.tsx (Container)                               │
│    ├── Dimmed Backdrop Pressable (Dismiss on Tap)               │
│    ├── ScanActionButton ("Take a Photo" + Camera Icon)          │
│    └── ScanActionButton ("Upload a Photo" + Upload Icon)        │
│                                                                 │
│   *Note: Extra exit button removed; center tab button morphs!  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Complete Resolved File Tree

```
frontend/src/
├── app/
│   └── (tabs)/
│       ├── _layout.tsx                       ← Tab bar layout (morphs Scan button into Exit, mounts overlays)
│       └── scan.tsx                          ← Redirect fallback
│
└── features/
    └── scan/
        ├── model/
        │   ├── scan_types.ts                 ← TypeScript interfaces (ScanResult, SkinType, Conditions, Actions)
        │   ├── scan_mock.ts                  ← Centralized mock dataset (realistic analysis, scores, conditions)
        │   └── scan_api.ts                   ← Dual-mode API service (USE_MOCK toggle + live POST /scan multipart)
        │
        ├── viewmodel/
        │   └── useScan.ts                    ← ViewModel hook (overlay visibility, spring animations, navigation)
        │
        └── view/
            ├── ScanOverlay.tsx               ← Modal overlay mounted over active tab screen
            ├── ScanPage.tsx                  ← Wrapper re-exporting ScanOverlay

            │
            ├── containers/
            │   └── s1_ScanOptions.tsx        ← Animated modal container with dimmed backdrop & action stack
            │
            └── components/
                ├── ScanActionButton.tsx      ← Reusable white pill button (Camera / Upload) with icon & label
                └── ScanExitButton.tsx        ← Circular coral exit button with white border & "X"
```

---

## 3. Data Model (`model/scan_types.ts`)

Pure TypeScript definitions covering the scan entity, dermatological classifications, health score, and overlay action states:

```typescript
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
```

---

## 4. API Service & Real-Time Readiness (`model/scan_api.ts` & `model/scan_mock.ts`)

### `scan_mock.ts`
Contains high-fidelity mock datasets reflecting the visual ground truth from `scan_results_results_tab.png` (Oily skin, 91.46% confidence, Skin Redness/erythema, health score 85):

```typescript
export const MOCK_SCAN_RESULT: ScanResult = {
  id: 'mock-scan-001',
  user_id: 'mock-user-001',
  image_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2',
  skin_type: 'oily',
  skin_type_confidence: 91.46,
  health_score: 85.0,
  summary: 'Your skin shows elevated sebum production in the T-zone and cheeks, with mild surface erythema (skin redness). Overall skin barrier integrity is stable.',
  conditions: [
    {
      id: 'cond-01',
      name: 'redness',
      display_name: 'Skin Redness',
      confidence: 88.5,
      description: 'Your skin shows symptoms of skin redness (erythema), an inflammatory response characterized by increased blood flow to the superficial capillaries, appearing as pink, red, or discolored patches.',
      symptoms: 'Often feels warm, tender, or itchy, and can be flat, raised, or scaly.',
      causes: 'Over-exfoliation, barrier compromise, weather irritation, or mild contact sensitivity.',
    },
  ],
  compatible_ingredients: [
    { id: 'ing-01', name: 'Salicylic acid', reason: 'Penetrates lipid layers to clear congested pores.' },
    { id: 'ing-02', name: 'Niacinamide', reason: 'Regulates sebum production and soothes vascular redness.' },
    { id: 'ing-03', name: 'Centella Asiatica', reason: 'Accelerates skin barrier repair and reduces inflammation.' },
  ],
  incompatible_pairs: [
    {
      ingredient_a: 'Retinol',
      ingredient_b: 'Salicylic Acid',
      reason: 'Combining strong keratolytics increases barrier irritation and excessive peeling. Alternate days instead.',
    },
  ],
  created_at: new Date().toISOString(),
};
```

### `scan_api.ts` (API-Ready Implementation)
Configured with the dual-branch `USE_MOCK` toggle. When toggled to `false`, it immediately sends a multipart image payload to FastAPI and Supabase without requiring new code:

```typescript
import { api } from '../../../shared/services/api';
import { ScanResult, CompatibilityResponse } from './scan_types';
import { MOCK_SCAN_RESULT } from './scan_mock';

// ============================================================================
// DATA SOURCE TOGGLE (use mock)
// Set to `true` to use mock data for all Scan screen features (Scan Analysis,
// Skin Type & Conditions, Health Score, Ingredient Compatibility).
// Set to `false` to fetch real-time live data from FastAPI and Supabase.
export const USE_MOCK: boolean = true;
// ============================================================================

/**
 * Upload face photo for end-to-end deep learning analysis.
 * - Live: POST /scan (multipart/form-data)
 * - Mock: returns MOCK_SCAN_RESULT after artificial delay
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
 * - Mock: returns compatibility slice from MOCK_SCAN_RESULT
 */
export async function fetchCompatibility(analysisId: string): Promise<CompatibilityResponse> {
  if (USE_MOCK) {
    return {
      analysis_id: analysisId,
      compatible_ingredients: MOCK_SCAN_RESULT.compatible_ingredients,
      incompatible_pairs: MOCK_SCAN_RESULT.incompatible_pairs,
    };
  }

  const response = await api.get(`/scan/${analysisId}/compatibility`);
  return response.data?.data as CompatibilityResponse;
}
```

---

## 5. ViewModel Hook (`viewmodel/useScan.ts`)

Encapsulates all UI animation states, routing actions, and overlay lifecycle triggers:

```typescript
export interface UseScanReturn {
  // Animation drivers
  fadeAnim: Animated.Value;
  slideAnim: Animated.Value;
  scaleAnim: Animated.Value;
  // User Actions
  handleTakePhoto: () => void;
  handleUploadPhoto: () => void;
  handleDismiss: () => void;
}
```

### Behavior & Flow:
1. **On Mount:** Triggers parallel entry animations:
   - Backdrop opacity: `0 -> 1` (250ms timing).
   - Bottom action container: `translateY: 100 -> 0` with spring physics (`bounciness: 6`).
2. **On "Take a Photo":** Executes exit animation, then navigates to `/scan/camera` (or invokes camera picker).
3. **On "Upload a Photo":** Executes exit animation, then navigates to `/scan/upload` (or invokes gallery picker).
4. **On "Exit" or Backdrop Tap:** Executes exit animation (`fade out + slide down`), then calls `router.back()` (or `router.replace('/(tabs)')` to return safely to Home).

---

## 6. View Breakdown & Visual Structure

### 6.1 Layout Shell (`view/ScanOverlay.tsx` & `view/ScanPage.tsx`)
- Positioned as a full-viewport overlay directly over the active tab screen (`bottom: 80` to keep the tab bar accessible).
- Connects to `useScan()` to control mounting and smooth fade/slide transitions.

### 6.2 Container (`view/containers/s1_ScanOptions.tsx`)
- **Backdrop:** `Pressable` with animated opacity, filling the screen with `bg-neutral-text/75` (tap to dismiss).
- **Action Sheet Block:** Positioned at the bottom (`pb-16 px-6 items-center w-full max-w-md self-center`), resting directly above the elevated center tab button.
- Houses the two action buttons with `gap-y-3.5`.
- **Note:** The extra exit button inside the container is removed; the center tab button itself morphs into the Exit button!

### 6.3 Components

#### Component 1: `ScanActionButton.tsx`
- **Visual Design:** White rounded card pill button.
- **Tokens:**
  - Container: `bg-neutral-white rounded-card py-4 px-6 w-full flex-row items-center justify-center shadow-lg active:opacity-80`
  - Icon: Lucide icon (`Camera` or `Upload`), size 22, color `theme.colors.text` (`#2D2D2D`), with `mr-3`.
  - Text: `text-body font-sans-bold text-neutral-text`.

#### Tab Bar Button (Integrated in `(tabs)/_layout.tsx`):
- Morphs dynamically between:
  - **Scan Mode (Default):** `bg-primary`, `Scan` icon, `"Scan"` label.
  - **Exit Mode (Overlay Open):** `bg-status-error`, `border-4 border-neutral-white`, `X` icon, `"Exit"` label. Tap closes the overlay.

---

## 7. Design Token Compliance Matrix

| UI Element | Property | Token Class / Value | Source |
|---|---|---|---|
| Backdrop | Background Color | `bg-neutral-text/80` | `tailwind.config.js` |
| Action Button | Background | `bg-neutral-white` | `tailwind.config.js` |
| Action Button | Border Radius | `rounded-card` (16px) | `tailwind.config.js` |
| Action Button Text | Typography | `text-body font-sans-bold text-neutral-text` | `tailwind.config.js` |
| Action Button Icon | Color & Size | `theme.colors.text` (22px) | `@/shared/theme` |
| Exit Button Circle | Background & Shape | `bg-status-error rounded-full` | `tailwind.config.js` |
| Exit Button Border | Stroke | `border-4 border-neutral-white` | `tailwind.config.js` |
| Exit Button Text | Typography | `text-caption font-sans-semibold text-neutral-white` | `tailwind.config.js` |
| Exit Button Icon | Color & Size | `theme.colors.white` (24px) | `@/shared/theme` |

> 🚫 **Zero Raw Values:** All styles strictly use tokens from `tailwind.config.js` and `theme.colors.*`. No arbitrary pixels (`text-[14px]`, `rounded-[20px]`) or untokenized generic classes (`text-sm`, `rounded-xl`).

---

## 8. Navigation Mapping

| User Trigger | Component / Element | Destination Route | Action / Behavior |
|---|---|---|---|
| Tap "Take a Photo" | `ScanActionButton` (Camera) | `/(tabs)/scan/camera` or Camera Viewfinder modal | Smooth exit animation, then route push to live camera screen (4.2) |
| Tap "Upload a Photo" | `ScanActionButton` (Upload) | `/(tabs)/scan/upload` or Gallery Photo Picker | Smooth exit animation, then route push to gallery upload screen (4.3) |
| Tap "Exit" Button | `ScanExitButton` | `/(tabs)` (Home) | Dismiss overlay animation, then `router.back()` or `router.replace('/(tabs)')` |
| Tap Backdrop | `s1_ScanOptions` Backdrop | `/(tabs)` (Home) | Dismiss overlay animation, restore previous screen |

---

## 9. State Handling Matrix

| Section / Element | Loading State | Empty State | Error State | Success / Ready State |
|---|---|---|---|---|
| **Backdrop** | N/A | N/A | N/A | Smooth fade-in to 80% opacity |
| **"Take a Photo"** | N/A | N/A | Fallback alert if camera unavailable | Interactive white pill button with camera icon |
| **"Upload a Photo"** | N/A | N/A | Fallback alert if media library unavailable | Interactive white pill button with upload icon |
| **Exit Button** | N/A | N/A | N/A | Interactive circular coral button with white border |

---

## 10. Execution Plan & Implementation Steps

Once this implementation plan is reviewed and approved, implementation will proceed in strict dependency order:

1. **Step 1:** Create `frontend/src/features/scan/model/scan_types.ts` (all interfaces & types).
2. **Step 2:** Create `frontend/src/features/scan/model/scan_mock.ts` (centralized mock scan payload).
3. **Step 3:** Create `frontend/src/features/scan/model/scan_api.ts` (`USE_MOCK` toggle + real-time Axios multipart `POST /scan` and `GET /scan/{id}/compatibility`).
4. **Step 4:** Create `frontend/src/features/scan/viewmodel/useScan.ts` (animations and navigation actions).
5. **Step 5:** Create sub-components in `frontend/src/features/scan/view/components/`:
   - `ScanActionButton.tsx`
   - `ScanExitButton.tsx`
6. **Step 6:** Create container `frontend/src/features/scan/view/containers/s1_ScanOptions.tsx`.
7. **Step 7:** Create layout shell `frontend/src/features/scan/view/ScanPage.tsx`.
8. **Step 8:** Update `frontend/src/app/(tabs)/scan.tsx` to mount `<ScanPage />`.
9. **Step 9:** Verify in simulator / Expo web dev server.
