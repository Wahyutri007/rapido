// Use the same isolated production entry, with additional QC route-parameter cases.
const fs = require("node:fs");
const path = require("node:path");
const original = fs.readFileSync(path.join(__dirname, "check.cjs"), "utf8");
const start = original.indexOf("    for (const c of configs) {");
const end = original.indexOf("    check('Preview does not write to an API'");
if (start < 0 || end < start) throw Error("Browser runner boundary missing");
const scenarios = String.raw`
    const params = async id => {
      await page.evaluate(id => window.qcManageSetParams(id), id);
      await page.waitForTimeout(250);
    };
    const values = () => page.locator('input').evaluateAll(inputs => inputs.map(input => input.value));
    for (const c of configs) {
      console.log('QC params '+c.name);
      await go(c.name, '1');
      const name = page.locator('input').first();
      await page.waitForFunction(expected => document.querySelector('input')?.value === expected, c.original);
      check(c.name+': initial snapshot uses record 1', await name.inputValue() === c.original);
      await name.fill('QC '+c.name);
      const numeric = c.name === 'extra' ? 1 : c.name === 'payment-method' ? 1 : c.name === 'tax' ? 2 : null;
      if (numeric !== null) await page.locator('input').nth(numeric).fill('17');
      const draft = await values();
      await page.evaluate(() => window.manageRerender());
      check(c.name+': same-ID params preserve every text/numeric draft', JSON.stringify(await values()) === JSON.stringify(draft));
      await page.getByRole('button', {name:'Periksa Data',exact:true}).click();
      await page.getByText('Data '+c.title.toLowerCase()+' valid',{exact:true}).waitFor();
      check(c.name+': preview result states changes are unsaved', await page.getByText('Data form telah diperiksa. Perubahan pada pratinjau ini belum disimpan.',{exact:true}).count() === 1);
      await params(undefined);
      await page.waitForFunction(() => document.querySelector('input')?.value === '');
      check(c.name+': setParams edit to create resets every draft field', (await values()).every(value => value === '' || value === '0'));
      check(c.name+': identity change disposes previous result modal', await page.getByText('Data '+c.title.toLowerCase()+' valid',{exact:true}).count() === 0);
      await page.getByRole('button', {name:'Periksa Data',exact:true}).click();
      await page.getByText(c.message,{exact:true}).first().waitFor();
      await params(['1', 'missing']);
      await page.waitForFunction(expected => document.querySelector('input')?.value === expected, c.original);
      check(c.name+': array parameter uses first supplied ID', await name.inputValue() === c.original);
      check(c.name+': identity change clears previous required-field errors', await page.getByText(c.message,{exact:true}).count() === 0);
      await params('');
      await page.getByText('Data '+c.title.toLowerCase()+' tidak ditemukan',{exact:true}).waitFor();
      check(c.name+': empty setParams ID blocks form and action', await page.locator('input').count() === 0 && await page.getByRole('button',{name:'Periksa Data',exact:true}).count() === 0);
      await params('1');
      await page.waitForFunction(expected => document.querySelector('input')?.value === expected, c.original);
      check(c.name+': valid ID recovers from not-found state', await name.inputValue() === c.original);
      await page.screenshot({path:path.join(output,'qc-'+c.name+'-params.png')});
    }
`;
const code = (original.slice(0, start) + scenarios + original.slice(end))
	.replace("path.join(output,'results.json')", "path.join(output,'independent-results.json')")
	.replace("Four production modify routes with isolated Expo Router and list fixtures", "Independent QC setParams, scalar draft, modal/error reset and array-ID cases on four production routes with isolated Expo Router and list fixtures");
fs.writeFileSync(path.join(__dirname, "independent.cjs"), code);
