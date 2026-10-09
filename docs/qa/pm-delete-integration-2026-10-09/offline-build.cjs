// QC-owned one-shot Metro API build. No listener and no project Metro config load.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=process.cwd(),packet=__dirname,proposal=process.argv.includes('--proposal');
const mode=proposal?'proposal':'current',own=path.join(root,'.expo/qc-delete-offline',mode);
fs.mkdirSync(path.join(own,'file-map-cache'),{recursive:true});
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const guarded=['metro.config.js','babel.config.js','node_modules/react-native-css-interop/.cache/android.js','node_modules/react-native-css-interop/.cache/web.js'];
const hashes=()=>Object.fromEntries(guarded.filter(f=>fs.existsSync(f)).map(f=>[f,hash(f)]));
const before=hashes();
let entry=fs.readFileSync(path.join(packet,'modal-entry.fixture.jsx'),'utf8');
entry=entry.replace(/import "\.\.\/global\.css";\r?\n/,'').replaceAll('"../','"../../../');
if(proposal){
  entry=entry.replace('"../../../components/common/DeleteConfirmModal"','"./proposal/DeleteConfirmModal"');
  for(const [name,folder] of [['Role','roles'],['Worker','workers'],['Member','member']]){
    const component=name+'DeleteDialog',file='components/feature/manage/'+folder+'/'+component+'.tsx';
    const original=fs.readFileSync(file,'utf8');
    const modified=original.replace('"@/components/common/DeleteConfirmModal"','"./DeleteConfirmModal"');
    assert.notEqual(original,modified);assert.equal(modified.replace('"./DeleteConfirmModal"','"@/components/common/DeleteConfirmModal"'),original);
    fs.writeFileSync(path.join(packet,'proposal',component+'.tsx'),modified);
    entry=entry.replace('"../../../'+file.replace(/\.tsx$/,'')+'"','"./proposal/'+component+'"');
  }
}
const entryFile=path.join(packet,'offline-'+mode+'-entry.jsx');fs.writeFileSync(entryFile,entry);
process.env.EXPO_ROUTER_APP_ROOT=path.join(root,'app');
const Metro=require('metro'),{getDefaultConfig}=require('expo/metro-config'),{FileStore}=require('metro-cache');
const config=getDefaultConfig(root);config.watchFolders=[root,fs.realpathSync(path.join(root,"node_modules"))];config.resolver.useWatchman=false;
config.resolver.nodeModulesPaths=[fs.realpathSync(path.join(root,'node_modules'))];
const ownCache=path.join(root,'.expo/qc-delete-offline/current');
config.maxWorkers=1;config.cacheStores=[new FileStore({root:path.join(ownCache,'transform-cache')})];config.cacheVersion='qc-delete-offline';
config.fileMapCacheDirectory=path.join(ownCache,'file-map-cache');
config.resolver.resolveRequest=(context,name,platform)=>{
  // Browser resolution mirrors installed Expo CLI: no .native fallback,
  // browser/module/main, RNW alias and shared asset registry.
  const webContext=platform==='web'?{...context,preferNativePlatform:false,mainFields:['browser','module','main']}:context;
  const resolve=name=>context.resolveRequest(webContext,name,platform);
  if(platform==='web'&&require('node:module').isBuiltin(name)){try{return resolve(name);}catch{return {type:'empty'};}}
  const alias=platform==='web'?{'react-native':'react-native-web','react-native/index':'react-native-web','react-native/Libraries/Image/resolveAssetSource':'expo-asset/build/resolveAssetSource','@react-native/assets-registry/registry':'react-native-web/dist/modules/AssetRegistry'}:{};
  return resolve(alias[name]??name);
};
config.reporter={update:event=>{if(event.type==='bundle_build_started')console.log('QC offline '+mode+' build started; no server/listener');if(event.type==='transformer_load_failed')console.error(event.error);}};
Metro.runBuild(config,{entry:path.relative(root,entryFile),platform:'web',dev:false,minify:false,assets:true,onBegin:()=>console.log('Building '+mode+' dependency graph'),onProgress:(done,total)=>{if(done%300===0)console.log('Offline progress '+done+'/'+total);}}).then(result=>{
  const output=path.join(own,'entry.bundle.js');fs.writeFileSync(output,result.code);
  fs.writeFileSync(path.join(own,'assets.json'),JSON.stringify(result.assets??[],null,2)+'\n');
  const after=hashes();assert.deepEqual(after,before,'Shared config/cache changed during build');
  const record={mode,createdAt:new Date().toISOString(),entry:path.relative(root,entryFile),entryHash:hash(entryFile),output:path.relative(root,output),bundleHash:hash(output),bytes:Buffer.byteLength(result.code),assets:(result.assets??[]).length,before,after,limitations:'Isolated Metro API/RNWeb with real Babel presets and fixed current stylesheet supplied by fixture. No root Metro/NativeWind-plugin pipeline, native, HP, or full application startup approval.'};
  fs.writeFileSync(path.join(packet,'offline-'+mode+'-build.json'),JSON.stringify(record,null,2)+'\n');console.log(JSON.stringify({mode,bytes:record.bytes,assets:record.assets,sharedGuardsUnchanged:true}));
}).catch(error=>{fs.writeFileSync(path.join(packet,'offline-'+mode+'-error.json'),JSON.stringify({message:error.message,stack:error.stack,before,after:hashes()},null,2)+'\n');console.error(error);process.exitCode=1;});
