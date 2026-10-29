# Add Product Success Overlay Implementation Plan (§3.8)

> **Document Type:** Screen Architecture & Implementation Plan  
> **Target Screen:** Add Product Success Overlay  
> **UI Doc Reference:** `design_references/ui_design_reference.md` §3.8  
> **Visual Reference:** `design_references/library_add_product_success.png`  
> **Feature Domain:** `src/features/library/`  
> **Presentation:** Transparent modal overlay owned by the Add Product Form  
> **Status:** Confirmation modal component implemented; integration remains gated on verified product persistence.

## Implementation Status

- Implemented the reusable accessible modal UI with dimmed backdrop, green checkmark, spring entry, 1.5-second auto-dismiss, backdrop dismissal, Android back handling, and timer cleanup.
- In `USE_MOCK` mode, the component is wired to the in-memory demo contribution flow with the distinct title “Demo product added!” and explicit text that the item is temporary and not saved to the account.
- The real persistence confirmation remains gated: the §3.7 handler does not yet create a backend product, so the standard “Product added!” wording must not be used until persistence contracts are confirmed and validated.
- Once the backend create/upload contracts are confirmed and the create response is validated, integrate this component with the successful mutation and invalidate the `['library', 'products']` query prefix before showing it.

## 1. Overview & Reference Mapping

The Add Product Success Overlay gives clear confirmation after a community product has been persisted successfully. It briefly overlays the Add Product Form, then returns the user to the existing Products tab with its catalog query refreshed.

| Item | Decision |
|---|---|
| Target screen | Add Product Success Overlay (§3.8) |
| UI reference | `design_references/ui_design_reference.md` §3.8 |
| Visual reference | `design_references/library_add_product_success.png` |
| Feature folder | `src/features/library/` |
| Proposed component | `src/features/library/view/components/ProductAddedConfirmation.tsx` |
| Owner | Add Product Form route and its `useAddProduct` ViewModel |
| Trigger | Only after a validated successful response from the real product-create endpoint |
| Duration | 1.5 seconds, consistent with the UI reference's navigation table |
| Exit | Dismiss overlay and return to the mounted Library Products tab |
| Scope boundary | Confirmation presentation, timer/dismiss lifecycle, and successful-create navigation. Product upload/create contracts remain part of §3.7. |

### Existing architecture and constraints

- The Add Product Form already lives at `/library/add-product-form`, outside the tab group, and is registered in the root Expo Router stack.
- The form ViewModel currently does **not** create a product. It validates local fields and explicitly reports that nothing has been submitted because backend contracts are not fully confirmed.
- `useProducts` uses the query key family `['library', 'products', debouncedQuery, selectedCategory]`. A successful contribution should invalidate using the `['library', 'products']` prefix to refresh every cached search/category variant.
- The Library route is mounted under `(tabs)` and maintains its selected Products tab state. Returning to that mounted route avoids rebuilding the catalog screen unnecessarily.
- Never display the checkmark or “Product added!” message for client-only validation, a mock success, an upload-only success, or an unvalidated/failed create response.
- Do not repeat product creation when only query refresh fails; persistence success and catalog refresh are separate outcomes.

## 2. UI and Interaction Requirements

### Overlay appearance

- Use a transparent full-screen modal above the form.
- Dim the screen behind it with a semi-transparent dark backdrop.
- Center a white rounded card with comfortable padding and bounded width for phones and wider screens.
- Show a circular muted-green/success-colored icon container and a white checkmark.
- Display the exact message **“Product added!”** in the established `h3`/bold type style.
- Keep the overlay focused on confirmation; do not add product fields or secondary actions that are absent from the reference.

### Animation and dismissal

- Fade in the backdrop and spring/scale the confirmation card from approximately `0.9` to `1.0`.
- Hold for 1.5 seconds, then fade out and dismiss.
- Support early dismissal by tapping the backdrop and handle Android hardware-back consistently.
- Make the message accessible to assistive technology (for example, expose it as an accessibility live/status announcement).
- Clear the pending timeout on manual dismissal and component unmount to prevent a delayed navigation after leaving the form.
- Ensure dismissal is idempotent so timer, backdrop, and hardware-back cannot trigger duplicate navigation.

## 3. Success Flow and State Ownership

The flow must be initiated by the successful product-create mutation in `useAddProduct`; the confirmation component remains presentational.

1. `useAddProduct` validates the draft and completes any required image upload.
2. The documented `POST /products` request succeeds and its response is validated as the created product.
3. Invalidate the `['library', 'products']` query-key prefix. If invalidation/refetch fails, retain the confirmed create outcome, surface the catalog-refresh failure separately, and do not resubmit the create request.
4. Set the ViewModel's success state and render `ProductAddedConfirmation`.
5. On timeout, backdrop press, or system-back dismissal, close the overlay and return to the existing Products tab. Preserve the active Products tab and let the refreshed query display the contribution.
6. Do not clear the local form/photo or navigate away before create persistence is confirmed.

### Failure behavior

- Product upload or create failures must keep the overlay hidden and preserve the draft/photo for retry.
- Invalid or unexpected response envelopes must be treated as create failures, not success.
- If create succeeds but catalog refresh fails, do not claim the product was not added and do not repeat the POST. Keep the error distinct and provide a refresh retry path after confirmation.
- Cancellation from §3.7 must never display the overlay or invalidate the products cache.
- When `USE_MOCK` is enabled, do not produce a success state unless the mock contribution flow is explicitly implemented and unmistakably distinguished from persisted backend success. The preferred behavior is to keep product creation unavailable until the real contract is confirmed.

## 4. Proposed File and Integration Plan

```text
src/
├── app/
│   └── _layout.tsx
│       └── Existing add-product-form route; no separate success route is required
└── features/library/
    ├── viewmodel/
    │   └── useAddProduct.ts
    │       └── Own success visibility, invalidation, and post-dismiss navigation
    └── view/
        └── components/
            └── ProductAddedConfirmation.tsx
                └── Accessible animated success modal
```

### Integration points

- `src/features/library/view/AddProductPage.tsx`
  - Render the confirmation component while the successful-submission state is active.
  - Pass dismissal through to the ViewModel; keep form error/loading presentation separate.
- `src/features/library/viewmodel/useAddProduct.ts`
  - Only transition to success after create-response validation.
  - Invalidate the product query prefix after persistence.
  - On dismissal, return to the existing Expo Router route `/(tabs)/library` and preserve the mounted Products tab when possible.
- `src/features/library/viewmodel/useProducts.ts`
  - Reuse the existing query-key prefix; avoid introducing duplicate key definitions or custom cache mutation.
- `src/app/_layout.tsx`
  - No new route is planned; the overlay is a modal component inside the form route.

## 5. Component Contract

Keep the component UI-only with explicit props:

```ts
interface ProductAddedConfirmationProps {
  visible: boolean;
  onDismiss: () => void;
}
```

Implementation details:

- Use React Native `Modal` with `transparent`, `onRequestClose`, and status-bar-safe presentation consistent with existing Library modals.
- Use a single animation approach already available in the project (React Native `Animated` or Reanimated); avoid adding dependencies.
- Own the display timer in an effect keyed by `visible`; clear it on visibility change/unmount.
- Guard dismissal so callback fires once per visible instance.

## 6. Validation Plan

- Unit or component-test the success visibility gate: only a valid successful create response opens the overlay.
- Verify create validation, upload failure, POST failure, unexpected response, cancellation, and mock mode leave the overlay hidden.
- Verify prefix invalidation covers product catalog query variants and does not invalidate favorites unnecessarily.
- Verify refresh failure does not repeat product creation and is surfaced separately.
- Verify timeout, backdrop, and Android back each dismiss once; verify timeout cleanup after manual dismissal/unmount.
- Check the dialog is centered, legible at narrow and wide viewport widths, and accessible to screen readers.
- Run targeted ESLint/TypeScript checks and the web export; verify on Android/iOS if available.

## 7. Acceptance Criteria

- “Product added!” appears only after confirmed, validated persistence.
- The overlay matches the dimmed backdrop, centered white card, circular checkmark, and heading in §3.8.
- The overlay dismisses after 1.5 seconds or an allowed early dismissal without duplicate route changes.
- The products catalog query prefix is invalidated only after create success.
- The user returns to the mounted Products tab and can see the refreshed catalog.
- Create failure, cancellation, upload failure, and mock browsing do not display a success-shaped fallback.
- Catalog refresh failure never causes a duplicate product-create request.

## 8. Dependency / Readiness Gate

This feature depends on completing §3.7 live submission. At plan creation, the form submit handler is intentionally blocked because the repository does not fully specify the deployed create response, ingredient-resolution policy, and product-image storage write contract. Implementing or triggering §3.8 before those contracts are confirmed would risk a false success. Keep this plan approved but gated; no success overlay should be wired until §3.7 has a verified persistence result.
