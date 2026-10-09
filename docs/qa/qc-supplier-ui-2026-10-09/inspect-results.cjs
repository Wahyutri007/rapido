const fs = require('node:fs'), path = require('node:path');
const result = JSON.parse(fs.readFileSync(path.join(__dirname, 'browser-results.json')));
console.log(JSON.stringify({ passed: result.passed, failed: result.failed, exception: result.exception, failedChecks: result.checks.filter(check => !check.passed), warnings: [...new Set(result.warnings)] }, null, 2));
