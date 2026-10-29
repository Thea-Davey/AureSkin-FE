# Routine Page — No Routine Yet Implementation Plan (§6.1)

> Based on `design_references/ui_design_reference.md § 6.1`, the visual reference `design_references/routine_empty.png`, the Routine feature tree in `documentation/part2_technical_view.md`, and `skills/aureskin-screen-architecture-implementation/SKILL.md`.

## 1. Overview & Reference Mapping

| Item | Decision |
|---|---|
| Target screen | Routine Page — No Routine Yet |
| UI reference | `design_references/ui_design_reference.md` § 6.1 |
| Visual reference | `design_references/routine_empty.png` |
| Feature folder | `src/features/routine/` |
| Existing route | `src/app/(tabs)/routine.tsx`; replace the placeholder with the Routine page entry point |
| Shared shell | The Routine tab title/menu header and bottom tab bar are supplied by `src/app/(tabs)/_layout.tsx`; do not add a duplicate header or tab bar inside the feature page. |
| Scope boundary | This plan covers the no-routine state and generation action. After generation, transition to the Active Routine state in §6.2; its step cards/editor are a follow-up and are not designed here. |

The reference has an olive page surface, a compact Skin Profile card with three labeled metrics and an illustration, a central custom-regimen card with three checklist benefits and a full-width Generate CTA, and a yellow medical disclaimer banner above the persistent tabs. The only matching illustration is inside the design reference screenshot; no dedicated routine-profile illustration asset exists in the current app assets. The implementation should reuse an existing suitable bundled illustration if one is verified, or use a token-based neutral avatar placeholder until a project-approved asset is available; do not depend on the screenshot file as a runtime asset.

## 2. Complete File Tree

```text
src/features/routine/
├── model/
│   ├── routine_types.ts                  # Routine, routine step, and skin-profile summary contracts
│   ├── routine_api.ts                    # Fetch routine/profile and generate routine via FastAPI
│   └── routine_mock.ts                   # Empty state, skin profile, and generated routine fixtures
├── viewmodel/
│   └── useRoutine.ts                     # Routine/profile queries, generation mutation, refresh/retry state
└── view/
    ├── RoutinePage.tsx                   # Page shell; selects no-routine state or hands off to §6.2
    ├── containers/
    │   └── s1_EmptyRoutine.tsx             # Skin profile, generation prompt, and disclaimer composition
    └── components/
        ├── RoutineSkinProfileCard.tsx     # Skin type, concerns, and condition summary
        ├── RoutineGenerationCard.tsx      # CTA copy, benefit checklist, and Generate action
        └── RoutineDisclaimer.tsx          # AI-generated routine / dermatology disclaimer banner

src/app/(tabs)/routine.tsx                 # Update existing tab route to render RoutinePage
```

The architecture blueprint lists active-routine components (`s2_RoutineSteps`, `RoutineStepCard`, and `SwapProductSheet`) under the same feature, but those are not part of §6.1. Add them only in the separate §6.2 implementation.

## 3. Data Model (`routine_types.ts`)

```ts
export type RoutineTimeOfDay = 'morning' | 'evening' | 'both';

export interface RoutineStep {
  id: string;
  step_number: number;
  step_name: string;
  description: string;
  time_of_day: RoutineTimeOfDay;
  product_id: string | null;
}

export interface SkincareRoutine {
  id: string;
  based_on_analysis_id: string;
  created_at: string;
  steps: RoutineStep[];
}

export interface RoutineSkinProfile {
  skin_type: string | null;
  concerns: string[];
  health_score: number | null;
  overall_condition: string | null;
}
```

`RoutineStep` and `SkincareRoutine` reflect the documented `routines` and `routine_steps` tables. `RoutineSkinProfile` is a display projection from the latest `skin_analyses` record and its detected conditions. Do not fabricate a skin type or concerns when there is no scan; show the explicit no-scan state instead.

The UI reference asks for an overall-condition label derived from the latest health percentage, but the current schema does not define score bands or an approved label mapping. Reuse a verified existing health-label policy if one exists during implementation. If none exists, display the score as a percentage and use a neutral “Based on latest analysis” status rather than inventing clinical thresholds.

## 4. API Functions & Mock Data

### `routine_api.ts`

Use the existing shared authenticated Axios client from `src/shared/services/api.ts`. Preserve request failures for retry/error UI; only treat the documented no-active-routine response (for example, a 404 if confirmed by the backend) as `null`.

```ts
export const USE_MOCK: boolean = true;

export async function fetchRoutine(): Promise<SkincareRoutine | null>;
export async function fetchLatestSkinProfile(): Promise<RoutineSkinProfile | null>;
export async function generateRoutine(): Promise<SkincareRoutine>;
```

- `fetchRoutine()` calls `GET /routine`, normalizes the optional routine and ordered `steps`, and returns `null` only when the backend explicitly reports that no routine exists.
- `fetchLatestSkinProfile()` calls `GET /history?limit=1`; if an analysis exists, use its detail data to obtain `analysis_conditions[]` and map skin type and health score. Return `null` when no scan exists.
- `generateRoutine()` calls `POST /routine/generate` and normalizes the returned routine. Propagate validation/network/server errors for the ViewModel to expose.
- Do not infer that an API failure means “no routine”; keep fetch error distinct from the no-routine state.

Use this toggle block:

```ts
// ============================================================================
// DATA SOURCE TOGGLE (use mock)
// Set to `true` to use mock data for Routine screen features (current routine,
// latest skin profile, and routine generation).
// Set to `false` to fetch real-time live data from FastAPI.
export const USE_MOCK: boolean = true;
// ============================================================================
```

### `routine_mock.ts`

Export:

- `MOCK_CURRENT_ROUTINE: SkincareRoutine | null`, initialized to `null` to render this target screen.
- `MOCK_SKIN_PROFILE: RoutineSkinProfile`, matching the Home mock's latest-analysis example (`Oily`, `Skin Redness`, and its health score) so development can reproduce the screenshot.
- `MOCK_GENERATED_ROUTINE: SkincareRoutine`, returned by mock `generateRoutine()` to exercise the success handoff to §6.2.

All fixture values live in this file, not in the View or ViewModel. Mock generation should update the React Query cache with the returned routine; if mock persistence across remounts is required, keep its state in the API adapter while sourcing the initial/generated fixtures from this module.

## 5. ViewModel Hook (`useRoutine.ts`)

Use TanStack Query v5 (`useQuery`, `useMutation`, and `useQueryClient`) and local UI state only for transient actions.

### Queries and mutation

| Concern | Behavior |
|---|---|
| Current routine | Query key `['routine', 'current']`; `null` means no active routine and renders §6.1. |
| Latest skin profile | Query key `['routine', 'skin-profile']`; fetches the latest scan summary independently so the card can show an actionable no-scan state. |
| Generate | Mutation calls `generateRoutine()`, disables the CTA while pending, writes the result to `['routine', 'current']`, and invalidates routine/profile queries as appropriate. |
| Refresh | Expose `refresh()` and `isRefreshing`; refetch both routine and skin-profile queries. |
| Error | Keep routine lookup, profile lookup, and generation errors distinguishable; retry read failures and show a non-blocking generation error/Toast. |

### Return contract

```ts
{
  routine: SkincareRoutine | null;
  skinProfile: RoutineSkinProfile | null;
  isRoutineLoading: boolean;
  isSkinProfileLoading: boolean;
  isRefreshing: boolean;
  isGenerating: boolean;
  routineError: string | null;
  profileError: string | null;
  generationError: string | null;
  actions: {
    generate: () => void;
    refresh: () => Promise<void>;
    retryRoutine: () => void;
    retryProfile: () => void;
    clearGenerationError: () => void;
  };
}
```

## 6. View Breakdown

### `RoutinePage.tsx`

- Calls `useRoutine()` and composes the shared `AppHeader`-free feature content; shared navigation remains in the tab layout.
- Sets `StatusBar` to the existing primary theme color and provides a vertical scroll surface with bottom-tab clearance.
- While routine state is loading, render a stable loading placeholder instead of briefly flashing the empty CTA.
- Render `S1EmptyRoutine` when `routine === null`; if a routine exists, hand off to the §6.2 active page. Do not render the no-routine CTA for an active routine.
- On successful generation, place the generated routine in query cache and transition to the §6.2 active routine view. This is an explicit dependency: the active view must exist for the success destination to be complete.

### `s1_EmptyRoutine.tsx`

- Receives skin-profile data, loading/error flags, generation pending/error state, and typed callbacks.
- Composes the profile card, generation prompt, and disclaimer in the same top-to-bottom order as `routine_empty.png`.
- Uses the current app’s olive surface and light rounded panels while preserving scrollability on smaller screens; no duplicate tab bar.
- If the user has no scan, show a helpful inline prompt and route to the Scan tab rather than rendering fabricated profile metrics.

### `RoutineSkinProfileCard.tsx`

- Props: `profile: RoutineSkinProfile | null`, `isLoading: boolean`, `error: string | null`, `onRetry: () => void`, `onStartScan: () => void`.
- Render “Your Skin Profile”, its “Based on your latest skin analysis” subtitle, and three compact metric columns: Skin Type, Concerns, and Skin Condition.
- Show an illustration only if a bundled asset suitable for this use is verified; otherwise use a neutral icon/avatar composition without a missing remote-image dependency.
- Keep values short and wrap concerns safely; represent multiple concerns in a compact comma-separated/two-line format.
- Show skeleton values during profile loading, a retry action for fetch error, and a Start Scan CTA for the no-analysis state.

### `RoutineGenerationCard.tsx`

- Props: `isGenerating: boolean`, `error: string | null`, `canGenerate: boolean`, `onGenerate: () => void`, `onDismissError: () => void`.
- Render the lab icon, “Ready for Your Custom Regimen?” heading, and short copy that an AM/PM routine is tailored to the saved skin profile.
- Render the three benefits from the reference as a compact checklist: “Step-by-step AM & PM guide”, “Ingredient safety match”, and “Adaptive product suggestions”.
- Render a full-width Generate CTA with icon/arrow, accessible label, visible pending spinner, and disabled state while the mutation is pending or no scan exists.
- Show the generation error inline or through the app’s existing toast service; retain the page and allow retry.

### `RoutineDisclaimer.tsx`

- Render a warning icon, “Disclaimer” heading, and the UI-reference copy stating the routine is AI-generated, not clinically verified, and not a substitute for professional dermatological advice.
- Keep the warning readable and visible near the bottom of the scroll content; it is not interactive.

### Existing route: `src/app/(tabs)/routine.tsx`

- Replace the current centered placeholder text with `<RoutinePage />`, matching the route entry pattern used by Home.

### Design token constraints

- Use configured NativeWind color/font/radius tokens only and `theme.colors.*` for runtime icon/activity-indicator values.
- No raw hex values, arbitrary sizes, generic unconfigured font classes, or arbitrary radii.
- Add accessible labels to the generation CTA and any icon-only retry/scan controls. Provide pressed/loading feedback without moving surrounding layout.

## 7. Navigation Mapping

| User action | Destination / result |
|---|---|
| Tap hamburger menu | Shared `MenuOverlay`, opened through the existing shared `AppHeader` |
| Tap “GENERATE SKINCARE ROUTINE →” | Call `POST /routine/generate`; on success transition to Routine Page — Active Routine (§6.2) |
| Generation fails | Stay on §6.1, show the API error, and allow retry |
| Tap Start Scan when no analysis exists | `/(tabs)/scan` |
| Tap another bottom tab | Shared tab navigator switches tabs |

## 8. State Handling Matrix

| Area | Loading | Empty | Error | Success |
|---|---|---|---|---|
| Current routine lookup | Stable screen loading state; do not flash empty CTA | `fetchRoutine()` returns `null` and this page is rendered | Inline retryable lookup error; do not mislabel as no routine | Existing routine hands off to §6.2 instead of showing the empty state |
| Skin profile | Skeleton metrics | No analysis: explain that a scan is needed and offer Start Scan | Inline profile error with Retry | Show skin type, concerns, and derived condition/score label |
| Generation CTA | Spinner, disabled, stable dimensions | Disabled if a scan is required but absent | Error copy/Toast and retry-ready CTA | Transition to §6.2 Active Routine view |
| Disclaimer | N/A (static) | N/A | N/A | Always visible below the generation card |

## 9. Acceptance Checks

- The Routine tab route renders the §6.1 empty-state design using the shared header and bottom tabs.
- Skin type, concerns, and health status come from the latest saved scan; missing profile data is never filled with fake values in live mode.
- The generation CTA calls `POST /routine/generate`, disables during pending work, and exposes a useful error on failure.
- “No routine” is distinct from a network/server error while fetching `GET /routine`.
- Mock mode renders the empty state by default and can exercise successful generation with the generated routine fixture.
- The checklist and AI/dermatology disclaimer are present and readable at mobile sizes.
- No unverified score threshold or unsupported health claim is introduced; use an established health-label policy if one exists, otherwise show the score neutrally.
- Changed TypeScript files, Expo lint, Expo Doctor, and the iOS Expo Go flow are validated during implementation; baseline repository diagnostics are reported separately.

---

**Review checkpoint:** This artifact is a plan only. No source code or route files are changed until the plan is reviewed and approved.
