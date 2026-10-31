import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {faunaSpawn,stepAnimal} from './fauna-simulation.js';
import {heightAt,CHUNK_SIZE} from './world.js';
import {ANIMAL_IDS} from './fauna-catalog.js';
test('fauna cobre 11 espécies, reproduz a semente e anda em terra dentro do território',()=>{
 const found=new Set();let moved=0;
 for(let cx=-5;cx<=5;cx++)for(let cz=-5;cz<=5;cz++){
  const a=faunaSpawn(cx,cz);assert.deepEqual(a,faunaSpawn(cx,cz));if(!a)continue;found.add(a.id);
  const initial={x:a.x,z:a.z},copy=structuredClone(a);
  for(let i=0;i<600;i++){
   stepAnimal(a,.05);stepAnimal(copy,.05);
   assert.ok([a.x,a.y,a.z,a.angle].every(Number.isFinite));assert.ok(heightAt(a.x,a.z)>-.65);
   assert.ok(a.x>cx*CHUNK_SIZE&&a.x<(cx+1)*CHUNK_SIZE);assert.ok(a.z>cz*CHUNK_SIZE&&a.z<(cz+1)*CHUNK_SIZE);
  }
  assert.deepEqual(a,copy);if(Math.hypot(a.x-initial.x,a.z-initial.z)>.05)moved++;
 }
 assert.equal(found.size,ANIMAL_IDS.length);assert.ok(moved>10);
});
test('pivôs editáveis no Blockbench correspondem às partes exportadas no glTF',()=>{
 const manifest=JSON.parse(readFileSync('public/assets/fauna-manifest.json','utf8'));
 for(const asset of manifest.assets){
  const model=JSON.parse(readFileSync(asset.source,'utf8')),gltf=JSON.parse(readFileSync('public'+asset.url,'utf8'));
  assert.ok(asset.rig.length>=4);const names=new Set(gltf.nodes.map(n=>n.name));
  for(const joint of asset.rig){const element=model.elements.find(e=>e.name===joint.name);assert.ok(element);assert.ok(names.has(joint.name));element.origin.forEach((value,axis)=>assert.ok(Math.abs(value-joint.pivot[axis]*16)<.00001));}
  const legs=asset.rig.filter(j=>j.name.startsWith('perna-'));assert.equal(legs.length,asset.species<9?4:2);
 }
});
