import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {appendTileUV} from './assets.js';
const read=path=>JSON.parse(readFileSync(path,'utf8'));
const manifest=read('public/assets/manifest.json');
test('fontes Blockbench e exports possuem UVs válidas e texturas incorporadas',()=>{
  assert.equal(manifest.assets.length,17);assert.equal(manifest.tool,'Blockbench');
  for(const asset of manifest.assets){
    const bb=read(asset.source),gltf=read('public'+asset.url);
    assert.equal(bb.meta.model_format,'free');assert.equal(bb.resolution.width,256);
    assert.ok(bb.textures[0].source.startsWith('data:image/png;base64,'));
    let faces=0;
    for(const element of bb.elements)for(const face of Object.values(element.faces)){
      faces++;assert.ok(face.texture!==false&&face.texture!==null);
      for(const vertex of face.vertices){assert.ok(element.vertices[vertex].every(Number.isFinite));assert.ok(face.uv[vertex].every(n=>Number.isFinite(n)&&n>=0&&n<=256));}
    }
    assert.equal(faces,asset.triangles);
    assert.ok(gltf.images[0].uri.startsWith('data:image/png;base64,'));
    for(const mesh of gltf.meshes)for(const primitive of mesh.primitives){
      assert.ok('TEXCOORD_0' in primitive.attributes);assert.ok(!('COLOR_0' in primitive.attributes));
      assert.ok(gltf.materials[primitive.material].pbrMetallicRoughness.baseColorTexture);
    }
  }
});
test('UVs do terreno ficam dentro da célula de atlas sem vazamento',()=>{
  for(const tile of [11,12,13,14])for(const x of [0,1])for(const z of [0,1]){
    const uv=[];appendTileUV(uv,tile,x,z);
    assert.ok(uv[0]>tile%4/4&&uv[0]<(tile%4+1)/4);
    assert.ok(uv[1]>Math.floor(tile/4)/4&&uv[1]<(Math.floor(tile/4)+1)/4);
  }
});
