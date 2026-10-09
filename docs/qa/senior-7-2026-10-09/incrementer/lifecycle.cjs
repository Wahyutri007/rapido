// Run from the app root; uses the isolated React test tools documented in ../HANDOFF.md.
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const crypto = require("node:crypto");
const ts = require("typescript");
const { React, act, create, check, checks, errors, makeClock } = require("../barcode-lifecycle.cjs");

const sourceFiles = ["components/custom/Incrementer.tsx"];
function load(file, clock = makeClock(), commits) {
	const source = fs.readFileSync(file, "utf8");
	const compiled = ts.transpileModule(source, { compilerOptions: {
		jsx: ts.JsxEmit.React, module: ts.ModuleKind.CommonJS,
		target: ts.ScriptTarget.ES2022, esModuleInterop: true,
	} }).outputText;
	const exports = {};
	const ObservedText = props => {
		React.useLayoutEffect(() => { commits?.push(props.children); });
		return React.createElement("Text", props);
	};
	const requireStub = name => {
		if (name === "react") return React;
		if (name === "react-native") return { View: "View", Modal: "Modal", Pressable: "Pressable" };
		if (name === "../common/Text" || name === "@/components/common/Text") return ObservedText;
		if (name === "../icons") return { EEntypo: "EEntypo" };
		if (["../ui/button", "@/components/ui/button"].includes(name)) return { Button: "Button", ButtonGroup: "ButtonGroup", ButtonIcon: "ButtonIcon", ButtonText: "ButtonText" };
		if (name === "@/lib/utils") return { cn: (...values) => values.filter(Boolean).join(" ") };
		if (name === "@/constants/Colors") return { Colors: { primary: "blue", zinc: { 400: "gray" } } };
		if (name === "@expo/vector-icons/Feather") return "Feather";
		if (name === "@/components/custom/BarcodePreview") return "BarcodePreview";
		if (name === "@/components/custom/Incrementer") return load("components/custom/Incrementer.tsx", clock);
		throw new Error(`Unmapped dependency ${name} in ${file}`);
	};
	vm.runInNewContext(compiled, { exports, require: requireStub, setTimeout: clock.setTimeout, clearTimeout: clock.clearTimeout }, { filename: file });
	return exports.default;
}

async function incrementer() {
	const commits = [];
	const Component = load(sourceFiles[0], undefined, commits);
	const changes = [];
	let props = { value: 12, min: 1, max: 999, variant: "outline", size: "xl", onChange: value => changes.push(value) };
	let renderer;
	await act(async () => { renderer = create(React.createElement(Component, props)); });
	const update = async patch => { props = { ...props, ...patch }; await act(async () => renderer.update(React.createElement(Component, props))); };
	const value = () => renderer.root.findByType("Text").props.children;
	const press = async direction => { await act(async () => renderer.root.findAllByType("Button")[direction === "plus" ? 1 : 0].props.onPress()); };
	check("controlled first commit displays actual form value without a stale minimum", commits, [12]);
	check("controlled mount does not emit onChange", changes, []);
	commits.length = 0;
	await update({ value: 7 });
	check("external reset commits only the new value", commits, [7]);
	check("external reset does not emit onChange", changes, []);
	await press("plus");
	check("controlled increment proposes value to parent", changes, [8]);
	check("controlled value waits for parent acceptance", value(), 7);
	await update({ value: 8 });
	check("controlled parent echo updates count", value(), 8);
	await press("minus");
	check("controlled decrement uses latest external value", changes.at(-1), 7);
	await update({ value: 1 });
	await press("minus");
	check("minimum boundary callback stays at minimum", changes.at(-1), 1);
	await update({ value: 999 });
	await press("plus");
	check("maximum boundary callback stays at maximum", changes.at(-1), 999);
	await update({ value: 0, min: 0 });
	check("controlled zero is not treated as missing", value(), 0);
	await update({ value: 4 });
	await update({ value: undefined });
	check("controlled to local mode preserves last accepted value", value(), 4);
	await press("plus");
	check("local mode increments its own count", value(), 5);
	await press("minus");
	check("local mode decrements its own count", value(), 4);
	await update({ value: 20 });
	check("local to controlled mode follows external value", value(), 20);
	await update({ value: undefined });
	check("second mode handoff keeps latest controlled count", value(), 20);
	await act(async () => renderer.unmount());

	for (const variant of ["default", "outline"]) {
		props = { min: 1, initialValue: 0, max: 2, variant, onChange: n => changes.push(n) };
		await act(async () => { renderer = create(React.createElement(Component, props)); });
		check(`${variant}: local initial count respects minimum`, value(), 1);
		await press("minus");
		check(`${variant}: local count cannot fall below minimum`, value(), 1);
		await press("plus");
		await press("plus");
		check(`${variant}: local count cannot exceed maximum`, value(), 2);
		await update({ initialValue: 100, className: "w-32" });
		check(`${variant}: rerender and initialValue updates preserve local draft`, value(), 2);
		await update({ max: 3 });
		await press("plus");
		check(`${variant}: click uses updated maximum`, value(), 3);
		const changeCount = changes.length;
		await update({ disabled: true });
		check(`${variant}: disabled is forwarded as isDisabled to both buttons`, renderer.root.findAllByType("Button").map(b => b.props.isDisabled), [true, true]);
		await press("plus");
		await press("minus");
		check(`${variant}: disabled handlers preserve value`, value(), 3);
		check(`${variant}: disabled handlers do not emit changes`, changes.length, changeCount);
		await update({ disabled: false });
		await press("minus");
		check(`${variant}: re-enabling restores stepping`, value(), 2);
		await act(async () => renderer.unmount());
	}
	props = { initialValue: 3 };
	await act(async () => { renderer = create(React.createElement(Component, props)); });
	await press("plus");
	check("omitted callback and maximum support local stepping", value(), 4);
	await update({ value: 1000, max: 999 });
	check("authoritative external values are not silently clamped", value(), 1000);
	await act(async () => renderer.unmount());
}

function fingerprint() {
	return sourceFiles.map(file => ({ file, sha256: crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex") }));
}
if (require.main === module) (async () => {
	await incrementer();
	check("no React runtime errors or act warnings", errors, []);
	const result = { status: "PASS", count: checks.length, checks, errors, source: fingerprint(), scope: "Actual Incrementer with React 19 test renderer; native/button/text/icon primitives are host adapters." };
	fs.writeFileSync(path.join(__dirname, "lifecycle-results.json"), JSON.stringify(result, null, 2) + "\n");
	console.log(JSON.stringify(result, null, 2));
})().catch(error => {
	const result = { status: "FAIL", checks, source: fingerprint(), message: error.message, actual: error.actual, expected: error.expected };
	if (process.argv.includes("--baseline")) fs.writeFileSync(path.join(__dirname, "baseline-results.json"), JSON.stringify(result, null, 2) + "\n");
	console.error(result);
	process.exitCode = 1;
});

module.exports = { load };
