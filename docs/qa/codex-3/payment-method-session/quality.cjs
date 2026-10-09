const fs = require("node:fs"), path = require("node:path"), crypto = require("node:crypto"), ts = require("typescript");
const { spawnSync } = require("node:child_process");
const sources = ["app/(no-layout)/manage/payment-method/index.tsx", "app/(no-layout)/manage/payment-method/modify.tsx", "app/(no-layout)/manage/payment-method/detail.tsx", "app/(no-layout)/manage/payment-method/_layout.tsx", "components/feature/manage/settings/PaymentMethodModifyScreen.tsx", "components/feature/manage/settings/PaymentMethodListScreen.tsx", "components/feature/manage/settings/PaymentMethodDetailScreen.tsx", "components/feature/manage/settings/PaymentMethodDeleteDialog.tsx", "store/managePaymentMethodStore.ts", "schema/manage/payment-method.ts"];
const hash = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const run = (args) => { const out = spawnSync(process.execPath, args, { encoding: "utf8" }); return { exitCode: out.status, stdout: out.stdout.trim(), stderr: out.stderr.trim() }; };
if (process.argv.includes("--format")) { const out = run(["node_modules/@biomejs/biome/bin/biome", "check", "--write", ...sources]); console.log(JSON.stringify(out)); process.exit(out.exitCode); }
const lint = run(["node_modules/eslint/bin/eslint.js", ...sources, "--no-cache", "--max-warnings", "0", "--format", "json"]);
lint.files = JSON.parse(lint.stdout).map((item) => ({ file: path.relative(process.cwd(), item.filePath).replaceAll("\\", "/"), errors: item.errorCount, warnings: item.warningCount, messages: item.messages })); delete lint.stdout;
const biome = run(["node_modules/@biomejs/biome/bin/biome", "check", ...sources]);
const rawDiff = spawnSync("git", ["-c", "core.autocrlf=false", "diff", "--check", "--", ...sources], { encoding: "utf8" });
const diff = { exitCode: rawDiff.status, stdout: rawDiff.stdout.trim(), stderr: rawDiff.stderr.trim() };
const configRead = ts.readConfigFile("tsconfig.json", ts.sys.readFile), config = ts.parseJsonConfigFileContent(configRead.config, ts.sys, process.cwd());
const declarations = config.fileNames.filter((file) => file.endsWith(".d.ts")), options = { ...config.options, noEmit: true, incremental: false }; delete options.tsBuildInfoFile;
const program = ts.createProgram([...sources.map((file) => path.resolve(file)), ...declarations], options);
const diagnostics = [...(configRead.error ? [configRead.error] : []), ...config.errors, ...ts.getPreEmitDiagnostics(program)].map((item) => ({ code: item.code, file: item.file ? path.relative(process.cwd(), item.file.fileName).replaceAll("\\", "/") : null, line: item.file && item.start != null ? item.file.getLineAndCharacterOfPosition(item.start).line + 1 : null, message: ts.flattenDiagnosticMessageText(item.messageText, "\n") }));
const passed = lint.exitCode === 0 && lint.files.every((item) => !item.errors && !item.warnings) && biome.exitCode === 0 && diff.exitCode === 0 && !diagnostics.length;
const result = { owner: "Software Developer Senior / Codex-3", ticket: "SD3-013", status: passed ? "PASS" : "FAILED", sourceHashes: Object.fromEntries(sources.map((file) => [file, hash(file)])), lint, biome, diff, diagnostics, focusedTypecheck: { roots: sources, config: "tsconfig.json", declarationRoots: declarations, programSourceFiles: program.getSourceFiles().length, scope: "Actual tsconfig and ten source roots/import/declaration closure, not full-project TypeScript" } };
fs.writeFileSync(path.join(__dirname, "quality-results.json"), JSON.stringify(result, null, 2) + "\n");
console.log(JSON.stringify({ status: result.status, lint, biome, diff, diagnostics })); process.exitCode = passed ? 0 : 1;
