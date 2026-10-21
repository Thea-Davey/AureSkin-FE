# 🏠 Home Page — Implementation Plan (§2.1)

> Based on `ui_design_reference.md § 2.1` and `home.png` design reference.
> Follows MVVM feature-driven architecture from Phase 4 plan.

---

## 📁 File Structure to Create

```
src/features/home/
├── model/
│   └── home.types.ts              ← TypeScript interfaces (LatestResult, RoutineStep, Article, FAQ)
├── viewmodel/
│   └── useHomeViewModel.ts        ← Data fetching, state logic, values formatting
└── view/
    ├── containers/
    │   └── HomeContainer.tsx      ← Orchestrates ViewModel → View binding; renders full screen
    └── components/
        ├── HeroCard.tsx           ← "How is your skin today?" banner
        ├── LatestResultCard.tsx   ← Skin type, condition badges, health gauge, date
        ├── HealthGauge.tsx        ← Circular progress ring (e.g. "89% HEALTHY")
        ├── RoutineCard.tsx        ← Morning/Evening routine steps card
        ├── LearnSection.tsx       ← "Learn more about Skincare!" section wrapper
        ├── SkinTestGuideTip.tsx   ← Tip card with info icon
        ├── ArticleCard.tsx        ← Individual article card (tappable)
        └── FAQAccordion.tsx       ← Expandable FAQ accordion item
```

**Entry Point:** `src/app/(tabs)/index.tsx` renders `<HomeContainer />`

---

## 🧩 Component Breakdown

### 1. `HeroCard.tsx`
| Property | Detail |
|---|---|
| **Visual** | Warm beige card, left text ("How is your skin today?"), right illustration of two people |
| **CTA** | `SCAN SKIN NOW!` button — secondary color (`#D4A574`), rounded |
| **On Press** | Navigate to Scan Overlay `(tabs)/scan` |
| **Interaction** | Scale-down press animation on button tap |
| **Static content** | No data fetching; always shown |

---

### 2. `LatestResultCard.tsx`
| Property | Detail |
|---|---|
| **Visual** | 3-column layout: Skin Type | Skin Condition(s) | Health Gauge |
| **Row below** | `Date Scanned: May 1, 2026` spanning full width |
| **Section header** | `Latest Result` (left) + `See Results →` link (right) |
| **Empty state** | "No scans yet — tap SCAN SKIN NOW! to get started" prompt inside the card |
| **Loading state** | Skeleton shimmer replacing the 3-column card |

**Sub-components:**
- **Skin Type column:** Label + value (e.g. `Oily`) in a warm-bordered cell
- **Condition Badge(s) column:** One or more pill badges (e.g. `Skin Redness` in a salmon/pink color)
- **`HealthGauge.tsx`:** Circular SVG ring showing score percentage (e.g. `89%`) + `HEALTHY` label in center, reading directly from `health_score`

---

### 3. `HealthGauge.tsx`
| Property | Detail |
|---|---|
| **Library** | `react-native-svg` — draw a circular arc |
| **Color** | Accent green `#4CAF50` for the filled arc; light gray for the background ring |
| **Center text** | Percentage value (e.g. `89%`) bold, + `HEALTHY` smaller caption |
| **Animation** | Arc animates from 0% → target `health_score` on mount (Animated + SVG path) |
| **Prop** | `percentage: number` (0–100, passed directly from `latestResult.health_score`) |

---

### 4. `RoutineCard.tsx`
| Property | Detail |
|---|---|
| **Visual** | Card with sun emoji + `Morning Routine` header, sub-label, 3 numbered steps |
| **Step format** | `{number}.` circle → `Step Name` bold → description below |
| **Section header** | `Today's Skincare Routine` (left) + `See Routine →` link (right) |
| **Empty state** | "No routine yet — tap See Routine to generate one" |
| **Loading state** | Skeleton shimmer rows |
| **Time-of-day logic** | Morning (5am–11:59am), Afternoon (12pm–4:59pm), Evening (5pm–4:59am) |

---

### 5. `LearnSection.tsx`
| Property | Detail |
|---|---|
| **Visual** | Section header `Learn more about Skincare!` |
| **Children** | `<SkinTestGuideTip />` + list of `<ArticleCard />`s + `<FAQAccordion />` items |
| **Data Source** | Articles: **Dynamic** (fetched from Supabase `articles` table via React Query) <br> FAQs: **Static** (curated study-focused FAQ dataset) |

---

### 6. `SkinTestGuideTip.tsx`
- Info icon (ℹ️ circle) + tip text about how to get accurate scan results (lighting, distance, makeup-free face)
- Non-interactive; always visible

---

### 7. `ArticleCard.tsx`
- Tappable card: title, summary, source badge, publication date, and thumbnail image (`image_url` with fallback placeholder)
- On press: opens source `url` via `expo-web-browser` (`WebBrowser.openBrowserAsync`) or `Linking.openURL`
- Data model matches Supabase `public.articles` table

---

### 8. `FAQAccordion.tsx`
| Property | Detail |
|---|---|
| **Behavior** | Tap question → smooth height expand/collapse via `Animated.timing` or `LayoutAnimation` |
| **Visual** | Question row with `+` / `−` or chevron icon; answer text revealed below with smooth opacity |
| **Content** | Curated static study FAQ array (acne detection, skin type classification, health score, routine safety) |
| **Animation** | Smooth transition on toggle |

---

## 📊 Data & ViewModel (`useHomeViewModel.ts`)

```ts
// Model interfaces:
export interface LatestResult {
  id: string;
  skin_type: string;
  conditions: string[];
  health_score: number;      // 0.0 - 100.0 from backend Weighted Heuristic Scoring Algorithm
  created_at: string;
}

export interface Article {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  image_url?: string | null;
  category?: string;
  published_at?: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

// Responsibilities:
// 1. Fetch latest scan result from GET /history (most recent entry, which includes health_score)
// 2. Fetch today's routine steps from GET /routine
// 3. Fetch curated skincare articles from Supabase ('articles' table)
// 4. Expose health score directly from latestResult.health_score to the HealthGauge
// 5. Provide curated static FAQs for skincare & app usage
// 6. Expose loading, error, empty states per section

interface HomeViewModel {
  // Latest Result
  latestResult: LatestResult | null;
  healthPercentage: number | null; // Math.round(latestResult.health_score)
  isLatestResultLoading: boolean;
  latestResultError: string | null;

  // Routine
  todayRoutine: RoutineStep[] | null;
  routineLabel: string;            // "Morning Routine" | "Evening Routine"
  isRoutineLoading: boolean;
  routineError: string | null;

  // Skincare Articles (Dynamic from Supabase)
  articles: Article[];
  isArticlesLoading: boolean;
  articlesError: string | null;
  refetchArticles: () => void;

  // FAQs (Static study-related list)
  faqs: FAQ[];
}
```

**API & Data Fetching (via React Query):**

| Data | Source / Query | Query Key | Notes |
|---|---|---|---|
| Latest scan | `GET /history?limit=1` | `['history', 'latest']` | Returns `skin_type`, `conditions[]`, `health_score`, `created_at` |
| Today's routine | `GET /routine` | `['routine', 'today']` | Active routine steps filtered to current time-of-day |
| Skincare articles | `supabase.from('articles').select('*').order('published_at', { ascending: false })` | `['articles']` | Live data from Supabase `public.articles` with public read RLS |
| Study FAQs | Static local array | N/A | Synchronous, instant load |

**Values & Formatting:**
- `healthPercentage` — directly read from `latestResult.health_score` (rounded to nearest integer, e.g. `89`)
- `routineLabel` — determined by current `Date` hour (e.g., Morning / Evening Routine)
- `routineSteps` — first 3 steps from the active routine
- `articles` — list of 4+ articles with `title`, `summary`, `source`, `url`, `image_url`

---

## 🎨 Styling Notes

| Token | Value | Usage |
|---|---|---|
| Page background | `bg-neutral-offwhite` (`#F5F0EB`) | Full screen background |
| Hero card | `bg-[#F2E8DC]` (warm beige) | Hero banner background |
| Result card border | `border-neutral-border` | Card outline |
| Condition badge | `bg-[#F4A7A0]` rounded-badge | Salmon pill for conditions |
| Section header text | `text-h3 font-sans-semibold text-neutral-text` | |
| "See X →" link | `text-primary font-sans-medium` | |
| Health gauge arc | `#4CAF50` | SVG stroke color |

---

## ✨ Animations & Transitions

| Trigger | Animation |
|---|---|
| Screen mount | Stagger-fade sections from top to bottom (`Animated.stagger`) |
| "SCAN SKIN NOW!" press | Scale down to 0.96 + opacity 0.8 |
| FAQ expand/collapse | `Animated.timing` height + opacity |
| Health gauge on mount | Arc animates from 0% → target `health_score` (800ms ease-out) |
| Card press feedback | `activeOpacity={0.75}` on `TouchableOpacity` |

---

## 🔄 Screen States per Section

| Section | Loading | Empty | Error |
|---|---|---|---|
| Latest Result | Skeleton shimmer (3-column card shape) | "No scans yet" inline card prompt | Inline error + "Retry" button |
| Today's Routine | Skeleton shimmer (3 rows) | "No routine yet" inline card prompt | Inline error + "Retry" button |
| Articles | Skeleton card horizontal list / stack | "No articles available right now" | Error notice + "Retry" button |
| FAQs | N/A (static) | N/A | N/A |

---

## 🗺️ Navigation Wiring

| Element | Action | Destination |
|---|---|---|
| `SCAN SKIN NOW!` | `router.push('/(tabs)/scan')` | Scan Overlay |
| `See Results →` | `router.push('/history/[id]')` with latest scan ID | Scan Results screen |
| `See Routine →` | `router.push('/(tabs)/routine')` | Routine tab |
| Article card | `WebBrowser.openBrowserAsync(article.url)` | In-app browser / external |

---

## 🛠️ Implementation Order

| Step | Task | File |
|---|---|---|
| 1 | Define TypeScript types (including `health_score`, `Article`, `FAQ`) | `model/home.types.ts` |
| 2 | Build `HealthGauge` (SVG ring using `health_score`) | `view/components/HealthGauge.tsx` |
| 3 | Build `HeroCard` (static banner) | `view/components/HeroCard.tsx` |
| 4 | Build `LatestResultCard` + skeleton | `view/components/LatestResultCard.tsx` |
| 5 | Build `RoutineCard` + skeleton | `view/components/RoutineCard.tsx` |
| 6 | Build `SkinTestGuideTip` (static tip) | `view/components/SkinTestGuideTip.tsx` |
| 7 | Build `ArticleCard` (dynamic data from Supabase schema + image fallback) | `view/components/ArticleCard.tsx` |
| 8 | Build `FAQAccordion` with expand/collapse animation | `view/components/FAQAccordion.tsx` |
| 9 | Build `LearnSection` wrapper | `view/components/LearnSection.tsx` |
| 10 | Write `useHomeViewModel` (fetching `/history`, `/routine`, and Supabase `articles`) | `viewmodel/useHomeViewModel.ts` |
| 11 | Assemble `HomeContainer` | `view/containers/HomeContainer.tsx` |
| 12 | Wire container into `(tabs)/index.tsx` | `src/app/(tabs)/index.tsx` |

---

> [!NOTE]
> - **Articles:** Now dynamically fetched from the Supabase `articles` table using the existing `@supabase/supabase-js` client (`src/shared/services/supabase.ts`), where public SELECT RLS is enabled.
> - **FAQs:** Curated static dataset tailored to the AureSkin study (AI analysis, health score, skin types, routine guidance, and dermatologist disclaimer).
> - **SVG Support:** `react-native-svg` (`v15.15.4`) is already confirmed installed in `package.json`.
