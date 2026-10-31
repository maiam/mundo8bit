import {test} from 'node:test';
import assert from 'node:assert/strict';
import {natureAt} from './nature.js';
import {heightAt} from './world.js';
import {ROCK_IDS,FLOWER_IDS} from './nature-catalog.js';
test('distribuição cobre as 11 pedras e 23 flores e respeita a água',()=>{
 const rocks=new Set(),flowers=new Set();
 for(let x=-60;x<60;x++)for(let z=-60;z<60;z++)for(const p of natureAt(x,z)){
  assert.deepEqual(natureAt(x,z),natureAt(x,z));assert.ok([p.x,p.y,p.z,p.scale,p.angle].every(Number.isFinite));
  (p.kind==='rock'?rocks:flowers).add(p.id);
  if(p.kind==='flower'){if(p.id==='flor-lotus-v01'){assert.ok(heightAt(p.x,p.z)<=-1.55);assert.equal(p.y,-1.53);}else assert.ok(heightAt(p.x,p.z)>=-.85);}
 }
 assert.equal(rocks.size,ROCK_IDS.length);assert.equal(flowers.size,FLOWER_IDS.length);
});
