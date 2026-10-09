const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto'), assert = require('node:assert/strict');
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const components = ['SupplierListScreen', 'SupplierDetailScreen', 'SupplierFormScreen', 'SupplierDeleteDialog'].map(name => `components/feature/inventory/supplier/${name}.tsx`);
const files = [...components, ...['_layout', 'index', 'modify', 'detail'].map(name => `app/(no-layout)/inventory/suppliers/${name}.tsx`),
  'components/feature/inventory/InventoryUi.tsx', 'components/common/Header.tsx', 'components/common/Text.tsx', 'components/common/Card.tsx',
  'components/common/Wrapper.tsx', 'components/common/BottomActionButton.tsx', 'components/common/Form.tsx', 'components/common/SingleSelect.tsx',
  'components/common/SearchBar.tsx', 'components/common/DataPlaceholder.tsx', 'components/common/DeleteConfirmModal.tsx', 'components/common/SuccessModal.tsx',
  'components/common/AlertModal.tsx', 'components/custom/DetailRow.tsx', 'components/custom/DetailBottomActions.tsx', 'components/custom/ItemActionSheet.tsx', 'components/custom/JSStack.tsx',
  'components/ui/modal/index.tsx', 'components/ui/actionsheet/index.tsx', 'components/ui/gluestack-ui-provider/index.web.tsx', 'components/ui/gluestack-ui-provider/config.ts',
  'store/inventorySupplierStore.ts', 'store/inventoryStore.ts', 'schema/inventory/supplier.ts', 'constants/data/inventory-suppliers.ts',
  'constants/data/inventory.ts', 'types/ui/inventory/supplier.ts', 'lib/inventory.ts', 'tailwind.config.js', 'global.css', 'package.json',
  'assets/fonts/Inter_24pt-Regular.ttf', 'assets/fonts/Inter_24pt-Medium.ttf', 'assets/fonts/Inter_24pt-SemiBold.ttf', 'assets/fonts/Inter_24pt-Bold.ttf'];
for (const file of files) assert.ok(fs.existsSync(file), file);
const cache = 'node_modules/react-native-css-interop/.cache/android.js';
const before = path.join(__dirname, 'fingerprints-before.json'); assert.equal(fs.existsSync(before), false, 'Preserve the initial baseline');
fs.writeFileSync(before, JSON.stringify({ capturedAt: new Date().toISOString(), scope: 'UI only, backend deferred', components, files: Object.fromEntries(files.map(file => [file, hash(file)])), androidCache: { bytes: fs.statSync(cache).size, sha256: hash(cache) }, figmaCallableTools: 0 }, null, 2) + '\n');
fs.copyFileSync(path.join(__dirname, 'preview-entry.fixture.jsx'), '.expo/qc-supplier-ui-entry.jsx');
fs.copyFileSync('node_modules/react-native-css-interop/.cache/web.css', path.join(__dirname, 'web-before.css'));
console.log(JSON.stringify({ inputsCaptured: files.length, prepared: true }));
