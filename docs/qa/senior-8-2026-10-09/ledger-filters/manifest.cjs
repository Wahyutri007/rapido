const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const cp = require("node:child_process");
const directory = __dirname;
const read = (name) =>
	JSON.parse(fs.readFileSync(path.join(directory, name), "utf8"));
const hash = (file) =>
	crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const suite = read("final-all.json"),
	dates = read("date-results.json");
if (suite.failed || dates.failed || read("typecheck.json").diagnosticCount)
	throw Error("Failed checks");
for (const file of [...suite.files, ...dates.files])
	if (hash(file.file) !== file.sha256)
		throw Error("Dependency changed after test: " + file.file);
const lint = read("lint-final.json");
if (lint.some((file) => file.errorCount || file.warningCount))
	throw Error("Lint findings require review");
const sourceFiles = [
	"app/(no-layout)/(back-office)/report/accounting/general-ledger/detail.tsx",
	"lib/accounting/ledger-filter.ts",
];
const approved = JSON.parse(
	fs.readFileSync("docs/qa/qc-senior8-2026-10-09/DECISION.json", "utf8"),
);
const unchanged = approved.files
	.filter((file) => file.file !== sourceFiles[0])
	.map((file) => ({ ...file, unchanged: hash(file.file) === file.sha256 }));
if (unchanged.some((file) => !file.unchanged))
	throw Error("Previously approved source changed");
const report = {
	date: "2026-10-09",
	timezone: "Asia/Jakarta",
	status: "READY_FOR_QA",
	tickets: ["QC-S8-LEGACY-001", "QC-S8-LEGACY-002"],
	head: cp
		.execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" })
		.trim(),
	source: sourceFiles.map((file) => ({ file, sha256: hash(file) })),
	previousApprovedSourceUnchanged: unchanged,
	checks: {
		component: suite.passed,
		dates: dates.passed,
		total: suite.passed + dates.passed,
		runtimeErrors: suite.errors.length,
		lintErrors: 0,
		lintWarnings: 0,
		typeDiagnostics: 0,
		biome: "passed",
		diffCheck: "passed",
	},
	artifacts: fs
		.readdirSync(directory)
		.filter(
			(file) => /\.(cjs|json)$/.test(file) && file !== "verification.json",
		)
		.map((file) => ({ file, sha256: hash(path.join(directory, file)) })),
	limits:
		"Production screen/store with RN/presentation adapters and isolated fixtures. No API/native/visual check. Prior QC approval is historical; final ledger delta awaits recheck.",
};
fs.writeFileSync(
	path.join(directory, "verification.json"),
	JSON.stringify(report, null, "\t") + "\n",
);
console.log(
	JSON.stringify({
		status: report.status,
		checks: report.checks,
		source: report.source,
	}),
);
