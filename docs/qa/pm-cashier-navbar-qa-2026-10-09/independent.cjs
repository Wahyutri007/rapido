const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');

const root = process.env.QA_SOURCE_ROOT ? path.resolve(process.env.QA_SOURCE_ROOT) : path.resolve(__dirname, '../../..');
const ts = require(path.join(root, 'node_modules/typescript'));
const reactRoot = path.join(root, '.expo/senior7-test-tools/node_modules');
const React = require(path.join(reactRoot, 'react'));
const { create, act } = require(path.join(reactRoot, 'react-test-renderer'));
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const cryptoHash = file => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex');
const owned = [
  'components/custom/BottomTab.tsx',
  'app/(cashier)/_layout.tsx',
  'app/(no-layout)/(cashier)/catalog/index.tsx',
  'app/_layout.tsx',
];
const before = Object.fromEntries(owned.map(file => [file, cryptoHash(file)]));
const cashierAssets = ['home.svg', 'report.svg', 'catalog.svg', 'location.svg', 'bills.svg'];
const assetHashes = Object.fromEntries(cashierAssets.map(file => [`assets/images/cashier/navigation/${file}`, cryptoHash(`assets/images/cashier/navigation/${file}`)]));
const checks = [];
const nav = [];
const renderErrors = [];
const adapterWarnings = [];
const oldConsoleError = console.error;
console.error = (...args) => {
  const message = String(args[0]);
  if (message.includes('react-test-renderer is deprecated')) return;
  if (message.includes('An update to %s inside a test was not wrapped in act')) { adapterWarnings.push(message); return; }
  renderErrors.push(args.map(String).join(' '));
};
function check(name, fn) {
  try { fn(); checks.push({ name, result: 'PASS' }); }
  catch (error) { checks.push({ name, result: 'FAIL', detail: String(error?.stack || error) }); }
}
function loadTs(file, mockRequire, extra = {}) {
  const exports = {};
  const js = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), {
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText;
  vm.runInNewContext(js, { exports, require: mockRequire, ...extra }, { filename: file });
  return exports;
}
let width = 320, bottom = 0, hapticCount = 0, tabCaptures = [];
const scale = { get: () => 1, set: () => {} };
const jsxRuntime = require(path.join(reactRoot, 'react/jsx-runtime'));
const nativeMock = { View: 'View', Pressable: 'Pressable', RefreshControl: 'RefreshControl', ScrollView: 'ScrollView', useWindowDimensions: () => ({ width }) };
const simpleRequire = name => {
  if (name === 'react') return React;
  if (name === 'react/jsx-runtime') return jsxRuntime;
  if (name === 'react-native') return nativeMock;
  if (name === 'react-native-reanimated') return { default: { View: 'AnimatedView' }, __esModule: true, useAnimatedStyle: fn => fn(), useSharedValue: () => scale, withSequence: () => 1, withSpring: () => 1 };
  if (name === 'expo-image') return { Image: 'Image' };
  if (name === 'expo-router') {
    const Tabs = props => React.createElement('TabsRoot', null, props.children);
    Tabs.Screen = props => React.createElement('TabsScreen', props);
    return { useRouter: () => ({ push: href => nav.push(['push', href]) }), Tabs, router: { push: href => nav.push(['push', href]) } };
  }
  if (name === 'expo-router/js-tabs') return {};
  if (name === 'react-native-safe-area-context') return { useSafeAreaInsets: () => ({ top: 0, bottom, left: 0, right: 0 }) };
  if (name === '@/components/common/Text') return { default: 'Text', __esModule: true };
  if (name === '@/constants/Colors') return { Colors: require(path.join(root, 'constants/Colors.ts')).Colors };
  if (name === '@/lib/haptics') return { haptic: { selection: () => hapticCount++ } };
  if (name === '@/lib/ui/figma-stock') return { figmaStockShadows: { tab: { boxShadow: 'back-office-shadow' } } };
  if (name === '@expo/vector-icons') return { Feather: 'Feather' };
  if (name === '@/components/common/Header') return { default: 'Header', __esModule: true };
  if (name === '@/components/icons') return { ReportIcon: 'ReportIcon', Table: 'Table' };
  if (name.endsWith('.svg')) return name;
  throw new Error(`Unexpected import ${name}`);
};
const bottomTab = loadTs('components/custom/BottomTab.tsx', simpleRequire);
const layout = loadTs('app/(cashier)/_layout.tsx', name => {
  if (name === '@/components/custom/BottomTab') return { default: bottomTab.default, __esModule: true };
  return simpleRequire(name);
});
function getLayoutOptions() {
  const rootElement = layout.default();
  return React.Children.toArray(rootElement.props.children).map(child => ({ name: child.props.name, options: child.props.options }));
}
const layoutScreens = getLayoutOptions();
const routes = layoutScreens.map((screen, i) => ({ name: screen.name, key: `route-${i}` }));
const descriptors = Object.fromEntries(layoutScreens.map((screen, i) => [routes[i].key, { options: { ...screen.options, ...(screen.options.customHref ? { customHref: screen.options.customHref } : {}) } }]));
function renderTab(appearance = 'cashier', index = 0, ds = descriptors, routeSet = routes) {
  let tree;
  act(() => { tree = create(React.createElement(bottomTab.default, { appearance, state: { routes: routeSet, index }, descriptors: ds, navigation: { navigate: name => nav.push(['navigate', name]) } })); });
  return tree;
}

// 1. Actual layout owns five accessible cashier labels and opts into the cashier appearance.
check('Cashier layout supplies five expected labels and cashier appearance', () => {
  assert.deepEqual(layoutScreens.map(x => x.options.tabBarLabel), ['Beranda', 'Laporan', 'Katalog', 'Tempat', 'Tagihan']);
  const tabs = React.Children.toArray(layout.default().props.children);
  assert.equal(tabs.length, 5);
  assert.equal(layout.default().props.tabBar({}).props.appearance, 'cashier');
});

// 2..5. Actual BottomTab style geometry at narrow/landscape widths and safe-area boundaries.
check('Cashier narrow and landscape bounds at bottom insets 0 and 48: height and five fixed-width cells fit', () => {
  for (const [w, inset, expected] of [[320, 0, 96], [320, 48, 112], [844, 0, 96], [844, 48, 112]]) {
    width = w; bottom = inset;
    const tree = renderTab();
    const outer = tree.root.findAllByType('View')[0];
    assert.equal(outer.props.style.height, expected);
    const inner = tree.root.findAllByType('View')[1];
    const style = inner.props.style[0];
    assert.equal(style.paddingTop, 16);
    assert.equal(style.paddingBottom, Math.max(32, inset));
    const items = tree.root.findAllByType('Pressable');
    assert.equal(items.length, 5);
    assert.equal(w - 32 >= 5 * 48, true);
    items.forEach(item => assert.equal(item.props.style.width, 48));
    tree.unmount();
  }
});
width = 390; bottom = 0;

// 6..10. Real selected tab rendering, icon asset mapping, navigation and haptics.
for (let i = 0; i < 5; i++) {
  check(`Selected cashier tab ${i} exposes its label, selected accessibility state and matching icon`, () => {
    const tree = renderTab('cashier', i);
    const items = tree.root.findAllByType('Pressable');
    assert.equal(items.length, 5);
    assert.equal(items[i].props.accessibilityRole, 'tab');
    assert.equal(items[i].props.accessibilityLabel, ['Beranda', 'Laporan', 'Katalog', 'Tempat', 'Tagihan'][i]);
    assert.equal(items[i].props.accessibilityState.selected, true);
    assert.equal(items.filter(n => n.props.accessibilityState.selected).length, 1);
    const images = tree.root.findAllByType('Image');
    assert.equal(images.length, 5);
    assert.match(images[i].props.source, new RegExp(`cashier/navigation/${['home','report','catalog','location','bills'][i]}\\.svg$`));
    const beforeHaptic = hapticCount;
    act(() => items[i].props.onPress());
    assert.equal(hapticCount, beforeHaptic + 1);
    const expected = i === 2 ? ['push', '/(no-layout)/(cashier)/catalog'] : ['navigate', routes[i].name];
    assert.deepEqual(nav.at(-1), expected);
    act(() => tree.unmount());
  });
}

// 11. Hidden route options are applied by actual BottomTab.
check('Hidden tabs (null customHref, display none, null custom button) are omitted', () => {
  const ds = { ...descriptors,
    [routes[0].key]: { options: { ...descriptors[routes[0].key].options, customHref: null } },
    [routes[1].key]: { options: { ...descriptors[routes[1].key].options, tabBarItemStyle: { display: 'none' } } },
    [routes[4].key]: { options: { ...descriptors[routes[4].key].options, tabBarButton: () => null } },
  };
  const tree = renderTab('cashier', 2, ds);
  assert.equal(tree.root.findAllByType('Pressable').length, 2);
  act(() => tree.unmount());
});

// 12..13. Existing default and Back Office figma modes are mounted and compared by style contract.
check('Default appearance keeps legacy height, old icon callbacks and no tab accessibility override', () => {
  const legacyDs = Object.fromEntries(routes.map((r, i) => [r.key, { options: { tabBarLabel: `Legacy ${i}`, tabBarIcon: props => React.createElement('LegacyIcon', props) } }]));
  const tree = renderTab('default', 0, legacyDs);
  assert.equal(tree.root.findAllByType('View')[0].props.style.height, 68);
  assert.equal(tree.root.findAllByType('LegacyIcon').length, 5);
  const items = tree.root.findAllByType('Pressable');
  assert.equal(items.length, 5);
  items.forEach(n => assert.equal(n.props.accessibilityRole, undefined));
  act(() => tree.unmount());
});
check('Back Office figma appearance keeps legacy figma height and untinted icons', () => {
  const boRoutes = ['home', 'report', 'catalog', 'inventory', 'manage'].map((name, i) => ({ name, key: `bo-${i}` }));
  const boDs = Object.fromEntries(boRoutes.map((r, i) => [r.key, { options: { tabBarLabel: `BO ${i}`, tabBarIcon: () => null } }]));
  const tree = renderTab('figma', 0, boDs, boRoutes);
  assert.equal(tree.root.findAllByType('View')[0].props.style.height, 93);
  const images = tree.root.findAllByType('Image');
  assert.equal(images.length, 5);
  images.forEach(n => assert.equal(n.props.tintColor, undefined));
  tree.root.findAllByType('Pressable').forEach(n => assert.equal(n.props.accessibilityRole, undefined));
  act(() => tree.unmount());
});

// Catalog actual mount with local adapters for menu data/components and Expo navigation.
let footerInset = 0, menuViewRenders = 0, checkoutPress;
const fixture = [{ id: 'ui-menu-fixture' }];
const catalogExports = loadTs('app/(no-layout)/(cashier)/catalog/index.tsx', name => {
  if (name === 'react' || name === 'react/jsx-runtime' || name === 'react-native' || name === 'react-native-safe-area-context' || name === 'expo-router' || name === '@expo/vector-icons' || name === '@/components/common/Text' || name === '@/constants/Colors' || name === '@/components/ui/button') {
    if (name === 'react-native-safe-area-context') return { useSafeAreaInsets: () => ({ top: 0, bottom: footerInset, left: 0, right: 0 }) };
    if (name === 'expo-router') return { router: { push: href => nav.push(['push', href]) } };
    if (name === '@expo/vector-icons') return { Feather: 'Feather' };
    if (name === '@/components/common/Text') return { default: 'Text', __esModule: true };
    if (name === '@/constants/Colors') return { Colors: require(path.join(root, 'constants/Colors.ts')).Colors };
    if (name === '@/components/ui/button') return { Button: 'Button', ButtonText: 'ButtonText', ButtonGroup: 'ButtonGroup' };
    return simpleRequire(name);
  }
  if (name === '@/components/feature/cashier/catalog/menu/Filter') return { CategoryFilter: 'CategoryFilter' };
  if (name === '@/components/feature/cashier/catalog/menu/MenuView') return { default: function MenuView(props) { menuViewRenders++; return React.createElement('MenuView', props); }, __esModule: true };
  if (name === '@/components/feature/cashier/catalog/menu/Search') return { default: 'MenuSearch', __esModule: true };
  if (name === '@/constants/data/menu') return { MENU_ITEMS: fixture };
  if (name === '@/lib/utils') return { formatRp: n => `Rp${n}`, tw: n => n * 4 };
  if (name === 'expo-router') return { router: { push: href => nav.push(['push', href]) } };
  throw new Error(`Unexpected catalog import ${name}`);
});
check('Actual Catalog footer mounts at insets 0, 24 and 48 keep checkout route', () => {
  for (const inset of [0, 24, 48]) {
    footerInset = inset; menuViewRenders = 0;
    let tree;
    act(() => { tree = create(React.createElement(catalogExports.default)); });
    const footer = tree.root.findAllByType('View').find(n => n.props.style?.paddingBottom === 24 + inset);
    assert.ok(footer);
    const button = tree.root.findByType('Button');
    act(() => button.props.onPress());
    assert.deepEqual(nav.at(-1), ['push', '/(no-layout)/(cashier)/cart']);
    assert.equal(tree.root.findByType('MenuView').props.data, fixture);
    act(() => tree.unmount());
  }
});
check('Catalog initial fetch effect settles without identity-triggered repeat renders', () => {
  footerInset = 24; menuViewRenders = 0;
  let tree;
  act(() => { tree = create(React.createElement(catalogExports.default)); });
  assert.equal(menuViewRenders, 2); // initial null, then one populated update
  act(() => tree.unmount());
});

// DevFab: locate the actual JSX conditional in RootLayout and independently exercise its guard truth table.
check('RootLayout DevFab source guard requires both __DEV__ and explicit env opt-in', () => {
  const rootSource = fs.readFileSync(path.join(root, 'app/_layout.tsx'), 'utf8');
  const sf = ts.createSourceFile('app/_layout.tsx', rootSource, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let guard;
  function visit(node) {
    if (ts.isJsxExpression(node) && node.expression && node.expression.getText(sf).includes('EXPO_PUBLIC_SHOW_DEV_TOOLS')) guard = node.expression.getText(sf);
    ts.forEachChild(node, visit);
  }
  visit(sf);
  assert.ok(guard);
  assert.match(guard, /__DEV__\s*&&/);
  assert.match(guard, /process\.env\.EXPO_PUBLIC_SHOW_DEV_TOOLS\s*===\s*"1"/);
  const condition = guard.slice(0, guard.indexOf('&& (')).trim();
  for (const [dev, env, expected] of [[false, '1', false], [true, undefined, false], [true, '0', false], [true, '1', true]]) {
    assert.equal(vm.runInNewContext(condition, { __DEV__: dev, process: { env: { EXPO_PUBLIC_SHOW_DEV_TOOLS: env } } }), expected);
  }
});

// Asset integrity and Back Office dependency presence; no Git/tracking assertion.
check('Five cashier SVGs retain expected local Figma-derived byte fingerprints', () => {
  const expected = {
    'assets/images/cashier/navigation/home.svg': '10406ccbd3f5e72afecee67af09cd5aae80f7daca3bd1c7d117f4e91e098117d',
    'assets/images/cashier/navigation/report.svg': '6e157504ad2367e8f70233da9d85d253c1f4b4c8320de5aaae25648991cb0c8b',
    'assets/images/cashier/navigation/catalog.svg': '914f567603f48552205297404854a1eb4980f44e4dd6a2226c606038f706434a',
    'assets/images/cashier/navigation/location.svg': '6086f8b793b4ef5096f0c2a2cfcd0a17d90bec35d6553e553423ba032800149a',
    'assets/images/cashier/navigation/bills.svg': '113ff418d52b79c06be213bb8ca4af47462b6fcc29f5d6929f3699780ba0b5b3',
  };
  assert.deepEqual(assetHashes, expected);
});
check('Existing Back Office Figma SVG import dependencies are present in this workspace', () => {
  for (const file of ['home.svg', 'report.svg', 'catalog.svg', 'inventory.svg', 'manage.svg']) {
    assert.ok(fs.existsSync(path.join(root, 'assets/images/figma/back-office', file)), file);
  }
});

const after = Object.fromEntries(owned.map(file => [file, cryptoHash(file)]));
check('All four owned source hashes remain unchanged through the replay', () => assert.deepEqual(after, before));
check('React renderer reported no unexpected errors', () => assert.deepEqual(renderErrors, []));
console.error = oldConsoleError;
const result = {
  ticket: 'PM-CASHIER-NAVBAR-QA-2026-10-09',
  result: checks.every(c => c.result === 'PASS') ? 'PASS_SCOPED' : 'CHANGES_REQUESTED',
  checks,
  counts: { total: checks.length, passed: checks.filter(c => c.result === 'PASS').length, failed: checks.filter(c => c.result === 'FAIL').length },
  ownedSourceHashes: before,
  finalOwnedSourceHashes: after,
  cashierSvgHashes: assetHashes,
  actualComponents: ['Cashier BottomTab JSX', 'Cashier _layout.tsx options', 'Catalog screen JSX/effects'],
  adapters: ['React Native host components', 'Reanimated presentation', 'safe-area values', 'Expo Router', 'catalog fixture/menu subcomponents', 'icon and haptic hosts'],
  adapterDiagnostics: { expectedAsyncActWarningsFiltered: adapterWarnings.length, unexpectedRendererErrors: renderErrors.length },
  limits: ['No native pixel, device keyboard, HP/browser, full Router, backend/payment, bundle or Figma visual certification', 'RootLayout DevFab expression condition checked from actual TSX source; full app root mount not exercised', 'Back Office Figma SVGs exist locally; tracking/publication status not checked (no Git)', 'Current cashier _layout hash includes peer Header Tempat delta; root candidate must exclude peer delta if outside approved publication scope'],
};
fs.writeFileSync(path.join(__dirname, 'independent-results.json'), JSON.stringify(result, null, 2) + '\n');
fs.writeFileSync(path.join(__dirname, 'independent.stdout.txt'), JSON.stringify({ result: result.result, ...result.counts, rendererErrors: renderErrors.length }, null, 2) + '\n');
console.log(JSON.stringify({ result: result.result, ...result.counts, rendererErrors: renderErrors.length }));
process.exitCode = result.counts.failed ? 1 : 0;
