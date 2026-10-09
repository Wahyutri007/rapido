const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const previous = path.resolve(__dirname, "../alert-modal-2026-10-09");
const hash = (bytes) => crypto.createHash("sha256").update(bytes).digest("hex");
const write = (file, bytes) => {
	const target = path.join(__dirname, file);
	if (fs.existsSync(target)) throw new Error(`Refusing to overwrite ${file}`);
	fs.writeFileSync(target, bytes);
};
const previousManifest = JSON.parse(fs.readFileSync(path.join(previous, "verification.json"), "utf8"));
for (const artifact of previousManifest.artifacts) {
	if (hash(fs.readFileSync(path.join(previous, artifact.path))) !== artifact.sha256) throw new Error(`Previous review artifact drifted: ${artifact.path}`);
}
for (const name of ["audit-before.json", "AlertModal.before.tsx.txt"]) write(name, fs.readFileSync(path.join(previous, name)));
write("AlertModal.geometry-only.tsx.txt", fs.readFileSync(path.join(previous, "AlertModal.final.tsx.txt")));
let check = fs.readFileSync(path.join(previous, "check.cjs"), "utf8");
const needle = 'check("Whole AST is identical after reversing only four geometry deltas", canonical(normalizedFinal), canonical(normalizedBefore));';
if (!check.includes(needle)) throw new Error("Expected independent contract harness AST assertion missing");
check = check.replace(needle, `if ((normalizedFinal.match(/type AlertModalProps =/g) ?? []).length !== 1 || (normalizedFinal.match(/React\\.PropsWithChildren<AlertModalProps>/g) ?? []).length !== 1) throw new Error("Expected exactly one renamed private type declaration and annotation");
normalizedFinal = normalizedFinal.replace("type AlertModalProps =", "type AlertModal =").replace("React.PropsWithChildren<AlertModalProps>", "React.PropsWithChildren<AlertModal>");
check("Whole AST is identical after reversing four geometry deltas and private type-only alias rename", canonical(normalizedFinal), canonical(normalizedBefore));`);
write("check.cjs", check);
write("previous-review-manifest.json", fs.readFileSync(path.join(previous, "verification.json")));
write("preparation.json", `${JSON.stringify({ status: "NEW_FINAL_ALIAS_REVIEW_PREPARED", previousPacket: path.relative(path.resolve(__dirname, "../../../.."), previous).replaceAll("\\", "/"), previousSourceHash: previousManifest.source.sha256, baselineSourceHash: previousManifest.baselineSource.sha256, copiedContractAssertions: previousManifest.checks.passed, previousManifestSha256: hash(fs.readFileSync(path.join(previous, "verification.json"))), oldArtifactsVerified: previousManifest.artifacts.length, adaptation: "Same60case contract suite; normalize only one private type declaration+PropsWithChildren annotation for whole AST; emittedJS proof separate" }, null, 2)}\n`);
console.log(JSON.stringify({ copiedAssertions: previousManifest.checks.passed, previousArtifactsVerified: previousManifest.artifacts.length, output: __dirname }, null, 2));
