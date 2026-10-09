const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const { React, act, create, errors, loadComponent, makeClock } = require("../barcode-lifecycle.cjs");
const { controls, fingerprint, record, checks, items } = require("./availability.cjs");
const rhfModule = { exports: {} };
new Function("module", "exports", "require", fs.readFileSync("node_modules/react-hook-form/dist/index.cjs.js", "utf8"))(
	rhfModule, rhfModule.exports, name => { if(name === "react") return React; throw new Error(`Unexpected RHF dependency: ${name}`); },
);
const rhf = rhfModule.exports;
const clock = makeClock();
const SingleSelect = loadComponent("components/common/SingleSelect.tsx", clock);
const formExports = {};
const hosts = names => Object.fromEntries(names.map(name => [name, name]));
const stubs = {
	"react": React,
	"react-hook-form": rhf,
	"react-native": { ...hosts(["Image", "Pressable", "View"]), Platform: { OS: "web" } },
	"@expo/vector-icons/Entypo": "Entypo",
	"@react-native-community/datetimepicker": {},
	"expo-document-picker": {},
	"expo-router": { Link: "Link", router: {} },
	"@/components/icons": { EFeather: "Feather" },
	"@/constants/Colors": { Colors: {} },
	"@/constants/Fonts": { FONT_NAMES: {} },
	"@/lib/utils": { cn: (...parts) => parts.filter(Boolean).join(" "), tw: value => value * 4 },
	"../icons/camera": "CameraIcon",
	"../ui/checkbox": hosts(["Checkbox", "CheckboxGroup", "CheckboxIcon", "CheckboxIndicator", "CheckboxLabel"]),
	"../ui/input": hosts(["Input", "InputField", "InputIcon"]),
	"../ui/radio": hosts(["Radio", "RadioCircleIndicator", "RadioGroup", "RadioLabel"]),
	"./SingleSelect": SingleSelect,
	"./Text": "Text",
};
vm.runInNewContext(ts.transpileModule(fs.readFileSync("components/common/Form.tsx", "utf8"), {
	compilerOptions: { jsx: ts.JsxEmit.React, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
}).outputText, { exports: formExports, require: name => {
	if(!(name in stubs)) throw new Error(`Unexpected Form dependency: ${name}`);
	return stubs[name];
} }, { filename: "components/common/Form.tsx" });
const { Form, FormField, FormItem, FormSelect } = formExports;
let form;
const validationValues = [];
function FormHarness(props) {
	form = rhf.useForm({ defaultValues: { category: "a", note: "untouched" } });
	return React.createElement(Form, { ...form }, React.createElement(FormField, {
		control: form.control, name: "category", rules: { validate: value => { validationValues.push(value); return value !== "b" || "Beta unavailable for this form"; } },
		render: () => React.createElement(FormItem, null, React.createElement(FormSelect, { data: props.items, showConfirmButton: true, ...props })),
	}));
}
async function main() {
	const files = ["components/common/SingleSelect.tsx", "components/common/Form.tsx", "node_modules/react-hook-form/dist/index.cjs.js"];
	const before = files.map(fingerprint);
	let renderer, props = { items, disabled: false };
	await act(async () => { renderer = create(React.createElement(FormHarness, props)); });
	const ui = controls(renderer);
	const update = patch => act(async () => { props = { ...props, ...patch }; renderer.update(React.createElement(FormHarness, props)); });
	const label = () => ui.trigger().findByType("Text").props.children;
	record("real FormSelect maps initial RHF value to label", label(), "Alpha");
	await ui.open(); await ui.choose("Beta");
	record("pending selection does not change RHF field", form.getValues("category"), "a");
	record("pending selection does not mark RHF field dirty", form.getFieldState("category").isDirty, false);
	await update({ disabled: true }); await ui.confirm();
	record("disabled confirmation preserves RHF value", form.getValues("category"), "a");
	record("disabled confirmation does not request validation", validationValues, []);
	await update({ disabled: false }); await ui.confirm();
	record("reenabled confirmation updates RHF field", form.getValues("category"), "b");
	record("RHF echo updates trigger", label(), "Beta");
	record("FormSelect marks committed field dirty", form.getFieldState("category").isDirty, true);
	record("FormSelect runs actual RHF validation", form.getFieldState("category").error?.message, "Beta unavailable for this form");
	await act(async () => form.reset({ category: "a", note: "untouched" }));
	record("RHF reset restores trigger label", label(), "Alpha");
	record("RHF reset clears dirty and validation error", [form.getFieldState("category").isDirty, Boolean(form.getFieldState("category").error)], [false, false]);
	await ui.open(); await ui.choose("Beta"); await update({ items: [items[0]] }); await ui.confirm();
	record("removed pending item cannot reach RHF payload", form.getValues("category"), "a");
	record("removed pending item leaves form pristine", form.getFieldState("category").isDirty, false);
	await update({ items: items.map(i => ({ ...i })) }); await ui.confirm();
	record("restored eligible item can commit pending draft", form.getValues("category"), "b");
	await ui.open(); await ui.choose("Alpha"); await act(async () => form.reset({ category: "c", note: "untouched" }));
	record("reset during open sheet replaces draft", ui.selected(), ["Gamma"]);
	await ui.confirm(); record("disabled external option cannot be recommitted", form.getFieldState("category").isDirty, false);
	await ui.cancel();
	await act(async () => form.reset({ category: "Alpha", note: "untouched" }));
	record("legacy label-valued form still resolves option", label(), "Alpha");
	await ui.open(); await ui.choose("Beta"); await ui.cancel();
	record("cancel preserves legacy label-valued field", form.getValues("category"), "Alpha");
	await ui.open(); await ui.confirm();
	record("confirm normalizes legacy label to option value", form.getValues("category"), "a");
	await update({ showConfirmButton: false, dismissOnSelect: false }); await ui.open(); await update({ disabled: true }); await ui.choose("Beta");
	record("immediate disabled picker preserves actual RHF field", form.getValues("category"), "a");
	await update({ disabled: false }); await ui.choose("Beta");
	record("immediate enabled picker commits and echoes through FormSelect", [form.getValues("category"), label()], ["b", "Beta"]);
	await act(async () => form.reset({ category: "", note: "untouched" }));
	record("empty RHF reset clears trigger", label(), "Pilih salah satu");
	record("unrelated form field remains untouched", form.getValues("note"), "untouched");
	await act(async () => renderer.unmount());
	record("unmount leaves no timer", clock.pending(), 0);
	record("no runtime errors or act warnings", errors, []);
	record("production sources stable during integration", files.map(fingerprint), before);
	const result = { status: checks.every(c => c.pass) ? "PASS" : "FAIL", passed: checks.filter(c => c.pass).length, failed: checks.filter(c => !c.pass).length, checks, sources: before, scope: "Production Form/FormField/FormItem/FormSelect + SingleSelect + actual react-hook-form; host adapters for RN/UI, no complete screen/router/native." };
	fs.writeFileSync(path.join(__dirname, "form-results.json"), JSON.stringify(result, null, 2) + "\n");
	console.log(JSON.stringify(result, null, 2));
	if(result.failed) process.exitCode = 1;
}
main().catch(error => { console.error(error); process.exitCode = 1; });
