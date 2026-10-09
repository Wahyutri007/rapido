const fs = require('node:fs');
const path = require('node:path');
const {createRequire} = require('node:module');
const original = path.resolve('docs/qa/senior-6-2026-10-09/stock-contract/lifecycle.cjs');
// Evaluate original logic unchanged; redirect only __dirname-based report outputs.
new Function('require', '__dirname', 'console', fs.readFileSync(original, 'utf8'))(createRequire(original), __dirname, console);
