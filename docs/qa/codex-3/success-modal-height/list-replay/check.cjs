const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const crypto = require("node:crypto");
const ts = require("typescript");
const baseline = process.argv.includes("--baseline");
const output = path.join(__dirname, baseline ? "baseline-results.json" : "results.json");
const React = require(path.resolve(".expo/senior7-test-tools/node_modules/react"));
require.cache[require.resolve("react")] = { exports: React };
const { create, act } = require(path.resolve(".expo/senior7-test-tools/node_modules/react-test-renderer"));
const { QueryClient, QueryClientProvider } = require("@tanstack/react-query");
const axios = require("axios");
global.IS_REACT_ACT_ENVIRONMENT = true;
const checks = [], runtimeErrors = [], loaded = new Map(), loadedHashes = new Map();
const originalError = console.error;
console.error = (...args) => {
	if (String(args[0]).includes("react-test-renderer is deprecated")) return;
	runtimeErrors.push(args.map(String).join(" "));
	originalError(...args);
};
const hash = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const check = (name, actual, expected) => checks.push({ name, passed: JSON.stringify(actual) === JSON.stringify(expected), actual, expected });
const sources = [
	"components/feature/manage/roles/RoleListScreen.tsx",
	"components/feature/manage/workers/WorkerListScreen.tsx",
	"components/feature/manage/member/MemberListScreen.tsx",
];
const kinds = ["role", "worker", "member"];
let renderer, client, current, read = {}, calls = [], navigations = [], queue = [], stopPropagation = 0;
const deferred = () => { let resolve; const promise = new Promise((yes) => { resolve = yes; }); return { promise, resolve }; };
const fixtureAxios = axios.create({ baseURL: "https://fixture.invalid", adapter: async (config) => {
	calls.push({ method: config.method, url: config.url });
	if (config.method !== "delete") throw Error("GET reads are controlled query adapters; only local DELETE transport allowed");
	const outcome = await (queue.shift() ?? Promise.resolve("success"));
	if (outcome === "network") throw new axios.AxiosError("Fixture network failure", "ERR_NETWORK", config);
	return { data: { success: true, data: null }, status: 200, statusText: "Fixture", headers: {}, config };
} });
const presentation = (names) => Object.fromEntries(names.map((name) => [name, name]));
const Modal = ({ children, isOpen, ...props }) => React.createElement("Modal", { ...props, isOpen }, isOpen ? children : null);
const Actionsheet = ({ children, isOpen, ...props }) => React.createElement("Actionsheet", { ...props, isOpen }, isOpen ? children : null);
const CatalogItemCard = ({ children, right, leading, title, subtitle, ...props }) => React.createElement("CatalogItemCard", props, leading, title, subtitle, children, right);
const FlatList = ({ data, renderItem, ListEmptyComponent, ...props }) => React.createElement("FlatList", { ...props, data }, data.map((item, index) => React.createElement(React.Fragment, { key: item.id }, renderItem({ item, index }))), !data.length && (typeof ListEmptyComponent === "function" ? React.createElement(ListEmptyComponent) : ListEmptyComponent));
const resolveSource = (name, parent) => {
	const base = name.startsWith("@/") ? path.resolve(name.slice(2)) : path.resolve(path.dirname(parent), name);
	return [base + ".ts", base + ".tsx", path.join(base, "index.ts"), path.join(base, "index.tsx")].find(fs.existsSync);
};
function load(file) {
	const absolute = path.resolve(file);
	if (loaded.has(absolute)) return loaded.get(absolute);
	const index = sources.indexOf(file.replaceAll("\\", "/"));
	const snapshot = index !== -1 && baseline ? path.join(__dirname, kinds[index] + ".before.tsx.txt") : absolute;
	loadedHashes.set(file, hash(snapshot));
	const code = ts.transpileModule(fs.readFileSync(snapshot, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
	const module = { exports: {} };
	const customRequire = (name) => {
		if (name === "react") return React;
		if (name === "react/jsx-runtime") return require(path.resolve(".expo/senior7-test-tools/node_modules/react/jsx-runtime"));
		if (name === "react-native") return { ...presentation(["View", "Image", "Pressable", "ScrollView", "RefreshControl", "Switch"]), FlatList, useWindowDimensions: () => ({ width: 360, height: 800 }) };
		if (name === "expo-router") return { router: { push: (target) => navigations.push({ action: "push", target }), back: () => navigations.push({ action: "back" }) } };
		if (name === "@/lib/utils") return { route: (target, params) => ({ target, params }), cn: (...values) => values.filter(Boolean).join(" ") };
		if (["@/components/common/Card", "@/components/common/Text", "@/components/common/Wrapper", "@/components/common/SearchBar", "@/components/common/BottomActionButton", "@/components/common/BouncyPressable"].includes(name)) return { __esModule: true, default: name.split("/").at(-1) };
		if (name === "@/components/custom/CatalogItemCard") return { __esModule: true, default: CatalogItemCard };
		if (["./WorkerAvatar", "./MemberIcon"].includes(name)) return { __esModule: true, default: name.slice(2) };
		if (name === "@/components/icons") return presentation(["EFeather"]);
		if (name === "@/components/common/DataPlaceholder") return presentation(["LoadingPlaceholder", "SearchNotFound"]);
		if (name === "@/components/ui/modal") return { Modal, ...presentation(["ModalBackdrop", "ModalBody", "ModalContent", "ModalFooter", "ModalHeader"]) };
		if (name === "@/components/ui/actionsheet") return { Actionsheet, ...presentation(["ActionsheetBackdrop", "ActionsheetContent", "ActionsheetDragIndicator", "ActionsheetDragIndicatorWrapper"]) };
		if (["@/components/ui/button", "../ui/button"].includes(name)) return presentation(["Button", "ButtonGroup", "ButtonText"]);
		if (name === "@expo/vector-icons/Feather") return { __esModule: true, default: "Feather" };
		if (name === "@/assets/images/illustrations") return { ILLUSTRATIONS: { deleteConfirmation: "fixture-delete", actionSuccess: "fixture-success" } };
		if (name === "./axios") return { axios: fixtureAxios };
		if (["@/api/hooks/roles", "@/api/hooks/workers", "@/api/hooks/customers"].includes(name)) {
			const actual = load(path.relative(process.cwd(), resolveSource(name, absolute)).replaceAll("\\", "/"));
			const hook = name.endsWith("roles") ? "useRolesQuery" : name.endsWith("workers") ? "useWorkersQuery" : "useCustomersQuery";
			return { ...actual, [hook]: () => ({ data: read.data, isLoading: read.isLoading ?? false, isError: read.isError ?? false, isFetching: read.isFetching ?? false, refetch: () => Promise.resolve() }) };
		}
		if (name.startsWith("@/") || name.startsWith(".")) {
			const resolved = resolveSource(name, absolute);
			if (!resolved) throw Error(`Cannot resolve ${name} from ${file}`);
			return load(path.relative(process.cwd(), resolved).replaceAll("\\", "/"));
		}
		return require(name);
	};
	vm.runInNewContext(code, { module, exports: module.exports, require: customRequire, console, Date, Error, setTimeout, clearTimeout }, { filename: absolute });
	loaded.set(absolute, module.exports);
	return module.exports;
}
const Delete = load("components/common/DeleteConfirmModal.tsx").default;
const Success = load("components/common/SuccessModal.tsx").default;
const Alert = load("components/common/AlertModal.tsx").default;
const Sheet = load("components/custom/ItemActionSheet.tsx").default;
const Row = load("components/custom/ItemActionSheet.tsx").ItemActionSheetRow;
const specs = kinds.map((kind, index) => ({ kind, component: load(sources[index]).default, prefix: ["/contents/roles/", "/contents/workers/", "/customers/data/"][index], segment: ["roles", "workers", "member"][index] }));
const record = (id) => ({ id, name: `Fixture ${id}`, display_name: `Fixture ${id}`, permissions: ["manage roles", "manage customers"], roles: [], created_at: "", worker_profile: null, assigned_store: null, email: "fixture@example.invalid", phone: "0800000000" });
const element = (spec) => React.createElement(React.StrictMode, null, React.createElement(QueryClientProvider, { client }, React.createElement(spec.component)));
async function unmount() { if (renderer) await act(async () => renderer.unmount()); renderer = null; client?.clear(); }
async function mount(spec) {
	await unmount(); calls = []; navigations = []; queue = []; stopPropagation = 0; read = { data: [record("A"), record("B")] }; current = spec;
	client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { retry: false } } });
	await act(async () => { renderer = create(element(spec)); });
}
async function change(next) { read = next; await act(async () => renderer.update(element(current))); }
const props = (component) => renderer.root.findAllByType(component)[0]?.props;
const visible = (component) => !!props(component)?.openState[0];
const sheetOpen = () => !!props(Sheet)?.isOpen;
const notices = () => [visible(Success), visible(Alert)];
async function select(id = "A") {
	await act(async () => renderer.root.findAllByType("Pressable").find((node) => node.props.accessibilityLabel === `Tindakan ${record(id).name}`)?.props.onPress({ stopPropagation: () => { stopPropagation += 1; } }));
}
function row(action) {
	const title = { detail: "Detail", edit: "Edit", delete: "Hapus" }[action];
	const node = renderer.root.findAllByType(Row).find((item) => item.props.title.startsWith(title));
	if (!node) throw Error(`Missing actual shared ${action} row`);
	return node.findByType("BouncyPressable").props.onPress;
}
async function action(name) { const press = row(name); await act(async () => press()); }
async function openDelete() { await select(); await action("delete"); }
const confirm = () => renderer.root.findByType(Delete).findAllByType("Button").find((node) => node.props.action === "negative").props.onPress;
async function begin() { const wait = deferred(); queue.push(wait.promise); await act(async () => { wait.submission = confirm()(); }); return wait; }
async function settle(wait, outcome = "success") { await act(async () => { wait.resolve(outcome); await wait.submission; }); }
async function closeSuccess() {
	// A failing baseline may never show the expected notice; preserve diagnostic checks.
	const node = renderer.root.findAllByType(Success)[0];
	const press = node?.findAllByType("Button")[0]?.props.onPress ?? node?.props.onClose;
	if (press) await act(async () => { press(); press(); });
}
const target = (spec, name, id = "A") => ({ action: "push", target: { target: `/manage/${spec.segment}/${name}`, params: { id } } });
(async () => {
	for (const spec of specs) {
		const test = (name, actual, expected) => check(`${spec.kind}: ${name}`, actual, expected);
		await mount(spec);
		test("initial sheet and confirmation closed", [sheetOpen(), visible(Delete)], [false, false]);
		await select();
		test("selection stops row propagation and opens actions", [stopPropagation, sheetOpen()], [1, true]);
		for (const [name, destination] of [["detail", "detail"], ["edit", "modify"]]) {
			await mount(spec); await select(); await action(name);
			test(`actual shared close->${name} row preserves navigation`, [sheetOpen(), navigations], [false, [target(spec, destination)]]);
		}
		await mount(spec); await select(); const twice = row("edit"); await act(async () => { twice(); twice(); });
		test("duplicate cached action navigates once", navigations, [target(spec, "modify")]);
		await mount(spec); await openDelete();
		test("actual shared close->delete row opens current confirmation", [sheetOpen(), visible(Delete), props(Delete)?.itemName], [false, true, "Fixture A"]);
		for (const nextId of ["A", "B"]) {
			await mount(spec); await select(); const old = { close: props(Sheet).onClose, detail: row("detail"), edit: row("edit"), deletion: row("delete") };
			await act(async () => old.close()); await select(nextId);
			await act(async () => { old.close(); old.deletion(); old.edit(); old.detail(); });
			test(`cancel->reopen ${nextId}: stale close leaves new sheet open`, sheetOpen(), true);
			test(`cancel->reopen ${nextId}: stale delete leaves confirmation closed`, visible(Delete), false);
			test(`cancel->reopen ${nextId}: stale detail/edit cannot navigate`, navigations, []);
			// Reopen explicitly if baseline callbacks closed its sheet, preserving the same scenario names.
			if (!sheetOpen()) await select(nextId);
			await action("edit");
			test(`cancel->reopen ${nextId}: fresh action remains usable`, navigations.at(-1), target(spec, "modify", nextId));
		}
		await mount(spec); await select();
		await change({ data: [{ ...record("A"), name: "Updated A", display_name: "Updated A" }, record("B")] });
		test("canonical rename refreshes sheet title without closing", [sheetOpen(), props(Sheet)?.title], [true, "Updated A"]);
		await action("delete");
		test("canonical rename refreshes delete target label", [visible(Delete), props(Delete)?.itemName], [true, "Updated A"]);
		await mount(spec); await select(); const removedCallbacks = { edit: row("edit"), deletion: row("delete"), close: props(Sheet).onClose };
		await change({ data: [record("B")] });
		test("successful query removal closes sheet and confirmation", [sheetOpen(), visible(Delete)], [false, false]);
		await act(async () => { removedCallbacks.close(); removedCallbacks.edit(); removedCallbacks.deletion(); });
		test("removed selection cached actions cannot navigate/delete", [navigations, visible(Delete)], [[], false]);
		await change({ data: [record("A"), record("B")] });
		test("removed item reappearance never revives old session", [sheetOpen(), visible(Delete)], [false, false]);
		await select(); await action("edit");
		test("reappeared item can start an explicit fresh session", navigations.at(-1), target(spec, "modify"));
		for (const flag of ["isLoading", "isError"]) {
			await mount(spec); await openDelete();
			await change({ data: [record("A"), record("B")], [flag]: true });
			test(`${flag} with cached canonical data retires confirmation`, [sheetOpen(), visible(Delete)], [false, false]);
			await change({ data: [record("A"), record("B")] });
			test(`${flag} recovery does not reopen old confirmation`, [sheetOpen(), visible(Delete)], [false, false]);
			await select(); await action("delete");
			test(`${flag} recovery permits explicit fresh deletion`, visible(Delete), true);
		}
		await mount(spec); await select(); await change({ data: [record("A"), record("B")], isFetching: true });
		test("background fetching retains canonical action session", sheetOpen(), true);
		await action("delete"); await change({ data: [{ ...record("A"), name: "Refetched A", display_name: "Refetched A" }, record("B")] });
		test("same-ID refetch retains confirmation and latest label", [visible(Delete), props(Delete)?.itemName], [true, "Refetched A"]);
		await mount(spec); await select(); await act(async () => renderer.root.findByType("SearchBar").props.setSearch("Fixture B"));
		test("search filters display only without invalidating selected full-query item", [renderer.root.findByType("FlatList").props.data.map((item) => item.id), sheetOpen()], [["B"], true]);
		await action("delete"); test("filtered-out canonical item still has correct explicit delete target", [visible(Delete), props(Delete)?.itemName], [true, "Fixture A"]);
		await mount(spec); await openDelete(); const removedPending = await begin();
		await change({ data: [record("B")] }); test("own pending DELETE query removal retires confirmation", visible(Delete), false);
		await settle(removedPending);
		test("own DELETE success remains visible after query removal", [visible(Success), visible(Alert), calls.map((item) => item.url)], [true, false, [spec.prefix + "A"]]);
		await closeSuccess(); test("own removed-item success acknowledgement stays closed without extra request", [visible(Success), calls.length, navigations], [false, 1, []]);
		await change({ data: [record("A"), record("B")] }); test("acknowledged deleted item reappearance does not reopen sheet/delete/success", [sheetOpen(), visible(Delete), visible(Success)], [false, false, false]);
		for (const nextId of ["A", "B"]) {
			for (const outcome of ["success", "network"]) {
				await mount(spec); await openDelete(); const oldConfirm = props(Delete).onConfirm, oldAcknowledge = props(Success).onClose; const pending = await begin(); await select(nextId);
				test(`${outcome}: pending A->fresh ${nextId} starts idle action session`, [sheetOpen(), visible(Delete), !!props(Delete)?.isLoading], [true, false, false]);
				await settle(pending, outcome); await act(async () => { await oldConfirm(); oldAcknowledge(); });
				test(`${outcome}: late A cannot affect fresh ${nextId} notices/actions`, [sheetOpen(), visible(Delete), ...notices(), calls.length, navigations], [true, false, false, false, 1, []]);
				if (!sheetOpen()) await select(nextId);
				await action("delete"); const fresh = await begin(); await settle(fresh);
				test(`${outcome}: fresh ${nextId} DELETE targets correct record and succeeds`, [calls.map((item) => item.url), visible(Success)], [[spec.prefix + "A", spec.prefix + nextId], true]);
				await closeSuccess(); test(`${outcome}: fresh ${nextId} success closes normally`, visible(Success), false);
			}
		}
		await mount(spec); await openDelete(); const failed = await begin(); await settle(failed, "network");
		test("normal DELETE failure keeps retryable confirmation and error", [visible(Delete), visible(Alert), visible(Success)], [true, true, false]);
		await act(async () => renderer.root.findByType(Alert).findByType("Button").props.onPress());
		const retried = await begin(); await settle(retried);
		test("normal failure can close error and retry successfully", [visible(Alert), visible(Success), calls.length], [false, true, 2]);
		await mount(spec); await openDelete(); const completed = await begin(); await settle(completed); const oldClose = props(Success).onClose; await select("B"); await act(async () => oldClose());
		test("completed A success does not transfer to B or disturb its sheet", [sheetOpen(), ...notices(), navigations], [true, false, false, []]);
		await mount(spec); await select(); const removedSheetActions = [props(Sheet).onClose, row("detail"), row("edit"), row("delete")]; await unmount(); await act(async () => removedSheetActions.forEach((callback) => callback()));
		test("unmounted sheet callbacks cannot navigate", navigations, []);
		await mount(spec); await openDelete(); const unmountedPending = await begin(); await unmount(); await settle(unmountedPending);
		test("pending DELETE after screen unmount cannot navigate or request again", [navigations, calls.length], [[], 1]);
		await unmount();
	}
	const sourceFiles = [...sources, ...(baseline ? [] : ["components/feature/manage/ManageListActions.tsx"])];
	const result = {
		owner: "Codex-3", ticket: "SD3-011", mode: baseline ? "baseline" : "current-source", passed: checks.filter((item) => item.passed).length, failed: checks.filter((item) => !item.passed).length,
		runtimeErrors, checks, sourceHashes: Object.fromEntries(sourceFiles.map((file) => [file, loadedHashes.get(file)])), productionModuleHashes: Object.fromEntries(loadedHashes), productionModules: loadedHashes.size,
		limits: "StrictMode production three List screens, final ManageListActions, actual ItemActionSheet rows, domain DeleteDialogs, shared modals, useAlertModal, refresh/helper/query-error modules, actual DELETE mutation hooks/factory/Common/QueryClient/Axios local adapter. GET query state, FlatList/card/buttons/native/icon/presentation/router are adapters. No browser/native/full route/root auth/Figma/backend/network certification; success acknowledgement is observed as modal closure, list has no onDeleted callback.",
	};
	fs.writeFileSync(output, JSON.stringify(result, null, 2) + "\n");
	console.log(JSON.stringify({ passed: result.passed, failed: result.failed, runtimeErrors: runtimeErrors.length, productionModules: loadedHashes.size }));
	process.exitCode = result.failed || runtimeErrors.length ? 1 : 0;
})().catch(async (error) => { console.error(error); await unmount(); process.exitCode = 2; });
