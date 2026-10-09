# Assignment: printer/POS lifecycle review

Status: preparation only; source has not been edited. Scope is `app/(no-layout)/manage/printer/modify.tsx`, `app/(no-layout)/manage/pos-settings/rounding.tsx`, and `app/(no-layout)/manage/pos-settings/stock-limit.tsx`.

## Current risks and developer work

- **Printer form:** `printerItem` starts as `null`, then an effect with an empty dependency list reads `params.id` and sets it after mount. Confirm the edit/add title and any prefill remain correct on initial render, route ID changes, missing IDs, and returning to add mode. `form` currently has no defaults/reset from the looked-up record; confirm whether fields are expected before implementing prefill. Avoid stale ID capture.
- **Rounding:** an effect copies `roundingData` into local states whenever query data changes. A refetch can overwrite edits made before Save. `applyTo` is UI-only and is not initialized from query data or included in mutation payload; check the API contract before changing that behavior. Verify first load, refetch after edits, and save payload.
- **Stock limit:** the query-sync effect can replace `enabled` and exclusions during an in-progress edit/refetch. Picker draft is copied on open and committed only on Selesai; verify Batal/backdrop discard edits, reopening starts from committed values, and query refresh does not clobber the main form or picker draft.

## Verification requested

Run ESLint only for these three paths and record the diagnostics. The attempted `npx eslint` invocation produced no output within 30 seconds and was interrupted; no current diagnostic can be confirmed from this preparation. Add focused behavior checks for printer ID/prefill and query-driven rerenders; rounding refetch versus dirty draft and payload; stock picker open/edit/cancel/commit/reopen plus refetch. Keep existing mock/API boundaries and report any unavailable runtime/API contract clearly. No full TypeScript or browser bundle is requested here.
