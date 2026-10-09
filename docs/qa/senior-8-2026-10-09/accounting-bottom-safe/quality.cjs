const fs = require("node:fs"),
	path = require("node:path"),
	cp = require("node:child_process"),
	ts = require("typescript");
const { ESLint } = require("eslint");
async function main() {
	const migration = JSON.parse(
		fs.readFileSync(path.join(__dirname, "migration.json"), "utf8"),
	);
	const sources = [
		...migration.changes.map((e) => e.file),
		"components/common/BottomActionBar.tsx",
	];
	const eslint = new ESLint();
	const simplify = (results) =>
		results.flatMap((r) =>
			r.messages.map((m) => ({
				file: path.relative(process.cwd(), r.filePath).replaceAll("\\", "/"),
				rule: m.ruleId,
				severity: m.severity,
				message: m.message,
			})),
		);
	const baseline = [];
	for (const entry of migration.changes)
		baseline.push(
			...simplify(
				await eslint.lintText(fs.readFileSync(entry.snapshot, "utf8"), {
					filePath: entry.file,
				}),
			),
		);
	const final = simplify(await eslint.lintFiles(sources));
	const signature = (m) =>
		JSON.stringify({
			...m,
			message: m.message
				.replace(/\(at line \d+\)/g, "(at line #)")
				.split(/\n\n[A-Z]:\\/)[0],
		});
	const remaining = [...baseline];
	const introduced = final.filter((m) => {
		const i = remaining.findIndex((old) => signature(old) === signature(m));
		if (i >= 0) {
			remaining.splice(i, 1);
			return false;
		}
		return true;
	});
	const checks = [
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
	const config = ts.parseJsonConfigFileContent(
		raw.config,
		ts.sys,
		process.cwd(),
	);
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
		JSON.stringify(
			{
				sources,
				lint: { baseline, final, introduced },
				checks,
				roots,
				diagnostics,
			},
			null,
			2,
		) + "\n",
	);
	console.log(
		JSON.stringify({
			baselineLint: baseline.length,
			finalLint: final.length,
			introduced,
			commands: checks.map((c) => c.status),
			diagnostics,
		}),
	);
	process.exitCode =
		introduced.length ||
		diagnostics.length ||
		checks.some((c) => c.status !== 0)
			? 1
			: 0;
}
main().catch((e) => {
	console.error(e);
	process.exitCode = 2;
});
