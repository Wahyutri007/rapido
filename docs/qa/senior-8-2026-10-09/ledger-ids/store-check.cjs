const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const crypto = require("node:crypto");
const ts = require("typescript");
const baseline = process.argv.includes("--baseline");
const cache = new Map(),
	checks = [];
let clock = 1234;
class TestDate extends Date {
	static now() {
		return clock;
	}
}
function load(file) {
	const absolute = path.resolve(file);
	if (cache.has(absolute)) return cache.get(absolute).exports;
	const source = fs.readFileSync(
		baseline && file === "store/accountingStore.ts"
			? path.join(__dirname, "accountingStore.before.ts.txt")
			: absolute,
		"utf8",
	);
	const module = {
		exports: {},
		sha256: crypto.createHash("sha256").update(source).digest("hex"),
	};
	cache.set(absolute, module);
	const code = ts.transpileModule(source, {
		compilerOptions: {
			module: ts.ModuleKind.CommonJS,
			target: ts.ScriptTarget.ES2022,
		},
	}).outputText;
	vm.runInNewContext(
		code,
		{
			exports: module.exports,
			module,
			Date: TestDate,
			require: (name) =>
				name.startsWith("@/") ? load(name.slice(2) + ".ts") : require(name),
		},
		{ filename: absolute },
	);
	return module.exports;
}
const store = load("store/accountingStore.ts").useAccountingStore;
const check = (name, actual, expected) =>
	checks.push({
		name,
		passed: JSON.stringify(actual) === JSON.stringify(expected),
		actual,
		expected,
	});
const entry = (accountId = "a", amount = 10) => ({
	accountId,
	date: "2026-10-09",
	referenceNumber: "REF",
	title: "Test",
	description: "Fixture",
	type: "debit",
	amount,
});
const reset = (entries = {}) => store.setState({ ledgerEntries: entries });
const all = () => Object.values(store.getState().ledgerEntries).flat();
reset();
const original = store.getState();
const first = store.getState().addLedgerEntry(entry());
check("first insertion preserves existing ID format", first, "le-1234");
check(
	"returned ID belongs to inserted record",
	store.getState().ledgerEntries.a[0].id,
	first,
);
const second = store.getState().addLedgerEntry(entry("a", 20));
check("same millisecond receives distinct IDs", first !== second, true);
check(
	"same-account append retains both payloads",
	store.getState().ledgerEntries.a.map((e) => e.amount),
	[20, 10],
);
check("second collision uses suffix", second, "le-1234-1");
const beforeB = store.getState().ledgerEntries.a;
const third = store.getState().addLedgerEntry(entry("b", 30));
check(
	"cross-account collision also receives unique ID",
	new Set(all().map((e) => e.id)).size,
	3,
);
check(
	"other account array reference preserved",
	store.getState().ledgerEntries.a === beforeB,
	true,
);
check("cross-account insertion uses next suffix", third, "le-1234-2");
check(
	"getter returns each account collection",
	store
		.getState()
		.getAccountLedgerEntries("b")
		.map((e) => e.amount),
	[30],
);
const after = store.getState();
check(
	"all other collections/actions preserve references",
	Object.keys(original).filter(
		(key) => key !== "ledgerEntries" && original[key] !== after[key],
	),
	[],
);
const seed = [
	{ ...entry(), id: "le-1234" },
	{ ...entry(), id: "le-1234-1" },
	{ ...entry(), id: "le-1234-3" },
];
reset({ a: seed });
check(
	"existing suffix gaps are handled",
	store.getState().addLedgerEntry(entry()),
	"le-1234-2",
);
check(
	"occupied suffix is skipped",
	store.getState().addLedgerEntry(entry()),
	"le-1234-4",
);
check(
	"seed records are retained unchanged",
	seed.map((e) => e.id),
	["le-1234", "le-1234-1", "le-1234-3"],
);
clock = 5000;
const newer = store.getState().addLedgerEntry(entry());
check("new millisecond keeps unsuffixed format", newer, "le-5000");
clock = 1234;
check(
	"clock moving backward does not reuse an existing ID",
	store.getState().addLedgerEntry(entry()),
	"le-1234-5",
);
reset();
clock = 42;
const input = Object.freeze(entry("a", 99));
store.getState().addLedgerEntry(input);
check("input object is not mutated", Object.hasOwn(input, "id"), false);
check(
	"all input fields preserved",
	Object.fromEntries(
		Object.entries(store.getState().ledgerEntries.a[0]).filter(
			([key]) => key !== "id",
		),
	),
	input,
);
reset();
clock = 77;
const ids = Array.from({ length: 50 }, (_, i) =>
	store.getState().addLedgerEntry(entry(i % 2 ? "b" : "a", i)),
);
check("burst of 50 returns 50 unique IDs", new Set(ids).size, 50);
check("burst preserves every record", all().length, 50);
check(
	"burst stores exactly the returned IDs",
	all()
		.map((e) => e.id)
		.sort(),
	[...ids].sort(),
);
reset();
clock = 88;
let nested = false,
	nestedId;
const unsubscribe = store.subscribe(() => {
	if (!nested) {
		nested = true;
		nestedId = store.getState().addLedgerEntry(entry("b"));
	}
});
const outerId = store.getState().addLedgerEntry(entry("a"));
unsubscribe();
check("reentrant subscriber allocates distinct ID", outerId !== nestedId, true);
check(
	"reentrant return IDs each match their account",
	[
		store.getState().ledgerEntries.a[0].id,
		store.getState().ledgerEntries.b[0].id,
	],
	[outerId, nestedId],
);
const result = {
	date: "2026-10-09",
	timezone: "Asia/Jakarta",
	baseline,
	kind: "Production Zustand store with isolated fixtures and fixed Date.now; no app data or API mutation",
	passed: checks.filter((c) => c.passed).length,
	failed: checks.filter((c) => !c.passed).length,
	checks,
	files: [...cache].map(([file, m]) => ({
		file: path.relative(process.cwd(), file).replaceAll("\\", "/"),
		sha256: m.sha256,
	})),
};
fs.writeFileSync(
	path.join(__dirname, `${baseline ? "baseline" : "final"}-store.json`),
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
