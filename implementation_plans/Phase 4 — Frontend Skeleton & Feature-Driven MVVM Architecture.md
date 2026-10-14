# Phase 4: Frontend Skeleton & Feature-Driven MVVM Architecture

## Implementation Plan

This plan covers every step to go from the current empty `frontend/` directory to a fully scaffolded, runnable Expo app with the MVVM architecture, design system, navigation, and API client — ready for Phase 5 feature development.

---

## Step 1: Initialize Expo Project

> Create the React Native + Expo app inside `frontend/` with TypeScript.

**Actions:**
1. Run `npx create-expo-app@latest ./` inside the `frontend/` directory (TypeScript template is the default).
2. Verify the app boots with `npx expo start`.

**Result:** A working Expo project with TypeScript at `frontend/`.

---

## Step 2: Install Core Libraries

> Install all frontend dependencies from the tech stack.

**Libraries to install:**

| Category | Package(s) | Purpose |
|---|---|---|
| **Styling** | `nativewind`, `tailwindcss` | Utility-first styling (Tailwind CSS for RN) |
| **UI Primitives** | `@rnr/reusables` (React Native Reusables) | Unstyled, accessible UI component primitives |
| **Icons** | `lucide-react-native`, `react-native-svg` | Customizable vector icons |
| **Toasts** | `react-native-toast-message` | In-app feedback notifications |
| **State** | `zustand` | Lightweight global state management |
| **Data Fetching** | `@tanstack/react-query` | Server state, caching, async data |
| **API Client** | `axios` | HTTP client with interceptors |
| **Auth/DB Client** | `@supabase/supabase-js` | Supabase Auth + DB client |
| **Camera/Media** | `expo-camera`, `expo-image-picker` | Image capture and gallery selection |
| **Notifications** | `expo-notifications` | Local push notifications for routines |
| **Storage** | `@react-native-async-storage/async-storage` | Persist auth tokens locally |

**Actions:**
1. Install production dependencies.
2. Install dev dependencies (`tailwindcss`).
3. Configure NativeWind following their Expo setup guide (babel plugin, `tailwind.config.js`, global CSS file).

**Result:** All libraries installed and NativeWind compiling.

---

## Step 3: Design System — Centralized Theme & Tokens

> **This answers your question.** All design tokens live in **two places** that work together:

### 3A. `tailwind.config.js` — The Single Source of Truth

This is where **all** colors, fonts, font sizes, border radii, and spacing values are defined. NativeWind reads this file and generates the utility classes you use in components.

```js
// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      // ── COLORS (extracted from Figma) ──────────────────────
      colors: {
        // Primary palette (olive/sage green from backgrounds)
        primary: {
          DEFAULT: "#6B7B4C",   // Main olive green (bg, nav bar active)
          light:   "#8A9A6D",   // Lighter olive (hover, subtle bg)
          dark:    "#4F5C38",   // Darker olive (pressed states)
        },
        // Secondary palette (warm beige/brown from CTAs)
        secondary: {
          DEFAULT: "#D4A574",   // Warm beige (Sign In button, CTA)
          light:   "#E2BFA0",   // Light beige (card highlights)
          dark:    "#B8895A",   // Darker brown (pressed CTA)
        },
        // Accent (green indicators, health scores)
        accent: {
          DEFAULT: "#4CAF50",   // Green (health score ring, badges)
          light:   "#A5D6A7",   // Light green (background tint)
        },
        // Neutrals
        neutral: {
          white:   "#FFFFFF",
          offwhite:"#F5F0EB",   // Warm off-white (page backgrounds)
          card:    "#FFFFFF",   // Card background
          border:  "#E8E0D8",   // Subtle warm border
          text:    "#2D2D2D",   // Primary text (near-black)
          muted:   "#8A8A8A",   // Secondary/muted text
          placeholder: "#B0B0B0", // Input placeholder text
        },
        // Status
        status: {
          error:   "#E53935",   // Red for errors
          warning: "#FFA726",   // Orange for warnings
          success: "#4CAF50",   // Green for success
          info:    "#42A5F5",   // Blue for info
        },
      },

      // ── FONT FAMILY ────────────────────────────────────────
      fontFamily: {
        sans:       ["Inter_400Regular"],
        "sans-medium": ["Inter_500Medium"],
        "sans-semibold": ["Inter_600SemiBold"],
        "sans-bold": ["Inter_700Bold"],
        heading:    ["Outfit_700Bold"],
      },

      // ── FONT SIZE PRESETS ──────────────────────────────────
      fontSize: {
        "display":  ["32px", { lineHeight: "40px", fontWeight: "700" }],
        "h1":       ["26px", { lineHeight: "34px", fontWeight: "700" }],
        "h2":       ["22px", { lineHeight: "30px", fontWeight: "600" }],
        "h3":       ["18px", { lineHeight: "26px", fontWeight: "600" }],
        "body":     ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "body-sm":  ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "caption":  ["12px", { lineHeight: "16px", fontWeight: "400" }],
        "label":    ["14px", { lineHeight: "20px", fontWeight: "500" }],
      },

      // ── BORDER RADIUS ──────────────────────────────────────
      borderRadius: {
        card:    "16px",    // Cards, containers
        button:  "12px",    // Buttons
        input:   "10px",    // Input fields
        badge:   "20px",    // Badges, pills
        full:    "9999px",  // Circles (avatar, health ring)
      },
    },
  },
  plugins: [],
};
```

### 3B. `src/shared/theme/index.ts` — Runtime Constants

For values you need in **JavaScript logic** (not just styling), such as passing colors to chart libraries, SVG components, or conditional styling in hooks:

```ts
// src/shared/theme/index.ts
export const theme = {
  colors: {
    primary:   "#6B7B4C",
    secondary: "#D4A574",
    accent:    "#4CAF50",
    background: "#F5F0EB",
    card:      "#FFFFFF",
    text:      "#2D2D2D",
    muted:     "#8A8A8A",
    error:     "#E53935",
  },
} as const;
```

### How They Work Together

| Need | Where to Look |
|---|---|
| Styling a component with a color | Use Tailwind class: `className="bg-primary text-neutral-text"` |
| Applying a font preset | Use Tailwind class: `className="text-h2 font-sans-semibold"` |
| Passing a color to a library (chart, SVG, etc.) | Import from `theme/index.ts`: `import { theme } from '@/shared/theme'` |
| Checking if a value exists | `tailwind.config.js` is the master reference |

> [!NOTE]
> The exact hex values above are **estimated from the Figma screenshots**. You should verify and adjust them against your actual Figma design tokens. I can refine them once you confirm the precise values.

---

## Step 4: Create Feature-Driven MVVM Folder Structure

> Scaffold all directories and placeholder files matching the architecture in `part2_technical_view.md`.

**Directory tree to create:**

```
src/
├── app/
│   ├── _layout.tsx              ← Root layout (providers, auth guard)
│   ├── (auth)/
│   │   ├── _layout.tsx          ← Auth group layout
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── terms.tsx
│   └── (tabs)/
│       ├── _layout.tsx          ← Tab bar config (5 tabs)
│       ├── index.tsx            ← Home
│       ├── library.tsx          ← Library
│       ├── scan.tsx             ← Scan
│       ├── history.tsx          ← History
│       └── routine.tsx          ← Routine
│
├── shared/
│   ├── components/              ← Global reusable components (Button, Card, etc.)
│   ├── hooks/                   ← useAuth.ts, useSupabase.ts
│   ├── services/                ← api.ts (Axios), supabase.ts (Supabase client)
│   ├── store/                   ← authStore.ts, appStore.ts
│   ├── theme/                   ← index.ts (runtime color/font constants)
│   ├── types/                   ← common.ts
│   └── utils/                   ← formatDate.ts, imageHelpers.ts
│
└── features/
    ├── home/
    │   ├── model/
    │   ├── viewmodel/
    │   └── view/
    │       ├── containers/
    │       └── components/
    ├── library/
    │   ├── model/
    │   ├── viewmodel/
    │   └── view/
    │       ├── containers/
    │       └── components/
    ├── scan/
    │   ├── model/
    │   ├── viewmodel/
    │   └── view/
    │       ├── containers/
    │       └── components/
    ├── history/
    │   ├── model/
    │   ├── viewmodel/
    │   └── view/
    │       ├── containers/
    │       └── components/
    ├── routine/
    │   ├── model/
    │   ├── viewmodel/
    │   └── view/
    │       ├── containers/
    │       └── components/
    ├── ocr/
    │   ├── model/
    │   ├── viewmodel/
    │   └── view/
    │       └── components/
    └── profile/
        ├── model/
        ├── viewmodel/
        └── view/
            └── components/
```

**Actions:**
1. Create all directories.
2. Add placeholder files with minimal boilerplate (exports, types stubs) so imports don't break during Phase 5.

---

## Step 5: API Client & Supabase Setup

> Configure Axios with JWT auto-attachment and initialize the Supabase client.

### 5A. Supabase Client (`src/shared/services/supabase.ts`)
- Initialize `@supabase/supabase-js` with `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
- Use `AsyncStorage` as the storage adapter for persisting sessions.

### 5B. Axios API Client (`src/shared/services/api.ts`)
- Create an Axios instance with `baseURL` pointing to the FastAPI backend.
- Add a **request interceptor** that reads the current JWT from the Supabase session and attaches it as `Authorization: Bearer <token>`.
- Add a **response interceptor** that handles the standardized error response format (`{ error: { code, message } }`) and surfaces clean error messages.

### 5C. Auth Store (`src/shared/store/authStore.ts`)
- Zustand store that holds: `user`, `session`, `isAuthenticated`, `isLoading`.
- Actions: `setSession()`, `clearSession()`, `initialize()` (checks for existing session on app launch).

### 5D. Environment Variables (`.env`)
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_API_BASE_URL=http://localhost:8000
```

---

## Step 6: Navigation Setup (Expo Router)

> Wire up file-based routing with auth protection.

### 6A. Root Layout (`src/app/_layout.tsx`)
- Wraps the entire app in providers: `QueryClientProvider` (React Query), Zustand store context, `Toast` component.
- Loads custom fonts (Inter, Outfit) via `expo-font` and shows a splash screen until ready.
- Checks auth state on mount: if authenticated → render `(tabs)`, if not → render `(auth)`.

### 6B. Auth Group (`src/app/(auth)/_layout.tsx`)
- Simple Stack navigator for login → register → terms flow.
- No bottom tab bar visible.
- Redirects to `(tabs)` if user is already authenticated.

### 6C. Tabs Group (`src/app/(tabs)/_layout.tsx`)
- Bottom Tab Navigator with 5 tabs: **Home, Library, Scan, History, Routine**.
- Tab bar styled to match the Figma design:
  - Olive green background
  - White icons (lucide-react-native)
  - Center "Scan" tab elevated with a circular accent button
- Redirects to `(auth)` if user is not authenticated.

### 6D. Tab Bar Icons (from Figma)
| Tab | Lucide Icon | Notes |
|---|---|---|
| Home | `Home` | Solid when active |
| Library | `BookOpen` | Solid when active |
| Scan | `Scan` | Elevated center button, circular |
| History | `Clock` | Solid when active |
| Routine | `User` | Solid when active |

---

## Execution Order Summary

| Step | Task | Depends On |
|---|---|---|
| **1** | Initialize Expo project | — |
| **2** | Install core libraries + configure NativeWind | Step 1 |
| **3** | Set up design system (`tailwind.config.js` + `theme/index.ts`) | Step 2 |
| **4** | Create MVVM folder structure with placeholder files | Step 1 |
| **5** | Configure API client, Supabase, auth store, `.env` | Steps 2, 4 |
| **6** | Build Expo Router navigation (auth group + tabs group) | Steps 3, 4, 5 |

---

## Deliverable

At the end of Phase 4, we will have:
- ✅ A running Expo app with TypeScript
- ✅ All libraries installed and configured
- ✅ A centralized design system (colors, fonts, presets) in `tailwind.config.js` + `theme/index.ts`
- ✅ The complete MVVM folder structure ready for feature code
- ✅ Axios client auto-attaching JWT tokens
- ✅ Supabase client initialized with session persistence
- ✅ Expo Router navigation with auth guard and 5-tab bottom bar
- ✅ App renders a basic placeholder screen on each tab

> [!IMPORTANT]
> The color values in Step 3 are estimated from the Figma screenshots. Before we begin implementation, please confirm or provide the exact hex values from your Figma design file (you can find them in Figma by selecting any element and checking the color panel on the right sidebar).
