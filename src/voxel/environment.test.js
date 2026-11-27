import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createEnvironment,createActiveClock,daylightAt} from './environment.js';
import {createEnvironmentView,rainRoofAt,MAX_RAIN_DROPS} from './environment-view.js';
import {treeAt,treeBlocks,columnAt} from './voxel-terrain.js';

test('RG-02: fases nas fronteiras e um dia exato após 1200 segundos ativos',()=>{
 assert.deepEqual([0,599.99,600,659.99,660,1139.99,1140,1199.99,1200].map(t=>daylightAt(t).phase),['dia','dia','entardecer','entardecer','noite','noite','amanhecer','amanhecer','dia']);
 assert.equal(daylightAt(1200).day,2);assert.equal(daylightAt(1200).time,0);
 const e=createEnvironment(808);assert.equal(e.snapshot().weather,'limpo');assert.equal(e.advance(1200).day,2);
});
test('RG-02: FPS não muda o clima; um avanço longo equivale a avanços curtos',()=>{
 const fast=createEnvironment(808),slow=createEnvironment(808),direct=createEnvironment(808);
 for(let i=0;i<72000;i++)fast.advance(1/60);
 for(let i=0;i<1200;i++)slow.advance(1);
 const a=fast.snapshot(),b=slow.snapshot(),c=direct.advance(1200);
 assert.ok(Math.abs(a.seconds-c.seconds)<1e-6);assert.equal(a.weather,b.weather);assert.equal(b.weather,c.weather);
 assert.ok(Math.abs(a.rain-c.rain)<1e-6);assert.equal(b.weatherDuration,c.weatherDuration);
 assert.throws(()=>direct.advance(-1),RangeError);
});
test('RG-02: relógio não recupera tempo de pausa/página oculta',()=>{
 const c=createActiveClock(0),e=createEnvironment(808);
 e.advance(c.sample(1000,false));e.advance(c.sample(2000,true));
 e.advance(c.sample(90000,true));e.advance(c.sample(100000,false));e.advance(c.sample(101000,false));
 assert.equal(e.snapshot().seconds,3);
});
test('RG-02: durações sorteadas uma vez e transições contínuas de nuvens/chuva',()=>{
 const e=createEnvironment(808),clear=e.snapshot().weatherDuration;assert.ok(clear>=240&&clear<480);
 let s=e.advance(clear);assert.equal(s.weather,'nublado-entrada');assert.equal(s.rain,0);assert.equal(s.cloud,0);
 s=e.advance(20);assert.equal(s.rain,0);s=e.advance(5);assert.ok(Math.abs(s.rain-.5)<1e-9);
 s=e.advance(5);assert.equal(s.weather,'chuva');assert.equal(s.rain,1);assert.equal(s.cloud,1);assert.ok(s.weatherDuration>=60&&s.weatherDuration<120);
 s=e.advance(s.weatherDuration);assert.equal(s.weather,'nublado-saida');assert.equal(s.rain,1);
 s=e.advance(5);assert.ok(Math.abs(s.rain-.5)<1e-9);s=e.advance(5);assert.equal(s.rain,0);
 s=e.advance(20);assert.equal(s.weather,'limpo');assert.equal(s.cloud,0);
});
test('RG-02: cobertura inclui copa que atravessa célula/chunk; gotas não cruzam a superfície',()=>{
 let branch;
 for(let x=-24;x<=24&&!branch;x++)for(let z=-24;z<=24&&!branch;z++){
  const tree=treeAt(x,z);if(!tree)continue;
  branch=treeBlocks(tree).find(b=>(b.x!==x||b.z!==z)&&b.y+1>columnAt(b.x,b.z).top);
 }
 assert.ok(branch);assert.ok(rainRoofAt(branch.x+.5,branch.z+.5)>=branch.y+1);
 const scene=new THREE.Scene();scene.background=new THREE.Color();scene.fog=new THREE.Fog('#ffffff',105,150);
 const view=createEnvironmentView(scene),e=createEnvironment(808);e.advance(e.snapshot().weatherDuration+30);
 const s=e.snapshot();view.update(s,{x:0,y:1,z:0});assert.equal(view.rain.visible,true);
 assert.equal(view.rain.geometry.drawRange.count,MAX_RAIN_DROPS*2);
 const p=view.rain.geometry.attributes.position.array;
 for(let i=0;i<MAX_RAIN_DROPS;i++){const o=i*6;assert.ok(p[o+4]+1e-5>=rainRoofAt(p[o],p[o+2]));}
 view.dispose();assert.equal(scene.children.length,0);
});
test('RG-02: noite modifica materiais e fundo; retornar ao dia restaura a aparência',()=>{
 const scene=new THREE.Scene();scene.background=new THREE.Color();scene.fog=new THREE.Fog('#ffffff',105,150);
 const material=new THREE.MeshBasicMaterial({map:new THREE.Texture()});
 const mesh=new THREE.Mesh(new THREE.BoxGeometry(),material);scene.add(mesh);
 const view=createEnvironmentView(scene);view.refreshMaterials();
 const e=createEnvironment(808);view.update(e.snapshot(),{x:0,y:0,z:0});const day=material.color.clone(),sky=scene.background.clone();
 view.update({...e.snapshot(),...daylightAt(800)},{x:0,y:0,z:0});
 assert.ok(material.color.r<day.r&&material.color.b>material.color.r);assert.ok(!scene.background.equals(sky));
 view.update(e.snapshot(),{x:0,y:0,z:0});assert.ok(material.color.equals(day));assert.ok(scene.background.equals(sky));
 view.dispose();mesh.geometry.dispose();material.map.dispose();material.dispose();
});

test('relógio não duplica intervalo quando timestamp do RAF antecede evento de retomada',()=>{
 const c=createActiveClock(1000,true);assert.equal(c.sample(2000,false),0);
 assert.equal(c.sample(1990,false),0);assert.equal(c.sample(2010,false),.01);
});
