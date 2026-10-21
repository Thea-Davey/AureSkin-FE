# AureSkin — UI Design Reference Guide

> This document is the single source of truth for the AureSkin mobile app's user interface design.
> It pairs with the exported Figma images in the `design_references/` folder and provides detailed
> descriptions of every screen: its purpose, elements, behaviors, animations, and navigation.
>
> **How to use:** For each screen, refer to the linked image for visual layout and this document
> for behavioral context, interaction details, and edge case handling.

---

## 📋 Table of Contents

- [1. Auth Screens](#1-auth-screens)
  - [1.1 Login Screen](#11-login-screen)
  - [1.2 Register Screen](#12-register-screen)
  - [1.3 Terms and Conditions Screen](#13-terms-and-conditions-screen)
- [2. Home Screen](#2-home-screen)
  - [2.1 Home Page](#21-home-page)
- [3. Library Screens](#3-library-screens)
  - [3.1 Library Page (Ingredients Tab)](#31-library-page-ingredients-tab)
  - [3.2 Library Page (Products Tab)](#32-library-page-products-tab)
  - [3.3 Ingredient Detail Page](#33-ingredient-detail-page)
  - [3.4 Product Detail Page](#34-product-detail-page)
  - [3.5 Add Product Camera Overlay](#35-add-product-camera-overlay)
  - [3.6 Add Product Upload](#36-add-product-upload)
  - [3.7 Add Product Form](#37-add-product-form)
  - [3.8 Add Product Success Overlay](#38-add-product-success-overlay)
- [4. Scan Screens](#4-scan-screens)
  - [4.1 Scan Overlay (Take a Photo / Upload a Photo)](#41-scan-overlay-take-a-photo--upload-a-photo)
  - [4.2 Scan Camera (Take a Photo)](#42-scan-camera-take-a-photo)
  - [4.3 Scan Upload (Upload a Photo)](#43-scan-upload-upload-a-photo)
  - [4.4 Scan Submit (Submit Photo)](#44-scan-submit-submit-photo)
  - [4.5 Scan Analyzing (Loading Screen)](#45-scan-analyzing-loading-screen)
  - [4.6 Scan Results — Results Tab](#46-scan-results--results-tab)
  - [4.7 Scan Results — Compatibility Tab](#47-scan-results--compatibility-tab)
- [5. History Screens](#5-history-screens)
  - [5.1 History Page](#51-history-page)
  - [5.2 History Detail Results Page](#52-history-detail-results-page)
  - [5.3 History Detail Compatibility Page](#53-history-detail-compatibility-page)
- [6. Routine Screens](#6-routine-screens)
  - [6.1 Routine Page (No Routine Yet)](#61-routine-page-no-routine-yet)
  - [6.2 Routine Page (Active Routine)](#62-routine-page-active-routine)
- [7. Menu Overlay](#7-menu-overlay)
  - [7.1 Menu Overlay](#71-menu-overlay)
- [8. Profile Screen](#8-profile-screen)
  - [8.1 Profile Page](#81-profile-page)
  - [8.2 Edit Profile Page](#82-edit-profile-page)

---

<!--
  ============================================================
  HOW TO FILL IN EACH SCREEN ENTRY
  ============================================================
  Copy the template block below for each new screen you add.
  Fill in all sections. Use "N/A" for sections that don't apply.

  TEMPLATE:
  ---

  ### [Screen Name]

  **Reference Image:** `design_references/[filename].png`

  #### 🎯 Purpose
  > [1–2 sentences describing what this screen does and when the user sees it.]

  #### 🧩 Elements & Functions
  | Element | Type | Function / Behavior |
  |---|---|---|
  | [Element name] | [Button / Card / Input / etc.] | [What it does when tapped/used] |

  #### 📊 Data Displayed
  | Field | Source |
  |---|---|
  | [Field name] | [API endpoint / Zustand store / local] |

  #### ✨ Animations & Transitions
  - **Entry:** [How the screen/elements animate in]
  - **Interactions:** [Tap feedback, scroll effects, etc.]
  - **Exit:** [How the screen transitions out]

  #### 🔄 Screen States
  - **Loading:** [What appears while data is being fetched]
  - **Empty:** [What appears when there is no data]
  - **Error:** [What appears when something goes wrong]
  - **Success:** [What a completed/successful state looks like]

  #### 🗺️ Navigation
  | Action | Destination |
  |---|---|
  | [User action] | [Screen it navigates to] |
  ============================================================
-->

---

## 1. Auth Screens

---

### 1.1 Login Screen

**Reference Image:** `design_references/auth_login.png`

#### 🎯 Purpose
> The Login Screen is the entry point of the app for returning users. It allows users to authenticate using their email and password, or via a third-party provider (Google or Facebook). The screen is displayed whenever the user is not authenticated or has been logged out.

#### 🧩 Elements & Functions
| Element | Type | Function / Behavior |
|---|---|---|
| "AureSkin" App Title | Static Text (Logo/Branding) | Displayed at the top of the screen above the login card. Non-interactive. |
| Login Card | Container (Layer 1 — Centered) | A white rounded card that holds the entire login form. Non-scrollable; all content fits within the screen. |
| "Log in to your Account" | Static Text (Heading) | Title text inside the card. Non-interactive. |
| Email | Text Input Field | Accepts the user's email address. Triggers the keyboard on tap. Validates for email format. |
| Password | Text Input Field (Secure) | Accepts the user's password. Input is hidden by default (masked). Triggers the keyboard on tap. |
| Sign in | Button (Primary CTA) | Submits the email and password to the backend `/auth/login` endpoint. Shows a loading state while the request is in progress. |
| "– Or sign in with –" | Static Text (Divider Label) | Visual separator between the email/password form and the OAuth options. Non-interactive. |
| Google Sign-In | Button (OAuth) | Triggers Google OAuth flow. Authenticates the user via Supabase Auth + Google provider. |
| Facebook Sign-In | Button (OAuth) | Triggers Facebook OAuth flow. Authenticates the user via Supabase Auth + Facebook provider. |
| "Don't have an account? Sign up" | Text with Inline Link | The "Sign up" portion is a tappable link that navigates to the Register Screen. |

#### 📊 Data Displayed
| Field | Source |
|---|---|
| None | N/A — This screen only accepts user input; no dynamic data is fetched or displayed. |

#### ✨ Animations & Transitions
- **Entry:** Screen fades in on mount. The login card may slide up slightly from below for a smooth entrance feel.
- **Interactions:** The "Sign in" button has a pressed/opacity feedback on tap. Input fields highlight their border on focus. OAuth buttons have a subtle scale-down press effect.
- **Exit:** On successful login, the screen transitions via a fade to the Home Screen (inside the `(tabs)` group). On navigating to Register, a horizontal slide transition is used.

#### 🔄 Screen States
- **Loading:** The "Sign in" button shows a loading spinner and is disabled while the authentication request is in progress. Input fields are also disabled to prevent changes.
- **Empty:** N/A
- **Error:** A toast notification (via react-native-toast-message) appears at the top of the screen with the error message (e.g., "Invalid email or password"). Input fields may highlight in red to indicate the failure.
- **Success:** User is authenticated. Navigates immediately to the Home Screen. Auth token is stored in Zustand `authStore`.

#### 🗺️ Navigation
| Action | Destination |
|---|---|
| Tap "Sign in" (success) | Home Screen `(tabs)/index` |
| Tap "Sign up" link | Register Screen `(auth)/register` |
| Tap Google button (success) | Home Screen `(tabs)/index` |
| Tap Facebook button (success) | Home Screen `(tabs)/index` |

---

### 1.2 Register Screen

**Reference Image:** `design_references/auth_register.png`

#### 🎯 Purpose
> The Register Screen allows new users to create an AureSkin account. It is the onboarding entry point for first-time users. After a successful sign-up, the user is directed to the Terms and Conditions screen before accessing the main app.

#### 🧩 Elements & Functions
| Element | Type | Function / Behavior |
|---|---|---|
| "AureSkin" App Title | Static Text (Logo/Branding) | Displayed at the top above the card. Non-interactive. |
| Register Card | Container (Layer 1 — Centered) | A white rounded card holding the entire registration form. Non-scrollable; all content fits within the screen. |
| "Create your Account" | Static Text (Heading) | Title text inside the card. Non-interactive. |
| Email | Text Input Field | Accepts the user's email address. Triggers keyboard on tap. Validates for proper email format. |
| Password | Text Input Field (Secure) | Accepts the user's chosen password. Input is masked by default. Triggers keyboard on tap. |
| Confirm Password | Text Input Field (Secure) | Re-entry of the password for validation. Must match the Password field. Shows an error if passwords do not match. |
| Sign up | Button (Primary CTA) | Submits registration data to the backend `/auth/register` endpoint. Disabled and shows a loading spinner while the request is in progress. |
| "– Or sign up with –" | Static Text (Divider Label) | Visual separator between the form and the OAuth options. Non-interactive. |
| Google Sign-Up | Button (OAuth) | Triggers Google OAuth flow via Supabase Auth. Creates a new account if one does not exist. |
| Facebook Sign-Up | Button (OAuth) | Triggers Facebook OAuth flow via Supabase Auth. Creates a new account if one does not exist. |
| "Already have an account? Sign in" | Text with Inline Link | The "Sign in" portion is a tappable link that navigates back to the Login Screen. |

#### 📊 Data Displayed
| Field | Source |
|---|---|
| None | N/A — This screen only accepts user input; no dynamic data is fetched or displayed. |

#### ✨ Animations & Transitions
- **Entry:** Screen fades in on mount. The register card may slide up slightly from below, mirroring the Login Screen entrance.
- **Interactions:** "Sign up" button has pressed/opacity feedback on tap. Input fields highlight their border on focus. Confirm Password field shows an inline error indicator if passwords do not match. OAuth buttons have a subtle scale-down press effect.
- **Exit:** On successful registration, transitions to the Terms and Conditions Screen via a forward slide (horizontal push). On tapping "Sign in", slides back horizontally to the Login Screen.

#### 🔄 Screen States
- **Loading:** The "Sign up" button shows a loading spinner and is disabled while the registration request is in progress. All input fields are also disabled.
- **Empty:** N/A
- **Error:** A toast notification (via react-native-toast-message) displays the error (e.g., "Email already in use", "Passwords do not match"). The relevant input field border highlights in red.
- **Success:** Account is created. Navigates to the Terms and Conditions Screen.

#### 🗺️ Navigation
| Action | Destination |
|---|---|
| Tap "Sign up" (success) | Terms and Conditions Screen `(auth)/terms` |
| Tap "Sign in" link | Login Screen `(auth)/login` |
| Tap Google button (success) | Terms and Conditions Screen `(auth)/terms` |
| Tap Facebook button (success) | Terms and Conditions Screen `(auth)/terms` |

---

### 1.3 Terms and Conditions Screen

**Reference Image:** `design_references/auth_terms_and_conditions.png`

#### 🎯 Purpose
> The Terms and Conditions Screen is shown immediately after a new user successfully registers an account. It presents the app's legal terms that the user must agree to before accessing the main app. The user cannot proceed without tapping "I agree". This screen is only shown once during onboarding.

#### 🧩 Elements & Functions
| Element | Type | Function / Behavior |
|---|---|---|
| "AureSkin" App Title | Static Text (Logo/Branding) | Displayed at the top above the card. Non-interactive. |
| Terms Card | Container (Layer 1 — Scrollable) | A white rounded card containing the full Terms and Conditions text. The content is long enough to require vertical scrolling. The card scrolls behind the fixed "I agree" button. |
| "Terms and Conditions" | Static Text (Heading) | Title at the top of the card. Non-interactive. |
| Terms Body Text | Static Text (Scrollable) | The full legal text organized into numbered sections (e.g., 1. Nature of the Service, 2. Medical Disclaimer, 3. Data Privacy, 4. Accuracy of AI Results, etc.). Non-interactive. Scrollable within the card. |
| "I agree" | Button (Primary CTA, Fixed — Layer 2) | Fixed at the bottom of the screen, always visible above the scrolling card content. Tapping it records the user's agreement and navigates them to the Home Screen. |

#### 📊 Data Displayed
| Field | Source |
|---|---|
| Terms and Conditions Text | Static / locally defined content (not fetched from API) |

#### ✨ Animations & Transitions
- **Entry:** Screen slides in horizontally from the right (forward navigation from the Register Screen).
- **Interactions:** The card content scrolls vertically when swiped. The "I agree" button remains fixed and does not move during scroll. Button has a pressed/opacity feedback on tap.
- **Exit:** On tapping "I agree", transitions forward into the Home Screen via a fade, completing the onboarding flow.

#### 🔄 Screen States
- **Loading:** N/A — content is static and local, no network request needed.
- **Empty:** N/A
- **Error:** N/A
- **Success:** User's agreement is recorded (stored in Supabase `users` table as a flag, in the column terms_accepted_at - timestamptz). Navigates to the Home Screen.

#### 🗺️ Navigation
| Action | Destination |
|---|---|
| Tap "I agree" | Home Screen `(tabs)/index` |

---

## 2. Home Screen

---

### 2.1 Home Page

**Reference Image:** `design_references/home.png`

#### 🎯 Purpose
> The Home Page is the user's daily skincare dashboard — the first thing they see after logging in. It provides a full snapshot of their skin status, today's skincare routine, educational content, and quick-access shortcuts, all in a single scrollable view.

#### 🧩 Elements & Functions
| Element | Type | Function / Behavior |
|---|---|---|
| Hamburger Menu Icon (☰) | Icon Button (Top-Left) | Opens the Menu Overlay (side drawer) from the left edge of the screen. |
| "Welcome Back!" | Static Text (Page Header) | Greeting displayed at the top of the screen. Non-interactive. |
| "How is your skin today?" Hero Card | Tappable Card (CTA Banner) | A promotional banner at the top with an illustration and "SCAN SKIN NOW!" button. Tapping the card or button navigates to the Scan Overlay. |
| "SCAN SKIN NOW!" | Button (Primary CTA inside card) | Navigates to the Scan Overlay. |
| "Latest Result" section header | Static Text + "See Results →" Link | "See Results →" navigates to the full Scan Results screen for the latest analysis. |
| Latest Result Card | Informational Card | Displays: skin type label, detected condition badge(s), a circular Skin Health percentage gauge, and the scan date. |
| Skin Type Label | Static Text (inside Latest Result Card) | Displays the detected skin type (e.g., "Oily"). |
| Skin Condition Badge(s) | Tag/Badge (inside Latest Result Card) | Displays each detected skin condition (e.g., "Skin Redness") as a colored pill badge. |
| Skin Health Percentage Gauge | Circular Progress Indicator | Displays a percentage (e.g., "89% HEALTHY") with a green circular ring. Non-interactive. |
| Date Scanned | Static Text (inside Latest Result Card) | Displays the date of the scan (e.g., "May 1, 2026"). |
| "Today's Skincare Routine" section header | Static Text + "See Routine →" Link | "See Routine →" navigates to the Routine Page. |
| Today's Routine Card | Informational Card | Displays the routine time label (e.g., "Morning Routine"), a sub-label, and the first 3 ordered steps with step number, name, and description. |
| Routine Step Items | Numbered List Items (inside Routine Card) | Step number, step name, and a brief description (e.g., "1. Cleanser — Remove excess oil and impurities gently."). Non-interactive. |
| "Learn more about Skincare!" section header | Static Text | Section label for educational content below. Non-interactive. |
| Skin Test Guide Tip Card | Informational Card | A tip card providing guidance on how to get accurate scan results. Non-interactive. |
| Skincare Articles | Horizontal or Vertical List of Cards | Fetched skincare article cards. Each card is tappable and may open the article in a browser or in-app web view. |
| FAQs | Expandable Accordion List | Tapping a question expands it to reveal the answer. |
| Bottom Tab Bar | Tab Navigator (Persistent) | Home, Library, Scan (center, elevated), History, Routine. Always visible at the bottom. |

#### 📊 Data Displayed
| Field | Source |
|---|---|
| Latest skin type | `GET /history` (most recent entry) → `skin_type` |
| Latest skin condition(s) | `GET /history` (most recent entry) → joined `analysis_conditions[]` |
| Skin health percentage | `GET /history` (most recent entry) → `health_score` |
| Date scanned | `GET /history` (most recent entry) → `created_at` |
| Today's routine steps | `GET /routine` → `routine_steps[]` filtered to current time-of-day |
| Skincare articles | Supabase `articles` table (fetched dynamically via `@supabase/supabase-js`) |
| FAQs | Static / locally defined content (study-tailored FAQs) |

#### ✨ Animations & Transitions
- **Entry:** Screen fades in when navigating to the Home tab. Content sections stagger-fade in from top to bottom.
- **Interactions:** All tappable cards and links have opacity/scale press feedback. FAQ accordion items expand/collapse with a smooth height animation. Page scrolls with standard momentum.
- **Exit:** Tapping "SCAN SKIN NOW!" opens the Scan Overlay via a bottom-sheet slide-up. Tapping "See Results →" pushes to the Scan Results screen. Tapping "See Routine →" switches the active tab to Routine.

#### 🔄 Screen States
- **Loading:** Each section independently shows skeleton shimmer loaders while data is being fetched.
- **Empty:** If no scans exist, the Latest Result card shows a prompt to scan. If no routine exists, the routine card shows a prompt to generate one.
- **Error:** If a fetch fails, the affected section shows an inline error with a retry button.
- **Success:** All sections populated with live data.

#### 🗺️ Navigation
| Action | Destination |
|---|---|
| Tap Hamburger Menu (☰) | Menu Overlay (7.1) |
| Tap "SCAN SKIN NOW!" | Scan Overlay (4.1) |
| Tap "See Results →" | Scan Results — Results Tab (4.6) for the latest scan |
| Tap "See Routine →" | Routine Page `(tabs)/routine` |
| Tap an Article card | In-app browser / Article detail view |


---

## 3. Library Screens

---

### 3.1 Library Page (Ingredients Tab)

**Reference Image:** `design_references/library_ingredients.png`

#### 🎯 Purpose
> The Ingredients Tab is the first tab of the Library page. It presents a searchable, scrollable list of all skincare ingredients in the database. Users can browse and tap any ingredient to learn more about it.

#### 🧩 Elements & Functions
| Element | Type | Function / Behavior |
|---|---|---|
| Hamburger Menu Icon (☰) | Icon Button (Top-Left) | Opens the Menu Overlay side drawer. |
| "Library" | Static Text (Page Header) | Page title. Non-interactive. |
| "Ingredients" Tab | Tab Switcher Button (Active) | Currently active tab. Stays on the Ingredients tab when tapped. |
| "Products" Tab | Tab Switcher Button (Inactive) | Tapping it switches the view to the Products Tab. |
| Search Bar ("search ingredient") | Text Input Field | Filters the ingredient list in real-time as the user types. |
| Ingredient List Item | Tappable List Row | Each row displays the ingredient name (e.g., "Aloe Vera"). Tapping it navigates to the Ingredient Detail Page. |
| Bottom Tab Bar | Tab Navigator (Persistent) | Home, Library (active), Scan, History, Routine. |

#### 📊 Data Displayed
| Field | Source |
|---|---|
| Ingredient name list | `GET /ingredients?q=&limit=20&offset=0` → paginated ingredient names |

#### ✨ Animations & Transitions
- **Entry:** Screen slides in from the right when the Library tab is tapped. List items fade in as they load.
- **Interactions:** Tapping an ingredient row shows a brief opacity press effect. The search bar highlights on focus. List scrolls with standard momentum.
- **Exit:** Tapping an ingredient row pushes to the Ingredient Detail Page via a forward horizontal slide.

#### 🔄 Screen States
- **Loading:** Shows skeleton shimmer rows while the ingredient list is being fetched.
- **Empty:** Displays "No ingredients found." with a search icon if the query returns no results.
- **Error:** Displays an inline error card with a "Try again" button.
- **Success:** N/A (success is the default populated state)

#### 🗺️ Navigation
| Action | Destination |
|---|---|
| Tap "Products" tab | Library Page — Products Tab (3.2) |
| Tap an ingredient row | Ingredient Detail Page (3.3) |

---

### 3.2 Library Page (Products Tab)

**Reference Image:** `design_references/library_products.png`

#### 🎯 Purpose
> [Describe the purpose here.]

#### 🧩 Elements & Functions
| Element | Type | Function / Behavior |
|---|---|---|
| | | |

#### 📊 Data Displayed
| Field | Source |
|---|---|
| | |

#### ✨ Animations & Transitions
- **Entry:** 
- **Interactions:** 
- **Exit:** 

#### 🔄 Screen States
- **Loading:** 
- **Empty:** 
- **Error:** 
- **Success:** N/A

#### 🗺️ Navigation
| Action | Destination |
|---|---|
| | |

---

### 3.3 Ingredient Detail Page

**Reference Image:** `design_references/library_ingredient_detail.png`

#### 🎯 Purpose
> [Describe the purpose here.]

#### 🧩 Elements & Functions
| Element | Type | Function / Behavior |
|---|---|---|
| | | |

#### 📊 Data Displayed
| Field | Source |
|---|---|
| | |

#### ✨ Animations & Transitions
- **Entry:** 
- **Interactions:** 
- **Exit:** 

#### 🔄 Screen States
- **Loading:** 
- **Empty:** N/A
- **Error:** 
- **Success:** N/A

#### 🗺️ Navigation
| Action | Destination |
|---|---|
| | |

---

### 3.4 Product Detail Page

**Reference Image:** `design_references/library_product_detail.png`

#### 🎯 Purpose
> [Describe the purpose here.]

#### 🧩 Elements & Functions
| Element | Type | Function / Behavior |
|---|---|---|
| | | |

#### 📊 Data Displayed
| Field | Source |
|---|---|
| | |

#### ✨ Animations & Transitions
- **Entry:** 
- **Interactions:** 
- **Exit:** 

#### 🔄 Screen States
- **Loading:** 
- **Empty:** N/A
- **Error:** 
- **Success:** N/A

#### 🗺️ Navigation
| Action | Destination |
|---|---|
| | |

---

### 3.5 Add Product Camera Overlay

**Reference Image:** `design_references/library_add_product_camera.png`

#### 🎯 Purpose
> [Describe the purpose here.]

#### 🧩 Elements & Functions
| Element | Type | Function / Behavior |
|---|---|---|
| | | |

#### 📊 Data Displayed
| Field | Source |
|---|---|
| | |

#### ✨ Animations & Transitions
- **Entry:** 
- **Interactions:** 
- **Exit:** 

#### 🔄 Screen States
- **Loading:** 
- **Empty:** N/A
- **Error:** 
- **Success:** 

#### 🗺️ Navigation
| Action | Destination |
|---|---|
| | |

---

### 3.6 Add Product Upload

**Reference Image:** `design_references/library_add_product_upload.png`

#### 🎯 Purpose
> [Describe the purpose here.]

#### 🧩 Elements & Functions
| Element | Type | Function / Behavior |
|---|---|---|
| | | |

#### 📊 Data Displayed
| Field | Source |
|---|---|
| | |

#### ✨ Animations & Transitions
- **Entry:** 
- **Interactions:** 
- **Exit:** 

#### 🔄 Screen States
- **Loading:** 
- **Empty:** N/A
- **Error:** 
- **Success:** 

#### 🗺️ Navigation
| Action | Destination |
|---|---|
| | |

---

### 3.7 Add Product Form

**Reference Image:** `design_references/library_add_product_form.png`

#### 🎯 Purpose
> [Describe the purpose here.]

#### 🧩 Elements & Functions
| Element | Type | Function / Behavior |
|---|---|---|
| | | |

#### 📊 Data Displayed
| Field | Source |
|---|---|
| | |

#### ✨ Animations & Transitions
- **Entry:** 
- **Interactions:** 
- **Exit:** 

#### 🔄 Screen States
- **Loading:** 
- **Empty:** N/A
- **Error:** 
- **Success:** 

#### 🗺️ Navigation
| Action | Destination |
|---|---|
| | |

---

### 3.8 Add Product Success Overlay

**Reference Image:** `design_references/library_add_product_success.png`

#### 🎯 Purpose
> [Describe the purpose here.]

#### 🧩 Elements & Functions
| Element | Type | Function / Behavior |
|---|---|---|
| | | |

#### 📊 Data Displayed
| Field | Source |
|---|---|
| | |

#### ✨ Animations & Transitions
- **Entry:** 
- **Interactions:** 
- **Exit:** 

#### 🔄 Screen States
- **Loading:** 
- **Empty:** N/A
- **Error:** 
- **Success:** 

#### 🗺️ Navigation
| Action | Destination |
|---|---|
| | |

---

## 4. Scan Screens

---

### 4.1 Scan Overlay (Take a Photo / Upload a Photo)

**Reference Image:** `design_references/scan_overlay.png`

#### 🎯 Purpose
> [Describe the purpose here.]

#### 🧩 Elements & Functions
| Element | Type | Function / Behavior |
|---|---|---|
| | | |

#### 📊 Data Displayed
| Field | Source |
|---|---|
| | |

#### ✨ Animations & Transitions
- **Entry:** 
- **Interactions:** 
- **Exit:** 

#### 🔄 Screen States
- **Loading:** 
- **Empty:** N/A
- **Error:** 
- **Success:** 

#### 🗺️ Navigation
| Action | Destination |
|---|---|
| | |

---

### 4.2 Scan Camera (Take a Photo)

**Reference Image:** `design_references/scan_camera.png`

#### 🎯 Purpose
> The Scan Overlay is the entry point of the skin analysis feature. It appears when the user taps the center Scan button in the tab bar, presenting two choices: take a live photo or upload a photo from the gallery. A dark overlay covers the previous screen behind it.

#### 🧩 Elements & Functions
| Element | Type | Function / Behavior |
|---|---|---|
| Dark Background Overlay | Non-interactive Background | Darkened overlay over the previous screen. Tapping it may dismiss the overlay. |
| "Take a Photo" | Button (Full-Width) | Opens the Scan Camera screen with the live camera viewfinder. |
| "Upload a Photo" | Button (Full-Width) | Opens the device photo gallery (Scan Upload screen). |
| Exit Button ("Exit" / ×, Red Circular) | Icon Button (Bottom-Center) | Dismisses the overlay and returns to the previous screen without starting a scan. |

#### 📊 Data Displayed
| Field | Source |
|---|---|
| None | N/A — this screen only presents navigation choices. |

#### ✨ Animations & Transitions
- **Entry:** Slides up from the bottom as a modal sheet when the Scan tab button is tapped.
- **Interactions:** All buttons have opacity press feedback. The Exit button has a scale-down press animation.
- **Exit:** Tapping "Take a Photo" pushes to Scan Camera. Tapping "Upload a Photo" pushes to Scan Upload. Tapping Exit slides the overlay back down.

#### 🔄 Screen States
- **Loading:** N/A
- **Empty:** N/A
- **Error:** N/A
- **Success:** N/A — transitions occur immediately on button press.

#### 🗺️ Navigation
| Action | Destination |
|---|---|
| Tap "Take a Photo" | Scan Camera (4.2) |
| Tap "Upload a Photo" | Scan Upload (4.3) |
| Tap Exit (×) | Previous screen (Home or active tab) |

---

### 4.3 Scan Upload (Upload a Photo)

**Reference Image:** `design_references/scan_upload.png`

#### 🎯 Purpose
> [Describe the purpose here.]

#### 🧩 Elements & Functions
| Element | Type | Function / Behavior |
|---|---|---|
| | | |

#### 📊 Data Displayed
| Field | Source |
|---|---|
| | |

#### ✨ Animations & Transitions
- **Entry:** 
- **Interactions:** 
- **Exit:** 

#### 🔄 Screen States
- **Loading:** 
- **Empty:** N/A
- **Error:** 
- **Success:** 

#### 🗺️ Navigation
| Action | Destination |
|---|---|
| | |

---

### 4.4 Scan Submit (Submit Photo)

**Reference Image:** `design_references/scan_submit.png`

#### 🎯 Purpose
> [Describe the purpose here.]

#### 🧩 Elements & Functions
| Element | Type | Function / Behavior |
|---|---|---|
| | | |

#### 📊 Data Displayed
| Field | Source |
|---|---|
| | |

#### ✨ Animations & Transitions
- **Entry:** 
- **Interactions:** 
- **Exit:** 

#### 🔄 Screen States
- **Loading:** 
- **Empty:** N/A
- **Error:** 
- **Success:** 

#### 🗺️ Navigation
| Action | Destination |
|---|---|
| | |

---

### 4.5 Scan Analyzing (Loading Screen)

**Reference Image:** `design_references/scan_analyzing.png`

#### 🎯 Purpose
> [Describe the purpose here.]

#### 🧩 Elements & Functions
| Element | Type | Function / Behavior |
|---|---|---|
| | | |

#### 📊 Data Displayed
| Field | Source |
|---|---|
| | |

#### ✨ Animations & Transitions
- **Entry:** 
- **Interactions:** 
- **Exit:** 

#### 🔄 Screen States
- **Loading:** 
- **Empty:** N/A
- **Error:** 
- **Success:** 

#### 🗺️ Navigation
| Action | Destination |
|---|---|
| | |

---

### 4.6 Scan Results — Results Tab

**Reference Image:** `design_references/scan_results_results_tab.png`

#### 🎯 Purpose
> [Describe the purpose here.]

#### 🧩 Elements & Functions
| Element | Type | Function / Behavior |
|---|---|---|
| | | |

#### 📊 Data Displayed
| Field | Source |
|---|---|
| | |

#### ✨ Animations & Transitions
- **Entry:** 
- **Interactions:** 
- **Exit:** 

#### 🔄 Screen States
- **Loading:** 
- **Empty:** N/A
- **Error:** 
- **Success:** N/A

#### 🗺️ Navigation
| Action | Destination |
|---|---|
| | |

---

### 4.7 Scan Results — Compatibility Tab

**Reference Image:** `design_references/scan_results_compatibility_tab.png`

#### 🎯 Purpose
> The Ingredient Compatibility Tab is the second tab of the Scan Results page. It presents two lists: skincare ingredients that are compatible with the user's skin type, and pairs of ingredients they should not mix — with reasons and usage guidance.

#### 🧩 Elements & Functions
| Element | Type | Function / Behavior |
|---|---|---|
| "Skin Analysis" | Static Text (Title, Top-Center) | Screen title. Non-interactive. |
| Close (×) Button | Icon Button (Top-Right) | Closes the results screen and returns to the Home screen. |
| "Results" Tab | Tab Switcher Button (Inactive) | Tapping switches back to the Results Tab. |
| "Ingredient Compatibility" Tab | Tab Switcher Button (Active) | Currently selected. |
| "Compatible Ingredients to Skin Type" Card | Informational Card | Lists all ingredients compatible with the user's detected skin type (e.g., "Salicylic acid", "Niacinamide", "Clay"). |
| Compatible Ingredient Items | List Row Items (inside card) | Each compatible ingredient name as a row. Tapping may navigate to its Ingredient Detail Page. |
| "Incompatible Ingredients to mix" Section | Section Header | Label for the incompatible ingredient pairs list. |
| Incompatible Pair Cards | Informational Cards (stacked) | Each card shows an ingredient pair that should not be mixed (e.g., "Retinoids / Retinol (Vitamin A) — Do not use on the same day as: AHAs, BHAs, PHAs") with a usage guidance note. |

#### 📊 Data Displayed
| Field | Source |
|---|---|
| Compatible ingredients | `POST /scan` or `GET /scan/{id}/compatibility` → `analysis_compatible_ingredients[]` |
| Incompatible ingredient pairs | `POST /scan` or `GET /scan/{id}/compatibility` → `analysis_incompatible_pairs[]` (ingredient_a, ingredient_b, reason) |

#### ✨ Animations & Transitions
- **Entry:** Appears when the "Ingredient Compatibility" tab is tapped from the Results Tab, with a horizontal slide.
- **Interactions:** Page scrolls vertically. Compatible ingredient rows and incompatible pair cards have subtle press feedback. Tab switcher has press animation.
- **Exit:** Tapping "Results" tab returns to the Results view. Tapping × closes the results screen.

#### 🔄 Screen States
- **Loading:** Displays a loading spinner while compatibility is being calculated.
- **Empty:** Displays a prompt to "Add products to your routine" if the user has no active routine to compare against. (NOT N/A)
- **Error:** Displays an error message if the compatibility check fails.
- **Success:** Displays the compatibility score and detailed breakdown.

#### 🗺️ Navigation
| Action | Destination |
|---|---|
| Tap "Results" tab | Scan Results — Results Tab (4.6) |
| Tap × (close) | Home Screen `(tabs)/index` |
| Tap a compatible ingredient row | Ingredient Detail Page (3.3) |

---

## 5. History Screens

---

### 5.1 History Page

**Reference Image:** `design_references/history.png`

#### 🎯 Purpose
> The History Page is a chronological log of all the user's past skin analyses. It allows users to review, search, and compare previous scan results over time to track how their skin changes.

#### 🧩 Elements & Functions
| Element | Type | Function / Behavior |
|---|---|---|
| Hamburger Menu Icon (☰) | Icon Button (Top-Left) | Opens the Menu Overlay side drawer. |
| "History" | Static Text (Page Header) | Page title. Non-interactive. |
| Search Bar ("search history") | Text Input Field | Filters the history list by date or skin type in real-time. |
| Filter Icon | Icon Button (Top-Right of search bar) | Opens a filter/sort panel to filter entries by date range, skin type, or conditions. |
| History List Item Card | Tappable Card Row | Displays a face photo thumbnail, scan date, health percentage badge (e.g., "98% Healthy"), skin type badge, and skin condition badge(s). Tapping it opens the History Detail page. |
| "···" Overflow Menu | Icon Button (on each card) | Opens an action sheet with options such as "Delete" this scan record. |
| Bottom Tab Bar | Tab Navigator (Persistent) | Home, Library, Scan (center), History (active), Routine. |

#### 📊 Data Displayed
| Field | Source |
|---|---|
| Face photo thumbnail | `GET /history?limit=20&offset=0` → `image_url` |
| Scan date | `GET /history` → `created_at` |
| Skin type | `GET /history` → `skin_type` |
| Skin condition(s) | `GET /history` → joined `analysis_conditions[]` |
| Health percentage | `GET /history` → `health_score` |

#### ✨ Animations & Transitions
- **Entry:** Slides in from the right when the History tab is tapped. List items fade in as they load.
- **Interactions:** Cards have opacity press effect. The "···" overflow opens an action sheet from the bottom. Search filters results as the user types. Deleting an entry animates with a slide-out.
- **Exit:** Tapping a history card pushes to the History Detail page (forward horizontal slide).

#### 🔄 Screen States
- **Loading:** Shows skeleton loaders for the history list.
- **Empty:** Displays an empty state: "You have no scan history yet." with a CTA to start their first scan. (NOT N/A)
- **Error:** Displays an error if the history fails to fetch, with a retry button.
- **Success:** Displays the chronological list of past scans.

#### 🗺️ Navigation
| Action | Destination |
|---|---|
| Tap a history entry card | History Detail — Results Tab (5.2) |
| Tap Hamburger Menu (☰) | Menu Overlay (7.1) |

---

### 5.2 History Detail Results Page

**Reference Image:** `design_references/history_detail_results_tab.png`

#### 🎯 Purpose
> [Describe the purpose here.]

#### 🧩 Elements & Functions
| Element | Type | Function / Behavior |
|---|---|---|
| | | |

#### 📊 Data Displayed
| Field | Source |
|---|---|
| | |

#### ✨ Animations & Transitions
- **Entry:** 
- **Interactions:** 
- **Exit:** 

#### 🔄 Screen States
- **Loading:** 
- **Empty:** N/A
- **Error:** 
- **Success:** N/A

#### 🗺️ Navigation
| Action | Destination |
|---|---|
| | |

---

### 5.3 History Detail Compatibility Page

**Reference Image:** `design_references/history_detail_compatibility_tab.png`

#### 🎯 Purpose
> The History Detail Compatibility Tab shows the ingredient compatibility analysis data associated with a specific past scan. Its layout mirrors the live Scan Results Compatibility Tab (4.7), but uses historical data stored at the time of that scan.

#### 🧩 Elements & Functions
| Element | Type | Function / Behavior |
|---|---|---|
| Back Arrow (←) | Icon Button (Top-Left) | Navigates back to the History Page. |
| "Skin Analysis: [Date]" | Static Text (Title, Top-Center) | Screen title with the historical scan date. Non-interactive. |
| "Results" Tab | Tab Switcher Button (Inactive) | Tapping switches to the History Detail Results Tab (5.2). |
| "Ingredient Compatibility" Tab | Tab Switcher Button (Active) | Currently selected. |
| "Compatible Ingredients to Skin Type" Card | Informational Card | Lists all compatible ingredients recorded at the time of that scan. |
| Compatible Ingredient Items | List Row Items | Each ingredient name as a tappable row. May navigate to its Ingredient Detail Page. |
| "Incompatible Ingredients to mix" Section | Section Header | Label for the incompatible pairs section. |
| Incompatible Pair Cards | Informational Cards | Each incompatible ingredient pair from that scan, with reason and usage guidance. |

#### 📊 Data Displayed
| Field | Source |
|---|---|
| Compatible ingredients | `GET /history/{id}` → `analysis_compatible_ingredients[]` |
| Incompatible pairs | `GET /history/{id}` → `analysis_incompatible_pairs[]` |

#### ✨ Animations & Transitions
- **Entry:** Switches from the Results Tab via a horizontal slide/swipe.
- **Interactions:** Page scrolls vertically. Ingredient rows have press feedback.
- **Exit:** Tapping the Results tab returns to the Results view. Back arrow returns to the History list.

#### 🔄 Screen States
- **Loading:** Shows a spinner while loading historical compatibility data.
- **Empty:** Indicates that no routine was active at the time of this scan, so no compatibility data is available. (NOT N/A)
- **Error:** Displays an error if the data fails to load.
- **Success:** Displays the historical compatibility data.

#### 🗺️ Navigation
| Action | Destination |
|---|---|
| Tap "Results" tab | History Detail — Results Tab (5.2) |
| Tap ← (back) | History Page (5.1) |
| Tap a compatible ingredient row | Ingredient Detail Page (3.3) |

---

## 6. Routine Screens

---

### 6.1 Routine Page (No Routine Yet)

**Reference Image:** `design_references/routine_empty.png`

#### 🎯 Purpose
> The Routine Page (No Routine Yet) is shown when the user has not yet generated a personalized skincare routine. It previews their current skin profile and presents a clear CTA to generate their first routine, listing key benefits to encourage the user to proceed.

#### 🧩 Elements & Functions
| Element | Type | Function / Behavior |
|---|---|---|
| Hamburger Menu Icon (☰) | Icon Button (Top-Left) | Opens the Menu Overlay side drawer. |
| "Skincare Routine" | Static Text (Page Header) | Page title. Non-interactive. |
| "Your Skin Profile" Card | Informational Card | Displays the user's skin type, concerns, and overall skin condition from the latest scan, each with an icon and an illustration. Non-interactive. |
| Skin Profile Labels (Type, Concerns, Condition) | Static Text with Icons (inside card) | Three labeled columns showing the derived values from the latest analysis. |
| "Ready for Your Custom Regimen?" CTA Card | Promotional Card | Centered card with a lab icon and title. Explains that a personalized AM & PM routine will be generated for the user's specific skin type and concerns. |
| Feature Checklist (inside CTA card) | Static Checklist | Three benefit items: "Step-by-step AM & PM guide", "Ingredient safety match", "Adaptive product suggestions" — each with a checkmark. |
| "GENERATE SKINCARE ROUTINE →" | Button (Primary CTA, Full-Width) | Calls `POST /routine/generate`. Shows a loading spinner while generating. |
| Disclaimer Banner | Informational Card (Bottom) | An amber warning banner stating the routine is AI-generated and not a substitute for dermatological advice. Non-interactive. |
| Bottom Tab Bar | Tab Navigator (Persistent) | Home, Library, Scan (center), History, Routine (active). |

#### 📊 Data Displayed
| Field | Source |
|---|---|
| Skin type (in Skin Profile card) | Zustand store or `GET /routine` → derived from latest scan's `skin_type` |
| Concerns (in Skin Profile card) | Latest scan's `analysis_conditions[]` |
| Overall Skin Condition (in Skin Profile card) | Derived from latest scan's health percentage |

#### ✨ Animations & Transitions
- **Entry:** Slides in when the Routine tab is tapped. Cards fade in sequentially.
- **Interactions:** "GENERATE" button shows a loading spinner and is disabled while the API request is in progress.
- **Exit:** After routine generation completes, transitions to the Routine Page (Active Routine).

#### 🔄 Screen States
- **Loading:** The "GENERATE" button shows a loading spinner when generating.
- **Empty:** N/A *(this IS the empty/no-routine state)*
- **Error:** A toast appears if generation fails (e.g., "Could not generate routine. Ensure you have a skin scan.").
- **Success:** N/A — transitions to the Active Routine page on success.

#### 🗺️ Navigation
| Action | Destination |
|---|---|
| Tap "GENERATE SKINCARE ROUTINE →" (success) | Routine Page — Active Routine (6.2) |
| Tap Hamburger Menu (☰) | Menu Overlay (7.1) |

---

### 6.2 Routine Page (Active Routine)

**Reference Image:** `design_references/routine_active.png`

#### 🎯 Purpose
> [Describe the purpose here.]

#### 🧩 Elements & Functions
| Element | Type | Function / Behavior |
|---|---|---|
| | | |

#### 📊 Data Displayed
| Field | Source |
|---|---|
| | |

#### ✨ Animations & Transitions
- **Entry:** 
- **Interactions:** 
- **Exit:** 

#### 🔄 Screen States
- **Loading:** 
- **Empty:** N/A
- **Error:** 
- **Success:** N/A

#### 🗺️ Navigation
| Action | Destination |
|---|---|
| | |

---

## 7. Menu Overlay

---

### 7.1 Menu Overlay

**Reference Image:** `design_references/menu_overlay.png`

#### 🎯 Purpose
> The Menu Overlay is a side drawer that slides in from the left edge when the user taps the hamburger menu (☰) icon on any main tab page. It provides access to the user's profile, secondary navigation links (Favorites, About, Help), and a log out button.

#### 🧩 Elements & Functions
| Element | Type | Function / Behavior |
|---|---|---|
| Dark Background Overlay | Tappable Overlay | The right portion of the screen (behind the drawer) is darkened. Tapping it dismisses the drawer without navigating. |
| "AureSkin" | Static Text (App Name, Top-Left of drawer) | App name at the top of the drawer. Non-interactive. |
| Close (×) Button | Icon Button (Top-Right of drawer) | Closes the drawer and returns to the current page. |
| Avatar / Profile Photo | Circular Image (inside drawer header) | Displays the user's profile picture. Non-interactive. |
| User Name | Static Text (beside avatar) | Displays the user's display name. Non-interactive. |
| "View Profile" | Text Link (below user name) | Navigates to the Profile Page. |
| "Favorites" | Navigation List Item | Navigates to a favorites/bookmarked items screen. |
| "About" | Navigation List Item | Navigates to an About/Credits screen. |
| "Help" | Navigation List Item | Navigates to a Help/FAQ or support screen. |
| "Log out" | Button (Full-Width, Destructive — Bottom) | Calls `supabase.auth.signOut()`, clears the Zustand `authStore` session, and navigates to the Login Screen. |

#### 📊 Data Displayed
| Field | Source |
|---|---|
| User display name | Zustand `authStore` → `user.user_metadata.display_name` |
| Profile avatar | Zustand `authStore` or `GET /profile` → `avatar_url` |

#### ✨ Animations & Transitions
- **Entry:** Slides in from the left edge with a smooth spring animation. The background overlay fades in simultaneously.
- **Interactions:** All navigation list items have opacity press feedback. "Log out" has a press scale-down effect. Tapping the dark overlay dismisses the drawer.
- **Exit:** Slides back out to the left when dismissed. After "Log out", the drawer closes and the app navigates to the Login Screen with a fade transition.

#### 🔄 Screen States
- **Loading:** N/A (Instantly overlays with data from the Zustand store)
- **Empty:** N/A
- **Error:** N/A
- **Success:** N/A

#### 🗺️ Navigation
| Action | Destination |
|---|---|
| Tap "View Profile" | Profile Page (8.1) |
| Tap "Favorites" | Favorites Screen |
| Tap "About" | About Screen |
| Tap "Help" | Help / Support Screen |
| Tap "Log out" | Login Screen `(auth)/login` |
| Tap × or dark overlay | Dismiss to current screen |

---

## 8. Profile Screen

---

### 8.1 Profile Page

**Reference Image:** `design_references/profile.png`

#### 🎯 Purpose
> The Profile Page displays the user's personal profile information and current skin overview. Accessed from the "View Profile" link in the Menu Overlay. Shows avatar, name, skin health summary, profile details (age, pregnancy status, allergen), and a privacy assurance message.

#### 🧩 Elements & Functions
| Element | Type | Function / Behavior |
|---|---|---|
| Close (×) Button | Icon Button (Top-Right) | Closes the Profile Page and returns to the previously active tab or Menu Overlay. |
| Profile Avatar | Large Circular Image (Top-Left) | The user's profile photo. |
| Camera Icon Badge (on avatar) | Icon Badge | Indicates the photo can be changed via Edit Profile. |
| "Hello, [Name]!" | Static Text (Heading) | Personalized greeting with the user's display name. |
| "Edit Profile" | Button (Secondary, Small) | Navigates to the Edit Profile Page (8.2). |
| "Skin Overview" Section | Section Header | Label for the skin status section. |
| Skin Type Name | Static Text (Large, Bold) | Detected skin type (e.g., "Oily") with a descriptive badge (e.g., "Balanced"). |
| Skin Type Description | Static Text | A brief description of the skin type. Non-interactive. |
| Skin Health Gauge | Circular Progress Indicator | A circular ring showing the skin health percentage (e.g., "78% Good"). Non-interactive. |
| "Profile Information" Section | Section Header | Label for the profile detail rows below. |
| Age Row | Tappable List Row | Shows icon, "Age" label, description, and current value (e.g., "20 years old") with a "›" chevron. Tapping opens the edit field. |
| Pregnant Row | Tappable List Row | Shows icon, "Pregnant" label, description, and current value (e.g., "No") with a "›" chevron. |
| Allergen Row | Tappable List Row | Shows icon, "Allergen" label, description, and current value (e.g., "None") with a "›" chevron. |
| "Your Information is Safe" Banner | Informational Card (Bottom) | Security assurance with a shield icon. Non-interactive. |

#### 📊 Data Displayed
| Field | Source |
|---|---|
| User display name | `GET /profile` → `display_name` |
| Avatar URL | `GET /profile` → `avatar_url` (Supabase Storage) |
| Skin type | Latest scan from `GET /history` → `skin_type` |
| Skin health percentage | Derived from latest scan confidence |
| Age | `GET /profile` → `age` |
| Pregnant status | `GET /profile` → `pregnant` |
| Allergen list | `GET /profile` → `allergen` |

#### ✨ Animations & Transitions
- **Entry:** Pushed from the Menu Overlay "View Profile" link via a forward horizontal slide.
- **Interactions:** Age, Pregnant, and Allergen rows have opacity press feedback. The circular health gauge animates on mount (ring fills from 0% to the actual value).
- **Exit:** Tapping × or back navigates back to the Menu Overlay. Tapping "Edit Profile" pushes to the Edit Profile Page.

#### 🔄 Screen States
- **Loading:** Shows a spinner or skeleton while loading user profile details.
- **Empty:** N/A
- **Error:** Displays an error if profile data fails to load.
- **Success:** Displays the populated profile information.

#### 🗺️ Navigation
| Action | Destination |
|---|---|
| Tap "Edit Profile" | Edit Profile Page (8.2) |
| Tap Age / Pregnant / Allergen rows | Edit Profile Page (8.2) |
| Tap × (close) | Previous screen (Menu Overlay or active tab) |

---

### 8.2 Edit Profile Page 

**Reference Image:** `design_references/edit_profile.png`

#### 🎯 Purpose
> The Edit Profile Page allows the user to update their personal information: first name, last name, age, username, pregnancy status, allergens, and profile photo. A "Change Password" button provides access to the password update flow.

#### 🧩 Elements & Functions
| Element | Type | Function / Behavior |
|---|---|---|
| Profile Avatar | Circular Image (Top-Center) | The user's current profile picture. |
| Edit Avatar Pencil Icon | Small Circular Button (Bottom-Right of avatar) | Opens the device image picker to select a new profile photo. |
| "Edit Profile" | Static Text (Page Heading) | Page title. Non-interactive. |
| First Name | Text Input Field | Accepts the user's first name. Pre-filled with the current value. |
| Last Name | Text Input Field | Accepts the user's last name. Pre-filled with the current value. |
| Age | Text Input Field (Numeric) | Accepts the user's age as a number. Pre-filled with the current value. |
| Username | Text Input Field | Accepts the user's username. Pre-filled with the current value. |
| Pregnant | Dropdown/Picker | Dropdown to select pregnancy status ("Yes" / "No"). Pre-filled with the current value. |
| Allergen | Dropdown/Picker | Dropdown or multi-select to specify known allergens or ingredient sensitivities. Pre-filled with the current value. |
| "Change Password" | Button (Secondary, Full-Width) | Opens a password change flow (modal or separate screen). |
| "Save Changes" | Button (Primary CTA) | Submits updated profile data to `PUT /profile`. Shows a loading spinner while in progress. Disabled if no changes have been made. |
| "Cancel" | Button (Secondary/Outlined) | Discards all changes and navigates back to the Profile Page without saving. |

#### 📊 Data Displayed
| Field | Source |
|---|---|
| First name (pre-filled) | `GET /profile` → `display_name` or `first_name` |
| Last name (pre-filled) | `GET /profile` → `last_name` |
| Age (pre-filled) | `GET /profile` → `age` |
| Username (pre-filled) | `GET /profile` → `username` |
| Pregnant status (pre-filled) | `GET /profile` → `pregnant` |
| Allergen (pre-filled) | `GET /profile` → `allergen` |
| Avatar (pre-filled) | `GET /profile` → `avatar_url` |

#### ✨ Animations & Transitions
- **Entry:** Pushed from the Profile Page via a forward horizontal slide.
- **Interactions:** Input fields highlight on focus. The avatar picker opens the device image library via a bottom-sheet. The "Save Changes" button shows a loading spinner while the update request is in progress.
- **Exit:** On successful save, a success toast ("Profile updated!") appears and the page navigates back to the Profile Page. Tapping "Cancel" pops back without saving.

#### 🔄 Screen States
- **Loading:** Shows a spinner on the "Save Changes" button when submitting changes.
- **Empty:** N/A
- **Error:** Displays validation errors on fields or a toast for submission failure.
- **Success:** Displays a success toast and navigates back to the Profile Page.

#### 🗺️ Navigation
| Action | Destination |
|---|---|
| Tap "Save Changes" (success) | Profile Page (8.1) |
| Tap "Cancel" | Profile Page (8.1) |
| Tap avatar edit icon | Device image picker (in-app) |
| Tap "Change Password" | Change Password Screen / Modal |

---

*Last updated: October 2026*
