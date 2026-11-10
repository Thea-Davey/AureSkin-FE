# AureSkin — Multi-Page Revamp Implementation Plan
### Profile, Edit Profile, Register, Favorites, History & Home Pages

> **Scope & Standards Compliance:**
> Comprehensive implementation plan to execute visual refactoring, token standardization, and frontend-to-backend wiring across 5 core app areas adhering strictly to the [AureSkin Frontend Rules](file:///c:/Users/Thea/Documents/DLSUD/AureSkin/.agents/rules/frontend-rules.md), MVVM architecture, and design token system (`tailwind.config.js` and `src/shared/theme/index.ts`).

---

## 1. Objectives & Ground Truth Reference Mapping

| Area | Primary Files | Problem & Revamp Objective |
|---|---|---|
| **1. Profile & Edit Profile** | `ProfilePage.tsx`<br>`EditProfilePage.tsx`<br>`CloseButton.tsx` | - Replace custom close touchables with the global `CloseButton` component.<br>- Ensure `CloseButton` supports custom style positioning (`style?: StyleProp<ViewStyle>`).<br>- In `EditProfilePage`, wrap all 3 sections (*General Information*, *Account & Contact*, *Skin & Health Profile*) in the global `Card` component.<br>- Replace horizontal gender pills with a structured dropdown selector. |
| **2. Register Page & Auth Inputs** | `RegisterPage.tsx`<br>`AuthInput.tsx`<br>`useAuth.ts`<br>`auth_types.ts`<br>`backend/features/auth/*` | - Add new input fields on `RegisterPage`: Row 1 (*First Name*), Row 2 (*Last Name*), Row 3 (*Username*), followed by Email, Password, Confirm Password.<br>- Connect new fields through backend schemas, Supabase Auth user metadata (`data`), and `public.users` table sync so the user profile updates on sign up.<br>- Invert the password visibility toggle eye icon: slash eye (`EyeOff`) when hidden, open eye (`Eye`) when revealed. |
| **3. Favorites Page** | `FavoriteCard.tsx`<br>`FavoritesPage.tsx` | - Move labels inside the card boundary.<br>- Revamp local `FavoriteCard` to feature an integrated banner header flush with the top of the card (`rounded-t-card`), exactly matching **Reference Image 1**:<br>&nbsp;&nbsp;• **Product**: Tan/peach banner (`bg-secondary/25`), circular dot (`bg-secondary-dark`), label `PRODUCT`.<br>&nbsp;&nbsp;• **Ingredient**: Mint/green banner (`bg-note-positive`), circular dot (`bg-note-positive-element`), label `INGREDIENT`. |
| **4. History Page** | `HistoryListItem.tsx` | - Fix `bg-concern` color token application on the condition badge so it reliably renders `#F64343` with `style={{ backgroundColor: theme.colors.concern }}` and `text-neutral-white`. |
| **5. Home Page** | `AnalysisSummaryCard.tsx` | - In condition display list, shorten long condition strings:<br>&nbsp;&nbsp;• *"Inflammatory acne"* → **"Acne"**<br>&nbsp;&nbsp;• *"Enlarged pores"* → **"Pores"**<br>&nbsp;&nbsp;• Keep all other condition names intact. |

---

## 2. Visual Reference Asset (Image 1)

```
┌─────────────────────────────────────────────────────────────┐
│  • PRODUCT                                       [Optional] │  ← Warm Tan/Peach Banner (bg-secondary/25)
├─────────────────────────────────────────────────────────────┤
│  [Thumbnail]   Product Name                                 │  ← White Card Body (bg-card)
│                Brand Name                                   │
│                [Category Pill]                [★ Favorite]  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  • INGREDIENT                                    [Optional] │  ← Light Mint Banner (bg-note-positive)
├─────────────────────────────────────────────────────────────┤
│  Ingredient Name                              [★ Favorite]  │  ← White Card Body (bg-card)
│  Preview description text...                                │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Technical Breakdown by Feature

---

### Objective 1: Profile Page & Edit Profile Page Revamp

#### 1.1 CloseButton Global Component Enhancement
- **File:** `frontend/src/shared/components/CloseButton.tsx`
- **Current State:** Only accepts `className`, `iconSize`, `iconColor`, `accessibilityLabel`.
- **Target Changes:**
  - Add `style?: StyleProp<ViewStyle>` to `CloseButtonProps`.
  - Pass `style` directly to the underlying `Pressable` component alongside `className` to allow absolute positioning overrides (`style={[{ top: topInset + 4 }, style]}`).

```typescript
export interface CloseButtonProps {
  onPress: () => void;
  className?: string;
  style?: StyleProp<ViewStyle>;
  iconSize?: number;
  iconColor?: string;
  accessibilityLabel?: string;
}
```

#### 1.2 Profile Page Close Button Integration
- **File:** `frontend/src/features/profile/view/ProfilePage.tsx`
- **Target Changes:**
  - Remove manual `TouchableOpacity` with inline `X` icon.
  - Import and render `<CloseButton onPress={actions.closeProfile} accessibilityLabel="Close profile" className="absolute right-5 z-30" style={{ top: topInset + 4 }} />`.

#### 1.3 Edit Profile Page Section Containers (`Card`)
- **File:** `frontend/src/features/profile/view/EditProfilePage.tsx`
- **Target Changes:**
  - Replace manual `<TouchableOpacity>` close button with `<CloseButton onPress={profile.actions.cancel} accessibilityLabel="Back to profile" className="absolute right-5 z-30" style={{ top: topInset + 4 }} />`.
  - Import global `Card` from `@/shared/components/Card`.
  - Wrap the 3 profile sections with `<Card variant={1} className="p-4 mb-4">` (or `<Card style={1} className="p-4 mb-4">`):
    1. **General Information Card:**
       - Header: `<Text className="text-caption font-sans-bold text-secondary uppercase tracking-wider mb-3">GENERAL INFORMATION</Text>`
       - Children: First Name input, Last Name input, Username input, Date of Birth picker trigger, and Gender Dropdown.
    2. **Account & Contact Card:**
       - Header: `<Text className="text-caption font-sans-bold text-secondary uppercase tracking-wider mb-3">ACCOUNT & CONTACT</Text>`
       - Children: Email Address input, Phone Number input.
    3. **Skin & Health Profile Card:**
       - Header: `<Text className="text-caption font-sans-bold text-secondary uppercase tracking-wider mb-3">SKIN & HEALTH PROFILE</Text>`
       - Children: Allergen selector trigger, active allergen chips, and expanded allergen preset list & custom allergen input.

#### 1.4 Gender Dropdown Component
- **File:** `frontend/src/features/profile/view/EditProfilePage.tsx`
- **Target Changes:**
  - Replace horizontal badge pills (`GENDER_OPTIONS.map(...)`) with a dedicated dropdown selector.
  - Add state `isGenderDropdownOpen: boolean` (or manage via viewmodel).
  - **Closed State:**
    - A styled pressable input container: `rounded-input bg-card border border-border/60 px-4 py-3 flex-row items-center justify-between`.
    - Label: `text-body-sm font-sans text-text` showing selected gender or placeholder `"Select Gender"`.
    - Icon: `ChevronDown` (size 18, color `theme.colors.muted`).
  - **Open State:**
    - Icon flips to `ChevronUp`.
    - Drops down an options menu inside the card: `mt-2 border border-border/60 rounded-input bg-card overflow-hidden shadow-xs`.
    - Maps `GENDER_OPTIONS` (`'Female' | 'Male' | 'Non-binary' | 'Prefer not to say'`):
      - Active item: `bg-primary/10`, `font-sans-semibold text-primary`, checkmark icon.
      - Inactive item: `font-sans text-text`, active opacity on press.
      - Selecting an option updates draft gender and closes dropdown.

---

### Objective 2: Register Page & Auth Password Icon Revamp

#### 2.1 Password Visibility Eye Icon Inversion
- **File:** `frontend/src/features/auth/view/components/AuthInput.tsx`
- **Problem:** Currently, when hidden it displays an open eye (`Eye`), and when revealed it displays a slash eye (`EyeOff`).
- **Requirement:** *"slash eye when hidden, open eye when shown"*.
- **Implementation:**
  - When `!showPassword` (hidden): render `<EyeOff size={20} color={theme.colors.muted} />`.
  - When `showPassword` (shown): render `<Eye size={20} color={theme.colors.muted} />`.
  - Because `AuthInput` is shared by both `LoginPage` and `RegisterPage`, updating it solves both screens simultaneously.

```tsx
{isSecure && (
  <TouchableOpacity
    onPress={() => setShowPassword((prev) => !prev)}
    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
    activeOpacity={0.6}
    className="p-1"
  >
    {showPassword ? (
      <Eye size={20} color={theme.colors.muted} />
    ) : (
      <EyeOff size={20} color={theme.colors.muted} />
    )}
  </TouchableOpacity>
)}
```

#### 2.2 Register Page Form Expansion
- **File:** `frontend/src/features/auth/view/RegisterPage.tsx`
- **Target Layout Order:**
  1. `First Name` (Row 1)
  2. `Last Name` (Row 2)
  3. `Username` (Row 3)
  4. `Email`
  5. `Password`
  6. `Confirm Password`
  7. `Sign up` CTA Button

```tsx
<AuthInput
  placeholder="First Name"
  value={firstName}
  onChangeText={setFirstName}
  autoCapitalize="words"
  editable={!isLoading}
/>
<AuthInput
  placeholder="Last Name"
  value={lastName}
  onChangeText={setLastName}
  autoCapitalize="words"
  editable={!isLoading}
/>
<AuthInput
  placeholder="Username"
  value={username}
  onChangeText={setUsername}
  autoCapitalize="none"
  editable={!isLoading}
/>
<AuthInput
  placeholder="Email"
  value={email}
  onChangeText={setEmail}
  keyboardType="email-address"
  autoCapitalize="none"
  editable={!isLoading}
/>
<AuthInput
  placeholder="Password"
  value={password}
  onChangeText={setPassword}
  secureTextEntry
  editable={!isLoading}
/>
<AuthInput
  placeholder="Confirm Password"
  value={confirmPassword}
  onChangeText={setConfirmPassword}
  secureTextEntry
  editable={!isLoading}
  error={passwordMismatch}
  errorMessage="Passwords do not match"
/>
```

#### 2.3 Frontend Auth Model & ViewModel Wiring
- **Files:**
  - `frontend/src/features/auth/model/auth_types.ts`:
    ```typescript
    export interface RegisterRequest {
      email: string;
      password: string;
      first_name?: string;
      last_name?: string;
      username?: string;
    }
    ```
  - `frontend/src/features/auth/viewmodel/useAuth.ts`:
    - Add state: `firstName`, `setFirstName`, `lastName`, `setLastName`, `username`, `setUsername`.
    - Update `handleRegister`:
      - Validate `firstName`, `lastName`, `username` alongside `email` and `password`.
      - Send `{ email, password, first_name: firstName.trim(), last_name: lastName.trim(), username: username.trim() }` to `authApi.register`.
      - In fallback `supabase.auth.signUp`:
        ```typescript
        const displayName = `${firstName} ${lastName}`.trim() || username;
        await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName.trim(),
              last_name: lastName.trim(),
              username: username.trim(),
              display_name: displayName,
            },
          },
        });
        ```

#### 2.4 Backend Auth Schemas, Service & Repository Wiring
- **Files:**
  - `backend/features/auth/auth_schemas.py`:
    ```python
    class RegisterRequest(BaseModel):
        email: EmailStr
        password: str = Field(..., min_length=6, description="Password must be at least 6 characters")
        first_name: Optional[str] = None
        last_name: Optional[str] = None
        username: Optional[str] = None
    ```
  - `backend/features/auth/auth_router.py`:
    Pass `body.first_name`, `body.last_name`, `body.username` into `service.register()`.
  - `backend/features/auth/auth_service.py`:
    Accept `first_name`, `last_name`, `username` and pass to `repository.register()`.
  - `backend/features/auth/auth_repository.py`:
    - Build Supabase `options.data` user metadata:
      ```python
      user_meta = {}
      if first_name: user_meta["first_name"] = first_name
      if last_name: user_meta["last_name"] = last_name
      if username: user_meta["username"] = username
      display_name = f"{first_name or ''} {last_name or ''}".strip() or username
      if display_name: user_meta["display_name"] = display_name
      
      payload = {"email": email, "password": password}
      if user_meta:
          payload["options"] = {"data": user_meta}
      response = self.supabase.auth.sign_up(payload)
      ```
    - Also upsert row in `public.users` table so profile information is instantly available across all queries:
      ```python
      if response.user:
          try:
              self.supabase.table("users").upsert({
                  "id": str(response.user.id),
                  "email": email,
                  "display_name": display_name or None,
              }).execute()
          except Exception as e:
              logger.warning(f"Could not upsert public.users for {email}: {e}")
      ```

---

### Objective 3: Favorites Page Card Headers Revamp

#### 3.1 Card Architecture & Reference Alignment
- **File:** `frontend/src/features/favorites/view/components/FavoriteCard.tsx`
- **Problem:** Currently, category labels are rendered as external floating header views above separate `IngredientCard` / `ProductCard` components.
- **Reference Image 1 Alignment:**
  - Create a single cohesive `<Card style={2} className="mx-5 mb-3 overflow-hidden p-0 items-stretch">`.
  - The top header banner is rendered **inside** the card container, with `rounded-t-card`, top-level flush border, and custom tint:
    - **Product Banner:**
      - Background: `bg-secondary/25` (warm peach/tan matching image 1).
      - Border: `border-b border-border/40`.
      - Leading Indicator: `w-2 h-2 rounded-full bg-secondary-dark` (or `#8C5835`).
      - Title: `text-caption font-sans-bold text-secondary-dark uppercase tracking-wider` displaying `"PRODUCT"`.
      - Trailing Subtext: `text-caption font-sans-medium text-muted` displaying product brand.
    - **Ingredient Banner:**
      - Background: `bg-note-positive` (light mint/green matching image 1).
      - Border: `border-b border-note-positive-border`.
      - Leading Indicator: `w-2 h-2 rounded-full bg-note-positive-element` (or `bg-primary`).
      - Title: `text-caption font-sans-bold text-note-positive-title uppercase tracking-wider` displaying `"INGREDIENT"`.
      - Trailing Subtext: `text-caption font-sans-medium text-muted` displaying primary compatible skin type.
  - Below the header banner, the card body contains:
    - For **Product**: Thumbnail image (`rounded-button bg-secondary/15`), product name, brand, category pill, compatibility badge, and interactive animated favorite star.
    - For **Ingredient**: Full ingredient name, full-width preview description (up to 3 lines), compatibility badge, and interactive animated favorite star.

---

### Objective 4: History Page Condition Badge (`bg-concern`)

#### 4.1 Condition Badge Background Fix
- **File:** `frontend/src/features/history/view/components/HistoryListItem.tsx`
- **Problem:** The condition badge at line 104 (`<View key={condition} className="rounded-badge bg-concern px-3 py-0.5">`) fails to apply the intended `#F64343` background color.
- **Root Cause & Fix:**
  - In React Native / NativeWind, standalone root custom colors like `concern` may not resolve reliably across all build variants without explicit inline fallback.
  - Standardize condition badges in `HistoryListItem.tsx` by providing both the Tailwind utility class and explicit theme color style:
    ```tsx
    {visibleConditions.map((condition) => (
      <View
        key={condition}
        style={{ backgroundColor: theme.colors.concern }}
        className="rounded-badge bg-concern px-3 py-0.5"
      >
        <Text className="text-caption font-sans-medium capitalize text-neutral-white">
          {condition}
        </Text>
      </View>
    ))}
    ```
  - Verify that `theme.colors.concern` (`#F64343`) is imported from `@/shared/theme` and matches `tailwind.config.js`.

---

### Objective 5: Home Page Condition Name Shortening

#### 5.1 AnalysisSummaryCard Condition Formatter
- **File:** `frontend/src/features/home/view/components/AnalysisSummaryCard.tsx`
- **Problem:** Full condition names such as *"Inflammatory acne"* and *"Enlarged pores"* overflow or clutter the compact Home screen summary card.
- **Requirement:** Shorten **only** these two condition strings:
  - *"Inflammatory acne"* → **"Acne"**
  - *"Enlarged pores"* → **"Pores"**
- **Implementation:**
  - Add a pure helper function:
    ```typescript
    function formatConditionName(condition: string): string {
      const normalized = condition.trim().toLowerCase();
      if (normalized === 'inflammatory acne') {
        return 'Acne';
      }
      if (normalized === 'enlarged pores') {
        return 'Pores';
      }
      return condition;
    }
    ```
  - Apply `formatConditionName(condition)` when rendering each condition text item inside `AnalysisSummaryCard`:
    ```tsx
    <Text
      numberOfLines={1}
      style={{ color: theme.colors.concern }}
      className="text-caption font-sans-bold text-concern flex-1"
    >
      {formatConditionName(condition)}
    </Text>
    ```

---

## 4. Token & Architecture Compliance Checklist (`aureskin-frontend-rules`)

- [x] **No hardcoded arbitrary font sizes** (`text-[13px]`, `text-[22px]`); strictly use `text-display`, `text-h1`, `text-h2`, `text-h3`, `text-body`, `text-body-sm`, `text-caption`, `text-label`.
- [x] **No hardcoded arbitrary border radii** (`rounded-[14px]`); strictly use `rounded-card`, `rounded-button`, `rounded-input`, `rounded-badge`, `rounded-full`.
- [x] **No un-prefixed font weight classes** (`font-bold`, `font-medium`); strictly use `font-sans`, `font-sans-medium`, `font-sans-semibold`, `font-sans-bold`, or `font-heading`.
- [x] **No inline hex color codes** for JS props; strictly import `theme.colors.*` from `@/shared/theme`.
- [x] **Note & Badge Tokens:** `bg-note-positive`, `border-note-positive-border`, `text-note-positive-title`, `text-note-positive-element`, `bg-concern`, `text-concern`, `text-neutral-white`.
- [x] **MVVM Boundary:** State, form validation, and network requests stay within ViewModels (`useAuth`, `useEditProfile`, `useProfile`) and Models (`auth_api`, `profile_api`); Views remain purely declarative.

---

## 5. Verification & Testing Steps

1. **Profile & Edit Profile:**
   - Open Profile page; tap top-right `CloseButton` → returns cleanly to previous screen.
   - Navigate to Edit Profile; verify top-right `CloseButton` works and triggers discard prompt if changes exist.
   - Verify each of the 3 sections is enclosed in a rounded `Card` container.
   - Open Gender dropdown; verify smooth open/close, correct option selection, and proper persistence on save.
2. **Register & Auth:**
   - Open Register page; verify 6-field layout order: First Name, Last Name, Username, Email, Password, Confirm Password.
   - Toggle password eye icon on both Login and Register pages: ensure slash eye (`EyeOff`) is visible when hidden, open eye (`Eye`) when revealed.
   - Submit new user registration; inspect Supabase user metadata and `public.users` to confirm `first_name`, `last_name`, `username`, and `display_name` are populated and immediately visible in Profile.
3. **Favorites Page:**
   - Navigate to Favorites tab; verify that both Product and Ingredient cards feature top banners inside the card matching Image 1.
   - Confirm PRODUCT banner has peach/tan background with bullet dot; confirm INGREDIENT banner has mint/green background with bullet dot.
4. **History Page:**
   - Open History page list; verify all condition badges display vibrant red `#F64343` background with white text.
5. **Home Page:**
   - Scan or load account with detected conditions; verify *"Inflammatory acne"* displays as *"Acne"* and *"Enlarged pores"* displays as *"Pores"*, while other conditions remain untouched.

