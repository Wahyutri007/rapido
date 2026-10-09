const fs = require("node:fs"), path = require("node:path"), crypto = require("node:crypto");
const { chromium } = require(path.resolve(".expo/senior6-tools/node_modules/playwright"));
const origin = "http://127.0.0.1:8088", checks = [], errors = [], consoleErrors = [], blocked = [], measurements = [];
const hash = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const check = (name, passed, detail) => checks.push({ name, passed: Boolean(passed), detail });
const inside = (box, viewport) => box && box.x >= 0 && box.y >= 0 && box.x + box.width <= viewport.width + 1 && box.y + box.height <= viewport.height + 1;
let browser, page, exception;
(async () => {
	try {
		browser = await chromium.launch({ headless: true, executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" });
		page = await browser.newPage({ viewport: { width: 320, height: 640 }, screen: { width: 360, height: 780 }, colorScheme: "dark" });
		page.setDefaultTimeout(12000);
		page.on("pageerror", (error) => errors.push(error.message));
		page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
		await page.route("**/*", async (route) => {
			const url = new URL(route.request().url());
			if (url.origin === origin && url.pathname === "/codex-3-success-modal") return route.fulfill({ status: 200, contentType: "text/html", body: `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="icon" href="data:,"><style>html,body,#root{margin:0;width:100%;height:100%;overflow:hidden}#root{display:flex}${fs.readFileSync(path.join(__dirname, "web.css"), "utf8")}</style></head><body><div id="root"></div><script src="${origin}/.expo/qc-success-proposal-entry.bundle?platform=web&dev=false&hot=false&transform.engine=hermes&transform.bytecode=0&unstable_transformProfile=hermes-stable"></script></body></html>` });
			if (url.origin === origin && (url.pathname.includes(".bundle") || url.pathname.startsWith("/assets/") || url.pathname.endsWith(".css"))) return route.continue();
			blocked.push({ method: route.request().method(), path: url.pathname }); return route.abort();
		});
		console.log("Loading owned shared-modal preview on existing Metro8088");
		await page.goto(origin + "/codex-3-success-modal", { waitUntil: "commit", timeout: 180000 });
		await page.getByTestId("preview-ready").waitFor({ timeout: 180000 });
		check("closed initial modal does not display a dialog", await page.getByRole("dialog").count() === 0);
		const scenarios = [
			...[320, 360, 390, 768].map((width) => ({ kind: "direct", width, height: width === 320 ? 640 : width === 768 ? 1024 : 844 })),
			...["role", "worker", "member", "legacy", "message", "node", "custom", "no-close", "long"].map((kind) => ({ kind, width: 320, height: 640 })),
		];
		for (const scenario of scenarios) {
			const viewport = { width: scenario.width, height: scenario.height }, label = `${scenario.kind}-${scenario.width}`;
			await page.setViewportSize(viewport);
			const before = await page.evaluate(() => ({ calls: window.codexModalCalls.length, closes: window.codexModalCallbacks.length }));
			await page.evaluate((kind) => window.codexShowModal(kind), scenario.kind);
			if (["role", "worker", "member"].includes(scenario.kind)) await page.getByRole("button", { name: "Hapus", exact: true }).click();
			const title = scenario.kind === "role" ? "Role berhasil dihapus" : scenario.kind === "worker" ? "Karyawan berhasil dihapus" : scenario.kind === "member" ? "Member berhasil dihapus" : scenario.kind === "long" ? "Data berhasil diperbarui untuk seluruh pengaturan yang dipilih pada halaman ini" : "Perubahan berhasil disimpan";
			await page.getByText(title, { exact: true }).waitFor();
			await page.waitForTimeout(700);
			const dialog = page.getByRole("dialog");
			const buttonLabel = scenario.kind === "custom" ? "Lanjutkan" : scenario.kind === "message" ? "Mengerti" : "Tutup";
			const modal = await dialog.boundingBox(), action = await page.getByRole("button", { name: buttonLabel, exact: true }).boundingBox();
			const image = await dialog.locator("img").first().boundingBox();
			check(`${label}: modal fits viewport`, inside(modal, viewport), modal);
			check(`${label}: action is fully visible and tappable`, inside(action, viewport) && action.height >= 44, action);
			measurements.push({ label, viewport, screen: await page.evaluate(() => ({ width: screen.width, height: screen.height })), modal, action, image });
			await page.screenshot({ path: path.join(__dirname, `${label}.png`) });
			if (scenario.kind === "message") check("message fallback visible", await page.getByText("Pesan fallback tetap ditampilkan.", { exact: true }).count() === 1);
			if (scenario.kind === "node") check("React-node description visible", await page.getByText("Deskripsi dari komponen pengguna.", { exact: true }).count() === 1);
			await page.getByRole("button", { name: buttonLabel, exact: true }).click();
			await dialog.waitFor({ state: "hidden" });
			const after = await page.evaluate(() => ({ calls: window.codexModalCalls, closes: window.codexModalCallbacks }));
			check(`${label}: production action closes and notifies once`, after.closes.length === before.closes + 1);
			if (["role", "worker", "member"].includes(scenario.kind)) check(`${label}: domain request stays in fixture`, after.calls.length === before.calls + 1 && after.calls.at(-1).method === "delete", after.calls.at(-1));
			console.log(`Checked ${label}`);
		}
		check("no runtime errors", errors.length === 0, errors);
		check("no unexpected console errors", consoleErrors.length === 0, consoleErrors);
		check("no HTTP API attempts", blocked.length === 0, blocked);
		await page.evaluate(() => window.codexShowModal("direct"));
		await page.getByText("Perubahan berhasil disimpan", { exact: true }).waitFor();
		for (const viewport of [{ width: 768, height: 1024 }, { width: 320, height: 640 }, { width: 390, height: 844 }]) {
			await page.setViewportSize(viewport);
			await page.waitForTimeout(700);
			const modal = await page.getByRole("dialog").boundingBox();
			const action = await page.getByRole("button", { name: "Tutup", exact: true }).boundingBox();
			check(`open-modal resize ${viewport.width}: modal and action follow viewport without props change`, inside(modal, viewport) && inside(action, viewport), { modal, action });
		}
		await page.getByRole("button", { name: "Tutup", exact: true }).click();
	} catch (error) {
		exception = error.message; console.error(exception);
		if (page) await page.screenshot({ path: path.join(__dirname, "modal-failure.png") }).catch(() => {});
	} finally {
		const result = { owner: "Codex-3", ticket: "SD3-007", mode: "PROPOSAL_ONLY_NOT_APPLIED", passed: checks.filter((item) => item.passed).length, failed: checks.filter((item) => !item.passed).length, errors, consoleErrors, blocked, exception, checks, measurements,
			sourceHash: hash(".expo/qc-success-modal-candidate.tsx"), fixtureHash: hash(".expo/qc-success-proposal-entry.jsx"), limits: "Real RN-web/provider/font/button/modal and three delete-dialog domains with browser-local Axios transport; standalone fixture, no native/root auth/full router/backend/Figma claim" };
		fs.writeFileSync(path.join(__dirname, "modal-browser-results.json"), JSON.stringify(result, null, 2) + "\n");
		console.log(JSON.stringify({ passed: result.passed, failed: result.failed, errors: errors.length, consoleErrors: consoleErrors.length, exception }));
		if (browser) await browser.close();
		if (result.failed || errors.length || consoleErrors.length || exception) process.exitCode = 1;
	}
})().catch((error) => { console.error(error); process.exitCode = 2; });
