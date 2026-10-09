const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { fixture, keypadFixture, loader, check, checks, errors, actionRejections } = require('./adapter.cjs');

const root = process.cwd();
const owned = [
  'app/(no-layout)/(cashier)/cart/input-money.tsx',
  'components/common/Keypad.tsx',
  'app/(no-layout)/(cashier)/cart/_layout.tsx',
  'lib/cashier/cash-input.ts',
  'lib/cashier/cash-input-theme.ts',
  'assets/images/figma/cashier/cash-input/backspace.svg',
  'schema/cashier/cash-input.ts',
];
const sha = file => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex');
const before = Object.fromEntries(owned.map(file => [file, sha(file)]));
const setup = JSON.parse(fs.readFileSync(path.join(__dirname, '../CANDIDATE_SETUP.json'), 'utf8'));
const setupFingerprintMatches = owned.every(file => setup.productionHashes[file] === before[file]);
const callers = {
  'app/(onboarding)/choose-store/pin.tsx': '1f9da1aa275426c0e4b1db06e49f9c03fccec8b288fe205c829eb30599f2532a',
  'app/(no-layout)/manage/pin.tsx': '125f120968796b6fe3529e3a93de4e9515648c6b9cc3792e502847b0fe18b2cd',
  'app/(no-layout)/order-detail/refund.tsx': '393fb9e69484f3fa702480dd53cd8f99f57eb9ba4b9c2494c5f2e3284357a8fe',
};
const hashIntegrity = {};
const route = (value, totalPrice) => ({ pathname: '/cart/input-money-confirm', params: { value, totalPrice } });
function renderedText(f) {
  return f.renderer.root.findAllByType('Text').map(n => n.children.join('')).join('|');
}
function quickButtons(f) {
  return f.renderer.root.findAllByType('Bouncy').filter(n => n.props.accessibilityLabel?.startsWith('Isi uang'));
}
function visibleQuickLabels(f) {
  return quickButtons(f).map(n => n.props.accessibilityLabel.replace(/\u00a0/g, ' '));
}
async function main() {
  if (!setupFingerprintMatches) throw new Error('HOLD_SOURCE_DRIFT: candidate source hashes differ from CANDIDATE_SETUP.json');
  let f;
  f = await fixture({ totalPrice: '5000', value: '50000' });
  check('route prefill remains 50000 and groups displayed digits', [f.value(), renderedText(f).includes('50.000')], ['50000', true]);
  check('quick total and Rp200000 preset are both visible for lower total', visibleQuickLabels(f), ['Isi uang Rp 5.000', 'Isi uang Rp 200.000']);
  await f.dispose();

  f = await fixture({ totalPrice: '200000' });
  check('quick total equal to preset is deduplicated', visibleQuickLabels(f), ['Isi uang Rp 200.000']);
  await f.dispose();
  f = await fixture({ totalPrice: undefined });
  check('unavailable total shows no quick shortcuts', visibleQuickLabels(f), []);
  check('unavailable total explicitly explains return to order', renderedText(f).includes('Total pembayaran belum tersedia. Kembali ke pesanan.'), true);
  await f.dispose();

  f = await fixture({ totalPrice: '5000', value: '50000' });
  const beforeAmount = f.value();
  const quick = quickButtons(f).find(n => n.props.accessibilityLabel.replace(/\u00a0/g, ' ') === 'Isi uang Rp 5.000');
  await f.invoke(async () => quick.props.onPress());
  check('quick total button synchronizes controlled form value and permits exact total', [beforeAmount, f.value(), f.enabled()], ['50000', '5000', true]);
  await f.submit();
  check('exact total routes once with unchanged total and received amount', f.routes, [route(5000, 5000)]);
  await f.dispose();

  f = await fixture({ totalPrice: '100000' });
  const preset = quickButtons(f).find(n => n.props.accessibilityLabel.replace(/\u00a0/g, ' ') === 'Isi uang Rp 200.000');
  await f.invoke(async () => preset.props.onPress());
  check('preset above total writes displayed amount to form', [f.value(), f.enabled()], ['200000', true]);
  await f.dispose();

  f = await fixture({ totalPrice: '5000', value: '50000' });
  const path = [];
  for (const key of ['BACK', '7', 'C', 'BACK']) { await f.press(key); path.push(f.value()); }
  check('controlled prefill backspace append clear and empty-backspace lifecycle', path, ['5000', '50007', '', '']);
  check('clear resets RHF-controlled amount and disables Bayar', [f.enabled(), f.routes], [false, []]);
  await f.dispose();

  f = await fixture({ totalPrice: '5000' });
  await f.type('4999');
  check('amount below required total cannot continue', f.enabled(), false);
  await f.submit();
  check('below-total submit never routes and shows validation message', [f.routes.length, f.message().includes('tidak boleh kurang')], [0, true]);
  await f.dispose();

  f = await fixture({ totalPrice: undefined, value: '50000' });
  await f.submit();
  check('missing total fails closed instead of using subtotal or zero', [f.enabled(), f.routes, f.message().includes('Total pembayaran belum tersedia')], [false, [], true]);
  await f.dispose();

  const rejectedTotals = [];
  for (const [label, total] of [['negative', '-1'], ['fractional', '1.5'], ['duplicate params', ['5000', '6000']], ['unsafe integer', '9007199254740992']]) {
    f = await fixture({ totalPrice: total, value: '9000' });
    await f.submit();
    rejectedTotals.push([label, f.enabled(), f.routes.length]);
    await f.dispose();
  }
  check('negative, fractional, duplicate and unsafe totals all fail closed', rejectedTotals, [['negative', false, 0], ['fractional', false, 0], ['duplicate params', false, 0], ['unsafe integer', false, 0]]);

  f = await fixture({ totalPrice: '0', value: '1' });
  await f.submit();
  check('explicit zero total remains distinct and positive received amount may continue', f.routes, [route(1, 0)]);
  await f.dispose();
  f = await fixture({ totalPrice: '0', value: '0' });
  check('received amount zero remains invalid even when total is explicitly zero', f.enabled(), false);
  await f.dispose();

  f = await fixture({ totalPrice: '5000' });
  await f.type('9007199254740992');
  check('unsafe received amount stays visible for correction but cannot continue', [f.value(), f.enabled()], ['9007199254740992', false]);
  await f.dispose();
  f = await fixture({ totalPrice: '5000' });
  await f.type('12345678901234567');
  check('rapid keypad input obeys 16 digit cap', f.value().length, 16);
  await f.dispose();

  f = await fixture({ totalPrice: '5000', value: '10000' });
  const old = f.saved();
  await f.local({ totalPrice: '5000', value: '10000', unrelated: 'new' });
  const irrelevant = f.value();
  await f.global({ totalPrice: '90000', value: '1' });
  await f.submit();
  check('irrelevant local/global params do not replace draft or total', [irrelevant, f.value(), f.routes], ['10000', '10000', [route(10000, 5000)]]);
  await f.dispose();

  f = await fixture({ totalPrice: '5000', value: '10000' });
  const stale = f.saved();
  await f.local({ totalPrice: '20000', value: '25000' });
  const fresh = [f.value(), f.enabled()];
  await f.invoke(stale);
  const staleRoutes = [...f.routes];
  await f.submit();
  check('relevant local params remount the form; stale callback blocked', [fresh, staleRoutes, f.routes], [['25000', true], [], [route(25000, 20000)]]);
  await f.dispose();

  f = await fixture({ totalPrice: '5000', value: '10000' });
  const oldSubmit = f.saved();
  await f.focus(false);
  const disabledOnBlur = f.enabled();
  await f.invoke(oldSubmit);
  const blurRoutes = [...f.routes];
  const beforeBlurKey = f.value();
  await f.press('1');
  await f.focus(true);
  check('blur blocks stale submission and key writes; refocus retains current draft', [disabledOnBlur, blurRoutes, beforeBlurKey, f.value()], [false, [], beforeBlurKey, beforeBlurKey]);
  await f.dispose();

  f = await fixture({ totalPrice: '5000', value: '10000' });
  const detached = f.saved();
  await f.dispose();
  await f.invoke(detached);
  check('unmounted callback cannot navigate', f.routes, []);

  f = await fixture({ totalPrice: '5000', value: '10000' });
  await f.submit(2);
  check('double submit creates one confirmation route', f.routes, [route(10000, 5000)]);
  await f.dispose();

  f = await fixture({ totalPrice: '5000', value: '10000' });
  f.env.failNavigation = true;
  await f.submit();
  const retryError = f.message().includes('Coba lagi');
  f.env.failNavigation = false;
  await f.submit();
  check('navigation rejection releases submit lock for retry', [retryError, f.routes], [true, [route(10000, 5000)]]);
  await f.dispose();

  const insetStyles = [];
  for (const inset of [0, 24, 48]) {
    f = await fixture({ totalPrice: '5000', value: '5000' }, { insets: { top: 0, right: 12, bottom: inset, left: 8 } });
    const footer = f.renderer.root.findAllByType('View').find(n => n.props.style?.paddingBottom === 30 + inset);
    insetStyles.push([inset, footer?.props.style]);
    await f.dispose();
  }
  check('actual screen footer safe-area style at bottom insets 0/24/48', insetStyles, [0, 24, 48].map(inset => [inset, { paddingTop: 10, paddingBottom: 30 + inset, paddingLeft: 28, paddingRight: 32 }]));

  f = await fixture({ totalPrice: '5000', value: '5000' });
  const image = f.renderer.root.findByType('Image');
  check('cash keypad uses 32px decorative Figma backspace asset', [image.props.style, image.props.accessibilityElementsHidden, image.props.importantForAccessibility], [{ width: 32, height: 32 }, true, 'no-hide-descendants']);
  check('cash keypad presents four 68/69px key rows', f.renderer.root.findAllByType('View').filter(n => [68, 69].includes(n.props.style?.height)).map(n => n.props.style.height), [68, 68, 69, 68]);
  await f.dispose();

  const legacy = await keypadFixture(false, { maxLength: 4, nullable: true });
  const sequence = [legacy.value()];
  for (const key of ['1', '2', 'BACK', 'C']) { await legacy.press(key); sequence.push(legacy.value()); }
  check('default legacy Keypad remains uncontrolled nullable with expected sequence', sequence, [null, '1', '12', '1', null]);
  const findHost = node => node?.type === 'Key' ? node : (node?.children || []).map(findHost).find(Boolean);
  check('default legacy Keypad keeps its legacy 62px height utility', findHost(legacy.tree())?.props.className?.includes('h-[62px]'), true);
  await legacy.dispose();

  const schema = loader({ router: {}, local: {}, global: {}, focused: true })(
    'schema/cashier/cash-input.ts',
  );
  const quickUtils = loader({ router: {}, local: {}, global: {}, focused: true })(
    'lib/cashier/cash-input.ts',
  );
  check('schema and parser boundaries for whole Rupiah safe integers', [
    schema.parseCashAmount('9007199254740991'), schema.parseCashAmount('9007199254740992'),
    schema.parseCashAmount('1.5'), schema.parseCashRouteAmount(['10', '20']),
  ], [9007199254740991, null, null, null]);
  check('shortcut derivation handles missing, exact and preset collision', [
    quickUtils.getCashQuickAmounts(null), quickUtils.getCashQuickAmounts(5000), quickUtils.getCashQuickAmounts(200000), quickUtils.getCashQuickAmounts(200001),
  ], [[], [5000, 200000], [200000], [200001]]);

  for (const [file, expected] of Object.entries(callers)) {
    const actual = sha(file);
    hashIntegrity[file] = { expected, actual, unchanged: actual === expected };
    check(`caller fingerprint integrity only: ${file}`, actual, expected);
  }

  const after = Object.fromEntries(owned.map(file => [file, sha(file)]));
  check('all seven candidate owned source and asset hashes are unchanged', after, before);
}

main().catch(error => errors.push(error.stack || String(error))).finally(() => {
  const result = {
    ticket: 'PM-CASHIER-CASH-INPUT-PUBLICATION-001',
    result: !setupFingerprintMatches ? 'HOLD_SOURCE_DRIFT' : checks.every(item => item.passed) && !errors.length && !actionRejections.length ? 'PASS_SCOPED' : 'CHANGES_REQUESTED',
    counts: { behavior: checks.length - 4, callerFingerprintIntegrity: 3, total: checks.length, passed: checks.filter(item => item.passed).length, failed: checks.filter(item => !item.passed).length },
    checks,
    runtimeErrors: errors,
    actionRejections,
    candidateOwnedSourceHashesBefore: before,
    candidateOwnedSourceHashesAfter: Object.fromEntries(owned.map(file => [file, sha(file)])),
    candidateSetupFingerprintMatches: setupFingerprintMatches,
    legacyCallerHashes: hashIntegrity,
    actual: ['input-money screen', 'RHF/Zod schema and resolver', 'cash Keypad', 'cash-input helper/theme', 'default legacy Keypad'],
    adapters: ['React Native host and layout presentation', 'Expo Router replace/local route params', 'focus state', 'safe-area values', 'icons/image', 'BouncyPressable/haptics', 'Button/Form child components'],
    limits: ['No real navigation stack, native keyboard/haptics/screen reader, device/browser/Figma visual parity, backend quote or payment completion', 'Caller hashes establish unchanged source bytes only; they are not rendered PIN/refund regression tests', 'Frontend route validation is not server authorization of order total']
  };
  const out = path.join(__dirname, 'independent-results.json');
  fs.writeFileSync(out, JSON.stringify(result, null, 2) + '\n');
  fs.writeFileSync(path.join(__dirname, 'independent.stdout.txt'), JSON.stringify({ result: result.result, counts: result.counts, runtimeErrors: errors.length, actionRejections: actionRejections.length }, null, 2) + '\n');
  console.log(JSON.stringify({ result: result.result, counts: result.counts, runtimeErrors: errors.length, actionRejections: actionRejections.length }));
  process.exitCode = result.result === 'PASS_SCOPED' ? 0 : 1;
});
