// Complete production screen + production Zustand actions, isolated fixture state.
// Native/presentation children are host adapters; no real API or device access.
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const crypto = require("node:crypto");
const ts = require("typescript");
process.env.TZ = "Asia/Jakarta";
const toolsPath = path.resolve(".expo/senior7-test-tools/node_modules");
const React = require(path.join(toolsPath, "react"));
require("react");
require.cache[require.resolve("react")].exports = React;
const { act, create } = require(path.join(toolsPath, "react-test-renderer"));
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const baseline = process.argv.includes("--baseline");
const stage = process.argv.includes("--totals") ? "totals" : "all";
const screenFile =
	"app/(no-layout)/(back-office)/report/accounting/general-ledger/detail.tsx";
const cache = new Map(),
	checks = [],
	errors = [];
let currentId = "a",
	clock = new Date(2026, 9, 9, 12);
let clockTick = 0;
class ClockDate extends Date {
	constructor(...args) {
		super(...(args.length ? args : [clock.getTime()]));
	}
	// Production entry IDs use Date.now(); separate test actions by a millisecond.
	static now() {
		return clock.getTime() + clockTick++;
	}
}
const originalError = console.error;
console.error = (...args) => {
	if (String(args[0]).includes("react-test-renderer is deprecated")) return;
	errors.push(args.map(String).join(" "));
	originalError(...args);
};
function load(file) {
	const absolute = path.resolve(file);
	if (cache.has(absolute)) return cache.get(absolute).exports;
	const actualFile =
		baseline && file === screenFile
			? ".expo/senior8-ledger-filters/baseline-detail.tsx"
			: file;
	const source = fs.readFileSync(actualFile, "utf8");
	const module = {
		exports: {},
		sha256: crypto.createHash("sha256").update(source).digest("hex"),
	};
	cache.set(absolute, module);
	function requireModule(name) {
		if (name === "react") return React;
		if (name === "react/jsx-runtime")
			return require(path.join(toolsPath, "react/jsx-runtime"));
		if (name === "react-native")
			return { View: "View", TextInput: "TextInput", Pressable: "Pressable" };
		if (name === "expo-router")
			return { useLocalSearchParams: () => ({ id: currentId }) };
		if (name.startsWith("@expo/vector-icons")) return "Icon";
		if (name === "@/components/feature/accounting/general-ledger")
			return Object.fromEntries(
				[
					"LedgerDetailHeaderCard",
					"LedgerDetailSummaryCard",
					"LedgerEntryCard",
					"LedgerPeriodActionSheet",
					"LedgerTypeActionSheet",
				].map((n) => [n, n]),
			);
		if (name.startsWith("@/components/")) return name.split("/").at(-1);
		if (name.startsWith("@/")) return load(name.slice(2) + ".ts");
		return require(name);
	}
	const code = ts.transpileModule(source, {
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
			require: requireModule,
			console,
			Date: ClockDate,
			setTimeout,
			clearTimeout,
		},
		{ filename: absolute },
	);
	return module.exports;
}
const store = load("store/accountingStore.ts").useAccountingStore;
const Screen = load(screenFile).default;
const account = {
	id: "a",
	name: "Cash",
	code: "101",
	classification: "Aset",
	subClassification: "Cash",
	currency: "IDR",
	totalDebit: 999,
	totalCredit: 888,
	balance: 111,
};
const row = (id, type, amount, date = "2026-10-09", accountId = "a") => ({
	id,
	accountId,
	referenceNumber: id,
	title: id,
	description: "Ledger fixture",
	type,
	amount,
	date,
});
let renderer;
const check = (name, actual, expected) =>
	checks.push({
		name,
		passed: JSON.stringify(actual) === JSON.stringify(expected),
		actual,
		expected,
	});
const rows = () =>
	renderer.root
		.findAllByType("LedgerEntryCard")
		.map((node) => node.props.entry.id);
const totals = () => {
	const props = renderer.root.findByType("LedgerDetailSummaryCard").props;
	return [props.totalDebit, props.totalCredit];
};
const search = async (value) =>
	act(async () =>
		renderer.root.findByType("TextInput").props.onChangeText(value),
	);
const type = async (value) =>
	act(async () =>
		renderer.root.findByType("LedgerTypeActionSheet").props.onSelectType(value),
	);
const period = async (value) =>
	act(async () =>
		renderer.root
			.findByType("LedgerPeriodActionSheet")
			.props.onSelectPeriod(value),
	);
const entries = async (list) =>
	act(async () => store.setState({ ledgerEntries: { a: list } }));
async function main() {
	store.setState({
		ledgerAccounts: [account],
		ledgerEntries: {
			a: [row("sale", "debit", 100), row("cost", "credit", 20)],
		},
	});
	await act(async () => {
		renderer = create(React.createElement(Screen));
	});
	check("unfiltered sums derive from actual rows", totals(), [100, 20]);
	await search("not-present");
	check("empty search renders no rows", rows(), []);
	check("QC-S8-LEGACY-001 empty search summary is zero", totals(), [0, 0]);
	await search("SALE");
	check("one-sided search has zero opposite total", totals(), [100, 0]);
	await search("");
	await type("credit");
	check("credit-only type has zero debit", totals(), [0, 20]);
	await type("debit");
	check("debit-only type has zero credit", totals(), [100, 0]);
	await act(async () =>
		store.getState().addLedgerEntry(row("new", "debit", 40)),
	);
	check(
		"production addLedgerEntry updates filtered totals",
		totals(),
		[140, 0],
	);
	check(
		"type selection survives store update",
		renderer.root.findByType("LedgerTypeActionSheet").props.selectedType,
		"debit",
	);
	await type("all");
	check("clear type restores both totals", totals(), [140, 20]);
	await entries([]);
	check("empty account entries never use metadata totals", totals(), [0, 0]);
	await entries([row("zero", "debit", 0)]);
	check("zero amount remains zero", totals(), [0, 0]);
	await act(async () => store.setState({ ledgerAccounts: [] }));
	check(
		"empty accounts render not-found state",
		renderer.root.findAllByType("LedgerDetailSummaryCard").length,
		0,
	);
	await act(async () => store.setState({ ledgerAccounts: [account] }));
	check(
		"restored account remains zero without positive entries",
		totals(),
		[0, 0],
	);
	check(
		"account balance metadata is not fabricated from filtered turnover",
		renderer.root.findByType("LedgerDetailSummaryCard").props.endingBalance,
		111,
	);
	if (stage === "all") {
		const fixtures = [
			row("old", "debit", 1, "2020-01-01"),
			row("september", "debit", 2, "2026-09-30"),
			row("oct-start", "debit", 3, "01-10-2026"),
			row("oct-end", "credit", 4, "2026-10-31"),
			row("november", "debit", 5, "1 November 2026"),
			row("dec-end", "credit", 6, "2026-12-31"),
			row("next-year", "debit", 7, "2027-01-01"),
			row("bad", "debit", 8, "2026-02-30"),
		];
		await entries(fixtures);
		await period("month");
		check("QC-S8-LEGACY-002 month excludes 2020 entry", rows(), [
			"oct-start",
			"oct-end",
		]);
		check("monthly summary uses same filtered rows", totals(), [3, 4]);
		await period("quarter");
		check("calendar quarter includes October through December", rows(), [
			"oct-start",
			"oct-end",
			"november",
			"dec-end",
		]);
		check("quarter summary", totals(), [8, 10]);
		await period("year");
		check("calendar year excludes other years and invalid dates", rows(), [
			"september",
			"oct-start",
			"oct-end",
			"november",
			"dec-end",
		]);
		await period("all");
		check(
			"all periods retains legacy entries including invalid date",
			rows(),
			fixtures.map((e) => e.id),
		);
		await period("month");
		await search("OCT");
		await type("credit");
		check("period combines with type and search", rows(), ["oct-end"]);
		check("combined summary", totals(), [0, 4]);
		await search("missing");
		check("empty period search yields zero totals", totals(), [0, 0]);
		await search("");
		await type("all");
		await act(async () =>
			store.getState().addLedgerEntry(row("future", "debit", 50, "2027-01-01")),
		);
		check("out-of-period store update remains excluded", totals(), [3, 4]);
		await act(async () =>
			store
				.getState()
				.addLedgerEntry(row("new-oct", "debit", 10, "09-10-2026")),
		);
		check("in-period store update refreshes summary", totals(), [13, 4]);
		clock = new Date(2026, 10, 1, 0, 1);
		await period("month");
		check(
			"reselect current month after rollover refreshes reference date",
			rows(),
			["november"],
		);
		clock = new Date(2027, 0, 1, 12);
		await period("year");
		check(
			"reselect current year after rollover",
			rows().includes("next-year"),
			true,
		);
		check(
			"new year excludes previous December",
			rows().includes("dec-end"),
			false,
		);
		clock = new Date(2026, 9, 9, 12);
		await period("month");
		await act(async () => {
			currentId = "b";
			store.setState({
				ledgerAccounts: [account, { ...account, id: "b" }],
				ledgerEntries: {
					...store.getState().ledgerEntries,
					b: [row("b-entry", "credit", 12, "2026-10-02", "b")],
				},
			});
			renderer.update(React.createElement(Screen));
		});
		check("account switch selects only its own entries", rows(), ["b-entry"]);
		check(
			"account switch recalculates summary with same period",
			totals(),
			[0, 12],
		);
	}
	await act(async () => renderer.unmount());
	check("no unexpected React runtime errors", errors, []);
	const files = [...cache].map(([file, m]) => ({
		file: path.relative(process.cwd(), file).replaceAll("\\", "/"),
		sha256: m.sha256,
	}));
	const result = {
		date: "2026-10-09",
		timezone: "Asia/Jakarta",
		baseline,
		stage,
		passed: checks.filter((c) => c.passed).length,
		failed: checks.filter((c) => !c.passed).length,
		checks,
		errors,
		files,
		scope:
			"Complete production screen + Zustand in-memory fixtures; RN and presentation children adapted. No native/UI/API verification.",
	};
	fs.writeFileSync(
		path.join(__dirname, `${baseline ? "baseline" : "final"}-${stage}.json`),
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
main().catch((error) => {
	console.error(error);
	process.exitCode = 2;
});
