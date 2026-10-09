const fs = require("node:fs");
const path = require("node:path");
const filename = path.join(__dirname, "review.cjs");
const original = fs.readFileSync(filename, "utf8");
const prefix = original.slice(0, original.lastIndexOf("(async () => {\n\tfor (const definition of definitions)"));
if (!prefix || prefix === original) throw new Error("Cannot find primary harness boundary.");
const adapted = prefix.replace('isSuccess: state.phase === "success", refetch:', 'isSuccess: state.phase === "success", isFetching: Boolean(state.fetching), refetch:');
if (adapted === prefix) throw new Error("GET fixture adapter marker not found.");
const supplementary = String.raw`
(async () => {
for (const definition of definitions) for (const strict of [false, true]) {
 const label = definition.name + "/" + (strict ? "StrictMode" : "normal");
 const assert = (name, actual, expected) => check(label + ": " + name, actual, expected);
 for (const phase of ["loading", "error"]) {
  await mount(definition, strict); await act(() => select("A"));
  const staleDelete = action("Hapus"), staleClose = sheet().props.onClose;
  await refresh([entity(definition.domain, "A"), entity(definition.domain, "B")], phase);
  await act(() => { staleDelete(); staleClose(); });
  assert(phase + " with cached A retires old actions/confirmation", [sheetOpen(), visible(Delete)], [false, false]);
  await refresh([entity(definition.domain, "A"), entity(definition.domain, "B")]);
  assert(phase + " recovery does not revive old selection", [sheetOpen(), visible(Delete)], [false, false]);
  await act(() => select("A"));
  assert(phase + " recovery explicit reopen creates new active session", sheetOpen(), true);
 }
 await mount(definition, strict); await act(() => select("A"));
 state.fetching = true;
 await refresh([entity(definition.domain, "A", true), entity(definition.domain, "B")]);
 assert("background fetch retains current action session", [sheetOpen(), sheetTitle()], [true, definition.domain + " A UPDATED"]);
 state.fetching = false;
 await act(() => renderer.root.findByType("SearchBar").props.setSearch("B"));
 assert("filter hides A row without retiring canonical A selection", [renderer.root.findByType("FlatList").props.data.map((item) => item.id), sheetOpen(), props(Delete).itemName], [["B"], true, definition.domain + " A UPDATED"]);
 await act(() => action("Hapus")());
 assert("filtered A still permits valid normal delete action", [sheetOpen(), visible(Delete)], [false, true]);
 await mount(definition, strict); await act(() => select("A")); await act(() => action("Hapus")());
 const completed = await begin(); await settle(completed);
 const oldSuccess = props(Success).onClose, oldConfirm = props(Delete).onConfirm;
 await act(() => select("A"));
 await act(() => { oldSuccess(); oldConfirm(); });
 assert("same-A reopen rejects prior-generation success and confirmation", [sheetOpen(), visible(Delete), visible(Success), calls.length, navigate.length], [true, false, false, 1, 0]);
 await mount(definition, strict); await act(() => select("A")); await act(() => action("Hapus")());
 const pending = await begin();
 await refresh([entity(definition.domain, "A"), entity(definition.domain, "B")], "error");
 await settle(pending, "network");
 assert("retired current request still reports its failure", [visible(Alert), visible(Delete), calls.length], [true, false, 1]);
 const errorButton = renderer.root.findByType(Alert).findAllByType("Button")[0]; await act(() => errorButton.props.onPress());
 await refresh([entity(definition.domain, "A"), entity(definition.domain, "B")]);
 assert("error recovery leaves previous confirmation closed", [visible(Alert), visible(Delete), sheetOpen()], [false, false, false]);
 await act(() => select("A")); await act(() => action("Hapus")());
 const retried = await begin(); await settle(retried);
 assert("explicit new selection can retry after retirement", [calls.length, visible(Success)], [2, true]);
}
await unmount(); console.error = oldError; console.warn = oldWarn;
const result = {
 status: "INTERNAL_QA_REVIEW_SUPPLEMENT", externalQcApproval: false, finishedAt: new Date().toISOString(),
 summary: { assertions: checks.length, passed: checks.filter((item) => item.pass).length, failed: checks.filter((item) => !item.pass).length, runtimeErrors: runtimeErrors.length, warnings: warnings.length },
 loadedSourceHashes: hashes, checks, runtimeErrors, warnings,
 harness: "Reuses primary harness prefix without running primary cases; adds only isFetching GET adapter field. Source modules/adapters otherwise same.",
 limitations: "Query/native/presentation/router adapters, actual mutation factory/Common/QueryClient/Axios memory transport. No actual GET/backend/HTTP/browser/native/full navigator."
};
const target = path.join(__dirname, "additional-results.json"); if (fs.existsSync(target)) throw new Error("Frozen supplemental result exists.");
fs.writeFileSync(target, JSON.stringify(result, null, 2) + "\n");
process.stdout.write(JSON.stringify(result.summary) + "\n"); for (const item of checks.filter((item) => !item.pass)) process.stdout.write(JSON.stringify(item) + "\n");
if (result.summary.failed || runtimeErrors.length || warnings.length) process.exitCode = 1;
})().catch((error) => { console.error = oldError; console.error(error); process.exitCode = 1; });
`;
new Function("require", "__dirname", adapted + supplementary)(require, __dirname);
