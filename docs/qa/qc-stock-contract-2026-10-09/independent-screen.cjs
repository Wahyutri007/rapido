const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ts = require('typescript');
const React = require(path.resolve('.expo/senior7-test-tools/node_modules/react'));
const {create, act} = require(path.resolve('.expo/senior7-test-tools/node_modules/react-test-renderer'));
global.IS_REACT_ACT_ENVIRONMENT = true;
const errors = [], checks = [];
const error = console.error;
console.error = (...args) => {
  if (String(args[0]).includes('react-test-renderer is deprecated')) return;
  errors.push(args.map(String).join(' ')); error(...args);
};
const check = (name, actual, expected) => {
  assert.deepEqual(structuredClone(actual), structuredClone(expected), name);
  checks.push({name, passed: true});
};
let fixture, renderer;
const defaults = value => ({__esModule: true, default: value});
const api = new Proxy({}, {get: (_, name) => (_args, options) => {
  if (String(name).includes('Mutation')) return {isLoading: !!fixture.saving, call: async payload => { fixture.calls.push(structuredClone(payload)); return [undefined, fixture.failure ? {status: 500} : undefined]; }};
  const domain = name === 'useMenusQuery' ? 'menus' : name === 'useCategoriesQuery' ? 'categories' : 'settings';
  fixture.queryOptions.push({name, enabled: options?.enabled ?? true});
  return {data: fixture[domain], isPending: !!fixture[domain+'Pending'], isError: !!fixture[domain+'Error'], refetch: () => fixture.retries.push(domain)};
}});
const stubs = {
  react: React, 'react-native': {View: 'View', Pressable: 'Pressable', Switch: 'Switch', Image: 'Image'},
  'expo-router': {router: {push: route => fixture.routes.push(route)}},
  '@expo/vector-icons/Feather': defaults('Feather'), '@expo/vector-icons/Entypo': defaults('Entypo'),
  'lucide-react-native': {ArrowUpDown: 'ArrowUpDown'},
  '@/constants/Colors': {Colors: {primary: 'blue', zinc: {400: 'gray'}}},
  '@/lib/utils': {cn: (...values) => values.filter(Boolean).join(' ')},
  '@/components/common/Text': defaults('Text'), '@/components/common/Wrapper': defaults('Wrapper'),
  '@/components/common/Card': defaults('Card'), '@/components/common/BouncyPressable': defaults('BouncyPressable'),
  '@/components/common/BottomActionButton': defaults('BottomActionButton'),
  '@/components/common/AlertModal': defaults('AlertModal'),
  '@/components/common/SuccessModal': {...defaults('SuccessModal'), useAlertModal: () => {const openState = React.useState(false); return {openState, open: () => openState[1](true), close: () => openState[1](false)};}},
  '@/components/common/SortActionSheet': defaults('SortActionSheet'),
  '@/components/ui/actionsheet': Object.fromEntries(['Actionsheet', 'ActionsheetBackdrop', 'ActionsheetContent', 'ActionsheetDragIndicator', 'ActionsheetDragIndicatorWrapper', 'ActionsheetScrollView'].map(name => [name, name])),
  '@/components/ui/button': {Button: 'Button', ButtonText: 'ButtonText'},
  '../icons': {FilterIcon: 'FilterIcon'}, '../ui/input': {Input: 'Input', InputField: 'InputField'},
};
const loaded = new Map();
function load(file) {
  if (loaded.has(file)) return loaded.get(file);
  const module = {exports: {}};
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.React, esModuleInterop: true}}).outputText;
  new Function('module', 'exports', 'require', code)(module, module.exports, name => {
    if (name in stubs) return stubs[name];
    if (name.startsWith('@/api/hooks/')) return api;
    if (name === '@/components/common/SearchBar') return load('components/common/SearchBar.tsx');
    throw Error(`Unexpected dependency ${name} from ${file}`);
  });
  loaded.set(file, module.exports); return module.exports;
}
const Screen = load('app/(no-layout)/manage/pos-settings/stock-limit.tsx').default;
const category = {enabled: true, type: 'hybrid', content_type: 'category', details: [{stockable_id: 'shared-id', stockable_type: 'category'}]};
const item = {enabled: true, type: 'hybrid', content_type: 'item', details: [{stockable_id: 'shared-id', stockable_type: 'menu'}]};
const nodeText = node => {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  return node?.children?.map(nodeText).join('') ?? '';
};
const controls = () => {
  const root = renderer.root;
  const sheet = () => root.findByType('Actionsheet');
  const press = label => root.findAll(node => ['Pressable', 'BouncyPressable', 'Button'].includes(node.type)).find(node => nodeText(node).includes(label));
  const row = label => sheet().findAllByType('Pressable').find(node => node.findAllByType('Text').some(text => nodeText(text) === label));
  return {
    open: () => root.findByType('BouncyPressable').props.onPress(),
    row, sheet, press,
    visible: () => sheet().findByType('ActionsheetScrollView').findAllByType('Pressable').map(node => node.findAllByType('Text')[0].props.children),
    selected: () => sheet().findByType('ActionsheetScrollView').findAllByType('Pressable').filter(node => node.findAllByType('Feather').some(icon => icon.props.name === 'check')).map(node => node.findAllByType('Text')[0].props.children),
    input: () => sheet().findByType('InputField'),
    save: () => root.findByType('BottomActionButton').props.onPress(),
  };
};
async function initialize(settings = category, patch = {}) {
  if (renderer) await act(async () => renderer.unmount());
  fixture = {settings, menus: [{id: 'shared-id', name: 'Menu Shared', image: 'fixture-image'}, {id: 'menu-only', name: 'Menu Only'}], categories: [{id: 'shared-id', name: 'Kategori Shared'}, {id: 'category-only', name: 'Kategori Only'}], calls: [], retries: [], routes: [], queryOptions: [], ...patch};
  await act(async () => {renderer = create(React.createElement(React.StrictMode, null, React.createElement(Screen)));});
}
async function update(patch) {Object.assign(fixture, patch); await act(async () => renderer.update(React.createElement(React.StrictMode, null, React.createElement(Screen))));}
const invoke = action => act(async () => {await action();});
async function main() {
  await initialize();
  let c = controls(); await invoke(c.open);
  check('same textual ID renders category label and selection', [c.visible(), c.selected()], [['Kategori Shared', 'Kategori Only'], ['Kategori Shared']]);
  await update({settings: item});
  check('open picker preserves category kind despite same-ID item refetch', [c.visible(), c.sheet().props.isOpen], [['Kategori Shared', 'Kategori Only'], true]);
  await invoke(() => c.input().props.onChangeText('oNlY'));
  check('production SearchBar immediately filters case-insensitively', c.visible(), ['Kategori Only']);
  await invoke(() => c.row('Kategori Only').props.onPress());
  await invoke(() => c.press('Selesai').props.onPress());
  await invoke(c.save);
  check('category commit preserves pair across same-ID cross-kind refetch', fixture.calls.at(-1), {enabled: true, type: 'hybrid', content_type: 'category', stockable_ids: ['shared-id', 'category-only']});
  await invoke(c.open);
  check('actual SearchBar reset when reopening committed picker', [c.input().props.value, c.visible(), c.selected()], ['', ['Kategori Shared', 'Kategori Only'], ['Kategori Shared', 'Kategori Only']]);
  await invoke(c.sheet().props.onClose);
  check('backdrop closes sheet without changing saved pair', [c.sheet().props.isOpen, fixture.calls.length], [false, 1]);

  await initialize(); c = controls(); await invoke(c.open);
  await update({settings: item}); await invoke(() => c.press('Batal').props.onPress()); await invoke(c.save);
  check('cancel accepts latest untouched item pair with same textual ID', fixture.calls.at(-1), {enabled: true, type: 'hybrid', content_type: 'item', stockable_ids: ['shared-id']});
  await invoke(c.open);
  check('fresh item picker uses menu options after category cancel', [c.visible(), c.selected()], [['Menu Shared', 'Menu Only'], ['Menu Shared']]);
  const image = c.sheet().findByType('Image').props.source;
  check('menu image URL comes from actual option', image, {uri: 'fixture-image'});
  await invoke(c.sheet().props.onClose);

  await initialize(item); c = controls(); await invoke(c.open);
  const sharedToggle = c.row('Menu Shared').props.onPress, onlyToggle = c.row('Menu Only').props.onPress;
  await invoke(() => {sharedToggle(); onlyToggle();});
  check('batched distinct item toggles use functional updates', c.selected(), ['Menu Only']);
  await invoke(() => {onlyToggle(); onlyToggle();});
  check('batched same item twice preserves previous selection', c.selected(), ['Menu Only']);
  await invoke(() => c.press('Selesai').props.onPress());
  await update({settings: category, menus: [], failure: true});
  await invoke(c.save);
  check('failure/refetch/empty list preserve committed item IDs', fixture.calls.at(-1), {enabled: true, type: 'hybrid', content_type: 'item', stockable_ids: ['menu-only']});
  check('failed save shows error without success', [renderer.root.findByType('AlertModal').props.openState[0], renderer.root.findByType('SuccessModal').props.openState[0]], [true, false]);

  await initialize(category, {saving: true}); c = controls();
  await invoke(c.save);
  check('direct save handler is blocked while mutation pending', fixture.calls.length, 0);
  check('CTA carries actual pending flag', renderer.root.findByType('BottomActionButton').props.isLoading, true);
  await update({saving: false}); await invoke(c.save);
  check('save resumes after pending guard clears', fixture.calls.length, 1);

  for (const unavailable of [{settingsPending: true}, {settingsError: true}]) {
    await initialize(undefined, {settings: undefined, ...unavailable}); c = controls();
    await invoke(() => {c.open(); return c.save();});
    check(`${Object.keys(unavailable)[0]} direct callbacks are blocked`, [fixture.calls.length, c.sheet().props.isOpen], [0, false]);
    check(`${Object.keys(unavailable)[0]} picker and CTA disabled props`, [renderer.root.findByType('BouncyPressable').props.disabled, renderer.root.findByType('BottomActionButton').props.isDisabled], [true, true]);
  }
  await initialize(category, {settingsError: true}); c = controls(); await invoke(c.save);
  check('cached settings remain saveable during background error', fixture.calls.at(-1)?.content_type, 'category');
  await invoke(() => c.press('Baca Selengkapnya').props.onPress());
  check('detail route remains existing stock-limit-detail', fixture.routes, ['/manage/pos-settings/stock-limit-detail']);
  await initialize({...category, type: 'all', details: item.details}); c = controls(); await invoke(c.open);
  check('all mode ignores stale IDs even when stored detail kind differs', c.selected(), []);
  await invoke(c.sheet().props.onClose); await invoke(c.save);
  check('all ignores old IDs while preserving explicit category kind', fixture.calls.at(-1), {enabled: true, type: 'all', content_type: 'category', stockable_ids: []});
}
main().catch(e => {checks.push({name: e.message, passed: false, stack: e.stack}); process.exitCode = 1;}).finally(async () => {
  if (renderer) await act(async () => renderer.unmount());
  console.error = error;
  const result = {productionModules: [...loaded.keys()], strictMode: true, checks, passed: checks.filter(x => x.passed).length, failed: checks.filter(x => !x.passed).length, runtimeReactErrors: errors, limitations: 'Production screen and SearchBar, React StrictMode; query/mutation/native/UI/router/modal adapters. No actual QueryClient/Axios/server/native gesture/transaction.'};
  fs.writeFileSync(path.join(__dirname, 'independent-screen-results.json'), JSON.stringify(result, null, 2)+'\n');
  console.log(`${result.passed} independent screen checks passed; ${result.failed} failed; ${errors.length} React errors`);
  if (errors.length) process.exitCode = 1;
});
