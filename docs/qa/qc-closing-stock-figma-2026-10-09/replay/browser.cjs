// Native Node CDP: own hidden temporary Edge profile, existing Metro, no app/server changes.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),{spawn}=require('node:child_process');
const delay=ms=>new Promise(r=>setTimeout(r,ms));
async function launch(html,offline){
	const profile=fs.mkdtempSync(path.join('D:/Rapido-QC-temp/closing-stock-figma-2026-10-09','qc-browser-'));
	const child=spawn('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',['--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--disable-background-timer-throttling','--disable-renderer-backgrounding','--disable-backgrounding-occluded-windows','--remote-debugging-port=0',`--user-data-dir=${profile}`,'about:blank'],{windowsHide:true,stdio:'ignore'});
	let launchError;child.on('error',e=>launchError=e);
	const portFile=path.join(profile,'DevToolsActivePort');
	for(let i=0;!fs.existsSync(portFile);i++){if(launchError)throw launchError;if(i>=120)throw Error('Edge launch timeout');await delay(250);}
	const port=fs.readFileSync(portFile,'utf8').split('\n')[0];
	const targets=await(await fetch(`http://127.0.0.1:${port}/json/list`)).json();
	const ws=new WebSocket(targets.find(t=>t.type==='page'&&t.url==='about:blank').webSocketDebuggerUrl);
	await new Promise((r,j)=>{ws.addEventListener('open',r,{once:true});ws.addEventListener('error',j,{once:true});});
	let id=0;const pending=new Map(),errors=[],consoleErrors=[],network=[];
	ws.addEventListener('message',({data})=>{
		const m=JSON.parse(data);
		if(m.id){const p=pending.get(m.id);if(p){pending.delete(m.id);clearTimeout(p.timer);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}}
		else if(m.method==='Fetch.requestPaused'){
			let bytes=Buffer.from(html),type='text/html',status=200;
			if(offline&&m.params.resourceType!=='Document'){
				const url=new URL(m.params.request.url),decoded=decodeURIComponent(url.pathname);
				if(decoded.endsWith('/browser-entry.bundle')){bytes=offline.bundle;type='application/javascript';}
				else if(decoded.endsWith('/favicon.ico')){bytes=Buffer.alloc(0);status=204;}
				else {
					const name=path.basename(decoded),queryPath=url.searchParams.get('unstable_path');
					const candidate=queryPath?path.resolve(queryPath,name):null;
					const asset=offline.files.find(f=>(candidate&&path.resolve(f)===candidate)||path.basename(f)===name);
					if(asset){bytes=fs.readFileSync(asset);type=asset.endsWith('.ttf')?'font/ttf':asset.endsWith('.svg')?'image/svg+xml':asset.endsWith('.png')?'image/png':'application/octet-stream';}
					else {bytes=Buffer.from('Blocked unknown test request');status=404;network.push({blocked:url.origin+url.pathname});}
				}
			}
			send('Fetch.fulfillRequest',{requestId:m.params.requestId,responseCode:status,responseHeaders:[{name:'Content-Type',value:type}],body:bytes.toString('base64')}).catch(e=>errors.push(e.message));
		}
		else if(m.method==='Runtime.exceptionThrown'){errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);console.log('Runtime error: '+errors.at(-1).slice(0,1200));}
		else if(m.method==='Runtime.consoleAPICalled'&&m.params.type==='error'){consoleErrors.push(m.params.args.map(a=>a.value||a.description).join(' '));console.log('Console error: '+consoleErrors.at(-1).slice(0,1200));}
		else if(m.method==='Network.responseReceived'){network.push({url:m.params.response.url,status:m.params.response.status,type:m.params.type});if(m.params.type==='Script')console.log('Bundle HTTP '+m.params.response.status);}
		else if(m.method==='Network.loadingFailed')network.push({error:m.params.errorText,type:m.params.type});
	});
	function send(method,params={}){return new Promise((resolve,reject)=>{const next=++id,timer=setTimeout(()=>{pending.delete(next);reject(Error(method+' timeout'));},30000);pending.set(next,{resolve,reject,timer});ws.send(JSON.stringify({id:next,method,params}));});}
	async function evaluate(expression){const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;}
	await send('Runtime.enable');await send('Page.enable');await send('Network.enable');await send('Fetch.enable',{patterns:offline?[{requestStage:'Request'}]:[{resourceType:'Document',requestStage:'Request'}]});
	await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:false});
	return {send,evaluate,errors,consoleErrors,network,close:async()=>{await send('Browser.close').catch(()=>{});ws.close();child.kill();},delay};
}
module.exports={launch,delay};
