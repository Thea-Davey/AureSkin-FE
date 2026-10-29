# Routine Page — Active Routine Implementation Plan (§6.2)

> Based on `design_references/ui_design_reference.md § 6.2`, `design_references/routine_active.png`, the Routine feature tree in `documentation/part2_technical_view.md`, and `skills/aureskin-screen-architecture-implementation/SKILL.md`.

## 1. Overview & Reference Mapping

| Item | Decision |
|---|---|
| Target screen | Routine Page — Active Routine |
| UI reference | `design_references/ui_design_reference.md` § 6.2 |
| Visual reference | `design_references/routine_active.png` |
| Feature folder | `src/features/routine/` |
| Route | Reuse `src/app/(tabs)/routine.tsx` and `RoutinePage.tsx`; render the active state when `fetchRoutine()` returns a routine. |
| Shared shell | Preserve the app header, menu, and bottom tabs provided by `src/app/(tabs)/_layout.tsx`. |
| Existing implementation to extend | `routine_types.ts`, `routine_api.ts`, `routine_mock.ts`, `useRoutine.ts`, `RoutinePage.tsx`, `RoutineSkinProfileCard.tsx`, and `s2_RoutineSteps.tsx` already exist from §6.1. |
| Scope boundary | Add active routine profile, AM/PM timeline, rationale, and step/product editing sheet. Do not add scheduling, reminders, or completion checkboxes. There is no Product Detail route in the current app; product selection/swapping stays in the sheet. |

The screenshot shows a full olive tab surface with a skin-profile card, a personalized-routine section heading, separate Morning and Night cards, numbered timeline steps, an Edit control on each regimen, recommended product information where present, and a rationale banner. A custom profile portrait asset is not currently available: `home-img1.png` illustrates scanning people and `home-img2.png` is a guide icon, so neither should be repurposed as the skin-profile avatar. Reuse the current neutral icon-based profile visual until an approved portrait asset is added.

The current Active Routine rendering in `s2_RoutineSteps.tsx` is only a basic generated confirmation and step list. The existing model has no joined product details or update mutation yet. This plan extends those current files; it does not replace the §6.1 empty-state flow.

## 2. Complete File Tree

```text
src/features/routine/
├── model/
│   ├── routine_types.ts                  # Add product, step update, and optional rationale contracts
│   ├── routine_api.ts                    # Add product option fetch and step update API functions
│   └── routine_mock.ts                   # Add product options and an active routine fixture
├── viewmodel/
│   └── useRoutine.ts                     # Add active-step edit state, product query, and update mutation
└── view/
    ├── RoutinePage.tsx                   # Select empty or active state and compose profile + rationale
    ├── containers/
    │   └── s2_RoutineSteps.tsx             # Upgrade to AM/PM timeline cards and Edit actions
    └── components/
        ├── RoutineStepCard.tsx             # Timeline step, description, and optional recommendation
        ├── SwapProductSheet.tsx             # Select routine step and alternate product; edit supported fields
        └── RoutineRationaleCard.tsx         # Why this routine? explanation banner
```

`routine_types.ts`, `routine_api.ts`, `routine_mock.ts`, `useRoutine.ts`, `RoutinePage.tsx`, `s2_RoutineSteps.tsx`, and `RoutineSkinProfileCard.tsx` are existing files and must be extended in place. Keep `s1_EmptyRoutine.tsx`, `RoutineGenerationCard.tsx`, and `RoutineDisclaimer.tsx` unchanged except for any small shared-type updates required by implementation.

## 3. Data Model (`routine_types.ts`)

Extend the current step and routine contracts as follows:

```ts
export interface RoutineProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  image_url: string | null;
}

export interface RoutineStep {
  id: string;
  step_number: number;
  step_name: string;
  description: string;
  time_of_day: RoutineTimeOfDay;
  product_id: string | null;
  product: RoutineProduct | null;
}

export interface SkincareRoutine {
  id: string;
  based_on_analysis_id: string;
  created_at: string;
  steps: RoutineStep[];
  rationale: string | null;
}

export interface RoutineStepUpdate {
  product_id?: string | null;
  step_name?: string;
  description?: string;
}

export interface RoutineProductPage {
  items: RoutineProduct[];
  nextOffset: number | null;
}
```

Keep existing `RoutineTimeOfDay` and `RoutineSkinProfile`. Normalize optional API product joins to `product: null` if no recommendation exists. The product schema documents `id`, `name`, `brand`, `category`, and `image_url`; the routine-step relation documents `product_id`, step text, ordering, and time of day. The technical docs do not specify a rationale database field. Accept an optional API `rationale` if the backend actually returns it; otherwise use a neutral fallback based on the active routine’s saved steps, not invented analysis/scoring thresholds.

## 4. API Functions & Mock Data

### `routine_api.ts`

Extend the existing module and preserve its `USE_MOCK`, authenticated shared Axios client, `fetchRoutine()`, `fetchLatestSkinProfile()`, and `generateRoutine()` behavior.

```ts
export async function fetchRoutine(): Promise<SkincareRoutine | null>;
export async function fetchProductOptions(params: {
  query?: string;
  limit: number;
  offset: number;
}): Promise<RoutineProductPage>;
export async function updateRoutineStep(
  stepId: string,
  updates: RoutineStepUpdate
): Promise<RoutineStep>;
```

- Keep `GET /routine` as the source for the active routine, ordered steps, and any joined product details. Preserve `rationale` only when returned by the endpoint.
- Fetch swap options from the documented `GET /products` endpoint, using its supported `q`, `limit`, and `offset` parameters. Normalize product fields at the API boundary and return a next offset only when more items are available.
- Save a selected product or edited step through `PUT /routine/steps/{id}` with only the changed fields (`product_id`, `step_name`, and/or `description`). Return the normalized updated step; propagate request/validation errors so the sheet can show an error and retain its state.
- Mock mode uses `MOCK_PRODUCT_OPTIONS` and updates the in-memory mock routine so the changed recommendation is visible after the sheet closes.

The existing toggle block continues to cover the full Routine feature; update its wording to include active routine fetch, product swap options, and step updates:

```ts
// ============================================================================
// DATA SOURCE TOGGLE (use mock)
// Set to `true` to use mock data for Routine screen features (current routine,
// latest skin profile, generation, product options, and step updates).
// Set to `false` to fetch real-time live data from FastAPI.
export const USE_MOCK: boolean = true;
// ============================================================================
```

### `routine_mock.ts`

- Keep `MOCK_CURRENT_ROUTINE` as `null` for the initial no-routine path unless an active-state fixture is explicitly selected for UI testing.
- Export `MOCK_ACTIVE_ROUTINE` with ordered `both`, `morning`, and `evening` steps, associated `product_id`s, joined product names/brands/images, and a neutral routine rationale.
- Export `MOCK_PRODUCT_OPTIONS` with a small variety of safe demonstration products across cleanser, toner, serum, moisturizer, and sunscreen categories.
- Mock product option search and pagination should match the live `RoutineProductPage` contract.
- Mock `updateRoutineStep` applies the selected product/update to the in-memory active routine and returns the changed step.
- Keep all fixture content in this file, not in the view or ViewModel.

## 5. ViewModel Hook (`useRoutine.ts`)

Extend the existing hook; continue to own the current routine and latest skin profile queries used by §6.1.

### Queries, mutations, and transient state

| Concern | Behavior |
|---|---|
| Current routine | Retain `['routine', 'current']` query and refetch behavior. An existing routine selects the active state; `null` selects §6.1. |
| Skin profile | Retain `['routine', 'skin-profile']`; use the same latest analysis card on the active page. |
| Product options | Query `fetchProductOptions()` only while the swap sheet is open, keyed by selected step/time-of-day and current product search string. |
| Step update | Mutation calls `updateRoutineStep(stepId, updates)`, patches `['routine', 'current']` on success, closes the sheet only after success, and keeps the sheet open with retryable error on failure. |
| Edit target | Track the selected `morning`/`evening` regimen and selected step ID. `both` steps appear in both regimen lists but retain one step ID so a change updates the shared step. |
| Product search/pagination | Expose query text and next-page controls for `/products`; prevent duplicate page loads. |
| Refresh | Refresh routine and skin profile; if the swap sheet is open, preserve its draft and search state. |

### Return contract additions

Retain the §6.1 return values and add:

```ts
{
  selectedTimeOfDay: 'morning' | 'evening' | null;
  selectedStepId: string | null;
  productSearch: string;
  productOptions: RoutineProduct[];
  isProductOptionsLoading: boolean;
  isFetchingMoreProducts: boolean;
  hasMoreProducts: boolean;
  isUpdatingStep: boolean;
  updateError: string | null;
  actions: {
    openStepEditor: (timeOfDay: 'morning' | 'evening', stepId?: string) => void;
    closeStepEditor: () => void;
    setProductSearch: (query: string) => void;
    loadMoreProducts: () => void;
    updateStep: (stepId: string, updates: RoutineStepUpdate) => void;
    retryProductOptions: () => void;
  };
}
```

The selected step can be chosen inside the sheet if `openStepEditor()` receives only a time of day; otherwise initialize the sheet to that step. This keeps both per-section Edit actions and direct step editing on one shared editor surface.

## 6. View Breakdown

### `RoutinePage.tsx`

- Reuse `useRoutine()` and `RoutineSkinProfileCard`; do not create a second routine query or shared header.
- When `routine === null`, continue rendering existing `S1EmptyRoutine` (§6.1).
- When the active routine exists, render the profile card, “Your Personalized Skincare Routine” section heading/subtitle, `S2RoutineSteps`, and `RoutineRationaleCard` in that order.
- Preserve page-level `ScrollView`/`RefreshControl`, safe-area/tab clearance, olive background, and existing shared navigation.
- Pass `openStepEditor` to the section Edit controls and step/product actions. Mount one `SwapProductSheet` at page level so edit state and mutation are shared.
- Loading/error behavior remains in the existing screen shell. Never flash §6.1 while `GET /routine` is still loading.

### `s2_RoutineSteps.tsx`

- Props: morning steps, evening steps, current product/update state, and callbacks to open the step editor.
- Render two separate rounded regimen cards with their icons and subtitle text: Morning “Protect & hydrate your skin”; Night “Protect & hydrate your skin” or the approved nighttime copy from the reference.
- Each regimen has an Edit pill that opens `SwapProductSheet` for that time of day.
- Render ordered vertical timelines with numbered circle badges and a connected line between steps. Do not add checkboxes, reminders, completion toggles, or schedules.
- Reuse `RoutineStepCard` for each row; show recommended product summary only when a product is linked.
- Render an explicit no-steps message if the API returns a routine with no steps.

### `RoutineStepCard.tsx`

- Props: step, timeline position (`first`, `middle`, `last`, or `only`), and callbacks to edit the step or open product selection.
- Show the numbered step badge, bold step name, and description. Keep long step descriptions wrapping within the card.
- If a recommended product exists, show its name, brand, and optional image thumbnail/fallback; tapping opens the editor focused on that step/product.
- Use accessible press labels and tactile opacity feedback. Avoid a detail-route push because the app has no Product Detail page implemented.

### `SwapProductSheet.tsx`

- Props: visibility, selected time of day/step, current steps, product options/loading/error/search/pagination, update status/error, and typed actions.
- Present an accessible bottom-sheet/modal flow with an ordered step selector for the selected regimen and a searchable list of replacement products.
- Each product option shows product name, brand, category, and optional thumbnail/fallback. Show the currently selected product clearly.
- Support “Remove product” for nullable `product_id` where the API permits it, plus Cancel and Save/Apply actions. Persist only on explicit confirmation.
- Keep sheet state open on update failure and show Retry/error text. Prevent repeated saves while `isUpdatingStep` is true.
- Do not claim the product is medically suitable; this is a routine recommendation swap interface.

### `RoutineRationaleCard.tsx`

- Props: `rationale: string | null`, `skinProfile: RoutineSkinProfile | null`.
- Render a shield/check icon, “Why this routine?” heading, and the API-provided rationale when present.
- When absent, show neutral static copy such as “This routine is based on your latest skin analysis and its saved routine steps.” Do not generate disease claims, imply guaranteed outcomes, or derive unsupported score thresholds.

### Design token and asset constraints

- Follow current NativeWind tokens and existing font/radius presets; use `theme.colors.*` for runtime icon/activity-indicator colors.
- No raw hex colors, arbitrary sizes/radii, or generic unconfigured font classes.
- The current bundled art does not include the routine avatar shown in the reference. Reuse the existing neutral `UserRound` visual in `RoutineSkinProfileCard` unless an approved profile illustration is added separately; do not substitute unrelated home/tutorial graphics.

## 7. Navigation Mapping

| User action | Destination / result |
|---|---|
| Tap Morning Edit | Open `SwapProductSheet` scoped to morning steps |
| Tap Night Edit | Open `SwapProductSheet` scoped to evening steps |
| Tap a routine step/product | Open the same sheet focused on that step |
| Select product and Save | `PUT /routine/steps/{id}`, update local routine cache, close sheet on success |
| Cancel/dismiss sheet | Return to active routine without persisting draft changes |
| Pull to refresh | Refetch `GET /routine` and latest profile |
| Tap hamburger | Shared `MenuOverlay` via `AppHeader` |
| Tap another bottom tab | Shared tab navigator switches to the chosen tab |
| Tap product detail | No navigation in this task because Product Detail §3.4 has no route in the current app; keep the card interaction within the editor sheet |

## 8. State Handling Matrix

| Area | Loading | Empty | Error | Success |
|---|---|---|---|---|
| Routine query | Existing full-screen/card loading state; do not show empty CTA prematurely | `null` continues to render §6.1 | Retryable inline error; do not mislabel network failure as no routine | Render active routine content |
| Skin profile card | Reuse profile skeleton | Missing latest scan/profile shows explicit unavailable state | Reuse profile retry state | Show latest skin type, concerns, and neutral health metric |
| Morning/night timelines | Skeleton timeline rows | Message for a routine with no steps in that period | Routine-level error/retry | Ordered steps with optional product summaries |
| Product recommendation image | Neutral placeholder | No image URL uses placeholder | Image error falls back to placeholder | Cached product image and product labels |
| Swap-product options | Loading rows and disabled save | “No products found” with clear-search action | Inline error/retry while keeping the sheet open | Searchable/paginated product choices |
| Step update | Disable Save and indicate pending state | N/A | Keep sheet/draft open, show actionable error | Patch the routine cache and close the sheet |
| Routine rationale | N/A | N/A | N/A | Use API rationale or neutral fallback text |

## 9. Acceptance Checks

- Existing active routines render the skin profile, Morning and Night cards, ordered timelines, product recommendations, Edit controls, and rationale card.
- `both` steps appear in both time-of-day timelines without duplicating their underlying ID or persisted update.
- Edit opens the correct regimen/step in the product sheet; product search/options use the shared `GET /products` endpoint.
- Saving a product or instruction change uses `PUT /routine/steps/{id}`, patches query cache, and retains sheet state on errors.
- Product removal respects API nullability; no unsupported medical compatibility or ingredient-safety claims are introduced.
- Loading, no-routine, no-step, routine-fetch error, product-list empty/error, update pending/error, refresh, and populated states are present.
- Existing §6.1 remains functional for users without a routine, and generating a routine transitions to the active content.
- Changed TypeScript files, Expo lint, Expo Doctor, and iOS Expo Go flow are validated during implementation; repository baseline errors/config gaps are reported separately.

---

**Review checkpoint:** This artifact is an implementation plan only. No source code is changed until the plan is reviewed and approved.
