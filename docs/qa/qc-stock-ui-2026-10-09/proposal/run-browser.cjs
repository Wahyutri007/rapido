const fs=require('node:fs'),path=require('node:path'),{createRequire}=require('node:module');
const original=path.resolve(__dirname,'../browser.cjs');
if(!process.argv.includes('--candidate'))throw Error('Explicit --candidate required');
new Function('require','__dirname','console',fs.readFileSync(original,'utf8'))(createRequire(original),__dirname,console);
