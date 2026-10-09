// Independent QC: actual shared Form controls/modal/hook and support routes;
// host native/UI controls and document picker promises are adapters.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const ts = require('typescript');
const React = require(path.resolve('.expo/senior7-test-tools/node_modules/react'));
require('react');
require.cache[require.resolve('react')].exports = React;
const { act, create } = require(path.resolve('.expo/senior7-test-tools/node_modules/react-test-renderer'));
const RHF = require('react-hook-form');
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const checks = [], errors = [], loaded = new Map(), sourceHashes = {};
const originalError = console.error;
console.error = (...args) => {
  if (String(args[0]).includes('react-test-renderer is deprecated')) return;
  errors.push(args.map(String).join(' '));
  originalError(...args);
};
const check = (name, actual, expected) => checks.push({ name, actual, expected, passed: JSON.stringify(actual) === JSON.stringify(expected) });
const host = (...names) => Object.fromEntries(names.map((name) => [name, name]));
const defaultHost = (name) => ({ __esModule: true, default: name });
let renderer, queue = [], pickerCalls = 0;
const picker = { getDocumentAsync: async () => { pickerCalls++; return await queue.shift(); } };
const native = { ...host('View', 'Pressable', 'Image', 'ScrollView'), Platform: { OS: 'web' }, Dimensions: { get: () => ({ width: 360, height: 800 }) } };
const ui = {
  button: host('Button', 'ButtonGroup', 'ButtonText'),
  input: host('Input', 'InputField', 'InputIcon'),
  radio: host('Radio', 'RadioCircleIndicator', 'RadioGroup', 'RadioLabel'),
  checkbox: host('Checkbox', 'CheckboxGroup', 'CheckboxIcon', 'CheckboxIndicator', 'CheckboxLabel'),
  textarea: host('Textarea', 'TextareaInput'),
  modal: host('Modal', 'ModalBackdrop', 'ModalBody', 'ModalContent', 'ModalFooter', 'ModalHeader'),
};
const production = new Set(['components/feature/support/SupportAttachmentInput.tsx', 'components/feature/support/SupportFormScreen.tsx', 'components/common/Form.tsx', 'components/common/AlertModal.tsx', 'hooks/useAlertModal.ts', 'schema/support.ts', 'constants/Fonts.ts', 'constants/Colors.ts', 'app/(no-layout)/manage/feedback/index.tsx', 'app/(no-layout)/manage/feature-request/index.tsx']);
function resolveFile(name, parent) {
  const base = name.startsWith('@/') ? name.slice(2) : path.relative(process.cwd(), path.resolve(path.dirname(parent), name)).replaceAll('\\', '/');
  return [base, `${base}.tsx`, `${base}.ts`].find((file) => production.has(file));
}
function load(file) {
  if (loaded.has(file)) return loaded.get(file);
  const text = fs.readFileSync(file, 'utf8');
  sourceHashes[file] = crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  const code = ts.transpileModule(text, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
  const module = { exports: {} };
  const customRequire = (name) => {
    if (name === 'react') return React;
    if (name === 'react/jsx-runtime') return require(path.resolve('.expo/senior7-test-tools/node_modules/react/jsx-runtime'));
    if (name === 'react-native') return native;
    if (name === 'expo-document-picker') return picker;
    if (name === 'expo-router') return { Link: 'Link', router: {} };
    if (name === '@react-native-community/datetimepicker') return {};
    if (name === '@expo/vector-icons/Entypo') return defaultHost('Entypo');
    if (name === '@/components/icons') return host('EFeather', 'CheckCircleIcon');
    if (name === '@/lib/utils') return { cn: (...values) => values.filter(Boolean).join(' '), tw: (n) => n * 4 };
    const resolved = resolveFile(name, file);
    if (resolved) return load(resolved);
    const uiName = name.match(/(?:^|\/)ui\/([^/]+)$/)?.[1];
    if (uiName && ui[uiName]) return ui[uiName];
    if (name.startsWith('@/components/') || name.startsWith('./') || name.startsWith('../')) return defaultHost(name.split('/').at(-1));
    return require(name);
  };
  vm.runInNewContext(code, { module, exports: module.exports, require: customRequire, console, Date, setTimeout, clearTimeout }, { filename: path.resolve(file) });
  loaded.set(file, module.exports);
  return module.exports;
}
const Screen = load('components/feature/support/SupportFormScreen.tsx').default;
const Attachment = load('components/feature/support/SupportAttachmentInput.tsx').default;
const Alert = load('components/common/AlertModal.tsx').default;
const oldFile = { uri: 'file:///qc-old.pdf', name: 'qc-old.pdf', mimeType: 'application/pdf', size: 512 };
const newFile = { uri: 'file:///qc-new.png', name: 'qc-new.png', mimeType: 'image/png', size: 1024 };
const result = (asset) => ({ canceled: false, assets: [asset] });
const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; };
const strict = (element) => React.createElement(React.StrictMode, null, element);
async function unmount() { if (renderer) await act(async () => renderer.unmount()); renderer = null; }
async function reset() { await unmount(); queue = []; pickerCalls = 0; }
async function renderScreen(mode) {
  await act(async () => {
    const element = strict(React.createElement(Screen, { mode }));
    if (renderer) renderer.update(element); else renderer = create(element);
  });
}
const form = () => renderer.root.findByType(RHF.FormProvider).props;
const title = () => renderer.root.findByType('InputField').props;
const description = () => renderer.root.findAllByType('TextareaInput').find((node) => ['Isi feedback', 'Deskripsi permintaan'].includes(node.props['aria-label'])).props;
const related = () => renderer.root.findAllByType('TextareaInput').find((node) => node.props['aria-label'] === 'Fitur atau halaman terkait').props;
const pickButton = () => renderer.root.findAllByType('Pressable').find((node) => ['Tambah lampiran', 'Ganti lampiran'].includes(node.props.accessibilityLabel)).props;
const remove = () => renderer.root.findAllByType('Pressable').find((node) => node.props.accessibilityLabel === 'Hapus lampiran').props;
const submit = () => renderer.root.findByType('BottomActionButton').props;
const modal = (label) => renderer.root.findAllByType(Alert).find((node) => node.props.title === label);
const errorModal = () => modal('Lampiran belum ditambahkan');
const unavailable = () => modal('Pengiriman belum tersedia');
const isOpen = (node) => node.findByType('Modal').props.isOpen;
const close = async (node) => { await act(async () => node.findByType('Button').props.onPress()); };
const fillControls = async () => { await act(async () => { title().onChangeText('  QC draft title  '); description().onChangeText('  QC draft description  '); }); };
const messageTexts = () => renderer.root.findAll((node) => node.type === 'Text' && typeof node.props.children === 'string').map((node) => node.props.children);
const start = async () => {
  const wait = deferred(); queue.push(wait.promise); let completion;
  await act(async () => { completion = pickButton().onPress(); });
  return { ...wait, completion };
};
const settle = async (wait, outcome) => { await act(async () => { if (outcome instanceof Error) wait.reject(outcome); else wait.resolve(outcome); await wait.completion; }); };
const defaults = { title: '', description: '', feedbackType: 'suggestion', relatedPage: '', attachment: null };
(async () => {
  for (const [file, mode, buttonText, descriptionLabel] of [
    ['app/(no-layout)/manage/feedback/index.tsx', 'feedback', 'Kirim', 'Isi feedback'],
    ['app/(no-layout)/manage/feature-request/index.tsx', 'feature-request', 'Ajukan', 'Deskripsi permintaan'],
  ]) {
    await reset();
    const Route = load(file).default;
    await act(async () => { renderer = create(strict(React.createElement(Route))); });
    check(`${mode}: production route selects mode and CTA`, [renderer.root.findByType(Screen).props.mode, submit().children, description()['aria-label']], [mode, buttonText, descriptionLabel]);
    check(`${mode}: real FormProvider defaults`, form().getValues(), defaults);
    await act(async () => submit().onPress());
    check(`${mode}: real FormMessage renders both required errors`, messageTexts().filter((text) => ['Judul wajib diisi', 'Deskripsi wajib diisi'].includes(text)).sort(), ['Deskripsi wajib diisi', 'Judul wajib diisi']);
    check(`${mode}: invalid submit leaves production modal closed`, isOpen(unavailable()), false);
    await fillControls();
    check(`${mode}: production FormInput stores typed title`, form().getValues('title'), '  QC draft title  ');
    check(`${mode}: production FormInput marks title dirty/touched`, [form().getFieldState('title').isDirty, form().getFieldState('title').isTouched], [true, true]);
    check(`${mode}: title watch and textarea reflect typed values`, [title().value, description().value], ['  QC draft title  ', '  QC draft description  ']);
    if (mode === 'feedback') {
      await act(async () => { related().onChangeText('Laporan'); renderer.root.findByType('RadioGroup').props.onChange('criticism'); });
      check('feedback: real Controllers bind radio and related page', [form().getValues('feedbackType'), form().getValues('relatedPage')], ['criticism', 'Laporan']);
    }
    queue.push(result(oldFile));
    await act(async () => pickButton().onPress());
    check(`${mode}: production attachment Controller stores selected file`, form().getValues('attachment'), oldFile);
    const draft = form().getValues();
    await act(async () => submit().onPress());
    check(`${mode}: valid submit opens actual AlertModal`, isOpen(unavailable()), true);
    check(`${mode}: delivery copy states not sent and remains available`, [unavailable().props.message.includes('belum dikirim'), unavailable().props.message.includes('Isi form tetap tersedia')], [true, true]);
    check(`${mode}: submit preserves untrimmed editable draft`, form().getValues(), draft);
    await close(unavailable());
    check(`${mode}: actual confirm button closes delivery modal`, isOpen(unavailable()), false);
    check(`${mode}: closing delivery modal preserves draft`, form().getValues(), draft);
    queue.push(result({ ...newFile, size: 5 * 1024 * 1024 + 1 }));
    await act(async () => pickButton().onPress());
    check(`${mode}: invalid replacement opens production attachment alert`, isOpen(errorModal()), true);
    check(`${mode}: oversize message and previous file retained`, [errorModal().props.message, form().getValues('attachment')], ['Ukuran lampiran maksimal 5 MB', oldFile]);
    await close(errorModal());
    check(`${mode}: real attachment alert confirm closes modal`, isOpen(errorModal()), false);
    const press = pickButton().onPress, wait = deferred(); queue.push(wait.promise);
    let first, second;
    const callCount = pickerCalls;
    await act(async () => { first = press(); second = press(); });
    check(`${mode}: actual Controller picker double event opens one`, pickerCalls - callCount, 1);
    check(`${mode}: busy accessibility matches pending`, pickButton().accessibilityState, { disabled: true, busy: true });
    await act(async () => remove().onPress());
    check(`${mode}: removing through actual Controller clears value`, form().getValues('attachment'), null);
    check(`${mode}: remove keeps native picker busy until completion`, pickButton().disabled, true);
    await act(async () => { wait.resolve(result(newFile)); await Promise.all([first, second]); });
    check(`${mode}: removed pending result cannot repopulate RHF`, form().getValues('attachment'), null);
    check(`${mode}: removed pending result opens no error modal`, isOpen(errorModal()), false);
    queue.push(result(newFile)); await act(async () => pickButton().onPress());
    check(`${mode}: retry after removed result attaches`, form().getValues('attachment'), newFile);
  }
  // A -> B -> A with two unresolved picker requests and queued callbacks.
  await reset(); await renderScreen('feedback'); await fillControls();
  queue.push(result(oldFile)); await act(async () => pickButton().onPress());
  const oldSubmit = submit().onPress, oldRemove = remove().onPress;
  const a = await start();
  await renderScreen('feature-request'); await fillControls();
  const bDraft = form().getValues();
  const b = await start();
  await renderScreen('feedback');
  check('A-B-A: returning instance has fresh full defaults', form().getValues(), defaults);
  check('A-B-A: returning instance has no inherited busy state', pickButton().disabled, false);
  await fillControls();
  queue.push(result(newFile)); await act(async () => pickButton().onPress());
  const currentDraft = form().getValues();
  await act(async () => { oldRemove(); await oldSubmit(); });
  check('A-B-A: old callbacks cannot delete current attachment or draft', form().getValues(), currentDraft);
  check('A-B-A: old submit cannot open current delivery modal', isOpen(unavailable()), false);
  await settle(b, new Error('Old B picker rejection'));
  await settle(a, result(oldFile));
  check('A-B-A: out of order old results cannot overwrite current attachment', form().getValues(), currentDraft);
  check('A-B-A: old rejection cannot show current attachment alert', isOpen(errorModal()), false);
  check('A-B-A: old completions leave current picker available', pickButton().disabled, false);
  check('A-B-A: earlier B draft was populated independently', [bDraft.title, bDraft.description, bDraft.attachment], ['  QC draft title  ', '  QC draft description  ', null]);
  // Actual async RHF resolver completion after a committed mode transition.
  await reset(); await renderScreen('feedback'); await fillControls();
  const oldModalState = unavailable().props.openState;
  let pendingValidation;
  await act(async () => {
    pendingValidation = submit().onPress();
    renderer.update(strict(React.createElement(Screen, { mode: 'feature-request' })));
  });
  await act(async () => pendingValidation);
  check('validation transition: old async valid submit cannot open new modal', isOpen(unavailable()), false);
  check('validation transition: new mode retains fresh defaults', form().getValues(), defaults);
  check('validation transition: old actual modal state was initially closed', oldModalState[0], false);
  await fillControls(); await act(async () => submit().onPress());
  check('validation transition: new lifetime remains submittable after StrictMode', isOpen(unavailable()), true);
  await renderScreen('feedback');
  check('validation transition: modal reset when switching again', isOpen(unavailable()), false);
  check('validation transition: errors reset with fresh real FormControls', [form().getFieldState('title').error, form().getFieldState('description').error], [undefined, undefined]);
  await unmount();
  const output = { owner: 'QC', ticket: 'SD3-005', createdAt: new Date().toISOString(), scope: 'Independent actual support routes/components, shared FormInput/FormField/FormMessage/FormControl, AlertModal/useAlertModal, RHF and Zod under StrictMode; native/UI/picker host adapters, no browser/native/API', passed: checks.filter((item) => item.passed).length, failed: checks.filter((item) => !item.passed).length, errors, checks, sourceHashes, loadedProductionModules: [...loaded.keys()] };
  fs.writeFileSync(path.join(__dirname, 'production-controls-results.json'), JSON.stringify(output, null, 2) + '\n');
  console.log(JSON.stringify({ passed: output.passed, failed: output.failed, errors: errors.length, loadedProductionModules: [...loaded.keys()], failures: checks.filter((item) => !item.passed).map((item) => item.name) }));
  process.exitCode = output.failed || errors.length ? 1 : 0;
})().catch((error) => { console.error(error); process.exitCode = 1; });
