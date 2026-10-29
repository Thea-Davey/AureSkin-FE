# Add Product Camera Overlay Implementation Plan (§3.5)

> **Document Type:** Screen Architecture & Implementation Plan  
> **Target Screen:** Add Product Camera Overlay  
> **UI Doc Reference:** `design_references/ui_design_reference.md` §3.5  
> **Visual Reference:** `design_references/library_add_product_camera.png`  
> **Feature Domain:** `src/features/library/`  
> **Proposed Route:** `/library/add-product-camera`  
> **Status:** Plan only; no implementation changes made.

## 1. Overview & Reference Mapping

The Add Product Camera Overlay lets users photograph a skincare product's front or ingredient label. It is a full-screen camera route launched from the Library Products tab, visually distinct from the existing Scan Camera because it captures product packaging rather than a face.

The visual reference shows a black, edge-to-edge canvas; a header with Help, centered "Ingredient Extractor" title, and Close; a large rounded camera viewfinder; a centered "Take photo" label; and bottom controls for recent-gallery access, shutter, and front/back camera switching.

| Item | Decision |
|---|---|
| Target screen | Add Product Camera Overlay (§3.5) |
| UI reference | `design_references/ui_design_reference.md` §3.5 |
| Visual reference | `design_references/library_add_product_camera.png` |
| Feature folder | `src/features/library/` |
| Entry point | New Expo Router route `src/app/library/add-product-camera.tsx` |
| Entry action | Wire the existing Products-tab Add Product action in `LibraryPage.tsx` to push the camera route instead of showing the current future-update notice. |
| Presentation | Full-screen route outside the tab group so the camera owns the viewport and hides the tab bar. Closing returns to the mounted Products tab. |
| Capture purpose | Capture product packaging or an ingredient label; do not invoke skin analysis, scan submission, or scan-result APIs. |
| Scope boundary | Implement the camera overlay, camera/gallery permissions, capture, help modal, and navigation seams only. The Add Product Upload (§3.6), Add Product Form (§3.7), product creation, OCR/ingredient extraction, and success overlay (§3.8) remain separate screens/features. |

### Existing behavior and integration constraints

- `src/features/library/view/LibraryPage.tsx` currently handles Add Product by displaying a future-update notice. Replace only this action with route navigation; preserve the Products tab state.
- `src/features/scan/viewmodel/useScanCamera.ts` demonstrates the project's `expo-camera` permission, `CameraView`, lens switching, and capture patterns. Do not reuse its face-scan submission, mock photo fallback, skin-specific guidance, or routes.
- The project already depends on `expo-camera` and `expo-image-picker`. It does not currently depend on `expo-media-library`, which the §3.5 document specifies as the recent-image thumbnail source. If that package is used, install the Expo SDK 58-compatible version with `npx expo install expo-media-library` and configure its plugin/permissions. Request access only for the recent thumbnail and show a neutral gallery placeholder when permission is denied or no asset is available.
- The camera permission and capture errors must remain visible and recoverable. Do not silently substitute a mock photo or navigate as though capture succeeded.
- The later upload and form routes are not present yet. Define the handoff contract now, but do not implement those screens as part of §3.5.

## 2. Complete Resolved File Tree

```text
src/
├── app/
│   ├── _layout.tsx                                  # Register full-screen camera route options
│   └── library/
│       └── add-product-camera.tsx                   # Expo Router route for /library/add-product-camera
└── features/library/
    ├── model/
    │   └── library_types.ts                         # Add product-camera facing and captured-photo types
    ├── viewmodel/
    │   └── useAddProductCamera.ts                   # Camera/gallery permissions, capture, thumbnail, and actions
    └── view/
        ├── LibraryPage.tsx                          # Launch route from the Products-tab Add Product action
        ├── AddProductCameraPage.tsx                 # Full-screen layout shell and status bar
        ├── containers/
        │   ├── s1_ProductCameraViewfinder.tsx       # Header, live preview, camera initialization/permission state
        │   └── s2_ProductCameraControls.tsx         # Prompt, recent-gallery tile, shutter, and lens switch
        └── components/
            ├── ProductCameraGalleryThumbnail.tsx    # Accessible recent-image tile with empty fallback
            └── ProductCameraHelpModal.tsx           # Product-label photography guidance
```

### Conditional dependency/configuration changes

If implementing the recent-image preview with `expo-media-library`, add the SDK-compatible dependency and its app config plugin/permission text. This is required for querying a recent local asset; the system picker itself continues to use the existing `expo-image-picker` dependency. Do not request audio permission because this flow captures still images only.

No product API, mock product dataset, backend contract, or scan model/API changes are needed for the camera overlay. Product creation and storage upload belong to §3.7.

## 3. Data Model (`library_types.ts`)

Add library-owned camera types; do not import camera types from the Scan feature:

```ts
export type ProductCameraFacing = 'back' | 'front';

export interface CapturedProductPhoto {
  uri: string;
  width: number;
  height: number;
}
```

The `uri` remains a local device/cache URI until the Add Product Form uploads it. It is navigation input only, not a product's persistent `image_url`.

No API or mock data is proposed for hardware capture. `USE_MOCK` for Library product browsing remains unchanged. The screen must not simulate success when no physical/web camera capture was returned.

## 4. Device APIs, Permissions, and Data

### Camera (`expo-camera`, already installed)

- Use the SDK 58 `CameraView` and `useCameraPermissions` APIs, following the versioned Expo documentation and existing project usage.
- Default to the rear camera (`facing="back"`) because the target is packaging/ingredient text. The switch control toggles rear/front.
- Track camera readiness using `onCameraReady`; disable capture until ready and while a capture is in progress.
- Capture through a typed `CameraView` ref. On success, preserve URI and dimensions and pass the result to the next flow. On failure, show an actionable inline error and allow retry.
- Do not upload the photo, call `uploadScan`, or send it to the skin-analysis flow.

### Recent image (`expo-media-library`, new if retaining the reference thumbnail)

- Query the most recent image asset with the narrowest supported photo-read permission and dispose of any subscriptions if used.
- Ask for permission only when needed to obtain the thumbnail. If denied, limited, unavailable, or the gallery is empty, retain the tappable tile with an icon placeholder; do not block camera capture.
- The tile opens the separate §3.6 Upload flow. It must not treat a thumbnail URI as selected until the user completes the upload/photo-selection step.
- Handle unsupported environments (including browsers without camera hardware) with an explicit unsupported/error state rather than a fake image.

### Help content

Use concise, product-focused tips held in the ViewModel or a Library-specific typed constant: use good even lighting, keep the ingredient label in focus, avoid glare, and include the full label. Do not reuse face-scan guidance or claim OCR accuracy.

## 5. ViewModel Hook (`useAddProductCamera.ts`)

Proposed typed return shape:

```ts
interface UseAddProductCameraResult {
  facing: ProductCameraFacing;
  cameraRef: React.RefObject<CameraView | null>;
  isPermissionPending: boolean;
  isPermissionGranted: boolean;
  isCameraReady: boolean;
  isCapturing: boolean;
  captureError: string | null;
  galleryPermissionStatus: 'unknown' | 'granted' | 'denied' | 'limited';
  recentThumbnailUri: string | null;
  isHelpVisible: boolean;
  isOpeningGallery: boolean;
  actions: {
    requestCameraPermission: () => Promise<void>;
    markCameraReady: () => void;
    switchCamera: () => void;
    capturePhoto: () => Promise<void>;
    openGallery: () => Promise<void>;
    openHelp: () => void;
    closeHelp: () => void;
    closeCamera: () => void;
    openSettings: () => Promise<void>;
    clearCaptureError: () => void;
  };
}
```

- Own camera permission and readiness, lens direction, capture-in-progress/error state, recent thumbnail, photo-library permission, help visibility, and route actions.
- Request camera permission when the route becomes active. If denied, expose a retry/request action and a distinct Open Settings action for permanently denied permission. Surface a settings-launch failure instead of swallowing it.
- Query the optional recent thumbnail without making the camera dependent on media permission. A failure only affects the preview tile; it must not suppress or fail the camera.
- When a shutter press succeeds, navigate with the captured URI and dimensions using a stable typed route contract for the later §3.7 Add Product Form. If that destination is not implemented yet, document/guard that integration point; do not route to a nonexistent screen or fake successful completion.
- When gallery is pressed, navigate to the future §3.6 Upload flow. Keep the system picker/gallery selection and its permissions out of the camera screen.
- Close with `router.back()` when opened from Library; use a documented Library route fallback only when there is no back stack.
- No React Query is required: camera and media data are device state, not backend server state.

## 6. View Breakdown

### `AddProductCameraPage.tsx`

- Compose a full-height `SafeAreaView`/`View` using the dark token-backed canvas and light status-bar style. Respect safe-area insets without placing the tab shell or app header over the camera.
- Use a responsive flex layout rather than fixed device-height positioning.
- Call `useAddProductCamera()` and pass state/actions into the two ordered containers and help modal.
- Do not contain permission logic, image-library queries, capture logic, or navigation decisions.

### `s1_ProductCameraViewfinder.tsx`

- Render the header with an accessible Help icon, centered **Ingredient Extractor** title, and Close icon.
- Render a large rounded `CameraView` area that fills the principal vertical space.
- Use the back camera by default. Display an initialization indicator while permission/camera readiness is pending.
- If permission is denied, show a clear explanation, a request/retry action, and Open Settings when available; do not mount the preview in the denied state.
- Use a brief shutter flash overlay only after an actual capture action is accepted.
- Keep camera-specific permission and capture errors visible near the viewfinder.

### `s2_ProductCameraControls.tsx`

- Place the **Take photo** label below the preview.
- Place the recent-gallery tile at lower left, a large circular shutter at center, and camera switch at lower right.
- Disable shutter while camera is not ready, permission is unavailable, or a photo is being captured. Disable the switch during capture.
- Ensure that tapping the thumbnail opens §3.6 rather than selecting its preview image directly.

### `ProductCameraGalleryThumbnail.tsx`

- Show the latest local photo when permission and an image are available; otherwise show a token-styled gallery icon placeholder.
- Keep the whole square tile an accessible button with a meaningful label and visible pressed state.

### `ProductCameraHelpModal.tsx`

- Present brief guidance for capturing the front packaging or a readable ingredient label.
- Provide an accessible close action and modal semantics. The modal is informational and does not request permissions or change capture state.

### `useAddProductCamera.ts`

- Use `expo-camera` and (if approved/needed for actual recent-image display) `expo-media-library`; use `expo-image-picker` only at the §3.6 boundary.
- Prevent duplicate captures and route transitions.
- Report camera capture, media permission, and settings errors explicitly. Gallery-thumbnail failures degrade to the placeholder only; they do not get represented as camera failures.

### Route and Library integration

- `src/app/library/add-product-camera.tsx` is a thin route wrapper around `AddProductCameraPage`.
- Add a hidden-header full-screen stack entry in `src/app/_layout.tsx`, matching the existing `/scan/camera` route's screen-level presentation.
- In `LibraryPage.tsx`, replace the notice-only Add Product callback with navigation to `/library/add-product-camera`. Preserve the existing product query, filters, and scroll position when returning.
- Do not put this new screen under `(tabs)` because the reference is an immersive camera overlay and must not show the tab bar.

## 7. Navigation Mapping

| Action | Destination / behavior |
|---|---|
| Tap Add Product in Products tab | Push `/library/add-product-camera`; preserve Products tab state underneath. |
| Tap Close (X) | Return to the Products tab without changing its filters or scroll state. |
| Tap Help (?) | Open the product-photo guidance modal; Close returns to the camera. |
| Tap shutter after camera is ready | Capture a product image; pass local URI and dimensions to the Add Product Form (§3.7) when that route is implemented. |
| Tap recent-gallery thumbnail | Open Add Product Upload (§3.6); selecting a photo later hands its URI to the Add Product Form (§3.7). |
| Tap switch camera | Toggle between back and front camera lenses without leaving the overlay. |
| Deny camera permission | Keep the overlay open and offer permission retry/Open Settings; Close remains available. |
| Capture fails | Stay on camera, display the failure, and allow retry; do not navigate or substitute another image. |

**Future route contract:** Captured and gallery-selected images should reach §3.7 through one typed parameter shape, preferably `imageUri`, `imageWidth`, and `imageHeight`. Confirm the final route name/parameter typing when the Add Product Form plan is implemented. Do not use untyped `as any` route casts or invent a backend upload call in §3.5.

## 8. State Handling Matrix

| Section | Loading | Empty / unavailable | Error / denied | Success |
|---|---|---|---|---|
| Camera permission | Dark screen with initialization indicator while permission state resolves | N/A | Explain denial; allow retry and Open Settings; keep close action available | Mount the viewfinder and request camera readiness |
| Camera preview | Loading indicator until `onCameraReady` | Unsupported browser/device gets an explicit unavailable state | Camera initialization/capture failure is visible and retryable; no mock fallback | Live rear-facing product preview |
| Shutter | Disabled until ready and while capturing | N/A | Capture error remains visible; shutter re-enables after a failed attempt | Brief flash feedback, then hand off actual captured image |
| Recent thumbnail | Optional brief thumbnail load state | No images, no permission, or limited access uses an icon tile | Permission/query failure falls back to the tile and never blocks camera use | Display most recent available local photo |
| Gallery action | Disabled while route transition/picker is opening | N/A | Surface picker/open failure and allow retry | Navigate to §3.6 Upload |
| Help modal | N/A | N/A | N/A | Product-label photo tips with accessible dismissal |
| Close/navigation | N/A | N/A | Navigation failure is surfaced; do not silently claim return | Return to mounted Products tab |

## 9. Implementation & Verification Order

1. Add the Library-specific camera/photo types and confirm Expo SDK 58 API signatures against versioned Expo Camera and MediaLibrary docs.
2. Decide/confirm the recent-thumbnail permission approach. If implementing actual local thumbnail lookup, install `expo-media-library` with `npx expo install`, configure the plugin, and provide appropriate permission copy.
3. Implement `useAddProductCamera` with explicit permission, readiness, capture, gallery, error, and navigation states.
4. Build the route shell, viewfinder, controls, thumbnail fallback, and help modal with existing design tokens and accessibility labels.
5. Register the route in the root stack and connect the existing Library Add Product action without changing unrelated Products-tab behavior.
6. Confirm the §3.6 and §3.7 route contracts before activating their handoffs; do not use placeholder routes or mock capture-success behavior.
7. Run targeted ESLint and `npx tsc --noEmit`; test camera permission granted/denied/permanently denied, camera readiness, capture failure/success, lens switching, thumbnail permission/no-assets, help open/close, close/back navigation, and preservation of Products-tab state. Verify on a physical device because browsers may not provide camera hardware.

## 10. Mandatory Review Checkpoint

This file is the implementation-plan artifact only. **No camera route, hook, component, package, permission, or application code is changed by creating this plan.** Review the scope, especially the optional `expo-media-library` permission/dependency for the recent thumbnail and the future §3.6/§3.7 navigation contracts. Implementation begins only after explicit approval.
