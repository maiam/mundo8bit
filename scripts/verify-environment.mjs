import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {connectCDP} from './cdp.mjs';
const c=await connectCDP(9334,t=>t.url.startsWith('http://127.0.0.1:5173'));
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const frames=()=>c.evaluate(`(async()=>{for(let i=0;i<3;i++)await new Promise(r=>requestAnimationFrame(r));})()`);
const shot=async name=>{await c.evaluate(`(async()=>{for(let i=0;i<5;i++)await new Promise(r=>requestAnimationFrame(r));qa.renderer.getContext().finish();})()`);const s=await c.send('Page.captureScreenshot',{format:'png'});writeFileSync(`docs/art/validation/ambiente-v01-${name}.png`,Buffer.from(s.data,'base64'));};
try{
 await c.send('Emulation.setTouchEmulationEnabled',{enabled:false,maxTouchPoints:1});
 await c.send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
 await c.send('Page.navigate',{url:'http://127.0.0.1:5173/'});await wait(3000);
 const result={};
 result.initial=await c.evaluate(`(async()=>{window.qa=await import(document.querySelector('script[src*="voxel-main.js"]').src);const speeds=await import('/src/voxel/controls.js');return {state:qa.environment.snapshot(),walk:speeds.PLAYER_WALK_SPEED,run:speeds.PLAYER_RUN_SPEED,error:document.querySelector('#error').textContent,chunks:qa.chunks.size};})()`);
 assert.equal(await c.evaluate(`document.querySelectorAll('body>canvas').length`),1);assert.equal(result.initial.walk,4.317);assert.equal(result.initial.run,5.612);assert.equal(result.initial.state.weather,'limpo');assert.equal(result.initial.error,'');assert.equal(result.initial.chunks,81);
 await shot('dia');
 // Avanço da simulação para inspecionar estados sem esperar vinte minutos.
 await c.evaluate(`qa.environment.advance(800-qa.environment.snapshot().seconds)`);await frames();
 result.night=await c.evaluate(`({state:qa.environment.snapshot(),sky:qa.scene.background.getHexString(),geometries:qa.renderer.info.memory.geometries})`);
 assert.equal(result.night.state.phase,'noite');await shot('noite');
 await c.evaluate(`(()=>{for(let i=0;i<1000;i++){const s=qa.environment.snapshot();if(s.phase==='noite'&&s.rain>.9)return;qa.environment.advance(10);}throw Error('Não encontrou noite chuvosa');})()`);await frames();
 result.rain=await c.evaluate(`(()=>{const r=qa.environmentView.rain,p=r.geometry.attributes.position.array;return {state:qa.environment.snapshot(),visible:r.visible,count:r.geometry.drawRange.count,finite:[...p].every(Number.isFinite),sky:qa.scene.background.getHexString()};})()`);
 assert.ok(result.rain.visible&&result.rain.count>0&&result.rain.count<=640&&result.rain.finite);await shot('noite-chuva');
 // Simula visibilitychange; verifica o evento de integração, não só a função pura.
 result.hidden=await c.evaluate(`(async()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));const before=qa.environment.snapshot().seconds;await new Promise(r=>setTimeout(r,300));const after=qa.environment.snapshot().seconds;delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));return {before,after};})()`);
 assert.equal(result.hidden.before,result.hidden.after);
 await c.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});
 await c.send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:2,mobile:true});await wait(200);
 result.portrait=await c.evaluate(`(async()=>{const before=qa.environment.snapshot().seconds;await new Promise(r=>setTimeout(r,300));return {paused:qa.touch.paused,before,after:qa.environment.snapshot().seconds};})()`);
 assert.equal(result.portrait.paused,true);assert.equal(result.portrait.before,result.portrait.after);
 await c.send('Emulation.setDeviceMetricsOverride',{width:844,height:390,deviceScaleFactor:2,mobile:true});await wait(400);await shot('mobile-noite-chuva');
 result.resumed=await c.evaluate(`({paused:qa.touch.paused,time:qa.environment.snapshot().seconds,error:document.querySelector('#error').textContent})`);
 assert.equal(result.resumed.paused,false);assert.ok(result.resumed.time>result.portrait.after);assert.equal(result.resumed.error,'');
 writeFileSync('docs/art/validation/ambiente-v01-result.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
}finally{c.close();}
