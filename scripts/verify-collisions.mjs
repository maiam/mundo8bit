import assert from 'node:assert/strict';
import {connectCDP} from './cdp.mjs';
const c=await connectCDP(9334,t=>t.url.startsWith('http://127.0.0.1:5173'));
try{
 const result=await c.evaluate(`(async()=>{
  const game=await import(document.querySelector('script[src*=\"/src/main.js\"]').src),physics=await import('/src/collisions.js'),fauna=await import('/src/fauna.js');
  const {collisionWorld:world,PLAYER_RADIUS:r,walkableGround}=physics;
  await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  const shapes=[...world.chunks.values()].flatMap(entries=>entries.map(e=>e.shape)),result={};
  const place=(x,z)=>{game.player.position.x=x;game.player.position.z=z;world.setDynamic('player',{type:'circle',x,z,radius:r,kind:'player'});};
  for(const kind of ['tree','rock']){
   let chosen;
   for(const shape of shapes.filter(s=>s.kind===kind)){
    const angle=shape.angle??0,c=Math.cos(angle),s=Math.sin(angle),half=shape.type==='box'?shape.hx:shape.radius;
    const x=shape.x-c*(half+r+.2),z=shape.z+s*(half+r+.2);
    if(world.isFree(x,z,r,{ignoreId:'player'})){chosen={shape,angle,c,s,half,x,z};break;}
   }
   if(!chosen)throw Error('Nenhum contato livre para testar '+kind);
   const {shape,c,s,half,x,z}=chosen;place(x,z);
   let invalid=0,blocked=0;
   for(let i=0;i<70;i++){const p=game.movePlayer(c*.08,-s*.08);if(p.blocked)blocked++;if(!world.isFree(p.x,p.z,r,{ignoreId:'player'}))invalid++;}
   const localX=c*(game.player.position.x-shape.x)-s*(game.player.position.z-shape.z);
   result[kind]={blocked,invalid,localX,boundary:-half-r};
  }
  let animalTest;
  for(const [id,shape] of world.dynamic){if(id==='player')continue;const x=shape.x-shape.radius-r-.2,z=shape.z;
   if(!world.isFree(x,z,r,{ignoreId:'player'}))continue;place(x,z);let invalid=0;
   for(let i=0;i<60;i++){const p=game.movePlayer(.08,0);if(!world.isFree(p.x,p.z,r,{ignoreId:'player'}))invalid++;}
   animalTest={invalid,stopped:game.player.position.x<=shape.x-shape.radius-r+.002};break;
  }
  result.animal=animalTest;
  // Exercise the same runtime update path used by requestAnimationFrame.
  place(0,0);for(let i=0;i<400;i++)fauna.updateFauna(.05,i*.05);
  result.invalidAnimals=[...fauna.activeAnimals.values()].filter(a=>!world.isFree(a.data.x,a.data.z,physics.animalRadius(a.data),{ignoreId:a.data.colliderId,minGround:-.65})).length;
  result.chunks=world.chunks.size;result.dynamic=world.dynamic.size;result.animals=fauna.activeAnimals.size;result.originFree=world.isFree(0,0,r,{ignoreId:'player'});return result;
 })()`);
 for(const kind of ['tree','rock']){assert.equal(result[kind].invalid,0);assert.ok(result[kind].blocked>0);assert.ok(result[kind].localX<=result[kind].boundary+.002);}
 assert.equal(result.animal.invalid,0);assert.ok(result.animal.stopped);assert.equal(result.invalidAnimals,0);assert.equal(result.chunks,25);assert.equal(result.dynamic,result.animals+1);assert.ok(result.originFree);
 console.log(JSON.stringify(result,null,2));
}finally{c.close();}
