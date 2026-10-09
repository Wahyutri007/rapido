// One-shot offline build. Replays write only to a separate reviewer directory.
const fs = require('node:fs'), path = require('node:path'), cp = require('node:child_process'), crypto = require('node:crypto');
const root = process.cwd(), packet = __dirname, fixture = path.join(packet, 'preview-fixture');
const outputIndex = process.argv.indexOf('--output');
if (outputIndex === -1 || !process.argv[outputIndex + 1]) throw Error('Use --output <separate reviewer directory>.');
const output = path.resolve(process.argv[outputIndex + 1]);
const historical = process.argv.includes('--baseline-wrapper');
const boundFile = file => historical && file === 'components/common/Wrapper.tsx' ? path.join(packet,'before/components/common/Wrapper.tsx') : file;
const relative = path.relative(packet, output);
if (!relative.startsWith('..') && !path.isAbsolute(relative)) throw Error('Reviewer output must be outside the frozen packet.');
if (fs.existsSync(path.join(output, 'build.json'))) throw Error('Use a new output directory; preserve prior builds.');
fs.mkdirSync(path.join(output, 'file-map-cache'), {recursive:true});
const seedIndex=process.argv.indexOf('--cache-seed');
if(seedIndex>=0){const seed=path.resolve(process.argv[seedIndex+1]);for(const name of ['file-map-cache','transform-cache'])if(fs.existsSync(path.join(seed,name)))fs.cpSync(path.join(seed,name),path.join(output,name),{recursive:true});}
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const sha = file => digest(fs.readFileSync(file));
const protectedPaths = ['metro.config.js', 'babel.config.js', 'tailwind.config.js', 'global.css', 'node_modules/react-native-css-interop/.cache/android.js'];
const before = Object.fromEntries(protectedPaths.map(file => [file, sha(file)]));
const owned = ["components/feature/cashier/scanner/CashierScannerScreen.tsx","components/feature/cashier/scanner/CashierScannerDetailScreen.tsx","app/(no-layout)/(cashier)/scanner/index.tsx","app/(no-layout)/(cashier)/scanner/detail.tsx","app/(no-layout)/(cashier)/scanner/_layout.tsx","lib/cashier/scanner.ts","types/ui/cashier/scanner.ts","constants/data/cashier-scanner-preview.ts","components/common/Header.tsx","components/common/Wrapper.tsx","app/(no-layout)/(cashier)/_layout.tsx"];
const sources = Object.fromEntries(owned.map(file => [file, sha(boundFile(file))]));
const fixtureHashes = Object.fromEntries(fs.readdirSync(fixture).map(name => [name, sha(path.join(fixture,name))]));
const transformedSources = {}, compiledInputs = {};
const Metro = require('metro'), {getDefaultConfig} = require('expo/metro-config'), {FileStore} = require('metro-cache');
const config = getDefaultConfig(root);
config.maxWorkers = 1; config.resolver.useWatchman = false;
config.cacheStores = [new FileStore({root:path.join(output,'transform-cache')})];
config.fileMapCacheDirectory = path.join(output,'file-map-cache');
const dependencyRoot=fs.realpathSync(path.join(root,'node_modules')); config.resolver.nodeModulesPaths=[dependencyRoot]; config.cacheVersion='pm-scanner-integration-offline-web'; config.watchFolders=[root,dependencyRoot];
config.resolver.blockList = /[\\/]\.git[\\/]/;
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
  if(historical && name === '@/components/common/Wrapper')return {type:'sourceFile',filePath:path.join(packet,'before/components/common/Wrapper.tsx')};
  if (name === 'expo-router' || name === 'expo-router/react-navigation') return {type:'sourceFile',filePath:path.join(fixture,'router.jsx')};
  if (name === '@/components/custom/JSStack') return {type:'sourceFile',filePath:path.join(fixture,'stack.jsx')};
  if (require('node:module').isBuiltin(name)) {try {return context.resolveRequest(web,name,platform);} catch {return {type:'empty'};}}
  const aliases = {'react-native':'react-native-web','react-native/index':'react-native-web','react-native/Libraries/Image/resolveAssetSource':'expo-asset/build/resolveAssetSource','@react-native/assets-registry/registry':'react-native-web/dist/modules/AssetRegistry'};
  const result = context.resolveRequest(web, aliases[name] ?? name, platform);
  if(historical && result.type==='sourceFile' && path.resolve(result.filePath)===path.join(root,'components/common/Wrapper.tsx'))return {type:'sourceFile',filePath:path.join(packet,'before/components/common/Wrapper.tsx')};
  if (result.type === 'sourceFile' && path.resolve(result.filePath) === path.join(root,'components/custom/JSStack.tsx')) return {type:'sourceFile',filePath:path.join(fixture,'stack.jsx')};
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
  for(const [file,hash]of Object.entries(compiledInputs))if(sha(file)!==hash)throw Error("Compiled dependency drift: "+file);
  const report = {compiledInputs,ticket:'PM-CASHIER-SCANNER-INTEGRATION',historical,sources,transformedSources,fixtureHashes,bundleHash:sha(path.join(output,'bundle.js')),styleHash:sha(path.join(output,'style.css')),before,after,drift,assetCount:(result.assets??[]).length,bytes:Buffer.byteLength(result.code),scope:'Actual production source/components/fonts/CSS on RN Web; historical mode resolves the intake screen snapshot explicitly. Router/focus/stack-header selection and safe-area seed are fixtures. One worker and private caches, no listener/shared runtime/config mutation. Full Expo bootstrap/router/native/payment excluded.'};
  fs.writeFileSync(path.join(output,'build.json'),JSON.stringify(report,null,2));
  if (drift.some(file=>file!=='node_modules/react-native-css-interop/.cache/android.js')) throw Error('Protected web config drift');
  console.log(JSON.stringify({bytes:report.bytes,assets:report.assetCount,sourceCount:Object.keys(transformedSources).length,drift}));
}).catch(error => {fs.writeFileSync(path.join(output,'build-error.json'),JSON.stringify({message:error.message,stack:error.stack},null,2));console.error(error.message);process.exitCode=1;});
