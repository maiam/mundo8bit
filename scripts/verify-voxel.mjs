// Browser QA do mundo voxel 3D (?mundo=voxel3d). Requer `npm run dev` (127.0.0.1:5173) e Chromium com --remote-debugging-port=9334.
import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {connectCDP} from './cdp.mjs';
const c=await connectCDP(9334,t=>t.url.startsWith('http://127.0.0.1:5173'));
const frames='new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>requestAnimationFrame(r))))';
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const shot=async name=>{await c.evaluate(frames);const s=await c.send('Page.captureScreenshot',{format:'png'});writeFileSync(`docs/art/validation/voxel-3d-v01-${name}.png`,Buffer.from(s.data,'base64'));};
const key=async(k,code,vk,ms)=>{await c.send('Input.dispatchKeyEvent',{type:'keyDown',key:k,code,windowsVirtualKeyCode:vk});await wait(ms);await c.send('Input.dispatchKeyEvent',{type:'keyUp',key:k,code,windowsVirtualKeyCode:vk});};
const load=async search=>{await c.send('Page.navigate',{url:`http://127.0.0.1:5173/${search}`});await wait(9000);};
try{
 await c.send('Emulation.setTouchEmulationEnabled',{enabled:false,maxTouchPoints:1});
 await c.send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
 await load('?mundo=voxel3d');
 const result={};
 result.initial=await c.evaluate(`(async()=>{const v=await import('/src/voxel/voxel-main.js');window.qa=v;v.setPixelArt(true);await ${frames};
  let triangles=0;for(const ch of v.chunks.values())triangles+=ch.solid.geometry.index.count/3;
  const counts=[...v.chunks.values()].reduce((a,ch)=>({trees:a.trees+ch.counts.trees,rocks:a.rocks+ch.counts.rocks,flowers:a.flowers+ch.counts.flowers}),{trees:0,rocks:0,flowers:0});
  return {mode:v.worldMode,loadingHidden:document.querySelector('#loading').hidden,error:document.querySelector('#error').textContent,badge:document.querySelector('header .badge').textContent,
   chunks:v.chunks.size,collisionChunks:v.collision.chunks.size,triangles,counts,layout:v.pixelArt.layout,atlasFilter:v.atlas.magFilter,player:v.player.position.toArray(),
   classicLoaded:performance.getEntriesByType('resource').some(e=>e.name.includes('/src/main.js')),canvases:document.querySelectorAll('body>canvas').length};})()`);
 const i=result.initial;
 assert.equal(i.mode,'voxel3d');assert.ok(i.loadingHidden);assert.equal(i.error,'');assert.equal(i.chunks,81);assert.equal(i.collisionChunks,81);assert.equal(i.canvases,1);
 assert.equal(i.classicLoaded,false,'mundo clássico não deve carregar');assert.equal(i.layout.scale,4);assert.equal(i.atlasFilter,1003);assert.ok(i.counts.trees>0&&i.counts.rocks>0&&i.counts.flowers>0);
 await shot('desktop');
 // Teclado: D anda para a direita da tela; W para cima. Projeta o deslocamento na tela.
 const project=`(p)=>{const v=new (qa.camera.position.constructor)(p.x,p.y,p.z).project(qa.camera);return [v.x,v.y];}`;
 result.move={};
 // Ponto de teste com caminho livre e plano por 2 u para a direita e para cima da tela.
 result.moveStart=await c.evaluate(`(async()=>{const {voxelScreenMovement}=await import('/src/voxel/voxel-settings.js'),{voxelGround}=await import('/src/voxel/voxel-terrain.js');
  const free=(x,z)=>qa.collision.isFree(x,z,.24,{ignoreId:'player',minGround:-5}),dirs=[voxelScreenMovement(1,0),voxelScreenMovement(0,-1)];
  for(let r=0;r<12;r++)for(let x=-r;x<=r;x++)for(let z=-r;z<=r;z++){const px=qa.START.x+x,pz=qa.START.z+z,g=voxelGround(px,pz);
   if(dirs.every(d=>[...Array(11).keys()].every(i=>free(px+d.x*i*.2,pz+d.z*i*.2)&&voxelGround(px+d.x*i*.2,pz+d.z*i*.2)===g))){
    qa.player.position.set(px,g,pz);qa.collision.setDynamic('player',{type:'circle',x:px,z:pz,radius:.24,kind:'player'});await ${frames};return {x:px,z:pz};}}
  return null;})()`);
 assert.ok(result.moveStart,'ponto livre para testar direção');
 for(const [name,k,code,vk] of [['direita','d','KeyD',68],['cima','w','KeyW',87]]){
  await c.evaluate(`(async()=>{const p=${JSON.stringify(result.moveStart)};qa.player.position.x=p.x;qa.player.position.z=p.z;qa.collision.setDynamic('player',{type:'circle',x:p.x,z:p.z,radius:.24,kind:'player'});await ${frames};})()`);
  const before=await c.evaluate(`(()=>{const p=qa.player.position;return {x:p.x,y:p.y,z:p.z};})()`);
  await key(k,code,vk,300);
  const after=await c.evaluate(`(async()=>{await ${frames};const p=qa.player.position;return {x:p.x,y:p.y,z:p.z};})()`);
  const screen=await c.evaluate(`(()=>{const f=${project};const a=f(${JSON.stringify(before)}),b=f(${JSON.stringify(after)});return [b[0]-a[0],b[1]-a[1]];})()`);
  result.move[name]={before,after,screen};
 }
 const r=result.move.direita.screen,u=result.move.cima.screen;
 assert.ok(r[0]>0&&Math.abs(r[1])<Math.abs(r[0])*.2,'D move para a direita da tela');assert.ok(u[1]>0&&Math.abs(u[0])<Math.abs(u[1])*.2,'W move para cima da tela');
 // Colisão com tronco, água e degraus no runtime.
 result.physics=await c.evaluate(`(async()=>{const terrain=await import('/src/voxel/voxel-terrain.js'),{PLAYER_RADIUS:r}=await import('/src/collisions.js');
  const shapes=[...qa.collision.chunks.values()].flat().map(e=>e.shape),opts={ignoreId:'player'};
  const place=(x,z)=>{qa.player.position.x=x;qa.player.position.z=z;qa.collision.setDynamic('player',{type:'circle',x,z,radius:r,kind:'player'});};
  const tree=shapes.find(s=>s.kind==='tree'&&shapes.every(o=>o===s||Math.hypot(o.x-s.x,o.z-s.z)>2.5)&&qa.collision.isFree(s.x-1,s.z,r,{...opts,minGround:-5}));
  place(tree.x-1,tree.z);let invalid=0;for(let i=0;i<30;i++){const p=qa.movePlayer(.08,0);if(!qa.collision.isFree(p.x,p.z,r,{...opts,minGround:-5}))invalid++;}
  const treeResult={invalid,x:qa.player.position.x,limit:tree.x-.5-r};
  let shore=null;for(let x=-30;x<30&&!shore;x++)for(let z=-30;z<30&&!shore;z++)if(!terrain.columnAt(x,z).water&&terrain.columnAt(x+1,z).water&&qa.collision.isFree(x+.5,z+.5,r,{...opts,minGround:-5}))shore={x,z};
  place(shore.x+.5,shore.z+.5);for(let i=0;i<30;i++)qa.movePlayer(.08,0);const waterResult={x:qa.player.position.x,limit:shore.x+1-r};
  let step=null;for(let x=-20;x<20&&!step;x++)for(let z=-20;z<20&&!step;z++){const a=terrain.columnAt(x,z),b=terrain.columnAt(x+1,z);if(!a.water&&!b.water&&b.top===a.top+1&&!terrain.treeAt(x+1,z)&&qa.collision.isFree(x+.5,z+.5,r,{...opts,minGround:-5})&&qa.collision.isFree(x+1.5,z+.5,r,{...opts,minGround:-5}))step={x,z,from:a.top,to:b.top};}
  place(step.x+.5,step.z+.5);qa.player.position.y=step.from;for(let i=0;i<14;i++)qa.movePlayer(.08,0);
  await new Promise(res=>setTimeout(res,400));
  return {tree:treeResult,water:waterResult,step:{...step,endX:qa.player.position.x,endY:qa.player.position.y}};})()`);
 const ph=result.physics;
 assert.equal(ph.tree.invalid,0);assert.ok(ph.tree.x<=ph.tree.limit+.002,'tronco bloqueia');assert.ok(ph.water.x<=ph.water.limit+.002,'água bloqueia');
 assert.ok(ph.step.endX>ph.step.x+1&&Math.abs(ph.step.endY-ph.step.to)<.05,'sobe um bloco');
 // Silhueta através das copas: posiciona a Iara atrás de uma árvore (do ponto de vista da câmera).
 await c.evaluate(`(async()=>{const shapes=[...qa.collision.chunks.values()].flat().map(e=>e.shape);const t=shapes.find(s=>s.kind==='tree');qa.player.position.set(t.x-1.2,qa.player.position.y,t.z-1.2);
  const {voxelGround}=await import('/src/voxel/voxel-terrain.js');qa.player.position.y=voxelGround(t.x-1.2,t.z-1.2);qa.collision.setDynamic('player',{type:'circle',x:t.x-1.2,z:t.z-1.2,radius:.24,kind:'player'});await ${frames};})()`);
 await shot('silhueta');
 // Celular horizontal.
 await c.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});
 await c.send('Emulation.setDeviceMetricsOverride',{width:844,height:390,deviceScaleFactor:2,mobile:true});
 await c.evaluate(`(async()=>{document.querySelector('#home').click();await new Promise(r=>setTimeout(r,500));await ${frames};})()`);
 result.mobile=await c.evaluate(`({layout:qa.pixelArt.layout,touch:document.body.classList.contains('touch-device'),error:document.querySelector('#error').textContent})`);
 assert.equal(result.mobile.layout.scale,2);assert.ok(result.mobile.touch);
 await shot('mobile');
 // Botão do menu volta ao mundo clássico.
 await c.send('Emulation.setTouchEmulationEnabled',{enabled:false,maxTouchPoints:1});
 await c.send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
 await c.evaluate(`document.querySelector('#world-switch').click()`);await wait(9000);
 result.back=await c.evaluate(`({search:location.search,voxel:document.body.classList.contains('voxel-world'),button:document.querySelector('#world-switch').textContent,stats:document.querySelector('#stats').textContent})`);
 assert.equal(result.back.search,'');assert.equal(result.back.voxel,false);assert.match(result.back.button,/voxel/i);
 writeFileSync('docs/art/validation/voxel-3d-v01-result.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,1));
}finally{c.close();}
