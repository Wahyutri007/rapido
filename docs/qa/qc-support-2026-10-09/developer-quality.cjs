const fs = require("node:fs"), path = require("node:path"), ts = require("typescript"), crypto = require("node:crypto");
const { spawnSync } = require("node:child_process");
const sources = ["components/feature/support/SupportAttachmentInput.tsx", "components/feature/support/SupportFormScreen.tsx"];
const run = (args) => {
	const result = spawnSync(process.execPath, args, { encoding: "utf8" });
	return { command: ["node", ...args], exitCode: result.status, stdout: result.stdout.trim(), stderr: result.stderr.trim() };
};
const lint = run(["node_modules/eslint/bin/eslint.js", ...sources, "--no-cache", "--max-warnings", "0", "--format", "json"]);
fs.writeFileSync(path.join(__dirname, "eslint-results.json"), lint.stdout + "\n");
const files = JSON.parse(lint.stdout).map((item) => ({ file: path.relative(process.cwd(), item.filePath).replaceAll("\\", "/"), errors: item.errorCount, warnings: item.warningCount, messages: item.messages }));
delete lint.stdout; lint.files = files;
const biome = run(["node_modules/@biomejs/biome/bin/biome", "check", ...sources]);
const diff = spawnSync("git", ["-c", "core.autocrlf=false", "diff", "--check", "--", ...sources], { encoding: "utf8" });
const render = (text, name) => {
	const parsed = ts.createSourceFile("screen.tsx", text.replace(/\r\n/g, "\n"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
	const fn = parsed.statements.find((node) => ts.isFunctionDeclaration(node) && node.name?.text === name);
	const root = fn.body.statements.filter(ts.isReturnStatement).at(-1).expression;
	const transform = ts.transform(root, [(context) => {
		const visit = (original) => {
			let node = original;
			if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
				const tag = node.tagName.getText(parsed);
				const label = node.attributes.properties.find((attr) => ts.isJsxAttribute(attr) && attr.name.getText(parsed) === "accessibilityLabel");
				if (tag === "BottomActionButton" || (tag === "Pressable" && label?.initializer?.text === "Hapus lampiran")) {
					const attrs = ts.factory.updateJsxAttributes(node.attributes, node.attributes.properties.filter((attr) => !ts.isJsxAttribute(attr) || attr.name.getText(parsed) !== "onPress"));
					node = ts.isJsxOpeningElement(node) ? ts.factory.updateJsxOpeningElement(node, node.tagName, node.typeArguments, attrs) : ts.factory.updateJsxSelfClosingElement(node, node.tagName, node.typeArguments, attrs);
				}
			}
			return ts.visitEachChild(node, visit, context);
		};
		return (node) => ts.visitNode(node, visit);
	}]);
	const output = ts.createPrinter().printNode(ts.EmitHint.Unspecified, transform.transformed[0], parsed).replace(/\s+/g, " ").trim();
	transform.dispose(); return output;
};
const renderChecks = sources.map((file, index) => ({
	file, comparison: "Returned JSX identical except remove-button event binding and deferred form submit binding",
	passed: render(fs.readFileSync(path.join(__dirname, index ? "form.before.tsx.txt" : "attachment.before.tsx.txt"), "utf8"), index ? "SupportFormScreen" : "SupportAttachmentInput") === render(fs.readFileSync(file, "utf8"), index ? "SupportFormEditor" : "SupportAttachmentInput"),
}));
const passed = lint.exitCode === 0 && files.every((item) => !item.errors && !item.warnings) && biome.exitCode === 0 && diff.status === 0 && renderChecks.every((item) => item.passed);
const output = { owner: "Codex-3", status: passed ? "PASS" : "FAILED", lint, biome, diff: { exitCode: diff.status, stdout: diff.stdout.trim(), stderr: diff.stderr.trim() }, renderChecks, sourceHashes: Object.fromEntries(sources.map((file) => [file, crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex")])) };
fs.writeFileSync(path.join(__dirname, "quality-results.json"), JSON.stringify(output, null, 2) + "\n");
console.log(JSON.stringify({ passed, eslintExitCode: lint.exitCode, biomeExitCode: biome.exitCode, diffExitCode: diff.status, renderChecksPassed: renderChecks.every((item) => item.passed), messages: files.flatMap((item) => item.messages) }));
process.exitCode = passed ? 0 : 1;
