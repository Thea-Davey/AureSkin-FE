# Library Page — Products Tab Implementation Plan (§3.2)

> Based on `design_references/ui_design_reference.md` § 3.2 and `design_references/library_products.png`.
> Follows `skills/aureskin-screen-architecture-implementation/SKILL.md`, the Library feature tree in `documentation/part2_technical_view.md`, and the existing shared Expo Router tab shell.

## 1. Overview & Reference Mapping

| Item | Decision |
|---|---|
| Target screen | Library Page — Products Tab |
| UI reference | `design_references/ui_design_reference.md` § 3.2 |
| Visual reference | `design_references/library_products.png` |
| Feature folder | `src/features/library/` |
| Existing route | `src/app/(tabs)/library.tsx`; products render within the existing `LibraryPage` route |
| Shared shell | Reuse the header, menu overlay, scan overlay, and bottom tab navigator from `src/app/(tabs)/_layout.tsx`. Do not add a second header or tab bar. |
| Scope boundary | Implement product browsing, search, category/favorite filtering, and local favorite toggling. Product Detail (§3.4), Add Product Camera Overlay (§3.5), upload flow (§3.6), and Add Product Form (§3.7) remain separate screens/flows; this plan specifies safe navigation handoffs without creating those destinations. |
| Relationship to §3.1 | Extend the existing shared Library tab selector so Products becomes a real tab and Ingredients continues to render the existing `S1IngredientsTab`. Do not replace or regress the Ingredients implementation. |

The reference shows the shared olive Library header above a warm light list surface, a two-tab selector with Products active, a compact search trigger and two filter pills, vertical product cards with image/name/brand/category/favorite state, and an elevated add-product button at bottom-right.

### Data-source and favorites decisions

- Use the existing authenticated Axios client from `src/shared/services/api.ts` for `GET /products`, as documented by the UI reference and API table. The UI spec includes `q` and `category`; the adapter will request those with `limit` and `offset` and normalize the response into an app-owned page contract. If a deployed backend does not accept `category`, surface the request error rather than silently misrepresenting filtered results.
- Product catalog mock fixtures belong in the existing `src/features/library/model/library_mock.ts`. The existing `USE_MOCK` switch in `library_api.ts` applies to both Library lists and must remain consistently configured.
- The database/API documentation contains no favorites endpoint or favorites table contract. Persist favorite product IDs locally using the already-installed AsyncStorage package, namespaced by authenticated user ID. Do not write to an undocumented Supabase table or present a local toggle as server-synchronized. If there is no authenticated user ID, use a clearly documented local anonymous key or keep the current session’s state only; do not allow one user’s saved favorites to appear for another.
- Display image URLs from `products.image_url` using the Expo-compatible image component already used elsewhere in the app if available; missing or failed images show the reference’s soft placeholder.

## 2. Complete Resolved File Tree

```text
src/features/library/
├── model/
│   ├── library_types.ts                 # Add Product, ProductPage, and product query/filter contracts
│   ├── library_api.ts                   # Add paginated product-list fetch and normalization
│   └── library_mock.ts                  # Add centralized product fixtures
├── viewmodel/
│   └── useProducts.ts                   # Product query, search, filters, favorites, and refresh state
└── view/
    ├── LibraryPage.tsx                  # Render s1 or s2 for selected Library tab
    ├── containers/
    │   └── s2_ProductsTab.tsx           # Search, category/favorite controls, list, and FAB
    └── components/
        ├── ProductListItem.tsx           # Product image, name, brand, category, favorite button
        ├── ProductListSkeleton.tsx       # Product-card skeleton state
        └── ProductFilterSheet.tsx        # Category and All/Favorites filter choices

src/app/(tabs)/library.tsx                # No route change expected; preserve existing LibraryPage mount
```

The Library feature tree in `documentation/part2_technical_view.md` also lists Product Detail, add-product, and upload flow files. Do not create them under this plan: each destination has a separate UI design-reference section and workflow. Keep changes in the existing Library model/API files backward-compatible with `fetchIngredients` and the §3.1 list.

## 3. Data Model (`library_types.ts`)

Add these product contracts alongside the existing `Ingredient` types:

```ts
export type ProductCategory =
  | 'cleanser'
  | 'toner'
  | 'moisturizer'
  | 'sunscreen'
  | 'serum'
  | 'other';

export interface Product {
  id: string;
  name: string;
  brand: string | null;
  category: ProductCategory | string;
  description: string | null;
  image_url: string | null;
  is_user_added: boolean;
}

export interface ProductPage {
  items: Product[];
  nextOffset: number | null;
}

export interface ProductQuery {
  q: string;
  category: ProductCategory | null;
  limit: number;
  offset: number;
}

export type ProductListFilter = 'all' | 'favorites';

export interface ProductListItemModel {
  product: Product;
  isFavorite: boolean;
}
```

`Product` maps to the documented `products` table columns needed by the catalog card. Do not require backend favorite fields: `isFavorite` is derived from the per-user local preference store. Normalize optional `brand`, `description`, and `image_url` to `null`; normalize missing `is_user_added` to `false` only if the API contract permits an absent value, otherwise reject malformed product records explicitly. Preserve unknown category strings for forward compatibility and display a readable category badge.

## 4. API Functions & Mock Data

### `library_api.ts`

Retain the existing Ingredients API and its toggle unchanged, except for updating the toggle description to include Products. Add:

```ts
export async function fetchProducts(
  params: ProductQuery
): Promise<ProductPage>;
```

- In mock mode, case-insensitively match product name and brand by `q`, match the selected category, then slice by offset and limit.
- In live mode, request `GET /products` with `{ q, category, limit, offset }`.
- Normalize the documented response envelope to `ProductPage`; validate required `id`, `name`, and `category`, and normalize nullable catalog fields.
- Compute `nextOffset` from the returned item count and page size; use `null` when the response is shorter than the requested page.
- Propagate request and response-normalization errors to React Query; never disguise a failed request as an empty catalog.

Use the shared `USE_MOCK` comment block in `library_api.ts` with the full Library feature coverage:

```ts
// ============================================================================
// DATA SOURCE TOGGLE (use mock)
// Set to `true` to use mock data for all Library screen features (ingredient
// browsing, product browsing, search, and pagination).
// Set to `false` to fetch real-time live data from FastAPI and Supabase.
export const USE_MOCK: boolean = true;
// ============================================================================
```

### `library_mock.ts`

Add `MOCK_PRODUCTS: Product[]` with multiple realistic product examples, including the reference product “Glycolic Acid 7% Toning Solution” by “The Ordinary.” Include several categories, both image-present and image-missing entries, brands, and an entry with unknown optional metadata. Keep all fixture data in this file. Fixture count should support at least one full page and a following page for pagination validation.

## 5. ViewModel Hook (`useProducts.ts`)

Use TanStack Query v5 `useInfiniteQuery`, `useQueryClient`, and a mutation or equivalent optimistic local update for favorite toggles. Use AsyncStorage for the favorites preference and the existing auth store only to determine a user-scoped storage key.

### Queries, state, and mutations

| Concern | Behavior |
|---|---|
| Product pages | Infinite query key `['library', 'products', debouncedQuery, category]`; page size `20`; initial offset `0`; consume `nextOffset`. |
| Search | The search icon expands/collapses an accessible search input. Debounce input by 300 ms, preserve query when changing filters, and reset pagination when the debounced query changes. Search matches server-supported product fields (name/brand) in mock mode. |
| Category filter | Category choices include All, Cleansers, Toners, Moisturizers, Serums, and Sunscreens. Apply the selected category in the product query and reset paging when it changes. |
| Secondary filter | `All` or `Favorites`; Favorites filters the loaded catalog to IDs in the local per-user favorites set. Do not infer backend filtering support for favorites. |
| Favorite toggle | Optimistically toggle one product ID, persist it in AsyncStorage, and revert/report an actionable favorite-persistence error if saving fails. Tapping the star must not trigger the product-card press/navigation. |
| Refresh | Refetch the first page under the active query/category and expose `isRefreshing` and `refresh`. Keep search and filters selected. |
| Pagination | Expose `hasNextPage`, `isFetchingNextPage`, `isFetchNextPageError`, and guarded `loadNextPage`. Keep already loaded products visible after a next-page error. |
| Filter sheet | Expose its visibility and open/close/apply/reset actions. Closing without Apply must retain the previously applied filters. |
| Error | Provide a meaningful fetch/persistence error; do not use empty-state messaging for failures. |

### Return contract

```ts
{
  products: ProductListItemModel[];
  searchQuery: string;
  isSearchExpanded: boolean;
  selectedCategory: ProductCategory | null;
  selectedListFilter: ProductListFilter;
  isFilterSheetVisible: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  isFetchingNextPage: boolean;
  isFetchNextPageError: boolean;
  isFavoritesLoading: boolean;
  isTogglingFavorite: boolean;
  hasNextPage: boolean;
  error: string | null;
  favoriteError: string | null;
  actions: {
    setSearchQuery: (query: string) => void;
    toggleSearch: () => void;
    openFilters: () => void;
    closeFilters: () => void;
    applyFilters: (category: ProductCategory | null, listFilter: ProductListFilter) => void;
    resetFilters: () => void;
    toggleFavorite: (productId: string) => void;
    refresh: () => Promise<void>;
    retry: () => Promise<void>;
    loadNextPage: () => void;
  };
}
```

Keep all query logic, debounce, favorite persistence, error normalization, and derived favorites filtering in the ViewModel/model. The view/container only renders state and invokes callbacks.

## 6. View Breakdown

### `LibraryPage.tsx`

- Preserve the shared `LibraryPage` route and the existing Ingredients tab behavior from §3.1.
- Keep the tab selector visible; render `S1IngredientsTab` for Ingredients and `S2ProductsTab` for Products. The Products tab is active when selected.
- Instantiate or mount the Products ViewModel in a way that avoids unnecessary product requests while the user is viewing Ingredients (prefer a dedicated child component that mounts `useProducts()` only while Products is active).
- Keep shared header, menu, scan overlay, and bottom tab bar owned by the existing tabs layout.

### `s2_ProductsTab.tsx`

- Owns no API calls, filtering, or favorites business logic. Receives product list models, flags, and action/navigation callbacks through typed props.
- Render a horizontal filter row with a search icon trigger and category/secondary filter pills.
- Expanding search shows an accessible text input with a close/collapse affordance; query changes remain debounced by the hook.
- Category or All/Favorites filter pills open `ProductFilterSheet`. Display current selections in each pill.
- Render a `FlatList` of `ProductListItem` cards; call `loadNextPage` only when a next page exists and no page request is active.
- Render the bottom-right add-product FAB with an accessible label, elevation, and press feedback. On press, hand off to Add Product Camera Overlay (§3.5) when a valid route exists; until that flow is implemented, show an explicit not-yet-available notice instead of navigating to a missing route.
- Reserve bottom space so list content and FAB do not overlap the persistent tab bar or central Scan button.
- Render initial loading, filtered-empty, initial-error/retry, pagination loading/error, and populated states.

### `ProductListItem.tsx`

- Match the reference’s horizontal card: product thumbnail or soft square placeholder on the left; product name, brand, and category badge in the center; favorite star on the right.
- Use the installed `expo-image` component for product images, with content fit suitable for packaging and a neutral fallback for missing or failed URLs.
- Product card press opens Product Detail (§3.4) when that route exists; until implemented, show a clear not-yet-available notice rather than a broken route.
- Favorite star is a separate accessible button with filled/outline state, press feedback, and a brief scale/bounce animation. Prevent the star press from activating the parent card.
- Provide accessibility labels for both the product card and favorite control.

### `ProductListSkeleton.tsx`

- Render shape-matched product cards with a square thumbnail, text-line placeholders, badge, and star placeholder.
- Use token-based colors/radii; no raw color, arbitrary font-size/radius, or new animation dependency.

### `ProductFilterSheet.tsx`

- Present category choices (All, Cleansers, Toners, Moisturizers, Serums, Sunscreens) and list filter choices (All, Favorites) in a platform-safe dismissible modal/sheet consistent with existing app modal patterns.
- Include Apply and Reset actions. Closing without applying preserves the currently active filters.
- Expose accessible selected state for every option.

### Existing route: `src/app/(tabs)/library.tsx`

- Keep the thin route mounted to `LibraryPage`; no tab-layout changes or duplicate header/tab bar.

### Design token and animation constraints

- Match `library_products.png`: light rounded list surface, rounded cards, muted category badge, compact filter controls, olive add FAB, and clear image fallback.
- Use NativeWind tokens only for color/typography/radii (`bg-neutral-offwhite`, `bg-card`, `text-text`, `text-muted`, `border-border`, `bg-secondary`, `bg-primary`, font presets, and `rounded-*` presets). Use `theme.colors.*` for icon/indicator JS props.
- Use staggered fade-in for product cards and a small star-toggle scale animation using already-installed `react-native-reanimated`; provide reduced-motion-safe or non-animated behavior if animation is disabled by platform/accessibility settings.
- Use responsive row layout rather than fixed screen widths; preserve image aspect ratio and allow long names/brands to wrap or truncate without clipping controls.

## 7. Navigation Mapping

| User action | Destination / result |
|---|---|
| Tap Products tab | Show Products list on the existing Library route |
| Tap Ingredients tab | Return to Library Page — Ingredients Tab (§3.1), preserving its current behavior |
| Tap search icon | Expand/collapse product search input |
| Enter search text | Refresh product results for the debounced query; reset pagination |
| Select category / All / Favorites | Apply filters and update product list |
| Tap favorite star | Toggle and locally persist that product’s favorite state; remain on Products tab |
| Tap product card | Product Detail Page (§3.4); show a not-yet-available notice until that route is implemented |
| Tap Add Product FAB (+) | Add Product Camera Overlay (§3.5); show a not-yet-available notice until that flow is implemented |
| Tap hamburger icon | Shared Menu Overlay (7.1) |
| Pull down on product list | Refetch the current first page with current search/category |
| Reach end of product list | Fetch next page when available |
| Tap Home, Scan, History, or Routine in bottom tabs | Shared tab navigator switches to the selected destination |

## 8. State Handling Matrix

| Section/state | Loading | Empty | Error | Success |
|---|---|---|---|---|
| Initial product list | Shape-matched product-card skeletons | “No products found matching your filters” with Reset Filters action | Inline error banner with Retry | Product cards with image/fallback, name, brand, category, and favorite |
| Search/category/favorites results | Keep current content stable while query changes/fetches | Filter-specific empty message and Reset Filters action | Keep current controls and expose retry; do not show empty state | Cards matching the active query and category/favorites filter |
| Pagination | Footer spinner | No footer when `nextOffset` is null | Footer retry; keep loaded cards visible | Append results in response order |
| Product image | Placeholder while image loads | Soft placeholder for missing image URL | Soft placeholder after image-load failure | Loaded thumbnail |
| Favorite persistence | Disable duplicate toggles for the pending product and animate once | Unfavoriting the last item in Favorites shows the filtered-empty state | Revert optimistic state and show actionable error | Saved state persists per user across app restarts |
| Add FAB / product detail handoff | N/A | N/A | Do not navigate to nonexistent route; explain destination is not yet available | Navigate only after the target flow is implemented and registered |

## 9. Acceptance Checks

- Switching to Products renders the reference-matched product list while switching to Ingredients preserves §3.1 behavior.
- Search expansion, query debounce, category selection, and All/Favorites selection change the displayed result set correctly and reset pagination as needed.
- The first request uses `GET /products?q=&category=&limit=20&offset=0`; subsequent requests use the proper next offset.
- Product cards show name, brand, category, image or fallback, and a separate favorite control with accessible labels.
- Favorite state persists locally for the active user and does not claim backend synchronization; failed persistence is surfaced and reverted.
- Initial, filtered-empty, fetch-error, image-fallback, pagination, and favorite-persistence states are distinct and usable.
- Product Detail and Add Product actions do not navigate to missing routes. Replace the not-yet-available handoff with Expo Router navigation when their separate destination scopes are implemented.
- `npx expo lint` and `npx tsc --noEmit` are run after implementation; report existing unrelated baseline diagnostics separately. Validate interactions on the Library route in the Expo web/native preview where runtime configuration permits.

---

## 10. Implementation Status

Implemented in the existing Library route:

- Added product types, mock catalog data, paginated API normalization, and the Products query/view model.
- Added product cards, image fallbacks, loading skeletons, category/favorites filter sheet, search controls, pagination, refresh/retry states, favorite persistence in user-scoped AsyncStorage, and the add-product action.
- Integrated the Products tab with the existing Ingredients tab without replacing the Ingredients screen.
- Product detail and add-product destinations remain intentionally unavailable; their actions show an explanatory notice rather than navigating to missing routes.

Validation completed for the implementation: Expo web export succeeded and the Library feature passed targeted ESLint. TypeScript checking still reports pre-existing diagnostics in unrelated app-tabs, History, Home, and theme files; no diagnostics were reported in the Library feature.

**Review checkpoint:** Implementation is complete. Product browsing is implemented; Product Detail (§3.4) and Add Product flows (§3.5–3.7) remain separate follow-up scopes.
