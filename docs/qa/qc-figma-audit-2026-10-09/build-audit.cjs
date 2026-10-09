const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),ts=require('typescript');
const root=path.resolve(__dirname,'../../..'),rel=f=>path.relative(root,f).replace(/\\/g,'/'),hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(i=>i.isDirectory()?walk(path.join(dir,i.name)):[path.join(dir,i.name)]);
const sourceFiles=[...walk(path.join(root,'app')),...walk(path.join(root,'components')),...walk(path.join(root,'lib/ui'))].filter(f=>/\.[cm]?[jt]sx?$/.test(f));
for(const f of ['constants/Colors.ts','constants/Fonts.ts','tailwind.config.js','tailwind.config.ts','global.css'])if(fs.existsSync(path.join(root,f)))sourceFiles.push(path.join(root,f));
const fingerprints=[...new Set(sourceFiles)].sort().map(f=>({file:rel(f),sha256:hash(f)}));
const mapping=new Map(),refs=[];
const M='app/(no-layout)/manage/',I='app/(no-layout)/inventory/',B='app/(no-layout)/(back-office)/';
function map(file,ids,proof,note=''){assert(fs.existsSync(path.join(root,file)),file);mapping.set(file,{ids:ids.map(String),proof,note});}
function triple(dir,ids,proof,note=''){for(const [file,list] of Object.entries(ids))map(dir+file+'.tsx',list,proof,note);}
function ref(id,file,implementation,proof){assert(fs.existsSync(path.join(root,file)),file);refs.push({id,file,sha256:hash(path.join(root,file)),implementation,implementationSha256:implementation&&fs.existsSync(path.join(root,implementation))?hash(path.join(root,implementation)):null,proof,liveVerified:false});}
const inventoryProof='docs/FIGMA_PROGRESS.md';
map('app/(back-office)/inventory/index.tsx',['1:4792'],inventoryProof);
map('app/(back-office)/inventory/summary.tsx',['1:12487','1:12956'],inventoryProof,'Dua tab bahan/produk; state filter/modal belum tersertifikasi.');
map('app/(back-office)/inventory/closing-stock.tsx',['1:12401'],inventoryProof,'Senior5 sedang mengoreksi Figma; QC final menunggu handoff stabil.');
for(const [dir,index,modify,detail] of [['stock-transfer','12059','11949','12312'],['stock-adjustment','13404','13851','13605'],['purchase-order','14945','14543','14866'],['suppliers','15653','15530','15570'],['compositions','31287','31448','31480'],['bill-payments','15208','14178','26045']])triple(I+dir+'/',{index:['1:'+index],modify:['1:'+modify],detail:['1:'+detail]},inventoryProof,'Modify dapat memuat tambah/edit; acuan tambah tidak otomatis membuktikan edit.');
triple(I+'materials/',{modify:['1:29776'],detail:['1:31002']},inventoryProof,'Frame daftar bahan belum ditemukan; beberapa nama frame Figma tidak sesuai isinya.');
triple(I+'stock-movement/',{index:['1:30149','1:30441'],detail:['1:30733','1:30871']},inventoryProof);
for(const [id,short,preview] of [['4792','hub','hub'],['12487','summary-material','summary-material'],['12956','summary-product','summary-product'],['12059','transfer-list','transfer-list'],['11949','transfer-form','transfer-filled-form'],['12312','transfer-detail','transfer-created-detail'],['13404','adjustment-list','adjustment-list'],['13851','adjustment-form','adjustment-filled-form'],['13605','adjustment-detail','adjustment-detail'],['14945','purchase-list','purchase-list'],['14543','purchase-form','purchase-empty-form']])ref('1:'+id,'docs/figma/inventory/inventory-'+short+'.png','docs/previews/inventory/'+preview+'.png',inventoryProof);
for(const [dir,id] of [['faq','19624'],['feature-request','19565'],['feedback','19672']]){
 map(M+dir+'/index.tsx',['1:'+id],'docs/SUPPORT_UI_PROGRESS.md');ref('1:'+id,'docs/previews/support/'+dir+'-figma.png','docs/previews/support/'+dir+'.png','docs/SUPPORT_UI_PROGRESS.md');
}
map('app/(back-office)/manage.tsx',['1:4897'],'docs/PROJECT_CONTEXT.md');
const cache=JSON.parse(fs.readFileSync(path.join(__dirname,'cached-reference-index.json'),'utf8'));
for(const capture of cache.captures.filter(c=>c.kind==='screenshot'))refs.push({id:capture.nodeId,file:capture.file,sha256:capture.sha256,implementation:null,proof:'cached-reference-index.json',liveVerified:false});
triple(M+'workers/',{index:['1:17473'],modify:['1:17410'],detail:['1:17623']},'docs/WORKERS_UI_PROGRESS.md');
triple(B+'manage/roles/',{index:['1:17762'],modify:['1:18380'],detail:['1:17831']},'docs/ROLES_UI_PROGRESS.md');
triple(M+'member/',{index:['1:17554'],modify:['1:28370'],detail:['1:28412']},'docs/MEMBER_UI_PROGRESS.md','Nama frame berbeda; pemetaan berdasarkan teks anak yang dicatat developer, belum QC screenshot.');
triple(M+'receipt/',{index:['1:28831'],modify:['1:19070','1:19205'],preview:['1:21182']},'docs/previews/receipt/README.md');
triple(M+'place/',{index:['1:18470'],store:['1:18574'],areas:['1:29235'],modify:['1:28867'],area:['1:18846','1:28915']},'docs/previews/place/README.md','area memuat tab daftar/denah; areas merupakan form area. State tepat perlu full context.');
triple(M+'sales-target/',{index:['1:38146'],modify:['1:37807','1:37843','1:37892','1:37968','1:38004']},'docs/previews/sales-target/README.md','Detail belum memiliki acuan Figma yang ditemukan.');
triple(M+'expenses/',{index:['1:40511'],modify:['1:40481'],detail:['1:40612']},'docs/previews/expenses/README.md');
triple(M+'income/',{index:['1:40690'],modify:['1:40660'],detail:['1:40775']},'docs/previews/income/README.md');
triple(M+'payroll/',{index:['1:19722'],modify:['1:19816','1:19874','1:20417','1:20466'],detail:['1:19927'],payment:['1:19998','1:20071'],history:['1:20151','1:20382'],slip:['1:20229','1:20297']},'docs/previews/payroll/README.md','Metadata empat metode; tidak menyalin total fixture yang salah.');
// Cached page metadata supplies candidate frames, not reviewed screenshots or confirmed exact states.
const candidates={
 'app/(onboarding)/onboarding.tsx':['1:2020','1:2034','1:2048'],
 'app/(onboarding)/login.tsx':['1:2061'], 'app/(onboarding)/otp.tsx':['1:2085','1:3364'],
 'app/(onboarding)/forgot-password.tsx':['1:3396'], 'app/(onboarding)/reset-password.tsx':['1:3375'],
 'app/(onboarding)/register/index.tsx':['1:2095','1:2135','1:2175','1:2215'],
 'app/(onboarding)/register/wizard.tsx':['1:2255','1:2271','1:2277','1:2474','1:2640','1:2806','1:2974','1:3140','1:3307'],
 'app/(back-office)/home/index.tsx':['1:3437','1:3595','1:3774','1:4101','1:5080','1:6352'],
 'app/(back-office)/report/index.tsx':['1:4451','1:4558'], 'app/(back-office)/catalog/index.tsx':['1:4663']
};
const parsed=JSON.parse(fs.readFileSync(path.join(__dirname,'frame-index.json'),'utf8'));
const noFrameScopes=[['app/(absence)/history/','docs/ABSENCE_HISTORY_UI_PROGRESS.md'],[M+'integrations/','docs/EXTERNAL_INTEGRATIONS_UI_PROGRESS.md'],[M+'pos-settings/digital-orders/','docs/DIGITAL_ORDERS_UI_PROGRESS.md'],[B+'report/accounting/trial-balance.tsx','docs/qa/senior-8-2026-10-09/trial-balance/HANDOFF.md'],[M+'sales-target/detail.tsx','docs/previews/sales-target/README.md']];
const resolve=spec=>{const target=spec.startsWith('@/')?path.join(root,spec.slice(2)):spec.startsWith('.')?null:null;return target;};
const records=fingerprints.filter(f=>f.file.startsWith('app/')&&f.file.endsWith('.tsx')&&!path.basename(f.file).startsWith('_')).map(fp=>{
 const code=fs.readFileSync(path.join(root,fp.file),'utf8'),source=ts.createSourceFile(fp.file,code,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),tags=new Set(),imports=[],texts=[];
 function visit(n){if(ts.isJsxOpeningElement(n)||ts.isJsxSelfClosingElement(n))tags.add(n.tagName.getText(source));if(ts.isImportDeclaration(n)&&ts.isStringLiteral(n.moduleSpecifier))imports.push(n.moduleSpecifier.text);if(ts.isExportDeclaration(n)&&n.moduleSpecifier)imports.push(n.moduleSpecifier.text);if(ts.isJsxText(n)){const s=n.text.trim().replace(/\s+/g,' ');if(s)texts.push(s);}ts.forEachChild(n,visit);}visit(source);
 const route='/'+fp.file.replace(/^app\//,'').replace(/\([^/]+\)\//g,'').replace(/\/index\.tsx$/, '').replace(/\.tsx$/,'').replace(/^index$/,'');
 const known=mapping.get(fp.file),candidateIds=candidates[fp.file]||[],noFrame=noFrameScopes.find(([scope])=>fp.file.startsWith(scope));
 const fullReferences=known?refs.filter(r=>known.ids.includes(r.id)):[];
 const layouts=[];let dir=path.dirname(path.join(root,fp.file));while(dir.startsWith(path.join(root,'app'))){const file=path.join(dir,'_layout.tsx');if(fs.existsSync(file))layouts.unshift({file:rel(file),sha256:hash(file)});if(dir===path.join(root,'app'))break;dir=path.dirname(dir);}
 const directComponents=imports.flatMap(spec=>{const stem=spec.startsWith('@/')?resolve(spec):spec.startsWith('.')?path.resolve(path.dirname(path.join(root,fp.file)),spec):null;if(!stem)return[];const f=[stem+'.tsx',stem+'.ts',path.join(stem,'index.tsx'),path.join(stem,'index.ts')].find(fs.existsSync);return f&&rel(f).startsWith('components/')?[{file:rel(f),sha256:hash(f)}]:[];});
 const status=fullReferences.length?'REFERENCE_IMAGE_AVAILABLE_PENDING_CURRENT_COMPARISON':known?'DOCUMENTED_FRAME_PENDING_FULL_REFERENCE':candidateIds.length?'CANDIDATE_METADATA_ONLY':noFrame?'GUIDE_ONLY_NO_FRAME_DOCUMENTED':'FRAME_NOT_YET_MAPPED';
 const possibleTitleOnly=tags.size>0&&[...tags].every(t=>['Wrapper','View','Text','AnimatedWrapper'].includes(t))&&!/(use[A-Z]\w*|onPress|onChange|FormInput|FlatList)/.test(code);
 return {...fp,route,area:fp.file.includes('inventory/')?'Inventory':fp.file.includes('/manage/')||fp.file.endsWith('/manage.tsx')?'Kelola':fp.file.includes('/catalog/')?'Katalog':fp.file.includes('/report/')?'Laporan':fp.file.includes('(onboarding)')?'Akses':fp.file.includes('(absence)')?'Absensi':fp.file.includes('(cashier)')?'Kasir':fp.file.includes('(operator)')?'Operator':'Lainnya',status,visualApproved:false,frameIds:known?.ids||[],candidateFrameIds:candidateIds,mappingProof:known?.proof||noFrame?.[1]||null,note:known?.note||'',fullReferences:fullReferences.map(r=>({id:r.id,file:r.file})),directComponents,layouts,tags:[...tags],imports,visibleLiteralTexts:texts,possibleTitleOnly,unknownStates:['loading/error/empty bila berlaku','edit/validation/keyboard bila berlaku','sheet/modal/filter bila berlaku','320px/390px/landscape/native/web']};
});
const counts={screenFiles:records.length,layoutFiles:fingerprints.filter(f=>f.file.startsWith('app/')&&f.file.endsWith('/_layout.tsx')).length,sourceFiles:fingerprints.length,documentedFrameScreenFiles:records.filter(r=>r.frameIds.length).length,candidateOnlyScreenFiles:records.filter(r=>r.candidateFrameIds.length).length,referenceImageScreenFiles:records.filter(r=>r.fullReferences.length).length,referenceImageFrames:new Set(refs.map(r=>r.id)).size,visualApprovedScreenFiles:0,statuses:{},areas:{}};
for(const r of records){counts.statuses[r.status]=(counts.statuses[r.status]||0)+1;counts.areas[r.area]=(counts.areas[r.area]||0)+1;}
const audit={createdAt:new Date().toISOString(),localDate:'2026-10-09',fileKey:cache.fileKey,counts,liveAccess:{callableTools:false,pluginInstalled:false,webReadable:false},limits:['Inventaris source menyeluruh; bukan semua state aplikasi dijalankan.','Metadata halaman historis terpotong; nama frame dapat berbeda dari isinya.','Pemetaan dokumentasi/candidate bukan approval desain.','Screenshot implementasi tersimpan bersifat historis, tidak disertifikasi untuk hash source saat ini.','Angka/tanggal/jumlah record dinamis tidak wajib sama dengan fixture Figma.','Tidak ada PASS visual aplikasi terkini; shared UI Senior5 sedang berubah.'],references:refs,records};
for(const [name,data] of [['screen-inventory.json',audit],['source-fingerprints.json',fingerprints]])fs.writeFileSync(path.join(__dirname,name),JSON.stringify(data,null,2)+'\n');
const csv=(v)=>'"'+String(v??'').replace(/"/g,'""')+'"';
fs.writeFileSync(path.join(__dirname,'screen-inventory.csv'),'\uFEFF'+[['file','route','area','status','frameIds','candidateFrameIds','mappingProof','sha256','visualApproved'],...records.map(r=>[r.file,r.route,r.area,r.status,r.frameIds.join(';'),r.candidateFrameIds.join(';'),r.mappingProof,r.sha256,false])].map(row=>row.map(csv).join(',')).join('\r\n')+'\r\n');
console.log(JSON.stringify(counts,null,2));
