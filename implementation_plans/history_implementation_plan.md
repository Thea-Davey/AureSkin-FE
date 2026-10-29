# History Page — Implementation Plan (§5.1)

> Based on `design_references/ui_design_reference.md § 5.1` and `design_references/history.png`.
> Follows the History feature tree in `documentation/part2_technical_view.md` and the MVVM conventions in `skills/aureskin-screen-architecture-implementation/SKILL.md`.

## 1. Overview & Reference Mapping

| Item | Decision |
|---|---|
| Target screen | History Page (past skin analysis list) |
| UI reference | `design_references/ui_design_reference.md` § 5.1 |
| Visual reference | `design_references/history.png` |
| Feature folder | `src/features/history/` |
| Existing route | `src/app/(tabs)/history.tsx`; replace placeholder rendering with `HistoryPage` |
| Shared shell | Reuse the app header and bottom tab navigation from `src/app/(tabs)/_layout.tsx`; do not add another header or tab bar inside the feature page. |
| Scope boundary | This plan covers the History list only. The list row can navigate to the separately scoped History Detail screen (§ 5.2); that screen and its route are not implemented by this plan. |

The design reference shows a persistent shared menu/title header above a light scroll surface, a search field with a filter control, and chronological scan cards. Each card displays a scan image or placeholder, date, health score, skin type, condition badges, and an overflow action. The list supports refresh, pagination, filtering/search, and deleting a scan after confirmation.

## 2. Complete File Tree

```text
src/features/history/
├── model/
│   ├── history_types.ts                 # History entry, page, and filter contracts
│   ├── history_api.ts                   # Mock/live paginated fetch and delete functions
│   └── history_mock.ts                  # Centralized representative history entries
├── viewmodel/
│   └── useHistory.ts                    # Infinite query, search/filter state, refresh, delete mutation
└── view/
    ├── HistoryPage.tsx                  # History page shell and RefreshControl/list composition
    ├── containers/
    │   └── s1_HistoryList.tsx            # Search/filter controls and paginated list state rendering
    └── components/
        ├── HistoryListItem.tsx           # Scan image, metadata, badges, and overflow trigger
        ├── HistoryFilterSheet.tsx        # Date-range, skin-type, and condition filters
        └── HistoryEntryActionSheet.tsx   # Accessible entry actions and delete confirmation

src/app/(tabs)/history.tsx                # Update existing route to render HistoryPage
```

Do not create `useHistoryDetail.ts` or `HistoryDetailPage.tsx` as part of this list-screen task; those belong to the § 5.2 follow-up.

## 3. Data Model (`history_types.ts`)

```ts
export interface HistoryEntry {
  id: string;
  image_url: string | null;
  created_at: string;
  health_score: number;
  skin_type: string | null;
  conditions: string[];
}

export interface HistoryPage {
  items: HistoryEntry[];
  nextOffset: number | null;
}

export interface HistoryPageParams {
  limit: number;
  offset: number;
}

export interface HistoryFilters {
  startDate: string | null;
  endDate: string | null;
  skinTypes: string[];
  conditions: string[];
}
```

`HistoryEntry` matches the fields needed by § 5.1 and the `skin_analyses` data documented in `part2_technical_view.md`. The API adapter should normalize nullable or absent `image_url`, `skin_type`, and conditions rather than leaking backend response-envelope details into view code. `health_score` is a 0–100 score. Searchable date text is formatted for display in the view; retain `created_at` as an ISO timestamp for sorting and date filtering.

## 4. API Functions & Mock Data

### `history_api.ts`

Use the existing shared Axios client from `src/shared/services/api.ts` for live requests. The documented response envelope in current app code is `response.data.data.items`; `fetchHistoryPage` should normalize this payload and throw a useful error for failed or malformed responses so React Query can render and retry the error state. Do not convert request failures into an empty successful list.

```ts
export const USE_MOCK: boolean = true;

export async function fetchHistoryPage(
  params: HistoryPageParams
): Promise<HistoryPage>;

export async function deleteHistoryEntry(id: string): Promise<void>;
```

Request `GET /history` with `limit` and `offset`. Derive `nextOffset` as `offset + items.length` when a full page is returned; return `null` when fewer than `limit` entries are returned. Delete with `DELETE /history/{id}`. Both functions branch on `USE_MOCK`; live-mode errors must propagate. Delete in mock mode resolves without mutating the exported fixture array.

Use this toggle comment block in `history_api.ts`:

```ts
// ============================================================================
// DATA SOURCE TOGGLE (use mock)
// Set to `true` to use mock data for all History screen features (history list,
// pagination, and deletion).
// Set to `false` to fetch real-time live data from FastAPI.
export const USE_MOCK: boolean = true;
// ============================================================================
```

### `history_mock.ts`

Export `MOCK_HISTORY_ENTRIES: HistoryEntry[]` with multiple chronologically ordered examples covering different skin types, condition counts, health scores, image-present and image-missing states. Keep all fixture data here, not in the view or ViewModel. `fetchHistoryPage` slices this fixture using `offset` and `limit` and calculates `nextOffset` consistently with the live contract.

## 5. ViewModel Hook (`useHistory.ts`)

Use TanStack Query v5 (`useInfiniteQuery`, `useMutation`, and `useQueryClient`) and local state only for transient UI controls.

### Queries and mutations

| Concern | Behavior |
|---|---|
| History pages | Infinite query key `['history', 'list']`, initial offset `0`, page size `20`; `getNextPageParam` consumes `nextOffset`. |
| Delete | Mutation calls `deleteHistoryEntry(id)`; on success invalidate `['history']` so the list and Home latest-analysis query are refreshed. Keep the entry visible and expose a retryable error if deletion fails. |
| Pull-to-refresh | Invalidate `['history']`, expose `isRefreshing` and `onRefresh`, and allow the first page to refetch. |
| Search | Local, case-insensitive match against formatted scan date and skin type across loaded pages. |
| Filters | Local filters for inclusive date range, one or more skin types, and one or more conditions. Apply to loaded entries; do not imply server-side filter support because the documented endpoint only specifies pagination. |
| Filter/action sheets | Expose selected-entry ID and open/close state for filter and entry action sheets. Reset and apply filter actions are local. |
| Pagination | Expose `hasNextPage`, `isFetchingNextPage`, and `fetchNextPage`; trigger loading near the list end and prevent duplicate concurrent requests. |

### Return contract

```ts
{
  entries: HistoryEntry[];              // all loaded pages, newest first
  filteredEntries: HistoryEntry[];      // search and filter result
  searchQuery: string;
  filters: HistoryFilters;
  isFilterSheetVisible: boolean;
  selectedEntryId: string | null;
  isLoading: boolean;
  isRefreshing: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  error: string | null;
  deleteError: string | null;
  deletingEntryId: string | null;
  actions: {
    setSearchQuery: (query: string) => void;
    openFilters: () => void;
    closeFilters: () => void;
    applyFilters: (filters: HistoryFilters) => void;
    resetFilters: () => void;
    openEntryActions: (id: string) => void;
    closeEntryActions: () => void;
    deleteEntry: (id: string) => void;
    retry: () => void;
    refresh: () => Promise<void>;
    loadNextPage: () => void;
    openEntry: (id: string) => void;
  };
}
```

`openEntry` is an event callback wired to the § 5.2 detail destination. Keep that route integration behind the existing Expo Router boundary and confirm its final path when the detail route is planned; do not invent a detail screen in this implementation.

## 6. View Breakdown

### `HistoryPage.tsx`

- Calls `useHistory()` and composes the feature container with its typed state and action callbacks.
- Uses the design reference's warm off-white/light list surface, with spacing and tokens from `tailwind.config.js` only.
- Uses `StatusBar` and a `FlatList`-based scroll surface; wire pull-to-refresh through `RefreshControl` and provide safe-area/bottom-tab clearance.
- Leaves shared app header and bottom navigation to `src/app/(tabs)/_layout.tsx`.
- Contains no API calls or filtering/deletion business logic.

### `s1_HistoryList.tsx`

- Renders the search input with placeholder `search history`, a magnifying-glass icon, and accessible filter icon button.
- Renders the newest-first `filteredEntries` in a `FlatList`; `onEndReached` loads another page when available.
- Renders one `HistoryListItem` per entry, passing typed callbacks for opening detail and the overflow action sheet.
- Shows separate initial loading, no-history, no-search/filter-match, initial error/retry, and next-page loading/error treatments.
- Opens `HistoryFilterSheet` and `HistoryEntryActionSheet` from state/callback props; no direct store access.

### `HistoryListItem.tsx`

- Matches the reference row hierarchy: image thumbnail/fallback at left; formatted date, green health-score badge, skin-type badge, condition badge(s), and overflow icon at right.
- Make the row a detail navigation target while keeping the overflow button independently accessible and non-propagating.
- Use `expo-image` for remote scan images, with a neutral token-based placeholder for missing/unavailable images.
- Show a sensible fallback label when skin type or conditions are missing; clamp the health score for display to the 0–100 range without changing the stored value.
- Add accessibility labels/hints for the row and icon-only overflow control; press feedback follows existing app patterns.

### `HistoryFilterSheet.tsx`

- Presents date range, skin type, and condition filters in a dismissible modal/bottom-sheet treatment consistent with the app's existing modal patterns.
- Shows selectable controls, plus Apply and Reset actions; closing without Apply preserves previously applied filters.
- Does not fetch filter options separately; derive available skin types and conditions from the entries currently loaded.

### `HistoryEntryActionSheet.tsx`

- Provides the overflow action for a selected scan and a clearly destructive Delete option.
- Require a confirmation step before deletion; disable duplicate delete actions while that entry is pending and show a retryable error if it fails.
- Include cancel/dismiss behavior, accessible labels, and platform-safe presentation.

### Existing route: `src/app/(tabs)/history.tsx`

- Replace the placeholder text view with a render of `HistoryPage`, matching the route-entry convention used by `src/app/(tabs)/index.tsx`.

### Design token constraints

- Use Tailwind tokens such as `bg-neutral-offwhite`, `bg-card`, `text-text`, `text-muted`, `border-border`, `bg-primary`, `bg-accent`, and status tokens. Use `theme.colors.*` for icon, status bar, and activity-indicator props.
- Use only configured font presets (`text-h1` through `text-caption`, `font-sans*`, `font-heading`) and radius presets (`rounded-card`, `rounded-button`, `rounded-input`, `rounded-badge`, `rounded-full`). Avoid raw hex values and arbitrary utility sizes/radii.

## 7. Navigation Mapping

| User action | Destination / result |
|---|---|
| Tap hamburger icon | Shared `MenuOverlay`, opened by the shared `AppHeader` |
| Tap a history card | History Detail screen for that entry (§ 5.2); final Expo Router path is a dependency for the detail-screen task |
| Tap filter icon | Open filter sheet; remain on History Page |
| Apply or reset filters | Update local list results; remain on History Page |
| Type in search field | Filter loaded history entries by scan date or skin type in real time |
| Tap row overflow | Open entry action sheet |
| Confirm Delete | Delete entry, remove it through query invalidation, remain on History Page |
| Pull to refresh | Refetch history from the first page |
| Reach end of list | Fetch next page when one exists |
| Tap bottom tab | Shared tab navigator switches to the selected tab |

## 8. State Handling Matrix

| Section | Loading | Empty | Error | Success |
|---|---|---|---|---|
| Initial history list | Shape-matched list-row skeletons while first page loads | No entries: “You have no scan history yet” plus a CTA to start a scan | Inline error message and Retry action | Chronological history cards, newest first |
| Search/filter result | Keep current list stable while local filtering runs | Distinct “No history found” state with clear-search/reset-filter action | Uses list fetch error when no usable pages exist | Entries matching query and selected filters |
| Pagination | Footer spinner while next page loads | N/A | Non-destructive footer error with retry/load-more action | Append page without replacing current entries |
| Entry image | Placeholder while image loads | Neutral placeholder if no image URL exists | Fallback placeholder on image load failure | Loaded thumbnail |
| Delete action | Disable destructive action and indicate pending state | N/A | Keep entry; show an actionable error and permit retry | Remove entry after success and invalidate History/Home history queries |

## 9. Acceptance Checks

- The existing History tab route renders `HistoryPage` and retains the shared header, menu, and tabs.
- The first page requests `GET /history?limit=20&offset=0`; subsequent pages use the next offset and append in newest-first order.
- Each row renders date, health score, skin type, conditions, image/fallback, and independent overflow action.
- Search and all filter fields affect the loaded list; clearing them restores the loaded entries.
- Empty history and empty search/filter results are distinguishable; list errors can be retried.
- Delete requires confirmation, prevents duplicate pending requests, surfaces errors, and refreshes the History list and Home latest-analysis cache on success.
- Refresh and end-of-list pagination work without duplicate requests; loading, empty, error, and populated states are all present.
- TypeScript, Expo lint, and Expo Doctor checks pass after implementation; verify the History list on iOS Expo Go with mock mode and live API mode where backend access is available.

---

**Review checkpoint:** This is a plan artifact only. No screen code or route changes are included until the plan is reviewed and approved.