const fs = require("node:fs"), path = require("node:path"), vm = require("node:vm"), crypto = require("node:crypto"), ts = require("typescript");
const React = require(path.resolve(".expo/senior7-test-tools/node_modules/react"));
require.cache[require.resolve("react")] = { exports: React };
const { create, act } = require(path.resolve(".expo/senior7-test-tools/node_modules/react-test-renderer"));
global.IS_REACT_ACT_ENVIRONMENT = true;
const loaded = new Map(), hashes = new Map(), checks = [], runtimeErrors = [], navigations = [];
const originalError = console.error;
console.error = (...args) => { if (String(args[0]).includes("react-test-renderer is deprecated")) return; runtimeErrors.push(args.map(String).join(" ")); originalError(...args); };
const hash = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const test = (name, actual, expected) => checks.push({ name, passed: JSON.stringify(actual) === JSON.stringify(expected), actual, expected });
const names = (list) => Object.fromEntries(list.map((name) => [name, name]));
const container = (name) => ({ children, isOpen, ...props }) => React.createElement(name, { isOpen, ...props }, isOpen ? children : null);
const Card = ({ right, title, subtitle, leading, children, ...props }) => React.createElement("CatalogItemCard", props, leading, title, subtitle, children, right);
const FlatList = ({ data, renderItem, ListEmptyComponent, ...props }) => React.createElement("FlatList", { data, ...props }, data.map((item, index) => React.createElement(React.Fragment, { key: item.id }, renderItem({ item, index }))), !data.length && ListEmptyComponent);
let params = {}, renderer, screen;
function load(file) {
	const absolute = path.resolve(file); if (loaded.has(absolute)) return loaded.get(absolute);
	hashes.set(file, hash(absolute));
	const module = { exports: {} };
	const customRequire = (name) => {
		if (name === "react") return React;
		if (name === "react/jsx-runtime") return require(path.resolve(".expo/senior7-test-tools/node_modules/react/jsx-runtime"));
		if (name === "react-native") return { ...names(["View", "Image", "Pressable", "Switch", "ScrollView"]), FlatList, Platform: { OS: "web" }, useWindowDimensions: () => ({ width: 360, height: 800 }) };
		if (name === "expo-router") return { Link: "Link", useLocalSearchParams: () => params, router: { push: (target) => navigations.push({ action: "push", target }), replace: (target) => navigations.push({ action: "replace", target }), back: () => navigations.push({ action: "back" }) } };
		if (name === "@/lib/utils") return { route: (target, params) => ({ target, params }), cn: (...values) => values.filter(Boolean).join(" "), tw: (value) => value * 4 };
		if (["@/components/common/Card", "@/components/common/Text", "@/components/common/Wrapper", "@/components/common/SearchBar", "@/components/common/BottomActionButton", "@/components/common/BouncyPressable", "@/components/custom/DetailBottomActions", "@/components/custom/DetailRow"].includes(name)) return { __esModule: true, default: name.split("/").at(-1) };
		if (name === "./Text" || name === "./SingleSelect" || name === "../icons/camera") return { __esModule: true, default: name.split("/").at(-1) };
		if (name === "@/components/custom/CatalogItemCard") return { __esModule: true, default: Card };
		if (name === "@/components/icons") return names(["EFeather"]);
		if (name === "@/components/common/DataPlaceholder") return names(["SearchNotFound"]);
		if (name === "@/components/ui/modal") return { Modal: container("Modal"), ...names(["ModalBackdrop", "ModalBody", "ModalContent", "ModalFooter", "ModalHeader"]) };
		if (name === "@/components/ui/actionsheet") return { Actionsheet: container("Actionsheet"), ...names(["ActionsheetBackdrop", "ActionsheetContent", "ActionsheetDragIndicator", "ActionsheetDragIndicatorWrapper"]) };
		if (["@/components/ui/button", "../ui/button"].includes(name)) return names(["Button", "ButtonGroup", "ButtonText"]);
		if (name === "../ui/input") return names(["Input", "InputField", "InputIcon"]);
		if (name === "../ui/checkbox") return names(["Checkbox", "CheckboxGroup", "CheckboxIcon", "CheckboxIndicator", "CheckboxLabel"]);
		if (name === "../ui/radio") return names(["Radio", "RadioCircleIndicator", "RadioGroup", "RadioLabel"]);
		if (name.startsWith("@expo/vector-icons/")) return { __esModule: true, default: name.split("/").at(-1) };
		if (name === "expo-document-picker" || name === "@react-native-community/datetimepicker") return {};
		if (name === "@/assets/images/illustrations") return { ILLUSTRATIONS: { deleteConfirmation: "fixture-delete", actionSuccess: "fixture-success" } };
		if (name.startsWith("@/") || name.startsWith(".")) {
			const base = name.startsWith("@/") ? path.resolve(name.slice(2)) : path.resolve(path.dirname(absolute), name);
			const resolved = [base + ".ts", base + ".tsx", path.join(base, "index.ts"), path.join(base, "index.tsx")].find(fs.existsSync);
			if (!resolved) throw Error(`Unresolved ${name} from ${file}`);
			return load(path.relative(process.cwd(), resolved).replaceAll("\\", "/"));
		}
		return require(name);
	};
	const code = ts.transpileModule(fs.readFileSync(absolute, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
	vm.runInNewContext(code, { module, exports: module.exports, require: customRequire, console, Date, Error, Intl, Number, setTimeout, clearTimeout }, { filename: absolute });
	loaded.set(absolute, module.exports); return module.exports;
}
const store = load("store/managePaymentMethodStore.ts").useManagePaymentMethodStore;
const schema = load("schema/manage/payment-method.ts").paymentMethodSchema;
const List = load("app/(no-layout)/manage/payment-method/index.tsx").default;
const Modify = load("app/(no-layout)/manage/payment-method/modify.tsx").default;
const Detail = load("app/(no-layout)/manage/payment-method/detail.tsx").default;
const FormScreen = load("components/feature/manage/settings/PaymentMethodModifyScreen.tsx").default;
const MissingEditor = () => React.createElement(FormScreen, { item: { ...value(), id: "already-removed" } });
const Delete = load("components/common/DeleteConfirmModal.tsx").default;
const Success = load("components/common/SuccessModal.tsx").default;
const Alert = load("components/common/AlertModal.tsx").default;
const Sheet = load("components/custom/ItemActionSheet.tsx").default;
const Row = load("components/custom/ItemActionSheet.tsx").ItemActionSheetRow;
const Form = load("components/common/Form.tsx").Form;
const value = (name = "Transfer Toko") => ({ name, type: "bank_transfer", adminType: "percentage", value: 1.5, bank: "bca", accountNumber: "00123456", accountName: "Pemilik Toko" });
async function unmount() { if (renderer) await act(async () => renderer.unmount()); renderer = null; }
async function mount(component, nextParams = {}) { await unmount(); params = nextParams; screen = component; await act(async () => { renderer = create(React.createElement(React.StrictMode, null, React.createElement(component))); }); }
async function route(nextParams) { params = nextParams; await act(async () => renderer.update(React.createElement(React.StrictMode, null, React.createElement(screen)))); }
const props = (component) => renderer.root.findAllByType(component)[0]?.props;
const open = (component) => !!props(component)?.openState[0];
const form = () => props(Form);
const get = (name) => form().getValues(name);
async function fill(values) { await act(async () => Object.entries(values).forEach(([key, value]) => form().setValue(key, value))); }
async function enterCreate() {
	await act(async () => {
		for (const [placeholder, text] of [["Contoh: Transfer Bank", "Transfer Toko"], ["Masukkan nomor rekening", "00123456"], ["Masukkan nama pemilik rekening", "Pemilik Toko"], ["Masukkan nilai", "1,5"]]) renderer.root.findAllByType("InputField").find((node) => node.props.placeholder === placeholder).props.onChangeText(text);
		for (const [placeholder, value] of [["Pilih jenis pembayaran", "bank_transfer"], ["Pilih tipe biaya admin", "percentage"], ["Pilih bank", "bca"]]) renderer.root.findAllByType("SingleSelect").find((node) => node.props.placeholder === placeholder).props.onValueChange(value);
	});
}
const submit = () => renderer.root.findByType("BottomActionButton").props.onPress;
async function save() { await act(async () => { await submit()(); }); }
async function select(id) { const item = store.getState().items.find((item) => item.id === id); await act(async () => renderer.root.findAllByType("Pressable").find((node) => node.props.accessibilityLabel === `Tindakan ${item.name}`).props.onPress({ stopPropagation() {} })); }
const row = (kind) => renderer.root.findAllByType(Row).find((node) => node.props.title.startsWith({ detail: "Detail", edit: "Edit", delete: "Hapus" }[kind])).findByType("BouncyPressable").props.onPress;
async function action(kind) { const press = row(kind); await act(async () => press()); }
async function confirm() { const press = renderer.root.findByType(Delete).findAllByType("Button").find((node) => node.props.action === "negative").props.onPress; await act(async () => { press(); press(); }); }
async function acknowledge() { const press = renderer.root.findByType(Success).findByType("Button").props.onPress; await act(async () => { press(); press(); }); }
async function reset() { await unmount(); store.setState({ items: [], nextId: 1 }); navigations.length = 0; }
(async () => {
	test("store starts empty without fixture seeds", store.getState().items, []);
	for (const [name, values, expected] of [
		["valid all fields", value(), true], ["trim-only name rejected", { ...value(), name: "  " }, false], ["unknown type rejected", { ...value(), type: "cash" }, false], ["unknown admin enum rejected", { ...value(), adminType: "other" }, false], ["unknown bank rejected", { ...value(), bank: "fake" }, false], ["negative fee rejected", { ...value(), value: -1 }, false], ["Infinity fee rejected", { ...value(), value: Infinity }, false], ["NaN fee rejected", { ...value(), value: NaN }, false], ["percentage over100 rejected", { ...value(), value: 100.1 }, false], ["percentage100 accepted", { ...value(), value: 100 }, true], ["zero fee accepted", { ...value(), value: 0 }, true], ["nominal over100 accepted", { ...value(), adminType: "nominal", value: 1000 }, true], ["empty account rejected", { ...value(), accountNumber: " " }, false], ["empty owner rejected", { ...value(), accountName: " " }, false],
	]) test(`schema: ${name}`, schema.safeParse(values).success, expected);
	const invalid = store.getState().add({ ...value(), name: " " }); test("store independently rejects invalid create", [invalid, store.getState().items.length], [null, 0]);
	const a = store.getState().add({ ...value("  Transfer A  "), bank: " BCA ", accountName: " Pemilik A " });
	const b = store.getState().add(value("Transfer B"));
	test("stable distinct IDs generated without fixtures", [a, b], ["payment-method-1", "payment-method-2"]);
	test("store normalizes text and preserves account leading zeros", store.getState().items[0], { ...value("Transfer A"), id: a, bank: "bca", accountName: "Pemilik A" });
	test("missing update/remove return false", [store.getState().update("missing", value()), store.getState().remove("missing")], [false, false]);
	test("invalid update cannot overwrite existing data", store.getState().update(a, { ...value(), value: -1 }), false);
	await mount(List); test("list uses payment records instead of order types", props("FlatList").data.map((item) => item.name), ["Transfer A", "Transfer B"]);
	await act(async () => props("SearchBar").setSearch("pemilik a")); test("search includes account owner", props("FlatList").data.map((item) => item.id), [a]);
	await act(async () => props("SearchBar").setSearch("missing")); test("search has genuine empty results", props("FlatList").data.length, 0);
	await reset(); await mount(List); test("initial list empty with correct copy", [props("FlatList").data.length, props("SearchNotFound").text], [0, "Belum ada metode pembayaran. Tambahkan metode pertama Anda."]);
	await act(async () => submit()()); test("add button goes to own create route", navigations.at(-1), { action: "push", target: { target: "/manage/payment-method/modify" } });
	await mount(Modify); test("create fee default is visibly zero and matches form", [renderer.root.findAllByType("InputField").find((node) => node.props.placeholder === "Masukkan nilai").props.value, get("value")], ["0", 0]); await save(); test("RHF invalid create stores no record/no success", [store.getState().items.length, open(Success)], [0, false]);
	await enterCreate(); test("actual Form input/picker events preserve user-entered fields and decimal", form().getValues(), value()); const saveTwice = submit(); await act(async () => { await Promise.all([saveTwice(), saveTwice()]); });
	test("actual RHF/Zod duplicate create stores one full record", store.getState().items, [{ ...value(), id: "payment-method-1" }]);
	test("successful create shows success feedback", open(Success), true); await acknowledge(); test("create acknowledgement returns to list once", navigations.filter((item) => item.action === "replace"), [{ action: "replace", target: "/manage/payment-method" }]);
	const id = store.getState().items[0].id;
	await mount(Modify, { id }); test("session-ID edit prefill retains all fields", form().getValues(), value());
	await fill({ name: "Draft Edit" }); await act(async () => store.getState().update(id, value("External Update"))); test("same-ID source update never overwrites mounted draft", get("name"), "Draft Edit");
	await fill({ adminType: "nominal", value: 5000 }); await save(); test("actual edit updates same stable ID/all fields", store.getState().items[0], { ...value("Draft Edit"), id, adminType: "nominal", value: 5000 });
	await mount(Modify, { id }); const numeric = renderer.root.findAllByType("InputField").find((node) => node.props.placeholder === "Masukkan nilai");
	await act(async () => numeric.props.onChangeText("-1")); await save(); test("real fee input does not strip minus to positive", [get("value"), store.getState().items[0].value, open(Success)], [-1, 5000, false]);
	await act(async () => numeric.props.onChangeText("1,5")); test("real fee input preserves decimal magnitude", get("value"), 1.5);
	await act(async () => numeric.props.onChangeText("")); test("empty numeric input is invalid instead of free fee", Number.isNaN(get("value")), true);
	await route({}); test("edit->create resets form identity", get("name"), ""); await fill(value("Create Draft")); await route({}); test("same create route retains draft", get("name"), "Create Draft");
	await route({ id: "missing" }); test("missing-ID edit has fallback without form", [renderer.root.findAllByType(Form).length, renderer.root.findAllByType("BottomActionButton").length], [0, 1]);
	await route({ id: "" }); test("explicit empty-ID edit remains missing", renderer.root.findAllByType(Form).length, 0);
	await route({ id: [id, "ignored"] }); test("array parameter uses first stable ID", get("name"), "Draft Edit");
	await mount(Modify); await fill(value("Unmounted")); const oldSave = submit(); await unmount(); await act(async () => { await oldSave(); }); test("cached RHF submission after unmount creates no record", store.getState().items.map((item) => item.name), ["Draft Edit"]);
	await mount(MissingEditor); await fill(value()); await save(); test("missing record cannot produce a false save success", [open(Alert), open(Success), store.getState().items.length], [true, false, 1]); test("failed-save button truthfully labels its close action", props(Alert).confirmText, "Tutup"); await act(async () => renderer.root.findByType(Alert).findByType("Button").props.onPress()); test("actual failed-save button closes error and keeps form", [open(Alert), renderer.root.findAllByType(Form).length], [false, 1]);
	await mount(List); await select(id); await action("detail"); test("shared Detail action targets read-only own route", navigations.at(-1), { action: "push", target: { target: "/manage/payment-method/detail", params: { id } } });
	await mount(Detail, { id }); test("detail has no editable form inputs", renderer.root.findAllByType("InputField").length, 0); test("detail displays all saved metadata", renderer.root.findAllByType("DetailRow").map((node) => [node.props.label, node.props.value]), [["Jenis Pembayaran", "Transfer Bank"], ["Tipe Biaya Admin", "Nominal"], ["Nilai Biaya Admin", new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(5000)], ["Nama Bank", "BCA"], ["Nomor Rekening", "00123456"], ["Nama Pemilik Rekening", "Pemilik Toko"]]);
	await act(async () => props("DetailBottomActions").onEdit()); test("detail Edit targets stable-ID form route", navigations.at(-1), { action: "push", target: { target: "/manage/payment-method/modify", params: { id } } });
	await route({ id: "missing" }); test("missing detail has fallback without action footer", renderer.root.findAllByType("DetailBottomActions").length, 0);
	await mount(List); await select(id); const staleClose = props(Sheet).onClose, staleDelete = row("delete"), staleEdit = row("edit"); await act(async () => staleClose()); await select(id); const beforeNav = navigations.length; await act(async () => { staleClose(); staleDelete(); staleEdit(); }); test("same-ID reopen rejects old close/delete/edit callbacks", [props(Sheet)?.isOpen, open(Delete), navigations.length], [true, false, beforeNav]);
	await action("delete"); const oldConfirm = props(Delete).onConfirm; await act(async () => props(Delete).openState[1](false)); await act(async () => oldConfirm()); test("cancelled deletion leaves record and no fake success", [store.getState().items.length, open(Success)], [1, false]);
	await select(id); await action("delete"); await confirm(); test("actual list delete removes record once before success", [store.getState().items.length, open(Delete), open(Success)], [0, false, true]); await acknowledge(); test("delete acknowledgement stays closed", open(Success), false);
	let next; await act(async () => { next = store.getState().add(value("Next")); }); test("deleted IDs are not reused", next, "payment-method-2");
	await mount(Detail, { id: next }); await act(async () => props("DetailBottomActions").onDelete()); await confirm(); test("detail deletion retains success with missing-data fallback", [store.getState().items.length, open(Success), renderer.root.findAllByType("DetailBottomActions").length], [0, true, 0]); const replacementCount = navigations.length; await acknowledge(); test("detail delete acknowledgement returns to list once", navigations.slice(replacementCount), [{ action: "replace", target: "/manage/payment-method" }]);
	await unmount();
	const result = { owner: "Software Developer Senior / Codex-3", ticket: "SD3-013", passed: checks.filter((item) => item.passed).length, failed: checks.filter((item) => !item.passed).length, runtimeErrors, checks, productionModuleHashes: Object.fromEntries(hashes), productionModules: hashes.size, limits: "Production three session routes/list/form/detail/delete/store/schema/RHF/Zod/shared Form/controller/input logic/ManageListActions/ItemActionSheet/modal logic under StrictMode. Native/presentation/picker/FlatList/router/DetailRow are host adapters. No backend, transaction application, disk persistence, browser/native/keyboard geometry/full root/Figma certification." };
	fs.writeFileSync(path.join(__dirname, "results.json"), JSON.stringify(result, null, 2) + "\n"); console.log(JSON.stringify({ passed: result.passed, failed: result.failed, runtimeErrors: runtimeErrors.length, productionModules: hashes.size })); process.exitCode = result.failed || runtimeErrors.length ? 1 : 0;
})().catch(async (error) => { console.error(error); await unmount(); process.exitCode = 2; });
