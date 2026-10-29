# Implementation Plan: 4.3 Scan Upload (Upload a Photo)

> **Document Type:** Screen Architecture & Implementation Plan  
> **Target Screen:** Scan Upload (`ScanUploadPage`)  
> **UI Doc Reference:** Section 4.3 — *Scan Upload (Upload a Photo)* in `design_references/ui_design_reference.md`  
> **Visual Reference:** `design_references/scan_upload.png`  
> **Feature Domain:** `frontend/src/features/scan/`  
> **Route Path:** `frontend/src/app/scan/upload.tsx` (`/scan/upload`)  
> **Status:** ✅ **IMPLEMENTED**


---

## 1. Overview & Visual Ground Truth

The **Scan Upload** screen provides an edge-to-edge photo picker interface enabling users to select an existing portrait photo from their device gallery for deep learning skin analysis (MediaPipe Face Mesh + MobileNetV3 classifiers). It features a dark header with search filtering and a 3-column grid of square portrait tiles.

### Visual Layout (from `scan_upload.png`)
```
┌─────────────────────────────────────────────────────────┐
│ [←]                  Upload a Photo                     │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │ 🔍 Search...                                      │  │
│  └───────────────────────────────────────────────────┘  │
├───────────────────┬───────────────────┬─────────────────┤
│                   │                   │                 │
│      Tile 1       │      Tile 2       │     Tile 3      │
│   aspect-square   │   aspect-square   │  aspect-square  │
│                   │                   │                 │
├───────────────────┼───────────────────┼─────────────────┤
│                   │                   │                 │
│      Tile 4       │      Tile 5       │     Tile 6      │
│   aspect-square   │   aspect-square   │  aspect-square  │
│                   │                   │                 │
├───────────────────┼───────────────────┼─────────────────┤
│                   │                   │                 │
│      Tile 7       │      Tile 8       │     Tile 9      │
│   aspect-square   │   aspect-square   │  aspect-square  │
│                   │                   │                 │
└───────────────────┴───────────────────┴─────────────────┘
```

### Visual & Architectural Characteristics:
- **Header Canvas:** Dark charcoal container (`bg-neutral-text` / `#2D2D2D`).
- **Screen Title:** Centered `"Upload a Photo"` (`text-h3 font-sans-bold text-neutral-white`), with back arrow button on the left (`ChevronLeft`, `theme.colors.card`).
- **Search Bar:** Full-width pill container (`bg-neutral-muted/30 rounded-badge flex-row items-center px-4 py-2 mt-3`) with magnifying glass icon (`Search`, `theme.colors.card`) and input field (`text-body-sm font-sans text-neutral-white`).
- **Photo Grid:** Scrollable 3-column `FlatList` with `aspect-square` photo tiles, subtle partition borders (`border-border` / `border-secondary/20`), smooth tap opacity (`active:opacity-80`), and instant navigation to **Scan Submit (4.4)**.
- **Native Device Picker Integration:** Includes an explicit `"Choose from Camera Roll"` action button/tile invoking `expo-image-picker` (`launchImageLibraryAsync`) to pick any photo directly from system albums.

---

## 2. Complete Resolved File Tree

```
frontend/
├── src/
│   ├── app/
│   │   └── scan/
│   │       └── upload.tsx                ← Route entry point (/scan/upload)
│   │
│   └── features/scan/
│       ├── model/
│       │   ├── scan_types.ts             ← [UPDATE] Add GalleryPhotoItem, PhotoFilterOptions interfaces
│       │   ├── scan_mock.ts              ← [UPDATE] Add MOCK_GALLERY_PHOTOS (18 curated portrait images)
│       │   └── scan_api.ts               ← [UPDATE] Add fetchGalleryPhotos(), pickPhotoFromDevice() fns
│       │
│       ├── viewmodel/
│       │   ├── useScan.ts                ← [VERIFY] handleUploadPhoto points to /scan/upload
│       │   └── useScanUpload.ts          ← [NEW] Grid photos query, search filtering, native picker trigger
│       │
│       └── view/
│           ├── ScanUploadPage.tsx        ← [NEW] Main layout shell with dark header & 3-column grid
│           │
│           ├── containers/
│           │   ├── s1_UploadHeader.tsx   ← [NEW] Back button, "Upload a Photo" title, pill search bar
│           │   └── s2_PhotoGrid.tsx      ← [NEW] 3-column FlatList with loading skeleton & empty state
│           │
│           └── components/
│               ├── PhotoGridTile.tsx     ← [NEW] Square photo tile with tactile active opacity
│               ├── DevicePickerTile.tsx  ← [NEW] 1st-slot tile linking to native system photo picker
│               └── PhotoGridEmpty.tsx    ← [NEW] Empty search results notice + reset search button
```

---

## 3. Data Model Updates (`scan_types.ts`)

```typescript
// ── Upload Specific Types (Section 4.3) ──────────────────────────

export interface GalleryPhotoItem {
  id: string;
  uri: string;
  filename?: string;
  creationTime?: string;
  tag?: string;
}

export interface PhotoFilterOptions {
  searchQuery?: string;
}
```

---

## 4. API Functions & Mock Data (`scan_api.ts` & `scan_mock.ts`)

### `scan_mock.ts` Updates:
```typescript
export const MOCK_GALLERY_PHOTOS: GalleryPhotoItem[] = [
  {
    id: 'photo-01',
    uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
    filename: 'portrait_natural_01.jpg',
    tag: 'portrait',
  },
  {
    id: 'photo-02',
    uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    filename: 'portrait_clear_02.jpg',
    tag: 'daylight',
  },
  {
    id: 'photo-03',
    uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    filename: 'portrait_window_03.jpg',
    tag: 'studio',
  },
  {
    id: 'photo-04',
    uri: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
    filename: 'selfie_indoor_04.jpg',
    tag: 'indoor',
  },
  {
    id: 'photo-05',
    uri: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80',
    filename: 'portrait_front_05.jpg',
    tag: 'portrait',
  },
  {
    id: 'photo-06',
    uri: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80',
    filename: 'portrait_neutral_06.jpg',
    tag: 'daylight',
  },
  // (Total 18 diverse portraits for full scrollable grid test coverage)
];
```

### `scan_api.ts` Toggle Block & Fetch Functions:
```typescript
// ============================================================================
// DATA SOURCE TOGGLE (use mock)
// Set to `true` to use mock data for all Scan screen features (Scan Analysis,
// Camera Capture Simulation, Gallery Photos Grid, Health Score, Compatibility).
// Set to `false` to fetch real-time live data from FastAPI and Supabase.
export const USE_MOCK: boolean = true;
// ============================================================================

export async function fetchGalleryPhotos(query?: string): Promise<GalleryPhotoItem[]> {
  if (USE_MOCK) {
    if (!query || query.trim() === '') {
      return MOCK_GALLERY_PHOTOS;
    }
    const lower = query.toLowerCase();
    return MOCK_GALLERY_PHOTOS.filter(
      (p) =>
        p.filename?.toLowerCase().includes(lower) ||
        p.tag?.toLowerCase().includes(lower)
    );
  }
  // Optional: Read from device MediaLibrary
  return MOCK_GALLERY_PHOTOS;
}
```

---

## 5. ViewModel Hook (`useScanUpload.ts`)

```typescript
export interface UseScanUploadReturn {
  // Data & Filtering
  photos: GalleryPhotoItem[];
  filteredPhotos: GalleryPhotoItem[];
  searchQuery: string;
  isLoading: boolean;
  isPicking: boolean;

  // Actions
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
  selectPhoto: (photoUri: string) => void;
  pickFromSystemGallery: () => void;
  handleBack: () => void;
}
```

### Detailed Hook Logic:
1. **Search Filtering:** Debounced or instantaneous local filter matching `searchQuery` against `filename` and `tag`.
2. **Photo Selection:** Calls `router.push({ pathname: '/scan/submit', params: { imageUri } })`.
3. **System Picker:** Calls `ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, quality: 0.85 })`. If user selects an image, immediately navigates to `/scan/submit` with the chosen asset URI.
4. **Back Action:** Uses `router.back()` or falls back to `/scan/camera`.

---

## 6. View & Container Breakdown

### 6.1 Main Layout Shell (`ScanUploadPage.tsx`)
- Container: `flex-1 bg-neutral-text` (`#2D2D2D`).
- Status bar: `<StatusBar style="light" />`.
- Top SafeArea padding applied to `s1_UploadHeader`.
- Composes `s1_UploadHeader` and `s2_PhotoGrid`.

### 6.2 Container 1 (`s1_UploadHeader.tsx`)
- Top Navigation Row:
  - Left: `Pressable` with `ChevronLeft` icon (`color={theme.colors.card}` / white, size 28).
  - Center: `Text` `"Upload a Photo"` (`text-h3 font-sans-bold text-neutral-white`).
  - Right: Empty spacer (`w-7`) for symmetrical centering.
- Pill Search Bar:
  - Container: `w-full bg-neutral-muted/30 rounded-badge flex-row items-center px-4 py-2 mt-3 border border-neutral-white/10`.
  - Icon: `Search` (`color={theme.colors.card}`, size 20) on the left.
  - Input: `TextInput` (`flex-1 ml-2.5 text-body-sm font-sans text-neutral-white`) with placeholder `"Search..."` (`placeholderTextColor="#B0B0B0"`).
  - Clear button: `X` icon button (`color={theme.colors.card}`) visible when `searchQuery` is non-empty.

### 6.3 Container 2 (`s2_PhotoGrid.tsx`)
- **Grid Layout:** Edge-to-edge `FlatList` with `numColumns={3}`, `columnWrapperStyle` or tile borders (`border-r border-b border-secondary/20`).
- **Slot 1 (Device Picker CTA):** `<DevicePickerTile onPress={pickFromSystemGallery} />` styled as a warm card with `FolderPlus` / `Upload` icon and `"Browse"` text.
- **Photo Tiles:** `<PhotoGridTile photo={item} onSelect={selectPhoto} />` rendering square portrait images.
- **Empty State:** `<PhotoGridEmpty searchQuery={searchQuery} onClear={clearSearch} onBrowse={pickFromSystemGallery} />` rendered when no photos match the search query.

### 6.4 Components
1. **`PhotoGridTile.tsx`:**
   - Square pressable container: `aspect-square border border-secondary/20 bg-neutral-card/10 overflow-hidden active:opacity-75`.
   - Mounts high-resolution `<Image>` from `expo-image` or `react-native`.
2. **`DevicePickerTile.tsx`:**
   - Square pressable card matching grid item dimensions: `aspect-square bg-secondary/15 border border-secondary/30 items-center justify-center active:bg-secondary/25`.
   - Icon: `PlusCircle` / `FolderOpen` (`color={theme.colors.card}`, size 26).
   - Label: `Text` `"Browse Files"` (`text-caption font-sans-semibold text-neutral-white mt-1`).
3. **`PhotoGridEmpty.tsx`:**
   - Centered container with `ImageOff` icon (`color={theme.colors.muted}`), text `"No matching photos found"` (`text-body-sm font-sans-medium text-neutral-white`), and a button to clear search or browse files.

---

## 7. Navigation Mapping

| Action | Source Component | Destination Route | Params / Payload |
|---|---|---|---|
| Tap Any Photo Tile | `PhotoGridTile` | `/scan/submit` | `{ imageUri: string }` |
| Pick Photo from System | `DevicePickerTile` | `/scan/submit` | `{ imageUri: string }` |
| Tap Back Arrow (←) | `s1_UploadHeader` | `/scan/camera` or previous screen | `router.back()` |
| Swipe Back Gesture | Full Screen Edge | `/scan/camera` | N/A |

---

## 8. State Handling Matrix

| Section / Element | Loading State | Empty State | Error State | Success / Populated State |
|---|---|---|---|---|
| **Header Search** | Active text input | Active text input | Active text input | Active text input with clear `✕` button |
| **Photo Grid** | 9-tile skeleton placeholder with subtle shimmer | `PhotoGridEmpty` with reset search & browse CTA | Permission prompt notice with settings CTA | 3-column scrollable grid with smooth momentum |
| **System Picker** | Disabled tile with `ActivityIndicator` during file picker launch | N/A | Toast error notice if picker fails | Successfully passes picked image URI to `/scan/submit` |

---

## 9. Design System & Token Compliance Checklist

- [x] **No arbitrary colors:** Dark canvas uses `bg-neutral-text` (`#2D2D2D`), search bar uses `bg-neutral-muted/30`, borders use `border-secondary/20`, text uses `text-neutral-white`.
- [x] **Font size presets only:** `text-h3` (Upload a Photo), `text-body-sm` (Search input), `text-caption` (Browse label), `text-label` (CTA button).
- [x] **Font family presets only:** `font-sans`, `font-sans-medium`, `font-sans-semibold`, `font-sans-bold`.
- [x] **Border radius presets only:** `rounded-badge` (pill search bar), `rounded-button` (CTA buttons), `rounded-card` (empty state card).
- [x] **Strict MVVM separation:** All photo filtering, device picker invocations, and navigation logic reside in `useScanUpload.ts`.
- [x] **Centralized mock toggle:** `USE_MOCK` in `scan_api.ts` cleanly isolates local test assets from live backend/media library services.
