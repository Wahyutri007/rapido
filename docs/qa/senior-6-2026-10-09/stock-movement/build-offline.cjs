// One-shot build, no HTTP server or project Metro/NativeWind config loading.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=process.cwd(),own=path.join(root,'.expo/senior6-stock-movement-offline');
fs.mkdirSync(own,{recursive:true});
fs.mkdirSync(path.join(own,'file-map-cache'),{recursive:true});
process.env.EXPO_ROUTER_APP_ROOT=path.join(root,'app');
const guarded=['metro.config.js','babel.config.js','node_modules/react-native-css-interop/.cache/android.js','node_modules/react-native-css-interop/.cache/web.js'];
const hashes=()=>Object.fromEntries(guarded.filter(f=>fs.existsSync(f)).map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex')]));
const before=hashes();
const entryFile=path.relative(root,path.join(__dirname,'ui-entry.jsx'));
// Replay reads the frozen entry; outputs/cache remain under .expo only.
const Metro=require('metro');
const {getDefaultConfig}=require('expo/metro-config');
const {FileStore}=require('metro-cache');
let config=getDefaultConfig(root);
// CLI normally includes projectRoot in watchFolders before passing to Metro.
config.watchFolders=[root];config.resolver.useWatchman=false;
config.maxWorkers=1;config.cacheStores=[new FileStore({root:path.join(own,'transform-cache')})];config.cacheVersion='sd6-stock-movement-isolated';
config.fileMapCacheDirectory=path.join(own,'file-map-cache');
config.reporter={update:event=>{if(event.type==='bundle_build_started')console.log('Offline build started; no server/listener');if(event.type==='transformer_load_failed')console.error(event.error);}};
const output=path.join(own,'entry.bundle.js');
// Use installed Expo CLI's complete web resolver/polyfills/asset registry.
// The callback receives only this one-shot builder instance, never shared Metro.
let ownServer;
const standardOutput=require(path.join(path.dirname(require.resolve('metro/package.json')),'src/shared/output/bundle.js'));
(async()=>{
 const {withMetroMultiPlatformAsync}=require('@expo/cli/build/src/start/server/metro/withMetroMultiPlatform');
 config=await withMetroMultiPlatformAsync(root,{config,exp:{platforms:['web']},platformBundlers:{web:'metro'},serverRoot:root,isTsconfigPathsEnabled:false,isAutolinkingResolverEnabled:false,isExporting:true,isReactServerComponentsEnabled:false,getMetroBundler:()=>ownServer.getBundler().getBundler()});
 return Metro.runBuild(config,{entry:entryFile,platform:'web',dev:false,minify:false,assets:true,customResolverOptions:{environment:'client',exporting:true},customTransformOptions:{environment:'client'},output:{...standardOutput,build:(server,options,buildOptions)=>{ownServer=server;return standardOutput.build(server,options,buildOptions);}}});
})().then(result=>{
 fs.writeFileSync(output,result.code);fs.writeFileSync(path.join(own,'assets.json'),JSON.stringify(result.assets??[],null,2));
 const after=hashes();assert.deepEqual(after,before);
 fs.writeFileSync(path.join(own,'build-result.json'),JSON.stringify({output,bytes:Buffer.byteLength(result.code),assets:(result.assets??[]).length,before,after,limitations:'One-shot isolated Metro API build; no root Metro config/NativeWind plugin, own transform cache, stylesheet supplied by own Tailwind output.'},null,2));console.log('Offline bundle ready: '+Buffer.byteLength(result.code)+' bytes');
}).catch(error=>{fs.writeFileSync(path.join(own,'build-error.json'),JSON.stringify({message:error.message,stack:error.stack,before,after:hashes()},null,2));console.error(error);process.exitCode=1;});
