const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const Module = require("node:module");
const appRoot = path.resolve(__dirname, "../../../..");
const appRequire = Module.createRequire(path.join(appRoot, "package.json"));
const ts = appRequire("typescript");
const testRoot = path.join(appRoot, ".expo/senior7-test-tools/node_modules");
const React = require(path.join(testRoot, "react"));
require.cache[appRequire.resolve("react")] = { exports: React };
const Renderer = require(path.join(testRoot, "react-test-renderer"));
const { QueryClient, QueryClientProvider } = appRequire("@tanstack/react-query");
const axiosPackage = appRequire("axios");
global.IS_REACT_ACT_ENVIRONMENT = true;
const baseline = process.argv.includes("--baseline");
const captured = JSON.parse(fs.readFileSync(path.join(__dirname, "baseline-capture.json"), "utf8"));
const definitions = [
	{ name: "Role", domain: "role", file: "components/feature/manage/roles/RoleListScreen.tsx", path: "/manage/roles/", api: "/contents/roles/", listKey: "roles" },
	{ name: "Worker", domain: "worker", file: "components/feature/manage/workers/WorkerListScreen.tsx", path: "/manage/workers/", api: "/contents/workers/", listKey: "workers" },
	{ name: "Member", domain: "member", file: "components/feature/manage/member/MemberListScreen.tsx", path: "/manage/member/", api: "/customers/data/", listKey: "customers" },
];
const hashes = {}, modules = new Map(), checks = [], runtimeErrors = [], warnings = [];
const oldError = console.error, oldWarn = console.warn;
console.error = (...args) => { const text = args.map(String).join(" "); if (!text.includes("react-test-renderer is deprecated")) runtimeErrors.push(text); };
console.warn = (...args) => warnings.push(args.map(String).join(" "));
const hash = (bytes) => crypto.createHash("sha256").update(bytes).digest("hex");
let renderer, client, current, queue = [], calls = [], invalidations = [], navigate = [], autoRemove = false;
const state = { data: [], phase: "success" };
const host = (name) => function Host(props) { return React.createElement(name, props, props.children); };
const def = (component) => ({ __esModule: true, default: component });
const Modal = ({ isOpen, children, ...props }) => React.createElement("Modal", { isOpen, ...props }, isOpen ? children : null);
function flat(props) { return React.createElement("FlatList", props, props.data.length ? props.data.map((item) => React.createElement(React.Fragment, { key: item.id }, props.renderItem({ item }))) : props.ListEmptyComponent); }
const fixtureAxios = axiosPackage.create({ baseURL: "https://fixture.invalid", adapter: async (config) => {
	if (config.method !== "delete") throw new Error(`Only DELETE fixture is allowed: ${config.method}`);
	calls.push({ method: config.method, url: config.url });
	const outcome = await (queue.shift() ?? Promise.resolve("success"));
	if (outcome === "network") throw new axiosPackage.AxiosError("Network Error", "ERR_NETWORK", config);
	return { data: { success: outcome === "success", data: null, message: "Fixture result" }, status: 200, statusText: "OK", headers: {}, config };
} });
function resolve(request, parent) {
	const root = request.startsWith("@/") ? path.join(appRoot, request.slice(2)) : path.resolve(path.dirname(parent), request);
	for (const file of [root, `${root}.tsx`, `${root}.ts`, path.join(root, "index.ts"), path.join(root, "index.tsx")]) if (fs.existsSync(file) && fs.statSync(file).isFile()) return file;
	throw new Error(`Missing ${request}`);
}
function query() { return { data: state.data, isLoading: state.phase === "loading", isError: state.phase === "error", isSuccess: state.phase === "success", refetch: () => Promise.resolve() }; }
function requireFor(request, parent) {
	if (request === "react") return React;
	if (request === "react/jsx-runtime") return require(path.join(testRoot, "react/jsx-runtime"));
	if (request === "react-native") return { View: host("View"), Image: host("Image"), Pressable: host("Pressable"), FlatList: flat, RefreshControl: host("RefreshControl"), Switch: host("Switch"), Platform: { OS: "web" }, useWindowDimensions: () => ({ width: 360, height: 800 }) };
	if (request === "expo-router") return { router: { push: (value) => navigate.push(value) } };
	if (request.startsWith("@/api/hooks/")) {
		const production = load(resolve(request, parent));
		return { ...production, useRolesQuery: () => query(), useWorkersQuery: () => query(), useCustomersQuery: () => query() };
	}
	if (request === "@/components/common/DataPlaceholder") return { LoadingPlaceholder: host("LoadingPlaceholder"), SearchNotFound: host("SearchNotFound") };
	if (request === "@/components/icons") return { EFeather: host("EFeather") };
	if (request === "@expo/vector-icons/Feather") return def(host("Feather"));
	if (request === "@/constants/Colors") return { Colors: { primary: "#ff0000", zinc: { 400: "#444444" }, red: { 500: "#ee0000" } } };
	if (request === "@/lib/utils") return { route: (pathname, params) => ({ pathname, params }), cn: (...parts) => parts.filter(Boolean).join(" ") };
	if (request === "@/assets/images/illustrations") return { ILLUSTRATIONS: { deleteConfirmation: "fixture-delete", actionSuccess: "fixture-success" } };
	if (request === "@/components/ui/modal") return { Modal, ...Object.fromEntries(["ModalBackdrop", "ModalBody", "ModalContent", "ModalFooter", "ModalHeader"].map((name) => [name, host(name)])) };
	if (request === "@/components/ui/button" || request === "../ui/button") return Object.fromEntries(["Button", "ButtonGroup", "ButtonText"].map((name) => [name, name]));
	if (request === "@/components/ui/actionsheet") return Object.fromEntries(["Actionsheet", "ActionsheetBackdrop", "ActionsheetContent", "ActionsheetDragIndicator", "ActionsheetDragIndicatorWrapper"].map((name) => [name, host(name)]));
	if (request.endsWith("QueryError")) return def(host("QueryError"));
	if (request.endsWith("WorkerAvatar")) return def(host("WorkerAvatar"));
	if (request.endsWith("MemberIcon")) return def(host("MemberIcon"));
	for (const name of ["Text", "SearchBar", "Wrapper", "BottomActionButton", "BouncyPressable", "CatalogItemCard"]) if (request === `@/components/common/${name}` || request === `@/components/custom/${name}`) return def(host(name));
	if (request === "./axios" && parent.endsWith(path.join("api", "common.ts"))) return { axios: fixtureAxios };
	if (request.startsWith("@/") || request.startsWith(".")) return load(resolve(request, parent));
	return appRequire(request);
}
function load(file) {
	if (modules.has(file)) return modules.get(file).exports;
	const relative = path.relative(appRoot, file).replaceAll("\\", "/");
	const input = baseline && definitions.some((definition) => definition.file === relative) ? path.join(__dirname, "before", path.basename(file)) : file;
	const bytes = fs.readFileSync(input);
	hashes[relative] = hash(bytes);
	const javascript = ts.transpileModule(bytes.toString("utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022, esModuleInterop: true }, fileName: file }).outputText;
	const module = new Module(file);
	module.filename = file;
	module.paths = Module._nodeModulePaths(path.dirname(file));
	module.require = (request) => requireFor(request, file);
	modules.set(file, module);
	module._compile(javascript, file);
	return module.exports;
}
const Sheet = load(path.join(appRoot, "components/custom/ItemActionSheet.tsx"));
const Delete = load(path.join(appRoot, "components/common/DeleteConfirmModal.tsx")).default;
const Success = load(path.join(appRoot, "components/common/SuccessModal.tsx")).default;
const Alert = load(path.join(appRoot, "components/common/AlertModal.tsx")).default;
function entity(domain, id, changed = false) {
	const name = `${domain} ${id}${changed ? " UPDATED" : ""}`;
	if (domain === "role") return { id, name, display_name: name, permissions: ["cashier"] };
	if (domain === "worker") return { id, name, email: `${id}@example.test`, phone: "0800000000", roles: [], worker_profile: null, assigned_store: null };
	return { id, name, email: `${id}@example.test`, phone: "0800000000" };
}
function check(name, actual, expected) { checks.push({ name, pass: JSON.stringify(actual) === JSON.stringify(expected), actual, expected }); }
async function act(fn) { await Renderer.act(fn); }
function element() { const Component = load(path.join(appRoot, current.file)).default; const body = React.createElement(QueryClientProvider, { client }, React.createElement(Component)); return current.strict ? React.createElement(React.StrictMode, null, body) : body; }
async function unmount() { if (renderer) await act(() => renderer.unmount()); renderer = undefined; client?.clear(); }
async function mount(definition, strict) {
	await unmount(); current = { ...definition, strict }; queue = []; calls = []; invalidations = []; navigate = []; autoRemove = false;
	state.data = [entity(definition.domain, "A"), entity(definition.domain, "B")]; state.phase = "success";
	client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { retry: false } } });
	client.setQueryData([definition.listKey], state.data);
	const invalidate = client.invalidateQueries.bind(client);
	client.invalidateQueries = (options) => {
		invalidations.push(options.queryKey);
		if (autoRemove && options.queryKey.length === 1 && options.queryKey[0] === definition.listKey) { state.data = state.data.filter((item) => item.id !== "A"); renderer.update(element()); }
		return invalidate(options);
	};
	await act(() => { renderer = Renderer.create(element()); });
}
async function refresh(data, phase = "success") { state.data = data; state.phase = phase; await act(() => renderer.update(element())); }
function select(id) {
	const row = renderer.root.findAllByType("CatalogItemCard").find((item) => item.props.right.props.accessibilityLabel.endsWith(` ${id}`));
	if (!row) throw new Error(`No row ${id}`);
	row.props.right.props.onPress({ stopPropagation() {} });
}
function sheet() { return renderer.root.findAllByType(Sheet.default)[0]; }
function sheetOpen() { return Boolean(sheet()?.props.isOpen); }
function sheetTitle() { return sheet()?.props.title; }
function action(title) { const row = renderer.root.findAllByType(Sheet.ItemActionSheetRow).find((item) => item.props.title.startsWith(title)); if (!row) throw new Error(`No action ${title}`); return row.props.onPress; }
function visible(component) { return Boolean(renderer.root.findAllByType(component)[0]?.props.openState[0]); }
function props(component) { return renderer.root.findByType(component).props; }
const deferred = () => { let resolve; const promise = new Promise((accept) => { resolve = accept; }); return { promise, resolve }; };
async function begin() { const wait = deferred(); queue.push(wait.promise); let submission; const button = renderer.root.findByType(Delete).findAllByType("Button").find((item) => item.props.action === "negative"); if (!button) throw new Error("No visible production confirmation button"); await act(() => { submission = button.props.onPress(); }); return { ...wait, submission }; }
async function settle(wait, outcome = "success") { await act(async () => { wait.resolve(outcome); await wait.submission; }); }
async function closeSuccess() { const button = renderer.root.findByType(Success).findByType("Button"); await act(() => button.props.onPress()); }
async function cases(definition, strict) {
	const label = `${definition.name}/${strict ? "StrictMode" : "normal"}`;
	const assert = (name, actual, expected) => check(`${label}: ${name}`, actual, expected);
	await mount(definition, strict); await act(() => select("A"));
	const edit = action("Edit"); await act(() => edit());
	assert("normal shared close->edit navigates current id", navigate, [{ pathname: definition.path + "modify", params: { id: "A" } }]);
	assert("normal edit closes actions", sheetOpen(), false);
	await act(() => edit()); assert("cached consumed edit cannot navigate twice", navigate.length, 1);
	await mount(definition, strict); await act(() => select("A"));
	const detail = action("Detail"); await act(() => detail());
	assert("normal shared close->detail navigates current id", navigate, [{ pathname: definition.path + "detail", params: { id: "A" } }]);
	await mount(definition, strict); await act(() => select("A"));
	const oldDelete = action("Hapus"), oldEdit = action("Edit"), oldClose = sheet().props.onClose;
	await act(() => oldClose()); await act(() => select("B"));
	assert("new B sheet is open", sheetOpen(), true);
	await act(() => { oldClose(); oldDelete(); oldEdit(); });
	assert("old A cannot close B actions", sheetOpen(), true);
	assert("old A cannot open B confirmation", visible(Delete), false);
	assert("old A cannot navigate after B opens", navigate.length, 0);
	await mount(definition, strict); await act(() => select("A"));
	const previousADelete = action("Hapus"), previousAClose = sheet().props.onClose;
	await act(() => previousAClose()); await act(() => select("A"));
	await act(() => { previousAClose(); previousADelete(); });
	assert("same-A explicit reopen has fresh action lifetime", [sheetOpen(), visible(Delete)], [true, false]);
	await mount(definition, strict); await act(() => select("A"));
	const retainedRemoveAction = action("Hapus");
	await refresh([entity(definition.domain, "A", true), entity(definition.domain, "B")]);
	assert("same-ID rename updates sheet title", sheetTitle(), `${definition.domain} A UPDATED`);
	assert("same-ID rename updates confirmation target label", props(Delete).itemName, `${definition.domain} A UPDATED`);
	await refresh([entity(definition.domain, "B")]);
	assert("successful query removal closes actions", sheetOpen(), false);
	await act(() => retainedRemoveAction()); assert("removed A cached action cannot open confirmation", visible(Delete), false);
	await refresh([entity(definition.domain, "A"), entity(definition.domain, "B")]);
	assert("reappearance does not reopen old actions/confirmation", [sheetOpen(), visible(Delete)], [false, false]);
	await act(() => select("A")); assert("explicit reselect after reappearance works", sheetOpen(), true);
	await mount(definition, strict); await act(() => select("A")); await act(() => action("Hapus")());
	assert("normal shared close->delete opens confirmation", [sheetOpen(), visible(Delete)], [false, true]);
	const cachedConfirm = props(Delete).onConfirm;
	await refresh([entity(definition.domain, "B")]); await act(() => cachedConfirm());
	assert("removal closes confirmation and cached confirm sends nothing", [visible(Delete), calls.length], [false, 0]);
	await refresh([entity(definition.domain, "A"), entity(definition.domain, "B")]);
	assert("reappearance does not reopen confirmation", visible(Delete), false);
	await mount(definition, strict); await act(() => select("A")); await act(() => action("Hapus")());
	const busy = deferred(); queue.push(busy.promise); const confirm = props(Delete).onConfirm; let first, second;
	await act(() => { first = confirm(); second = confirm(); });
	assert("double confirm issues one actual DELETE", calls, [{ method: "delete", url: definition.api + "A" }]);
	assert("busy production modal marked loading", props(Delete).isLoading, true);
	autoRemove = true;
	await act(async () => { busy.resolve("success"); await Promise.all([first, second]); });
	assert("own invalidation removes A in query fixture", state.data.map((item) => item.id), ["B"]);
	assert("own invalidation retains success until acknowledgement", [visible(Success), visible(Delete), visible(Alert)], [true, false, false]);
	assert("actual query cache invalidated", client.getQueryState([definition.listKey]).isInvalidated, true);
	const cachedSuccessClose = props(Success).onClose; await closeSuccess(); await act(() => cachedSuccessClose());
	assert("own success acknowledgement closes without navigation", [visible(Success), navigate.length], [false, 0]);
	await mount(definition, strict); await act(() => select("A")); await act(() => action("Hapus")());
	const wait = await begin(); await refresh([entity(definition.domain, "B")]); await settle(wait);
	assert("pending A can complete and report success after query removal", [visible(Success), visible(Delete), calls.length], [true, false, 1]);
	await closeSuccess();
	for (const outcome of ["success", "network"]) {
		await mount(definition, strict); await act(() => select("A")); await act(() => action("Hapus")());
		const wait = await begin(), oldConfirm = props(Delete).onConfirm;
		await act(() => select("B"));
		await act(() => oldConfirm()); await settle(wait, outcome);
		assert(`${outcome} A callback/result does not affect B generation`, [sheetOpen(), visible(Delete), visible(Success), visible(Alert), calls.length, navigate.length], [true, false, false, false, 1, 0]);
	}
	await mount(definition, strict); await act(() => select("A")); await act(() => action("Hapus")());
	const failed = await begin(); await settle(failed, "network");
	assert("current failure opens production error/keeps confirmation", [visible(Alert), visible(Delete), visible(Success)], [true, true, false]);
	const errorButton = renderer.root.findByType(Alert).findAllByType("Button")[0]; await act(() => errorButton.props.onPress());
	const retry = await begin(); await settle(retry);
	assert("current error retry succeeds with actual two calls", [calls.length, visible(Success), visible(Alert)], [2, true, false]);
	await mount(definition, strict); await act(() => select("A"));
	const afterUnmountDelete = action("Hapus"), afterUnmountClose = sheet().props.onClose, afterUnmountEdit = action("Edit");
	await unmount(); await act(() => { afterUnmountDelete(); afterUnmountClose(); afterUnmountEdit(); });
	assert("unmounted action session sends/navigates nothing", [calls.length, navigate.length], [0, 0]);
}
(async () => {
	for (const definition of definitions) for (const strict of [false, true]) await cases(definition, strict);
	await unmount();
	if (!baseline) for (const [file, expected] of Object.entries(captured.contractHashes)) check(`Unchanged production contract: ${file}`, hash(fs.readFileSync(path.join(appRoot, file))), expected);
	console.error = oldError; console.warn = oldWarn;
	const result = {
		status: baseline ? "BASELINE_REPRODUCTION" : "INTERNAL_QA_REVIEW",
		externalQcApproval: false,
		finishedAt: new Date().toISOString(), baseline,
		summary: { assertions: checks.length, passed: checks.filter((item) => item.pass).length, failed: checks.filter((item) => !item.pass).length, runtimeErrors: runtimeErrors.length, warnings: warnings.length },
		loadedSourceHashes: hashes,
		checks, runtimeErrors, warnings,
		adapters: "Production three List/new helper/ItemActionSheet/three DeleteDialog/three shared modals/useAlertModal/useRefreshControl/usePostRequest/API hooks/factory/Common/error mapper/display helpers with actual QueryClient/Axios. GET list hooks use query data adapter; Axios transport uses deferred memory outcomes; API client auth/interceptors excluded. Presentation/native/Colors/router adapters; no real HTTP/browser/native/full navigator.",
	};
	const target = path.join(__dirname, baseline ? "baseline-results.json" : "results.json"); if (fs.existsSync(target)) throw new Error("Frozen result exists.");
	fs.writeFileSync(target, JSON.stringify(result, null, 2) + "\n");
	process.stdout.write(JSON.stringify(result.summary) + "\n"); for (const item of checks.filter((item) => !item.pass)) process.stdout.write(JSON.stringify(item) + "\n");
	if (!baseline && (result.summary.failed || runtimeErrors.length || warnings.length)) process.exitCode = 1;
})().catch((error) => { console.error = oldError; console.error(error); process.exitCode = 1; });
