const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const read=file=>JSON.parse(fs.readFileSync(path.join(__dirname,file)));
const results=['sheet-results.json','integration-results.json'].map(read);
const snapshots=['sheet-snapshot.json','integration-snapshot.json'].map(read);
const callers=read('caller-results.json'),lint=read('eslint.json');
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
if(results.some(result=>result.failed||result.checks.some(check=>!check.pass))
  ||callers.failed||callers.errors.length||callers.checks.some(check=>!check.passed)
  ||snapshots.some(snapshot=>!snapshot.stable||Object.entries(snapshot.after).some(([file,expected])=>hash(file)!==expected))
  ||Object.entries(callers.after).some(([file,expected])=>hash(file)!==expected)
  ||lint.some(file=>file.errorCount||file.warningCount))throw Error('Gate failed or source changed');
const source='components/custom/CardList.tsx';
const developerRerun=results.reduce((sum,result)=>sum+result.passed,0);
const decision={id:'QC-CARDLIST-20261009-PASS-DELTA',status:'PASS_DELTA_FOR_PM_REVIEW',date:'2026-10-09',
  sources:{[source]:hash(source)},verification:{developerAssertionRerun:developerRerun,
    qcReportCallerAssertions:callers.passed,totalPassed:developerRerun+callers.passed,failed:0,runtimeActErrors:0,
    eslintErrors:0,eslintWarnings:0,biome:'PASS',diffCheck:'PASS',fullIntegrationTypecheck:'PM_PENDING'},
  report:'REPORT.md',scope:'Filter sheet/hook lifecycle delta; seven production report caller screens/builders with native/UI/control/formatter adapters',
  limitations:['No browser/native/accessibility/full router/auth/backend/report amount/Figma certification',
    'Reset immediately commits; Cancel discards subsequent draft as existing contract',
    'Full integration/publication gate belongs to PM'],handoffChannel:'Shared workspace documents; direct delivery not claimed'};
fs.writeFileSync(path.join(__dirname,'DECISION.json'),JSON.stringify(decision,null,2)+'\n');
console.log(JSON.stringify({status:decision.status,totalPassed:decision.verification.totalPassed}));
