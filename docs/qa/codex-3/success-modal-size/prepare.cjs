const fs = require("node:fs"), path = require("node:path"), crypto = require("node:crypto"), ts = require("typescript"), assert = require("node:assert/strict");
const hash = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const source = "components/common/SuccessModal.tsx";
assert.equal(hash(source), "72b29fd049201dad355733885cf0f7f310b0983549337adbe0e653dd820f8745");
assert(!fs.existsSync(path.join(__dirname, "SuccessModal.before.tsx.txt")), "Preserve existing baseline");
fs.copyFileSync(source, path.join(__dirname, "SuccessModal.before.tsx.txt"));
const entries = [];
function scan(directory) {
	for (const item of fs.readdirSync(directory, { withFileTypes: true })) {
		const file = `${directory}/${item.name}`;
		if (item.isDirectory()) { scan(file); continue; }
		if (!file.endsWith(".tsx") || file === source) continue;
		const parsed = ts.createSourceFile(file, fs.readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
		const names = new Set();
		for (const statement of parsed.statements) {
			if (!ts.isImportDeclaration(statement) || !statement.importClause) continue;
			const from = statement.moduleSpecifier.text;
			if (from.endsWith("SuccessModal") && statement.importClause.name) names.add(statement.importClause.name.text);
			const bindings = statement.importClause.namedBindings;
			if (bindings && ts.isNamedImports(bindings)) for (const binding of bindings.elements) if ((binding.propertyName?.text ?? binding.name.text) === "SuccessModal") names.add(binding.name.text);
		}
		if (!names.size) continue;
		const uses = [];
		const visit = (node) => {
			if ((ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) && names.has(node.tagName.getText(parsed))) uses.push({ line: parsed.getLineAndCharacterOfPosition(node.pos).line + 1, jsx: node.getText(parsed), props: node.attributes.properties.map((attr) => attr.name?.getText(parsed) ?? "spread") });
			ts.forEachChild(node, visit);
		};
		visit(parsed); if (uses.length) entries.push({ file, sha256: hash(file), uses });
	}
}
scan("app"); scan("components");
fs.writeFileSync(path.join(__dirname, "callers.json"), JSON.stringify({ capturedAt: new Date().toISOString(), files: entries.length, usages: entries.reduce((sum, entry) => sum + entry.uses.length, 0), entries }, null, 2) + "\n");
const qc = "docs/qa/qc-stock-ui-2026-10-09";
let stockEntry = fs.readFileSync(`${qc}/preview-entry.fixture.jsx`, "utf8").replace("import CandidateStockScreen from './qc-stock-ui-screen';", "").replace("window.qcStockUiCandidate ? CandidateStockScreen : StockScreen", "StockScreen");
fs.writeFileSync(".expo/codex-3-success-stock-entry.jsx", stockEntry);
const originalRunner = fs.readFileSync(`${qc}/browser.cjs`, "utf8");
const runner = originalRunner.replace("const output=__dirname;", 'const output=path.join(__dirname,process.argv.includes("--baseline")?"stock-baseline":"stock-final");').replaceAll("qc-stock-ui-entry.bundle", "codex-3-success-stock-entry.bundle");
assert.notEqual(runner, originalRunner);
fs.writeFileSync(path.join(__dirname, "stock-browser.cjs"), runner);
for (const name of ["stock-baseline", "stock-final"]) {
	fs.mkdirSync(path.join(__dirname, name), { recursive: true });
	fs.copyFileSync(`${qc}/web-before.css`, path.join(__dirname, name, "web-before.css"));
}
fs.copyFileSync("node_modules/react-native-css-interop/.cache/web.css", path.join(__dirname, "web.css"));
const files = [source, "app/(no-layout)/manage/pos-settings/stock-limit.tsx", "components/ui/modal/index.tsx", "components/ui/button/index.tsx", "components/common/Text.tsx", "components/ui/gluestack-ui-provider/index.web.tsx", "hooks/useAlertModal.ts", "tailwind.config.js", "metro.config.js", "package.json", "package-lock.json", "node_modules/react-native-css-interop/.cache/android.js", "node_modules/react-native-css-interop/.cache/web.css"];
fs.writeFileSync(path.join(__dirname, "inputs-before.json"), JSON.stringify({ owner: "Codex-3", source, files: Object.fromEntries(files.map((file) => [file, hash(file)])), qcRunnerOriginal: hash(`${qc}/browser.cjs`), qcDecision: hash(`${qc}/DECISION.json`), proposalHash: hash(`${qc}/proposal/SuccessModal.candidate.txt`), runnerChanges: "Developer output location and owned fixture entry URL only; scenario/assertion body unchanged" }, null, 2) + "\n");
console.log(JSON.stringify({ callerFiles: entries.length, usages: entries.reduce((sum, entry) => sum + entry.uses.length, 0), imageOverrides: entries.filter((entry) => entry.uses.some((use) => use.props.includes("image"))).map((entry) => entry.file) }));
