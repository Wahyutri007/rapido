const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const files=[
 'app/(no-layout)/manage/sales-target/_layout.tsx','app/(no-layout)/manage/sales-target/index.tsx','app/(no-layout)/manage/sales-target/detail.tsx','app/(no-layout)/manage/sales-target/modify.tsx',
 'components/feature/manage/sales-target/SalesTargetForm.tsx','components/feature/manage/sales-target/SalesTargetDetail.tsx','store/salesTargetStore.ts','schema/manage/sales-target.ts','lib/manage/sales-target.ts','types/ui/manage/sales-target.ts','constants/data/manage/sales-target.ts',
 'components/common/Header.tsx','components/common/Wrapper.tsx','components/common/BottomActionBar.tsx','components/common/BottomActionButton.tsx','components/common/Form.tsx','components/common/SearchBar.tsx','components/common/MultiSelect.tsx','components/common/SingleSelect.tsx','components/common/SuccessModal.tsx','components/common/DeleteConfirmModal.tsx','components/custom/DetailBottomActions.tsx','components/custom/CatalogItemCard.tsx','components/custom/DetailRow.tsx','components/custom/ItemActionSheet.tsx','components/custom/JSStack.tsx','lib/ui/figma-stock.ts',
 'app/_layout.tsx','app/(no-layout)/_layout.tsx','app/(no-layout)/manage/_layout.tsx','app/(back-office)/_layout.tsx','app/(back-office)/manage.tsx','hooks/useProtectedRoute.ts','context/AuthContext.tsx','lib/storage.ts',
 'tsconfig.json','babel.config.js','metro.config.js','package.json','package-lock.json','global.css','tailwind.config.js','node_modules/react-native-css-interop/.cache/web.css'
];
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const snapshot=path.join(__dirname,'source-inputs.json');
if(process.argv.includes('--capture')){assert.ok(!fs.existsSync(snapshot),'Snapshot already exists; preserve history.');fs.writeFileSync(snapshot,JSON.stringify({capturedAt:new Date().toISOString(),owned:['app/(no-layout)/manage/sales-target/_layout.tsx'],inputs:files.map(file=>({file,sha256:hash(file)})),scope:'Selected navigation/feature/UI/auth/build inputs, not the entire app import graph.'},null,2)+'\n');}
else{const s=JSON.parse(fs.readFileSync(snapshot));for(const item of s.inputs)assert.equal(hash(item.file),item.sha256,item.file);console.log(`PASS ${s.inputs.length} selected inputs stable.`);}
