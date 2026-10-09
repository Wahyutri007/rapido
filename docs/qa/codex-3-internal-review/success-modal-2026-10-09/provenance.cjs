const fs = require("node:fs"), path = require("node:path"), crypto = require("node:crypto");
const packet = path.resolve("docs/qa/codex-3/success-modal-size");
const read = (file) => fs.readFileSync(file, "utf8");
const sha = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const originalStock = read("docs/qa/qc-stock-ui-2026-10-09/browser.cjs");
const expectedStock = originalStock.replace("const output=__dirname;", 'const output=path.join(__dirname,process.argv.includes("--baseline")?"stock-baseline":"stock-final");').replaceAll("qc-stock-ui-entry.bundle", "codex-3-success-stock-entry.bundle");
const originalDelete = read("docs/qa/codex-3/delete-lifecycle/check.cjs");
const oldHost = 'Dimensions: { get: () => ({ width: 360, height: 800 }) }';
const expectedDelete = originalDelete.replace(oldHost, oldHost + ', useWindowDimensions: () => ({ width: 360, height: 800 })');
const originalFixture = read("docs/qa/qc-stock-ui-2026-10-09/preview-entry.fixture.jsx");
const expectedFixture = originalFixture.replace("import CandidateStockScreen from './qc-stock-ui-screen';", "").replace("window.qcStockUiCandidate ? CandidateStockScreen : StockScreen", "StockScreen");
const result = {
	kind: "INTERNAL_QA_REVIEW",
	capturedAt: new Date().toISOString(),
	stockRunnerOnlyOutputAndEntryUrlChanged: expectedStock === read(path.join(packet, "stock-browser.cjs")),
	deleteRunnerOnlyDimensionHostAdaptation: expectedDelete === read(path.join(packet, "delete-lifecycle/check.cjs")),
	stockFixtureAlwaysUsesProductionScreen: expectedFixture === read(path.join(packet, "stock-entry.fixture.jsx")),
	stockOriginalSha256: sha("docs/qa/qc-stock-ui-2026-10-09/browser.cjs"),
	deleteOriginalSha256: sha("docs/qa/codex-3/delete-lifecycle/check.cjs"),
	visualEvidenceInspected: [
		{ file: "docs/qa/codex-3/success-modal-size/role-320.png", sha256: sha(path.join(packet, "role-320.png")), review: "320x640 fixture screenshot shows entire modal, title, X and Tutup action inside the viewport" },
		{ file: "docs/qa/codex-3/success-modal-size/stock-final/success-resize-320.png", sha256: sha(path.join(packet, "stock-final/success-resize-320.png")), review: "320x640 fixture screenshot shows entire success modal and Mengerti action inside the viewport" },
	],
	limits: ["Reviewed existing screenshots rather than launching a browser or capturing new images", "Byte comparison of allowed runner/fixture adaptations, not rerun of the 243 developer assertions"],
};
result.status = result.stockRunnerOnlyOutputAndEntryUrlChanged && result.deleteRunnerOnlyDimensionHostAdaptation && result.stockFixtureAlwaysUsesProductionScreen ? "PASS" : "FINDINGS";
fs.writeFileSync(path.join(__dirname, "provenance.json"), JSON.stringify(result, null, 2) + "\n");
console.log(JSON.stringify(result));
process.exitCode = result.status === "PASS" ? 0 : 1;
