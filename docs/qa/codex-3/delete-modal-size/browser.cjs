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
			if (url.origin === origin && url.pathname === "/codex-3-delete-modal") return route.fulfill({ status: 200, contentType: "text/html", body: `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="icon" href="data:,"><style>html,body,#root{margin:0;width:100%;height:100%;overflow:hidden}#root{display:flex}${fs.readFileSync(path.join(__dirname, "web.css"), "utf8")}</style></head><body><div id="root"></div><script src="${origin}/.expo/codex-3-delete-modal-entry.bundle?platform=web&dev=false&hot=false&transform.engine=hermes&transform.bytecode=0&unstable_transformProfile=hermes-stable"></script></body></html>` });
			if (url.origin === origin && (url.pathname.includes(".bundle") || url.pathname.startsWith("/assets/") || url.pathname.endsWith(".css"))) return route.continue();
			blocked.push({ method: route.request().method(), path: url.pathname }); return route.abort();
		});
		console.log("Loading owned delete-modal fixture using existing Metro8088");
		await page.goto(origin + "/codex-3-delete-modal", { waitUntil: "commit", timeout: 180000 });
		await page.getByTestId("preview-ready").waitFor({ timeout: 180000 });
		check("closed initial modal is hidden", await page.getByRole("dialog").count() === 0);
		const scenarios = [
			...[320, 360, 390, 768].map((width) => ({ kind: "direct", width, height: width === 320 ? 640 : width === 768 ? 1024 : 844 })),
			...["role", "worker", "member", "legacy", "message", "node", "custom", "long", "loading"].map((kind) => ({ kind, width: 320, height: 640 })),
		];
		for (const scenario of scenarios) {
			const viewport = { width: scenario.width, height: scenario.height }, label = `${scenario.kind}-${scenario.width}`, domain = ["role", "worker", "member"].includes(scenario.kind);
			await page.setViewportSize(viewport);
			const before = await page.evaluate(() => ({ calls: window.codexDeleteCalls.length, closes: window.codexDeleteCallbacks.length }));
			await page.evaluate((kind) => window.codexShowDelete(kind), scenario.kind);
			const title = scenario.kind === "long" ? "Hapus seluruh data contoh pada pengaturan yang dipilih?" : "Hapus Contoh?";
			await page.getByText(title, { exact: true }).waitFor();
			await page.waitForTimeout(700);
			const dialog = page.getByRole("dialog"), cancelText = scenario.kind === "custom" ? "Kembali" : "Batal", confirmText = scenario.kind === "custom" ? "Ya, hapus" : "Hapus";
			const cancel = page.getByRole("button", { name: cancelText, exact: true }), confirm = page.getByRole("button", { name: confirmText, exact: true });
			const modal = await dialog.boundingBox(), cancelBox = await cancel.boundingBox(), confirmBox = await confirm.boundingBox(), image = await dialog.locator("img").first().boundingBox();
			check(`${label}: modal fits viewport`, inside(modal, viewport), modal);
			check(`${label}: width follows current window`, Math.abs(modal.width - Math.min(viewport.width - 32, 380)) <= 1, modal);
			check(`${label}: Batal fully visible, minimum44px`, inside(cancelBox, viewport) && cancelBox.height >= 44, cancelBox);
			check(`${label}: Hapus fully visible, minimum44px`, inside(confirmBox, viewport) && confirmBox.height >= 44, confirmBox);
			check(`${label}: buttons stay side by side`, Math.abs(cancelBox.y - confirmBox.y) <= 1 && cancelBox.x + cancelBox.width <= confirmBox.x + 1, { cancelBox, confirmBox });
			check(`${label}: image respects176px and content width`, Math.abs(image.height - 176) <= 1 && image.width <= modal.width - 48 + 1, image);
			measurements.push({ label, viewport, screen: await page.evaluate(() => ({ width: screen.width, height: screen.height })), modal, cancel: cancelBox, confirm: confirmBox, image });
			await page.screenshot({ path: path.join(output, `${label}.png`) });
			if (scenario.kind === "message") check("message fallback visible", await page.getByText("Pesan fallback tetap ditampilkan.", { exact: true }).count() === 1);
			if (scenario.kind === "node") check("React-node description visible", await page.getByText("Deskripsi dari komponen pengguna.", { exact: true }).count() === 1);
			if (scenario.kind === "loading") {
				check("loading disables both buttons", await cancel.isDisabled() && await confirm.isDisabled());
				await confirm.evaluate((element) => element.click()); await cancel.evaluate((element) => element.click());
				check("disabled buttons trigger neither callback nor request", await page.evaluate((before) => window.codexDeleteCallbacks.length === before.closes && window.codexDeleteCalls.length === before.calls, before));
				await page.evaluate(() => window.codexDeleteLoading(false));
				await page.waitForFunction(() => !document.querySelector('[role="dialog"] button').disabled);
			}
			if (domain) {
				await cancel.click(); await dialog.waitFor({ state: "hidden" });
				check(`${label}: Batal closes without delete request or acknowledgement`, await page.evaluate((before) => window.codexDeleteCalls.length === before.calls && window.codexDeleteCallbacks.length === before.closes, before));
				await page.evaluate((kind) => window.codexShowDelete(kind), scenario.kind);
				await page.getByText(title, { exact: true }).waitFor();
				await page.getByRole("button", { name: "Hapus", exact: true }).click();
				const successTitle = scenario.kind === "role" ? "Role berhasil dihapus" : scenario.kind === "worker" ? "Karyawan berhasil dihapus" : "Member berhasil dihapus";
				await page.getByText(successTitle, { exact: true }).waitFor();
				await page.getByRole("button", { name: "Tutup", exact: true }).click();
				await dialog.waitFor({ state: "hidden" });
				const after = await page.evaluate(() => ({ calls: window.codexDeleteCalls, closes: window.codexDeleteCallbacks }));
				check(`${label}: production delete stays fixture and acknowledges once`, after.calls.length === before.calls + 1 && after.calls.at(-1).method === "delete" && after.closes.length === before.closes + 1 && after.closes.at(-1).action === "deleted", after.calls.at(-1));
			} else {
				await cancel.click(); await dialog.waitFor({ state: "hidden" });
				check(`${label}: Batal closes and calls onClose once`, await page.evaluate((before) => window.codexDeleteCallbacks.length === before.closes + 1 && window.codexDeleteCallbacks.at(-1).action === "cancel", before));
				await page.evaluate((kind) => window.codexShowDelete(kind === "loading" ? "direct" : kind), scenario.kind);
				await page.getByRole("button", { name: confirmText, exact: true }).click();
				await dialog.waitFor({ state: "hidden" });
				check(`${label}: Hapus invokes only confirm once`, await page.evaluate((before) => window.codexDeleteCallbacks.length === before.closes + 2 && window.codexDeleteCallbacks.at(-1).action === "confirm", before));
			}
			console.log(`Checked ${label}`);
		}
		await page.evaluate(() => window.codexShowDelete("direct"));
		await page.getByText("Hapus Contoh?", { exact: true }).waitFor();
		for (const viewport of [{ width: 768, height: 1024 }, { width: 320, height: 640 }, { width: 390, height: 844 }]) {
			await page.setViewportSize(viewport); await page.waitForTimeout(700);
			const modal = await page.getByRole("dialog").boundingBox(), cancel = await page.getByRole("button", { name: "Batal", exact: true }).boundingBox(), confirm = await page.getByRole("button", { name: "Hapus", exact: true }).boundingBox();
			check(`open resize${viewport.width}: modal and both buttons follow viewport without props change`, inside(modal, viewport) && inside(cancel, viewport) && inside(confirm, viewport) && Math.abs(modal.width - Math.min(viewport.width - 32, 380)) <= 1, { modal, cancel, confirm });
		}
		await page.getByRole("button", { name: "Batal", exact: true }).click();
		check("no runtime errors", errors.length === 0, errors);
		check("no console errors", consoleErrors.length === 0, consoleErrors);
		check("no HTTP API attempts", blocked.length === 0, blocked);
	} catch (error) {
		exception = error.message; console.error(exception);
		if (page) await page.screenshot({ path: path.join(output, "failure.png") }).catch(() => {});
	} finally {
		const result = { owner: "Codex-3", ticket: "SD3-008", mode: baseline ? "baseline-production-source" : "final-production-source", passed: checks.filter((item) => item.passed).length, failed: checks.filter((item) => !item.passed).length, errors, consoleErrors, blocked, exception, checks, measurements,
			sourceHash: hash("components/common/DeleteConfirmModal.tsx"), fixtureHash: hash(".expo/codex-3-delete-modal-entry.jsx"), limits: "RN-web/production providers/font/modal/button and three delete-dialog domains; isolated fixture with browser-local Axios transport, no native/root auth/full router/backend/Figma claim" };
		fs.writeFileSync(path.join(output, "browser-results.json"), JSON.stringify(result, null, 2) + "\n");
		console.log(JSON.stringify({ passed: result.passed, failed: result.failed, errors: errors.length, consoleErrors: consoleErrors.length, exception }));
		if (browser) await browser.close();
		if (result.failed || errors.length || consoleErrors.length || blocked.length || exception) process.exitCode = 1;
	}
})().catch((error) => { console.error(error); process.exitCode = 2; });
