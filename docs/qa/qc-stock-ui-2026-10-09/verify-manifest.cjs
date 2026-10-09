const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto'), assert = require('node:assert/strict');
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, 'artifact-manifest.json')));
for (const [file, expected] of Object.entries(manifest.artifacts)) assert.equal(hash(path.join(__dirname, file)), expected, file);
const after = JSON.parse(fs.readFileSync(path.join(__dirname, 'fingerprints-after.json')));
for (const [file, expected] of Object.entries(after.files)) assert.equal(hash(file), expected, file);
assert.equal(hash('node_modules/react-native-css-interop/.cache/android.js'), after.androidCache.sha256);
assert.equal(hash('node_modules/react-native-css-interop/.cache/web.css'), after.webCache.sha256);
console.log(JSON.stringify({ artifactsVerified: Object.keys(manifest.artifacts).length, currentInputsVerified: Object.keys(after.files).length, cachesVerified: 2 }));
