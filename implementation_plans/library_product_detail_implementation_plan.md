# Product Detail Page Implementation Plan (§3.4)

> Based on `design_references/ui_design_reference.md` § 3.4 and `design_references/library_product_detail.png`.
> Follows `skills/aureskin-screen-architecture-implementation/SKILL.md`, the Library feature tree in `documentation/part2_technical_view.md`, and the existing shared Expo Router tab shell.

## 1. Overview & Reference Mapping

| Item | Decision |
|---|---|
| Target screen | Product Detail Page |
| UI reference | `design_references/ui_design_reference.md` § 3.4 |
| Visual reference | `design_references/library_product_detail.png` |
| Feature folder | `src/features/library/` |
| Entry point | Existing `src/app/(tabs)/library.tsx` route and `LibraryPage` |
| Presentation | Full-height modal overlay opened from a product row. Keep the Products tab mounted underneath so dismissal returns to the same list, filters, and scroll position. |
| Shared shell | Reuse the existing Library route and app tab shell; do not duplicate the app header or bottom tab bar inside the product detail view. The product detail has its own safe-area-aware close action as shown in the reference. |
| Scope boundary | Product detail, ordered product ingredient list, compatibility status, and product favorite action. Product browsing remains §3.2; adding products, camera, upload, and form workflows remain §§3.5–3.7. Ingredient rows open the existing §3.3 Ingredient Detail view. |

The reference hierarchy is: a large white product-image hero with an X at its upper-right and compatibility pill at its lower-right; product name and favorite star; brand; category pill; then a rounded Ingredients card with the label-order ingredient list and warm droplet markers.

### Data-contract constraints to resolve during implementation

- The existing app `Product` model and documented `products` table contain one `image_url`, but the reference image depicts two package views side by side. Do not duplicate one URL or fabricate another image. Use the available image in the hero and a neutral placeholder for missing/failed images. Before claiming exact two-image parity, confirm that the product detail API can return an explicitly provided composite image or a second image URL.
- The technical document lists `GET /products/{id}` and the `product_ingredients` join table ordered by `order`, but does not document the detail response payload or pagination/completeness guarantees for the ingredient join. Confirm the response shape and that all linked ingredients are returned before enabling the live detail view.
- The existing scan compatibility response exposes compatible ingredient IDs and incompatible ingredient-name pairs, but does not define whether its compatible list is exhaustive or provide a product-level compatibility result. The history endpoint ordering is also undocumented. A live green product badge must not be inferred until the backend confirms newest-first history ordering and that all product ingredients can be authoritatively evaluated for the selected analysis. If either contract is insufficient, request a backend contract and display a neutral “Not verified” state instead of claiming compatibility.
- Do not query the undocumented `harmful_pairs` table directly from the client. Reuse the documented compatibility API only when its semantics support this calculation; otherwise the backend must return a typed product-level result.
- Product favorites already use user-scoped AsyncStorage in `useProducts`. Reuse that same cached ID set, storage key, and toggle action so a favorite changed in detail immediately agrees with the Products list. Do not create a second favorite source or claim server synchronization.

## 2. Complete Resolved File Tree

```text
src/features/library/
├── model/
│   ├── library_types.ts                       # Add ordered product ingredient and detail/status contracts
│   ├── library_api.ts                         # Add validated fetchProductById detail normalization
│   └── library_mock.ts                        # Add ordered ingredient lists for mock product details
├── viewmodel/
│   └── useProductDetail.ts                    # Detail query and latest-analysis compatibility state
└── view/
    ├── LibraryPage.tsx                        # Select/dismiss product detail and preserve return context
    ├── containers/
    │   └── s2_ProductsTab.tsx                 # Wire product presses and shared favorite state to detail
    └── components/
        ├── ProductDetailPage.tsx               # Full-height modal, hero, metadata and ingredient card
        └── ProductDetailSkeleton.tsx           # Shape-matched hero and ingredient-list loading state
```

No new Expo Router route is required. The Products tab currently renders in `LibraryPage`; product selection should open a modal rather than navigating away and remounting the list. Reuse the existing `IngredientDetailPage` for ingredient taps.

## 3. Data Model (`library_types.ts`)

Keep the existing `Product`, `ProductPage`, and `ProductQuery` contracts unchanged for §3.2. Add:

```ts
export interface ProductIngredient {
  id: string;
  name: string;
  order: number;
}

export interface ProductDetail extends Product {
  ingredients: ProductIngredient[];
  good_for?: string[];
}

export type ProductCompatibilityStatus =
  | 'compatible'
  | 'review'
  | 'scan_needed'
  | 'unavailable';
```

Contract rules:

- `ProductIngredient.id` is the canonical ingredient UUID used to open the existing ingredient detail. `order` is the label order from `product_ingredients`; sort ascending after normalization and use a stable tie-breaker if equal order values occur.
- Reject malformed detail payloads, missing required product fields, invalid ingredient IDs/names/orders, or a detail whose product ID does not match the requested ID. Do not silently drop malformed ingredient rows from a purported complete formula.
- A valid product with an empty ingredient list remains a successfully loaded product, but the ingredient card shows an explicit “Ingredient list unavailable” message; it must not imply that the formula contains no ingredients.
- An optional `good_for[]` list may be included in the product detail response. Render it in a separate “Good For” card with green bullets only when non-empty; omit the card when the service has no verified entries.
- `review` is neutral and non-alarming: it means the product was not affirmatively established as compatible, including unresolved ingredients or a reported conflict. It must not be presented as a clinical incompatibility diagnosis.
- A green `compatible` state is allowed only after the backend confirms the analysis ordering and exhaustive product-ingredient compatibility semantics described in §1. With incomplete data or an unconfirmed contract, do not infer a green state.

## 4. API Functions & Mock Data

### `library_api.ts`

Add:

```ts
export async function fetchProductById(id: string): Promise<ProductDetail>;
```

- Validate non-empty IDs and URL-encode the path parameter.
- In `USE_MOCK` mode, resolve the product plus its ordered `ProductIngredient[]` from centralized mock detail data; reject unknown IDs with a meaningful error.
- In live mode, request `GET /products/{id}` using the existing authenticated `api` client. Validate the standardized response envelope, product fields, and all joined ingredients before returning.
- Preserve the current `USE_MOCK` toggle for the Library feature and existing list functions. Update its description to include product detail and ordered ingredient data.
- Do not make a second request per ingredient unless the confirmed product-detail endpoint does not include ingredient names. If a separate lookup is required, resolve the join through a documented API contract and preserve the `order` field.

### Mock data

In `library_mock.ts`, add a named `MOCK_PRODUCT_DETAILS` collection keyed by the existing product IDs. It must use complete, ordered fixture ingredient rows and share ingredient IDs/names with `MOCK_INGREDIENTS`, so a tapped row always opens a real Ingredient Detail fixture. Keep all mock records out of the API, ViewModel, and View.

Provide at least:

- One populated product with several ordered ingredients to exercise scrolling and row navigation.
- One product with no ingredient list to exercise the explicit unavailable-list message.
- Deterministic compatibility fixture data aligned with the mock latest analysis. Never use invented clinical copy or silently mark a fixture compatible when its IDs do not match.

### Compatibility data source

Reuse `fetchHistoryPage({ limit: 1, offset: 0 })` and `fetchCompatibility(analysisId)` only after confirming that the first history result is guaranteed to be the newest and that the response can establish product-level status for the full formula. Validate `analysis_id` against the requested ID. If this contract is not confirmed or the service cannot evaluate every product ingredient, return/display `review` (or `unavailable` on fetch failure), not `compatible`. Do not perform direct database access to `harmful_pairs`.

## 5. ViewModel Hook (`useProductDetail.ts`)

The hook accepts `productId: string` and owns the product detail and compatibility queries. Product favorite state remains owned by the existing `useProducts` hook so list and detail share the same user-scoped AsyncStorage query and optimistic mutation.

Proposed return shape:

```ts
interface UseProductDetailResult {
  product: ProductDetail | undefined;
  isLoading: boolean;
  error: string | null;
  compatibilityStatus: ProductCompatibilityStatus;
  compatibilityError: string | null;
  isCompatibilityLoading: boolean;
  actions: {
    retry: () => Promise<void>;
    retryCompatibility: () => Promise<void>;
  };
}
```

- Query key: `['library', 'product', productId]`; enable only for a non-empty ID. Retry and cache using React Query.
- Resolve latest analysis and compatibility in separate queries so a compatibility failure does not hide a successfully loaded product.
- No analysis => `scan_needed`; analysis/compatibility request failure or invalid response => `unavailable`; unverified/incomplete compatibility => `review`; only backend-authoritative positive results => `compatible`.
- Surface errors explicitly, keep product content visible when only compatibility fails, and expose a distinct compatibility retry.
- The ViewModel contains no JSX, styling, favorite persistence, or navigation.

## 6. View Breakdown

### `ProductDetailPage.tsx`

Presentational modal with typed props for visibility, product data, loading/error states, compatibility state, favorite state, and callbacks.

- Use the existing React Native `Modal` slide presentation pattern and `SafeAreaView` edges for top/bottom insets.
- Use a vertical `ScrollView` with the hero first, followed by product name/favorite, brand, category, and the ingredient card. Keep the close button at the hero’s top-right and compatibility badge at its lower-right.
- Render the single documented product image with the existing Expo Image component, `contentFit="contain"`, fade-in, and local error fallback. Do not stretch/crop packaging or invent a second view.
- Product name uses the `text-h2` preset; Ingredients heading uses `text-h3 font-sans-bold`. Use existing theme and NativeWind tokens only—no raw colors, arbitrary font sizes, or radii.
- The name and favorite control share a flexible row; brand is secondary text; category uses a muted pill. Ingredient rows preserve server order and use the warm droplet icon from the reference.
- Add accessible labels/roles to close, favorite, and each ingredient row. Favorite toggling uses the shared `useProducts` action/state and displays persistence errors distinctly.
- Tapping an ingredient hands its canonical ID to `LibraryPage`, which switches to the existing §3.3 Ingredient Detail modal. Dismissing that detail returns to this same product detail ID, with React Query cache retaining its loaded state.
- Entry/exit use the modal slide animation; hero image fades in; ingredient presses show a brief opacity/highlight feedback.

### `ProductDetailSkeleton.tsx`

Render a hero placeholder, metadata lines, category pill placeholder, and several ingredient-row placeholders. Match the final layout shape and use theme/token classes; avoid loading an external image while pending.

### `useProductDetail.ts`

Own product and compatibility queries as specified in §5. It returns typed status/errors and retry actions only.

### `LibraryPage.tsx`

- Track `selectedProductId`, `selectedIngredientId`, and a `returnProductId` used when transitioning from the product sheet to Ingredient Detail.
- Pass the selected product ID and navigation callbacks into the Products tab. Keep the products content mounted while its detail modal is open.
- On ingredient selection from Product Detail, retain the product ID as return context, dismiss the product modal, and open the existing ingredient detail. On ingredient close, restore the selected product modal.
- On product close, clear the selected product ID and retain all Products-tab query/filter/scroll state.
- Keep existing ingredient tab/detail behavior unchanged.

### `s2_ProductsTab.tsx`

Continue to own the existing `useProducts()` integration. Route product item presses to `LibraryPage` rather than the current “details will be available” notice. Render or pass the Product Detail sheet the selected ID, favorite state, and the same `toggleFavorite` action used by list rows. Expose a favorite lookup from the existing favorites IDs if needed; do not add another persistence hook.

### State handling matrix

| Section | Loading | Empty | Error | Success |
|---|---|---|---|---|
| Product detail | `ProductDetailSkeleton` for hero, metadata, and ingredient rows | Not applicable for a valid product; unknown ID becomes the detail error state | Friendly product error and “Go Back” action; retry may be offered without losing the list underneath | Hero, product metadata, category, and ordered ingredients |
| Product image | Neutral image placeholder while loading | Neutral placeholder when URL is absent | Keep placeholder if image load fails; do not fail the whole product | Fade-in for a valid loaded image |
| Ingredient list | Skeleton rows | Explicit “Ingredient list unavailable” card content, not a blank card | Product-detail error if the ingredient payload is malformed/unavailable; do not report success with silently dropped rows | All rows in label order; each opens ingredient detail |
| Compatibility | Neutral loading badge/state | No analysis => neutral “Scan needed” | Neutral “Not verified” state and retry; no positive fallback | Green “Compatible” only from authoritative full-product result; otherwise neutral “Review” |
| Favorite | Disable control while favorites are loading/saving | Not applicable | Roll back failed optimistic toggle and show persistence error | Star matches Products list favorite state |

## 7. Navigation Mapping

| Action | Destination / behavior |
|---|---|
| Tap a product row in Products tab | Open Product Detail modal for that product ID |
| Tap Close (X) | Dismiss detail and return to the same Products tab state |
| Tap product favorite star | Toggle the existing user-scoped local favorite state; list and detail stay synchronized |
| Tap an ingredient row | Open existing Ingredient Detail (§3.3) for that ingredient ID; closing it returns to the selected product detail |
| Retry product detail | Refetch product detail without resetting Products-tab list state |
| Retry compatibility | Refetch latest analysis/compatibility only; preserve product data |

## 8. Implementation & Verification Order

1. Confirm the live product detail response includes the complete joined ingredient list and label order.
2. Confirm history ordering and the backend's product-level compatibility semantics; if unavailable, keep live status neutral and request an API contract rather than infer a positive badge.
3. Add types and centralized mock detail fixtures.
4. Add and validate `fetchProductById` without changing Products list behavior.
5. Add the product detail ViewModel and shared compatibility/error handling.
6. Build the skeleton and modal detail UI using existing tokens and Expo Image.
7. Wire product selection, favorite state, and the product-to-ingredient return flow in the existing Library tab.
8. Run targeted Expo ESLint and `npx tsc --noEmit`; report unrelated baseline diagnostics separately. Verify detail opening/closing, ordered ingredient navigation and return, favorite synchronization, loading/error/empty states, and compatibility state in the app preview; run an Expo web export to catch platform bundling errors.

## 9. Implementation Status

Implemented in the Library feature:

- Added `ProductDetail` and ordered `ProductIngredient` contracts, validated `fetchProductById` normalization, and centralized detail fixtures for every mock product. Mock ingredient IDs link to the existing Ingredient Detail records; fixtures without a verified formula explicitly show “Ingredient list unavailable.”
- Added `useProductDetail` for product and compatibility query state. Product favorite IDs and mutations are shared with `useProducts`, keeping the Products list and detail star synchronized.
- Added the full-height detail modal and skeleton with hero image fallback, product metadata, category/status badges, favorite action, and ordered tappable ingredients. Ingredient Detail opens after the product sheet dismissal completes; closing it restores the same product.
- Reworked the product list card into sibling detail/favorite buttons instead of nested buttons, removing invalid nested-button markup encountered during browser verification.
- Added an optional, validated `good_for[]` product-detail field and a separate green-bullet “Good For” card below the ingredient list. The glycolic toner mock demonstrates the six non-placeholder entries visible in the supplied reference.
- Disabled favorite mutations when saved favorites fail to load, surfaced the read error with a retry action, and shared that recovery behavior between the list and detail view.

Validation:

- Targeted ESLint on `src/features/library` passed after implementation.
- `npx expo export --platform web` succeeded.
- Browser verification confirmed the Products tab opens the product detail, the ingredient list renders in order, tapping an ingredient opens Ingredient Detail and closing it restores Product Detail, and toggling the product favorite twice updates the shared state and restores its original value.
- `npx tsc --noEmit` still reports existing errors in the app-tabs, History, Home, and theme files; it reported no errors in the Library implementation.

Backend contract caveats remain: the live product detail response shape and completeness guarantee are undocumented, and no product-level compatibility result or newest-first history ordering is defined. The live adapter validates the supported detail shape explicitly. Until those backend contracts are confirmed, the UI shows neutral “Not verified” / “Scan needed” compatibility states and never infers a green compatible result. The current schema provides one `image_url`, so the hero uses that image when provided and otherwise shows a neutral placeholder rather than fabricating a second package view.
