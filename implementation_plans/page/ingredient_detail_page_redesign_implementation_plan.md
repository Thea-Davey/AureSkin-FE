# AureSkin — Ingredient Detail Page Redesign Implementation Plan

## 1. Overview & Objectives Mapping

| Property | Value |
|---|---|
| **Target Screen** | `frontend/src/features/library/view/components/IngredientDetailPage.tsx` |
| **New Components** | `CompatibilityBadge.tsx`, `CompatibleNote.tsx`, `DescriptionCard.tsx` |
| **Component Location** | `frontend/src/features/library/view/components/` |
| **Shared Blueprint** | `src/shared/components/PositiveNote.tsx` (Style 1 & Style 2) |
| **Design System** | `frontend/tailwind.config.js` & `frontend/src/shared/theme/index.ts` |
| **Architecture Pattern** | Strict MVVM with NativeWind tokens & modular reusable component composition |

---

## 2. Key Objectives & Design Specification

### Objective 1: Modular `CompatibilityBadge` Component
- **Component File:** `frontend/src/features/library/view/components/CompatibilityBadge.tsx`
- **Current Problem:** The compatibility badge logic is duplicated inline inside both `IngredientDetailPage.tsx` and `ProductDetailPage.tsx`. Furthermore, showing "Not listed" and "Scan needed" badges can clutter the header when an ingredient simply has not been matched yet.
- **Solution:**
  - Extract the badge into a standalone, reusable component in `features/library/view/components/CompatibilityBadge.tsx`.
  - **Visibility Rule:** Only the `"compatible"` status renders a visible badge. Ingredients with `"not_listed"`, `"scan_needed"`, `"unavailable"`, or active loading states render `null` (hidden for now).
  - **Visual Design:**
    - Container: `rounded-badge bg-status-success px-2.5 py-1.5 flex-row items-center gap-1`
    - Icon: `BadgeCheck` (14px, `color={theme.colors.white}`)
    - Text: `text-caption font-sans-semibold text-neutral-white` ("Compatible")

---

### Objective 2: Dedicated `CompatibleNote` Component
- **Component File:** `frontend/src/features/library/view/components/CompatibleNote.tsx`
- **Blueprint Component:** Wraps `src/shared/components/PositiveNote.tsx`.
- **Icon Alignment:** Uses the exact same check symbol as `CompatibilityBadge` (`BadgeCheck` from `lucide-react-native`).
- **Body Copy Polish & Selection:**
  - *Draft Text:*  
    `"This ingredient is marked “compatible” as per recent skin analysis. These marked ingredients may change every time you scan your face when you get different results."`  
    *(Wordy, repeats "marked" and "results", spans 3–4 lines on mobile).*
  - *Recommended Polished Text (Option A - Concise & Professional):*  
    **`"Compatible with your latest skin analysis. This status may update whenever you rescan your skin."`**  
    *(15 words, crisp, perfectly fits within 2 lines on all mobile devices).*
  - *Alternative Text (Option B - Informative):*  
    `"Marked compatible based on your latest skin profile. Recommendations automatically update after each scan."`
- **Style Selection Logic (Style 1 vs Style 2):**
  - **Style 2 (Recommended for 1–2 lines):** Stacked header with compact `w-7 h-7` badge + "Compatible" title, followed by full-width body text below. Matches the bottom callout in `image 1`.
  - **Style 1 (For >2 lines):** Horizontal two-column layout (`w-10 h-10` badge on the left, title and multiline body on the right). Matches the top callout in `image 1`.
  - The component will dynamically evaluate text length or accept an explicit `style?: 1 | 2` prop, defaulting to **Style 2** for the recommended 2-line copy.

---

### Objective 3: Reusable `DescriptionCard` Component
- **Component File:** `frontend/src/features/library/view/components/DescriptionCard.tsx`
- **Purpose:** Replace all hardcoded inline cards ("What is it?", "What does it do?", "What is it good for?", "Who should avoid it?") with a single, highly flexible component.
- **Card Variants:**
  1. **`description` variant:** Renders a clean narrative text paragraph (e.g. for "What is it?" and "What does it do?").
  2. **`bulleted` variant:** Renders a list of items with dynamic bullet icons (e.g. for "What is it good for?" and "Who should avoid it?").
- **Dynamic Bullet Symbols (`bulletTone`):**
  - **`positive` (Green Dot):** `<View className="mt-1.5 h-2 w-2 rounded-full bg-accent" />` (used for "What is it good for?").
  - **`negative` (Red Dot):** `<View className="mt-1.5 h-2 w-2 rounded-full bg-status-error" />` (used for "Who should avoid?").
  - **`ingredient` (Droplet Icon):** `<Droplet size={13} color={theme.colors.secondary} fill={theme.colors.secondary} className="mt-0.5" />` (matches the ingredient bullet icon from `ProductDetailPage`).
- **Caution / Custom Children Support:**
  - Allows passing a cautionary subtext or rich children (e.g., when an ingredient has both an avoid bullet list and an additional caution disclaimer).

---

### Objective 4: Typographic Hierarchy & Visual Overhaul

#### The Problem:
Currently, the entire page has uniform text weight and color (`text-text` everywhere), and the ingredient name at the top is only `text-h3` (18px)—the exact same size as the card headings. This lacks contrast, causing eye fatigue and visual clutter.

#### Recommended Hierarchy Solution:

```
┌────────────────────────────────────────────────────────┐
│  [Hero Header]                                         │
│  Niacinamide                          [Compatible] [★] │  ← text-h2 font-sans-bold text-text (Strongest)
│  A versatile water-soluble vitamin that refines pores. │  ← text-body-sm font-sans text-muted (Subtitle)
├────────────────────────────────────────────────────────┤
│  [CompatibleNote (Style 2)]                            │
│  [✓] Compatible                                        │  ← Light green container, BadgeCheck icon
│  Compatible with your latest skin analysis...          │  ← text-body-sm font-sans text-text
├────────────────────────────────────────────────────────┤
│  [DescriptionCard 1: What is it?]                      │
│  WHAT IS IT?                                           │  ← text-body-sm font-sans-bold text-muted (Category)
│  A form of Vitamin B3 that supports natural ceramide.. │  ← text-body-sm font-sans text-text (Primary readable)
├────────────────────────────────────────────────────────┤
│  [DescriptionCard 2: What does it do?]                 │
│  WHAT DOES IT DO?                                      │  ← text-body-sm font-sans-bold text-muted
│  Regulates sebum, calms redness, and evens skin tone.  │  ← text-body-sm font-sans text-text
├────────────────────────────────────────────────────────┤
│  [DescriptionCard 3: What is it good for?]             │
│  WHAT IS IT GOOD FOR?                                  │  ← text-body-sm font-sans-bold text-muted
│  ● Reducing blemishes and enlarged pores               │  ← Green dot (positive tone) + text-text
│  ● Strengthening the skin barrier                      │
├────────────────────────────────────────────────────────┤
│  [DescriptionCard 4: Who should avoid?]                │
│  WHO SHOULD AVOID IT?                                  │  ← text-body-sm font-sans-bold text-muted
│  ● Severe vitamin B hypersensitivity                   │  ← Red dot (negative tone) + text-text
│  Caution: Patch test before combining with direct AHAs.│  ← text-caption font-sans text-muted
└────────────────────────────────────────────────────────┘
```

#### Color & Typography Token Mapping:

| Element | Old Preset & Color | New Preset & Color | Non-Obvious Rationale |
|---|---|---|---|
| **Ingredient Name** | `text-h3 font-sans-semibold text-text` (18px) | **`text-h2 font-sans-bold text-text`** (22px) | Establishes an unmistakable visual hero for the page. |
| **Intro Description** | `text-body-sm font-sans text-text` | **`text-body-sm font-sans text-muted`** | Gray subtext softens the top area and clearly distinguishes summary from deep dive cards. |
| **Card Category Titles** | `text-h3 font-sans-bold text-text` (Solid black) | **`text-body-sm font-sans-bold text-muted`** (or `text-primary`) | Muted, lighter header guides the eye as a section label without fighting with body text. |
| **Card Body Text** | `text-body-sm font-sans text-text` | **`text-body-sm font-sans text-text leading-5`** | Kept as solid black `#2D2D2D` for maximum legibility (>14:1 WCAG AAA). |
| **Bulleted Text** | `text-body-sm font-sans text-text` | **`text-body-sm font-sans text-text leading-5`** | Clean alignment with dynamic colored dots. |

---

## 3. Complete File Tree of Changes

```
AureSkin/
└── frontend/
    └── src/
        └── features/
            └── library/
                └── view/
                    └── components/
                        ├── CompatibilityBadge.tsx    ← [NEW] Extracted standalone badge (only compatible visible)
                        ├── CompatibleNote.tsx        ← [NEW] PositiveNote wrapper with BadgeCheck & 2-line copy
                        ├── DescriptionCard.tsx       ← [NEW] Reusable card for description and bulleted styles
                        └── IngredientDetailPage.tsx  ← [MODIFIED] Composed with new modular components & hierarchy
```

---

## 4. Layer-by-Layer Architectural Details

### 4.1 `CompatibilityBadge.tsx`
```tsx
import React from 'react';
import { View, Text } from 'react-native';
import { BadgeCheck } from 'lucide-react-native';
import { theme } from '@/shared/theme';
import type { IngredientCompatibilityStatus } from '../../model/library_types';

interface CompatibilityBadgeProps {
  status: IngredientCompatibilityStatus;
  isLoading?: boolean;
}

export function CompatibilityBadge({ status, isLoading }: CompatibilityBadgeProps) {
  // Only "Compatible" status is visible. Hidden for not_listed, scan_needed, unavailable.
  if (isLoading || status !== 'compatible') {
    return null;
  }

  return (
    <View
      accessibilityRole="text"
      accessibilityLabel="Compatible with your latest skin analysis"
      className="flex-row items-center gap-1 rounded-badge bg-status-success px-2.5 py-1.5"
    >
      <BadgeCheck size={14} color={theme.colors.white} strokeWidth={2.2} />
      <Text className="text-caption font-sans-semibold text-neutral-white">
        Compatible
      </Text>
    </View>
  );
}
```

---

### 4.2 `CompatibleNote.tsx`
```tsx
import React from 'react';
import { BadgeCheck } from 'lucide-react-native';
import { PositiveNote } from '@/shared/components';

interface CompatibleNoteProps {
  /** Optional custom body override; defaults to polished 2-line text */
  description?: string;
  /** Explicit style override (1 = side-by-side, 2 = stacked header); auto-detected if omitted */
  style?: 1 | 2;
  /** Additional container classes */
  className?: string;
}

const DEFAULT_COMPATIBLE_TEXT =
  'Compatible with your latest skin analysis. This status may update whenever you rescan your skin.';

export function CompatibleNote({
  description = DEFAULT_COMPATIBLE_TEXT,
  style,
  className = '',
}: CompatibleNoteProps) {
  // If text is 2 lines or fewer (~110 chars), use Style 2; otherwise use Style 1
  const effectiveStyle: 1 | 2 = style ?? (description.length > 110 ? 1 : 2);

  return (
    <PositiveNote
      style={effectiveStyle}
      icon={BadgeCheck}
      title="Compatible"
      description={description}
      className={`mb-4 ${className}`}
      testID="compatible-ingredient-note"
    />
  );
}
```

---

### 4.3 `DescriptionCard.tsx`
```tsx
import React, { ReactNode } from 'react';
import { View, Text } from 'react-native';
import { Droplet } from 'lucide-react-native';
import { theme } from '@/shared/theme';

export type BulletTone = 'positive' | 'negative' | 'ingredient';

export interface DescriptionCardProps {
  /** Section heading title (e.g. "What is it?", "What does it do?") */
  title: string;
  /** Card presentation style: 'description' (paragraph) or 'bulleted' (list). Default: 'description' */
  variant?: 'description' | 'bulleted';
  /** Paragraph text for 'description' variant */
  description?: string | null;
  /** List items for 'bulleted' variant */
  bullets?: string[];
  /** Bullet symbol tone: 'positive' (green dot), 'negative' (red dot), 'ingredient' (droplet icon). Default: 'positive' */
  bulletTone?: BulletTone;
  /** Optional extra content (e.g. caution disclaimer or subtext) */
  children?: ReactNode;
  /** Additional outer container classes */
  className?: string;
}

export function DescriptionCard({
  title,
  variant = 'description',
  description,
  bullets = [],
  bulletTone = 'positive',
  children,
  className = '',
}: DescriptionCardProps) {
  const renderBulletSymbol = () => {
    switch (bulletTone) {
      case 'ingredient':
        return (
          <View className="mt-0.5 shrink-0">
            <Droplet size={13} color={theme.colors.secondary} fill={theme.colors.secondary} />
          </View>
        );
      case 'negative':
        return <View className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-status-error" />;
      case 'positive':
      default:
        return <View className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" />;
    }
  };

  return (
    <View className={`mb-3 rounded-card border border-border bg-card p-4 shadow-xs ${className}`}>
      {/* Category Card Title: Styled with text-body-sm font-sans-bold text-muted for clean hierarchy */}
      <Text className="mb-2 text-body-sm font-sans-bold text-muted">
        {title}
      </Text>

      {/* Description Variant: Narrative Text */}
      {variant === 'description' && description?.trim() ? (
        <Text className="text-body-sm font-sans text-text leading-5">
          {description}
        </Text>
      ) : null}

      {/* Bulleted Variant: List of Items with Dynamic Dot */}
      {variant === 'bulleted' && bullets.length > 0 ? (
        <View className="gap-2">
          {bullets.map((item, index) => (
            <View key={`${item}-${index}`} className="flex-row items-start gap-2.5">
              {renderBulletSymbol()}
              <Text className="flex-1 text-body-sm font-sans text-text leading-5">
                {item}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {/* Extra Children (e.g. Caution notes, custom paragraphs) */}
      {children}
    </View>
  );
}
```

---

### 4.4 Refactored `IngredientDetailPage.tsx` Composition

```tsx
{/* Hero Header Row */}
<View className="flex-row items-start gap-2 border-b border-border px-5 py-4">
  <View className="flex-1">
    <Text numberOfLines={2} className="text-h2 font-sans-bold text-text">
      {ingredient.name}
    </Text>
    {ingredient.description?.trim() ? (
      <Text className="mt-1 text-body-sm font-sans text-muted leading-relaxed">
        {ingredient.description}
      </Text>
    ) : null}
  </View>

  <CompatibilityBadge status={compatibilityStatus} isLoading={isCompatibilityLoading} />
  
  <Pressable onPress={onToggleFavorite} className="p-1 active:opacity-70">
    <Star size={22} ... />
  </Pressable>
</View>

{/* Scroll Content */}
<ScrollView className="flex-1" contentContainerClassName="px-5 pb-8 pt-4">
  {/* 1. Compatible Note (Only visible when status is 'compatible') */}
  {compatibilityStatus === 'compatible' ? (
    <CompatibleNote />
  ) : null}

  {/* 2. What is it? */}
  {ingredient.what_is_it?.trim() ? (
    <DescriptionCard
      title="What is it?"
      variant="description"
      description={ingredient.what_is_it}
    />
  ) : null}

  {/* 3. What does it do? */}
  {ingredient.benefits?.trim() ? (
    <DescriptionCard
      title="What does it do?"
      variant="description"
      description={ingredient.benefits}
    />
  ) : null}

  {/* 4. What is it good for? (Bulleted with green dot) */}
  {(ingredient.good_for?.length || ingredient.skin_types.length) ? (
    <DescriptionCard
      title="What is it good for?"
      variant="bulleted"
      bulletTone="positive"
      bullets={ingredient.good_for?.length ? ingredient.good_for : formattedSkinTypes}
    />
  ) : null}

  {/* 5. Who should avoid it? (Bulleted with red dot + optional caution text) */}
  {(ingredient.avoid?.length || ingredient.caution?.trim()) ? (
    <DescriptionCard
      title="Who should avoid?"
      variant="bulleted"
      bulletTone="negative"
      bullets={ingredient.avoid ?? []}
    >
      {ingredient.caution?.trim() ? (
        <View className="mt-3 rounded-button bg-status-warning/10 p-3 border border-status-warning/20">
          <Text className="text-caption font-sans-semibold text-note-warning-title">Caution</Text>
          <Text className="mt-0.5 text-body-sm font-sans text-text">
            {ingredient.caution}
          </Text>
        </View>
      ) : null}
    </DescriptionCard>
  ) : null}
</ScrollView>
```

---

## 5. Verification & Testing Checklist

- [ ] `CompatibilityBadge.tsx`: Only renders when `status === 'compatible'`. Returns `null` for `not_listed`, `scan_needed`, and `unavailable`.
- [ ] `CompatibleNote.tsx`: Displays `BadgeCheck` icon, green callout styling, and polished 2-line copy using `Style 2`.
- [ ] `DescriptionCard.tsx`: Correctly renders `description` and `bulleted` variants.
- [ ] Dynamic bullet tones render accurately: `positive` (green dot), `negative` (red dot), `ingredient` (droplet icon).
- [ ] Typographic hierarchy: Ingredient title is unmistakably prominent (`text-h2 font-sans-bold`), card headers are softened (`text-body-sm font-sans-bold text-muted`), and body content remains high-contrast `#2D2D2D`.
- [ ] Zero TypeScript or linter errors with `npx tsc --noEmit`.
