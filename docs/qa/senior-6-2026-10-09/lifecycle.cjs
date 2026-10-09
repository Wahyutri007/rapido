// Application-root command: node docs/qa/senior-6-2026-10-09/lifecycle.cjs
// Setup: npm install --prefix .expo/senior6-tools --no-save --package-lock=false playwright
// Real React DOM and RHF; native UI, router and API hooks are test adapters.
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const ts = require("typescript");
const { chromium } = require(path.resolve(".expo/senior6-tools/node_modules/playwright"));
const files = {
	printer: "app/(no-layout)/manage/printer/modify.tsx",
	rounding: "app/(no-layout)/manage/pos-settings/rounding.tsx",
	stock: "app/(no-layout)/manage/pos-settings/stock-limit.tsx",
};
const transpile = (source) => ts.transpileModule(source, { compilerOptions: {
	module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
	jsx: ts.JsxEmit.React, esModuleInterop: true,
} }).outputText;
const modules = Object.fromEntries(Object.entries({
	react: "node_modules/react/cjs/react.development.js",
	"react-dom": "node_modules/react-dom/cjs/react-dom.development.js",
	"react-dom/client": "node_modules/react-dom/cjs/react-dom-client.development.js",
	scheduler: "node_modules/scheduler/cjs/scheduler.development.js",
	"react-hook-form": "node_modules/react-hook-form/dist/index.cjs.js",
}).map(([name, file]) => [name, fs.readFileSync(file, "utf8")]));
for (const [name, file] of Object.entries(files)) modules[name] = transpile(fs.readFileSync(file, "utf8"));
modules["@/constants/data/other/printer"] = transpile(fs.readFileSync("constants/data/other/printer.ts", "utf8"));

(async () => {
	const browser = await chromium.launch({ headless: true,
		executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" });
	const results = [];
	const errors = [];
	const roundingPayloads = [];
	try {
		const page = await browser.newPage();
		page.on("pageerror", (error) => errors.push(error.message));
		page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
		await page.setContent('<div id="root"></div>');
		await page.evaluate((modules) => {
			const cache = {};
			window.fixture = { data: undefined, menus: [], id: undefined, calls: [], back: 0, alerts: [], fail: false };
			window.alert = (message) => fixture.alerts.push(message);
			function load(name) {
				if (cache[name]) return cache[name].exports;
				if (modules[name]) {
					const module = { exports: {} };
					cache[name] = module;
					new Function("module", "exports", "require", "process", modules[name])(
						module, module.exports, load, { env: { NODE_ENV: "development" } });
					return module.exports;
				}
				const React = load("react");
				const Empty = () => null;
				const Container = ({ children }) => React.createElement("div", null, children);
				const Text = ({ children }) => React.createElement("span", null, children);
				const Button = ({ children, onPress, disabled }) => React.createElement("button", { onClick: onPress, disabled }, children);
				const defaults = (component, extra = {}) => ({ __esModule: true, default: component, ...extra });
				const useAlertModal = () => {
					const openState = React.useState(false);
					return { openState, open: () => openState[1](true), close: () => openState[1](false) };
				};
				const Modal = ({ openState, title, onClose, onConfirm }) => openState[0]
					? React.createElement("div", { role: "dialog" }, title,
						React.createElement("button", { onClick: onClose || onConfirm }, "Tutup")) : null;
				if (name === "expo-router") return { useLocalSearchParams: () => ({ id: fixture.id }),
					router: { back: () => fixture.back++, push: (route) => { fixture.route = route; } } };
				if (name === "@/components/custom/JSStack") return { delayedBack: () => fixture.back++ };
				if (name === "@/constants/Colors") return { Colors: { primary: "blue", zinc: { 400: "gray" } } };
				if (name === "@/lib/utils") return { cn: (...args) => args.filter(Boolean).join(" "),
					formatRp: value => "Rp" + Number(value).toLocaleString("id-ID"),
					wait: () => fixture.defer ? new Promise((resolve) => { fixture.resolve = resolve; }) : Promise.resolve() };
				if (name.startsWith("@/api/hooks/")) return new Proxy({}, { get: (_, key) => () => {
					if (String(key).includes("Mutation")) return { call: async (payload) => {
						fixture.calls.push(payload); return [undefined, fixture.fail ? { status: 500 } : undefined];
					}, isLoading: false };
					return { data: key === "useMenusQuery" ? fixture.menus : fixture.data };
				} });
				if (name.includes("AlertModal") || name.includes("SuccessModal")) return defaults(Modal, { useAlertModal });
				if (name === "@/components/common/Form") return { Form: (props) => {
					window.form = props; return React.createElement(Container, props);
				} };
				if (name === "@/components/common/SingleSelect") return defaults(({ value, onValueChange, items }) =>
					React.createElement("select", { value, onChange: (event) => onValueChange(event.target.value) },
						items.map((item) => React.createElement("option", { key: item.value, value: item.value }, item.label))));
				if (name === "@/components/common/SearchBar") return defaults(({ search, setSearch }) =>
					React.createElement("input", { value: search, placeholder: "Cari...", onChange: (event) => setSearch(event.target.value) }));
				if (name === "@/components/ui/actionsheet") return new Proxy({}, { get: (_, key) =>
					key === "Actionsheet" ? ({ isOpen, children }) => isOpen ? React.createElement(Container, null, children) : null
						: key === "ActionsheetBackdrop" ? Empty : Container });
				if (name === "react-native") return { View: Container, ScrollView: Container, Image: Empty, Pressable: Button,
					Switch: ({ value, onValueChange }) => React.createElement("input", {
						type: "checkbox", checked: value, onChange: (event) => onValueChange(event.target.checked),
					}) };
				if (name.startsWith("@expo/vector-icons")) return defaults(Empty);
				if (name.includes("BouncyPressable") || name.includes("BottomActionButton")) return defaults(Button);
				if (name === "@/components/ui/button") return { Button, ButtonGroup: Container, ButtonText: Text };
				return defaults(name.endsWith("/Text") ? Text : Container);
			}
			const React = load("react");
			const { flushSync } = load("react-dom");
			const root = load("react-dom/client").createRoot(document.getElementById("root"));
			let key = 0;
			window.renderScreen = (mode, remount = false) => {
				if (remount) key++;
				fixture.mode = mode;
				flushSync(() => root.render(React.createElement(load(mode).default, { key })));
			};
		}, modules);
		async function check(name, fn) { await fn(); results.push({ name, passed: true }); }
		const save = async () => {
			await page.getByRole("button", { name: "Simpan", exact: true }).click();
			await page.getByRole("dialog").waitFor();
			return page.evaluate(() => fixture.calls.at(-1));
		};
		const close = () => page.getByRole("button", { name: "Tutup", exact: true }).click();
		const render = (mode, data, remount = false) => page.evaluate(({ mode, data, remount }) => {
			fixture.data = data; renderScreen(mode, remount);
		}, { mode, data, remount });

		await render("printer");
		await check("Printer create remains available", async () => {
			await save(); assert.match(await page.getByRole("dialog").innerText(), /Ditambahkan/); await close();
			assert.equal(await page.evaluate(() => fixture.back), 1);
		});
		await check("Printer route ID switches to edit", async () => {
			await page.evaluate(() => { fixture.id = "1"; renderScreen("printer"); });
			await save(); assert.match(await page.getByRole("dialog").innerText(), /Diubah/);
		});
		await check("Printer edit-to-create resets entity modal state", async () => {
			await page.evaluate(() => { fixture.id = undefined; renderScreen("printer"); });
			assert.equal(await page.getByRole("dialog").count(), 0);
			await save(); assert.match(await page.getByRole("dialog").innerText(), /Ditambahkan/); await close();
		});
		await check("Printer invalid ID alerts and returns without save controls", async () => {
			const before = await page.evaluate(() => fixture.back);
			await page.evaluate(() => { fixture.id = "missing"; renderScreen("printer"); });
			assert.equal(await page.getByRole("button", { name: "Simpan", exact: true }).count(), 0);
			assert.equal(await page.evaluate(() => fixture.back), before + 1);
			assert.equal(await page.evaluate(() => fixture.alerts.at(-1)), "Printer tidak ditemukan");
		});
		await check("Printer invalid ID can transition to a valid entity", async () => {
			await page.evaluate(() => { fixture.id = "1"; renderScreen("printer"); });
			await save(); assert.match(await page.getByRole("dialog").innerText(), /Diubah/); await close();
		});
		await check("Printer pending save cannot open success on a different entity", async () => {
			await page.evaluate(() => { fixture.defer = true; });
			await page.getByRole("button", { name: "Simpan", exact: true }).click();
			await page.waitForFunction(() => Boolean(fixture.resolve));
			await page.evaluate(() => { fixture.id = undefined; renderScreen("printer"); fixture.resolve(); fixture.defer = false; });
			assert.equal(await page.getByRole("dialog").count(), 0);
		});
		// Write the first module's evidence before proceeding with the POS batch.
		fs.writeFileSync(path.join(__dirname, "printer-results.json"), JSON.stringify({
			checks: results.slice(), runtimeErrors: errors.slice(),
			sourceSha256: crypto.createHash("sha256").update(fs.readFileSync(files.printer)).digest("hex"),
		}, null, 2) + "\n");

		await render("rounding", undefined, true);
		await check("Rounding defaults before API response", async () => {
			const payload = await save();
			assert.deepEqual(payload, { enabled: true, method: "nearest", decimal_places: 2 });
			roundingPayloads.push({ scenario: "default before API data", payload }); await close();
		});
		await check("Rounding late data preserves false and zero", async () => {
			await render("rounding", { enabled: false, method: "down", decimal_places: 0 });
			const payload = await save();
			assert.deepEqual(payload, { enabled: false, method: "down", decimal_places: 0 });
			roundingPayloads.push({ scenario: "disabled and exponent zero", payload }); await close();
		});
		await check("Rounding untouched fields follow refetch", async () => {
			await render("rounding", { enabled: true, method: "up", decimal_places: 3 });
			assert.deepEqual(await save(), { enabled: true, method: "up", decimal_places: 3 }); await close();
		});
		await check("Rounding edited method survives refetch while other fields update", async () => {
			await page.getByRole("button", { name: /Pembulatan ke Bawah/ }).click();
			await render("rounding", { enabled: true, method: "nearest", decimal_places: 1 });
			assert.deepEqual(await save(), { enabled: true, method: "down", decimal_places: 1 }); await close();
		});
		await check("Rounding local false and selected multiple survive refetch", async () => {
			await page.locator("select").selectOption("3");
			await page.getByRole("checkbox").uncheck();
			await render("rounding", { enabled: true, method: "up", decimal_places: 2 });
			assert.deepEqual(await save(), { enabled: false, method: "down", decimal_places: 3 }); await close();
		});
		await check("Rounding failure retains draft and opens only error feedback", async () => {
			await page.evaluate(() => { fixture.fail = true; });
			assert.deepEqual(await save(), { enabled: false, method: "down", decimal_places: 3 });
			assert.match(await page.getByRole("dialog").innerText(), /Gagal Menyimpan/); await close();
			await page.evaluate(() => { fixture.fail = false; });
		});
		await check("Rounding remount uses latest server values", async () => {
			await render("rounding", { enabled: true, method: "nearest", decimal_places: 1 }, true);
			assert.deepEqual(await save(), { enabled: true, method: "nearest", decimal_places: 1 }); await close();
		});
		await check("Rounding read-more navigation remains wired", async () => {
			await page.getByRole("button", { name: "Baca Selengkapnya" }).click();
			assert.equal(await page.evaluate(() => fixture.route), "/manage/pos-settings/rounding-detail");
		});
		for (let exponent = 0; exponent <= 10; exponent++) {
			await check(`Rounding backend exponent ${exponent} label and roundtrip`, async () => {
				await render("rounding", { enabled: true, method: "up", decimal_places: exponent }, true);
				assert.equal(await page.locator("select").inputValue(), String(exponent));
				const label = await page.locator("select option:checked").innerText();
				assert.ok(label.includes("Rp" + (10 ** exponent).toLocaleString("id-ID")), label);
				const payload = await save(); assert.equal(payload.decimal_places, exponent);
				roundingPayloads.push({ scenario: `backend exponent ${exponent} roundtrip`, payload }); await close();
			});
		}
		for (const [label, exponent] of [["Puluhan (Rp10)", 1], ["Ratusan (Rp100)", 2], ["Ribuan (Rp1.000)", 3]]) {
			await check(`Rounding UI ${label} sends exponent ${exponent}`, async () => {
				await render("rounding", { enabled: true, method: "up", decimal_places: 0 }, true);
				await page.locator("select").selectOption({ label });
				const payload = await save(); assert.equal(payload.decimal_places, exponent);
				roundingPayloads.push({ scenario: `selected UI ${label}`, payload }); await close();
			});
		}
		for (const exponent of [-1, 0.5, 11, 100]) {
			await check(`Rounding invalid exponent ${exponent} cannot reach mutation`, async () => {
				await render("rounding", { enabled: true, method: "up", decimal_places: exponent }, true);
				const count = await page.evaluate(() => fixture.calls.length);
				await save(); assert.equal(await page.evaluate(() => fixture.calls.length), count);
				assert.match(await page.getByRole("dialog").innerText(), /Gagal Menyimpan/); await close();
			});
		}

		await render("stock", undefined, true);
		const openPicker = () => page.getByRole("button", { name: /Kecuali Produk/ }).click();
		await check("Stock defaults before API response", async () => {
			assert.deepEqual(await save(), { enabled: true, type: "all", content_type: "item", stockable_ids: [] }); await close();
		});
		await check("Stock prefill loads false and excluded IDs", async () => {
			await render("stock", { enabled: false, details: [{ stockable_id: "prod-1" }] });
			assert.deepEqual(await save(), { enabled: false, type: "hybrid", content_type: "item", stockable_ids: ["prod-1"] }); await close();
		});
		await check("Stock cancel discards picker changes", async () => {
			await openPicker(); await page.getByRole("button", { name: /Salad Yumme/ }).click();
			await page.getByRole("button", { name: "Batal", exact: true }).click();
			assert.deepEqual((await save()).stockable_ids, ["prod-1"]); await close();
		});
		await check("Stock picker draft survives refetch and search", async () => {
			await openPicker(); await page.getByRole("button", { name: /Salad Yumme/ }).click();
			await page.getByPlaceholder("Cari...").fill("Salad");
			await render("stock", { enabled: true, details: [{ stockable_id: "prod-3" }] });
			assert.equal(await page.getByPlaceholder("Cari...").inputValue(), "Salad");
			await page.getByRole("button", { name: "Selesai", exact: true }).click();
			assert.deepEqual((await save()).stockable_ids, ["prod-1", "prod-2"]); await close();
		});
		await check("Stock saved selection survives a later refetch", async () => {
			await render("stock", { enabled: false, details: [] });
			assert.deepEqual(await save(), { enabled: false, type: "hybrid", content_type: "item", stockable_ids: ["prod-1", "prod-2"] }); await close();
		});
		await check("Stock clearing every exclusion preserves an empty draft", async () => {
			await openPicker(); assert.equal(await page.getByPlaceholder("Cari...").inputValue(), "");
			await page.getByRole("button", { name: /Bakmie/ }).click();
			await page.getByRole("button", { name: /Salad Yumme/ }).click();
			await page.getByRole("button", { name: "Selesai", exact: true }).click();
			await render("stock", { enabled: true, details: [{ stockable_id: "prod-4" }] });
			assert.deepEqual((await save()).stockable_ids, []); await close();
		});
		await check("Stock edited switch survives refetch and failed save", async () => {
			await page.getByRole("checkbox").uncheck();
			await render("stock", { enabled: true, details: [{ stockable_id: "prod-4" }] });
			await page.evaluate(() => { fixture.fail = true; });
			assert.deepEqual(await save(), { enabled: false, type: "all", content_type: "item", stockable_ids: [] });
			assert.match(await page.getByRole("dialog").innerText(), /Gagal Menyimpan/); await close();
			await page.evaluate(() => { fixture.fail = false; });
		});
		await check("Stock remount clears local overrides", async () => {
			await render("stock", { enabled: true, details: [{ stockable_id: "prod-4" }] }, true);
			assert.deepEqual((await save()).stockable_ids, ["prod-4"]); await close();
		});
		await check("Stock absent details clear an untouched server selection", async () => {
			await render("stock", { enabled: true });
			assert.deepEqual((await save()).stockable_ids, []); await close();
		});
		await check("Stock read-more navigation remains wired", async () => {
			await page.getByRole("button", { name: "Baca Selengkapnya" }).click();
			assert.equal(await page.evaluate(() => fixture.route), "/manage/pos-settings/stock-limit-detail");
		});
		assert.deepEqual(errors, []);
		fs.writeFileSync(path.join(__dirname, "rounding-contract-payloads.json"), JSON.stringify(roundingPayloads, null, 2) + "\n");
		fs.writeFileSync(path.join(__dirname, "results.json"), JSON.stringify({
			sources: Object.fromEntries(Object.values(files).map((file) => [file,
				crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex")])),
			checks: results, runtimeErrors: errors,
			limitations: "Native views/router/API replaced by adapters. No native, visual, network or independent QA approval.",
		}, null, 2) + "\n");
		console.log(`${results.length} lifecycle checks passed; runtime/console errors ${errors.length}`);
	} finally { await browser.close(); }
})().catch((error) => { console.error(error); process.exitCode = 1; });
