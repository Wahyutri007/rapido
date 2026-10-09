// Run from application root. Reuses reviewed developer fixture harness without
// overwriting its artifacts; adds contract payload observations for QC.
const fs=require('node:fs'),path=require('node:path'),{createRequire}=require('node:module');
const original=path.resolve('docs/qa/senior-6-2026-10-09/lifecycle.cjs');
let source=fs.readFileSync(original,'utf8');
const anchor='\t\tassert.deepEqual(errors, []);';
if(!source.includes(anchor))throw Error('Developer harness changed; review extension anchor');
source=source.replace(anchor,`
  const observed=[];
  await render('rounding', {enabled:true,method:'up',decimal_places:2},true);
  observed.push({scenario:'backend exponent 2 roundtrip without edit', payload:await save()});await close();
  for(const value of ['100','1000','10']){
    await page.locator('select').selectOption(value);
    observed.push({scenario:'UI multiple '+value,payload:await save()});await close();
  }
  fs.writeFileSync(path.join(__dirname,'contract-payloads.json'),JSON.stringify(observed,null,2));
${anchor}`);
new Function('require','__dirname','__filename',source)(createRequire(original),__dirname,original);
