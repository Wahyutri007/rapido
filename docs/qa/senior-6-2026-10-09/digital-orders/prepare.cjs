const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const files=['app/(no-layout)/manage/pos-settings/index.tsx','app/(no-layout)/manage/pos-settings/_layout.tsx','components/feature/manage/ManageListActions.tsx','components/feature/manage/settings/ManageFormNotFound.tsx'];
const dir=path.join(__dirname,'before');if(fs.existsSync(dir))throw new Error('Baseline exists');fs.mkdirSync(dir);
const hashes={};files.forEach((file,index)=>{const bytes=fs.readFileSync(file);hashes[file]=crypto.createHash('sha256').update(bytes).digest('hex');fs.writeFileSync(path.join(dir,index+'-'+path.basename(file)+'.txt'),bytes);});
fs.writeFileSync(path.join(__dirname,'baseline.json'),JSON.stringify(hashes,null,2)+'\n');console.log('Four baseline contracts captured.');
