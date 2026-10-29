# Add Product Form Implementation Plan (§3.7)

> **Document Type:** Screen Architecture & Implementation Plan  
> **Target Screen:** Add Product Form  
> **UI Doc Reference:** `design_references/ui_design_reference.md` §3.7  
> **Visual Reference:** `design_references/library_add_product_form.png`  
> **Feature Domain:** `src/features/library/`  
> **Proposed Route:** `/library/add-product-form`  
> **Status:** Form UI and camera/photo handoff implemented. Demo-mode in-memory product creation is available; live upload and backend product creation remain blocked pending contract confirmation.

## Implementation Status

- Implemented the Add Product route and editable local draft for product name, the reference's initial ordered ingredient labels, and description. The form matches the supplied reference: sage header, terracotta actions, product-name card, stacked ingredient rows, and no brand/category fields.
- Camera capture and system-picker selections can continue to the form. The local photo URI is retained in the draft for the pending submission flow; the current reference form does not display a photo preview.
- Cancel/close warns before discarding a changed draft.
- In `USE_MOCK` mode, submit validates the required name and at least one ingredient, creates an in-memory demo product, refreshes the mock Products query, and shows a clearly labeled “Demo product added!” confirmation. The mock product is visible in the Products catalog for the current app session only; it is not uploaded or saved to the backend and is lost when the app reloads.
- Live product upload and backend creation remain disabled. The technical reference contains an illustrative `ProductCreateRequest` with required `name`, `brand`, `category`, and `ingredients: string[]`. It does not confirm the deployed response contract, optional `description`/`image_url` support, ingredient-resolution behavior, or `product-images` write policy/path. Confirm these before implementing persistence.
- The technical reference contains an illustrative `ProductCreateRequest` with required `name`, `brand`, `category`, and `ingredients: string[]`. It does not confirm the deployed response contract, optional `description`/`image_url` support, ingredient-resolution behavior, or `product-images` write policy/path. Confirm these before implementing persistence.

## 1. Overview & Reference Mapping

The Add Product Form lets a user review a product image, enter product details, edit its ingredient list, optionally add a description, and submit a community product to the Library. It is the continuation of the camera (§3.5) and upload (§3.6) flows. A successful create must show the Product Added confirmation (§3.8) and return to the refreshed Products tab.

The UI reference specifies a product name, ingredient tags, optional description, product image, and submission. The project overview and existing product catalog model additionally include brand and category; include those fields so a created product can be represented and filtered consistently in the existing Library.

| Item | Decision |
|---|---|
| Target screen | Add Product Form (§3.7) |
| UI reference | `design_references/ui_design_reference.md` §3.7 |
| Visual reference | `design_references/library_add_product_form.png` |
| Feature folder | `src/features/library/` |
| Entry point | New Expo Router route `src/app/library/add-product-form.tsx` |
| Entry actions | Camera capture or successful image selection from §3.6 |
| Image handoff | Pass the local photo URI as a route parameter named `imageUri`; the form owns it until upload/submission finishes |
| Shared app shell | Full-screen route outside the tab group, using the existing root stack and Library visual tokens |
| Success behavior | Show §3.8 confirmation after the product is actually created; then return to the Products tab and refresh its React Query catalog |
| Scope boundary | Product form, validation, photo upload, product creation, and success feedback only. OCR/ingredient recognition and backend schema changes are excluded. |

### Existing architecture and constraints

- Library screens follow the feature MVVM structure: typed model/API functions, a ViewModel hook for orchestration, and view components for layout.
- Expo Router routes live under `src/app/`. The Library camera and upload routes already live outside `(tabs)` so their screens can cover the tab bar.
- `library_api.ts` uses the shared authenticated Axios `api` client and a `USE_MOCK` switch. `src/shared/services/supabase.ts` exports the authenticated Supabase client.
- The project documentation describes `products`, `product_ingredients`, and the public-read `product-images` storage bucket. Its illustrative POST schema specifies `name`, `brand`, `category`, and `ingredients: string[]`, but does not confirm the deployed response, optional `description`/`image_url` support, ingredient-resolution behavior, or storage write policy/path.
- Do not show a persistence-success state or discard a photo unless the backend confirms persistence. An explicitly labeled in-memory demo result is permitted only while `USE_MOCK` is enabled.
- The product form must not use face-scan submission, scan models, scan mock data, or the `/scan/*` routes.

## 2. Backend and Data-Contract Gates

Resolve these contracts before implementing a live submission. Do not invent a client payload or directly insert into undocumented tables.

### Product creation endpoint

Confirm the `POST /products` request and response contract with the backend, including:

- Required and optional product fields (`name`, `brand`, `category`, `description`, `image_url`).
- Whether the backend sets `is_user_added` and `added_by` from the authenticated user or expects these fields from the client. Prefer server-derived ownership.
- How ingredient associations are submitted: canonical ingredient IDs plus label order, raw ingredient names for server resolution, or another documented format.
- Validation/error envelope and whether the response returns the newly created normalized product and its ingredients.
- Whether a duplicate product is rejected, accepted, or merged.

### Ingredient resolution

The database schema describes `product_ingredients.ingredient_id` as a foreign key to the shared ingredient catalog. The technical reference's request example accepts ingredient strings, but does not explain how the service resolves labels or reports unmatched terms.

- Prefer a documented ingredient-search/select interaction backed by `fetchIngredients`; store the canonical ingredient ID, display name, and tag order for each selected ingredient.
- If the product contribution API accepts raw ingredient label text and resolves it server-side, use that documented contract instead and preserve the label order.
- Do not insert user text into the curated `ingredients` knowledge base from the client.
- Confirm whether unmatched label terms may be submitted, and how the server reports them. Until then, do not silently discard or falsely represent an unmatched term as a known ingredient.

### Image Storage

The documented `product-images` bucket is public-read, but its upload/write policy and path convention are unspecified.

- Confirm authenticated write policy, permitted MIME types, maximum size, and whether the bucket accepts user-scoped object paths.
- Use a user-scoped, collision-resistant path and the existing authenticated `supabase` client after confirming the supported Expo SDK 58 upload format for local image-picker/camera URIs.
- Set content type from validated picker/camera metadata or a safe extension map; do not assume every URI is JPEG.
- Persist only the returned public `image_url`, never the local device URI.
- If upload succeeds but product creation fails, attempt to remove the uploaded object and surface cleanup failures; never show a success-shaped fallback.
- If a photo is optional under the confirmed API contract, allow form submission without one. If it is required, validate before starting upload.

## 3. Complete Proposed File Tree

```text
src/
├── app/
│   ├── _layout.tsx                                  # Register Add Product Form route
│   └── library/
│       └── add-product-form.tsx                     # Expo Router route wrapper
└── features/library/
    ├── model/
    │   ├── library_types.ts                         # Form draft, ingredient selection, and create contracts
    │   └── library_api.ts                           # Validated createProduct API function
    ├── viewmodel/
    │   └── useAddProduct.ts                         # Route input, editable draft, validation, upload/create and status
    └── view/
        ├── AddProductPage.tsx                       # Keyboard/safe-area-aware form screen
        └── components/
            ├── AddProductImagePreview.tsx            # Selected photo preview, replace/remove action
            ├── ProductIngredientEditor.tsx           # Search/select known ingredients and ordered removable tags
            └── ProductAddedConfirmation.tsx          # §3.8 success overlay after confirmed create
```

### Existing integration points

- `src/features/library/viewmodel/useAddProductCamera.ts`
  - On successful capture, navigate to the form with the captured local URI.
  - When `selectedPhotoUri` is returned from the §3.6 system picker, provide a continuation action to open the form with that URI.
  - Keep errors visible and do not claim capture is saved before submission.
- `src/features/library/viewmodel/useAddProductUpload.ts`
  - Continue returning the chosen local URI to the camera. The camera then offers the form transition.
- `src/features/library/view/LibraryPage.tsx`
  - Preserve the Products list under the pushed form route.
  - Provide a refresh/invalidation action for the catalog after confirmed success; keep the active Products tab and existing list state.
- `src/features/library/viewmodel/useProducts.ts`
  - Reuse the existing `['library', 'products', ...]` query-key family; invalidate/refetch the catalog only after confirmed create.
- `src/app/_layout.tsx`
  - Register the new full-screen form route and choose a forward transition consistent with the camera/upload routes.

## 4. Data Contracts

Use explicit contracts and normalize before sending data:

```ts
export interface AddProductIngredientDraft {
  id: string;
  name: string;
  order: number;
}

export interface AddProductDraft {
  name: string;
  brand: string;
  category: ProductCategory;
  description: string;
  ingredients: AddProductIngredientDraft[];
  imageUri: string | null;
}
```

The create request/response types must match the confirmed backend contract. Do not define a request as a cast of the draft or reuse `ProductDetail` as a create payload. Remove `imageUri` from the API payload after it is uploaded and replace it with the returned `image_url`.

Normalize strings with trimming, require a non-empty product name, preserve ingredient order, and reject duplicate ingredient IDs or empty/invalid values before upload. The exact required fields and category enum must match backend validation and the existing `ProductCategory` vocabulary.

## 5. Form UI and Interactions

### Header and image

- Use the UI title **“Scanned Ingredients”** unless the visual reference or product owner confirms a different label; the screen remains a manually editable contribution form and must not imply OCR succeeded.
- Provide an accessible close action and a secondary Cancel action. Both return to the Products tab without saving; if the draft has been modified, ask for confirmation before discarding it.
- Show the selected camera/gallery image in a preview. Provide a replace-photo action that returns to the product camera/upload flow, and a remove-photo action only if the confirmed API allows an image-less product.
- If no `imageUri` is provided (for example, direct route entry), show a neutral image placeholder and keep the form usable when images are optional.

### Product details

- Product name: required editable text field.
- Brand: editable field consistent with the product catalog's nullable `brand`.
- Category: selectable value using the existing supported product categories (`cleanser`, `toner`, `moisturizer`, `sunscreen`, `serum`, `other`), with visible labels and no free-form category unless the backend confirms it.
- Ingredients: ordered chips/tags with canonical selected ingredient records. Provide ingredient search/add and per-tag remove/reorder or explicit ordered entry behavior. If manual order is required, preserve the order in the create contract.
- Description: optional expandable multiline field.
- Keyboard handling: inputs remain visible while editing; scroll to focused fields and avoid the keyboard covering the primary action.

### Submission controls

- Primary CTA label: **“Add Skincare Product”**.
- Secondary CTA: **“Cancel”**.
- Disable duplicate submissions; show an `ActivityIndicator` and clear progress copy during image upload and product creation.
- Surface validation and service failures inline with a retry path. Preserve the user's draft and selected local photo after failure.
- Do not navigate to success until both required image upload and product creation have succeeded.

## 6. ViewModel and Submission Sequence

`useAddProduct` should own the form draft, image URI, ingredient selection, validation state, submission state, and navigation actions. Keep UI components presentational.

Successful submission sequence:

1. Validate the entire draft and the confirmed ingredient rules before performing network work.
2. If an image is present and the backend requires a public URL, upload it to `product-images` using the confirmed authenticated path/policy.
3. Build the exact typed POST body using normalized fields, canonical ingredient data, label order, and the uploaded public image URL.
4. Call the documented `POST /products` through the shared `api` client.
5. Validate the response envelope and the returned product identity/required fields.
6. Invalidate the Library products catalog query.
7. Present the §3.8 confirmation overlay; after its documented timeout or user dismissal, return to the mounted Products tab.

Failure behavior:

- Validation errors do not start an upload or create request.
- Upload errors retain the draft and show an explicit retry message.
- Create errors retain the draft. If an image was uploaded, attempt cleanup as described in §2 and report cleanup failure separately if needed.
- Never silently fall back to mock success when `USE_MOCK` is enabled. If a mock create mode is needed for development, keep it explicitly controlled by the existing Library data-source switch and visibly distinguish it from a live persisted product.

## 7. Success Overlay (§3.8) Integration

- Display “Product added!” and a checkmark only after a validated create response.
- Auto-dismiss after the UI document's 1.5–2 second interval, with an accessible way to dismiss early if consistent with existing modal behavior.
- Return to the existing Products tab and refresh the product catalog so the submitted product appears.
- Do not invalidate the catalog for failed or canceled submissions.

## 8. Screen States

| State | Expected behavior |
|---|---|
| Initial | Form populated from route image URI if present; remaining fields editable |
| Ingredient search | Loading, results, no-match, and request-error states using the existing ingredient API |
| Validation error | Field-level or inline explanation; no network submission |
| Uploading image | Primary action disabled with progress feedback |
| Creating product | Primary action remains disabled with progress feedback |
| Submission error | Inline actionable message; draft and photo remain available |
| Success | §3.8 confirmation; return to refreshed Products tab |
| Cancel/close | Return without saving; confirm before discarding a changed draft |

## 9. Validation Plan

- Verify backend POST, ingredient mapping, storage path/policy, and response/error contracts before live API implementation.
- Unit-test input normalization, required-field validation, tag ordering, and duplicate prevention.
- Test successful image upload + create, image-less create when permitted, upload failure, POST failure with cleanup, and retry without draft loss.
- Verify route handoff from both camera capture and system picker selection, including encoded local URIs.
- Confirm cancellation returns to Products and does not create records or invalidate catalog queries.
- Run targeted ESLint and TypeScript checks on changed Library files; note existing unrelated repository-wide diagnostics separately.
- Run `npx expo export --platform web` and test the form on Android Expo Go/device and iOS if available.

## 10. Acceptance Criteria

- The form receives and previews the camera/upload local URI without treating it as a persistent URL.
- User can enter a name, brand, category, ordered ingredient list, and optional description according to the confirmed API rules.
- Ingredient chips map to canonical catalog IDs or a documented server-side text-resolution contract.
- Image upload and product creation use documented authenticated contracts and report failures explicitly.
- Product creation success feedback is truthful and only appears after confirmed persistence.
- Catalog refresh happens after success; cancel/failure leaves catalog state unchanged.
- Product creation never invokes skin-scan APIs or fabricates an uploaded image/product.

## 11. Review Checkpoint

The plan has been approved and the form UI/handoff work is implemented. Before live submission, confirm the deployed create request/response, ingredient-resolution behavior, and image storage write policy/path. If those contracts cannot be confirmed, keep persistence disabled rather than guessing.
