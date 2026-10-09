# SD3-010 independent detail identity audit

Status: read-only baseline audit. This packet belongs to Codex-3 internal review, not external QC approval.

Baseline source was captured before implementation in `baseline-capture.json` and `before/`. The three detail components have no identity boundary around the parent modal state. Their corresponding child DeleteDialog already has a key by data ID, but receives the parent `openState` which survives a change to route ID. Consequently, opening confirmation for A, switching to B, and loading B can display confirmation for B without opening it again. The Role permission search also survives the change to B. A retained callback from A writes the same parent state used by B.

The three routes normalize `string | string[]` to `string | undefined` and render the detail without a key. API query hooks use per-ID cache keys and no placeholder-data setting. A loading interval with undefined data does not reset parent state. Empty and undefined IDs are disabled by the factory and use the existing missing-ID UI.

Minimal recommendation: make the public default component return an inner detail keyed by `id ?? ""`, and move the current entire function body to that inner component. This resets state and callback lifetime at identity change while preserving same-ID refetch state. Keep the public ID prop, all current query calls, rendering branches, JSX, navigation callbacks, retry/back behavior and dialog callbacks unchanged. Shared hooks/modals/routes/factory need no edit. An effect which only clears modal state permits a render with the old state and does not scope retained callbacks.

Independent renderer baseline has 156 assertions across Role, Worker and Member in normal mode and StrictMode: 122 pass, 34 fail, runtime/React/act warnings 0. Failures reproduce retained confirmation, stale A open/close, missing-ID carryover, and Role search carryover. The count includes repeated execution in StrictMode rather than 34 distinct bugs.

The fixture executes actual detail source, actual `useAlertModal` state hook and actual domain display helpers. Query data, child DeleteDialog, native/presentation hosts and router are adapters. It independently verifies parent state and callback lifetime; the parent's broader harness is responsible for real delete dialog/request behavior. This packet does not certify browser geometry, native animation/scroll, API/server requests, backend transactions, Expo Router lifecycle or all app routes. Figma callable tools are absent.

Execution Profile & Operator Tips: Medium. Capture baseline -> parent source delta -> independent state and unchanged-body/props/contract checks -> report per final hash. Preserve same-ID confirmation/search during refetch, use a new output for each review, and leave external QC/publication gates with QA/QC/PM.
