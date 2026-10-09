// Run from application root. Developer suite results are redirected to QC output.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {createRequire}=require('node:module');
if(process.argv.includes('--baseline'))throw Error('Do not overwrite historical baseline evidence');
const developerDir=path.resolve('docs/qa/senior-7-2026-10-09/cardlist-filter');
const manifest=JSON.parse(fs.readFileSync(path.join(developerDir,'verification.json')));
const callers=JSON.parse(fs.readFileSync(path.join(developerDir,'callers.json')));
const expected=[...manifest.files,...manifest.harnesses,...manifest.evidence,...callers.files];
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
for(const file of expected)if(hash(file.file)!==file.sha256)throw Error('Handoff changed: '+file.file);
const hashes=()=>Object.fromEntries(expected.map(file=>[file.file,hash(file.file)]));
const before=hashes(),suite=process.argv[2]||'sheet';
process.on('exit',()=>{const after=hashes(),stable=JSON.stringify(before)===JSON.stringify(after);
  fs.writeFileSync(path.join(__dirname,suite+'-snapshot.json'),JSON.stringify({before,after,stable},null,2)+'\n');
  if(!stable)process.exitCode=1;
});
const original=path.join(developerDir,'lifecycle.cjs');
const source=fs.readFileSync(original,'utf8');
const output=Object.create(console);
output.log=value=>{try{const result=JSON.parse(value);console.log(JSON.stringify({suite,passed:result.passed,failed:result.failed}));}
  catch{console.log(value);}};
new Function('require','__dirname','__filename','console',source)(createRequire(original),__dirname,original,output);
