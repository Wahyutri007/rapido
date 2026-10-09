# Read-only audit: Role, Worker and Member lists

Status: **READ_ONLY_AUDIT_REPRODUCTION**. `externalQcApproval: false`. This is evidence for choosing the next developer scope; no application implementation was edited.

The three list screens keep selected full objects and modal/action state after the action sheet closes. They do not reconcile selected data with a successful query refresh. Production ItemActionSheet handlers call `onClose()` and then the selected detail/edit/delete callback synchronously.

The production lists and ItemActionSheet reproduce these issues in both normal mode and StrictMode:

- Select A and refresh a renamed A: action title and delete target retain the previous object/name.
- Select A and refresh a successful list without A: actions remain open and Hapus can open a new confirmation for an absent item.
- Select A, retain its rendered Hapus/Edit handlers, close the sheet and select B: the old Hapus closes B's sheet and opens B's delete confirmation. The old Edit closes B's sheet and navigates A. This represents a queued callback from a sheet session that has already closed; it is a contract reproduction, not a measured native gesture race.

The independent suite records **60 assertions: 18 pass/42 fail**, runtime/React/act errors **0**, unexpected warnings **0**. Seven failing expectations repeat across three domains and two renderer modes; this is not a count of 42 distinct defects. Source and before snapshots are frozen in this folder. Actual source loading hashes are in `results.json`.

Suggested minimal boundary: one private selection-content instance per explicit selection event generation, including same-ID reopen. Keep its deletion state scoped to that generation. A private action-sheet session mounts only while actions are open; a mounted guard rejects callbacks from an old committed session. The default handler's synchronous close-then-action must still work: setting an actions-active ref false inside onClose would reject valid actions. Cleanup of the session after React commit permits the synchronous normal action while blocking a retained callback after close/reopen/switch.

Use the full successful query list for canonical current names and membership rather than filtered rows. A filter excluding A does not prove A was removed. Drain/mask action and confirmation open state when a successful query lacks A so reappearance cannot reopen it. Loading/error absence is distinct from confirmed removal.

Preserve an already-submitted delete lifetime carefully: directly changing the child target to null or unmounting selection content whenever A disappears can erase the success modal when its own request invalidates the query and removes A. Retain the prior target only for hidden-confirmation/active-operation feedback when needed; keep confirmation closed and prevent new absent-target actions. Test successful deletion whose invalidation removes A before acknowledgement, pending/error/stale callback behavior, rename, removal/reappearance and same-ID reopen. This recommendation requires parent implementation review; this audit does not certify such a fix.

RoleWorkers was inspected and has no concrete next defect within this audit: it filters current worker query data by roleId, preserves loading/error/empty UI, and uses worker IDs for row navigation. The prior detail identity change already scopes the role detail tree per ID. No new feature/backend behavior is proposed there.

The suite executes actual list screens, actual ItemActionSheet, actual useAlertModal/useRefreshControl and actual display helpers. Query data, child delete dialog, native/presentation/router and Colors are adapters. DELETE/API IO, full navigation, browser/native layout, gesture timing and Figma parity are not certified. Figma callable tools are absent. Shared instructions and latest coordination were read; none of these three List/RoleWorkers sources had an active conflicting owner in the notes or an existing diff at audit start.

Execution Profile & Operator Tips: Medium. Frozen reproduction -> scoped list/session fix -> production-dialog/query fixture -> independent review -> QA/QC/PM. Keep valid synchronous close-then-action, distinguish same-ID reopen from refetch, and preserve delete success acknowledgement during list invalidation. Do not edit the frozen baseline or global shared ItemActionSheet for this domain scope.
