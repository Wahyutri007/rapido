const fs = require("node:fs"),
	path = require("node:path"),
	crypto = require("node:crypto"),
	assert = require("node:assert/strict"),
	ts = require("typescript");
const sha = (file) =>
	crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const read = (name) =>
	JSON.parse(fs.readFileSync(path.join(__dirname, name), "utf8"));
const source =
	"app/(no-layout)/(back-office)/report/accounting/accounts/detail.tsx";
const old = fs.readFileSync(
	path.join(__dirname, "detail.before.tsx.txt"),
	"utf8",
);
const now = fs.readFileSync(source, "utf8");
function tokens(text) {
	const scanner = ts.createScanner(
		ts.ScriptTarget.Latest,
		true,
		ts.LanguageVariant.JSX,
		text,
	);
	const result = [];
	for (
		let kind = scanner.scan();
		kind !== ts.SyntaxKind.EndOfFileToken;
		kind = scanner.scan()
	)
		result.push([kind, scanner.getTokenText()]);
	return result;
}
assert.deepEqual(
	tokens(now.split("export default")[0]),
	tokens(old.split("export default")[0]),
);
const marker = "const totals = getTotals();";
assert.ok(now.includes(marker) && old.includes(marker));
assert.deepEqual(
	tokens(now.slice(now.indexOf(marker))),
	tokens(old.slice(old.indexOf(marker))),
);
const results = read("final.json"),
	quality = read("quality.json"),
	before = read("baseline.json");
assert.equal(results.failed, 0);
assert.equal(results.passed, 30);
assert.deepEqual(results.errors, []);
for (const file of results.files)
	assert.equal(sha(file.file), file.sha256, file.file);
assert.ok(quality.checks.every((c) => c.status === 0));
assert.deepEqual(quality.diagnostics, []);
const artifacts = fs
	.readdirSync(__dirname)
	.filter((n) => n !== "verification.json")
	.sort()
	.map((n) => ({ file: n, sha256: sha(path.join(__dirname, n)) }));
const result = {
	status: "READY_FOR_QA",
	ticket: "ACCOUNT-DETAIL-001",
	date: "2026-10-09",
	source: { file: source, sha256: sha(source) },
	baseline: { passed: before.passed, failed: before.failed },
	final: { passed: results.passed, failed: 0, runtimeErrors: 0 },
	importsAndTokensFromTotalsUnchanged: true,
	dependencies: results.files,
	artifacts,
	limits: results.limits,
};
fs.writeFileSync(
	path.join(__dirname, "verification.json"),
	JSON.stringify(result, null, 2) + "\n",
);
console.log(
	JSON.stringify({ source: result.source, assertions: results.passed }),
);
