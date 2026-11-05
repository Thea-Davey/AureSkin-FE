# Architecture & Implementation Plan: Scan Results Migration to Shared Pages

## 1. Executive Summary & Objective

The goal of this architectural refactor is to decouple the **Scan Results Screen** (specifically the Findings/Results Tab `s2_ResultsTab` and the Compatibility Tab `s3_CompatibilityTab`) from the feature-private `features/scan/` directory and elevate them into a reusable, cross-feature shared layer: **`src/shared/pages/`**.

This enables other features—chiefly the **History** feature (`HistoryDetailPage`)—to render identical, consistent scan result analysis cards (Face Photo, Health Score, Skin Type Banner, Conditions Card, Root Causes Callout, and Ingredient Compatibility) without violating MVVM feature isolation boundaries or duplicating component code.

---

## 2. Target Directory & File Hierarchy

```
frontend/src/
├── shared/
│   ├── pages/                                ← NEW: Shared pages & multi-container screens
│   │   ├── containers/                       ← NEW: Major tab containers
│   │   │   ├── s2_ResultsTab.tsx             ← Migrated Findings tab container
│   │   │   └── s3_CompatibilityTab.tsx       ← Migrated Compatibility tab container
│   │   │
│   │   └── components/                       ← NEW: Sub-components powering shared pages
│   │       ├── CardGradientHeader.tsx        ← Vertical SVG linear gradient header
│   │       ├── FacePhotoCard.tsx             ← Face photo preview card with loading fallback
│   │       ├── HealthScoreCard.tsx           ← Health score tier card + HealthGauge integration
│   │       ├── SkinTypeBanner.tsx            ← Skin type classification banner + match ring
│   │       ├── ConditionDetailCard.tsx       ← Modal/expanded condition detail view
│   │       ├── ConditionsCard.tsx            ← Identified concerns card + clinical condition icons
│   │       └── HistorySavedBanner.tsx        ← "Saved to History" reassurance banner
│   │
│   └── components/                           ← Existing global primitives (HealthGauge, PopUpPanel, etc.)
│
└── features/
    ├── scan/
    │   └── view/
    │       ├── ScanResultsPage.tsx           ← Updated to import from @/shared/pages/containers/
    │       ├── containers/
    │       │   └── results/
    │       │       ├── s2_ResultsTab.tsx     ← Backwards-compatible proxy re-export
    │       │       └── s3_CompatibilityTab.tsx ← Backwards-compatible proxy re-export
    │       └── components/
    │           ├── (camera/submit components remain here)
    │           └── [migrated cards]          ← Backwards-compatible proxy re-exports
    │
    └── history/
        └── view/
            └── HistoryDetailPage.tsx         ← Future consumer: imports directly from @/shared/pages/
```

---

## 3. Dependency & Contract Analysis

### 3.1 Container 1: `s2_ResultsTab`
- **Location:** `src/shared/pages/containers/s2_ResultsTab.tsx`
- **Props Interface:**
  ```typescript
  export interface S2ResultsTabProps {
    scanResult: ScanResult;
    imageUri: string;
    isRefreshing: boolean;
    onRefresh: () => Promise<void>;
  }
  ```
- **Child Components (all within `src/shared/pages/components/`):**
  1. [`FacePhotoCard`](file:///c:/Users/Thea/Documents/DLSUD/AureSkin/frontend/src/shared/pages/components/FacePhotoCard.tsx)
  2. [`HealthScoreCard`](file:///c:/Users/Thea/Documents/DLSUD/AureSkin/frontend/src/shared/pages/components/HealthScoreCard.tsx) (uses [`HealthGauge`](file:///c:/Users/Thea/Documents/DLSUD/AureSkin/frontend/src/shared/components/HealthGauge.tsx) & [`CardGradientHeader`](file:///c:/Users/Thea/Documents/DLSUD/AureSkin/frontend/src/shared/pages/components/CardGradientHeader.tsx))
  3. [`SkinTypeBanner`](file:///c:/Users/Thea/Documents/DLSUD/AureSkin/frontend/src/shared/pages/components/SkinTypeBanner.tsx) (uses [`CardGradientHeader`](file:///c:/Users/Thea/Documents/DLSUD/AureSkin/frontend/src/shared/pages/components/CardGradientHeader.tsx))
  4. [`ConditionsCard`](file:///c:/Users/Thea/Documents/DLSUD/AureSkin/frontend/src/shared/pages/components/ConditionsCard.tsx) (uses [`ConditionDetailCard`](file:///c:/Users/Thea/Documents/DLSUD/AureSkin/frontend/src/shared/pages/components/ConditionDetailCard.tsx) & [`CardGradientHeader`](file:///c:/Users/Thea/Documents/DLSUD/AureSkin/frontend/src/shared/pages/components/CardGradientHeader.tsx))
  5. [`HistorySavedBanner`](file:///c:/Users/Thea/Documents/DLSUD/AureSkin/frontend/src/shared/pages/components/HistorySavedBanner.tsx)
  6. [`WarningNote`](file:///c:/Users/Thea/Documents/DLSUD/AureSkin/frontend/src/shared/components/WarningNote.tsx) (already in `shared/components/`)

### 3.2 Container 2: `s3_CompatibilityTab`
- **Location:** `src/shared/pages/containers/s3_CompatibilityTab.tsx`
- **Props Interface:**
  ```typescript
  export interface S3CompatibilityTabProps {
    scanResult: ScanResult;
    isRefreshing: boolean;
    onRefresh: () => Promise<void>;
    onIngredientPress?: (id?: string) => void;
  }
  ```
- **Internal Integration:**
  - Uses [`IngredientDetailPage`](file:///c:/Users/Thea/Documents/DLSUD/AureSkin/frontend/src/shared/components/IngredientDetailPage.tsx) modal for tap-to-inspect ingredient interaction.
  - Interactive rows for Compatible Ingredients and interactive pills for Harmful Combinations with `active:opacity-60`.

---

## 4. Step-by-Step Implementation Execution Steps

### Step 1: Create Destination Folders
1. Create `frontend/src/shared/pages/`
2. Create `frontend/src/shared/pages/containers/`
3. Create `frontend/src/shared/pages/components/`

### Step 2: Migrate Shared Components to `src/shared/pages/components/`
Move or copy and update the relative import paths for:
1. **`CardGradientHeader.tsx`**:
   - Runtime styling: SVG gradient vector with `x1=0, y1=0 -> x2=0, y2=100%`, explicit height, and `theme.colors.*`.
2. **`FacePhotoCard.tsx`**:
   - Analyzed face photo container with high-contrast badge.
3. **`HealthScoreCard.tsx`**:
   - Imports `CardGradientHeader` from `./CardGradientHeader`
   - Imports `HealthGauge` from `@/shared/components/HealthGauge`
   - Icon circle with `bg-primary` and white symbol.
4. **`SkinTypeBanner.tsx`**:
   - Imports `CardGradientHeader` from `./CardGradientHeader`
   - Skin type badge + 64px confidence circle indicator.
5. **`ConditionDetailCard.tsx`**:
   - Expanded modal view for dermatological condition clinical findings.
6. **`ConditionsCard.tsx`**:
   - Imports `CardGradientHeader` from `./CardGradientHeader`
   - Imports `ConditionDetailCard` from `./ConditionDetailCard`
   - Identified concerns eyebrow with `text-caption font-sans-bold text-status-error` and dot indicator.
7. **`HistorySavedBanner.tsx`**:
   - Checkmark reassurance badge with clean typography.

### Step 3: Migrate Containers to `src/shared/pages/containers/`
1. **`s2_ResultsTab.tsx`**:
   - Update imports to reference `../components/FacePhotoCard`, `../components/HealthScoreCard`, etc.
   - Reference `@/shared/theme` and `@/shared/components/WarningNote`.
2. **`s3_CompatibilityTab.tsx`**:
   - Update imports to reference `@/shared/theme` and `@/shared/components/IngredientDetailPage`.
   - Maintain interactive tap modal state for ingredient inspection.

### Step 4: Update Scan Feature Consumers & Re-export Proxies
1. **Update [`ScanResultsPage.tsx`](file:///c:/Users/Thea/Documents/DLSUD/AureSkin/frontend/src/features/scan/view/ScanResultsPage.tsx):**
   ```tsx
   import { S2ResultsTab } from '@/shared/pages/containers/s2_ResultsTab';
   import { S3CompatibilityTab } from '@/shared/pages/containers/s3_CompatibilityTab';
   ```
2. **Create Backwards-Compatible Proxies:**
   - In `features/scan/view/containers/results/s2_ResultsTab.tsx`:
     ```tsx
     export { S2ResultsTab, default } from '@/shared/pages/containers/s2_ResultsTab';
     ```
   - In `features/scan/view/containers/results/s3_CompatibilityTab.tsx`:
     ```tsx
     export { S3CompatibilityTab, default } from '@/shared/pages/containers/s3_CompatibilityTab';
     ```
   - In `features/scan/view/components/`:
     Re-export `HealthScoreCard`, `SkinTypeBanner`, `ConditionsCard`, `FacePhotoCard`, `HistorySavedBanner`, `CardGradientHeader`, and `ConditionDetailCard` so no legacy imports break.

---

## 5. Design Token & Rule Compliance Audit

| Rule / Requirement | Verification |
|---|---|
| **No Raw Hex Colors** | All colors strictly sourced from `theme.colors.*` (`theme.colors.primary`, `theme.colors.secondary`, `theme.colors.error`, etc.). |
| **Preset Font Sizes** | Strictly `text-h1`, `text-h2`, `text-h3`, `text-body`, `text-body-sm`, `text-caption`, `text-label`. No arbitrary brackets `text-[...]`. |
| **Preset Font Families** | Strictly `font-sans`, `font-sans-medium`, `font-sans-semibold`, `font-sans-bold`. |
| **Preset Radii** | Strictly `rounded-card` (16px), `rounded-button` (12px), `rounded-badge` (20px), `rounded-full` (9999px). |
| **Contrast & Accessibility** | Body text kept as `text-text` (`#2D2D2D`) with clear hierarchy. |
| **Feature Isolation** | `src/shared/pages/` has zero dependency on `features/scan/view/` or `features/history/view/`. |

---

## 6. Verification & Testing Checklist

- [ ] Execute `cd frontend; npx tsc --noEmit` and verify 0 TypeScript compiler errors across all new and existing files.
- [ ] Verify that `ScanResultsPage` successfully renders both the Results Tab and Compatibility Tab.
- [ ] Verify that tapping on compatible ingredients and harmful combinations opens `IngredientDetailPage`.
- [ ] Verify that future integration into `HistoryDetailPage` only requires importing `S2ResultsTab` or `S3CompatibilityTab` from `@/shared/pages/containers/`.

