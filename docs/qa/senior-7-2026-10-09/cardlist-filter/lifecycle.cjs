const fs = require("node:fs"), path = require("node:path"), vm = require("node:vm"), ts = require("typescript");
const { React, act, create, errors } = require("../barcode-lifecycle.cjs");
const { fingerprint } = require("../select-availability/availability.cjs");
const assert = require("node:assert/strict");
const checks = [];
function check(name, actual, expected) {
	try { assert.deepEqual(actual, expected); checks.push({ name, pass: true }); }
	catch { checks.push({ name, pass: false, actual: structuredClone(actual), expected: structuredClone(expected) }); }
}
const source = "components/custom/CardList.tsx";
const exportsObject = {};
const hosts = names => Object.fromEntries(names.map(n => [n, n]));
const stubs = {
	"react": React, "react-native": hosts(["Pressable", "ScrollView", "View"]),
	"@expo/vector-icons": { Feather: "Feather" },
	"@gluestack-ui/utils/nativewind-utils": { tva: () => () => "" },
	"@/components/common/Text": "Text",
	"@/components/ui/actionsheet": hosts(["Actionsheet", "ActionsheetBackdrop", "ActionsheetContent", "ActionsheetDragIndicator", "ActionsheetDragIndicatorWrapper"]),
	"@/components/ui/button": hosts(["Button", "ButtonText"]),
	"@/constants/Colors": { Colors: { zinc: { 50: "white" } } },
	"@/lib/utils": { cn: (...args) => args.filter(Boolean).join(" ") },
};
vm.runInNewContext(ts.transpileModule(fs.readFileSync(source, "utf8"), { compilerOptions: {
	jsx: ts.JsxEmit.React, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true,
} }).outputText, { exports: exportsObject, require: name => {
	if(!(name in stubs)) throw new Error(`Unexpected dependency ${name}`); return stubs[name];
} }, { filename: source });
const { CardListFilterSheet, useCardListFilter, CardListSections } = exportsObject;
const sections = [{ id: "a", title: "Alpha", rows: [] }, { id: "b", title: "Beta", filterLabel: "Beta filter", rows: [] }];
function controls(renderer) {
	const rows = () => renderer.root.findAllByType("Pressable");
	return {
		selected: () => rows().filter(r => r.props.className.includes("border-primary-500")).map(r => r.findByType("Text").props.children),
		toggle: label => act(async () => rows().find(r => r.findByType("Text").props.children === label).props.onPress()),
		apply: () => act(async () => renderer.root.findAllByType("Button")[1].props.onPress()),
		reset: () => act(async () => renderer.root.findAllByType("Button")[0].props.onPress()),
		cancel: () => act(async () => renderer.root.findByType("Actionsheet").props.onClose()),
		isOpen: () => renderer.root.findByType("Actionsheet").props.isOpen,
	};
}
async function sheetSuite() {
	const events = []; let renderer;
	let props = { isOpen: true, sections, selectedIds: ["a"], onApply: ids => events.push(["apply", ...ids]), onClose: () => events.push(["close"]), onReset: () => events.push(["reset"]) };
	await act(async () => { renderer = create(React.createElement(CardListFilterSheet, props)); });
	const ui = controls(renderer);
	const update = patch => act(async () => { props = { ...props, ...patch }; renderer.update(React.createElement(CardListFilterSheet, props)); });
	check("initial committed IDs select correct filter labels", ui.selected(), ["Alpha"]);
	await ui.toggle("Beta filter"); check("toggling draft emits no callbacks", events, []);
	await update({ selectedIds: ["a"], sections: sections.map(s => ({ ...s })) });
	check("equivalent selectedIds and refreshed sections preserve draft", ui.selected(), ["Alpha", "Beta filter"]);
	await update({ title: "New title" }); check("title rerender preserves draft", ui.selected(), ["Alpha", "Beta filter"]);
	await update({ selectedIds: ["b"] }); check("changed external IDs replace draft", ui.selected(), ["Beta filter"]);
	await ui.toggle("Alpha"); await ui.cancel(); check("cancel only requests close", events, [["close"]]);
	await update({ isOpen: false }); await update({ isOpen: true }); check("reopen discards unsaved changes", ui.selected(), ["Beta filter"]);
	await ui.toggle("Beta filter"); await ui.apply(); check("empty selection is applied before close", events.slice(-2), [["apply"], ["close"]]);
	await update({ isOpen: false, selectedIds: [] }); await update({ isOpen: true }); check("explicit empty selection stays empty", ui.selected(), []);
	await ui.reset(); check("reset selects every current option", ui.selected(), ["Alpha", "Beta filter"]);
	check("reset emits its existing callback immediately", events.at(-1), ["reset"]);
	await ui.apply(); check("apply after reset emits all option IDs", events.at(-2), ["apply", "a", "b"]);
	await update({ isOpen: false, selectedIds: ["a"] }); await update({ selectedIds: ["b"] }); await update({ isOpen: true });
	check("external changes while closed initialize next open", ui.selected(), ["Beta filter"]);
	await update({ sections: [{ title: "Fallback title", rows: [] }], selectedIds: ["Fallback title"], onReset: undefined });
	check("title fallback remains a usable section ID", ui.selected(), ["Fallback title"]);
	await ui.reset(); await ui.apply(); check("reset without callback remains usable", events.at(-2), ["apply", "Fallback title"]);
	await update({ sections: [], selectedIds: [] }); await ui.reset(); await ui.apply(); check("empty sections apply empty selection", events.at(-2), ["apply"]);
	await act(async () => renderer.unmount());
}
async function integratedSuite() {
	let api, renderer; const commits = [];
	function Observation({ selected, visible }) {
		React.useLayoutEffect(() => { commits.push({ selected: [...selected], visible }); });
		return null;
	}
	function Harness({ groups, initialSelected }) {
		api = useCardListFilter(groups, { initialSelected });
		const flat = groups.flat(), visible = api.filterSections(flat);
		return React.createElement(React.Fragment, null,
			React.createElement(Observation, { selected: api.selectedIds, visible: visible.map(s => s.id ?? s.title) }),
			React.createElement(CardListSections, { sections: visible }),
			React.createElement(CardListFilterSheet, api.filterSheetProps));
	}
	let props = { groups: [sections], initialSelected: ["a"] };
	const update = patch => act(async () => { props = { ...props, ...patch }; renderer.update(React.createElement(Harness, props)); });
	await act(async () => { renderer = create(React.createElement(Harness, props)); });
	const ui = controls(renderer), visible = () => commits.at(-1).visible;
	check("nested sections respect initial subset", visible(), ["a"]);
	check("subset sets isFiltered", api.isFiltered, true);
	await act(async () => api.open()); await ui.toggle("Beta filter");
	check("sheet draft leaves report unchanged", visible(), ["a"]);
	await ui.cancel(); check("cancel closes integrated sheet", ui.isOpen(), false);
	await act(async () => api.open()); check("integrated reopen restores applied selection", ui.selected(), ["Alpha"]);
	await ui.toggle("Beta filter"); await ui.apply();
	check("apply updates report through production hook", visible(), ["a", "b"]);
	check("apply closes integrated sheet", ui.isOpen(), false);
	await act(async () => api.apply([])); check("empty selection hides all report sections", visible(), []);
	await act(async () => api.open()); await ui.reset();
	check("reset immediately restores report using existing onReset contract", visible(), ["a", "b"]);
	check("reset clears filtered status", api.isFiltered, false);
	await ui.toggle("Beta filter"); await ui.apply();
	await update({ groups: [sections.map(s => ({ ...s }))], initialSelected: "all" });
	check("equivalent groups and changed initial config preserve applied subset", visible(), ["a"]);
	commits.length = 0;
	await update({ groups: [{ id: "c", title: "Charlie", rows: [] }] });
	check("changed section identity never commits stale hidden report", commits.every(c => c.visible.join() === "c"), true);
	check("changed sections select all current IDs", [...api.selectedIds], ["c"]);
	await act(async () => api.open()); check("open sheet reflects current report identity", ui.selected(), ["Charlie"]);
	await update({ groups: [] }); check("empty groups reset selection", [...api.selectedIds], []);
	await update({ groups: [{ id: "a::b", title: "Joined", rows: [] }, { id: "c", title: "C", rows: [] }] });
	await act(async () => api.apply(["c"]));
	await update({ groups: [{ id: "a", title: "A", rows: [] }, { id: "b::c", title: "Other joined", rows: [] }] });
	check("IDs containing separator cannot collide across report identities", [...api.selectedIds], ["a", "b::c"]);
	check("collision case displays new report sections", visible(), ["a", "b::c"]);
	await act(async () => api.setSelectedIds(["a"])); check("public setter still filters sections", visible(), ["a"]);
	await act(async () => renderer.unmount());
	props = { groups: sections };
	await act(async () => { renderer = create(React.createElement(Harness, props)); });
	check("default initial selection is all", [...api.selectedIds], ["a", "b"]);
	await act(async () => renderer.unmount());
}
async function main() {
	const suite = process.argv[2] || "sheet", before = fingerprint(source);
	if(suite === "sheet") await sheetSuite(); else if(suite === "integration") await integratedSuite(); else throw Error(suite);
	check("no runtime errors or act warnings", errors, []);
	check("source stable throughout suite", fingerprint(source), before);
	const result = { suite, status: checks.every(c => c.pass) ? "PASS" : "FAIL", passed: checks.filter(c => c.pass).length, failed: checks.filter(c => !c.pass).length, checks, source: before, scope: "Production CardList filter sheet/hook/section renderer; React test renderer with RN/UI adapters. No full screen, API or native runtime." };
	fs.writeFileSync(path.join(__dirname, `${suite}-${process.argv.includes("--baseline") ? "baseline" : "results"}.json`), JSON.stringify(result, null, 2) + "\n");
	console.log(JSON.stringify(result, null, 2)); if(result.failed) process.exitCode = 1;
}
main().catch(e => { console.error(e); process.exitCode = 1; });
