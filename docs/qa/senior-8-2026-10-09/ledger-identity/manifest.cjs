const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const assert = require("node:assert/strict");
const sha = (file) =>
	crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const read = (name) =>
	JSON.parse(fs.readFileSync(path.join(__dirname, name), "utf8"));
const source =
	"app/(no-layout)/(back-office)/report/accounting/general-ledger/detail.tsx";
const baseline = path.join(__dirname, "detail.before.tsx.txt");
assert.equal(
	sha(baseline),
	"f841115249a9ae1bcd3391b4fb9996539d452fa345ee6fcab26ac25f01db705f",
);
const oldText = fs.readFileSync(baseline, "utf8").replaceAll("\r\n", "\n");
const newText = fs.readFileSync(source, "utf8").replaceAll("\r\n", "\n");
const marker = "\tconst rawEntries:";
assert.ok(oldText.includes(marker) && newText.includes(marker));
assert.equal(
	newText.slice(newText.indexOf(marker)),
	oldText.slice(oldText.indexOf(marker)),
);
assert.equal(
	newText.split("export default")[0],
	oldText.split("export default")[0],
);
const results = read("final-all.json");
assert.equal(results.failed, 0);
assert.equal(results.passed, 51);
assert.deepEqual(results.errors, []);
for (const file of results.files)
	assert.equal(sha(file.file), file.sha256, file.file);
const lint = read("lint.json");
assert.equal(lint.length, 1);
for (const file of lint) {
	assert.equal(file.errorCount, 0);
	assert.equal(file.warningCount, 0);
}
assert.equal(read("typecheck.json").diagnosticCount, 0);
const artifacts = fs
	.readdirSync(__dirname)
	.filter((n) => n !== "verification.json")
	.sort()
	.map((n) => ({ file: n, sha256: sha(path.join(__dirname, n)) }));
const result = {
	date: "2026-10-09",
	status: "READY_FOR_QA",
	ticket: "LEDGER-IDENTITY-001",
	source: { file: source, sha256: sha(source) },
	baseline: {
		sha256: sha(baseline),
		passed: read("baseline-all.json").passed,
		failed: read("baseline-all.json").failed,
	},
	verification: {
		assertions: results.passed,
		failures: 0,
		runtimeErrors: 0,
		lintErrors: 0,
		lintWarnings: 0,
		typeDiagnostics: 0,
		importsAndEverythingFromRawEntriesUnchanged: true,
	},
	dependencies: results.files,
	historicalHarness: {
		file: "docs/qa/senior-8-2026-10-09/ledger-filters/check.cjs",
		sha256: sha("docs/qa/senior-8-2026-10-09/ledger-filters/check.cjs"),
	},
	artifacts,
	limits:
		"React StrictMode + production screen/Zustand, host adapters and fixture route parameters. No native/router/browser/API/Figma approval. Store ID patch retains separate gate.",
};
fs.writeFileSync(
	path.join(__dirname, "verification.json"),
	JSON.stringify(result, null, 2) + "\n",
);
console.log(
	JSON.stringify({
		status: result.status,
		source: result.source,
		assertions: results.passed,
		artifacts: artifacts.length,
	}),
);
