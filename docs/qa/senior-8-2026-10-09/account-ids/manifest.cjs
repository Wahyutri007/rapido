const fs = require("node:fs"),
	path = require("node:path"),
	crypto = require("node:crypto"),
	assert = require("node:assert/strict"),
	ts = require("typescript");
const sha = (file) =>
	crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const read = (name) =>
	JSON.parse(fs.readFileSync(path.join(__dirname, name), "utf8"));
const source = "store/accountingStore.ts";
function outsideAction(text) {
	text = text.replaceAll("\r\n", "\n");
	const ast = ts.createSourceFile(
		"store.ts",
		text,
		ts.ScriptTarget.Latest,
		true,
	);
	let target;
	function visit(n) {
		if (ts.isPropertyAssignment(n) && n.name.getText(ast) === "addAccount")
			target = n.initializer;
		ts.forEachChild(n, visit);
	}
	visit(ast);
	assert.ok(target);
	return (
		text.slice(0, target.getStart(ast)) + "ACTION" + text.slice(target.end)
	);
}
assert.equal(
	outsideAction(fs.readFileSync(source, "utf8")),
	outsideAction(
		fs.readFileSync(
			path.join(__dirname, "accountingStore.before.ts.txt"),
			"utf8",
		),
	),
);
const store = read("final-store.json"),
	integration = read("final.json"),
	quality = read("quality.json");
assert.equal(store.failed, 0);
assert.equal(store.passed, 25);
assert.equal(integration.failed, 0);
assert.equal(integration.passed, 39);
assert.deepEqual(integration.errors, []);
assert.ok(quality.checks.every((c) => c.status === 0));
assert.deepEqual(quality.diagnostics, []);
for (const file of [...store.files, ...integration.files])
	assert.equal(sha(file.file), file.sha256, file.file);
const shared = [
	"ledger-ids/store-check.cjs",
	"account-detail/check.cjs",
	"account-detail/quality.cjs",
].map((file) => ({ file, sha256: sha(path.join(__dirname, "..", file)) }));
const artifacts = fs
	.readdirSync(__dirname)
	.filter((n) => n !== "verification.json")
	.sort()
	.map((file) => ({ file, sha256: sha(path.join(__dirname, file)) }));
const result = {
	date: "2026-10-09",
	ticket: "ACCOUNT-ID-001",
	status: "READY_FOR_QA",
	source: { file: source, sha256: sha(source) },
	outsideAddAccountUnchanged: true,
	checks: {
		store: store.passed,
		integration: integration.passed,
		total: store.passed + integration.passed,
		runtimeErrors: 0,
	},
	dependencies: integration.files,
	sharedHarnesses: shared,
	artifacts,
	limits:
		"Isolated production store and account-detail screen with host/router/formatter adapters. IDs unique within current in-memory accounts, not distributed or permanently reserved. No migration of pre-existing duplicate IDs.",
};
fs.writeFileSync(
	path.join(__dirname, "verification.json"),
	JSON.stringify(result, null, 2) + "\n",
);
console.log(
	JSON.stringify({ source: result.source, assertions: result.checks.total }),
);
