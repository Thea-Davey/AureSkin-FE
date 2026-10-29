# History Detail Compatibility — Implementation Plan (§5.3)

> Based on `design_references/ui_design_reference.md § 5.3`, the visual reference `design_references/history_detail_compatibility_tab.png`, the History feature tree in `documentation/part2_technical_view.md`, and `skills/aureskin-screen-architecture-implementation/SKILL.md`.

## 1. Overview & Reference Mapping

| Item | Decision |
|---|---|
| Target screen | History Detail — Ingredient Compatibility Tab |
| UI reference | `design_references/ui_design_reference.md` § 5.3 |
| Visual reference | `design_references/history_detail_compatibility_tab.png` |
| Feature folder | `src/features/history/` |
| Route | Reuse `src/app/history/[id].tsx`; this is a tab state on the existing historical detail route, not a new route. |
| Shared data | Reuse `useHistoryDetail(id)` and `GET /history/{id}`; compatibility arrays are added to the existing `HistoryDetail`. |
| Scope boundary | Implement historical compatibility UI only. The unrelated live scan compatibility screen and Ingredient Detail screen are not part of this task. |

The screenshot shows the existing olive scan/date header with a back arrow and two tabs, followed by a scroll surface. The active Compatibility tab contains a card titled “Compatible Ingredients to Skin Type” with alternating ingredient rows, followed by “Incompatible Ingredients to mix” pair cards. The current History Detail page already owns the header/tab selection and detail query; this plan adds the compatibility data and a second content container without duplicating routes, headers, or requests.

The written §5.3 section requires compatible and incompatible historical data from `GET /history/{id}`. The technical schema documents compatible ingredient `reason`, incompatible pair ingredient names and `reason`; it does not specify separate application instructions or usage-guidance fields. UI copy must use the stored rationale and avoid manufacturing medical or scheduling advice.

## 2. Complete File Tree

```text
src/features/history/
├── model/
│   ├── history_types.ts                 # Add compatible ingredient and incompatible pair types
│   ├── history_api.ts                   # Normalize compatibility arrays from the existing detail response
│   └── history_mock.ts                  # Add compatibility fixtures to every mock detail record
├── view/
│   ├── HistoryDetailPage.tsx             # Render the selected Results or Compatibility content container
│   ├── containers/
│   │   └── s2_HistoryCompatibility.tsx   # Historical compatibility list and empty state
│   └── components/
│       ├── CompatibleIngredientItem.tsx  # Accessible informational ingredient row
│       └── IncompatiblePairCard.tsx      # Ingredient pair title and stored rationale
```

No new route or ViewModel hook is required. Reuse the detail route, query state, header, refresh callback, and existing `HistoryDetail` request. `HistoryDetailHeader.tsx` already exposes the `results` and `compatibility` tab callbacks and selected state.

## 3. Data Model (`history_types.ts`)

Add these contracts and extend the existing `HistoryDetail` interface:

```ts
export interface HistoryCompatibleIngredient {
  id: string;
  name: string;
  reason: string | null;
}

export interface HistoryIncompatiblePair {
  id: string;
  ingredient_a: string;
  ingredient_b: string;
  reason: string | null;
}

export interface HistoryDetail extends Omit<HistoryEntry, 'conditions'> {
  summary: string | null;
  skin_type_confidence: number | null;
  conditions: HistoryCondition[];
  compatible_ingredients: HistoryCompatibleIngredient[] | null;
  incompatible_pairs: HistoryIncompatiblePair[] | null;
}
```

Use `null` when the detail response omits compatibility data (the UI spec describes this as no active routine/data available); use an empty array when the server explicitly returns a valid list containing no items. Keep the distinction during normalization so the UI does not conflate unavailable analysis with a valid empty result.

The live response may return related ingredient information nested under an `ingredient` object. Normalize the join into the flat `id`, `name`, and `reason` shape at the API boundary. For incompatible pairs, normalize `ingredient_a`, `ingredient_b`, and `reason` from the persisted pair record. The documented schema has no `usage_guidance`, tags-to-avoid, or timing instructions; do not add required fields for them. If a future API explicitly returns such fields, they can be added as optional, separately validated data.

## 4. API Normalization & Mock Data

### `history_api.ts`

Extend the existing `fetchHistoryDetail(id)` response normalizer; do not add a second request. `GET /history/{id}` already serves the analysis detail and §5.3 specifies that it includes `analysis_compatible_ingredients[]` and `analysis_incompatible_pairs[]`.

- Normalize `analysis_compatible_ingredients` (or the documented API alias `compatible_ingredients`, if confirmed by the backend) to `HistoryCompatibleIngredient[] | null`.
- Normalize `analysis_incompatible_pairs` (or confirmed API alias `incompatible_pairs`) to `HistoryIncompatiblePair[] | null`.
- For a joined compatible row, accept the linked ingredient name from the nested ingredient record and preserve the join record's compatibility `reason`.
- For an incompatible row, preserve both ingredient labels and the saved reason.
- Validate malformed arrays and reject detail payloads whose shape cannot be normalized. Continue propagating API errors so the existing hook error/retry state is used.
- Keep the current shared authenticated Axios client, mock toggle, and URL-encoded analysis ID.

Do not call `/scan/{id}/compatibility` for historical detail; compatibility must come from the stored history record so the values correspond to the original scan.

### `history_mock.ts`

Extend `MOCK_HISTORY_DETAILS` in place; do not add fixture data to view or ViewModel files. Ensure every seeded history ID has both compatibility properties. Include:

- One or more populated compatible lists and incompatible-pair lists.
- At least one detail where both lists are present but empty.
- At least one detail with both compatibility fields `null` to exercise the no-active-routine/unavailable-data state.
- Realistic, non-clinical reasons that match the fixture data and are phrased as guidance rather than diagnosis.

The visual reference includes example categories such as AHAs, BHAs, and PHAs, but they should only be displayed as ingredient labels if the saved API fixture actually contains them. Do not generate unsaved ingredient groups or routine instructions in the UI.

## 5. ViewModel Contract

No change is needed to `useHistoryDetail.ts`: it already queries `fetchHistoryDetail(id)` and returns the complete typed detail record, query loading/error state, refresh state, retry action, and refresh action. Once `HistoryDetail` includes the compatibility arrays, the hook’s `detail` value carries them through automatically.

The existing `HistoryDetailPage` remains responsible for the active tab state:

- `results` renders `S1HistoryResults`.
- `compatibility` renders `S2HistoryCompatibility`.
- Switching tabs does not refetch because both historical panels use the same cached detail query.
- Refresh on the compatibility panel invokes the same `refresh()` callback.

## 6. View Breakdown

### `s2_HistoryCompatibility.tsx`

- Props: compatible ingredients, incompatible pairs, a flag indicating whether historical compatibility data was recorded, refresh state, and refresh callback.
- Use a `ScrollView` with `RefreshControl`, matching `s1_HistoryResults.tsx` and preserving the root detail page’s safe-area/header layout.
- Render the “Compatible Ingredients to Skin Type” card first, then the “Incompatible Ingredients to mix” section, matching the screenshot’s order.
- If compatibility fields are `null`, render the explicit no-routine/no-compatibility-data state specified in §5.3; do not show empty placeholder cards.
- If compatibility data exists but one collection is empty, render its section heading and a concise empty message for that collection. If both lists are empty, show a clear empty result while retaining the historical context.
- Add a loading skeleton/spinner for initial detail loading and preserve the current detail-level error/retry surface; the container does not perform requests.

### `CompatibleIngredientItem.tsx`

- Props: `ingredient: HistoryCompatibleIngredient`.
- Render the ingredient name in a full-width, rounded row. Alternate subtle card/background tokens to match the reference without relying on color alone.
- Render the optional saved compatibility reason as secondary copy only when present; keep rows compact when the API only supplies a name.
- The current app has no Ingredient Detail route or implemented Library detail screen. Keep these rows informational and non-pressable for this task. Add navigation only when §3.3 has a real route and implementation.

### `IncompatiblePairCard.tsx`

- Props: `pair: HistoryIncompatiblePair`.
- Render the pair as a clear title such as `{ingredient_a} + {ingredient_b}` and show the stored `reason` as supporting text.
- Use a restrained error/coral status token and an icon/label so the warning is not communicated by color alone.
- Do not invent “do not use on the same day” timing, AHA/BHA/PHA tags, or alternate-night instructions unless those exact fields are returned by a documented backend contract.

### `HistoryDetailPage.tsx`

- Replace the current Compatibility-tab toast with `setActiveTab('compatibility')` and render `S2HistoryCompatibility` when selected.
- Preserve the existing header, selected-tab accessibility state, root route, back behavior, query, and Results tab implementation.
- Reuse the same error/loading state while the shared detail query is pending or failed. Do not show an empty compatibility state before detail loading completes.
- Keep tab transitions lightweight and horizontal where feasible, consistent with §5.3’s horizontal tab-switch behavior; do not introduce a new animation dependency.

### Design token and accessibility constraints

- Use existing NativeWind/Tailwind palette, typography, and radius tokens only; use `theme.colors.*` for runtime icon and activity-indicator colors.
- Keep component heights stable and text wrapping natural on smaller iPhone screens.
- Provide accessibility labels for any interactive controls. As ingredient rows are not actionable until a real detail route exists, render them as informational views rather than misleading buttons.

## 7. Navigation Mapping

| User action | Destination / result |
|---|---|
| Tap “Ingredient Compatibility” tab | Set active tab to Compatibility and show historical compatibility content on the same `/history/[id]` route |
| Tap “Results” tab | Set active tab to Results and restore existing `S1HistoryResults` content |
| Tap back arrow | Return to `/(tabs)/history` using the existing detail header behavior |
| Pull to refresh | Refetch the same `GET /history/{id}` detail query |
| Tap a compatible ingredient row | No navigation in this task because no Ingredient Detail route exists; row remains informational pending §3.3 implementation |

## 8. State Handling Matrix

| Area | Loading | Empty | Error | Success |
|---|---|---|---|---|
| Historical detail query | Existing detail loading state before rendering either tab | Invalid/deleted ID is handled by the existing not-found state | Existing detail error with Retry and History actions | Detail record is cached and both tabs can render |
| Compatibility availability | Do not display content before the shared detail query resolves | `null` compatibility arrays show “No routine was active for this scan, so compatibility data is unavailable.” | Query error stays in the shared detail error state | Non-null arrays render saved historical values |
| Compatible ingredients | Optional skeleton rows while shared query loads | Explicit message if data exists but the list is empty | Shared query error | Ordered ingredient rows; show saved reason if available |
| Incompatible pairs | Optional skeleton cards while shared query loads | Explicit message if data exists but there are no saved pairs | Shared query error | Pair cards show both names and persisted reason |
| Refresh | RefreshControl indicator on the compatibility scroll surface | Retain empty-state explanation during refresh | Keep current cached data and surface a recoverable refresh error | Replace content with refetched historical values |

## 9. Acceptance Checks

- Selecting Ingredient Compatibility on a historical detail opens the compatibility panel on the same scan ID; selecting Results returns to the existing Results panel.
- The panel uses the existing detail query and historical `GET /history/{id}` payload; it does not call the live scan compatibility endpoint.
- Compatible ingredient rows and incompatible pair cards render in the screenshot order and use the exact saved names and reasons.
- Missing compatibility arrays display the specified no-routine state; present-but-empty arrays display a distinct valid-empty state.
- Loading, shared error/retry, populated, and pull-to-refresh states work without duplicate API requests.
- Mock fixtures cover populated, empty, and unavailable-data cases for existing history records.
- No broken ingredient navigation is added; informational rows remain accessible as content.
- Changed TypeScript files, Expo lint, Expo Doctor, and the iOS Expo Go flow are validated during implementation; existing project diagnostics are reported separately.

---

**Review checkpoint:** This plan artifact only describes implementation. No source code is changed until the plan is reviewed and approved.
