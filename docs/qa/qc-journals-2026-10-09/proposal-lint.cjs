const fs = require('node:fs');
const path = require('node:path');
const { ESLint } = require('eslint');
(async () => {
  const proposal = JSON.parse(fs.readFileSync(path.join(__dirname, 'proposal-verification.json'), 'utf8'));
  const eslint = new ESLint({ cache: false });
  const results = [];
  for (const item of proposal.comparisons) {
    const lint = await eslint.lintText(fs.readFileSync(item.candidate, 'utf8'), { filePath: item.source });
    for (const result of lint) results.push({ source: item.source, candidate: item.candidate, errors: result.errorCount, warnings: result.warningCount, messages: result.messages });
  }
  const passed = results.length === 2 && results.every((item) => item.errors === 0 && item.warnings === 0);
  fs.writeFileSync(path.join(__dirname, 'proposal-eslint.json'), `${JSON.stringify({ passed, scope: 'Candidate text using actual production file paths and ESLint configuration; no source writes', results }, null, 2)}\n`);
  console.log(JSON.stringify({ passed, files: results.length, errors: results.reduce((sum, item) => sum + item.errors, 0), warnings: results.reduce((sum, item) => sum + item.warnings, 0) }));
  process.exitCode = passed ? 0 : 1;
})().catch((error) => { console.error(error); process.exitCode = 2; });
