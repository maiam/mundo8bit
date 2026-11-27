// QA do único mundo voxel. Requer Vite em 5173 e Chromium com CDP em 9334.
import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {connectCDP} from './cdp.mjs';
const c=await connectCDP(Number(process.env.CDP_PORT??9334),t=>t.url.startsWith('http://127.0.0.1:5173'));
const frames='new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>requestAnimationFrame(r))))';
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const shot=async name=>{await c.evaluate(frames);const s=await c.send('Page.captureScreenshot',{format:'png'});writeFileSync(`docs/art/validation/${process.env.QA_OUTPUT_PREFIX??'voxel-unico-v01'}-${name}.png`,Buffer.from(s.data,'base64'));};
const key=async(k,code,vk,ms)=>{await c.send('Input.dispatchKeyEvent',{type:'keyDown',key:k,code,windowsVirtualKeyCode:vk});await wait(ms);await c.send('Input.dispatchKeyEvent',{type:'keyUp',key:k,code,windowsVirtualKeyCode:vk});};
const load=async search=>{await c.send('Page.navigate',{url:`http://127.0.0.1:5173/${search}`});await wait(9000);};
try{
 await c.send('Emulation.setTouchEmulationEnabled',{enabled:false,maxTouchPoints:1});
 await c.send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
 await load('');
 const result={};
 result.initial=await c.evaluate(`(async()=>{const v=await import(document.querySelector('script[src*="voxel-main.js"]').src);window.qa=v;v.setPixelArt(true);await ${frames};
  let triangles=0;for(const ch of v.chunks.values())triangles+=ch.solid.geometry.index.count/3;
  const counts=[...v.chunks.values()].reduce((a,ch)=>({trees:a.trees+ch.counts.trees,rocks:a.rocks+ch.counts.rocks,flowers:a.flowers+ch.counts.flowers}),{trees:0,rocks:0,flowers:0});
  return {mode:v.worldMode,loadingHidden:document.querySelector('#loading').hidden,error:document.querySelector('#error').textContent,badge:document.querySelector('header .badge').textContent,
   chunks:v.chunks.size,collisionChunks:v.collision.chunks.size,triangles,counts,layout:v.pixelArt.layout,atlasFilter:v.atlas.magFilter,player:v.player.position.toArray(),
   classicLoaded:performance.getEntriesByType('resource').some(e=>e.name.includes('/src/main.js')),canvases:document.querySelectorAll('body>canvas').length};})()`);
 const i=result.initial;
 assert.equal(i.mode,'voxel3d');assert.equal(i.badge,'MUNDO VOXEL 3D');assert.ok(i.loadingHidden);assert.equal(i.error,'');assert.equal(i.chunks,81);assert.equal(i.collisionChunks,81);assert.equal(i.canvases,1);
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
 // HUD: hotbar de 9 espaços (mão no 1), sem botão CORRER; teclas 1–9 trocam o espaço.
 result.hud=await c.evaluate(`(async()=>{const slots=[...document.querySelectorAll('#hotbar .hotbar-slot')];
  const before=slots.findIndex(s=>s.getAttribute('aria-pressed')==='true');window.dispatchEvent(new KeyboardEvent('keydown',{key:'3'}));const after=qa.hotbar.selected;qa.hotbar.select(0);
  return {slots:slots.length,before,after,first:slots[0].getAttribute('aria-label'),run:Boolean(document.querySelector('#run')),actionStick:Boolean(document.querySelector('#action-stick'))};})()`);
 assert.equal(result.hud.slots,9);assert.equal(result.hud.before,0);assert.equal(result.hud.after,2);assert.match(result.hud.first,/Mão/);assert.equal(result.hud.run,false);assert.ok(result.hud.actionStick);
 // Corrida: segurar W por 3 s ativa; soltar desliga.
 await c.send('Input.dispatchKeyEvent',{type:'keyDown',key:'w',code:'KeyW',windowsVirtualKeyCode:87});
 await wait(1500);const early=await c.evaluate('qa.runRule.running');await wait(1900);const late=await c.evaluate('qa.runRule.running');
 await c.send('Input.dispatchKeyEvent',{type:'keyUp',key:'w',code:'KeyW',windowsVirtualKeyCode:87});await wait(200);
 result.run={early,late,after:await c.evaluate('qa.runRule.running')};assert.deepEqual(result.run,{early:false,late:true,after:false});
 // Ação: parada, mirar à direita da tela gira no lugar; F age no cubo da frente; nenhuma seleção visual é criada.
 result.action=await c.evaluate(`(async()=>{await ${frames};const objects=()=>{let n=0;qa.scene.traverse(()=>n++);return n;};const p0=qa.player.position.clone();
  qa.aimFacing(1,0);const yaw=qa.facing.yaw;const target=qa.currentTarget();const n0=objects();window.dispatchEvent(new KeyboardEvent('keydown',{key:'f'}));await ${frames};
  const last=qa.actionState.last,n1=objects();window.dispatchEvent(new KeyboardEvent('keydown',{key:'e'}));const yawE=qa.facing.yaw;
  return {yaw,yawE,target,last,count:qa.actionState.count,moved:qa.player.position.distanceTo(p0),objectsBefore:n0,objectsAfter:n1};})()`);
 const a=result.action;assert.ok(Math.abs(a.yaw-3*Math.PI/4)<1e-9,'mira para a direita da tela');assert.ok(Math.abs(a.yawE-(a.yaw-Math.PI/4))<1e-9,'E gira 45°');
 assert.deepEqual(a.last.target,a.target);assert.equal(a.last.item,'mao');assert.ok(a.count>=1);assert.ok(a.moved<1e-6,'girar não sai do lugar');assert.equal(a.objectsAfter,a.objectsBefore,'sem seleção visual');
 // Entidades: NPC e mobs em box model, passeando com IA.
 const ent0=await c.evaluate(`(()=>[...qa.entities.entities.values()].map(e=>({id:e.id,def:e.def.id,x:e.position.x,z:e.position.z})))()`);
 await wait(5000);
 result.entities=await c.evaluate(`(()=>{const now=[...qa.entities.entities.values()].map(e=>({id:e.id,def:e.def.id,x:e.position.x,z:e.position.z,goals:e.selector.activeNames()}));
  const before=${JSON.stringify(ent0)};const moved=now.filter(n=>{const b=before.find(x=>x.id===n.id);return b&&Math.hypot(n.x-b.x,n.z-b.z)>.3;}).length;
  return {count:now.length,kinds:[...new Set(now.map(n=>n.def))],moved,npc:qa.villagers.length===2};})()`);
 assert.ok(result.entities.count>5&&result.entities.npc&&result.entities.moved>0);assert.ok(result.entities.kinds.includes('npc-aldeao-homem-v01'));assert.ok(result.entities.kinds.includes('npc-aldeao-mulher-v01'));
 await c.evaluate(`(async()=>{const n=qa.villagers[0];qa.player.position.set(n.position.x+1.6,n.position.y,n.position.z+1.2);qa.collision.setDynamic('player',{type:'circle',x:n.position.x+1.6,z:n.position.z+1.2,radius:.24,kind:'player'});await new Promise(r=>setTimeout(r,800));})()`);
 await shot('npc');
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
 const stick=await c.evaluate(`(()=>{const r=document.querySelector('#action-stick').getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2,visible:r.width>0};})()`);
 assert.ok(stick.visible);const count0=await c.evaluate('qa.actionState.count');
 await c.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:stick.x,y:stick.y}]});
 for(let i=1;i<=6;i++){await c.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:stick.x-i*8,y:stick.y}]});await wait(30);}
 await c.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await wait(100);
 const aimed=await c.evaluate('qa.facing.yaw');
 await c.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:stick.x,y:stick.y}]});await wait(60);await c.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await wait(100);
 result.mobile.stick={aimed,actions:await c.evaluate('qa.actionState.count')-count0};
 assert.ok(Math.abs(aimed-(-Math.PI/4))<1e-9,'girar para a esquerda da tela');assert.equal(result.mobile.stick.actions,1,'toque curto age');
 await shot('mobile');
 // URLs antigas também devem abrir somente o voxel.
 await c.send('Page.navigate',{url:'http://127.0.0.1:5173/?mundo=classico'});await wait(1500);
 result.onlyVoxel=await c.evaluate(`({voxel:document.body.classList.contains('voxel-world'),switchPresent:Boolean(document.querySelector('#world-switch'))})`);
 assert.equal(result.onlyVoxel.voxel,true);assert.equal(result.onlyVoxel.switchPresent,false);
 writeFileSync(`docs/art/validation/${process.env.QA_OUTPUT_PREFIX??'voxel-unico-v01'}-result.json`,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,1));
}finally{c.close();}
