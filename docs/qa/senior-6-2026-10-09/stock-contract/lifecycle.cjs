// Application-root command; optional --baseline reads the saved pre-change screen.
const fs = require("node:fs"), path = require("node:path"), crypto = require("node:crypto"), assert = require("node:assert/strict"), ts = require("typescript");
const { chromium } = require(path.resolve(".expo/senior6-tools/node_modules/playwright"));
const directory = __dirname, baseline = process.argv.includes("--baseline");
const source = baseline ? path.join(directory, "stock-limit.baseline.txt") : "app/(no-layout)/manage/pos-settings/stock-limit.tsx";
const sourceHash = crypto.createHash("sha256").update(fs.readFileSync(source)).digest("hex");
const modules = Object.fromEntries(Object.entries({ react: "node_modules/react/cjs/react.development.js", "react-dom": "node_modules/react-dom/cjs/react-dom.development.js", "react-dom/client": "node_modules/react-dom/cjs/react-dom-client.development.js", scheduler: "node_modules/scheduler/cjs/scheduler.development.js" }).map(([name, file]) => [name, fs.readFileSync(file, "utf8")]));
modules.stock = ts.transpileModule(fs.readFileSync(source, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.React, esModuleInterop: true } }).outputText;
(async () => {
	const browser = await chromium.launch({ headless: true, executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" });
	const checks = [], errors = [], payloads = [];
	try {
		const page = await browser.newPage(); page.setDefaultTimeout(baseline ? 1000 : 5000);
		page.on("pageerror", error => errors.push(error.message)); page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
		await page.setContent('<div id="root"></div>', { timeout: 30000 });
		await page.evaluate(modules => {
			const cache = {};
			function load(name) {
				if (cache[name]) return cache[name].exports;
				if (modules[name]) { const module = { exports: {} }; cache[name] = module; new Function("module", "exports", "require", "process", modules[name])(module, module.exports, load, { env: { NODE_ENV: "development" } }); return module.exports; }
				const React = load("react"), Empty = () => null;
				const Container = ({ children }) => React.createElement("div", null, children);
				const Text = ({ children }) => React.createElement("span", null, children);
				const Button = ({ children, onPress, disabled, isDisabled, isLoading, accessibilityState }) => React.createElement("button", { onClick: onPress, disabled: !!(disabled || isDisabled || isLoading || accessibilityState?.disabled) }, children);
				const defaults = component => ({ __esModule: true, default: component });
				if (name === "react-native") return { View: Container, Image: Empty, Pressable: Button, Switch: ({ value, onValueChange }) => React.createElement("input", { type: "checkbox", checked: value, onChange: event => onValueChange(event.target.checked) }) };
				if (name === "expo-router") return { router: { push: href => { fixture.route = href; } } };
				if (name === "@/constants/Colors") return { Colors: { primary: "blue", zinc: { 400: "gray" } } };
				if (name === "@/lib/utils") return { cn: (...values) => values.filter(Boolean).join(" ") };
				if (name.startsWith("@expo/vector-icons")) return defaults(Empty);
				if (name.startsWith("@/api/hooks/")) return new Proxy({}, { get: (_, hook) => (_args, options) => {
					if (String(hook).includes("Mutation")) return { isLoading: false, call: async body => { fixture.calls.push(body); return [undefined, fixture.fail ? { status: 500 } : undefined]; } };
					const domain = hook === "useMenusQuery" ? "menus" : hook === "useCategoriesQuery" ? "categories" : "settings";
					fixture.queries.push({ hook, enabled: options?.enabled ?? true });
					return { data: fixture[domain], isPending: !!fixture[domain + "Pending"], isError: !!fixture[domain + "Error"], refetch: async () => { fixture.retries.push(domain); } };
				} });
				if (name.includes("SuccessModal") || name.includes("AlertModal")) return { ...defaults(({ openState, title, onClose, onConfirm }) => openState[0] ? React.createElement("div", { role: "alertdialog" }, title, React.createElement("button", { onClick: onClose || onConfirm }, "Tutup")) : null), useAlertModal: () => { const openState = React.useState(false); return { openState, open: () => openState[1](true), close: () => openState[1](false) }; } };
				if (name === "@/components/ui/actionsheet") return new Proxy({}, { get: (_, part) => part === "Actionsheet" ? ({ children, isOpen }) => isOpen ? React.createElement("div", { role: "dialog" }, children) : null : part === "ActionsheetBackdrop" ? Empty : Container });
				if (name === "@/components/ui/button") return { Button, ButtonText: Text };
				if (name.endsWith("/SearchBar")) return defaults(({ search, setSearch }) => React.createElement("input", { value: search, placeholder: "Cari...", onChange: event => setSearch(event.target.value) }));
				if (name.includes("BouncyPressable") || name.includes("BottomActionButton")) return defaults(Button);
				return defaults(name.endsWith("/Text") ? Text : Container);
			}
			const React = load("react"), { flushSync } = load("react-dom"), root = load("react-dom/client").createRoot(document.getElementById("root")); let identity = 0;
			globalThis.renderFixture = (patch, remount) => { if (remount) identity++; Object.assign(fixture, patch); flushSync(() => root.render(React.createElement(load("stock").default, { key: identity }))); };
		}, modules);
		const item = { enabled: true, type: "hybrid", content_type: "item", details: [{ stockable_id: "menu-1", stockable_type: "menu" }] };
		const category = { enabled: true, type: "hybrid", content_type: "category", details: [{ stockable_id: "category-1", stockable_type: "category" }] };
		const initialize = (settings = item, patch = {}) => page.evaluate(({ settings, patch }) => {
			globalThis.fixture = { settings, menus: [{ id: "menu-1", name: "Produk Satu" }, { id: "menu-2", name: "Produk Dua" }], categories: [{ id: "category-1", name: "Makanan" }, { id: "category-2", name: "Minuman" }, { id: "category-3", name: "Lainnya" }], calls: [], queries: [], retries: [], fail: false, ...patch };
			renderFixture({}, true);
		}, { settings, patch });
		const refetch = patch => page.evaluate(patch => renderFixture(patch, false), patch);
		const text = label => page.getByText(label, { exact: true });
		const open = () => page.getByRole("button", { name: /Kecuali (Produk|Kategori)/ }).click();
		const sheet = () => page.getByRole("dialog");
		const save = async scenario => { await page.getByRole("button", { name: "Simpan", exact: true }).click(); await page.getByRole("alertdialog").waitFor(); const body = await page.evaluate(() => fixture.calls.at(-1)); payloads.push({ scenario, payload: body }); return body; };
		const expected = (type, ids, enabled = true) => ({ enabled, type: ids.length ? "hybrid" : "all", content_type: type, stockable_ids: ids });
		const check = async (name, run) => { try { await run(); checks.push({ name, passed: true }); } catch (error) { checks.push({ name, passed: false, error: error.message }); } };
		await check("category roundtrip preserves content type and IDs", async () => { await initialize(category); assert.deepEqual(await save("category unchanged"), expected("category", ["category-1"])); });
		await check("category identity survives IDs shared with menu records", async () => { await initialize({ ...category, details: [{ stockable_id: "shared-id", stockable_type: "category" }] }, { menus: [{ id: "shared-id", name: "Produk Sama" }], categories: [{ id: "shared-id", name: "Kategori Sama" }] }); assert.deepEqual(await save("category shared ID"), expected("category", ["shared-id"])); });
		await check("item roundtrip preserves menu IDs", async () => { await initialize(); assert.deepEqual(await save("item unchanged"), expected("item", ["menu-1"])); });
		await check("disabled category config preserves exclusions", async () => { await initialize({ ...category, enabled: false }); assert.deepEqual(await save("category disabled"), expected("category", ["category-1"], false)); });
		await check("late settings populate untouched category selection", async () => { await initialize(undefined, { settings: undefined, settingsPending: true }); await refetch({ settings: category, settingsPending: false }); assert.deepEqual(await save("category late response"), expected("category", ["category-1"])); });
		await check("edited switch survives category response change", async () => { await initialize(); await page.getByRole("checkbox").uncheck(); await refetch({ settings: category }); assert.deepEqual(await save("category switch draft"), expected("category", ["category-1"], false)); });
		await check("category picker commits only category IDs and protects pair from item refetch", async () => { await initialize(category); await open(); await sheet().getByText("Minuman", { exact: true }).click(); await sheet().getByText("Selesai", { exact: true }).click(); await refetch({ settings: item }); assert.deepEqual(await save("category committed draft"), expected("category", ["category-1", "category-2"])); });
		await check("open item picker keeps item identity when settings change to categories", async () => { await initialize(); await open(); await refetch({ settings: category }); await sheet().getByText("Produk Dua", { exact: true }).click(); await sheet().getByText("Selesai", { exact: true }).click(); assert.deepEqual(await save("item frozen picker"), expected("item", ["menu-1", "menu-2"])); });
		await check("open category picker keeps category identity when settings change to items", async () => { await initialize(category); await open(); await refetch({ settings: item }); await sheet().getByText("Minuman", { exact: true }).click(); await sheet().getByText("Selesai", { exact: true }).click(); assert.deepEqual(await save("category frozen picker"), expected("category", ["category-1", "category-2"])); });
		await check("category cancel accepts latest untouched server selection", async () => { await initialize(category); await open(); await sheet().getByText("Minuman", { exact: true }).click(); const latest = { ...category, details: [{ stockable_id: "category-3", stockable_type: "category" }] }; await refetch({ settings: latest }); await sheet().getByText("Batal", { exact: true }).click(); assert.deepEqual(await save("category cancel"), expected("category", ["category-3"])); });
		await check("item cancel leaves committed IDs unchanged", async () => { await initialize(); await open(); await sheet().getByText("Produk Dua", { exact: true }).click(); await sheet().getByText("Batal", { exact: true }).click(); assert.deepEqual(await save("item cancel"), expected("item", ["menu-1"])); });
		await check("clearing category exclusions sends all mode with empty array", async () => { await initialize(category); await open(); await sheet().getByText("Makanan", { exact: true }).click(); await sheet().getByText("Selesai", { exact: true }).click(); await refetch({ settings: category }); assert.deepEqual(await save("category empty draft"), expected("category", [])); });
		await check("category search and picker draft survive list and settings refetch", async () => { await initialize(category); await open(); await sheet().getByText("Minuman", { exact: true }).click(); await page.getByPlaceholder("Cari...").fill("Minu"); await refetch({ settings: item, categories: [{ id: "category-2", name: "Minuman" }] }); assert.equal(await page.getByPlaceholder("Cari...").inputValue(), "Minu"); await sheet().getByText("Selesai", { exact: true }).click(); assert.deepEqual(await save("category searched draft"), expected("category", ["category-1", "category-2"])); });
		await check("picker reopens with committed selection and empty search", async () => { await initialize(); await open(); await page.getByPlaceholder("Cari...").fill("Dua"); await sheet().getByText("Batal", { exact: true }).click(); await open(); assert.equal(await page.getByPlaceholder("Cari...").inputValue(), ""); await sheet().getByText("Produk Satu", { exact: true }).click(); await sheet().getByText("Selesai", { exact: true }).click(); assert.deepEqual(await save("item empty draft"), expected("item", [])); });
		await check("loading menu list displays loading without sample IDs", async () => { await initialize(item, { menus: undefined, menusPending: true }); await open(); assert.equal(await text("Bakmie").count(), 0); await text("Memuat produk...").waitFor(); });
		await check("empty menu list displays empty state without samples", async () => { await initialize(item, { menus: [] }); await open(); assert.equal(await text("Bakmie").count(), 0); await text("Belum ada produk.").waitFor(); });
		await check("failed menu list offers retry without samples", async () => { await initialize(item, { menus: undefined, menusError: true }); await open(); assert.equal(await text("Bakmie").count(), 0); await text("Daftar produk belum dapat dimuat.").waitFor(); await page.getByRole("button", { name: "Muat Ulang", exact: true }).click(); assert.deepEqual(await page.evaluate(() => fixture.retries), ["menus"]); });
		await check("empty category list never shows menu rows", async () => { await initialize(category, { categories: [] }); await open(); assert.equal(await text("Produk Satu").count(), 0); await text("Belum ada kategori.").waitFor(); });
		await check("category list error retries correct endpoint", async () => { await initialize(category, { categories: undefined, categoriesError: true }); await open(); await text("Daftar kategori belum dapat dimuat.").waitFor(); await page.getByRole("button", { name: "Muat Ulang", exact: true }).click(); assert.deepEqual(await page.evaluate(() => fixture.retries), ["categories"]); });
		await check("category list loading uses category state", async () => { await initialize(category, { categories: undefined, categoriesPending: true }); await open(); await text("Memuat kategori...").waitFor(); assert.equal(await text("Produk Satu").count(), 0); });
		await check("actual menu labels contain no invented stock quantities", async () => { await initialize(); await open(); assert.equal(await page.getByText(/Stok: 20/).count(), 0); await sheet().getByText("Produk Satu", { exact: true }).waitFor(); });
		await check("category labels and counts reflect category contract", async () => { await initialize(category); await text("1 kategori dikecualikan").waitFor(); await open(); await text("Pilih Kategori").waitFor(); assert.equal(await text("Produk Satu").count(), 0); });
		await check("failed save keeps committed category pair", async () => { await initialize(category); await open(); await sheet().getByText("Minuman", { exact: true }).click(); await sheet().getByText("Selesai", { exact: true }).click(); await refetch({ fail: true, settings: item }); assert.deepEqual(await save("category failed mutation"), expected("category", ["category-1", "category-2"])); assert.match(await page.getByRole("alertdialog").innerText(), /Gagal Menyimpan Batas Stok/); });
		await check("pending settings prevent destructive default save", async () => { await initialize(undefined, { settings: undefined, settingsPending: true }); assert.equal(await page.getByRole("button", { name: "Simpan", exact: true }).isDisabled(), true); await text("Memuat pengaturan batas stok...").waitFor(); assert.deepEqual(await page.evaluate(() => fixture.calls), []); });
		await check("failed initial settings prevent save and offer retry", async () => { await initialize(undefined, { settings: undefined, settingsError: true }); assert.equal(await page.getByRole("button", { name: "Simpan", exact: true }).isDisabled(), true); await page.getByRole("button", { name: "Muat Ulang", exact: true }).click(); assert.deepEqual(await page.evaluate(() => fixture.retries), ["settings"]); });
		await check("successful missing settings allow all default", async () => { await initialize(undefined, { settings: undefined }); assert.deepEqual(await save("no existing setting"), expected("item", [])); });
		await check("all mode ignores stale exclusion details", async () => { await initialize({ ...category, type: "all" }); assert.deepEqual(await save("all with stale details"), expected("category", [])); });
		await check("legacy missing content type infers category from relation type", async () => { const legacy = { ...category }; delete legacy.content_type; await initialize(legacy); assert.deepEqual(await save("legacy category"), expected("category", ["category-1"])); });
		await check("legacy missing content type defaults menu to item", async () => { const legacy = { ...item }; delete legacy.content_type; await initialize(legacy); assert.deepEqual(await save("legacy item"), expected("item", ["menu-1"])); });
		await check("category mode enables category query and suspends menu query", async () => { await initialize(category); const queries = await page.evaluate(() => fixture.queries); assert.equal(queries.findLast(query => query.hook === "useCategoriesQuery")?.enabled, true); assert.equal(queries.findLast(query => query.hook === "useMenusQuery")?.enabled, false); });
		await check("search with no matches displays clear message", async () => { await initialize(category); await open(); await page.getByPlaceholder("Cari...").fill("tidak ada"); await text("Kategori tidak ditemukan.").waitFor(); });
		await check("clearing data from catalog never drops existing IDs on save", async () => { await initialize(category, { categories: [] }); assert.deepEqual(await save("empty catalog preserve existing"), expected("category", ["category-1"])); });
		assert.equal(crypto.createHash("sha256").update(fs.readFileSync(source)).digest("hex"), sourceHash, "Source changed during tests");
		const passed = checks.filter(check => check.passed).length;
		fs.writeFileSync(path.join(directory, baseline ? "baseline-results.json" : "results.json"), JSON.stringify({ source, sourceHash, checks, runtimeConsoleErrors: errors, passed, failed: checks.length - passed, limitations: "Actual screen/React DOM; UI/query/router adapters, not browser/native/backend certification" }, null, 2) + "\n");
		fs.writeFileSync(path.join(directory, baseline ? "baseline-payloads.json" : "payloads.json"), JSON.stringify(payloads, null, 2) + "\n");
		console.log(`${passed}/${checks.length} lifecycle passed; ${checks.length - passed} failed; runtime/console errors ${errors.length}`);
		if ((!baseline && passed !== checks.length) || errors.length) process.exitCode = 1;
	} finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
