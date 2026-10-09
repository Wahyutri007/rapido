const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const root = path.resolve(__dirname, "../../..");
const prefix = "docs/qa/pm-cashier-navbar-publication-2026-10-09";
const qaPrefix = "docs/qa/pm-cashier-navbar-qa-2026-10-09";
const decode = (bytes) =>
	(bytes[0] === 255 && bytes[1] === 254
		? bytes.subarray(2).toString("utf16le")
		: bytes.toString("utf8")
	).replace(/^\uFEFF/, "");
const json = (file) => JSON.parse(decode(fs.readFileSync(path.join(root, file))));
const hash = (bytes) => crypto.createHash("sha256").update(bytes).digest("hex");
const git = (...args) => execFileSync("git", args, { cwd: root, windowsHide: true });
const review = json(`${prefix}/PM_REVIEW.json`);
const allowed = [
	"app/(cashier)/_layout.tsx",
	"app/(no-layout)/(cashier)/catalog/index.tsx",
	"app/_layout.tsx",
	"components/custom/BottomTab.tsx",
	... ["home", "report", "catalog", "location", "bills"].map(
		(name) => `assets/images/cashier/navigation/${name}.svg`,
	),
].sort();
assert.equal(review.decision, "APPROVED_FOR_SCOPED_PUBLICATION");
assert.deepEqual([...review.productionScope].sort(), allowed);
assert.equal(json(`${prefix}/quality-results.json`).pass, true);
assert.equal(json(`${prefix}/independent-qc/verification-final.json`).decision, "PASS_SCOPED");
assert.equal(json(`${qaPrefix}/candidate-compatibility.json`).result, "PASS_SCOPED");
assert.equal(
	hash(fs.readFileSync(path.join(root, qaPrefix, "candidate-compatibility.json"))),
	json(`${prefix}/independent-qc/verification-final.json`).qaCompatibilityReceiptHash,
);
const commit = process.argv[2];
const files = commit
	? decode(git("diff-tree", "--no-commit-id", "--name-only", "-r", commit)).trim().split("\n")
	: [...new Set([
		...decode(git("diff", review.baseCommit, "--name-only")).trim().split("\n"),
		...decode(git("ls-files", "--others", "--exclude-standard")).trim().split("\n"),
	])].filter(Boolean);
assert.deepEqual(files.filter((file) => /^(app|components|assets)\//.test(file)).sort(), allowed);
assert.ok(files.every((file) => allowed.includes(file) || file.startsWith(`${prefix}/`) || file.startsWith(`${qaPrefix}/`)));
for (const file of allowed) {
	const bytes = commit ? git("show", `${commit}:${file}`) : fs.readFileSync(path.join(root, file));
	assert.equal(hash(bytes), review.productionSha256[file], `Source drift: ${file}`);
}
let validJson = 0;
for (const file of files.filter((file) => file.endsWith(".json"))) {
	JSON.parse(decode(commit ? git("show", `${commit}:${file}`) : fs.readFileSync(path.join(root, file))));
	validJson++;
}
console.log(JSON.stringify({ status: "PASS", mode: commit ? "committed-git-blobs" : "candidate", productionPathsMatched: allowed.length, totalFiles: files.length, validJsonFiles: validJson }));
