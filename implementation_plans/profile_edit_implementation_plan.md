# Edit Profile Page Implementation Plan (§8.2)

> **Document Type:** Screen Architecture & Implementation Plan  
> **Target Screen:** Edit Profile Page  
> **UI Doc Reference:** `design_references/ui_design_reference.md` §8.2  
> **Visual Reference:** `design_references/edit_profile.png`  
> **Feature Domain:** `src/features/profile/`  
> **Proposed Route:** `/edit-profile`  
> **Status:** Edit Profile route and local-preview UI implemented. Profile persistence, avatar upload, and password change remain unavailable pending backend contracts.

## Implementation Status

- Added `/edit-profile`, wired the Profile page's Edit Profile button and Age/Pregnant/Allergen rows to it, and registered the route.
- Added the form UI for first/last name, age, username, pregnancy status, allergen tags, and avatar selection/preview.
- Initial values are read only from explicit Supabase user metadata fields. Unsupported profile values remain blank/unset rather than being fabricated or inferred from unrelated data.
- The image picker uses Expo's system picker and retains only a local preview.
- Save Changes currently explains that edits are not saved; it does not call `PUT /profile`, upload an avatar, or show success. Change Password explains that the flow is not configured.
- The profile API documents only display name/avatar updates, while schema/storage requirements for the other fields and private avatar bucket are missing. Confirm these before connecting persistence.

## 1. Overview & Reference Mapping

The Edit Profile Page lets an authenticated user update account/profile information, choose a profile photo, access a password-change flow, save validated changes, or cancel back to Profile (§8.1).

| Item | Decision |
|---|---|
| Target screen | Edit Profile Page (§8.2) |
| UI reference | `design_references/ui_design_reference.md` §8.2 |
| Visual reference | `design_references/edit_profile.png` |
| Feature folder | `src/features/profile/` |
| Route | Existing root route `src/app/edit-profile.tsx` to be added |
| Entry point | Edit Profile action on `src/features/profile/view/ProfilePage.tsx` |
| Presentation | Full-screen route outside `(tabs)`, consistent with `profile.tsx` and `ModalHeader` |
| Form fields | First name, last name, age, username, pregnant status, allergen(s), avatar |
| Persistence | Authenticated `PUT /profile`; use the shared Axios `api` client after confirming the deployed request/response contract |
| Photo selection | Existing `expo-image-picker` system picker; private `avatars` bucket contract must be confirmed before upload |
| Scope boundary | Edit profile UI, validation, confirmed profile persistence, photo selection/upload, password-flow entry point. Profile overview behavior changes and backend schema migrations are excluded. |

### Existing architecture and constraints

- `src/app/profile.tsx` routes to `src/features/profile/view/ProfilePage.tsx`; the profile feature currently has no edit route, model/API adapter, or ViewModel.
- `ProfilePage` currently reads the Supabase Auth user directly and renders a mostly static skin overview/profile information. Its Edit Profile button is not wired to navigation.
- `src/shared/components/ModalHeader.tsx` provides the shared green safe-area header and default back behavior.
- `src/shared/services/api.ts` exports the authenticated Axios `api` client and attaches the current Supabase access token.
- `src/shared/store/authStore.ts` exposes the current Supabase `User` and session; auth metadata currently provides only a provisional display name/avatar fallback.
- Technical documentation describes authenticated `GET /profile` and `PUT /profile`, but only documents `display_name` and `avatar` updates. The database `users` table documents `display_name` and `avatar_url`; it does not document first/last name, age, username, pregnant, or allergen columns.
- The `avatars` bucket is documented as private, but upload path conventions, write policies, MIME/size limits, and URL/signing behavior are unspecified.
- Do not submit undocumented fields or silently persist them to arbitrary Supabase columns. Do not represent a local photo URI as a saved avatar URL.
- Password change is a separate authentication/security operation. Do not implement it as a profile `PUT`; connect only to a confirmed password-change flow.

## 2. Backend and Data-Contract Gates

Resolve these requirements before enabling live writes.

### Profile API

Confirm the deployed `GET /profile` and `PUT /profile` contracts:

- Response envelope and canonical profile field names/types.
- Whether `display_name` is the supported name field, or whether first and last names are separately stored.
- Whether `username`, `age`, `pregnant`, and `allergen` are supported by the deployed API and persisted schema.
- Required/optional fields, nullability, range/format constraints, partial-update semantics, and validation-error format.
- Whether a successful update returns the normalized profile and whether it updates Supabase Auth metadata as well as the profile table.
- Username uniqueness and conflict behavior, if username is supported.
- Age representation and permitted range; pregnancy status semantics; allergen representation (string, list, IDs, or structured values).

### Avatar storage

Confirm before upload is implemented:

- Authenticated write policy for the private `avatars` bucket.
- User-scoped object-path convention and whether replacement should overwrite or generate a new path.
- Allowed MIME types and maximum file size/dimensions.
- How private avatar images are read by Profile and Edit Profile (signed URL, authenticated download, or another documented mechanism).
- Whether the profile endpoint accepts a storage object path, signed URL, or other avatar reference.
- Cleanup policy for replaced images and behavior when the profile update fails after upload.

The selected picker URI must remain local draft state until upload succeeds. Persist only the API/storage reference required by the confirmed contract.

### Password change

Confirm the supported password-change route/API and required verification (current password, email confirmation, or reauthentication). If not available, show an explicit unavailable message or disabled action; do not make a nonfunctional button appear successful.

## 3. Proposed File Tree

```text
src/
├── app/
│   └── edit-profile.tsx                       # Expo Router route wrapper
└── features/profile/
    ├── model/
    │   ├── profile_types.ts                   # Normalized profile, draft, update request/response
    │   └── profile_api.ts                     # Contract-validated GET/PUT profile adapters
    ├── viewmodel/
    │   └── useEditProfile.ts                  # Load, draft, validation, picker, save, cancel
    └── view/
        ├── EditProfilePage.tsx                # Form screen
        └── components/
            ├── ProfileAvatarEditor.tsx         # Avatar preview and image-picker action
            ├── ProfileField.tsx               # Reusable labeled field if consistent with existing patterns
            ├── PregnancyStatusPicker.tsx      # Yes/No selector
            └── AllergenPicker.tsx             # Confirmed selection or multi-value editor
```

### Existing integration points

- `src/features/profile/view/ProfilePage.tsx`
  - Navigate from Edit Profile to `/edit-profile`.
  - Replace any static profile values with fetched canonical values only when the profile API contract is available; this plan does not require that separate §8.1 migration.
- `src/shared/components/ModalHeader.tsx`
  - Reuse the shared title/back header, with title “Edit Profile.”
- `src/app/_layout.tsx`
  - Register `edit-profile` with a forward slide transition.
- `src/shared/store/authStore.ts`
  - After confirmed update, synchronize only the documented Supabase user metadata/session fields if required by the API contract. Do not mutate auth state optimistically to imply persistence.
- `src/shared/services/api.ts`
  - Use the shared authenticated client for confirmed profile API requests.

## 4. Data Contracts and Form State

Define app-owned normalized models only after mapping to the confirmed API contract. Proposed UI draft:

```ts
export interface EditProfileDraft {
  firstName: string;
  lastName: string;
  age: string;
  username: string;
  pregnant: boolean | null;
  allergens: string[];
  avatarUri: string | null;
}
```

The request type must use the exact backend field names and accepted values. Do not cast this UI draft directly into the request or invent fields based on the visual spec.

Normalization and validation:

- Trim first name, last name, and username.
- Validate age as a whole number using backend-confirmed bounds; reject invalid or empty values according to the contract.
- Require an explicit Yes/No value for pregnancy only if the API requires it; distinguish unset/null from “No.”
- Normalize allergens according to the confirmed API representation, de-duplicate selections, and preserve the display order if meaningful.
- Compare normalized draft to initial profile to determine dirty state and disable Save Changes when unchanged.
- Validate all fields before upload or API mutation; keep field-specific errors next to the relevant controls.

## 5. UI and Interaction Plan

### Header and avatar

- Use the shared `ModalHeader` with title **“Edit Profile”**.
- Center the current avatar near the top, with a circular pencil action overlapping the lower-right edge.
- Display the existing avatar or a neutral initials/person placeholder; do not use a remote fallback portrait as though it belongs to the user.
- Tapping the pencil opens the system image picker (`expo-image-picker`) without broad media-library permission requests.
- Show the selected local image immediately as an unsaved preview and retain it if save fails.
- Do not add a custom gallery grid.

### Fields

- First Name and Last Name: prefilled text inputs when supported by the confirmed profile response; otherwise map a single `display_name` only if a documented split/merge rule is provided.
- Age: numeric keyboard and field-level validation.
- Username: text input with appropriate capitalization/autocorrect settings and documented uniqueness feedback.
- Pregnant: accessible Yes/No selector; avoid a default that could imply a personal health answer when no value is known.
- Allergen: picker/editor reflecting the actual API type. Support multiple values only if backend supports a list.
- Keep keyboard-aware scrolling so lower fields and primary actions are reachable on mobile.

### Actions and feedback

- **Change Password**: navigate to a confirmed password-change screen/modal. If none exists, explain that the feature is not available yet; do not silently no-op.
- **Save Changes**: primary full-width action, disabled when unchanged or while submitting; display a spinner and progress label while saving.
- **Cancel**: outlined secondary action; pop back without persisting. If the draft is dirty, confirm before discarding.
- Show a success toast **“Profile updated!”** only after a validated successful response; then navigate back to Profile.
- Surface API/upload errors explicitly and preserve the local draft for retry.

## 6. ViewModel and Submission Sequence

`useEditProfile` should own the initial profile load, editable draft, dirty/validation state, image-picker lifecycle, save status, and navigation actions. Keep the screen components presentational.

Successful save sequence:

1. Load and validate the user's current profile using the confirmed source of truth.
2. Initialize the draft from normalized profile data; do not prefill unsupported fields with plausible-looking defaults.
3. Validate changed fields against the confirmed backend rules.
4. If a new avatar was selected, upload it using the confirmed private bucket policy, object path, and Expo SDK-supported file format.
5. Submit the exact typed request to authenticated `PUT /profile`.
6. Validate the response and use returned canonical data; update auth/profile cache only as specified by the contract.
7. Show the success toast and navigate back to Profile.

Failure behavior:

- Validation errors start no upload or PUT.
- Picker cancellation leaves the current draft unchanged and is not an error.
- Upload or PUT failures retain all edits and selected local photo.
- If upload succeeds but profile update fails, follow the confirmed cleanup/retry policy and report cleanup failure distinctly.
- Never show success or update canonical user state before a validated API response.
- Avoid duplicate submissions; guard the save handler and disable controls during pending work.

## 7. Screen States

| State | Expected behavior |
|---|---|
| Initial loading | Show a form skeleton or centered progress state while canonical profile loads |
| Load error | Explain the profile could not be loaded and offer retry; do not render a fabricated editable profile |
| Ready, unchanged | Prefilled confirmed values; Save Changes disabled |
| Editing | Update draft and show unsaved state; picker image shown only as local preview |
| Validation error | Field-level messages; no network or storage calls |
| Avatar selection | System picker; cancellation preserves prior draft/photo |
| Uploading | Save disabled with explicit progress feedback |
| Saving | Save disabled with progress feedback |
| Save error | Error displayed; draft preserved for retry |
| Success | Toast and return to Profile with confirmed updated data |
| Cancel/close | Pop to Profile; confirm if changed draft would be discarded |
| Password change unavailable | Explicit unavailable information; no fake navigation or success |

## 8. Validation Plan

- Confirm API, user schema, avatar storage policy, and password-change contracts before implementing persistence.
- Unit-test normalization, age validation, dirty detection, allergen de-duplication, and request mapping.
- Test missing/unsupported profile fields and ensure no guessed defaults are submitted.
- Test picker selection/cancel, upload failure, PUT failure after upload, retry without draft loss, and duplicate-submit prevention.
- Verify auth/profile cache synchronization after a real response and no optimistic success on error.
- Verify password-change action follows the confirmed flow or clearly reports unavailable status.
- Run targeted ESLint and TypeScript checks, then the project's appropriate build/export; verify on Android/iOS if available.

## 9. Acceptance Criteria

- Edit Profile opens from Profile and displays canonical current values.
- User can edit only fields supported by the confirmed API/schema.
- Avatar selection uses the system picker and does not request broad library access.
- Save submits only documented fields and only reports success after confirmed persistence.
- Validation and service errors are visible and do not discard the user's draft.
- Cancel returns to Profile without saving and confirms before discarding changed data.
- Password change never routes to a nonexistent screen or pretends to update a password.
- No local photo URI or mock fallback is represented as persisted profile data.

## 10. Review Checkpoint

This is a plan-only artifact. Before live implementation, confirm the profile API fields and response, persistence for age/username/pregnancy/allergens, avatar upload/read policy for the private bucket, and password-change flow. If these contracts are unavailable, build only the UI or explicitly labeled demo behavior; do not guess the real request or storage policy.
