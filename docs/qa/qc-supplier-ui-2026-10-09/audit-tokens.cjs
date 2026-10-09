const fs = require('node:fs'), path = require('node:path'), ts = require('typescript');
const baseline = JSON.parse(fs.readFileSync(path.join(__dirname, 'fingerprints-before.json')));
const files = [...baseline.components, 'components/custom/DetailRow.tsx', 'components/custom/DetailBottomActions.tsx', 'components/common/DeleteConfirmModal.tsx', 'components/common/SuccessModal.tsx'];
const findings = [];
for (const file of files) {
  const ast = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const strings = node => { const result = []; const visit = value => { if (ts.isStringLiteral(value)) result.push(value.text); ts.forEachChild(value, visit); }; visit(node); return result; };
  const visit = node => {
    if (ts.isJsxAttribute(node) && node.name.text === 'className') {
      const component = node.parent.parent.tagName.getText(ast);
      for (const value of strings(node)) for (const token of value.split(/\s+/)) {
        let category;
        if (/^(?:m[trblxy]?|p[trblxy]?|gap|space-[xy])-\d+\.5$/.test(token)) category = 'fractional-spacing';
        else if (/^(?:bg|text|border)-(?:zinc|gray|amber|yellow|red|green|emerald)-\d+/.test(token)) category = 'nonsemantic-color';
        else if (component === 'Text' && /^(?:text-(?:xs|sm|base|lg|xl|\[)|font-)/.test(token)) category = 'nonsemantic-typography';
        else if (component === 'Card' && /^(?:p[trblxy]?|bg|rounded|border|shadow)-/.test(token)) category = 'card-primitive-override';
        if (category) findings.push({ file, scope: baseline.components.includes(file) ? 'feature' : 'shared-existing', line: ast.getLineAndCharacterOfPosition(node.getStart()).line + 1, component, token, category });
      }
    }
    ts.forEachChild(node, visit);
  }; visit(ast);
}
const result = { authority: 'AGENTS_UI.md 1.1/2.1/2.2/2.6', files, findings, featureOccurrences: findings.filter(item => item.scope === 'feature').length, sharedOccurrences: findings.filter(item => item.scope === 'shared-existing').length, limitation: 'Shared existing token violations are separate from feature geometry defects. This is a literal JSX className audit, not complete conformance certification.' };
fs.writeFileSync(path.join(__dirname, 'token-audit.json'), JSON.stringify(result, null, 2) + '\n'); console.log(JSON.stringify({ featureOccurrences: result.featureOccurrences, sharedOccurrences: result.sharedOccurrences }));
