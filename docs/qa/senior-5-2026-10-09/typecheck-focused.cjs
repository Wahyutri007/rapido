// Run from the app root; checks only the selected roots and imported dependencies.
const fs = require("node:fs");
const ts = require("typescript");
const configFile = ts.readConfigFile("tsconfig.json", ts.sys.readFile);
if (configFile.error) throw new Error(ts.flattenDiagnosticMessageText(configFile.error.messageText, " "));
const config = ts.parseJsonConfigFileContent(configFile.config, ts.sys, process.cwd());
const roots = [
  "app/(onboarding)/onboarding.tsx",
  "components/custom/LayoutTransitionSplash.tsx",
  ...config.fileNames.filter(file => file.endsWith(".d.ts")),
];
const program = ts.createProgram(roots, { ...config.options, noEmit: true, incremental: false });
const diagnostics = [...config.errors, ...ts.getPreEmitDiagnostics(program)];
const result = {
  kind: "Selected roots plus imported dependency closure; not a full-project check",
  roots,
  diagnosticCount: diagnostics.length,
  diagnostics: diagnostics.map(d => ({
    file: d.file?.fileName,
    message: ts.flattenDiagnosticMessageText(d.messageText, " "),
  })),
};
fs.writeFileSync("docs/qa/senior-5-2026-10-09/typecheck-results.json", JSON.stringify(result, null, 2)+"\n");
console.log(JSON.stringify({ diagnosticCount: result.diagnosticCount, diagnostics: result.diagnostics }));
process.exitCode = diagnostics.length ? 1 : 0;
