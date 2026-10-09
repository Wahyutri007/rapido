// Reuse the SD3-002 assertions, writing the new snapshot to this supplement.
const fs=require('node:fs');
const source=fs.readFileSync('docs/qa/codex-3/journals/lifecycle.cjs','utf8');
const updated=source.replace("baseline?'baseline.json':'results.json'","baseline?'regression-baseline.json':'regression-results.json'");
if(updated===source)throw new Error('Lifecycle output seam missing');
new Function('require','__dirname',updated)(require,__dirname);
