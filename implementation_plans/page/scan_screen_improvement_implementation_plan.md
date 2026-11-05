# Implementation Plan — Scan Screen Pages Improvement

> **Document Type:** Screen Architecture & UI Improvement Plan  
> **Target Scope:** 
> 1. Scan Submit (Submit Photo) — Dynamic `SubmitControls` + `PopUpGuidelinesPanel`
> 2. Scan Analyzing (Loading Screen) — Image circle resizing for glowing ring clearance
> 3. Scan Results (Results Tab) — Complete redesign matching Reference Image 1 (6 containers, gradients, aligned scores)
> 4. Scan Results (Compatibility Tab) — Minor layout fixes matching Reference Image 2 (badges, internal headers)  
> **Design References:**
> - Reference Image 1 (Results Tab): [`frontend/implementation_plans/page/target_images/scan_result.png`](file:///c:/Users/Thea/Documents/DLSUD/AureSkin/frontend/implementation_plans/page/target_images/scan_result.png)
> - Reference Image 2 (Harmful Combinations): Uploaded in chat (`harmful_combinations_ref.png`)
> **Design Tokens Source:** [`frontend-rules.md`](file:///c:/Users/Thea/Documents/DLSUD/AureSkin/.agents/rules/frontend-rules.md), `frontend/tailwind.config.js`, and `frontend/src/shared/theme/index.ts`  
> **Status:** ⏳ **READY FOR USER REVIEW (Step 1)**

---

## 1. Overview & Objectives Summary

This plan addresses all four specific scan screen objectives outlined by the user, ensuring strict adherence to AureSkin design tokens, presets, and MVVM architecture.

| Page / Section | Current State / Issue | Target Improvement |
|---|---|---|
| **1. Scan Submit (Submit Photo)** | Fixed-width Submit button; uses generic modal for guidelines. | 1. **SubmitControls:** Make the "Submit Photo" button dynamically expand (`flex-1`) up to the "Retake" button.<br>2. **PopUpGuidelinesPanel:** Create a dedicated local component leveraging the global `PopUpPanel` blueprint with native spring and fade animations. |
| **2. Scan Analyzing (Loading Screen)** | The circular face image is too large (`w-[236px]`), overlapping and obscuring the glowing green ring (`border-status-success`). | Decrease the size of the inner face image circle (to `w-52 h-52` / `208px` with `p-4` breathing room) so the animated green progress ring is unobstructed and clearly visible. |
| **3. Scan Results — Results Tab** | Uses older stacked layout with separate raw cards. | **Full Redesign based on Reference Image 1:**<br>• **Container 1:** Submitted face photo.<br>• **Container 2:** Health Score card with dynamic score-based gradient header (Green, Yellow, Orange, Red) and aligned score ring.<br>• **Container 3:** Skin Type card with secondary token gradient header and aligned confidence ring.<br>• **Container 4:** Skin Conditions / Concerns card with red token gradient header, flame badge, and aligned score pill.<br>• **Container 5:** Saved to History notice with improved copywriting.<br>• **Container 6:** Medical disclaimer using global `WarningNote`.<br>• **Score Alignment:** All score indicators in containers 2–4 strictly right-aligned. |
| **4. Scan Results — Compatibility Tab** | Section titles sit outside containers; incompatible pairs lack badge styling. | **Minor Fixes based on Reference Image 2:**<br>• **Container 1 (Compatible Ingredients):** Move label inside the container.<br>• **Container 2 (Harmful Combinations):** Move `"HARMFUL COMBINATIONS"` label inside container, add top divider, wrap each ingredient in a coral status pill badge (`rounded-badge bg-status-error/25 border border-status-error/30`), with `+` separator and clinical reason below. |

---

## 2. Complete Resolved File Tree & Scope

```
frontend/src/
├── shared/
│   └── components/
│       ├── PopUpPanel.tsx                     ← [EXISTING BLUEPRINT] Sliding bottom sheet with native animations
│       └── WarningNote.tsx                    ← [EXISTING BLUEPRINT] Medical disclaimer callout note
│
└── features/scan/
    ├── model/
    │   ├── scan_types.ts                      ← [UNTOUCHED] Existing models support all required fields
    │   ├── scan_api.ts                        ← [UNTOUCHED] USE_MOCK branching already active
    │   └── scan_mock.ts                       ← [UNTOUCHED] Supplies rich sample data
    │
    ├── viewmodel/
    │   ├── useScanSubmit.ts                   ← [UPDATE] Connect open/close state to PopUpGuidelinesPanel
    │   ├── useScanAnalyzing.ts                ← [UNTOUCHED] Controls progress & stages
    │   └── useScanResults.ts                  ← [UNTOUCHED] Hydrates results & compatibility tabs
    │
    └── view/
        ├── ScanSubmitPage.tsx                 ← [UPDATE] Replace SkinGuidanceModal with PopUpGuidelinesPanel
        ├── ScanAnalyzingPage.tsx              ← [UNTOUCHED] Layout container intact
        ├── ScanResultsPage.tsx                ← [UNTOUCHED] Layout container intact
        │
        ├── containers/
        │   ├── analyzing/
        │   │   └── s1_AnalyzingVisual.tsx     ← [UNTOUCHED] Passes imageUri & progress to ring
        │   │
        │   └── results/
        │       ├── s2_ResultsTab.tsx          ← [RESTRUCTURE] Orchestrate the 6 containers in order
        │       └── s3_CompatibilityTab.tsx   ← [REDESIGN] 2 containers with internal headers & badges
        │
        └── components/
            ├── SubmitControls.tsx             ← [UPDATE] Expand Submit button dynamically to Retake
            ├── PopUpGuidelinesPanel.tsx       ← [NEW] Local component wrapping global PopUpPanel
            ├── AnalyzingProgressRing.tsx      ← [UPDATE] Resize inner image circle for ring visibility
            ├── CardGradientHeader.tsx         ← [NEW] Reusable SVG linear gradient header background
            ├── HealthScoreCard.tsx            ← [REDESIGN] Score-range gradients, badge, aligned circle
            ├── SkinTypeBanner.tsx             ← [REDESIGN] Secondary gradient, title/type, aligned circle
            ├── ConditionDetailCard.tsx        ← [REDESIGN] Red gradient header, flame badge, aligned pill
            ├── HistorySavedBanner.tsx         ← [NEW] Container 5 notice with CheckSquare icon
            └── SkinGuidanceModal.tsx          ← [DEPRECATED / REPLACED by PopUpGuidelinesPanel]
```

---

## 3. Detailed Component Architecture & Changes

### 3.1 Objective 1: Scan Submit Page (`ScanSubmitPage.tsx`)

#### A. Submit Controls (`SubmitControls.tsx`)
- **Current Behavior:** Both Retake and Submit buttons have fixed margins and `justify-between` spacing. Submit does not expand towards Retake.
- **Improved Behavior:**
  - Container: `flex-row items-center justify-between px-6 pb-4 pt-2 w-full`.
  - Retake Button: `shrink-0 flex-row items-center active:opacity-70 py-2 px-1`.
  - Submit Button: `flex-1 ml-4 flex-row items-center justify-between bg-neutral-white rounded-full pl-5 pr-2 py-2 shadow-sm active:opacity-90 active:scale-[0.98]`.
  - Dynamically adjusts: As screen width expands or contracts, or based on the Retake button's position, the Submit button stretches to consume the available horizontal space while keeping its inner text left-aligned and its circular arrow badge docked on the far right.

#### B. Guidelines Panel (`PopUpGuidelinesPanel.tsx`)
- **Blueprint Component Used:** `frontend/src/shared/components/PopUpPanel.tsx`
- **Features & Implementation:**
  - Replaces `SkinGuidanceModal.tsx` with smooth native spring/timing animations (spring sheet offset + quad opacity backdrop).
  - Configured with `style={2}` (clean content-only presentation with built-in close "✕" button in header).
  - Title: `"Skin Test Guidelines"`.
  - Content: Renders the 4 guidance tips (Lighting, No Makeup, Neutral Expression, Glasses Removed) with Lucide icons (`Sun`, `Sparkles`, `Smile`, `Glasses`), circular icon badge containers (`w-10 h-10 rounded-full bg-primary/10`), bold titles (`text-body-sm font-sans-bold text-neutral-text`), and descriptive captions (`text-caption font-sans text-neutral-muted`).
  - Added bottom CTA button: `"Got it, continue"` (`w-full bg-primary rounded-button py-3.5 items-center justify-center mt-3 active:opacity-80`) with white text (`text-label font-sans-bold text-neutral-white`).

---

### 3.2 Objective 2: Scan Analyzing Screen (`AnalyzingProgressRing.tsx`)

- **Problem:** The inner circular face preview was `w-[236px] h-[236px]` inside a `w-64 h-64` (256px) ring with a 4px border. On many devices, sub-pixel rounding and image overflow caused the photo to completely cover or touch the glowing green outline (`border-status-success`).
- **Solution:**
  - Outer ring: `w-64 h-64 rounded-full border-4 border-status-success items-center justify-center shadow-lg bg-neutral-text/50`.
  - Breathing room padding: Add `p-3.5` (or explicit size gap).
  - Inner image container: Reduce size to `w-52 h-52` (208px) `rounded-full overflow-hidden bg-neutral-muted/20 items-center justify-center border-2 border-neutral-muted/30`.
  - Clear visual outcome: The glowing green progress ring pulses around the circular photo with 20px of clear contrast gap, guaranteeing 100% visibility on all screen densities.

---

### 3.3 Objective 3: Scan Results — Results Tab Redesign (`s2_ResultsTab.tsx`)

Redesign the Results tab to mirror **Reference Image 1** with 6 ordered containers:

```
┌────────────────────────────────────────────────────────┐
│ [Container 1] Analyzed Face Photo                      │
├────────────────────────────────────────────────────────┤
│ [Container 2] Skin Health Score Card                   │
│   • Gradient Header (Green / Yellow / Orange / Red)    │
│   • Left: Title & Balance Badge                        │
│   • Right: Aligned Score Circle (e.g. 89%)             │
│   • Body: Summary Explanation                          │
├────────────────────────────────────────────────────────┤
│ [Container 3] Skin Type Card                           │
│   • Gradient Header (Secondary Token)                  │
│   • Left: "SKIN TYPE" & "Oily"                         │
│   • Right: Aligned Confidence Circle (e.g. 90%)        │
│   • Body: Summary Explanation                          │
├────────────────────────────────────────────────────────┤
│ [Container 4] Skin Conditions / Concerns Card          │
│   • Red Gradient Header ("CONCERNS")                   │
│   • Stacked Condition Banners:                         │
│     - Left: Circular Flame Badge + Condition Name      │
│     - Right: Aligned White Score Pill (e.g. 91%)       │
│     - Description, Symptoms & Causes in Coral/Red      │
├────────────────────────────────────────────────────────┤
│ [Container 5] History Saved Confirmation Card          │
│   • [☑] "These results have been saved to your skin   │
│         analysis history..."                           │
├────────────────────────────────────────────────────────┤
│ [Container 6] WarningNote (Medical Disclaimer)         │
│   • [⚠] "Disclaimer: This analysis is intended for...  │
└────────────────────────────────────────────────────────┘
```

#### Container Specifications:

1. **Container 1 — Submitted Image (`FacePhotoCard.tsx`):**
   - Rounded container: `mx-4 mt-4 rounded-card overflow-hidden border border-border bg-card shadow-xs`.
   - High-resolution preview of the submitted face image with 3:4 aspect ratio.

2. **Container 2 — Health Score Result (`HealthScoreCard.tsx`):**
   - Card wrapper: `mx-4 mt-4 rounded-card border border-border bg-card overflow-hidden shadow-xs`.
   - **Score Range Matrix & Gradient Header:**
     - `80 – 100`: Green (`#4CAF50` / `theme.colors.accent`) ➔ Badge: `"Optimal Balance"`, Gradient: `['rgba(76, 175, 80, 0.22)', 'rgba(76, 175, 80, 0.0)']`
     - `60 – 79`: Yellow (`#FFA726` / `theme.colors.status.warning`) ➔ Badge: `"Moderate Balance"`, Gradient: `['rgba(255, 167, 38, 0.22)', 'rgba(255, 167, 38, 0.0)']`
     - `40 – 59`: Orange (`#F57C00` / `theme.colors.note.warning.element`) ➔ Badge: `"Needs Attention"`, Gradient: `['rgba(245, 124, 0, 0.22)', 'rgba(245, 124, 0, 0.0)']`
     - `0 – 39`: Red (`#E53935` / `theme.colors.status.error`) ➔ Badge: `"Compromised Barrier"`, Gradient: `['rgba(229, 57, 53, 0.22)', 'rgba(229, 57, 53, 0.0)']`
   - **Header Layout:** `flex-row items-center justify-between p-4`.
     - Left: `"Skin Health Score"` (`text-h3 font-sans-bold text-text`) + status badge below (`rounded-badge px-2.5 py-0.5 mt-1.5 self-start`).
     - Right: Score circle (`w-14 h-14 rounded-full border-2 items-center justify-center bg-card shadow-xs`) with score text (`text-body font-sans-bold text-text`).
   - **Body:** Divider (`border-b border-border/40 mx-4`) + summary description (`p-4 text-body-sm font-sans text-text leading-5`).

3. **Container 3 — Skin Type Result (`SkinTypeBanner.tsx`):**
   - Card wrapper: `mx-4 mt-4 rounded-card border border-border bg-card overflow-hidden shadow-xs`.
   - **Header with Secondary Gradient:** `['rgba(212, 165, 116, 0.24)', 'rgba(212, 165, 116, 0.0)']` (using `theme.colors.secondary`).
   - **Header Layout:** `flex-row items-center justify-between p-4`.
     - Left: Label `"SKIN TYPE"` (`text-caption font-sans-semibold text-muted uppercase tracking-wider`) + Skin Type name e.g. `"Oily"` (`text-h2 font-sans-bold text-text mt-0.5`).
     - Right: Aligned confidence circle (`w-14 h-14 rounded-full border-2 border-secondary items-center justify-center bg-card shadow-xs`) with confidence percentage e.g. `"90%"` (`text-body font-sans-bold text-text`). **Matches the exact size and horizontal alignment of Container 2's circle.**
   - **Body:** Divider (`border-b border-border/40 mx-4`) + description of the diagnosed skin type (`p-4 text-body-sm font-sans text-text leading-5`).

4. **Container 4 — Skin Conditions / Concerns (`ConditionDetailCard.tsx`):**
   - Container card: `mx-4 mt-4 rounded-card border border-border bg-card overflow-hidden shadow-xs`.
   - **Top Label with Red Gradient:** `['rgba(229, 57, 53, 0.14)', 'rgba(229, 57, 53, 0.0)']` (using `theme.colors.status.error`), header title `"CONCERNS"` (`text-caption font-sans-semibold text-muted uppercase tracking-wider px-4 pt-3 pb-1`).
   - **Stacked Condition Banners (e.g. Redness, Inflammatory Acne):**
     - Banner header: Coral/pink background (`bg-[#FF8A80]/30 border-y border-border/40 px-3.5 py-2.5 flex-row items-center justify-between`).
     - Left: Overlapping flame badge (`w-9 h-9 rounded-full bg-status-error items-center justify-center mr-2.5`) with white `Flame` icon, and condition title (`text-body font-sans-bold text-text flex-1`).
     - Right: White pill score badge (`bg-card rounded-badge px-3 py-1 shadow-xs border border-border/20`) with confidence percentage e.g. `"91%"` (`text-status-error font-sans-bold text-caption`), **strictly right-aligned with containers 2 and 3**.
     - Content below banner:
       - Clinical description (`px-4 pt-3 text-body-sm font-sans text-text leading-5`).
       - Symptoms paragraph (`px-4 pt-2 text-body-sm font-sans text-text leading-5`).
       - Divider line (`border-b border-border/40 mx-4 my-3`).
       - Causes label (`px-4 text-body-sm font-sans-bold text-status-error`) and causes explanation (`px-4 pb-4 pt-1 text-body-sm font-sans text-text leading-5`).

5. **Container 5 — History Saved Notice (`HistorySavedBanner.tsx`):**
   - Card wrapper: `mx-4 mt-4 rounded-card border border-border bg-card p-4 flex-row items-center gap-3.5 shadow-xs`.
   - Left Icon: Checkbox with checkmark (`CheckSquare` icon, `size={22}`, `color={theme.colors.text}`).
   - Copywriting (improved per prompt):
     > *"These results have been saved to your skin analysis history so you can track your progress over time."* (`text-body-sm font-sans text-text flex-1 leading-5`).

6. **Container 6 — Medical Disclaimer Note (`WarningNote`):**
   - Uses shared component: `<WarningNote style={1} className="mx-4 mt-4" title="Disclaimer" description="This analysis is intended for educational and informational purposes only and should not be used for the self-diagnosis or treatment of any medical skin condition. If you have concerns about your skin health, please consult a board-certified dermatologist." />`

#### Card Gradient Implementation (`CardGradientHeader.tsx`):
- Uses `react-native-svg` (`Svg`, `Defs`, `LinearGradient`, `Stop`, `Rect`) positioned absolutely behind card header areas.
- **Why this approach?** `react-native-svg` is already installed in `package.json` (`v15.16.0`). It avoids installing new native packages, avoids Expo build complications, and renders high-performance hardware-accelerated linear gradients.

---

### 3.4 Objective 4: Scan Results — Compatibility Tab Improvements (`s3_CompatibilityTab.tsx`)

Refactor the tab to have **exactly 2 clean containers** matching **Reference Image 2**:

#### Container 1: Compatible Ingredients
- Card wrapper: `mx-4 mt-4 rounded-card border border-border bg-card p-4 shadow-xs`.
- Header **inside** container:
  - Row: `CheckCircle2` (`size={18}`, `color={theme.colors.accent}`) + `"COMPATIBLE INGREDIENTS"` (`text-body font-sans-bold text-text uppercase tracking-wider ml-2`).
  - Top divider: `border-b border-border mt-3 mb-2`.
- Items: List of ingredients with bold names and clinical reason descriptions, separated by subtle dividers (`border-t border-border/40 py-2.5`).

#### Container 2: Incompatible Combinations (Harmful Combinations)
- Direct replica of **Reference Image 2**:
- Card wrapper: `mx-4 mt-4 mb-8 rounded-card border border-border bg-card p-5 shadow-xs`.
- Header **inside** container:
  - Title: `"HARMFUL COMBINATIONS"` (`text-body font-sans-bold text-text uppercase tracking-wide`).
  - Horizontal divider: `border-b border-border mt-3 mb-4`.
- Items:
  - Each pair displayed as badge chips:
    - Ingredient A: `View` (`rounded-badge bg-status-error/25 border border-status-error/30 px-3.5 py-1.5 self-start`) ➔ `Text` (`text-body-sm font-sans-semibold text-status-error`).
    - Operator: `Text` (`text-body font-sans-bold text-text mx-2.5`) rendering `"+"`.
    - Ingredient B: `View` (`rounded-badge bg-status-error/25 border border-status-error/30 px-3.5 py-1.5 self-start`) ➔ `Text` (`text-body-sm font-sans-semibold text-status-error`).
  - Explanation: `Text` (`text-body-sm font-sans text-text mt-3 leading-5`) explaining the clinical conflict.
  - Horizontal separator: `border-b border-border my-4` between consecutive harmful combinations.

---

## 4. Design Tokens & Styling Compliance Matrix

All styles use tokens strictly from `frontend/tailwind.config.js` and `frontend/src/shared/theme/index.ts`:

| UI Element | Tailwind Utility Classes (`className`) | Runtime JS Props (`theme.colors.*`) |
|---|---|---|
| **Page Background** | `bg-background` (`#F5F0EB`) | `theme.colors.background` |
| **Card Containers** | `rounded-card border border-border bg-card` | `theme.colors.card`, `theme.colors.border` |
| **Primary Headers** | `text-h3 font-sans-bold text-text` | `theme.colors.text` |
| **Subtitles / Labels** | `text-caption font-sans-semibold text-muted uppercase tracking-wider` | `theme.colors.muted` |
| **Body Text** | `text-body-sm font-sans text-text leading-5` | `theme.colors.text` |
| **Health Score Badges** | `rounded-badge bg-accent/20 text-accent font-sans-semibold text-caption` | `theme.colors.accent` |
| **Health Score Circle** | `w-14 h-14 rounded-full border-2 border-accent items-center justify-center bg-card` | `theme.colors.accent` |
| **Skin Type Confidence Circle** | `w-14 h-14 rounded-full border-2 border-secondary items-center justify-center bg-card` | `theme.colors.secondary` |
| **Condition Score Pill** | `rounded-badge bg-card border border-border/20 px-3 py-1` | `theme.colors.card` |
| **Condition Flame Badge** | `w-9 h-9 rounded-full bg-status-error items-center justify-center` | `theme.colors.status.error`, `theme.colors.white` |
| **Harmful Combination Badges**| `rounded-badge bg-status-error/25 border border-status-error/30 px-3.5 py-1.5` | `theme.colors.status.error` |
| **Submit Button (Expanded)** | `flex-1 ml-4 bg-neutral-white rounded-full pl-5 pr-2 py-2` | `theme.colors.white`, `theme.colors.text` |
| **Analyzing Ring** | `w-64 h-64 rounded-full border-4 border-status-success` | `theme.colors.status.success` |
| **Analyzing Inner Image** | `w-52 h-52 rounded-full overflow-hidden bg-neutral-muted/20` | — |

---

## 5. Step-by-Step Implementation Sequence

1. **Step 1 — Submit Controls & Guidelines Panel:**
   - Modify `frontend/src/features/scan/view/components/SubmitControls.tsx` to expand the submit button (`flex-1 ml-4`) up to the Retake button.
   - Create `frontend/src/features/scan/view/components/PopUpGuidelinesPanel.tsx` wrapping `PopUpPanel`.
   - Update `ScanSubmitPage.tsx` to mount `PopUpGuidelinesPanel`.

2. **Step 2 — Analyzing Progress Ring Clearance:**
   - Update `frontend/src/features/scan/view/components/AnalyzingProgressRing.tsx`: shrink inner face image from `w-[236px]` to `w-52 h-52` (208px) with `p-3.5` padding.

3. **Step 3 — Results Tab Redesign (6 Containers):**
   - Create `frontend/src/features/scan/view/components/CardGradientHeader.tsx` (SVG linear gradient header).
   - Update `HealthScoreCard.tsx` (gradient header, score ranges, status badge, aligned score circle).
   - Update `SkinTypeBanner.tsx` (secondary gradient, uppercase label, aligned confidence circle).
   - Update `ConditionDetailCard.tsx` (concerns header, coral banner, flame badge, aligned white score pill).
   - Create `frontend/src/features/scan/view/components/HistorySavedBanner.tsx` (Container 5 notice).
   - Update `s2_ResultsTab.tsx` to render Containers 1 to 6 in exact order, including `WarningNote`.

4. **Step 4 — Compatibility Tab Refactor (2 Containers):**
   - Update `frontend/src/features/scan/view/containers/results/s3_CompatibilityTab.tsx` to place labels inside both containers and implement the badge-chip combination rows matching Image 2.

5. **Step 5 — Verification & Linting:**
   - Verify TypeScript compilation across all touched files.
   - Inspect token adherence, responsive layout, and visual alignment.

---

> 🛑 **MANDATORY CHECKPOINT — STOP HERE FOR REVIEW**  
> This implementation plan is presented for your review and approval. Please confirm or provide any feedback before code implementation begins.

