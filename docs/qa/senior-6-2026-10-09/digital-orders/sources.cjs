const fs=require('node:fs');
exports.owned=['schema/manage/digital-order-channel.ts','store/digitalOrderChannelStore.ts','types/ui/manage/digital-order-channel.ts',...fs.readdirSync('components/feature/manage/digital-orders').filter(f=>f.endsWith('.tsx')).map(f=>'components/feature/manage/digital-orders/'+f),...fs.readdirSync('app/(no-layout)/manage/pos-settings/digital-orders').filter(f=>f.endsWith('.tsx')).map(f=>'app/(no-layout)/manage/pos-settings/digital-orders/'+f)];
exports.shared=['app/(no-layout)/manage/pos-settings/index.tsx','app/(no-layout)/manage/pos-settings/_layout.tsx'];
exports.read=['components/feature/manage/ManageListActions.tsx','components/feature/manage/settings/ManageFormNotFound.tsx'];
