# AureSkin — Ingredients Tab Redesign Implementation Plan

## 1. Overview & Reference Mapping

| Property | Value |
|---|---|
| **Target Feature** | Library Page — Ingredients Tab (`features/library/view/containers/s1_IngredientsTab.tsx`) |
| **Reference Images** | `image 1` (Current Ingredients Page), `image 2` (Target Sticky Alphabet Header + Target IngredientListItem) |
| **Design System** | `frontend/tailwind.config.js` & `frontend/src/shared/theme/index.ts` |
| **Architecture Pattern** | Strict MVVM with NativeWind tokens & React Query |

---

## 2. Key Objectives & Design Specification

### Objective 1: Consistent Side Margins & Gaps
- **Current Issue:** In `s1_IngredientsTab.tsx`, the search bar has `px-5` horizontal padding, but the ingredient rows stretch edge-to-edge across the screen with 0 horizontal margin.
- **Solution:** Apply `mx-5` to `IngredientListItem` cards (and section empty/error states) to align with the search bar's margins and provide consistent 20px gaps on the left and right.

### Objective 2: Sticky `AlphabetHeader` Component
- **Component File:** `frontend/src/features/library/view/components/AlphabetHeader.tsx`
- **Visual Design:**
  - Container color: `bg-secondary` (`#D4A574`)
  - Typography: `text-h3 font-sans-bold text-neutral-white` (`#FFFFFF`)
  - Dimensions & Spacing: Full width (`w-full`), `px-5 py-2`
- **Behavior:**
  - Groups ingredients into alphabetical sections (`A`, `B`, `C` ... `#`).
  - Utilizes React Native's `SectionList` with `stickySectionHeadersEnabled={true}`.
  - Sticky headers dock directly below the fixed `SearchBar` at the top of the scroll viewport.
  - When scrolling, the current letter remains visible at the top until pushed off by the next letter.

### Objective 3: Permanently Pinned `SearchBar` Component
- **Component File:** `frontend/src/features/library/view/components/SearchBar.tsx`
- **Visual Design:**
  - Container: `bg-card` (`#FFFFFF`) with top rounded corners only (`rounded-t-card`).
  - Inner Outline: `flex-row items-center rounded-full border border-border bg-card px-4 py-2.5 mx-5 my-3`, transitioning to `border-primary` on focus.
  - Elements: `Search` vector icon (`color={theme.colors.muted}`), text input with placeholder `"search ingredients"` (`text-body-sm font-sans text-text`), and clear button (X) when text is entered.
- **Behavior:**
  - Docked permanently above the `SectionList` in `s1_IngredientsTab.tsx`.
  - Does NOT scroll when the ingredients list scrolls. Remains fixed at the top of the white container sheet.

### Objective 4: Redesigned `IngredientListItem` with Preview Description & Favorites
- **Component File:** `frontend/src/features/library/view/components/IngredientListItem.tsx`
- **Visual Design:**
  - Background: Uniform `bg-card` (`#FFFFFF`) across all cards (eliminating the alternating off-white pattern).
  - Border & Shadow: `rounded-card border border-border shadow-sm mx-5 mb-3 px-5 py-4`.
  - Left Column:
    - Title: `text-h3 font-sans-bold text-text` (e.g., "Aloe Vera").
    - Preview Description: `text-body-sm font-sans text-muted mt-1 leading-5` (e.g., "A soothing plant extract that relieves irritation and locks in moisture.").
  - Right Column:
    - Favorite Star Button: `Pressable` with `hitSlop={8}`.
    - Icon: `Star` from `lucide-react-native` (20px).
    - Unfavorited: `color={theme.colors.text}`, `fill="transparent"`.
    - Favorited: `color={theme.colors.secondary}`, `fill={theme.colors.secondary}`.
    - Interaction: Tapping the star toggles favorite state without navigating into the ingredient detail modal.
- **Data Model:**
  - Sourced from the `preview_description` database column.
  - Synced with `@aureskin/ingredient-favorites/${userId}` via TanStack Query cache `['library', 'ingredient-favorites', userId]`, seamlessly sharing favorite state with `IngredientDetailPage`.

---

## 3. Complete File Tree of Changes

```
AureSkin/
├── backend/
│   └── features/ingredients/
│       └── ingredients_schemas.py                    ← Add preview_description to IngredientResponse
│
└── frontend/
    └── src/features/library/
        ├── model/
        │   ├── library_types.ts                      ← Add preview_description & IngredientSection types
        │   ├── library_api.ts                        ← Parse preview_description in normalizeIngredient
        │   └── library_mock.ts                       ← Add preview_description values to MOCK_INGREDIENTS
        │
        ├── viewmodel/
        │   └── useIngredients.ts                     ← Add sections grouping & favorite management
        │
        └── view/
            ├── components/
            │   ├── SearchBar.tsx                     ← [NEW] Pinned search bar with rounded-t-card
            │   ├── AlphabetHeader.tsx                ← [NEW] Sticky secondary header with white text
            │   └── IngredientListItem.tsx            ← [MODIFIED] Uniform card, preview text, favorite star
            │
            └── containers/
                └── s1_IngredientsTab.tsx             ← [MODIFIED] SectionList with sticky AlphabetHeader & pinned SearchBar
```

---

## 4. Layer-by-Layer Architectural Details

### 4.1 Data Models (`library_types.ts` & `ingredients_schemas.py`)

#### `library_types.ts`:
```typescript
export interface Ingredient {
  id: string;
  name: string;
  preview_description?: string | null;  // <-- NEW
  description: string | null;
  benefits: string | null;
  skin_types: string[];
  caution: string | null;
  what_is_it?: string | null;
  good_for?: string[];
  avoid?: string[];
}

export interface IngredientSection {
  title: string;        // e.g., "A", "B", "C"
  data: Ingredient[];
}
```

#### `backend/features/ingredients/ingredients_schemas.py`:
```python
class IngredientResponse(BaseModel):
    id: str
    name: str
    scientific_name: Optional[str] = None
    preview_description: Optional[str] = None  # <-- Added
    short_description: Optional[str] = None
    what_is_it: Optional[str] = None
    ...
```

### 4.2 API & Mock Layer (`library_api.ts` & `library_mock.ts`)

- **`library_api.ts`:**
  Update `normalizeIngredient(value)`:
  ```typescript
  preview_description: nullableString(value, 'preview_description'),
  ```
- **`library_mock.ts`:**
  Enrich `MOCK_INGREDIENTS` items with realistic `preview_description` strings matching the database values:
  - **Aloe Vera:** `"A soothing plant extract that relieves irritation and locks in moisture."`
  - **Niacinamide:** `"A versatile vitamin B3 that refines pores, balances oil, and calms redness."`
  - **Hyaluronic Acid:** `"A powerful humectant that draws moisture into the skin for deep hydration."`
  - **Ceramides:** `"Essential lipids that rebuild and strengthen the natural skin barrier."`
  - *(and all remaining mock ingredients sorted alphabetically).*

### 4.3 ViewModel Layer (`useIngredients.ts`)

Enhance `useIngredients` hook to return:
1. `sections: IngredientSection[]`: Groups items by their uppercase starting letter (`A`–`Z`).
2. `favoriteIds: string[]`: Loaded from `AsyncStorage` via TanStack Query key `['library', 'ingredient-favorites', userId ?? 'anonymous']`.
3. `isTogglingFavorite: boolean`: Mutation status indicator.
4. `actions.toggleFavorite: (ingredientId: string) => void`: Optimistically updates TanStack Query cache and persists to AsyncStorage.

```typescript
export interface UseIngredientsResult {
  ingredients: Ingredient[];
  sections: IngredientSection[];
  favoriteIds: string[];
  searchQuery: string;
  isLoading: boolean;
  isRefreshing: boolean;
  isFetchingNextPage: boolean;
  isFetchNextPageError: boolean;
  hasNextPage: boolean;
  error: string | null;
  actions: {
    setSearchQuery: (query: string) => void;
    toggleFavorite: (ingredientId: string) => void;
    refresh: () => Promise<void>;
    retry: () => Promise<void>;
    loadNextPage: () => void;
  };
}
```

### 4.4 View Layer

#### 1. `SearchBar.tsx` (`frontend/src/features/library/view/components/SearchBar.tsx`)
```tsx
interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}
```
- Outer View: `bg-card rounded-t-card pt-4 pb-2 px-5`
- Input Wrapper: `flex-row items-center rounded-full border border-border bg-card px-4 py-2.5`
- Icons: `Search` (20px, `theme.colors.muted`) on left, clear button (X) on right when text is present.

#### 2. `AlphabetHeader.tsx` (`frontend/src/features/library/view/components/AlphabetHeader.tsx`)
```tsx
interface AlphabetHeaderProps {
  letter: string;
}
```
- Container: `w-full bg-secondary px-5 py-1.5`
- Text: `text-h3 font-sans-bold text-neutral-white`

#### 3. `IngredientListItem.tsx` (`frontend/src/features/library/view/components/IngredientListItem.tsx`)
```tsx
interface IngredientListItemProps {
  ingredient: Ingredient;
  isFavorite: boolean;
  onPress: (id: string) => void;
  onFavoritePress: (id: string) => void;
}
```
- Container: `Pressable` with `className="mx-5 mb-3 rounded-card border border-border bg-card px-5 py-4 shadow-sm active:opacity-80 flex-row items-start justify-between"`
- Title: `Text className="text-h3 font-sans-bold text-text"`
- Preview: `Text className="text-body-sm font-sans text-muted mt-1 leading-5"`
- Star Button:
  ```tsx
  <Pressable
    accessibilityRole="button"
    accessibilityLabel={isFavorite ? `Remove ${ingredient.name} from favorites` : `Add ${ingredient.name} to favorites`}
    onPress={() => onFavoritePress(ingredient.id)}
    hitSlop={8}
    className="ml-3 p-1 active:opacity-70"
  >
    <Star
      size={20}
      color={isFavorite ? theme.colors.secondary : theme.colors.text}
      fill={isFavorite ? theme.colors.secondary : 'transparent'}
    />
  </Pressable>
  ```

#### 4. `s1_IngredientsTab.tsx` (`frontend/src/features/library/view/containers/s1_IngredientsTab.tsx`)
- Structure:
  ```tsx
  <View className="flex-1 bg-card rounded-t-card">
    {/* 1. Permanently Pinned SearchBar */}
    <SearchBar
      value={searchQuery}
      onChangeText={onSearchQueryChange}
      placeholder="search ingredients"
    />

    {/* 2. Scrollable SectionList with Sticky Alphabet Headers */}
    <SectionList
      className="flex-1"
      sections={sections}
      keyExtractor={(item) => item.id}
      stickySectionHeadersEnabled={true}
      renderSectionHeader={({ section: { title } }) => (
        <AlphabetHeader letter={title} />
      )}
      renderItem={({ item }) => (
        <IngredientListItem
          ingredient={item}
          isFavorite={favoriteIds.includes(item.id)}
          onPress={onIngredientPress}
          onFavoritePress={onToggleFavorite}
        />
      )}
      ListEmptyComponent={listEmptyComponent}
      ListFooterComponent={listFooterComponent}
      refreshControl={...}
      onEndReached={...}
      contentContainerClassName="pb-6"
    />
  </View>
  ```

---

## 5. Token & Styling Compliance Checklist

- [x] **Theme Colors:**
  - `bg-secondary` for `AlphabetHeader` container
  - `text-neutral-white` for `AlphabetHeader` letter text
  - `bg-card` for `SearchBar` container and all `IngredientListItem` cards
  - `text-text` for ingredient title
  - `text-muted` for preview description
  - `border-border` for card and search input outlines
  - `border-primary` for focused search input outline
  - `theme.colors.secondary` and `theme.colors.text` for `Star` icon props
- [x] **Font Sizes:**
  - `text-h3` for `AlphabetHeader` and ingredient title
  - `text-body-sm` for preview description and search input
- [x] **Font Families:**
  - `font-sans-bold` for header and title
  - `font-sans` for preview description and input
- [x] **Border Radii:**
  - `rounded-card` for `IngredientListItem`
  - `rounded-t-card` for `SearchBar` top container
  - `rounded-full` for search input outline

---

## 6. Implementation Dependency Order

1. **Schema & Types:**
   - Update `backend/features/ingredients/ingredients_schemas.py`
   - Update `frontend/src/features/library/model/library_types.ts`
2. **API & Mock:**
   - Update `frontend/src/features/library/model/library_api.ts`
   - Update `frontend/src/features/library/model/library_mock.ts`
3. **ViewModel:**
   - Update `frontend/src/features/library/viewmodel/useIngredients.ts`
4. **Components:**
   - Create `frontend/src/features/library/view/components/SearchBar.tsx`
   - Create `frontend/src/features/library/view/components/AlphabetHeader.tsx`
   - Update `frontend/src/features/library/view/components/IngredientListItem.tsx`
5. **Container & Shell:**
   - Update `frontend/src/features/library/view/containers/s1_IngredientsTab.tsx`
   - Verify integration in `frontend/src/features/library/view/LibraryPage.tsx`
