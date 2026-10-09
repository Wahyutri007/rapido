const fs = require('node:fs');
exports.owned = ['lib/absence-history.ts',
 ...fs.readdirSync('components/feature/absence/history').filter(f => f.endsWith('.tsx')).map(f => 'components/feature/absence/history/'+f),
 ...fs.readdirSync('app/(absence)/history').filter(f => f.endsWith('.tsx')).map(f => 'app/(absence)/history/'+f)];
exports.shared = ['app/(absence)/home.tsx','app/(absence)/_layout.tsx'];
exports.read = ['store/useAbsenceStore.ts','lib/manage/absence.ts','types/ui/manage/absence.ts','components/feature/manage/absence/AbsenceCommon.tsx'];
