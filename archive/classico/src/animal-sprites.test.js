import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import * as THREE from 'three';
import {createAnimalSprite,faceAnimalSprite} from './animal-sprites.js';
const manifest=JSON.parse(readFileSync('public/assets/fauna-manifest.json','utf8'));
const appearance=manifest.assets.find(a=>a.species===0).appearance;
test('onça usa exatamente o sprite aprovado, preservando os dez animais 3D',()=>{
 const png=readFileSync(appearance.source),deployed=readFileSync('public'+appearance.url);
 assert.equal(png.readUInt32BE(16),1536);assert.equal(png.readUInt32BE(20),1024);assert.equal(png[25],6);
 assert.deepEqual(png,deployed);assert.equal(createHash('sha256').update(png).digest('hex'),appearance.sha256);
 assert.equal(manifest.assets.filter(a=>a.appearance?.type==='sprite').length,1);
});
test('espelhamento conserva escala, evita rotação do billboard e compartilha recursos nos clones',()=>{
 const texture=new THREE.Texture(),model=createAnimalSprite(texture,appearance),copy=model.clone(true),sprite=copy.getObjectByName('animal-sprite');
 assert.ok(model.userData.billboard);assert.equal(sprite.material,model.getObjectByName('animal-sprite').material);
 assert.ok(sprite.material.depthTest);assert.equal(sprite.material.depthWrite,false);assert.ok(sprite.material.alphaTest>0);
 assert.ok(Math.abs(sprite.scale.x*.93-2.35)<1e-9);
 faceAnimalSprite(sprite,Math.PI/2,true);assert.ok(sprite.scale.x<0);
 faceAnimalSprite(sprite,0,true);assert.ok(sprite.scale.x<0);
 faceAnimalSprite(sprite,-Math.PI/2,false);assert.ok(sprite.scale.x<0);
 faceAnimalSprite(sprite,-Math.PI/2,true);assert.ok(sprite.scale.x>0);assert.equal(copy.rotation.y,0);
 sprite.material.dispose();texture.dispose();
});
