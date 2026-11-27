import {test} from 'node:test';
import assert from 'node:assert/strict';
import {CollisionWorld,PLAYER_RADIUS,MIN_WALK_HEIGHT,penetration,walkableGround} from './collisions.js';
import {heightAt} from './world.js';
const dry={minGround:-100};
test('corrida não atravessa tronco ou parede fina, mesmo em um deslocamento grande',()=>{
 for(const shape of [{type:'circle',x:0,z:0,radius:.3},{type:'box',x:0,z:0,hx:.01,hz:2,angle:0}]){
  const world=new CollisionWorld();world.addChunk(0,0,[shape]);
  const p=world.move({x:-2,z:0},5,0,PLAYER_RADIUS,dry);
  assert.ok(p.x<-.24);assert.ok(p.blocked);assert.equal(penetration(p.x,p.z,PLAYER_RADIUS,shape),null);
 }
});
test('contato diagonal desliza pela parede e respeita caixas giradas',()=>{
 const world=new CollisionWorld(),wall={type:'box',x:0,z:0,hx:.2,hz:2,angle:0};world.addChunk(0,0,[wall]);
 const p=world.move({x:-1,z:-.5},2,1,PLAYER_RADIUS,dry);assert.ok(p.x<=-.439);assert.ok(p.z>.4);assert.ok(world.isFree(p.x,p.z,PLAYER_RADIUS,dry));
 const rotated={...wall,angle:Math.PI/4};world.addChunk(0,0,[rotated]);const c=Math.SQRT1_2;
 const q=world.move({x:-2*c,z:2*c},4*c,-4*c,PLAYER_RADIUS,dry);assert.ok(c*q.x-c*q.z<=-.439);assert.equal(penetration(q.x,q.z,PLAYER_RADIUS,rotated),null);
});
test('índice espacial cruza bordas negativas e libera apenas os obstáculos do chunk removido',()=>{
 const world=new CollisionWorld();const a={type:'circle',x:-.1,z:-.1,radius:.5},b={type:'circle',x:1,z:0,radius:.3};
 world.addChunk(-1,-1,[a]);world.addChunk(0,0,[b]);assert.ok(world.query(.1,.1,.2).includes(a));
 world.removeChunk(-1,-1);assert.ok(!world.query(.1,.1,.2).includes(a));assert.ok(world.query(1,0,.2).includes(b));
 for(let i=0;i<20;i++){world.addChunk(-1,-1,[a]);world.removeChunk(-1,-1);}assert.equal(world.chunks.size,1);
 world.removeChunk(0,0);assert.equal(world.buckets.size,0);
});
test('margem da água considera o raio inteiro; movimento junto à praia continua possível',()=>{
 const world=new CollisionWorld();let start;
 for(let x=-40;x<40&&!start;x+=.25)for(let z=-40;z<40&&!start;z+=.25){const h=heightAt(x,z);if(h>MIN_WALK_HEIGHT+.12&&h<MIN_WALK_HEIGHT+.17&&walkableGround(x,z,PLAYER_RADIUS))start={x,z};}
 assert.ok(start);const d=.05,gx=(heightAt(start.x+d,start.z)-heightAt(start.x-d,start.z))/(2*d),gz=(heightAt(start.x,start.z+d)-heightAt(start.x,start.z-d))/(2*d),norm=Math.hypot(gx,gz);
 let p=start,shore;for(let i=0;i<120;i++){p=world.move(p,-gx/norm*.2,-gz/norm*.2,PLAYER_RADIUS);if(p.blocked&&!shore)shore=p;assert.ok(walkableGround(p.x,p.z,PLAYER_RADIUS));}
 assert.ok(shore);const tx=(heightAt(shore.x+d,shore.z)-heightAt(shore.x-d,shore.z))/(2*d),tz=(heightAt(shore.x,shore.z+d)-heightAt(shore.x,shore.z-d))/(2*d),tn=Math.hypot(tx,tz);const tangent=world.move(shore,-tz/tn*.5,tx/tn*.5,PLAYER_RADIUS);assert.ok(tangent.distance>.1);assert.ok(walkableGround(tangent.x,tangent.z,PLAYER_RADIUS));
 assert.equal(walkableGround(start.x,start.z,PLAYER_RADIUS,10),false);
});
test('player e animal se bloqueiam nas duas direções sem empurrar o player parado',()=>{
 const world=new CollisionWorld();world.setDynamic('player',{type:'circle',x:0,z:0,radius:PLAYER_RADIUS});
 const animal=world.move({x:2,z:0},-3,0,.5,{...dry,ignoreId:'animal'});assert.ok(animal.x>=.739);
 world.setDynamic('animal',{type:'circle',x:animal.x,z:animal.z,radius:.5});
 const player=world.move({x:0,z:0},2,0,PLAYER_RADIUS,{...dry,ignoreId:'player'});assert.ok(player.x<=animal.x-.739);assert.deepEqual(world.dynamic.get('player'),{type:'circle',x:0,z:0,radius:PLAYER_RADIUS});
 world.removeDynamic('animal');assert.ok(world.move({x:0,z:0},2,0,PLAYER_RADIUS,{...dry,ignoreId:'player'}).x>1.9);
});
test('cantos com múltiplos obstáculos não expulsam o personagem para dentro de outro objeto',()=>{
 const world=new CollisionWorld();world.addChunk(0,0,[{type:'circle',x:0,z:0,radius:.6},{type:'box',x:.7,z:.7,hx:.3,hz:1.1,angle:.4},{type:'circle',x:-.7,z:.5,radius:.3}]);
 let p={x:-2,z:-2};for(let i=0;i<300;i++){p=world.move(p,Math.sin(i*.7)*.4,Math.cos(i*.3)*.4,PLAYER_RADIUS,dry);assert.ok(world.isFree(p.x,p.z,PLAYER_RADIUS,dry));}
});
