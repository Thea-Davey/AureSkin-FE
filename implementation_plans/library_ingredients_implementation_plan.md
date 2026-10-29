# Library Page — Ingredients Tab Implementation Plan (§3.1)

> Based on `design_references/ui_design_reference.md` § 3.1 and `design_references/library_ingredients.png`.
> Follows `skills/aureskin-screen-architecture-implementation/SKILL.md`, the Library feature tree in `documentation/part2_technical_view.md`, and the existing shared Expo Router tab shell.

## 1. Overview & Reference Mapping

| Item | Decision |
|---|---|
| Target screen | Library Page — Ingredients Tab |
| UI reference | `design_references/ui_design_reference.md` § 3.1 |
| Visual reference | `design_references/library_ingredients.png` |
| Feature folder | `src/features/library/` |
| Existing route | `src/app/(tabs)/library.tsx`; replace placeholder rendering with `LibraryPage` |
| Shared shell | Reuse the header, menu overlay, scan overlay, and bottom tab navigator from `src/app/(tabs)/_layout.tsx`. Do not add a second header or tab bar inside the feature page. |
| Scope boundary | Implement the Ingredients list tab only. The Products tab content (§3.2) and Ingredient Detail Page (§3.3) remain separate follow-up scopes; this plan specifies their navigation handoff without implementing those screens. |

The reference has a shared olive header, the Library title, a two-tab selector with Ingredients active, a rounded search field, and a vertically scrolling sequence of rounded ingredient-name cards. The list is paginated, searchable, and opens an ingredient detail destination when a row is tapped.

### Data-source decision

The UI reference mentions the Supabase `ingredients` table, while `documentation/part2_technical_view.md` also defines a searchable, paginated `GET /ingredients` endpoint. Use the documented endpoint through the existing authenticated Axios client (`src/shared/services/api.ts`), keeping all backend access in `library_api.ts`. `useIngredients.ts` will orchestrate queries and UI state; it will not query Supabase directly. This preserves the documented `q`, `limit`, and `offset` contract and keeps the ViewModel independent of the backend transport.

## 2. Complete Resolved File Tree

```text
src/features/library/
├── model/
│   ├── library_types.ts                 # Ingredient and paginated list contracts
│   ├── library_api.ts                   # Mock/live ingredient-list fetch and normalization
│   └── library_mock.ts                  # Centralized sample ingredient records
├── viewmodel/
│   └── useIngredients.ts                # Search, infinite query, refresh, retry, and list state
└── view/
    ├── LibraryPage.tsx                  # Library shell and tab selector; renders Ingredients tab
    ├── containers/
    │   └── s1_IngredientsTab.tsx         # Search field, list, pagination, and state rendering
    └── components/
        ├── IngredientListItem.tsx        # Accessible tappable ingredient row
        └── IngredientListSkeleton.tsx    # Shape-matched loading rows

src/app/(tabs)/library.tsx                # Mount LibraryPage at the existing Library route
```

Do not create `s2_ProductsTab.tsx`, product models/hooks, or ingredient-detail UI/routes in this task. Keep the existing Products tab visible and show a clear not-yet-available state when selected. The ingredient-detail route is also outside this scope; until §3.3 provides that destination, tapping an ingredient should explain that detail view is not available yet rather than navigating to a missing route.

## 3. Data Model (`library_types.ts`)

```ts
export interface Ingredient {
  id: string;
  name: string;
  description: string | null;
  benefits: string | null;
  skin_types: string[];
  caution: string | null;
}

export interface IngredientPage {
  items: Ingredient[];
  nextOffset: number | null;
}

export interface IngredientQuery {
  q: string;
  limit: number;
  offset: number;
}
```

The interface maps to the documented `ingredients` table fields. The list renders only `id` and `name`; remaining fields are retained in the normalized model for reuse by the separately scoped detail screen. Normalize nullable text to `null` and missing `skin_types` to an empty array in the API adapter. The view must not depend on backend response-envelope details.

## 4. API Functions & Mock Data

### `library_api.ts`

Use the shared `api` client from `src/shared/services/api.ts`. Keep the mock toggle scoped to all Library ingredients-list behavior:

```ts
// ============================================================================
// DATA SOURCE TOGGLE (use mock)
// Set to `true` to use mock data for all Library Ingredients screen features
// (ingredient search and paginated ingredient browsing).
// Set to `false` to fetch real-time live data from FastAPI and Supabase.
export const USE_MOCK: boolean = true;
// ============================================================================
```

```ts
export async function fetchIngredients(
  params: IngredientQuery
): Promise<IngredientPage>;
```

- In mock mode, perform case-insensitive name matching against the centralized fixture list, then slice by `offset` and `limit`.
- In live mode, request `GET /ingredients` with `q`, `limit`, and `offset` query parameters. Normalize the documented response envelope to `IngredientPage`.
- Set `nextOffset` to `offset + items.length` when a full page is returned; use `null` when fewer than `limit` records are returned.
- Throw a descriptive error for request failures or malformed response payloads. Do not convert errors into an empty successful list.
- Keep `fetchIngredientById` for the separate §3.3 detail-screen implementation; it is not required by the §3.1 list route.

### `library_mock.ts`

Export `MOCK_INGREDIENTS: Ingredient[]` with representative entries (including Aloe Vera from the reference) and complete typed fields. Keep fixtures out of the View and ViewModel. Provide enough records to demonstrate at least one full page and a subsequent page, plus names suitable for testing matching and zero-result searches.

## 5. ViewModel Hook (`useIngredients.ts`)

Use TanStack Query v5 `useInfiniteQuery` and `useQueryClient`; keep only transient search/refresh controls in local state.

### Query and state behavior

| Concern | Behavior |
|---|---|
| Ingredient pages | Infinite query keyed by `['library', 'ingredients', debouncedQuery]`; initial offset `0`, page size `20`, and `getNextPageParam` consumes `nextOffset`. |
| Search | Keep the immediate input value in state and debounce the request query by 300 ms. Matching is delegated to the API adapter for both mock and live modes. |
| Pagination | Flatten loaded pages in server order; expose `hasNextPage`, `isFetchingNextPage`, and a guarded `loadNextPage` action. |
| Pull-to-refresh | Invalidate/refetch the active ingredient query and expose `isRefreshing` plus `refresh`. |
| Retry | Expose a retry action that refetches the active query; preserve the search text. |
| Error | Provide the query error message without replacing failure with an empty list. Keep already loaded rows visible for subsequent-page errors. |

### Return contract

```ts
{
  ingredients: Ingredient[];
  searchQuery: string;
  isLoading: boolean;
  isRefreshing: boolean;
  isFetchingNextPage: boolean;
  isFetchNextPageError: boolean;
  hasNextPage: boolean;
  error: string | null;
  actions: {
    setSearchQuery: (query: string) => void;
    refresh: () => Promise<void>;
    retry: () => Promise<void>;
    loadNextPage: () => void;
  };
}
```

Do not put JSX, styling, route navigation, or API response parsing in the hook. The page/container owns the ingredient-row navigation callback and passes it down as a typed prop.

## 6. View Breakdown

### `LibraryPage.tsx`

- Calls `useIngredients()` and composes the Library tab selector with `S1IngredientsTab`.
- Renders a warm off-white list surface matching the reference.
- Provides a two-option Ingredients/Products tab selector, with Ingredients active on this route. Products selection shows an explicit not-yet-available state; no product content is introduced by this plan.
- Until the §3.3 route exists, tapping an ingredient shows a clear not-yet-available notice. Replace that notice with `useRouter` navigation when the detail route is implemented; do not invent or mount the detail page in this task.
- Uses `StatusBar`/theme values where needed and a `FlatList`-based list with `RefreshControl`. Leave header, menu drawer, scan overlay, and bottom tabs to the shared tab layout.
- Owns no API calls or filtering/pagination business logic.

### `s1_IngredientsTab.tsx`

- Receives list data, loading/error/pagination flags, and typed search/retry/load-more/refresh/row callbacks as props.
- Renders the rounded search input with a magnifying-glass icon and placeholder `search ingredient`; use an accessible label and highlight its border while focused.
- Renders ingredient rows in a `FlatList`; call `loadNextPage` near the end only when another page exists and no page request is active.
- Shows skeleton rows during initial loading, a no-ingredients message when the unfiltered catalog is empty, a distinct “No ingredients found” state for a query with zero matches, and an inline retry card for initial fetch errors.
- Keep loaded rows visible while a subsequent page is loading or has failed; show a footer spinner or retry affordance as appropriate. Distinguish a next-page error from a background refresh error so the retry message is accurate.
- Use `RefreshControl` for pull-to-refresh and preserve the current search query when refreshing.

### `IngredientListItem.tsx`

- Renders the ingredient name in a rounded card row, following the reference’s alternating light card surfaces, generous vertical spacing, and soft elevation.
- Accepts a typed `Ingredient` and `onPress(id)` callback; do not perform navigation or fetch detail data itself.
- Exposes button role, accessible label containing the ingredient name, and opacity press feedback.
- Use only configured NativeWind color, font, and radius tokens.

### `IngredientListSkeleton.tsx`

- Renders repeated rounded card-shaped placeholders sized to the list-row hierarchy while the first page loads.
- Use token-based neutral/card styling and a subtle shimmer/fade only if an existing animation pattern is available; avoid adding dependencies.

### Existing route: `src/app/(tabs)/library.tsx`

- Replace the placeholder “Library Screen” view with a render of `LibraryPage`, following the existing thin-route convention.
- Do not alter the tab layout or duplicate its shared header and navigation.

### Design token and interaction constraints

- Use Tailwind tokens such as `bg-neutral-offwhite`, `bg-card`, `text-text`, `text-muted`, `border-border`, `bg-secondary`, and `bg-accent`, plus configured font/radius presets (`text-h1` through `text-caption`, `font-sans*`, `font-heading`, `rounded-card`, `rounded-button`, `rounded-input`, `rounded-badge`, `rounded-full`).
- Use `theme.colors.*` for icon, status-bar, and activity-indicator props; do not hardcode hex values or arbitrary font sizes/radii.
- Search results update as the debounced query resolves. Rows fade in as results arrive, and all tappable controls use the app’s press-feedback conventions.

## 7. Navigation Mapping

| User action | Destination / result |
|---|---|
| Tap Ingredients tab | Remain on Library Page with Ingredients selected |
| Tap Products tab | Show a not-yet-available state; full Products Tab behavior is scoped to §3.2 |
| Type in search field | Debounced `GET /ingredients?q=...&limit=20&offset=0`; remain on Ingredients tab |
| Tap ingredient row | Show a not-yet-available notice until the Ingredient Detail Page (§3.3) and its route are implemented |
| Tap hamburger icon | Shared Menu Overlay (7.1) |
| Pull down on list | Refetch the active ingredient query |
| Reach the end of the list | Fetch the next page when available |
| Tap Home, Scan, History, or Routine in bottom tabs | Shared tab navigator switches to the selected destination |

## 8. State Handling Matrix

| Section/state | Loading | Empty | Error | Success |
|---|---|---|---|---|
| Initial ingredient list | Shape-matched skeleton card rows | “No ingredients available” when the catalog has no records | Inline error and Retry action | Scrollable ingredient-name cards |
| Search results | Keep the current list stable while the debounced request is pending | “No ingredients found” for a non-empty query with no matches | Inline error; preserve query and allow retry | Cards matching the search query |
| Pagination | Footer spinner while the next page loads | No footer when `nextOffset` is `null` | Non-destructive footer retry; keep loaded rows | Append records in API order |
| Refresh | Native refresh indicator | N/A | Preserve existing rows and expose retry/error feedback | Refresh first page while retaining the current query |
| Ingredient row | N/A | N/A | N/A | Accessible tappable card opens the detail destination |

## 9. Acceptance Checks

- The existing Library route renders `LibraryPage` and retains the shared app header, menu overlay, scan overlay, and persistent bottom tabs.
- The reference layout is represented: Ingredients/Products selector, focused rounded search field, and rounded ingredient-name rows.
- The first request uses `GET /ingredients?q=&limit=20&offset=0`; later requests use the returned offset, and search resets pagination for the debounced query.
- Mock and live modes use the same normalized `IngredientPage` contract; mock search/pagination mirror the live behavior.
- Initial empty catalog, no-match search, initial fetch error, loading, successful list, and next-page loading/error states are distinguishable and actionable.
- Ingredient rows expose accessible labels and press feedback; tapping one clearly communicates that the separately scoped detail route is not yet available.
- `npx expo lint` and `npx tsc --noEmit` pass after implementation; manually verify search, pagination, refresh, tab selection, and list states on the Library route.

---

**Review checkpoint:** This is a plan artifact only. No screen code or route changes are included until the plan is reviewed and approved.
