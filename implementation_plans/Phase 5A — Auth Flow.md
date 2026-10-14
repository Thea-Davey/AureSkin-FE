# Phase 5A: Auth Flow Implementation Plan

## Overview

Build the Login, Register, and Terms & Conditions screens to match the Figma designs, connected to the real Supabase Auth backend. This phase follows the MVVM architecture established in Phase 4.

> [!NOTE]
> **Backend endpoints already exist and are ready:**
> - `POST /auth/register` — Body: `{ email, password }` → Returns `{ access_token, refresh_token, user }`
> - `POST /auth/login` — Body: `{ email, password }` → Returns `{ access_token, refresh_token, user }`
> - `POST /auth/refresh` — Body: `{ refresh_token }` → Returns new tokens

---

## Step 1: Auth Feature — Model Layer (Types + API)

> Create the MVVM model files that define the data shapes and API calls.

### 1A. `src/features/auth/model/auth_types.ts`

```ts
// Request types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

// Response types (matching backend TokenResponse)
export interface UserResponse {
  id: string;
  email: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: UserResponse;
}
```

### 1B. `src/features/auth/model/auth_api.ts`

```ts
// API calls using the shared Axios client (auto-attaches JWT)
import { api } from '@/shared/services/api';
import { LoginRequest, RegisterRequest, TokenResponse } from './auth_types';

export const authApi = {
  login: (data: LoginRequest) => api.post<TokenResponse>('/auth/login', data),
  register: (data: RegisterRequest) => api.post<TokenResponse>('/auth/register', data),
};
```

---

## Step 2: Auth Feature — ViewModel Layer (Hook)

> Create `src/features/auth/viewmodel/useAuth.ts` — the hook that connects the API to the UI.

**Responsibilities:**
- Manage form state (email, password, confirmPassword)
- Manage loading and error states
- Call `authApi.login()` or `authApi.register()`
- On success: update the Zustand `authStore` with the session
- On error: show a toast via `react-native-toast-message`
- Validate confirm password match (register only)

**Key functions exposed:**
| Function | Description |
|---|---|
| `handleLogin()` | Validates inputs → calls `/auth/login` → stores session → navigates to Home |
| `handleRegister()` | Validates inputs (password match) → calls `/auth/register` → navigates to Terms |
| `handleGoogleAuth()` | Triggers Supabase Google OAuth flow |
| `handleFacebookAuth()` | Triggers Supabase Facebook OAuth flow |

---

## Step 3: Shared Auth Components

> Build reusable components that are shared across Login, Register, and Terms screens.

Since all three auth screens share the same olive green background + white card layout, we'll create shared building blocks.

### 3A. `src/features/auth/view/components/AuthCard.tsx`
- White rounded card container with shadow
- Used on Login, Register, and Terms screens
- Uses `rounded-card` border radius from design tokens

### 3B. `src/features/auth/view/components/AuthInput.tsx`
- Styled text input with:
  - Border that highlights on focus (using `neutral-border` → `primary` color transition)
  - Red border highlight for error state
  - Placeholder text using `neutral-placeholder` color
  - `secureTextEntry` prop for password fields

### 3C. `src/features/auth/view/components/AuthButton.tsx`
- Primary CTA button (e.g., "Sign in", "Sign up", "I agree")
- Uses `secondary` color (warm beige) as the background
- Shows a loading spinner when `isLoading` is true
- Disabled state with reduced opacity
- Pressed/opacity feedback animation

### 3D. `src/features/auth/view/components/OAuthButton.tsx`
- OAuth button with icon (Google "G" or Facebook "f")
- Outlined style with subtle border
- Scale-down press animation

### 3E. `src/features/auth/view/components/AuthScreenWrapper.tsx`
- Wraps the entire screen with:
  - Olive green (`primary`) background
  - "AureSkin" branded title text at the top
  - `KeyboardAvoidingView` so the card shifts up when the keyboard opens
  - Centered layout for the card content

---

## Step 4: Login Screen — View Layer

> File: `src/app/(auth)/login.tsx` (thin route file)
> Actual UI: `src/features/auth/view/LoginPage.tsx`

### Layout (from Figma — `auth_login.png`)
```
┌──────────────────────────────────┐
│        (Olive Green BG)          │
│                                  │
│          "AureSkin"              │  ← Heading font, white
│                                  │
│    ┌────────────────────────┐    │
│    │  Log in to your Account│    │  ← White rounded card
│    │                        │    │
│    │  [ Email          ]    │    │  ← AuthInput
│    │  [ Password       ]    │    │  ← AuthInput (secure)
│    │                        │    │
│    │  [    Sign in     ]    │    │  ← AuthButton (secondary color)
│    │                        │    │
│    │  – Or sign in with –   │    │
│    │                        │    │
│    │  [ G ]     [ f ]       │    │  ← OAuthButtons (row)
│    │                        │    │
│    │  Don't have an account?│    │
│    │  Sign up               │    │  ← Link to Register
│    └────────────────────────┘    │
│                                  │
└──────────────────────────────────┘
```

### Animations
- **Entry:** Card slides up with `Animated.View` (translateY from 30 → 0, opacity 0 → 1, ~400ms)
- **Button press:** Opacity feedback via `Pressable` with `opacity: 0.8` on press
- **Input focus:** Border color transition from `neutral-border` to `primary`

---

## Step 5: Register Screen — View Layer

> File: `src/app/(auth)/register.tsx` (thin route file)
> Actual UI: `src/features/auth/view/RegisterPage.tsx`

### Layout (from Figma — `auth_register.png`)
Same structure as Login, with these differences:
- **Title:** "Create your Account" (instead of "Log in to your Account")
- **3 inputs** instead of 2: Email, Password, Confirm Password
- **CTA text:** "Sign up" (instead of "Sign in")
- **Divider:** "– Or sign up with –"
- **Bottom link:** "Already have an account? **Sign in**"

### Confirm Password Validation
- On blur or on submit, check if Password ≠ Confirm Password
- If mismatch: show inline red border on Confirm Password field + toast error "Passwords do not match"
- The `handleRegister()` function in the ViewModel prevents submission if mismatch

---

## Step 6: Terms & Conditions Screen — View Layer

> File: `src/app/(auth)/terms.tsx` (thin route file)
> Actual UI: `src/features/auth/view/TermsPage.tsx`

### Layout (from Figma — `auth_terms_and_conditions.png`)
```
┌──────────────────────────────────┐
│        (Olive Green BG)          │
│          "AureSkin"              │
│                                  │
│    ┌────────────────────────┐    │
│    │  Terms and Conditions  │    │  ← White rounded card
│    │                        │    │
│    │  Welcome to AureSkin...│    │  ← ScrollView (Layer 1)
│    │  1. Nature of Service  │    │     Scrollable legal text
│    │  2. Medical Disclaimer │    │
│    │  3. Data Privacy       │    │
│    │  4. AI Results         │    │
│    │  ...                   │    │
│    │                        │    │
│    │  [    I agree     ]    │    │  ← AuthButton (Fixed, Layer 2)
│    └────────────────────────┘    │
│                                  │
└──────────────────────────────────┘
```

### Key Details
- The terms text is **static/hardcoded** (not fetched from API)
- The "I agree" button is **fixed at the bottom** of the card, always visible while scrolling
- On tap: updates `terms_accepted_at` (timestamptz) in the Supabase `users` table → navigates to Home

---

## File Summary

| File | Layer | Purpose |
|---|---|---|
| `src/features/auth/model/auth_types.ts` | Model | TypeScript interfaces for requests/responses |
| `src/features/auth/model/auth_api.ts` | Model | Axios API calls to `/auth/login`, `/auth/register` |
| `src/features/auth/viewmodel/useAuth.ts` | ViewModel | Hook managing form state, validation, API calls, navigation |
| `src/features/auth/view/LoginPage.tsx` | View | Full Login screen UI |
| `src/features/auth/view/RegisterPage.tsx` | View | Full Register screen UI |
| `src/features/auth/view/TermsPage.tsx` | View | Full Terms & Conditions screen UI |
| `src/features/auth/view/components/AuthScreenWrapper.tsx` | View (shared) | Olive green bg + "AureSkin" title + KeyboardAvoidingView |
| `src/features/auth/view/components/AuthCard.tsx` | View (shared) | White rounded card container |
| `src/features/auth/view/components/AuthInput.tsx` | View (shared) | Styled text input with focus/error states |
| `src/features/auth/view/components/AuthButton.tsx` | View (shared) | Primary CTA button with loading state |
| `src/features/auth/view/components/OAuthButton.tsx` | View (shared) | Google/Facebook OAuth button |
| `src/app/(auth)/login.tsx` | Route | Thin file that imports and renders `LoginPage` |
| `src/app/(auth)/register.tsx` | Route | Thin file that imports and renders `RegisterPage` |
| `src/app/(auth)/terms.tsx` | Route | Thin file that imports and renders `TermsPage` |

---

## Execution Order

| Step | Task | Depends On |
|---|---|---|
| **1** | Create Model layer (types + API) | — |
| **2** | Create ViewModel hook (`useAuth`) | Step 1 |
| **3** | Build shared auth components | — |
| **4** | Build Login screen | Steps 2, 3 |
| **5** | Build Register screen | Steps 2, 3 |
| **6** | Build Terms screen | Steps 2, 3 |

---

## Deliverable

At the end of Phase 5A, we will have:
- ✅ Three fully styled auth screens matching the Figma designs
- ✅ Real authentication via Supabase (email/password login + registration)
- ✅ Google and Facebook OAuth buttons (wired to Supabase Auth providers)
- ✅ Auth guard redirecting unauthenticated users to Login
- ✅ Toast notifications for errors and success
- ✅ Smooth entry animations and press feedback
- ✅ Terms acceptance stored in Supabase (`terms_accepted_at`)
- ✅ Clean MVVM separation (Model → ViewModel → View)

> [!IMPORTANT]
> Before running the auth flow end-to-end, you will need to:
> 1. Update `frontend/.env` with your real Supabase URL and anon key
> 2. Have the FastAPI backend running (`uvicorn main:app`)
> 3. (Optional for OAuth) Configure Google and Facebook providers in your Supabase dashboard under Authentication → Providers
