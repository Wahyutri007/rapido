const fs = require("node:fs"), path = require("node:path"), crypto = require("node:crypto"), assert = require("node:assert/strict");
const hash = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const previous = "docs/qa/codex-3/success-modal-size", source = "components/common/DeleteConfirmModal.tsx";
assert.equal(hash(source), "d5f8562ea6e29266ee89a5f5c1d3dc60682f8b4a7a1a473b632cf8b85b6117a0");
assert(!fs.existsSync(path.join(__dirname, "DeleteConfirmModal.before.tsx.txt")), "Preserve baseline");
fs.copyFileSync(source, path.join(__dirname, "DeleteConfirmModal.before.tsx.txt"));
const old = fs.readFileSync(`${previous}/prepare.cjs`, "utf8");
const inventory = old.slice(old.indexOf("const entries = [];"), old.indexOf('const qc = ')).replaceAll("SuccessModal", "DeleteConfirmModal");
const ts = require("typescript");
eval(inventory);
fs.copyFileSync(`${previous}/web.css`, path.join(__dirname, "web.css"));
for (const name of ["quality.cjs", "replay-delete.cjs"]) {
	const text = fs.readFileSync(`${previous}/${name}`, "utf8").replaceAll("SuccessModal", "DeleteConfirmModal").replaceAll("SD3-007", "SD3-008");
	fs.writeFileSync(path.join(__dirname, name), text);
}
const files = ["components/common/SuccessModal.tsx", "components/ui/modal/index.tsx", "components/ui/button/index.tsx", "components/common/Text.tsx", "components/ui/gluestack-ui-provider/index.web.tsx", "hooks/useAlertModal.ts", "tailwind.config.js", "metro.config.js", "tsconfig.json", "babel.config.js", "package.json", "package-lock.json", "node_modules/react-native-css-interop/.cache/android.js", "node_modules/react-native-css-interop/.cache/web.css", ".expo/codex-3-delete-modal-entry.jsx"];
fs.writeFileSync(path.join(__dirname, "inputs-before.json"), JSON.stringify({ owner: "Codex-3", ticket: "SD3-008", source, sourceHash: hash(source), files: Object.fromEntries(files.map((file) => [file, hash(file)])), inventoryAdaptation: "Same TS import/JSX inventory from frozen SD3-007; component name changed only" }, null, 2) + "\n");
console.log("Captured DeleteConfirmModal baseline, caller inventory and runtime inputs");
