const fs = require("node:fs"), path = require("node:path"), ts = require("typescript"), crypto = require("node:crypto");
const sources = ["components/feature/support/SupportAttachmentInput.tsx", "components/feature/support/SupportFormScreen.tsx"];
const config = ts.readConfigFile("tsconfig.json", ts.sys.readFile);
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, process.cwd());
const program = ts.createProgram([...sources, ...parsed.fileNames.filter((file) => file.endsWith(".d.ts"))], { ...parsed.options, noEmit: true });
const diagnostics = ts.getPreEmitDiagnostics(program);
const result = {
	owner: "Codex-3", scope: "Two support component roots plus imported dependency closure with actual project options/declarations; not full-project gate",
	diagnostics: diagnostics.map((item) => ({ file: item.file?.fileName, line: item.file && item.start !== undefined ? item.file.getLineAndCharacterOfPosition(item.start).line + 1 : undefined, message: ts.flattenDiagnosticMessageText(item.messageText, "\n") })),
	sourceHashes: Object.fromEntries(sources.map((file) => [file, crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex")])),
	exitCode: diagnostics.length ? 1 : 0,
};
fs.writeFileSync(path.join(__dirname, "typecheck-results.json"), JSON.stringify(result, null, 2) + "\n");
console.log(JSON.stringify({ diagnosticCount: diagnostics.length, exitCode: result.exitCode })); process.exitCode = result.exitCode;
