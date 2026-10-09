const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const Module = require("node:module");
const appRoot = path.resolve(__dirname, "../../../..");
const baseline = process.argv.includes("--baseline");
const ts = require(path.join(appRoot, "node_modules/typescript"));
const testRoot = path.join(appRoot, ".expo/senior7-test-tools/node_modules");
const React = require(path.join(testRoot, "react"));
const TestRenderer = require(path.join(testRoot, "react-test-renderer"));
global.IS_REACT_ACT_ENVIRONMENT = true;
const hash = (bytes) => crypto.createHash("sha256").update(bytes).digest("hex");
const captured = JSON.parse(fs.readFileSync(path.join(__dirname, "baseline-capture.json"), "utf8"));
const definitions = [
	{ domain: "role", name: "Role", file: "components/feature/manage/roles/RoleDetailScreen.tsx", prop: "role", route: "/manage/roles/modify" },
	{ domain: "worker", name: "Worker", file: "components/feature/manage/workers/WorkerDetailScreen.tsx", prop: "worker", route: "/manage/workers/modify" },
	{ domain: "member", name: "Member", file: "components/feature/manage/member/MemberDetailScreen.tsx", prop: "member", route: "/manage/member/modify" },
];
const checks = [];
const runtimeErrors = [];
const warnings = [];
const consoleError = console.error;
const consoleWarn = console.warn;
console.error = (...args) => {
	const message = args.map(String).join(" ");
	if (!message.includes("react-test-renderer is deprecated")) runtimeErrors.push(message);
};
console.warn = (...args) => warnings.push(args.map(String).join(" "));
const state = { fixture: {}, navigations: [], retries: [], back: 0 };
const modules = new Map();
const loadedSources = {};
function host(name) {
	return function Host(props) { return React.createElement(name, props, props.children); };
}
const moduleDefault = (component) => ({ __esModule: true, default: component });
const query = (domain, id) => {
	const fixture = state.fixture[`${domain}:${id}`] ?? {};
	return {
		data: fixture.data,
		isLoading: fixture.phase === "loading",
		isError: fixture.phase === "error",
		refetch: () => { state.retries.push({ domain, id }); return Promise.resolve(); },
	};
};
function resolveApp(request, parent) {
	const base = request.startsWith("@/") ? path.join(appRoot, request.slice(2)) : path.resolve(path.dirname(parent), request);
	for (const candidate of [base, `${base}.tsx`, `${base}.ts`, `${base}.js`, path.join(base, "index.ts"), path.join(base, "index.tsx")]) {
		if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
	}
	throw new Error(`Could not resolve ${request} from ${parent}`);
}
function requireFor(request, parent) {
	if (request === "react") return React;
	if (request === "react/jsx-runtime") return require(path.join(testRoot, "react/jsx-runtime"));
	if (request === "react/jsx-dev-runtime") return require(path.join(testRoot, "react/jsx-dev-runtime"));
	if (request === "react-native") return { View: host("View"), Image: host("Image"), Platform: { OS: "web" } };
	if (request === "expo-router") return { router: { push: (value) => state.navigations.push(value), back: () => state.back++ } };
	if (request === "@/api/hooks/roles") return { useRoleQuery: (id) => query("role", id), useRolePermissionsQuery: () => ({ data: {} }) };
	if (request === "@/api/hooks/workers") return { useWorkerQuery: (id) => query("worker", id) };
	if (request === "@/api/hooks/customers") return { useCustomerQuery: (id) => query("member", id) };
	if (request === "@/components/common/AlertModal") return { useAlertModal: load(path.join(appRoot, "hooks/useAlertModal.ts")).useAlertModal };
	if (request === "@/components/common/DataPlaceholder") return { LoadingPlaceholder: host("LoadingPlaceholder") };
	if (request === "@/components/custom/JSStack") return { delayedBack: () => state.back++ };
	if (request === "@/components/icons") return { EFeather: host("EFeather") };
	if (request === "@/lib/utils") return { route: (pathname, params) => ({ pathname, params }) };
	if (request.endsWith("DeleteDialog")) return moduleDefault(host("DeleteDialog"));
	if (request.endsWith("QueryError")) return moduleDefault(host("QueryError"));
	if (request.endsWith("RoleWorkers")) return moduleDefault(host("RoleWorkers"));
	if (request.endsWith("WorkerAvatar")) return moduleDefault(host("WorkerAvatar"));
	if (request.endsWith("MemberIcon")) return moduleDefault(host("MemberIcon"));
	for (const name of ["Card", "SearchBar", "Text", "Wrapper", "DetailBottomActions", "DetailRow"]) {
		if (request === `@/components/common/${name}` || request === `@/components/custom/${name}`) return moduleDefault(host(name));
	}
	if (request.startsWith("@/") || request.startsWith(".")) return load(resolveApp(request, parent));
	throw new Error(`Unapproved runtime module ${request}`);
}
function load(filename) {
	if (modules.has(filename)) return modules.get(filename).exports;
	const relative = path.relative(appRoot, filename).replaceAll("\\", "/");
	const input = baseline && definitions.some((item) => item.file === relative) ? path.join(__dirname, "before", path.basename(filename)) : filename;
	const source = fs.readFileSync(input, "utf8");
	loadedSources[relative] = hash(Buffer.from(source));
	const transformed = ts.transpileModule(source, { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true }, fileName: filename });
	const module = new Module(filename);
	module.filename = filename;
	module.paths = Module._nodeModulePaths(path.dirname(filename));
	module.require = (request) => requireFor(request, filename);
	modules.set(filename, module);
	module._compile(transformed.outputText, filename);
	return module.exports;
}
function expect(name, actual, expected) {
	checks.push({ name, pass: Object.is(actual, expected), actual, expected });
}
function entity(domain, id) {
	if (domain === "role") return { id, name: `Role ${id}`, display_name: `Role ${id}`, permissions: ["cashier", "dashboard"] };
	if (domain === "worker") return { id, name: `Worker ${id}`, email: `${id}@example.test`, phone: "0800000000", roles: [], assigned_store: null, worker_profile: null };
	return { id, name: `Member ${id}`, phone: "0800000000", gender: null, notes: `Notes ${id}` };
}
function single(root, name) { return root.root.findByType(name); }
function count(root, name) { return root.root.findAllByType(name).length; }
async function mutate(fn) { await TestRenderer.act(fn); }
async function caseFor(definition, strict) {
	const { domain, name, file, prop, route } = definition;
	const label = `${name}/${strict ? "StrictMode" : "normal"}`;
	state.fixture = {};
	state.fixture[`${domain}:A`] = { data: entity(domain, "A") };
	state.fixture[`${domain}:B`] = { phase: "loading" };
	state.navigations = [];
	state.retries = [];
	state.back = 0;
	const Component = load(path.join(appRoot, file)).default;
	const render = (id) => strict ? React.createElement(React.StrictMode, null, React.createElement(Component, { id })) : React.createElement(Component, { id });
	let root;
	await mutate(() => { root = TestRenderer.create(render("A")); });
	expect(`${label}: starts closed`, single(root, "DeleteDialog").props.openState[0], false);
	expect(`${label}: target A`, single(root, "DeleteDialog").props[prop]?.id, "A");
	const staleOpenA = single(root, "DetailBottomActions").props.onDelete;
	const staleSetterA = single(root, "DeleteDialog").props.openState[1];
	const staleSearchA = domain === "role" ? single(root, "SearchBar").props.setSearch : undefined;
	await mutate(() => { staleOpenA(); if (staleSearchA) staleSearchA("Kasir"); });
	expect(`${label}: explicit open A`, single(root, "DeleteDialog").props.openState[0], true);
	state.fixture[`${domain}:A`] = { data: { ...entity(domain, "A"), name: "Fresh A" } };
	await mutate(() => root.update(render("A")));
	expect(`${label}: same-id refetch keeps confirmation`, single(root, "DeleteDialog").props.openState[0], true);
	if (domain === "role") expect(`${label}: same-id refetch keeps permission search`, single(root, "SearchBar").props.search, "Kasir");
	await mutate(() => root.update(render("B")));
	expect(`${label}: B loading shown`, count(root, "LoadingPlaceholder"), 1);
	expect(`${label}: B loading has no actions`, count(root, "DetailBottomActions"), 0);
	expect(`${label}: B loading starts closed`, single(root, "DeleteDialog").props.openState[0], false);
	await mutate(() => staleOpenA());
	expect(`${label}: stale A open cannot open B`, single(root, "DeleteDialog").props.openState[0], false);
	state.fixture[`${domain}:B`] = { data: entity(domain, "B") };
	await mutate(() => root.update(render("B")));
	expect(`${label}: loaded B requires new confirmation`, single(root, "DeleteDialog").props.openState[0], false);
	expect(`${label}: loaded target is B`, single(root, "DeleteDialog").props[prop]?.id, "B");
	if (domain === "role") {
		expect(`${label}: B starts with empty search`, single(root, "SearchBar").props.search, "");
		await mutate(() => staleSearchA("stale A"));
		expect(`${label}: stale A search cannot write B`, single(root, "SearchBar").props.search, "");
	}
	await mutate(() => single(root, "DetailBottomActions").props.onEdit());
	expect(`${label}: edit route current B`, state.navigations.at(-1).pathname, route);
	expect(`${label}: edit id current B`, state.navigations.at(-1).params.id, "B");
	await mutate(() => single(root, "DetailBottomActions").props.onDelete());
	expect(`${label}: explicit B confirmation opens`, single(root, "DeleteDialog").props.openState[0], true);
	await mutate(() => staleSetterA(false));
	expect(`${label}: stale A close cannot close B`, single(root, "DeleteDialog").props.openState[0], true);
	await mutate(() => single(root, "DeleteDialog").props.openState[1](false));
	expect(`${label}: current B close works`, single(root, "DeleteDialog").props.openState[0], false);
	await mutate(() => single(root, "DetailBottomActions").props.onDelete());
	state.fixture[`${domain}:B`] = { data: entity(domain, "B"), phase: "error" };
	await mutate(() => root.update(render("B")));
	expect(`${label}: same-id error UI shown`, count(root, "QueryError"), 1);
	expect(`${label}: error hides detail actions`, count(root, "DetailBottomActions"), 0);
	expect(`${label}: same-id error keeps local confirmation`, single(root, "DeleteDialog").props.openState[0], true);
	await mutate(() => single(root, "QueryError").props.onRetry());
	expect(`${label}: retry retains current id`, state.retries.at(-1).id, "B");
	await mutate(() => root.update(render(undefined)));
	expect(`${label}: missing id shows error`, count(root, "QueryError"), 1);
	expect(`${label}: missing id has no actions`, count(root, "DetailBottomActions"), 0);
	expect(`${label}: missing id closes previous confirmation`, single(root, "DeleteDialog").props.openState[0], false);
	expect(`${label}: missing id has null target`, single(root, "DeleteDialog").props[prop], null);
	await mutate(() => single(root, "QueryError").props.onRetry());
	expect(`${label}: missing id retry is back`, state.back, 1);
	await mutate(() => root.update(render("")));
	expect(`${label}: empty id shows error`, count(root, "QueryError"), 1);
	await mutate(() => root.unmount());
	await mutate(() => { staleOpenA(); staleSetterA(false); if (staleSearchA) staleSearchA("after unmount"); });
}
function parse(file, text) { return ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX); }
const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
function printed(node, source) { return printer.printNode(ts.EmitHint.Unspecified, node, source).trim(); }
function staticReview(definition) {
	const beforeText = fs.readFileSync(path.join(__dirname, "before", path.basename(definition.file)), "utf8");
	const afterText = fs.readFileSync(path.join(appRoot, definition.file), "utf8");
	const before = parse(definition.file, beforeText);
	const after = parse(definition.file, afterText);
	const oldFn = before.statements.find(ts.isFunctionDeclaration);
	const allFn = after.statements.filter(ts.isFunctionDeclaration);
	const wrapper = allFn.find((node) => node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.DefaultKeyword));
	const inner = allFn.find((node) => node.name?.text === `${definition.name}DetailContent`);
	expect(`${definition.name}/AST: content exists`, Boolean(inner), true);
	if (!inner || !wrapper) return;
	expect(`${definition.name}/AST: content body identical`, printed(inner.body, after), printed(oldFn.body, before));
	expect(`${definition.name}/AST: same public parameter`, printed(wrapper.parameters[0], after), printed(oldFn.parameters[0], before));
	expect(`${definition.name}/AST: same content parameter`, printed(inner.parameters[0], after), printed(oldFn.parameters[0], before));
	expect(`${definition.name}/AST: old imports/statements unchanged`, before.statements.filter((node) => !ts.isFunctionDeclaration(node)).map((node) => printed(node, before)).join("\n"), after.statements.filter((node) => !ts.isFunctionDeclaration(node)).map((node) => printed(node, after)).join("\n"));
	const statement = wrapper.body?.statements[0];
	const expression = statement && ts.isReturnStatement(statement) ? statement.expression : undefined;
	expect(`${definition.name}/AST: wrapper has one return`, wrapper.body?.statements.length, 1);
	expect(`${definition.name}/AST: keyed wrapper only`, expression ? printed(expression, after).replace(/\s+/g, "") : null, `<${definition.name}DetailContentkey={id??""}id={id}/>`);
}
(async () => {
	for (const definition of definitions) for (const strict of [false, true]) await caseFor(definition, strict);
	if (!baseline) {
		for (const definition of definitions) staticReview(definition);
		for (const [file, expected] of Object.entries(captured.contractHashes)) expect(`Contract stable: ${file}`, hash(fs.readFileSync(path.join(appRoot, file))), expected);
	}
	console.error = consoleError;
	console.warn = consoleWarn;
	const result = {
		status: baseline ? "BASELINE_REPRODUCTION" : "INTERNAL_QA_REVIEW",
		externalQcApproval: false,
		baseline,
		finishedAt: new Date().toISOString(),
		summary: { assertions: checks.length, passed: checks.filter((item) => item.pass).length, failed: checks.filter((item) => !item.pass).length, runtimeErrors: runtimeErrors.length, warnings: warnings.length },
		loadedSourceHashes: loadedSources,
		checks, runtimeErrors, warnings,
		adapters: "Production detail body, production useAlertModal and production domain display helpers; query fixtures, child delete dialog and presentation/router hosts. Parent identity state assessed through actual callbacks and React state under normal/StrictMode. Delete IO and native geometry not exercised.",
	};
	const target = path.join(__dirname, baseline ? "baseline-results.json" : "results.json");
	if (fs.existsSync(target)) throw new Error(`Frozen result exists: ${target}`);
	fs.writeFileSync(target, JSON.stringify(result, null, 2) + "\n");
	process.stdout.write(JSON.stringify(result.summary) + "\n");
	for (const item of checks.filter((item) => !item.pass)) process.stdout.write(JSON.stringify(item) + "\n");
	if (!baseline && (result.summary.failed || runtimeErrors.length || warnings.length)) process.exitCode = 1;
})().catch((error) => { console.error = consoleError; console.error(error); process.exitCode = 1; });
