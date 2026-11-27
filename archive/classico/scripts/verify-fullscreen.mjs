import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {connectCDP} from './cdp.mjs';
const c=await connectCDP(9334,t=>t.url.startsWith('http://127.0.0.1:5173'));
async function tap(selector){const p=await c.evaluate(`(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);await c.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...p,id:11}]});await c.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
async function wait(){return c.evaluate(`new Promise(resolve=>{let n=0;const check=()=>{if(!qa.touch.fullscreen.busy&&++n>1)resolve({active:qa.touch.fullscreen.active,feedback:!document.querySelector('#fullscreen-feedback').hidden});else setTimeout(check,100);};setTimeout(check,100);})`);}
try{
 await c.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});await c.send('Emulation.setDeviceMetricsOverride',{width:844,height:390,deviceScaleFactor:2,mobile:true});
 await c.send('Page.reload',{ignoreCache:true});
 for(let i=0;i<40;i++){await new Promise(r=>setTimeout(r,100));try{if(await c.evaluate("document.querySelector('#loading')?.hidden===true"))break;}catch{}}
 await c.evaluate(`(async()=>{window.qa=await import('/src/main.js');qa.player.position.set(0,0,0);await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));})()`);
 assert.equal(await c.evaluate('qa.touch.fullscreen.supported'),true);assert.equal(await c.evaluate("document.querySelector('#fullscreen-invite').hidden"),false);
 await tap('#fullscreen-invite .fullscreen-button');const nativeAttempt=await wait();
 const simulated=!nativeAttempt.active;
 if(simulated){
  assert.ok(nativeAttempt.feedback);
  await c.evaluate(`window.fsRealDescriptors={request:Object.getOwnPropertyDescriptor(document.documentElement,'requestFullscreen'),exit:Object.getOwnPropertyDescriptor(document,'exitFullscreen'),element:Object.getOwnPropertyDescriptor(document,'fullscreenElement')};window.fsSimulated=false;Object.defineProperty(document,'fullscreenElement',{configurable:true,get:()=>fsSimulated?document.documentElement:null});Object.defineProperty(document.documentElement,'requestFullscreen',{configurable:true,value:()=>{fsSimulated=true;document.dispatchEvent(new Event('fullscreenchange'));return Promise.resolve();}});Object.defineProperty(document,'exitFullscreen',{configurable:true,value:()=>{fsSimulated=false;document.dispatchEvent(new Event('fullscreenchange'));return Promise.resolve();}});qa.touch.fullscreen.refresh();`);
  await tap('#menu-button');await tap('#game-menu .fullscreen-button');
 }
 const entered=await wait();assert.ok(entered.active);assert.ok(await c.evaluate('Boolean(document.fullscreenElement)'));
 assert.equal(await c.evaluate("document.querySelector('#game-menu .fullscreen-button').textContent"),'Sair da tela cheia');
 const image=await c.send('Page.captureScreenshot',{format:'png'});writeFileSync('docs/art/validation/mundo-fullscreen-v01-mobile.png',Buffer.from(image.data,'base64'));
 await tap('#menu-button');await tap('#game-menu .fullscreen-button');const exited=await wait();assert.equal(exited.active,false);assert.equal(await c.evaluate("document.querySelector('#game-menu .fullscreen-button').textContent"),'Entrar em tela cheia');
 await tap('#menu-button');await tap('#game-menu .fullscreen-button');assert.ok((await wait()).active);
 const controls=await c.evaluate(`(()=>{const p=document.querySelector('#joystick').getBoundingClientRect(),r=document.querySelector('#run').getBoundingClientRect();return [{x:p.x+p.width/2,y:p.y+p.height/2,id:1},{x:r.x+r.width/2,y:r.y+r.height/2,id:2}];})()`);
 await c.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:controls});controls[0].x+=30;await c.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:controls});assert.equal(await c.evaluate('qa.touch.running'),true);
 await c.evaluate('document.exitFullscreen()');await wait();assert.equal(await c.evaluate('qa.touch.running'),false);assert.equal(await c.evaluate('qa.touch.x'),0);await c.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 await c.evaluate(`window.fsOriginal=Object.getOwnPropertyDescriptor(document.documentElement,'requestFullscreen');Object.defineProperty(document.documentElement,'requestFullscreen',{configurable:true,value:()=>Promise.reject(Error('Denied by test'))});qa.touch.fullscreen.refresh();`);
 await tap('#menu-button');await tap('#game-menu .fullscreen-button');const rejected=await wait();assert.equal(rejected.active,false);assert.ok(rejected.feedback);assert.equal(await c.evaluate('qa.touch.paused'),false);
 await c.evaluate(`if(window.fsOriginal)Object.defineProperty(document.documentElement,'requestFullscreen',fsOriginal);else delete document.documentElement.requestFullscreen;window.fsEnabledOriginal=Object.getOwnPropertyDescriptor(document,'fullscreenEnabled');Object.defineProperty(document,'fullscreenEnabled',{configurable:true,value:false});qa.touch.fullscreen.refresh();`);
 assert.equal(await c.evaluate('qa.touch.fullscreen.supported'),false);assert.equal(await c.evaluate("document.querySelector('#game-menu .fullscreen-button').hidden"),true);assert.equal(await c.evaluate("document.querySelector('#fullscreen-help').hidden"),false);assert.equal(await c.evaluate('qa.touch.paused'),false);
 await c.evaluate(`if(window.fsEnabledOriginal)Object.defineProperty(document,'fullscreenEnabled',fsEnabledOriginal);else delete document.fullscreenEnabled;qa.touch.fullscreen.refresh();`);
 if(simulated)await c.evaluate(`for(const [key,object,name] of [['request',document.documentElement,'requestFullscreen'],['exit',document,'exitFullscreen'],['element',document,'fullscreenElement']]){const descriptor=fsRealDescriptors[key];if(descriptor)Object.defineProperty(object,name,descriptor);else delete object[name];}qa.touch.fullscreen.refresh();`);
 const report={nativeEntryConfirmed:nativeAttempt.active,nativeFallback:nativeAttempt.feedback,simulatedAPI:simulated,menuEntry:entered.active,menuExit:!exited.active,browserExitClearsControls:true,rejectionFallback:rejected.feedback,unsupportedFallback:true};writeFileSync('docs/art/validation/fullscreen-v01-result.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
}finally{c.close();}
