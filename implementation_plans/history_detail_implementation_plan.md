# History Detail Results — Implementation Plan (§5.2)

> Based on `design_references/ui_design_reference.md § 5.2`, the visual reference `design_references/history_detail_results_tab.png`, the History feature tree in `documentation/part2_technical_view.md`, and `skills/aureskin-screen-architecture-implementation/SKILL.md`.

## 1. Overview & Reference Mapping

| Item | Decision |
|---|---|
| Target screen | History Detail — Results Tab |
| UI reference | `design_references/ui_design_reference.md` § 5.2 |
| Visual reference | `design_references/history_detail_results_tab.png` |
| Feature folder | `src/features/history/` |
| Route | `src/app/history/[id].tsx`, using a root-stack route so the detail screen is full-screen and does not render the tab bar |
| Shared infrastructure | Reuse `src/features/history/model/history_api.ts`, current `HistoryEntry` model, React Query provider, theme, and Expo Router |
| Scope boundary | Implement the Results tab and its selected state. The visible Ingredient Compatibility tab links to §5.3, a separate follow-up view. Do not implement compatibility contents in this plan. |

The reference shows a muted olive header with a back arrow, “Skin Analysis:” and the scan date, plus two tabs. The Results tab contains a large face image, a warm panel with skin type and a percentage health score, and a scrollable “Concern/s” section with detected condition names and explanatory descriptions. The written §5.2 section is still an unfilled template; the screenshot and database/API reference supply the proposed behavior and fields below.

## 2. Complete File Tree

```text
src/features/history/
├── model/
│   ├── history_types.ts                 # Extend with HistoryDetail and HistoryCondition
│   ├── history_api.ts                   # Add fetchHistoryDetail(id) mock/live branch
│   └── history_mock.ts                  # Add detailed fixtures for seeded history IDs
├── viewmodel/
│   └── useHistoryDetail.ts              # Load one scan and expose refresh/error state
└── view/
    ├── HistoryDetailPage.tsx             # Full-screen detail shell, header, tab state, result content
    ├── containers/
    │   └── s1_HistoryResults.tsx         # Scrollable Results tab content and section composition
    └── components/
        ├── HistoryDetailHeader.tsx       # Back action, scan date, Results/Compatibility tabs
        ├── HistoryAnalysisHero.tsx       # Scan image, skin type, and health percentage panel
        └── HistoryConditionCard.tsx      # Condition title, confidence, and description

src/app/history/[id].tsx                 # Dynamic root-stack route for a historical analysis
src/app/_layout.tsx                      # Register route animation/options if needed by root stack
src/features/history/view/HistoryPage.tsx # Wire row selection to /history/[id] instead of placeholder toast
```

Reuse the existing History feature and its list item. Do not create duplicate API clients or a parallel feature folder. The compatibility view and its compatibility data model remain owned by §5.3.

## 3. Data Model (`history_types.ts`)

Extend existing list types with these detail-only contracts:

```ts
export interface HistoryCondition {
  id: string;
  name: string;
  display_name: string;
  description: string;
  confidence: number | null;
}

export interface HistoryDetail extends Omit<HistoryEntry, 'conditions'> {
  summary: string | null;
  skin_type_confidence: number | null;
  conditions: HistoryCondition[];
}
```

The inherited `HistoryEntry` fields are `id`, `image_url`, `created_at`, `health_score`, and `skin_type`. Keep `health_score` as a number and format it to two decimal places in the hero to match the screenshot (for example `91.46%`); do not round away backend precision. The condition lookup table documents `id`, `name`, `display_name`, and `description`; the `analysis_conditions` join documents `confidence`. No `causes` field is documented, so do not require or fabricate it. If a backend condition description is absent, normalize to `null` or an empty display fallback and avoid rendering a blank description block.

## 4. API Function & Mock Data

### `history_api.ts`

Extend the current module; preserve its shared Axios client, existing `USE_MOCK` toggle, error behavior, and `fetchHistoryPage` / `deleteHistoryEntry` functions.

```ts
export async function fetchHistoryDetail(id: string): Promise<HistoryDetail>;
```

- Live mode: call `GET /history/{id}` using the authenticated shared `api` client; normalize `response.data.data` to `HistoryDetail` and nested `analysis_conditions` to `HistoryCondition[]`.
- Reject invalid/missing detail payloads and propagate request errors. The hook must be able to display a retry state; do not convert errors into fabricated empty results.
- Mock mode: return the matching entry from `MOCK_HISTORY_DETAILS` by ID; reject unknown IDs with a not-found error.
- Encode the ID as a URL path segment.

Add this detail wording to the existing toggle description without replacing its current list/delete scope:

```ts
// Set to `true` to use mock data for History list, detail, pagination, and deletion.
// Set to `false` to fetch real-time live data from FastAPI.
```

### `history_mock.ts`

Export `MOCK_HISTORY_DETAILS: Record<string, HistoryDetail>` in the existing mock module. Provide a detail fixture for each seeded `MOCK_HISTORY_ENTRIES` ID so every mock list row can open. Include realistic `summary`, image URL (or null), skin type and confidence, fractional health scores where appropriate, and detailed condition descriptions/confidence. Keep fixture content entirely in this model file. Condition descriptions can be concise educational descriptions, not diagnosis or medical advice.

## 5. ViewModel Hook (`useHistoryDetail.ts`)

Use TanStack Query v5 `useQuery`, `useQueryClient`, and the existing `fetchHistoryDetail` API function.

### Query and actions

| Concern | Behavior |
|---|---|
| Detail query | Query key `['history', 'detail', id]`; enabled only when a non-empty route ID is present. |
| Refresh | Expose `refresh()` to refetch this detail record; pull-to-refresh state derives from the refetch status. |
| Deleted/missing entry | Surface the API not-found or deletion error through the normal detail error state. |
| Cache behavior | On successful deletion from the list, existing History query invalidation also invalidates detail data via the `['history']` prefix. |

### Return contract

```ts
{
  detail: HistoryDetail | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  retry: () => void;
}
```

No detail-specific mutations are required on this page. Do not call the API from the page or presentation components.

## 6. View Breakdown

### `HistoryDetailPage.tsx`

- Read the `[id]` route parameter with Expo Router `useLocalSearchParams` and call `useHistoryDetail(id)`.
- Compose `HistoryDetailHeader` and the Results content; keep query/business logic out of containers/components.
- Use a full-screen scroll view and `RefreshControl` for refresh; no shared `AppHeader`, no tab bar, and no nested duplicate page header.
- Maintain the visual hierarchy from the screenshot: dark olive header, compact tabs, large portrait, rounded warm summary panel, then white/light concern cards.
- Track selected tab for the two-tab header. Results is selected by default. Selecting Ingredient Compatibility navigates to the planned §5.3 detail destination; until that screen is implemented, the route target must be completed as part of the §5.3 work, not replaced with a fabricated result.

### `HistoryDetailHeader.tsx`

- Props: `createdAt: string`, `activeTab: 'results' | 'compatibility'`, `onBack: () => void`, and `onSelectTab: (tab: 'results' | 'compatibility') => void`.
- Render accessible back arrow, “Skin Analysis:” and a locale-formatted date, plus the two compact segmented tab controls shown in the visual reference.
- Back uses Expo Router navigation to return to `/(tabs)/history`.
- The active tab uses the existing warm secondary token; inactive text remains legible against the olive header.

### `s1_HistoryResults.tsx`

- Props: detail data, loading/refresh/error flags, `onRefresh`, and `onRetry`.
- Renders `HistoryAnalysisHero` followed by a “Concern/s” section containing one `HistoryConditionCard` for each detected condition.
- When there are no detected conditions, show a specific neutral “No concerns detected” empty state rather than an empty card stack.
- Render the optional generated summary only if present; do not duplicate condition descriptions as generic summary text.

### `HistoryAnalysisHero.tsx`

- Props: image URL, skin type, health score, and skin-type confidence.
- Display the portrait at full available width with a stable aspect ratio and `expo-image` caching/transition; provide a neutral token-based fallback when the image is absent or fails.
- Below the image, display “Your Skin Type is”, the skin-type value, and the health percentage inside the warm rounded panel. Show “Unknown” if skin type is absent; show score unavailable rather than `0%` if the API provides no score.
- Skin-type confidence may be shown as secondary detail only if it is part of the product’s established result semantics; do not confuse it with health score.

### `HistoryConditionCard.tsx`

- Props: `condition: HistoryCondition`.
- Display the condition name, confidence where available, and its full description in a readable card that scrolls with the page.
- Keep line lengths comfortable and allow long descriptions to wrap. Use an accessible visual marker that does not rely on color alone.
- This screen is informational; condition cards do not navigate to another route unless a documented condition-detail destination is added later.

### Dynamic route: `src/app/history/[id].tsx`

- Render `HistoryDetailPage` and expose the dynamic analysis ID route.
- Register the dynamic route in the root stack only if required for explicit transition options; the route must remain outside `(tabs)` so the detail view has no persistent tab bar.
- Update the list's `onOpenEntry` callback to push `/history/${encodeURIComponent(id)}`.

### Design token constraints

- Use configured Tailwind colors, typography, and radius presets only; use `theme.colors.*` for runtime icon/status-bar props.
- No raw hex values, arbitrary font sizes, generic font weights, or unconfigured radius classes.
- Use platform-safe safe-area spacing and accessible labels for icon-only controls and tab actions.

## 7. Navigation Mapping

| User action | Destination / result |
|---|---|
| Tap a history item | `/history/[id]` for that analysis |
| Tap back arrow | `/(tabs)/history` |
| Tap Results tab | Remain on current detail route and show Results content |
| Tap Ingredient Compatibility | §5.3 History Detail Compatibility page; route/content implementation is a follow-up dependency |
| Pull down on results | Refetch `GET /history/{id}` |
| Analysis ID missing/invalid | Remain on detail route and show not-found/error state with Back and Retry where applicable |

## 8. State Handling Matrix

| Area | Loading | Empty | Error | Success |
|---|---|---|---|---|
| Detail record | Centered spinner or shape-matched hero/concern skeletons | Missing/invalid ID shows an explicit scan-not-found state and Back action | Friendly fetch error with Retry and Back | Fully populated historical result |
| Scan image | Stable placeholder while loading | Neutral portrait placeholder when no URL exists | Fallback placeholder on image load failure | Full-width image with correct crop |
| Skin profile hero | Skeleton panel | Missing skin type/score uses explicit unavailable values | Covered by detail query error | Skin type and precise health score |
| Concerns | Skeleton cards | “No concerns detected” when conditions array is empty | Covered by detail query error | One title/description card per finding |
| Pull-to-refresh | RefreshControl indicator | N/A | Keep current record visible if refetch fails and surface a recoverable notice | Updated detail data replaces cached data |
| Tabs | Active Results state on initial render | N/A | Compatibility route failure is handled by the §5.3 screen | Tab state and navigation reflect selected section |

## 9. Acceptance Checks

- Opening a History row routes to a full-screen detail view without the tabs bar and displays the selected record's date.
- Detail retrieval uses `GET /history/{id}` and normalizes the documented fields and joined condition descriptions/confidence.
- The Results view displays the correct face image/fallback, skin type, unrounded health percentage, and every condition description.
- Empty conditions and missing optional values have explicit, non-misleading states.
- Loading, retryable error, not-found, and populated states work; pull-to-refresh updates the detail query.
- Back returns to the History list; Results is selected initially; the Compatibility tab is wired to the follow-up §5.3 route without pretending the content exists in this task.
- Mock mode can open each seeded history ID with deterministic detail content.
- Changed TypeScript files, Expo lint, Expo Doctor, and iOS Expo Go flow are validated during implementation. Record existing repository diagnostics separately from any introduced errors.

---

**Review checkpoint:** This is an implementation plan only. No source code or routes are changed until the plan is reviewed and approved.
