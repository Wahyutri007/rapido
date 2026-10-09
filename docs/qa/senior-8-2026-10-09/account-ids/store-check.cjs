// Reuse the production module loader and result writer, not ledger scenarios.
const fs = require("node:fs"),
	path = require("node:path");
const original = fs
	.readFileSync(path.join(__dirname, "../ledger-ids/store-check.cjs"), "utf8")
	.replaceAll("\r\n", "\n");
const start = "const entry =",
	end = "const result = {";
if (original.split(start).length !== 2 || original.split(end).length !== 2)
	throw Error("Historical harness anchors changed");
const cases = `
const payload=(name="A",debit=10,credit=0)=>({name,code:"101",classification:"Aset",subClassification:"Kas",currency:"IDR",description:"Fixture",debit,credit});
const reset=(accounts=[])=>store.setState({accounts});
const accounts=()=>store.getState().accounts;
reset();
const before=store.getState();
const first=store.getState().addAccount(payload("A",10));
const second=store.getState().addAccount(payload("B",20));
check("normal ID format remains timestamp string",first,"1234");
check("same-millisecond account IDs differ",first!==second,true);
check("collision gets first unused suffix",second,"1234-1");
check("append order and payload preserved",accounts().map(a=>[a.name,a.debit]),[["A",10],["B",20]]);
check("returned IDs identify inserted records",accounts().map(a=>a.id),[first,second]);
check("other state and action references unchanged",Object.keys(before).filter(k=>k!=="accounts"&&before[k]!==store.getState()[k]),[]);
store.getState().updateAccount(first,{name:"A edited"});
check("metadata edit touches only target record",accounts().map(a=>a.name),["A edited","B"]);
store.getState().updateBalance(second,0,40);
check("balance edit touches only target record",accounts().map(a=>[a.debit,a.credit]),[[10,0],[0,40]]);
check("totals include the two independent accounts",store.getState().getTotals(),{totalDebit:10,totalCredit:40,difference:30});
store.getState().resetBalance(first);
check("reset touches only target record",accounts().map(a=>[a.debit,a.credit]),[[0,0],[0,40]]);
store.getState().deleteAccount(second);
check("deleting second keeps first",accounts().map(a=>a.id),[first]);
check("deleting second keeps first metadata",accounts().map(a=>a.name),["A edited"]);
const seed=[{...payload(),id:"1234"},{...payload(),id:"1234-1"},{...payload(),id:"1234-3"}];
reset(seed);
check("existing suffix gap selected",store.getState().addAccount(payload()),"1234-2");
check("existing higher suffix skipped",store.getState().addAccount(payload()),"1234-4");
check("seed references untouched",accounts().slice(0,3).every((a,i)=>a===seed[i]),true);
clock=5000;check("new timestamp uses unsuffixed ID",store.getState().addAccount(payload()),"5000");
clock=1234;check("backwards clock does not collide",store.getState().addAccount(payload()),"1234-5");
reset();clock=42;
const input=Object.freeze(payload("Frozen",0,9));store.getState().addAccount(input);
check("caller payload not mutated",Object.hasOwn(input,"id"),false);
check("all payload fields retained",Object.fromEntries(Object.entries(accounts()[0]).filter(([k])=>k!=="id")),input);
reset();clock=77;
const ids=Array.from({length:50},(_,i)=>store.getState().addAccount(payload("Account"+i,i)));
check("burst has 50 distinct IDs",new Set(ids).size,50);
check("burst stores every returned ID in append order",accounts().map(a=>a.id),ids);
check("burst preserves 50 payloads",accounts().map(a=>a.name),Array.from({length:50},(_,i)=>"Account"+i));
reset();clock=88;
let nested=false,nestedId;
const stop=store.subscribe(()=>{if(!nested){nested=true;nestedId=store.getState().addAccount(payload("Nested"));}});
const outerId=store.getState().addAccount(payload("Outer"));stop();
check("reentrant subscriber receives distinct ID",outerId!==nestedId,true);
check("reentrant returned IDs match inserted order",accounts().map(a=>a.id),[outerId,nestedId]);
check("reentrant payloads retained",accounts().map(a=>a.name),["Outer","Nested"]);
`;
new Function(
	"require",
	"__dirname",
	original.slice(0, original.indexOf(start)) +
		cases +
		original.slice(original.indexOf(end)),
)(require, __dirname);
