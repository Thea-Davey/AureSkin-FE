# AureSkin — Favorites, About, and Help Pages Redesign & Architecture Plan

## 1. Overview & Context

This implementation plan covers the structured overhaul of three key secondary pages accessed via the **MenuOverlay (side drawer)**:
1. **Favorites Page** (`src/features/favorites/`)
2. **About Page** (`src/features/about/`)
3. **Help & Support Page** (`src/features/help/`)
4. **Legal & Disclaimers Pages** (Resolution for Terms of Service and Privacy Policy)

All three screens will be upgraded from basic skeletons to production-grade AureSkin screens adhering strictly to:
- **Design Tokens & System:** `aureskin-frontend-rules` (`tailwind.config.js`, `theme.colors.*`, typography presets, border radius presets).
- **Architecture Standard:** Strict Feature-Driven MVVM (`model/`, `viewmodel/`, `view/`).
- **Global Component Standardization:** Every card container will use the global shared [`Card.tsx`](file:///c:/Users/Thea/Documents/DLSUD/AureSkin/frontend/src/shared/components/Card.tsx) component.

---

## 2. Responses to User Inquiries

### Question 1: Where to place details about the 1 Developer and 2 Researchers?
> **Architectural Recommendation:** **About Page (`AboutPage.tsx`) — "Research & Development Team" Section.**
> 
> In academic software capstone projects (specifically De La Salle University — Dasmariñas), the research personnel belong immediately underneath the **Academic Affiliation** card.
> - **Card Title:** `Research & Development Team`
> - **Lead Developer Card (1):** Highlighting Full-Stack & Mobile Systems Architecture, Model Integration, and UI/UX engineering.
> - **Lead Researchers Cards (2):** Highlighting Machine Learning Research, Dermatological Dataset Curation, and Empirical Ingredient Conflict Verification.
> - **Card Design:** Dedicated `<Card style={2}>` with role pills (`bg-primary/15 text-primary`, `bg-secondary/20 text-secondary-dark`) and academic credentials.

---

### Question 2: What pages to create for Terms of Service, Privacy Policy & Disclaimers?
> **Architectural Recommendation:** **A unified Legal Hub at `src/app/legal.tsx` (with route alias `/terms` and `/privacy`).**
> 
> Rather than fragmenting the app across multiple one-off legal screens, we will implement a clean, reusable `LegalPage.tsx` under `src/features/legal/` (accessible via `router.push('/legal?tab=terms')` or `router.push('/legal?tab=privacy')`):
> - **Tab 1: Terms of Service** — Permitted usage, user account responsibilities, cosmetic AI disclaimer.
> - **Tab 2: Privacy Policy** — Facial photograph handling, zero-third-party image sharing policy, Supabase private bucket storage encryption.
> - **Tab 3: Clinical Disclaimers** — Board certification notice, cosmetic skin health companion scope, non-prescription guidance.
> 
> Both the **About Page** buttons and the existing **Auth flow** will link directly to this single source of legal truth.

---

## 3. Screen 1: Favorites Page (`src/features/favorites/`)

### 3.1 Objectives & Requirements
1. **Preserve Filter Tabs (3 Pills):**
   - `All (${count})`, `Products (${count})`, `Ingredients (${count})`.
   - High-contrast active pill: `bg-primary text-neutral-white`.
   - Inactive pill: `bg-card border border-border text-muted`.
2. **Local Component `FavoriteCard.tsx`:**
   - Wraps the global shared [`IngredientCard`](file:///c:/Users/Thea/Documents/DLSUD/AureSkin/frontend/src/shared/components/IngredientCard.tsx) and [`ProductCard`](file:///c:/Users/Thea/Documents/DLSUD/AureSkin/frontend/src/shared/components/ProductCard.tsx) components.
   - Adds an explicit header on top with the label:
     - **Style 1 (`ingredient`):** Header eyebrow banner with label `"INGREDIENT"` + renders `IngredientCard`.
     - **Style 2 (`product`):** Header eyebrow banner with label `"PRODUCT"` + renders `ProductCard`.
3. **Interactive Actions:**
   - Tapping an ingredient card opens [`IngredientDetailPage`](file:///c:/Users/Thea/Documents/DLSUD/AureSkin/frontend/src/shared/components/IngredientDetailPage.tsx) modal.
   - Tapping a product card opens [`ProductDetailPage`](file:///c:/Users/Thea/Documents/DLSUD/AureSkin/frontend/src/shared/components/ProductDetailPage.tsx) modal.
   - Tapping the favorite star toggles/removes the item with real-time state synchronization.
4. **Empty State:**
   - When 0 favorites exist in a selected filter category, displays a centered card with a Bookmark icon, heading, and guidance subtext.

### 3.2 File Structure Resolution
```
frontend/src/features/favorites/
├── model/
│   ├── favorites_types.ts   ← Types: FavoriteItem, FavoriteFilter, FavoriteStats
│   ├── favorites_api.ts     ← fetchFavorites, removeFavorite (USE_MOCK toggle)
│   └── favorites_mock.ts    ← Centralized mock ingredients & products
├── viewmodel/
│   └── useFavorites.ts      ← React Query orchestration, filter switching, modal state
└── view/
    ├── FavoritesPage.tsx    ← Main layout with ModalHeader, filter pills, scroll list
    └── components/
        └── FavoriteCard.tsx ← Local component: style 1 (Ingredient) & style 2 (Product)
```

---

## 4. Screen 2: About Page (`src/features/about/`)

### 4.1 Objectives & Requirements
1. **Container 1 (Hero Branding):**
   - **Instruction:** *Remove the outer container wrapper. It should be just the elements it has.*
   - Remove `<View className="bg-card rounded-card border border-border ...">`.
   - Render the circular logo (`bg-primary/20` with `Sparkles`), `"AureSkin"` in `text-display font-heading text-primary`, tagline in `text-body font-sans-medium text-text`, and version badge pill directly on the page background (`bg-background`).
2. **Container 2 (Our Purpose):**
   - Wrapped in global `<Card style={2} className="p-5 mb-4">`.
   - Explains the cosmetic skin companion mission.
3. **Container 3 (Core Technologies):**
   - Wrapped in global `<Card style={2} className="p-5 mb-4">`.
   - 3 structured tech rows: MobileNetV3, MediaPipe 468-point mesh, Harmful Pairs relational engine.
4. **Container 4 (Academic Affiliation & Research Team):**
   - Wrapped in global `<Card style={2} className="p-5 mb-4">`.
   - DLSUD College of Science and Computer Studies (CSCS) accreditation.
   - **New Sub-section: Research & Development Team:**
     - 1 Developer card (Lead Mobile Systems & Full-Stack Architect).
     - 2 Researcher cards (Lead AI Machine Learning & Dermatological Researchers).
5. **Container 5 (Legal & Policy Links):**
   - **Instruction:** *Fix spacings, the 2 buttons are too close to the divider.*
   - Wrapped in global `<Card style={2} className="p-4 mb-4">`.
   - Increase vertical item padding (`py-4 px-3`), add generous margin around the divider (`my-1 border-b border-border/50`), and wire press handlers to open `/legal?tab=terms` and `/legal?tab=privacy`.

### 4.2 File Structure Resolution
```
frontend/src/features/about/
├── model/
│   ├── about_types.ts       ← TeamMember, CoreTech, AboutInfo
│   ├── about_api.ts         ← fetchAboutInfo (USE_MOCK toggle)
│   └── about_mock.ts        ← Academic info, 1 dev + 2 researchers data
├── viewmodel/
│   └── useAbout.ts          ← Version data, team member list
└── view/
    ├── AboutPage.tsx        ← Page layout with ModalHeader & 5 containers
    └── components/
        ├── HeroBranding.tsx ← Unwrapped Hero brand elements
        └── TeamCard.tsx     ← 1 developer + 2 researchers showcase cards
```

---

## 5. Screen 3: Help Page (`src/features/help/`)

### 5.1 Objectives & Requirements
1. **Quick Guides Cards:**
   - **Instruction:** *Use card color token as bg because the texts are not visible.*
   - Refactor to use `<Card style={2} className="mb-3 p-4 flex-row items-start bg-card">`.
   - Dark readable text (`text-text` and `text-muted`) with 14:1 contrast ratio.
2. **Remove Frequently Asked Questions:**
   - **Instruction:** *Remove Frequently Asked Questions section since it's already in the home.*
   - Eliminate the `FAQS` array and accordion component completely.
3. **New Value-Add Sections (Addressing User's "What else to put here?"):**
   - **Section A: Visual Feature Walkthroughs (Card Presets):**
     1. *Skin Scan Best Practices* (indirect lighting, clean face, neutral expression).
     2. *Ingredient Compatibility Guide* (how conflict alerts protect the skin barrier).
     3. *Routine Customization* (how to swap recommended products).
   - **Section B: Diagnostic & Storage Management Card:**
     - AI Model Status: `MobileNetV3 Loaded (Ready)`.
     - Database Status: `Supabase Cloud Sync (Online)`.
     - "Clear Photo Cache" action button (frees device storage without affecting account data).
   - **Section C: Enhanced Support & Direct Contact Card:**
     - Email support button (`mailto:support@aureskin.app` with prefilled subject).
     - Submit feedback / bug report button.
     - Response timeframe guarantee pill (`Average response: 24 to 48 hours`).

### 5.2 File Structure Resolution
```
frontend/src/features/help/
├── model/
│   ├── help_types.ts        ← GuideItem, DiagnosticInfo, SupportChannel
│   ├── help_api.ts          ← fetchHelpData, submitFeedback (USE_MOCK toggle)
│   └── help_mock.ts         ← Guides, walkthroughs, diagnostic items
├── viewmodel/
│   └── useHelp.ts           ← Email launcher, cache clear action, guide expand state
└── view/
    ├── HelpPage.tsx         ← Page layout with ModalHeader & updated cards
    └── components/
        ├── QuickGuideCard.tsx  ← Fixed bg-card high-contrast guide card
        └── SupportActionCard.tsx ← Email & Feedback action container
```

---

## 6. Screen 4: Legal & Policies Hub (`src/features/legal/`)

### 6.1 Objectives & Requirements
- Single destination for Terms of Service, Privacy Policy, and Dermatological Clinical Disclaimers.
- Features a 3-tab segmented switcher: `Terms` | `Privacy` | `Disclaimers`.
- Header: [`ModalHeader`](file:///c:/Users/Thea/Documents/DLSUD/AureSkin/frontend/src/shared/components/ModalHeader.tsx) with back button returning to About or previous route.
- Content rendered in `<Card style={2}>` with clean typography and bulleted clauses.

### 6.2 File Structure Resolution
```
frontend/src/features/legal/
├── model/
│   ├── legal_types.ts       ← LegalTab, LegalSection
│   └── legal_content.ts     ← Full terms, privacy policy, and medical disclaimer copy
└── view/
    └── LegalPage.tsx        ← Segmented tab view with scrollable legal text
frontend/src/app/
├── legal.tsx                ← Route entry point for /legal
├── terms.tsx                ← Route redirecting to /legal?tab=terms
└── privacy.tsx              ← Route redirecting to /legal?tab=privacy
```

---

## 7. State Handling Matrix

| Page | Loading State | Empty State | Error State | Success State |
|---|---|---|---|---|
| **Favorites** | Skeleton shimmer list matching FavoriteCard shapes | Centered Bookmark icon with "No favorites in this category" | Error card with Retry CTA | Filterable list of Ingredient & Product FavoriteCards |
| **About** | Clean instant load from static model/mock | N/A (Static informational) | N/A | Unwrapped Hero + Purpose + Tech + Team + Legal links |
| **Help** | Minimal skeleton | N/A | Error banner with Retry | Quick Guides + System Status + Direct Contact Card |
| **Legal** | Instant load | N/A | N/A | Tabbed Terms, Privacy & Disclaimers |

---

## 8. Verification & Review Checkpoint

- [x] All card containers strictly use global shared [`Card.tsx`](file:///c:/Users/Thea/Documents/DLSUD/AureSkin/frontend/src/shared/components/Card.tsx).
- [x] All colors use `tailwind.config.js` tokens or `theme.colors.*` (zero raw hex).
- [x] All typography uses standard presets (`text-display`, `text-h1`, `text-h2`, `text-h3`, `text-body`, `text-body-sm`, `text-caption`, `text-label`).
- [x] All border radii use standard presets (`rounded-card`, `rounded-button`, `rounded-badge`, `rounded-full`).
- [x] Strict MVVM separation maintained across all features.

