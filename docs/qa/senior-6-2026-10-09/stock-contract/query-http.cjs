// Actual React Query, Axios and application API hooks; host UI/storage/router adapters.
// No Metro or dependency installation. All HTTP is fulfilled by Playwright.
const fs = require("node:fs"), path = require("node:path"), crypto = require("node:crypto"), assert = require("node:assert/strict"), ts = require("typescript");
const { createRequire } = require("node:module");
const { chromium } = require(path.resolve(".expo/senior6-tools/node_modules/playwright"));
const origin = "https://sd6-stock.test", modules = {}, sourceHashes = {};
const alias = {
	react: "node_modules/react/cjs/react.development.js", "react-dom": "node_modules/react-dom/cjs/react-dom.development.js",
	"react-dom/client": "node_modules/react-dom/cjs/react-dom-client.development.js", scheduler: "node_modules/scheduler/cjs/scheduler.development.js",
	"react/jsx-runtime": "node_modules/react/cjs/react-jsx-runtime.development.js", axios: "node_modules/axios/dist/browser/axios.cjs",
	stock: "app/(no-layout)/manage/pos-settings/stock-limit.tsx",
};
const adapted = name => name === "react-native" || name === "expo-router" || name.startsWith("@expo/vector-icons") || name.startsWith("@/components/") || ["@/constants/Colors", "@/lib/utils", "@/lib/storage"].includes(name);
const sha = data => crypto.createHash("sha256").update(data).digest("hex");
function collect(name, parent = path.resolve("package.json")) {
	if (adapted(name)) return name;
	let file = alias[name] ? path.resolve(alias[name]) : name.startsWith("@/") ? path.resolve(name.slice(2)) : name.startsWith(".") ? path.resolve(path.dirname(parent), name) : createRequire(parent).resolve(name);
	if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) file = [file + ".ts", file + ".tsx", path.join(file, "index.ts")].find(candidate => fs.existsSync(candidate));
	if (!file) throw new Error("Cannot resolve " + name);
	const id = path.relative(process.cwd(), file).replaceAll("\\", "/");
	if (modules[id]) return id;
	const raw = fs.readFileSync(file, "utf8"); sourceHashes[id] = sha(raw);
	const code = /\.tsx?$/.test(file) ? ts.transpileModule(raw, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.React, esModuleInterop: true } }).outputText : raw;
	const record = { code, deps: {} }; modules[id] = record;
	for (const match of code.matchAll(/\brequire\(\s*["']([^"']+)["']\s*\)/g)) record.deps[match[1]] = collect(match[1], file);
	return id;
}
const roots = Object.fromEntries(["stock", "react", "react-dom", "react-dom/client", "@tanstack/react-query", "@/api/axios"].map(name => [name, collect(name)]));
(async () => {
	const browser = await chromium.launch({ headless: true, executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" });
	const checks = [], errors = [], requests = [];
	const category = { enabled: true, type: "hybrid", content_type: "category", details: [{ stockable_id: "category-1", stockable_type: "category" }] };
	const item = { enabled: true, type: "hybrid", content_type: "item", details: [{ stockable_id: "menu-1", stockable_type: "menu" }] };
	let settings = category, menus = [{ id: "menu-1", name: "Produk Satu" }, { id: "menu-2", name: "Produk Dua" }], categories = [{ id: "category-1", name: "Makanan" }, { id: "category-2", name: "Minuman" }];
	let failSettings = false, failMenus = false, failCategories = false, failSave = false, settingsGate;
	try {
		const page = await browser.newPage(); page.setDefaultTimeout(8000);
		page.on("pageerror", error => errors.push(error.message)); page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
		await page.route("**/*", async route => {
			const request = route.request(), url = new URL(request.url());
			if (url.origin !== origin) return route.abort();
			if (url.pathname === "/") return route.fulfill({ contentType: "text/html", body: '<div id="root"></div>' });
			if (!url.pathname.startsWith("/api/")) return route.fulfill({ status: 204, body: "" });
			const domain = url.pathname.includes("stock-settings") ? "settings" : url.pathname.includes("categories") ? "categories" : "menus";
			const method = request.method(), body = method === "POST" ? request.postDataJSON() : undefined;
			requests.push({ method, domain, path: url.pathname, body });
			if (domain === "settings" && method === "GET" && settingsGate) await settingsGate;
			const fail = method === "POST" ? failSave : domain === "settings" ? failSettings : domain === "categories" ? failCategories : failMenus;
			if (method === "POST" && !fail) settings = { ...body, details: body.stockable_ids.map(id => ({ stockable_id: id, stockable_type: body.content_type === "category" ? "category" : "menu" })) };
			const data = domain === "settings" ? settings : domain === "categories" ? categories : menus;
			await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: !fail, data }) });
		});
		await page.goto(origin, { waitUntil: "domcontentloaded" });
		await page.evaluate(({ modules, roots }) => {
			const cache = {};
			function load(id) {
				if (cache[id]) return cache[id].exports;
				if (modules[id]) { const module = { exports: {} }; cache[id] = module; const record = modules[id]; new Function("module", "exports", "require", "process", record.code)(module, module.exports, name => load(record.deps[name] || name), { env: { NODE_ENV: "development" } }); return module.exports; }
				const React = load(roots.react), Empty = () => null;
				const Container = ({ children }) => React.createElement("div", null, children), Text = ({ children }) => React.createElement("span", null, children);
				const Button = ({ children, onPress, isDisabled, isLoading, disabled }) => React.createElement("button", { onClick: onPress, disabled: !!(isDisabled || isLoading || disabled) }, children);
				const defaults = component => ({ __esModule: true, default: component });
				if (id === "react-native") return { View: Container, Image: Empty, Pressable: Button, Switch: ({ value, onValueChange }) => React.createElement("input", { type: "checkbox", checked: value, onChange: event => onValueChange(event.target.checked) }) };
				if (id === "expo-router") return { router: { push: () => {} } };
				if (id === "@/lib/storage") return { getItemAsync: async () => null, deleteItemAsync: async () => {} };
				if (id === "@/lib/utils") return { cn: (...values) => values.filter(Boolean).join(" ") };
				if (id === "@/constants/Colors") return { Colors: { primary: "blue", zinc: { 400: "gray" } } };
				if (id.startsWith("@expo/vector-icons")) return defaults(Empty);
				if (id.includes("SuccessModal") || id.includes("AlertModal")) return { ...defaults(({ openState, title, onClose, onConfirm }) => openState[0] ? React.createElement("div", { role: "alertdialog" }, React.createElement(Text, null, title), React.createElement(Button, { onPress: onClose || onConfirm }, "Tutup")) : null), useAlertModal: () => { const openState = React.useState(false); return { openState, open: () => openState[1](true), close: () => openState[1](false) }; } };
				if (id.endsWith("/SearchBar")) return defaults(({ search, setSearch }) => React.createElement("input", { value: search, placeholder: "Cari...", onChange: event => setSearch(event.target.value) }));
				if (id === "@/components/ui/actionsheet") return new Proxy({}, { get: (_, name) => name === "Actionsheet" ? ({ isOpen, children }) => isOpen ? React.createElement("div", { role: "dialog" }, children) : null : name === "ActionsheetBackdrop" ? Empty : Container });
				if (id === "@/components/ui/button") return { Button, ButtonText: Text };
				if (id.includes("BouncyPressable") || id.includes("BottomActionButton")) return defaults(Button);
				return defaults(id.endsWith("/Text") ? Text : Container);
			}
			const React = load(roots.react), { QueryClient, QueryClientProvider } = load(roots["@tanstack/react-query"]), { flushSync } = load(roots["react-dom"]), root = load(roots["react-dom/client"]).createRoot(document.getElementById("root"));
			load(roots["@/api/axios"]).default.defaults.baseURL = `${location.origin}/api`;
			let queryClient, identity = 0;
			globalThis.__sd6Http = {
				mount: () => { queryClient?.clear(); queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } } }); identity++; flushSync(() => root.render(React.createElement(QueryClientProvider, { client: queryClient, key: identity }, React.createElement(load(roots.stock).default)))); },
				refetch: key => queryClient.refetchQueries({ queryKey: key, type: "active" }),
			};
		}, { modules, roots });
		const text = label => page.getByText(label, { exact: true }), sheet = () => page.getByRole("dialog"), saveButton = () => page.getByRole("button", { name: "Simpan", exact: true });
		const mount = () => page.evaluate(() => __sd6Http.mount());
		const refetch = domain => page.evaluate(key => __sd6Http.refetch(key), domain === "settings" ? ["settings", "stock"] : [domain]);
		const open = () => page.getByRole("button", { name: /Kecuali (Produk|Kategori)/ }).click();
		const lastPayload = () => requests.filter(request => request.method === "POST").at(-1).body;
		const save = async () => { await saveButton().click(); await text("Pengaturan Batas Stok Disimpan").waitFor(); const payload = lastPayload(); await page.getByRole("button", { name: "Tutup", exact: true }).click(); return payload; };
		const check = async (name, run) => { await run(); checks.push({ name, passed: true }); console.log("PASS " + name); };
		await check("initial production settings request blocks save until response", async () => {
			let release; settingsGate = new Promise(resolve => { release = resolve; }); await mount(); await text("Memuat pengaturan batas stok...").waitFor(); assert.equal(await saveButton().isDisabled(), true); assert.equal(requests.filter(request => request.method === "POST").length, 0); settingsGate = undefined; release(); await text("1 kategori dikecualikan").waitFor();
		});
		await check("production category hook loads real category endpoint and labels", async () => { await open(); await sheet().getByText("Makanan", { exact: true }).waitFor(); assert.ok(requests.some(request => request.path === "/api/contents/categories")); assert.equal(await sheet().getByText("Produk Satu", { exact: true }).count(), 0); await sheet().getByText("Batal", { exact: true }).click(); });
		await check("category picker pair survives production settings refetch and invalidates after save", async () => { await open(); await sheet().getByText("Minuman", { exact: true }).click(); settings = item; await refetch("settings"); await sheet().getByText("Pilih Kategori", { exact: true }).waitFor(); await sheet().getByText("Selesai", { exact: true }).click(); const before = requests.filter(request => request.domain === "settings" && request.method === "GET").length; assert.deepEqual(await save(), { enabled: true, type: "hybrid", content_type: "category", stockable_ids: ["category-1", "category-2"] }); await page.waitForFunction(() => true); assert.ok(requests.filter(request => request.domain === "settings" && request.method === "GET").length > before); });
		await check("cancel does not post uncommitted category selection", async () => { await open(); await sheet().getByText("Minuman", { exact: true }).click(); await page.getByPlaceholder("Cari...").fill("Minu"); await sheet().getByText("Batal", { exact: true }).click(); assert.deepEqual((await save()).stockable_ids, ["category-1", "category-2"]); });
		await check("clearing category exclusions sends all and empty IDs via Axios", async () => { await open(); assert.equal(await page.getByPlaceholder("Cari...").inputValue(), ""); await sheet().getByText("Makanan", { exact: true }).click(); await sheet().getByText("Minuman", { exact: true }).click(); await sheet().getByText("Selesai", { exact: true }).click(); assert.deepEqual(await save(), { enabled: true, type: "all", content_type: "category", stockable_ids: [] }); });
		await check("failed production mutation retains category draft after unrelated server change", async () => { settings = category; await mount(); await text("1 kategori dikecualikan").waitFor(); await open(); await sheet().getByText("Minuman", { exact: true }).click(); await sheet().getByText("Selesai", { exact: true }).click(); settings = item; await refetch("settings"); failSave = true; await saveButton().click(); await text("Gagal Menyimpan Batas Stok").waitFor(); assert.deepEqual(lastPayload(), { enabled: true, type: "hybrid", content_type: "category", stockable_ids: ["category-1", "category-2"] }); await page.getByRole("button", { name: "Tutup", exact: true }).click(); await text("2 kategori dikecualikan").waitFor(); failSave = false; });
		await check("empty production menu query has no mock rows and keeps saved menu ID", async () => { settings = item; menus = []; await mount(); await text("1 produk dikecualikan").waitFor(); await open(); await text("Belum ada produk.").waitFor(); assert.equal(await text("Bakmie").count(), 0); await sheet().getByText("Batal", { exact: true }).click(); assert.deepEqual(await save(), { enabled: true, type: "hybrid", content_type: "item", stockable_ids: ["menu-1"] }); });
		await check("production menu query failure retries and displays real records", async () => { settings = item; failMenus = true; menus = [{ id: "menu-1", name: "Produk Satu" }]; await mount(); await text("1 produk dikecualikan").waitFor(); await open(); await text("Daftar produk belum dapat dimuat.").waitFor(); assert.equal(await text("Bakmie").count(), 0); failMenus = false; await page.getByRole("button", { name: "Muat Ulang", exact: true }).click(); await text("Produk Satu").waitFor(); assert.equal(await page.getByText(/Stok: 20/).count(), 0); await sheet().getByText("Batal", { exact: true }).click(); });
		await check("production category query retry keeps category endpoint and kind", async () => { settings = category; failCategories = true; await mount(); await text("1 kategori dikecualikan").waitFor(); await open(); await text("Daftar kategori belum dapat dimuat.").waitFor(); failCategories = false; await page.getByRole("button", { name: "Muat Ulang", exact: true }).click(); await sheet().getByText("Makanan", { exact: true }).waitFor(); await sheet().getByText("Batal", { exact: true }).click(); });
		await check("initial production settings error blocks save until retry succeeds", async () => { failSettings = true; await mount(); await text("Pengaturan batas stok belum dapat dimuat.").waitFor(); assert.equal(await saveButton().isDisabled(), true); failSettings = false; await page.getByRole("button", { name: "Muat Ulang", exact: true }).click(); await text("1 kategori dikecualikan").waitFor(); assert.equal(await saveButton().isDisabled(), false); });
		await check("disabled category draft reaches production mutation without losing IDs", async () => { await page.getByRole("checkbox").uncheck(); await refetch("settings"); assert.deepEqual(await save(), { enabled: false, type: "hybrid", content_type: "category", stockable_ids: ["category-1"] }); });
		await check("successful backend null settings response permits default creation", async () => { settings = null; await mount(); await text("Memuat pengaturan batas stok...").waitFor({ state: "hidden" }); assert.equal(await saveButton().isDisabled(), false); assert.deepEqual(await save(), { enabled: true, type: "all", content_type: "item", stockable_ids: [] }); });
		assert.deepEqual(errors, []);
		for (const [file, expected] of Object.entries(sourceHashes)) assert.equal(sha(fs.readFileSync(file)), expected, file);
		fs.writeFileSync(path.join(__dirname, "query-http-results.json"), JSON.stringify({ sourceHashes, checks, runtimeConsoleErrors: errors, requests, limitations: "Production React/React Query/Axios/API hooks, intercepted HTTP, host UI/storage/router adapters; no Metro/native/full auth/live backend" }, null, 2) + "\n");
		console.log(`${checks.length} production Query/HTTP checks passed`);
	} catch (error) {
		fs.writeFileSync(path.join(__dirname, "query-http-failure.json"), JSON.stringify({ sourceHashes, checks, runtimeConsoleErrors: errors, requests, error: error.message }, null, 2) + "\n"); throw error;
	} finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
