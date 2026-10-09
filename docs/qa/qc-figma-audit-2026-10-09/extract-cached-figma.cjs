const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),readline=require('node:readline'),crypto=require('node:crypto');
const fileKey='gbdKqL2EcYNenWiQXG4SRW',packet=__dirname,out='D:/Rapido-QC-temp/figma-audit-2026-10-09';fs.mkdirSync(out,{recursive:true});
const directories=['D:/Codex-2/sessions','D:/Codex-3/sessions','D:/Codex-4/sessions','D:/Codex-5/sessions','D:/Codex-6/sessions'].filter(d=>fs.existsSync(d));
const search=cp.spawnSync('rg',['-l','--fixed-strings',fileKey,...directories,'-g','*.jsonl','--no-messages'],{encoding:'utf8',windowsHide:true});
const files=search.stdout.trim().split(/\r?\n/).filter(Boolean),captures=[],diagnostics=[];
const hash=text=>crypto.createHash('sha256').update(text).digest('hex');
function captureMCP(p,record,file){
 const invocation=p.invocation??{},args=invocation.arguments??{},name=invocation.tool??'';
 if((args.fileKey??args.file_key)!==fileKey||!/get_metadata|get_design_context|get_screenshot/.test(name))return;
 const nodeId=args.nodeId??args.node_id??'unknown';
 function visit(block){
  if(block?.type==='image'&&/get_design_context|get_screenshot/.test(name)&&block.data&&/^image\/(png|jpeg)$/.test(block.mimeType??'')){
   const bytes=Buffer.from(block.data,'base64'),sha256=hash(bytes),extension=block.mimeType==='image/png'?'.png':'.jpg',target=path.join(out,'cached-screenshot-'+nodeId.replaceAll(':','-')+'-'+sha256.slice(0,12)+extension);if(!fs.existsSync(target))fs.writeFileSync(target,bytes);
   captures.push({file:target.replaceAll('\\','/'),sha256,nodeId,name,kind:'screenshot',recordedAt:record.timestamp,sourceSession:path.basename(file),bytes:bytes.length,limits:'Cached Figma screenshot for the approved file key; not a live reread.'});return;
  }
  const text=typeof block==='string'?block:block?.type==='text'?block.text:null;
  if(text){try{const parsed=JSON.parse(text);if(parsed&&typeof parsed==='object'){for(const item of parsed.content??[])visit(item);return;}}catch{}
   const xmlStart=text.indexOf('<canvas')>=0?text.indexOf('<canvas'):text.indexOf('<frame');
   const xml=/get_metadata/.test(name)&&xmlStart>=0?text.slice(xmlStart):null;
   const content=xml??(/get_design_context/.test(name)&&text.includes('data-node-id=')?text:null);if(!content)return;
   const kind=xml?'metadata':'design-context',extension=xml?'.xml':'.txt',target=path.join(out,'cached-'+kind+'-'+nodeId.replaceAll(':','-')+'-'+hash(content).slice(0,12)+extension);if(!fs.existsSync(target))fs.writeFileSync(target,content);
   captures.push({file:target.replaceAll('\\','/'),sha256:hash(content),nodeId,name,kind,recordedAt:record.timestamp,sourceSession:path.basename(file),bytes:Buffer.byteLength(content),limits:'Cached Figma response for approved file key from a Rapido workspace session; not a live reread.'});
  }
 }
 for(const block of p.result?.Ok?.content??[])visit(block);
}
(async()=>{
 for(const file of files){const calls=new Map();let workspace=false;const names={},reader=readline.createInterface({input:fs.createReadStream(file),crlfDelay:Infinity});
  for await(const line of reader){let record;try{record=JSON.parse(line);}catch{continue;}const p=record.payload??{};
   if(record.type==='session_meta'){workspace=/[\\/]rapido-dev([\\/]rapido-dev)?[\\/]?$/i.test(p.cwd??'');continue;}if(!workspace)continue;
   if(p.type==='mcp_tool_call_end'){captureMCP(p,record,file);const name=p.invocation?.tool??'';if(/figma/i.test(name))names[name]=(names[name]??0)+1;}
   if(p.type==='function_call'){const name=p.name??'';if(/figma|get_metadata|get_design_context|get_screenshot/i.test(name)){names[name]=(names[name]??0)+1;let args;try{args=JSON.parse(p.arguments??'{}');}catch{continue;}if(args.fileKey===fileKey||args.file_key===fileKey)calls.set(p.call_id,{name,args});}}
   if(p.type==='function_call_output'&&calls.has(p.call_id)){const call=calls.get(p.call_id);if(!/get_metadata|get_design_context/.test(call.name))continue;let output=p.output,texts=[];try{const parsed=JSON.parse(output);if(parsed.content)texts=parsed.content.filter(c=>c.type==='text').map(c=>c.text);else if(typeof parsed==='string')texts=[parsed];else texts=[JSON.stringify(parsed)];}catch{texts=[String(output)];}
    for(const text of texts){const starts=text.indexOf('<canvas'),frameStart=text.indexOf('<frame');const start=starts>=0?starts:frameStart;if(/get_metadata/.test(call.name)&&start>=0){const xml=text.slice(start);const filename='cached-'+(call.args.nodeId??call.args.node_id??'unknown').replaceAll(':','-')+'-'+hash(xml).slice(0,12)+'.xml';const target=path.join(out,filename);if(!fs.existsSync(target))fs.writeFileSync(target,xml);captures.push({file:target.replaceAll('\\','/'),sha256:hash(xml),nodeId:call.args.nodeId??call.args.node_id,name:call.name,recordedAt:record.timestamp,sourceSession:path.basename(file),sourceProfile:file.split(/[\\/]/).find(s=>/^Codex-\d+$/.test(s)),bytes:Buffer.byteLength(xml),limits:'Saved Figma response from a Rapido workspace session; not a live reread of the current Figma file.'});}
     else if(/get_design_context/.test(call.name)&&text.includes('data-node-id=')){const filename='cached-context-'+(call.args.nodeId??call.args.node_id??'unknown').replaceAll(':','-')+'-'+hash(text).slice(0,12)+'.txt';const target=path.join(out,filename);if(!fs.existsSync(target))fs.writeFileSync(target,text);captures.push({file:target.replaceAll('\\','/'),sha256:hash(text),nodeId:call.args.nodeId??call.args.node_id,name:call.name,recordedAt:record.timestamp,sourceSession:path.basename(file),bytes:Buffer.byteLength(text),limits:'Cached design context; no current access/parity claim.'});}
    }
   }
  }
  diagnostics.push({session:path.basename(file),workspaceMatched:workspace,toolNames:names});
 }
 const unique=[...new Map(captures.map(c=>[c.file,c])).values()];fs.writeFileSync(path.join(packet,'cached-reference-index.json'),JSON.stringify({createdAt:new Date().toISOString(),fileKey,captures:unique,diagnostics,limits:'Extracted only approved Figma metadata/design-context/screenshots from sessions whose cwd is Rapido. No credentials, unrelated messages or full session logs copied.'},null,2)+'\n');console.log(JSON.stringify({sessions:files.length,captures:unique.length,byKind:unique.reduce((a,c)=>(a[c.kind]=(a[c.kind]??0)+1,a),{}),pageCaptures:unique.filter(c=>c.nodeId==='0:1').map(c=>({file:c.file,kind:c.kind,bytes:c.bytes}))}));
})().catch(e=>{console.error(e.message);process.exitCode=1;});
