# Implementation Plan — Add Product Form Page Redesign

This implementation plan outlines the architecture, components, design tokens, and user flow modifications for the **Add Product Form Page** in AureSkin, strictly complying with [`frontend-rules.md`](file:///c:/Users/Thea/Documents/DLSUD/AureSkin/.agents/rules/frontend-rules.md) and AureSkin MVVM architecture.

---

## 1. Objectives & Scope

1. **Reusable Local `EditCard` Component:**
   - Create [`EditCard.tsx`](file:///c:/Users/Thea/Documents/DLSUD/AureSkin/frontend/src/features/library/view/components/EditCard.tsx) in `src/features/library/view/components/`.
   - Entire container is pressable/interactive (tapping anywhere activates input or selection, not just the pencil/plus button).
   - Card labels styled in `text-muted` (`text-caption font-sans-medium text-muted uppercase tracking-wider`).
   - Generous container padding (`p-4`) so contents are never pressed against the border.
   - Same horizontal margin/gap as library lists (`px-5` / max width 430px container).
   - 6 specialized styles:
     - **`style="product-name"`**: Clean editable text input with title & pencil indicator.
     - **`style="category"`**: Dropdown modal/sheet selection for the 6 canonical categories (`Cleanser`, `Toner`, `Moisturizer`, `Sunscreen`, `Serum / Treatment`, `Other`).
     - **`style="ingredients"`**: Tags list with larger font (`text-body-sm`), plus an auto-suggest input that queries database ingredients as the user types; enforces valid database ingredients only with **no duplicates**.
     - **`style="description"`**: Expandable multiline text input that remains expanded when not empty and dismisses keyboard/cursor on outside tap or enter.
     - **`style="skin-types"`**: Multi-select tags with database skin types (`Normal`, `Oily`, `Dry`, `Combination`, `Sensitive`, `Acne-Prone`), preventing duplicates.
     - **`style="skin-conditions"`**: Multi-select tags with database skin conditions (`Dark Spots`, `Acne`, `Blackheads`, `Whiteheads`, `Large Pores`, `Redness`, `Wrinkles`, `Pigmentation`), preventing duplicates.
   - Ordered layout with vertical gap separating `product-name` from the remaining 5 cards:
     `[product-name]` ➔ `[gap]` ➔ `[description]` ➔ `[category]` ➔ `[ingredients]` ➔ `[skin-types]` ➔ `[skin-conditions]`.

2. **Redirect to Products Tab on Exit & Success:**
   - Add tab-routing query param support in [`LibraryPage.tsx`](file:///c:/Users/Thea/Documents/DLSUD/AureSkin/frontend/src/features/library/view/LibraryPage.tsx) (`tab=products`).
   - In [`useAddProduct.ts`](file:///c:/Users/Thea/Documents/DLSUD/AureSkin/frontend/src/features/library/viewmodel/useAddProduct.ts), ensure `cancel`, `discard`, and `submit` success all navigate to `/(tabs)/library?tab=products`.

3. **Global Shared `DeleteDialog` + Local `DiscardProductDialog`:**
   - **`src/shared/components/DeleteDialog.tsx`**: Universal dialog component matching Reference Image 1 with:
     - Red/pink alert container (`bg-note-negative border-note-negative-border`) with `AlertTriangle` icon (`theme.colors.note.negative.icon`).
     - Close `X` icon button in top-right corner.
     - Title (`text-h3 font-sans-bold text-text`).
     - Body text with bold emphasis segments (e.g., "Are you sure you want to **cancel adding this product**?").
     - Dual buttons: "Keep Editing" / "Keep Product" (white bordered card) & "Discard Product" (red `bg-status-error`).
   - **`src/features/library/view/components/DiscardProductDialog.tsx`**: Local component encapsulating `DeleteDialog` with default copy and callbacks.

4. **Modernized Success Dialog (`ProductAddedConfirmation.tsx`):**
   - Replace old dark screen confirmation with a clean, branded modal card:
     - White rounded card (`rounded-card bg-card p-6 shadow-xl`).
     - Soft green icon container (`bg-note-positive border-note-positive-border`) with `CheckCircle2` icon.
     - Title: "Product Added Successfully" (`text-h3 font-sans-bold text-text`).
     - Subtitle: "Your product has been added to the library catalog." (`text-body-sm font-sans text-muted`).
     - CTA button: "View Products" (`rounded-button bg-secondary text-neutral-white`) that redirects directly to Products Tab.

---

## 2. Architecture & File Structure

```
frontend/src/
├── shared/
│   └── components/
│       ├── DeleteDialog.tsx          ← [NEW] Universal delete/discard dialog (Image 1 reference)
│       └── index.ts                  ← Export DeleteDialog & DeleteDialogProps
│
├── features/library/
│   ├── model/
│   │   ├── library_types.ts          ← Update AddProductDraft & Product interfaces
│   │   ├── library_api.ts            ← Update addMockProduct to store category, skinTypes, skinConditions
│   │   └── library_mock.ts           ← Add reference lists for skin types & conditions
│   │
│   ├── viewmodel/
│   │   └── useAddProduct.ts          ← Form state for all 6 fields, validation, suggestions, tab redirect
│   │
│   └── view/
│       ├── AddProductPage.tsx        ← Updated form layout (Product Name -> gap -> 5 cards)
│       ├── LibraryPage.tsx           ← Support tab query param (?tab=products)
│       └── components/
│           ├── EditCard.tsx                  ← [NEW] Reusable card container supporting 6 named styles
│           ├── DiscardProductDialog.tsx      ← [NEW] Local wrapper for DeleteDialog
│           └── ProductAddedConfirmation.tsx  ← [REDESIGNED] Modern success modal card
```

---

## 3. Detailed Component Specifications

### 3.1 Global Component: `DeleteDialog` (`src/shared/components/DeleteDialog.tsx`)
Follows Reference Image 1 exactly:
- **Backdrop:** Decoupled `Animated.View` fading in/out (`FadeIn.duration(150)`, `FadeOut.duration(120)`).
- **Dialog Box:** `rounded-card bg-card p-6 shadow-xl w-full max-w-[360px] mx-5`.
- **Top Row:**
  - Icon Badge: `w-12 h-12 rounded-card bg-note-negative border border-note-negative-border items-center justify-center`.
  - Icon: `AlertTriangle` (`size={24}`, `color={theme.colors.note.negative.icon}`).
  - Title: `text-h3 font-sans-bold text-text ml-3 flex-1`.
  - Close Button: `X` icon button (`size={18}`, `color={theme.colors.text}`) at the top-right corner.
- **Message:** `text-body font-sans text-text mt-4 mb-6 leading-6`. Supports highlighted/bold segment via `boldPhrase` prop or `ReactNode`.
- **Buttons Row:**
  - `Pressable` Cancel: `flex-1 rounded-button border border-border bg-card py-3 items-center mr-2 active:opacity-70`. Text: `text-body-sm font-sans-semibold text-text`.
  - `Pressable` Confirm: `flex-1 rounded-button bg-status-error py-3 items-center ml-2 active:opacity-80`. Text: `text-body-sm font-sans-semibold text-neutral-white`.

### 3.2 Local Component: `DiscardProductDialog` (`src/features/library/view/components/DiscardProductDialog.tsx`)
- Props: `{ visible: boolean; onKeepEditing: () => void; onDiscard: () => void; }`
- Wraps `DeleteDialog` with:
  - `title="Discard Product Details"`
  - `body="Are you sure you want to cancel adding this product?"` with `"cancel adding this product"` bolded.
  - `cancelLabel="Keep Product"` (or `"Keep Editing"`)
  - `confirmLabel="Discard Product"`

### 3.3 Reusable Local Component: `EditCard` (`src/features/library/view/components/EditCard.tsx`)
Props:
```typescript
export type EditCardStyle =
  | 'product-name'
  | 'description'
  | 'category'
  | 'ingredients'
  | 'skin-types'
  | 'skin-conditions';

export interface EditCardProps {
  style: EditCardStyle;
  label: string;
  value?: string;
  items?: string[];
  placeholder?: string;
  onChangeText?: (text: string) => void;
  onAddItem?: (item: string) => void;
  onRemoveItem?: (item: string) => void;
  selectedCategory?: ProductCategory;
  onSelectCategory?: (category: ProductCategory) => void;
  options?: string[]; // Allowed options for auto-suggest/dropdown
}
```

#### Behavior & Features for each Style:
1. **`style="product-name"`:**
   - Tap anywhere on card activates `TextInput`.
   - Right pencil icon indicator (`Pencil` size 16, `color={theme.colors.muted}`).
   - Text input in `text-body font-sans-semibold text-text`.
2. **`style="description"`:**
   - Tap anywhere on card focuses multiline `TextInput`.
   - Clicking outside or pressing return on keyboard dismisses cursor.
   - Text field never collapses if it contains text.
3. **`style="category"`:**
   - Shows currently selected category with canonical badge (`bg-secondary px-3.5 py-1 rounded-badge text-neutral-white font-sans-medium`).
   - Tapping card opens a modal/sheet showing the 6 canonical categories with instant selection.
4. **`style="ingredients"`:**
   - Displays added ingredients with larger text size (`text-body-sm font-sans text-text` with `X` button).
   - "Add ingredient" input field. As user types, displays a floating/scrollable list of matching ingredients filtered from database.
   - Tapping an item adds it.
   - Prevents duplicates and rejects ingredients not present in the master list.
5. **`style="skin-types"`:**
   - Chips container for selected skin types: `Normal`, `Oily`, `Dry`, `Combination`, `Sensitive`, `Acne-Prone`.
   - Tap-to-add dropdown chip list showing available (unselected) skin types.
   - Tapping a chip immediately adds it. Tapping `X` on a selected chip removes it.
6. **`style="skin-conditions"`:**
   - Chips container for selected skin conditions: `Dark Spots`, `Acne`, `Blackheads`, `Whiteheads`, `Large Pores`, `Redness`, `Wrinkles`, `Pigmentation`.
   - Tap-to-add dropdown chip list showing available (unselected) conditions.
   - Prevents duplicates and rejects unknown values.

### 3.4 Modernized Success Modal: `ProductAddedConfirmation.tsx`
- Replaces raw circle overlay with an AureSkin card dialog:
  - Top: Green badge `h-12 w-12 rounded-card bg-note-positive border border-note-positive-border items-center justify-center mb-3`.
  - Icon: `CheckCircle2` (`size={26}`, `color={theme.colors.note.positive.icon}`).
  - Title: "Product Added Successfully!" (`text-h3 font-sans-bold text-text text-center`).
  - Subtitle: "The demo product has been added to your catalog." (`text-body-sm font-sans text-muted text-center mb-5`).
  - Button: "View Products" (`rounded-button bg-secondary py-3 items-center w-full active:opacity-80`).
  - Automatically redirects to Products Tab when dismissed or button pressed.

### 3.5 Hook & ViewModel Updates: `useAddProduct.ts`
- Update `AddProductDraft`:
  ```typescript
  export interface AddProductDraft {
    name: string;
    description: string;
    category: ProductCategory;
    ingredients: string[];
    skinTypes: string[];
    skinConditions: string[];
  }
  ```
- Add actions:
  - `setCategory(category: ProductCategory)`
  - `addIngredient(name: string)` (validates against master list and deduplicates)
  - `removeIngredient(name: string)`
  - `addSkinType(type: string)` (validates and deduplicates)
  - `removeSkinType(type: string)`
  - `addSkinCondition(condition: string)` (validates and deduplicates)
  - `removeSkinCondition(condition: string)`
- Redirection:
  - `returnToLibrary`: uses `router.replace('/(tabs)/library?tab=products')`.
- Discard Dialog State:
  - `isDiscardVisible`: boolean.
  - `promptDiscard()`: opens custom `DiscardProductDialog` if form is dirty; otherwise returns to library immediately.

---

## 4. Design Tokens & Styling Verification

| Element | Presets Used | Token / Value |
|---|---|---|
| Card Containers | `rounded-card`, `bg-card`, `border-border` | 16px radius, #FFFFFF, #E8E0D8 |
| Dialog Buttons | `rounded-button`, `bg-status-error`, `bg-card` | 12px radius, red destructive / white cancel |
| Primary CTA Button | `rounded-button`, `bg-secondary` | 12px radius, #D4A574 warm terracotta |
| Badge Chips | `rounded-badge`, `bg-secondary/15`, `text-secondary` | 20px pill radius |
| Alert Icon Container | `rounded-card`, `bg-note-negative`, `border-note-negative-border` | 16px radius, #FDECEA / #FFCDD2 |
| Success Icon Container | `rounded-card`, `bg-note-positive`, `border-note-positive-border` | 16px radius, #EBF5EA / #C8E6C9 |
| Headings | `text-h3 font-sans-bold text-text` | 18px / 26px, Inter 700 Bold, #2D2D2D |
| Field Labels | `text-caption font-sans-medium text-muted` | 12px / 16px, Inter 500 Medium, #8A8A8A |
| Body Text | `text-body-sm font-sans text-text` | 14px / 20px, Inter 400 Regular, #2D2D2D |

---

## 5. Implementation Steps

1. **Step 1: Create Global `DeleteDialog` Component**
   - File: `src/shared/components/DeleteDialog.tsx`.
   - Export from `src/shared/components/index.ts`.
2. **Step 2: Create Local `DiscardProductDialog` Component**
   - File: `src/features/library/view/components/DiscardProductDialog.tsx`.
3. **Step 3: Create Reusable `EditCard` Component with 6 Named Styles**
   - File: `src/features/library/view/components/EditCard.tsx`.
   - Implement styles: `product-name`, `description`, `category`, `ingredients`, `skin-types`, `skin-conditions`.
4. **Step 4: Redesign `ProductAddedConfirmation` Component**
   - File: `src/features/library/view/components/ProductAddedConfirmation.tsx`.
5. **Step 5: Update `useAddProduct.ts` and `library_api.ts`**
   - Add new draft fields (`category`, `skinTypes`, `skinConditions`), validation, deduplication, and `router.replace('/(tabs)/library?tab=products')`.
6. **Step 6: Update `LibraryPage.tsx` Tab Navigation**
   - Handle `tab=products` query parameter on mount and route changes.
7. **Step 7: Reassemble `AddProductPage.tsx`**
   - Replace old inline cards with the 6 `EditCard` instances organized in the specified order with the separating gap.
   - Wire `DiscardProductDialog` and `ProductAddedConfirmation`.
8. **Step 8: Verification & Typecheck**
   - Run `npx tsc --noEmit` to verify type safety.
