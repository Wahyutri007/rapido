const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const crypto = require("node:crypto");
const ts = require("typescript");
process.env.TZ = "Asia/Jakarta";
const files = [];
function load(file) {
	const source = fs.readFileSync(file, "utf8");
	files.push({
		file,
		sha256: crypto.createHash("sha256").update(source).digest("hex"),
	});
	const module = { exports: {} };
	vm.runInNewContext(
		ts.transpileModule(source, {
			compilerOptions: {
				module: ts.ModuleKind.CommonJS,
				target: ts.ScriptTarget.ES2022,
			},
		}).outputText,
		{
			module,
			exports: module.exports,
			Date,
			require: (name) => load(name.slice(2) + ".ts"),
		},
		{ filename: file },
	);
	return module.exports;
}
const { ledgerEntryMatchesPeriod: matches } = load(
	"lib/accounting/ledger-filter.ts",
);
const checks = [];
const check = (name, actual, expected) =>
	checks.push({ name, passed: actual === expected, actual, expected });
// Every quarter start/end must respect the calendar quarter, not a rolling 90 days.
for (const [month, start, end] of [
	[1, 1, 3],
	[3, 1, 3],
	[4, 4, 6],
	[6, 4, 6],
	[7, 7, 9],
	[9, 7, 9],
	[10, 10, 12],
	[12, 10, 12],
]) {
	const reference = new Date(2026, month - 1, 15, 12);
	for (const candidate of [start, end, start - 1, end + 1]) {
		const date = new Date(2026, candidate - 1, 15);
		const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-15`;
		check(
			`quarter reference ${month}, candidate ${iso}`,
			matches(iso, "quarter", reference),
			candidate >= start && candidate <= end,
		);
	}
}
const feb = new Date(2024, 1, 29, 12),
	jan = new Date(2027, 0, 1, 0, 1),
	oct = new Date(2026, 9, 9, 12);
for (const [date, period, reference, expected] of [
	["2024-02-29", "month", feb, true],
	["29-02-2024", "month", feb, true],
	["29 Februari 2024", "month", feb, true],
	["2023-02-29", "year", new Date(2023, 1, 1), false],
	["2024-02-30", "month", feb, false],
	["31-04-2026", "year", oct, false],
	["31 April 2026", "year", oct, false],
	["2026-13-01", "year", oct, false],
	["2026-00-01", "year", oct, false],
	["2026-10-00", "month", oct, false],
	["2026-10-32", "month", oct, false],
	["01-10-2026", "month", oct, true],
	["2026-10-31", "month", oct, true],
	["1 oktober 2026", "month", oct, true],
	[" 09-10-2026 ", "month", oct, true],
	[" 2026-10-09 ", "month", oct, true],
	["2026-09-30", "month", oct, false],
	["2026-11-01", "month", oct, false],
	["2027-01-01", "year", jan, true],
	["2027-12-31", "year", jan, true],
	["2026-12-31", "year", jan, false],
	["2028-01-01", "year", jan, false],
	["2027-01-01", "month", jan, true],
	["2026-12-31", "quarter", jan, false],
	["01/10/2026", "month", oct, false],
	["unknown", "month", oct, false],
	["", "month", oct, false],
	["unknown", "all", oct, true],
	["2020-01-01", "all", oct, true],
	["2026-10-09", "unsupported", oct, false],
	["2026-10-09", "year", new Date(NaN), false],
])
	check(
		`${date || "empty"} / ${period} / ${String(reference)}`,
		matches(date, period, reference),
		expected,
	);
const result = {
	date: "2026-10-09",
	timezone: "Asia/Jakarta",
	passed: checks.filter((c) => c.passed).length,
	failed: checks.filter((c) => !c.passed).length,
	checks,
	files,
};
fs.writeFileSync(
	path.join(__dirname, "date-results.json"),
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
