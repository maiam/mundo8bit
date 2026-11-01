// Browser QA against the Vite dev server using the already-installed Chromium.
import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {connectCDP} from './cdp.mjs';
const c=await connectCDP(9334,t=>t.url.startsWith('http://127.0.0.1:5173'));
try{
 await c.send('Emulation.setTouchEmulationEnabled',{enabled:false,maxTouchPoints:1});
 await c.send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
 const initial=await c.evaluate(`(async()=>{
   window.qa=await import(document.querySelector('script[src*=\"/src/main.js\"]').src);qa.player.position.set(0,0,0);
   await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
   const assets=qa.gameAssets;
   const assetErrors=[...assets.natureManifest.assets,...assets.faunaManifest.assets].filter(a=>{
    const model=assets.cloneAsset(a.id);if(a.appearance?.type==='sprite')return !model.getObjectByName('animal-sprite')?.material.map;let triangles=0;model.traverse(n=>{if(n.isMesh)triangles+=(n.geometry.index?.count??n.geometry.attributes.position.count)/3;});
    return triangles!==a.triangles||a.rig?.some(j=>!model.getObjectByName(j.name));
   }).map(a=>a.id);
   const fauna=await import('/src/fauna.js');const animals=fauna.activeAnimals.size;const physics=await import('/src/collisions.js');const collisionChunks=physics.collisionWorld.chunks.size;
   let meshes=0,textured=0,instances=0,flowers=0,rocks=0;qa.scene.traverse(n=>{if(n.isMesh){meshes++;if(n.isInstancedMesh){instances+=n.count;if(n.userData.assetId.startsWith('flor-'))flowers+=n.count;else rocks+=n.count;}if(n.material.map&&!n.geometry.attributes.color)textured++;}});
   return {canvases:document.querySelectorAll('body>canvas').length,collisionChunks,animals,assetErrors,meshes,textured,instances,flowers,rocks,stats:document.querySelector('#stats').textContent,error:document.querySelector('#error').textContent,geometries:qa.renderer.info.memory.geometries,textures:qa.renderer.info.memory.textures,render:{width:qa.renderer.domElement.width,height:qa.renderer.domElement.height,ratio:qa.renderer.getPixelRatio(),css:getComputedStyle(qa.renderer.domElement).imageRendering,antialias:qa.renderer.getContext().getContextAttributes().antialias}};
 })()`);
 assert.equal(initial.canvases,1);assert.equal(initial.render.width,1440);assert.equal(initial.render.height,900);assert.equal(initial.render.css,'auto');assert.ok(initial.render.antialias);
 assert.equal(initial.collisionChunks,25);assert.ok(initial.animals>0&&initial.animals<=25);assert.deepEqual(initial.assetErrors,[]);assert.ok(initial.flowers>0&&initial.rocks>0);
 assert.equal(initial.error,'');assert.equal(initial.meshes,initial.textured);assert.match(initial.stats,/25 ATIVOS/);
 const traversal=await c.evaluate(`(async()=>{
   const result=[],physics=await import('/src/collisions.js'),fauna=await import('/src/fauna.js');
   for(const [x,z] of [[120,-120],[-120,120],[0,0],[120,-120],[-120,120],[0,0]]){
     qa.player.position.x=x;qa.player.position.z=z;
     await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
     result.push({target:{x,z},position:{x:qa.player.position.x,z:qa.player.position.z},collisionChunks:physics.collisionWorld.chunks.size,dynamic:physics.collisionWorld.dynamic.size,animals:fauna.activeAnimals.size,stats:document.querySelector('#stats').textContent,geometries:qa.renderer.info.memory.geometries,textures:qa.renderer.info.memory.textures});
   }return result;
 })()`);
 for(const p of traversal){assert.match(p.stats,/25 ATIVOS/);assert.deepEqual(p.position,p.target);assert.ok(p.stats.includes('CHUNK '+Math.floor(p.target.x/12)+','+Math.floor(p.target.z/12)));assert.equal(p.collisionChunks,25);assert.equal(p.dynamic,p.animals+1);}
 assert.equal(traversal.at(-1).geometries,traversal[2].geometries);assert.equal(traversal.at(-1).textures,traversal[2].textures);
 const wildlife=await c.evaluate(`(async()=>{const fauna=await import('/src/fauna.js');const before=[...fauna.activeAnimals.values()].map(a=>[a.data.x,a.data.z]);for(let i=0;i<160;i++)fauna.updateFauna(.05,i*.05);const after=[...fauna.activeAnimals.values()];return {count:after.length,moved:after.filter((a,i)=>Math.hypot(a.data.x-before[i][0],a.data.z-before[i][1])>.02).length,animated:after.filter(a=>a.limbs.some(n=>Math.abs(n.rotation.x)+Math.abs(n.rotation.y)+Math.abs(n.rotation.z)>.001)).length};})()`);
 assert.ok(wildlife.moved>0);assert.ok(wildlife.animated>0);assert.ok(wildlife.count<=25);
 let shot=await c.send('Page.captureScreenshot',{format:'png'});writeFileSync('docs/art/validation/mundo-mobile-v02-desktop.png',Buffer.from(shot.data,'base64'));
 await c.send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:3,mobile:true});
 await c.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});
 await c.evaluate(`new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))`);
 const portrait=await c.evaluate(`(()=>{const before=[qa.player.position.x,qa.player.position.z];qa.movePlayer(1,0);return {paused:qa.touch.paused,gate:!document.querySelector('#rotate-screen').hidden,inert:document.querySelector('#game').inert,before,after:[qa.player.position.x,qa.player.position.z]};})()`);
 assert.ok(portrait.paused&&portrait.gate&&portrait.inert);assert.deepEqual(portrait.before,portrait.after);
 shot=await c.send('Page.captureScreenshot',{format:'png'});writeFileSync('docs/art/validation/mundo-mobile-v02-portrait.png',Buffer.from(shot.data,'base64'));
 await c.send('Emulation.setDeviceMetricsOverride',{width:844,height:390,deviceScaleFactor:3,mobile:true});
 await c.evaluate(`new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))`);
 assert.equal(await c.evaluate('qa.touch.paused'),false);
 const quality=await c.evaluate(`(async()=>{const {atlas,waterMaterial}=qa.gameAssets;return {width:qa.renderer.domElement.width,height:qa.renderer.domElement.height,ratio:qa.renderer.getPixelRatio(),mipmaps:atlas.generateMipmaps,waterMipmaps:waterMaterial.map.generateMipmaps,minFilter:atlas.minFilter,magFilter:atlas.magFilter};})()`);
 assert.equal(quality.width,1266);assert.equal(quality.height,585);assert.equal(quality.ratio,1.5);assert.ok(quality.mipmaps&&quality.waterMipmaps);assert.equal(quality.minFilter,1008);assert.equal(quality.magFilter,1006);
 const controls=await c.evaluate(`(()=>{const pad=document.querySelector('#joystick').getBoundingClientRect(),run=document.querySelector('#run').getBoundingClientRect();return {pad:{x:pad.x+pad.width/2,y:pad.y+pad.height/2},run:{x:run.x+run.width/2,y:run.y+run.height/2},visible:getComputedStyle(document.querySelector('#touch-controls')).display,start:[qa.player.position.x,qa.player.position.z]};})()`);
 assert.notEqual(controls.visible,'none');
 const touches=[{x:controls.pad.x,y:controls.pad.y,id:1},{x:controls.run.x,y:controls.run.y,id:2}];
 await c.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:touches});
 touches[0].x+=38;await c.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:touches});
 const moved=await c.evaluate(`new Promise(resolve=>setTimeout(()=>resolve({position:[qa.player.position.x,qa.player.position.z],running:document.querySelector('#run').getAttribute('aria-pressed')}),900))`);
 assert.ok(Math.hypot(moved.position[0]-controls.start[0],moved.position[1]-controls.start[1])>.1);assert.equal(moved.running,'true');
 shot=await c.send('Page.captureScreenshot',{format:'png'});writeFileSync('docs/art/validation/mundo-mobile-v02-mobile-moving.png',Buffer.from(shot.data,'base64'));
 assert.deepEqual(await c.evaluate(`({width:qa.renderer.domElement.width,height:qa.renderer.domElement.height})`),{width:quality.width,height:quality.height});
 await c.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 assert.equal(await c.evaluate(`document.querySelector('#run').getAttribute('aria-pressed')`),'false');
 const stopped=await c.evaluate(`new Promise(resolve=>{const before=[qa.player.position.x,qa.player.position.z];setTimeout(()=>resolve({before,after:[qa.player.position.x,qa.player.position.z]}),200)})`);
 assert.deepEqual(stopped.before,stopped.after);
 shot=await c.send('Page.captureScreenshot',{format:'png'});writeFileSync('docs/art/validation/mundo-mobile-v02-mobile.png',Buffer.from(shot.data,'base64'));
 console.log(JSON.stringify({initial,traversal,wildlife,portrait,mobile:{quality,visible:controls.visible,twoFingerRun:moved.running==='true',movement:true,released:true}},null,2));
}finally{c.close();}
