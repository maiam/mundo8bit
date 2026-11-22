import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {TREE_NAMES,TREE_IDS,TREE_COLLIDER_RADII,treeTypeAt,treeAssetId} from './trees.js';
import {hash,heightAt} from './world.js';
const manifest=JSON.parse(readFileSync('public/assets/trees-pixel-manifest.json','utf8'));
test('mundo inicial contém as quatro árvores pixel art; distribuição é estável',()=>{
  assert.equal(TREE_NAMES.length,4);assert.equal(new Set(TREE_IDS).size,4);
  const found=new Set();
  for(let x=-24;x<36;x++)for(let z=-24;z<36;z++){
    const h=heightAt(x,z);if(hash(x,z)>.975&&h>-1.45&&Math.hypot(x,z)>3){const type=treeTypeAt(x,z);assert.equal(type,treeTypeAt(x,z));found.add(type);}
  }
  assert.equal(found.size,4);
});
test('sprites 32×32: catálogo, arquivos, originais preservados e colisão coerente',()=>{
  assert.equal(manifest.pixelsPerUnit,12);assert.equal(manifest.filter,'nearest');
  assert.deepEqual(manifest.trees.map(t=>t.id),TREE_IDS);assert.deepEqual(manifest.trees.map(t=>t.colliderRadius),TREE_COLLIDER_RADII);
  for(const tree of manifest.trees){
    assert.deepEqual(tree.size,[32,32]);assert.equal(tree.url,`/assets/sprites/${treeAssetId(TREE_IDS.indexOf(tree.id))}.png`);
    const png=readFileSync(`public${tree.url}`);assert.equal(png.readUInt32BE(16),32);assert.equal(png.readUInt32BE(20),32);
    assert.ok(readFileSync(tree.sprite).equals(png),'cópia de runtime idêntica ao sprite de produção');
    assert.ok(existsSync(tree.source));assert.equal(createHash('sha256').update(readFileSync(tree.source)).digest('hex'),tree.sourceSha256);
    assert.ok(tree.opaquePixels>150&&tree.opaquePixels<32*32);
  }
});
