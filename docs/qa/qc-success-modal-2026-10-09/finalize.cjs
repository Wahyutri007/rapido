const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto'), assert = require('node:assert/strict'), {spawnSync} = require('node:child_process');
const root = __dirname;
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const write = (file, value) => fs.writeFileSync(path.join(root, file), JSON.stringify(value, null, 2) + '\n');
assert.ok(process.argv.includes('--seal'), 'Sealing requires --seal; use verify-artifacts.cjs for read-only verification.');
assert.ok(!fs.existsSync(path.join(root, 'artifact-manifest.json')), 'Packet already sealed. Never reseal historical QC evidence.');
const quality = read('quality-results.json'), before = read('source-before.json'), patch = read('proposal/patch-check.json');
const sourcePath = 'components/common/SuccessModal.tsx', sourceHash = hash(sourcePath), candidatePath = path.join(root, 'proposal/SuccessModal.tsx'), candidateHash = hash(candidatePath);
assert.equal(quality.status, 'CODE_AND_EVIDENCE_PASS');
assert.equal(quality.applicationGate, 'CHANGES_REQUESTED');
assert.equal(quality.sourceHash, sourceHash);
assert.equal(sourceHash, before.hashes[sourcePath]);
assert.equal(sourceHash, hash(path.join(root, 'SuccessModal.reviewed.tsx.txt')));
assert.equal(quality.proposalHash, candidateHash);
assert.equal(candidateHash, hash('.expo/qc-success-modal-candidate.tsx'));
assert.equal(patch.sourceHash, sourceHash);
assert.equal(patch.testedCandidateLFHash, candidateHash);
assert.equal(patch.expectedAppliedHashPreservingSourceEOL, candidateHash);
assert.equal(patch.patchHash, hash(path.join(root, 'proposal/success-modal-height.patch')));
assert.equal(patch.applyCheck.exitCode, 0);
assert.equal(patch.applied, false);
assert.equal(quality.totalCurrentPassed, 255);
assert.equal(quality.totalCurrentFailed, 9);
assert.equal(quality.proposalRegression.totalPassed, 270);
assert.equal(quality.proposalRegression.totalFailed, 0);
assert.equal(quality.focusedTypecheck.diagnostics, 0);
assert.equal(quality.proposalBiomeOutputUnchanged, true);
assert.equal(quality.trackedFilesStable.length, 40);
for (const item of quality.trackedFilesStable) assert.equal(hash(item.testedPath), item.expected, 'Tracked reviewed input drift: ' + item.file);
for (const item of quality.historicalMatches) assert.equal(hash(item.file), item.expected, 'Historical evidence drift: ' + item.file);
assert.equal(quality.historicalMatches.length, 211);
for (const item of quality.fixtureMatches) assert.equal(hash(item.file), item.expected);
for (const item of quality.runtimeMatches) assert.equal(hash(item.file), item.expected);
for (const item of quality.proposalRuntimeMatches) assert.equal(hash(item.testedPath), item.expected);
for (const item of read('typecheck-results.json').sourceHashes) assert.equal(hash(item.file), item.sha256);
const fixturePairs = [
  ['.expo/qc-success-modal-entry.jsx', 'modal-entry.fixture.jsx'],
  ['.expo/qc-success-stock-entry.jsx', 'stock-reviewed-entry.fixture.jsx'],
  ['.expo/qc-success-stock-review-screen.tsx', 'stock-reviewed-contract.tsx.txt'],
  ['.expo/qc-success-proposal-entry.jsx', 'proposal/modal-entry.fixture.jsx'],
  ['.expo/qc-success-stock-proposal-entry.jsx', 'proposal/stock-entry.fixture.jsx'],
  ['.expo/qc-success-stock-screen.tsx', 'proposal/stock-screen.fixture.tsx.txt'],
];
for (const [actual, archived] of fixturePairs) assert.equal(hash(actual), hash(path.join(root, archived)));
for (const [name, directory] of [['Role', 'roles'], ['Worker', 'workers'], ['Member', 'member']]) {
  const file = '.expo/qc-success-' + name.toLowerCase() + '-dialog.tsx';
  const archived = path.join(root, 'proposal/' + name + 'DeleteDialog.fixture.tsx.txt');
  assert.equal(hash(file), hash(archived));
  const restored = fs.readFileSync(file, 'utf8').replace('./qc-success-modal-candidate', '@/components/common/SuccessModal');
  assert.equal(restored, fs.readFileSync('components/feature/manage/' + directory + '/' + name + 'DeleteDialog.tsx', 'utf8'));
}
const sourceOrientation = read('orientation-current/results.json'), proposalOrientation = read('orientation-proposal/results.json');
assert.equal(sourceOrientation.sourceHash, sourceHash);
assert.equal(proposalOrientation.sourceHash, candidateHash);
assert.equal(sourceOrientation.fixtureHash, hash('.expo/qc-success-modal-entry.jsx'));
assert.equal(proposalOrientation.fixtureHash, hash('.expo/qc-success-proposal-entry.jsx'));
assert.equal(sourceOrientation.failed, 9);
assert.equal(proposalOrientation.passed, 27);
assert.equal(proposalOrientation.failed, 0);
assert.equal(read('orientation-proposal/initial-results.json').fixtureHash, hash(path.join(root, 'proposal/initial-modal-entry.fixture.jsx')));
const stock = read('stock-final/browser-results.json');
assert.equal(stock.executionMode, 'REVIEWED_STOCK_CONTRACT_WITH_CURRENT_SUCCESSMODAL');
const server = spawnSync('powershell.exe', ['-NoProfile', '-Command', 'Get-NetTCPConnection -State Listen -LocalPort 8088,8001 | Select-Object LocalPort,OwningProcess | ConvertTo-Json -Compress'], {encoding:'utf8'});
assert.equal(server.status, 0);
const ports = JSON.parse(server.stdout.replace(/^\uFEFF/, ''));
assert.ok(ports.some(x => x.LocalPort === 8088 && x.OwningProcess === 9200));
assert.ok(ports.some(x => x.LocalPort === 8001 && x.OwningProcess === 24116));
const capturedAt = new Date().toISOString();
const cachePath = 'node_modules/react-native-css-interop/.cache/android.js';
assert.equal(hash(cachePath), before.hashes[cachePath]);
const externalContext = quality.externalContextChanges.map(item => ({...item, finalObserved:hash(item.file), certified:false}));
const liveStockPath = quality.stockIsolation.stock.sourcePath;
write('runtime-preservation.json', {capturedAt, readOnly:true, ports, qcRestartedOrStopped:false, androidCache:{path:cachePath,before:before.hashes[cachePath],after:hash(cachePath),unchanged:true}, externalOwnerContext:externalContext, liveStock:{file:liveStockPath,finalObserved:hash(liveStockPath),approved:false,owner:'Senior 6',testedContract:quality.stockIsolation.stock.reviewedHash}});
const initialQuality = read('initial-quality-results.json');
assert.equal(initialQuality.status, 'FAILED');
assert.equal(initialQuality.proposalBiome.exitCode, 1);
assert.equal(hash(path.join(root, 'initial-proposal-biome.out.txt')), candidateHash);
write('harness-notes.json', {capturedAt, initialQualityPreserved:true, initialFailureFile:'initial-quality-results.json', notes:[
  {kind:'HARNESS_PROTOCOL',observed:'Biome stdin check exited 1 while returning exactly the tested candidate bytes',correction:'check --write --stdin-file-path returns contents on stdout only; require identical bytes',applicationEdit:false,candidateHashChanged:false,evidence:['initial-proposal-biome.out.txt','initial-proposal-biome.err.txt','quality-results.json']},
  {kind:'EXTERNAL_SOURCE_DRIFT',owner:'Senior 6',observed:'Live Stock changed during modal review',correction:'Restore exact initial Stock contract from the copy, retain actual production SuccessModal import, and replay 36 checks',applicationEdit:false,liveStockApproved:false,evidence:['stock-isolation.json','stock-initial-browser-results.json','stock-final/browser-results.json']},
  {kind:'EXTERNAL_CONTEXT_DRIFT',owner:'Senior 7',observed:externalContext,correction:'Record and exclude configuration from modal approval, preserve initial snapshot; no config require or restart',applicationEdit:false,configurationApproved:false},
  {kind:'COUNTING',observed:'Initial proposal orientation 21 PASS retained',correction:'Only final 27 orientation assertions counted; candidate total270, overlapping suites disclosed'},
  {kind:'PROPOSAL_PREPARATION',observed:'Raw copy formatted before execution; recipe anchors validated before producing regression fixtures',correction:'Executed candidate hash is7508; raw copy hash is provenance only',applicationFailure:false,rawCandidateHash:read('proposal-before.json').candidateRawHash,testedCandidateHash:candidateHash},
]});
const failures = sourceOrientation.checks.filter(x => !x.passed).map(x => x.name);
const longMeasurements = sourceOrientation.measurements.filter(x => x.label.startsWith('long-')).map(x => ({label:x.label,viewport:x.viewport,modal:x.modal,action:x.action,visibleHeight:x.visibleHeight}));
const limits = ['Browser RN Web only; no physical-phone orientation/scroll certification','No keyboard/font-scaling/arbitrary virtual-list/full accessibility certification','No full router/auth/backend/persistence approval','No full-project TypeScript check','Figma tools unavailable to this QC session; no parity claim','88-caller historical inventory is static evidence; only representative actual callers executed','Latest Stock source and Senior 7 configuration excluded; separate handoffs','Latest Alert/DeleteConfirm tested as dependencies; no overall delta approval for those modules'];
const decision = {
  owner:'QC',ticket:'SD3-007',signal:'QC-SUCCESS-20261009-CHANGES-REQUESTED',status:'CHANGES_REQUESTED',completedAt:capturedAt,
  scope:'SuccessModal source recheck, QC-STOCK-UI-001 portrait closure, additional landscape/rotation checks and copy-only proposal. Does not approve latest live Stock/configuration.',
  reviewedSourceHashes:{[sourcePath]:sourceHash},approvedSourceHashes:{},applicationSourceChangedByQC:false,
  exercisedContractHashes:Object.fromEntries(quality.runtimeMatches.map(x => [x.file,x.expected])),
  closedFindings:[{id:'QC-STOCK-UI-001',severity:'P2',status:'CLOSED_BY_RECHECK',reviewedSourceHash:sourceHash,scope:'Original portrait320x640 reproduction on identical historical Stock caller contract',evidence:['stock-final/browser-results.json:36PASS','modal-browser-results.json:51PASS'],historicalDecision:'../qc-stock-ui-2026-10-09/DECISION.json',historicalDecisionEdited:false}],
  newOpenFindings:[{id:'QC-SUCCESS-001',severity:'P2',status:'OPEN',file:sourcePath,location:'ModalContent height constraint and scrollable header/body; footer remains outside unconstrained content',title:'Modal sukses dengan pesan panjang memotong tombol pada viewport mendatar',reviewedSourceHash:sourceHash,rootCause:'Width adapts to viewport but height is unconstrained; footer is clipped outside the viewport',failedAssertionCount:9,distinctDefectCount:1,failedAssertions:failures,measurements:longMeasurements,reproduction:'REPORT.md',evidence:['orientation-current/results.json','orientation-current/long-640x360.png','orientation-current/long-844x390.png','orientation-current/long-live-rotate-640x360.png'],requiredCorrection:'Limit height to available viewport, make message/header reachable by scrolling, retain visible footer and existing public callbacks',owner:'SD3-007 / Codex-3'}],
  unchangedRelatedGates:[{id:'QC-STOCK-UI-002',severity:'P3',status:'OPEN_PENDING_INDEPENDENT_RECHECK',owner:'Senior 6',note:'New Stock handoff submitted separately; not assessed here'},{id:'QC-STOCK-001',status:'DEFERRED',note:'Backend will be replaced per user direction; not a modal UI gate'},{signal:'QC-INCOME-20261009-CHANGES-REQUESTED',status:'CHANGES_REQUESTED',note:'Three findings outside this module remain independent'},{signal:'QC-AUTH-20261009-PASS-RECHECK',status:'PASS_RECHECK',note:'Auth closure remains independent'}],
  assertions:{current:quality.currentCounts,totalCurrentPassed:255,totalCurrentFailed:9,proposal:quality.proposalRegression,totalProposalPassed:270,totalProposalFailed:0,includesOverlappingCoverage:true,initialProposal21CountedAgain:false,notProjectCompletionPercentage:true},
  quality:{status:quality.status,eslintErrors:0,eslintWarnings:0,proposalEslintErrors:0,proposalEslintWarnings:0,biomeExit:0,proposalBiomeExit:0,proposalBiomeOutputUnchanged:true,diffExit:0,focusedTypecheck:quality.focusedTypecheck,currentPublicContractPreserved:quality.currentContractUnchangedExceptGeometry,proposalPublicContractPreserved:quality.proposalContractUnchangedExceptGeometryAndScrollWrapper},
  integrity:{initialContractFingerprintMatches:before.handoffMatches.length,currentSourceOrInputMatches:39,exactReviewedStockFixtureMatches:1,trackedReviewedInputMatches:40,historicalArtifactMatches:211,initialSnapshotPreserved:true,mutableConfigurationExcluded:externalContext,liveStockApproved:false,androidCacheUnchanged:true,allFixtureCopiesReversible:true},
  proposal:{applied:false,sourceHash,candidate:'proposal/SuccessModal.tsx',candidateHash,patch:'proposal/success-modal-height.patch',patchHash:patch.patchHash,applyCheckExit:0,expectedAppliedHash:patch.expectedAppliedHashPreservingSourceEOL,verification:'270PASS/0FAIL on review copies; final application source and native behavior still require recheck'},
  publication:{qcApproval:false,owner:'Projek Manager',requiredBeforePublication:'Owner correction on application source -> QA/native scroll/orientation review -> QC exact-source recheck -> PM integration/publication',gitPushPerformedByQC:false},limitations:limits,
};
write('DECISION.json',decision);
const coordination = '\n\n## QC - SD3-007 SuccessModal CHANGES_REQUESTED / patch siap ditinjau (9 Oktober 2026)\n\n'
  + 'Sinyal final QC-SUCCESS-20261009-CHANGES-REQUESTED, source SuccessModalF90 tetap. QC-STOCK-UI-001P2 CLOSED_BY_RECHECK untuk reproduksi portrait320x640 pada caller Stok historis1e0. Temuan baru QC-SUCCESS-001P2 OPEN: pesan panjang yang sama dengan fixture portrait memotong tombol pada640x360 (terlihat4,625/48px),844x390 (19,625/48px), serta rotasi live320x640->640x360. Sembilan assertion gagal = satu defect, bukan sembilan bug. Paket docs/qa/qc-success-modal-2026-10-09/REPORT.md dan DECISION.json.\n\n'
  + 'Source saat ini255PASS/9FAIL (Stok36,shared51,lifecycle156,orientasi12/9). Salinan proposal7508 mendapat270PASS/0FAIL (36+51+156+27), termasuk enam pemeriksaan reachability/gulir/footer. Props/callback/copy tetap; ESLint source+salinan0error/warning, Biome/diff0, TypeScript dua root+import/declaration closure0diagnostic dijalankan QC. Patch proposal/success-modal-height.patch hanya menambah batas tinggi/scrollwrapper; git apply --check0, belum diterapkan. Total assertion beririsan, bukan persentase progres. Initial proposal21 disimpan tidak dijumlahkan lagi.\n\n'
  + 'Drift eksternal selama QC dicatat: Senior6 mengganti Stok live ke0b61; replayStok36 diulang pada salinan byte-identik1e0 dengan import SuccessModal produksiF90. Revisi Stok live/QC-STOCK-UI-002 tetap perlu recheck terpisah. Metro config/cacheguard milikSenior7 berubah; dua file tersebut dikecualikan dari approval modal, tidak direvert/require/restart.39inputdisk+1fixtureStock cocok,211artefak histori tidak berubah,16modul runtime cocok. Alert76b6/DeleteConfirmDABC dipakai sebagai dependency terbaru, bukan approval kedua delta. Cache Android hash056c tetap, Metro8088PID9200/backend8001PID24116 tetap.\n\n'
  + 'Quality awal FAILED disimpan: Biome stdin tanpa--write exit1 walau byte identik; pemeriksaan diperbaiki dengan--write stdout-only dan output wajib identik. Tidak ada perubahan aplikasi karena koreksi harness. Screenshot source/copy diperiksa. Native orientasi/scroll/keyboard/font/virtual-list,fullrouter/backend/persistensi dan Figma belum tersertifikasi.88caller inventaris hanya histori statis. QC tidak mengubah source aplikasi/dependency/HP/ADB/server/index/branch/commit/push/merge.\n\n'
  + 'Tindak lanjut pemilik SD3-007/Codex-3: koreksi tinggi dan area gulir, serahkan hash final; QA periksa orientasi/pesan/footer native, QC recheck source final, lalu PM integrasi/publikasi. Sinyal ini CHANGES_REQUESTED tanpa approvedSourceHashes dan tanpa approval publikasi. Artefak paket disegel sekali dengan manifest; gunakan verify-artifacts.cjs untuk verifikasi baca saja.\n';
fs.appendFileSync('docs/SESSION_COORDINATION.md',coordination);
function collect(directory) {
  return fs.readdirSync(directory,{withFileTypes:true}).flatMap(entry => {
    const file = path.join(directory,entry.name);
    if (entry.isDirectory()) return collect(file);
    if (file === path.join(root,'artifact-manifest.json')) return [];
    return [{file:path.relative(root,file).replaceAll('\\','/'),bytes:fs.statSync(file).size,sha256:hash(file)}];
  });
}
const artifacts = collect(root).sort((a,b) => a.file.localeCompare(b.file));
write('artifact-manifest.json',{owner:'QC',capturedAt,signal:decision.signal,applied:false,artifacts,scope:'This QC evidence packet only; SESSION_COORDINATION is shared mutable handoff outside manifest',resealAllowed:false});
console.log(JSON.stringify({signal:decision.signal,closedFinding:'QC-STOCK-UI-001',newOpenFinding:'QC-SUCCESS-001',sourceHash,candidateHash,currentPassed:255,currentFailed:9,proposalPassed:270,proposalFailed:0,artifacts:artifacts.length,androidCacheUnchanged:true,ports}));
