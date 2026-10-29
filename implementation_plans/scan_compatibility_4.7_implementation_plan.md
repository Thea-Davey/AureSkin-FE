# Implementation Plan: 4.7 Scan Results — Compatibility Tab

> **Document Type:** Screen Architecture & Implementation Plan  
> **Target Screen:** Scan Results — Compatibility Tab (`ScanResultsPage` / `S3CompatibilityTab`)  
> **UI Doc Reference:** Section 4.7 — *Scan Results — Compatibility Tab* in `design_references/ui_design_reference.md`  
> **Visual Reference:** `design_references/scan_results_compatibility_tab.png`  
> **Feature Domain:** `frontend/src/features/scan/`  
> **Route Path:** `frontend/src/app/scan/results.tsx` (`/scan/results` with `activeTab === 'compatibility'`)  
> **Status:** ✅ **IMPLEMENTED (Step 2 Complete)**  

---

## 1. Overview & Visual Ground Truth

The **Scan Results — Compatibility Tab** is the second tab of the unified Scan Results screen (`/scan/results`). It translates the user's diagnosed skin type and detected conditions into actionable dermatological ingredient recommendations:
1. **Compatible Ingredients to Skin Type:** An authoritative list of active ingredients that safely support and balance the user's skin profile (e.g., Salicylic acid, Niacinamide, Clay, Hyaluronic acid, Retinol, Dioic acid, Omega fatty acids, Aloe Vera).
2. **Incompatible Ingredients to Mix:** High-priority contraindication cards warning against pairing conflicting active ingredients (e.g., Retinoids + AHAs/BHAs/PHAs, L-ascorbic acid + Direct Acids) with specific usage timing guidance.

The screen shares the olive green header (`bg-primary` / `#6B7B4C`) and segmented tab switcher with the Results Tab (Section 4.6), allowing seamless switching between primary findings and ingredient compatibility guidance.

### Visual Layout (from `scan_results_compatibility_tab.png`)

```
┌─────────────────────────────────────────────────────────┐
│                      Skin Analysis                  [✕] │
│           Results     [ Ingredient Compatibility ]      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │ Compatible Ingredients to Skin Type               │  │
│  │                                                   │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │ Salicylic acid                              │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │ Niacinamide                                 │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │ Clay                                        │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │ Hyaluronic acid                             │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  │  [... Dioic acid, Omega fatty acids, Aloe Vera]   │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  Incompatible Ingredients to mix                        │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │ Retinoids / Retinol (Vitamin A)                   │  │
│  │ Do not use on the same day as:                    │  │
│  │ [ AHAs ]  [ BHAs ]  [ PHAs ]                      │  │
│  │                                                   │  │
│  │ Use on alternate nights (once you have built up   │  │
│  │ the tolerance)                                    │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │ L-ascorbic acid (Vitamin C)                       │  │
│  │ Do not use in the same skincare routine as:       │  │
│  │ [ AHAs ]  [ BHAs ]  [ PHAs ]                      │  │
│  │                                                   │  │
│  │ Use Vitamin C in AM, AHAs / BHAs / PHAs in PM.    │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Visual & Architectural Characteristics:
- **Header:** Shared persistent olive green top bar (`bg-primary` / `#6B7B4C`) with `"Skin Analysis"` title and Close button (`✕`) right.
- **Tab Switcher:**
  - Inactive ("Results"): clean text `text-neutral-white/90 font-sans text-caption px-4 py-1.5`.
  - Active ("Ingredient Compatibility"): peachy-terracotta pill (`bg-secondary` / `#D4A574`, `text-neutral-white font-sans-semibold text-caption px-4 py-1.5 rounded-badge`).
- **Compatible Ingredients Container:**
  - Header: `"Compatible Ingredients to Skin Type"` with `CheckCircle2` accent icon.
  - Card: `rounded-card border border-border bg-card p-4 shadow-xs`.
  - Item rows: Clean rows separated by borders displaying the ingredient name (`text-body-sm font-sans-bold text-text`) and clinical reason (`text-caption font-sans text-muted mt-1 leading-4`).
- **Incompatible Ingredients Container:**
  - Section heading: `"Incompatible Ingredients to mix"` with `AlertTriangle` error icon.
  - Pair Cards: Stacked cards (`rounded-card border border-border bg-card p-4 mb-3 shadow-xs`):
    - Title: Combined pair in red/error tone (`text-body-sm font-sans-bold text-error`).
    - Interaction reason: Clear explanation (`text-body-sm font-sans text-muted mt-1.5 leading-5`).

---

## 2. Complete Resolved File Tree

```
frontend/
└── src/
    └── features/scan/
        ├── model/
        │   ├── scan_types.ts                   ← [UPDATE] IncompatiblePair, CompatibleIngredient
        │   └── scan_mock.ts                    ← [UPDATE] Compatible ingredients and incompatible pairs
        │
        ├── viewmodel/
        │   └── useScanResults.ts               ← [UPDATE] Ingest results, manage tabs, refresh, ingredient press
        │
        └── view/
            └── containers/
                └── s3_CompatibilityTab.tsx     ← [UPDATE] Clean card layout with clinical reasons and pair interaction details
```

> [!NOTE]
> The route file (`frontend/src/app/scan/results.tsx`), main screen shell (`ScanResultsPage.tsx`), and top header (`s1_ResultsHeader.tsx`) were already created during Section 4.6 and require no breaking changes.

---

## 3. Data Model Updates (`scan_types.ts`)

Enhance `IncompatiblePair` to support both flat pair descriptions and rich structured badge displays:

```typescript
// ── Incompatible Pair Model Enhancement ─────────────────────────────

export interface IncompatiblePair {
  ingredient_a: string;
  ingredient_b: string;
  reason: string;
  subtitle?: string;          // e.g. "Do not use on the same day as:"
  incompatible_with?: string[]; // e.g. ["AHAs", "BHAs", "PHAs"]
  guidance?: string;          // e.g. "Use on alternate nights (once you have built up the tolerance)"
}
```

---

## 4. Mock Data Updates (`scan_mock.ts`)

Update `MOCK_SCAN_RESULT` in `scan_mock.ts` to mirror the exact items in `scan_results_compatibility_tab.png`:

```typescript
export const MOCK_COMPATIBLE_INGREDIENTS: CompatibleIngredient[] = [
  { id: 'ing-01', name: 'Salicylic acid', reason: 'Penetrates lipid layers to clear congested pores.' },
  { id: 'ing-02', name: 'Niacinamide', reason: 'Regulates sebum production and strengthens barrier integrity.' },
  { id: 'ing-03', name: 'Clay', reason: 'Absorbs excess surface oil and clarifies dermal impurities.' },
  { id: 'ing-04', name: 'Hyaluronic acid', reason: 'Provides deep non-comedogenic hydration.' },
  { id: 'ing-05', name: 'Retinol', reason: 'Accelerates cellular turnover and normalizes keratinization.' },
  { id: 'ing-06', name: 'Dioic acid', reason: 'Reduces excessive sebum production and evens tone.' },
  { id: 'ing-07', name: 'Omega fatty acids', reason: 'Replenishes essential skin lipids without clogging pores.' },
  { id: 'ing-08', name: 'Aloe Vera', reason: 'Soothes dermal inflammation and cools irritated skin.' },
];

export const MOCK_INCOMPATIBLE_PAIRS: IncompatiblePair[] = [
  {
    ingredient_a: 'Retinoids / Retinol (Vitamin A)',
    ingredient_b: 'AHAs / BHAs / PHAs',
    reason: 'Combining strong keratolytics increases barrier irritation and excessive peeling.',
    subtitle: 'Do not use on the same day as:',
    incompatible_with: ['AHAs', 'BHAs', 'PHAs'],
    guidance: 'Use on alternate nights (once you have built up the tolerance)',
  },
  {
    ingredient_a: 'L-ascorbic acid (Vitamin C)',
    ingredient_b: 'AHAs / BHAs / PHAs',
    reason: 'Low pH active layering destabilizes Vitamin C efficacy and provokes irritation.',
    subtitle: 'Do not use in the same skincare routine as:',
    incompatible_with: ['AHAs', 'BHAs', 'PHAs'],
    guidance: 'Use Vitamin C in AM, AHAs / BHAs / PHAs in PM.',
  },
];
```

---

## 5. ViewModel Hook (`useScanResults.ts`)

The ViewModel created in 4.6 already exposes `scanResult`, `isRefreshing`, and `onRefresh`. We will ensure it provides an ingredient navigation action:
- `handleIngredientPress(ingredientId?: string)`:
  - If `ingredientId` is provided: navigates to `/library/ingredient/[id]`.
  - Fallback: gracefully logs or provides toast feedback if route is pending.

---

## 6. View & Container Breakdown

### 6.1 Container: `s3_CompatibilityTab.tsx`
- Layout: Scrollable container (`ScrollView`) with pull-to-refresh (`RefreshControl`).
- Structure:
  1. **Compatible Ingredients Card:**
     - Container: `mx-4 mt-4 rounded-card border border-border bg-card p-4 shadow-xs`
     - Title: `"Compatible Ingredients to Skin Type"` (`text-h3 font-sans-bold text-text mb-3`)
     - Items: Renders `<CompatibleIngredientTile key={item.id} name={item.name} onPress={() => onIngredientPress?.(item.id)} />`
  2. **Incompatible Pairs Section:**
     - Section Header: `"Incompatible Ingredients to mix"` (`text-h3 font-sans-bold text-text mx-4 mt-6 mb-3`)
     - Pair Cards: Maps `scanResult.incompatible_pairs` to `<IncompatiblePairCard key={index} pair={pair} />`
  3. **Empty States:**
     - When no compatible ingredients found: Clean card with `"No specific ingredient matches found for this profile."`
     - When no incompatible pairs found: Clean card with `"No harmful active clashes detected."`

### 6.2 Components

#### `CompatibleIngredientTile.tsx`
- Props: `{ name: string; onPress?: () => void }`
- Container: `Pressable` with `rounded-button px-4 py-3.5 mb-2.5 bg-background border border-border/50 active:opacity-75`
- Text: `text-body-sm font-sans-medium text-text`

#### `IncompatiblePairCard.tsx`
- Props: `{ pair: IncompatiblePair }`
- Container: `mx-4 mb-3.5 rounded-card border border-border bg-card p-4 shadow-xs`
- Title: `text-body font-sans-bold text-text mb-2`
- Subtitle: `text-body-sm font-sans text-text mb-2.5`
- Badges Row:
  - Container: `flex-row flex-wrap gap-2 mb-3`
  - Pill Badge: `bg-status-error/70 rounded-badge px-3 py-1 items-center justify-center`
  - Badge Label: `text-neutral-white font-sans-bold text-caption`
- Guidance Note:
  - Text: `text-body-sm font-sans text-muted leading-5`

---

## 7. Design Tokens & Styling Compliance Matrix

| UI Element | Property | Token Class / Value | Source |
|---|---|---|---|
| Page Background | `backgroundColor` | `bg-background` (`#F5F0EB`) | `tailwind.config.js` |
| Compatible Card Container | `borderRadius` / `backgroundColor` | `rounded-card bg-card border-border` | `tailwind.config.js` |
| Compatible Card Header | `fontSize` / `fontFamily` | `text-h3 font-sans-bold text-text` | `tailwind.config.js` |
| Compatible Ingredient Tile | `borderRadius` / `backgroundColor` | `rounded-button bg-background border-border/50` | `tailwind.config.js` |
| Ingredient Name Text | `fontSize` / `fontFamily` | `text-body-sm font-sans-medium text-text` | `tailwind.config.js` |
| Incompatible Section Header | `fontSize` / `fontFamily` | `text-h3 font-sans-bold text-text` | `tailwind.config.js` |
| Incompatible Card Container | `borderRadius` / `backgroundColor` | `rounded-card bg-card border-border` | `tailwind.config.js` |
| Incompatible Heading | `fontSize` / `fontFamily` | `text-body font-sans-bold text-text` | `tailwind.config.js` |
| Incompatible Subtitle | `fontSize` / `fontFamily` | `text-body-sm font-sans text-text` | `tailwind.config.js` |
| Incompatible Clash Badge | `backgroundColor` / `radius` | `bg-status-error/70 rounded-badge` (`#E53935`) | `tailwind.config.js` |
| Clash Badge Label | `fontSize` / `fontFamily` | `text-caption font-sans-bold text-neutral-white` | `tailwind.config.js` |
| Usage Guidance Note | `fontSize` / `fontFamily` | `text-body-sm font-sans text-muted` | `tailwind.config.js` |

*Zero arbitrary bracket styles (`text-[...]`, `rounded-[...]`), zero raw hex color strings in TSX.*

---

## 8. Navigation Mapping

| User Action / Event | Target Destination | Route Call |
|---|---|---|
| **Tap "Results" Tab** | Switches to Results view (4.6) | `setTab('results')` |
| **Tap Close (×) Button** | Home Screen (`(tabs)/index`) | `router.replace('/(tabs)')` |
| **Tap Compatible Ingredient Tile** | Ingredient Detail Page (3.3) | `router.push({ pathname: '/library/ingredient/[id]', params: { id } })` |

---

## 9. State Handling Matrix

| Section / Element | Loading State | Error State | Empty State | Success State |
|---|---|---|---|---|
| **Compatible Ingredients Card** | Skeleton rows | Error alert banner | "No specific ingredient matches found for this profile." | Stacked ingredient tiles matching skin type |
| **Incompatible Pairs List** | Skeleton cards | Error alert banner | "No harmful active clashes detected." | Stacked cards with title, restriction, clash badges & guidance |

---

## 10. Step 1 Completion & Checkpoint

> 🛑 **MANDATORY CHECKPOINT — STOP HERE FOR REVIEW**  
> This concludes Step 1 of the screen architecture workflow. Please review the architecture, layout breakdown, component list, and tokens above.  
> Once approved, we will proceed to Step 2 (full implementation of models, components, container refinement, and testing).
