# AureSkin — Global Card Component Migration Implementation Plan

## 1. Overview & Objectives

| Property | Value |
|---|---|
| **Feature / Task** | Global Card Component Creation & Multi-Page Container Migration |
| **New Component** | `frontend/src/shared/components/Card.tsx` |
| **Barrel Export** | `frontend/src/shared/components/index.ts` |
| **Design Rules** | Strict adherence to `aureskin-frontend-rules`, `frontend/tailwind.config.js`, and `frontend/src/shared/theme/index.ts` |
| **Target Areas** | Home, Library, History, Scan (Scan Results / Compatibility), and Profile |
| **Visual Scope** | Only the outer container wrapper changes visually: background `bg-card`, no border, drop-down shadow (x=0, y=4, blur=10, color=black, opacity=10%). All inner content, hierarchy, and actions remain 100% intact. |

---

## 2. Design System & Design Token Audit

In accordance with `aureskin-frontend-rules`:
- **Background Color Token:** `bg-card` (`#FFFFFF` from `theme.colors.card`).
- **Border Radius Token:** `rounded-card` (`16px` from `tailwind.config.js`).
- **Border Requirement:** **No border** (removes existing `border border-border`).
- **Drop-down Shadow Specification:**
  - Horizontal offset ($x$): `0`
  - Vertical offset ($y$): `4`
  - Blur radius: `10`
  - Color: `black` (`#000000` / `theme.colors.black`)
  - Opacity: `10%` (`0.10`)
  - Android Elevation equivalent: `elevation: 4`
- **React Native Style Object:**
  ```typescript
  const cardShadowStyle = {
    shadowColor: theme.colors.black ?? '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  };
  ```

---

## 3. Global Shared Component Design (`Card.tsx`)

To avoid redundant wrapper nesting and prevent layout breaks, `Card.tsx` serves as both a static container (`View`) and an interactive container (`Pressable`) when `onPress` is supplied.

### 3.1 Interface Specification
```typescript
import React from 'react';
import {
  View,
  ViewProps,
  Pressable,
  PressableProps,
  StyleProp,
  ViewStyle,
  StyleSheet,
} from 'react-native';
import { theme } from '@/shared/theme';

export interface CardProps extends ViewProps {
  children?: React.ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
  /** Optional onPress callback. If provided, renders an accessible Pressable container */
  onPress?: PressableProps['onPress'];
  /** Optional activeOpacity when pressed (default: 0.85 when onPress is provided) */
  activeOpacity?: number;
  /** Accessibility role (defaults to 'button' if onPress is present) */
  accessibilityRole?: PressableProps['accessibilityRole'];
  /** Accessibility label */
  accessibilityLabel?: string;
  /** Accessibility hint */
  accessibilityHint?: string;
  /** Accessibility state */
  accessibilityState?: PressableProps['accessibilityState'];
  /** Disabled state */
  disabled?: boolean;
}
```

### 3.2 Implementation Details
```tsx
export function Card({
  children,
  className = '',
  style,
  onPress,
  disabled,
  accessibilityRole,
  accessibilityLabel,
  accessibilityHint,
  accessibilityState,
  ...rest
}: CardProps) {
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        accessibilityRole={accessibilityRole ?? 'button'}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityState={accessibilityState}
        className={`bg-card rounded-card active:opacity-85 ${className}`}
        style={[styles.cardShadow, style]}
        {...rest}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View
      className={`bg-card rounded-card ${className}`}
      style={[styles.cardShadow, style]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  cardShadow: {
    shadowColor: theme.colors.black ?? '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
});
```

---

## 4. Multi-Page Container Migration Audit & Targets

Below is the exhaustive matrix of all 14 target components across the application.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        AURESKIN CARD MIGRATION                         │
├───────────────┬──────────────────────────────────┬─────────────────────┤
│ Page          │ Target Component                 │ Current Outer Style │
├───────────────┼──────────────────────────────────┼─────────────────────┤
│ Home          │ 1. Skin Test Guide Tip           │ bg-background border│
│               │ 2. Article Cards                 │ bg-card border      │
│               │ 3. FAQ Items                     │ bg-card border      │
├───────────────┼──────────────────────────────────┼─────────────────────┤
│ Library       │ 4. Ingredient Cards (Shared)     │ bg-card border      │
│               │ 5. Product Cards (Shared)        │ bg-card border      │
│               │ 6. Description Cards             │ bg-card border      │
├───────────────┼──────────────────────────────────┼─────────────────────┤
│ History       │ 7. History Cards (ListItem + Skel│ bg-card border      │
├───────────────┼──────────────────────────────────┼─────────────────────┤
│ Scan          │ 8. Health Score Card             │ bg-card border      │
│               │ 9. Skin Type Banner              │ bg-card border      │
│               │ 10. Skin Condition Cards         │ bg-card border      │
│               │ 11. Compatible Ingredients Card  │ bg-card border      │
│               │ 12. Harmful Combinations Card    │ bg-card border      │
├───────────────┼──────────────────────────────────┼─────────────────────┤
│ Profile       │ 13. Skin Overview Card           │ bg-card border      │
│               │ 14. Profile Information Card     │ bg-card border      │
└───────────────┴──────────────────────────────────┴─────────────────────┘
```

---

## 5. Migration Diffs by Page & Component

### 5.1 Home Page

#### 1. "Skin test guide tip" card
- **File 1:** `frontend/src/features/home/view/components/SkinTestGuideTip.tsx`
- **File 2:** `frontend/src/features/home/view/containers/s3_SkinTestGuide.tsx`
- **Changes:**
  - Replace `<View className="bg-background rounded-card p-4 mb-7 border border-border shadow-xs overflow-visible relative">` with `<Card className="p-4 mb-7 overflow-visible relative">`.
  - Import `Card` from `@/shared/components`.
  - Preserves `overflow-visible relative` for the book graphic overlapping outside.

#### 2. Article cards
- **File:** `frontend/src/features/home/view/components/ArticleCard.tsx`
- **Changes:**
  - Replace `<TouchableOpacity onPress={handleOpenArticle} activeOpacity={0.85} className="bg-card rounded-card p-4 mb-4 border border-border shadow-xs">` with `<Card onPress={handleOpenArticle} className="p-4 mb-4">`.
  - Remove `border border-border shadow-xs`.
  - Import `Card` from `@/shared/components`.

#### 3. FAQs cards
- **File:** `frontend/src/features/home/view/components/FAQItem.tsx`
- **Changes:**
  - Replace `<View className="bg-card rounded-card mb-3 border border-border shadow-xs overflow-hidden">` with `<Card className="mb-3 overflow-hidden">`.
  - Keep internal accordion toggling and Chevron controls completely unchanged.
  - Import `Card` from `@/shared/components`.

---

### 5.2 Library Page

#### 4. Ingredient cards (Global Component)
- **File:** `frontend/src/shared/components/IngredientCard.tsx`
- **Changes:**
  - Replace `<Pressable ... className={`mx-5 mb-3 rounded-card border border-border bg-card px-5 py-4 shadow-sm active:opacity-80 ${isFirstInSection ? 'mt-3' : ''} ${className}`}>` with:
    `<Card onPress={() => onPress(ingredient.id)} accessibilityRole="button" accessibilityLabel={`View details for ${ingredient.name}`} accessibilityHint="Opens ingredient details" className={`mx-5 mb-3 px-5 py-4 ${isFirstInSection ? 'mt-3' : ''} ${className}`}>`.
  - Remove `border border-border shadow-sm`.
  - `IngredientListItem.tsx` continues to seamlessly consume `IngredientCard`.

#### 5. Product cards (Global Component)
- **File:** `frontend/src/shared/components/ProductCard.tsx`
- **Changes:**
  - Replace `<View className={`mb-3 min-h-28 flex-row items-center rounded-card border border-border bg-card p-3 shadow-sm ${className}`}>` with:
    `<Card className={`mb-3 min-h-28 flex-row items-center p-3 ${className}`}>`.
  - Remove `border border-border shadow-sm`.
  - `ProductListItem.tsx` continues to seamlessly consume `ProductCard`.

#### 6. Description cards
- **File:** `frontend/src/features/library/view/components/DescriptionCard.tsx`
- **Changes:**
  - Replace `<View className={`mb-3 rounded-card border border-border bg-card p-4 shadow-xs ${className}`}>` with `<Card className={`mb-3 p-4 ${className}`}>`.
  - Remove `border border-border shadow-xs`.
  - Automatically upgrades all description card instances in `IngredientDetailPage.tsx` and `ProductDetailPage.tsx`.

---

### 5.3 History Page

#### 7. History cards
- **File:** `frontend/src/features/history/view/components/HistoryListItem.tsx`
- **Changes:**
  - Replace `<Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`Skin analysis from ${formatDate(entry.created_at)}, ${healthScore}% healthy`} accessibilityHint="Opens this scan's results" className="mb-3 min-h-28 flex-row items-center rounded-card border border-border bg-card p-3 shadow-xs active:opacity-85">` with:
    `<Card onPress={onPress} accessibilityRole="button" accessibilityLabel={`Skin analysis from ${formatDate(entry.created_at)}, ${healthScore}% healthy`} accessibilityHint="Opens this scan's results" className="mb-3 min-h-28 flex-row items-center p-3">`.
  - Remove `border border-border shadow-xs`.
  - In `frontend/src/features/history/view/containers/s1_HistoryList.tsx`, update `HistorySkeleton` card container:
    Replace `<View key={row} className="min-h-28 flex-row items-center rounded-card border border-border bg-card p-3 shadow-xs">` with `<Card key={row} className="min-h-28 flex-row items-center p-3">`.

---

### 5.4 Scan Page

#### 8. Health score card
- **File:** `frontend/src/shared/pages/scan_results/components/HealthScoreCard.tsx`
- **Changes:**
  - Replace `<View className="mx-4 mt-4 rounded-card border border-border bg-card overflow-hidden shadow-xs">` with `<Card className="mx-4 mt-4 overflow-hidden">`.
  - Internal dynamic score tier gradient (`CardGradientHeader`), Activity icon, and animated `HealthGauge` remain untouched.
  - Automatically updates the proxy in `frontend/src/features/scan/view/components/HealthScoreCard.tsx`.

#### 9. Skin type card
- **File:** `frontend/src/shared/pages/scan_results/components/SkinTypeBanner.tsx`
- **Changes:**
  - Replace `<View className="mx-4 mt-4 rounded-card border border-border bg-card overflow-hidden shadow-xs">` with `<Card className="mx-4 mt-4 overflow-hidden">`.
  - Internal header gradient, skin type icons, and confidence indicator ring remain untouched.
  - Automatically updates the proxy in `frontend/src/features/scan/view/components/SkinTypeBanner.tsx`.

#### 10. Skin condition card
- **File 1:** `frontend/src/shared/pages/scan_results/components/ConditionsCard.tsx`
  - Replace `<View className="mx-4 mt-4 rounded-card border border-border bg-card overflow-hidden shadow-xs">` with `<Card className="mx-4 mt-4 overflow-hidden">`.
- **File 2:** `frontend/src/shared/pages/scan_results/components/ConditionDetailCard.tsx`
  - Replace `<View className="rounded-card border border-border bg-card overflow-hidden shadow-xs">` with `<Card className="overflow-hidden">`.
- **Changes:**
  - Removes `border border-border shadow-xs`.
  - Automatically updates proxies in `frontend/src/features/scan/view/components/`.

#### 11. Compatible ingredients card
- **File:** `frontend/src/shared/pages/scan_results/containers/s3_CompatibilityTab.tsx`
- **Changes:**
  - In Container 1, replace:
    `<View className="mx-4 mt-4 rounded-card border border-border bg-card p-5 shadow-xs">` with:
    `<Card className="mx-4 mt-4 p-5">`.
  - Internal interactive row items with chevron links and modal triggers remain untouched.

#### 12. Harmful combinations card
- **File:** `frontend/src/shared/pages/scan_results/containers/s3_CompatibilityTab.tsx`
- **Changes:**
  - In Container 2, replace:
    `<View className="mx-4 mt-4 mb-6 rounded-card border border-border bg-card p-5 shadow-xs">` with:
    `<Card className="mx-4 mt-4 mb-6 p-5">`.
  - Pill badges, clinical reasoning, and divider separators remain untouched.

---

### 5.5 Profile Page

#### 13. Skin overview card
- **File:** `frontend/src/features/profile/view/components/SkinOverviewCard.tsx`
- **Changes:**
  - Replace `<View className="rounded-card border border-border bg-card p-5 mb-4 shadow-xs">` with `<Card className="p-5 mb-4">`.
  - Internal skin type heading, condition badges, and circular `HealthGauge` remain untouched.

#### 14. Profile information card
- **File:** `frontend/src/features/profile/view/components/ProfileInfoCard.tsx`
- **Changes:**
  - Replace `<View className="rounded-card border border-border bg-card p-5 mb-4 shadow-xs">` with `<Card className="p-5 mb-4">`.
  - Allergen rows and edit handlers remain untouched.

---

## 6. Implementation Steps

1. **Step 1: Theme & Shared Component Scaffolding**
   - Ensure `theme.colors.black: "#000000"` is available in `frontend/src/shared/theme/index.ts`.
   - Create `frontend/src/shared/components/Card.tsx` with `bg-card`, `rounded-card`, no border, and the specified drop-down shadow (`shadowColor: black`, `offset: {0, 4}`, `opacity: 0.1`, `radius: 10`, `elevation: 4`).
   - Export `Card` and `CardProps` from `frontend/src/shared/components/index.ts`.

2. **Step 2: Home Page Migration**
   - Migrate `SkinTestGuideTip.tsx` & `s3_SkinTestGuide.tsx`.
   - Migrate `ArticleCard.tsx`.
   - Migrate `FAQItem.tsx`.

3. **Step 3: Library Page Migration**
   - Migrate `IngredientCard.tsx`.
   - Migrate `ProductCard.tsx`.
   - Migrate `DescriptionCard.tsx`.

4. **Step 4: History Page Migration**
   - Migrate `HistoryListItem.tsx`.
   - Migrate `s1_HistoryList.tsx` skeleton.

5. **Step 5: Scan Page Migration**
   - Migrate `HealthScoreCard.tsx`.
   - Migrate `SkinTypeBanner.tsx`.
   - Migrate `ConditionsCard.tsx` & `ConditionDetailCard.tsx`.
   - Migrate Container 1 (Compatible Ingredients) in `s3_CompatibilityTab.tsx`.
   - Migrate Container 2 (Harmful Combinations) in `s3_CompatibilityTab.tsx`.

6. **Step 6: Profile Page Migration**
   - Migrate `SkinOverviewCard.tsx`.
   - Migrate `ProfileInfoCard.tsx`.

7. **Step 7: Verification & Type Checking**
   - Run TypeScript typecheck to verify imports, props, and zero type regressions.
   - Verify that all 14 card containers render with the exact new drop-down shadow, card background, no borders, and zero broken internal layouts.

---

## 7. Verification Checklist

- [ ] `Card.tsx` located in `frontend/src/shared/components/Card.tsx`.
- [ ] Exported via `frontend/src/shared/components/index.ts`.
- [ ] Uses token `bg-card` (no hardcoded `#FFFFFF`).
- [ ] Has no border (no `border`, no `border-border`).
- [ ] Implements specified drop-down shadow: `x=0, y=4, blur=10, color=black, opacity=10%` (`elevation: 4`).
- [ ] Home: Skin Test Guide Tip card migrated.
- [ ] Home: Article cards migrated.
- [ ] Home: FAQ cards migrated.
- [ ] Library: Ingredient cards migrated.
- [ ] Library: Product cards migrated.
- [ ] Library: Description cards migrated.
- [ ] History: History cards migrated.
- [ ] Scan: Health score card migrated.
- [ ] Scan: Skin type card migrated.
- [ ] Scan: Skin condition cards migrated.
- [ ] Scan: Compatible ingredients card migrated.
- [ ] Scan: Harmful combinations card migrated.
- [ ] Profile: Skin overview card migrated.
- [ ] Profile: Profile information card migrated.
- [ ] Layout integrity preserved: only outer container wrappers change visually.

