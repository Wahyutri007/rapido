const fs = require("node:fs"), path = require("node:path"), crypto = require("node:crypto");
const { chromium } = require(path.resolve(".expo/senior6-tools/node_modules/playwright"));
const baseline = process.argv.includes("--baseline"), output = path.join(__dirname, baseline ? "baseline" : "final");
fs.mkdirSync(output, { recursive: true });
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
			if (url.origin === origin && url.pathname === "/codex-3-alert-modal") return route.fulfill({ status: 200, contentType: "text/html", body: `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="icon" href="data:,"><style>html,body,#root{margin:0;width:100%;height:100%;overflow:hidden}#root{display:flex}${fs.readFileSync(path.join(__dirname, "web.css"), "utf8")}</style></head><body><div id="root"></div><script src="${origin}/.expo/codex-3-alert-modal-entry.bundle?platform=web&dev=false&hot=false&transform.engine=hermes&transform.bytecode=0&unstable_transformProfile=hermes-stable"></script></body></html>` });
			if (url.origin === origin && (url.pathname.includes(".bundle") || url.pathname.startsWith("/assets/") || url.pathname.endsWith(".css"))) return route.continue();
			blocked.push({ method: route.request().method(), path: url.pathname }); return route.abort();
		});
		console.log("Loading owned alert-modal fixture on existing Metro8088");
		await page.goto(origin + "/codex-3-alert-modal", { waitUntil: "commit", timeout: 180000 });
		await page.getByTestId("preview-ready").waitFor({ timeout: 180000 });
		check("initial closed modal hidden", await page.getByRole("dialog").count() === 0);
		const scenarios = [
			...[320, 360, 390, 768].map((width) => ({ kind: "direct", width, height: width === 320 ? 640 : width === 768 ? 1024 : 844 })),
			...["support", "role", "worker", "member", "category", "order-type", "confirm-only", "cancel-only", "no-footer", "node", "children", "long", "fallback", "default-close", "loading"].map((kind) => ({ kind, width: 320, height: 640 })),
		];
		for (const scenario of scenarios) {
			const viewport = { width: scenario.width, height: scenario.height }, label = `${scenario.kind}-${scenario.width}`, domain = ["role", "worker", "member"].includes(scenario.kind);
			if (page.viewportSize().width !== viewport.width || page.viewportSize().height !== viewport.height) await page.setViewportSize(viewport);
			const before = await page.evaluate(() => ({ calls: window.codexAlertCalls.length, closes: window.codexAlertCallbacks.length }));
			await page.evaluate((kind) => window.codexShowAlert(kind), scenario.kind);
			if (domain) await page.getByRole("button", { name: "Hapus", exact: true }).click();
			const title = scenario.kind === "support" ? "Pengiriman belum tersedia" : domain ? scenario.kind === "role" ? "Role gagal dihapus" : scenario.kind === "worker" ? "Karyawan gagal dihapus" : "Member gagal dihapus" : scenario.kind === "long" ? "Periksa kembali seluruh data pada pengaturan yang dipilih" : "Periksa kembali data";
			await page.getByText(title, { exact: true }).waitFor(); await page.waitForTimeout(600);
			const dialog = page.getByRole("dialog").last(), modal = await dialog.boundingBox();
			const cancelText = "Tidak, batal", confirmText = domain ? "Kembali" : scenario.kind === "support" ? "Kembali ke form" : ["category", "order-type"].includes(scenario.kind) ? "Mengerti" : "Iya, lanjut";
			const cancel = dialog.getByRole("button", { name: cancelText, exact: true }), confirm = dialog.getByRole("button", { name: confirmText, exact: true });
			const maxWidth = await dialog.evaluate((element) => Number.parseFloat(getComputedStyle(element).maxWidth)), desiredWidth = Math.min(viewport.width - 32, Number.isFinite(maxWidth) ? maxWidth : Infinity);
			check(`${label}: alert fits viewport`, inside(modal, viewport), modal);
			check(`${label}: width follows window and existing primitive maximum`, Math.abs(modal.width - desiredWidth) <= 1, { modal, maxWidth: Number.isFinite(maxWidth) ? maxWidth : "none", desiredWidth });
			const boxes = { cancel: await cancel.count() ? await cancel.boundingBox() : null, confirm: await confirm.count() ? await confirm.boundingBox() : null };
			for (const [action, box] of Object.entries(boxes)) if (box) check(`${label}: ${action} fully visible and minimum44px`, inside(box, viewport) && box.height >= 44, box);
			const image = await dialog.locator("img").count() ? await dialog.locator("img").first().boundingBox() : null;
			if (image) check(`${label}: image128px fits content width`, Math.abs(image.height - 128) <= 1 && image.width <= modal.width - 40 + 1, image);
			if (boxes.cancel && boxes.confirm) check(`${label}: footer remains two side-by-side buttons`, Math.abs(boxes.cancel.y - boxes.confirm.y) <= 1 && boxes.cancel.x + boxes.cancel.width <= boxes.confirm.x + 1, boxes);
			if (scenario.kind === "no-footer") check("both hidden props keep footer absent", await dialog.getByRole("button").count() === 0);
			if (scenario.kind === "node") check("React-node message visible", await dialog.getByText("Pesan dari komponen pengguna.").count() === 1);
			if (scenario.kind === "children") check("children slot visible", await dialog.getByText("Isi tambahan dari pemanggil.").count() === 1);
			measurements.push({ label, viewport, screen: await page.evaluate(() => ({ width: screen.width, height: screen.height })), modal, ...boxes, image, maxWidth: Number.isFinite(maxWidth) ? maxWidth : "none" });
			await page.screenshot({ path: path.join(output, `${label}.png`) });
			if (domain) {
				check(`${label}: rejected DELETE is local fixture`, await page.evaluate((before) => window.codexAlertCalls.length === before.calls + 1 && window.codexAlertCalls.at(-1).rejected, before));
				await confirm.click(); await page.getByText(title, { exact: true }).waitFor({ state: "hidden" });
				check(`${label}: Kembali dismisses error without acknowledgement`, await page.evaluate((before) => window.codexAlertCallbacks.length === before.closes, before));
				await page.getByRole("button", { name: "Hapus", exact: true }).click();
				const successTitle = scenario.kind === "role" ? "Role berhasil dihapus" : scenario.kind === "worker" ? "Karyawan berhasil dihapus" : "Member berhasil dihapus";
				await page.getByText(successTitle, { exact: true }).waitFor();
				await page.getByRole("button", { name: "Tutup", exact: true }).click();
				await page.getByRole("dialog").waitFor({ state: "hidden" });
				check(`${label}: retry works and acknowledges once`, await page.evaluate((before) => window.codexAlertCalls.length === before.calls + 2 && !window.codexAlertCalls.at(-1).rejected && window.codexAlertCallbacks.length === before.closes + 1 && window.codexAlertCallbacks.at(-1).action === "deleted", before));
			} else if (scenario.kind === "no-footer") {
				await page.evaluate(() => window.codexHideAlert()); await dialog.waitFor({ state: "hidden" });
			} else if (scenario.kind === "loading") {
				check("loading disables confirm while cancel stays enabled", await confirm.isDisabled() && !(await cancel.isDisabled()));
				await confirm.evaluate((element) => element.click());
				check("disabled confirm does not notify", await page.evaluate((before) => window.codexAlertCallbacks.length === before.closes, before));
				await cancel.click(); await dialog.waitFor({ state: "hidden" });
				check("cancel remains available during loading", await page.evaluate((before) => window.codexAlertCallbacks.length === before.closes + 1 && window.codexAlertCallbacks.at(-1).action === "cancel", before));
			} else {
				await (boxes.confirm ? confirm : cancel).click(); await dialog.waitFor({ state: "hidden" });
				const action = scenario.kind === "fallback" || !boxes.confirm ? "cancel" : "confirm";
				check(`${label}: existing callback/fallback closes once`, await page.evaluate(({ before, kind, action }) => kind === "default-close" ? window.codexAlertCallbacks.length === before.closes : window.codexAlertCallbacks.length === before.closes + 1 && window.codexAlertCallbacks.at(-1).action === action, { before, kind: scenario.kind, action }));
			}
			console.log(`Checked ${label}`);
		}
		await page.evaluate(() => window.codexShowAlert("direct"));
		await page.getByText("Periksa kembali data", { exact: true }).waitFor();
		for (const viewport of [{ width: 768, height: 1024 }, { width: 320, height: 640 }, { width: 390, height: 844 }]) {
			await page.setViewportSize(viewport); await page.waitForTimeout(600);
			const dialog = page.getByRole("dialog"), modal = await dialog.boundingBox(), cancel = await dialog.getByRole("button", { name: "Tidak, batal", exact: true }).boundingBox(), confirm = await dialog.getByRole("button", { name: "Iya, lanjut", exact: true }).boundingBox();
			const maxWidth = await dialog.evaluate((element) => Number.parseFloat(getComputedStyle(element).maxWidth));
			check(`open resize${viewport.width}: follows window without changing props`, inside(modal, viewport) && inside(cancel, viewport) && inside(confirm, viewport) && Math.abs(modal.width - Math.min(viewport.width - 32, Number.isFinite(maxWidth) ? maxWidth : Infinity)) <= 1, { modal, cancel, confirm });
		}
		await page.getByRole("button", { name: "Tidak, batal", exact: true }).click();
		check("no runtime errors", errors.length === 0, errors); check("no console errors", consoleErrors.length === 0, consoleErrors); check("no HTTP API attempts", blocked.length === 0, blocked);
	} catch (error) {
		exception = error.message; console.error(exception);
		if (page) await page.screenshot({ path: path.join(output, "failure.png") }).catch(() => {});
	} finally {
		const result = { owner: "Codex-3", ticket: "SD3-009", mode: baseline ? "baseline-production-source" : "final-production-source", passed: checks.filter((item) => item.passed).length, failed: checks.filter((item) => !item.passed).length, errors, consoleErrors, blocked, exception, checks, measurements,
			sourceHash: hash("components/common/AlertModal.tsx"), fixtureHash: hash(".expo/codex-3-alert-modal-entry.jsx"), limits: "RN-web/providers/font/modal/button and three delete-error domains; representative messages/children are parent fixture data, local Axios transport; no full native/router/root auth/Figma/backend certification" };
		fs.writeFileSync(path.join(output, "browser-results.json"), JSON.stringify(result, null, 2) + "\n");
		console.log(JSON.stringify({ passed: result.passed, failed: result.failed, errors: errors.length, consoleErrors: consoleErrors.length, exception }));
		if (browser) await browser.close();
		if (result.failed || errors.length || consoleErrors.length || blocked.length || exception) process.exitCode = 1;
	}
})().catch((error) => { console.error(error); process.exitCode = 2; });
