import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {boxUV,uvRegion,paintSkin,buildBoxModel,modelHeight,partsOf,PX} from './box-model.js';
import {ENTITY_DEFS,IARA,ALDEAO,ALDEA,MOBS,CAPIVARA} from './entity-defs.js';
import {animateEntity,walkAngle} from './animation.js';
import {GoalSelector,RandomStrollGoal,LookAtPlayerGoal} from './goals.js';
import {findPath,cellBlocked} from './pathfinding.js';
import {chunkSpawns,createEntityManager} from './entities.js';
import {CollisionWorld} from '../../collisions.js';
import {voxelGround,buildChunkData,columnAt} from '../voxel-terrain.js';

test('box UV do Minecraft: 6 faces sem esticar pixels',()=>{
 const r=boxUV([0,0],[4,4,4]);assert.deepEqual(r.py,[4,0,4,4]);assert.deepEqual(r.pz,[4,4,4,4]);assert.deepEqual(r.nz,[12,4,4,4]);assert.deepEqual(uvRegion([0,0],[4,6,2]),[0,0,12,8]);
 const body=boxUV([8,8],[4,6,2]);assert.deepEqual([body.pz[2],body.pz[3],body.px[2],body.px[3]],[4,6,2,6]);
});
test('todas as entidades a 8 px por bloco: UV dentro da skin, sem sobreposição e skin provisória completa',()=>{
 for(const def of ENTITY_DEFS){
  const regions=new Map();for(const p of def.parts)regions.set(`${p.uv}|${p.size}`,uvRegion(p.uv,p.size));
  const list=[...regions.values()];
  for(const [u,v,w,h] of list)assert.ok(u+w<=def.texture[0]&&v+h<=def.texture[1],`${def.id} fora da skin`);
  for(let i=0;i<list.length;i++)for(let j=i+1;j<list.length;j++){const a=list[i],b=list[j];assert.ok(!(a[0]<b[0]+b[2]&&b[0]<a[0]+a[2]&&a[1]<b[1]+b[3]&&b[1]<a[1]+a[3]),`${def.id}: UV sobrepostas`);}
  assert.equal(paintSkin(def).length,def.texture[0]*def.texture[1]*4);assert.equal(def.skin,null,'texturas atuais geradas por código');
  assert.ok(['player','npc','mob'].includes(def.kind)&&def.colliderRadius>0);
 }
 assert.equal(modelHeight(IARA),2);assert.equal(modelHeight(ALDEAO),2);assert.ok(MOBS.every(m=>modelHeight(m)<1));
 assert.deepEqual(IARA.texture,[32,32]); // 64×64 do Minecraft ÷ 2 (8 px por bloco).
});
test('pivôs nas articulações: braço gira no ombro sem se separar do corpo',()=>{
 const model=buildBoxModel(IARA),p=partsOf(model);
 const arm=p['braco-direito'];assert.ok(Math.abs(arm.position.y-11*PX)<1e-9&&Math.abs(arm.position.x+3*PX)<1e-9);
 const shoulder=()=>arm.getWorldPosition(new THREE.Vector3()),hand=()=>{const m=arm.children.find(c=>c.isMesh);m.geometry.computeBoundingBox();model.updateMatrixWorld(true);return m.geometry.boundingBox.min.clone().applyMatrix4(m.matrixWorld);};
 model.updateMatrixWorld(true);const s0=shoulder(),h0=hand();
 animateEntity(model,'humanoid',{limbSwing:2,amount:1});model.updateMatrixWorld(true);
 assert.ok(shoulder().distanceTo(s0)<1e-9);assert.ok(hand().distanceTo(h0)>.05);
 assert.ok(Math.abs(p['perna-direita'].rotation.x+p['perna-esquerda'].rotation.x)<1e-9);assert.ok(Math.abs(walkAngle(0,1)-1.4)<1e-9);
 const ext=model.getObjectByName('cabeca-externa-malha');assert.ok(ext&&ext.parent===p.cabeca);
 for(const def of MOBS){const m=buildBoxModel(def);assert.doesNotThrow(()=>animateEntity(m,def.rig,{limbSwing:1,amount:1,time:1}));}
});
test('A*: caminho em células secas, sem obstáculo e com degrau ≤ 1',()=>{
 let start=null,goal=null;
 for(let x=-10;x<10&&!goal;x++)for(let z=-10;z<10&&!goal;z++)if(!cellBlocked(x,z)){if(!start)start={x,z};else if(Math.abs(x-start.x)+Math.abs(z-start.z)>6)goal={x,z};}
 const path=findPath(start,goal);assert.ok(path&&path.length>1);assert.deepEqual(path[0],start);assert.deepEqual(path.at(-1),goal);
 for(let i=1;i<path.length;i++){const a=path[i-1],b=path[i];assert.equal(Math.abs(a.x-b.x)+Math.abs(a.z-b.z),1);assert.ok(!cellBlocked(b.x,b.z));assert.ok(Math.abs(columnAt(a.x,a.z).top-columnAt(b.x,b.z).top)<=1);}
 let water=null;for(let x=-40;x<40&&!water;x++)for(let z=-40;z<40&&!water;z++)if(columnAt(x,z).water)water={x,z};
 assert.equal(findPath(start,water),null);
});
test('IA por metas: prioridade, canais e retomada',()=>{
 const log=[];const g=(name,priority,channel,ok)=>({name,priority,channel,canUse:()=>ok(),canContinue:()=>ok(),start:()=>log.push(`+${name}`),tick:()=>{},stop:()=>log.push(`-${name}`)});
 let urgent=false;const sel=new GoalSelector([g('passeio',5,'move',()=>true),g('fugir',1,'move',()=>urgent),g('olhar',6,'look',()=>true)]);
 sel.tick({}, {},.1);assert.deepEqual(sel.activeNames().sort(),['olhar','passeio']);
 urgent=true;sel.tick({}, {},.1);assert.deepEqual(sel.activeNames().sort(),['fugir','olhar']);assert.ok(log.includes('-passeio'));
 const look=new LookAtPlayerGoal({range:6}),e={position:{x:0,y:0,z:0},yaw:0,eyeHeight:1,headYaw:0,headPitch:0};
 assert.equal(look.canUse(e,{player:{x:0,y:0,z:7}}),false);look.tick(e,{player:{x:3,y:0,z:0}});assert.ok(e.headYaw>1&&e.headYaw<=1.2);
 assert.equal(new RandomStrollGoal().priority,5);assert.equal(look.priority,6);
});
test('mobs: spawn determinístico por pedaço, em células livres, e passeio sem atravessar obstáculos',()=>{
 const spawns=[];for(let cx=-4;cx<=4;cx++)for(let cz=-4;cz<=4;cz++)spawns.push(...chunkSpawns(cx,cz));
 assert.deepEqual(spawns,(()=>{const s=[];for(let cx=-4;cx<=4;cx++)for(let cz=-4;cz<=4;cz++)s.push(...chunkSpawns(cx,cz));return s;})());
 assert.ok(spawns.length>10);assert.equal(new Set(spawns.map(s=>s.def.id)).size,3);assert.ok(spawns.every(s=>!cellBlocked(s.x,s.z)));
 const scene=new THREE.Scene(),collision=new CollisionWorld({height:voxelGround});
 for(let cx=-2;cx<=2;cx++)for(let cz=-2;cz<=2;cz++)collision.addChunk(cx,cz,buildChunkData(cx,cz).colliders);
 const manager=createEntityManager({scene,collision});for(let cx=-1;cx<=1;cx++)for(let cz=-1;cz<=1;cz++)manager.spawnChunk(cx,cz);
 const villagers=manager.spawnVillagers({x:.5,z:.5});assert.equal(villagers.length,2);assert.deepEqual(villagers.map(e=>e.def),[ALDEAO,ALDEA]);
 const count=manager.entities.size;assert.ok(count>1);
 for(let i=0;i<300;i++)manager.update(.05,i*.05,{x:100,y:0,z:100});
 for(const e of manager.entities.values()){assert.ok(collision.isFree(e.position.x,e.position.z,e.def.colliderRadius*.98,{ignoreId:e.id,minGround:-5}),`${e.def.id} preso em obstáculo`);assert.ok(Math.hypot(e.position.x-e.home.x,e.position.z-e.home.z)<16);}
 assert.ok([...manager.entities.values()].some(e=>Math.hypot(e.position.x-e.home.x-.5,e.position.z-e.home.z-.5)>.5),'algum mob passeou');
 manager.removeChunk(0,0);manager.dispose();assert.equal(manager.entities.size,0);assert.equal(scene.children.length,0);
});
test('skin: PNG do usuário substitui a provisória quando informado',async()=>{
 const {createSkinTexture}=await import('./box-model.js');
 const provisoria=createSkinTexture(IARA);assert.ok(provisoria.isDataTexture);assert.equal(provisoria.magFilter,THREE.NearestFilter);assert.equal(provisoria.flipY,false);
 const fake={width:32,height:32};const png=createSkinTexture(IARA,fake);assert.ok(!png.isDataTexture&&png.image===fake&&png.flipY===false&&png.generateMipmaps===false);
});
test('aldeões aprovados: par único, sem sobreposição, suspende fora dos chunks e retoma sem recriar',()=>{
 const scene=new THREE.Scene(),collision=new CollisionWorld({height:voxelGround});
 const data=buildChunkData(0,0);collision.addChunk(0,0,data.colliders);
 // Carrega também os quadrantes negativos onde o início pode localizar o par.
 for(let cx=-1;cx<=0;cx++)for(let cz=-1;cz<=0;cz++)collision.addChunk(cx,cz,buildChunkData(cx,cz).colliders);
 const manager=createEntityManager({scene,collision}),pair=manager.spawnVillagers({x:.5,z:.5});
 assert.equal(pair.length,2);assert.deepEqual(pair.map(e=>e.def.id),[ALDEAO.id,ALDEA.id]);
 assert.notDeepEqual([...paintSkin(ALDEAO)],[...paintSkin(ALDEA)]);
 for(const e of pair){assert.equal(e.speed,1.1);assert.ok(collision.isFree(e.position.x,e.position.z,.3,{ignoreId:e.id,minGround:-5}));}
 assert.equal(manager.spawnVillagers({x:100,z:100}),pair);assert.equal(manager.entities.size,2);
 const before=pair.map(e=>({id:e.id,position:e.position.clone(),wait:e.wait}));
 for(const key of [...collision.chunks.keys()]){const [x,z]=key.split(',').map(Number);collision.removeChunk(x,z);manager.removeChunk(x,z);}
 manager.update(.5,1,{x:0,y:0,z:0});
 for(let i=0;i<pair.length;i++){const e=pair[i];assert.equal(e.id,before[i].id);assert.ok(e.position.equals(before[i].position));assert.equal(e.wait,before[i].wait);assert.equal(e.model.visible,false);assert.equal(collision.dynamic.has(e.id),false);}
 for(let cx=-1;cx<=0;cx++)for(let cz=-1;cz<=0;cz++)collision.addChunk(cx,cz,buildChunkData(cx,cz).colliders);
 manager.update(.05,2,{x:0,y:0,z:0});for(const e of pair){assert.equal(e.model.visible,true);assert.ok(collision.dynamic.has(e.id));}
 assert.equal(manager.entities.size,2);manager.dispose();
 const empty=createEntityManager({scene:new THREE.Scene(),collision:new CollisionWorld({height:()=>-10})});assert.deepEqual(empty.spawnVillagers({x:0,z:0}),[]);assert.equal(empty.entities.size,0);empty.dispose();
});
