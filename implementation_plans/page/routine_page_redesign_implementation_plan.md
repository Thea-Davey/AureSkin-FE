# Implementation Plan — Routine Page Redesign (Empty & Active States)

This implementation plan outlines the architecture, component hierarchy, design token adherence, and user flows for redesigning both the **No Routine Yet** page and the **Active Routine** page in AureSkin, strictly complying with [`frontend-rules.md`](file:///c:/Users/Thea/Documents/DLSUD/AureSkin/.agents/rules/frontend-rules.md) and AureSkin MVVM architecture.

---

## 1. Overview & Reference Mapping

| Target Area | Target Screen / Component | Reference Image | UI Doc Section |
|---|---|---|---|
| **Empty Routine** | Container 1: `RoutineSkinProfileCard` | [`target_images/1.png`](file:///c:/Users/Thea/Documents/DLSUD/AureSkin/frontend/implementation_plans/page/target_images/1.png) | Section 6.1 Routine Page (No Routine Yet) |
| **Empty Routine** | Container 2: `RoutineGenerationCard` | [`target_images/2.png`](file:///c:/Users/Thea/Documents/DLSUD/AureSkin/frontend/implementation_plans/page/target_images/2.png) | Section 6.1 Routine Page (No Routine Yet) |
| **Empty Routine** | Container 3: `RoutineDisclaimer` | Replaces with global `WarningNote` | Section 6.1 Routine Page (No Routine Yet) |
| **Active Routine** | Container 1: `RoutineActiveSkinProfileCard` | [`target_images/5.png`](file:///c:/Users/Thea/Documents/DLSUD/AureSkin/frontend/implementation_plans/page/target_images/5.png) | Section 6.2 Routine Page (Active Routine) |
| **Active Routine** | Container 2: Morning Routine Container | [`target_images/3.png`](file:///c:/Users/Thea/Documents/DLSUD/AureSkin/frontend/implementation_plans/page/target_images/3.png) | Section 6.2 Routine Page (Active Routine) |
| **Active Routine** | Container 2: Night Routine Container | [`target_images/4.png`](file:///c:/Users/Thea/Documents/DLSUD/AureSkin/frontend/implementation_plans/page/target_images/4.png) | Section 6.2 Routine Page (Active Routine) |
| **Active Routine** | Container 3: `WhyThisRoutineNote` | [`target_images/4.png`](file:///c:/Users/Thea/Documents/DLSUD/AureSkin/frontend/implementation_plans/page/target_images/4.png) (bottom note) | Section 6.2 Routine Page (Active Routine) |
| **Global Component** | `NotifDialog` Blueprint + Local `NewSkinAnalysisDetectedDialog` | [`target_images/6.png`](file:///c:/Users/Thea/Documents/DLSUD/AureSkin/frontend/implementation_plans/page/target_images/6.png) | Section 6.2 & Shared Components |
| **Local Component** | `DeleteRoutineDialog` (calls global `DeleteDialog`) | [`target_images/7.png`](file:///c:/Users/Thea/Documents/DLSUD/AureSkin/frontend/implementation_plans/page/target_images/7.png) | Section 6.2 & Shared Components |

---

## 2. Review & Recommendations: `DeleteRoutineDialog` Copywriting (Image 7)

The user specifically requested review on the title, body, and button texts in Reference Image 7:

### 2.1 Title Analysis
- **Current title in Image 7:** `"Delete New Routine"`
- **Issue:** Grammatically and conceptually contradictory. The user is on an existing active routine and tapped "Generate New Routine" (or is about to generate one). What is being deleted or overwritten is the **current / existing routine**, not the new routine! Calling it "Delete New Routine" implies the user is discarding the new routine before it has even been created.
- **Recommended Title Options:**
  - **Option A (Strongly Recommended):** `"Replace Current Routine"` — Clear, non-alarming, and describes the exact action (replacing the active routine with a freshly generated one).
  - **Option B:** `"Reset Current Routine"` — Emphasizes wiping current steps to rebuild from scratch.
  - **Option C:** `"Delete Current Routine"` — Direct and accurate if you want to emphasize deletion.

### 2.2 Body Text Analysis
- **Current body in Image 7:** `"This will delete the current Morning and Night routine to generate new routine."`
- **Issue:** Minor missing article (`"to generate new routine"` ➔ `"to generate a new routine"`).
- **Recommended Body:** 
  > `"This will **delete your current Morning and Night routine** to generate a new personalized routine."`
  *(The phrase `"delete your current Morning and Night routine"` is rendered with `font-sans-bold` using the `boldPhrase` feature of `DeleteDialog`).*

### 2.3 Button Texts Analysis
- **Cancel Button:** `"Keep Routine"` — Clean, intuitive, reassuring, perfectly aligned with Image 7.
- **Confirm Button:** 
  - If Title is `"Replace Current Routine"`: `"Replace Routine"` or `"Delete & Replace"` (styled with `bg-status-error text-neutral-white`).
  - If Title is `"Delete Current Routine"`: `"Delete Routine"` (matching Image 7).

---

## 3. Complete Resolved File Tree

```
frontend/src/
├── shared/
│   └── components/
│       ├── NotifDialog.tsx               ← [NEW] Global notification dialog blueprint (Image 6)
│       ├── DeleteDialog.tsx              ← [EXISTING] Global delete/confirmation dialog (Image 7 base)
│       ├── PositiveNote.tsx              ← [EXISTING] Global positive callout note (Image 4 bottom base)
│       ├── WarningNote.tsx               ← [EXISTING] Global warning callout note (Disclaimer base)
│       └── index.ts                      ← [MODIFIED] Export NotifDialog & NotifDialogProps
│
└── features/routine/
    ├── model/
    │   ├── routine_types.ts              ← [MODIFIED] Add health_score, formatted_date, editable step payloads
    │   ├── routine_api.ts                ← [MODIFIED] Include USE_MOCK toggle, CRUD for step order/add/delete
    │   └── routine_mock.ts               ← [MODIFIED] 5 AM steps, 4 PM steps, health score & date
    │
    ├── viewmodel/
    │   └── useRoutine.ts                 ← [MODIFIED] Day/Night toggle, inline edit mode, step swap/drag/delete, dialog controls
    │
    └── view/
        ├── RoutinePage.tsx               ← [MODIFIED] Main shell coordinating empty/active views & global dialogs
        │
        ├── containers/
        │   ├── s1_EmptyRoutine.tsx       ← [MODIFIED] Container 1 (Image 1) + Container 2 (Image 2) + WarningNote
        │   └── s2_RoutineSteps.tsx       ← [MODIFIED] Simplified Profile (Image 5) + Toggle + Unified AM/PM Container (Images 3 & 4) + WhyThisRoutineNote
        │
        └── components/
            ├── RoutineSkinProfileCard.tsx        ← [REDESIGNED] "Your Skin Profile" (Image 1: Type, Concerns, Circular Gauge)
            ├── RoutineGenerationCard.tsx         ← [REDESIGNED] "Ready for Your Custom Regimen?" (Image 2: offwhite, centered, 3 pills, secondary CTA)
            ├── RoutineActiveSkinProfileCard.tsx  ← [NEW] Simplified Profile Card (Image 5: Type, Concerns, Date, "···" button)
            ├── RoutineActionMenu.tsx             ← [NEW] Action bottom sheet from "···" with "Generate New Routine"
            ├── RoutineTimeOfDayCard.tsx          ← [NEW] Unified AM/PM routine container with 5 AM / 4 PM initial steps
            ├── RoutineStepItem.tsx               ← [NEW] Individual step row with bottle/tube icon, name, brand, and edit triggers
            ├── SwapProductSheet.tsx              ← [REDESIGNED] Slide-up sheet with search bar & ranked compatible product recommendations
            ├── WhyThisRoutineNote.tsx            ← [NEW] Local wrapper for PositiveNote style 1
            ├── NewSkinAnalysisDetectedDialog.tsx ← [NEW] Local wrapper for NotifDialog (Image 6)
            └── DeleteRoutineDialog.tsx           ← [NEW] Local wrapper for DeleteDialog (Image 7)
```

---

## 4. Design Tokens & Styling Compliance Matrix

All visual styling adheres strictly to `frontend/tailwind.config.js` and `frontend/src/shared/theme/index.ts`:

| UI Element | Tailwind Utility Classes (`className`) | Runtime JS Props (`theme.colors.*`) |
|---|---|---|
| **Page Background** | `bg-primary` (Olive sage green) | `theme.colors.primary` |
| **Card Containers (Off-white)** | `bg-neutral-offwhite rounded-card border border-neutral-border` | `theme.colors.background` |
| **Night Routine Header** | `bg-secondary` (Warm beige/terracotta) | `theme.colors.secondary` |
| **CTA Buttons (Primary)** | `bg-secondary rounded-button py-3.5 px-5 active:opacity-80` | `theme.colors.secondary` |
| **Action / Destructive Button** | `bg-status-error rounded-button py-3 active:opacity-80` | `theme.colors.status.error` |
| **Health Score Ring & Gauge** | `text-note-positive-element font-sans-bold` | `theme.colors.accent` |
| **Pill Badges & Caps** | `bg-primary/10 rounded-badge` or `bg-neutral-card rounded-badge` | `theme.colors.primary` |
| **Typography - Display/Headings** | `text-h2 font-sans-bold text-text`, `text-h3 font-sans-bold text-text` | N/A |
| **Typography - Body & Subtitles** | `text-body-sm font-sans text-muted`, `text-caption font-sans text-muted` | N/A |
| **Positive Callout ("Why this routine?")** | `bg-note-positive border-note-positive-border text-note-positive-title` | `theme.colors.note.positive.icon` |
| **Warning Callout ("Disclaimer")** | `bg-note-warning border-note-warning-border text-note-warning-title` | `theme.colors.note.warning.icon` |
| **Dialog Dark Top Bar (NotifDialog)** | `bg-primary` (Deep olive green) | `theme.colors.primary` |

---

## 5. Detailed Component & Container Specifications

### 5.1 No Routine Yet Page (`s1_EmptyRoutine.tsx`)

#### Container 1: `RoutineSkinProfileCard.tsx` (Reference Image 1)
- **Background:** `bg-neutral-offwhite rounded-card border border-neutral-border p-4 shadow-xs`.
- **Row 1 (Header):**
  - Left title: `"Your Skin Profile"` (`text-h3 font-sans-bold text-text`).
  - Subtitle: `"Based on your latest skin analysis: May 1, 2026"` (`text-caption font-sans text-muted mt-0.5`).
- **Row 2 (Split Columns):**
  - **Left Column (`flex-1 mr-3 gap-2.5`):**
    - **Type Pill:** `bg-primary/10 rounded-badge px-3 py-2 flex-row items-center justify-between`:
      - Left: `Droplet` icon (`size={16}`, `color={theme.colors.primary}`) + `"Type"` (`text-body-sm font-sans text-muted ml-1.5`).
      - Right: `"Oily"` (`text-body-sm font-sans-bold text-text`).
    - **Concerns Pill:** `bg-primary/10 rounded-card px-3 py-2 flex-row items-start justify-between`:
      - Left: `Droplet` icon (`size={16}`, `color={theme.colors.primary}`) + `"Concerns"` (`text-body-sm font-sans text-muted ml-1.5`).
      - Right: Stacked list of detected conditions (e.g. `"Redness\nInflammatory Acne\nBlackheads"`) (`text-body-sm font-sans-bold text-text text-right leading-5`).
  - **Right Column (`items-center justify-center w-28`):**
    - Circular Health Score Gauge:
      - Custom SVG / Canvas ring (`stroke={theme.colors.accent}`, `strokeWidth={6}`).
      - Center text: `89%` (`text-h2 font-sans-bold text-accent`).
      - Bottom label: `HEALTHY` (`text-caption font-sans-bold text-accent tracking-wider mt-1`).
- **Profile Icon:** Fully removed as requested.

#### Container 2: `RoutineGenerationCard.tsx` (Reference Image 2)
- **Background:** `bg-neutral-offwhite rounded-card border border-neutral-border p-6 items-center shadow-xs`.
- **Top Icon Badge:**
  - Outer circle: `w-20 h-20 rounded-full bg-neutral-card border-4 border-neutral-white shadow-xs items-center justify-center relative mb-3`.
  - Icon: `FlaskConical` (`size={32}`, `color={theme.colors.primary}`).
  - Star Badge: `absolute -top-1 -right-1 w-6 h-6 rounded-full bg-neutral-white shadow-xs items-center justify-center border border-border/40`.
    - `Star` icon (`size={12}`, `color={theme.colors.secondary}`, `fill={theme.colors.secondary}`).
- **Heading:** `"Ready for Your Custom Regimen?"` (`text-h2 font-sans-bold text-text text-center`).
- **General Body Text:** 
  > `"Our dermatological engine will formulate an AM & PM routine perfectly balanced for your unique skin."` (`text-body-sm font-sans text-muted text-center mt-2 mb-5 px-2`).
  *(Omits hardcoded "for oily skin and targeted redness control").*
- **Checklist Container:**
  - Grouped wrapper containing 3 white pill cards (`w-full gap-2.5 mb-6`):
    - Pill 1: `bg-neutral-white rounded-button p-3 flex-row items-center shadow-xs border border-border/40`:
      - Icon: `Check` in `w-6 h-6 rounded-full bg-note-positive items-center justify-center mr-3`.
      - Text: `"Step-by-step AM & PM guide"` (`text-body-sm font-sans-medium text-text`).
    - Pill 2: Same structure with `"Ingredient safety match"`.
    - Pill 3: Same structure with `"Adaptive product suggestions"`.
- **CTA Button:**
  - `"GENERATE SKINCARE ROUTINE"` + `ArrowRight` icon.
  - Class: `w-full rounded-button bg-secondary py-3.5 px-4 flex-row items-center justify-center shadow-md active:opacity-80`.
  - Text: `text-label font-sans-bold text-neutral-white mr-2 tracking-wide`.

#### Container 3: `RoutineDisclaimer.tsx` (Replaced with `WarningNote`)
- Uses shared `WarningNote` with `style={1}`:
  - `title="Disclaimer"`
  - `description="This routine is AI-generated and is not a substitute for professional dermatological advice."`

---

### 5.2 Active Routine Page (`s2_RoutineSteps.tsx`)

#### Container 1: `RoutineActiveSkinProfileCard.tsx` (Reference Image 5)
- **Background:** `bg-neutral-offwhite rounded-card border border-neutral-border p-4 shadow-xs`.
- **Top Row:**
  - Left: `"Skin Profile"` (`text-body font-sans-bold text-text`) + `" Last updated: May 1, 2026"` (`text-caption font-sans text-muted ml-2`).
  - Right: `"···"` icon button (`MoreHorizontal`, `size={20}`, `color={theme.colors.text}`, `hitSlop={10}`).
- **Bottom Row:**
  - Dual split-capsule badges:
    - **Type Split Capsule:**
      - Capsule container: `flex-row items-center rounded-badge overflow-hidden border border-border/40 bg-neutral-white shadow-xs mr-3`.
      - Left segment: `bg-primary/10 px-3 py-2 items-center justify-center` ➔ `"Type"` (`text-body-sm font-sans text-muted`).
      - Right segment: `bg-neutral-white px-3 py-2 items-center justify-center` ➔ `"Oily"` (`text-body-sm font-sans-bold text-text`).
    - **Concerns Split Capsule:**
      - Capsule container: `flex-row items-start rounded-card overflow-hidden border border-border/40 bg-neutral-white shadow-xs flex-1`.
      - Left segment: `bg-primary/10 px-3 py-2 items-center justify-center` ➔ `"Concerns"` (`text-body-sm font-sans text-muted`).
      - Right segment: `bg-neutral-white px-3 py-2 justify-center flex-1` ➔ Stacked conditions `"Redness\nInflammatory Acne\nBlackheads"` (`text-body-sm font-sans-bold text-text leading-5`).
- **Action Modal (`RoutineActionMenu.tsx`):**
  - Tapping `"···"` opens a clean bottom sheet containing:
    - Header: `"Routine Options"` (`text-body font-sans-bold text-text`).
    - Action Item: `RefreshCw` / `Sparkles` icon + `"Generate New Routine"` (`text-body-sm font-sans-semibold text-text`).
    - Tapping `"Generate New Routine"` closes the menu and opens `DeleteRoutineDialog`.

#### Container 2: Day / Night Toggle + Unified Routine Container (Reference Images 3 & 4)
- **Day / Night Toggle Bar:**
  - Container: `rounded-card bg-neutral-card/60 p-1 flex-row items-center border border-border/40 mb-3`.
  - **Morning Tab (Sun):**
    - When Active (AM): `bg-secondary rounded-button py-2.5 flex-1 items-center justify-center shadow-xs` with `Sun` icon (`size={20}`, `color={theme.colors.white}`).
    - When Inactive: `transparent rounded-button py-2.5 flex-1 items-center justify-center` with `Sun` icon (`size={20}`, `color={theme.colors.white}`).
  - **Night Tab (Moon):**
    - When Active (PM): `bg-neutral-offwhite rounded-button py-2.5 flex-1 items-center justify-center shadow-xs` with `MoonStar` icon (`size={20}`, `color={theme.colors.text}`).
    - When Inactive: `transparent rounded-button py-2.5 flex-1 items-center justify-center` with `MoonStar` icon (`size={20}`, `color={theme.colors.text}`).

- **Unified Routine Container (`RoutineTimeOfDayCard.tsx`):**
  - Encapsulates both AM and PM views inside a single component responding to the active toggle.
  - **Header Layout:**
    - **Morning Header (Image 3):**
      - Background: `bg-neutral-offwhite px-4 py-3.5 flex-row items-center border-b border-border/30 rounded-t-card`.
      - Icon: `Sun` (`size={24}`, `color={theme.colors.secondary}`).
      - Title: `"Morning Routine"` (`text-h3 font-sans-bold text-text`).
      - Subtitle: `"Protect & hydrate your skin"` (`text-caption font-sans text-muted`).
      - "EDIT" button: `bg-secondary/80 rounded-button px-4 py-1.5 active:opacity-75` ➔ Text: `"EDIT"` (`text-caption font-sans-bold text-neutral-white`).
    - **Night Header (Image 4):**
      - Background: `bg-secondary px-4 py-3.5 flex-row items-center border-b border-secondary/30 rounded-t-card`.
      - Icon: `MoonStar` (`size={24}`, `color={theme.colors.text}`).
      - Title: `"Night Routine"` (`text-h3 font-sans-bold text-neutral-white`).
      - Subtitle: `"Protect & hydrate your skin"` (`text-caption font-sans text-neutral-white/90`).
      - "EDIT" button: `bg-neutral-white rounded-button px-4 py-1.5 active:opacity-75` ➔ Text: `"EDIT"` (`text-caption font-sans-bold text-text`).
  - **Step Timeline Structure:**
    - White content area: `bg-card px-4 py-5 rounded-b-card`.
    - Continuous vertical connector line: `w-px bg-border absolute left-8 top-6 bottom-6`.
    - **Step Initial Counts:**
      - **Morning (5 steps):**
        1. Cleanser
        2. Toner
        3. Serum / Treatment
        4. Moisturizer
        5. Sunscreen
      - **Night (4 steps):**
        1. Cleanser
        2. Toner
        3. Serum / Treatment
        4. Moisturizer *(Sunscreen excluded!)*
    - **Step Item Layout (`RoutineStepItem.tsx`):**
      - Step Circle: `w-8 h-8 rounded-full bg-primary/10 items-center justify-center z-10`, Text: `1, 2, 3...` (`text-caption font-sans-bold text-primary`).
      - Step Details:
        - Step Name: `"Cleanser"` (`text-body font-sans-bold text-text`).
        - Step Description: `"Remove excess oil and impurities gently."` (`text-caption font-sans text-muted`).
        - Product Card: `flex-row items-center p-2.5 rounded-button bg-card border border-border/60 mt-2`:
          - Bottle/Tube Icon: `Package` or `FlaskConical` (`size={22}`, `color={theme.colors.primary}`).
          - Text block: `"Product name"` (`text-body-sm font-sans-bold text-text`) and `"brand • category"` (`text-caption font-sans text-muted`).

#### Container 3: `WhyThisRoutineNote.tsx` (Reference Image 4 Bottom)
- Located below the active routine container.
- Implemented as a local component using global `PositiveNote` (`style={1}`):
  - `title="Why this routine?"`
  - `description="This routine is designed to address your acne & texture concerns while maintaining healthy and balanced skin."`
  - Container styling: `bg-note-positive border-note-positive-border p-4 rounded-card`.

---

### 5.3 Redesigned Edit Routine Workflow

The old pop-up filter panel is discarded in favor of a flexible editing state:

1. **Inline Edit Mode Activation:**
   - Tapping `"EDIT"` switches the routine container into `isEditing = true` state.
   - Header shows `"Cancel"` and `"Save Changes"` (`bg-secondary rounded-button px-4 py-2`).
2. **Step Manipulation Capabilities:**
   - **Reorder Steps (Draggable):** Each step displays a drag handle (`GripVertical`, `size={20}`, `color={theme.colors.muted}`) enabling vertical reordering.
   - **Delete Step:** Each step has a delete button (`MinusCircle` or `Trash2`, `size={18}`, `color={theme.colors.error}`). Deleting re-numbers remaining steps sequentially.
   - **Add Step:** Bottom of steps list features a `"+ Add Step"` dashed pill button (`rounded-button border border-dashed border-border py-3 flex-row items-center justify-center`). Tapping lets the user choose step category (e.g. Second Serum, Face Oil, Mask).
   - **Swap Product:** Tapping the product card inside any step opens `SwapProductSheet.tsx`.
3. **Product Swap Sheet (`SwapProductSheet.tsx`):**
   - Slides up smoothly from the bottom.
   - Search bar at top: `"Search compatible products..."` with real-time debounced query.
   - Categorized and ranked list of **compatible products** scored for the user's skin profile.
   - Tapping an alternative product instantly updates the step's assigned product.

---

### 5.4 Dialogs & Notifications (Reference Images 6 & 7)

#### 1. Global Shared Component: `NotifDialog.tsx` (Reference Image 6)
- **File location:** `frontend/src/shared/components/NotifDialog.tsx`.
- **Props interface:**
  ```typescript
  export interface NotifDialogProps {
    visible: boolean;
    title: string;
    subtitle?: string;
    body: string | React.ReactNode;
    boldPhrase?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
    onClose?: () => void;
    testID?: string;
  }
  ```
- **Layout:**
  - Full-screen modal with dark overlay (`bg-black/50`).
  - Container: `w-full max-w-[360px] rounded-card overflow-hidden shadow-2xl bg-card`.
  - **Top Portion (`bg-primary p-6 items-center relative`):**
    - Close icon `X` (`size={18}`, `color={theme.colors.white}`) in top-right.
    - Circular badge: `w-16 h-16 rounded-full border-2 border-white items-center justify-center mb-3`.
    - Icon: `AlertCircle` / `Info` (`size={32}`, `color={theme.colors.white}`).
    - Title: `text-h2 font-sans-bold text-neutral-white text-center mb-1`.
    - Subtitle: `text-body-sm font-sans text-neutral-white/90 text-center`.
  - **Bottom Portion (`bg-neutral-white p-6`):**
    - Body copy: `text-body-sm font-sans text-text mb-6 leading-5` with `boldPhrase` highlighted in `font-sans-bold`.
    - Dual Action Buttons:
      - Cancel Button: `flex-1 py-3 rounded-button border border-border bg-card items-center justify-center active:opacity-70`. Text: `text-body-sm font-sans-semibold text-text`.
      - Confirm Button: `flex-1 py-3 rounded-button bg-primary items-center justify-center active:opacity-80`. Text: `text-body-sm font-sans-semibold text-neutral-white`.

#### 2. Local Component: `NewSkinAnalysisDetectedDialog.tsx`
- Encapsulates `NotifDialog` with exact copy from Image 6:
  - `title="New Skin Analysis Detected"`
  - `subtitle="Current routine might not be aligned with new analysis"`
  - `body="Would you like to generate new routine based on your new skin profile?"`
  - `boldPhrase="generate new routine"`
  - `cancelLabel="Keep Current Routine"`
  - `confirmLabel="Generate New Routine"`

#### 3. Local Component: `DeleteRoutineDialog.tsx` (Reference Image 7)
- Built on `DeleteDialog.tsx` with updated copywriting:
  - `title="Replace Current Routine"` *(or `"Delete Current Routine"`)*
  - `body="This will delete your current Morning and Night routine to generate a new personalized routine."`
  - `boldPhrase="delete your current Morning and Night routine"`
  - `cancelLabel="Keep Routine"`
  - `confirmLabel="Delete Routine"` *(or `"Replace Routine"`)*

---

## 6. ViewModel State & Data Contracts (`useRoutine.ts`)

```typescript
export interface UseRoutineReturn {
  // Routine data
  routine: SkincareRoutine | null;
  skinProfile: RoutineSkinProfile | null;
  isRoutineLoading: boolean;
  isSkinProfileLoading: boolean;
  isRefreshing: boolean;
  isGenerating: boolean;
  routineError: string | null;
  profileError: string | null;
  generationError: string | null;

  // Day / Night Tab
  activeTimeOfDay: 'morning' | 'evening';

  // Inline Step Editing State
  isEditing: boolean;
  draftSteps: RoutineStep[];

  // Product Swapping
  swapSheetVisible: boolean;
  swappingStepId: string | null;
  productOptions: RoutineProduct[];
  productSearch: string;
  isProductOptionsLoading: boolean;

  // Dialog & Modal Visibilities
  showSkinProfileMenu: boolean;
  showNewAnalysisDialog: boolean;
  showDeleteRoutineDialog: boolean;

  // Actions
  actions: {
    setActiveTimeOfDay: (time: 'morning' | 'evening') => void;
    startEditing: () => void;
    cancelEditing: () => void;
    saveEditing: () => void;
    reorderSteps: (newSteps: RoutineStep[]) => void;
    deleteStep: (stepId: string) => void;
    addStep: (category: string) => void;
    openSwapProduct: (stepId: string) => void;
    closeSwapProduct: () => void;
    selectProductForStep: (product: RoutineProduct) => void;
    setProductSearch: (query: string) => void;
    openSkinProfileMenu: () => void;
    closeSkinProfileMenu: () => void;
    openDeleteRoutineDialog: () => void;
    closeDeleteRoutineDialog: () => void;
    dismissNewAnalysisDialog: () => void;
    generate: () => void;
    refresh: () => Promise<void>;
    retryRoutine: () => void;
    retryProfile: () => void;
    clearGenerationError: () => void;
  };
}
```

---

## 7. Navigation & State Handling Matrix

| User Action | Trigger / Event | UI / Navigation Result |
|---|---|---|
| Tap "GENERATE SKINCARE ROUTINE" on Empty Page | `actions.generate()` | Shows spinner, calls `POST /routine/generate`, transitions to Active Routine. |
| Tap Day / Night toggle | `actions.setActiveTimeOfDay('morning' \| 'evening')` | Switches active header styling and step list (5 AM / 4 PM). |
| Tap "EDIT" button on routine card | `actions.startEditing()` | Enters inline drag/edit mode with delete/reorder controls. |
| Tap product row in step | `actions.openSwapProduct(step.id)` | Slides up `SwapProductSheet` with ranked compatible products. |
| Tap "···" on Active Skin Profile | `actions.openSkinProfileMenu()` | Opens bottom action menu with "Generate New Routine". |
| Tap "Generate New Routine" in menu | `actions.openDeleteRoutineDialog()` | Closes menu, presents `DeleteRoutineDialog` confirmation. |
| Tap "Keep Routine" in Delete Dialog | `actions.closeDeleteRoutineDialog()` | Dismisses dialog without any changes. |
| Tap "Delete Routine" in Delete Dialog | `actions.generate()` | Deletes existing routine, generates fresh regimen, updates UI. |
| Detection of new skin analysis | Automatic trigger on load/mount | Displays `NewSkinAnalysisDetectedDialog`. |

---

## 8. Verification & Review Checkpoint

> 🛑 **MANDATORY CHECKPOINT — STOP HERE FOR REVIEW**
> 
> Please review this implementation plan artifact. Verify that:
> 1. The layouts for **Empty Routine** (`1.png` & `2.png`), **Active Routine** (`3.png`, `4.png`, `5.png`), and **Dialogs** (`6.png` & `7.png`) match your requirements.
> 2. The copywriting recommendation for `DeleteRoutineDialog` (`"Replace Current Routine"` vs `"Delete Current Routine"`) is approved.
> 3. The 5 AM and 4 PM initial step structure with inline drag-and-drop / product swapping meets your expectations.
>
> Once you confirm, we will proceed to full implementation!

