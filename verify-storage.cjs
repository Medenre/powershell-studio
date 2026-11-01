'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const http=require('node:http');
const {spawn}=require('node:child_process');

const candidates=[
  path.join(process.env.PROGRAMFILES||'','Google/Chrome/Application/chrome.exe'),
  path.join(process.env['PROGRAMFILES(X86)']||'','Microsoft/Edge/Application/msedge.exe')
];
const executable=candidates.find(fs.existsSync);
if(!executable)throw Error('Chrome ou Edge est nécessaire pour vérifier IndexedDB.');
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'psstudio-storage-'));
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const server=http.createServer((request,response)=>{
  response.setHeader('Content-Type',request.url==='/storage.js'?'text/javascript; charset=utf-8':'text/html; charset=utf-8');
  response.end(request.url==='/storage.js'?fs.readFileSync(path.join(__dirname,'storage.js')):'<!doctype html><meta charset="utf-8"><script src="/storage.js"></script>');
});
let browser,channel;
async function evaluate(endpoint,expression){
  channel=new WebSocket(endpoint);
  await new Promise((resolve,reject)=>{channel.onopen=resolve;channel.onerror=()=>reject(Error('Connexion Chrome DevTools impossible'));});
  return new Promise((resolve,reject)=>{
    const timeout=setTimeout(()=>reject(Error('IndexedDB : délai dépassé')),10000);
    channel.onmessage=event=>{
      const message=JSON.parse(event.data);
      if(message.id!==1)return;
      clearTimeout(timeout);
      if(message.error||message.result?.exceptionDetails)reject(Error(JSON.stringify(message.error||message.result.exceptionDetails)));
      else resolve(message.result.result.value);
    };
    channel.send(JSON.stringify({id:1,method:'Runtime.evaluate',params:{expression,awaitPromise:true,returnByValue:true}}));
  });
}
(async()=>{
  try{
    await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
    const address=`http://127.0.0.1:${server.address().port}/`;
    browser=spawn(executable,['--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--remote-debugging-port=0',`--user-data-dir=${profile}`,address],{stdio:'ignore',windowsHide:true});
    let port;
    for(let i=0;i<100;i++){
      const portFile=path.join(profile,'DevToolsActivePort');
      if(fs.existsSync(portFile)){port=Number(fs.readFileSync(portFile,'utf8').split(/\r?\n/)[0]);break;}
      if(browser.exitCode!==null)throw Error('Chrome/Edge a quitté avant le test');
      await sleep(100);
    }
    if(!port)throw Error('Port DevTools introuvable');
    let page;
    for(let i=0;i<50;i++){
      const tabs=await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
      page=tabs.find(tab=>tab.type==='page'&&tab.url===address);
      if(page)break;
      await sleep(100);
    }
    if(!page)throw Error('Page de test introuvable');
    await sleep(600);
    const result=await evaluate(page.webSocketDebuggerUrl,`(async()=>{
      await new Promise(resolve=>{if(document.readyState==='complete')resolve();else window.addEventListener('load',resolve,{once:true});});
      const large='x'.repeat(2100000);
      const mode=await StudioStorage.save(large);
      const restored=await StudioStorage.load();
      const original=Storage.prototype.setItem;
      Storage.prototype.setItem=function(key,value){if(key==='ps-studio')throw new DOMException('Quota dépassé','QuotaExceededError');return original.call(this,key,value);};
      let fallback,loaded;
      try{fallback=await StudioStorage.save('petit projet');loaded=await StudioStorage.load();}
      finally{Storage.prototype.setItem=original;}
      return {mode,largeRestored:restored===large,fallback,smallRestored:loaded==='petit projet'};
    })()`);
    assert.deepEqual(result,{mode:'idb',largeRestored:true,fallback:'idb',smallRestored:true});
    console.log('PASS: IndexedDB conserve un grand projet et prend le relais quand localStorage est plein');
  }finally{
    channel?.close();
    if(browser&&browser.exitCode===null){
      const exited=new Promise(resolve=>browser.once('exit',resolve));
      browser.kill();
      await exited;
    }
    await new Promise(resolve=>server.close(resolve));
    const root=path.resolve(os.tmpdir())+path.sep;
    if(path.resolve(profile).startsWith(root))fs.rmSync(profile,{recursive:true,force:true,maxRetries:10,retryDelay:200});
  }
})().catch(error=>{console.error(error);process.exitCode=1;});
