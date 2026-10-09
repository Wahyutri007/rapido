const fs=require('node:fs'),path=require('node:path');
for(const [name,source]of [['cash','pm-cashier-cash-input-layout-publication-2026-10-10'],['bills','pm-cashier-bills-publication-2026-10-10']]){
 const origin=path.resolve('docs/qa',source),target=path.join(__dirname,'regressions',name);
 fs.mkdirSync(target,{recursive:true});fs.cpSync(path.join(origin,'preview-fixture'),path.join(target,'preview-fixture'),{recursive:true});
 for(const file of fs.readdirSync(path.join(target,'preview-fixture'))){const p=path.join(target,'preview-fixture',file);fs.writeFileSync(p,fs.readFileSync(p,'utf8').replaceAll('../../../../','@/'));}
 fs.copyFileSync(path.join(__dirname,'build-browser.cjs'),path.join(target,'build-browser.cjs'));
 fs.copyFileSync(path.join(origin,'browser.cjs'),path.join(target,'browser.cjs'));
 for(const file of ['offline-browser.cjs','QC_BILLS_BROWSER.json'])if(fs.existsSync(path.join(origin,file)))fs.copyFileSync(path.join(origin,file),path.join(target,file));
}
console.log('Fresh regression fixtures prepared; historical packets preserved.');
