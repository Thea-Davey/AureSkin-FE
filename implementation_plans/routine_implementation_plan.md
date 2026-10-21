# Routine Page (No Routine Yet) — Implementation Plan (§6.1)

> Based on `design_references/ui_design_reference.md` §6.1 and `design_references/routine_empty.png`.
> Follows the routine feature structure in `documentation/part2_technical_view.md` and the existing AureSkin MVVM conventions.

## 1. Overview & Reference Mapping

| Item | Resolution |
|---|---|
| Target screen | Routine Page — No Routine Yet |
| UI reference | `design_references/ui_design_reference.md` §6.1 |
| Reference image | `design_references/routine_empty.png` |
| Feature folder | `src/features/routine/` |
| Route | `src/app/(tabs)/routine.tsx` |
| Shared shell | The tab layout already renders `AppHeader`, the bottom tab bar, and `MenuOverlay`; the Routine page must not duplicate them. |
| Screen scope | Implement the no-routine state and generation action. On successful generation, refresh the routine query and hand off to the active-routine state (§6.2); active routine editing and product swaps are not part of this plan. |

The reference layout is a vertically scrolling page with a skin-profile summary, a custom-regimen CTA and checklist, and a disclaimer banner. No matching portrait asset exists in `assets/images/`, so implementation uses a themed profile icon.

## 2. Complete Resolved File Tree

```text
src/features/routine/
├── model/
│   ├── routine_types.ts                 # Routine, step, profile, and API result types
│   ├── routine_api.ts                   # Fetch routine and generate routine with USE_MOCK toggle
│   └── routine_mock.ts                  # Empty-state and generated-routine mock fixtures
├── viewmodel/
│   └── useRoutine.ts                    # Queries, generate mutation, derived profile and screen state
└── view/
    ├── RoutinePage.tsx                  # Screen composition and loading/empty/error dispatch
    ├── containers/
    │   └── s1_EmptyRoutine.tsx           # Profile, generation CTA, and disclaimer sections
    └── components/
        ├── SkinProfileCard.tsx           # Skin type, concerns, condition, and portrait
        ├── GenerateRoutineCard.tsx       # Intro copy, benefit checklist, and generate button
        ├── RoutineDisclaimer.tsx         # AI/medical-advice disclaimer banner
        ├── RoutineLoadingState.tsx       # Skeleton placeholders for the profile and CTA
        └── GeneratedRoutineSummary.tsx   # Read-only AM/PM steps shown after generation
src/app/(tabs)/routine.tsx               # Replace the current placeholder with RoutinePage
```

No additional route is required. `src/app/(tabs)/routine.tsx` remains the tab entry and delegates rendering to the feature page. The active-routine screen, its step cards, and `SwapProductSheet` belong to §6.2 and should be planned separately.

The reference profile portrait is not currently available as a project asset. Use a themed profile icon in its place until a matching illustration is supplied.

## 3. Data Model (`routine_types.ts`)

```ts
export type RoutineTimeOfDay = 'morning' | 'evening' | 'both';

export interface RoutineProduct {
  id: string;
  name: string;
  brand: string | null;
  image_url: string | null;
}

export interface RoutineStep {
  id: string;
  step_number: number;
  step_name: string;
  description: string;
  time_of_day: RoutineTimeOfDay;
  product: RoutineProduct | null;
}

export interface Routine {
  id: string;
  based_on_analysis_id: string;
  generated_at: string;
  steps: RoutineStep[];
}

export interface RoutineSkinProfile {
  skinType: string | null;
  concerns: string[];
  healthScore: number | null;
  skinCondition: string | null;
}

```

`RoutineSkinProfile` is a view-ready projection of the latest analysis. Reuse the existing `LatestAnalysis` type and `fetchLatestAnalysis()` from `src/features/home/model/home_types.ts` and `home_api.ts`; do not duplicate the history request or its response mapping. Derive `skinCondition` only from a backend-provided label or an agreed health-score mapping; do not invent score thresholds in the UI.

The routine response fields above follow the technical document’s routine/step/product domain. Confirm the exact API response envelope and nullable fields against the backend schema when wiring the live endpoint.

## 4. API Functions & Mock Data

### `routine_api.ts`

```ts
export const USE_MOCK: boolean = true;

export async function fetchRoutine(): Promise<Routine | null>;
export async function generateRoutine(): Promise<Routine>;
```

Use the existing shared Axios `api` client, which attaches the Supabase access token and normalizes backend error messages.

- `fetchRoutine()` calls `GET /routine`; return `null` for the documented “no routine” response, and throw for unrelated network/server failures so the screen can distinguish empty from error.
- `generateRoutine()` calls `POST /routine/generate`; map the backend’s missing-analysis response to `status: 'scan-required'` and propagate other failures for the ViewModel to expose.
- When `USE_MOCK` is true, `fetchRoutine()` returns `MOCK_ROUTINE` (`null` initially); `generateRoutine()` returns `MOCK_GENERATED_ROUTINE` so the success path can be exercised.
- The latest analysis query reuses `fetchLatestAnalysis()` from Home with query key `['history', 'latest']`; its existing mock toggle supplies the profile fixture.
- Keep mock fixtures exclusively in `routine_mock.ts`.

Required toggle comment block:

```ts
// ============================================================================
// DATA SOURCE TOGGLE (use mock)
// Set to `true` to use mock data for all Routine screen features
// (Current Routine, Routine Generation).
// Set to `false` to fetch real-time live data from FastAPI and Supabase.
export const USE_MOCK: boolean = true;
// ============================================================================
```

### `routine_mock.ts`

Export `MOCK_ROUTINE: Routine | null` initialized to `null`, plus `MOCK_GENERATED_ROUTINE: Routine` with representative morning/evening steps for mutation-success testing. Keep the fixture identity and `based_on_analysis_id` aligned with the existing home mock analysis (`mock-analysis-1`). Profile data should come from the shared latest-analysis query rather than a second conflicting copy.

## 5. ViewModel Hook (`useRoutine.ts`)

Use React Query for server state and keep API calls and business rules out of JSX.

| Concern | Behavior |
|---|---|
| Latest analysis | `useQuery` with key `['history', 'latest']`, using existing `fetchLatestAnalysis()`. Supplies skin type, concerns, and health score. |
| Current routine | `useQuery` with key `['routine']`, using `fetchRoutine()`. A `null` result means the §6.1 state; a thrown error means an error state. |
| Generate action | `useMutation` using `generateRoutine()`. Disable the CTA while pending. On generated success, invalidate `['routine']` and the active-routine query if §6.2 has introduced a separate key. On scan-required, expose a clear scan prerequisite action. |
| Refresh | Export `onRefresh` and `isRefreshing`; invalidate latest analysis and routine queries for the page’s `RefreshControl`. |
| Derived state | Normalize the latest analysis into `RoutineSkinProfile`; expose whether the user needs a scan before generation. |

Return shape:

```ts
interface UseRoutineResult {
  skinProfile: RoutineSkinProfile | null;
  routine: Routine | null;
  screenState: 'loading' | 'empty' | 'error' | 'active';
  errorMessage: string | null;
  isGenerating: boolean;
  isRefreshing: boolean;
  onGenerate: () => void;
  onRetry: () => void;
  onRefresh: () => Promise<void>;
  onScanPress: () => void;
}
```

The `active` state is the handoff boundary to §6.2. The empty-state implementation must not attempt to render a routine through placeholder content; the active view is a separate follow-up scope.

## 6. View Breakdown

### `RoutinePage.tsx`

- Call `useRoutine()` and render the shared-shell content area only; do not add `AppHeader` or a second tab bar.
- Render `RoutineLoadingState` while the initial routine/profile data is loading.
- Render `s1_EmptyRoutine` when no routine exists.
- Render an inline retry state for a fetch error.
- Render `GeneratedRoutineSummary` for an existing/generated routine, grouped into read-only morning and evening steps. Editing and product swapping remain out of scope for this §6.1 implementation.
- Use a `ScrollView` with `RefreshControl` for pull-to-refresh and safe bottom padding above the persistent tab bar.
- Apply the existing theme tokens and typography/radius presets only.

### `s1_EmptyRoutine.tsx`

Compose the three vertical sections in reference order and pass typed data/actions down as props. Use a staggered fade/upward entry animation for the cards. Contains no queries or profile derivation.

### `SkinProfileCard.tsx`

- Display the “Your Skin Profile” heading and “Based on your latest skin analysis” subheading.
- Show three compact metrics for Skin Type, Concerns, and Skin Condition using droplet, scan/face, and sparkles icons.
- Use concise fallbacks when values are unavailable; concerns with no detected entries display “None detected”.
- Use a themed profile icon in a responsive circular container with an accessibility label until an approved portrait asset is supplied.

### `GenerateRoutineCard.tsx`

- Render the lab icon, “Ready for Your Custom Regimen?” heading, and brief explanation of personalized AM/PM guidance.
- Render the three benefits: step-by-step AM & PM guide, ingredient safety match, and adaptive product suggestions.
- Provide a full-width “GENERATE SKINCARE ROUTINE” primary button, with a spinner and disabled state while generating.
- When no analysis exists, preserve the scan prerequisite message and expose “Start a skin scan” as an action to `/(tabs)/scan`.
- Include screen-reader labels and disabled/loading semantics.

### `GeneratedRoutineSummary.tsx`

- Show a “Your Routine Is Ready” confirmation after generation and render the returned steps in morning/evening groups.
- Include product name/brand when supplied and the routine rationale when available.
- Keep editing, swapping products, and the full §6.2 profile treatment out of scope.

### `RoutineDisclaimer.tsx`

Show the warning icon, “Disclaimer” label, and concise AI-generation/medical-advice notice in a warning-tinted banner. It is informational, not pressable.

### `RoutineLoadingState.tsx`

Show shape-matched skeletons for the profile card and generation card while the initial data resolves. Respect reduced-motion preferences if shimmer animation is used.

## 7. Navigation Mapping

| Action | Destination / Result |
|---|---|
| Tap hamburger menu | Existing `MenuOverlay` from the shared tab layout |
| Tap “GENERATE SKINCARE ROUTINE” | Calls `POST /routine/generate`; on success stores the returned routine in React Query and renders the read-only AM/PM summary |
| Generation reports no scan | Show prerequisite feedback; “Start a skin scan” navigates to `/(tabs)/scan` |
| Tap “Start a skin scan” | `/(tabs)/scan` |
| Pull to refresh | Refresh latest analysis and current routine queries |
| Tap a bottom tab | Existing Expo Router tab navigation |

## 8. State Handling Matrix

| Section | Loading | Empty / No Routine | Error | Success |
|---|---|---|---|---|
| Skin profile | Skeleton profile card while latest analysis loads | If there is no analysis, show “Complete a skin scan to personalize your routine” and the scan action; do not fabricate metrics | Inline message and retry action if the history request fails | Show latest skin type, concerns, and measured health score without inventing a category |
| Routine generation | Button spinner; disable duplicate submissions | Show CTA and benefit checklist while the routine query returns `null` | Inline generation error; scan prerequisite action when there is no latest analysis | Store generated result and render the read-only AM/PM summary |
| Disclaimer | Render normally | Render normally | Render normally | Render normally |
| Whole page | Pull-to-refresh indicator when refreshing | Empty state is the intended §6.1 screen | Retry action re-runs failed queries | Show the generated routine summary without an empty-state flash |

## 9. Implementation Order

| Step | Task | File |
|---|---|---|
| 1 | Define routine/profile/API types | `src/features/routine/model/routine_types.ts` |
| 2 | Add empty and generated routine fixtures | `src/features/routine/model/routine_mock.ts` |
| 3 | Implement fetch/generate functions and `USE_MOCK` branch | `src/features/routine/model/routine_api.ts` |
| 4 | Implement React Query orchestration and derived states | `src/features/routine/viewmodel/useRoutine.ts` |
| 5 | Build profile, CTA, disclaimer, and loading components | `src/features/routine/view/components/` |
| 6 | Compose the empty-state sections | `src/features/routine/view/containers/s1_EmptyRoutine.tsx` |
| 7 | Build page-level loading/error/empty dispatch and refresh | `src/features/routine/view/RoutinePage.tsx` |
| 8 | Connect the existing Routine route to the page | `src/app/(tabs)/routine.tsx` |
| 9 | Review a portrait illustration replacement if one becomes available | `assets/images/` |

## 10. Review Notes / Open Decisions

1. **Portrait asset:** Resolved for this implementation with a themed profile icon; replace it if an approved portrait asset is provided later.
2. **Skin condition label:** The UI reference says this is derived from health percentage but defines no score bands. Display the measured health score without inventing a categorical label.
3. **Generation success destination:** Show the returned steps in a read-only AM/PM summary. Editing and product swapping remain part of the separately scoped §6.2 implementation.
4. **Backend response behavior:** The technical contract documents a 404 `RESOURCE_NOT_FOUND` but does not distinguish a missing routine from a missing analysis. The API treats GET 404 as no routine and surfaces POST 404 as the scan prerequisite; confirm these semantics against the backend before switching `USE_MOCK` off.

---

**Implementation status:** The §6.1 Routine screen has been implemented according to this plan. The read-only generated-routine summary is included; editing and product swapping remain part of §6.2.