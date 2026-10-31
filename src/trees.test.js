import {test} from 'node:test';
import assert from 'node:assert/strict';
import {TREE_NAMES,TREE_IDS,treeTypeAt} from './trees.js';
import {hash,heightAt} from './world.js';
test('mundo inicial contém as onze espécies; distribuição é estável',()=>{
  assert.equal(TREE_NAMES.length,11);assert.equal(new Set(TREE_IDS).size,11);
  const found=new Set();
  for(let x=-24;x<36;x++)for(let z=-24;z<36;z++){
    const h=heightAt(x,z);if(hash(x,z)>.975&&h>-1.45&&Math.hypot(x,z)>3){const type=treeTypeAt(x,z,h);assert.equal(type,treeTypeAt(x,z,h));found.add(type);}
  }
  assert.equal(found.size,11);assert.ok([4,9].includes(treeTypeAt(2,3,-1)));
});
