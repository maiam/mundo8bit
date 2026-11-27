// Browser QA for the pixel-art default (32×32 trees, 12 px/unit) and its toggle. Requires `npm run dev` and Chromium with --remote-debugging-port=9334.
import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {connectCDP} from './cdp.mjs';
const c=await connectCDP(9334,t=>t.url.startsWith('http://127.0.0.1:5173'));
const frames='new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>requestAnimationFrame(r))))';
const shot=async name=>{await c.evaluate(frames);const s=await c.send('Page.captureScreenshot',{format:'png'});writeFileSync(`docs/art/validation/pixel-art-v02-${name}.png`,Buffer.from(s.data,'base64'));};
try{
 await c.send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
 const result={};
 result.initial=await c.evaluate(`(async()=>{const game=await import('/src/main.js');window.qa=game;
  game.setPixelArt(false);game.player.position.set(6,0,4);game.touch.setZoom(1);await ${frames};
  return {enabled:game.pixelArt.enabled,pressed:document.querySelector('#pixel-art').getAttribute('aria-pressed'),label:document.querySelector('#pixel-art').textContent,width:game.renderer.domElement.width,css:getComputedStyle(game.renderer.domElement).imageRendering};})()`);
 assert.equal(result.initial.enabled,false);assert.equal(result.initial.css,'auto');assert.equal(result.initial.pressed,'false');
 await shot('desktop-desligado');
 // Toggle through the real menu button.
 result.menu=await c.evaluate(`(async()=>{document.querySelector('#menu-button').click();document.querySelector('#pixel-art').click();await ${frames};
  const cam=qa.camera;return {enabled:qa.pixelArt.enabled,menuHidden:document.querySelector('#game-menu').hidden,pressed:document.querySelector('#pixel-art').getAttribute('aria-pressed'),label:document.querySelector('#pixel-art').textContent,
  stored:localStorage.getItem('mundo8bit:pixel-art'),layout:qa.pixelArt.layout,canvas:{width:qa.renderer.domElement.width,height:qa.renderer.domElement.height,ratio:qa.renderer.getPixelRatio()},css:getComputedStyle(qa.renderer.domElement).imageRendering,
  cameraRestored:Math.abs(cam.position.x-qa.player.position.x)<1e-6&&Math.abs(cam.top-5.8)>-1,error:document.querySelector('#error').textContent};})()`);
 assert.equal(result.menu.enabled,true);assert.equal(result.menu.menuHidden,true);assert.equal(result.menu.pressed,'true');assert.equal(result.menu.stored,'1');
 assert.equal(result.menu.css,'pixelated');assert.equal(result.menu.canvas.ratio,1);assert.equal(result.menu.layout.scale,5);assert.ok(Math.abs(result.menu.layout.halfHeight-7.5)<1e-9);assert.ok(result.menu.cameraRestored);assert.equal(result.menu.error,'');
 await shot('desktop-ligado');
 // Walking keeps the camera on the player (snap is render-only) and the world keeps streaming.
 await c.send('Input.dispatchKeyEvent',{type:'keyDown',key:'d',code:'KeyD',windowsVirtualKeyCode:68});
 await c.evaluate('new Promise(r=>setTimeout(r,500))');
 await c.send('Input.dispatchKeyEvent',{type:'keyUp',key:'d',code:'KeyD',windowsVirtualKeyCode:68});
 result.walk=await c.evaluate(`(async()=>{await ${frames};return {x:qa.player.position.x,camX:qa.camera.position.x};})()`);
 assert.ok(result.walk.x>6);assert.ok(Math.abs(result.walk.x-result.walk.camX)<1e-6);
 // Mobile landscape, persisted preference survives reload.
 await c.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});
 await c.send('Emulation.setDeviceMetricsOverride',{width:844,height:390,deviceScaleFactor:2,mobile:true});
 await c.send('Page.reload',{});await new Promise(r=>setTimeout(r,8000));
 result.mobile=await c.evaluate(`(async()=>{const game=await import('/src/main.js');window.qa=game;game.player.position.set(6,0,4);await ${frames};
  const trees=[];game.scene.traverse(n=>{if(n.name==='pixel-sprite')trees.push({filter:n.material.map.magFilter,mips:n.material.map.generateMipmaps,w:n.scale.x,h:n.scale.y});});
  return {trees:{count:trees.length,nearest:trees.every(t=>t.filter===1003&&!t.mips),size:[...new Set(trees.map(t=>t.w.toFixed(4)+'×'+t.h.toFixed(4)))]},enabled:game.pixelArt.enabled,layout:game.pixelArt.layout,canvas:{width:game.renderer.domElement.width,height:game.renderer.domElement.height},error:document.querySelector('#error').textContent};})()`);
 assert.equal(result.mobile.enabled,true);assert.ok(result.mobile.trees.count>0);assert.ok(result.mobile.trees.nearest);assert.deepEqual(result.mobile.trees.size,['2.6667×2.6667']);assert.equal(result.mobile.layout.scale,3);assert.equal(result.mobile.error,'');
 await shot('mobile-ligado');
 // Keyboard shortcut turns it off again and restores the normal renderer path.
 await c.send('Emulation.setTouchEmulationEnabled',{enabled:false,maxTouchPoints:1});
 await c.send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
 await c.send('Input.dispatchKeyEvent',{type:'keyDown',key:'p',code:'KeyP',windowsVirtualKeyCode:80});await c.send('Input.dispatchKeyEvent',{type:'keyUp',key:'p',code:'KeyP',windowsVirtualKeyCode:80});
 result.off=await c.evaluate(`(async()=>{await ${frames};return {enabled:qa.pixelArt.enabled,stored:localStorage.getItem('mundo8bit:pixel-art'),css:getComputedStyle(qa.renderer.domElement).imageRendering,width:qa.renderer.domElement.width};})()`);
 assert.equal(result.off.enabled,false);assert.equal(result.off.stored,'0');assert.equal(result.off.css,'auto');assert.equal(result.off.width,1440);
 writeFileSync('docs/art/validation/pixel-art-v02-result.json',JSON.stringify(result,null,2)+'\n');console.log(result);
}finally{c.close();}
