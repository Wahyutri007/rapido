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
		if (name === "@/lib/utils") return { route: (pathname, params) => params ? `${pathname}?${Object.entries(params).map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join("&")}` : pathname, cn: (...args) => args.filter(Boolean).join(" "), tw: (value) => value * 4 };
		if (name === "@/assets/images/illustrations") return { ILLUSTRATIONS: { actionSuccess: "fixture-success", deleteConfirmation: "fixture-delete" } };
		if (name === "@/components/common/DataPlaceholder") return hostNames(["SearchNotFound"]);
		if (name === "@/components/custom/CatalogItemCard") return { __esModule: true, default: (props) => React.createElement("CatalogItemCard", props, props.title, props.subtitle, props.right) };
		const presentation = { "@/components/common/BottomActionButton": "BottomActionButton", "@/components/common/Card": "Card", "@/components/common/Text": "Text", "./Text": "Text", "@/components/common/Wrapper": "Wrapper", "@/components/common/SearchBar": "SearchBar", "@/components/custom/DetailRow": "DetailRow", "@/components/custom/DetailBottomActions": "DetailBottomActions", "@/components/custom/ItemActionSheet": "ItemActionSheet", "./SingleSelect": "SingleSelect", "@/components/common/Header": "Header" };
		if (presentation[name]) return defaultHost(presentation[name]);
		if (name === "@/components/custom/JSStack") return { JSStack: Object.assign((props) => React.createElement("JSStack", props, props.children), { Screen: "JSStackScreen" }), ScaleBackTransition: {} };
		const base = name.startsWith("@/") ? path.join(root, name.slice(2)) : name.startsWith(".") ? path.resolve(path.dirname(path.join(root, relative)), name) : null;
		if (base) for (const candidate of [`${base}.tsx`, `${base}.ts`, path.join(base, "index.tsx"), path.join(base, "index.ts")]) if (fs.existsSync(candidate)) return production(path.relative(root, candidate).replaceAll("\\", "/"));
		throw new Error(`Unexpected dependency ${name} from ${relative}`);
	};
	vm.runInNewContext(code, { module, exports: module.exports, require: customRequire, console, Intl, URL, setTimeout, clearTimeout }, { filename: relative });
	loaded.set(relative, module.exports); return module.exports;
}

const schema = production("schema/manage/integration.ts").integrationSchema;
const store = production("store/manageIntegrationStore.ts").useManageIntegrationStore;
const valid = { name: "Integrasi QA", endpoint: "https://example.test/webhook?order=1", notes: "Catatan QA" };
const invalid = [
	["Empty name", { name: "  " }], ["Name above80", { name: "x".repeat(81) }], ["Empty URL", { endpoint: "" }],
	["Malformed URL", { endpoint: "not a URL" }], ["HTTP URL", { endpoint: "http://example.test/hook" }],
	["Protocol relative URL", { endpoint: "//example.test/hook" }], ["Wrong scheme", { endpoint: "ftp://example.test/hook" }],
	["Incomplete HTTPS URL", { endpoint: "https://" }], ["Username credentials URL", { endpoint: "https://user@example.test/hook" }],
	["Empty userinfo URL", { endpoint: "https://@example.test/hook" }],
	["Username/password URL", { endpoint: "https://user:password@example.test/hook" }], ["Fragment URL", { endpoint: "https://example.test/hook#fragment" }],
	["URL internal whitespace", { endpoint: "https://example.test/a b" }], ["URL backslash", { endpoint: "https://example.test/a\\b" }],
	["Notes above1000", { notes: "n".repeat(1001) }], ["URL above2048", { endpoint: "https://example.test/" + "a".repeat(2048) }],
];
let renderer;
async function mount(component, props = {}) {
	if (renderer) await act(async () => renderer.unmount()); navigation = [];
	await act(async () => { renderer = create(React.createElement(React.StrictMode, null, React.createElement(component, props))); });
}
const all = (type) => renderer.root.findAllByType(type);
const one = (type) => renderer.root.findByType(type);
const input = (placeholder) => all("InputField").find((node) => node.props.placeholder === placeholder);
const button = (label) => all("Button").find((node) => node.findAllByType("ButtonText").some((text) => text.props.children === label));
async function field(placeholder, text) { await act(async () => input(placeholder).props.onChangeText(text)); }
async function fill(values = valid) {
	await field("Contoh: Sistem pemesanan", values.name);
	await field("https://contoh.com/webhook", values.endpoint);
	await field("Tambahkan catatan (opsional)", values.notes ?? "");
}
const reset = () => store.setState({ items: [], nextId: 1 });
(async () => {
	check("New store starts empty without seeded provider", store.getState().items, []);
	check("Valid HTTPS endpoint accepted", schema.safeParse(valid).success, true);
	check("Query address@ without path is valid, not authority userinfo", schema.safeParse({ ...valid, endpoint: "https://example.test?address=a@b" }).success, true);
	check("Endpoint path/query case is preserved", schema.parse({ ...valid, endpoint: "https://example.test/CasePath?Token=AbC" }).endpoint, "https://example.test/CasePath?Token=AbC");
	for (const [name, values] of invalid) check(name, schema.safeParse({ ...valid, ...values }).success, false);
	check("Name80 and notes1000 accepted at limit", schema.safeParse({ ...valid, name: "x".repeat(80), notes: "n".repeat(1000) }).success, true);
	check("Notes omitted default to empty", schema.parse({ name: valid.name, endpoint: valid.endpoint }).notes, "");
	const trimmed = schema.parse({ name: "  Draft QA  ", endpoint: "  https://example.test/hook?x=1  ", notes: "  note  " });
	check("Trim preserves URL query and user notes", trimmed, { name: "Draft QA", endpoint: "https://example.test/hook?x=1", notes: "note" });
	const a = store.getState().add({ ...valid, status: "connected", provider: "injected" }), b = store.getState().add({ ...valid, name: "Different B" });
	check("Creation IDs distinct and immutable draft status cannot be injected", [a !== b, store.getState().items.map((item) => item.status), store.getState().items.some((item) => "provider" in item)], [true, ["draft", "draft"], false]);
	const before = store.getState().items;
	check("Invalid URL add/update leave collection unchanged", [store.getState().add({ ...valid, endpoint: "http://example.test" }), store.getState().update(a, { ...valid, endpoint: "bad" }), store.getState().items === before], [null, false, true]);
	check("Missing update rejects without creating another item", store.getState().update("missing", valid), false);
	store.getState().update(a, { ...valid, name: "Changed A", status: "connected" });
	check("Update exact A retains ID/draft and leaves B unchanged", store.getState().items.map((item) => [item.id, item.name, item.status]), [[a, "Changed A", "draft"], [b, "Different B", "draft"]]);
	check("Remove A succeeds once and leaves B", [store.getState().remove(a), store.getState().remove(a), store.getState().items.map((item) => item.id)], [true, false, [b]]);
	const c = store.getState().add(valid); check("Removed ID never reused", c !== a && c !== b, true);
	reset(); params = {};
	const Modify = production("app/(no-layout)/manage/integrations/modify.tsx").default;
	await mount(Modify); check("New form empty with CTA Simpan Draf", [input("Contoh: Sistem pemesanan").props.value, input("https://contoh.com/webhook").props.value, one("BottomActionButton").props.children], ["", "", "Simpan Draf"]);
	await fill({ ...valid, endpoint: "http://example.test" }); await act(async () => one("BottomActionButton").props.onPress());
	check("Actual RHF invalid endpoint cannot create draft", store.getState().items.length, 0);
	await field("https://contoh.com/webhook", valid.endpoint); const submit = one("BottomActionButton").props.onPress;
	await act(async () => { await Promise.all([submit(), submit()]); });
	check("Rapid two actual RHF submits create exactly one draft", store.getState().items.map((item) => [item.name, item.endpoint, item.notes, item.status]), [[valid.name, valid.endpoint, valid.notes, "draft"]]);
	check("Save feedback appears", !!button("Tutup"), true);
	const close = button("Tutup").props.onPress; await act(async () => { close(); close(); });
	check("Save acknowledgement navigates to draft list once", navigation, [["replace", "/manage/integrations"]]);
	reset(); params = {}; await mount(Modify); await fill(); const cachedSubmit = one("BottomActionButton").props.onPress;
	params = { id: "missing" }; await act(async () => renderer.update(React.createElement(React.StrictMode, null, React.createElement(Modify))));
	check("Missing edit ID renders no active form", all("InputField").length, 0);
	await act(async () => cachedSubmit()); check("Old submit after route unmount cannot create draft", store.getState().items.length, 0);
	const editA = store.getState().add(valid), editB = store.getState().add({ ...valid, name: "Another B" });
	params = { id: [editA, "ignored"] }; await mount(Modify);
	check("Array route first ID resolves exact A", input("Contoh: Sistem pemesanan").props.value, valid.name);
	await field("Contoh: Sistem pemesanan", "Unsaved A");
	await act(async () => store.getState().update(editB, { ...valid, name: "Updated B" }));
	check("Unrelated store update preserves RHF draft", input("Contoh: Sistem pemesanan").props.value, "Unsaved A");
	params = { id: editB }; await act(async () => renderer.update(React.createElement(React.StrictMode, null, React.createElement(Modify))));
	check("Edit A to B resets to exactB", input("Contoh: Sistem pemesanan").props.value, "Updated B");
	params = {}; await act(async () => renderer.update(React.createElement(React.StrictMode, null, React.createElement(Modify))));
	check("Edit to create resets all three draft fields", [input("Contoh: Sistem pemesanan").props.value, input("https://contoh.com/webhook").props.value, input("Tambahkan catatan (opsional)").props.value], ["", "", ""]);
	params = { id: "" }; await act(async () => renderer.update(React.createElement(React.StrictMode, null, React.createElement(Modify))));
	check("Empty edit ID is invalid rather than create fallback", all("InputField").length, 0);
	const Detail = production("components/feature/manage/integrations/IntegrationDetailScreen.tsx").default;
	await mount(Detail, { id: editA });
	check("Detail displays endpoint user provided", all("DetailRow").some((node) => node.props.value === valid.endpoint) || all("Text").some((node) => node.props.children === valid.endpoint), true);
	check("Detail renders honest Draf label", all("Text").some((node) => node.props.children === "Draf") || all("DetailRow").some((node) => node.props.value === "Draf"), true);
	await act(async () => store.getState().update(editA, { ...valid, endpoint: "https://updated.test/hook" }));
	check("Detail reacts to current store endpoint", all("DetailRow").some((node) => node.props.value === "https://updated.test/hook") || all("Text").some((node) => node.props.children === "https://updated.test/hook"), true);
	await act(async () => one("DetailBottomActions").props.onDelete()); const oldConfirm = button("Hapus").props.onPress;
	await act(async () => button("Batal").props.onPress()); await act(async () => one("DetailBottomActions").props.onDelete());
	await act(async () => oldConfirm());
	check("Cached confirmation after cancel/reopen cannot delete current record", [store.getState().items.some((item) => item.id === editA), !!button("Hapus")], [true, true]);
	const currentConfirm = button("Hapus").props.onPress; await act(async () => { currentConfirm(); currentConfirm(); });
	check("Current delete removes exact A and preserves acknowledgement/B", [store.getState().items.some((item) => item.id === editA), store.getState().items.some((item) => item.id === editB), !!button("Tutup")], [false, true, true]);
	const acknowledge = button("Tutup").props.onPress; await act(async () => { acknowledge(); acknowledge(); });
	check("Delete success acknowledgement navigates once after record gone", navigation, [["replace", "/manage/integrations"]]);
	await mount(Detail, { id: "missing" }); check("Missing detail never falls back to first draft", [all("DetailRow").length, all("DetailBottomActions").length], [0, 0]);
	const List = production("app/(no-layout)/manage/integrations/index.tsx").default;
	reset(); await mount(List); check("List starts empty", one("FlatList").props.data.length, 0);
	let listA;
	await act(async () => { listA = store.getState().add({ ...valid, name: "Search Target", endpoint: "https://search-target.test/hook", notes: "Special note" }); });
	await act(async () => one("SearchBar").props.setSearch("  SEARCH-TARGET  "));
	check("Search matches endpoint with trim/casefold", one("FlatList").props.data.map((item) => item.id), [listA]);
	await act(async () => one("SearchBar").props.setSearch("no-result")); check("Search not found results empty", one("FlatList").props.data.length, 0);
	await act(async () => one("SearchBar").props.setSearch(""));
	const action = all("Pressable").find((node) => node.props.accessibilityLabel?.includes("Search Target"));
	await act(async () => action.props.onPress({ stopPropagation() {} }));
	const oldView = one("ItemActionSheet").props.onViewDetail;
	await act(async () => store.getState().remove(listA)); await act(async () => oldView());
	check("Cached list action after canonical record removed cannot navigate", [all("ItemActionSheet").length, navigation], [0, []]);
	await act(async () => renderer.unmount()); renderer = null;
	check("Runtime/React/act errors absent", errors, []); check("Runtime warnings absent", warnings, []);
	const drift = Object.entries(hashes).filter(([file, expected]) => sha(fs.readFileSync(path.join(root, file))) !== expected).map(([file]) => file);
	check("Loaded source remains stable throughout suite", drift, []);
	const result = { status: checks.every((entry) => entry.passed) ? "INTERNAL_QA_REVIEW_PASS" : "INTERNAL_QA_REVIEW_CHANGES_REQUESTED", externalQcApproval: false, pass: checks.filter((entry) => entry.passed).length, fail: checks.filter((entry) => !entry.passed).length, checks, errors, warnings, sourceHashes: hashes, loadedProductionModules: [...loaded.keys()], fixture: "Production schema/store/routes/screens/Form/RHF/Zod/shared modals/hook/ManageListActions with RN/primitive/router/dimension adapters; isolated process memory draft fixtures only", limits: ["No browser/native/HP/geometry/Figma/fullrouter/fullapp/realnetwork/provider/activation/persist/backend certification", "Source Success7508/DeleteDABC geometry inherits external QC gates; renderer state checks do not close them"] };
	fs.writeFileSync(path.join(__dirname, output), `${JSON.stringify(result, null, 2)}\n`);
	const snapshotDirectory = path.join(__dirname, output.replace(/\.json$/, "-sources")); fs.mkdirSync(snapshotDirectory, { recursive: true });
	for (const [file, text] of Object.entries(snapshots)) fs.writeFileSync(path.join(snapshotDirectory, file.replaceAll("/", "__") + ".txt"), text);
	console.log(JSON.stringify({ status: result.status, pass: result.pass, fail: result.fail, productionModules: loaded.size, errors, warnings, failed: checks.filter((entry) => !entry.passed).map((entry) => entry.name), drift }, null, 2));
	console.error = originalError; console.warn = originalWarn; if (result.fail) process.exitCode = 1;
})().catch((error) => { console.error(error); process.exitCode = 1; });
