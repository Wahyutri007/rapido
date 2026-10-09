// Same four token categories as QC-STOCK-UI-002, plus a className-only AST comparison.
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto'), assert = require('node:assert/strict'), ts = require('typescript');
const source = 'app/(no-layout)/manage/pos-settings/stock-limit.tsx';
const beforeText = fs.readFileSync(path.join(__dirname, 'stock-before.txt'), 'utf8');
const afterText = fs.readFileSync(source, 'utf8');
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
function audit(text) {
  const ast = ts.createSourceFile(source, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX), findings = [];
  function visit(node) {
    if (ts.isJsxAttribute(node) && node.name.text === 'className') {
      const component = node.parent.parent.tagName.getText(ast), line = ast.getLineAndCharacterOfPosition(node.getStart()).line + 1;
      function strings(child) {
        if (ts.isStringLiteral(child)) for (const token of child.text.split(/\s+/)) {
          let category;
          if (/^(?:m[trblxy]?|p[trblxy]?|gap|space-[xy])-\d+\.5$/.test(token)) category = 'fractional-spacing';
          else if (/^(?:bg|text|border)-(?:zinc|gray|amber|yellow|red|green|emerald)-\d+/.test(token)) category = 'nonsemantic-color';
          else if (component === 'Card' && /^(?:p[trblxy]?|bg|rounded|border|shadow)-/.test(token)) category = 'card-primitive-override';
          else if (component === 'SearchBar' && /^(?:bg|rounded|border|shadow)-/.test(token)) category = 'search-primitive-override';
          if (category) findings.push({ category, line, component, token });
        }
        ts.forEachChild(child, strings);
      }
      strings(node);
    }
    ts.forEachChild(node, visit);
  }
  visit(ast);
  return { count: findings.length, findings };
}
function withoutClasses(text) {
  const ast = ts.createSourceFile(source, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const transformed = ts.transform(ast, [context => {
    const visit = node => ts.isJsxAttributes(node)
      ? ts.factory.updateJsxAttributes(node, node.properties.filter(attribute => !(ts.isJsxAttribute(attribute) && attribute.name.text === 'className')))
      : ts.visitEachChild(node, visit, context);
    return node => ts.visitNode(node, visit);
  }]);
  const result = ts.createPrinter().printFile(transformed.transformed[0]); transformed.dispose(); return result;
}
const before = audit(beforeText), after = audit(afterText);
const normalizedBefore = withoutClasses(beforeText), normalizedAfter = withoutClasses(afterText);
assert.equal(before.count, 15); assert.equal(after.count, 0); assert.equal(normalizedAfter, normalizedBefore);
const result = { source, sourceHash: hash(afterText), baselineHash: hash(beforeText), before, after,
  classNameOnlyDelta: true, normalizedBeforeHash: hash(normalizedBefore), normalizedAfterHash: hash(normalizedAfter),
  limitations: 'Static categories match QC audit; literal icon/Switch color props and primitive internals are outside this audit. ClassName-only comparison proves logic/copy/structure preserved from pre-token SD6-002; visual geometry is measured separately.' };
fs.writeFileSync(path.join(__dirname, 'token-audit.json'), JSON.stringify(result, null, 2) + '\n');
console.log('15 token occurrences -> 0; non-className AST identical');
