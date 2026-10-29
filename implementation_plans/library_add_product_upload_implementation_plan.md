# Add Product Upload Implementation Plan (§3.6)

> **Document Type:** Screen Architecture & Implementation Plan  
> **Target Screen:** Add Product Upload  
> **UI Doc Reference:** `design_references/ui_design_reference.md` §3.6  
> **Feature Domain:** `src/features/library/`  
> **Proposed Route:** `/library/add-product-upload`  
> **Status:** Implemented; Android device verification remains pending.

## 1. Overview & Reference Mapping

The Add Product Upload screen lets a user select an existing product or ingredient-label photo from their device instead of capturing one with the camera. It is launched from the Add Product Camera Overlay (§3.5).

The UI document originally described an in-app photo grid. The current supported behavior uses the operating system's image picker instead. This is intentional: it avoids broad media-library access, which is not supported by the Android Expo Go environment used to test this app. The screen should explain the action and provide a clear button to open the picker.

| Item | Decision |
|---|---|
| Target screen | Add Product Upload (§3.6) |
| UI reference | `design_references/ui_design_reference.md` §3.6 |
| Feature folder | `src/features/library/` |
| Entry point | `src/app/library/add-product-upload.tsx` |
| Entry action | Gallery button in the Add Product Camera controls |
| Presentation | Full-screen route outside the tab group; back returns to the product camera |
| Photo selection | Use the existing `expo-image-picker` system photo picker; request access only as required by the picker |
| Selection handoff | Return the selected local URI to `/library/add-product-camera` as `selectedPhotoUri` |
| Scope boundary | Picker launch, progress/error state, cancellation, and camera handoff only. The Add Product Form (§3.7), upload to storage, OCR, and product creation are separate work. |

### Existing behavior and constraints

- The project already uses Expo Router and includes `expo-image-picker`.
- Do not query the device library with `expo-media-library` or implement a custom library grid. The prior broad-media-library access caused Android Expo Go to display a rejected-permission error.
- The system picker owns browsing, search, albums, and empty-library handling. Do not recreate those capabilities inside AureSkin.
- Cancellation is not an error and should leave the user on the upload screen.
- The selected image URI remains local and temporary. Do not claim that it has been uploaded or saved as a product.
- The Add Product Form route is not implemented. Return to the camera with the chosen image preview and a clear notice that product details and saving are not yet available.

## 2. File Plan

```text
src/
├── app/
│   ├── _layout.tsx                                  # Register the upload route in the root stack
│   └── library/
│       └── add-product-upload.tsx                   # Expo Router route
└── features/library/
    ├── viewmodel/
    │   └── useAddProductUpload.ts                   # Picker lifecycle, errors, and navigation handoff
    └── view/
        ├── AddProductUploadPage.tsx                 # Safe-area-aware upload screen shell
        └── viewmodel integration                    # Bind button, loading, errors, and back action
```

### Existing integration points

- `src/features/library/viewmodel/useAddProductCamera.ts`
  - Opens the upload route.
  - Reads the returned `selectedPhotoUri` and exposes it as the gallery button preview.
  - Must keep captured and selected photo URIs local; it must not report that either image was saved.
- `src/features/library/view/AddProductCameraPage.tsx`
  - Wires upload state and photo preview into the camera controls.
- `src/features/library/view/containers/s2_ProductCameraControls.tsx`
  - Gallery thumbnail/button remains available when there is no preview; show a gallery icon in that state.

## 3. View and Interaction Requirements

### Header

- Show the title **“Upload a Photo”**.
- Provide a back button returning to the product camera.
- Respect safe-area insets and use the Library camera flow's dark background and typography tokens.

### Picker action

- Show a concise explanation that the user can choose a product or ingredient-label image.
- Provide a single primary **“Choose from device”** action.
- Launch `ImagePicker.launchImageLibraryAsync` with images only, no editing, and the project's existing image-quality convention.
- Disable duplicate launches and show a progress indicator/“Opening photos...” label while the picker is active.
- If the user cancels, keep the current screen without showing an error.
- If the picker throws, show a readable inline error and allow another attempt.

### Platform behavior

- iOS and Android: use the native system photo picker.
- Web: use the same Expo Image Picker API to open the browser's file chooser where supported. Surface a clear error if that platform API is unavailable.
- Do not request broad photo-library permission or show a permission-settings flow for the system picker.

## 4. ViewModel Contract

Keep the ViewModel narrow and typed:

```ts
interface UseAddProductUploadResult {
  isPicking: boolean;
  error: string | null;
  actions: {
    pickPhoto: () => Promise<void>;
    goBack: () => void;
  };
}
```

`pickPhoto` behavior:

1. Ignore duplicate presses while a picker launch is in progress.
2. Clear the previous picker error and set the loading state.
3. Launch the image picker.
4. On cancellation, remain on the upload route without changing the state to an error.
5. On successful selection, return to `/library/add-product-camera` with the selected URI as a route parameter.
6. On failure, show an explicit error message; always clear the loading state.

Use the Expo Router stack's dismiss-to-camera behavior for a successful selection so the upload page does not remain underneath the camera. Do not use an untyped route cast if the route types support the destination.

## 5. Navigation and Photo Handoff

| User action | Expected result |
|---|---|
| Tap the camera gallery button | Push `/library/add-product-upload` |
| Tap “Choose from device” | Open the operating system/browser image picker |
| Cancel the system picker | Stay on the upload screen; preserve normal retry behavior |
| Select an image | Return to `/library/add-product-camera` with `selectedPhotoUri` |
| Return to camera | Show selected image in the gallery preview and explain that it has not been saved |
| Press device/system back | Return to the product camera; camera close returns to the Products tab |

The URI is transient navigation data only. It must not be written to product mock data, used as a persistent `image_url`, or sent to an API from this screen.

## 6. Screen States

| State | UI behavior |
|---|---|
| Ready | Header, short instructions, and enabled “Choose from device” action |
| Opening picker | Disabled action with spinner and progress label |
| Picker canceled | Return to ready state without an error |
| Picker error | Inline error plus an enabled retry action |
| Photo selected | Dismiss to camera with the selected URI |

## 7. Validation Plan

- Type-check the touched Library route, screen, and ViewModel; distinguish any unrelated baseline type errors.
- Run targeted ESLint on changed files.
- Run `npx expo export --platform web` to verify route discovery and web bundling.
- On Android Expo Go, verify the picker opens without the `ExpoMediaLibraryNext.getPermissionsAsync` error, selection returns to the camera preview, and cancel returns to the ready upload screen.
- On device, also verify system back behavior and selection of a photo from a URI containing encoded characters.

## 8. Acceptance Criteria

- Opening Upload does not query `expo-media-library` or require broad gallery permission.
- The system image picker is launched only after a deliberate user action.
- Loading, cancellation, and picker errors have distinct, truthful behavior.
- A selected photo URI is handed back to the product camera and previewed.
- The UI does not claim that the image was uploaded, submitted, or saved.
- The skin-analysis Scan Upload route and its behavior remain unchanged.

## 9. Implementation Record

The planned screen and handoff are implemented:

- `src/app/library/add-product-upload.tsx` exposes the upload route, registered in `src/app/_layout.tsx`.
- `src/features/library/view/AddProductUploadPage.tsx` provides the safe-area-aware header, explanation, picker action, progress state, and inline error.
- `src/features/library/viewmodel/useAddProductUpload.ts` launches the existing Expo Image Picker, treats cancellation as a no-op, reports picker errors, and dismisses to the camera with the selected URI.
- `src/features/library/viewmodel/useAddProductCamera.ts` no longer queries the media library; it displays the selected image URI in the gallery thumbnail and gives an explicit not-saved message.
- The camera gallery button has an icon placeholder until an image is captured or selected.
- Removed `expo-media-library` from the application config and dependencies because this flow no longer uses broad library access.

### Verification

- Targeted ESLint passed for the upload screen, viewmodel, route, and camera integration files.
- TypeScript reported no diagnostics in the changed Library upload flow. The repository-wide check still has unrelated existing diagnostics outside these files.
- `npx expo export --platform web` succeeded.
- Android Expo Go picker selection and cancellation still require physical-device verification.

## 10. Review Checkpoint

The §3.6 implementation is complete. Add Product Form (§3.7), product storage/submission, and OCR remain out of scope until separately approved.
