const fs = require("node:fs");
const path = require("node:path");
const cp = require("node:child_process");
const crypto = require("node:crypto");
const root = path.resolve(__dirname, "../../..");
const ts = require(path.join(root, "node_modules/typescript"));
const roots = ["app/(cashier)/location/index.tsx","app/(no-layout)/(cashier)/location/detail.tsx","app/(no-layout)/(cashier)/location/_layout.tsx","components/feature/cashier/location/CashierLocationScreen.tsx","components/feature/cashier/location/CashierLocationDetailScreen.tsx","components/feature/cashier/location/LocationCommon.tsx","lib/cashier/location.ts","types/ui/cashier/location.ts","app/(no-layout)/(cashier)/_layout.tsx","app/(cashier)/_layout.tsx","components/custom/BottomTab.tsx"];
const digest = (file) => crypto.createHash("sha256").update(fs.readFileSync(path.join(root, file))).digest("hex");
const sourceHashesBefore = Object.fromEntries(roots.map((file) => [file, digest(file)]));
const run = (args) => cp.spawnSync(process.execPath, args, { cwd: root, encoding: "utf8" });
const lint = run(["node_modules/eslint/bin/eslint.js", ...roots, "--format", "json"]);
const biome = run(["node_modules/@biomejs/biome/bin/biome", "check", ...roots]);
const diff = cp.spawnSync("git", ["diff", "--check", "--", ...roots], { cwd: root, encoding: "utf8" });
const read = ts.readConfigFile(path.join(root, "tsconfig.json"), ts.sys.readFile);
const config = ts.parseJsonConfigFileContent(read.config, ts.sys, root);
const program = ts.createProgram([...roots.map((file) => path.join(root, file)), ...config.fileNames.filter((file) => file.endsWith(".d.ts"))], { ...config.options, noEmit: true, incremental: false });
const diagnostics = [...(read.error ? [read.error] : []), ...config.errors, ...ts.getPreEmitDiagnostics(program)];
const closureSourceHashes = {};
const sourceDrift = [];
for (const source of program.getSourceFiles()) {
	if (source.isDeclarationFile || /[\\/]node_modules[\\/]/.test(source.fileName)) continue;
	const file = path.relative(root, source.fileName).replaceAll("\\", "/");
	const bytes = fs.readFileSync(source.fileName);
	if (source.text !== bytes.toString("utf8").replace(/^\uFEFF/, "")) sourceDrift.push(file);
	closureSourceHashes[file] = crypto.createHash("sha256").update(bytes).digest("hex");
}
const rows = JSON.parse(lint.stdout || "[]");
const sourceHashesAfter = Object.fromEntries(roots.map((file) => [file, digest(file)]));
for (const file of roots) if (sourceHashesBefore[file] !== sourceHashesAfter[file]) sourceDrift.push(file);
const result = {
	ticket: "PM-LOCATION-PUBLICATION",
	recordedAtUtc: new Date().toISOString(),
	scope: "Eleven candidate source roots and imported closure; declaration inputs included, no global app check",
	roots, sourceHashesBefore, sourceHashesAfter, sourceDrift, closureSourceHashes,
	filesInClosure: program.getSourceFiles().length,
	eslint: { exit: lint.status, errors: rows.reduce((n, row) => n + row.errorCount, 0), warnings: rows.reduce((n, row) => n + row.warningCount, 0), messages: rows.flatMap((row) => row.messages), stderr: lint.stderr },
	biome: { exit: biome.status, stdout: biome.stdout, stderr: biome.stderr },
	diff: { exit: diff.status, stdout: diff.stdout, stderr: diff.stderr },
	diagnosticCount: diagnostics.length,
	diagnostics: diagnostics.map((item) => ({ file: item.file?.fileName, code: item.code, message: ts.flattenDiagnosticMessageText(item.messageText, " ") })),
};
fs.writeFileSync(path.join(__dirname, "quality-results.json"), JSON.stringify(result, null, 2) + "\n", { flag: "wx" });
console.log(JSON.stringify({ ...result, closureSourceHashes: undefined }));
process.exitCode = lint.status || biome.status || diff.status || diagnostics.length || sourceDrift.length ? 1 : 0;
