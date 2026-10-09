const fs = require("node:fs"),
	path = require("node:path"),
	cp = require("node:child_process"),
	ts = require("typescript");
const source =
	"app/(no-layout)/(back-office)/report/accounting/accounts/detail.tsx";
const commands = [
	[
		process.execPath,
		["node_modules/eslint/bin/eslint.js", source, "--max-warnings", "0"],
	],
	[
		process.execPath,
		["node_modules/@biomejs/biome/bin/biome", "check", source],
	],
	["git", ["diff", "--check", "--", source]],
];
const checks = commands.map(([command, args]) => {
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
		error: r.error?.message,
	};
});
const raw = ts.readConfigFile("tsconfig.json", ts.sys.readFile);
if (raw.error)
	throw Error(ts.flattenDiagnosticMessageText(raw.error.messageText, " "));
const config = ts.parseJsonConfigFileContent(raw.config, ts.sys, process.cwd());
const roots = [source, ...config.fileNames.filter((p) => p.endsWith(".d.ts"))];
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
	JSON.stringify({ checks, roots, diagnostics }, null, 2) + "\n",
);
console.log(
	JSON.stringify({
		commands: checks.map((c) => c.status),
		diagnostics: diagnostics.length,
	}),
);
process.exitCode =
	checks.some((c) => c.status !== 0) || diagnostics.length ? 1 : 0;
