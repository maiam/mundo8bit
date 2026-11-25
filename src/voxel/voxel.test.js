import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {voxelCameraLayout,voxelCameraPose,voxelScreenMovement,VOXEL_PIXELS_PER_UNIT,VOXEL_CHUNK_RADIUS,ISO_PITCH} from './voxel-settings.js';
import {buildVoxelAtlas,ATLAS_SIZE,TILE,tileUV} from './voxel-atlas.js';
import {columnAt,voxelGround,buildChunkData,treeAt,treeBlocks,voxelStart,treeHidesPoint,BLOCKED_GROUND,WATER_TOP} from './voxel-terrain.js';
import {IARA_VOXEL,packModel,modelHeight,buildVoxelModel} from './voxel-models.js';
import {readWorldMode,worldModeSearch} from '../world-mode.js';
import {CollisionWorld,PLAYER_RADIUS} from '../collisions.js';

function cameraAt(w,h,mobile,zoom=1,x=0,z=0,ground=0){
 const l=voxelCameraLayout(w,h,mobile),p=voxelCameraPose(x,ground,z),c=new THREE.OrthographicCamera(-l.halfHeight*l.aspect,l.halfHeight*l.aspect,l.halfHeight,-l.halfHeight,.1,240);
 c.position.set(p.position.x,p.position.y,p.position.z);c.lookAt(p.target.x,p.target.y,p.target.z);c.zoom=zoom;c.updateProjectionMatrix();c.updateMatrixWorld();return c;
}
test('mundo: ?mundo=voxel3d seleciona o voxel; troca preserva outros parâmetros',()=>{
 assert.equal(readWorldMode(''),'classico');assert.equal(readWorldMode('?mundo=voxel3d'),'voxel3d');assert.equal(readWorldMode('?mundo=outro'),'classico');
 assert.equal(worldModeSearch('?pixel=0','voxel3d'),'?pixel=0&mundo=voxel3d');assert.equal(worldModeSearch('?mundo=voxel3d&pixel=0','classico'),'?pixel=0');assert.equal(worldModeSearch('?mundo=voxel3d','classico'),'');
});
test('isometria 2:1: topo do bloco vira losango 16×8 px e controles seguem a tela',()=>{
 assert.ok(Math.abs(Math.sin(ISO_PITCH)-.5)<1e-12);
 const c=cameraAt(1440,900,false),toPx=v=>{const p=v.clone().project(c);return [p.x*c.right*VOXEL_PIXELS_PER_UNIT,p.y*c.top*VOXEL_PIXELS_PER_UNIT];};
 const corners=[[0,0,0],[1,0,0],[0,0,1],[1,0,1]].map(v=>toPx(new THREE.Vector3(...v)));
 const xs=corners.map(p=>p[0]),ys=corners.map(p=>p[1]);
 assert.ok(Math.abs(Math.max(...xs)-Math.min(...xs)-16)<1e-6);assert.ok(Math.abs(Math.max(...ys)-Math.min(...ys)-8)<1e-6);
 const origin=new THREE.Vector3().project(c);
 for(const [x,down] of [[1,0],[-1,0],[0,1],[0,-1]]){
  const d=voxelScreenMovement(x,down),p=new THREE.Vector3(d.x,0,d.z).project(c).sub(origin);
  assert.ok(Math.abs(Math.hypot(d.x,d.z)-1)<1e-9);
  if(x){assert.equal(Math.sign(p.x),x);assert.ok(Math.abs(p.y)<1e-9);}else{assert.equal(Math.sign(p.y),-down);assert.ok(Math.abs(p.x)<1e-9);}
 }
});
test('enquadramento não mostra além dos 9×9 pedaços carregados',()=>{
 const reach=VOXEL_CHUNK_RADIUS*12;
 for(const [w,h,mobile] of [[1440,900,false],[844,390,true],[568,320,true],[2560,720,false],[1024,1366,true]]){
  const l=voxelCameraLayout(w,h,mobile);assert.ok(l.minZoom<=1);
  for(const zoom of [l.minZoom,1,l.maxZoom]){const c=cameraAt(w,h,mobile,zoom);
   // Foco a 1 u do chão; terreno visível até 7 u abaixo ou acima do foco (−3…+3 no mundo).
   for(const y of [1-7,1+7])for(const sx of [-1,1])for(const sy of [-1,1]){
    const ray=new THREE.Raycaster();ray.setFromCamera(new THREE.Vector2(sx,sy),c);
    const hit=ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,1,0),-y),new THREE.Vector3());
    assert.ok(hit&&Math.abs(hit.x)<=reach-2+1e-6&&Math.abs(hit.z)<=reach-2+1e-6,`${w}×${h} zoom ${zoom}: ${hit?.toArray()}`);
   }
  }
 }
});
test('atlas 8×8: 16 texturas opacas e determinísticas',()=>{
 const a=buildVoxelAtlas(),b=buildVoxelAtlas();assert.equal(ATLAS_SIZE,32);assert.equal(a.length,32*32*4);assert.deepEqual(a,b);
 for(let i=3;i<a.length;i+=4)assert.equal(a[i],255);
 const uv=tileUV(TILE.white);assert.deepEqual([uv.u0,uv.v0,uv.u1,uv.v1],[.75,.75,1,1]);
});
test('terreno voxel: colunas, água, chão para física e pedaços contínuos',()=>{
 assert.equal(columnAt(0,0).top,1);assert.equal(voxelGround(.5,.5),1);
 let water=0,sand=0;
 for(let x=-40;x<40;x++)for(let z=-40;z<40;z++){const c=columnAt(x,z);assert.ok(Number.isInteger(c.top)&&c.top>=-3&&c.top<=3);
  if(c.water){water++;assert.equal(voxelGround(x+.5,z+.5),BLOCKED_GROUND);assert.ok(c.top<=WATER_TOP);}if(c.surface===TILE.sand)sand++;}
 assert.ok(water>50&&sand>water);
 const a=buildChunkData(0,0),b=buildChunkData(0,0);assert.deepEqual(a.solid.position,b.solid.position);
 assert.equal(a.solid.position.length/3,a.solid.uv.length/2);assert.equal(a.solid.index.length%6,0);assert.equal(a.solid.color.length,a.solid.position.length);
 // Cada coluna tem exatamente um topo; laterais só onde o vizinho é mais baixo (sem faces duplicadas na borda).
 let sides=0;for(let x=0;x<12;x++)for(let z=0;z<12;z++){const c=columnAt(x,z);for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]])sides+=Math.max(0,c.top-columnAt(x+dx,z+dz).top);}
 assert.ok(a.solid.index.length/6>=144+sides);
});
test('início voxel: ponto seco, livre e sem copa na frente da câmera',()=>{
 const s=voxelStart(),x=Math.floor(s.x),z=Math.floor(s.z);assert.ok(!columnAt(x,z).water&&!treeAt(x,z));
 for(let dx=-2;dx<=14;dx++)for(let dz=-2;dz<=14;dz++){const t=treeAt(x+dx,z+dz);if(t)assert.equal(treeHidesPoint(t,s.x,s.z,columnAt(x,z).top),false);}
 // Sanidade: uma árvore logo à frente (lado da câmera) encobre; uma atrás não.
 const t={type:0,x:0,z:0,base:0};assert.ok(treeHidesPoint(t,-1.5,-1.5,0));assert.equal(treeHidesPoint(t,3.5,3.5,0),false);
 assert.ok(Math.hypot(s.x,s.z)<20);
});
test('árvores voxel: mesmas posições e espécies, tronco colide e copa não',()=>{
 const trees=[];for(let x=-36;x<36;x++)for(let z=-36;z<36;z++){const t=treeAt(x,z);if(t)trees.push(t);}
 assert.equal(new Set(trees.map(t=>t.type)).size,4);
 for(const t of trees.slice(0,20)){const blocks=treeBlocks(t),logs=blocks.filter(b=>b.kind==='log');
  assert.ok(logs.length>=3&&blocks.length>logs.length);assert.equal(new Set(blocks.map(b=>`${b.x},${b.y},${b.z}`)).size,blocks.length);
  assert.ok(logs.every(b=>b.x===t.x&&b.z===t.z));}
 const chunk=[[0,0],[1,0],[-1,-1],[2,1]].map(([cx,cz])=>buildChunkData(cx,cz));
 const colliders=chunk.flatMap(c=>c.colliders);assert.ok(colliders.some(c=>c.kind==='tree')&&colliders.some(c=>c.kind==='rock'));
 assert.ok(colliders.every(c=>c.type==='box'&&c.hx===.5&&c.hz===.5));
});
test('física voxel: sobe um bloco, não atravessa tronco nem entra na água',()=>{
 const world=new CollisionWorld({height:voxelGround}),opts={maxStepHeight:1.01,minGround:-5};
 for(let cx=-2;cx<=2;cx++)for(let cz=-2;cz<=2;cz++)world.addChunk(cx,cz,buildChunkData(cx,cz).colliders);
 const tree=[...world.chunks.values()].flat().map(e=>e.shape).find(s=>s.kind==='tree'&&world.isFree(s.x-1,s.z,PLAYER_RADIUS,opts));
 const p=world.move({x:tree.x-1,z:tree.z},1.5,0,PLAYER_RADIUS,opts);
 assert.ok(p.blocked&&p.x<=tree.x-.5-PLAYER_RADIUS+.002);
 let shore=null;for(let x=-24;x<24&&!shore;x++)for(let z=-24;z<24&&!shore;z++)if(!columnAt(x,z).water&&columnAt(x+1,z).water&&world.isFree(x+.5,z+.5,PLAYER_RADIUS,opts))shore={x,z};
 const s=world.move({x:shore.x+.5,z:shore.z+.5},2,0,PLAYER_RADIUS,opts);assert.ok(s.x<=shore.x+1-PLAYER_RADIUS+.002);
});
test('Iara voxel: cubos e paralelepípedos com cerca de 2 blocos e partes animáveis',()=>{
 assert.equal(modelHeight(IARA_VOXEL),2);
 const packed=packModel(IARA_VOXEL);assert.equal(Object.keys(packed.rects).length,IARA_VOXEL.parts.length*6);
 const model=buildVoxelModel(IARA_VOXEL,{silhouette:true});
 for(const name of ['cabeca','tronco','braco-esquerdo','braco-direito','perna-esquerda','perna-direita'])assert.ok(model.getObjectByName(name),name);
 const box=new THREE.Box3().setFromObject(model);assert.ok(Math.abs(box.max.y-2)<1e-9&&Math.abs(box.min.y)<1e-9);
 let ghosts=0;model.traverse(n=>{if(n.name==='silhueta'){ghosts++;assert.equal(n.material.depthFunc,THREE.GreaterDepth);}});assert.equal(ghosts,6);
});
