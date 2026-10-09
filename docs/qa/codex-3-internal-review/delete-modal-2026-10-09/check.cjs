const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const crypto = require("node:crypto");

const appRoot = path.resolve(__dirname, "../../../..");
const ts = require(path.join(appRoot, "node_modules/typescript"));
const React = require(path.join(appRoot, ".expo/senior7-test-tools/node_modules/react"));
const { act, create } = require(path.join(appRoot, ".expo/senior7-test-tools/node_modules/react-test-renderer"));
global.IS_REACT_ACT_ENVIRONMENT = true;
const target = "components/common/DeleteConfirmModal.tsx";
const expectedFinal = "dabc8e26e3aa79ded2127a36d2a6ee33cc6b020bdf7fff76afe93c29ad9a2818";
const hash = (bytes) => crypto.createHash("sha256").update(bytes).digest("hex");
const read = (relative) => fs.readFileSync(path.join(appRoot, relative), "utf8");
const source = read(target);
const before = fs.readFileSync(path.join(__dirname, "DeleteConfirmModal.before.tsx.txt"), "utf8");
const checks = [];
const errors = [];
const warnings = [];
const originalError = console.error;
console.error = (...args) => {
	const text = args.map(String).join(" ");
	if (text.includes("react-test-renderer is deprecated")) return;
	errors.push(text);
	originalError(...args);
};
const originalWarn = console.warn;
console.warn = (...args) => { warnings.push(args.map(String).join(" ")); originalWarn(...args); };
function check(name, actual, expected) {
	checks.push({ name, passed: JSON.stringify(actual) === JSON.stringify(expected), actual, expected });
}
check("Final source matches hash supplied by parent", hash(source), expectedFinal);
if (hash(source) !== expectedFinal) throw new Error("Source changed before independent final review");

const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
const canonical = (text) => printer.printFile(ts.createSourceFile("component.tsx", text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX));
function replaceExactlyOnce(text, search, replacement, name) {
	const matches = text.match(search) ?? [];
	check(name, matches.length, 1);
	return text.replace(search, replacement);
}
let normalizedBefore = replaceExactlyOnce(before, /\tDimensions,\r?\n/g, "", "Baseline has one Dimensions import");
let normalizedFinal = replaceExactlyOnce(source, /\tuseWindowDimensions,\r?\n/g, "", "Final has one useWindowDimensions import");
normalizedFinal = replaceExactlyOnce(normalizedFinal, /\tconst \{ width \} = useWindowDimensions\(\);\r?\n/g, "", "Final has exactly one window hook declaration");
normalizedFinal = replaceExactlyOnce(normalizedFinal, /style=\{\{ width: width - 32, maxWidth: 380 \}\}/g, 'style={{ width: Dimensions.get("screen").width - 32, maxWidth: 380 }}', "Final retains width minus32 and maximum380");
normalizedFinal = replaceExactlyOnce(normalizedFinal, /\t+style=\{\{ height: 176, width: "100%" \}\}\r?\n/g, "", "Final adds exactly one explicit Image sizing prop");
check("After reversing four geometry deltas, entire source AST remains identical", canonical(normalizedFinal), canonical(normalizedBefore));

let dimensions = { width: 320, height: 640, scale: 1, fontScale: 1 };
const dimensionListeners = new Set();
const dimensionSubscribe = (listener) => { dimensionListeners.add(listener); return () => dimensionListeners.delete(listener); };
const windowFixtureHook = () => React.useSyncExternalStore(dimensionSubscribe, () => dimensions, () => dimensions);
const native = { Image: "Image", View: "View", useWindowDimensions: windowFixtureHook, Dimensions: { get: () => { throw new Error("Final component must not read screen dimensions"); } } };
const Modal = ({ isOpen, children, ...props }) => React.createElement("Modal", { ...props, isOpen }, isOpen ? children : null);
const presentation = (names) => Object.fromEntries(names.map((name) => [name, name]));
const loaded = new Map();
function load(relative) {
	if (loaded.has(relative)) return loaded.get(relative);
	const text = read(relative);
	const module = { exports: {} };
	const code = ts.transpileModule(text, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
	const customRequire = (name) => {
		if (name === "react") return React;
		if (name === "react/jsx-runtime") return require(path.join(appRoot, ".expo/senior7-test-tools/node_modules/react/jsx-runtime"));
		if (name === "react-native") return native;
		if (name === "@/components/ui/modal") return { Modal, ...presentation(["ModalBackdrop", "ModalBody", "ModalContent", "ModalFooter", "ModalHeader"]) };
		if (name === "@/components/ui/button") return presentation(["Button", "ButtonGroup", "ButtonText"]);
		if (name === "@/components/common/Text") return { __esModule: true, default: "Text" };
		if (name === "@/assets/images/illustrations") return { ILLUSTRATIONS: { deleteConfirmation: "fixture-default-delete" } };
		if (name === "@/hooks/useAlertModal") return load("hooks/useAlertModal.ts");
		throw new Error(`Unexpected dependency ${name}`);
	};
	vm.runInNewContext(code, { module, exports: module.exports, require: customRequire, console }, { filename: path.join(appRoot, relative) });
	loaded.set(relative, module.exports);
	return module.exports;
}
const moduleUnderReview = load(target);
const DeleteConfirmModal = moduleUnderReview.default;
let renderer;
let closeEvents = [];
let confirmationCalls = 0;
const base = { isOpen: true, onConfirm: () => { confirmationCalls += 1; }, onClose: () => closeEvents.push("onClose") };
const tree = (props) => React.createElement(React.StrictMode, null, React.createElement(DeleteConfirmModal, props));
const single = (type) => renderer.root.findByType(type);
const all = (type) => renderer.root.findAllByType(type);
const texts = () => all("Text").map((node) => node.props.children);
const buttons = () => all("Button");
async function mount(props = base) {
	if (renderer) await act(async () => renderer.unmount());
	closeEvents = [];
	confirmationCalls = 0;
	await act(async () => { renderer = create(tree(props)); });
}
async function press(index) {
	const button = buttons()[index];
	if (!button.props.disabled) await act(async () => button.props.onPress());
}
async function resize(width, height = 640) {
	await act(async () => {
		dimensions = { ...dimensions, width, height };
		for (const listener of dimensionListeners) listener();
	});
}

(async () => {
	await mount();
	check("Both Batal and Hapus actions render", all("ButtonText").map((node) => node.props.children), ["Batal", "Hapus"]);
	check("Cancel remains outline and confirm remains destructive", buttons().map((node) => [node.props.variant ?? null, node.props.action ?? null]), [["outline", null], [null, "negative"]]);
	check("Both buttons are enabled when idle", buttons().map((node) => node.props.disabled), [false, false]);
	check("Footer remains side-by-side with gap12", single("ModalFooter").props.className, "mt-4 flex-row gap-3 p-0");
	check("Footer preserves two equal flex groups", all("ButtonGroup").map((node) => node.props.className), ["flex-1", "flex-1"]);
	check("Default title/description resolve unchanged", texts(), ["Hapus Item?", "Data ini akan dihapus dan tidak dapat digunakan lagi."]);
	check("Default illustration resolves unchanged", single("Image").props.source, "fixture-default-delete");
	check("Image explicit size matches original intent", single("Image").props.style, { height: 176, width: "100%" });
	check("Image className and contain mode are preserved", [single("Image").props.className, single("Image").props.resizeMode], ["h-44 w-full", "contain"]);
	check("Initial 320px window yields width288/max380", single("ModalContent").props.style, { width: 288, maxWidth: 380 });
	check("StrictMode keeps one active dimension subscription", dimensionListeners.size, 1);
	const rootIdentity = renderer.root.findByType(DeleteConfirmModal);
	await resize(390, 844);
	check("Width changes while same modal instance/props stays mounted", [single("ModalContent").props.style, renderer.root.findByType(DeleteConfirmModal) === rootIdentity], [{ width: 358, maxWidth: 380 }, true]);
	await resize(768, 1024);
	check("Tablet width retains maximum380", single("ModalContent").props.style, { width: 736, maxWidth: 380 });
	await resize(320);
	check("Open modal follows resize back to320", single("ModalContent").props.style, { width: 288, maxWidth: 380 });
	await press(1);
	check("Confirm invokes only onConfirm once", [confirmationCalls, closeEvents], [1, []]);
	check("Confirm does not close legacy modal automatically", single("Modal").props.isOpen, true);
	await press(0);
	check("Cancel invokes only onClose", [confirmationCalls, closeEvents], [1, ["onClose"]]);
	await act(async () => single("Modal").props.onClose());
	check("Modal dismissal preserves onClose callback", closeEvents, ["onClose", "onClose"]);
	await mount({ ...base, isLoading: true });
	check("Loading disables both cancel and confirm", buttons().map((node) => node.props.disabled), [true, true]);
	await press(0); await press(1);
	check("Disabled-button host interactions dispatch no callbacks", [confirmationCalls, closeEvents], [0, []]);
	await act(async () => single("Modal").props.onClose());
	check("Loading preserves existing backdrop dismissal contract", closeEvents, ["onClose"]);
	await act(async () => renderer.update(tree(base)));
	check("Busy-to-idle rerender reenables both actions", buttons().map((node) => node.props.disabled), [false, false]);
	await press(1);
	check("Reenabled confirm invokes callback normally", confirmationCalls, 1);
	const controlledEvents = [];
	await mount({ ...base, isOpen: false, openState: [true, (value) => controlledEvents.push(["setOpen", value])], onClose: () => controlledEvents.push(["onClose"]) });
	check("openState true takes precedence over legacy false", single("Modal").props.isOpen, true);
	await press(0);
	check("Controlled cancel updates state before optional onClose", controlledEvents, [["setOpen", false], ["onClose"]]);
	await mount({ ...base, isOpen: true, openState: [false, () => {}] });
	check("openState false takes precedence over legacy true", [single("Modal").props.isOpen, buttons().length], [false, 0]);
	await mount({ onConfirm: base.onConfirm });
	check("No open props defaults to hidden", [single("Modal").props.isOpen, buttons().length], [false, 0]);
	await mount({ ...base, itemName: "Role", title: "   Hapus khusus?   ", description: "Description wins", message: "Fallback message", cancelText: "Kembali", confirmText: "Ya, hapus" });
	check("Explicit trimmed title overrides itemName", texts()[0], "Hapus khusus?");
	check("Description overrides legacy message", texts()[1], "Description wins");
	check("Custom public button labels remain supported", all("ButtonText").map((node) => node.props.children), ["Kembali", "Ya, hapus"]);
	await mount({ ...base, itemName: "Member", message: "Fallback message" });
	check("itemName resolves title when explicit title missing", texts()[0], "Hapus Member?");
	check("Legacy message remains description fallback", texts()[1], "Fallback message");
	await mount({ ...base, title: "", description: "", message: "Suppressed fallback" });
	check("Explicit empty title/description preserve nullish precedence", [texts(), all("ModalBody").length], [[""], 0]);
	const nodeDescription = React.createElement("RichDescription", { fixture: true }, "Node content");
	await mount({ ...base, description: nodeDescription, image: { uri: "fixture://custom-image" } });
	check("React-node description renders without conversion", [all("RichDescription").length, single("RichDescription").props.children], [1, "Node content"]);
	check("Custom image source retains fixed sizing/contain", [single("Image").props.source, single("Image").props.style, single("Image").props.resizeMode], [{ uri: "fixture://custom-image" }, { height: 176, width: "100%" }, "contain"]);
	await mount({ ...base, image: 0 });
	check("Falsy numeric image preserves existing image suppression", all("Image").length, 0);
	let resolveConfirmation;
	const pending = new Promise((resolve) => { resolveConfirmation = resolve; });
	await mount({ ...base, onConfirm: () => pending });
	let confirmationResult;
	await act(async () => { confirmationResult = buttons()[1].props.onPress(); });
	check("Async confirmation callback promise is preserved", confirmationResult === pending, true);
	check("Component does not infer pending/auto-close from callback promise", [single("Modal").props.isOpen, buttons().map((node) => node.props.disabled)], [true, [false, false]]);
	resolveConfirmation(); await pending;
	check("useAlertModal public re-export matches production hook", moduleUnderReview.useAlertModal === loaded.get("hooks/useAlertModal.ts").useAlertModal, true);
	await act(async () => renderer.unmount()); renderer = null;
	check("Unmount releases dimension subscription", dimensionListeners.size, 0);
	await resize(360, 800);
	check("Dimension update after unmount creates no listeners", dimensionListeners.size, 0);
	check("Runtime/React/act errors are absent", errors, []);
	check("Runtime warnings are absent except suppressed renderer deprecation", warnings, []);
	const audit = JSON.parse(fs.readFileSync(path.join(__dirname, "audit-before.json"), "utf8"));
	check("Baseline audit SHA remains attached to original snapshot", hash(before), audit.source.sha256);
	const changedCallers = audit.callers.filter((caller) => hash(fs.readFileSync(path.join(appRoot, caller.file))) !== caller.sha256).map((caller) => caller.file);
	check("All63caller source fingerprints remain unchanged during review", changedCallers, []);
	check("Source remains supplied final hash after checks", hash(read(target)), expectedFinal);
	const passed = checks.filter((item) => item.passed).length;
	const result = {
		status: "INTERNAL_QA_REVIEW",
		outcome: passed === checks.length ? "PASS_WITH_SCOPE_LIMITS" : "FINDINGS",
		reviewer: "/root/audit_delete_modal",
		source: { path: target, sha256: expectedFinal },
		passed, failed: checks.length - passed,
		runtimeErrors: errors, runtimeWarnings: warnings,
		loadedProductionModules: [...loaded.keys()].map((file) => ({ path: file, sha256: hash(read(file)) })),
		adapters: ["RN host presentation", "window dimensions useSyncExternalStore fixture", "modal/button/Text presentation", "illustration source fixture"],
		checks,
		limits: ["Internal delegated QA review, not external QC approval", "No browser/Metro/backend/native/Figma/HTTP/fullTypeScript", "Renderer checks component contracts, not CSS/button geometry", "Loading click suppression is a disabled-aware host driver, not the Gluestack implementation", "Screen dimensions fixture throws if accessed; dynamic window fixture checks component hook subscription intent"],
	};
	if (fs.existsSync(path.join(__dirname, "results.json"))) throw new Error("Internal final review result already frozen");
	fs.writeFileSync(path.join(__dirname, "results.json"), `${JSON.stringify(result, null, 2)}\n`);
	console.log(JSON.stringify({ status: result.status, outcome: result.outcome, passed: result.passed, failed: result.failed, sourceHash: expectedFinal, runtimeErrors: errors.length }));
	process.exitCode = result.failed ? 1 : 0;
})().catch(async (error) => {
	if (renderer) await act(async () => renderer.unmount());
	console.error(error);
	process.exitCode = 1;
});
