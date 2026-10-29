# Implementation Plan: 4.2 Scan Camera (Take a Photo)

> **Document Type:** Screen Architecture & Implementation Plan  
> **Target Screen:** Scan Camera (`ScanCameraPage`)  
> **UI Doc Reference:** Section 4.2 — *Scan Camera (Take a Photo)* in `design_references/ui_design_reference.md`  
> **Visual Reference:** `design_references/scan_camera.png`  
> **Feature Domain:** `frontend/src/features/scan/`  
> **Route Path:** `frontend/src/app/scan/camera.tsx` (`/scan/camera`)  
> **Status:** ✅ **IMPLEMENTED**


---

## 1. Overview & Visual Ground Truth

The **Scan Camera** screen provides a dedicated, full-screen live camera viewfinder where users capture a facial photograph for AI skin analysis (MediaPipe Face Mesh + MobileNetV3 skin type & condition classifiers).

### Visual Layout (from `scan_camera.png`)
```
┌─────────────────────────────────────────────────────────┐
│  (?) [Help]           Analyze Skin             [X] [Close]
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │                                                   │  │
│  │                                                   │  │
│  │                LIVE CAMERA FEED                   │  │
│  │             (expo-camera CameraView)              │  │
│  │                 rounded-card                      │  │
│  │                                                   │  │
│  │                                                   │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│                     [ Take photo ]                      │
│                                                         │
│   ┌────────┐          ┌──────────────┐          ┌───┐   │
│   │ Recent │          │   SHUTTER    │          │ ⇅ │   │
│   │ Gallery│          │    BUTTON    │          │Flip   │
│   └────────┘          └──────────────┘          └───┘   │
└─────────────────────────────────────────────────────────┘
```

### Visual & Architectural Characteristics:
- **Background:** Immersive dark charcoal canvas (`bg-neutral-text` / `#2D2D2D`).
- **Header:** Non-interactive centered title `"Analyze Skin"` (`text-h3 font-sans-bold text-neutral-white`), flanked by circular Help button `?` (`HelpCircle`) on the left and Close button `✕` (`X`) on the right.
- **Viewfinder:** Centered rounded rectangle (`rounded-card`, 16px corner radius) streaming real-time video via `expo-camera` (`CameraView`), defaulting to the front (selfie) camera (`facing="front"`).
- **Prompt Banner:** Centered white pill/button (`bg-neutral-white rounded-button px-5 py-1.5`) directly below the viewfinder with `"Take photo"` label (`text-caption font-sans-bold text-neutral-text`).
- **Bottom Controls Row:**
  - **Left:** Gallery thumbnail preview (`w-14 h-14 rounded-input border border-neutral-white/20`) linking directly to **Scan Upload (4.3)**.
  - **Center:** Large circular white shutter button (`w-20 h-20 rounded-full border-4 border-neutral-white/40 bg-neutral-white items-center justify-center shadow-lg active:scale-95`).
  - **Right:** Circular camera flip icon button (`w-12 h-12 rounded-full items-center justify-center`) with vertical arrows (`SwitchCamera`) toggling front/rear lenses.
- **Guidance Modal:** Tapping the Help icon (`?`) opens a slide-up modal with clean guidelines: lighting, neutral expression, cleansed face, and glasses removed.

---

## 2. Complete Resolved File Tree

```
frontend/
├── src/
│   ├── app/
│   │   └── scan/
│   │       └── camera.tsx                ← Route entry point (/scan/camera), no tabs/AppHeader
│   │
│   └── features/scan/
│       ├── model/
│       │   ├── scan_types.ts             ← [UPDATE] Add CameraFacing, CameraState, GuidanceTip interfaces
│       │   ├── scan_mock.ts              ← [UPDATE] Add MOCK_CAMERA_PHOTO_URI and MOCK_GALLERY_THUMBNAIL
│       │   └── scan_api.ts               ← [UPDATE] Add capture/helper abstractions & USE_MOCK branching
│       │
│       ├── viewmodel/
│       │   ├── useScan.ts                ← [UPDATE] Point handleTakePhoto to router.push('/scan/camera')
│       │   └── useScanCamera.ts          ← [NEW] Camera permissions, facing switch, capture logic, modal state
│       │
│       └── view/
│           ├── ScanCameraPage.tsx        ← [NEW] Main layout shell with dark canvas & SafeAreaView
│           │
│           ├── containers/
│           │   ├── s1_CameraViewfinder.tsx ← [NEW] Top nav bar, live CameraView card, flash overlay
│           │   └── s2_CameraControls.tsx   ← [NEW] Prompt badge + bottom row (Gallery, Shutter, Flip)
│           │
│           └── components/
│               ├── CameraShutterButton.tsx    ← [NEW] Circular double-ring shutter with spring micro-interaction
│               ├── CameraGalleryThumbnail.tsx ← [NEW] Recent photo preview thumbnail linking to upload screen
│               ├── CameraFlipButton.tsx       ← [NEW] Front/Rear toggle button with rotation micro-animation
│               └── SkinGuidanceModal.tsx      ← [NEW] Slide-up modal containing skin test tips
```

---

## 3. Data Model Updates (`scan_types.ts`)

```typescript
// ── Camera Specific Types (Section 4.2) ──────────────────────────

export type CameraFacing = 'front' | 'back';

export type CameraPermissionStatus = 'undetermined' | 'granted' | 'denied';

export interface CameraCapturedPhoto {
  uri: string;
  width: number;
  height: number;
}

export interface SkinGuidanceTip {
  id: string;
  title: string;
  description: string;
  iconName: 'Sun' | 'Sparkles' | 'Smile' | 'Glasses';
}
```

---

## 4. API Functions & Mock Data (`scan_api.ts` & `scan_mock.ts`)

### `scan_mock.ts` Updates:
```typescript
export const MOCK_CAMERA_PHOTO_URI =
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80';

export const MOCK_GALLERY_THUMBNAIL =
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80';

export const MOCK_SKIN_GUIDANCE_TIPS: SkinGuidanceTip[] = [
  {
    id: 'tip-1',
    title: 'Even Natural Lighting',
    description: 'Face a bright window or evenly diffused light. Avoid strong backlighting or harsh shadows.',
    iconName: 'Sun',
  },
  {
    id: 'tip-2',
    title: 'Clean, Makeup-Free Skin',
    description: 'Cleanse away excess oils and remove foundation or concealer for accurate condition detection.',
    iconName: 'Sparkles',
  },
  {
    id: 'tip-3',
    title: 'Neutral Facial Expression',
    description: 'Keep your face relaxed, look directly into the camera, and tuck stray hair away from your forehead.',
    iconName: 'Smile',
  },
  {
    id: 'tip-4',
    title: 'Remove Glasses & Accessories',
    description: 'Take off eyeglasses and hats to prevent glare and anatomical landmark occlusions.',
    iconName: 'Glasses',
  },
];
```

### `scan_api.ts` Toggle Block & Capture Helper:
```typescript
// ============================================================================
// DATA SOURCE TOGGLE (use mock)
// Set to `true` to use mock data for all Scan screen features (Scan Analysis,
// Camera Capture Simulation, Health Score, Ingredient Compatibility).
// Set to `false` to fetch real-time live data from FastAPI and Supabase.
export const USE_MOCK: boolean = true;
// ============================================================================

export async function getRecentGalleryThumbnail(): Promise<string | null> {
  if (USE_MOCK) {
    return MOCK_GALLERY_THUMBNAIL;
  }
  // Optional: Read latest asset from media library
  return null;
}
```

---

## 5. ViewModel Hook (`useScanCamera.ts`)

```typescript
export interface UseScanCameraReturn {
  // Camera State
  facing: CameraFacing;
  isPermissionGranted: boolean;
  isPermissionPending: boolean;
  isCapturing: boolean;
  flashAnim: Animated.Value;
  cameraRef: React.RefObject<CameraView | null>;
  recentThumbnail: string | null;

  // Guidance Modal State
  isGuidanceVisible: boolean;
  guidanceTips: SkinGuidanceTip[];

  // User Actions
  toggleCameraFacing: () => void;
  requestCameraPermission: () => Promise<boolean>;
  capturePhoto: () => Promise<void>;
  openGuidanceModal: () => void;
  closeGuidanceModal: () => void;
  navigateToUpload: () => void;
  handleClose: () => void;
}
```

### Detailed Hook Logic:
1. **Permissions:** Calls `useCameraPermissions()` from `expo-camera`. If undetermined, prompts automatically or provides CTA button.
2. **Facing Toggle:** Toggles between `'front'` (default) and `'back'`.
3. **Capture & Flash:**
   - Triggers `flashAnim` timing (`0 -> 0.85 -> 0` in 180ms) for realistic shutter feedback.
   - If `USE_MOCK === true` or running in a web sandbox without camera hardware: uses `MOCK_CAMERA_PHOTO_URI`.
   - On native hardware: calls `cameraRef.current.takePictureAsync({ quality: 0.85, skipProcessing: false })`.
   - Navigates immediately to `/scan/submit` passing `{ imageUri: capturedUri }`.
4. **Guidance Modal:** Controls slide-up visibility boolean `isGuidanceVisible`.
5. **Dismiss/Close:** Pops the router stack or calls `router.replace('/(tabs)')`.

---

## 6. View & Container Breakdown

### 6.1 Main Layout Shell (`ScanCameraPage.tsx`)
- Root container styled with `flex-1 bg-neutral-text` (`#2D2D2D`).
- Uses `useSafeAreaInsets` to provide padding at the top and bottom.
- Composes `s1_CameraViewfinder`, `s2_CameraControls`, and `SkinGuidanceModal`.
- Configures `StatusBar style="light"` for seamless full-screen dark contrast.

### 6.2 Container 1 (`s1_CameraViewfinder.tsx`)
- **Top Header:**
  - Row layout (`flex-row items-center justify-between px-6 py-4`).
  - Left: `Pressable` with `HelpCircle` icon (`color={theme.colors.card}` / white, size 26).
  - Center: `Text` `"Analyze Skin"` (`text-h3 font-sans-bold text-neutral-white`).
  - Right: `Pressable` with `X` icon (`color={theme.colors.card}` / white, size 26).
- **Viewfinder Box:**
  - Centered box with fixed aspect ratio (`aspect-[3/4]` or `aspect-[1/1]`, max width 360, width `'90%'`).
  - Styled with `rounded-card overflow-hidden bg-neutral-text border border-neutral-white/10`.
  - Mounts `<CameraView ref={cameraRef} facing={facing} style={StyleSheet.absoluteFill} />`.
  - Overlaid with an `Animated.View` (`backgroundColor: theme.colors.card`, `opacity: flashAnim`) to render the shutter flash.
  - If permissions are not yet granted, displays the Permission Request State inside the card.

### 6.3 Container 2 (`s2_CameraControls.tsx`)
- **"Take photo" Badge:**
  - Centered directly below the viewfinder.
  - Container: `bg-neutral-white rounded-button px-6 py-2 shadow-sm self-center mt-4 mb-6`.
  - Label: `Text` `"Take photo"` (`text-caption font-sans-bold text-neutral-text`).
- **Bottom Controls Row:**
  - Horizontal row with `flex-row items-center justify-between px-10 pb-6 w-full max-w-md self-center`.
  - **Left:** `<CameraGalleryThumbnail thumbnailUri={recentThumbnail} onPress={navigateToUpload} />`
  - **Center:** `<CameraShutterButton onPress={capturePhoto} isCapturing={isCapturing} />`
  - **Right:** `<CameraFlipButton onFlip={toggleCameraFacing} />`

### 6.4 Components
1. **`CameraShutterButton.tsx`:**
   - Outer ring: `w-20 h-20 rounded-full border-4 border-neutral-white/40 items-center justify-center`.
   - Inner button: `w-16 h-16 rounded-full bg-neutral-white active:scale-95`.
   - Provides haptic feedback and spring animation on press.
2. **`CameraGalleryThumbnail.tsx`:**
   - Square button: `w-14 h-14 rounded-input border border-neutral-white/30 overflow-hidden bg-neutral-card/20 items-center justify-center`.
   - Displays recent image thumbnail if available, otherwise a generic gallery `Image` icon (`color={theme.colors.card}`).
3. **`CameraFlipButton.tsx`:**
   - Button: `w-14 h-14 rounded-full bg-neutral-white/10 items-center justify-center active:bg-neutral-white/20`.
   - Icon: `SwitchCamera` from `lucide-react-native` (`color={theme.colors.card}`, size 26).
4. **`SkinGuidanceModal.tsx`:**
   - Semi-transparent backdrop (`rgba(0,0,0,0.6)`).
   - Bottom sheet container: `bg-card rounded-t-card p-6 w-full max-w-md self-center`.
   - Header with title `"Skin Test Guidelines"` and close icon.
   - List of 4 guidance points with icons (Lighting, Cleanliness, Neutral Expression, No Glasses).
   - Primary action button: `bg-primary rounded-button py-3.5 items-center` with `"Got It"` label (`text-label font-sans-bold text-neutral-white`).

---

## 7. Navigation Mapping

| Action | Source Component | Destination Route | Params / Payload |
|---|---|---|---|
| Tap Shutter Button | `CameraShutterButton` | `/scan/submit` | `{ imageUri: string }` |
| Tap Gallery Thumbnail | `CameraGalleryThumbnail` | `/scan/upload` | None |
| Tap Close (✕) | Top Header in `s1_CameraViewfinder` | Previous tab screen | `router.back()` or `router.replace('/(tabs)')` |
| Tap Help (?) | Top Header in `s1_CameraViewfinder` | Modal Overlay | Opens `SkinGuidanceModal` |
| Tap "Got It" or Backdrop | `SkinGuidanceModal` | Dismiss Modal | Closes `SkinGuidanceModal` |
| Denied Permission CTA | Permission Fallback Card | System Settings | `Linking.openSettings()` |

---

## 8. State Handling Matrix

| Section / Element | Loading State | Empty State | Error / Denied State | Success / Populated State |
|---|---|---|---|---|
| **Camera Viewfinder** | Dark card with centered `ActivityIndicator` (`color={theme.colors.card}`) | N/A (Live feed) | Card shows camera off icon + `"Camera access needed"` + `"Grant Permission"` CTA button | Seamless live `CameraView` video stream |
| **Gallery Thumbnail** | Subdued placeholder skeleton | Default image icon placeholder | Generic gallery icon fallback | Displays cached thumbnail of recent photo |
| **Shutter Button** | Disabled if camera is initializing | N/A | Disabled with visual dimming | Active white button with tactile spring response |
| **Guidance Modal** | N/A (Synchronous local state) | N/A | N/A | Smooth slide-up card with 4 tips and `"Got It"` button |

---

## 9. Design System & Token Compliance Checklist

- [x] **No arbitrary colors:** Background uses `bg-neutral-text` (`#2D2D2D`), buttons use `bg-neutral-white`, icons use `theme.colors.card` (`#FFFFFF`).
- [x] **Font size presets only:** `text-h3` (Analyze Skin), `text-caption` (Take photo), `text-body` (Modal tips), `text-label` (Got It button).
- [x] **Font family presets only:** `font-sans`, `font-sans-medium`, `font-sans-bold`.
- [x] **Border radius presets only:** `rounded-card` (viewfinder, modal), `rounded-button` (Take photo badge, Got It button), `rounded-input` (gallery thumbnail), `rounded-full` (shutter, flip button).
- [x] **Strict MVVM separation:** All camera hooks and permissions live inside `useScanCamera.ts`; view files contain zero business logic.
- [x] **Centralized mock toggle:** `USE_MOCK` in `scan_api.ts` cleanly isolates local testing from live hardware/FastAPI endpoints.
