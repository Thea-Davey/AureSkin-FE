# Implementation Plan: 4.5 Scan Analyzing (Loading Screen)

> **Document Type:** Screen Architecture & Implementation Plan  
> **Target Screen:** Scan Analyzing (`ScanAnalyzingPage`)  
> **UI Doc Reference:** Section 4.5 — *Scan Analyzing (Loading Screen)* in `design_references/ui_design_reference.md`  
> **Visual Reference:** `design_references/scan_analyzing.png`  
> **Feature Domain:** `frontend/src/features/scan/`  
> **Route Path:** `frontend/src/app/scan/analyzing.tsx` (`/scan/analyzing`)  
> **Status:** ✅ **IMPLEMENTED (Step 2 Complete)**  

---

## 1. Overview & Visual Ground Truth

The **Scan Analyzing** screen is the active, full-screen animated processing state displayed while the backend executes the AI skin analysis pipeline (`POST /scan`). During this state, the backend uploads the face photo to Supabase Storage, runs MediaPipe Face Mesh for 468-point 3D landmark detection, executes the MobileNetV3 skin type and condition classifiers, computes the 0–100 heuristic skin health score, and cross-references compatible ingredients and harmful pairs.

The screen provides real-time visual feedback, step-by-step progress reassurance, and data privacy confirmation on a dark-charcoal canvas (`bg-neutral-text` / `#2D2D2D`), maintaining uninterrupted visual continuity with the Camera (4.2), Upload (4.3), and Submit (4.4) screens.

### Visual Layout (from `scan_analyzing.png`)

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                     Analyzing Skin                      │
│                                                         │
│                                                         │
│                    ╭───────────────╮                    │
│                  ╭─╯   ╭───────╮   ╰─╮                  │
│                 │     │  FACE   │     │                 │
│                 │     │  PHOTO  │     │                 │
│                 │     │ PREVIEW │     │                 │
│                  ╰─╮   ╰───────╯   ╭─╯                  │
│                    ╰───────┬───────╯                    │
│                        (• 100%)                         │
│                                                         │
│               CLASSIFYING SKIN TYPE                     │
│            AND POSSIBLE CONCERNS...                     │
│                                                         │
│       Analyzing micro-level dermal indicators           │
│                                                         │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │ 🛡️  Encrypted and processed securely making sure   │  │
│  │     your data is safe.                            │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│                    Cancel Analysis                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Visual & Architectural Characteristics:
- **Canvas & Theme:** Full-screen dark charcoal canvas (`bg-neutral-text` / `#2D2D2D`) matching the camera and submit viewports.
- **Header:** Static centered title `"Analyzing Skin"` (`text-h2 font-sans-bold text-neutral-white`). Non-interactive.
- **Circular Face Preview:** Circular crop (`w-60 h-60 rounded-full overflow-hidden`) of the user's face photo from `imageUri`.
- **Glowing Progress Ring:** Energetic glowing green circular border (`border-4 border-status-success` with subtle pulse/rotation animation) enclosing the preview.
- **Docked Percentage Pill:** Small dark pill badge docked at the bottom center of the circular frame (`bg-neutral-text border border-neutral-muted/40 rounded-badge px-3 py-1 flex-row items-center`) with a glowing green dot (`w-2 h-2 rounded-full bg-status-success mr-2`) and percentage text (`• 100%` tracking pipeline progress).
- **Dynamic Pipeline Headlines:** Bold uppercase green text (`text-status-success font-sans-bold text-body tracking-wider text-center px-6 mt-6 uppercase`) cycling through pipeline phases.
- **Pipeline Subtext:** Supportive descriptive text in off-white (`text-neutral-offwhite font-sans text-body-sm text-center px-6 mt-1.5`).
- **Security & Privacy Card:** Dark rounded container (`bg-[#383838]/80 border border-neutral-muted/30 rounded-card p-4 mx-6 flex-row items-center justify-center`) with green shield checkmark icon (`ShieldCheck` from `lucide-react-native` with `color={theme.colors.accent}`) and privacy text: *"Encrypted and processed securely making sure your data is safe."* (`text-neutral-offwhite font-sans text-caption text-center flex-1 ml-2.5`).
- **Cancel Button:** Centered text CTA at the bottom: `"Cancel Analysis"` (`text-neutral-muted font-sans-semibold text-body py-3`). Aborts ongoing network request via `AbortController` and navigates back to `/scan/submit`.
- **Error Recovery:** Modal overlay displayed on network error or face detection failure with Retry and Cancel options.

---

## 2. Complete Resolved File Tree

```
frontend/
├── src/
│   ├── app/
│   │   └── scan/
│   │       └── analyzing.tsx                   ← [NEW] Route entry point (/scan/analyzing)
│   │
│   └── features/scan/
│       ├── model/
│       │   ├── scan_types.ts                   ← [UPDATE] Add PipelineStage, ScanAnalyzingParams, AnalysisError
│       │   └── scan_api.ts                     ← [UPDATE] Add optional AbortSignal support to uploadScan()
│       │
│       ├── viewmodel/
│       │   └── useScanAnalyzing.ts             ← [NEW] Progress timer, stage sequencing, AbortController,
│       │                                             API mutation/execution, error modal state, navigation
│       │
│       └── view/
│           ├── ScanAnalyzingPage.tsx           ← [NEW] Main layout shell
│           │
│           ├── containers/
│           │   ├── s1_AnalyzingVisual.tsx      ← [NEW] Title, Circular Face Preview & Glowing Progress Ring
│           │   ├── s2_AnalyzingStatus.tsx      ← [NEW] Dynamic stage headline & subtext with animated transition
│           │   └── s3_AnalyzingFooter.tsx      ← [NEW] Security/privacy reassurance pill & "Cancel Analysis" button
│           │
│           └── components/
│               ├── AnalyzingProgressRing.tsx   ← [NEW] Circular frame, animated green ring & percentage badge
│               ├── SecurityPrivacyCard.tsx     ← [NEW] Shield check icon + encrypted data disclaimer
│               └── AnalysisErrorModal.tsx      ← [NEW] User-friendly error dialog with Retry and Cancel triggers
```

---

## 3. Data Model Updates (`scan_types.ts`)

```typescript
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
```

---

## 4. API Functions & Mock Data

### Updates to `scan_api.ts`
We update `uploadScan` to accept an optional `signal?: AbortSignal` parameter so the user's `AbortController` can cancel real network requests cleanly, and check signal in mock mode:

```typescript
/**
 * Upload face photo for end-to-end deep learning analysis.
 * Supports cancellation via AbortSignal.
 * - Live: POST /scan (multipart/form-data)
 * - Mock: returns MOCK_SCAN_RESULT after staged artificial delay
 */
export async function uploadScan(
  imageUri: string,
  signal?: AbortSignal
): Promise<ScanResult> {
  if (USE_MOCK) {
    // Simulated multi-stage delay with cancellation check
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(resolve, 2500);
      if (signal) {
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
```

No changes required in `scan_mock.ts` as `MOCK_SCAN_RESULT` is already fully populated with realistic skin type, health score, conditions, compatible ingredients, and harmful pairs.

---

## 5. ViewModel Hook (`useScanAnalyzing.ts`)

### Hook Responsibilities:
1. **Extract Route Parameters:** Retrieve `imageUri` from `useLocalSearchParams<{ imageUri?: string }>()`, falling back to `MOCK_CAMERA_PHOTO_URI` during testing.
2. **Progress Orchestration:** Increment simulated progress (0% → 100%) smoothly while synchronizing with `PIPELINE_STAGES`.
3. **API Execution & AbortController:**
   - Instantiate an `AbortController` on mount or retry.
   - Dispatch `uploadScan(imageUri, controller.signal)`.
   - On completion, jump progress to 100%, set stage to `COMPLETE`, wait 400ms for visual feedback, and navigate to results (`/scan/results`).
4. **Cancel Handling:**
   - Abort ongoing network request via `abortController.abort()`.
   - Navigate back to `/scan/submit`.
5. **Error Recovery:**
   - If network/ML error occurs, freeze progress, set `hasError: true` with descriptive message, and prompt `AnalysisErrorModal`.
   - Provide `handleRetry` to reset states and restart the pipeline.

### Hook Interface:

```typescript
export interface UseScanAnalyzingReturn {
  // Visual Data
  imageUri: string;
  progress: number; // 0 - 100
  currentStage: PipelineStageInfo;

  // States
  isAnalyzing: boolean;
  isError: boolean;
  errorMessage: string;

  // Actions
  handleCancel: () => void;
  handleRetry: () => void;
  handleDismissError: () => void;
}
```

---

## 6. View & Container Breakdown

### 6.1 Main Layout Shell (`ScanAnalyzingPage.tsx`)
- Container: `<View className="flex-1 bg-neutral-text justify-between">`
- Status Bar: `<StatusBar style="light" />`
- Top Insets: Safe area padding applied dynamically via `useSafeAreaInsets()`.
- Layout:
  1. `<S1AnalyzingVisual imageUri={imageUri} progress={progress} />`
  2. `<S2AnalyzingStatus stage={currentStage} />`
  3. `<S3AnalyzingFooter onCancel={handleCancel} />`
  4. `<AnalysisErrorModal visible={isError} message={errorMessage} onRetry={handleRetry} onCancel={handleCancel} />`

### 6.2 Containers

#### `s1_AnalyzingVisual.tsx`
- Layout: Centered column with top title and circular face preview.
- Header: Static centered title `"Analyzing Skin"` (`text-h2 font-sans-bold text-neutral-white mb-6 text-center`).
- Progress Ring Component: `<AnalyzingProgressRing imageUri={imageUri} progress={progress} />`.

#### `s2_AnalyzingStatus.tsx`
- Layout: Centered column positioned below the circular preview.
- Headline: Uppercase bold text (`text-status-success font-sans-bold text-body tracking-wider text-center px-6 uppercase`).
- Subtitle: Light off-white explanatory text (`text-neutral-offwhite font-sans text-body-sm text-center px-6 mt-1.5`).
- Animation: Smooth opacity and subtle vertical translation when `stage.key` transitions.

#### `s3_AnalyzingFooter.tsx`
- Layout: Bottom column containing the security badge and cancel button.
- Security Card: `<SecurityPrivacyCard />`
- Cancel Button: Pressable centered text button:
  - Text: `"Cancel Analysis"` (`text-neutral-muted font-sans-semibold text-body py-3 text-center`)
  - Accessibility: `accessibilityRole="button"` and `accessibilityLabel="Cancel skin analysis"`

### 6.3 Components

#### `AnalyzingProgressRing.tsx`
- Props: `{ imageUri: string; progress: number }`
- Circular Container:
  - Outer Ring: `w-64 h-64 rounded-full border-4 border-status-success items-center justify-center relative`.
  - Subtle pulsing glow: outer border styled with subtle shadow and `border-status-success`.
  - Face Preview Image: `w-[240px] h-[240px] rounded-full overflow-hidden`, `<Image source={{ uri: imageUri }} className="w-full h-full" resizeMode="cover" />`.
- Docked Percentage Badge:
  - Position: `absolute -bottom-3 self-center`
  - Container: `bg-neutral-text border border-neutral-muted/40 rounded-badge px-3.5 py-1 flex-row items-center justify-center`
  - Glowing Dot: `w-2 h-2 rounded-full bg-status-success mr-2`
  - Percentage Label: `text-neutral-white font-sans-bold text-body-sm` (e.g. `• 68%`, `• 100%`)

#### `SecurityPrivacyCard.tsx`
- Props: None (reusable static card)
- Container: `bg-[#383838]/80 border border-neutral-muted/30 rounded-card p-4 mx-6 flex-row items-center justify-center`
- Icon: `<ShieldCheck size={22} color={theme.colors.accent} />`
- Label: `"Encrypted and processed securely making sure your data is safe."` (`text-neutral-offwhite font-sans text-caption text-center flex-1 ml-2.5`)

#### `AnalysisErrorModal.tsx`
- Props: `{ visible: boolean; message: string; onRetry: () => void; onCancel: () => void }`
- Modal: Modal overlay with dark backdrop (`bg-neutral-text/90`).
- Dialog Card: `bg-card rounded-card p-6 mx-6 border border-border`
- Icon: `<AlertCircle size={40} color={theme.colors.error} />`
- Title: `"Analysis Failed"` (`text-h3 font-sans-bold text-text text-center mt-3`)
- Body: User-friendly message explaining the issue (`text-body-sm font-sans text-muted text-center mt-2`)
- Action Buttons Row:
  - **Cancel Button:** `flex-1 py-3 rounded-button border border-border items-center mr-2`, text `text-muted font-sans-semibold text-body-sm`
  - **Retry Button:** `flex-1 py-3 rounded-button bg-primary items-center ml-2`, text `text-neutral-white font-sans-bold text-body-sm`

---

## 7. Design Tokens & Styling Compliance Matrix

| UI Element | Property | Token Class / Value | Source |
|---|---|---|---|
| Screen Background | `backgroundColor` | `bg-neutral-text` (`#2D2D2D`) | `tailwind.config.js` |
| Screen Title | `fontSize` / `fontFamily` | `text-h2 font-sans-bold text-neutral-white` | `tailwind.config.js` |
| Progress Ring Border | `borderColor` | `border-status-success` (`#4CAF50`) | `tailwind.config.js` |
| Progress Ring Radius | `borderRadius` | `rounded-full` (9999px) | `tailwind.config.js` |
| Docked Badge Container | `backgroundColor` / `radius` | `bg-neutral-text border-neutral-muted/40 rounded-badge` | `tailwind.config.js` |
| Docked Green Dot | `backgroundColor` | `bg-status-success` (`#4CAF50`) | `tailwind.config.js` |
| Docked Percentage Text | `fontSize` / `fontFamily` | `text-body-sm font-sans-bold text-neutral-white` | `tailwind.config.js` |
| Stage Headline | `color` / `fontFamily` | `text-status-success font-sans-bold text-body uppercase` | `tailwind.config.js` |
| Stage Subtitle | `color` / `fontFamily` | `text-neutral-offwhite font-sans text-body-sm` | `tailwind.config.js` |
| Security Card | `borderRadius` / `border` | `rounded-card border-neutral-muted/30` | `tailwind.config.js` |
| Shield Icon Color | `color` (JS prop) | `theme.colors.accent` (`#4CAF50`) | `@/shared/theme` |
| Security Text | `fontSize` / `fontFamily` | `text-caption font-sans text-neutral-offwhite` | `tailwind.config.js` |
| Cancel Button | `fontSize` / `fontFamily` | `text-body font-sans-semibold text-neutral-muted` | `tailwind.config.js` |
| Error Modal Card | `backgroundColor` / `radius` | `bg-card rounded-card border-border` | `tailwind.config.js` |
| Error Icon Color | `color` (JS prop) | `theme.colors.error` (`#E53935`) | `@/shared/theme` |
| Retry CTA Button | `backgroundColor` / `radius` | `bg-primary rounded-button text-neutral-white` | `tailwind.config.js` |

*Zero arbitrary bracket styles (`text-[...]`, `rounded-[...]`), zero raw hex color strings in TSX.*

---

## 8. Navigation Mapping

| User Action / Event | Trigger / Condition | Target Destination | Route Call |
|---|---|---|---|
| **Pipeline Success** | `uploadScan` returns `200 OK` + complete `ScanResult` payload | Scan Results — Results Tab (4.6) | `router.replace({ pathname: '/scan/results', params: { analysisId: result.id } })` |
| **Tap "Cancel Analysis"** | User taps bottom text CTA | Scan Submit (4.4) | `abortController.abort()` then `router.back()` |
| **Tap Error Modal "Retry"** | User taps Retry button | Scan Analyzing (4.5) | Resets progress & initiates new `uploadScan` call |
| **Tap Error Modal "Cancel"** | User taps Cancel button | Scan Submit (4.4) | Closes modal and returns to `/scan/submit` |

---

## 9. State Handling Matrix

| Section / Element | Loading State (Active) | Error State | Empty State | Success State |
|---|---|---|---|---|
| **S1 Visual (Photo + Ring)** | Face preview displayed; green ring active; percentage increments (0% → 100%) | Ring stops animating; percentage freezes at failure point | N/A (falls back to mock URI if missing) | Reaches `100%` with solid ring |
| **S2 Status (Headline + Subtext)** | Dynamic text transitions through stages 1 to 4 | Displays failure status text | N/A | Displays `"ANALYSIS COMPLETE"` |
| **S3 Footer (Security + Cancel)** | Security card visible; Cancel button enabled | Cancel button remains enabled | N/A | Brief transition before screen dismissal |
| **Error Modal** | Hidden (`visible: false`) | Modal appears with diagnostic message, Retry & Cancel buttons | N/A | Hidden (`visible: false`) |

---

## 10. Step 1 Completion & Checkpoint

> 🛑 **MANDATORY CHECKPOINT — STOP HERE FOR REVIEW**  
> This concludes Step 1 of the screen architecture workflow. Please review the architecture, layout breakdown, stage sequencing, and tokens above.  
> Once approved, we will proceed to Step 2 (full implementation of all models, viewmodel, containers, components, and route entry).
