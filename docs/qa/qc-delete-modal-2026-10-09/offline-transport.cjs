const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
module.exports=(packet,proposal=false)=>{
  const root=process.cwd(),mode=proposal?'proposal':'current',record=JSON.parse(fs.readFileSync(path.join(packet,'offline-'+mode+'-build.json'),'utf8'));
  const bundle=fs.readFileSync(path.resolve(root,record.output));
  assert.equal(crypto.createHash('sha256').update(bundle).digest('hex'),record.bundleHash);
  const assets=JSON.parse(fs.readFileSync(path.resolve(root,'.expo/qc-delete-offline',mode,'assets.json'),'utf8'));
  const receipts=[],map=new Map();
  for(const asset of assets)for(const file of asset.files??[]){
    const url=asset.httpServerLocation.replace(/\/$/,'')+'/'+path.basename(file);map.set(url,path.resolve(file));
  }
  const mime={'.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.ttf':'font/ttf','.otf':'font/otf','.woff':'font/woff','.woff2':'font/woff2'};
  return {record,receipts,async serve(route,url){
    if(url.origin!=='http://127.0.0.1:8088')return false;
    const entry=proposal?'qc-delete-proposal-entry':'qc-delete-modal-entry';
    if(url.pathname==='/.expo/'+entry+'.bundle'){await route.fulfill({status:200,contentType:'application/javascript',body:bundle});receipts.push({path:url.pathname,bytes:bundle.length,sha256:record.bundleHash});return true;}
    if(!url.pathname.startsWith('/assets/'))return false;
    const pathname=decodeURIComponent(url.pathname),file=map.get(pathname)??path.resolve(root,pathname.slice('/assets/'.length));
    assert.ok(file.toLowerCase().startsWith((root+path.sep).toLowerCase()),'Asset escapes project root');
    const contentType=mime[path.extname(file).toLowerCase()];if(!contentType||!fs.existsSync(file))return false;
    const body=fs.readFileSync(file);await route.fulfill({status:200,contentType,body});receipts.push({path:pathname,file:path.relative(root,file),bytes:body.length,sha256:crypto.createHash('sha256').update(body).digest('hex')});return true;
  }};
};
