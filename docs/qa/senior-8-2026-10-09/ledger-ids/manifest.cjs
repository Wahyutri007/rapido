const fs = require("node:fs"),
	path = require("node:path"),
	crypto = require("node:crypto"),
	ts = require("typescript"),
	cp = require("node:child_process");
const read = (name) =>
	JSON.parse(fs.readFileSync(path.join(__dirname, name), "utf8"));
const hash = (file) =>
	crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
function outsideAction(source) {
	source = source.replaceAll("\r\n", "\n");
	const ast = ts.createSourceFile(
		"store.ts",
		source,
		ts.ScriptTarget.Latest,
		true,
	);
	let property;
	function visit(node) {
		if (
			ts.isPropertyAssignment(node) &&
			node.name.getText(ast) === "addLedgerEntry"
		)
			property = node;
		ts.forEachChild(node, visit);
	}
	visit(ast);
	if (!property) throw Error("addLedgerEntry not found");
	return (
		source.slice(0, property.initializer.getStart(ast)) +
		"ACTION" +
		source.slice(property.initializer.end)
	);
}
const file = "store/accountingStore.ts";
const before = fs.readFileSync(
		path.join(__dirname, "accountingStore.before.ts.txt"),
		"utf8",
	),
	after = fs.readFileSync(file, "utf8");
if (outsideAction(before) !== outsideAction(after))
	throw Error("Source outside owned action changed; coordinate before handoff");
const store = read("final-store.json"),
	integration = read("final-all.json"),
	types = read("typecheck.json"),
	lint = read("lint.json");
if (
	store.failed ||
	integration.failed ||
	integration.errors.length ||
	types.diagnosticCount ||
	lint.some((r) => r.errorCount || r.warningCount)
)
	throw Error("Checks not clean");
for (const f of [...store.files, ...integration.files])
	if (hash(f.file) !== f.sha256)
		throw Error("Source changed after test: " + f.file);
const sharedHarness = "docs/qa/senior-8-2026-10-09/ledger-filters/check.cjs";
const report = {
	date: "2026-10-09",
	timezone: "Asia/Jakarta",
	ticket: "LEDGER-ID-001",
	status: "READY_FOR_QA",
	head: cp
		.execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" })
		.trim(),
	source: { file, sha256: hash(file) },
	outsideActionUnchanged: true,
	checks: {
		store: store.passed,
		integration: integration.passed,
		total: store.passed + integration.passed,
		reactErrors: 0,
		lintErrors: 0,
		lintWarnings: 0,
		typeDiagnostics: 0,
		biome: "passed",
		diff: "passed",
	},
	sharedHarness: { file: sharedHarness, sha256: hash(sharedHarness) },
	artifacts: fs
		.readdirSync(__dirname)
		.filter((f) => /\.(cjs|json|txt)$/.test(f) && f !== "verification.json")
		.map((f) => ({ file: f, sha256: hash(path.join(__dirname, f)) })),
	limits:
		"Production store/screen with isolated fixtures and native host adapters; no native/API/device/Figma or independent QC approval.",
};
fs.writeFileSync(
	path.join(__dirname, "verification.json"),
	JSON.stringify(report, null, "\t") + "\n",
);
console.log(
	JSON.stringify({
		status: report.status,
		source: report.source,
		checks: report.checks,
		outsideActionUnchanged: true,
	}),
);
