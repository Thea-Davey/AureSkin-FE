# AureSkin — Screen Architecture & Implementation Prompt Template

> **What this is:** A reusable prompt template. You specify the **Target Screen name**, and can optionally provide the **UI Doc Section** and **Reference Image** to save AI token usage.
>
> **How to use:**
> 1. Copy the text in the **PROMPT** section below.
> 2. Fill in:
>    - `Target Screen: [ENTER SCREEN NAME HERE]`
>    - *(Optional token saver)* `UI Doc Section: [e.g., 3.1 Library Page (Ingredients Tab)]`
>    - *(Optional token saver)* `Reference Image: [e.g., library_ingredients.png]`
> 3. Paste it to the AI agent.
>
> **Why only these two optional fields?**
> Providing the section and image allows the agent to jump directly to the ~80 lines of spec and the exact image, saving thousands of tokens from having to search through the 1,244-line `ui_design_reference.md` file.
>
> **Everything else is resolved by the AI:**
> Feature folder name, file naming, model types, viewmodel hook, container & component breakdowns, and the `USE_MOCK` toggle description are all automatically determined by the AI using `part2_technical_view.md` to guarantee 100% architectural accuracy and naming consistency.

---

---

# 📌 PROMPT (Copy everything below, fill in your screen name, and send to the agent)

---

### Target Screen: [ENTER SCREEN NAME HERE]
- **UI Doc Section (Optional - saves tokens):** [e.g., 3.1 Library Page (Ingredients Tab), or leave blank to auto-detect]
- **Reference Image (Optional - saves tokens):** [e.g., library_ingredients.png, or leave blank to auto-detect]

*(Examples: `Library Page (Ingredients Tab)`, `Login Screen`, `Scan Result Screen`, `Add Product Form`, etc.)*

You are an expert React Native / Expo architect and developer working on the **AureSkin** mobile app.
AureSkin uses NativeWind (Tailwind utility classes) for styling, React Query for server state,
Zustand for global client state, and a FastAPI + Supabase backend.

Your task is to:
1. Automatically look up the **Target Screen** across all reference documents (using the provided UI Doc Section & Reference Image if supplied, or auto-detecting them if left blank).
2. Resolve all feature paths, file naming conventions, container/component breakdowns, and data dependencies.
3. Produce a **complete, detailed architecture and implementation plan** as a markdown artifact.
4. **STOP and wait for user review and approval** before implementing any code.

---

## 1. Reference Documents & Automated Discovery

Before creating the plan, read and inspect the following files to locate the target screen:

1. **`documentation/part2_technical_view.md`**
   - Locate the target screen in the full `frontend/src/` file tree.
   - **The complete file tree inside this document is the primary reference for what files to create and how they must be named.** Only fall back to the General Naming Conventions below for files not explicitly listed there.
   - Review the MVVM architecture rules, naming conventions, and shared layer contracts.

2. **`frontend/design_references/ui_design_reference.md`**
   - If the user specified a **UI Doc Section**, navigate directly to that section. Otherwise, search the document for the section corresponding to the **Target Screen**.
   - Review purpose, all UI elements & functions, data displayed, animations, screen states, and navigation routes.

3. **`frontend/design_references/[Matched Image Filename]`**
   - If the user specified a **Reference Image**, view that file. Otherwise, extract the filename specified under `Reference Image:` in the matched section of `ui_design_reference.md`.
   - View the exported Figma image corresponding to the target screen as the visual ground truth for layout, proportions, and UI hierarchy.

4. **`frontend/src/shared/theme/index.ts`**
   - Runtime TypeScript color tokens (`theme.colors.*`). Use these exclusively for any JS prop values (icon colors, SVG strokes, `StatusBar`, `ActivityIndicator`, shadow colors, etc.).

5. **`frontend/tailwind.config.js`**
   - Authoritative design tokens for all Tailwind utility classes in `className` props:
     - **Colors:** `bg-primary`, `text-text`, `text-muted`, `bg-background`, `border-border`, `bg-card`, `bg-secondary`, `bg-accent`, `bg-error`, etc.
     - **Font Size Presets:** `text-display` (32px), `text-h1` (26px), `text-h2` (22px), `text-h3` (18px), `text-body` (16px), `text-body-sm` (14px), `text-caption` (12px), `text-label` (14px).
     - **Border Radius Presets:** `rounded-card` (16px), `rounded-button` (12px), `rounded-input` (10px), `rounded-badge` (20px), `rounded-full` (9999px).
     - **Font Family Presets:** `font-sans` (Inter 400), `font-sans-medium` (Inter 500), `font-sans-semibold` (Inter 600), `font-sans-bold` (Inter 700), `font-heading` (Outfit 700).

6. **`frontend/src/features/home/`** (all files)
   - The completed Home Screen is your living reference implementation. Mirror its MVVM pattern, mock centralization, `USE_MOCK` toggle structure, and component styling conventions.

> ⚠️ **CRITICAL — STRICT DESIGN TOKEN ADHERENCE (NO RAW / ARBITRARY VALUES)**
> 1. **No Raw Hex Colors:** Every color must come from `theme.colors.*` (for JS prop values) or Tailwind utility class names from `tailwind.config.js` (for `className` props). Never write a raw hex string like `"#6B7B4C"` or `color="#D4A574"`.
> 2. **Preset Font Sizes Only:** Strictly use font size presets (`text-display`, `text-h1`, `text-h2`, `text-h3`, `text-body`, `text-body-sm`, `text-caption`, `text-label`). Never use arbitrary sizes (`text-[14px]`) or generic Tailwind sizes (`text-xs`, `text-sm`, `text-lg`).
> 3. **Preset Border Radii Only:** Strictly use border radius presets (`rounded-card`, `rounded-button`, `rounded-input`, `rounded-badge`, `rounded-full`). Never use arbitrary radii (`rounded-[14px]`) or generic Tailwind radii (`rounded-md`, `rounded-xl`). Directional variants like `rounded-t-card` are supported.
> 4. **Preset Font Families Only:** Strictly use font family presets (`font-sans`, `font-sans-medium`, `font-sans-semibold`, `font-sans-bold`, `font-heading`). Never use raw font weights without the `sans-` prefix, or invalid classes like `font-body`.

---

## 2. Automated File Structure & Naming Resolution

Using `part2_technical_view.md` and `ui_design_reference.md`, you (the AI) must automatically determine the exact names and paths for all files to be created.

### Required MVVM Directory Structure:

```
frontend/src/features/<feature_name>/
│
├── model/
│   ├── <feature>_types.ts       ← TypeScript interfaces & types for this feature
│   ├── <feature>_api.ts         ← Fetch functions + USE_MOCK toggle (branching logic)
│   └── <feature>_mock.ts        ← ALL mock data for this feature, centralized here
│
├── viewmodel/
│   └── use<ScreenName>.ts       ← React Query orchestration, mutations & derived UI state
│
└── view/
    ├── <ScreenName>Page.tsx     ← Main layout shell (entry point mounted by the route)
    │
    ├── containers/              ← Ordered screen sections / tabs / scroll cards
    │   ├── s1_<SectionName>.tsx ← Section 1
    │   ├── s2_<SectionName>.tsx ← Section 2
    │   └── ...                  ← Additional sections as needed
    │
    └── components/              ← Feature-scoped sub-components
        ├── <ComponentName>.tsx  ← Reusable card, item, gauge, button, or list row
        └── ...
```

### Naming Conventions to Apply:

| Layer | Format | Rule |
|---|---|---|
| Feature Folder | `src/features/<feature>/` | Lowercase, singular or domain name (e.g., `library`, `scan`, `auth`, `profile`) |
| Types | `<feature>_types.ts` | Lowercase snake_case with `_types.ts` suffix |
| API | `<feature>_api.ts` | Lowercase snake_case with `_api.ts` suffix |
| Mock | `<feature>_mock.ts` | Lowercase snake_case with `_mock.ts` suffix |
| ViewModel | `use<ScreenName>.ts` | PascalCase prefixed with `use` (e.g., `useLibrary.ts`, `useScanResult.ts`) |
| View Entry | `<ScreenName>Page.tsx` | PascalCase ending in `Page.tsx` (or as defined in `part2_technical_view.md`) |
| Containers | `s#_<SectionName>.tsx` | `s1_`, `s2_`, etc. ordered by top-to-bottom appearance on screen |
| Components | `<ComponentName>.tsx` | PascalCase describing the specific UI widget (e.g., `IngredientCard.tsx`) |

*Note: If `part2_technical_view.md` has already specified exact names for this feature, prioritize those names.*

---

## 3. MVVM Architecture Rules

Maintain strict separation of concerns across layers:

### Model (`model/`)
- **`<feature>_types.ts`** — Pure TypeScript type and interface definitions only. No React imports, no UI code, no API calls.
- **`<feature>_api.ts`** — Data-fetching functions. Must include the `USE_MOCK` boolean toggle (see Section 4). When `USE_MOCK = true`, return data from `<feature>_mock.ts`. When `USE_MOCK = false`, call FastAPI endpoints or Supabase queries. Never inline mock data here.
- **`<feature>_mock.ts`** — The **sole location** where all mock data for this feature lives. Export each dataset as a named constant (e.g., `export const MOCK_ITEMS = [...]`). Provide realistic, high-quality sample items.

### ViewModel (`viewmodel/`)
- Custom React hook (`use<ScreenName>.ts`):
  - Calls model API functions using React Query (`useQuery`, `useMutation`).
  - Manages derived UI state (e.g., active tab index, filter criteria, search queries, modal visibility).
  - Exposes a unified return object: `{ data, isLoading, isRefreshing, error, actions, ... }` to the View.
  - Contains **zero JSX** and no presentation styling.

### View (`view/`)
- **`<ScreenName>Page.tsx`** — Layout shell only:
  - Calls `use<ScreenName>()` to obtain all data, flags, and action callbacks.
  - Composes the ordered container sections and sub-components.
  - Handles `StatusBar`, `ScrollView`, and `RefreshControl` (pull-to-refresh).
  - Contains no direct API queries or business logic.
- **`containers/`** (`s1_`, `s2_`, …) — Each encapsulates one major visual block or tab. Receives sliced data and event callbacks via props.
- **`components/`** — Presentational widgets. Accept typed props, render UI using NativeWind classes and theme tokens. No API calls or store access.

---

## 4. USE_MOCK Toggle Specification

In `<feature>_api.ts`, you (the AI) must automatically identify what data features this screen handles from `ui_design_reference.md` and format the toggle block accordingly:

```typescript
// ============================================================================
// DATA SOURCE TOGGLE (use mock)
// Set to `true` to use mock data for all <ScreenName> screen features
// (<list of data features identified by AI>).
// Set to `false` to fetch real-time live data from FastAPI and Supabase.
export const USE_MOCK: boolean = true;
// ============================================================================
```

Every fetch function in `<feature>_api.ts` must branch on `USE_MOCK`:
```typescript
export async function fetch<Entity>(): Promise<<Entity>[]> {
  if (USE_MOCK) {
    return MOCK_<ENTITY_NAME>; // from <feature>_mock.ts
  }
  // Live API / Supabase call
}
```

---

## 5. Design Tokens, Typography & Styling Rules (Strict Preset System)

All visual styling must strictly adhere to the design system configured in `frontend/tailwind.config.js` and `frontend/src/shared/theme/index.ts`.

### 5.1 Color Tokens

#### In `className` props (Tailwind / NativeWind tokens)

```
bg-primary       text-primary       border-primary
bg-secondary     text-secondary     border-secondary
bg-accent        text-accent        border-accent
bg-background    text-background    border-background
bg-card          text-card          border-card
bg-text          text-text
bg-muted         text-muted
bg-border                           border-border
bg-error         text-error
bg-neutral-white bg-neutral-offwhite bg-neutral-card bg-neutral-border
text-neutral-white text-neutral-muted text-neutral-text
bg-status-error  bg-status-success  bg-status-warning bg-status-info
bg-primary/20    bg-secondary/20    (opacity modifiers are allowed)
```

Use **only** tokens defined in `tailwind.config.js`:
- Palette: `bg-primary`, `text-primary`, `border-primary`, `bg-secondary`, `text-secondary`, `bg-accent`, `text-accent`, `border-accent`, `bg-background`, `text-text`, `bg-card`, `border-card`, `text-muted`, `border-border`, `bg-error`, `text-error`.
- Neutrals: `bg-neutral-white`, `text-neutral-white`, `bg-neutral-offwhite`, `bg-neutral-card`, `bg-neutral-border`, `text-neutral-muted`, `text-neutral-text`.
- Statuses: `bg-status-error`, `bg-status-success`, `bg-status-warning`, `bg-status-info`.
- Opacity modifiers (e.g., `bg-primary/20`, `border-border/50`) are allowed.

#### In JS props values (Icons, SVG, StatusBar, ActivityIndicator)
Use **only** `theme.colors.*` imported from `@/shared/theme`:

```typescript
import { theme } from '@/shared/theme';

// Correct usage:
<Menu size={24} color={theme.colors.card} />
<ActivityIndicator color={theme.colors.primary} />
<StatusBar backgroundColor={theme.colors.primary} />
stroke={theme.colors.accent}
shadowColor={theme.colors.text}

// Wrong — never do this:
color="#FFFFFF"
backgroundColor="#6B7B4C"
stroke="#4CAF50"
```

### 5.2 Font Size Presets (Strictly from `tailwind.config.js`)

Do **NOT** use arbitrary text sizes (e.g. `text-[13px]`, `text-[22px]`) or generic Tailwind sizes (`text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`). Strictly use these presets:

| Preset Class | Size / LineHeight | Default Weight | Typical Usage |
|---|---|---|---|
| `text-display` | 32px / 40px | 700 (Bold) | Large splash/hero branding (e.g., "AureSkin" on auth screens) |
| `text-h1` | 26px / 34px | 700 (Bold) | Drawer titles, major top-level headers |
| `text-h2` | 22px / 30px | 600 (SemiBold) | AppHeader title, primary card headings, gauge values |
| `text-h3` | 18px / 26px | 600 (SemiBold) | Section headings (e.g., "Latest Result", "Interesting for you") |
| `text-body` | 16px / 24px | 400 (Regular) | Primary body text, modal titles, menu items |
| `text-body-sm` | 14px / 20px | 400 (Regular) | Secondary body, card titles, subtext, FAQ questions |
| `text-caption` | 12px / 16px | 400 (Regular) | Timestamps, status pills, small button labels, hints |
| `text-label` | 14px / 20px | 500 (Medium) | Prominent CTA button labels (e.g., "SCAN SKIN NOW!") |

### 5.3 Font Family Presets (Strictly from `tailwind.config.js`)

Do **NOT** use arbitrary font definitions or un-prefixed font weight classes (`font-bold`, `font-semibold`, `font-medium`) without a loaded font, and do **NOT** use non-existent classes like `font-body`. Strictly use these font family presets:

| Preset Class | Font Family & Weight | Typical Usage |
|---|---|---|
| `font-sans` | `Inter_400Regular` | Default body copy, descriptions, input text |
| `font-sans-medium` | `Inter_500Medium` | Subtitles, helper text, link labels |
| `font-sans-semibold` | `Inter_600SemiBold` | Navigation links, form labels, emphasized text |
| `font-sans-bold` | `Inter_700Bold` | Headings, card titles, button labels, badge text |
| `font-heading` | `Outfit_700Bold` | App logo and special brand titles |

### 5.4 Border Radius Presets (Strictly from `tailwind.config.js`)

Do **NOT** use arbitrary radii (e.g. `rounded-[14px]`, `rounded-[20px]`, `rounded-[32px]`) or generic Tailwind classes (`rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-2xl`). Strictly use these presets:

| Preset Class | Radius Value | Target Elements |
|---|---|---|
| `rounded-card` | 16px | Cards, containers, modal dialogs, curved sheets (`rounded-t-card`) |
| `rounded-button` | 12px | Buttons, CTA pressables, preview banners |
| `rounded-input` | 10px | Text input fields, small control boxes |
| `rounded-badge` | 20px | Pills, status tags, condition badges |
| `rounded-full` | 9999px | Circular avatars, circular icon containers, progress rings |

*Note: Directional variants (e.g., `rounded-t-card`, `rounded-b-card`) work directly with these preset names.*

---

## 6. UI Spec Compliance (from `ui_design_reference.md`)

From the matched section in `ui_design_reference.md`, extract and address:
- **🎯 Purpose:** Understand the screen's intent and when it appears.
- **🧩 Elements & Functions:** Every listed element must be implemented with its described behavior.
- **📊 Data Displayed:** Wire every field to its source (API via model, Zustand store, or local state as stated in the spec).
- **✨ Animations & Transitions:** Implement all listed entry/interaction/exit animations. (Entry animations, tap micro-interactions, focus re-triggers (`useFocusEffect`), etc.)
- **🔄 Screen States:** Implement all four states for every data-fetching section:
  - **Loading:** `ActivityIndicator` or shape-matched skeleton placeholder view.
  - **Empty:** Descriptive message + optional CTA button to take action.
  - **Error:** User-friendly error message with retry trigger. (Inline error text or a retry button.)
  - **Success / Populated:** Complete designed UI.
- **🗺️ Navigation:** Connect every user action to its target route via `expo-router`'s `useRouter`.

---

## 7. Implementation Quality Standards

- **No placeholder comments or TODOs** in delivered code. All features must be fully implemented.
- **No inline mock data** in view or viewmodel files. All mock data lives only in `_mock.ts`.
- **No hardcoded hex colors** anywhere (see Section 5).
- **Strict Preset Adherence** — All colors, font sizes, font families, and border radii must strictly use the design tokens from `tailwind.config.js` and `theme.colors.*`. Never use arbitrary bracket notation (`text-[...px]`, `rounded-[...px]`) or un-tokenized generic classes (`text-sm`, `rounded-lg`).
- **TypeScript strict** — All props, state, and function signatures must be fully typed. No `any`
  unless unavoidable, and then justified with a brief inline comment.
- **Pull-to-refresh** — If the screen fetches remote data, include `RefreshControl` on the
  `ScrollView` and a corresponding `onRefresh` action exported from the ViewModel hook.
- **Responsive layout** — Use `flex` and relative sizing. Avoid fixed pixel widths that
  will break on small or large screens.
- **Accessibility** — Add `accessibilityLabel` to all icon-only buttons and interactive elements.
- **No duplicate logic** — Extract shared logic into the ViewModel or a shared utility.

---

## 8. Deliverables & Workflow

### Step 1 — Implementation Plan Artifact (STOP FOR USER REVIEW)

Produce a markdown artifact named **`<feature_name>_implementation_plan.md`** containing:

1. **Overview & Reference Mapping:** Target screen name, matched section in `ui_design_reference.md`, reference image filename, and feature folder path.
2. **Complete Resolved File Tree:** List of every file to create with full relative path and 1-line description.
3. **Data Model (`_types.ts`):** Exact TypeScript interfaces and types to be created.
4. **API Functions & Mock Data (`_api.ts` & `_mock.ts`):** Function signatures, mock dataset names, and the exact `USE_MOCK` comment block.
5. **ViewModel Hook (`use<ScreenName>.ts`):** Queries, mutations, local states, and the exact returned object shape.
6. **View Breakdown:** Details for main screen, each container `s#_` (`s1_`, `s2_`, …), and each component (`<Component>.tsx`), including props, UI layout, animations, and states.
7. **Navigation Mapping:** Table of user actions → target routes.
8. **State Handling Matrix:** Table of each section × loading, empty, error, and success behaviors.

> 🛑 **MANDATORY CHECKPOINT — STOP HERE FOR REVIEW**
> Once the plan artifact is generated, **STOP and present the plan to the user for review**.
> Ask for feedback or confirmation. Do NOT write any component, hook, or model code until the user
> has reviewed the plan and explicitly instructed you to proceed.

### Step 2 — Full Implementation (Only After User Approval)

Once the user approves the plan (and any requested revisions are resolved), implement every file completely, in dependency order:

1. `<feature>_types.ts`
2. `<feature>_mock.ts`
3. `<feature>_api.ts`
4. `use<ScreenName>.ts`
5. Sub-components (`view/components/` files)
6. Containers (`view/containers/` files)
7. Main screen file (`view/<ScreenName>Page.tsx`)

---

## 9. What NOT to Do

- Do **not** ask the user to fill out file paths, prefixes, or technical naming unless stated by user — otherwise, resolve them yourself using the reference documents.
- Do **not** add an `AppHeader` inside the screen component. The shared header is rendered by `src/app/(tabs)/_layout.tsx`.
- Do **not** use `StyleSheet.create` with hardcoded color values — use Tailwind `className`.
- Do **not** import colors from `src/constants/theme.ts` — always use `src/shared/theme/index.ts`.
- Do **not** use arbitrary font sizes (e.g. `text-[13px]`) or generic Tailwind sizes (`text-xs`, `text-sm`, `text-lg`). Always use the presets defined in `tailwind.config.js` (`text-display`, `text-h1`, `text-h2`, `text-h3`, `text-body`, `text-body-sm`, `text-caption`, `text-label`).
- Do **not** use arbitrary border radii (e.g. `rounded-[14px]`, `rounded-[24px]`) or generic Tailwind radii (`rounded-md`, `rounded-xl`). Always use `rounded-card`, `rounded-button`, `rounded-input`, `rounded-badge`, or `rounded-full`.
- Do **not** use un-prefixed font weight classes (`font-bold`, `font-medium`) without `sans-` or invalid classes like `font-body`. Always use `font-sans`, `font-sans-medium`, `font-sans-semibold`, `font-sans-bold`, or `font-heading`.
- Do **not** put business logic (API calls, data transforms) inside view or container components.
- Do **not** inline mock data inside `_api.ts` or View files — all mock data belongs in `_mock.ts`.
- Do **not** use `any` as a TypeScript type without a justifying comment.

---

*Start by reading all reference documents, and resolve all paths and naming for the Target Screen. Then output the implementation plan artifact and STOP to wait for the user's review and approval before writing any code.*
