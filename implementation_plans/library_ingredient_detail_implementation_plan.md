# Ingredient Detail Page Implementation Plan (§3.3)

> Based on `design_references/ui_design_reference.md` § 3.3 and `design_references/library_ingredient_detail.png`.
> Follows `skills/aureskin-screen-architecture-implementation/SKILL.md`, the Library feature tree in `documentation/part2_technical_view.md`, and the existing shared Expo Router tab shell.

## 1. Overview & Reference Mapping

| Item | Decision |
|---|---|
| Target screen | Ingredient Detail Page |
| UI reference | `design_references/ui_design_reference.md` § 3.3 |
| Visual reference | `design_references/library_ingredient_detail.png` |
| Feature folder | `src/features/library/` |
| Entry point | Existing `src/app/(tabs)/library.tsx` route and `LibraryPage` |
| Presentation | Full-height modal sheet opened from an ingredient row; retain the Library route and selected Ingredients tab beneath it. Use the existing React Native `Modal` slide presentation pattern, with a close action and a vertically scrollable white detail card. |
| Shared shell | Retain the shared app header and bottom tab navigator; do not create a duplicate app header or bottom navigation inside the detail sheet. |
| Scope boundary | Implement viewing an ingredient’s detail, latest-analysis compatibility status, and a locally persisted favorite toggle. Ingredient search/list and Products behavior remain intact. Product Detail (§3.4) and Favorites-page integration are separate scopes. |

The reference shows an olive-colored top area with a close X, then a rounded white sheet containing a header row (ingredient name, compatibility badge, favorite star), divider, overview copy, and four vertically stacked informational cards. Green bullets indicate the “What is it good for?” entries; coral bullets indicate “Who should avoid?” entries.

## 2. Important Data and API Contract Decisions

### Ingredient detail fields

The documented ingredient record in `documentation/part2_technical_view.md` has `id`, `name`, `description`, `benefits`, `skin_types[]`, and `caution`. The screen specification additionally needs content for “What is it?” and structured “good for” and “avoid” lists. Do not invent clinical claims or turn unstructured text into unsupported lists.

Use the following UI data mapping:

| UI content | Preferred source | Safe behavior when missing |
|---|---|---|
| Name | `name` | Required; malformed or missing record is an error. |
| Overview paragraph | `description` | Omit the overview block if null/blank. |
| “What is it?” | Optional `what_is_it` detail field | Do not duplicate the overview; omit the card when no distinct content is available. |
| “What does it do?” | Existing `benefits` field | Omit the card when null/blank. |
| “What is it good for?” | Optional `good_for[]` detail field | When absent, show documented `skin_types[]` under a clearly labeled “Suitable skin types” subheading within the card; omit the card if both sources are empty. |
| “Who should avoid?” | Optional `avoid[]` detail field; existing `caution` is a fallback warning | When only `caution` is available, show it as a caution rather than claiming it is a categorical contraindication. Omit the card if neither source is available. |

Extend the app-owned ingredient detail model/API normalization to accept optional `what_is_it`, `good_for`, and `avoid` fields while retaining backwards compatibility with the current list contract. The frontend mock fixtures should supply complete, reference-matching examples. Before enabling live detail content, confirm that the backend detail response can provide the optional fields; otherwise keep the documented fields and safe omission/fallback behavior above. Never substitute fabricated filler copy.

### Latest-analysis compatibility

The API documentation provides `GET /history?limit=&offset=` and `GET /scan/{id}/compatibility`, but does not state that the first history page is newest-first or define a separate “latest analysis” endpoint. The implementation must confirm the history ordering contract with the backend before interpreting the first returned item as latest. If newest-first is not guaranteed, request a backend ordering/latest-analysis contract instead of guessing or scanning an arbitrary page.

Reuse the existing history and scan compatibility API adapters where possible rather than issuing direct Supabase queries from the ViewModel. Determine the displayed status only from the latest analysis’ explicit `compatible_ingredients` data:

- Show the green “Compatible” badge only when the selected ingredient ID is present in that analysis’ compatible list.
- If no analysis exists, show a neutral “Scan needed”/not-evaluated state; do not label it compatible.
- If a scan exists but the ingredient is not listed as compatible, show a neutral “Not listed” state unless the backend returns an explicit incompatibility for that ingredient.
- If compatibility retrieval fails, surface an actionable error/retry state and do not infer a positive result.

The scan mock currently uses ingredient IDs that do not match `MOCK_INGREDIENTS`; align the compatibility fixture IDs/names with the Library mock ingredients before using it for this screen.

### Ingredient favorites

The UI reference permits local or Supabase favorites and no documented ingredient-favorites endpoint/table is specified. Follow the established Products-tab approach: persist ingredient IDs in AsyncStorage under a key scoped to authenticated user ID, with a separate anonymous key. Do not claim server synchronization. A persistence failure must roll back the optimistic star state and display an actionable message.

## 3. Resolved File Tree

```text
src/features/library/
├── model/
│   ├── library_types.ts                       # Extend Ingredient detail and compatibility/favorite UI contracts
│   ├── library_api.ts                         # Add fetchIngredientById and detail response normalization
│   └── library_mock.ts                        # Enrich detail fixtures; align compatibility mock IDs
├── viewmodel/
│   └── useIngredientDetail.ts                 # Detail query, latest compatibility, favorite state/actions
└── view/
    ├── LibraryPage.tsx                        # Own selected ingredient ID and show/dismiss detail sheet
    └── components/
        ├── IngredientDetailPage.tsx            # Modal sheet, header, scrolling detail content and states
        └── IngredientDetailSkeleton.tsx        # Shape-matched title/badge/text/card placeholders

src/features/history/model/history_api.ts       # Reuse documented history listing to resolve latest analysis, after ordering contract confirmation
src/features/scan/model/scan_api.ts             # Reuse fetchCompatibility(analysisId) for compatibility data
```

Keep the detail component presentational: it receives typed data, loading/error flags, and callbacks. The detail ViewModel owns React Query orchestration, AsyncStorage persistence, and compatibility derivation. No new Expo Router route is required for this modal presentation.

## 4. Data Model and API

### `library_types.ts`

Retain the existing `Ingredient` list fields and add optional detail fields without breaking `fetchIngredients`:

```ts
export interface Ingredient {
  id: string;
  name: string;
  description: string | null;
  benefits: string | null;
  skin_types: string[];
  caution: string | null;
  what_is_it?: string | null;
  good_for?: string[];
  avoid?: string[];
}

export type IngredientCompatibilityStatus =
  | 'compatible'
  | 'not_listed'
  | 'scan_needed'
  | 'unavailable';
```

Normalize optional fields explicitly. `good_for` and `avoid` must be arrays of strings when present; invalid API payloads should throw a descriptive normalization error. Preserve `skin_types` and `caution` for documented legacy records.

### `library_api.ts`

Add:

```ts
export async function fetchIngredientById(id: string): Promise<Ingredient>;
```

- Mock mode looks up the ingredient in the centralized fixtures and rejects unknown IDs with a not-found error.
- Live mode requests `GET /ingredients/{id}` using the shared authenticated Axios client.
- Validate the documented response envelope and required fields; normalize nullable/optional detail fields.
- Encode the ID as a path segment and propagate transport/normalization failures; do not turn failures into a successful empty object.
- Preserve `fetchIngredients` and the existing shared `USE_MOCK` toggle. Update the toggle description to include ingredient detail retrieval and favorites/compatibility only if those data sources are controlled there; do not imply AsyncStorage is a server mock endpoint.

Compatibility should reuse the existing `fetchHistoryPage` and `fetchCompatibility` adapters and their response contracts, with mocks made consistent with Library ingredient IDs. Do not duplicate the scan compatibility HTTP endpoint in the Library view.

## 5. ViewModel (`useIngredientDetail.ts`)

Use TanStack Query for the selected ingredient detail and latest-analysis compatibility. Keep modal visibility/selection in `LibraryPage`; pass the selected ingredient ID into the detail ViewModel only while the sheet is mounted.

| Concern | Behavior |
|---|---|
| Detail query | Key by `['library', 'ingredient', ingredientId]`; enabled only for a valid selected ID. |
| Latest analysis | Resolve using the confirmed newest-first history contract, then request compatibility for that analysis. Do not request compatibility if there is no analysis. |
| Compatibility | Derive `compatible` only from a matching ingredient ID in the explicit compatible list; distinguish no scan, not-listed, and request failure states. |
| Favorite load | Load user-scoped ingredient favorite IDs from AsyncStorage; loading and malformed-storage errors remain visible. |
| Favorite toggle | Optimistically toggle the selected ID, persist it, roll back on failure, and prevent duplicate pending toggles. |
| Retry | Retry failed detail or compatibility reads without dismissing the modal or losing the selected ingredient. |
| Close | Dismiss the sheet and restore the Ingredients list at the same search/scroll state. |

The hook must contain no JSX or presentation classes. It should return the ingredient record, compatibility status/reason if available, loading flags, error/retry state, favorite state, and typed action callbacks.

## 6. View and Interaction Design

### `IngredientDetailPage.tsx`

- Present a full-height transparent modal with slide-up entry/exit. Use a dismissible top-right X in the olive backdrop and a white, top-rounded detail sheet as shown in the reference.
- Place the ingredient name, compatibility status, and favorite star in a compact header row. Allow the heading to wrap/truncate without pushing the action buttons out of view.
- Add a thin divider below the header.
- Render a vertical `ScrollView` with overview copy and the “What is it?”, “What does it do?”, “What is it good for?”, and “Who should avoid?” cards when their relevant data is available.
- Use green bullets for positive/suitable items and coral/error-token bullets for warnings. Use only configured NativeWind design tokens and `theme.colors.*` for icon/color props.
- Keep all content inside the scrollable sheet, including smaller-device safe areas and bottom insets. The modal must not duplicate the shared bottom tab bar.
- Use a bouncing/scale favorite-star press animation consistent with existing Reanimated usage; disable the control while storage is loading or saving.
- Give close, favorite, retry, and status elements accessible labels/roles. Treat compatibility and favorite persistence errors distinctly.

### Skeleton and error states

- Loading: show title, badge, overview, and section-card skeletons with stable dimensions to avoid layout jumps.
- Detail error/not found: show a clear error with Retry when retryable and Close to return to the list.
- Compatibility-only error: keep successfully loaded ingredient content visible, replace the status with an unavailable state, and provide a compatibility retry action.
- No analysis: show a neutral prompt/status rather than an error or false compatibility.
- Missing optional detail sections: omit only the unavailable section; do not render empty bullet cards.
- Favorite persistence error: revert the optimistic star and show an actionable message while leaving details open.

## 7. Navigation and Behavior

| User action | Expected behavior |
|---|---|
| Tap an ingredient row in Ingredients (§3.1) | Select its ID and present the ingredient detail sheet. |
| Tap top-right X | Close the sheet and return to the same Ingredients list state. |
| Swipe down to dismiss | Dismiss the sheet when supported by the selected modal gesture implementation; the X remains the reliable cross-platform close action. |
| Tap favorite star | Toggle and persist the selected ingredient for the active user; remain on the sheet. |
| Tap Retry on detail error | Retry detail retrieval for the same ID. |
| Tap compatibility Retry | Retry latest-analysis/compatibility retrieval independently of the detail query. |
| Navigate through bottom tabs while the detail is open | Follow the shared tab shell behavior; ensure a tab switch does not leave an orphaned modal over another route. |

Do not add a Favorites route or wire the existing sample-only Favorites page as part of this screen unless separately requested.

## 8. Acceptance Checks

- Tapping a Library ingredient opens the matching detail sheet; closing returns to the Ingredients tab without clearing search or scroll position.
- Detail name and all available fields map to the appropriate section without fabricated data or duplicate overview copy.
- Optional `what_is_it`, `good_for`, and `avoid` fields normalize correctly; legacy documented fields remain supported.
- A compatible badge appears only when the selected ingredient is explicitly in the latest analysis compatible list.
- Missing scan, non-listed ingredient, and compatibility request failure are distinguishable; none produce a false “Compatible” state.
- Ingredient favorite state persists per authenticated user, anonymous favorites are isolated, and failed persistence rolls back with a visible message.
- Loading, detail error/not-found, compatibility error, no-analysis, success, and missing-optional-data states render as specified.
- The modal layout matches the reference hierarchy and remains scrollable/usable on compact mobile viewports.
- Ingredient list, Products tab, and shared app header/bottom tabs remain unchanged outside the detail interaction.
- Confirm backend detail-field availability and newest-first history ordering before enabling live compatibility/content assumptions.
- Run targeted Expo ESLint and `npx tsc --noEmit`; report existing unrelated diagnostics separately. Validate the detail modal and interactions in the app preview.

---

## 9. Implementation Status

Implemented in the existing Library route:

- Added the ingredient detail API adapter and optional detail fields with validation while preserving the paginated Ingredients list contract.
- Added a full-height, scrollable detail modal matching the reference hierarchy, including compatibility status, favorite action, optional information cards, loading skeleton, retry/error states, and close behavior.
- Added a detail ViewModel for ingredient/compatibility queries and user-scoped local favorites with optimistic rollback on persistence failure.
- Updated the Aloe Vera fixture with representative detail content and aligned mock latest-analysis/compatibility identifiers with Library ingredient IDs.
- Retained the existing Library tab and list state while the detail modal is open.

The app's existing Home latest-analysis implementation requests `/history?limit=1` and uses its first item; the detail compatibility check follows the same API convention. Confirm the backend guarantees newest-first ordering before relying on this status in live data. The documented ingredient schema does not yet include `what_is_it`, `good_for`, or `avoid`; these fields are optional and omitted/fallback to documented fields when absent.

Validation completed: Expo web export succeeded and targeted ESLint passed. `npx tsc --noEmit` still reports existing errors in app-tabs, History, Home, and theme files; it reported no errors in the new or modified Library detail code.

**Review checkpoint:** Implementation is complete. Backend ordering and optional detail-field availability remain integration confirmations for live API data.
