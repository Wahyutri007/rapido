const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const {spawnSync} = require('node:child_process');
const sha = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const backend = 'C:/Users/Wahyu/Downloads/rapido-backend-dev/rapido-backend-dev';
const parent = path.dirname(__dirname);
const prior = JSON.parse(fs.readFileSync(path.join(parent, 'DECISION.json')));
assert.equal(prior.status, 'CHANGES_REQUESTED');
const frontendSource = 'app/(no-layout)/manage/pos-settings/stock-limit.tsx';
assert.equal(sha(frontendSource), prior.reviewedSourceHashes[frontendSource]);
for (const [file, expected] of Object.entries(prior.reviewedBackendHashes)) assert.equal(sha(path.join(backend, file)), expected, file);
const sourcePath = 'app/Domain/Catalog/Models/Menu.php';
const original = fs.readFileSync(path.join(backend, sourcePath), 'utf8');
const normalized = original.replace(/\r\n/g, '\n');
const oldBranch = '\t\t\t$isManaged = (bool) $this->stockSettingDetail;'.replace(/\t/g, '    ');
assert.equal(normalized.split(oldBranch).length, 2, 'Exactly one reviewed hybrid branch');
const newBranch = `            // Details belong to the current owner's setting and describe exclusions.
            $details = $ownerStockSetting->details;
            $contentType = $ownerStockSetting->content_type
                ?? ($details->isNotEmpty() && $details->every(fn ($detail) => $detail->stockable_type === Category::$polymorphicType)
                    ? 'category'
                    : 'item');
            $isCategory = $contentType === 'category';
            $stockableType = $isCategory ? Category::$polymorphicType : self::$polymorphicType;
            $stockableId = $isCategory ? $this->category_id : $this->id;
            $isManaged = !$details->contains(fn ($detail) =>
                $detail->stockable_type === $stockableType
                && $detail->stockable_id === $stockableId
            );`;
const candidate = normalized.replace(oldBranch, newBranch);
fs.writeFileSync(path.join(__dirname, 'Menu.before.txt'), original);
fs.writeFileSync(path.join(__dirname, 'Menu.candidate.txt'), candidate);
const temporaryPatch = spawnSync('git', ['diff', '--no-index', '--', path.join(__dirname, 'Menu.before.txt'), path.join(__dirname, 'Menu.candidate.txt')], {encoding: 'utf8'});
assert.equal(temporaryPatch.status, 1, temporaryPatch.stderr);
const lines = temporaryPatch.stdout.replace(/\r\n/g, '\n').split('\n');
const body = lines.slice(lines.findIndex(line => line.startsWith('@@'))).join('\n');
assert.ok(body.includes('-            $isManaged = (bool) $this->stockSettingDetail;'));
const patch = `diff --git a/${sourcePath} b/${sourcePath}\n--- a/${sourcePath}\n+++ b/${sourcePath}\n${body}`;
fs.writeFileSync(path.join(__dirname, 'stock-exclusion-policy.patch'), patch);
for (const file of ['stock-policy.php', 'payloads.json']) fs.copyFileSync(path.join(parent, file), path.join(__dirname, file));
const checks = spawnSync('git', ['apply', '--check', path.join(__dirname, 'stock-exclusion-policy.patch')], {cwd: backend, encoding: 'utf8'});
assert.equal(checks.status, 0, checks.stderr);
const metadata = {capturedAt: new Date().toISOString(), status: 'PROPOSAL_ONLY_NOT_APPLIED', sourcePath, sourceHash: sha(path.join(backend, sourcePath)), candidateHash: sha(path.join(__dirname, 'Menu.candidate.txt')), sourceBeforeHash: sha(path.join(__dirname, 'Menu.before.txt')), frontendHash: sha(frontendSource), trackedBackendHashes: prior.reviewedBackendHashes, copiedPolicyRunnerHash: sha(path.join(__dirname, 'stock-policy.php')), originalPolicyRunnerHash: sha(path.join(parent, 'stock-policy.php')), copiedPayloadHash: sha(path.join(__dirname, 'payloads.json')), patchHash: sha(path.join(__dirname, 'stock-exclusion-policy.patch')), applyCheck: {exitCode: checks.status, output: checks.stderr.trim()}, deltaScope: 'Only hybrid branch inside Menu::isStockManaged; all/disabled/no-setting branches and other production files remain unchanged.', limitations: 'Draft policy based on existing UI exclusion copy; no backend source changes or migration approval.'};
assert.equal(metadata.copiedPolicyRunnerHash, metadata.originalPolicyRunnerHash);
fs.writeFileSync(path.join(__dirname, 'fingerprints-before.json'), JSON.stringify(metadata, null, 2)+'\n');
console.log(`Candidate prepared, backend untouched; patch apply-check ${checks.status}`);
