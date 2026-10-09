// Run from app root. Production component + RHF, host adapters for native UI.
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const crypto = require("node:crypto");
const assert = require("node:assert/strict");
const ts = require("typescript");
const { React, act, create, errors } = require("../barcode-lifecycle.cjs");
const source = "components/common/MultiSelect.tsx";
const fingerprint = file => ({ file, sha256: crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex") });
const checks = [];
function check(name, actual, expected) {
	actual = structuredClone(actual); expected = structuredClone(expected);
	try { assert.deepEqual(actual, expected); checks.push({ name, pass: true }); }
	catch { checks.push({ name, pass: false, actual, expected }); }
}
const hosts = names => Object.fromEntries(names.map(n => [n, n]));
const stubs = {
	"react": React,
	"react-native": hosts(["Pressable", "View"]),
	"@expo/vector-icons": hosts(["Entypo", "Feather"]),
	"@gluestack-ui/utils/nativewind-utils": { tva: () => () => "" },
	"@/components/common/SearchBar": "SearchBar",
	"@/constants/Colors": { Colors: { zinc: { 400: "gray", 700: "darkgray" } } },
	"@/lib/utils": { cn: (...v) => v.filter(Boolean).join(" ") },
	"../ui/actionsheet": hosts(["Actionsheet", "ActionsheetBackdrop", "ActionsheetContent", "ActionsheetDragIndicator", "ActionsheetDragIndicatorWrapper", "ActionsheetScrollView"]),
	"./Text": "Text",
};
const exported = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync(source, "utf8"), { compilerOptions: {
	jsx: ts.JsxEmit.React, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true,
} }).outputText, { exports: exported, require: name => {
	if (!(name in stubs)) throw Error(`Unexpected dependency ${name}`); return stubs[name];
} }, { filename: source });
const { MultiSelect } = exported;
const items = [{ value: "a", label: "Alpha", description: "First" }, { value: "b", label: "Beta", description: "Second" }, { value: "c", label: "Gamma" }];
function controls(renderer) {
	const rows = () => renderer.root.findByType("ActionsheetScrollView").findAllByType("Pressable");
	const button = text => renderer.root.findAllByType("Pressable").find(p => p.findAllByType("Text").some(t => t.props.children === text));
	return {
		open: () => act(async () => renderer.root.findAllByType("Pressable")[0].props.onPress()),
		press: text => act(async () => button(text).props.onPress()),
		toggle: text => rows().find(p => p.findAllByType("Text").some(t => t.props.children === text)).props.onPress,
		all: () => button("Pilih Semua").props.onPress(),
		selected: () => rows().filter(p => p.findAllByType("Feather").length > 0).map(p => p.findAllByType("Text")[0].props.children),
		search: query => act(async () => renderer.root.findByType("SearchBar").props.setSearch(query)),
		query: () => renderer.root.findByType("SearchBar").props.search,
		isOpen: () => renderer.root.findByType("Actionsheet").props.isOpen,
		cancelBackdrop: () => act(async () => renderer.root.findByType("Actionsheet").props.onClose()),
		pill: label => renderer.root.findAllByType("Pressable").find(p => p.findAllByType("Entypo").some(i => i.props.name === "cross") && p.findByType("Text").props.children === label),
	};
}
const wrap = props => React.createElement(React.StrictMode, null, React.createElement(MultiSelect, props));
async function lifecycle() {
	let renderer;
	const events = [];
	let props = { items, selectedValues: ["a"], onValueChange: v => events.push([...v]) };
	await act(async () => { renderer = create(wrap(props)); });
	const ui = controls(renderer);
	const update = patch => act(async () => { props = { ...props, ...patch }; renderer.update(wrap(props)); });
	check("starts closed without writing value", [ui.isOpen(), events], [false, []]);
	await ui.open(); check("open follows committed selection", ui.selected(), ["Alpha"]);
	await act(async () => ui.toggle("Beta")());
	await update({ selectedValues: ["a"], items: items.map(i => ({ ...i })) });
	check("equivalent arrays preserve pending selection", ui.selected(), ["Alpha", "Beta"]);
	check("draft does not emit", events, []);
	await update({ selectedValues: ["c"] });
	check("external replacement wins while open", ui.selected(), ["Gamma"]);
	await ui.press("Selesai"); check("save cannot restore selection before external replacement", events.at(-1), ["c"]);
	check("save closes sheet", ui.isOpen(), false);
	await ui.open(); await act(async () => ui.toggle("Alpha")());
	await update({ selectedValues: [] });
	check("external empty reset clears open draft", ui.selected(), []);
	await ui.press("Selesai"); check("empty reset saves empty", events.at(-1), []);
	await update({ selectedValues: ["a"] }); await ui.open(); await act(async () => ui.toggle("Beta")());
	const eventCount = events.length; await ui.press("Batal");
	check("cancel emits nothing", events.length, eventCount);
	await ui.open(); check("reopen discards unsaved draft", ui.selected(), ["Alpha"]);
	await ui.search("second"); check("search includes description", ui.selected(), []);
	await act(async () => ui.all()); await ui.search("");
	check("select all filtered preserves hidden draft", ui.selected(), ["Alpha", "Beta"]);
	await ui.search("second"); await act(async () => ui.all()); await ui.search("");
	check("deselect filtered preserves hidden selections", ui.selected(), ["Alpha"]);
	await ui.search("absent"); await act(async () => ui.all()); await ui.search("");
	check("select all with no matches is harmless", ui.selected(), ["Alpha"]);
	await ui.search("Beta"); await ui.cancelBackdrop(); await ui.open();
	check("backdrop close clears search on reopen", ui.query(), "");
	check("backdrop cancel preserves committed IDs", ui.selected(), ["Alpha"]);
	await act(async () => { const toggle = ui.toggle("Beta"); toggle(); toggle(); });
	check("batched double toggle is reversible", ui.selected(), ["Alpha"]);
	await ui.cancelBackdrop(); await ui.open();
	await act(async () => { ui.toggle("Beta")(); ui.all(); });
	await ui.press("Selesai"); check("batched individual then all emits each ID once", events.at(-1), ["a", "b", "c"]);
	await ui.open(); await ui.search("second");
	await act(async () => { ui.toggle("Beta")(); ui.all(); }); await ui.search("");
	check("filtered toggle-all sees preceding pending toggle", ui.selected(), ["Alpha"]);
	await ui.cancelBackdrop(); await update({ selectedValues: [] }); await ui.open();
	await act(async () => { ui.all(); ui.all(); });
	check("batched double select-all returns empty selection", ui.selected(), []);
	await ui.press("Selesai"); check("batched double select-all emits empty", events.at(-1), []);
	await update({ selectedValues: ["a", "b"] });
	await act(async () => ui.pill("Alpha").props.onPress());
	check("pill removal is immediate and preserves remaining IDs", events.at(-1), ["b"]);
	await update({ selectedValues: ["unknown", "b"] }); await ui.open(); await ui.press("Selesai");
	check("unloaded committed IDs are preserved", events.at(-1), ["unknown", "b"]);
	await update({ selectedValues: ["a::b", "c"] }); await ui.open();
	await update({ selectedValues: ["a", "b::c"] }); await ui.press("Selesai");
	check("separator-containing IDs do not collide", events.at(-1), ["a", "b::c"]);
	await update({ selectedValues: ["c", "a"], items: [] }); await ui.open(); await ui.press("Selesai");
	check("temporarily empty options keep value and order", events.at(-1), ["c", "a"]);
	await act(async () => renderer.unmount());
}
async function integration() {
	const module = { exports: {} };
	new Function("module", "exports", "require", fs.readFileSync("node_modules/react-hook-form/dist/index.cjs.js", "utf8"))(
		module, module.exports, name => { if (name === "react") return React; throw Error(name); });
	const rhf = module.exports; let form, renderer;
	function Harness({ revision }) {
		form = rhf.useForm({ defaultValues: { ids: ["a"], note: "keep" } });
		return React.createElement(rhf.Controller, { control: form.control, name: "ids", render: ({ field }) =>
			React.createElement(MultiSelect, { items: items.map(i => ({ ...i })), selectedValues: [...field.value], onValueChange: field.onChange, label: `Toko ${revision}` }) });
	}
	const render = revision => React.createElement(React.StrictMode, null, React.createElement(Harness, { revision }));
	await act(async () => { renderer = create(render(0)); });
	const ui = controls(renderer);
	await ui.open(); await act(async () => ui.toggle("Beta")());
	check("RHF value stays committed while drafting", form.getValues("ids"), ["a"]);
	check("RHF remains pristine while drafting", form.getFieldState("ids").isDirty, false);
	await act(async () => renderer.update(render(1)));
	check("RHF parent rerender with fresh arrays preserves draft", ui.selected(), ["Alpha", "Beta"]);
	await ui.press("Selesai");
	check("confirm updates RHF", form.getValues("ids"), ["a", "b"]);
	check("confirm marks RHF dirty", form.getFieldState("ids").isDirty, true);
	await ui.open(); await act(async () => ui.toggle("Gamma")());
	await act(async () => form.reset({ ids: ["c"], note: "keep" }));
	check("RHF reset during open replaces draft", ui.selected(), ["Gamma"]);
	await ui.press("Selesai"); check("confirm after reset cannot resurrect old form values", form.getValues("ids"), ["c"]);
	check("confirm unchanged reset value stays pristine", form.getFieldState("ids").isDirty, false);
	await ui.open(); await act(async () => ui.toggle("Alpha")());
	await act(async () => form.setValue("ids", []));
	check("RHF setValue empty clears pending choices", ui.selected(), []);
	await ui.press("Selesai"); check("empty field confirmation remains empty", form.getValues("ids"), []);
	await act(async () => form.reset({ ids: ["a"], note: "keep" }));
	await ui.open(); await act(async () => ui.toggle("Beta")()); await ui.press("Batal");
	check("RHF cancel keeps value and pristine state", [form.getValues("ids"), form.getFieldState("ids").isDirty], [["a"], false]);
	await act(async () => ui.pill("Alpha").props.onPress());
	check("pill removal updates RHF immediately", form.getValues("ids"), []);
	check("other form fields are untouched", form.getValues("note"), "keep");
	await act(async () => renderer.unmount());
}
async function main() {
	const suite = process.argv[2] || "lifecycle";
	const files = [source, "node_modules/react-hook-form/dist/index.cjs.js"];
	const before = files.map(fingerprint);
	if (suite === "lifecycle") await lifecycle(); else if (suite === "integration") await integration(); else throw Error(suite);
	check("no unexpected runtime or act errors", errors, []);
	check("production inputs stable during test", files.map(fingerprint), before);
	const result = { suite, status: checks.every(c => c.pass) ? "PASS" : "FAIL", passed: checks.filter(c => c.pass).length, failed: checks.filter(c => !c.pass).length, checks, sources: before, scope: "StrictMode React production MultiSelect; integration also uses installed RHF Controller/useForm. Native/UI/SearchBar adapters, no native/browser/route/API certification." };
	fs.writeFileSync(path.join(__dirname, `${suite}-${process.argv.includes("--baseline") ? "baseline" : "results"}.json`), JSON.stringify(result, null, 2) + "\n");
	console.log(JSON.stringify(result)); process.exitCode = result.failed ? 1 : 0;
}
main().catch(e => { console.error(e); process.exitCode = 1; });
