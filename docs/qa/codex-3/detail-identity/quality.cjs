const fs = require("node:fs"), path = require("node:path"), ts = require("typescript"), crypto = require("node:crypto");
const { spawnSync } = require("node:child_process");
const sources = ["components/feature/manage/roles/RoleDetailScreen.tsx", "components/feature/manage/workers/WorkerDetailScreen.tsx", "components/feature/manage/member/MemberDetailScreen.tsx"];
const domains = ["Role", "Worker", "Member"], snapshots = ["role.before.tsx.txt", "worker.before.tsx.txt", "member.before.tsx.txt"];
const hash = file => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const run = args => {
	const result = spawnSync(process.execPath, args, { encoding: "utf8" });
	return { command: ["node", ...args], exitCode: result.status, stdout: result.stdout.trim(), stderr: result.stderr.trim() };
};
const lint = run(["node_modules/eslint/bin/eslint.js", ...sources, "--no-cache", "--max-warnings", "0", "--format", "json"]);
lint.files = JSON.parse(lint.stdout).map(item => ({ file: path.relative(process.cwd(), item.filePath).replaceAll("\\", "/"), errors: item.errorCount, warnings: item.warningCount, messages: item.messages }));
delete lint.stdout;
const biome = run(["node_modules/@biomejs/biome/bin/biome", "check", ...sources]);
const diffRun = spawnSync("git", ["-c", "core.autocrlf=false", "diff", "--check", "--", ...sources], { encoding: "utf8" });
const diff = { exitCode: diffRun.status, stdout: diffRun.stdout.trim(), stderr: diffRun.stderr.trim() };
const printer = ts.createPrinter();
const bodyChecks = sources.map((file, i) => {
	const beforeText = fs.readFileSync(path.join(__dirname, snapshots[i]), "utf8").replaceAll("\r\n", "\n");
	const afterText = fs.readFileSync(file, "utf8").replaceAll("\r\n", "\n");
	const before = ts.createSourceFile(file, beforeText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
	const after = ts.createSourceFile(file, afterText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
	const fn = (tree, name) => tree.statements.find(node => ts.isFunctionDeclaration(node) && node.name?.text === name);
	const original = fn(before, domains[i] + "DetailScreen"), wrapper = fn(after, domains[i] + "DetailScreen"), content = fn(after, domains[i] + "DetailContent");
	const print = (node, tree) => printer.printNode(ts.EmitHint.Unspecified, node, tree);
	const expectedWrapper = `{\n    return <${domains[i]}DetailContent key={id ?? ""} id={id}/>;\n}`;
	const boundaryRemoved = afterText.replace(`export default function ${domains[i]}DetailScreen({ id }: { id?: string }) {\n\treturn <${domains[i]}DetailContent key={id ?? ""} id={id} />;\n}\n\nfunction ${domains[i]}DetailContent({ id }: { id?: string }) {`, `export default function ${domains[i]}DetailScreen({ id }: { id?: string }) {`);
	return {
		file,
		originalBodyUnchanged: print(original.body, before) === print(content.body, after),
		publicParametersUnchanged: original.parameters.map(node => print(node, before)).join() === wrapper.parameters.map(node => print(node, after)).join(),
		contentParametersUnchanged: original.parameters.map(node => print(node, before)).join() === content.parameters.map(node => print(node, after)).join(),
		importsUnchanged: before.statements.filter(ts.isImportDeclaration).map(node => print(node, before)).join("\n") === after.statements.filter(ts.isImportDeclaration).map(node => print(node, after)).join("\n"),
		keyedWrapperExact: print(wrapper.body, after) === expectedWrapper,
		wholeSourceIdenticalExceptBoundary: boundaryRemoved === beforeText,
	};
});
const configRead = ts.readConfigFile("tsconfig.json", ts.sys.readFile);
const config = ts.parseJsonConfigFileContent(configRead.config, ts.sys, process.cwd());
const declarations = config.fileNames.filter(file => file.endsWith(".d.ts"));
const options = { ...config.options, noEmit: true, incremental: false };
delete options.tsBuildInfoFile;
const program = ts.createProgram([...sources.map(file => path.resolve(file)), ...declarations], options);
const diagnostics = [...(configRead.error ? [configRead.error] : []), ...config.errors, ...ts.getPreEmitDiagnostics(program)].map(item => ({ code: item.code, category: ts.DiagnosticCategory[item.category], file: item.file ? path.relative(process.cwd(), item.file.fileName).replaceAll("\\", "/") : null, line: item.file && item.start != null ? item.file.getLineAndCharacterOfPosition(item.start).line + 1 : null, message: ts.flattenDiagnosticMessageText(item.messageText, "\n") }));
const passed = lint.exitCode === 0 && lint.files.every(item => !item.errors && !item.warnings) && biome.exitCode === 0 && diff.exitCode === 0 && bodyChecks.every(item => Object.entries(item).filter(([key]) => key !== "file").every(([, value]) => value === true)) && diagnostics.length === 0;
const output = { owner: "Codex-3", ticket: "SD3-010", status: passed ? "PASS" : "FAILED", lint, biome, diff, bodyChecks, focusedTypecheck: { config: "tsconfig.json", roots: sources, declarationRoots: declarations.map(file => path.relative(process.cwd(), file).replaceAll("\\", "/")), programSourceFiles: program.getSourceFiles().length, scope: "Actual project options/declarations and import closure of three edited sources; not full-project TypeScript" }, diagnostics, sourceHashes: Object.fromEntries(sources.map(file => [file, hash(file)])) };
fs.writeFileSync(path.join(__dirname, "quality-results.json"), JSON.stringify(output, null, 2) + "\n");
console.log(JSON.stringify({ status: output.status, eslint: lint.exitCode, biome: biome.exitCode, diff: diff.exitCode, bodyChecks, typeDiagnostics: diagnostics, biomeOutput: biome.stdout + "\n" + biome.stderr }));
process.exitCode = passed ? 0 : 1;
