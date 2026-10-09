// Build a reviewable import-order patch on copies; never edit application source.
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { spawnSync } = require("node:child_process");
const ts = require("typescript");
const out = __dirname;
const root = path.resolve(out, "../../..");
const raw = fs.readFileSync(path.join(out, "biome-check.out.txt"), "utf8");
// The installed Biome JSON reporter emits unescaped Windows path separators.
const normalised = raw.replace(/"path":"([^"]*)"/g, (_match, file) => '"path":' + JSON.stringify(file.replaceAll("\\", "/")));
const report = JSON.parse(normalised);
fs.writeFileSync(path.join(out, "biome-check.json"), JSON.stringify(report, null, 2) + "\n");
const findings = report.diagnostics.map(item => ({ file: item.location.path, line: item.location.start.line, category: item.category, severity: "P3", message: item.message }));
if (findings.length !== 7 || findings.some(item => item.category !== "assist/source/organizeImports")) throw Error("Unexpected Biome findings");
const files = [...new Set(findings.map(item => item.file))];
const proposalRoot = path.join(root, ".expo/qc-manage-forms-2026-10-09/import-proposal");
const copies = files.map(file => {
	const copy = path.join(proposalRoot, file);
	fs.mkdirSync(path.dirname(copy), { recursive: true });
	fs.copyFileSync(path.join(root, file), copy);
	return copy;
});
const format = spawnSync(process.execPath, ["node_modules/@biomejs/biome/bin/biome", "check", "--write", "--linter-enabled=false", "--formatter-enabled=false", "--vcs-enabled=false", "--assist-enabled=true", ...copies], { cwd: root, encoding: "utf8" });
if (format.status !== 0) throw Error(format.stdout + format.stderr);
const printer = ts.createPrinter();
function semanticSource(file) {
	const ast = ts.createSourceFile(file, fs.readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
	const body = ast.statements.filter(node => !ts.isImportDeclaration(node)).map(node => printer.printNode(ts.EmitHint.Unspecified, node, ast));
	const imports = ast.statements.filter(ts.isImportDeclaration).map(node => ({
		module: node.moduleSpecifier.text,
		typeOnly: !!node.importClause?.isTypeOnly,
		defaultName: node.importClause?.name?.text,
		named: node.importClause?.namedBindings && ts.isNamedImports(node.importClause.namedBindings)
			? node.importClause.namedBindings.elements.map(item => [item.propertyName?.text || item.name.text, item.name.text, !!item.isTypeOnly]).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))) : undefined,
	})).sort((a, b) => a.module.localeCompare(b.module));
	return JSON.stringify({ body, imports });
}
const proof = [];
let patch = "";
for (let i = 0; i < files.length; i++) {
	const file = files[i], original = path.join(root, file), copy = copies[i];
	if (semanticSource(original) !== semanticSource(copy)) throw Error("Proposal changed executable statements/import bindings: " + file);
	const diff = spawnSync("git", ["diff", "--no-index", "--", original, copy], { cwd: root, encoding: "utf8" });
	if (diff.status !== 1) throw Error("Expected import-only diff for " + file);
	const lines = diff.stdout.split("\n");
	lines[0] = "diff --git a/" + file + " b/" + file;
	for (let j = 0; j < lines.length; j++) {
		if (lines[j].startsWith("--- ")) lines[j] = "--- a/" + file;
		if (lines[j].startsWith("+++ ")) lines[j] = "+++ b/" + file;
	}
	patch += lines.join("\n");
	const hash = input => crypto.createHash("sha256").update(fs.readFileSync(input)).digest("hex");
	proof.push({ file, originalSha256: hash(original), proposalSha256: hash(copy), executableStatementsAndImportBindingsUnchanged: true });
}
fs.writeFileSync(path.join(out, "organize-imports.patch"), patch);
fs.writeFileSync(path.join(out, "style-findings.json"), JSON.stringify({ finding: "QC-MANAGE-FORMS-001", severity: "P3", findings, proposal: "organize-imports.patch", proposalVerification: proof, appliedToApplication: false }, null, 2) + "\n");
console.log(JSON.stringify({ finding: "QC-MANAGE-FORMS-001", diagnostics: findings.length, files: files.length, patchReady: true, applicationSourceEdited: false }));
