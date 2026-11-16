# Implementation Plan — Set Up Your Skin Analysis & Questionnaire Flow

> **Document Type:** Screen Architecture & Feature Implementation Plan  
> **Target Scope:** 
> 1. Set Up Your Skin Analysis Page (`ScanSetupPage`)
> 2. Skin Analysis Questionnaire Page (`ScanQuestionnairePage`)
> 3. Review Answers Page (`ScanReviewAnswersPage`)
> 4. Scan Overlay Retirement & Global Scan Navigation Redirection  
> **Design References:**
> - Reference Image 1 (Enhanced ON + Single Shot): [`scan_setup_1.png`](file:///c:/Users/Thea/Documents/DLSUD/AureSkin/frontend/implementation_plans/page/target_images/scan_setup_1.png)
> - Reference Image 2 (Enhanced OFF + Triple Shot): [`scan_setup_2.png`](file:///c:/Users/Thea/Documents/DLSUD/AureSkin/frontend/implementation_plans/page/target_images/scan_setup_2.png)
> - Reference Image 3 (Dynamic Card States): [`scan_setup_3.png`](file:///c:/Users/Thea/Documents/DLSUD/AureSkin/frontend/implementation_plans/page/target_images/scan_setup_3.png)
> - Reference Image 4 (Questionnaire Card): [`scan_setup_4.png`](file:///c:/Users/Thea/Documents/DLSUD/AureSkin/frontend/implementation_plans/page/target_images/scan_setup_4.png)
> - Reference Image 5 (Review Answers List): [`scan_setup_5.png`](file:///c:/Users/Thea/Documents/DLSUD/AureSkin/frontend/implementation_plans/page/target_images/scan_setup_5.png)  
> **Design Tokens Source:** [`frontend-rules.md`](file:///c:/Users/Thea/Documents/DLSUD/AureSkin/.agents/rules/frontend-rules.md), `frontend/tailwind.config.js`, and `frontend/src/shared/theme/index.ts`  
> **Status:** ⏳ **READY FOR USER REVIEW (Step 1 — Mandatory Checkpoint)**

---

## 1. Executive Summary & Architectural Overview

This plan details the full implementation of the **Set Up Your Skin Analysis** workflow in AureSkin. This replaces the legacy `ScanOverlay` (which merely popped up "Take a Photo" / "Upload a Photo" buttons) with an intelligent, multi-step analysis preparation flow:

1. **Analysis Configuration:**
   - **Enhanced Skin Analysis Toggle:** Allows users to include a validated 10-question dermatological questionnaire alongside their facial scan for more personalized skin-type classification.
   - **Shot Type Selection:** Allows switching between **Single Shot** (1 frontal selfie) and **Triple Shot** (front, left, and right photos for broader facial coverage).
   - **Photo Acquisition:** Displays clear anatomical framing placeholders (Frontal only, or Left + Front + Right). Supports photo uploading, taking photos, per-shot retake, and clear all.
2. **Skin Analysis Questionnaire:**
   - 10 structured diagnostic questions measuring perceived oiliness, dryness, sensitivity, reactivity, and barrier balance.
   - Smooth navigation with Previous, Next, and Complete buttons, and dynamic progress tracking.
3. **Review & Edit Answers:**
   - Dedicated review page listing all 10 answered questions with inline Edit shortcuts back to specific questions, plus Discard Changes and Save actions.
4. **Validation & Submit Footer:**
   - Real-time requirement evaluation:
     - If Enhanced Analysis is ON $\rightarrow$ Questionnaire must be completed (10/10).
     - Shot Type must be selected (`single` or `triple`).
     - Required photos must be uploaded (1 for single, 3 for triple).
   - Dynamic footer message and deactivated/activated submit button.
5. **Scan Overlay Retirement:**
   - All scan triggers across the app (`BottomNavBar`, Home CTA, Routine CTA, History CTA) redirect immediately to `ScanSetupPage`.

---

## 2. Complete Resolved File Tree & Scope

```
frontend/
├── src/
│   ├── app/
│   │   ├── (tabs)/
│   │   │   ├── _layout.tsx                     ← [UPDATE] Center scan tab navigates to /scan/setup
│   │   │   └── scan.tsx                        ← [UPDATE] Redirects to /scan/setup
│   │   │
│   │   └── scan/
│   │       ├── setup.tsx                       ← [NEW] Route for Set Up Your Skin Analysis screen
│   │       ├── questionnaire.tsx               ← [NEW] Route for Skin Analysis Questionnaire screen
│   │       ├── review-answers.tsx              ← [NEW] Route for Review Answers screen
│   │       ├── camera.tsx                      ← [UPDATE] Supports single/triple shot capture modes
│   │       └── upload.tsx                      ← [UPDATE] Supports single/triple shot gallery pick
│   │
│   ├── shared/
│   │   └── components/
│   │       ├── BottomNavBar.tsx                ← [UPDATE] Center scan button directly navigates to /scan/setup
│   │       ├── Button.tsx                      ← [EXISTING] Shared button used for all actions
│   │       └── Card.tsx                        ← [EXISTING] Shared card container used for all cards
│   │
│   └── features/
│       ├── home/view/containers/
│       │   └── s1_LatestAnalysis.tsx           ← [UPDATE] "SCAN SKIN NOW!" routes to /scan/setup
│       │
│       ├── routine/view/
│       │   └── RoutinePage.tsx                 ← [UPDATE] "SCAN SKIN NOW!" routes to /scan/setup
│       │
│       ├── history/view/
│       │   └── HistoryPage.tsx                 ← [UPDATE] Empty state scan CTA routes to /scan/setup
│       │
│       └── scan/
│           ├── model/
│           │   ├── scan_types.ts               ← [UPDATE] Add ShotType, Questionnaire, SetupState types
│           │   ├── scan_mock.ts                ← [UPDATE] Add 10 questionnaire questions and mock selfies
│           │   ├── scan_api.ts                 ← [UPDATE] Add questionnaire & setup mock endpoints
│           │   └── scanStore.ts                ← [UPDATE] Persist setup choices, shots, and answers
│           │
│           ├── viewmodel/
│           │   ├── useScanSetup.ts             ← [NEW] Hook managing setup toggles, shots, validation
│           │   ├── useScanQuestionnaire.ts     ← [NEW] Hook managing 10-step questionnaire flow
│           │   └── useScanReviewAnswers.ts     ← [NEW] Hook managing review, answer editing, save/discard
│           │
│           └── view/
│               ├── ScanPage.tsx                ← [UPDATE] Redirects or mounts ScanSetupPage
│               ├── ScanSetupPage.tsx           ← [NEW] Layout shell for Set Up Your Skin Analysis
│               │
│               ├── containers/
│               │   ├── setup/                  ← [NEW] Setup page containers & sub-sections
│               │   │   ├── ScanSetupPage.tsx   ← [NEW] Primary container mounting header, cards, footer
│               │   │   ├── ScanQuestionnairePage.tsx ← [NEW] Container for questionnaire flow (Image 4)
│               │   │   └── ScanReviewAnswersPage.tsx ← [NEW] Container for review answers flow (Image 5)
│               │   │
│               │   └── overlay/                ← [RETIRED / DEPRECATED] ScanOverlay bypassed
│               │
│               └── components/
│                   ├── SetupHeader.tsx         ← [NEW] Fixed top header for setup (Image 1)
│                   ├── SetupSubmitFooter.tsx   ← [NEW] Fixed bottom review/submit footer (Images 1, 2, 3)
│                   ├── AnalysisTypeCard.tsx    ← [NEW] Card with toggle & dynamic footer note (Images 1, 2)
│                   ├── SkinTypeQuestionnaireCard.tsx ← [NEW] Card with dynamic status & buttons (Images 1, 3)
│                   ├── ShotTypeCard.tsx        ← [NEW] Card with Single/Triple selectors (Images 1, 2)
│                   ├── CapturePhotoCard.tsx    ← [NEW] Card with 1-col / 3-col shots & actions (Images 1, 2, 3)
│                   ├── QuestionnaireCard.tsx   ← [NEW] Single question card with choices & measures (Image 4)
│                   ├── QuestionnaireFooter.tsx ← [NEW] Fixed footer with Previous / Next / Complete (Image 4)
│                   ├── ReviewQuestionCard.tsx  ← [NEW] Compact question card with Edit button (Image 5)
│                   └── ReviewAnswersFooter.tsx ← [NEW] Fixed footer with Discard Changes & Save (Image 5)
```

---

## 3. Data Model & State Architecture

### 3.1 Extended TypeScript Types (`frontend/src/features/scan/model/scan_types.ts`)

```typescript
export type ShotType = 'single' | 'triple';

export interface SetupPhotos {
  front?: string | null;
  left?: string | null;
  right?: string | null;
}

export interface QuestionnaireChoice {
  id: string;
  label: string;
}

export interface QuestionnaireQuestion {
  id: number;
  questionNumber: number;
  question: string;
  choices: QuestionnaireChoice[];
  measures: string;
}

export interface QuestionnaireAnswer {
  questionId: number;
  selectedChoiceId: string;
  selectedChoiceLabel: string;
}

export interface ScanSetupState {
  enhancedSkinAnalysis: boolean;
  shotType: ShotType | null;
  photos: SetupPhotos;
  questionnaireAnswers: Record<number, QuestionnaireAnswer>;
  isQuestionnaireCompleted: boolean;
}

export interface SetupValidationResult {
  isValid: boolean;
  isQuestionnaireValid: boolean;
  isShotTypeValid: boolean;
  isPhotosValid: boolean;
  uploadedCount: number;
  requiredPhotosCount: number;
  statusHeader: string;
  statusSubtitle: string;
}
```

### 3.2 Mock Data Specification (`frontend/src/features/scan/model/scan_mock.ts`)

1. **10 Dermatological Questions (`MOCK_QUESTIONNAIRE_QUESTIONS`):**
   - **Q1:** "How does your facial skin usually feel throughout the day?"
     - Choices: Mostly dry or tight, Comfortable and balanced, Mostly oily or greasy, Not sure
     - Measures: "Measures: Overall perceived oiliness and dryness. Supported by self-reported symptom research."
   - **Q2:** "How does your skin look 2–3 hours after washing your face?"
     - Choices: Flaky or matte with no shine, Smooth and normal, Shiny all over, Shiny only on forehead and nose
     - Measures: "Measures: Natural sebum excretion rate and sebaceous gland activity."
   - **Q3:** "How frequently do you experience breakouts or clogged pores?"
     - Choices: Rarely or never, Occasionally around hormonal cycles, Frequently on T-zone only, Regularly all over face
     - Measures: "Measures: Acne vulnerability and follicle hyperkeratinization."
   - **Q4:** "How does your skin react to new skincare products or weather changes?"
     - Choices: Rarely reacts, Occasional temporary redness, Easily stung, red, or irritated, Breaks out immediately
     - Measures: "Measures: Epidermal barrier integrity and neurosensory sensitivity."
   - **Q5:** "How visible are the pores around your nose and inner cheeks?"
     - Choices: Barely visible, Visible only upon close inspection, Noticeably enlarged on nose/forehead, Visible across entire face
     - Measures: "Measures: Follicular pore dilation and follicular wall laxity."
   - **Q6:** "How does your skin feel after taking a hot shower?"
     - Choices: Normal and unaffected, Tight and itchy needing instant moisturizer, Red and flushed, Normal with slight oiliness
     - Measures: "Measures: Transepidermal water loss (TEWL) susceptibility."
   - **Q7:** "Do you notice dry patches or flakiness alongside oily areas?"
     - Choices: Never, Sometimes on cheeks while forehead is oily, Frequent widespread flaking, No flaking but constant shine
     - Measures: "Measures: Combination skin sebum gradient and regional barrier disparity."
   - **Q8:** "How often do you develop post-inflammatory dark marks after blemishes?"
     - Choices: Never, Fades quickly within weeks, Persistent marks lasting several months, Very dark stubborn spots
     - Measures: "Measures: Melanocyte hyperactivity and hyperpigmentation risk."
   - **Q9:** "How would you describe your skin's natural moisture retention?"
     - Choices: Retains hydration effortlessly, Dehydrates quickly in air conditioning, Moderately balanced, Excessively greasy
     - Measures: "Measures: Natural Moisturizing Factor (NMF) resilience."
   - **Q10:** "What is your primary skin concern you wish to target first?"
     - Choices: Oil control & blemishes, Deep hydration & barrier repair, Tone evening & dark spots, General maintenance
     - Measures: "Measures: Primary personal skincare priority alignment."

2. **Default Sample Answers (`MOCK_DEFAULT_ANSWERS`):**
   - 10 pre-filled answers (for fast testing, review answers demo, and retake workflows).

3. **Sample Facial Photos (`MOCK_SETUP_PHOTOS`):**
   - High-quality portrait images for `left`, `front`, and `right` views (matching Image 3) to enable full visual testing of 1-shot and 3-shot uploaded cards.

### 3.3 Scan Store Integration (`frontend/src/features/scan/model/scanStore.ts`)

Add setup state actions:
```typescript
setEnhancedSkinAnalysis: (enabled: boolean) => void;
setShotType: (shotType: ShotType | null) => void;
setPhoto: (side: 'front' | 'left' | 'right', uri: string | null) => void;
clearAllPhotos: () => void;
setQuestionnaireAnswer: (questionId: number, answer: QuestionnaireAnswer) => void;
setAllQuestionnaireAnswers: (answers: Record<number, QuestionnaireAnswer>) => void;
clearQuestionnaireAnswers: () => void;
resetScanSetup: () => void;
```

---

## 4. ViewModel Specifications

### 4.1 `useScanSetup.ts`
- **Managed State:**
  - `enhancedSkinAnalysis`: boolean (defaults to `true`).
  - `shotType`: `'single' | 'triple' | null` (defaults to `null` on first entry, or persists last selection).
  - `photos`: `{ front?: string | null, left?: string | null, right?: string | null }`.
  - `questionnaireAnswers`: Record of answered questions.
- **Computed / Derived State:**
  - `isQuestionnaireCompleted`: `Object.keys(questionnaireAnswers).length === 10`.
  - `requiredPhotosCount`: `shotType === 'triple' ? 3 : shotType === 'single' ? 1 : 0`.
  - `uploadedCount`: count of non-null required photos.
  - `isPhotosComplete`: all required photos exist.
  - `canSubmit`:
    - `shotType !== null` AND
    - `isPhotosComplete === true` AND
    - (`enhancedSkinAnalysis === false` OR `isQuestionnaireCompleted === true`).
  - `footerStatus`:
    - If `canSubmit`: Header = `"Ready for analysis"`, Subtitle = `"${shotType === 'single' ? 'Single Shot • 1 of 1 uploaded' : 'Triple Shot • 3 of 3 uploaded'}${enhancedSkinAnalysis ? ' • Questionnaire Completed' : ''}"`.
    - If not `canSubmit`: Header = `"Review before submitting"`, Subtitle = `"Selected analysis • Photos • Questionnaire status"`.
- **Exposed Callbacks:**
  - `toggleEnhancedAnalysis()`
  - `selectShotType(type: ShotType)`
  - `handleUploadPhotos()`: Opens picker or populates mock images.
  - `handleTakePhotos()`: Navigates to `/scan/camera` or triggers camera.
  - `handleRetakePhoto(side: 'front' | 'left' | 'right')`
  - `handleClearAllPhotos()`
  - `handleAnswerQuestionnaire()`: Navigates to `/scan/questionnaire`.
  - `handleReviewAnswers()`: Navigates to `/scan/review-answers`.
  - `handleRetakeQuestionnaire()`: Resets answers and navigates to `/scan/questionnaire`.
  - `handleCancel()`: Dismisses setup and navigates back to previous tab.
  - `handleSubmit()`: Validates and pushes to `/scan/analyzing`.

### 4.2 `useScanQuestionnaire.ts`
- **Managed State:**
  - `currentIndex`: number (0 to 9, corresponding to Question 1 to 10).
  - `answers`: Record<number, QuestionnaireAnswer>.
- **Derived State:**
  - `currentQuestion`: `MOCK_QUESTIONNAIRE_QUESTIONS[currentIndex]`.
  - `selectedChoiceId`: currently chosen option for this question.
  - `isFirstQuestion`: `currentIndex === 0`.
  - `isLastQuestion`: `currentIndex === 9`.
  - `canGoNext`: current question has a selected answer.
- **Actions:**
  - `selectAnswer(choice: QuestionnaireChoice)`
  - `handlePrevious()`: Decrements index (hidden/disabled on Q1).
  - `handleNext()`: Increments index; if on Q10, marks completed and navigates back to `/scan/setup` or opens `/scan/review-answers`.

### 4.3 `useScanReviewAnswers.ts`
- **Managed State:**
  - `stagedAnswers`: local copy of answers to allow canceling edits.
  - `questions`: 10 questions array.
- **Actions:**
  - `handleEditQuestion(questionId: number)`: Navigates directly to that question index in questionnaire.
  - `handleDiscardChanges()`: Reverts any edits made during review and returns to `/scan/setup`.
  - `handleSave()`: Commits answers to store and returns to `/scan/setup`.

---

## 5. View & Component Specifications

### 5.1 `SetupHeader.tsx` (Fixed Top Layer)
- **Visual Design:** Fixed header docked at top of screen over olive background (`bg-primary`).
- **Layout:**
  - `pt-12 pb-3 px-6` (safe area spacing).
  - Title: `"Set Up Your Skin Analysis"` (`text-h2 font-sans-bold text-neutral-white`).
  - Subtitle: `"Choose how you'd like to analyze your skin."` (`text-body-sm font-sans text-neutral-white/80 mt-1`).

### 5.2 `AnalysisTypeCard.tsx` (Card 1)
- **Uses:** Global `Card` (`bg-card rounded-card p-5 shadow-sm border border-border`).
- **Row 1:** Label `"Analysis Type"` (`text-caption font-sans-medium text-muted mb-2`).
- **Row 2:**
  - Col 1 (`flex-1 mr-3`):
    - Title: `"Enable Enhanced Skin Analysis"` (`text-body font-sans-bold text-text`).
    - Subtext: `"Include a short skin questionnaire alongside your facial scan for a more personalized skin-type assessment."` (`text-caption font-sans text-muted mt-1`).
  - Col 2: NativeWind `Switch` or custom styled toggle switch:
    - Active track: terracotta `bg-secondary`.
    - Inactive track: neutral border/gray `bg-neutral-border`.
- **Row 3:** Dynamic Footer Note (`mt-4 flex-row items-center gap-2 pt-3 border-t border-border/40`):
  - When ON: `<CheckCircle2 size={16} color={theme.colors.accent} />` + `"Facial scan + skin type questionnaire"` (`text-caption font-sans text-muted`).
  - When OFF: `<Scan size={16} color={theme.colors.muted} />` + `"Facial scan only"` (`text-caption font-sans text-muted`).

### 5.3 `SkinTypeQuestionnaireCard.tsx` (Card 2)
- **Visibility:** Only rendered when `enhancedSkinAnalysis === true`. Smooth fade/collapse when toggled.
- **Uses:** Global `Card`.
- **Row 1:** Label `"Skin Type Questionnaire"` (`text-caption font-sans-medium text-muted mb-2`).
- **Row 2:**
  - Col 1: Dynamic icon container (`w-12 h-12 rounded-input bg-neutral-offwhite items-center justify-center mr-3.5`):
    - Incomplete: `<ClipboardList size={26} color={theme.colors.text} />`.
    - Completed: `<ClipboardCheck size={26} color={theme.colors.text} />` with check badge.
  - Col 2 (`flex-1`):
    - Title:
      - Incomplete: `"10 questions"` (`text-body font-sans-bold text-text`).
      - Completed: `"10 of 10 questions answered"` (`text-body font-sans-bold text-text`).
    - Subtext:
      - Incomplete: `"Answer a few questions about how your skin feels and behaves to complement your facial scan."` (`text-caption font-sans text-muted mt-0.5`).
      - Completed: `"Your responses will be included in your skin analysis."` (`text-caption font-sans text-muted mt-0.5`).
- **Row 3:** Hidden dynamic complete state note:
  - When Completed: `<View className="flex-row items-center gap-1.5 mt-2.5">` `<CheckCircle2 size={14} color={theme.colors.accent} />` `<Text className="text-caption font-sans-semibold text-accent">Completed</Text>`.
- **Row 4:** Dynamic Action Buttons (`mt-4`):
  - When Incomplete:
    - Single button: `ANSWER QUESTIONNAIRE` (`variant="secondary"`, `fullWidth`, `shape="rounded"`, `text-neutral-white font-sans-bold`).
  - When Completed:
    - Two buttons side by side (`flex-row gap-3`):
      - Col 1: `RETAKE` (`variant="outline"`, `className="flex-1"`, `shape="rounded"`, `text-text`).
      - Col 2: `REVIEW ANSWERS` (`variant="secondary"`, `className="flex-1"`, `shape="rounded"`, `text-neutral-white font-sans-bold`).

### 5.4 `ShotTypeCard.tsx` (Card 3)
- **Uses:** Global `Card`.
- **Row 1:** Label `"Shot Type"` (`text-caption font-sans-medium text-muted mb-2`).
- **Row 2:** Two selectable inner containers side by side (`flex-row gap-3`):
  - **Single Shot Selector:**
    - Icon: 1 circular smiley face.
    - Title: `"Single Shot"` (`text-body-sm font-sans-bold`).
    - Subtitle: `"Take 1 frontal selfie"` (`text-caption font-sans`).
    - Selected styling: `bg-secondary border-secondary text-neutral-white shadow-sm`.
    - Unselected styling: `bg-neutral-offwhite border border-border text-text`.
  - **Triple Shot Selector:**
    - Icon: 3 circular smiley faces side by side.
    - Title: `"Triple Shot"` (`text-body-sm font-sans-bold`).
    - Subtitle: `"Take 3 selfies: front, left, and right"` (`text-caption font-sans`).
    - Selected styling: `bg-secondary border-secondary text-neutral-white shadow-sm`.
    - Unselected styling: `bg-neutral-offwhite border border-border text-text`.
- **Row 3:** Dynamic Footer Note (hidden initially when `shotType === null`):
  - Single Shot: `<Scan size={16} color={theme.colors.muted} />` with title `"Quick facial scan"` (`text-caption font-sans-semibold text-muted`) and subtext `"Ideal for skin type analysis using a single frontal photo."` (`text-caption font-sans text-muted`).
  - Triple Shot: `<Scan size={16} color={theme.colors.muted} />` with title `"Broader facial coverage"` (`text-caption font-sans-semibold text-muted`) and subtext `"Captures additional facial areas for a more detailed assessment of visible skin conditions."` (`text-caption font-sans text-muted`).

### 5.5 `CapturePhotoCard.tsx` (Card 4)
- **Uses:** Global `Card`.
- **Row 1:**
  - Incomplete / default: Label `"Capture Photo • ${shotType === 'triple' ? 'Triple Shot' : 'Single Shot'}"` (`text-caption font-sans-medium text-muted mb-2`).
  - Uploaded state: `flex-row items-center justify-between mb-2`:
    - Label on left.
    - Right: `<Pressable onPress={handleClearAllPhotos} className="rounded-badge border border-status-error/40 px-3 py-0.5 bg-status-error/5">` with text `"✕ Clear all"` (`text-caption font-sans-medium text-status-error`).
- **Row 2:** Dynamic inner container:
  - **Case A: Single Shot (1 column wide):**
    - Un-uploaded: Center reticle smiley icon + `"Frontal Selfie"` (`text-caption font-sans-medium text-text mt-2`).
    - Uploaded: Photo thumbnail container (`rounded-card overflow-hidden h-48`) with bottom-right floating circular refresh button `<RotateCw size={18} color={theme.colors.card} />`.
  - **Case B: Triple Shot (3 columns side by side `flex-row gap-2.5`):**
    - 3 columns: Left, Front, Right.
    - Each column:
      - Un-uploaded: Reticle smiley icon + `"Left"`, `"Front"`, `"Right"`.
      - Uploaded: Photo thumbnail with individual circular retake badge (`w-7 h-7 rounded-full bg-black/60 items-center justify-center absolute bottom-2 right-2`).
- **Row 3:** Dynamic uploaded count indicator (e.g. `"1 of 1 uploaded"` or `"3 of 3 uploaded"`).
- **Row 4:** Action buttons:
  - If no photos uploaded: Two buttons (`flex-row gap-3 mt-3`):
    - `UPLOAD PHOTOS` (`variant="outline"`, `className="flex-1"`, `shape="rounded"`).
    - `TAKE PHOTOS` (`variant="secondary"`, `className="flex-1"`, `shape="rounded"`, `text-neutral-white font-sans-bold`).
  - If photos uploaded: Single wide button:
    - `"RETAKE ALL THREE (3) PHOTO"` (for triple shot) or `"RETAKE PHOTO"` (for single shot) (`variant="outline"`, `fullWidth`, `shape="rounded"`, `text-muted`).

### 5.6 `SetupSubmitFooter.tsx` (Fixed Bottom Layer)
- **Visual Design:** Fixed footer docked at bottom of screen with olive green background (`bg-primaryDark` / `bg-primary/95`).
- **Row 1 (Status Note):**
  - Flex row with icon + column text:
    - Incomplete: `<AlertCircle size={16} color={theme.colors.card} />` + `"Review before submitting"` (`text-body-sm font-sans-bold text-neutral-white`) + `"Selected analysis • Photos • Questionnaire status"` (`text-caption font-sans text-neutral-white/70`).
    - Ready: `<CheckCircle2 size={16} color={theme.colors.accent} />` + `"Ready for analysis"` (`text-body-sm font-sans-bold text-neutral-white`) + dynamic subtitle (e.g., `"Single Shot • 1 of 1 uploaded • Questionnaire Completed"`).
- **Row 2 (Action Bar `flex-row items-center justify-between mt-3`):**
  - Left Col: `<Button variant="ghost" leftIcon={<X size={20} color={theme.colors.card} />} title="Cancel" textClassName="text-neutral-white font-sans-bold" />`.
  - Right Col: `Submit for Analysis` button:
    - Pill button: `bg-neutral-white rounded-full py-3.5 px-6 shadow-md flex-row items-center gap-3`.
    - Text: `"Submit for Analysis"` (`text-body font-sans-bold text-text`).
    - Right graphic: Gold smiley face inside scan brackets.
    - Disabled state: When incomplete, `opacity-50` and disabled.

### 5.7 `ScanQuestionnairePage.tsx` & `QuestionnaireCard.tsx` (Image 4)
- **Background:** Olive green background (`bg-primary`).
- **Header:** Fixed top title: `"Skin Analysis Questionnaire"` (`text-h2 font-sans-bold text-neutral-white pt-12 pb-4 text-center`).
- **Card (`QuestionnaireCard.tsx`):**
  - White container: `bg-card rounded-card p-6 shadow-sm mx-5`.
  - Row 1: Label `"QUESTION ${questionNumber}"` (`text-secondary font-sans-bold text-label uppercase tracking-wide`).
  - Row 2: Question title (`text-body font-sans-semibold text-text mt-2 mb-4`).
  - Row 3: Choices container:
    - Subheading: `"Select one answer"` (`text-caption font-sans text-muted mb-3`).
    - 4 selectable radio options:
      - Radio button: Circular indicator (`w-5 h-5 rounded-full border-2 items-center justify-center mr-3`).
      - Selected: Border terracotta `border-secondary`, inner filled dot.
      - Unselected: Border muted `border-muted`.
      - Text: `text-body-sm font-sans text-text`.
  - Row 4 (Below card):
    - Subtext outside card: `"Measures: ${measures}"` (`text-caption font-sans text-neutral-white/80 px-6 mt-4`).
- **Footer (`QuestionnaireFooter.tsx`):**
  - Fixed bottom bar (`flex-row gap-3 px-6 pb-8 pt-3 bg-primary`):
    - Left: `Previous` (`variant="white"`, `className="flex-1"`, hidden on Question 1).
    - Right: `Next` (`variant="secondary"`, `className="flex-1"`, changes to `"Complete"` on Question 10).

### 5.8 `ScanReviewAnswersPage.tsx` & `ReviewQuestionCard.tsx` (Image 5)
- **Background:** Neutral off-white (`bg-background` / `bg-neutral-offwhite`).
- **Header:** `"Review Answers"` (`text-h2 font-sans-bold text-text pt-12 pb-3 px-6`).
- **Scrollable List:** 10 items rendering `ReviewQuestionCard.tsx`:
  - White container: `bg-card rounded-card p-4 border border-border mb-3 mx-6`.
  - Row 1 (`flex-row items-center justify-between`):
    - Left: `"Question ${index + 1}"` (`text-body-sm font-sans-bold text-text`).
    - Right: `<Button variant="outline" size="sm" shape="rounded" leftIcon={<Pencil size={12} />} title="Edit" />`.
  - Row 2: Question text (`text-caption font-sans text-muted mt-1`).
  - Row 3: Answer row (`flex-row items-center mt-1.5`):
    - `"Answer: "` (`text-caption font-sans-medium text-secondary`).
    - Selected answer label (`text-caption font-sans-bold text-text`).
- **Footer (`ReviewAnswersFooter.tsx`):**
  - Fixed bottom container: `bg-card border-t border-border px-6 py-4 flex-row gap-4`:
    - Left: `Discard Changes` (`variant="outline-danger"`, `className="flex-1"`).
    - Right: `Save` (`variant="primary"`, `className="flex-1"`, leftIcon `<Save size={18} />`).

---

## 6. Global Scan Navigation Redirection Plan

To fulfill the user requirement that the old `ScanOverlay` is completely replaced by `ScanSetupPage`:

| Location | Previous Behavior | New Behavior |
|---|---|---|
| **`src/app/(tabs)/_layout.tsx`** | Tapped center scan tab triggered `toggleScanOverlay()` | Navigates directly: `router.push('/scan/setup')` |
| **`src/app/(tabs)/scan.tsx`** | Opened `openScanOverlay()` and redirected to `/(tabs)` | Direct redirect: `<Redirect href="/scan/setup" />` |
| **`src/shared/components/BottomNavBar.tsx`** | Center button called `toggleScanOverlay()` | Calls `router.push('/scan/setup')` |
| **`src/features/home/view/containers/s1_LatestAnalysis.tsx`** | "SCAN SKIN NOW!" opened scan overlay | Calls `router.push('/scan/setup')` |
| **`src/features/routine/view/RoutinePage.tsx`** | Empty routine scan CTA opened camera/overlay | Calls `router.push('/scan/setup')` |
| **`src/features/history/view/HistoryPage.tsx`** | Empty history scan CTA opened camera/overlay | Calls `router.push('/scan/setup')` |
| **`src/features/scan/view/ScanPage.tsx`** | Rendered `<ScanOverlay />` | Renders `<ScanSetupPage />` |

---

## 7. State Handling & Validation Matrix

| Required Condition | Enhanced Skin Analysis ON | Enhanced Skin Analysis OFF | UI State | Submit Button |
|---|---|---|---|---|
| **No Shot Type Selected** | Incomplete | Incomplete | Subtitle: "Selected analysis • Photos • Questionnaire status" | Disabled (`opacity-50`) |
| **Shot Selected, No Photos** | Incomplete | Incomplete | Subtitle: "Selected analysis • Photos • Questionnaire status" | Disabled (`opacity-50`) |
| **Photos Complete, Questionnaire Incomplete** | Incomplete | **READY** | ON: Incomplete<br>OFF: "Triple Shot • 3 of 3 uploaded" | ON: Disabled<br>OFF: **Active** |
| **Photos Complete, Questionnaire Complete** | **READY** | **READY** | "Single/Triple Shot • X of X uploaded • Questionnaire Completed" | **Active** |

---

## 8. Strict Design Token Audit

All styling adheres to `frontend/tailwind.config.js` and `frontend/src/shared/theme/index.ts`:

| UI Element | Class Name(s) | Theme Color (JS Props) | Rules Check |
|---|---|---|---|
| Setup Page Background | `bg-primary` | `theme.colors.primary` | Standard olive green |
| Setup Header Title | `text-h2 font-sans-bold text-neutral-white` | — | Preset h2, Inter 700 |
| Card Containers | `bg-card rounded-card border border-border` | — | Preset card radius (16px) |
| Active Shot Selector | `bg-secondary text-neutral-white` | `theme.colors.secondary` | Preset secondary token |
| Inactive Shot Selector | `bg-neutral-offwhite border border-border` | `theme.colors.border` | Preset neutral offwhite |
| Radio Selector Active | `border-secondary text-secondary` | `theme.colors.secondary` | Preset secondary token |
| Checkmark Icons | — | `theme.colors.accent` / `theme.colors.status.success` | Runtime green accent |
| Clear All Pill | `rounded-badge border border-status-error/40 bg-status-error/5 text-status-error` | `theme.colors.status.error` | Preset badge radius (20px) |
| Primary CTA Buttons | `Button variant="secondary" shape="rounded"` | — | Shared global Button |
| Submit Button Pill | `bg-neutral-white rounded-full` | `theme.colors.white` | Preset full radius |
| Review Discard Button | `Button variant="outline-danger"` | `theme.colors.error` | Shared global Button |
| Review Save Button | `Button variant="primary"` | `theme.colors.primary` | Shared global Button |

---

## 9. Verification & Testing Checklist

- [ ] **Initial State:** On entry, Enhanced Skin Analysis is ON, Shot Type is unselected, Capture Photo has no photos, Questionnaire is unanswered, and Submit for Analysis is disabled.
- [ ] **Shot Type Selection:** Tapping Single Shot highlights Single Shot in terracotta (`bg-secondary`), displays Single Shot reticle placeholder, and updates Capture Photo label to `Capture Photo • Single Shot`. Tapping Triple Shot updates to 3 columns.
- [ ] **Enhanced Analysis Toggle:** Toggling OFF hides Card 2 (`SkinTypeQuestionnaireCard`), updates Card 1 note to `"Facial scan only"`. Toggling ON reveals Card 2 and requires questionnaire.
- [ ] **Photo Uploads:** Tapping UPLOAD PHOTOS or TAKE PHOTOS fills required photo slots with mock/real photos. Thumbnails render with circular retake badges. Header shows `"✕ Clear all"` button. Retake button displays `"RETAKE ALL THREE (3) PHOTO"`.
- [ ] **Questionnaire Flow:** Tapping `"ANSWER QUESTIONNAIRE"` navigates to `ScanQuestionnairePage`. Question 1 hides Previous button. Answering questions advances index. Question 10 shows `"Complete"`.
- [ ] **Completed Questionnaire:** Returning to setup shows Card 2 with `"10 of 10 questions answered"`, green `"Completed"` badge, and two buttons: `"RETAKE"` and `"REVIEW ANSWERS"`.
- [ ] **Review Answers:** Tapping `"REVIEW ANSWERS"` displays 10 questions with selected answers. Tapping `"Edit"` returns to that question. `"Save"` commits answers.
- [ ] **Submit Validation:** When all conditions are satisfied, footer switches to green checkmark `"Ready for analysis"`, subtitle updates, and `"Submit for Analysis"` becomes active. Tapping submit navigates to `/scan/analyzing`.
- [ ] **Scan Overlay Retirement:** Verifying that tapping the bottom nav bar scan icon, home CTA, and routine CTA navigates directly to `ScanSetupPage`. No overlay errors.

---

> 🛑 **MANDATORY CHECKPOINT — STOPPING FOR USER REVIEW**  
> Please review this implementation plan. Once you provide feedback or confirmation to proceed, implementation will begin in exact dependency order: types $\rightarrow$ mock $\rightarrow$ store $\rightarrow$ viewmodel $\rightarrow$ components $\rightarrow$ containers $\rightarrow$ page routes.

