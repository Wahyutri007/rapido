// Fingerprint the ready-for-review packet without rewriting historical evidence.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const directory = path.relative(process.cwd(),__dirname).replaceAll('\\','/');
const read = file => JSON.parse(fs.readFileSync(path.join(__dirname,file),'utf8'));
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const source = [
 'app/(no-layout)/(back-office)/report/accounting/general-journal/modify.tsx',
 'app/(no-layout)/(back-office)/report/accounting/adjusting-journal/modify.tsx',
 'components/feature/accounting/general-journal/JournalFormNotFound.tsx',
 'lib/accounting/journal-date.ts',
];
const dependencies = [
 'store/accountingStore.ts','types/ui/accounting/journal.ts','lib/accounting/date.ts',
 'constants/data/accounting/general-journal.ts','constants/data/accounting/adjusting-journal.ts',
 'constants/Colors.ts','constants/Fonts.ts','lib/utils/index.ts',
 'components/common/AlertModal.tsx','components/common/SuccessModal.tsx',
 'components/common/AnimatedWrapper.tsx','components/common/Wrapper.tsx',
 'components/common/Card.tsx','components/common/Text.tsx','components/common/BottomActionButton.tsx',
 'components/ui/button/index.tsx','components/ui/actionsheet/index.tsx','tsconfig.json','package.json',
];
const lifecycle=read('results.json'),date=read('date-results.json'),types=read('typecheck-results.json'),quality=read('quality-results.json');
const matches=[lifecycle,date,types].flatMap((report,index)=>Object.entries(report.sourceHashes).map(([file,expected])=>({suite:['lifecycle','date','typecheck'][index],file,expected,actual:hash(file),passed:expected===hash(file)})));
const artifacts=['HANDOFF.md','lifecycle.cjs','baseline.json','results.json','date.cjs','date-results.json','quality.cjs','quality-results.json','typecheck.cjs','typecheck-results.json','verify.cjs'];
const passed=lifecycle.failed===0&&date.failed===0&&types.exitCode===0&&quality.lint.exitCode===0&&quality.format.exitCode===0&&quality.diff.exitCode===0&&quality.renderComparisons.every(item=>item.passed)&&matches.every(item=>item.passed);
const result={
 owner:'Codex-3',ticket:'SD3-002',status:passed?'READY_FOR_QA':'CHECK_FAILED',createdAt:new Date().toISOString(),
 approval:'Developer evidence only; QA/QC and PM publication gates pending',
 results:{baseline:{passed:read('baseline.json').passed,failed:read('baseline.json').failed},lifecycle:{passed:lifecycle.passed,failed:lifecycle.failed,runtimeErrors:lifecycle.errors.length},date:{passed:date.passed,failed:date.failed},totalBehaviorChecks:lifecycle.passed+date.passed,eslintErrors:quality.lint.files.reduce((total,item)=>total+(item.errorCount||0),0),eslintWarnings:quality.lint.files.reduce((total,item)=>total+(item.warningCount||0),0),formatExitCode:quality.format.exitCode,diffExitCode:quality.diff.exitCode,typeDiagnosticCount:types.diagnostics.length},
 changedSource:Object.fromEntries(source.map(file=>[file,hash(file)])),
 readOnlyDependencyFingerprint:Object.fromEntries(dependencies.map(file=>[file,hash(file)])),
 artifactFingerprint:Object.fromEntries(artifacts.map(file=>[directory+'/'+file,hash(path.join(__dirname,file))])),
 testedSourceMatches:matches,
 commands:['node '+directory+'/lifecycle.cjs','node '+directory+'/date.cjs','node '+directory+'/quality.cjs','node '+directory+'/typecheck.cjs','node '+directory+'/verify.cjs'],
 tooling:{react:require(path.resolve('.expo/senior7-test-tools/node_modules/react/package.json')).version,renderer:require(path.resolve('.expo/senior7-test-tools/node_modules/react-test-renderer/package.json')).version,typescript:require('typescript/package.json').version,zustand:require('zustand/package.json').version},
 limitations:['Native/UI/router/picker and numeric formatting adapters in lifecycle suite; actual production route and Zustand subscriptions','No browser, full Expo Router/auth/root, SSR, native, animation, accessibility or Figma parity proof','Fixture Zustand state, no API/persistence/automatic ledger posting','Inherited raw-input/manual validation, fixture create date and unavailable web picker preserved','Date helper checks calendar seed; save date validation remains existing nonempty check','Same-editor submit guard does not make Date.now journal IDs globally unique','Focused TypeScript closure only, not full-project or PM integration gate'],
};
fs.writeFileSync(path.join(__dirname,'verification.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({status:result.status,totalBehaviorChecks:result.results.totalBehaviorChecks,fingerprintChecks:matches.length,allTestedSourceMatches:matches.every(item=>item.passed)}));
process.exitCode=passed?0:1;
