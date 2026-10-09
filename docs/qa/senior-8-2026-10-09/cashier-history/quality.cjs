const fs = require("node:fs"),
	path = require("node:path"),
	cp = require("node:child_process"),
	ts = require("typescript");
const sources = [
	"app/(cashier)/report/history.tsx",
	"app/(cashier)/report/history-detail.tsx",
	"app/(cashier)/report/_layout.tsx",
	"components/feature/cashier/history/HistoryScreen.tsx",
	"components/feature/cashier/history/HistoryDetailScreen.tsx",
	"lib/cashier/transaction-history.ts",
];
const checks = [
	[
		process.execPath,
		["node_modules/eslint/bin/eslint.js", ...sources, "--max-warnings", "0"],
	],
	[
		process.execPath,
		["node_modules/@biomejs/biome/bin/biome", "check", ...sources],
	],
	["git", ["diff", "--check", "--", ...sources]],
].map(([command, args]) => {
	const r = cp.spawnSync(command, args, {
		encoding: "utf8",
		windowsHide: true,
	});
	return {
		command,
		args,
		status: r.status,
		stdout: r.stdout,
		stderr: r.stderr,
	};
});
const raw = ts.readConfigFile("tsconfig.json", ts.sys.readFile);
if (raw.error) throw Error("Cannot read TS config");
const config = ts.parseJsonConfigFileContent(raw.config, ts.sys, process.cwd());
const roots = [
	...sources,
	...config.fileNames.filter((p) => p.endsWith(".d.ts")),
];
const program = ts.createProgram(roots, {
	...config.options,
	noEmit: true,
	incremental: false,
});
const diagnostics = [
	...config.errors,
	...ts.getPreEmitDiagnostics(program),
].map((d) => ({
	file: d.file?.fileName,
	message: ts.flattenDiagnosticMessageText(d.messageText, " "),
}));
fs.writeFileSync(
	path.join(__dirname, "quality.json"),
	JSON.stringify({ sources, checks, roots, diagnostics }, null, 2) + "\n",
);
console.log(
	JSON.stringify({ commands: checks.map((c) => c.status), diagnostics }),
);
process.exitCode =
	checks.some((c) => c.status !== 0) || diagnostics.length ? 1 : 0;
