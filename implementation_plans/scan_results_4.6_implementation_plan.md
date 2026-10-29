# Implementation Plan: 4.6 Scan Results — Results Tab

> **Document Type:** Screen Architecture & Implementation Plan  
> **Target Screen:** Scan Results — Results Tab (`ScanResultsPage`)  
> **UI Doc Reference:** Section 4.6 — *Scan Results — Results Tab* in `design_references/ui_design_reference.md`  
> **Visual Reference:** `design_references/scan_results_results_tab.png`  
> **Feature Domain:** `frontend/src/features/scan/`  
> **Route Path:** `frontend/src/app/scan/results.tsx` (`/scan/results`)  
> **Status:** ✅ **IMPLEMENTED (Step 2 Complete)**  

---

## 1. Overview & Visual Ground Truth

The **Scan Results — Results Tab** is the primary dermatological findings dashboard presented immediately after completing the AI skin analysis pipeline (`POST /scan`). It displays the captured face photo stored in Supabase Storage, the predicted skin type accompanied by model classification confidence, an overall heuristic skin health score (0–100), and detailed clinical condition cards for all detected skin issues (e.g., Skin Redness, Inflammatory Acne, Dark Spots) detailing symptoms, root causes, and barrier balance.

The top navigation header maintains AureSkin's signature olive green aesthetic (`bg-primary` / `#6B7B4C`), housing a non-interactive screen title, a close (`✕`) button returning to the Home tab, and a segmented tab switcher toggling between **"Results"** (Section 4.6) and **"Ingredient Compatibility"** (Section 4.7).

### Visual Layout (from `scan_results_results_tab.png`)

```
┌─────────────────────────────────────────────────────────┐
│                      Skin Analysis                  [✕] │
│          [ Results ]     Ingredient Compatibility       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │                                                   │  │
│  │               ANALYZED FACE PHOTO                 │  │
│  │                  (rounded-card)                   │  │
│  │                                                   │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Your Skin Type is                 ╭───────────╮  │  │
│  │                                    │  91.46%   │  │  │
│  │  Oily                              ╰───────────╯  │  │
│  │                                   (confidence)    │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Overall Health Score: 85.0%                      │  │
│  │  [======= Health Gauge / Score Meter =======]     │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  Concern/s                                              │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │ 🔥  Skin Redness                                  │  │
│  ├───────────────────────────────────────────────────┤  │
│  │ Your skin shows symptoms of skin redness          │  │
│  │ (erythema), an inflammatory response...           │  │
│  │                                                   │  │
│  │ Often feels warm, tender, or itchy...             │  │
│  │                                                   │  │
│  │ Causes:                                           │  │
│  │ Over-exfoliation, barrier compromise...           │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Visual & Architectural Characteristics:
- **Header:** Olive green top bar (`bg-primary` / `#6B7B4C`) with `"Skin Analysis"` title (`text-neutral-white font-sans-bold text-body`), Close button (`✕`) right (`theme.colors.white`), and dual-tab segmented switcher.
- **Tab Switcher:**
  - Active ("Results"): peachy-terracotta pill (`bg-secondary` / `#D4A574`, `text-neutral-white font-sans-semibold text-caption px-4 py-1.5 rounded-badge`).
  - Inactive ("Ingredient Compatibility"): clean white text (`text-neutral-white/80 font-sans text-caption px-4 py-1.5`).
- **Face Photo Card:** Full-width rounded card (`mx-4 mt-4 rounded-card overflow-hidden border border-border bg-card`) with smooth image fade-in.
- **Skin Type Banner:** Peachy-cream container (`bg-secondary/15 border border-secondary/20 rounded-card p-5 mx-4 mt-4 flex-row items-center justify-between`):
  - Left: `"Your Skin Type is"` (`text-secondary-dark font-sans-medium text-caption`) and `"Oily"` (`text-h1 font-sans-bold text-secondary-dark`).
  - Right: Circular white pill container (`w-20 h-20 rounded-full bg-card items-center justify-center border-2 border-secondary/20 shadow-sm`) displaying model confidence percentage (`text-secondary-dark font-sans-bold text-body-sm`).
- **Health Score Card:** Visual metric card (`bg-card rounded-card border border-border p-4 mx-4 mt-4`) displaying the 0–100 heuristic skin health score with animated gauge and dermatological summary text.
- **Concern/s Section:**
  - Section Heading: `"Concern/s"` (`text-h3 font-sans-bold text-text mx-4 mt-5 mb-3`).
  - Condition Detail Cards: Stacked cards (`rounded-card border border-border bg-card overflow-hidden mx-4 mb-4 shadow-sm`):
    - Header Strip: Coral banner (`bg-status-error/25 border-b border-border px-4 py-2.5 flex-row items-center`):
      - Flame circle icon: `w-9 h-9 rounded-full bg-status-error items-center justify-center mr-3` with `Flame` icon (`color={theme.colors.white}`).
      - Title: `"Skin Redness"` (`text-text font-sans-bold text-body flex-1`).
    - Body: Clinical description, symptoms bullet, and root causes (`text-body-sm font-sans`).
  - Empty State: When no conditions are detected: positive reinforcement card confirming a healthy, balanced skin barrier.

---

## 2. Complete Resolved File Tree

```
frontend/
├── src/
│   ├── app/
│   │   └── scan/
│   │       └── results.tsx                     ← [NEW] Route entry point (/scan/results)
│   │
│   └── features/scan/
│       ├── model/
│       │   ├── scan_types.ts                   ← [UPDATE] Add ScanResultsTab, ScanResultsParams
│       │   └── scan_api.ts                     ← [UPDATE] Add fetchScanResult(analysisId)
│       │
│       ├── viewmodel/
│       │   └── useScanResults.ts               ← [NEW] Analysis hydration (React Query), active tab state,
│       │                                             refresh control, dismiss navigation
│       │
│       └── view/
│           ├── ScanResultsPage.tsx             ← [NEW] Main layout shell
│           │
│           ├── containers/
│           │   ├── s1_ResultsHeader.tsx        ← [NEW] Olive top bar with "Skin Analysis" title, Close (✕), and Tab Switcher
│           │   ├── s2_ResultsTab.tsx          ← [NEW] Scrollable findings: Face Photo, Skin Type Banner, Health Score, Concern/s
│           │   └── s3_CompatibilityTab.tsx     ← [NEW] Container for Section 4.7 (Ingredients & harmful pairs)
│           │
│           └── components/
│               ├── ResultsTabSwitcher.tsx      ← [NEW] Segmented pill button for Results vs. Ingredient Compatibility
│               ├── FacePhotoCard.tsx           ← [NEW] Analyzed face image preview card with fallback placeholder
│               ├── SkinTypeBanner.tsx          ← [NEW] Peachy-cream card with skin type & circular confidence badge
│               ├── HealthScoreCard.tsx         ← [NEW] Visual 0-100 heuristic health score card with animated gauge
│               └── ConditionDetailCard.tsx     ← [NEW] Card with coral flame header, clinical details, symptoms & causes
```

---

## 3. Data Model Updates (`scan_types.ts`)

```typescript
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
```

---

## 4. API Functions & Mock Data

### Updates to `scan_api.ts`
We add `fetchScanResult` with the standard `USE_MOCK` branching logic:

```typescript
// ============================================================================
// DATA SOURCE TOGGLE (use mock)
// Set to `true` to use mock data for all Scan screen features (Scan Analysis,
// Camera Capture Simulation, Gallery Photos Grid, Health Score, Compatibility).
// Set to `false` to fetch real-time live data from FastAPI and Supabase.
export const USE_MOCK: boolean = true;
// ============================================================================

/**
 * Fetch a completed scan result record by analysis ID.
 * - Live: GET /scan/{analysisId}
 * - Mock: returns MOCK_SCAN_RESULT
 */
export async function fetchScanResult(analysisId?: string): Promise<ScanResult> {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return MOCK_SCAN_RESULT;
  }

  if (!analysisId) {
    throw new Error('Analysis ID is required to fetch scan results.');
  }

  const response = await api.get(`/scan/${analysisId}`);
  return response.data?.data as ScanResult;
}
```

No new mock data constants are required; `MOCK_SCAN_RESULT` in `scan_mock.ts` already contains all fields (`skin_type`, `skin_type_confidence: 91.46`, `health_score: 85.0`, `conditions`, `compatible_ingredients`, `incompatible_pairs`).

---

## 5. ViewModel Hook (`useScanResults.ts`)

### Hook Responsibilities:
1. **Route Parameter Ingestion:** Read `analysisId` and `imageUri` from `useLocalSearchParams<ScanResultsParams>()`.
2. **Data Hydration via React Query:**
   - Execute query with query key `['scanResult', analysisId || 'latest']`.
   - Call `fetchScanResult(analysisId)`.
   - In mock mode, returns `MOCK_SCAN_RESULT` instantly.
3. **Tab State Management:**
   - Store active tab: `activeTab: ScanResultsTab` (`'results' | 'compatibility'`).
   - Provide `setTab(tab: ScanResultsTab)`.
4. **Pull-to-Refresh:**
   - Expose `isRefreshing` and `onRefresh` wired to `queryClient.invalidateQueries`.
5. **Close / Exit Navigation:**
   - `handleClose`: Navigates cleanly back to the Home screen `/(tabs)`.

### Hook Interface:

```typescript
export interface UseScanResultsReturn {
  // Data
  scanResult: ScanResult | null;
  displayImageUri: string;
  activeTab: ScanResultsTab;

  // States
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;

  // Actions
  setTab: (tab: ScanResultsTab) => void;
  handleClose: () => void;
  onRefresh: () => Promise<void>;
  retry: () => void;
}
```

---

## 6. View & Container Breakdown

### 6.1 Main Layout Shell (`ScanResultsPage.tsx`)
- Container: `<SafeAreaView edges={['top']} className="flex-1 bg-primary">`
- Status Bar: `<StatusBar style="light" backgroundColor={theme.colors.primary} />`
- Body View: `<View className="flex-1 bg-background">`
- Header: `<S1ResultsHeader activeTab={activeTab} onSelectTab={setTab} onClose={handleClose} />`
- Content Views (with animated horizontal sliding transition):
  - When `activeTab === 'results'`: renders `<S2ResultsTab scanResult={scanResult} imageUri={displayImageUri} isRefreshing={isRefreshing} onRefresh={onRefresh} />`
  - When `activeTab === 'compatibility'`: renders `<S3CompatibilityTab scanResult={scanResult} isRefreshing={isRefreshing} onRefresh={onRefresh} />`

### 6.2 Containers

#### `s1_ResultsHeader.tsx`
- Layout: Olive green header banner (`bg-primary pt-3 pb-3 px-4`).
- Top Bar:
  - Title: `"Skin Analysis"` (`text-neutral-white font-sans-bold text-body text-center flex-1 ml-6`).
  - Close Button: `Pressable` with `X` icon (`size={24} color={theme.colors.white}`) on top-right.
- Bottom Row: Segmented `<ResultsTabSwitcher activeTab={activeTab} onSelectTab={onSelectTab} />`.

#### `s2_ResultsTab.tsx`
- Layout: `ScrollView` with `RefreshControl` (`className="flex-1 bg-background"`).
- Order of elements:
  1. `<FacePhotoCard imageUri={imageUri || scanResult.image_url} />`
  2. `<SkinTypeBanner skinType={scanResult.skin_type} confidence={scanResult.skin_type_confidence} />`
  3. `<HealthScoreCard healthScore={scanResult.health_score} summary={scanResult.summary} />`
  4. **Concern/s Section:**
     - Heading: `"Concern/s"` (`text-h3 font-sans-bold text-text mx-4 mt-5 mb-3`).
     - Condition Cards list: maps `scanResult.conditions` to `<ConditionDetailCard key={cond.id} condition={cond} />`.
     - Empty State: If conditions list is empty, renders confirmation card: `"No active skin conditions detected. Your skin barrier appears healthy and balanced."`

#### `s3_CompatibilityTab.tsx`
- Layout: `ScrollView` displaying the Section 4.7 compatibility view (Compatible ingredients list and incompatible pair cards).

### 6.3 Components

#### `ResultsTabSwitcher.tsx`
- Props: `{ activeTab: ScanResultsTab; onSelectTab: (tab: ScanResultsTab) => void }`
- Container: `flex-row items-center justify-center mt-3 gap-2`
- Active Tab: Peachy pill button (`bg-secondary rounded-badge px-4 py-1.5`, `text-neutral-white font-sans-semibold text-caption`).
- Inactive Tab: Transparent button (`px-4 py-1.5`, `text-neutral-white/80 font-sans text-caption`).

#### `FacePhotoCard.tsx`
- Props: `{ imageUri?: string }`
- Container: `mx-4 mt-4 rounded-card overflow-hidden border border-border bg-card aspect-[4/3]`
- Image: High-resolution face capture (`w-full h-full`, `resizeMode="cover"`).
- Fallback: Icon and label if image fails to load.

#### `SkinTypeBanner.tsx`
- Props: `{ skinType: string; confidence: number }`
- Container: `bg-secondary/15 border border-secondary/20 rounded-card p-5 mx-4 mt-4 flex-row items-center justify-between shadow-xs`
- Left:
  - Subtitle: `"Your Skin Type is"` (`text-secondary-dark font-sans-medium text-caption`).
  - Skin Type: `"Oily"` (`text-h1 font-sans-bold text-secondary-dark capitalize mt-0.5`).
- Right:
  - Confidence Circle: `w-20 h-20 rounded-full bg-card items-center justify-center border-2 border-secondary/20 shadow-sm`.
  - Confidence text: `${confidence.toFixed(2)}%` (`text-secondary-dark font-sans-bold text-body-sm`).

#### `HealthScoreCard.tsx`
- Props: `{ healthScore: number; summary?: string }`
- Container: `bg-card rounded-card border border-border p-4 mx-4 mt-4 shadow-xs`
- Row:
  - Left: Health Score Title (`text-body font-sans-bold text-text`), Health status badge (`bg-accent/15 px-2.5 py-1 rounded-badge text-accent font-sans-bold text-caption mt-1.5`), and Summary text (`text-body-sm font-sans text-muted mt-2`).
  - Right: Circular Health Gauge (`size={90}` displaying score number `85%` with `theme.colors.accent`).

#### `ConditionDetailCard.tsx`
- Props: `{ condition: SkinConditionResult }`
- Container: `rounded-card border border-border bg-card overflow-hidden mx-4 mb-4 shadow-xs`
- Coral Header Strip: `bg-status-error/25 border-b border-border px-4 py-2.5 flex-row items-center`
  - Flame Badge: `w-9 h-9 rounded-full bg-status-error items-center justify-center mr-3` with `Flame` icon (`color={theme.colors.white}`).
  - Title: Condition display name (`text-text font-sans-bold text-body flex-1`).
  - Confidence Badge: `text-caption font-sans-medium text-muted`.
- Body:
  - Description: Clinical explanation (`text-body-sm font-sans text-text leading-5 mb-2.5`).
  - Symptoms: Descriptive symptoms (`text-body-sm font-sans text-text leading-5 mb-2.5`).
  - Causes: Bold `"Causes:"` label followed by root causes text (`text-body-sm font-sans text-muted leading-5`).

---

## 7. Design Tokens & Styling Compliance Matrix

| UI Element | Property | Token Class / Value | Source |
|---|---|---|---|
| Header Background | `backgroundColor` | `bg-primary` (`#6B7B4C`) | `tailwind.config.js` |
| Header Title | `fontSize` / `fontFamily` | `text-body font-sans-bold text-neutral-white` | `tailwind.config.js` |
| Close Icon Color | `color` (JS prop) | `theme.colors.white` (`#FFFFFF`) | `@/shared/theme` |
| Active Tab Pill | `backgroundColor` / `radius` | `bg-secondary rounded-badge` (`#D4A574`) | `tailwind.config.js` |
| Active Tab Label | `fontSize` / `fontFamily` | `text-caption font-sans-semibold text-neutral-white` | `tailwind.config.js` |
| Inactive Tab Label | `fontSize` / `fontFamily` | `text-caption font-sans text-neutral-white/80` | `tailwind.config.js` |
| Page Canvas | `backgroundColor` | `bg-background` (`#F5F0EB`) | `tailwind.config.js` |
| Face Photo Card | `borderRadius` / `border` | `rounded-card border-border bg-card` | `tailwind.config.js` |
| Skin Type Banner | `backgroundColor` / `border` | `bg-secondary/15 border-secondary/20 rounded-card` | `tailwind.config.js` |
| Skin Type Label | `fontSize` / `fontFamily` | `text-h1 font-sans-bold text-secondary-dark` | `tailwind.config.js` |
| Confidence Circle | `borderRadius` / `backgroundColor` | `w-20 h-20 rounded-full bg-card border-secondary/20` | `tailwind.config.js` |
| Health Score Meter | `color` (JS prop) | `theme.colors.accent` (`#4CAF50`) | `@/shared/theme` |
| Condition Header Strip | `backgroundColor` | `bg-status-error/25 border-b border-border` | `tailwind.config.js` |
| Flame Icon Circle | `backgroundColor` / `radius` | `w-9 h-9 rounded-full bg-status-error` | `tailwind.config.js` |
| Flame Icon Color | `color` (JS prop) | `theme.colors.white` (`#FFFFFF`) | `@/shared/theme` |
| Condition Title | `fontSize` / `fontFamily` | `text-body font-sans-bold text-text` | `tailwind.config.js` |
| Condition Body Text | `fontSize` / `fontFamily` | `text-body-sm font-sans text-text` | `tailwind.config.js` |

*Zero arbitrary bracket styles (`text-[...]`, `rounded-[...]`), zero raw hex color strings in TSX.*

---

## 8. Navigation Mapping

| User Action / Event | Target Destination | Route Call |
|---|---|---|
| **Tap Close (×) Button** | Home Screen (`(tabs)/index`) | `router.replace('/(tabs)')` |
| **Tap "Ingredient Compatibility" Tab** | Switches to Compatibility view (4.7) | `setTab('compatibility')` |
| **Tap "Results" Tab** | Switches back to Results view (4.6) | `setTab('results')` |
| **Tap Compatible Ingredient Row (in 4.7)** | Ingredient Detail Page (3.3) | `router.push({ pathname: '/library/ingredient/[id]', params: { id } })` |

---

## 9. State Handling Matrix

| Section / Element | Loading State | Error State | Empty State | Success State |
|---|---|---|---|---|
| **S1 Header** | Renders static title, close button & tab switcher | Always rendered | Always rendered | Fully interactive |
| **Face Photo Card** | Shimmer / skeleton box | Placeholder icon with "Scan photo unavailable" | Fallback placeholder | High-res analyzed face photo |
| **Skin Type Banner** | Placeholder box | Hidden or default state | N/A | Skin type + confidence badge |
| **Health Score Card** | Skeleton card | Hidden | Score = 0% | Animated gauge + score + summary |
| **Concern/s Cards** | Skeleton list items | Error message with retry CTA | "No active skin conditions detected. Your skin barrier appears healthy and balanced." | List of detailed condition cards |

---

## 10. Step 1 Completion & Checkpoint

> 🛑 **MANDATORY CHECKPOINT — STOP HERE FOR REVIEW**  
> This concludes Step 1 of the screen architecture workflow. Please review the architecture, layout breakdown, component list, and tokens above.  
> Once approved, we will proceed to Step 2 (full implementation of all models, viewmodel, containers, components, and route entry).
