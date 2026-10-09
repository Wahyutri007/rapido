// Run from application root: node docs/qa/qc-senior8-2026-10-09/verify.cjs
// Runs reviewed developer harness copies with separate outputs, then scoped lint.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync, execFileSync } = require('node:child_process');
const root = process.cwd(), out = __dirname;
const referencePath = 'docs/qa/senior-8-2026-10-09/verification.json';
const reference = JSON.parse(fs.readFileSync(referencePath, 'utf8'));
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const files = reference.files.map(item => item.file);
const before = files.map(file => ({file, sha256: hash(file), handoffMatches: hash(file) === reference.files.find(item => item.file === file).sha256}));
const tmp = path.join(root, '.expo/qc-senior8-2026-10-09');
fs.mkdirSync(tmp, {recursive: true});
const harnesses = ['browser.cjs', 'catalog-regression.cjs', 'ledger-regression.cjs', 'balance-regression.cjs'];
const harnessHashes = harnesses.map(file => {
  const source = path.join('docs/qa/senior-8-2026-10-09', file);
  fs.copyFileSync(source, path.join(tmp, file));
  return {file: source, sha256: hash(source), handoffMatches: hash(source) === reference.harnesses.find(item => item.file === file).sha256};
});
if (before.some(item => !item.handoffMatches) || harnessHashes.some(item => !item.handoffMatches)) throw Error('Source or harness changed since handoff; review new version before running.');
const commands = [];
for (const kind of ['catalog', 'ledger', 'balance']) {
  const args = [path.join(tmp, kind + '-regression.cjs')];
  const result = spawnSync(process.execPath, args, {cwd: root, encoding: 'utf8', timeout: 180000, windowsHide: true});
  commands.push({command: 'node ' + path.relative(root, args[0]), exitCode: result.status, stdout: result.stdout.trim(), stderr: result.stderr.trim(), error: result.error?.message});
  console.log(JSON.stringify(commands.at(-1)));
  if (result.status !== 0) break;
  fs.copyFileSync(path.join(tmp, kind + '-results.json'), path.join(out, kind + '-results.json'));
}
const lintArgs = ['node_modules/eslint/bin/eslint.js', ...files, '--format', 'json'];
const lint = spawnSync(process.execPath, lintArgs, {cwd: root, encoding: 'utf8', timeout: 120000, windowsHide: true});
const diagnostics = JSON.parse(lint.stdout || '[]');
fs.writeFileSync(path.join(out, 'eslint.json'), JSON.stringify(diagnostics, null, 2) + '\n');
commands.push({command: 'node ' + lintArgs.join(' '), exitCode: lint.status, errors: diagnostics.reduce((total,item)=>total+item.errorCount,0), warnings: diagnostics.reduce((total,item)=>total+item.warningCount,0), error: lint.error?.message});
const jsxChecks = [];
const ts = require('typescript');
const jsxText = (file, text) => {
  const ast = ts.createSourceFile(file,text,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
  const fn = ast.statements.find(node=>ts.isFunctionDeclaration(node)&&node.modifiers?.some(mod=>mod.kind===ts.SyntaxKind.DefaultKeyword));
  const ret = fn.body.statements.filter(node=>ts.isReturnStatement(node)).at(-1);
  return ret.getText(ast).replace(/\r\n/g,'\n');
};
for (const file of files) {
  const baseline = execFileSync('git', ['show', 'HEAD:' + file], {encoding:'utf8'});
  jsxChecks.push({file, unchangedFinalJSX: jsxText(file, baseline) === jsxText(file,fs.readFileSync(file,'utf8'))});
}
const diffCheck = spawnSync('git', ['diff','--check','--',...files], {encoding:'utf8',windowsHide:true});
commands.push({command:'git diff --check -- <five source files>',exitCode:diffCheck.status,stdout:diffCheck.stdout.trim(),stderr:diffCheck.stderr.trim()});
const after = files.map(file=>({file,sha256:hash(file),unchangedDuringQC:hash(file)===before.find(item=>item.file===file).sha256}));
const report = {date:'2026-10-09',timezone:'Asia/Jakarta',kind:'QC rerun of reviewed developer regression harnesses; outputs isolated from developer evidence. No full application/native/API validation.',head:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),before,after,harnessHashes,jsxChecks,commands};
fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({commands:commands.map(item=>({command:item.command,exitCode:item.exitCode,errors:item.errors,warnings:item.warnings})),hashesStable:after.every(item=>item.unchangedDuringQC),jsxUnchanged:jsxChecks.every(item=>item.unchangedFinalJSX)}));
process.exitCode = commands.some(item=>item.exitCode!==0) || after.some(item=>!item.unchangedDuringQC) ? 1 : 0;
