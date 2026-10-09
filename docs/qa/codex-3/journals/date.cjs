// Production helper, exercised with historical journal formats and calendar boundaries.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const crypto = require('node:crypto');
const load = file => {
 const absolute = path.resolve(file);
 const code = ts.transpileModule(fs.readFileSync(absolute, 'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const module = {exports:{}};
 vm.runInNewContext(code, {module,exports:module.exports,Date,require:name=>load(path.resolve(path.dirname(absolute),name)+'.ts')}, {filename:absolute});
 return module.exports;
};
const parse = load('lib/accounting/journal-date.ts').journalPickerDate;
const cases = [
 ['2026-06-30',[2026,6,30]], ['17 Maret 2026',[2026,3,17]],
 ['08 Oct 2025',[2025,10,8]], ['08 Okt 2025',[2025,10,8]],
 [' 8 oKt 2025 ',[2025,10,8]], ['29 Feb 2024',[2024,2,29]],
 ['29 Feb 2025',null], ['31 Apr 2026',null], ['31 April 2026',null],
 ['2026-02-29',null], ['2026-13-01',null], ['2026-00-01',null],
 ['2026-06-00',null], ['01 Jan 1899',null], ['01 Jan 2101',null],
 ['01 Jun 2026 trailing',null], ['01 Xxx 2026',null], ['',null],
 ...['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'].map((name,i)=>['01 '+name+' 2026',[2026,i+1,1]]),
 ['01 May 2026',[2026,5,1]], ['01 Aug 2026',[2026,8,1]], ['01 Dec 2026',[2026,12,1]],
];
const checks = cases.map(([input,expected])=>{
 const date=parse(input);
 const actual=date?[date.getFullYear(),date.getMonth()+1,date.getDate()]:null;
 return {input,expected,actual,passed:JSON.stringify(actual)===JSON.stringify(expected)};
});
const result={owner:'Codex-3',scope:'Production journal date parser, local calendar values; not native picker UI',passed:checks.filter(c=>c.passed).length,failed:checks.filter(c=>!c.passed).length,checks,sourceHashes:Object.fromEntries(['lib/accounting/date.ts','lib/accounting/journal-date.ts'].map(file=>[file,crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')]))};
fs.writeFileSync(path.join(__dirname,'date-results.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({passed:result.passed,failed:result.failed}));
process.exitCode=result.failed?1:0;
