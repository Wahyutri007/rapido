const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const root = process.cwd();
const backend = 'C:/Users/Wahyu/Downloads/rapido-backend-dev/rapido-backend-dev';
const packet = 'docs/qa/senior-6-2026-10-09/stock-contract';
const source = 'app/(no-layout)/manage/pos-settings/stock-limit.tsx';
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const expected = '1e0d3195772926d05f7f26c9325f494a2e27074a26edf1441993db374e7dc666';
const beforeFile = path.join(__dirname, 'fingerprints-before.json');
const ending = process.argv.includes('--after');
if (!ending) assert.ok(!fs.existsSync(beforeFile), 'Do not overwrite starting evidence');
assert.equal(hash(source), expected);
const declared = JSON.parse(fs.readFileSync(`${packet}/backend-results.json`));
const results = JSON.parse(fs.readFileSync(`${packet}/results.json`));
assert.equal(results.sourceHash, expected); assert.equal(results.failed, 0); assert.equal(results.passed, 31);
assert.equal(hash(`${packet}/stock-limit.baseline.txt`), '3a69d2f54477dfb46dc342a8820c71747899ab75cb096c28820c1693660edac4');
assert.equal(hash(`${packet}/payloads.json`), declared.payloadHash);
for (const [file, sha] of Object.entries(declared.backendSourceHashes)) assert.equal(hash(path.join(backend, file)), sha, file);
const frontend = [source, 'api/hooks/settings.ts', 'api/hooks/categories.ts', 'api/hooks/menus.ts', 'api/factory.ts', 'api/common.ts', 'hooks/usePostRequest.ts', 'components/common/SearchBar.tsx', 'components/common/SuccessModal.tsx', 'components/common/BottomActionButton.tsx', 'components/ui/button/index.tsx', 'package.json'];
const evidence = ['HANDOFF.md', 'lifecycle.cjs', 'results.json', 'payloads.json', 'backend-contract.php', 'backend-results.json', 'stock-limit.baseline.txt', 'baseline-results.json', 'baseline-payloads.json', 'eslint.json', 'scoped-tsconfig.json'].map(file => `${packet}/${file}`);
const server = [...Object.keys(declared.backendSourceHashes), 'app/Domain/User/Controllers/Settings/StockSettingController.php', 'app/Domain/User/Resources/StockSettings/StockSettingResource.php', 'app/Domain/User/Resources/StockSettings/StockSettingDetailResource.php', 'app/Domain/User/Models/StockSettings/StockSetting.php', 'app/Domain/User/Models/StockSettings/StockSettingDetail.php', 'app/Domain/User/Models/User.php', 'app/Traits/IsUserContent.php', 'app/Domain/Order/Requests/TransactionRequest.php', 'app/Domain/Order/Services/CartService.php', 'app/Domain/Order/Models/Cart.php', 'app/Domain/Order/Models/CartGroup.php', 'app/Domain/Order/Models/CartDetail.php', 'app/Domain/Catalog/Models/MenuEntry.php', 'app/Domain/Catalog/Models/Bundling.php', 'app/Domain/Inventory/Services/StockService.php', 'app/Domain/Inventory/Models/StockEntryDetail.php', 'app/Domain/Inventory/Models/StockEntry.php', 'app/Providers/ModelServiceProvider.php', 'app/Traits/HasResponseBuilder.php', 'app/Http/Requests/BaseRequest.php', 'composer.lock'];
const fingerprints = Object.fromEntries([...frontend, ...evidence].map(file => [`frontend:${file}`, hash(path.join(root, file))]).concat(server.map(file => [`backend:${file}`, hash(path.join(backend, file))])));
const output = {capturedAt: new Date().toISOString(), sourceHash: expected, frontendRoot: root, backendRoot: backend, fingerprints};
if (ending) {
  const before = JSON.parse(fs.readFileSync(beforeFile));
  output.changed = Object.keys(fingerprints).filter(file => before.fingerprints[file] !== fingerprints[file]);
  fs.writeFileSync(path.join(__dirname, 'fingerprints-after.json'), JSON.stringify(output, null, 2) + '\n');
  assert.deepEqual(output.changed, [], 'Reviewed inputs changed; reassess scope');
} else {
  fs.writeFileSync(beforeFile, JSON.stringify(output, null, 2) + '\n');
  fs.copyFileSync(`${packet}/backend-contract.php`, path.join(__dirname, 'backend-contract.php'));
}
console.log(`${Object.keys(fingerprints).length} inputs matched${ending ? ' and stable' : ''}`);
