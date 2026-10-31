import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {connectCDP} from './cdp.mjs';
const c=await connectCDP(9334,t=>t.url.startsWith('http://127.0.0.1:5173'));
const settle=()=>c.evaluate('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');
const point=id=>c.evaluate(`(()=>{const r=document.querySelector('${id}').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);
async function tap(id){const p=await point(id);await c.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...p,id:11}]});await c.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
try{
 await c.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});
 await c.send('Emulation.setDeviceMetricsOverride',{width:844,height:390,deviceScaleFactor:3,mobile:true});await settle();
 await c.evaluate(`(async()=>{window.qa=await import(document.querySelector('script[src*="/src/main.js"]').src);qa.player.position.set(0,0,0);qa.touch.setZoom(1);})()`);
 const layout=await c.evaluate(`(()=>{const ids=['#joystick','#run','#zoom-controls','#menu-button'];return {paused:qa.touch.paused,mobile:qa.touch.mobile,halfHeight:qa.camera.top,rects:ids.map(id=>{const r=document.querySelector(id).getBoundingClientRect();return {id,x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom};})};})()`);
 assert.ok(layout.mobile&&!layout.paused);assert.ok(layout.halfHeight<=7.001);
 for(const r of layout.rects){assert.ok(r.x>=0&&r.y>=0&&r.right<=844&&r.bottom<=390);assert.ok(r.width>=44&&r.height>=44);}
 const pad=await point('#joystick'),run=await point('#run');
 const touches=[{...pad,id:1},{...run,id:2}];await c.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:touches});
 assert.equal(await c.evaluate('qa.touch.x'),0);touches[0].x+=34;await c.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:touches});
 const held=await c.evaluate('({x:qa.touch.x,running:qa.touch.running,zoom:qa.touch.zoom})');assert.ok(held.x>.7&&held.running);assert.equal(held.zoom,1);
 await c.send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:3,mobile:true});await settle();
 const pause=await c.evaluate(`(async()=>{const fauna=await import('/src/fauna.js');const before={player:[qa.player.position.x,qa.player.position.z],animals:[...fauna.activeAnimals.values()].map(a=>[a.data.x,a.data.z])};await new Promise(r=>setTimeout(r,250));return {paused:qa.touch.paused,x:qa.touch.x,z:qa.touch.z,running:qa.touch.running,gate:!document.querySelector('#rotate-screen').hidden,before,after:{player:[qa.player.position.x,qa.player.position.z],animals:[...fauna.activeAnimals.values()].map(a=>[a.data.x,a.data.z])}};})()`);
 assert.ok(pause.paused&&pause.gate);assert.equal(pause.x,0);assert.equal(pause.z,0);assert.equal(pause.running,false);assert.deepEqual(pause.before,pause.after);
 await c.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 await c.send('Emulation.setDeviceMetricsOverride',{width:844,height:390,deviceScaleFactor:3,mobile:true});await settle();
 assert.equal(await c.evaluate('qa.touch.paused'),false);assert.equal(await c.evaluate('qa.touch.running'),false);
 // Pinch only on the world canvas; joystick and run contacts must not count toward it.
 const world=[{x:362,y:150,id:3},{x:482,y:150,id:4}];await c.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:world});world[0].x=332;world[1].x=512;
 await c.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:world});await c.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 const pinched=await c.evaluate('qa.touch.zoom');assert.ok(pinched>1.35&&pinched<1.65);
 await tap('#zoom-reset');assert.equal(await c.evaluate('qa.touch.zoom'),1);
 await tap('#zoom-in');assert.ok(await c.evaluate('qa.touch.zoom>1'));await tap('#zoom-out');assert.ok(await c.evaluate('Math.abs(qa.touch.zoom-1)<.001'));
 const limits=await c.evaluate(`(()=>{for(let i=0;i<30;i++)document.querySelector('#zoom-in').click();const max={value:qa.touch.zoom,disabled:document.querySelector('#zoom-in').disabled};for(let i=0;i<50;i++)document.querySelector('#zoom-out').click();const min={value:qa.touch.zoom,disabled:document.querySelector('#zoom-out').disabled};return {max,min,maxAllowed:qa.touch.maxZoom,minAllowed:qa.touch.minZoom,pageScale:visualViewport.scale};})()`);
 assert.equal(limits.max.value,limits.maxAllowed);assert.ok(limits.max.disabled);assert.equal(limits.min.value,limits.minAllowed);assert.ok(limits.min.disabled);assert.equal(limits.pageScale,1);
 await tap('#zoom-reset');await tap('#menu-button');assert.equal(await c.evaluate("document.querySelector('#game-menu').hidden"),false);
 await tap('#home');assert.equal(await c.evaluate("document.querySelector('#game-menu').hidden"),true);assert.ok(await c.evaluate('Math.hypot(qa.player.position.x,qa.player.position.z)<.01'));
 // Compact landscape phones retain clear, reachable thumb controls.
 await c.send('Emulation.setDeviceMetricsOverride',{width:568,height:320,deviceScaleFactor:2,mobile:true});await settle();
 const compact=await c.evaluate(`(()=>{const pad=document.querySelector('#joystick').getBoundingClientRect(),run=document.querySelector('#run').getBoundingClientRect(),zoom=document.querySelector('#zoom-controls').getBoundingClientRect();return {paused:qa.touch.paused,pad:{x:pad.x,right:pad.right,bottom:pad.bottom},run:{x:run.x,right:run.right,bottom:run.bottom},zoom:{x:zoom.x,right:zoom.right,bottom:zoom.bottom}};})()`);
 assert.equal(compact.paused,false);assert.ok(compact.pad.x>=0&&compact.pad.bottom<=320&&compact.run.right<=568&&compact.run.bottom<=320);assert.ok(compact.pad.right<compact.run.x);assert.ok(compact.zoom.x>=0&&compact.zoom.right<=568);
 let image=await c.send('Page.captureScreenshot',{format:'png'});writeFileSync('docs/art/validation/mundo-mobile-v02-compact.png',Buffer.from(image.data,'base64'));
 await c.send('Emulation.setTouchEmulationEnabled',{enabled:false,maxTouchPoints:1});await c.send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});await settle();
 await c.evaluate('qa.touch.setZoom(1)');await c.send('Input.dispatchMouseEvent',{type:'mouseWheel',x:700,y:400,deltaX:0,deltaY:-200});assert.ok(await c.evaluate('qa.touch.zoom>1.1'));
 await c.evaluate("document.querySelector('#zoom-reset').focus()");
 await c.send('Input.dispatchKeyEvent',{type:'keyDown',key:' ',code:'Space',windowsVirtualKeyCode:32});await c.send('Input.dispatchKeyEvent',{type:'keyUp',key:' ',code:'Space',windowsVirtualKeyCode:32});assert.equal(await c.evaluate('qa.touch.zoom'),1);
 const keyboardStart=await c.evaluate('({x:qa.player.position.x,z:qa.player.position.z})');
 await c.send('Input.dispatchKeyEvent',{type:'keyDown',key:'w',code:'KeyW',windowsVirtualKeyCode:87});
 const keyboardEnd=await c.evaluate('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>r({x:qa.player.position.x,z:qa.player.position.z}))))');
 await c.send('Input.dispatchKeyEvent',{type:'keyUp',key:'w',code:'KeyW',windowsVirtualKeyCode:87});assert.ok(Math.hypot(keyboardEnd.x-keyboardStart.x,keyboardEnd.z-keyboardStart.z)>.001);
 console.log(JSON.stringify({layout,rotation:{paused:pause.paused,inputCleared:true,simulationFrozen:true},pinch:pinched,limits,compact,desktopWheel:true,keyboardAfterZoom:true,spaceActivatesButtons:true},null,2));
}finally{c.close();}
