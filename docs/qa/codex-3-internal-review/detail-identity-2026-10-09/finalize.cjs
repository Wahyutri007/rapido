const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const appRoot = path.resolve(__dirname, "../../../..");
const hash = (buffer) => crypto.createHash("sha256").update(buffer).digest("hex");
const result = JSON.parse(fs.readFileSync(path.join(__dirname, "results.json"), "utf8"));
const baseline = JSON.parse(fs.readFileSync(path.join(__dirname, "baseline-results.json"), "utf8"));
const captured = JSON.parse(fs.readFileSync(path.join(__dirname, "baseline-capture.json"), "utf8"));
if (result.summary.failed || result.summary.runtimeErrors || result.summary.warnings) throw new Error("Final review is not clean.");
for (const target of ["REPORT.md", "verification.json"]) if (fs.existsSync(path.join(__dirname, target))) throw new Error(`Frozen ${target} already exists.`);
const reviewedSourceHashes = Object.fromEntries(Object.keys(captured.sourceHashes).map((file) => {
	const actual = hash(fs.readFileSync(path.join(appRoot, file)));
	if (actual !== result.loadedSourceHashes[file]) throw new Error(`Source drift ${file}`);
	return [file, actual];
}));
for (const [file, expected] of Object.entries(captured.contractHashes)) {
	if (hash(fs.readFileSync(path.join(appRoot, file))) !== expected) throw new Error(`Contract drift ${file}`);
}
const runtimeFiles = [
	".expo/senior7-test-tools/node_modules/react/index.js",
	".expo/senior7-test-tools/node_modules/react/cjs/react.development.js",
	".expo/senior7-test-tools/node_modules/react/jsx-runtime.js",
	".expo/senior7-test-tools/node_modules/react/cjs/react-jsx-runtime.development.js",
	".expo/senior7-test-tools/node_modules/react-test-renderer/index.js",
	".expo/senior7-test-tools/node_modules/react-test-renderer/cjs/react-test-renderer.development.js",
	"node_modules/typescript/lib/typescript.js",
];
const runtimeInputHashes = Object.fromEntries(runtimeFiles.map((file) => [file, hash(fs.readFileSync(path.join(appRoot, file)))]));
const report = `# SD3-010 detail identity internal review\n\nStatus: **INTERNAL_QA_REVIEW_PASS**. External QC approval: **false**.\n\nRole, Worker and Member detail now place their existing query, modal and Role search state inside a child keyed by \`id ?? ""\`. Changing identity resets confirmation/search and makes retained A open/close/search setters unable to affect B. Same-ID refetch preserves existing state. Missing/empty ID, loading/error UI, retry/back, edit routes, public props and dialog callbacks retain their original contract.\n\nIndependent normal/StrictMode renderer: **156/156 state assertions pass**, plus **21/21 AST assertions** and **18/18 dependency fingerprint assertions**, for **${result.summary.passed}/${result.summary.assertions} total pass**. Runtime/React/act errors: **0**; unexpected warnings: **0**. The baseline runs the identical 156 state assertions on frozen source: **${baseline.summary.passed} pass/${baseline.summary.failed} fail**. The 34 failures are repeated symptoms across domains/modes rather than 34 distinct defects.\n\nFull original function body and imports/statements match the final inner content AST for all three files. Public and inner ID parameter types match; each wrapper contains only the keyed child return. Eighteen route/query/factory/helper/dialog/shared-modal contract fingerprints remain unchanged from baseline capture.\n\nReviewed source hashes:\n\n${Object.entries(reviewedSourceHashes).map(([file, value]) => `- \`${file}\`: \`${value}\``).join("\n")}\n\nThis is an independent source/React-state review. Actual detail source, useAlertModal and domain display helpers execute with query/dialog/presentation/router adapters. Child delete request IO, browser geometry, native animations/scroll, real API/backend and full Expo Router are outside this suite. It does not close external QC findings or authorize publication. The parent's broader production-dialog/API fixture and source quality checks are separate evidence; they are not counted here.\n\nReplay to a new reviewer output by copying this folder or changing only output location in an owned runner. Do not overwrite these frozen results. Expected react-test-renderer deprecation notice is filtered; other console errors/warnings are recorded. Figma callable tools were absent. No source/shared docs/frozen packets/server/HP/Metro/HTTP/dependency/global TypeScript/Git publication changed by this reviewer.\n\nExecution Profile & Operator Tips: Medium. Hash match -> reviewer reproduction -> targeted identity/body/contract checks -> external QA/QC -> PM. Preserve per-ID and same-ID distinction and keep historical evidence immutable.\n`;
fs.writeFileSync(path.join(__dirname, "REPORT.md"), report);
const artifactFiles = fs.readdirSync(__dirname, { recursive: true }).filter((file) => fs.statSync(path.join(__dirname, file)).isFile() && file !== "verification.json");
const artifactHashes = Object.fromEntries(artifactFiles.map((file) => [file.replaceAll("\\", "/"), hash(fs.readFileSync(path.join(__dirname, file)))]));
const verification = {
	status: "INTERNAL_QA_REVIEW_PASS",
	externalQcApproval: false,
	finishedAt: new Date().toISOString(),
	reviewedSourceHashes,
	productionContractHashes: captured.contractHashes,
	loadedProductionSourceHashes: result.loadedSourceHashes,
	runtimeInputHashes,
	baseline: baseline.summary,
	final: result.summary,
	counts: { state: 156, ast: 21, contractFingerprints: 18 },
	artifactHashes,
	limitations: "Independent source/React parent state checks with query/dialog/native/presentation/router adapters. No delete IO/browser/native/API certification or external QC approval. Parent tests and lint/type evidence are separate, not counted here.",
};
fs.writeFileSync(path.join(__dirname, "verification.json"), JSON.stringify(verification, null, 2) + "\n");
process.stdout.write(JSON.stringify({ status: verification.status, summary: verification.final, sources: Object.keys(reviewedSourceHashes).length, contracts: Object.keys(captured.contractHashes).length, runtimeInputs: runtimeFiles.length, artifacts: artifactFiles.length }) + "\n");
