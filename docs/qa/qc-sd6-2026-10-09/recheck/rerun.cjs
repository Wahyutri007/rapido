// Run from the application root. Keeps original failure evidence and developer output intact.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { createRequire } = require('node:module');
const original = path.resolve('docs/qa/senior-6-2026-10-09/lifecycle.cjs');
const files = [
  'app/(no-layout)/manage/printer/modify.tsx',
  'app/(no-layout)/manage/pos-settings/rounding.tsx',
  'app/(no-layout)/manage/pos-settings/stock-limit.tsx',
  original,
];
const hashes = () => Object.fromEntries(files.map(file => [file,
  crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')]));
const before = hashes();
const expected = JSON.parse(fs.readFileSync(path.resolve('docs/qa/senior-6-2026-10-09/results.json'))).sources;
for (const [file, hash] of Object.entries(expected)) {
  if (before[file] !== hash) throw Error('Source no longer matches final handoff: ' + file);
}
process.on('exit', () => {
  const after = hashes();
  const stable = JSON.stringify(before) === JSON.stringify(after);
  fs.writeFileSync(path.join(__dirname, 'snapshot.json'), JSON.stringify({before, after, stable}, null, 2) + '\n');
  if (!stable) process.exitCode = 1;
});
let source = fs.readFileSync(original, 'utf8');
const anchor = '\t\tassert.deepEqual(errors, []);';
if (source.split(anchor).length !== 2) throw Error('Review extension anchor before rerun');
source = source.replace(anchor, `
  const methods = [
    ['up', /Pembulatan ke Atas/, [15060, 15100, 16000]],
    ['down', /Pembulatan ke Bawah/, [15050, 15000, 15000]],
    ['nearest', /Pembulatan Terdekat/, [15060, 15100, 15000]],
  ];
  const choices = [['Puluhan (Rp10)', 1], ['Ratusan (Rp100)', 2], ['Ribuan (Rp1.000)', 3]];
  for (const [method, button, totals] of methods) {
    for (const [index, [label, exponent]] of choices.entries()) {
      await check('QC UI ' + label + ' / ' + method + ' sends exact contract', async () => {
        await render('rounding', {enabled:true, method:'nearest', decimal_places:0}, true);
        await page.locator('select').selectOption({label});
        await page.getByRole('button', {name:button}).click();
        const payload = await save();
        assert.deepEqual(payload, {enabled:true, method, decimal_places:exponent});
        roundingPayloads.push({scenario:'QC ' + label + ' / ' + method, payload,
          total:15055, expectedRounded:totals[index]});
        await close();
      });
    }
  }
  await check('QC invalid API exponent can recover through a valid choice', async () => {
    await render('rounding', {enabled:true, method:'up', decimal_places:100}, true);
    const count = await page.evaluate(() => fixture.calls.length);
    await save();
    assert.equal(await page.evaluate(() => fixture.calls.length), count);
    await close();
    await page.locator('select').selectOption({label:'Puluhan (Rp10)'});
    const payload = await save();
    assert.deepEqual(payload, {enabled:true, method:'up', decimal_places:1});
    roundingPayloads.push({scenario:'QC recover invalid exponent', payload,total:15055,expectedRounded:15060});
    await close();
  });
  await check('QC chosen exponent survives invalid refetch while untouched method updates', async () => {
    await render('rounding', {enabled:true, method:'up', decimal_places:0}, true);
    await page.locator('select').selectOption({label:'Ratusan (Rp100)'});
    await render('rounding', {enabled:true, method:'down', decimal_places:100});
    assert.equal(await page.locator('select').inputValue(), '2');
    const payload = await save();
    assert.deepEqual(payload, {enabled:true, method:'down', decimal_places:2});
    roundingPayloads.push({scenario:'QC draft survives invalid refetch',payload,total:15055,expectedRounded:15000});
    await close();
  });
  await check('QC disable and enable retain selected exponent and method', async () => {
    await render('rounding', {enabled:true, method:'down', decimal_places:0}, true);
    await page.locator('select').selectOption({label:'Ribuan (Rp1.000)'});
    await page.getByRole('button', {name:/Pembulatan ke Atas/}).click();
    await page.getByRole('checkbox').uncheck();
    assert.equal(await page.locator('select').count(), 0);
    const disabledPayload = await save();
    assert.deepEqual(disabledPayload, {enabled:false, method:'up', decimal_places:3});
    roundingPayloads.push({scenario:'QC disable retains draft',payload:disabledPayload,total:15055,expectedRounded:15055});
    await close();
    await render('rounding', {enabled:false, method:'nearest', decimal_places:2});
    await page.getByRole('checkbox').check();
    assert.equal(await page.locator('select').inputValue(), '3');
    const payload = await save();
    assert.deepEqual(payload, {enabled:true, method:'up', decimal_places:3});
    roundingPayloads.push({scenario:'QC enable retains draft',payload,total:15055,expectedRounded:16000});
    await close();
  });
${anchor}`);
new Function('require', '__dirname', '__filename', source)(createRequire(original), __dirname, original);
