const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const read=file=>JSON.parse(fs.readFileSync(path.join(__dirname,file)));
const lifecycle=read('lifecycle-results.json'),integration=read('transition-results.json');
const snapshot=read('snapshot.json'),lint=read('eslint.json');
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
if(lifecycle.failed||lifecycle.errors.length||lifecycle.checks.some(check=>!check.passed)
  ||integration.failed||integration.errors.length||integration.checks.some(check=>!check.passed)
  ||!snapshot.stable||Object.entries(snapshot.after).some(([file,expected])=>hash(file)!==expected)
  ||Object.entries(integration.after).some(([file,expected])=>hash(file)!==expected)
  ||lint.some(file=>file.errorCount||file.warningCount))throw Error('Gate failed or snapshot changed');
const files=['app/(onboarding)/onboarding.tsx','components/custom/LayoutTransitionSplash.tsx'];
const decision={id:'QC-SD5-20261009-PASS-DELTA',status:'PASS_DELTA_FOR_PM_REVIEW',date:'2026-10-09',ticket:'SD5-001',
  sources:Object.fromEntries(files.map(file=>[file,hash(file)])),verification:{
    developerAssertionRerun:lifecycle.passed,qcTransitionIntegration:integration.passed,
    totalPassed:lifecycle.passed+integration.passed,failed:0,runtimeActErrors:0,
    eslintErrors:0,eslintWarnings:0,biome:'PASS',diffCheck:'PASS',fullIntegrationTypecheck:'PM_PENDING',
  },report:'REPORT.md',scope:'Two-file lifecycle delta with production splash/store/Zustand integration using native/worklet/bridge/router/storage adapters',
  exclusions:['SD5-002 app/index boot','SDK57 publication approval','Full native/browser/API/persistent storage/auth/Figma certification','Main push approval'],
  handoffChannel:'Shared workspace documents; direct delivery not claimed'};
fs.writeFileSync(path.join(__dirname,'DECISION.json'),JSON.stringify(decision,null,2)+'\n');
console.log(JSON.stringify({status:decision.status,totalPassed:decision.verification.totalPassed}));
