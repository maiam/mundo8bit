// Gerencia NPCs e mobs do mundo voxel: spawn determinístico por pedaço (mesma semente), IA por metas,
// animação procedural e colisão pelo mesmo CollisionWorld da jogadora.
import {CHUNK_SIZE,hash} from '../../world.js';
import {voxelGround} from '../voxel-terrain.js';
import {buildBoxModel,createSkinTexture,modelHeight,partsOf} from './box-model.js';
import {animateEntity} from './animation.js';
import {GoalSelector,RandomStrollGoal,LookAtPlayerGoal} from './goals.js';
import {cellBlocked} from './pathfinding.js';
import {MOBS,GUIA} from './entity-defs.js';

const MOVE={maxStepHeight:1.01,minGround:-5};
function mulberry(seed){let a=seed>>>0;return()=>{a=(a+0x6d2b79f5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};}

// Mobs por pedaço: ~40% dos pedaços recebem 1–2 animais de uma espécie, em células livres.
export function chunkSpawns(cx,cz){
 if(hash(cx*31+7,cz*17-3)>=.4)return [];
 const def=MOBS[Math.floor(hash(cx-13,cz+29)*MOBS.length)],count=hash(cx+5,cz-11)<.35?2:1,spawns=[];
 for(let i=0;i<24&&spawns.length<count;i++){
  const x=cx*CHUNK_SIZE+Math.floor(hash(cx*3+i,cz*5-i)*CHUNK_SIZE),z=cz*CHUNK_SIZE+Math.floor(hash(cx*7-i,cz*2+i*3)*CHUNK_SIZE);
  if(!cellBlocked(x,z)&&!spawns.some(s=>s.x===x&&s.z===z))spawns.push({def,x,z,seed:Math.floor(hash(x,z)*1e9)});
 }
 return spawns;
}

export function createEntityManager({scene,collision}){
 const templates=new Map(),entities=new Map();let serial=0;
 function template(def){
  if(!templates.has(def.id))templates.set(def.id,buildBoxModel(def,{texture:createSkinTexture(def)}));
  return templates.get(def.id);
 }
 function spawn(def,x,z,{seed=1,chunk=null}={}){
  const model=template(def).clone(true),id=`${def.kind}-${serial++}`,e={
   id,def,model,parts:partsOf(model),chunk,position:model.position,yaw:0,headYaw:0,headPitch:0,home:{x,z},speed:def.speed??1,
   eyeHeight:modelHeight(def)*.85,random:mulberry(seed),wait:1+hash(x,z)*3,path:[],stuck:0,walk:0,limbSwing:0,amount:0,
   selector:new GoalSelector([new RandomStrollGoal(def.goals?.stroll),new LookAtPlayerGoal(def.goals?.look)]),
  };
  model.position.set(x+.5,voxelGround(x+.5,z+.5),z+.5);model.userData.entityId=id;scene.add(model);
  collision.setDynamic(id,{type:'circle',x:x+.5,z:z+.5,radius:def.colliderRadius,kind:def.kind});entities.set(id,e);return e;
 }
 function remove(e){scene.remove(e.model);collision.removeDynamic(e.id);entities.delete(e.id);}
 const ctx={player:{x:0,y:0,z:0},move(e,dx,dz){
  const p=collision.move(e.position,dx,dz,e.def.colliderRadius,{ignoreId:e.id,...MOVE});
  e.position.x=p.x;e.position.z=p.z;collision.setDynamic(e.id,{type:'circle',x:p.x,z:p.z,radius:e.def.colliderRadius,kind:e.def.kind});return p;
 }};
 return {
  entities,
  spawnChunk(cx,cz){for(const s of chunkSpawns(cx,cz))spawn(s.def,s.x,s.z,{seed:s.seed,chunk:`${cx},${cz}`});},
  removeChunk(cx,cz){const key=`${cx},${cz}`;for(const e of [...entities.values()])if(e.chunk===key)remove(e);},
  // NPC provisório perto do início: primeira célula livre num anel de 3–5 blocos.
  spawnNpc(start){
   for(let r=3;r<=6;r++)for(let dx=-r;dx<=r;dx++)for(const dz of [-r,r]){const x=Math.floor(start.x)+dx,z=Math.floor(start.z)+dz;
    if(!cellBlocked(x,z)&&collision.isFree(x+.5,z+.5,GUIA.colliderRadius,MOVE))return spawn(GUIA,x,z,{seed:7});}
   return null;
  },
  update(dt,time,player){
   ctx.player.x=player.x;ctx.player.y=player.y;ctx.player.z=player.z;
   for(const e of entities.values()){
    e.wait-=dt;e.walk=0;e.selector.tick(e,ctx,dt);
    const speed=e.walk/Math.max(dt,1e-3);e.amount+=(Math.min(1,speed/Math.max(e.speed,.1))-e.amount)*Math.min(1,dt*10);e.limbSwing+=e.walk*6;
    e.model.rotation.y+=Math.atan2(Math.sin(e.yaw-e.model.rotation.y),Math.cos(e.yaw-e.model.rotation.y))*Math.min(1,dt*8);
    e.position.y+=(voxelGround(e.position.x,e.position.z)-e.position.y)*Math.min(1,dt*18);
    animateEntity(e.model,e.def.rig,{limbSwing:e.limbSwing,amount:e.amount,time,headYaw:e.headYaw,headPitch:e.headPitch});
   }
  },
  dispose(){for(const e of [...entities.values()])remove(e);for(const t of templates.values())t.traverse(n=>{if(n.isMesh)n.geometry.dispose();});},
 };
}
