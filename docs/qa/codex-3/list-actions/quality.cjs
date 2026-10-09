const fs = require("node:fs"), path = require("node:path"), ts = require("typescript"), crypto = require("node:crypto");
const { spawnSync } = require("node:child_process");
const sources = ["components/feature/manage/ManageListActions.tsx", "components/feature/manage/roles/RoleListScreen.tsx", "components/feature/manage/workers/WorkerListScreen.tsx", "components/feature/manage/member/MemberListScreen.tsx"];
const domains = ["Role", "Worker", "Member"], snapshots = ["role.before.tsx.txt", "worker.before.tsx.txt", "member.before.tsx.txt"];
const hash = file => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const run = args => { const result = spawnSync(process.execPath, args, { encoding: "utf8" }); return { exitCode: result.status, command: ["node", ...args], stdout: result.stdout.trim(), stderr: result.stderr.trim() }; };
const lint = run(["node_modules/eslint/bin/eslint.js", ...sources, "--no-cache", "--max-warnings", "0", "--format", "json"]);
lint.files = JSON.parse(lint.stdout).map(item => ({ file: path.relative(process.cwd(), item.filePath).replaceAll("\\", "/"), errors: item.errorCount, warnings: item.warningCount, messages: item.messages })); delete lint.stdout;
const biome = run(["node_modules/@biomejs/biome/bin/biome", "check", ...sources]);
const rawDiff = spawnSync("git", ["-c", "core.autocrlf=false", "diff", "--check", "--", ...sources], { encoding: "utf8" });
const diff = { exitCode: rawDiff.status, stdout: rawDiff.stdout.trim(), stderr: rawDiff.stderr.trim() };
function visibleLayout(text, name) {
	const tree = ts.createSourceFile(name + ".tsx", text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
	const fn = tree.statements.find(node => ts.isFunctionDeclaration(node) && node.name?.text === name + "ListScreen");
	let root = fn.body.statements.find(ts.isReturnStatement).expression;
	while (ts.isParenthesizedExpression(root)) root = root.expression;
	const layout = root.children.filter(node => ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)).slice(0, 2);
	const transform = ts.transform(layout, [context => {
		const visit = original => {
			let node = original;
			if (ts.isJsxOpeningElement(node) && node.tagName.getText(tree) === "Pressable") {
				const attributes = ts.factory.updateJsxAttributes(node.attributes, node.attributes.properties.map(attr => ts.isJsxAttribute(attr) && attr.name.getText(tree) === "onPress" ? ts.factory.updateJsxAttribute(attr, attr.name, ts.factory.createJsxExpression(undefined, ts.factory.createStringLiteral("selection event"))) : attr));
				node = ts.factory.updateJsxOpeningElement(node, node.tagName, node.typeArguments, attributes);
			}
			return ts.visitEachChild(node, visit, context);
		};
		return node => ts.visitNode(node, visit);
	}]);
	const printed = transform.transformed.map(node => ts.createPrinter().printNode(ts.EmitHint.Unspecified, node, tree)).join("\n"); transform.dispose(); return printed;
}
const layoutChecks = sources.slice(1).map((file, index) => ({ file, passed: visibleLayout(fs.readFileSync(file, "utf8"), domains[index]) === visibleLayout(fs.readFileSync(path.join(__dirname, snapshots[index]), "utf8"), domains[index]), scope: "Wrapper list/search/loading/error/refresh/empty/cards and bottom add action AST identical except row selection event handler" }));
const whitespaceChecks = sources.map(file => ({ file, passed: !/[\t ]+\r?$/m.test(fs.readFileSync(file, "utf8")) && fs.readFileSync(file, "utf8").endsWith("\n") }));
const configRead = ts.readConfigFile("tsconfig.json", ts.sys.readFile), config = ts.parseJsonConfigFileContent(configRead.config, ts.sys, process.cwd());
const declarations = config.fileNames.filter(file => file.endsWith(".d.ts")), options = { ...config.options, noEmit: true, incremental: false }; delete options.tsBuildInfoFile;
const program = ts.createProgram([...sources.map(file => path.resolve(file)), ...declarations], options);
const diagnostics = [...(configRead.error ? [configRead.error] : []), ...config.errors, ...ts.getPreEmitDiagnostics(program)].map(item => ({ code: item.code, file: item.file ? path.relative(process.cwd(), item.file.fileName).replaceAll("\\", "/") : null, line: item.file && item.start != null ? item.file.getLineAndCharacterOfPosition(item.start).line + 1 : null, message: ts.flattenDiagnosticMessageText(item.messageText, "\n") }));
const passed = lint.exitCode === 0 && lint.files.every(item => !item.errors && !item.warnings) && biome.exitCode === 0 && diff.exitCode === 0 && diagnostics.length === 0 && layoutChecks.every(item => item.passed) && whitespaceChecks.every(item => item.passed);
const output = { owner: "Codex-3", ticket: "SD3-011", status: passed ? "PASS" : "FAILED", sourceHashes: Object.fromEntries(sources.map(file => [file, hash(file)])), lint, biome, diff, layoutChecks, whitespaceChecks, diagnostics, focusedTypecheck: { roots: sources, config: "tsconfig.json", declarationRoots: declarations.map(file => path.relative(process.cwd(), file).replaceAll("\\", "/")), programSourceFiles: program.getSourceFiles().length, scope: "Actual tsconfig options/declarations and four source import closures; not full-project TypeScript" } };
fs.writeFileSync(path.join(__dirname, "quality-results.json"), JSON.stringify(output, null, 2) + "\n");
console.log(JSON.stringify({ status: output.status, lint: lint.exitCode, biome: biome.exitCode, diff: diff.exitCode, diagnostics, layoutChecks, whitespaceChecks, biomeOutput: biome.stdout + "\n" + biome.stderr }));
process.exitCode = passed ? 0 : 1;
