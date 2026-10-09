// Application root command: node docs/qa/qc-barcode-2026-10-09/rerun.cjs print|picker
// Execute developer tests with independent outputs; do not overwrite handoff.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{createRequire}=require('node:module');
const suite=process.argv[2]||'print';
const entry=suite==='integration'?'incrementer/print-integration.cjs':suite==='incrementer'?'incrementer/lifecycle.cjs':'barcode-lifecycle.cjs';
const original=path.resolve('docs/qa/senior-7-2026-10-09',entry);
const source=fs.readFileSync(original,'utf8');
const scope=['components/feature/barcode/PrintBarcodeModal.tsx','components/feature/barcode/ProductPickerSheet.tsx','components/custom/Incrementer.tsx'];
const hashFiles=()=>Object.fromEntries(scope.map(file=>[file,crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')]));
const before=hashFiles();
process.on('exit',()=>{const after=hashFiles();fs.writeFileSync(path.join(__dirname,`${process.argv[2]||'print'}-snapshot.json`),JSON.stringify({before,after,stable:JSON.stringify(before)===JSON.stringify(after),harnessSha256:crypto.createHash('sha256').update(source).digest('hex')},null,2));});
const mod={exports:{}};
const localRequire=createRequire(original);
const wrappedRequire=id=>localRequire(id);
wrappedRequire.main=mod;
new Function('require','module','__dirname','__filename',source)(wrappedRequire,mod,__dirname,original);
