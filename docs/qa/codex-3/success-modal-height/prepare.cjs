const fs = require("node:fs"), path = require("node:path"), crypto = require("node:crypto"), assert = require("node:assert/strict");
const hash = file => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex"), local = file => path.join(__dirname, file);
assert(!fs.existsSync(local("inputs-before.json")), "Preserve existing height packet");
const source = "components/common/SuccessModal.tsx", qc = "docs/qa/qc-success-modal-2026-10-09";
assert.equal(hash(source), "f90eec3d8d4b95ad5a5b1b6ff7cc354e9097fe5d232eef4c0d020ebb61f4e495");
assert.equal(hash(path.join(qc, "proposal/SuccessModal.tsx")), "7508ea6ee63ec84e991b8075812c49d8a345d2cb256f43d2f45d9a0e325df7f8");
fs.copyFileSync(source, local("SuccessModal.before.tsx.txt"));
fs.copyFileSync(source, ".expo/codex-3-success-height-before.tsx");
fs.copyFileSync(path.join(qc, "web.css"), local("web.css"));
const fixture = fs.readFileSync(path.join(qc, "modal-entry.fixture.jsx"), "utf8");
assert.equal(fixture.split('import SuccessModal from "../components/common/SuccessModal";').length, 2);
fs.writeFileSync(".expo/codex-3-success-height-entry.jsx", fixture);
fs.writeFileSync(".expo/codex-3-success-height-before-entry.jsx", fixture.replace('import SuccessModal from "../components/common/SuccessModal";', 'import SuccessModal from "./codex-3-success-height-before";'));
let orientation = fs.readFileSync(path.join(qc, "orientation-browser.cjs"), "utf8");
orientation = orientation.replace("const proposal = process.argv.includes('--proposal');", 'const proposal = !process.argv.includes("--baseline");')
	.replace("proposal ? 'orientation-proposal' : 'orientation-current'", "proposal ? 'final' : 'baseline'")
	.replace("proposal ? 'qc-success-proposal-entry' : 'qc-success-modal-entry'", "proposal ? 'codex-3-success-height-entry' : 'codex-3-success-height-before-entry'")
	.replace("proposal ? '.expo/qc-success-modal-candidate.tsx' : 'components/common/SuccessModal.tsx'", "proposal ? 'components/common/SuccessModal.tsx' : '.expo/codex-3-success-height-before.tsx'")
	.replaceAll("/qc-success-orientation", "/codex-3-success-height");
assert(!orientation.includes("qc-success-proposal-entry"));
fs.writeFileSync(local("orientation-browser.cjs"), orientation);
const shared = fs.readFileSync(path.join(qc, "modal-browser.cjs"), "utf8").replaceAll("qc-success-modal-entry", "codex-3-success-height-entry");
fs.writeFileSync(local("shared-browser.cjs"), shared);
const inputs = [source, "components/feature/manage/roles/RoleDeleteDialog.tsx", "components/feature/manage/workers/WorkerDeleteDialog.tsx", "components/feature/manage/member/MemberDeleteDialog.tsx", "components/common/AlertModal.tsx", "components/common/DeleteConfirmModal.tsx", "components/ui/modal/index.tsx", "components/ui/button/index.tsx", "components/common/Text.tsx", "api/factory.ts", "api/common.ts", "hooks/useAlertModal.ts", "api/hooks/roles.ts", "api/hooks/workers.ts", "api/hooks/customers.ts", "package.json", "package-lock.json", "tsconfig.json", ".expo/codex-3-success-height-entry.jsx", ".expo/codex-3-success-height-before-entry.jsx", ".expo/codex-3-success-height-before.tsx", path.join(qc, "DECISION.json").replaceAll("\\", "/"), path.join(qc, "proposal/success-modal-height.patch").replaceAll("\\", "/")];
fs.writeFileSync(local("inputs-before.json"), JSON.stringify({ ticket: "SD3-012", sourceBeforeHash: hash(source), reviewedProposalHash: hash(path.join(qc, "proposal/SuccessModal.tsx")), files: Object.fromEntries(inputs.map(file => [file, hash(file)])), note: "Own copies only; current production source must match proposal after baseline. QC/prior frozen packets are not edited." }, null, 2) + "\n");
console.log(JSON.stringify({ prepared: true, sourceBeforeHash: hash(source), entries: "Owned .expo/codex-3-success-height-*", inputs: inputs.length }));
