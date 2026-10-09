// Production validation/payload boundary checks; no backend mutation.
const fs=require('node:fs'), path=require('node:path'), ts=require('typescript'), crypto=require('node:crypto');
function load(file){const source=fs.readFileSync(file,'utf8');const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:false}}).outputText;const m={exports:{}};new Function('module','exports','require',code)(m,m.exports,require);return m.exports;}
const {customerSchema}=load('schema/add/customer.ts');
const {MEMBER_DEFAULTS,memberPayload,memberFormValues}=load('lib/manage/members.ts');
const checks=[];
const check=(name,condition)=>checks.push({name,pass:!!condition});
const valid={...MEMBER_DEFAULTS,name:'  Member  ',phone:'  08123  '};
for(const [name,patch,expected] of [
 ['required minimal member',{},true],['blank name',{name:'   '},false],['blank phone',{phone:' '},false],
 ['name at 255',{name:'x'.repeat(255)},true],['name exceeds 255',{name:'x'.repeat(256)},false],
 ['phone at 50',{phone:'1'.repeat(50)},true],['phone exceeds 50',{phone:'1'.repeat(51)},false],
 ['valid email',{email:'member@example.test'},true],['invalid email',{email:'invalid'},false],
 ['address storage limit',{address:'x'.repeat(255)},true],['address exceeds storage',{address:'x'.repeat(256)},false],
 ['identity exceeds limit',{id_number:'x'.repeat(101)},false],['valid leap date',{date_of_birth:'2000-02-29'},true],
 ['invalid leap date',{date_of_birth:'2025-02-29'},false],['invalid day',{date_of_birth:'2026-04-31'},false],
 ['invalid month',{date_of_birth:'2026-13-01'},false],['invalid date format',{date_of_birth:'09/10/2026'},false],
 ['unsupported gender',{gender:'unknown'},false],['supported female gender',{gender:'female'},true],
]) check(name,customerSchema.safeParse({...valid,...patch}).success===expected);
const parsed=customerSchema.parse(valid),payload=memberPayload(parsed);
check('schema trims required strings',payload.name==='Member'&&payload.phone==='08123');
check('empty optionals become null',['email','id_number','address','date_of_birth','gender','notes'].every(k=>payload[k]===null));
const prefill=memberFormValues({name:'Existing',phone:'0899',date_of_birth:'1998-01-02T00:00:00.000Z',email:null,id_number:null,address:null,gender:null,notes:null});
check('backend nullable values prefill empty fields',prefill.email===''&&prefill.gender===''&&prefill.date_of_birth==='1998-01-02');
check('unsupported backend keys excluded',!('user_id' in payload)&&!('id' in payload));
const files=['schema/add/customer.ts','lib/manage/members.ts'];
const result={date:'2026-10-09',passed:checks.filter(x=>x.pass).length,failed:checks.filter(x=>!x.pass).length,checks,hashes:Object.fromEntries(files.map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex')])),scope:'Production Zod schema and payload helpers; no API/native/router execution.'};
fs.writeFileSync(path.join(__dirname,'schema-results.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));process.exitCode=result.failed?1:0;
