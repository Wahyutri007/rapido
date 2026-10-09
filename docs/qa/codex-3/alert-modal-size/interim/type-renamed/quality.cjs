const fs = require("node:fs"), path = require("node:path"), crypto = require("node:crypto"), ts = require("typescript"), { spawnSync } = require("node:child_process");
const source = "components/common/AlertModal.tsx";
const hash = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const run = (args) => { const result = spawnSync(process.execPath, args, { encoding: "utf8" }); return { exitCode: result.status, stdout: result.stdout.trim(), stderr: result.stderr.trim() }; };
const lint = run(["node_modules/eslint/bin/eslint.js", source, "--no-cache", "--max-warnings", "0", "--format", "json"]);
lint.files = JSON.parse(lint.stdout); delete lint.stdout;
const biome = run(["node_modules/@biomejs/biome/bin/biome", "check", source]);
const diff = spawnSync("git", ["-c", "core.autocrlf=false", "diff", "--check", "--", source], { encoding: "utf8" });
function normalized(text) {
	const parsed = ts.createSourceFile("modal.tsx", text.replaceAll("\r\n", "\n"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
	const transformed = ts.transform(parsed, [(context) => {
		const visit = (original) => {
			let node = original;
			if (ts.isTypeAliasDeclaration(node) && node.name.text === "AlertModalProps") node = ts.factory.updateTypeAliasDeclaration(node, node.modifiers, ts.factory.createIdentifier("AlertModal"), node.typeParameters, node.type);
			if (ts.isTypeReferenceNode(node) && ts.isIdentifier(node.typeName) && node.typeName.text === "AlertModalProps") node = ts.factory.updateTypeReferenceNode(node, ts.factory.createIdentifier("AlertModal"), node.typeArguments);
			if (ts.isImportSpecifier(node) && ["Dimensions", "useWindowDimensions"].includes(node.name.text)) return undefined;
			if (ts.isVariableStatement(node) && node.getText(parsed).replace(/\s/g, "") === "const{width}=useWindowDimensions();") return undefined;
			if (ts.isJsxSelfClosingElement(node) && node.tagName.getText(parsed) === "Image") node = ts.factory.updateJsxSelfClosingElement(node, node.tagName, node.typeArguments, ts.factory.updateJsxAttributes(node.attributes, node.attributes.properties.filter((attr) => !ts.isJsxAttribute(attr) || attr.name.getText(parsed) !== "style")));
			if (ts.isJsxOpeningElement(node) && node.tagName.getText(parsed) === "ModalContent") {
				const attrs = node.attributes.properties.map((attr) => {
					if (!ts.isJsxAttribute(attr) || attr.name.getText(parsed) !== "style") return attr;
					const expr = attr.initializer.expression;
					const object = ts.factory.updateObjectLiteralExpression(expr, expr.properties.filter((prop) => prop.name?.getText(parsed) !== "width"));
					return ts.factory.updateJsxAttribute(attr, attr.name, ts.factory.updateJsxExpression(attr.initializer, undefined, object));
				});
				node = ts.factory.updateJsxOpeningElement(node, node.tagName, node.typeArguments, ts.factory.updateJsxAttributes(node.attributes, attrs));
			}
			return ts.visitEachChild(node, visit, context);
		};
		return (root) => ts.visitNode(root, visit);
	}]);
	const value = ts.createPrinter().printFile(transformed.transformed[0]).replace(/\s+/g, " ").trim(); transformed.dispose(); return value;
}
const before = fs.readFileSync(path.join(__dirname, "AlertModal.before.tsx.txt"), "utf8"), after = fs.readFileSync(source, "utf8");
const contractUnchanged = normalized(before) === normalized(after);
const emitted = (text) => ts.transpileModule(text, { compilerOptions: { jsx: ts.JsxEmit.React, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const privateTypeRenameRuntimeIdentical = emitted(after) === emitted(fs.readFileSync(path.join(__dirname, "interim/AlertModal.tsx.txt"), "utf8"));
const config = ts.readConfigFile("tsconfig.json", ts.sys.readFile), parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, process.cwd());
const program = ts.createProgram([source, ...parsed.fileNames.filter((file) => file.endsWith(".d.ts"))], { ...parsed.options, noEmit: true });
const diagnostics = ts.getPreEmitDiagnostics(program).map((item) => ({ file: item.file?.fileName, message: ts.flattenDiagnosticMessageText(item.messageText, "\n") }));
const result = { owner: "Codex-3", ticket: "SD3-009", sourceHash: hash(source), baselineHash: hash(path.join(__dirname, "AlertModal.before.tsx.txt")), lint, biome, diff: { exitCode: diff.status, stdout: diff.stdout.trim(), stderr: diff.stderr.trim() }, contractUnchanged,
	contractComparison: "Full AST unchanged except four geometry changes and private type alias name AlertModal -> AlertModalProps; props/callbacks/copy/remaining JSX intact", privateTypeRenameRuntimeIdentical, diagnostics,
	typeScope: "One shared modal root + imported dependency closure and actual project options/declarations; caller AST inventory, not all screens/full-project type gate" };
const passed = !lint.exitCode && lint.files.every((file) => !file.errorCount && !file.warningCount) && !biome.exitCode && diff.status === 0 && contractUnchanged && privateTypeRenameRuntimeIdentical && !diagnostics.length;
result.status = passed ? "PASS" : "FAILED";
fs.writeFileSync(path.join(__dirname, "quality-results.json"), JSON.stringify(result, null, 2) + "\n");
console.log(JSON.stringify({ passed, eslintExitCode: lint.exitCode, biomeExitCode: biome.exitCode, diffExitCode: diff.status, contractUnchanged, diagnostics: diagnostics.length, biome: biome.stdout + biome.stderr, lintMessages: lint.files.flatMap((file) => file.messages) }));
process.exitCode = passed ? 0 : 1;
