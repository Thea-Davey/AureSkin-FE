# AureSkin — Global Notes & Callouts Implementation Plan

## 1. Overview & Reference Mapping

| Property | Value |
|---|---|
| **Target Components** | `PositiveNote.tsx`, `WarningNote.tsx`, `NegativeNote.tsx` |
| **Location** | `frontend/src/shared/components/` |
| **Reference Image** | User-provided reference (`image 1`) displaying **Style 1** (horizontal two-column) and **Style 2** (stacked header with full-width body) |
| **Design System** | `frontend/tailwind.config.js` & `frontend/src/shared/theme/index.ts` |
| **Architecture Pattern** | Shared UI Layer Components with DRY Layout Engine (`BaseNote`) |

---

## 2. Visual & Layout Specifications

Based on the reference image, each note component supports **two distinct visual styles** while sharing identical token logic, accessibility semantics, and padding hierarchy.

### 2.1 Style 1 — Horizontal Two-Column Layout
Used for prominent feature explanations, routine rationales, and side-by-side callout badges:
- **Outer Container:** `rounded-card border p-4 shadow-xs`
- **Flex Direction:** `flex-row items-start gap-3.5`
- **Column 1 (Note Symbol):**
  - Circular badge container: `w-10 h-10 rounded-full items-center justify-center shrink-0`
  - Background: Tone element color (`bg-note-<type>-element`)
  - Icon: 20px, white (`color={theme.colors.white}`)
- **Column 2 (Content Column — `flex-1`):**
  - **Row 1 (Title):** `text-body font-sans-bold text-text` (e.g., *"Why this routine?"*)
  - **Row 2 (Body):** `mt-1 text-body-sm font-sans text-text leading-5` (e.g., *"This routine is designed to address..."*)

```
┌─────────────────────────────────────────────────────────────┐
│ ┌─────────┐  Why this routine?                              │
│ │ [Icon]  │  This routine is designed to address your acne  │
│ └─────────┘  & texture concerns while maintaining healthy...│
└─────────────────────────────────────────────────────────────┘
```

---

### 2.2 Style 2 — Stacked Header with Full-Width Body
Used for disclaimers, condition warnings, and compatibility verdicts:
- **Outer Container:** `rounded-card border p-4 shadow-xs`
- **Row 1 (Header Row):** `flex-row items-center gap-2.5 mb-2`
  - **Col 1 (Note Symbol):**
    - Compact circular badge: `w-7 h-7 rounded-full items-center justify-center shrink-0`
    - Background: Tone element color (`bg-note-<type>-element`)
    - Icon: 15px, white (`color={theme.colors.white}`)
  - **Col 2 (Title):** `text-h3 font-sans-bold text-text` (e.g., *"Disclaimer"*, *"Compatible"*)
- **Row 2 (Body):**
  - Full width text below the header: `text-body-sm font-sans text-text leading-5`

```
┌─────────────────────────────────────────────────────────────┐
│ ┌────┐  Disclaimer                                          │
│ │[!] │                                                      │
│ └────┘                                                      │
│ This analysis is intended for educational and informational │
│ purposes only and should not be used for self-diagnosis...  │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Note Types & Design Token Audit

All styling strictly adheres to `frontend/tailwind.config.js` and `frontend/src/shared/theme/index.ts`. Body text across all notes strictly uses `text-text` (`#2D2D2D`) to ensure high contrast (>14:1) against the light pastel containers.

| Note Component | Container BG | Border Token | Badge & Accent Token | Default Icon (Lucide) | Typical Use Cases |
|---|---|---|---|---|---|
| **`PositiveNote`** | `bg-note-positive`<br>`#EBF5EA` | `border-note-positive-border`<br>`#C8E6C9` | `bg-note-positive-element`<br>`#2E7D32` | `Check` (Style 2)<br>`ShieldCheck` (Style 1) | Compatible ingredients, beneficial active rationale, verified safety |
| **`WarningNote`** | `bg-note-warning`<br>`#FFF8E7` | `border-note-warning-border`<br>`#FFE0B2` | `bg-note-warning-element`<br>`#F57C00` | `AlertTriangle` (Style 2)<br>`ShieldAlert` (Style 1) | Medical disclaimers, cautious usage warnings, patch-test advice |
| **`NegativeNote`** | `bg-note-negative`<br>`#FDECEA` | `border-note-negative-border`<br>`#FFCDD2` | `bg-note-negative-element`<br>`#D32F2F` | `AlertCircle` / `X` | Incompatible active ingredient clash, harsh irritant alerts, high risk |

---

## 4. Component Architecture & Props Specification

To ensure 100% layout consistency across all 3 notes and both styles, we implement an internal DRY layout component `BaseNote.tsx`.

### 4.1 Common Props Interface (`NoteProps`)
```typescript
import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react-native';

export interface NoteProps {
  /** Note heading text */
  title: string;
  /** Body text string */
  description?: string;
  /** Optional custom React children for complex body content (e.g., bullet items, links) */
  children?: ReactNode;
  /** Layout style: 1 = side-by-side two-column, 2 = stacked header with body below. Default: 1 */
  style?: 1 | 2;
  /** Override default Lucide icon */
  icon?: LucideIcon;
  /** Additional Tailwind className for outer margin/positioning (e.g., 'mx-5 mb-3') */
  className?: string;
  /** Accessibility test ID */
  testID?: string;
}
```

### 4.2 File Tree of Changes
```
AureSkin/
└── frontend/
    └── src/
        └── shared/
            └── components/
                ├── BaseNote.tsx            ← [NEW] Internal DRY layout engine for Style 1 & Style 2
                ├── PositiveNote.tsx        ← [NEW] Exported global positive callout
                ├── WarningNote.tsx         ← [NEW] Exported global warning / disclaimer callout
                ├── NegativeNote.tsx        ← [NEW] Exported global negative / incompatible callout
                └── index.ts                ← [NEW] Central re-export for clean imports
```

---

## 5. Detailed Component Implementation

### 5.1 `BaseNote.tsx` (Internal Layout Engine)
```tsx
import React, { ReactNode } from 'react';
import { View, Text } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { theme } from '../theme';

export interface BaseNoteProps {
  title: string;
  description?: string;
  children?: ReactNode;
  style?: 1 | 2;
  icon: LucideIcon;
  containerClass: string;
  borderClass: string;
  badgeClass: string;
  className?: string;
  testID?: string;
}

export function BaseNote({
  title,
  description,
  children,
  style = 1,
  icon: IconComponent,
  containerClass,
  borderClass,
  badgeClass,
  className = '',
  testID,
}: BaseNoteProps) {
  const content = children || (
    description ? (
      <Text className="text-body-sm font-sans text-text leading-5">
        {description}
      </Text>
    ) : null
  );

  if (style === 2) {
    return (
      <View
        testID={testID}
        accessibilityRole="summary"
        className={`rounded-card border ${borderClass} ${containerClass} p-4 shadow-xs ${className}`}
      >
        {/* Row 1: Icon Badge + Title */}
        <View className="flex-row items-center gap-2.5 mb-2">
          <View className={`w-7 h-7 rounded-full items-center justify-center shrink-0 ${badgeClass}`}>
            <IconComponent size={15} color={theme.colors.white} strokeWidth={2.5} />
          </View>
          <Text className="text-h3 font-sans-bold text-text flex-1">
            {title}
          </Text>
        </View>

        {/* Row 2: Full-width Body */}
        <View className="w-full">
          {content}
        </View>
      </View>
    );
  }

  // Style 1 (Default): Col 1 Icon Badge + Col 2 (Row 1 Title, Row 2 Body)
  return (
    <View
      testID={testID}
      accessibilityRole="summary"
      className={`flex-row items-start gap-3.5 rounded-card border ${borderClass} ${containerClass} p-4 shadow-xs ${className}`}
    >
      <View className={`w-10 h-10 rounded-full items-center justify-center shrink-0 ${badgeClass}`}>
        <IconComponent size={20} color={theme.colors.white} strokeWidth={2.2} />
      </View>
      <View className="flex-1">
        <Text className="text-body font-sans-bold text-text mb-1">
          {title}
        </Text>
        {content}
      </View>
    </View>
  );
}
```

---

### 5.2 `PositiveNote.tsx`
```tsx
import React from 'react';
import { Check, ShieldCheck } from 'lucide-react-native';
import { BaseNote, BaseNoteProps } from './BaseNote';
import type { NoteProps } from './types';

export function PositiveNote({
  style = 1,
  icon,
  ...props
}: NoteProps) {
  // Style 1 defaults to ShieldCheck (rationale/protection), Style 2 defaults to Check (compatible status)
  const DefaultIcon = style === 2 ? Check : ShieldCheck;

  return (
    <BaseNote
      style={style}
      icon={icon || DefaultIcon}
      containerClass="bg-note-positive"
      borderClass="border-note-positive-border"
      badgeClass="bg-note-positive-element"
      {...props}
    />
  );
}
```

---

### 5.3 `WarningNote.tsx`
```tsx
import React from 'react';
import { AlertTriangle, ShieldAlert } from 'lucide-react-native';
import { BaseNote } from './BaseNote';
import type { NoteProps } from './types';

export function WarningNote({
  style = 1,
  icon,
  ...props
}: NoteProps) {
  // Style 2 defaults to AlertTriangle (disclaimers), Style 1 defaults to ShieldAlert
  const DefaultIcon = style === 2 ? AlertTriangle : ShieldAlert;

  return (
    <BaseNote
      style={style}
      icon={icon || DefaultIcon}
      containerClass="bg-note-warning"
      borderClass="border-note-warning-border"
      badgeClass="bg-note-warning-element"
      {...props}
    />
  );
}
```

---

### 5.4 `NegativeNote.tsx`
```tsx
import React from 'react';
import { AlertCircle, X } from 'lucide-react-native';
import { BaseNote } from './BaseNote';
import type { NoteProps } from './types';

export function NegativeNote({
  style = 1,
  icon,
  ...props
}: NoteProps) {
  // Style 2 defaults to X (incompatible active clash), Style 1 defaults to AlertCircle
  const DefaultIcon = style === 2 ? X : AlertCircle;

  return (
    <BaseNote
      style={style}
      icon={icon || DefaultIcon}
      containerClass="bg-note-negative"
      borderClass="border-note-negative-border"
      badgeClass="bg-note-negative-element"
      {...props}
    />
  );
}
```

---

## 6. Usage Examples & Integration Opportunities

```tsx
// Example 1: Routine Rationale (Style 1 Positive Note)
<PositiveNote
  style={1}
  title="Why this routine?"
  description="This routine is designed to address your acne & texture concerns while maintaining healthy and balanced skin."
/>

// Example 2: Medical Disclaimer (Style 2 Warning Note)
<WarningNote
  style={2}
  title="Disclaimer"
  description="This analysis is intended for educational and informational purposes only and should not be used for self-diagnosis..."
/>

// Example 3: Ingredient Compatibility (Style 2 Positive Note)
<PositiveNote
  style={2}
  title="Compatible"
  description="This ingredient is marked 'compatible' as per recent skin analysis."
/>

// Example 4: Incompatible actives (Style 2 Negative Note)
<NegativeNote
  style={2}
  title="Incompatible Combination"
  description="These active ingredients may cause severe irritation when applied together."
/>
```

---

## 7. Verification & Testing Checklist

- [ ] All 3 components compile cleanly with TypeScript in Expo development server.
- [ ] Style 1 displays two-column layout (`col1: badge`, `col2: [title, body]`).
- [ ] Style 2 displays stacked layout (`row1: [badge, title]`, `row2: body`).
- [ ] Body text retains `#2D2D2D` (`text-text`) for WCAG AAA contrast ratio (>14:1).
- [ ] Custom icons and custom ReactNode children render properly when provided.
- [ ] No regression on existing running background processes.
