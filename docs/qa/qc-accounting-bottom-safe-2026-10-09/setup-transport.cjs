const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const previous=path.resolve('docs/qa/qc-success-modal-recheck-2026-10-09/offline-transport.cjs');
const text=fs.readFileSync(previous,'utf8');assert.equal(text.split('qc-success-recheck-entry.bundle').length,2);
fs.writeFileSync(path.join(__dirname,'offline-transport.cjs'),text.replace('qc-success-recheck-entry.bundle','qc-accounting-footer-entry.bundle'));
