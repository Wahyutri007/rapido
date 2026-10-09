const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const integration='D:/Rapido-QC-temp/pm-main-2026-10-09';
const original='C:/Users/Wahyu/Downloads/rapido-dev/rapido-dev';
const name='pm-delete-same-drive-2026-10-09',packet=path.join(original,'docs/qa',name),candidateDir=path.join(packet,'proposal');
assert(!fs.existsSync(packet),'New review namespace required');fs.mkdirSync(candidateDir,{recursive:true});
const prior=path.join(original,'docs/qa/qc-delete-modal-2026-10-09');
for(const file of ['offline-build.cjs','offline-transport.cjs','modal-entry.fixture.jsx','orientation.cjs','browser.cjs','web.css'])fs.copyFileSync(path.join(prior,file),path.join(packet,file));
const candidate=fs.readFileSync(path.join(integration,'components/common/DeleteConfirmModal.tsx'));fs.writeFileSync(path.join(candidateDir,'DeleteConfirmModal.tsx'),candidate);
const hashes={};for(const relative of ['components/feature/manage/roles/RoleDeleteDialog.tsx','components/feature/manage/workers/WorkerDeleteDialog.tsx','components/feature/manage/member/MemberDeleteDialog.tsx','components/ui/modal/index.tsx','components/ui/button/index.tsx','components/common/Text.tsx']){
 const a=fs.readFileSync(path.join(original,relative)),b=fs.readFileSync(path.join(integration,relative));assert(a.equals(b),relative);hashes[relative]=crypto.createHash('sha256').update(b).digest('hex');
}
let build=fs.readFileSync(path.join(packet,'offline-build.cjs'),'utf8');
build=build.replace("path.join(root,'.expo/qc-delete-offline',mode)","path.join('D:/Rapido-QC-temp/pm-delete-same-drive-2026-10-09',mode)").replace("path.join(root,'.expo/qc-delete-offline/current')","'D:/Rapido-QC-temp/pm-delete-same-drive-2026-10-09/current'");
const resolvedFiles=new Set();
build=build.replace("const resolve=name=>context.resolveRequest(webContext,name,platform);","const resolve=name=>{const result=context.resolveRequest(webContext,name,platform);if(result.filePath)runtimeFiles.add(result.filePath);for(const file of result.filePaths??[])runtimeFiles.add(file);return result;};");
build=build.replace("const config=getDefaultConfig(root)","const runtimeFiles=new Set([entryFile]);const config=getDefaultConfig(root)");
build=build.replace("const output=path.join(own,'entry.bundle.js');", "fs.writeFileSync(path.join(packet,'runtime-inputs.json'),JSON.stringify([...runtimeFiles].sort().map(file=>({file,sha256:hash(file)})),null,2)+'\\n');const output=path.join(own,'entry.bundle.js');");
fs.writeFileSync(path.join(packet,'offline-build.cjs'),build);
let transport=fs.readFileSync(path.join(packet,'offline-transport.cjs'),'utf8');
transport=transport.replace("path.resolve(root,'.expo/qc-delete-offline',mode,'assets.json')","path.join('D:/Rapido-QC-temp/pm-delete-same-drive-2026-10-09',mode,'assets.json')");fs.writeFileSync(path.join(packet,'offline-transport.cjs'),transport);
fs.writeFileSync(path.join(original,'.expo/qc-delete-proposal-entry.jsx'),fs.readFileSync(path.join(packet,'modal-entry.fixture.jsx'),'utf8').replaceAll('"../','"../../../'));
fs.writeFileSync(path.join(packet,'integration-binding.json'),JSON.stringify({scope:'Same-drive build fixture contains bytes applied to isolated integration checkout; shared application source unchanged.',integrationCandidateSha256:crypto.createHash('sha256').update(candidate).digest('hex'),sharedCallerMatches:hashes,reason:'Metro file-map package resolution failed for cross-drive dependency junction; failed attempts retained in isolated integration packet.'},null,2)+'\n');
console.log(JSON.stringify({packet,candidateHash:crypto.createHash('sha256').update(candidate).digest('hex')}));
