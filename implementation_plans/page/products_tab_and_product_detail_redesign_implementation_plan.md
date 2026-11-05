# Library Products Tab & Product Detail Page Redesign Implementation Plan

> **Feature:** Library (Products Tab & Product Detail Page)  
> **Status:** Draft / Pending Review (Updated with Global SearchBar)  
> **Target Date:** 2026-11-02  
> **Architecture:** MVVM Pattern, NativeWind Token Presets, Reanimated Animations  

---

## 1. Overview & Objectives

This implementation plan refactors the **Products Tab** and **Product Detail Page** within the AureSkin Library feature according to user specifications, visual reference [image 1](file:///C:/Users/Thea/.gemini/antigravity-ide/brain/9d0e519a-f15d-404d-ab15-b21a61310524/.user_uploaded/media_1793554718125.png), and strict design tokens from `tailwind.config.js` and `frontend-rules.md`.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                              KEY OBJECTIVES                                  │
├──────────────────────────────────────────────────────────────────────────────┤
│ 1. Global SearchBar: Create reusable SearchBar in src/shared/components/    │
│    supporting Style 1 (simple) and Style 2 (with embedded filter pill).     │
│    Remove redundant dropdowns and arrows from Products Tab.                  │
│ 2. Smooth Category Filter Sheet: Decouple dim backdrop fade from bottom     │
│    sheet slide-up. Instant tap-to-filter (no Reset/Apply buttons). Secondary │
│    brown accent for selected option.                                         │
│ 3. Category Illustration Assets: Map all products to predefined category     │
│    illustrations (Cleanser, Toner, Serum & Treatment, Moisturizer, etc.).    │
│ 4. Product Detail Page Restructure: 4-row header, bigger category badge,     │
│    hero category image, and DescriptionCard adoption.                        │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Visual Reference Analysis

### Reference: Target Search Bar Layout (Style 2)
- **Container:** Rounded pill container (`rounded-full border border-border bg-card px-4`).
- **Left:** Search icon (`Search`, `size={20}`, color active `theme.colors.primary` / inactive `theme.colors.muted`).
- **Center:** Text input (`flex-1`, `text-body-sm font-sans text-text`).
- **Right:** Filter pill button embedded inside the text field:
  - Background: Soft warm beige `bg-secondary/20` (matching original dropdown tint).
  - Border: None or subtle `border-border/30`.
  - Shape: `rounded-full px-3 py-1`.
  - Label: Current category label (e.g., `"All"`, `"Cleansers"`), `text-caption font-sans-medium text-text`.
  - Icon: **No arrow down icon** (as it triggers a slide-up sheet, not an inline dropdown).

---

## 3. Design System & Token Compliance

All changes strictly adhere to `frontend/tailwind.config.js` and `frontend/src/shared/theme/index.ts`:

| UI Element | Tailwind Utility Classes / Theme Tokens | Purpose / Context |
|---|---|---|
| **Search Bar Container** | `rounded-full border border-border bg-card` | Consistent outer pill search container |
| **Search Filter Button (Style 2)** | `rounded-full bg-secondary/20 px-3 py-1` | Embedded pill inside search field |
| **Search Filter Text** | `text-caption font-sans-medium text-text` | Filter pill category text |
| **Backdrop Dim** | `bg-black/40` with Reanimated `FadeIn` / `FadeOut` | Instant non-sliding dim background |
| **Sheet Container** | `rounded-t-card bg-card px-5 pb-8 pt-5` with `SlideInDown` | Smooth bottom sheet slide-up |
| **Selected Category Option** | `border-secondary bg-secondary/15 text-secondary-dark font-sans-bold` | Selected category row in filter sheet |
| **Unselected Category Option**| `border-border bg-card text-text font-sans` | Unselected category row |
| **Product Detail Label** | `text-body-sm font-sans-medium text-muted` | Row 1 "Product" label |
| **Product Detail Title** | `text-h2 font-sans-bold text-text` | Row 2 full product name |
| **Product Detail Brand** | `text-body-sm font-sans text-muted` | Row 3 brand name |
| **Product Detail Category Badge** | `rounded-badge bg-secondary px-4 py-1.5 text-body-sm font-sans-semibold text-neutral-white` | Row 4 enlarged category badge |

---

## 4. Architectural & Component Breakdown

```mermaid
graph TD
  A[LibraryPage.tsx] --> B[S1IngredientsTab.tsx]
  A --> C[S2ProductsTab.tsx]
  SharedComponents["src/shared/components/"] --> D[SearchBar.tsx (Style 1 & 2)]
  B --> D
  C --> D
  C --> F[ProductFilterSheet.tsx]
  C --> G[ProductListItem.tsx]
  C --> H[ProductDetailPage.tsx]
  G --> I[productCategoryAssets.ts]
  H --> I
  H --> J[DescriptionCard.tsx]
  H --> K[Star Favorite Button]
```

### 4.1. `SearchBar.tsx` (Global Shared Component)
- **Path:** `frontend/src/shared/components/SearchBar.tsx`
- **Replaces:** Local `frontend/src/features/library/view/components/SearchBar.tsx`
- **Exported from:** `frontend/src/shared/components/index.ts`
- **Specifications:**
  - Add `style?: 1 | 2` prop (default `1`).
  - **Style 1 (Simple):**
    - `[Search Icon] [TextInput] [Optional Clear X]`
    - Used by `S1IngredientsTab.tsx` and other screens requiring standard search.
  - **Style 2 (With Filter Pill):**
    - `[Search Icon] [TextInput] [Optional Clear X] [Filter Pill Button]`
    - Embedded filter pill on the right side inside the search input box:
      - Shows current label (`filterLabel || 'All'`).
      - Styled as `rounded-full bg-secondary/20 px-3 py-1`.
      - On tap: calls `onFilterPress()`.
      - Does not show chevron/arrow icon.
  - Component interface:
    ```typescript
    export interface SearchBarProps {
      style?: 1 | 2;
      value: string;
      onChangeText: (text: string) => void;
      placeholder?: string;
      filterLabel?: string;
      onFilterPress?: () => void;
      className?: string;
    }
    ```

### 4.2. `S1IngredientsTab.tsx` (Ingredients Tab Screen)
- **Path:** `frontend/src/features/library/view/containers/s1_IngredientsTab.tsx`
- **Updates:**
  - Import `SearchBar` from `@/shared/components`.
  - Pass `style={1}` (maintaining simple search appearance).

### 4.3. `S2ProductsTab.tsx` (Products Tab Screen)
- **Path:** `frontend/src/features/library/view/containers/s2_ProductsTab.tsx`
- **Updates:**
  - Import `SearchBar` from `@/shared/components`.
  - Replace the entire complex top search/dropdown header:
    - Remove the standalone search icon toggle button (`isSearchExpanded`).
    - Remove the dual-dropdown pill (`Category` and `Show`).
    - Pin `SearchBar style={2}` permanently at the top of the tab, exactly matching the clean layout of the Ingredients tab.
  - Pass `filterLabel={getCategoryLabel(selectedCategory)}` (e.g., `"All"`, `"Cleansers"`, `"Toners"`, `"Serums & Treatments"`, etc.).
  - Pass `onFilterPress={() => setIsFilterSheetVisible(true)}`.

### 4.4. `ProductFilterSheet.tsx` (Filter Bottom Sheet)
- **Path:** `frontend/src/features/library/view/components/ProductFilterSheet.tsx`
- **Updates:**
  1. **Animation Decoupling:**
     - Replace `<Modal animationType="slide">` with a transparent Modal (`animationType="none"`).
     - Use `react-native-reanimated`:
       - Background overlay: `<Animated.View entering={FadeIn.duration(150)} exiting={FadeOut.duration(120)} className="absolute inset-0 bg-black/40" />` (dim fades in immediately, does NOT slide up).
       - Sheet panel: `<Animated.View entering={SlideInDown.duration(260)} exiting={SlideOutDown.duration(200)} className="rounded-t-card bg-card px-5 pb-8 pt-5">` (slides up smoothly).
  2. **Instant Tap-to-Filter:**
     - Remove bottom action buttons ("Reset" and "Apply").
     - Tapping any option immediately applies the selection and dismisses the sheet:
       ```typescript
       const handleSelect = (category: ProductCategory | null) => {
         onApply(category, selectedListFilter);
         onClose();
       };
       ```
  3. **Category Options:**
     ```typescript
     const CATEGORY_OPTIONS: { label: string; value: ProductCategory | null }[] = [
       { label: 'All', value: null },
       { label: 'Cleansers', value: 'cleanser' },
       { label: 'Toners', value: 'toner' },
       { label: 'Moisturizers', value: 'moisturizer' },
       { label: 'Sunscreens', value: 'sunscreen' },
       { label: 'Serums & Treatments', value: 'serum' },
       { label: 'Other', value: 'other' },
     ];
     ```
  4. **Selected Category Color:**
     - Selected: `border-secondary bg-secondary/15 text-secondary-dark font-sans-bold`.
     - Unselected: `border-border bg-card text-text font-sans`.

### 4.5. `productCategoryAssets.ts` (Asset Mapping Utility)
- **Path:** `frontend/src/features/library/utils/productCategoryAssets.ts`
- **Mapping:**
  ```typescript
  export const PRODUCT_CATEGORY_IMAGES: Record<string, any> = {
    cleanser: require('../../../assets/images/library_cleanser.png'),
    toner: require('../../../assets/images/library_toner.png'),
    serum: require('../../../assets/images/library_serum&treatment.png'),
    'serum & treatment': require('../../../assets/images/library_serum&treatment.png'),
    moisturizer: require('../../../assets/images/library_moisturizer.png'),
    sunscreen: require('../../../assets/images/library_sunscreen.png'),
    other: require('../../../assets/images/library_others.png'),
  };

  export function getProductCategoryImage(category: string | null | undefined) {
    if (!category) return PRODUCT_CATEGORY_IMAGES.other;
    const key = category.toLowerCase().trim();
    return PRODUCT_CATEGORY_IMAGES[key] || PRODUCT_CATEGORY_IMAGES.other;
  }
  ```

### 4.6. `ProductListItem.tsx` (Products List Item)
- **Path:** `frontend/src/features/library/view/components/ProductListItem.tsx`
- **Updates:**
  - Display the corresponding category illustration via `getProductCategoryImage(product.category)`.
  - Maintain clean thumbnail container (`h-24 w-24 rounded-button bg-secondary/10 items-center justify-center p-2`).

### 4.7. `ProductDetailPage.tsx` (Product Detail Modal)
- **Path:** `frontend/src/features/library/view/components/ProductDetailPage.tsx`
- **Updates:**
  1. **Packaging Hero Image:**
     - Render `getProductCategoryImage(product.category)` with `contentFit="contain"`.
  2. **Header Layout Restructure (4 Rows):**
     - **Row 1:** `[Col 1: Text "Product" (text-body-sm font-sans-medium text-muted)]` and `[Col 2: Favorite Star Button]`.
     - **Row 2:** Product full name (`text-h2 font-sans-bold text-text`).
     - **Row 3:** Brand name (`text-body-sm font-sans text-muted`).
     - **Row 4:** Category Badge (`rounded-badge bg-secondary px-4 py-1.5 text-body-sm font-sans-semibold text-neutral-white`).
  3. **DescriptionCard Adoption:**
     - Replace inline ingredients box with `<DescriptionCard title="Ingredients" className="mx-5 mt-4">` containing pressable ingredient rows with droplet icons.
     - Replace inline good-for box with `<DescriptionCard title="Good For" variant="bulleted" bullets={product.good_for} bulletTone="positive" className="mx-5 mt-3" />`.

---

## 5. Step-by-Step Implementation Sequence

```
Step 1: Create Global SearchBar Component
        └── frontend/src/shared/components/SearchBar.tsx (Style 1 & 2 support)
        └── Export from frontend/src/shared/components/index.ts
        └── Update S1IngredientsTab.tsx to import from @/shared/components with style={1}

Step 2: Create Category Asset Helper
        └── frontend/src/features/library/utils/productCategoryAssets.ts

Step 3: Update Category Filter Sheet
        └── frontend/src/features/library/view/components/ProductFilterSheet.tsx
            ├── Decouple backdrop fade from sheet slide
            ├── Add 'Serums & Treatments' option
            ├── Apply secondary brown styling for selected option
            └── Remove Reset/Apply buttons; trigger instant selection

Step 4: Refactor Products Tab Screen
        └── frontend/src/features/library/view/containers/s2_ProductsTab.tsx
            ├── Replace dual dropdowns & search toggle with SearchBar style={2} from @/shared/components
            └── Connect filter sheet modal to SearchBar pill

Step 5: Update Product Card Thumbnail
        └── frontend/src/features/library/view/components/ProductListItem.tsx
            └── Use getProductCategoryImage

Step 6: Redesign Product Detail Page
        └── frontend/src/features/library/view/components/ProductDetailPage.tsx
            ├── 4-row header format (Product label, Name, Brand, Enlarged Category Badge)
            ├── Hero category packaging illustration
            └── Replace inline cards with DescriptionCard components

Step 7: Clean Up & TypeScript Verification
        └── Remove obsolete local SearchBar.tsx from library/view/components/ (or re-export)
        └── Run `npx tsc --noEmit`
        └── Validate interaction, filtering, and animation behavior in Expo
```

---

## 6. Review & Approval Request

Please review this updated implementation plan. Once approved, I will begin implementing the steps in exact sequence.
