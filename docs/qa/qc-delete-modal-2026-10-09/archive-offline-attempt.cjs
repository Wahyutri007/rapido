const fs=require('node:fs'),path=require('node:path');
for(const [folder,file] of [['final','browser-results.json'],['final','failure.png'],['orientation-current','results.json'],['orientation-current','failure.png']]){
 const from=path.join(__dirname,folder,file),to=path.join(__dirname,'interim','native-resolution-'+folder+'-'+file);if(fs.existsSync(from)&&!fs.existsSync(to))fs.copyFileSync(from,to);
}
for(const file of ['offline-diagnostic.json','offline-diagnostic.png']){const from=path.join(__dirname,'interim',file),to=path.join(__dirname,'interim','native-resolution-'+file);if(fs.existsSync(from)&&!fs.existsSync(to))fs.copyFileSync(from,to);}
console.log('Preserved zero-assertion fallback resolution attempt.');
