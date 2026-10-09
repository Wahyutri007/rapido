const fs = require("node:fs"), path = require("node:path"), crypto = require("node:crypto"), assert = require("node:assert/strict");
const hash = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const resultFile = path.join(__dirname, "results.json"), result = JSON.parse(fs.readFileSync(resultFile, "utf8"));
assert(result.jsxContractUnchanged && result.sourceStableThroughRead); assert.equal(hash(result.source), result.capturedCurrentHash);
const file = "docs/qa/codex-3/verification.json", main = JSON.parse(fs.readFileSync(file, "utf8"));
main.currentSupplements.sharedAlertModalSize.callerDriftFollowup = { source: result.source, capturedHash: result.capturedCurrentHash, alertJsxUnchanged: true, evidence: "docs/qa/codex-3/alert-modal-caller-drift-2026-10-09/results.json", evidenceSha256: hash(resultFile), scope: result.limits };
fs.writeFileSync(file, JSON.stringify(main, null, 2) + "\n");
console.log("Linked separate static caller drift audit; frozen SD3-009 manifest preserved");
