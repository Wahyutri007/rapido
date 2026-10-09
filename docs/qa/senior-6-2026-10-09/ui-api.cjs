// Run from app root with Metro serving .expo/senior6-ui-entry.jsx on port 8098.
const fs = require("node:fs"), path = require("node:path"), crypto = require("node:crypto"), assert = require("node:assert/strict");
const { chromium } = require(path.resolve(".expo/senior6-tools/node_modules/playwright"));
const origin = `http://localhost:${process.env.SD6_UI_PORT || 8098}`;
const output = path.resolve("docs/qa/senior-6-2026-10-09");
const sourceFiles = [
	"app/(no-layout)/manage/printer/modify.tsx", "app/(no-layout)/manage/pos-settings/rounding.tsx", "app/(no-layout)/manage/pos-settings/stock-limit.tsx",
	"api/hooks/settings.ts", "api/hooks/menus.ts", "api/factory.ts", "api/common.ts", "api/axios.ts", "hooks/usePostRequest.ts",
	"components/common/SingleSelect.tsx", "components/common/SearchBar.tsx", "components/common/SuccessModal.tsx", "components/common/AlertModal.tsx",
	"components/common/Wrapper.tsx", "components/common/BouncyPressable.tsx", "components/common/BottomActionButton.tsx",
	"components/ui/actionsheet/index.tsx", "components/ui/modal/index.tsx", "components/ui/button/index.tsx", ".expo/senior6-ui-entry.jsx",
	"global.css", "tailwind.config.js", "lib/utils/index.ts", "components/ui/gluestack-ui-provider/index.tsx",
	"components/ui/gluestack-ui-provider/config.ts", "components/common/Header.tsx", "components/common/Card.tsx", "components/common/Text.tsx", "constants/Fonts.ts",
];
const hashes = () => Object.fromEntries(sourceFiles.map(file => [file, crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex")]));
const initialHashes = hashes();
(async () => {
	const browser = await chromium.launch({ headless: true, executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", args: ["--disable-features=LocalNetworkAccessChecks"] });
	const checks = [], runtimeErrors = [], consoleErrors = [], requests = [];
	const records = {
		rounding: { enabled: true, method: "up", decimal_places: 3 },
		stock: { enabled: true, type: "hybrid", content_type: "item", details: [{ stockable_id: "item-1", stockable_type: "item" }] },
	};
	let fail = false;
	const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
	const text = value => page.getByText(value, { exact: true }).filter({ visible: true });
	const save = () => page.getByRole("button", { name: "Simpan", exact: true });
	const dialog = () => page.getByRole("dialog").last();
	const lastPayload = domain => requests.filter(request => request.method === "POST" && request.domain === domain).at(-1)?.body;
	const dismiss = async () => { await page.getByRole("button", { name: "Mengerti", exact: true }).click(); await page.getByRole("dialog").waitFor({ state: "hidden" }); };
	const navigate = async (screen, params = {}, remount = false) => {
		await page.evaluate(args => globalThis.__sd6.navigate(...args), [screen, params, remount]);
		await text(screen === "stock" ? "Aktifkan Batas Stock" : screen === "rounding" ? "Aktifkan Pembulatan" : "Printer Terdeteksi").waitFor();
	};
	const check = async (name, work) => { await work(); checks.push({ name, passed: true }); console.log(`PASS ${name}`); };
	const refetch = () => page.evaluate(() => globalThis.__sd6.refetch());
	const capture = async name => {
		// Allow RN Animated sheet/modal transitions to finish before the visual artifact.
		await page.waitForTimeout(400);
		await page.screenshot({ path: path.join(output, name + ".png") });
	};
	const fits = async () => {
		const bounds = await save().boundingBox();
		assert.ok(bounds && bounds.y >= 0 && bounds.y + bounds.height <= 845, JSON.stringify(bounds));
		assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
	};
	try {
		page.setDefaultTimeout(15000);
		page.on("pageerror", error => runtimeErrors.push(error.message));
		page.on("console", message => { if (message.type() === "error") consoleErrors.push(message.text()); });
		page.on("dialog", async alert => { requests.push({ domain: "printer-alert", message: alert.message() }); await alert.accept(); });
		await page.route("**/api/**", async route => {
			const request = route.request(), pathname = new URL(request.url()).pathname, method = request.method();
			const domain = pathname.includes("rounding-settings") ? "rounding" : pathname.includes("stock-settings") ? "stock" : "menus";
			const body = method === "POST" ? request.postDataJSON() : undefined;
			requests.push({ domain, method, path: pathname, body });
			if (method === "POST" && !fail) records[domain] = domain === "rounding" ? body : {
				...body, details: body.stockable_ids.map(id => ({ stockable_id: id, stockable_type: "item" })),
			};
			const data = domain === "menus" ? [
				{ id: "item-1", name: "Produk Satu", extra_menu_ids: [] },
				{ id: "item-2", name: "Produk Dua", extra_menu_ids: [] },
				{ id: "item-3", name: "Produk Tiga", extra_menu_ids: [] },
			] : records[domain];
			await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: !(method === "POST" && fail), data }) });
		});
		const html = '<!doctype html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body,#root{width:100%;height:100%;margin:0;overflow:hidden}#root{display:flex}</style></head><body><div id="root"></div><script src="/.expo/senior6-ui-entry.bundle?platform=web&dev=true&hot=false&transform.engine=hermes&transform.bytecode=0&unstable_transformProfile=hermes-stable"></script></body></html>';
		await page.route(`${origin}/sd6-preview**`, route => route.fulfill({ status: 200, contentType: "text/html", body: html }));
		await page.goto(`${origin}/sd6-preview`, { waitUntil: "commit" });
		await text("Aktifkan Pembulatan").waitFor({ timeout: 180000 });
		await text("Ribuan (Rp1.000)").waitFor();
		await check("rounding API prefill and sticky save", async () => { await fits(); await capture("rounding-390"); });
		await check("real SingleSelect applies a new multiple", async () => {
			await text("Ribuan (Rp1.000)").click(); await dialog().getByText("Puluhan (Rp10)", { exact: true }).click();
			await page.getByRole("dialog").waitFor({ state: "hidden" }); await text("Puluhan (Rp10)").waitFor();
		});
		await check("rounding user method/multiple survive production query refetch", async () => {
			await text("Pembulatan ke Bawah").click();
			records.rounding = { enabled: true, method: "nearest", decimal_places: 2 };
			await refetch(); await text("Puluhan (Rp10)").waitFor();
			await save().click(); await text("Pengaturan Pembulatan Disimpan").waitFor();
			assert.deepEqual(lastPayload("rounding"), { enabled: true, method: "down", decimal_places: 1 }); await dismiss();
		});
		await check("rounding failed mutation keeps draft and shows real error modal", async () => {
			fail = true; await save().click(); await text("Gagal Menyimpan Pembulatan").waitFor(); await dismiss(); fail = false;
			await text("Puluhan (Rp10)").waitFor();
		});
		await check("rounding switch false reaches production mutation", async () => {
			await page.getByRole("switch").click(); await save().click(); await text("Pengaturan Pembulatan Disimpan").waitFor();
			assert.equal(lastPayload("rounding").enabled, false); await dismiss();
		});
		await navigate("stock"); await text("1 produk dikecualikan").waitFor();
		await check("stock API prefill and sticky save", async () => { await fits(); await capture("stock-390"); });
		const openPicker = () => text("Kecuali Produk (Opsional)").click();
		await check("stock real picker cancel leaves committed IDs unchanged", async () => {
			await openPicker(); await dialog().getByText("Produk Dua", { exact: true }).click(); await dialog().getByText("Batal", { exact: true }).click();
			await save().click(); await text("Pengaturan Batas Stok Disimpan").waitFor();
			assert.deepEqual(lastPayload("stock").stockable_ids, ["item-1"]); await dismiss();
		});
		await check("stock typing and in-flight picker draft survive actual refetch", async () => {
			await openPicker(); await dialog().getByText("Produk Dua", { exact: true }).click(); await page.getByPlaceholder("Cari...").fill("Dua");
			records.stock = { enabled: true, type: "hybrid", details: [{ stockable_id: "item-3" }] };
			await refetch(); assert.equal(await page.getByPlaceholder("Cari...").inputValue(), "Dua");
			await dialog().getByText("Selesai", { exact: true }).click(); await text("2 produk dikecualikan").waitFor();
			await save().click(); await text("Pengaturan Batas Stok Disimpan").waitFor();
			assert.deepEqual(lastPayload("stock").stockable_ids, ["item-1", "item-2"]); await dismiss();
		});
		await check("stock clearing every exclusion sends all mode and empty IDs", async () => {
			await openPicker(); assert.equal(await page.getByPlaceholder("Cari...").inputValue(), "");
			await dialog().getByText("Produk Satu", { exact: true }).click(); await dialog().getByText("Produk Dua", { exact: true }).click();
			await dialog().getByText("Selesai", { exact: true }).click(); await save().click(); await text("Pengaturan Batas Stok Disimpan").waitFor();
			assert.deepEqual(lastPayload("stock"), { enabled: true, type: "all", content_type: "item", stockable_ids: [] }); await dismiss();
		});
		await check("stock error uses real modal and retains committed draft", async () => {
			fail = true; await save().click(); await text("Gagal Menyimpan Batas Stok").waitFor(); await dismiss(); fail = false;
			await text("Pilih produk yang dikecualikan").waitFor();
		});
		await check("stock 320px sheet and save fit viewport", async () => {
			await page.setViewportSize({ width: 320, height: 844 }); await fits(); await capture("stock-320");
			await openPicker(); await dialog().waitFor(); await capture("stock-picker-320");
			const bounds = await dialog().boundingBox();
			assert.ok(bounds && bounds.x >= -1 && bounds.x + bounds.width <= 321 && bounds.y >= 0 && bounds.y + bounds.height <= 845, JSON.stringify(bounds));
			await dialog().getByText("Batal", { exact: true }).click(); await page.getByRole("dialog").waitFor({ state: "hidden" });
		});
		await check("rounding reopen uses latest API state at 320px", async () => {
			records.rounding = { enabled: true, method: "nearest", decimal_places: 2 };
			await navigate("rounding", {}, true); await refetch(); await text("Ratusan (Rp100)").waitFor(); await fits(); await capture("rounding-320");
		});
		for (const exponent of [0, 4, 10]) await check(`rounding actual dropdown displays and saves exponent ${exponent} at 320px`, async () => {
			records.rounding = { enabled: true, method: "up", decimal_places: exponent };
			await navigate("rounding", {}, true); await refetch();
			const label = `Kelipatan (${(10 ** exponent).toLocaleString("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 })})`;
			await text(label).waitFor(); await fits(); await text(label).click();
			await dialog().getByText(label, { exact: true }).waitFor();
			await dialog().getByText(label, { exact: true }).click(); await page.getByRole("dialog").waitFor({ state: "hidden" });
			await save().click(); await text("Pengaturan Pembulatan Disimpan").waitFor();
			assert.deepEqual(lastPayload("rounding"), { enabled: true, method: "up", decimal_places: exponent }); await dismiss();
			if (exponent === 10) await capture("rounding-exponent-10-320");
		});
		await navigate("printer");
		await check("Printer actual RHF/modal create to edit to create lifecycle", async () => {
			await save().click(); await text("Printer Berhasil Ditambahkan!").waitFor();
			await page.getByRole("button", { name: "Tutup", exact: true }).click();
			await page.evaluate(() => globalThis.__sd6.navigate("printer", { id: "1" }));
			await save().click(); await text("Printer Berhasil Diubah!").waitFor();
			await page.evaluate(() => globalThis.__sd6.navigate("printer", {}));
			await page.getByRole("dialog").waitFor({ state: "hidden" }); await save().click(); await text("Printer Berhasil Ditambahkan!").waitFor();
			await page.getByRole("button", { name: "Tutup", exact: true }).click(); await page.getByRole("dialog").waitFor({ state: "hidden" }); await capture("printer-320");
		});
		await check("Printer missing ID alerts and invokes back with real screen", async () => {
			const before = await page.evaluate(() => globalThis.__sd6.backCount);
			await page.evaluate(() => globalThis.__sd6.navigate("printer", { id: "missing" }));
			await page.waitForFunction(previous => globalThis.__sd6.backCount === previous + 1, before);
			assert.equal(await save().count(), 0); assert.equal(requests.filter(request => request.domain === "printer-alert").at(-1).message, "Printer tidak ditemukan");
		});
		assert.deepEqual(hashes(), initialHashes, "Source changed during the verification run");
		assert.deepEqual(runtimeErrors, []); assert.deepEqual(consoleErrors, []);
		fs.writeFileSync(path.join(output, "ui-api-results.json"), JSON.stringify({ sourceHashes: initialHashes, checks, runtimeErrors, consoleErrors, requests,
			limitations: "Actual screens, NativeWind/Gluestack, RHF, React Query and Axios; HTTP fixture interception and small test navigator. No real backend, full auth/router, native or independent QA approval." }, null, 2) + "\n");
		console.log(`${checks.length} UI/API checks passed`);
	} catch (error) {
		await page.screenshot({ path: path.join(output, "ui-api-failure.png") }).catch(() => {});
		console.error(JSON.stringify({ checks, runtimeErrors, consoleErrors, error: error.message })); throw error;
	} finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
