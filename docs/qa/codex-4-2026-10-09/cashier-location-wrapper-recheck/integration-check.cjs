const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict'), crypto = require('node:crypto');
const read = file => fs.readFileSync(file,'utf8').replaceAll('\r\n','\n').replace(/^\uFEFF/,'');
const checks = [];
const base = path.join(__dirname,'../cashier-location/before');
assert.equal(read('app/(cashier)/_layout.tsx'),read(path.join(base,'cashier-layout.tsx')).replace('name="location/index"\n\t\t\t\toptions={{\n\t\t\t\t\theaderShown: false,','name="location/index"\n\t\t\t\toptions={{\n\t\t\t\t\theader: () => <Header title="Tempat Kasir" />,'));
checks.push('Cashier tabs delta contains only the location header option');
assert.equal(read('app/(no-layout)/(cashier)/_layout.tsx'),read(path.join(base,'cashier-no-layout.tsx')).replace('\t\t\t<JSStack.Screen name="cart" options={{ headerShown: false }} />','\t\t\t<JSStack.Screen name="cart" options={{ headerShown: false }} />\n\t\t\t<JSStack.Screen name="location" options={{ headerShown: false }} />'));
checks.push('Cashier no-layout delta contains only location child registration');
const contracts = JSON.parse(read(path.join(base,'readonly-inputs.json')));
const overlay = { file:'components/common/Wrapper.tsx', oldSha256:'e7917179ca0df4fe312e50bcec99f2921231072b17d5b42d4eae358a4844d8a4', newSha256:'753ae276e8204d1345ffb95cadc78b383a5295e3fb78693a56c07369a2a040a8', ownerScope:'Concurrent shared safe-area footer change, not edited or approved by Codex-4' };
for(const item of contracts) { const expected=item.Path.replaceAll('\\','/').endsWith('/'+overlay.file)?overlay.newSha256.toUpperCase():item.Hash; assert.equal(crypto.createHash('sha256').update(fs.readFileSync(item.Path)).digest('hex').toUpperCase(),expected,item.Path); }
const original=JSON.parse(read(path.join(__dirname,'../cashier-location/verification.json')));for(const file of original.sourceFiles){const item=original.fingerprints.find(row=>row.file===file);assert.equal(crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),item.sha256,file);}
checks.push('Eight original read-only contracts unchanged; Wrapper overlay753ae recorded; ten owned sources unchanged');
const result = {status:'PASS',passed:checks.length,checks,overlay,checkedAt:new Date().toISOString(),scope:'Exact scoped integration deltas and selected read-only contracts; other concurrent source files excluded.'};
fs.writeFileSync(path.join(__dirname,'integration-results.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));

