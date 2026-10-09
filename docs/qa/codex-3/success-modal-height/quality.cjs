const fs = require("node:fs"), path = require("node:path"), ts = require("typescript"), crypto = require("node:crypto");
const { spawnSync } = require("node:child_process");
const source = "components/common/SuccessModal.tsx", hash = file => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const run = args => { const result = spawnSync(process.execPath, args, { encoding: "utf8" }); return { exitCode: result.status, command: ["node", ...args], stdout: result.stdout.trim(), stderr: result.stderr.trim() }; };
const lint = run(["node_modules/eslint/bin/eslint.js", source, "--no-cache", "--max-warnings", "0", "--format", "json"]);
lint.files = JSON.parse(lint.stdout).map(item => ({ errors: item.errorCount, warnings: item.warningCount, messages: item.messages })); delete lint.stdout;
const biome = run(["node_modules/@biomejs/biome/bin/biome", "check", source]);
const rawDiff = spawnSync("git", ["-c", "core.autocrlf=false", "diff", "--check", "--", source], { encoding: "utf8" });
const diff = { exitCode: rawDiff.status, stdout: rawDiff.stdout.trim(), stderr: rawDiff.stderr.trim() };
const before = fs.readFileSync(path.join(__dirname, "SuccessModal.before.tsx.txt"), "utf8").replaceAll("\r\n", "\n"), after = fs.readFileSync(source, "utf8").replaceAll("\r\n", "\n");
const restored = after.replace("\tScrollView,\n", "").replace("const { width, height } = useWindowDimensions();", "const { width } = useWindowDimensions();")
	.replace("maxWidth: 380, maxHeight: height - 32", "maxWidth: 380")
	.replace('<ScrollView style={{ flexShrink: 1, minHeight: 0 }}>', "").replace("</ScrollView>", "");
function canonical(text) {
	const tree = ts.createSourceFile("SuccessModal.tsx", text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
	const result = ts.transform(tree, [context => {
		const visit = node => ts.isJsxText(node) && !node.text.trim() ? undefined : ts.visitEachChild(node, visit, context);
		return node => ts.visitNode(node, visit);
	}]);
	const output = ts.createPrinter().printFile(result.transformed[0]); result.dispose(); return output;
}
const contractUnchangedOutsideHeightScroll = canonical(before) === canonical(restored);
const exactReviewedProposal = hash(source) === hash("docs/qa/qc-success-modal-2026-10-09/proposal/SuccessModal.tsx");
const configRead = ts.readConfigFile("tsconfig.json", ts.sys.readFile), config = ts.parseJsonConfigFileContent(configRead.config, ts.sys, process.cwd());
const declarations = config.fileNames.filter(file => file.endsWith(".d.ts")), options = { ...config.options, noEmit: true, incremental: false }; delete options.tsBuildInfoFile;
const program = ts.createProgram([path.resolve(source), ...declarations], options);
const diagnostics = [...(configRead.error ? [configRead.error] : []), ...config.errors, ...ts.getPreEmitDiagnostics(program)].map(item => ({ code: item.code, file: item.file ? path.relative(process.cwd(), item.file.fileName).replaceAll("\\", "/") : null, message: ts.flattenDiagnosticMessageText(item.messageText, "\n") }));
const passed = lint.exitCode === 0 && lint.files.every(item => !item.errors && !item.warnings) && biome.exitCode === 0 && diff.exitCode === 0 && diagnostics.length === 0 && contractUnchangedOutsideHeightScroll && exactReviewedProposal;
const output = { owner: "Codex-3", ticket: "SD3-012", status: passed ? "PASS" : "FAILED", sourceHash: hash(source), lint, biome, diff, contractUnchangedOutsideHeightScroll, exactReviewedProposal, diagnostics,
	focusedTypecheck: { roots: [source], actualConfig: "tsconfig.json", declarationRoots: declarations.map(file => path.relative(process.cwd(), file).replaceAll("\\", "/")), programSourceFiles: program.getSourceFiles().length, scope: "One edited source plus actual tsconfig declarations/import closure; not global TypeScript" } };
fs.writeFileSync(path.join(__dirname, "quality-results.json"), JSON.stringify(output, null, 2) + "\n"); console.log(JSON.stringify({ status: output.status, eslint: lint.exitCode, biome: biome.exitCode, diff: diff.exitCode, contractUnchangedOutsideHeightScroll, exactReviewedProposal, diagnostics })); process.exitCode = passed ? 0 : 1;
