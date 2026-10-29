# Implementation Plan: 4.4 Scan Submit (Submit Photo)

> **Document Type:** Screen Architecture & Implementation Plan
> **Target Screen:** Scan Submit (`ScanSubmitPage`)
> **UI Doc Reference:** Section 4.4 — *Scan Submit (Submit Photo)* in `design_references/ui_design_reference.md`
> **Visual Reference:** `design_references/scan_submit.png`
> **Feature Domain:** `frontend/src/features/scan/`
> **Route Path:** `frontend/src/app/scan/submit.tsx` (`/scan/submit`)
> **Status:** ✅ **IMPLEMENTED**

---

## 1. Overview & Visual Ground Truth

The **Scan Submit** screen is the photo confirmation and review step between image acquisition (Camera / Upload) and the AI analysis pipeline. The user inspects their captured or selected face photo in a large rounded preview card, then either retakes/reselects it or submits it to the backend skin analysis endpoint. The screen uses the same dark-charcoal canvas as the Camera and Upload screens, maintaining visual continuity across the scan flow.

### Visual Layout (from `scan_submit.png`)

```
┌─────────────────────────────────────────────────────────┐
│  (?) [Help]          Analyze Skin            [✕] [Close] │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │                                                    │  │
│  │                                                    │  │
│  │             FACE PHOTO PREVIEW                     │  │
│  │              (high-resolution)                     │  │
│  │               rounded-card                         │  │
│  │                                                    │  │
│  │                                                    │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│       "Make sure your face is evenly lit and in focus"   │
│                                                          │
│  ┌─────────────┐                    ┌──────────────────┐ │
│  │  🔄 Retake  │                    │  Submit Photo  ➔ │ │
│  └─────────────┘                    └──────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Visual & Architectural Characteristics:
- **Background:** Dark charcoal canvas matching Camera/Upload (`bg-neutral-text` / `#2D2D2D`).
- **Header Row:** Identical to `s1_CameraViewfinder` header — Help `?` left, `"Analyze Skin"` centered (`text-h3 font-sans-bold text-neutral-white`), Close `✕` right.
- **Face Preview Card:** Full-width rounded card (`w-[92%] max-w-[360px] aspect-[4/5] rounded-card overflow-hidden`) displaying the image URI received as a route param.
- **Guidance Prompt:** Centered static pill/banner below the preview: `"Make sure your face is evenly lit and in focus"` (`bg-neutral-white rounded-button`, `text-caption font-sans-bold text-neutral-text`).
- **Bottom Controls Row:**
  - **Left:** `"Retake"` button with `RotateCcw` icon and label, icon-text style (no fill background).
  - **Right:** `"Submit Photo"` white pill primary CTA (`bg-neutral-white rounded-full`) with arrow-right icon enclosed in a dark circle.
- **Guidance Modal:** Reuses the existing `SkinGuidanceModal` component from `4.2`.

---

## 2. Complete Resolved File Tree

```
frontend/
├── src/
│   ├── app/
│   │   └── scan/
│   │       └── submit.tsx               ← [NEW] Route entry point (/scan/submit)
│   │
│   └── features/scan/
│       ├── model/
│       │   └── scan_types.ts            ← [UPDATE] Add ScanSubmitParams interface
│       │
│       ├── viewmodel/
│       │   └── useScanSubmit.ts         ← [NEW] Image URI param reading, guidance modal state,
│       │                                         retake navigation, submit navigation
│       │
│       └── view/
│           ├── ScanSubmitPage.tsx       ← [NEW] Main layout shell
│           │
│           ├── containers/
│           │   ├── s1_SubmitHeader.tsx  ← [NEW] Help (?), "Analyze Skin" title, Close (✕)
│           │   └── s2_PhotoPreview.tsx  ← [NEW] Large face photo preview card + guidance prompt
│           │
│           └── components/
│               └── SubmitControls.tsx   ← [NEW] "Retake" (left) + "Submit Photo" (right) bottom row
```

> [!NOTE]
> `SkinGuidanceModal` and `scan_api.ts` (`getSkinGuidanceTips`) are **reused as-is** from Section 4.2 — no modifications required. `scan_mock.ts` requires no changes as `MOCK_SKIN_GUIDANCE_TIPS` already exists.

---

## 3. Data Model Updates (`scan_types.ts`)

```typescript
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
```

> [!NOTE]
> No new API functions or mock data are required. The Submit screen is a pure local-param screen — it reads the URI from Expo Router's `useLocalSearchParams`, renders it, and hands it forward to `/scan/analyzing`. The guidance tips reuse `getSkinGuidanceTips()` and `MOCK_SKIN_GUIDANCE_TIPS` already in `scan_api.ts`.

---

## 4. API Functions & Mock Data

No new entries required. The `scan_api.ts` `getSkinGuidanceTips()` function is called again via `useScanSubmit` to populate the guidance modal — identical pattern to `useScanCamera`. No new mock data constants needed.

---

## 5. ViewModel Hook (`useScanSubmit.ts`)

### Return Interface

```typescript
export interface UseScanSubmitReturn {
  // Image
  imageUri: string;

  // Guidance Modal State
  isGuidanceVisible: boolean;
  guidanceTips: SkinGuidanceTip[];

  // Loading & Error
  isImageError: boolean;

  // Actions
  openGuidanceModal: () => void;
  closeGuidanceModal: () => void;
  handleRetake: () => void;
  handleSubmit: () => void;
  handleClose: () => void;
  handleImageError: () => void;
}
```

### Detailed Hook Logic

1. **Read Route Params:** Uses `useLocalSearchParams<{ imageUri: string }>()` from `expo-router` to extract the `imageUri` passed by Camera or Upload.
2. **Guidance Tips:** Calls `getSkinGuidanceTips()` on mount using a `useEffect` — populates `guidanceTips` state for reuse in `SkinGuidanceModal`.
3. **Image Error State:** `isImageError` flag set to `true` via `handleImageError` callback passed to the `Image` component's `onError` prop.
4. **Retake Navigation:** `handleRetake()` calls `router.back()` — since Camera and Upload both push to `/scan/submit`, back always returns to the correct preceding screen.
5. **Submit Navigation:** `handleSubmit()` pushes to `/scan/analyzing` via:
   ```typescript
   router.push({
     pathname: '/scan/analyzing' as any,
     params: { imageUri },
   });
   ```
6. **Close Navigation:** `handleClose()` — replaces to `/(tabs)` (exits the entire scan stack). Uses `router.replace('/(tabs)')`.

---

## 6. View & Container Breakdown

### 6.1 Main Layout Shell (`ScanSubmitPage.tsx`)
- Container: `flex-1 bg-neutral-text justify-between`.
- `paddingTop: Math.max(insets.top, 16)`, `paddingBottom: Math.max(insets.bottom, 20)` via `useSafeAreaInsets`.
- `<StatusBar style="light" />`.
- Composes `s1_SubmitHeader`, `s2_PhotoPreview`, `SubmitControls`, and `SkinGuidanceModal`.

### 6.2 Container 1 — Header (`s1_SubmitHeader.tsx`)

Mirrors the `s1_CameraViewfinder` header row. Props interface:

```typescript
export interface S1SubmitHeaderProps {
  onOpenGuidance: () => void;
  onClose: () => void;
}
```

- **Row layout:** `flex-row items-center justify-between px-6 py-4`.
- **Left:** `Pressable` with `HelpCircle` icon (`color={theme.colors.card}`, size 26), `accessibilityLabel="Open skin test guidelines"`, calls `onOpenGuidance`.
- **Center:** `Text` `"Analyze Skin"` (`text-h3 font-sans-bold text-neutral-white`).
- **Right:** `Pressable` with `X` icon (`color={theme.colors.card}`, size 26), `accessibilityLabel="Exit scan and return to home"`, calls `onClose`.

### 6.3 Container 2 — Photo Preview (`s2_PhotoPreview.tsx`)

```typescript
export interface S2PhotoPreviewProps {
  imageUri: string;
  isImageError: boolean;
  onImageError: () => void;
}
```

**Layout:** `flex-1 items-center justify-center px-4`

1. **Photo Card** (`w-[92%] max-w-[360px] aspect-[4/5] rounded-card overflow-hidden`):
   - **Success state:** `<Image>` from `expo-image` with `contentFit="cover"`, `transition={200}`, the passed `imageUri`, and `onError={onImageError}`.
   - **Loading state:** Renders a `bg-neutral-card/10` placeholder behind the image while it loads from local cache (`ActivityIndicator` center — shown before `onLoad`).
   - **Error state:** Displays centered `ImageOff` icon (from `lucide-react-native`), `"Photo could not be loaded"` caption, and an optional retake prompt.

2. **Guidance Prompt Pill:**
   - Positioned below the photo card with `mt-5`.
   - `bg-neutral-white rounded-button px-5 py-2` container.
   - `Text` `"Make sure your face is evenly lit and in focus"` (`text-caption font-sans-bold text-neutral-text`).

### 6.4 Component — Submit Controls (`SubmitControls.tsx`)

```typescript
export interface SubmitControlsProps {
  isSubmitting: boolean;
  onRetake: () => void;
  onSubmit: () => void;
}
```

**Layout:** `flex-row items-center justify-between px-6 pb-4`

- **Left — Retake Button:**
  - `Pressable` with `flex-row items-center gap-x-2 active:opacity-70`.
  - `RotateCcw` icon (`color={theme.colors.card}`, size 22).
  - `Text` `"Retake"` (`text-body-sm font-sans-semibold text-neutral-white`).
  - `accessibilityLabel="Retake or reselect photo"`.

- **Right — Submit Photo Button:**
  - `Pressable` with `flex-row items-center bg-neutral-white rounded-full pl-5 pr-2 py-2 gap-x-3 active:opacity-90 active:scale-[0.98]` (scale feedback).
  - `Text` `"Submit Photo"` (`text-body-sm font-sans-bold text-neutral-text`).
  - Arrow circle badge: `View` with `w-8 h-8 rounded-full bg-neutral-text items-center justify-center`.
  - Inside the badge: `ArrowRight` icon (`color={theme.colors.card}`, size 18).
  - When `isSubmitting` is `true`: replace the arrow badge with `ActivityIndicator` (`color={theme.colors.text}`, size "small") and disable the pressable.
  - `accessibilityLabel="Submit photo for skin analysis"`.

---

## 7. Navigation Mapping

| Action | Source Component | Destination Route | Params / Payload |
|---|---|---|---|
| Tap Help Icon (?) | `s1_SubmitHeader` | Opens `SkinGuidanceModal` (in-screen modal) | N/A |
| Tap Close (✕) | `s1_SubmitHeader` | `/(tabs)` (Home) | `router.replace('/(tabs)')` |
| Tap Retake | `SubmitControls` | Previous screen (Camera or Upload) | `router.back()` |
| Tap Submit Photo | `SubmitControls` | `/scan/analyzing` | `{ imageUri: string }` |

---

## 8. State Handling Matrix

| Section / Element | Loading State | Error State | Success / Populated State |
|---|---|---|---|
| **Face Photo Preview** | `ActivityIndicator` centered inside dark card placeholder while local image loads | `ImageOff` icon + `"Photo could not be loaded"` error caption inside the card | Full-resolution portrait photo displayed in `rounded-card` via `expo-image` |
| **Guidance Prompt** | Rendered immediately (static text) | N/A | `"Make sure your face is evenly lit and in focus"` pill below photo card |
| **Submit Button** | `ActivityIndicator` replaces arrow badge; button disabled during navigation | N/A | White pill with `"Submit Photo"` label and arrow badge |
| **Retake Button** | Active and tappable during all states | N/A | `RotateCcw` icon + `"Retake"` label |
| **Guidance Modal** | N/A — tips are already loaded from `4.2`'s cached call | N/A | Slide-up `SkinGuidanceModal` with 4 guidance tip cards |

---

## 9. Design System & Token Compliance Checklist

- [x] **No arbitrary colors:** Dark canvas uses `bg-neutral-text`, guidance prompt uses `bg-neutral-white`, submit arrow badge uses `bg-neutral-text`, text uses `text-neutral-white` / `text-neutral-text`.
- [x] **Font size presets only:** `text-h3` (header), `text-body-sm` (Retake label, Submit label, guidance prompt), `text-caption` (fallback notice).
- [x] **Font family presets only:** `font-sans-bold` (header, submit label, guidance prompt), `font-sans-semibold` (retake label).
- [x] **Border radius presets only:** `rounded-card` (photo preview), `rounded-full` (submit button pill, arrow badge), `rounded-button` (guidance prompt pill).
- [x] **Strict MVVM separation:** All navigation, guidance tips loading, and submit trigger logic reside exclusively in `useScanSubmit.ts`.
- [x] **Reuses existing components:** `SkinGuidanceModal` and `getSkinGuidanceTips()` are reused unchanged from Section 4.2.
- [x] **Route registration:** `scan/submit` must be added to `_layout.tsx` `<Stack>` alongside `scan/camera`.

---

## 10. `_layout.tsx` Update Required

The root `src/app/_layout.tsx` `<Stack>` must register the new `scan/submit` and `scan/upload` routes (upload was added last session but not yet registered in the Stack):

```typescript
// Inside the <Stack screenOptions={{ headerShown: false }}> block:
<Stack.Screen name="scan/upload" options={{ animation: 'slide_from_right' }} />
<Stack.Screen name="scan/submit" options={{ animation: 'slide_from_right' }} />
```

> [!IMPORTANT]
> Without registering these screens in the root `<Stack>`, Expo Router may apply default animations that break the intended flow transitions. The `scan/camera` route is already registered — `upload` and `submit` must be added alongside it.

