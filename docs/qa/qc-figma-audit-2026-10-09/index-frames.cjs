const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const packet=__dirname,receipt=JSON.parse(fs.readFileSync(path.join(packet,'cached-reference-index.json'),'utf8')),hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const decode=s=>s.replace(/&quot;/g,'"').replace(/&apos;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&').replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(+n));
const root=path.resolve(__dirname,'../../..');
const frames=new Map(),inputs=[];
for(const capture of receipt.captures.filter(c=>c.kind==='metadata')){assert.equal(hash(capture.file),capture.sha256);const xml=fs.readFileSync(capture.file,'utf8'),all=[];
 const stack=[],gaps=[];
 // The cached page is truncated. Recover visible parentage from preserved indentation,
 // so XML recovery cannot attach later frames to an unrelated lost parent.
 for(const [lineIndex,line] of xml.split(/\r?\n/).entries()){
  if(/chars truncated/.test(line)){gaps.push({line:lineIndex+1,marker:line.trim()});for(const n of stack)n.crossesGap=true;continue;}
  const match=line.match(/^(\s*)<([\w-]+)\b(.*)>\s*$/);if(!match)continue;
  const indent=match[1].length;while(stack.length&&stack.at(-1).indent>=indent)stack.pop();
  const attrs={};for(const a of match[3].matchAll(/([\w-]+)="([^"]*)"/g))attrs[a[1]]=decode(a[2]);if(!attrs.id)continue;
  const node={tag:match[2],...attrs,indent,parent:stack.at(-1)||null,children:[],line:lineIndex+1,crossesGap:false};
  all.push(node);if(node.parent)node.parent.children.push(node);if(!/\/\s*$/.test(match[3]))stack.push(node);
 }
 const isScreen=n=>['frame','component','instance'].includes(n.tag)&&+n.width>=280&&+n.width<=500&&+n.height>=350;
 for(const node of all.filter(isScreen)){let ancestor=node.parent,screenAncestor=false;while(ancestor){if(isScreen(ancestor)){screenAncestor=true;break;}ancestor=ancestor.parent;}if(screenAncestor)continue;
  const texts=[],walk=n=>{if(n.tag==='text')texts.push(n.name);for(const c of n.children)walk(c);};walk(node);
  const hierarchy=[];let p=node.parent;while(p){hierarchy.unshift({id:p.id,name:p.name,tag:p.tag});p=p.parent;}
  const record={id:node.id,name:node.name,width:+node.width,height:+node.height,hierarchy,texts:[...new Set(texts)],referenceFile:capture.file,referenceSha256:capture.sha256,recordedAt:capture.recordedAt,sourceKind:'cached-metadata',liveVerified:false,pageCapturePartial:gaps.length>0,frameCrossesGap:node.crossesGap};
  const current=frames.get(node.id);if(!current||(!record.pageCapturePartial&&current.pageCapturePartial)||(!record.frameCrossesGap&&current.texts.length<record.texts.length))frames.set(node.id,record);
 }
 inputs.push({file:capture.file,sha256:capture.sha256,nodeId:capture.nodeId,screenFrames:all.filter(isScreen).length,truncated:gaps.length>0,gaps});
}
for(const folder of ['','materials','compositions','bill-payments']){
 const file=path.join(root,'docs/figma/inventory',folder,'frames.json');if(!fs.existsSync(file))continue;
 for(const frame of JSON.parse(fs.readFileSync(file,'utf8').replace(/^\uFEFF/,'')))if(!frames.has(frame.id))frames.set(frame.id,{...frame,sourceKind:'cached-summary',referenceFile:file,referenceSha256:hash(file),liveVerified:false,pageCapturePartial:true});
 inputs.push({file,sha256:hash(file),sourceKind:'cached-summary'});
}
const result={createdAt:new Date().toISOString(),fileKey:receipt.fileKey,frames:[...frames.values()],inputs,limits:'Partial historical metadata. IDs/names/geometry/texts are candidate evidence only; no complete page, full styles, current Figma reread, route approval or visual PASS. Hierarchy recovered from preserved indentation; gap-crossing frames flagged.'};
fs.writeFileSync(path.join(packet,'frame-index.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({frames:frames.size,firstFrames:result.frames.slice(0,38).map(f=>({id:f.id,name:f.name,width:f.width,height:f.height,section:f.hierarchy.at(-1)?.name})),lastFrames:result.frames.slice(-12).map(f=>({id:f.id,name:f.name}))},null,2));
