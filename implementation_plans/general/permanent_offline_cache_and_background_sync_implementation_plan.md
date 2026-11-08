# AureSkin: Permanent Offline Cache & Background Sync Implementation Plan

## 1. Overview & Problem Statement

Currently, AureSkin uses an in-memory TanStack Query cache (`staleTime: 24h`) populated during app startup via `StartupLoadingPage`. While this prevents re-fetching during the active session:
1. **RAM-Only Volatility**: Because TanStack Query's memory cache is lost whenever the OS terminates or the user swipes away the app, every cold boot triggers a network re-download of ingredients, products, and articles.
2. **Paging Latency**: Catalogs fetched in small pages (`limit: 20`) require recurrent network roundtrips as the user scrolls, causing slight buffering pauses.
3. **Offline Inaccessibility**: Without persistent local storage, opening the app without an active internet connection results in empty screens or network errors.

### Objective
Implement an **Offline-First Persistent Storage Architecture** using `@react-native-async-storage/async-storage` (already installed at `v2.2.0`) coupled with TanStack Query.
- **One-Time Initial Download**: Full catalog downloaded and saved to device disk on first app launch.
- **Instant Future Cold Boots (<100ms)**: Subsequent launches hydrate directly from local disk, skipping lengthy loading screens.
- **100% Offline Capability**: Ingredients, products, curated articles, active routines, and past scan scores remain fully browsable in airplane mode.
- **Silent Background Sync**: A non-intrusive background worker checks for catalog updates and delta-syncs new records without UI spinners or screen interruptions.

---

## 2. Resource Partitioning Strategy (Static vs Dynamic)

Not all app resources should be treated identically. AureSkin data is partitioned into three distinct operational tiers:

```
+-----------------------------------------------------------------------------------------+
|                                    AURESKIN DATA TIERS                                  |
+-----------------------------------+---------------------------------+-------------------+
| TIER 1: PERMANENT DISK STORAGE    | TIER 2: STALE-WHILE-REVALIDATE  | TIER 3: REALTIME  |
| (Download Once -> Disk -> Sync)   | (Disk Fast Load -> Silent Sync) | (Network Only)    |
+-----------------------------------+---------------------------------+-------------------+
| * Skincare Ingredients Catalog    | * User Active Routine (AM/PM)   | * AI Skin Scan    |
| * Products Catalog                | * Skin Health Score & History   |   Inference       |
| * Skincare Articles & Guides      | * User Profile Information      | * User Auth &     |
| * Skincare FAQs & Tips            | * User Favorites (Already local)|   Registration    |
+-----------------------------------+---------------------------------+-------------------+
```

### Detailed Breakdown:

1. **Tier 1: Permanent One-Time Download (Reference Catalogs)**
   - **Characteristics**: Large reference datasets that change rarely (only when an administrator publishes new items or updates formulations).
   - **Lifecycle**: Downloaded in bulk once, serialized to local device disk (`AsyncStorage`). On every app launch, loaded from disk in <20ms. Silently checked periodically for version/timestamp updates.

2. **Tier 2: Stale-While-Revalidate (Dynamic Personal Data)**
   - **Characteristics**: User-specific data that might change if the user completes a routine step or logs in on another device.
   - **Lifecycle**: Stored on disk so the user immediately sees their routine and previous scan score with **zero wait time**. A background request silently fetches the latest state from FastAPI/Supabase and updates the screen in place without blocking the user. Works offline.

3. **Tier 3: Real-Time / Network Only**
   - **Characteristics**: Operations requiring intense remote computing or strict security validation.
   - **Lifecycle**: `POST /scan` (YOLOv8 + EfficientNet inference) and Supabase Auth (`login`, `register`). These always require live internet connectivity.

---

## 3. Storage Architecture & Keys

### Storage Keys
All persistent data will follow a strict namespace convention:

```typescript
const STORAGE_KEYS = {
  CATALOG_INGREDIENTS: '@aureskin/catalog/ingredients_v1',
  CATALOG_PRODUCTS:    '@aureskin/catalog/products_v1',
  CATALOG_ARTICLES:    '@aureskin/catalog/articles_v1',
  CATALOG_METADATA:    '@aureskin/catalog/metadata_v1',
  USER_ROUTINE:        (userId: string) => `@aureskin/user/${userId}/routine_v1`,
  USER_HISTORY:        (userId: string) => `@aureskin/user/${userId}/history_v1`,
};
```

### Metadata Contract (`CatalogMetadata`)
Tracks freshness and synchronization status:
```typescript
export interface CatalogMetadata {
  version: number;
  lastSyncedAt: number;        // Epoch timestamp (ms)
  ingredientCount: number;
  productCount: number;
  articleCount: number;
}
```

---

## 4. Implementation Steps

### Step 1: Persistent Catalog Storage Engine
**Target File**: `frontend/src/shared/storage/catalogStorage.ts`
- Implement atomic read and write operations using `AsyncStorage`.
- Handle JSON serialization/deserialization safely with fallback defaults.
- Provide helper methods:
  - `getCachedIngredients(): Promise<Ingredient[] | null>`
  - `saveCachedIngredients(items: Ingredient[]): Promise<void>`
  - `getCachedProducts(): Promise<Product[] | null>`
  - `saveCachedProducts(items: Product[]): Promise<void>`
  - `getCachedArticles(): Promise<Article[] | null>`
  - `saveCachedArticles(items: Article[]): Promise<void>`
  - `getCatalogMetadata(): Promise<CatalogMetadata | null>`
  - `hasValidLocalCatalog(): Promise<boolean>`: Returns `true` if all core catalogs exist on disk.

### Step 2: Bulk Catalog Fetcher & Delta Sync
**Target File**: `frontend/src/features/library/model/library_sync.ts`
- **Initial Bulk Fetch**:
  - Request ingredients and products in large batches (e.g. `limit: 500` or auto-paginated loop) to retrieve the complete catalog.
  - The entire database payload is compact (~150KB - 300KB JSON), comparable to a single thumbnail image.
- **Delta Sync Method (`syncCatalogDelta`)**:
  - Checks if remote total count differs from local metadata or if `lastSyncedAt` is older than the sync interval (e.g., 24 hours).
  - Fetches any updated or new records and merges them into `AsyncStorage`.
  - Injects the updated records into TanStack Query cache via `queryClient.setQueryData`.

### Step 3: Fast-Path App Startup Bootstrapping
**Target Files**:
- `frontend/src/features/bootstrap/model/bootstrap_api.ts`
- `frontend/src/features/bootstrap/viewmodel/useStartupBootstrap.ts`

**Startup Workflow**:
1. Check `hasValidLocalCatalog()`.
2. **Fast Path (Disk Cache Present)**:
   - Hydrate TanStack Query cache directly from `AsyncStorage` (`queryClient.setQueryData`).
   - Disk read takes ~15ms–30ms.
   - Progress bar smoothly completes within a brief minimum splash window (300ms–500ms instead of 1.5s–3.5s).
   - Immediately transition the user into the main app.
   - Schedule non-blocking silent background sync via `InteractionManager.runAfterInteractions`.
3. **Cold Path (First App Launch / Cache Cleared)**:
   - Display `StartupLoadingPage` with rotating status messages.
   - Download the full catalog from the backend.
   - Persist to `AsyncStorage`.
   - Transition to main app.

### Step 4: Stale-While-Revalidate for Personal User Data
**Target Files**:
- `frontend/src/features/routine/model/routine_storage.ts`
- `frontend/src/features/routine/viewmodel/useRoutine.ts`
- `frontend/src/features/history/viewmodel/useHistory.ts`

**Mechanism**:
- When authenticated, persist the latest `RoutineResponse` and `ScanHistory` to user-scoped `AsyncStorage`.
- On page load:
  - If network is slow or offline, render the persisted routine/history immediately.
  - When online, fetch in the background and silently update TanStack Query.
  - Users never see empty routine flash states or infinite spinners.

### Step 5: Offline Search & Filtering Support in Library
**Target Files**:
- `frontend/src/features/library/viewmodel/useIngredients.ts`
- `frontend/src/features/library/viewmodel/useProducts.ts`

**Mechanism**:
- When the full catalog is cached on disk, `useIngredients` and `useProducts` can evaluate searches (`searchQuery`) and category filters directly against the in-memory/disk array if the network is unavailable.
- Seamless scrolling with zero loading flickers as all items are already available locally.

---

## 5. Visual & Design Token Compliance (`aureskin-frontend-rules`)

Any UI indicators associated with offline status, cache hydration, or sync banners must strictly adhere to AureSkin design tokens:
- **Offline / Sync Banner**:
  - Container: `rounded-card bg-note-warning border border-note-warning-border p-3`
  - Text: `text-body-sm font-sans text-note-warning-title`
  - Icon: `<AlertTriangle size={18} color={theme.colors.note.warning.icon} />`
- **Progress & Loading**:
  - Bar Track: `bg-border rounded-full`
  - Bar Fill: `bg-primary rounded-full`
  - Typography: `text-body-sm font-sans text-muted`

---

## 6. Verification & Testing Checklist

- [ ] **First Launch (Cold Download)**:
  - Clear app storage. Launch app.
  - Verify startup progress bar displays download progress and completes.
  - Verify `AsyncStorage` contains ingredients, products, and articles.
- [ ] **Subsequent Launches (Instant Startup)**:
  - Restart or kill and reopen app.
  - Verify app launches almost instantly (<100ms hydration), without lingering on the loading screen.
- [ ] **Airplane Mode / Offline Verification**:
  - Turn off Wi-Fi and mobile data.
  - Launch app.
  - Verify Library (Ingredients & Products) displays items normally without error popups.
  - Verify Skincare Articles on Home screen are readable.
  - Verify Active Routine displays the last saved AM/PM steps.
- [ ] **Silent Background Delta Sync**:
  - Re-enable network.
  - Verify background sync runs without showing any full-screen loading spinners.
  - Verify any new item added to the database appears in the local catalog.

