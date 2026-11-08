# AureSkin — Live Version Frontend & Backend Fixes Implementation Plan

> **Scope:** Comprehensive visual design corrections, token compliance (`aureskin-frontend-rules`), MVVM architecture consistency, live backend wiring (FastAPI), and feature fixes across 9 core user objectives:
> 1. **Ingredient Page:** Elimination of black outline glitch on card mount.
> 2. **Ingredient Detail Page:** Description filtering (strip class boilerplate), benefits mapping, 2 new detail cards (Compatible Skin Types with green bullets & Target Skin Conditions with red bullets), and "Who Should Avoid" caution containers for 7 specific dermatological triggers.
> 3. **Product Page Loading Skeleton:** Width alignment and shape-matched skeleton matching `ProductCard` (remove nested padding).
> 4. **Product Page + Product Detail Page:** Backend category filtering (`cleanser`, `toner`, `serum`, `moisturizer`, `sunscreen`, `other`, `all`), subtitle formatting for "Other" products, removal of white header, and global reusable `CloseButton`.
> 5. **Favorites Feature:** Unified cross-feature favorites persistence and live sync between IngredientCard, ProductCard, detail modals, and `FavoritesPage`.
> 6. **Routine Page (Product Swap):** Backend candidate ranking endpoint (`GET /routine/swap-candidates` & `PUT /routine/steps/{id}`) with attribute scoring (+3.0 skin type, +1.5 condition), search, and UI integration.
> 7. **Library Page (Empty States):** Removal of border/outline wrappers on empty state containers in both Ingredients and Products tabs.
> 8. **Start Skin Scan Buttons:** Redirection fix — invoke `useAppStore.getState().openScanOverlay()` across Home, Routine, History, and navigation fallbacks instead of routing to `/(tabs)`.
> 9. **Home Page Visual Updates:**
>    - Full-width CTA button in `SkinTestGuideTip`.
>    - New `TodaysRoutineCard` in `home/view/components/` (Style 1 Morning with `bg-neutral-beige` and Sun icon, Style 2 Night with `bg-secondary-dark` and MoonStar icon; compact 1-line step formatting `"product type" • "product name"`).
>    - Redesigned `AnalysisSummaryCard` matching Reference Image 3 (expanded condition box, red bullet dots, `text-concern` color token, adjusted health gauge).

---

## 1. Reference Mapping & Visual Truth

| Area | Reference Asset / Target Screen | Visual Ground Truth & Notes |
|---|---|---|
| **Image 1** | `media_1794127922167_8428e69c.jpg` | Thick dark outline artifact around `IngredientCard` on initial render. Caused by Reanimated `FadeIn` interacting with Android elevation shadow. Clean structure like `ProductCard` resolves it. |
| **Image 2** | `media_1794127924477_78331cbb.jpg` | Shrunken skeleton in `ProductListSkeleton` caused by redundant `px-5` inner padding on top of `FlatList`'s `contentContainerClassName="px-5 pb-28"`. |
| **Image 3** | `media_1794127938090_907f3297.png` | Target layout for `AnalysisSummaryCard`: Left column wider; `bg-secondary` Skin Type pill; `bg-neutral-beige` Skin Condition box with red bullet dots (`bg-concern`) and `text-concern` names; white full-width `Date Scanned:` pill; right column holds compact circular `HealthGauge`. |
| **Tokens** | `frontend/tailwind.config.js` & `frontend/src/shared/theme/index.ts` | Strict adherence to `text-display`, `text-h1`, `text-h2`, `text-h3`, `text-body`, `text-body-sm`, `text-caption`, `text-label`; `rounded-card`, `rounded-button`, `rounded-input`, `rounded-badge`, `rounded-full`; `theme.colors.*` for JS props. |

---

## 2. Detailed Technical Breakdown by Objective

### Objective 1: Ingredient Page — Remove Card Outline on Load
- **Root Cause:** In `frontend/src/shared/components/IngredientCard.tsx`, the card is wrapped in `<Animated.View entering={FadeIn}>`. On Android, Reanimated `FadeIn` combined with `Card.tsx`'s native shadow/elevation (`elevation: 1` or `2`) triggers a known Android RenderNode compositing artifact where a thick dark grey border renders around the card boundary while the alpha animation runs. Furthermore, `IngredientCard` passes `variant={2}` with interactive `Pressable` styling directly to `Card`, whereas `ProductCard` mounts as a clean, non-animated `Card style={2}` containing an inner `Pressable`.
- **Files to Modify:**
  - `frontend/src/shared/components/IngredientCard.tsx`
- **Implementation:**
  1. Remove `<Animated.View entering={FadeIn}>` wrapper and use clean native container matching `ProductCard.tsx`.
  2. Normalize `Card` invocation to `style={2}` with clean `border border-border bg-card` styling.
  3. Ensure transitions are smooth without clipping or rendering artifacts.

---

### Objective 2: IngredientDetail Page — Text Cleaning & Enriched Clinical Cards
- **Problems Addressed:**
  1. Generic class intro boilerplate (`"Amino acids are a class of ingredients. They can also be found on ingredients lists as..."`) displays in the description for many ingredients.
  2. "What is it good for?" currently renders skin types instead of true pharmacological benefits from Supabase `benefits` column.
  3. Missing structured cards for "Compatible Skin Types" and "Target Skin Conditions".
  4. "Who Should Avoid" lacks structured caution containers for the 7 designated dermatological sensitivity groups.
- **Files to Modify:**
  - `frontend/src/shared/components/IngredientDetailPage.tsx`
  - `frontend/src/features/library/model/library_api.ts` (normalize fields: `benefits`, `skin_types`, `skin_conditions`, `who_should_avoid`)
- **Implementation Details:**
  1. **Description Filter:**
     - Create utility/sanitizer `cleanIngredientDescription(text: string): string`:
       - If text begins with `"Amino acids are a class of ingredients..."` or similar category boilerplate (e.g. `"... are in a class of prebiotic ingredients..."`), strip out the category boilerplate sentence/paragraph.
       - Take only the first coherent paragraph specifically describing the ingredient itself.
  2. **"What is it good for?" DetailCard:**
     - Point directly to `ingredient.benefits` (from the Supabase `benefits` column).
     - Render as narrative or structured bullet points using `DescriptionCard`.
  3. **"Compatible Skin Types" DetailCard:**
     - Title: `"Compatible Skin Types"`
     - Variant: `bulleted`, `bulletTone="positive"` (green dot `bg-accent`).
     - Map over `ingredient.skin_types` (formatted nicely: `"Oily Skin"`, `"Dry Skin"`, `"Combination Skin"`, `"Normal Skin"`, `"Acne-Prone Skin"`).
  4. **"Target Skin Conditions" DetailCard:**
     - Title: `"Target Skin Conditions"`
     - Variant: `bulleted`, `bulletTone="negative"` (red dot `bg-status-error`).
     - Map over `ingredient.skin_conditions` (formatted: `"Redness"`, `"Dark Spots"`, `"Enlarged Pores"`, `"Inflammatory Acne"`, `"Wrinkles"`, etc.).
  5. **"Who should avoid?" DetailCard & Hardcoded Caution Containers:**
     - Map over parsed items from `who_should_avoid`.
     - Display red bullet dot (`bg-status-error`) with the avoid title.
     - Underneath each item (or for matched items), display a Caution container with specific dermatological guidance for the 7 groups:
       - **Related Allergy:** *"Individuals with known sensitivities or allergic reactions to this ingredient or related botanical/chemical compounds should avoid use."*
       - **Sensitive:** *"May cause irritation, redness, or stinging on reactive or sensitive skin. Patch test before applying to facial areas."*
       - **Impaired skin barrier:** *"Avoid using on compromised, peeling, or actively inflamed skin barriers until the natural moisture barrier has recovered."*
       - **Dry Dehydrated:** *"May exert an astringent or drying effect on moisture-depleted skin; ensure sufficient barrier hydration if used."*
       - **Oily:** *"Can be comedogenic or overly occlusive for sebum-rich, congestion-prone skin profiles."*
       - **Gluten Allergy / Gluten Allery:** *"Contains wheat-derived components or processing traces that may trigger reactions in individuals with celiac disease or gluten allergies."*
       - **Pregnancy:** *"Contraindicated or advised against during pregnancy and lactation; consult with a physician prior to topical use."*
     - Container styling: `rounded-button border border-note-warning-border bg-note-warning p-3 mt-1 mb-2` with `text-caption font-sans-bold text-note-warning-title` for "Caution" header and `text-body-sm font-sans text-text` for body.

---

### Objective 3: Product Page — Loading Skeleton Alignment
- **Root Cause:** In `frontend/src/features/library/view/components/ProductListSkeleton.tsx`, line 5 sets `className="px-5 pt-4"`. However, in `s2_ProductsTab.tsx`, the parent `FlatList` already defines `contentContainerClassName="px-5 pb-28"`. The skeleton items thus received double horizontal padding (40px on each side), appearing noticeably shrunken compared to the actual `ProductCard` (Image 2).
- **Files to Modify:**
  - `frontend/src/features/library/view/components/ProductListSkeleton.tsx`
- **Implementation:**
  1. Remove `px-5` from outer wrapper of `ProductListSkeleton.tsx` (change to `className="w-full pt-2"`).
  2. Ensure skeleton cards match `ProductCard` exactly: `mb-3 min-h-28 flex-row items-center rounded-card border border-border bg-card p-3`.
  3. Match thumbnail (`h-24 w-24 rounded-button bg-background`), name line, brand line, category badge pill, and favorite icon placeholder.

---

### Objective 4: Product Filtering, "Other" Subtitle, and Global `CloseButton`
- **Backend Changes:**
  - **`backend/features/products/products_router.py`:**
    - Add `category: Optional[str] = Query(None)` to `list_products`.
    - Pass `category` into `service.list_products(pagination, q=q, category=category, user_id=user_id)`.
  - **`backend/features/products/products_service.py`:**
    - Update `list_products` to accept `category` and forward to repository.
  - **`backend/features/products/products_repository.py`:**
    - In `list_all` and `count`, implement category filter logic:
      - If `category in ['cleanser', 'toner', 'serum', 'moisturizer', 'sunscreen']`:
        `query = query.eq("category", category)`
      - If `category == 'other'`:
        Filter where category is `'other'` or not in the 5 main categories:
        `query = query.or_("category.eq.other,category.is.null")` (or matching non-standard categories).
      - If `category in [None, '', 'all']`: No category filter applied.
- **Frontend Changes:**
  - **Global Reusable Component `CloseButton.tsx`:**
    - Path: `frontend/src/shared/components/CloseButton.tsx`
    - Props: `onPress: () => void`, `className?: string`, `iconSize?: number`, `iconColor?: string`, `accessibilityLabel?: string`.
    - Design: `h-10 w-10 rounded-full bg-white/20 items-center justify-center active:opacity-70`. Uses `theme.colors.card` (white) or custom tint, with subtle circular translucency just like Favorites modal header.
    - Export from `frontend/src/shared/components/index.ts`.
  - **`ProductDetailPage.tsx`:**
    - Remove the white `SafeAreaView` header bar (`"Product Details"`).
    - Position floating `<CloseButton>` at top-right over the packaging illustration hero:
      `<View className="absolute top-4 right-5 z-20"><CloseButton onPress={handleClose} /></View>`.
    - In Row 4 (Category badge): If `product.category === 'other'` and `product.type` exists:
      Render `product.type` formatted with spaces (no underscores) next to the badge in `text-body-sm font-sans text-muted`:
      ```tsx
      <View className="flex-row items-center gap-2.5 mt-3">
        <View className="rounded-badge bg-secondary px-4 py-1.5 shadow-xs">
          <Text className="text-body-sm font-sans-semibold text-neutral-white">
            {formatCategory(product.category)}
          </Text>
        </View>
        {product.category?.toLowerCase() === 'other' && product.type ? (
          <Text className="text-body-sm font-sans text-muted">
            {product.type.replace(/_/g, ' ')}
          </Text>
        ) : null}
      </View>
      ```

---

### Objective 5: Favorites Feature — Full Live Sync
- **Root Cause:**
  - `useIngredients.ts` persisted favorites to `@aureskin/ingredient-favorites/...` as string IDs.
  - `useProducts.ts` persisted favorites to `@aureskin/product-favorites/...` as string IDs.
  - `favorites_api.ts` was attempting to read full `FavoriteItem[]` objects from a separate key `@aureskin_favorites_${userId}`, which was never populated by the library cards or detail pages.
- **Files to Modify:**
  - `frontend/src/shared/storage/favoritesStorage.ts` (or centralized favorites service)
  - `frontend/src/features/favorites/model/favorites_api.ts`
  - `frontend/src/features/favorites/viewmodel/useFavorites.ts`
  - `frontend/src/features/library/viewmodel/useIngredients.ts`
  - `frontend/src/features/library/viewmodel/useProducts.ts`
- **Implementation:**
  1. Unify storage helpers so favoriting an ingredient or product:
     - Persists the ID into the respective list.
     - Persists a complete `FavoriteItem` entry (`{ type: 'ingredient' | 'product', id, ingredient/product, created_at }`).
  2. When `useFavorites` loads, it queries all favorited items (or resolves them from cached catalog / IDs) and updates counts and list tabs (`All`, `Products`, `Ingredients`).
  3. Toggling a favorite anywhere in the app immediately invalidates `['favorites']` React Query key, providing seamless live updates.

---

### Objective 6: Routine Page — Swapping with Recommended Candidates & Search
- **Backend Implementation:**
  - **`backend/features/routine/routine_router.py`:**
    - Expose `GET /routine/swap-candidates`:
      - Query params: `category: str`, `q: Optional[str] = None`.
      - Auth: `get_current_user`.
      - Calls `service.get_swap_candidates(user_id=user_id, category=category, search_query=q)`.
    - Expose `PUT /routine/steps/{step_id}`:
      - Body: `RoutineStepUpdateRequest` (`product_id: Optional[str]`).
      - Calls `service.update_step_product(user_id=user_id, step_id=step_id, product_id=body.product_id)`.
  - **`backend/features/routine/routine_service.py`:**
    - `get_swap_candidates`:
      - Retrieves candidate products from repository for the given `category`.
      - Retrieves user's active skin analysis (skin type and detected conditions).
      - Runs `_score_products(...)` (+3.0 skin type match, +1.5 condition match).
      - Sorts descending by score. Items with score > 0 flagged as `is_recommended: true`.
      - If `q` is provided, filters across the category's products so users can search *any* product of that type.
  - **`backend/features/routine/routine_repository.py`:**
    - Add `update_step_product(step_id: str, product_id: Optional[str])`.
    - Add `get_products_by_category(category: str, search_query: Optional[str] = None)`.
- **Frontend Implementation:**
  - **`routine_api.ts`:**
    - Fix `fetchProductOptions` parsing: inspect `response.data?.data` (standard array wrapper) instead of looking for `.items`.
    - Add `fetchSwapCandidates({ category, query })`.
    - Wire `updateRoutineStep(stepId, { product_id })` to `PUT /routine/steps/{id}`.
  - **`PopUpSwapProductPanel.tsx`:**
    - Display ranked recommended products at the top with `"Recommended for your skin"` pill/badge.
    - Enable full-category search in the search bar.

---

### Objective 7: Library Page — Borderless Empty State Containers
- **Files to Modify:**
  - `frontend/src/features/library/view/containers/s1_IngredientsTab.tsx`
  - `frontend/src/features/library/view/containers/s2_ProductsTab.tsx`
- **Implementation:**
  - In `s1_IngredientsTab.tsx`:
    - In `listEmptyComponent`, remove `rounded-card bg-background` outline styling.
    - Change container to clean borderless `<View className="mx-5 mt-12 items-center py-6">`.
  - In `s2_ProductsTab.tsx`:
    - In `emptyComponent`, remove `border border-border bg-card rounded-card` styling.
    - Change container to `<View className="mx-5 mt-12 items-center py-6">` with muted text and icon, removing outer box borders.

---

### Objective 8: "Start a Skin Scan" Buttons — Trigger Overlay
- **Problem:** When scan data does not exist yet (Routine, History, Home), clicking "Start a skin scan" / "Start first scan" currently executes `router.push('/(tabs)/scan')`. Since `/(tabs)/scan.tsx` is a redirect fallback to `/(tabs)`, it bounces the user back to the Home page without opening the scan options.
- **Files to Modify:**
  - `frontend/src/features/routine/view/RoutinePage.tsx`
  - `frontend/src/features/routine/view/containers/s1_EmptyRoutine.tsx`
  - `frontend/src/features/history/view/HistoryPage.tsx`
  - `frontend/src/features/home/view/components/AnalysisSummaryCard.tsx`
  - `frontend/src/features/home/view/containers/s1_LatestAnalysis.tsx`
  - `frontend/src/app/(tabs)/scan.tsx`
- **Implementation:**
  1. Replace `router.push('/(tabs)/scan')` in all Empty/CTA buttons with:
     `useAppStore.getState().openScanOverlay()`
  2. In `frontend/src/app/(tabs)/scan.tsx`, invoke `useAppStore.getState().openScanOverlay()` on mount before redirecting, guaranteeing the overlay opens even if routed directly.

---

### Objective 9: Home Page Visual Redesign
#### 9.1 `SkinTestGuideTip.tsx`
- Expand `"STEPS BEFORE FACE SCAN"` CTA button to full width:
  - Replace `self-start` with `w-full items-center justify-center py-2.5 px-3 rounded-button bg-secondary shadow-xs`.
  - Fix any mismatched tags or duplicate container wrappers.

#### 9.2 `TodaysRoutineCard.tsx` (New Component)
- **Path:** `frontend/src/features/home/view/components/TodaysRoutineCard.tsx`
- **Props:**
  - `type`: `'morning' | 'night'`
  - `steps`: `RoutineStep[]`
  - `onPress?: () => void`
- **Styles & Design:**
  - Outer card: `rounded-card overflow-hidden bg-card border border-border shadow-xs mb-3`
  - Header Banner:
    - **Morning Routine:** `bg-neutral-beige` (beige token), title in `text-h3 font-sans-bold text-text`, filled amber `Sun` icon (`size={22}`, `color="#F59E0B"`, `fill="#F59E0B"`). Subtitle removed.
    - **Night Routine:** `bg-secondary-dark` (`#B8895A`), title in `text-h3 font-sans-bold text-neutral-white`, filled `MoonStar` icon (`size={22}`, `color="#0055D4"`, `fill="#0055D4"`). Subtitle removed.
  - Body List:
    - Clean compact vertical list:
      ```tsx
      <View className="px-4 py-3 gap-2">
        {steps.map((step, index) => (
          <Text key={step.id ?? index} numberOfLines={1} className="text-body-sm font-sans text-text">
            <Text className="font-sans-bold">{index + 1}. {step.category ?? step.step_name}</Text>
            {' • '}
            <Text className="text-muted">{step.product?.name ?? step.description ?? 'Recommended Product'}</Text>
          </Text>
        ))}
      </View>
      ```
- Integrate into `s2_TodayRoutine.tsx`.

#### 9.3 `AnalysisSummaryCard.tsx` (Matching Image 3)
- **Layout & Proportions:**
  - Left column: Flex ratio `flex-[2.2]` or `flex-[2.5]` to give room for 3+ conditions.
  - Top Row:
    - **Skin Type Box (`flex-1`):** `bg-secondary rounded-card p-3 justify-between`. Label: `text-caption font-sans-semibold text-text` ("Skin Type:"). Value: `text-h2 font-sans-bold text-neutral-white capitalize` ("Dry").
    - **Skin Conditions Box (`flex-[1.5]` or `flex-[1.6]`):** `bg-neutral-beige rounded-card p-3 justify-start`.
      Label: `text-caption font-sans-semibold text-text mb-1.5` ("Skin Condition/s:").
      List items rendered with a small red bullet dot (`h-2 w-2 rounded-full bg-concern mt-1.5 mr-2 shrink-0`) and condition name in `text-body-sm font-sans-bold text-concern`:
      - • `Redness`
      - • `Enlarged Pores`
      - • `Inflammatory Acne`
  - Bottom Row:
    - White full-width card pill: `bg-card rounded-button px-4 py-2.5 flex-row items-center justify-between border border-border shadow-xs mt-2`.
    - Left: `text-body-sm font-sans-bold text-text` ("Date Scanned:").
    - Right: `text-body-sm font-sans text-text` ("May 1, 2026").
  - Right Column (Health Gauge):
    - White card container: `w-[114px] bg-card rounded-card items-center justify-center p-2 border border-border shadow-xs`.
    - Render compact `HealthGauge` (`size={94}` or `98}`) with vibrant green ring, `89%` bold green value, and `HEALTHY` green uppercase subtext.

---

## 3. Complete File Modification & Creation Matrix

| Action | File Path | Purpose |
|---|---|---|
| **CREATE** | `frontend/src/shared/components/CloseButton.tsx` | Global reusable floating circular translucent close button for right-hand dismissals. |
| **UPDATE** | `frontend/src/shared/components/index.ts` | Export `CloseButton`. |
| **UPDATE** | `frontend/src/shared/components/IngredientCard.tsx` | Remove Reanimated `FadeIn` outline glitch wrapper; clean card styling. |
| **UPDATE** | `frontend/src/features/library/view/components/ProductListSkeleton.tsx` | Remove nested `px-5`; match exact `ProductCard` height, border, and layout. |
| **UPDATE** | `frontend/src/features/library/model/library_api.ts` | Sanitize description (strip class boilerplate), map benefits, skin types, conditions, avoid items. |
| **UPDATE** | `frontend/src/shared/components/IngredientDetailPage.tsx` | Add "Compatible Skin Types" & "Target Skin Conditions" cards; add 7 dermatological caution containers. |
| **UPDATE** | `frontend/src/shared/components/ProductDetailPage.tsx` | Floating `CloseButton`; display formatted type next to "other" badge; remove white header. |
| **UPDATE** | `backend/features/products/products_router.py` | Add `category` query param to `list_products`. |
| **UPDATE** | `backend/features/products/products_service.py` | Forward `category` query param. |
| **UPDATE** | `backend/features/products/products_repository.py` | Filter by `category` (`cleanser`, `toner`, `serum`, `moisturizer`, `sunscreen`, `other`, `all`). |
| **UPDATE** | `frontend/src/features/favorites/model/favorites_api.ts` | Unify live storage key & full `FavoriteItem` serialization. |
| **UPDATE** | `frontend/src/features/favorites/viewmodel/useFavorites.ts` | Live synchronization with library toggles. |
| **UPDATE** | `frontend/src/features/library/viewmodel/useIngredients.ts` | Sync favorite toggle with unified favorites store. |
| **UPDATE** | `frontend/src/features/library/viewmodel/useProducts.ts` | Sync favorite toggle with unified favorites store. |
| **UPDATE** | `backend/features/routine/routine_router.py` | Add `GET /routine/swap-candidates` & `PUT /routine/steps/{id}`. |
| **UPDATE** | `backend/features/routine/routine_service.py` | Add `get_swap_candidates` (attribute scoring) & `update_step_product`. |
| **UPDATE** | `backend/features/routine/routine_repository.py` | Add `update_step_product` & category querying. |
| **UPDATE** | `frontend/src/features/routine/model/routine_api.ts` | Wire live swap candidates & step updating. |
| **UPDATE** | `frontend/src/features/routine/view/components/PopUpSwapProductPanel.tsx` | Show ranked recommended products with badges & full category search. |
| **UPDATE** | `frontend/src/features/library/view/containers/s1_IngredientsTab.tsx` | Remove container border/outline from empty state. |
| **UPDATE** | `frontend/src/features/library/view/containers/s2_ProductsTab.tsx` | Remove container border/outline from empty state. |
| **UPDATE** | `frontend/src/features/routine/view/RoutinePage.tsx` | Route "Start scan" to `openScanOverlay()`. |
| **UPDATE** | `frontend/src/features/history/view/HistoryPage.tsx` | Route "Start scan" to `openScanOverlay()`. |
| **UPDATE** | `frontend/src/app/(tabs)/scan.tsx` | Route direct visit to `openScanOverlay()`. |
| **UPDATE** | `frontend/src/features/home/view/components/SkinTestGuideTip.tsx` | Expand "STEPS BEFORE FACE SCAN" button to full width. |
| **CREATE** | `frontend/src/features/home/view/components/TodaysRoutineCard.tsx` | Style 1 Morning (beige header + Sun), Style 2 Night (secondary-dark + MoonStar); compact 1-line steps. |
| **UPDATE** | `frontend/src/features/home/view/containers/s2_TodayRoutine.tsx` | Integrate `TodaysRoutineCard`. |
| **UPDATE** | `frontend/src/features/home/view/components/AnalysisSummaryCard.tsx` | Match Reference Image 3 (red dots, text-concern, expanded condition box, compact gauge). |

---

## 4. Verification & Testing Plan

1. **Ingredient Card Outline:** Open Ingredients tab. Confirm cards render immediately with no black outline or flashing borders on initial load.
2. **Ingredient Detail:** Open multiple ingredients (including Amino Acids, Prebiotics, etc.). Confirm description shows only 1 clean paragraph; "What is it good for" displays true benefits; "Compatible Skin Types" (green dots) and "Target Skin Conditions" (red dots) render correctly; "Who Should Avoid" displays red bullet items and warning callout boxes with hardcoded caution text for matching triggers.
3. **Product Skeleton:** Switch to Products tab. Confirm loading skeleton matches the exact width, padding, and height of `ProductCard`.
4. **Product Filters & Details:** Filter by Cleanser, Toner, Serum, Moisturizer, Sunscreen, Other, All. Confirm backend returns only matching products. Open an "other" category product; verify formatted type is shown on the right of the badge. Confirm white header is replaced with floating circular `CloseButton`.
5. **Favorites Sync:** Favorite an ingredient and a product from cards and detail sheets. Open Favorites page. Verify both appear immediately under All, Ingredients, and Products tabs.
6. **Routine Product Swap:** Open routine page, enter step swap modal. Verify top-ranked compatible products are highlighted, and typing in search bar searches all products of that category. Select a product; verify step is updated via `PUT /routine/steps/{id}`.
7. **Empty States:** Clear search or filter by non-matching query in Ingredients and Products tabs. Verify empty message renders cleanly with no card container border or outline.
8. **Start Scan Overlay:** From empty routine, empty history, or home screen, tap "Start first scan" / "Start a skin scan". Verify the scan overlay pops up smoothly with "Take a photo" and "Upload a photo".
9. **Home Screen Visuals:**
   - Verify `SkinTestGuideTip` CTA button is full width.
   - Verify `TodaysRoutineCard` renders with beige header for Morning, secondary-dark for Night, and steps in compact format `"product type" • "product name"`.
   - Verify `AnalysisSummaryCard` matches Image 3 layout and proportions.

