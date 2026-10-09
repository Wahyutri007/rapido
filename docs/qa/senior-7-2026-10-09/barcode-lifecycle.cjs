// Run from the app root. Test-only dependencies live outside the app package.
// npm install --prefix .expo/senior7-test-tools --no-audit --no-fund --package-lock=false react@19.2.3 react-test-renderer@19.2.3
// node docs/qa/senior-7-2026-10-09/barcode-lifecycle.cjs print
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const React = require(path.resolve(".expo/senior7-test-tools/node_modules/react"));
const { act, create } = require(path.resolve(".expo/senior7-test-tools/node_modules/react-test-renderer"));
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const checks = [];
const errors = [];
const originalError = console.error;
console.error = (...args) => {
	// React 19's renderer deprecation is expected for this isolated lifecycle test.
	if (String(args[0]).includes("react-test-renderer is deprecated")) return;
	errors.push(args.map(String).join(" "));
	originalError(...args);
};
function check(name, actual, expected) {
	assert.deepEqual(actual, expected, name);
	checks.push(name);
}
function loadComponent(file, clock) {
	const source = fs.readFileSync(file, "utf8");
	const output = ts.transpileModule(source, { compilerOptions: {
		jsx: ts.JsxEmit.React, module: ts.ModuleKind.CommonJS,
		target: ts.ScriptTarget.ES2022, esModuleInterop: true,
	} }).outputText;
	const exports = {};
	const requireStub = (name) => {
		if (name === "react") return React;
		if (name === "@expo/vector-icons") return { Entypo: "Entypo", Feather: "Feather" };
		if (name === "lucide-react-native") return { ArrowDownAZ: "ArrowDownAZ", ArrowDownZA: "ArrowDownZA", Clock: "Clock" };
		if (name === "@gluestack-ui/utils/nativewind-utils") return { tva: () => () => "" };
		if (name === "@/lib/haptics") return { haptic: { selection() {} } };
		if (name === "react-native") return Object.fromEntries(["Modal", "View", "Pressable", "Image", "ScrollView"].map(n => [n, n]));
		if (name === "@/constants/Colors") return { Colors: { primary: "blue", zinc: { 400: "gray" } } };
		if (name === "@/lib/utils") return { cn: (...values) => values.filter(Boolean).join(" ") };
		if (name === "@/components/ui/button") return { Button: "Button", ButtonText: "ButtonText" };
		if (name === "@/components/ui/actionsheet") return Object.fromEntries(["Actionsheet", "ActionsheetBackdrop", "ActionsheetContent", "ActionsheetDragIndicator", "ActionsheetDragIndicatorWrapper", "ActionsheetScrollView"].map(n => [n, n]));
		return name.split("/").at(-1);
	};
	vm.runInNewContext(output, { exports, require: requireStub, setTimeout: clock.setTimeout, clearTimeout: clock.clearTimeout }, { filename: file });
	return exports.default;
}
function makeClock() {
	let now = 0, nextId = 0;
	const jobs = new Map();
	return {
		setTimeout: (fn, delay) => { const id = ++nextId; jobs.set(id, { fn, at: now + delay }); return id; },
		clearTimeout: id => jobs.delete(id),
		advance: async (delay) => {
			const until = now + delay;
			while (true) {
				const next = [...jobs].filter(([, job]) => job.at <= until).sort((a, b) => a[1].at - b[1].at)[0];
				if (!next) break;
				now = next[1].at;
				jobs.delete(next[0]);
				await act(async () => next[1].fn());
			}
			now = until;
		},
		pending: () => jobs.size,
	};
}
async function testPrint() {
	const clock = makeClock();
	const Component = loadComponent("components/feature/barcode/PrintBarcodeModal.tsx", clock);
	let confirmations = [], closes = 0;
	let props = { isOpen: true, onClose: () => closes++, productName: "Produk A", barcodeValue: "A", defaultCopies: 2, onConfirmPrint: n => confirmations.push(n) };
	let renderer;
	await act(async () => { renderer = create(React.createElement(Component, props)); });
	const update = async patch => { props = { ...props, ...patch }; await act(async () => renderer.update(React.createElement(Component, props))); };
	const quantity = () => renderer.root.findByType("Incrementer");
	const print = () => renderer.root.findAllByType("Button").find(b => b.props.isLoading !== undefined);
	check("initial quantity follows defaultCopies", quantity().props.value, 2);
	await act(async () => quantity().props.onChange(4));
	await update({ productName: "Produk A diperbarui" });
	check("unrelated rerender preserves quantity draft", quantity().props.value, 4);
	await update({ defaultCopies: 3 });
	check("new defaultCopies resets open dialog", quantity().props.value, 3);
	const press = print().props.onPress;
	await act(async () => { press(); press(); });
	check("rapid double press schedules one print", clock.pending(), 1);
	check("print action disabled during printing", print().props.isDisabled, true);
	await clock.advance(999);
	check("print confirmation waits for simulated job", confirmations.length, 0);
	await clock.advance(1);
	check("one confirmation carries selected copies", confirmations, [3]);
	check("success prevents repeat printing", print().props.isDisabled, true);
	await act(async () => print().props.onPress());
	check("success press schedules no duplicate job", clock.pending(), 1);
	await clock.advance(1200);
	check("success closes once after delay", closes, 1);
	await update({ isOpen: false });
	await update({ isOpen: true });
	check("reopening resets quantity", quantity().props.value, 3);
	check("reopening clears success and loading", [print().props.isDisabled, print().props.isLoading], [false, false]);
	await act(async () => print().props.onPress());
	await update({ isOpen: false });
	check("closing pending print cancels its timer", clock.pending(), 0);
	await update({ isOpen: true });
	await clock.advance(2500);
	check("old job cannot confirm or close reopened modal", [confirmations.length, closes], [1, 1]);
	await act(async () => print().props.onPress());
	await clock.advance(1000);
	await update({ isOpen: false });
	await update({ isOpen: true });
	await clock.advance(1200);
	check("old success timer cannot close reopened modal", closes, 1);
	await act(async () => quantity().props.onChange(8));
	await act(async () => print().props.onPress());
	await update({ barcodeValue: "B" });
	check("new barcode starts fresh quantity and cancels old job", [quantity().props.value, clock.pending()], [3, 0]);
	await act(async () => print().props.onPress());
	await update({ defaultCopies: 5 });
	check("default change cancels pending job", [quantity().props.value, clock.pending()], [5, 0]);
	await act(async () => print().props.onPress());
	await update({ format: "qrcode" });
	check("format change cancels pending job", clock.pending(), 0);
	await act(async () => print().props.onPress());
	await act(async () => renderer.unmount());
	check("unmount clears all timers", clock.pending(), 0);
	await clock.advance(3000);
	check("unmounted component causes no further callback", [confirmations.length, closes], [2, 1]);
}
async function testPicker() {
	const Component = loadComponent("components/feature/barcode/ProductPickerSheet.tsx", makeClock());
	const products = [
		{ id: "a", name: "Bakmie", category: "Makanan", stock: 12 },
		{ id: "b", name: "Salad", category: "Makanan", stock: 8 },
	];
	let selected = [], closes = 0;
	let props = { isOpen: true, onClose: () => closes++, selectedProductId: "a", onSelect: p => selected.push(p), products };
	let renderer;
	await act(async () => { renderer = create(React.createElement(Component, props)); });
	const update = async patch => { props = { ...props, ...patch }; await act(async () => renderer.update(React.createElement(Component, props))); };
	const search = () => renderer.root.findByType("SearchBar");
	const rows = () => renderer.root.findAllByType("Pressable").slice(2);
	const chosenNames = () => rows().filter(r => r.props.className.includes("border-primary ")).map(r => r.findAllByType("Text")[0].props.children);
	const choose = async name => { const row = rows().find(r => r.findAllByType("Text")[0].props.children === name); assert.ok(row); await act(async () => row.props.onPress()); };
	const done = async () => { await act(async () => renderer.root.findAllByType("Pressable")[1].props.onPress()); };
	const cancel = async () => { await act(async () => renderer.root.findAllByType("Pressable")[0].props.onPress()); };
	check("picker opens with committed product", chosenNames(), ["Bakmie"]);
	await choose("Salad");
	check("draft selection does not commit early", selected.length, 0);
	await act(async () => search().props.setSearch("sAL"));
	check("case-insensitive search filters visible products", rows().length, 1);
	const updatedProducts = products.map(p => ({ ...p, stock: p.stock + 1 }));
	await update({ products: updatedProducts });
	check("products refetch preserves draft selection", chosenNames(), ["Salad"]);
	check("products refetch preserves search", search().props.search, "sAL");
	await done();
	check("done commits newest product record", selected[0], updatedProducts[1]);
	check("done requests close once", closes, 1);
	await update({ isOpen: false });
	await update({ isOpen: true });
	check("reopen discards uncommitted selection", chosenNames(), ["Bakmie"]);
	check("reopen clears search", search().props.search, "");
	await choose("Salad");
	await cancel();
	check("cancel closes without committing draft", [selected.length, closes], [1, 2]);
	await update({ isOpen: false });
	await update({ isOpen: true, selectedProductId: "b" });
	check("reopen follows updated committed selection", chosenNames(), ["Salad"]);
	await act(async () => search().props.setSearch("nothing"));
	check("no search match produces empty list", rows().length, 0);
	await update({ selectedProductId: "a" });
	check("external selection while open resets draft and search", [chosenNames(), search().props.search], [["Bakmie"], ""]);
	await update({ selectedProductId: undefined });
	check("cleared external selection is reflected", chosenNames(), []);
	await done();
	check("done without selection does not emit product", [selected.length, closes], [1, 3]);
	await choose("Salad");
	await update({ products: [updatedProducts[0]] });
	await done();
	check("removed draft product is never submitted", selected.length, 1);
	await update({ isOpen: false, selectedProductId: "a" });
	await update({ selectedProductId: "b", products: updatedProducts });
	await update({ isOpen: true });
	check("selection changed while closed is used on open", chosenNames(), ["Salad"]);
	await update({ products: [] });
	check("empty products render without errors", rows().length, 0);
	await update({ products: undefined, selectedProductId: "prod-1" });
	check("default mock products remain available", chosenNames(), ["Bakmie"]);
	await act(async () => renderer.unmount());
}
module.exports = { React, act, create, check, checks, errors, loadComponent, makeClock };
if (require.main === module) (async () => {
	const suite = process.argv[2] || "print";
	assert.ok(["print", "picker"].includes(suite));
	if (suite === "print") await testPrint();
	else await testPicker();
	check("no React runtime errors or act warnings", errors, []);
	const result = { suite, checks, count: checks.length, errors, scope: "Actual component lifecycle using React 19 test renderer; native/UI primitives are host stubs. No printer, API, browser or native device integration." };
	fs.writeFileSync(path.join(__dirname, `${suite}-results.json`), JSON.stringify(result, null, 2) + "\n");
	console.log(JSON.stringify(result, null, 2));
})().catch(error => { console.error(error); process.exitCode = 1; });
