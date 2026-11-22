import {test} from 'node:test';
import assert from 'node:assert/strict';
import {pixelArtLayout,snapToTexel,readPixelArtPreference,storePixelArtPreference,PIXEL_MARGIN,PIXEL_STORAGE_KEY,PIXELS_PER_UNIT} from './pixel-art.js';

test('pixel art usa densidade fixa com escala inteira e respeita o terreno carregado',()=>{
 for(const [w,h,hh,max] of [[1440,900,7.2,8.2],[844,390,5.8,6.6],[568,320,4.4,5],[390,844,4,4.5],[2560,720,5.6,6.3],[1,1,1,2]]){
  for(const zoom of [.72,1,2.2]){
   const l=pixelArtLayout(w,h,{halfHeight:hh,zoom,maxHalfHeight:max});
   assert.ok(Number.isInteger(l.scale)&&l.scale>=1,`${w}×${h}`);
   assert.ok((l.width-PIXEL_MARGIN*2)*l.scale>=w&&(l.height-PIXEL_MARGIN*2)*l.scale>=h);
   assert.ok(l.halfHeight<=max+1e-9,`${w}×${h} zoom ${zoom}: ${l.halfHeight}`);
   assert.ok(Math.abs(l.halfHeight*2*l.scale*PIXELS_PER_UNIT-h)<1e-9);
  }
 }
 assert.equal(pixelArtLayout(1440,900,{halfHeight:7.2,maxHalfHeight:8.2}).scale,5);
 assert.equal(pixelArtLayout(844,390,{halfHeight:5.8,maxHalfHeight:6.6}).scale,3);
 assert.ok(pixelArtLayout(1440,900,{halfHeight:7.2,zoom:2.2}).scale>pixelArtLayout(1440,900,{halfHeight:7.2}).scale);
});

test('câmera encaixa na grade de pixels e devolve a fração para compensar',()=>{
 for(const value of [0,.03,1.2345,-0.7,-12.0001,98.76]){
  const texel=.07,s=snapToTexel(value,texel);
  assert.ok(s.fraction>=0&&s.fraction<1);
  assert.ok(Math.abs(s.snapped+s.fraction*texel-value)<1e-9);
  assert.ok(Math.abs(s.snapped/texel-Math.round(s.snapped/texel))<1e-6);
 }
});

test('preferência: ligado por padrão, URL vence, armazenamento indisponível não quebra',()=>{
 const memory=new Map(),storage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v)};
 assert.equal(readPixelArtPreference('',storage),true);
 storePixelArtPreference(false,storage);assert.equal(memory.get(PIXEL_STORAGE_KEY),'0');assert.equal(readPixelArtPreference('',storage),false);
 storePixelArtPreference(true,storage);assert.equal(memory.get(PIXEL_STORAGE_KEY),'1');assert.equal(readPixelArtPreference('',storage),true);
 assert.equal(readPixelArtPreference('?pixel=0',storage),false);assert.equal(readPixelArtPreference('?pixel=1',null),true);
 const broken={getItem(){throw Error('bloqueado');},setItem(){throw Error('bloqueado');}};
 assert.equal(readPixelArtPreference('',broken),true);assert.doesNotThrow(()=>storePixelArtPreference(true,broken));
});
