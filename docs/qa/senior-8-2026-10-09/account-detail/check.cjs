const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const crypto = require("node:crypto");
const ts = require("typescript");
const toolsPath = path.resolve(".expo/senior7-test-tools/node_modules");
const React = require(path.join(toolsPath, "react"));
require("react");
require.cache[require.resolve("react")].exports = React;
const { act, create } = require(path.join(toolsPath, "react-test-renderer"));
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const baseline = process.argv.includes("--baseline");
const screen =
	"app/(no-layout)/(back-office)/report/accounting/accounts/detail.tsx";
let currentId = "b";
const cache = new Map(),
	checks = [],
	errors = [];
const originalError = console.error;
console.error = (...args) => {
	if (String(args[0]).includes("react-test-renderer is deprecated")) return;
	errors.push(args.map(String).join(" "));
	originalError(...args);
};
function load(file) {
	if (cache.has(file)) return cache.get(file).exports;
	const content = fs.readFileSync(
		baseline && file === screen
			? path.join(__dirname, "detail.before.tsx.txt")
			: file,
		"utf8",
	);
	const module = {
		exports: {},
		sha256: crypto.createHash("sha256").update(content).digest("hex"),
	};
	cache.set(file, module);
	function localRequire(name) {
		if (name === "react") return React;
		if (name === "react/jsx-runtime")
			return require(path.join(toolsPath, "react/jsx-runtime"));
		if (name === "expo-router")
			return { useLocalSearchParams: () => ({ id: currentId }) };
		if (name === "react-native")
			return { View: "View", ScrollView: "ScrollView" };
		if (name.startsWith("@expo/vector-icons")) return "Icon";
		if (name === "@/components/icons") return { WalletIcon: "WalletIcon" };
		if (name.startsWith("@/components/")) return name.split("/").at(-1);
		if (name === "@/lib/utils") return { formatRp: (n) => "Rp" + n };
		if (name.startsWith("@/")) return load(name.slice(2) + ".ts");
		return require(name);
	}
	const code = ts.transpileModule(content, {
		compilerOptions: {
			module: ts.ModuleKind.CommonJS,
			target: ts.ScriptTarget.ES2022,
			jsx: ts.JsxEmit.ReactJSX,
			esModuleInterop: true,
		},
	}).outputText;
	vm.runInNewContext(
		code,
		{
			module,
			exports: module.exports,
			require: localRequire,
			console,
			Date,
			setTimeout,
			clearTimeout,
		},
		{ filename: file },
	);
	return module.exports;
}
const store = load("store/accountingStore.ts").useAccountingStore;
const Screen = load(screen).default;
const a = {
	id: "a",
	name: "Cash A",
	code: "101",
	classification: "Aset",
	subClassification: "Kas",
	currency: "IDR",
	description: "Account A",
	debit: 100,
	credit: 0,
};
const b = {
	...a,
	id: "b",
	name: "Bank B",
	code: "102",
	description: "Account B",
	debit: 0,
	credit: 30,
};
let renderer;
const element = () =>
	React.createElement(React.StrictMode, null, React.createElement(Screen));
const check = (name, actual, expected) =>
	checks.push({
		name,
		actual,
		expected,
		passed: JSON.stringify(actual) === JSON.stringify(expected),
	});
const texts = () =>
	renderer.root.findAllByType("Text").map((n) => n.props.children);
const details = () =>
	Object.fromEntries(
		renderer.root
			.findAllByType("DetailRow")
			.map((n) => [n.props.label, n.props.value]),
	);
const summary = () =>
	texts().filter((n) => typeof n === "string" && n.startsWith("Rp"));
const absent = () => ({
	missing: texts().includes("Akun tidak ditemukan"),
	rows: renderer.root.findAllByType("DetailRow").length,
	summary: summary(),
	accountNames: texts().filter((n) => n === a.name || n === b.name),
});
async function route(id) {
	await act(async () => {
		currentId = id;
		renderer.update(element());
	});
}
async function main() {
	store.setState({ accounts: [a, b] });
	await act(async () => {
		renderer = create(element());
	});
	check("valid B displays its name", details().Nama, "Bank B");
	check("valid B nominal uses its own credit", details().Nominal, "Rp30");
	check("summary retains whole-account totals contract", summary(), [
		"Rp100",
		"Rp30",
		"Rp70",
	]);
	for (const [label, id] of [
		["unknown", "missing"],
		["missing", undefined],
		["empty", ""],
		["whitespace", " "],
		["empty array", []],
		["unknown array", ["missing"]],
		["empty first", ["", "b"]],
	]) {
		await route(id);
		check(label + " route renders only not-found", absent(), {
			missing: true,
			rows: 0,
			summary: [],
			accountNames: [],
		});
	}
	await route(["b"]);
	check("array B selects B", details().Nama, "Bank B");
	await route(["b", "a"]);
	check(
		"multiple parameter follows first-value convention",
		details().Nama,
		"Bank B",
	);
	await route("a");
	check("valid route recovers A", details().Nama, "Cash A");
	await route("b");
	await act(async () => store.getState().updateBalance("a", 200, 0));
	check("other account update refreshes global summary", summary(), [
		"Rp200",
		"Rp30",
		"Rp170",
	]);
	check(
		"other account update keeps selected account",
		details().Nama,
		"Bank B",
	);
	await act(async () => store.getState().updateBalance("b", 0, 200));
	check(
		"selected account update refreshes nominal",
		details().Nominal,
		"Rp200",
	);
	check("balanced totals update summary", summary(), ["Rp200", "Rp200", "Rp0"]);
	check("balanced badge is visible", texts().includes("Seimbang"), true);
	await act(async () => store.getState().resetBalance("b"));
	check("reset selected account updates nominal", details().Nominal, "Rp0");
	check("reset selected account updates summary", summary(), [
		"Rp200",
		"Rp0",
		"Rp200",
	]);
	await act(async () =>
		store.getState().updateAccount("b", { name: "Updated B", currency: "USD" }),
	);
	check(
		"metadata changes refresh detail",
		[details().Nama, details()["Mata Uang"]],
		["Updated B", "USD"],
	);
	await act(async () => store.setState({ accounts: [b, a] }));
	check("reordering preserves selected account", details().Nama, "Bank B");
	await act(async () => store.getState().deleteAccount("b"));
	check("delete selected account shows no substitute", absent(), {
		missing: true,
		rows: 0,
		summary: [],
		accountNames: [],
	});
	await act(async () => store.setState({ accounts: [a, b] }));
	check(
		"restore collection recovers selected account",
		details().Nama,
		"Bank B",
	);
	await act(async () => store.getState().deleteAccount("a"));
	check("delete another account preserves selection", details().Nama, "Bank B");
	check("delete another account refreshes global totals", summary(), [
		"Rp0",
		"Rp30",
		"Rp30",
	]);
	await act(async () => store.setState({ accounts: [] }));
	check("empty collection shows not-found", absent(), {
		missing: true,
		rows: 0,
		summary: [],
		accountNames: [],
	});
	await act(async () => store.setState({ accounts: [b] }));
	check("collection arrives after mount", details().Nama, "Bank B");
	await route(undefined);
	await act(async () => store.setState({ accounts: [a, b] }));
	check("data arrival without ID does not pick first", absent(), {
		missing: true,
		rows: 0,
		summary: [],
		accountNames: [],
	});
	await act(async () => renderer.unmount());
	check("no unexpected React errors", errors, []);
	const result = {
		baseline,
		passed: checks.filter((c) => c.passed).length,
		failed: checks.filter((c) => !c.passed).length,
		checks,
		errors,
		files: [...cache].map(([file, m]) => ({ file, sha256: m.sha256 })),
		limits:
			"Full screen and Zustand StrictMode, route/host/formatter adapters; no router/native/API/Figma verification.",
	};
	fs.writeFileSync(
		path.join(__dirname, baseline ? "baseline.json" : "final.json"),
		JSON.stringify(result, null, 2) + "\n",
	);
	console.log(
		JSON.stringify({
			passed: result.passed,
			failed: result.failed,
			failures: checks.filter((c) => !c.passed),
		}),
	);
	process.exitCode = result.failed ? 1 : 0;
}
main().catch((e) => {
	console.error(e);
	process.exitCode = 2;
});
