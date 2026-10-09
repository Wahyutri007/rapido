const fs = require("node:fs"),
	path = require("node:path"),
	crypto = require("node:crypto"),
	assert = require("node:assert/strict");
const sha = (file) =>
	crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const source =
	"app/(no-layout)/(back-office)/report/accounting/accounts/index.tsx";
const quality = JSON.parse(
	fs.readFileSync(path.join(__dirname, "quality.json"), "utf8"),
);
assert.ok(quality.checks.every((c) => c.status === 0));
assert.deepEqual(quality.diagnostics, []);
const contracts = [
	"components/feature/accounting/accounts/AccountActionSheet.tsx",
	"app/(no-layout)/(back-office)/report/accounting/accounts/modify.tsx",
].map((file) => ({ file, sha256: sha(file) }));
const artifacts = fs
	.readdirSync(__dirname)
	.filter((file) => file !== "verification.json")
	.sort()
	.map((file) => ({ file, sha256: sha(path.join(__dirname, file)) }));
const result = {
	date: "2026-10-09",
	ticket: "ACCOUNT-MENU-001",
	status: "READY_FOR_QA",
	source: { file: source, sha256: sha(source) },
	contracts,
	quality: "ESLint/Biome/diff exit0, focused TypeScript 0 diagnostic",
	verificationKind:
		"Source review and static checks only; no new behavioral test",
	artifacts,
};
fs.writeFileSync(
	path.join(__dirname, "verification.json"),
	JSON.stringify(result, null, 2) + "\n",
);
console.log(JSON.stringify(result.source));
