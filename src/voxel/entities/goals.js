// IA por metas (Goal Selector), como no Minecraft: lista ordenada por prioridade (menor = mais importante),
// avaliada a cada tick, com uma meta ativa por "canal" (movimento e olhar podem rodar juntos).
import {findPath,cellBlocked} from './pathfinding.js';

export class GoalSelector{
 constructor(goals){this.goals=[...goals].sort((a,b)=>a.priority-b.priority);this.active=new Map();}
 tick(entity,ctx,dt){
  for(const channel of new Set(this.goals.map(g=>g.channel))){
   const current=this.active.get(channel),candidates=this.goals.filter(g=>g.channel===channel);
   const best=candidates.find(g=>g===current?g.canContinue(entity,ctx):g.canUse(entity,ctx));
   if(best!==current){current?.stop(entity,ctx);if(best)best.start(entity,ctx);this.active.set(channel,best);}
   best?.tick(entity,ctx,dt);
  }
 }
 activeNames(){return [...this.active.values()].filter(Boolean).map(g=>g.name);}
}

// Prioridade 5: escolhe um bloco caminhável num raio ao redor de casa e vai até ele por A*.
export class RandomStrollGoal{
 constructor({radius=10,pause=[3,8]}={}){this.name='RandomStroll';this.priority=5;this.channel='move';this.radius=radius;this.pause=pause;}
 canUse(e,ctx){
  if(e.wait>0)return false;
  for(let i=0;i<6;i++){
   const x=Math.round(e.home.x+(e.random()*2-1)*this.radius),z=Math.round(e.home.z+(e.random()*2-1)*this.radius);
   if(cellBlocked(x,z))continue;
   const path=findPath({x:Math.floor(e.position.x),z:Math.floor(e.position.z)},{x,z});
   if(path&&path.length>1){e.path=path.slice(1);return true;}
  }
  e.wait=1;return false;
 }
 canContinue(e){return e.path.length>0&&e.stuck<1.5;}
 start(e){e.stuck=0;}
 tick(e,ctx,dt){
  const target=e.path[0],tx=target.x+.5,tz=target.z+.5,dx=tx-e.position.x,dz=tz-e.position.z,d=Math.hypot(dx,dz);
  if(d<.15){e.path.shift();return;}
  const step=Math.min(d,e.speed*dt),moved=ctx.move(e,dx/d*step,dz/d*step);
  e.walk=moved.distance;e.yaw=Math.atan2(dx,dz);e.stuck=moved.distance<step*.3?e.stuck+dt:0;
 }
 stop(e){e.path=[];e.walk=0;e.wait=this.pause[0]+e.random()*(this.pause[1]-this.pause[0]);}
}

// Prioridade 6: gira só a cabeça para encarar a jogadora quando ela está perto.
export class LookAtPlayerGoal{
 constructor({range=6}={}){this.name='LookAtPlayer';this.priority=6;this.channel='look';this.range=range;}
 canUse(e,ctx){return Math.hypot(ctx.player.x-e.position.x,ctx.player.z-e.position.z)<this.range;}
 canContinue(e,ctx){return this.canUse(e,ctx);}
 start(){}
 tick(e,ctx){
  const dx=ctx.player.x-e.position.x,dz=ctx.player.z-e.position.z;
  let yaw=Math.atan2(dx,dz)-e.yaw;yaw=Math.atan2(Math.sin(yaw),Math.cos(yaw));
  e.headYaw=Math.max(-1.2,Math.min(1.2,yaw));e.headPitch=-Math.atan2(ctx.player.y+1.6-(e.position.y+e.eyeHeight),Math.hypot(dx,dz))*.6;
 }
 stop(e){e.headYaw=0;e.headPitch=0;}
}
