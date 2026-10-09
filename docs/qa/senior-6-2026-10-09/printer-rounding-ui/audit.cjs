const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto'), assert = require('node:assert/strict'), ts = require('typescript');
const specs = [ ['printer','app/(no-layout)/manage/printer/modify.tsx'], ['rounding','app/(no-layout)/manage/pos-settings/rounding.tsx'] ];
const hash = data => crypto.createHash('sha256').update(data).digest('hex');
const parse = text => ts.createSourceFile('screen.tsx',text,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
const print = ts.createPrinter();
function tokenAudit(text) {
  const ast=parse(text), findings=[];
  const visit=node=>{
    if(ts.isJsxAttribute(node)&&node.name.text==='className') {
      const component=node.parent.parent.tagName.getText(ast), line=ast.getLineAndCharacterOfPosition(node.getStart()).line+1;
      const strings=child=>{
        if(ts.isStringLiteral(child)) for(const token of child.text.split(/\s+/)) {
          let category;
          if(/^(?:m[trblxy]?|p[trblxy]?|gap|space-[xy])-\d+\.5$/.test(token)) category='fractional-spacing';
          else if(/^(?:bg|text|border)-(?:zinc|gray|amber|yellow|red|green|emerald)-\d+/.test(token)) category='nonsemantic-color';
          else if(component==='Card'&&/^(?:p[trblxy]?|bg|rounded|border|shadow)-/.test(token)) category='primitive-override';
          else if(component==='Text'&&/^(?:text-(?:xs|sm|base|lg|xl)|font-)/.test(token)) category='text-typography';
          else if(/^rounded-\[/.test(token)) category='arbitrary-radius';
          if(category) findings.push({category,component,line,token});
        }
        ts.forEachChild(child,strings);
      };strings(node);
    }
    ts.forEachChild(node,visit);
  };visit(ast);return {count:findings.length,findings};
}
function removeClasses(text) {
  const ast=parse(text), transformed=ts.transform(ast,[context=>{
    const visit=node=>ts.isJsxAttributes(node)?ts.factory.updateJsxAttributes(node,node.properties.filter(attribute=>!(ts.isJsxAttribute(attribute)&&attribute.name.text==='className'))):ts.visitEachChild(node,visit,context);
    return node=>ts.visitNode(node,visit);
  }]);const result=print.printFile(transformed.transformed[0]);transformed.dispose();return result;
}
function logic(text) {
  const ast=parse(text);
  const isJsx=expression=>expression&&(ts.isParenthesizedExpression(expression)?isJsx(expression.expression):ts.isJsxFragment(expression)||ts.isJsxElement(expression)||ts.isJsxSelfClosingElement(expression));
  return ast.statements.filter(ts.isFunctionDeclaration).map(fn=>({name:fn.name.text,statements:fn.body.statements.filter(statement=>!(ts.isReturnStatement(statement)&&isJsx(statement.expression))).map(statement=>print.printNode(ts.EmitHint.Unspecified,statement,ast))}));
}
function events(text) {
  const ast=parse(text), found=[];
  const visit=node=>{if(ts.isJsxAttribute(node)&&/^on[A-Z]/.test(node.name.text))found.push(print.printNode(ts.EmitHint.Unspecified,node,ast));ts.forEachChild(node,visit);};visit(ast);return found;
}
const results=specs.map(([name,file])=>{
  const beforeText=fs.readFileSync(path.join(__dirname,name+'-before.txt'),'utf8'), afterText=fs.readFileSync(file,'utf8');
  const before=tokenAudit(beforeText),after=tokenAudit(afterText); assert.equal(after.count,0); assert.ok(before.count>0);
  assert.deepEqual(logic(afterText),logic(beforeText)); assert.deepEqual(events(afterText),events(beforeText));
  if(name==='rounding') assert.equal(removeClasses(afterText),removeClasses(beforeText));
  if(name==='printer') {
    const ast=parse(afterText), jsx=[];
    const visit=node=>{if(ts.isJsxOpeningElement(node)||ts.isJsxSelfClosingElement(node))jsx.push({tag:node.tagName.getText(ast),attrs:node.attributes.getText(ast)});ts.forEachChild(node,visit);};visit(ast);
    assert.ok(jsx.some(node=>node.tag==='Wrapper'&&node.attrs.includes('hasActionButton')&&node.attrs.includes('padding: 16')));
    assert.ok(jsx.some(node=>node.tag==='Card')); assert.ok(jsx.some(node=>node.tag==='BottomActionButton'));
    assert.ok(!jsx.some(node=>['ScrollView','ButtonGroup'].includes(node.tag)));
  }
  return {source:file,sourceHash:hash(afterText),beforeHash:hash(beforeText),before,after,logicBeforeJsxIdentical:true,eventAttributesIdentical:true,classNameOnlyDelta:name==='rounding'};
});
fs.writeFileSync(path.join(__dirname,'token-audit.json'),JSON.stringify({results,limitations:'Static selected token categories; primitive internals/literal icon and Switch props excluded. Printer intentionally replaces containers/CTA and Text props. Layout tested separately; no backend certification.'},null,2)+'\n');
console.log(JSON.stringify(results.map(result=>({source:result.source,before:result.before.count,after:result.after.count,sourceHash:result.sourceHash}))));
