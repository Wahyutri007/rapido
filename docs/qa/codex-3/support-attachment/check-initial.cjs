// Production support picker/form/RHF/Controller/Zod; native picker and presentation adapters.
const fs = require("node:fs"), path = require("node:path"), vm = require("node:vm"), crypto = require("node:crypto"), ts = require("typescript");
const React = require(path.resolve(".expo/senior7-test-tools/node_modules/react"));
require("react"); require.cache[require.resolve("react")].exports = React;
const { act, create } = require(path.resolve(".expo/senior7-test-tools/node_modules/react-test-renderer"));
const { Controller, FormProvider } = require("react-hook-form");
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const checks = [], errors = [], loaded = new Map();
const originalError = console.error;
console.error = (...args) => {
	if (String(args[0]).includes("react-test-renderer is deprecated")) return;
	errors.push(args.map(String).join(" ")); originalError(...args);
};
const check = (name, actual, expected) => checks.push({ name, passed: JSON.stringify(actual) === JSON.stringify(expected), actual, expected });
let renderer, pickerQueue = [], pickerCalls = [], changes = [], modalOpens = 0, strict = false;
const picker = { getDocumentAsync: async (options) => {
	pickerCalls.push(options);
	return await (pickerQueue.shift() ?? { canceled: true, assets: null });
} };
const Form = (props) => React.createElement(FormProvider, props, React.createElement("Form", props, props.children));
const FormField = ({ control, name, render }) => React.createElement(Controller, { control, name, render });
const presentation = (names) => Object.fromEntries(names.map((name) => [name, name]));
const load = (file) => {
	const absolute = path.resolve(file);
	if (loaded.has(absolute)) return loaded.get(absolute);
	const code = ts.transpileModule(fs.readFileSync(absolute, "utf8"), { compilerOptions: {
		module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
	} }).outputText;
	const module = { exports: {} };
	const customRequire = (name) => {
		if (name === "react") return React;
		if (name === "react/jsx-runtime") return require(path.resolve(".expo/senior7-test-tools/node_modules/react/jsx-runtime"));
		if (name === "react-native") return presentation(["View", "Pressable", "ScrollView"]);
		if (name === "expo-document-picker") return picker;
		if (name === "@/components/common/AlertModal") return { __esModule: true, default: "AlertModal", useAlertModal: () => {
			const state = React.useState(false);
			return { openState: state, open: () => { modalOpens++; state[1](true); }, close: () => state[1](false) };
		} };
		if (name === "@/components/common/Form") return { Form, FormField, ...presentation(["FormControl", "FormInput", "FormItem", "FormLabel", "FormMessage"]) };
		if (name === "@/components/icons") return presentation(["EFeather", "CheckCircleIcon"]);
		if (name === "@/components/ui/radio") return presentation(["Radio", "RadioGroup"]);
		if (name === "@/components/ui/textarea") return presentation(["Textarea", "TextareaInput"]);
		if (name === "@/lib/utils") return { cn: (...values) => values.filter(Boolean).join(" ") };
		if (name === "./SupportAttachmentInput") return load("components/feature/support/SupportAttachmentInput.tsx");
		if (name === "@/components/feature/support/SupportFormScreen") return load("components/feature/support/SupportFormScreen.tsx");
		if (name.startsWith("@/components/") || name === "./SupportHero") return { __esModule: true, default: name.split("/").at(-1) };
		if (name.startsWith("@/")) return load(name.slice(2) + ".ts");
		return require(name);
	};
	vm.runInNewContext(code, { module, exports: module.exports, require: customRequire, console, Date, setTimeout, clearTimeout }, { filename: absolute });
	loaded.set(absolute, module.exports); return module.exports;
};
const Attachment = load("components/feature/support/SupportAttachmentInput.tsx").default;
const Screen = load("components/feature/support/SupportFormScreen.tsx").default;
const schema = load("schema/support.ts");
const oldFile = { uri: "file:///old.pdf", name: "old.pdf", mimeType: "application/pdf", size: 128 };
const newFile = { uri: "file:///new.png", name: "new.png", mimeType: "image/png", size: 1024 };
const result = (asset) => ({ canceled: false, assets: [asset] });
const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; };
const wrapped = (element) => strict ? React.createElement(React.StrictMode, null, element) : element;
const unmount = async () => { if (renderer) await act(async () => renderer.unmount()); renderer = null; };
const reset = async () => { await unmount(); pickerQueue = []; pickerCalls = []; changes = []; modalOpens = 0; strict = false; };
function Controlled({ initial = null, identity = "current" }) {
	const [value, setValue] = React.useState(initial);
	return React.createElement(Attachment, { value, onChange: (next) => { changes.push({ identity, value: next }); setValue(next); } });
}
const mountPicker = async (initial = null, identity = "current") => { await act(async () => { renderer = create(wrapped(React.createElement(Controlled, { initial, identity }))); }); };
const pickButton = () => renderer.root.findAllByType("Pressable").find((node) => ["Tambah lampiran", "Ganti lampiran"].includes(node.props.accessibilityLabel)).props;
const removeButton = () => renderer.root.findAllByType("Pressable").find((node) => node.props.accessibilityLabel === "Hapus lampiran").props;
const attachmentModal = () => renderer.root.findAllByType("AlertModal").find((node) => node.props.title === "Lampiran belum ditambahkan").props;
const unavailableModal = () => renderer.root.findAllByType("AlertModal").find((node) => node.props.title === "Pengiriman belum tersedia").props;
const attachmentValue = () => renderer.root.findByType(Attachment).props.value;
const startPicker = async () => {
	const wait = deferred(); pickerQueue.push(wait.promise); let submission;
	await act(async () => { submission = pickButton().onPress(); });
	return { ...wait, submission };
};
const settle = async (wait, outcome, asset = newFile) => { await act(async () => {
	if (outcome === "reject") wait.reject(new Error("Fixture picker failure")); else wait.resolve(outcome === "cancel" ? { canceled: true, assets: null } : result(asset));
	await wait.submission;
}); };
const form = () => renderer.root.findByType("Form").props;
const save = () => renderer.root.findByType("BottomActionButton").props;
const defaults = { title: "", description: "", feedbackType: "suggestion", relatedPage: "", attachment: null };
const screenElement = (mode) => wrapped(React.createElement(Screen, { mode }));
const renderScreen = async (mode) => { await act(async () => {
	if (renderer) renderer.update(screenElement(mode)); else renderer = create(screenElement(mode));
}); };
const fill = async () => { await act(async () => {
	for (const [key, value] of Object.entries({ title: "Draft title", description: "Draft description", feedbackType: "problem", relatedPage: "Reports", attachment: oldFile })) form().setValue(key, value);
}); };
(async () => {
	await reset(); await mountPicker(oldFile);
	const wait = deferred(); pickerQueue.push(wait.promise, { canceled: true, assets: null });
	let first, second; const oldPress = pickButton().onPress;
	await act(async () => { first = oldPress(); second = oldPress(); });
	check("picker: two same-event presses open only one native picker", pickerCalls.length, 1);
	check("picker: busy stays set while first picker is pending", pickButton().disabled, true);
	await act(async () => { wait.resolve(result(newFile)); await Promise.all([first, second]); });
	check("picker: selected result emits once", changes.length, 1);
	check("picker: busy is cleared after completion", pickButton().disabled, false);
	check("picker: SDK options preserve one cached JPG/PNG/PDF file", pickerCalls[0], { type: ["image/jpeg", "image/png", "application/pdf"], multiple: false, copyToCacheDirectory: true });
	for (const [label, outcome, asset] of [["valid", "success", newFile], ["invalid", "success", { ...newFile, size: schema.MAX_SUPPORT_ATTACHMENT_BYTES + 1 }], ["error", "reject", null]]) {
		await reset(); await mountPicker(oldFile); const pending = await startPicker();
		await act(async () => removeButton().onPress());
		check(`remove ${label}: removal emits null immediately`, changes.map((item) => item.value), [null]);
		check(`remove ${label}: pending picker keeps its lock`, pickButton().disabled, true);
		await settle(pending, outcome, asset);
		check(`remove ${label}: late result cannot reattach`, attachmentValue(), null);
		check(`remove ${label}: late result cannot emit another change`, changes.map((item) => item.value), [null]);
		check(`remove ${label}: late error cannot open modal`, modalOpens, 0);
		check(`remove ${label}: completion unlocks retry`, pickButton().disabled, false);
		pickerQueue = [result(newFile)]; await act(async () => pickButton().onPress());
		check(`remove ${label}: next picker can attach a new file`, attachmentValue(), newFile);
	}
	for (const [label, outcome, asset] of [["valid", "success", newFile], ["invalid", "success", { ...newFile, size: 0 }], ["error", "reject", null]]) {
		await reset(); await mountPicker(oldFile, "old"); const pending = await startPicker();
		const stalePick = pickButton().onPress, staleRemove = removeButton().onPress;
		await unmount(); await settle(pending, outcome, asset);
		check(`unmount ${label}: stale result does not call parent`, changes, []);
		check(`unmount ${label}: stale result does not open error modal`, modalOpens, 0);
		const count = pickerCalls.length; await act(async () => stalePick());
		check(`unmount ${label}: queued picker callback does not launch picker`, pickerCalls.length, count);
		await act(async () => staleRemove());
		check(`unmount ${label}: queued remove callback does not change parent`, changes, []);
	}
	await reset(); await mountPicker(oldFile, "old"); const oldPending = await startPicker();
	await unmount(); await mountPicker(newFile, "new"); await settle(oldPending, "success", oldFile);
	check("remount: old result cannot write through parent callback", changes, []);
	check("remount: new instance retains its attachment", attachmentValue(), newFile);
	check("remount: old busy state does not lock new instance", pickButton().disabled, false);
	const validationCases = [
		["jpg", { ...newFile, name: "photo.JPG", mimeType: "image/jpeg" }, true],
		["png", newFile, true], ["pdf at limit", { ...oldFile, size: schema.MAX_SUPPORT_ATTACHMENT_BYTES }, true],
		["optional MIME", { ...oldFile, mimeType: undefined }, true], ["generic MIME", { ...oldFile, mimeType: "application/octet-stream" }, true],
		["empty", { ...newFile, size: 0 }, false], ["too large", { ...newFile, size: schema.MAX_SUPPORT_ATTACHMENT_BYTES + 1 }, false],
		["unknown size", { ...newFile, size: undefined }, false], ["unsupported extension", { ...newFile, name: "run.exe" }, false],
		["unsupported MIME", { ...newFile, mimeType: "text/plain" }, false], ["unreadable URI", { ...newFile, uri: "" }, false],
	];
	for (const [label, asset, valid] of validationCases) {
		await reset(); await mountPicker(oldFile); pickerQueue = [result(asset)];
		await act(async () => pickButton().onPress());
		check(`validation ${label}: updates only on valid asset`, changes.length, valid ? 1 : 0);
		check(`validation ${label}: invalid asset preserves previous selection`, attachmentValue()?.name, valid ? asset.name : oldFile.name);
		check(`validation ${label}: modal matches validation outcome`, attachmentModal().openState[0], !valid);
		check(`validation ${label}: picker unlocks`, pickButton().disabled, false);
	}
	await reset(); await mountPicker(oldFile); pickerQueue = [{ canceled: true, assets: null }];
	await act(async () => pickButton().onPress());
	check("cancel: previous attachment remains", attachmentValue(), oldFile);
	check("cancel: no callback or error modal", [changes.length, modalOpens], [0, 0]);
	check("cancel: picker unlocks", pickButton().disabled, false);
	await reset(); await mountPicker(oldFile); pickerQueue = [result(undefined)]; await act(async () => pickButton().onPress());
	check("missing asset: previous attachment remains", attachmentValue(), oldFile);
	check("missing asset: actionable size error", attachmentModal().message, "Ukuran lampiran tidak dapat diperiksa. Silakan pilih berkas lain.");
	await act(async () => attachmentModal().openState[1](false)); pickerQueue = [result(newFile)]; await act(async () => pickButton().onPress());
	check("missing asset: retry after closing modal succeeds", attachmentValue(), newFile);
	await reset(); await mountPicker(oldFile); const failure = await startPicker(); await settle(failure, "reject");
	check("current failure: picker error is shown", attachmentModal().openState[0], true);
	check("current failure: previous attachment remains", attachmentValue(), oldFile);
	await act(async () => attachmentModal().openState[1](false)); pickerQueue = [result(newFile)]; await act(async () => pickButton().onPress());
	check("current failure: retry succeeds", attachmentValue(), newFile);
	await reset(); strict = true; await mountPicker(); pickerQueue = [result(newFile)]; await act(async () => pickButton().onPress());
	check("StrictMode: effect replay still allows current attachment", attachmentValue(), newFile);
	await reset(); await renderScreen("feedback"); await fill(); const draft = form().getValues();
	await act(async () => save().onPress());
	check("form: valid feedback explains delivery is unavailable", unavailableModal().openState[0], true);
	check("form: valid feedback remains in form", form().getValues(), draft);
	await renderScreen("feedback");
	check("form: same mode rerender keeps draft", form().getValues(), draft);
	await renderScreen("feature-request");
	check("form: different mode resets every field", form().getValues(), defaults);
	check("form: different mode resets delivery modal", unavailableModal().openState[0], false);
	await renderScreen("feedback");
	check("form: returning to feedback uses fresh defaults", form().getValues(), defaults);
	await reset(); await renderScreen("feedback"); await act(async () => save().onPress());
	check("form: required fields fail schema validation", Boolean(form().getFieldState("title").error && form().getFieldState("description").error), true);
	check("form: invalid fields cannot open unavailable modal", modalOpens, 0);
	await renderScreen("feature-request");
	check("form: mode change clears old validation errors", [Boolean(form().getFieldState("title").error), Boolean(form().getFieldState("description").error)], [false, false]);
	await reset(); await renderScreen("feedback"); await fill(); const staleSubmit = save().onPress;
	await renderScreen("feature-request"); await act(async () => staleSubmit());
	check("form: old submit callback cannot open any modal", modalOpens, 0);
	check("form: old submit callback cannot touch new draft", form().getValues(), defaults);
	await reset(); await renderScreen("feedback"); const pendingInForm = await startPicker();
	await renderScreen("feature-request"); await settle(pendingInForm, "success");
	check("form: old picker cannot attach to different mode", form().getValues("attachment"), null);
	check("form: new mode attachment picker is available", pickButton().disabled, false);
	await reset(); await renderScreen("feedback"); await fill(); const afterUnmountSubmit = save().onPress;
	await unmount(); await act(async () => afterUnmountSubmit());
	check("form: submit callback after unmount cannot open modal", modalOpens, 0);
	await reset(); strict = true; await renderScreen("feature-request"); await fill(); await act(async () => save().onPress());
	check("StrictMode: current form validation can open unavailable modal", unavailableModal().openState[0], true);
	for (const file of ["app/(no-layout)/manage/feedback/index.tsx", "app/(no-layout)/manage/feature-request/index.tsx"]) {
		await reset(); const Route = load(file).default; await act(async () => { renderer = create(React.createElement(Route)); });
		check(`${file}: actual route starts empty`, form().getValues(), defaults);
		pickerQueue = [result(newFile)]; await act(async () => pickButton().onPress());
		check(`${file}: Controller passes attachment to RHF`, form().getValues("attachment"), newFile);
	}
	await unmount();
	const sources = ["components/feature/support/SupportAttachmentInput.tsx", "components/feature/support/SupportFormScreen.tsx", "schema/support.ts", "types/ui/support.ts", "app/(no-layout)/manage/feedback/index.tsx", "app/(no-layout)/manage/feature-request/index.tsx"];
	const output = { owner: "Codex-3", ticket: "SD3-005", scope: "Production picker/form/routes/RHF Controller/Zod with native picker/presentation/modal/router adapters; no browser/native/API writes", passed: checks.filter((item) => item.passed).length, failed: checks.filter((item) => !item.passed).length, errors, checks, sourceHashes: Object.fromEntries(sources.map((file) => [file, crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex")])) };
	fs.writeFileSync(path.join(__dirname, process.argv.includes("--baseline") ? "baseline.json" : "results.json"), JSON.stringify(output, null, 2) + "\n");
	console.log(JSON.stringify({ passed: output.passed, failed: output.failed, errors: errors.length, failures: checks.filter((item) => !item.passed).map((item) => item.name) }));
	process.exitCode = output.failed || errors.length ? 1 : 0;
})().catch((error) => { console.error(error); process.exitCode = 1; });
