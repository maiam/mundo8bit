import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {TREE_NAMES,treeGeometry,createTree,treeTypeAt} from './trees.js';
import {hash,heightAt} from './world.js';
test('onze modelos válidos, distintos, com recursos compartilhados',()=>{
  assert.equal(TREE_NAMES.length,11);
  const geometries=new Set();
  for(let type=0;type<11;type++){
    const geometry=treeGeometry(type);geometries.add(geometry);
    const a=createTree(type,10,-5),b=createTree(type,10,-5);
    assert.equal(a.geometry,b.geometry);assert.equal(a.material,b.material);
    assert.deepEqual(a.scale,b.scale);assert.equal(a.rotation.y,b.rotation.y);
    for(const key of ['position','normal','color'])assert.ok([...geometry.attributes[key].array].every(Number.isFinite));
    const box=new THREE.Box3().setFromObject(a);assert.ok(box.max.y>2);assert.ok(box.max.x>box.min.x);
  }
  assert.equal(geometries.size,11);
});
test('mundo inicial contém todas as espécies e distribuição é estável',()=>{
  const found=new Set();
  for(let x=-24;x<36;x++)for(let z=-24;z<36;z++){
    const h=heightAt(x,z);if(hash(x,z)>.975&&h>-1.45&&Math.hypot(x,z)>3){const type=treeTypeAt(x,z,h);assert.equal(type,treeTypeAt(x,z,h));found.add(type);}
  }
  assert.equal(found.size,11);
  assert.ok([4,9].includes(treeTypeAt(2,3,-1)));
});
