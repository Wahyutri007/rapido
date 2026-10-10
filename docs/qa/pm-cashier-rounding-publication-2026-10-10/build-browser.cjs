// One-shot offline build. Replays write only to a separate reviewer directory.
const requireApp=require('node:module').createRequire("C:/Users/Wahyu/Downloads/rapido-pm-cashier-publish-2026-10-10/package.json");
const fs = require('node:fs'), path = require('node:path'), cp = require('node:child_process'), crypto = require('node:crypto');
const root = process.cwd(), packet = __dirname, fixture = "C:\\Users\\Wahyu\\Downloads\\rapido-pm-cashier-publish-2026-10-10\\.expo\\pm-rounding-main-2026-10-10\\preview-fixture";
const outputIndex = process.argv.indexOf('--output');
if (outputIndex === -1 || !process.argv[outputIndex + 1]) throw Error('Use --output <separate reviewer directory>.');
const output = path.resolve(process.argv[outputIndex + 1]);
const historical = false;
const boundFile = file => historical && file === 'components/common/Wrapper.tsx' ? path.join(packet,'before/components/common/Wrapper.tsx') : file;
const relative = path.relative(packet, output);
if (!relative.startsWith('..') && !path.isAbsolute(relative)) throw Error('Reviewer output must be outside the frozen packet.');
if (fs.existsSync(path.join(output, 'build.json'))) throw Error('Use a new output directory; preserve prior builds.');
fs.mkdirSync(path.join(output, 'file-map-cache'), {recursive:true});
const seedIndex=process.argv.indexOf('--cache-seed');
if(seedIndex>=0){const seed=path.resolve(process.argv[seedIndex+1]);for(const name of ['file-map-cache','transform-cache'])if(fs.existsSync(path.join(seed,name)))fs.cpSync(path.join(seed,name),path.join(output,name),{recursive:true});}
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const sha = file => digest(fs.readFileSync(file));
const protectedPaths = ['metro.config.js', 'babel.config.js', 'tailwind.config.js', 'global.css'];
const before = Object.fromEntries(protectedPaths.map(file => [file, sha(file)]));
const owned = ["app/(no-layout)/manage/pos-settings/rounding.tsx","components/common/SingleSelect.tsx","app/(no-layout)/manage/pos-settings/_layout.tsx","app/(no-layout)/manage/pos-settings/rounding-detail.tsx","components/common/Wrapper.tsx","components/common/Card.tsx","components/common/Text.tsx","components/common/Header.tsx","components/common/SearchBar.tsx","components/common/BottomActionButton.tsx","components/common/AlertModal.tsx","components/common/SuccessModal.tsx","components/ui/button/index.tsx","components/ui/actionsheet/index.tsx","api/hooks/settings.ts","store/appModeStore.ts","metro.config.js","babel.config.js","tailwind.config.js","global.css","package.json","package-lock.json","components/common/BottomActionBar.tsx"];
const sources = Object.fromEntries(owned.map(file => [file, sha(boundFile(file))]));
const fixtureHashes = Object.fromEntries(fs.readdirSync(fixture,{recursive:true}).filter(name=>fs.statSync(path.join(fixture,name)).isFile()).map(name=>[name,sha(path.join(fixture,name))]));
const transformedSources = {}, compiledInputs = {};
const Metro = requireApp('metro'), {getDefaultConfig} = requireApp('expo/metro-config'), {FileStore} = requireApp('metro-cache');
const config = getDefaultConfig(root);
config.maxWorkers = 1; config.resolver.useWatchman = false;
config.cacheStores = [new FileStore({root:path.join(output,'transform-cache')})];
config.fileMapCacheDirectory = path.join(output,'file-map-cache');
const dependencyRoot=fs.realpathSync(path.join(root,'node_modules')),assetStorageRoot=fs.realpathSync(path.join(root,'assets')),sharedAssetsRoot=path.join(path.dirname(dependencyRoot),'assets'),assetBindings={}; config.resolver.nodeModulesPaths=[dependencyRoot]; config.cacheVersion='pm-rounding-main-candidate-20261010'; config.watchFolders=[root,dependencyRoot,sharedAssetsRoot];
config.resolver.blockList = /(?:[\\/]\.git[\\/]|[\\/]docs[\\/](?:qa|previews)[\\/])/;
config.serializer.getModulesRunBeforeMainModule = () => [];
config.serializer.processModuleFilter = module => {
  if(fs.existsSync(module.path)&&fs.statSync(module.path).isFile()){const hash=digest(module.getSource());if(hash!==sha(module.path))throw Error('Compiled input race: '+module.path);compiledInputs[module.path]=hash;}
  const relative = path.relative(root, module.path).replaceAll('\\','/');
  if (!relative.startsWith('../') && !path.isAbsolute(relative) && !relative.startsWith('node_modules/') && fs.existsSync(module.path)) {
    const hash = digest(module.getSource());
    if (hash !== sha(module.path)) throw Error('Source changed during build: '+relative);
    transformedSources[relative] = hash;
    const snapshot=path.join(output,'source-snapshot',relative);fs.mkdirSync(path.dirname(snapshot),{recursive:true});fs.writeFileSync(snapshot,module.getSource());
  }
  return true;
};
config.resolver.resolveRequest = (context, name, platform) => {
  const web = {...context, preferNativePlatform:false, mainFields:['browser','module','main']};
  if(name==='@/lib/haptics')return {type:'sourceFile',filePath:path.join(fixture,'router.jsx')};
  // Private checkout assets were moved byte-identically to D to relieve C.
  // Metro's cached map does not follow their Windows junction during lookup.
  // Reuse only byte-identical original assets on C: Metro cannot serialize
  // cross-drive D asset paths on Windows. Shared source code is never imported.
  let requested=path.isAbsolute(name)?path.resolve(name):name.startsWith('@/assets/')?path.join(root,name.slice(2)):name.startsWith('.')?path.resolve(path.dirname(context.originModulePath),name):null;
  const requestedRoot=requested && [path.join(root,'assets'),assetStorageRoot,sharedAssetsRoot].find(base=>requested.startsWith(base+path.sep));
  if(requestedRoot){
    if(!fs.existsSync(requested)||!fs.statSync(requested).isFile())requested=[...config.resolver.sourceExts.flatMap(ext=>[requested+'.web.'+ext,requested+'.'+ext]),...config.resolver.sourceExts.flatMap(ext=>[path.join(requested,'index.web.'+ext),path.join(requested,'index.'+ext)])].find(file=>fs.existsSync(file)&&fs.statSync(file).isFile());
    if(!requested)throw Error('Missing exact private asset entry '+name);
    const relativeAsset=path.relative(requestedRoot,requested),original=path.join(assetStorageRoot,relativeAsset),sharedAsset=path.join(sharedAssetsRoot,relativeAsset),hash=sha(original);
    if(!fs.existsSync(sharedAsset)||sha(sharedAsset)!==hash)throw Error('Shared asset differs from exact private candidate '+relativeAsset);
    assetBindings[original]=hash;assetBindings[sharedAsset]=hash;
    if(config.resolver.assetExts.includes(path.extname(requested).slice(1)))return {type:'assetFiles',filePaths:[sharedAsset]};
    return {type:'sourceFile',filePath:sharedAsset};
  }
  if(historical && name === '@/components/common/Wrapper')return {type:'sourceFile',filePath:path.join(packet,'before/components/common/Wrapper.tsx')};
  if (name === 'expo-router' || name === 'expo-router/react-navigation') return {type:'sourceFile',filePath:path.join(fixture,'router.jsx')};
  if (name === '@/components/custom/JSStack') return {type:'sourceFile',filePath:path.join(fixture,'stack.jsx')};
  if (require('node:module').isBuiltin(name)) {try {return context.resolveRequest(web,name,platform);} catch {return {type:'empty'};}}
  const aliases = {'react-native':'react-native-web','react-native/index':'react-native-web','react-native/Libraries/Image/resolveAssetSource':'expo-asset/build/resolveAssetSource','@react-native/assets-registry/registry':'react-native-web/dist/modules/AssetRegistry'};
  const result = context.resolveRequest(web, aliases[name] ?? name, platform);
  if(historical && result.type==='sourceFile' && path.resolve(result.filePath)===path.join(root,'components/common/Wrapper.tsx'))return {type:'sourceFile',filePath:path.join(packet,'before/components/common/Wrapper.tsx')};
  if (result.type === 'sourceFile' && path.resolve(result.filePath) === path.join(root,'components/custom/JSStack.tsx')) return {type:'sourceFile',filePath:path.join(fixture,'stack.jsx')};
  const stubbed=["api/hooks/settings.ts","api/hooks/auth.ts","api/hooks/store-shift.ts","api/hooks/stores.ts","context/AuthContext.tsx","store/useActiveStore.ts","store/appModeStore.ts","lib/haptics.ts"].map(f=>path.resolve(root,f).toLowerCase());
  if(result.type==="sourceFile"&&stubbed.includes(path.resolve(result.filePath).toLowerCase()))return {type:"sourceFile",filePath:path.join(fixture,"router.jsx")};
  return result;
};
// Preserve Expo's per-dependency import/require export conditions. Forcing both
// selects ESM Babel helpers for CJS dependencies and invalidates the preview.
config.reporter = {update:event => {if(event.type==='transformer_load_failed') console.error(event.error);}};
process.env.NATIVEWIND_OS = 'web';
const style = cp.spawnSync(process.execPath,['node_modules/tailwindcss/lib/cli.js','--input','global.css','--output',path.join(output,'style.css'),'--content','app/**/*.{tsx,ts},components/**/*.{tsx,ts}'],{encoding:'utf8',env:{...process.env,NATIVEWIND_OS:'web'}});
if (style.status !== 0) throw Error(style.stderr || 'Tailwind failed');
Metro.runBuild(config,{entry:path.relative(root,path.join(fixture,'entry.jsx')).replaceAll('\\','/'),platform:'web',dev:false,minify:false,assets:true}).then(result => {
  fs.writeFileSync(path.join(output,'bundle.js'),result.code);
  fs.writeFileSync(path.join(output,'assets.json'),JSON.stringify(result.assets ?? [],null,2));
  const after = Object.fromEntries(protectedPaths.map(file => [file,sha(file)]));
  const drift = protectedPaths.filter(file => before[file] !== after[file]);
  for (const [file,hash] of Object.entries(sources)) if (sha(boundFile(file))!==hash) throw Error('Intake source drift: '+file);
  for (const [file,hash] of Object.entries(transformedSources)) if (sha(file)!==hash) throw Error('Compiled source drift: '+file);
  for (const [file,hash] of Object.entries(fixtureHashes)) if (sha(path.join(fixture,file))!==hash) throw Error('Fixture drift: '+file);
  for(const [file,hash]of Object.entries({...compiledInputs,...assetBindings}))if(sha(file)!==hash)throw Error("Compiled dependency/asset drift: "+file);
  const report = {compiledInputs,assetBindings,ticket:'PM-CASHIER-CATALOG-BILLS-INDEPENDENT',fixture,historical,sources,transformedSources,fixtureHashes,bundleHash:sha(path.join(output,'bundle.js')),styleHash:sha(path.join(output,'style.css')),before,after,drift,assetCount:(result.assets??[]).length,bytes:Buffer.byteLength(result.code),scope:'Actual production source/components/fonts/CSS on RN Web; byte-identical original C assets substituted for private D copies with both paths SHA-bound. Router/focus/stack-header selection and safe-area seed are fixtures. One worker and private caches, no listener/shared runtime/config mutation. Full Expo bootstrap/router/native/payment excluded.'};
  fs.writeFileSync(path.join(output,'build.json'),JSON.stringify(report,null,2));
  if (drift.some(file=>file!=='node_modules/react-native-css-interop/.cache/android.js')) throw Error('Protected web config drift');
  console.log(JSON.stringify({bytes:report.bytes,assets:report.assetCount,sourceCount:Object.keys(transformedSources).length,drift}));
}).catch(error => {fs.writeFileSync(path.join(output,'build-error.json'),JSON.stringify({message:error.message,stack:error.stack},null,2));console.error(error.message);process.exitCode=1;});
