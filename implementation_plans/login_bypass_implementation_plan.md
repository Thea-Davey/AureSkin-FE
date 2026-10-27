# Implementation Plan: Login Bypass Mode (Offline Development)

---

## 1. Overview & Context

### 1.1 Problem Statement
When teammates (**Bea** and **Faith**) run the AureSkin Expo app on their own machines, their frontend attempts to connect to the backend server via `EXPO_PUBLIC_API_BASE_URL` (currently pointing to Thea's local Wi-Fi IP `http://192.168.18.61:8000`). Because they are on different networks and do not run the backend locally, authentication network calls (`authApi.login`) fail or time out, preventing them from bypassing the root auth guard (`RootLayout`) to access and test the app's screens.

### 1.2 Proposed Solution: Login Bypass Mode
Introduce a centralized **Login Bypass toggle** (`LOGIN_BYPASS: boolean`). When set to `true`:
1. The app boots into the Login Screen as usual.
2. A prominent **red notification banner** appears directly below the `"Log in to your Account"` title, informing the developer that **Bypass Mode is active**.
3. The developer can tap the primary **"Sign in"** button immediately — **without filling in email or password**.
4. The ViewModel intercepts the request, generates an offline mock session (`User` + `Session`), updates the Zustand `authStore`, and redirects seamlessly to the **Home Page** (`/(tabs)`).
5. All downstream screens (which already support `USE_MOCK = true`) render smoothly with complete mock data.

---

## 2. Where to Place the Toggle (Architecture Decision)

### Recommended Location:
`frontend/src/features/auth/model/auth_bypass.ts`

### Why this is the cleanest placement:
1. **Adheres to AureSkin's MVVM Pattern:** Follows the established pattern used across the codebase (e.g., `USE_MOCK` in `home_api.ts`, `library_api.ts`). The model layer owns data source flags and mock payloads.
2. **Zero Confusion for Teammates:** Groupmates only need to open one obvious file (`auth_bypass.ts`) and change a single boolean:
   ```typescript
   export const LOGIN_BYPASS: boolean = true;
   ```
3. **Safe & Isolated:** Keeping the bypass logic and mock user fixtures in their own dedicated module prevents cluttering production auth code and avoids accidental commits of test credentials to production.

---

## 3. UI & Visual Specifications

### 3.1 Visual Hierarchy on `LoginPage.tsx`
```
┌────────────────────────────────────────────────────────┐
│  AureSkin (Branding)                                   │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Log in to your Account                          │  │
│  │                                                  │  │
│  │  ┌────────────────────────────────────────────┐  │  │
│  │  │ ⚠️  DEV BYPASS MODE ACTIVE                 │  │  │  ← NEW RED CONTAINER
│  │  │ Backend auth is bypassed for offline dev.  │  │  │    (Renders only when
│  │  │ Tap "Sign in" below to enter immediately.  │  │  │     LOGIN_BYPASS = true)
│  │  └────────────────────────────────────────────┘  │  │
│  │                                                  │  │
│  │  [ Email Input Field                          ]  │  │
│  │  [ Password Input Field                       ]  │  │
│  │                                                  │  │
│  │  [       Sign in (Primary Action CTA)         ]  │  │  ← Tapping this with empty
│  │                                                  │  │     fields triggers bypass
│  │  – Or sign in with –                             │  │
│  │  [ Google ]   [ Facebook ]                       │  │
│  │  Don't have an account? Sign up                  │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

### 3.2 Design Token Adherence (Strict Presets)
The notification banner adheres strictly to AureSkin's NativeWind tokens without raw hex values or arbitrary utilities:

#### Font Presets Verification Matrix (from `tailwind.config.js`):
| Text Element | Font Size Preset | Font Family Preset | Rendered Specs | Tailwind Class Combination |
|---|---|---|---|---|
| **Banner Title** | `text-body-sm` | `font-sans-bold` | 14px / 20px, `Inter_700Bold` | `text-body-sm font-sans-bold text-status-error` |
| **Banner Body** | `text-caption` | `font-sans` | 12px / 16px, `Inter_400Regular` | `text-caption font-sans text-status-error/90` |

> *Note:* Both `text-body-sm` and `text-caption` already include built-in `lineHeight` definitions (`20px` and `16px`) from `tailwind.config.js`, completely eliminating the need for generic Tailwind `leading-*` utilities.

#### Structural & Color Tokens:
| Element | Tailwind / NativeWind Classes | Purpose |
|---|---|---|
| **Banner Container** | `bg-status-error/10 border border-status-error rounded-card p-3 mb-4` | Soft red background with red accent border and preset 16px card radius (`rounded-card`) |
| **Header Row** | `flex-row items-center gap-2 mb-1` | Horizontal alignment for icon and bold title |
| **Icon Prop** | `color={theme.colors.error}` | Imported from `src/shared/theme` (zero raw hex `#E53935`) |

---

## 4. Technical Architecture & File Changes

```
frontend/src/
├── features/
│   └── auth/
│       ├── model/
│       │   ├── auth_bypass.ts            ← [NEW] Toggle flag & mock User/Session fixtures
│       │   └── auth_api.ts               ← Existing API calls
│       │
│       ├── viewmodel/
│       │   └── useAuth.ts                ← [MODIFIED] Branching in handleLogin when bypass active
│       │
│       └── view/
│           ├── LoginPage.tsx             ← [MODIFIED] Render BypassNoticeBanner under title
│           └── components/
│               └── BypassNoticeBanner.tsx ← [NEW] Reusable red notification component
│
└── shared/
    └── store/
        └── authStore.ts                  ← [SAFEGUARD] Ensure mock session is accepted
```

---

## 5. Detailed Component & Logic Design

### 5.1 Model: `src/features/auth/model/auth_bypass.ts`
Creates the toggle and standard Supabase-compatible mock `User` and `Session` objects:

```typescript
import { User, Session } from '@supabase/supabase-js';

// ============================================================================
// LOGIN BYPASS TOGGLE
// Set to `true` to allow entering the app without backend / network connection.
// Set to `false` for real authentication via FastAPI & Supabase.
export const LOGIN_BYPASS: boolean = true;
// ============================================================================

export const MOCK_BYPASS_USER: User = {
  id: '00000000-0000-0000-0000-000000000001',
  app_metadata: { provider: 'email' },
  user_metadata: {
    display_name: 'AureSkin Developer',
    email: 'dev@aureskin.app',
    avatar_url: '',
  },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  email: 'dev@aureskin.app',
  phone: '',
  role: 'authenticated',
  updated_at: new Date().toISOString(),
};

export const MOCK_BYPASS_SESSION: Session = {
  access_token: 'mock-dev-bypass-access-token',
  refresh_token: 'mock-dev-bypass-refresh-token',
  expires_in: 3600 * 24 * 365, // 1 year
  token_type: 'bearer',
  user: MOCK_BYPASS_USER,
};
```

### 5.2 Component: `src/features/auth/view/components/BypassNoticeBanner.tsx`
Self-contained notification banner rendering only when `LOGIN_BYPASS === true`:

```typescript
import { View, Text } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import { theme } from '../../../../shared/theme';

export function BypassNoticeBanner() {
  return (
    <View className="bg-status-error/10 border border-status-error rounded-card p-3 mb-4">
      <View className="flex-row items-center gap-2 mb-1">
        <AlertCircle size={16} color={theme.colors.error} />
        <Text className="text-body-sm font-sans-bold text-status-error">
          Dev Bypass Mode Active
        </Text>
      </View>
      <Text className="text-caption font-sans text-status-error/90">
        Backend authentication is bypassed for offline UI development. You do not need to enter credentials—simply tap "Sign in" below to enter the app.
      </Text>
    </View>
  );
}
```

### 5.3 View: `src/features/auth/view/LoginPage.tsx`
Insert `<BypassNoticeBanner />` right beneath the title:

```tsx
<Text className="text-h2 font-sans-bold text-neutral-text mb-6">
  Log in to your Account
</Text>

{isBypassActive && <BypassNoticeBanner />}

<AuthInput ... />
```

### 5.4 ViewModel: `src/features/auth/viewmodel/useAuth.ts`
Update `handleLogin` to check `LOGIN_BYPASS`:

```typescript
const handleLogin = async () => {
  // If bypass mode is active, allow signing in without credentials
  if (LOGIN_BYPASS) {
    setIsLoading(true);
    try {
      // Set the mock session in Zustand
      setSession(MOCK_BYPASS_SESSION);
      
      Toast.show({
        type: 'info',
        text1: 'Dev Bypass Login',
        text2: 'Logged in as offline developer',
      });

      router.replace('/(tabs)');
    } finally {
      setIsLoading(false);
    }
    return;
  }

  // Normal flow: Validate inputs and call backend
  if (!email || !password) {
    Toast.show({ type: 'error', text1: 'Error', text2: 'Please fill in all fields' });
    return;
  }
  ...
};
```

---

## 6. Edge Cases & Safeguards

| Scenario | Behavior / Mitigation |
|---|---|
| **App Reload in Expo Go** | `authStore.setSession` sets `isAuthenticated: true`. If reload resets the in-memory state, the app will return to the Login screen with the red banner visible, allowing an instant 1-tap re-entry. |
| **Accidental Production Deployment** | Toggling `LOGIN_BYPASS = false` completely disables the red banner, restores mandatory email/password validation, and resumes real API calls to `/auth/login`. |
| **API Interceptor with Mock Token** | Since teammates will test screens that use `USE_MOCK = true`, downstream endpoints will return local mock fixtures without hitting the unreachable network backend. |
| **User Sign Out** | If the groupmate taps "Log Out" in the side menu, `clearSession()` resets the state and returns to Login, where the red banner is waiting. |

---

## 7. Implementation Checklist

- [ ] **Step 1:** Create `frontend/src/features/auth/model/auth_bypass.ts` with toggle and mock fixtures.
- [ ] **Step 2:** Create `frontend/src/features/auth/view/components/BypassNoticeBanner.tsx` with error styling and icons.
- [ ] **Step 3:** Update `frontend/src/features/auth/viewmodel/useAuth.ts` to expose `isBypassActive` and intercept `handleLogin`.
- [ ] **Step 4:** Update `frontend/src/features/auth/view/LoginPage.tsx` to display the banner under the title.
- [ ] **Step 5:** Verify with `LOGIN_BYPASS = true` (empty inputs → tap "Sign in" → redirects to Home).
- [ ] **Step 6:** Verify with `LOGIN_BYPASS = false` (banner disappears → normal validation works).

---

> 🛑 **MANDATORY CHECKPOINT — STOPPING FOR USER REVIEW**
> Please review this implementation plan. Once you confirm or request adjustments, I will proceed with implementing the code.
