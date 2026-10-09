const fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
const file='app/(no-layout)/manage/pos-settings/stock-limit.tsx';
const text=fs.readFileSync(file,'utf8');
const ast=ts.createSourceFile(file,text,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
const findings=[];
const point=node=>ast.getLineAndCharacterOfPosition(node.getStart()).line+1;
const literalStrings=node=>{const values=[];const visit=n=>{if(ts.isStringLiteral(n))values.push(n.text);ts.forEachChild(n,visit);};visit(node);return values;};
const visit=node=>{
  if(ts.isJsxAttribute(node)&&node.name.text==='className') {
    const tag=node.parent.parent.tagName.getText(ast);
    for(const value of literalStrings(node)) for(const token of value.split(/\s+/)) {
      let category;
      if(/^(?:m[trblxy]?|p[trblxy]?|gap|space-[xy])-\d+\.5$/.test(token))category='fractional-spacing';
      else if(/^(?:bg|text|border)-(?:zinc|gray|amber|yellow|red|green|emerald)-\d+/.test(token))category='nonsemantic-color';
      else if(tag==='Card'&&/^(?:p[trblxy]?|bg|rounded|border|shadow)-/.test(token))category='card-primitive-override';
      else if(tag==='SearchBar'&&/^(?:bg|rounded|border|shadow)-/.test(token))category='search-primitive-override';
      if(category)findings.push({category,line:point(node),component:tag,token});
    }
  }
  ts.forEachChild(node,visit);
};visit(ast);
const result={source:file,authority:'AGENTS_UI.md sections1.1/2.1/2.2/2.6; current existing UI, not attributed to SD6-002 delta',findings,count:findings.length,summary:Object.fromEntries([...new Set(findings.map(x=>x.category))].map(category=>[category,findings.filter(x=>x.category===category).length])),limitations:'Static rule audit. Does not claim visual overflow from spacing/colors alone; screenshots/browser measure layout separately. Literal color props inherited and shared primitive internals are not counted here.'};
fs.writeFileSync(path.join(__dirname,'token-audit.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result.summary));
