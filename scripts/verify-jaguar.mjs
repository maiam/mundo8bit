import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {connectCDP} from './cdp.mjs';
const c=await connectCDP(9334,t=>t.url.startsWith('http://127.0.0.1:5173'));
try{
 await c.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});await c.send('Emulation.setDeviceMetricsOverride',{width:844,height:390,deviceScaleFactor:1,mobile:true});
 const initial=await c.evaluate(`(async()=>{
 window.qa=await import('/src/main.js');const fauna=await import('/src/fauna.js');window.jaguar=[...fauna.activeAnimals.values()].find(a=>a.data.species===0);if(!jaguar)throw Error('Onça não encontrada na região inicial');
 qa.player.position.x=jaguar.data.x-1.7;qa.player.position.z=jaguar.data.z+1.4;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
 const template=qa.gameAssets.cloneAsset(jaguar.data.id),other=[...fauna.activeAnimals.values()].filter(a=>a.data.species!==0);
 return {species:jaguar.data.species,sprite:jaguar.sprite?.isSprite,textureShared:jaguar.sprite.material.map===template.getObjectByName('animal-sprite').material.map,rotation:jaguar.model.rotation.y,other3D:other.every(a=>!a.sprite),count:fauna.activeAnimals.size,error:document.querySelector('#error').textContent,badPrograms:qa.renderer.info.programs.filter(p=>p.diagnostics?.runnable===false).length};})()`);
 assert.ok(initial.sprite&&initial.textureShared&&initial.other3D);assert.equal(initial.rotation,0);assert.equal(initial.error,'');assert.equal(initial.badPrograms,0);
 const motion=await c.evaluate(`(async()=>{const f=await import('/src/fauna.js'),physics=await import('/src/collisions.js'),a=jaguar,before={x:a.data.x,z:a.data.z};for(let i=0;i<160;i++)f.updateFauna(.05,i*.05);const after={x:a.data.x,z:a.data.z};
 const saved=qa.player.position.clone();qa.player.position.x=a.data.x-1.2;qa.player.position.z=a.data.z;for(let i=0;i<25;i++)qa.movePlayer(.1,0);const distance=Math.hypot(qa.player.position.x-a.data.x,qa.player.position.z-a.data.z);qa.player.position.copy(saved);
 return {before,after,rotation:a.model.rotation.y,collision:physics.collisionWorld.dynamic.has(a.data.colliderId),distance,material:a.sprite.material.uuid,texture:a.sprite.material.map.uuid};})()`);
 assert.ok(Math.hypot(motion.after.x-motion.before.x,motion.after.z-motion.before.z)>.02);assert.equal(motion.rotation,0);assert.ok(motion.collision&&motion.distance>.3);
 const streaming=await c.evaluate(`(async()=>{const fauna=await import('/src/fauna.js'),values=[];for(const [x,z]of [[120,-120],[0,0],[120,-120],[0,0]]){qa.player.position.x=x;qa.player.position.z=z;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));const jaguars=[...fauna.activeAnimals.values()].filter(a=>a.data.species===0);values.push({x,z,jaguars:jaguars.length,allSprites:jaguars.every(a=>a.sprite?.isSprite),shared:jaguars.every(a=>a.sprite.material.map.uuid==='${motion.texture}'),memory:{...qa.renderer.info.memory}});}return values;})()`);
 streaming.forEach(v=>assert.ok(v.allSprites&&v.shared));assert.deepEqual(streaming[1].memory,streaming[3].memory);
 for(const [name,width,height,mobile]of [['mobile',844,390,true],['desktop',1440,900,false]]){
  await c.send('Emulation.setTouchEmulationEnabled',{enabled:mobile,maxTouchPoints:mobile?5:1});await c.send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile});
  await c.evaluate(`(async()=>{const f=await import('/src/fauna.js'),a=[...f.activeAnimals.values()].find(a=>a.data.species===0);a.data.x=1.65;a.data.z=-.6;a.data.targetX=1.65;a.data.targetZ=-.6;a.data.state='idle';a.data.timer=999;f.updateFauna(0,0);qa.player.position.x=0;qa.player.position.z=0;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));})()`);
  const shot=await c.send('Page.captureScreenshot',{format:'png'});writeFileSync('docs/art/validation/onca-2d-v01-'+name+'.png',Buffer.from(shot.data,'base64'));
 }
 const result={initial,motion,streaming};writeFileSync('docs/art/validation/onca-2d-v01-result.json',JSON.stringify(result,null,2)+'\n');console.log(result);
}finally{c.close();}
