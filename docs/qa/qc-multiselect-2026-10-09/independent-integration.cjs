const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const ts = require("typescript");
const root = path.resolve(__dirname, "../../..");
const React = require(path.join(root, ".expo/senior7-test-tools/node_modules/react"));
const { create, act } = require(path.join(root, ".expo/senior7-test-tools/node_modules/react-test-renderer"));
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const errors = [];
const originalError = console.error;
console.error = (...args) => {
  if (String(args[0]).includes("react-test-renderer is deprecated")) return;
  errors.push(args.map(String).join(" "));
  originalError(...args);
};
const checks = [];
const check = (name, actual, expected) => { assert.deepEqual(structuredClone(actual), structuredClone(expected), name); checks.push(name); };
const fingerprint = file => crypto.createHash("sha256").update(fs.readFileSync(path.join(root, file))).digest("hex");
const before = JSON.parse(fs.readFileSync(path.join(__dirname, "snapshot-before.json"), "utf8")).fingerprints;
const rhfModule = { exports: {} };
new Function("module", "exports", "require", fs.readFileSync(path.join(root, "node_modules/react-hook-form/dist/index.cjs.js"), "utf8"))(
  rhfModule, rhfModule.exports, name => { assert.equal(name, "react"); return React; },
);
const rhf = rhfModule.exports;
let capturedSalesForm;
const saveCalls = [];
const formHosts = Object.fromEntries(["FormControl", "FormInput", "FormItem", "FormLabel", "FormMessage", "FormSelect"].map(name => [name, name]));
const stubs = {
  react: React, "react-hook-form": rhf,
  "react-native": { Pressable: "Pressable", View: "View" },
  "@expo/vector-icons": { Entypo: "Entypo", Feather: "Feather" },
  "@expo/vector-icons/Entypo": "Entypo", "@expo/vector-icons/Feather": "Feather",
  "lucide-react-native": { ArrowUpDown: "ArrowUpDown" },
  "@gluestack-ui/utils/nativewind-utils": { tva: () => () => "" },
  "@/constants/Colors": { Colors: { primary: "blue", zinc: { 400: "gray", 700: "gray" } } },
  "@/lib/utils": { cn: (...values) => values.filter(Boolean).join(" "), formatRp: amount => `Rp${amount}` },
  "./Text": "Text", "@/components/common/Text": "Text",
  "@/components/common/BouncyPressable": "BouncyPressable",
  "@/components/common/SortActionSheet": "SortActionSheet",
  "../icons": { FilterIcon: "FilterIcon" },
  "../ui/input": { Input: "Input", InputField: "InputField" },
  "../ui/actionsheet": Object.fromEntries(["Actionsheet", "ActionsheetBackdrop", "ActionsheetContent", "ActionsheetDragIndicator", "ActionsheetDragIndicatorWrapper", "ActionsheetScrollView"].map(name => [name, name])),
  "@/components/common/BottomActionButton": "BottomActionButton",
  "@/components/common/Card": "Card",
  "@/components/common/SuccessModal": "SuccessModal",
  "@/components/common/Wrapper": "Wrapper",
  "@/components/ui/button": { Button: "Button", ButtonText: "ButtonText" },
  "@/components/common/Form": {
    ...formHosts,
    Form({ children, ...methods }) { capturedSalesForm = methods; return React.createElement("Form", null, children); },
    FormField: rhf.Controller,
  },
  "@/store/salesTargetStore": { useSalesTargetStore: selector => selector({ save(...args) { saveCalls.push(args); return { id: "qc-preview" }; } }) },
};
const loaded = new Map();
function load(file) {
  if (loaded.has(file)) return loaded.get(file);
  const module = { exports: {} };
  const source = fs.readFileSync(path.join(root, file), "utf8");
  const code = ts.transpileModule(source, { compilerOptions: { jsx: ts.JsxEmit.React, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  const resolve = name => {
    if (name in stubs) return stubs[name];
    if (name.startsWith("@/")) {
      const base = name.slice(2);
      const resolved = [base + ".tsx", base + ".ts"].find(candidate => fs.existsSync(path.join(root, candidate)));
      assert.ok(resolved, `known production module ${name}`);
      return load(resolved);
    }
    if (name === "zod" || name === "@hookform/resolvers/zod") return require(name);
    throw Error(`Unexpected dependency ${name} from ${file}`);
  };
  new Function("module", "exports", "require", code)(module, module.exports, resolve);
  loaded.set(file, module.exports);
  return module.exports;
}
const { MultiSelect } = load("components/common/MultiSelect.tsx");
const SalesTargetForm = load("components/feature/manage/sales-target/SalesTargetForm.tsx").default;
const fixtures = load("constants/data/manage/sales-target.ts");
const actualHelpers = load("lib/manage/sales-target.ts");
const options = [{ value: "a", label: "Alpha", description: "First" }, { value: "b", label: "Beta", description: "Second" }, { value: "c", label: "Gamma", description: "Third" }];
const strict = (component, props) => React.createElement(React.StrictMode, null, React.createElement(component, props));

function controls(renderer, index = 0) {
  const picker = () => renderer.root.findAllByType(MultiSelect)[index];
  const rows = () => picker().findByType("ActionsheetScrollView").findAllByType("Pressable");
  const button = label => picker().findAllByType("Pressable").find(node => node.findAllByType("Text").some(text => text.props.children === label));
  return {
    open: () => act(async () => picker().findAllByType("Pressable")[0].props.onPress()),
    click: label => act(async () => { assert.ok(button(label), label); button(label).props.onPress(); }),
    toggle: label => rows().find(node => node.findAllByType("Text").some(text => text.props.children === label)).props.onPress,
    selected: () => rows().filter(node => node.findAllByType("Feather").some(icon => icon.props.name === "check")).map(node => node.findAllByType("Text")[0].props.children),
    visible: () => rows().map(node => node.findAllByType("Text")[0].props.children),
    search: value => act(async () => picker().findByType("InputField").props.onChangeText(value)),
    input: () => picker().findByType("InputField").props.value,
    close: () => act(async () => picker().findByType("Actionsheet").props.onClose()),
    pill: label => picker().findAllByType("Pressable").find(node => node.findAllByType("Entypo").some(icon => icon.props.name === "cross") && node.findByType("Text").props.children === label),
    all: () => button("Pilih Semua").props.onPress(),
  };
}

function auditContract() {
  const source = "components/common/MultiSelect.tsx";
  const parse = file => ts.createSourceFile(file, fs.readFileSync(path.join(root, file), "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const current = parse(source);
  const baseline = parse("docs/qa/senior-7-2026-10-09/multi-select/MultiSelect.before.txt");
  const publicType = (ast, name) => ast.statements.find(node => ts.isTypeAliasDeclaration(node) && node.name.text === name).getText(ast);
  check("public props are unchanged", publicType(current, "MultiSelectProps"), publicType(baseline, "MultiSelectProps"));
  check("public item type is unchanged", publicType(current, "MultiSelectItem"), publicType(baseline, "MultiSelectItem"));
  const jsx = ast => ast.statements.find(node => ts.isFunctionDeclaration(node) && node.name.text === "MultiSelect").body.statements.find(ts.isReturnStatement).expression.getText(ast);
  check("entire returned JSX/style is unchanged", jsx(current), jsx(baseline));
  const manifest = JSON.parse(fs.readFileSync(path.join(root, "docs/qa/senior-7-2026-10-09/multi-select/verification.json"), "utf8"));
  const callers = manifest.callerSources.map(entry => {
    const ast = parse(entry.file);
    let count = 0;
    const visit = node => { if (ts.isJsxSelfClosingElement(node) && node.tagName.getText(ast) === "MultiSelect") count++; ts.forEachChild(node, visit); };
    visit(ast); return { file: entry.file, count };
  });
  check("all nine declared callers use production MultiSelect", callers.every(entry => entry.count > 0), true);
  check("all declared callers have eleven uses in total", callers.reduce((total, entry) => total + entry.count, 0), 11);
  fs.writeFileSync(path.join(__dirname, "caller-contract.json"), JSON.stringify({ publicPropsUnchanged: true, jsxUnchanged: true, callers }, null, 2) + "\n");
}

async function siblingFields() {
  let form, renderer;
  let props = { revision: 0, items: options };
  const commits = [];
  function Harness({ revision, items }) {
    form = rhf.useForm({ defaultValues: { aIds: ["a"], bIds: ["b"], note: "keep" } });
    return React.createElement(React.Fragment, null, ["aIds", "bIds"].map(name => React.createElement(rhf.Controller, {
      key: name, name, control: form.control,
      render: ({ field }) => React.createElement(MultiSelect, {
        items, selectedValues: [...field.value], label: name,
        onValueChange(ids) { commits.push({ name, revision, ids: [...ids] }); field.onChange(ids); },
      }),
    })));
  }
  await act(async () => { renderer = create(strict(Harness, props)); });
  const a = controls(renderer), b = controls(renderer, 1);
  const update = patch => act(async () => { props = { ...props, ...patch }; renderer.update(strict(Harness, props)); });
  await a.open(); await b.open();
  await act(async () => { a.toggle("Beta")(); b.toggle("Gamma")(); });
  await update({ revision: 7, items: options.map(item => ({ ...item })) });
  check("two pickers retain independent draft across equivalent parent rerender", [a.selected(), b.selected()], [["Alpha", "Beta"], ["Beta", "Gamma"]]);
  check("neither picker commits while drafting", commits.length, 0);
  check("RHF committed fields stay unchanged while both drafts open", [form.getValues("aIds"), form.getValues("bIds")], [["a"], ["b"]]);
  await act(async () => form.reset({ aIds: ["c"], bIds: ["b"], note: "external" }));
  check("changed field reset replaces that open draft", a.selected(), ["Gamma"]);
  check("other field with equal values retains its own draft", b.selected(), ["Beta", "Gamma"]);
  await a.click("Selesai");
  check("save after reset sends only replacement IDs", form.getValues("aIds"), ["c"]);
  check("save uses latest callback from parent rerender", commits.at(-1).revision, 7);
  check("reset-equivalent save remains pristine", form.getFieldState("aIds").isDirty, false);
  await b.close();
  check("backdrop on other picker commits nothing", [form.getValues("bIds"), commits.length], [["b"], 1]);
  await a.open();
  await a.search("sEcOnD");
  check("actual SearchBar input filters description ignoring case", a.visible(), ["Beta"]);
  await a.click("Pilih Semua");
  check("filtered select does not write RHF early", form.getValues("aIds"), ["c"]);
  await a.click("Batal");
  check("cancel clears actual SearchBar input", a.input(), "");
  await a.open();
  check("cancelled filtered addition is discarded", a.selected(), ["Gamma"]);
  await act(async () => form.setValue("aIds", ["c", "a"]));
  await act(async () => form.setValue("aIds", ["a", "c"]));
  await a.click("Selesai");
  check("external reordering is preserved in callback order", commits.at(-1).ids, ["a", "c"]);
  await update({ items: [] }); await a.open(); await a.click("Pilih Semua"); await a.click("Selesai");
  check("empty options and select-all preserve unloaded committed IDs", form.getValues("aIds"), ["a", "c"]);
  await update({ items: [options[1]] }); await a.open(); await a.click("Pilih Semua"); await a.click("Selesai");
  check("loaded select-all retains hidden IDs and adds available ID once", form.getValues("aIds"), ["a", "c", "b"]);
  await update({ items: options }); await a.open();
  check("refetched options display all previously selected IDs", a.selected(), ["Alpha", "Beta", "Gamma"]);
  await a.search("nothing-matches"); await a.click("Pilih Semua"); await a.click("Selesai");
  check("search with no matches cannot erase hidden selected IDs", form.getValues("aIds"), ["a", "c", "b"]);
  check("save clears actual SearchBar input", a.input(), "");
  await act(async () => a.pill("Alpha").props.onPress());
  check("pill updates its RHF field immediately", form.getValues("aIds"), ["c", "b"]);
  check("pill operation leaves sibling field and note unchanged", [form.getValues("bIds"), form.getValues("note")], [["b"], "external"]);
  await act(async () => form.setValue("aIds", ['a::b', 'quote"\n'], { shouldDirty: false }));
  await a.open();
  await act(async () => form.setValue("aIds", ['a', 'b::quote"\n'], { shouldDirty: false }));
  await a.click("Selesai");
  check("JSON identity distinguishes delimiter quote and newline IDs", commits.at(-1).ids, ['a', 'b::quote"\n']);
  await act(async () => renderer.unmount());
}

async function salesTarget() {
  let renderer;
  const initial = structuredClone(fixtures.SALES_TARGETS[0]);
  await act(async () => { renderer = create(strict(SalesTargetForm, { target: initial })); });
  const ui = controls(renderer);
  const rowValues = () => capturedSalesForm.getValues("rows");
  check("actual Target Penjualan starts with original numeric rows", rowValues(), initial.rows);
  await ui.open(); await act(async () => ui.toggle("California Roll")());
  await act(async () => capturedSalesForm.setValue("name", "Target revisi"));
  check("actual caller fresh arrays preserve unsaved bulk draft on form rerender", ui.selected(), ["Salmon Sushi", "California Roll", "Ocha"]);
  check("draft bulk choice leaves original numeric targets untouched", rowValues(), initial.rows);
  await ui.click("Selesai");
  check("bulk commit retains selected existing target quantities and amounts", rowValues().slice(0, 2), initial.rows);
  check("bulk commit initializes only newly added product row", rowValues()[2], { itemId: "target-product-california", quantity: 1, amount: 0 });
  check("bulk commit retains other form edits", capturedSalesForm.getValues("name"), "Target revisi");
  await ui.open(); await act(async () => ui.toggle("Salmon Sushi")());
  await ui.click("Batal");
  check("bulk cancel retains current committed numeric rows", rowValues(), [...initial.rows, { itemId: "target-product-california", quantity: 1, amount: 0 }]);
  await ui.open();
  const replacement = { ...initial, rows: [{ itemId: "target-product-california", quantity: 33, amount: 500000 }] };
  await act(async () => capturedSalesForm.reset(replacement));
  check("actual caller reset replaces open picker draft", ui.selected(), ["California Roll"]);
  await ui.click("Selesai");
  check("confirm after caller reset cannot resurrect older target rows", rowValues(), replacement.rows);
  await ui.open();
  await act(async () => capturedSalesForm.setValue("kind", "category"));
  check("product-to-category scope reset clears old selection before confirmation", ui.selected(), []);
  check("category scope resets numeric row semantics", rowValues(), [{ itemId: "", quantity: null, amount: 0 }]);
  check("category scope exposes only actual category choices", ui.visible(), ["Sushi", "Minuman", "Paket"]);
  await act(async () => ui.toggle("Sushi")()); await ui.click("Selesai");
  check("category bulk commit cannot reuse product IDs or quantity", rowValues(), [{ itemId: "target-category-sushi", quantity: null, amount: 0 }]);
  await act(async () => capturedSalesForm.setValue("rows.0.amount", 1000000));
  await ui.open(); await act(async () => ui.toggle("Minuman")()); await ui.click("Selesai");
  check("category additions retain existing amount and initialize new row", rowValues(), [{ itemId: "target-category-sushi", quantity: null, amount: 1000000 }, { itemId: "target-category-minuman", quantity: null, amount: 0 }]);
  await ui.open(); await ui.search("minuman"); await ui.click("Pilih Semua"); await ui.click("Selesai");
  check("filtered category deselection preserves hidden numeric target", rowValues(), [{ itemId: "target-category-sushi", quantity: null, amount: 1000000 }]);
  await ui.open();
  await act(async () => capturedSalesForm.setValue("storeId", fixtures.TARGET_STORES[1].value));
  check("store scope reset clears prior shop selection while open", ui.selected(), []);
  check("store scope exposes only actual new-shop choices", ui.visible(), ["Makanan", "Minuman"]);
  await act(async () => ui.toggle("Makanan")()); await ui.click("Selesai");
  check("new-shop commit carries only current-shop category ID", rowValues(), [{ itemId: "target-category-makanan", quantity: null, amount: 0 }]);
  await ui.open(); await act(async () => ui.toggle("Makanan")()); await ui.click("Selesai");
  check("empty bulk selection retains one blank row required by caller", rowValues(), [{ itemId: "", quantity: null, amount: 0 }]);
  check("bulk operations never invoke final target save", saveCalls, []);
  check("production helpers retain selected category total", actualHelpers.targetTotals([{ itemId: "target-category-sushi", quantity: null, amount: 1000000 }]), { amount: 1000000, quantity: 0 });
  await act(async () => renderer.unmount());
}

async function main() {
  try {
    auditContract();
    await siblingFields();
    await salesTarget();
    check("no unexpected React runtime or act errors", errors, []);
    check("all source/dependency/handoff inputs unchanged", Object.fromEntries(Object.keys(before).map(file => [file, fingerprint(file)])), before);
    const result = { status: "PASS", count: checks.length, checks, unexpectedErrors: errors, actualProductionModules: [...loaded.keys()], inputFingerprints: before, scope: "StrictMode production MultiSelect/SearchBar + installed RHF Controller/useForm/useFieldArray/useWatch + actual SalesTargetForm/helper/schema/constants; native/UI/Form control/store-save/format adapters; no full-screen/native/API/submit certification" };
    fs.writeFileSync(path.join(__dirname, "independent-results.json"), JSON.stringify(result, null, 2) + "\n");
    console.log(JSON.stringify({ status: result.status, count: result.count, modules: result.actualProductionModules, errors: errors.length }));
  } finally { console.error = originalError; }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
