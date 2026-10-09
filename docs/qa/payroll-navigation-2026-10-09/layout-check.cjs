const fs = require('node:fs');
const assert = require('node:assert/strict');
const path = require('node:path');
const crypto = require('node:crypto');
const ts = require('typescript');
const file = 'app/(no-layout)/manage/payroll/_layout.tsx';
const source = fs.readFileSync(file, 'utf8');
const checks = [], calls = [];
let hasHistory = false;
let focused = true;
const router = {
  canGoBack: () => hasHistory,
  back: () => calls.push(['back']),
  replace: destination => calls.push(['replace', destination]),
};
const moduleObject = { exports: {} };
const output = ts.transpileModule(source, { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
new Function('require', 'module', 'exports', output)(name => {
  if (name === 'expo-router') return { router };
  if (name === 'expo-router/react-navigation') return { useIsFocused: () => focused };
  if (name === 'react-native') return { View: 'View', StyleSheet: { create: styles => styles } };
  if (name === '@/components/common/Header') return { default: 'Header' };
  if (name === '@/components/custom/JSStack') return { JSStack: Object.assign(() => {}, { Screen: 'Screen' }), ScaleBackTransition: {} };
  return require(name);
}, moduleObject, moduleObject.exports);
assert.equal(moduleObject.exports.unstable_settings.initialRouteName, 'index');
checks.push('Cold deep links anchor the Payroll list');
const layout = moduleObject.exports.default();
const screens = layout.props.children;
assert.deepEqual(screens.map(screen => screen.props.name), ['index', 'detail', 'modify', 'payment', 'history', 'slip']);
checks.push('All six existing routes remain registered');
for (const screen of screens) {
  const header = screen.props.options.header();
  focused = true;
  assert.equal(header.type(header.props).props.style.pointerEvents, 'auto');
  focused = false;
  assert.equal(header.type(header.props).props.style.pointerEvents, 'none');
  checks.push(`${screen.props.name}: only the focused header accepts pointer input`);
  const back = header.props.back;
  assert.equal(typeof back, 'function');
  calls.length = 0;
  hasHistory = false;
  back();
  assert.deepEqual(calls, [['replace', screen.props.name === 'index' ? '/(back-office)/manage' : '/(no-layout)/manage/payroll']]);
  checks.push(`${screen.props.name}: empty stack has a reachable fallback without pushing another entry`);
  calls.length = 0;
  hasHistory = true;
  back();
  assert.deepEqual(calls, [['back']]);
  checks.push(`${screen.props.name}: existing history is preserved by back`);
}
const result = { status: 'PASS', passed: checks.length, checks, source: file, sha256: crypto.createHash('sha256').update(source).digest('hex'), scope: 'Actual Payroll layout and callbacks executed with router/Header/JSStack doubles; not browser/native runtime.', checkedAt: new Date().toISOString() };
fs.writeFileSync(path.join(__dirname, 'layout-results.json'), JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
