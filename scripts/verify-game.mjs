// Browser QA against the Vite dev server using the already-installed Chromium.
import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {connectCDP} from './cdp.mjs';
const c=await connectCDP(9334,t=>t.url.startsWith('http://127.0.0.1:5173'));
try{
 await c.send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
 const initial=await c.evaluate(`(async()=>{
   window.qa=await import('/src/main.js');
   await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
   let meshes=0,textured=0;qa.scene.traverse(n=>{if(n.isMesh){meshes++;if(n.material.map&&!n.geometry.attributes.color)textured++;}});
   return {meshes,textured,stats:document.querySelector('#stats').textContent,error:document.querySelector('#error').textContent,geometries:qa.renderer.info.memory.geometries,textures:qa.renderer.info.memory.textures,render:{width:qa.renderer.domElement.width,height:qa.renderer.domElement.height,ratio:qa.renderer.getPixelRatio(),css:getComputedStyle(qa.renderer.domElement).imageRendering,antialias:qa.renderer.getContext().getContextAttributes().antialias}};
 })()`);
 assert.equal(initial.render.width,1440);assert.equal(initial.render.height,900);assert.equal(initial.render.css,'auto');assert.ok(initial.render.antialias);
 assert.equal(initial.error,'');assert.equal(initial.meshes,initial.textured);assert.match(initial.stats,/25 ATIVOS/);
 const traversal=await c.evaluate(`(async()=>{
   const result=[];
   for(const [x,z] of [[120,-120],[-120,120],[0,0],[120,-120],[-120,120],[0,0]]){
     qa.player.position.x=x;qa.player.position.z=z;
     await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
     result.push({stats:document.querySelector('#stats').textContent,geometries:qa.renderer.info.memory.geometries,textures:qa.renderer.info.memory.textures});
   }return result;
 })()`);
 for(const p of traversal)assert.match(p.stats,/25 ATIVOS/);
 assert.equal(traversal.at(-1).geometries,traversal[2].geometries);assert.equal(traversal.at(-1).textures,traversal[2].textures);
 let shot=await c.send('Page.captureScreenshot',{format:'png'});writeFileSync('docs/art/validation/mundo-painted-v03-desktop.png',Buffer.from(shot.data,'base64'));
 await c.send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:3,mobile:true});
 await c.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});
 await c.evaluate(`new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))`);
 const quality=await c.evaluate(`(async()=>{const {atlas,waterMaterial}=await import('/src/assets.js');return {width:qa.renderer.domElement.width,height:qa.renderer.domElement.height,ratio:qa.renderer.getPixelRatio(),mipmaps:atlas.generateMipmaps,waterMipmaps:waterMaterial.map.generateMipmaps,minFilter:atlas.minFilter,magFilter:atlas.magFilter};})()`);
 assert.equal(quality.width,585);assert.equal(quality.height,1266);assert.equal(quality.ratio,1.5);assert.ok(quality.mipmaps&&quality.waterMipmaps);assert.equal(quality.minFilter,1008);assert.equal(quality.magFilter,1006);
 const controls=await c.evaluate(`(()=>{const pad=document.querySelector('#joystick').getBoundingClientRect(),run=document.querySelector('#run').getBoundingClientRect();return {pad:{x:pad.x+pad.width/2,y:pad.y+pad.height/2},run:{x:run.x+run.width/2,y:run.y+run.height/2},visible:getComputedStyle(document.querySelector('#touch-controls')).display,start:[qa.player.position.x,qa.player.position.z]};})()`);
 assert.notEqual(controls.visible,'none');
 const touches=[{x:controls.pad.x,y:controls.pad.y,id:1},{x:controls.run.x,y:controls.run.y,id:2}];
 await c.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:touches});
 touches[0].x+=38;await c.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:touches});
 const moved=await c.evaluate(`new Promise(resolve=>setTimeout(()=>resolve({position:[qa.player.position.x,qa.player.position.z],running:document.querySelector('#run').getAttribute('aria-pressed')}),900))`);
 assert.ok(Math.hypot(moved.position[0]-controls.start[0],moved.position[1]-controls.start[1])>.1);assert.equal(moved.running,'true');
 shot=await c.send('Page.captureScreenshot',{format:'png'});writeFileSync('docs/art/validation/mundo-painted-v03-mobile-moving.png',Buffer.from(shot.data,'base64'));
 assert.deepEqual(await c.evaluate(`({width:qa.renderer.domElement.width,height:qa.renderer.domElement.height})`),{width:quality.width,height:quality.height});
 await c.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 assert.equal(await c.evaluate(`document.querySelector('#run').getAttribute('aria-pressed')`),'false');
 const stopped=await c.evaluate(`new Promise(resolve=>{const before=[qa.player.position.x,qa.player.position.z];setTimeout(()=>resolve({before,after:[qa.player.position.x,qa.player.position.z]}),200)})`);
 assert.deepEqual(stopped.before,stopped.after);
 shot=await c.send('Page.captureScreenshot',{format:'png'});writeFileSync('docs/art/validation/mundo-painted-v03-mobile.png',Buffer.from(shot.data,'base64'));
 console.log(JSON.stringify({initial,traversal,mobile:{quality,visible:controls.visible,twoFingerRun:moved.running==='true',movement:true,released:true}},null,2));
}finally{c.close();}
