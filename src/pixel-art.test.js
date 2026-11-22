import {test} from 'node:test';
import assert from 'node:assert/strict';
import {pixelArtLayout,snapToTexel,readPixelArtPreference,storePixelArtPreference,PIXEL_MARGIN,PIXEL_STORAGE_KEY} from './pixel-art.js';

test('pixel art usa escala inteira e cobre a tela com margem',()=>{
 for(const [w,h] of [[1440,900],[844,390],[568,320],[390,844],[2560,720],[1,1]]){
  const l=pixelArtLayout(w,h);
  assert.ok(Number.isInteger(l.scale)&&l.scale>=2,`${w}×${h}`);
  assert.ok((l.width-PIXEL_MARGIN*2)*l.scale>=w&&(l.height-PIXEL_MARGIN*2)*l.scale>=h);
  assert.ok(l.height<=PIXEL_MARGIN*2+Math.ceil(h/2));
 }
 assert.equal(pixelArtLayout(1440,900).scale,5);assert.equal(pixelArtLayout(844,390).scale,2);
});

test('câmera encaixa na grade de pixels e devolve a fração para compensar',()=>{
 for(const value of [0,.03,1.2345,-0.7,-12.0001,98.76]){
  const texel=.07,s=snapToTexel(value,texel);
  assert.ok(s.fraction>=0&&s.fraction<1);
  assert.ok(Math.abs(s.snapped+s.fraction*texel-value)<1e-9);
  assert.ok(Math.abs(s.snapped/texel-Math.round(s.snapped/texel))<1e-6);
 }
});

test('preferência: parâmetro de URL vence, armazenamento indisponível não quebra',()=>{
 const memory=new Map(),storage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v)};
 assert.equal(readPixelArtPreference('',storage),false);
 storePixelArtPreference(true,storage);assert.equal(memory.get(PIXEL_STORAGE_KEY),'1');assert.equal(readPixelArtPreference('',storage),true);
 assert.equal(readPixelArtPreference('?pixel=0',storage),false);assert.equal(readPixelArtPreference('?pixel=1',null),true);
 const broken={getItem(){throw Error('bloqueado');},setItem(){throw Error('bloqueado');}};
 assert.equal(readPixelArtPreference('',broken),false);assert.doesNotThrow(()=>storePixelArtPreference(true,broken));
});
