const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const crypto = require("node:crypto");
const root = path.resolve(__dirname, "../../../..");
const ts = require(path.join(root, "node_modules/typescript"));
const React = require(path.join(root, ".expo/senior7-test-tools/node_modules/react"));
const { act, create } = require(path.join(root, ".expo/senior7-test-tools/node_modules/react-test-renderer"));
const appReact = require.resolve(path.join(root, "node_modules/react")); require(appReact); require.cache[appReact].exports = React;
global.IS_REACT_ACT_ENVIRONMENT = true;
const sha = (bytes) => crypto.createHash("sha256").update(bytes).digest("hex");
const output = process.argv[2] ?? "results.json";
if (!/^[a-z0-9-]+\.json$/.test(output) || fs.existsSync(path.join(__dirname, output))) throw new Error("Use a fresh results filename in own packet");
const checks = [], errors = [], warnings = [], loaded = new Map(), hashes = {}, snapshots = {};
const originalError = console.error, originalWarn = console.warn;
console.error = (...args) => { const text = args.map(String).join(" "); if (!text.includes("react-test-renderer is deprecated")) { errors.push(text); originalError(...args); } };
console.warn = (...args) => { warnings.push(args.map(String).join(" ")); originalWarn(...args); };
const check = (name, actual, expected) => checks.push({ name, passed: JSON.stringify(actual) === JSON.stringify(expected), actual, expected });
let params = {}, navigation = [];
const router = { push: (href) => navigation.push(["push", href]), replace: (href) => navigation.push(["replace", href]) };
const hostNames = (names) => Object.fromEntries(names.map((name) => [name, name]));
const modal = ({ children, isOpen, ...props }) => React.createElement("Modal", { ...props, isOpen }, isOpen ? children : null);
const native = {
	...hostNames(["Image", "ImageBackground", "View", "Pressable", "ScrollView"]), Platform: { OS: "web" },
	useWindowDimensions: () => ({ width: 390, height: 844, scale: 1, fontScale: 1 }),
	FlatList: (props) => React.createElement("FlatList", props, props.data.length ? props.data.map((item, index) => React.createElement(React.Fragment, { key: props.keyExtractor(item) }, props.renderItem({ item, index }))) : props.ListEmptyComponent),
};
const defaultHost = (name) => ({ __esModule: true, default: name });
function production(relative) {
	if (loaded.has(relative)) return loaded.get(relative);
	const source = fs.readFileSync(path.join(root, relative), "utf8"); hashes[relative] = sha(source); snapshots[relative] = source;
	const module = { exports: {} };
	const code = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
	const customRequire = (name) => {
		if (name === "react") return React;
		if (name === "react/jsx-runtime") return require(path.join(root, ".expo/senior7-test-tools/node_modules/react/jsx-runtime"));
		if (name === "react-native") return native;
		if (["zod", "zustand", "react-hook-form", "@hookform/resolvers/zod"].includes(name)) return require(require.resolve(name, { paths: [root] }));
		if (name === "expo-router") return { router, useLocalSearchParams: () => params, useGlobalSearchParams: () => params, Link: "Link" };
		if (name.startsWith("@expo/vector-icons/")) return defaultHost(name.split("/").at(-1));
		if (name === "@react-native-community/datetimepicker") return {};
		if (name === "expo-document-picker") return { getDocumentAsync: () => { throw new Error("Picker forbidden in reviewer"); } };
		if (/\/ui\/modal$/.test(name)) return { Modal: modal, ...hostNames(["ModalBackdrop", "ModalBody", "ModalContent", "ModalFooter", "ModalHeader", "ModalCloseButton"]) };
		if (/\/ui\/button$/.test(name)) return hostNames(["Button", "ButtonText", "ButtonGroup", "ButtonIcon"]);
		if (/\/ui\/input$/.test(name)) return hostNames(["Input", "InputField", "InputIcon"]);
		if (/\/ui\/checkbox$/.test(name)) return hostNames(["Checkbox", "CheckboxGroup", "CheckboxIcon", "CheckboxIndicator", "CheckboxLabel"]);
		if (/\/ui\/radio$/.test(name)) return hostNames(["Radio", "RadioCircleIndicator", "RadioGroup", "RadioLabel"]);
		if (name === "@/components/icons") return hostNames(["EFeather"]);
		if (name === "../icons/camera") return defaultHost("CameraIcon");
		if (name === "@/constants/Fonts") return { FONT_NAMES: { regular: "fixture-font" } };
		if (name === "@/constants/Colors") return { Colors: { zinc: { 400: "gray" }, red: { 500: "red" }, primary: "primary" } };
		if (name === "@/lib/utils") return { route: (pathname, params) => ({ pathname, params }), cn: (...args) => args.filter(Boolean).join(" "), tw: (value) => value * 4 };
		if (name === "@/assets/images/illustrations") return { ILLUSTRATIONS: { actionSuccess: "fixture-success", deleteConfirmation: "fixture-delete" } };
		if (name === "@/components/common/DataPlaceholder") return hostNames(["SearchNotFound"]);
		if (name === "@/components/custom/CatalogItemCard") return { __esModule: true, default: (props) => React.createElement("CatalogItemCard", props, props.title, props.subtitle, props.right) };
		const presentation = { "@/components/common/BottomActionButton": "BottomActionButton", "@/components/common/Card": "Card", "@/components/common/Text": "Text", "./Text": "Text", "@/components/common/Wrapper": "Wrapper", "@/components/common/SearchBar": "SearchBar", "@/components/custom/DetailRow": "DetailRow", "@/components/custom/DetailBottomActions": "DetailBottomActions", "@/components/custom/ItemActionSheet": "ItemActionSheet", "./SingleSelect": "SingleSelect", "@/components/common/Header": "Header" };
		if (presentation[name]) return defaultHost(presentation[name]);
		if (name === "@/components/custom/JSStack") return { JSStack: Object.assign("JSStack", { Screen: "JSStackScreen" }), ScaleBackTransition: {} };
		const base = name.startsWith("@/") ? path.join(root, name.slice(2)) : name.startsWith(".") ? path.resolve(path.dirname(path.join(root, relative)), name) : null;
		if (base) for (const candidate of [`${base}.tsx`, `${base}.ts`, path.join(base, "index.tsx"), path.join(base, "index.ts")]) if (fs.existsSync(candidate)) return production(path.relative(root, candidate).replaceAll("\\", "/"));
		throw new Error(`Unexpected dependency ${name} from ${relative}`);
	};
	vm.runInNewContext(code, { module, exports: module.exports, require: customRequire, console, Intl, setTimeout, clearTimeout }, { filename: relative });
	loaded.set(relative, module.exports); return module.exports;
}
const schema = production("schema/manage/payment-method.ts").paymentMethodSchema;
const store = production("store/managePaymentMethodStore.ts").useManagePaymentMethodStore;
const valid = { name: "Transfer QA", type: "bank_transfer", adminType: "nominal", value: 0, bank: "bca", accountNumber: "001234", accountName: "Pemilik QA" };
const invalidCases = [
	["Blank name", { name: "   " }], ["Unsupported payment type", { type: "cash" }], ["Unsupported fee type", { adminType: "unknown" }],
	["Negative fee", { value: -1 }], ["NaN fee", { value: NaN }], ["Positive infinity fee", { value: Infinity }], ["Negative infinity fee", { value: -Infinity }],
	["Percentage above100", { adminType: "percentage", value: 100.01 }], ["Missing bank", { bank: "" }], ["Unsupported bank", { bank: "other" }],
	["Blank account number", { accountNumber: "  " }], ["Blank account owner", { accountName: "  " }],
];
let renderer;
async function mount(component, props = {}) {
	if (renderer) await act(async () => renderer.unmount());
	navigation = [];
	await act(async () => { renderer = create(React.createElement(React.StrictMode, null, React.createElement(component, props))); });
}
const all = (type) => renderer.root.findAllByType(type);
const one = (type) => renderer.root.findByType(type);
const input = (placeholder) => all("InputField").find((node) => node.props.placeholder === placeholder);
const selector = (placeholder) => all("SingleSelect").find((node) => node.props.placeholder === placeholder);
async function changeInput(placeholder, value) { await act(async () => input(placeholder).props.onChangeText(value)); }
async function fillOtherFields() {
	await changeInput("Contoh: Transfer Bank", valid.name);
	await act(async () => selector("Pilih jenis pembayaran").props.onValueChange("bank_transfer"));
	await act(async () => selector("Pilih tipe biaya admin").props.onValueChange("nominal"));
	await act(async () => selector("Pilih bank").props.onValueChange("bca"));
	await changeInput("Masukkan nomor rekening", valid.accountNumber);
	await changeInput("Masukkan nama pemilik rekening", valid.accountName);
}
const resetStore = () => store.setState({ items: [], nextId: 1 });
const modalButtons = () => all("Button").filter((node) => node.findAllByType("ButtonText").length);
const button = (label) => modalButtons().find((node) => node.findByType("ButtonText").props.children === label);
(async () => {
	check("Production store starts empty without dummy seed", store.getState().items, []);
	check("Zero fee accepted explicitly", schema.safeParse(valid).success, true);
	for (const [name, overrides] of invalidCases) check(name, schema.safeParse({ ...valid, ...overrides }).success, false);
	check("Percentage100 accepted", schema.safeParse({ ...valid, adminType: "percentage", value: 100 }).success, true);
	check("Nominal above100 accepted", schema.safeParse({ ...valid, value: 5000 }).success, true);
	const parsed = schema.parse({ ...valid, name: "  QA  ", bank: " BCA ", accountNumber: " 001234 ", accountName: " QA Owner " });
	check("Store contract trims text/lowercases bank while retaining leading zeros", [parsed.name, parsed.bank, parsed.accountNumber, parsed.accountName], ["QA", "bca", "001234", "QA Owner"]);
	const a = store.getState().add(valid), b = store.getState().add({ ...valid, name: "Transfer B" });
	check("Two creations have distinct stable IDs", [typeof a, typeof b, a !== b], ["string", "string", true]);
	const beforeInvalid = store.getState().items;
	check("Invalid add/update do not mutate session data", [store.getState().add({ ...valid, value: Infinity }), store.getState().update(a, { ...valid, bank: "" }), store.getState().items === beforeInvalid], [null, false, true]);
	check("Update missing ID rejects without creating", store.getState().update("missing", valid), false);
	store.getState().update(a, { ...valid, name: "Changed A" });
	check("Update preserves identity and leaves B unchanged", store.getState().items.map((item) => [item.id, item.name]), [[a, "Changed A"], [b, "Transfer B"]]);
	check("Delete exact A succeeds once only", [store.getState().remove(a), store.getState().remove(a), store.getState().items.map((item) => item.id)], [true, false, [b]]);
	const c = store.getState().add(valid);
	check("Deleted ID is not reused", c !== a && c !== b, true);
	resetStore();
	const ModifyRoute = production("app/(no-layout)/manage/payment-method/modify.tsx").default;
	params = {}; await mount(ModifyRoute);
	check("Create visibly defaults zero fee consistently with form data", input("Masukkan nilai").props.value, "0");
	await fillOtherFields();
	const save = one("BottomActionButton").props.onPress;
	await act(async () => { await Promise.all([save(), save()]); });
	check("Rapid RHF submit saves exactly one zero-fee user-entered item", store.getState().items.map((item) => [item.name, item.value, item.accountNumber]), [[valid.name, 0, "001234"]]);
	check("Save feedback appears and explicit temporary copy remains", [!!button("Tutup"), all("Text").some((node) => typeof node.props.children === "string" && node.props.children.includes("belum digunakan dalam transaksi"))], [true, true]);
	const closeSave = button("Tutup").props.onPress;
	await act(async () => { closeSave(); closeSave(); });
	check("Success acknowledgement navigates once", navigation, [["replace", "/manage/payment-method"]]);
	resetStore(); params = {}; await mount(ModifyRoute); await fillOtherFields(); await changeInput("Masukkan nilai", "");
	await act(async () => one("BottomActionButton").props.onPress());
	check("Explicitly cleared fee is rejected rather than silently zero", [store.getState().items.length, !!button("Tutup")], [0, false]);
	await changeInput("Masukkan nilai", "1,25"); await act(async () => one("BottomActionButton").props.onPress());
	check("Decimal comma preserves1.25 session fee", store.getState().items[0]?.value, 1.25);
	resetStore(); params = {}; await mount(ModifyRoute); await fillOtherFields();
	const oldSave = one("BottomActionButton").props.onPress;
	params = { id: "missing" }; await act(async () => renderer.update(React.createElement(React.StrictMode, null, React.createElement(ModifyRoute))));
	check("Missing edit ID hides active form with not-found state", all("InputField").length, 0);
	await act(async () => oldSave());
	check("Retained submit after route unmount cannot create an item", store.getState().items.length, 0);
	const editA = store.getState().add(valid), editB = store.getState().add({ ...valid, name: "Different B", value: 5 });
	params = { id: [editA, "ignored"] }; await mount(ModifyRoute);
	check("Route array uses first ID and editor uses exact user item", input("Contoh: Transfer Bank").props.value, valid.name);
	await changeInput("Contoh: Transfer Bank", "Unsaved draft A");
	await act(async () => store.getState().update(editB, { ...valid, name: "Other B updated" }));
	check("Unrelated store update preserves editor draft", input("Contoh: Transfer Bank").props.value, "Unsaved draft A");
	params = { id: editB }; await act(async () => renderer.update(React.createElement(React.StrictMode, null, React.createElement(ModifyRoute))));
	check("Changing editor ID resets draft to exactB", input("Contoh: Transfer Bank").props.value, "Other B updated");
	params = {}; await act(async () => renderer.update(React.createElement(React.StrictMode, null, React.createElement(ModifyRoute))));
	check("Edit-to-create resets user draft and visible zero fee", [input("Contoh: Transfer Bank").props.value, input("Masukkan nilai").props.value], ["", "0"]);
	const Detail = production("components/feature/manage/settings/PaymentMethodDetailScreen.tsx").default;
	await mount(Detail, { id: editA });
	check("Detail exact item displays user account number and fee", all("DetailRow").filter((node) => ["Nomor Rekening", "Nilai Biaya Admin"].includes(node.props.label)).map((node) => node.props.value), [new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(0), "001234"]);
	await act(async () => one("DetailBottomActions").props.onDelete());
	const deleteAction = button("Hapus").props.onPress;
	await act(async () => { deleteAction(); deleteAction(); });
	check("Detail delete removes exactA while keeping success available", [store.getState().items.some((item) => item.id === editA), store.getState().items.some((item) => item.id === editB), !!button("Tutup")], [false, true, true]);
	const acknowledgeDelete = button("Tutup").props.onPress;
	await act(async () => { acknowledgeDelete(); acknowledgeDelete(); });
	check("Delete acknowledgement navigates once after record gone", navigation, [["replace", "/manage/payment-method"]]);
	await mount(Detail, { id: "missing" });
	check("Missing detail never falls back to first item", [all("DetailRow").length, all("DetailBottomActions").length], [0, 0]);
	const List = production("app/(no-layout)/manage/payment-method/index.tsx").default;
	resetStore(); await mount(List);
	check("List begins empty and CTA names payment methods", [one("FlatList").props.data.length, one("BottomActionButton").props.children], [0, "Tambah Metode Pembayaran"]);
	await act(async () => store.getState().add({ ...valid, name: "Searchable" }));
	await act(async () => one("SearchBar").props.setSearch(" BCA "));
	check("List bank search trims and matches current user data", one("FlatList").props.data.map((item) => item.name), ["Searchable"]);
	await act(async () => one("SearchBar").props.setSearch("no-result"));
	check("Search missing data gives empty results", one("FlatList").props.data.length, 0);
	await act(async () => renderer.unmount()); renderer = null;
	check("Runtime/React/act errors absent", errors, []); check("Runtime warnings absent", warnings, []);
	const drift = Object.entries(hashes).filter(([file, expected]) => sha(fs.readFileSync(path.join(root, file))) !== expected).map(([file]) => file);
	check("Actual source loaded during independent tests stays stable", drift, []);
	const result = { status: checks.every((item) => item.passed) ? "INTERNAL_QA_REVIEW_PASS" : "INTERNAL_QA_REVIEW_CHANGES_REQUESTED", externalQcApproval: false, pass: checks.filter((item) => item.passed).length, fail: checks.filter((item) => !item.passed).length, errors, warnings, checks, sourceHashes: hashes, loadedProductionModules: [...loaded.keys()], fixture: "Production schema/store/routes/screens/Form/RHF/Zod/hook/sharedmodals with RN/UI/primitive/router/dimensions/picker adapters; isolated process memory user-entered fixtures, no API/storage/backend", limits: ["No browser/native/HP/Figma/fullrouter/full-app certification", "No real API/transaction/persistence linkage", "Nonvisual list/cards/sheet/CTA primitives adapted; actual shared Form and modal sources loaded", "Internal QA only; external QC and PM gates remain"] };
	fs.writeFileSync(path.join(__dirname, output), `${JSON.stringify(result, null, 2)}\n`);
	const snapshotDir = path.join(__dirname, output.replace(/\.json$/, "-sources")); fs.mkdirSync(snapshotDir, { recursive: true });
	for (const [file, bytes] of Object.entries(snapshots)) fs.writeFileSync(path.join(snapshotDir, file.replaceAll("/", "__") + ".txt"), bytes);
	console.log(JSON.stringify({ status: result.status, pass: result.pass, fail: result.fail, productionModules: loaded.size, errors, warnings, failed: checks.filter((item) => !item.passed).map((item) => item.name), sourceDrift: drift }, null, 2));
	console.error = originalError; console.warn = originalWarn;
	if (result.fail) process.exitCode = 1;
})().catch((error) => { console.error(error); process.exitCode = 1; });
