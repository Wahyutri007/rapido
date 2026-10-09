// Records final source stability and the strictly scoped decision for PM.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {execFileSync} = require('node:child_process');
const verification = JSON.parse(fs.readFileSync(path.join(__dirname,'verification.json'),'utf8'));
const store = JSON.parse(fs.readFileSync(path.join(__dirname,'store-results.json'),'utf8'));
const files = verification.after.map(item=>({...item,finalSha256:crypto.createHash('sha256').update(fs.readFileSync(item.file)).digest('hex')}));
if (files.some(item=>item.finalSha256!==item.sha256) || verification.commands.some(item=>item.exitCode!==0) || store.failed || store.errors.length) throw Error('Evidence failed or reviewed source changed; no approval recorded.');
const reruns = ['catalog','ledger','balance'].map(kind=>JSON.parse(fs.readFileSync(path.join(__dirname,kind+'-results.json'),'utf8')));
if (reruns.some(result=>result.runtimeErrors.length)) throw Error('Runtime error in regression evidence.');
const decision = {
  code:'QC-S8-20261009-PASS-DELTA',status:'PASS_DELTA_FOR_PM_REVIEW',date:'2026-10-09',timezone:'Asia/Jakarta',
  headContext:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),
  scope:'Only the five-file Senior 8 memoization/subscription/balance lifecycle delta; source diff versus acba0d9. No blanket feature/production/main approval.',
  files:files.map(item=>({file:item.file,sha256:item.finalSha256})),
  qa:{rerunDeveloperScenarios:reruns.reduce((total,item)=>total+item.checks.length,0),independentProductionStoreAssertions:store.passed,total:reruns.reduce((total,item)=>total+item.checks.length,0)+store.passed,failed:0,runtimeErrors:0},
  lint:{errors:0,warnings:7},sourceStable:true,jsxUnchanged:verification.jsxChecks.every(item=>item.unchangedFinalJSX),
  openLegacyIssues:['QC-S8-LEGACY-001 filtered zero summary fallback','QC-S8-LEGACY-002 period filter unused','Existing UI rule violations and mock fallbacks outside delta'],
  pendingIntegrationGates:['PM coordinated final TypeScript/lint snapshot','Full application/native/Figma/backend feature checks as applicable'],
  delivery:'Workspace REPORT.md and SESSION_COORDINATION.md; no claim that other-session recipient has read it.',
};
fs.writeFileSync(path.join(__dirname,'DECISION.json'),JSON.stringify(decision,null,2)+'\n');
console.log(JSON.stringify({code:decision.code,status:decision.status,qa:decision.qa}));
