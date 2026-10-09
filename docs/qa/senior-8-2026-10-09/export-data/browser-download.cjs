const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const Module = require("node:module");
const ts = require("typescript");
const { setTimeout: delay } = require("node:timers/promises");

// Reuse the isolated browser runner, exposing CDP only in this in-memory copy.
const driverPath = path.resolve(__dirname, "../browser.cjs");
const driverSource = fs.readFileSync(driverPath, "utf8");
const driver = new Module(driverPath, module);
driver.filename = driverPath;
driver.paths = Module._nodeModulePaths(path.dirname(driverPath));
driver._compile(
	driverSource.replace(
		"newPage: async () => page,",
		"send, newPage: async () => page,",
	),
	driverPath,
);
const digest = (bytes) =>
	crypto.createHash("sha256").update(bytes).digest("hex");

async function main() {
	const sourcePath = "lib/manage/export-delivery.ts";
	const source = fs.readFileSync(sourcePath, "utf8");
	const csv = fs.readFileSync(path.join(__dirname, "sample.csv"), "utf8");
	const downloadPath = fs.mkdtempSync(
		path.join(__dirname, "browser-downloads-"),
	);
	const browser = await driver.exports.launch();
	const errors = [];
	try {
		await browser.send("Browser.setDownloadBehavior", {
			behavior: "allow",
			downloadPath,
		});
		const page = await browser.newPage();
		page.on("pageerror", (error) => errors.push(String(error)));
		await page.setContent('<button id="download">Download CSV</button>');
		const code = ts.transpileModule(source, {
			compilerOptions: {
				module: ts.ModuleKind.CommonJS,
				target: ts.ScriptTarget.ES2022,
			},
		}).outputText;
		await page.addScriptTag({
			content: `window.exports = {}; window.require = () => ({ Platform: { OS: "web" } }); ${code}`,
		});
		await page.evaluate((data) => {
			document.querySelector("#download").onclick = () => {
				window.result = window.exports.deliverDataExport(
					data,
					"rapido-pratinjau-financial.csv",
				);
			};
			document.querySelector("#download").click();
		}, csv);
		const result = await page.evaluate(() => window.result);
		const file = path.join(downloadPath, "rapido-pratinjau-financial.csv");
		for (let i = 0; !fs.existsSync(file) && i < 40; i++) await delay(250);
		const bytes = fs.existsSync(file) ? fs.readFileSync(file) : Buffer.alloc(0);
		const checks = [
			{
				name: "production delivery returns download",
				passed: result === "download",
			},
			{
				name: "browser writes CSV bytes including BOM",
				passed: bytes.equals(Buffer.from(csv)),
			},
			{ name: "no runtime errors", passed: errors.length === 0 },
		];
		const report = {
			checks,
			errors,
			passed: checks.filter((c) => c.passed).length,
			failed: checks.filter((c) => !c.passed).length,
			source: { file: sourcePath, sha256: digest(source) },
			driver: {
				file: path.relative(process.cwd(), driverPath),
				sha256: digest(driverSource),
			},
			download: {
				file: path.relative(process.cwd(), file),
				sha256: digest(bytes),
				bytes: bytes.length,
			},
			limits:
				"Actual Edge Blob/anchor download using production delivery and generated fixture CSV. No app screen/navigation/native visual coverage; no shared Metro/API server used.",
		};
		fs.writeFileSync(
			path.join(__dirname, "browser-results.json"),
			JSON.stringify(report, null, 2) + "\n",
		);
		console.log(JSON.stringify(report));
		process.exitCode = report.failed ? 1 : 0;
	} finally {
		await browser.close();
	}
}
main().catch((error) => {
	console.error(error);
	process.exitCode = 2;
});
