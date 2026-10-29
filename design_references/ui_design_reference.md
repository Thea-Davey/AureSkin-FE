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
> The Ingredients Tab is the default view of the Library section. It presents a searchable, scrollable catalog of skincare ingredients from the AureSkin knowledge base. Users can browse ingredients, search by name, and tap any ingredient to view its detailed mechanism of action, benefits, cautions, and personalized compatibility status. It functions as an educational reference guide, decoupled from the active scan analysis results.

#### 🧩 Elements & Functions
| Element | Type | Function / Behavior |
|---|---|---|
| Hamburger Menu Icon (☰) | Icon Button (Top-Left) | Opens the Menu Overlay side drawer navigation. |
| "Library" | Static Text (Header) | Section title. Non-interactive. |
| "Ingredients" Tab | Tab Control Button (Active) | Currently selected tab showing a highlighted pill background (`bg-accent/40` or `bg-secondary`). Remains active on tap. |
| "Products" Tab | Tab Control Button (Inactive) | Switches view to the Products Tab (3.2). |
| Search Bar | Text Input Field | Centered input inside the curved container (`rounded-card`) with a search icon (magnifying glass) and placeholder `"search ingredient"`. Filters the ingredient list in real-time. |
| Ingredient List | Scrollable List (Vertical) | Displays paginated ingredients in rounded card containers (`rounded-card`). |
| Ingredient List Item | Tappable Card Row | Displays the ingredient name (e.g., "Aloe Vera"). Tapping it navigates to the Ingredient Detail Page (3.3). |
| Bottom Tab Bar | Tab Navigator (Persistent) | Provides access to Home, Library (active), Scan, History, and Routine. |

#### 📊 Data Displayed
| Field | Source |
|---|---|
| Ingredient Name List | `GET /ingredients?q=&limit=20&offset=0` via `library_api.ts` (`fetchIngredients`) / `useIngredients.ts` (Supabase `ingredients` table). |
| Search Query | Local component state debounced and passed to `useIngredients.ts`. |
| Active Tab State | ViewModel state inside `useLibrary.ts` or local tab switcher state. |

#### ✨ Animations & Transitions
- **Entry:** Displays when navigating to the Library tab or selecting the Ingredients tab. List rows fade in as data resolves.
- **Interactions:** Search bar border highlights on focus. Tapping an ingredient card provides opacity feedback (`active:opacity-80`). List scrolls smoothly with standard momentum.
- **Exit:** Tapping an ingredient row pushes to the Ingredient Detail Page (3.3) via a forward slide or modal sheet. Switching tabs toggles content smoothly.

#### 🔄 Screen States
- **Loading:** Displays skeleton shimmer rows while ingredient records are being retrieved.
- **Empty:** Displays "No ingredients found" message with a search icon when the search term yields zero results.
- **Error:** Displays an inline error card with an error message and a "Retry" button.
- **Success:** Displays the scrollable list of ingredient card rows matching the active search query.

#### 🗺️ Navigation
| Action | Destination |
|---|---|
| Tap "Products" tab | Library Page — Products Tab (3.2) |
| Tap an ingredient row | Ingredient Detail Page (3.3) |
| Tap Hamburger Menu (☰) | Menu Overlay (7.1) |
| Tap Bottom Tab Bar (Home/Scan/History/Routine) | Respective main application tab |

---

### 3.2 Library Page (Products Tab)

**Reference Image:** `design_references/library_products.png`

#### 🎯 Purpose
> The Products Tab allows users to browse, filter, and search curated skincare products stored in the AureSkin library. Users can filter products by category (cleansers, toners, moisturizers, serums, etc.), view product details and formulations, toggle favorite products, and contribute new products to the community-driven database using the Floating Action Button (+).

#### 🧩 Elements & Functions
| Element | Type | Function / Behavior |
|---|---|---|
| Hamburger Menu Icon (☰) | Icon Button (Top-Left) | Opens the Menu Overlay side drawer. |
| "Library" | Static Text (Header) | Section title. Non-interactive. |
| "Ingredients" Tab | Tab Control Button (Inactive) | Switches view to the Ingredients Tab (3.1). |
| "Products" Tab | Tab Control Button (Active) | Currently selected tab showing a highlighted pill background. Remains active on tap. |
| Search Control | Icon Button / Input Trigger | Magnifying glass icon on the left of the filter row. Tapping expands a product search input. |
| Category Filter Dropdown | Dropdown / Filter Pill | Category selector (e.g., "▾ Cleansers", "▾ Toners", "▾ Moisturizers", "▾ Sunscreens"). Filters products by category. |
| Secondary Filter Dropdown | Dropdown / Filter Pill | Displays secondary filter options (e.g., "▾ All", "▾ Favorites"). Filters the list according to user preference. |
| Product List | Scrollable List (Vertical) | Displays products arranged in vertical cards (`rounded-card`). |
| Product Card | Tappable Card | Contains the product thumbnail image, name, brand, category badge, and favorite icon. Tapping the card opens the Product Detail Page (3.4). |
| Product Image Thumbnail | Image Component | Displays the product photo from Supabase Storage (`product-images`). Shows a soft placeholder background if no image is available. |
| Product Name | Static Text (Heading) | Displays the product name (e.g., "Glycolic Acid 7% Toning Solution"). |
| Product Brand | Static Text (Subtext) | Displays the brand name (e.g., "The Ordinary"). |
| Product Category Badge | Status Pill (`rounded-badge`) | Displays the category type (e.g., "Toner") with muted accent background. |
| Favorite Icon | Icon Button | Star outline icon at top-right of the card. Tapping toggles the product's saved favorite state. |
| Add Product Button (+) | Floating Action Button (FAB) | Circular elevated button (`rounded-full bg-primary`) at bottom-right with a plus icon. Navigates to the Add Product flow (Camera Overlay 3.5 or Form 3.7). |
| Bottom Tab Bar | Tab Navigator (Persistent) | Home, Library (active), Scan, History, Routine. |

#### 📊 Data Displayed
| Field | Source |
|---|---|
| Product Catalog List | `GET /products?q=&category=&limit=20&offset=0` via `library_api.ts` (`fetchProducts`) / `useProducts.ts` (Supabase `products` table). |
| Product Thumbnail Image | `image_url` column from Supabase `products` table (Supabase Storage `/product-images/`). |
| Product Name & Brand | `name` and `brand` columns from Supabase `products` table. |
| Product Category | `category` column from Supabase `products` table. |
| Favorite State | Local user preference or Supabase user favorites join table. |

#### ✨ Animations & Transitions
- **Entry:** Displays product cards in vertical order when switching to the Products tab. Cards stagger-fade in.
- **Interactions:** Dropdown filter taps open modal/picker sheets. Product cards have scale/opacity press feedback. Tapping the star icon toggles fill state with a micro-scale bounce. The FAB features elevation shadow and press feedback.
- **Exit:** Tapping a product card pushes to Product Detail Page (3.4). Tapping the FAB (+) pushes to Add Product Camera Overlay (3.5).

#### 🔄 Screen States
- **Loading:** Displays skeleton card loaders while product records and image thumbnails load.
- **Empty:** Displays "No products found matching your filters" with a reset filter button when queries return zero results.
- **Error:** Displays an error banner with a retry trigger if network/API requests fail.
- **Success:** Displays the populated vertical list of product cards with interactive filters and FAB.

#### 🗺️ Navigation
| Action | Destination |
|---|---|
| Tap "Ingredients" tab | Library Page — Ingredients Tab (3.1) |
| Tap a product card | Product Detail Page (3.4) |
| Tap Add Product FAB (+) | Add Product Camera Overlay (3.5) |
| Tap Hamburger Menu (☰) | Menu Overlay (7.1) |
| Tap Bottom Tab Bar (Home/Scan/History/Routine) | Respective main application tab |

---

### 3.3 Ingredient Detail Page

**Reference Image:** `design_references/library_ingredient_detail.png`

#### 🎯 Purpose
> The Ingredient Detail Page provides an in-depth reference guide for a single skincare ingredient. It presents what the ingredient is, what it does biologically, what concerns/skin goals it is good for, who should avoid it, and an objective compatibility indicator ("Compatible") derived from the user's latest facial skin profile.

#### 🧩 Elements & Functions
| Element | Type | Function / Behavior |
|---|---|---|
| Close Icon (X) | Icon Button (Top-Right) | Closes the ingredient detail modal/sheet and returns to the Ingredients Tab (3.1). |
| Container Card | Scrollable Modal Sheet (`rounded-t-card`) | White container housing all ingredient detail sections. |
| Ingredient Name | Static Text (Heading `text-h2`) | Displays the ingredient name (e.g., "Aloe Vera"). |
| Compatibility Status Badge | Status Badge (`rounded-badge`) | Green pill badge displaying "✔ Compatible" when the ingredient aligns with the user's skin profile without conflicting interactions. |
| Favorite Icon | Icon Button | Star outline icon at top-right of the card to toggle favorite state. |
| Divider | Visual Separator | Horizontal border separating header from content. |
| Overview Description | Static Text (Paragraph) | In-depth description of the ingredient, common synonyms (e.g. *aloe barbadensis leaf juice*), active constituents (vitamins, minerals, polysaccharides), and fundamental properties. |
| "What is it?" Section Card | Informational Card (`rounded-card`) | Heading `text-h3 font-sans-bold` with explanatory body copy describing the ingredient's botanical/chemical origins and core classification. |
| "What does it do?" Section Card | Informational Card (`rounded-card`) | Heading `text-h3 font-sans-bold` with explanatory copy outlining physiological mechanisms (anti-inflammatory, humectant moisture retention, antioxidant defense). |
| "What is it good for?" Section Card | Informational Card (`rounded-card`) | Heading `text-h3 font-sans-bold` followed by green-bulleted target skin goals (Dry and dehydrated skin, Impaired skin barrier, Pregnancy, Radiance, Texture). |
| "Who should avoid?" Section Card | Informational Card (`rounded-card`) | Heading `text-h3 font-sans-bold` followed by coral-bulleted contraindications, irritation warnings, or allergen notices (Related Allergy). |

#### 📊 Data Displayed
| Field | Source |
|---|---|
| Ingredient Details (`name`, `description`, `benefits`, `skin_types[]`, `caution`) | `GET /ingredients/{id}` via `library_api.ts` (`fetchIngredientById`) / Supabase `ingredients` table. |
| Compatibility Status | Evaluated dynamically: checks if ingredient ID exists in `analysis_compatible_ingredients` from latest `skin_analyses` record. |
| Favorite State | Local storage or Supabase user favorites. |

#### ✨ Animations & Transitions
- **Entry:** Slides up smoothly from the bottom as a modal card or pushes horizontally.
- **Interactions:** Close icon has press feedback. Section cards scroll vertically with momentum. Favorite star bounces on toggle.
- **Exit:** Tapping the Close icon (X) or swiping down dismisses the sheet and returns to the Ingredients Tab.

#### 🔄 Screen States
- **Loading:** Shows shimmer skeleton lines for title, badge, and description blocks.
- **Empty:** N/A (modal is loaded with a specific ingredient ID).
- **Error:** Displays a modal error message with a "Close" button if data cannot be retrieved.
- **Success:** Fully populated layout with cards and compatibility badge.

#### 🗺️ Navigation
| Action | Destination |
|---|---|
| Tap Close icon (X) | Returns to Library Page — Ingredients Tab (3.1) |
| Tap Favorite icon | Toggles favorite status locally/remotely |

---

### 3.4 Product Detail Page

**Reference Image:** `design_references/library_product_detail.png`

#### 🎯 Purpose
> The Product Detail Page displays comprehensive information for a selected skincare product, including high-resolution packaging imagery, brand, category, an active ingredient compatibility badge, and the complete ordered ingredient list. It helps users understand exactly what is in their product and whether it is safe and compatible for their skin.

#### 🧩 Elements & Functions
| Element | Type | Function / Behavior |
|---|---|---|
| Close Icon (X) | Icon Button (Top-Right) | Dismisses the product detail view and returns to the Products Tab (3.2). |
| Product Packaging Image | Image Hero Component | Displays high-resolution photos of the product bottle and packaging box side-by-side. |
| Compatibility Status Badge | Status Badge Overlay | Green pill badge ("✔ Compatible") overlaid at the bottom-right of the product hero image, indicating suitability for the user's skin profile. |
| Product Name | Static Text (Heading `text-h2`) | Displays the full product name (e.g., "Glycolic Acid 7% Toning Solution"). |
| Favorite Icon | Icon Button | Star outline icon on the right side of the product name. |
| Brand Name | Static Text (Subheading) | Displays the brand name (e.g., "The Ordinary"). |
| Product Category Badge | Status Pill (`rounded-badge`) | Displays the category tag (e.g., "Toner") with muted secondary background. |
| Ingredients Card | Container (`rounded-card`) | White container holding the full formula ingredient breakdown. |
| "Ingredients" Heading | Static Text (`text-h3 font-sans-bold`) | Labels the formulation section. |
| Ingredient List Items | Tappable List Rows | Vertical list of ingredients (Water, Glycolic Acid, Rosa Damascena Flower Water, Centaurea Cyanus Flower Water, etc.), each preceded by an amber/coral droplet icon. Tapping an item navigates to its Ingredient Detail Page (3.3). |

#### 📊 Data Displayed
| Field | Source |
|---|---|
| Product Info (`name`, `brand`, `category`, `image_url`) | `GET /products/{id}` via `library_api.ts` (`fetchProductById`) from Supabase `products` table. |
| Ingredient List | `product_ingredients` join table linked to `ingredients`, ordered by the `order` column. |
| Compatibility Status | Calculated by checking product ingredients against user's latest analysis and `harmful_pairs` conflict table. |
| Favorite State | Local store or Supabase user favorites. |

#### ✨ Animations & Transitions
- **Entry:** Slides in or opens as a full-height sheet. Hero image fades in with cached loading.
- **Interactions:** Scrolling transitions between the hero packaging view and the ingredient list. Tapping an ingredient row triggers a soft highlight.
- **Exit:** Tapping the Close icon (X) dismisses the screen back to the Products Tab (3.2).

#### 🔄 Screen States
- **Loading:** Displays an image skeleton and placeholder ingredient lines.
- **Empty:** N/A
- **Error:** Displays an error screen with a "Go Back" button if the product ID is invalid or unreachable.
- **Success:** Fully populated view with hero imagery, badges, and complete ingredient list.

#### 🗺️ Navigation
| Action | Destination |
|---|---|
| Tap Close icon (X) | Previous screen (Library Products Tab 3.2) |
| Tap an ingredient item | Ingredient Detail Page (3.3) for that specific ingredient |
| Tap Favorite icon | Toggles favorite state |

---

### 3.5 Add Product Camera Overlay

**Reference Image:** `design_references/library_add_product_camera.png`

#### 🎯 Purpose
> The Add Product Camera Overlay allows users to capture a clear photo of a skincare product's front packaging or ingredient label to accompany a new product entry. The captured image is uploaded to Supabase Storage and attached to the user-submitted product record in the Add Product Form (3.7).

#### 🧩 Elements & Functions
| Element | Type | Function / Behavior |
|---|---|---|
| "Ingredient Extractor" | Static Text (Header) | Viewfinder header title. Non-interactive. |
| Help Icon (?) | Icon Button (Top-Left) | Opens a tooltip or modal offering tips for capturing legible product label photos. |
| Close Icon (X) | Icon Button (Top-Right) | Closes the camera viewfinder and returns to the Products Tab (3.2). |
| Camera Viewfinder | Camera Preview Area (`rounded-card`) | Live camera stream (via `expo-camera`) where the user positions the product bottle or packaging label. |
| "Take photo" Label | Static Text Banner | Prompt label located directly below the viewfinder window. |
| Shutter Button | Primary Camera Button | Large circular white button (`rounded-full`) that captures the current frame. |
| Gallery Thumbnail | Image Thumbnail Button | Square preview of recent gallery images (bottom-left). Tapping opens the Add Product Upload screen (3.6). |
| Switch Camera Button | Icon Button | Circular arrows icon (bottom-right) that flips between back and front camera lenses. |

#### 📊 Data Displayed
| Field | Source |
|---|---|
| Camera Feed | Hardware camera stream via `expo-camera`. |
| Recent Image Thumbnail | Last photo retrieved from device gallery via `expo-media-library`. |

#### ✨ Animations & Transitions
- **Entry:** Viewfinder fades in; camera initializes.
- **Interactions:** Tapping the Shutter button triggers a quick flash/shutter sound and transitions forward to `AddProductForm` (3.7) with the captured image URI.
- **Exit:** Tapping Close (X) dismisses the camera viewfinder back to the Products Tab.

#### 🔄 Screen States
- **Loading:** Displays a dark background with an `ActivityIndicator` while the hardware camera initializes.
- **Empty:** N/A
- **Error:** Displays a permission alert if camera access is denied by the user, with an "Open Settings" CTA.
- **Success:** Active live camera feed with interactive shutter and flip controls.

#### 🗺️ Navigation
| Action | Destination |
|---|---|
| Tap Shutter button | Add Product Form (3.7) with captured image attached |
| Tap Gallery Thumbnail | Add Product Upload (3.6) |
| Tap Close icon (X) | Library Page — Products Tab (3.2) |
| Tap Help icon (?) | Camera guide tooltip modal |

---

### 3.6 Add Product Upload

**Reference Image:** `design_references/library_add_product_upload.png`

#### 🎯 Purpose
> The Add Product Upload screen allows users to select an existing product image or label photo from their device's media library instead of taking a live photo. The selected image is attached to the new product submission in the Add Product Form (3.7).

#### 🧩 Elements & Functions
| Element | Type | Function / Behavior |
|---|---|---|
| "Upload a Photo" | Static Text (Header) | Title identifying the gallery selection screen. |
| Search Bar | Text Input (`rounded-input`) | Allows searching photos by filename/album if supported by the system picker. |
| Photo Grid | 3-Column Scrollable Grid | Displays available device images in a structured grid. |
| Photo Grid Item | Tappable Image Thumbnail | Individual image item. Tapping selects the image and forwards it to `AddProductForm` (3.7). |

#### 📊 Data Displayed
| Field | Source |
|---|---|
| Device Photos | Device photo library accessed via `expo-image-picker` / `expo-media-library`. |
| Search Input | Local search query string. |

#### ✨ Animations & Transitions
- **Entry:** Photo grid renders with native gallery animation.
- **Interactions:** Tapping an image provides scale feedback and selects the image.
- **Exit:** Transitions directly to `AddProductForm` (3.7) with the chosen image URI.

#### 🔄 Screen States
- **Loading:** Displays placeholder grid squares while thumbnail cache loads.
- **Empty:** Displays "No photos found" if media library permissions allow access to an empty album.
- **Error:** Displays permission request dialog if photo library access is denied.
- **Success:** Multi-column scrollable photo grid.

#### 🗺️ Navigation
| Action | Destination |
|---|---|
| Tap a photo | Add Product Form (3.7) with selected photo URI |
| System back action | Returns to Add Product Camera Overlay (3.5) or Products Tab (3.2) |

---

### 3.7 Add Product Form

**Reference Image:** `design_references/library_add_product_form.png`

#### 🎯 Purpose
> The Add Product Form is where users enter, review, and confirm details for a new skincare product before saving it to the AureSkin library. Users can specify the product name, add and edit ingredients as tags, add an optional description, and submit the product to the backend API (`POST /products`).

#### 🧩 Elements & Functions
| Element | Type | Function / Behavior |
|---|---|---|
| "Scanned Ingredients" | Static Text (Header) | Screen header title. Non-interactive. |
| Close Icon (X) | Icon Button (Top-Right) | Exits the form and returns to the Products Tab (3.2). |
| Product Name Card | Card / Editable Input (`rounded-card`) | Displays product name with a pencil edit icon. Tapping allows typing or editing the product name. |
| Ingredients Section Card | Container Card (`rounded-card`) | Container grouping all product ingredients. |
| "Ingredients" Heading | Static Text (`text-h3 font-sans-bold`) | Section header with a pencil edit icon at top-right for bulk editing. |
| Ingredient Tags List | Tag List / Removable Pills | Ordered list of ingredient items (Salicylic acid, Niacinamide, Clay, Hyaluronic acid, Retinol, Dioic acid, Omega fatty acids, Aloe Vera). Users can add new tags or tap to remove. |
| "Add description" Card | Expandable Section (`rounded-card`) | Card displaying "Add description" with a plus (+) icon. Tapping expands a multiline text area for optional product description. |
| "Add Skincare Product" | Button (Primary CTA `rounded-button`) | Submits the product payload to `POST /products`. Displays loading spinner during submission. |
| "Cancel" | Button (Secondary `rounded-button border`) | Cancels the form entry and returns to the Products Tab without saving. |

#### 📊 Data Displayed
| Field | Source |
|---|---|
| Product Name | User-entered string via form state in `useAddProduct.ts`. |
| Ingredient List | Array of ingredient strings (`ingredients: string[]`) managed in form state. |
| Product Description | Optional user-entered description string. |
| Product Image URI | Passed from Camera (3.5) or Upload (3.6); uploaded to Supabase Storage `product-images`. |

#### ✨ Animations & Transitions
- **Entry:** Form cards slide up; keyboard adjusts view when focusing text inputs.
- **Interactions:** Tapping the pencil icon focuses the text input. Tapping "Add description" smoothly animates expanding the description box. Button press states provide opacity feedback.
- **Exit:** On successful submission, triggers the Add Product Success Overlay (3.8). Tapping Cancel or Close dismisses the form.

#### 🔄 Screen States
- **Loading:** Submit button displays an `ActivityIndicator` and is disabled while `POST /products` and image upload execute.
- **Empty:** Initial empty form if opened without a pre-scanned label.
- **Error:** Inline error banner or toast notification appears if required fields (name, ingredients) are missing or the API returns an error.
- **Success:** Navigates to Add Product Success Overlay (3.8).

#### 🗺️ Navigation
| Action | Destination |
|---|---|
| Tap "Add Skincare Product" (success) | Add Product Success Overlay (3.8) |
| Tap "Cancel" or Close (X) | Library Page — Products Tab (3.2) |

---

### 3.8 Add Product Success Overlay

**Reference Image:** `design_references/library_add_product_success.png`

#### 🎯 Purpose
> The Add Product Success Overlay confirms that a skincare product has been successfully created and added to the AureSkin library. It provides immediate, clear visual feedback to the user before returning them to the refreshed Products catalog.

#### 🧩 Elements & Functions
| Element | Type | Function / Behavior |
|---|---|---|
| Dimmed Overlay | Modal Backdrop | Semi-transparent darkened background focusing user attention on the dialog. |
| Success Dialog Card | Centered Container (`rounded-card bg-neutral-white`) | Clean white rectangular card centered on the screen. |
| Success Icon | Status Icon Container | Circular muted-green container (`rounded-full bg-status-success/30` or `bg-primary`) displaying a white checkmark icon (`✔`). |
| "Product added!" | Static Text (`text-h3 font-sans-bold`) | Confirmation heading message. Non-interactive. |

#### 📊 Data Displayed
| Field | Source |
|---|---|
| Confirmation Message | Static interface text: `"Product added!"`. |

#### ✨ Animations & Transitions
- **Entry:** Dialog scales in with a subtle spring bounce (`scale: 0.9 → 1.0`, `opacity: 0 → 1`) over the dimmed backdrop.
- **Interactions:** Non-interactive informational dialog.
- **Exit:** Automatically fades out after 1.5–2.0 seconds (or on backdrop tap), smoothly transitioning back to the Library Products Tab (3.2).

#### 🔄 Screen States
- **Loading:** N/A
- **Empty:** N/A
- **Error:** N/A (failures are handled prior to opening this overlay).
- **Success:** Displays checkmark icon and "Product added!" confirmation.

#### 🗺️ Navigation
| Action | Destination |
|---|---|
| Overlay auto-dismisses (1.5s timer) | Library Page — Products Tab (3.2) with invalidation of React Query `products` cache. |

---

## 4. Scan Screens

---

### 4.1 Scan Overlay (Take a Photo / Upload a Photo)

**Reference Image:** `design_references/scan_overlay.png`

#### 🎯 Purpose
> The Scan Overlay is the gateway to AureSkin's flagship **facial skin analysis** feature. Activated by tapping the elevated center **Scan** button on the persistent bottom navigation bar, it dims the current screen and presents the user with two options for providing a clear photo of their face: capturing a live photo using the camera or uploading a photo from their device gallery. It also provides an Exit button to dismiss the overlay without starting a scan.

#### 🧩 Elements & Functions
| Element | Type | Function / Behavior |
|---|---|---|
| Dimmed Backdrop | Modal Overlay | Full-screen semi-transparent backdrop covering the underlying tab screen. Tapping the backdrop dismisses the overlay. |
| "Take a Photo" Button | Primary Action Button (`rounded-card bg-neutral-white`) | White rectangular pill button with a camera icon and "Take a Photo" text. Navigates to the facial Scan Camera screen (4.2). |
| Camera Icon | Vector Icon | Camera icon inside the "Take a Photo" button. |
| "Upload a Photo" Button | Secondary Action Button (`rounded-card bg-neutral-white`) | White rectangular pill button with an upload icon and "Upload a Photo" text. Navigates to the facial Scan Upload screen (4.3). |
| Upload Icon | Vector Icon | Upload icon inside the "Upload a Photo" button. |
| Exit Button | Circular CTA Button (`rounded-full bg-accent` or red/coral) | Prominent circular button at bottom-center with an "X" icon and "Exit" label. Dismisses the overlay and returns to the active tab. |
| Exit Icon (X) & Label | Icon + Text | Visually indicates the dismiss action. |

#### 📊 Data Displayed
| Field | Source |
|---|---|
| Action Button Labels | Static interface copy: `"Take a Photo"`, `"Upload a Photo"`, `"Exit"`. |

#### ✨ Animations & Transitions
- **Entry:** Backdrop fades in while the action buttons slide up smoothly from the bottom.
- **Interactions:** Action buttons have scale/opacity feedback on press. The circular Exit button has a spring scale press animation.
- **Exit:** Tapping "Take a Photo" pushes forward to Scan Camera (4.2). Tapping "Upload a Photo" pushes forward to Scan Upload (4.3). Tapping Exit or the backdrop slides the overlay down and restores the previous screen.

#### 🔄 Screen States
- **Loading:** N/A
- **Empty:** N/A
- **Error:** N/A
- **Success:** Clean modal layout with all three action buttons displayed.

#### 🗺️ Navigation
| Action | Destination |
|---|---|
| Tap "Take a Photo" | Scan Camera (4.2) |
| Tap "Upload a Photo" | Scan Upload (4.3) |
| Tap Exit (×) or backdrop | Dismisses overlay and returns to current tab screen |

---

### 4.2 Scan Camera (Take a Photo)

**Reference Image:** `design_references/scan_camera.png`

#### 🎯 Purpose
> The Scan Camera screen is the live viewfinder interface where users capture a photo of their face for skin analysis. It provides an intuitive camera stream with face positioning guidance, lighting tips, camera switching, and quick gallery access, ensuring high-quality input for the MediaPipe facial landmark mesh and MobileNetV3 classifiers.

#### 🧩 Elements & Functions
| Element | Type | Function / Behavior |
|---|---|---|
| "Analyze Skin" | Static Text (Header) | Viewfinder header title. Non-interactive. |
| Help Icon (?) | Icon Button (Top-Left) | Opens skin test guidance modal (lighting, no makeup, neutral expression). |
| Close Icon (X) | Icon Button (Top-Right) | Closes the camera viewfinder and returns to the previous tab screen. |
| Camera Viewfinder | Live Camera Stream (`rounded-card`) | Full viewfinder area (via `expo-camera`) where the user centers their face. |
| "Take photo" Label | Static Text Banner | Centered prompt text below the viewfinder. |
| Shutter Button | Primary Camera Button | Large circular white button (`rounded-full`) that captures the facial photo. |
| Gallery Thumbnail | Image Thumbnail Button | Square thumbnail at bottom-left linking directly to gallery photo selection (Scan Upload 4.3). |
| Switch Camera Button | Icon Button | Circular arrows icon at bottom-right toggling between front (selfie) and rear cameras. Defaults to front camera. |

#### 📊 Data Displayed
| Field | Source |
|---|---|
| Camera Feed | Live video stream from device camera via `expo-camera`. |
| Recent Image Thumbnail | Last photo from device photo library via `expo-media-library`. |

#### ✨ Animations & Transitions
- **Entry:** Camera stream initializes; viewfinder fades in.
- **Interactions:** Tapping the Shutter button triggers a quick capture flash and immediately passes the captured photo URI to `ScanSubmit` (4.4).
- **Exit:** Tapping Close (X) dismisses the camera.

#### 🔄 Screen States
- **Loading:** Shows a dark screen with an `ActivityIndicator` while the camera hardware initializes.
- **Empty:** N/A
- **Error:** Shows an alert if camera permission is denied, with a button linking to device settings.
- **Success:** Live camera feed with active shutter controls.

#### 🗺️ Navigation
| Action | Destination |
|---|---|
| Tap Shutter button | Scan Submit (4.4) with captured face image |
| Tap Gallery Thumbnail | Scan Upload (4.3) |
| Tap Close icon (X) | Returns to previous tab screen |
| Tap Help icon (?) | Opens scan guidance modal |

---

### 4.3 Scan Upload (Upload a Photo)

**Reference Image:** `design_references/scan_upload.png`

#### 🎯 Purpose
> The Scan Upload screen provides a native photo picker interface allowing users to select an existing facial image from their device's local gallery or camera roll instead of capturing a live photo with the camera. It offers an organized multi-column photo grid and search filter so users can quickly locate clear, well-lit portrait photos for AI skin analysis.

#### 🧩 Elements & Functions
| Element | Type | Function / Behavior |
|---|---|---|
| "Upload a Photo" | Static Text (Header) | Viewfinder header title. Non-interactive. |
| Search Bar | Text Input Field (Pill container) | Pill-shaped search bar with magnifying glass icon and `"Search..."` placeholder to filter gallery photos by album, tag, or date. |
| Gallery Photo Grid | Scrollable Grid (`FlatList`, 3 columns) | 3-column scrollable grid of square photo thumbnails fetched from the device's media library via `expo-media-library`. Tapping any photo tile selects that image and immediately navigates to Scan Submit (4.4). |
| Back / Dismiss Action | Hardware/Gesture Back | Navigates back to the Scan Camera (4.2) viewfinder or previous tab screen. |

#### 📊 Data Displayed
| Field | Source |
|---|---|
| Device photos & thumbnails | Local device media library accessed via `expo-media-library` (local asset URIs). |
| Search query | Local component state filtering photo assets. |

#### ✨ Animations & Transitions
- **Entry:** Pushes into view from Scan Camera (4.2) or Scan Overlay (4.1) with a horizontal slide transition. Photo grid items fade in smoothly.
- **Interactions:** Grid scrolls vertically with smooth inertial momentum. Tapping an image tile provides instant opacity feedback (`activeOpacity={0.8}`). Search bar raises the keyboard on focus.
- **Exit:** Selecting an image navigates forward to Scan Submit (4.4) with the chosen image URI. Swiping back or pressing device back pops to Scan Camera (4.2).

#### 🔄 Screen States
- **Loading:** Shows centered `ActivityIndicator` or skeleton grid placeholders while media library permissions are being requested and assets are loaded into memory.
- **Empty:** Displays an empty state icon and message: "No photos found. Take a photo or check your gallery permissions." if no images match the search or the gallery is empty.
- **Error:** Displays a permission denied notice ("AureSkin needs access to your photos to analyze skin from your gallery") with a direct CTA button linking to device system settings.
- **Success:** Displays a populated 3-column grid of image thumbnails ready for user selection.

#### 🗺️ Navigation
| Action | Destination |
|---|---|
| Tap any photo thumbnail | Scan Submit (4.4) with selected image URI |
| Press Back / Swipe Back | Scan Camera (4.2) |

---

### 4.4 Scan Submit (Submit Photo)

**Reference Image:** `design_references/scan_submit.png`

#### 🎯 Purpose
> The Scan Submit screen is the confirmation and review step where the user inspects their captured or selected face photo before submitting it for deep-learning skin analysis. It ensures the user can verify that their face is centered, evenly illuminated, and in sharp focus, offering options to retake the photo or proceed with processing.

#### 🧩 Elements & Functions
| Element | Type | Function / Behavior |
|---|---|---|
| "Analyze Skin" | Static Text (Header) | Screen header title centered at the top. Non-interactive. |
| Help Icon (?) | Icon Button (Top-Left) | Opens the skin test guidance modal (lighting, no makeup, neutral expression, glasses removed). |
| Close Icon (×) | Icon Button (Top-Right) | Discards the current image and exits the scan workflow, returning to the previous tab screen (Home). |
| Face Photo Preview | Image Container (`rounded-card`) | Large rounded card displaying the high-resolution captured or selected face photo. |
| Guidance Prompt | Static Text Banner | Centered prompt text below the preview card: `"Make sure your face is evenly lit and in focus"`. |
| "Retake" Button | Icon + Text Button (Bottom-Left) | Reload/circular arrows icon (`🔄`) paired with "Retake" label. Discards the current image and returns to Scan Camera (4.2) or Scan Upload (4.3) to recapture/reselect. |
| "Submit Photo" Button | Primary Action Button (Bottom-Right) | White pill button (`bg-white rounded-full`) featuring bold text "Submit Photo" and an enclosed black circle with a white right arrow (`➔`). Tapping triggers image compression and initiates the analysis pipeline on the Scan Analyzing screen (4.5). |

#### 📊 Data Displayed
| Field | Source |
|---|---|
| Captured / Selected face photo | Local image URI passed via navigation route parameters from Scan Camera (4.2) or Scan Upload (4.3). |

#### ✨ Animations & Transitions
- **Entry:** Slides in horizontally from the right or crossfades in immediately after camera capture or gallery selection.
- **Interactions:** "Submit Photo" button exhibits tactile scale-down feedback (`scale-98`) on press. "Retake" button provides active opacity feedback. Tapping Help (?) slides up the guidance modal.
- **Exit:** Tapping "Submit Photo" pushes into Scan Analyzing (4.5). Tapping "Retake" returns to Scan Camera (4.2). Tapping Close (×) dismisses the scan flow back to Home.

#### 🔄 Screen States
- **Loading:** Brief placeholder while high-resolution image is loaded from local cache into the preview container.
- **Empty:** N/A (this screen is strictly instantiated with a valid photo URI).
- **Error:** Displays an alert banner if the local image file is corrupted or unreadable, with an option to retake.
- **Success:** Clear preview of the face photo with interactive Retake and Submit controls.

#### 🗺️ Navigation
| Action | Destination |
|---|---|
| Tap "Submit Photo" button | Scan Analyzing (4.5) with image URI |
| Tap "Retake" button | Scan Camera (4.2) or Scan Upload (4.3) |
| Tap Help icon (?) | Opens skin test guidance modal |
| Tap Close icon (×) | Returns to previous tab screen (Home `(tabs)/index`) |

---

### 4.5 Scan Analyzing (Loading Screen)

**Reference Image:** `design_references/scan_analyzing.png`

#### 🎯 Purpose
> The Scan Analyzing screen is an active, full-screen animated processing state displayed while the backend executes the AI skin analysis pipeline (`POST /scan`). It uploads the image to Supabase Storage, extracts anatomical facial landmarks via MediaPipe Face Mesh, executes the MobileNetV3 skin type and condition classifiers, computes the 0–100 heuristic skin health score, and cross-references compatible ingredients and harmful pairs. It provides real-time visual feedback, step-by-step progress reassurance, and data privacy confirmation.

#### 🧩 Elements & Functions
| Element | Type | Function / Behavior |
|---|---|---|
| "Analyzing Skin" | Static Text (Header) | Centered screen header. Non-interactive. |
| Circular Face Preview | Image Container (`rounded-full`) | Circular crop of the user's uploaded face photo centered on the screen. |
| Animated Glowing Progress Ring | Radial Progress Ring (`border-green-400`) | Circular glowing green progress indicator enclosing the face preview that animates radially to reflect multi-phase pipeline completion. |
| Percentage Badge | Pill Badge Container | Small dark pill badge docked at the bottom center of the circular frame with a glowing green dot and percentage label (`• 100%`) tracking real-time/simulated analysis progress. |
| Pipeline Stage Headline | Dynamic Text Banner | Bold, uppercase green text (`text-green-400 font-bold`) updating dynamically according to the active pipeline stage (e.g., `"MAPPING FACIAL LANDMARKS..."`, `"CLASSIFYING SKIN TYPE AND POSSIBLE CONCERNS..."`, `"CALCULATING SKIN HEALTH SCORE..."`, `"CHECKING INGREDIENT COMPATIBILITY..."`). |
| Pipeline Stage Subtext | Dynamic Subtitle | Descriptive subtitle in light gray (e.g., `"Analyzing micro-level dermal indicators"`). |
| Security & Privacy Pill | Informational Card | Dark rounded card near the bottom featuring a green shield checkmark icon and text: `"Encrypted and processed securely making sure your data is safe."` |
| "Cancel Analysis" Button | Secondary Text Button | Centered text button at the bottom allowing the user to abort the ongoing network request via an `AbortController` and return to the Scan Submit screen. |

#### 📊 Data Displayed
| Field | Source |
|---|---|
| Face photo thumbnail | Local image URI passed from Scan Submit (4.4). |
| Progress percentage | Calculated frontend progress state (0% to 100%) synchronized with pipeline events. |
| Stage status message | Dynamic pipeline step descriptor mapped to backend analysis progress. |

#### ✨ Animations & Transitions
- **Entry:** Crossfades in seamlessly from Scan Submit (4.4). The progress ring and face preview scale in with a subtle bounce.
- **Interactions:** The glowing green progress ring pulses and fills smoothly. The percentage badge increments continuously. Pipeline stage headlines crossfade with a smooth opacity and slide-up transition.
- **Exit:** Once `POST /scan` returns a successful response (`200 OK`), the screen automatically crossfades or pushes forward to Scan Results — Results Tab (4.6). Tapping "Cancel Analysis" aborts the request and pops back to Scan Submit (4.4).

#### 🔄 Screen States
- **Loading:** The default and active state of this screen: glowing progress ring rotating/filling, dynamic status text cycling, and percentage advancing.
- **Empty:** N/A
- **Error:** If the network request times out, image lacks a detectable face (MediaPipe error), or server returns 4xx/5xx, displays an error modal: "Analysis could not be completed. Please ensure your face is clearly visible and try again." with "Retry" and "Cancel" buttons.
- **Success:** Automatically transitions to Scan Results — Results Tab (4.6) upon receiving the complete `ScanResponse` payload.

#### 🗺️ Navigation
| Action | Destination |
|---|---|
| Analysis completes successfully | Scan Results — Results Tab (4.6) with `ScanResponse` data |
| Tap "Cancel Analysis" | Scan Submit (4.4) (aborts analysis request) |

---

### 4.6 Scan Results — Results Tab

**Reference Image:** `design_references/scan_results_results_tab.png`

#### 🎯 Purpose
> The Scan Results Results Tab is the primary findings dashboard presented immediately following a successful skin scan. It showcases the user's analyzed face photo, predicted skin type accompanied by model classification confidence, an overall heuristic skin health score (0–100), and detailed dermatological cards for all detected skin conditions with clinical explanations, symptoms, and root causes.

#### 🧩 Elements & Functions
| Element | Type | Function / Behavior |
|---|---|---|
| "Skin Analysis" | Static Text (Title, Top-Center) | Screen header title. Non-interactive. |
| Close (×) Button | Icon Button (Top-Right) | Closes the results screen and navigates directly back to the Home screen `(tabs)/index`. |
| Tab Switcher ("Results") | Segmented Tab Button (Active) | Peachy-terracotta pill button indicating the active Results tab view. |
| Tab Switcher ("Ingredient Compatibility") | Segmented Tab Button (Inactive) | Inactive tab button. Tapping switches the view to the Ingredient Compatibility Tab (4.7). |
| Analyzed Face Photo Card | Image Container (`rounded-card`) | Full-width rounded card displaying the captured face photo stored in Supabase Storage (`image_url`). |
| Skin Type Banner | Informational Card (`bg-[#FDF2E9] rounded-card`) | Prominent peachy-cream banner displaying `"Your Skin Type is"` sub-header and large bold skin type name (e.g., `"Oily"`, `"Dry"`, `"Normal"`, `"Combination"`, `"Acne Prone"`). |
| Skin Type Confidence Badge | Circular Badge (`rounded-full`) | White circular pill badge on the right side of the skin type banner displaying model confidence percentage (e.g., `"91.46%"`). |
| Skin Health Score | Metric Widget | Overall heuristic skin health score (0–100) calculated by `ml/health_scorer.py` evaluating condition severity and skin balance. |
| "Concern/s" Section Header | Static Text Header | Bold section heading introducing the detected skin condition cards. |
| Condition Detail Card(s) | Informational Card (`rounded-card`) | Stacked card for each detected skin condition (e.g., "Skin Redness", "Inflammatory Acne", "Dark Spots"). Features a coral/pink header with flame/alert icon and condition title, followed by a clinical description (e.g., erythema inflammatory response), symptoms bullet points, and root causes. |

#### 📊 Data Displayed
| Field | Source |
|---|---|
| Analyzed face photo | `POST /scan` → `data.image_url` (Supabase Storage URL) |
| Predicted skin type | `POST /scan` → `data.skin_type` (`normal`, `oily`, `dry`, `combination`, `acneprone`) |
| Skin type confidence | `POST /scan` → `data.skin_type_confidence` (e.g., `91.46%`) |
| Skin health score | `POST /scan` → `data.health_score` (0–100 integer/float from weighted heuristic scorer) |
| Detected conditions list | `POST /scan` → `data.conditions[]` (`name`, `display_name`, `confidence`, `description`, `symptoms`, `causes`) |
| Dermatological analysis summary | `POST /scan` → `data.summary` |

#### ✨ Animations & Transitions
- **Entry:** Slides in from the right or fades in seamlessly from Scan Analyzing (4.5). The skin type banner and condition cards cascade upward with a staggered fade-in animation.
- **Interactions:** Full-page vertical scrolling. Tab switcher has smooth sliding indicator animation. Condition cards have subtle press feedback or expandable sections for in-depth guidance.
- **Exit:** Tapping the "Ingredient Compatibility" tab slides horizontally to 4.7. Tapping the Close (×) button dismisses the scan flow and returns to the Home tab.

#### 🔄 Screen States
- **Loading:** Brief skeleton placeholder for photo, skin type banner, and condition cards if hydrating results from state or cache.
- **Empty:** If the ML model detects no skin conditions, the "Concern/s" section displays a positive confirmation card: "No active skin conditions detected. Your skin barrier appears healthy and balanced."
- **Error:** Displays an error message with a "Retry Analysis" button if analysis payload data is missing or corrupted.
- **Success:** Fully populated results screen displaying face photo, skin type banner with confidence badge, health score, and condition cards.

#### 🗺️ Navigation
| Action | Destination |
|---|---|
| Tap "Ingredient Compatibility" tab | Scan Results — Compatibility Tab (4.7) |
| Tap Close icon (×) | Home Screen `(tabs)/index` |

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
> The History Detail Results Page allows users to inspect the complete skin analysis findings from a specific past scan session selected from their history log (`GET /history/{id}`). It mirrors the visual layout of the live Scan Results Results Tab (4.6), displaying the historical face photo, recorded skin type with confidence percentage, heuristic skin health score (0–100), and detected skin conditions with clinical descriptions, symptoms, and causes, while providing a timestamped back-navigation header to return to the history list.

#### 🧩 Elements & Functions
| Element | Type | Function / Behavior |
|---|---|---|
| Back Arrow (←) | Icon Button (Top-Left) | Navigates back to the History Page (5.1) list. |
| "Skin Analysis: [Date]" | Static Text (Title, Top-Center) | Screen header title displaying the formatted date of the historical scan (e.g., `"Skin Analysis: May 1, 2026"`). Non-interactive. |
| Tab Switcher ("Results") | Segmented Tab Button (Active) | Peachy-terracotta pill button indicating the active Results tab view. |
| Tab Switcher ("Ingredient Compatibility") | Segmented Tab Button (Inactive) | Inactive tab button. Tapping switches to the History Detail Compatibility Page (5.3). |
| Historical Face Photo Card | Image Container (`rounded-card`) | Full-width rounded card displaying the stored face photo retrieved from Supabase Storage (`image_url`). |
| Historical Skin Type Banner | Informational Card (`bg-[#FDF2E9] rounded-card`) | Prominent peachy-cream card displaying `"Your Skin Type is"` sub-header and the historical skin type (e.g., `"Oily"`). |
| Historical Confidence Badge | Circular Badge (`rounded-full`) | White circular badge with confidence percentage recorded at the time of the scan (e.g., `"91.46%"`). |
| Historical Skin Health Score | Metric Widget | Stored heuristic skin health score (0–100) recorded for that scan session. |
| "Concern/s" Section Header | Static Text Header | Bold section heading introducing the historical condition cards. |
| Historical Condition Card(s) | Informational Card (`rounded-card`) | Stacked cards for each condition detected during that historical scan session (e.g., "Skin Redness"), detailing symptoms, descriptions, and causes recorded at that time. |

#### 📊 Data Displayed
| Field | Source |
|---|---|
| Scan timestamp | `GET /history/{id}` → `created_at` (formatted e.g., "May 1, 2026") |
| Historical face photo | `GET /history/{id}` → `image_url` (Supabase Storage) |
| Historical skin type | `GET /history/{id}` → `skin_type` |
| Historical skin type confidence | `GET /history/{id}` → `skin_type_confidence` |
| Historical skin health score | `GET /history/{id}` → `health_score` (0–100) |
| Historical detected conditions | `GET /history/{id}` → joined `analysis_conditions[]` with `conditions` metadata (`display_name`, `confidence`, `description`) |
| Historical dermatological summary | `GET /history/{id}` → `summary` |

#### ✨ Animations & Transitions
- **Entry:** Pushes into view from History Page (5.1) with a forward horizontal slide transition. Photo and result cards fade in smoothly.
- **Interactions:** Page scrolls vertically with smooth physics. Tapping the "Ingredient Compatibility" tab switches to 5.3 with a horizontal slide animation.
- **Exit:** Tapping the Back arrow (←) pops the screen back to History Page (5.1) with a reverse horizontal slide transition.

#### 🔄 Screen States
- **Loading:** Shows skeleton placeholders for photo card, skin type banner, and condition cards while `GET /history/{id}` is fetching.
- **Empty:** N/A (screen is accessed by selecting an existing history record ID).
- **Error:** Displays an error banner: "Unable to load scan details. The record may have been deleted." with a "Go Back" button if record retrieval fails.
- **Success:** Displays the complete historical skin analysis results, photos, confidence scores, and conditions.

#### 🗺️ Navigation
| Action | Destination |
|---|---|
| Tap Back arrow (←) | History Page (5.1) |
| Tap "Ingredient Compatibility" tab | History Detail Compatibility Page (5.3) |

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
> The Routine Page (Active Routine) displays the user’s personalized, algorithmically generated daily skincare regimen. Generated from the user's latest facial scan (skin type, detected skin conditions, and ingredient compatibility), it organizes care into distinct Morning and Night regimens with clear, numbered, step-by-step guidance. Users can review their active skin profile benchmarks, view step details and descriptions, and customize steps or swap recommended products via the "EDIT" option. The routine functions as a static, stress-free reference guide without invasive alarm schedules or completion check-boxes.

#### 🧩 Elements & Functions
| Element | Type | Function / Behavior |
|---|---|---|
| Hamburger Menu Icon (☰) | Icon Button (Top-Left) | Opens the Menu Overlay (7.1) side drawer navigation. |
| "Skincare Routine" | Static Text (Page Header) | Primary screen title. Non-interactive. |
| "Your Skin Profile" Card | Informational Hero Card (`rounded-card bg-card`) | Overview card linking the routine to the user's latest analysis. Displays skin metrics and an illustrated profile avatar. |
| "Your Skin Profile" Heading & Subtitle | Static Text | Card header with subtext: "Based on your latest skin analysis". |
| Profile Avatar Illustration | Image Graphic | Stylized portrait graphic of a face with headband and healthy skin tone. |
| Skin Type Metric | Metric Item (Icon + Label + Value) | Water droplet icon inside circular badge (`rounded-full`), label "Skin Type", value e.g. "Oily". |
| Concerns Metric | Metric Item (Icon + Label + Value) | Face/pores examination icon inside circular badge, label "Concerns", value e.g. "Skin Redness". |
| Skin Condition Metric | Metric Item (Icon + Label + Value) | Sparkles icon inside circular badge, label "Skin Condition", value e.g. "Healthy". |
| Section Header | Static Text (Heading + Subtitle) | "Your Personalized Skincare Routine" with subtext "A simple routine tailored for your skin goals". |
| "Morning Routine" Card | Container Card (`rounded-card bg-card`) | Card encapsulating the morning regimen. |
| Morning Header & Icon | Icon + Static Text | Bright sun icon, "Morning Routine" heading, and subtitle "Protect & hydrate your skin". |
| Morning "EDIT" Button | Button (Pill `rounded-button`) | Muted tan/brown pill button (`bg-secondary/60` or `bg-accent`). Tapping opens the routine step editor / product swap modal (`SwapProductSheet`). |
| Morning Timeline Steps | Numbered Step List (Connected) | Ordered list of steps connected by vertical line indicators. |
| Step Number Badges | Numbered Circle (`rounded-full`) | Numbered indicators (1, 2, 3...) showing the recommended application sequence. |
| Step Name & Description | Static Text | Step name in bold (e.g., Step 1: "Cleanser", Step 2: "Toner", Step 3: "Lightweight Serum") and descriptive rationale (e.g., "Remove excess oil and impurities gently."). |
| "Night Routine" Card | Container Card (`rounded-card bg-card`) | Card encapsulating the nighttime regimen. |
| Night Header & Icon | Icon + Static Text | Crescent moon with stars icon, "Night Routine" heading, and subtitle "Protect & hydrate your skin". |
| Night "EDIT" Button | Button (Pill `rounded-button`) | Muted tan/brown pill button (`bg-secondary/60`). Tapping opens step editing / product swapping for nighttime steps. |
| Night Timeline Steps | Numbered Step List (Connected) | Ordered list of nighttime steps (e.g., Step 1: "Cleanser", Step 2: "Exfoliate", Step 3: "Moisturizer" — "Strengthen your skin barrier overnight.") connected by vertical line indicators. |
| "Why this routine?" Card | Informational Banner (`rounded-card bg-accent/20`) | Educational explanation card at the bottom. |
| Shield Icon | Icon Container | Shield icon with checkmark inside circular badge (`rounded-full`). |
| "Why this routine?" Text | Static Text | Heading with explanatory rationale (e.g., "This routine is designed to address your acne & texture concerns while maintaining healthy and balanced skin."). |
| Bottom Tab Bar | Tab Navigator (Persistent) | Home, Library, Scan, History, Routine (active). |

#### 📊 Data Displayed
| Field | Source |
|---|---|
| Latest Skin Profile Metrics (Skin Type, Concerns, Skin Condition) | Derived from latest `skin_analyses` record via `GET /history?limit=1` or user profile store. |
| Routine Details & Steps | `GET /routine` via `routine_api.ts` (`fetchRoutine()`) / `useRoutine.ts` (Supabase `routines` joined with `routine_steps`). |
| Morning Steps | `routine_steps[]` filtered by `time_of_day IN ('morning', 'both')`, ordered by `step_number ASC`. |
| Night Steps | `routine_steps[]` filtered by `time_of_day IN ('evening', 'both')`, ordered by `step_number ASC`. |
| Step Product Recommendations | Joined `product_id` → `products` table (`name`, `brand`, `image_url`). |
| Routine Rationale ("Why this routine?") | Dynamic or generated string from routine generator service / `routines.based_on_analysis_id`. |

#### ✨ Animations & Transitions
- **Entry:** Screen fades in on navigating to the Routine tab. Cards stagger-fade in vertically with a subtle upward translate.
- **Interactions:** "EDIT" buttons feature tactile opacity feedback (`active:opacity-75`). Pull-to-refresh on the scroll view smoothly refreshes routine data. Tapping a step or recommended product triggers interactive selection.
- **Exit:** Tapping an "EDIT" button opens the `SwapProductSheet` bottom sheet modal. Tapping another bottom tab transitions to the corresponding section.

#### 🔄 Screen States
- **Loading:** Displays card skeletons with shimmer placeholders for the profile card and morning/night step timelines.
- **Empty:** If no routine has been generated yet, redirects or transitions to `Routine Page (No Routine Yet)` (6.1) prompting routine generation.
- **Error:** Displays an inline error message with a "Retry" button if routine retrieval fails.
- **Success:** Fully populated layout displaying skin profile card, morning & night timeline cards with step instructions, and the rationale banner.

#### 🗺️ Navigation
| Action | Destination |
|---|---|
| Tap "EDIT" (Morning or Night) | Product swap / step editor modal (`SwapProductSheet.tsx`) |
| Tap Hamburger Menu (☰) | Menu Overlay (7.1) |
| Tap a step product (if linked) | Product Detail Page (3.4) |
| Tap Bottom Tab Bar (Home/Library/Scan/History) | Respective main application tab |

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
