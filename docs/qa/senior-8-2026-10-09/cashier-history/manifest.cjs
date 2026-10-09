const fs = require("node:fs"),
	path = require("node:path"),
	crypto = require("node:crypto");
const output = path.join(__dirname, "verification.json");
const hash = (file) =>
	crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
if (process.argv.includes("--check")) {
	const { files } = JSON.parse(fs.readFileSync(output, "utf8"));
	const changed = files.filter(
		(entry) => !fs.existsSync(entry.file) || hash(entry.file) !== entry.sha256,
	);
	console.log(JSON.stringify({ checked: files.length, changed }));
	process.exitCode = changed.length ? 1 : 0;
} else {
	const quality = JSON.parse(
		fs.readFileSync(path.join(__dirname, "quality.json"), "utf8"),
	);
	const results = JSON.parse(
		fs.readFileSync(path.join(__dirname, "results.json"), "utf8"),
	);
	const stale = results.files.filter(
		(entry) => hash(entry.file) !== entry.sha256,
	);
	if (
		stale.length ||
		results.failed ||
		quality.diagnostics.length ||
		quality.checks.some((c) => c.status !== 0)
	)
		throw Error("Stale or failed evidence: " + JSON.stringify(stale));
	const artifacts = [
		"HANDOFF.md",
		"check.cjs",
		"results.json",
		"quality.cjs",
		"quality.json",
		"initial-quality.json",
		"manifest.cjs",
	].map((file) => path.join(__dirname, file));
	const files = [
		...new Set(
			[
				...quality.sources,
				...results.files.map((entry) => entry.file),
				...artifacts,
			].map((file) =>
				path.relative(process.cwd(), path.resolve(file)).replaceAll("\\", "/"),
			),
		),
	];
	fs.writeFileSync(
		output,
		JSON.stringify(
			{
				ticket: "CASHIER-HISTORY-001",
				owner: "Software Developer Senior 8",
				status: "READY_FOR_QA",
				developerChecks: results.passed,
				files: files.map((file) => ({ file, sha256: hash(file) })),
			},
			null,
			2,
		) + "\n",
	);
	console.log(JSON.stringify({ sealed: files.length }));
}
