import {writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {connectCDP} from './cdp.mjs';
const c=await connectCDP(9334,t=>t.url.startsWith('http://127.0.0.1:5173'));
try{
const result=await c.evaluate(`(async()=>{
 const game=await import('/src/main.js'),THREE=await import('/node_modules/.vite/deps/three.js'),assets=await import('/src/assets.js');
 const model=assets.cloneAsset('iara-v01'),box=new THREE.Box3().setFromObject(model);
 const sheet=document.createElement('canvas');sheet.width=1600;sheet.height=700;const ctx=sheet.getContext('2d');ctx.fillStyle='#f5efd9';ctx.fillRect(0,0,1600,700);ctx.fillStyle='#414f30';ctx.font='bold 30px monospace';ctx.fillText('MUNDO8BIT / IARA / MODELO v01',35,45);ctx.font='18px monospace';ctx.fillText('BLOCKBENCH 5.2.2 · TEXTURAS PLANAS PINTADAS · EM REVISÃO',35,78);
 const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setSize(400,530);const scene=new THREE.Scene();scene.background=new THREE.Color('#f5efd9');scene.add(new THREE.HemisphereLight(0xfff5d7,0x385748,2));const sun=new THREE.DirectionalLight(0xfff1d6,2);sun.position.set(-3,5,7);scene.add(sun);scene.add(model);const camera=new THREE.OrthographicCamera(-.85,.85,1.12,-1.12,.1,50);
 const views=[[0,1,6],[6,1,0],[0,1,-6],[4,2.5,6]],names=['FRENTE','PERFIL','COSTAS','3/4'];
 for(let i=0;i<4;i++){camera.position.set(...views[i]);camera.lookAt(0,.88,0);renderer.render(scene,camera);ctx.drawImage(renderer.domElement,i*400,100);ctx.fillStyle='#414f30';ctx.fillText(names[i],i*400+145,670);}renderer.dispose();
 return {png:sheet.toDataURL(),bounds:{min:box.min.toArray(),max:box.max.toArray()},player:game.player.name,limbs:['braco-esquerdo','braco-direito','perna-esquerda','perna-direita'].every(n=>!!model.getObjectByName(n)),error:document.querySelector('#error').textContent};
})()`);
assert.equal(result.player,'Iara');assert.ok(result.limbs);assert.equal(result.error,'');assert.ok(Math.abs(result.bounds.min[1])<.001);assert.ok(result.bounds.max[1]<1.9&&result.bounds.max[1]>1.6);
writeFileSync('docs/art/iara-modelo-v01.png',Buffer.from(result.png.split(',')[1],'base64'));delete result.png;writeFileSync('docs/art/validation/iara-v01-result.json',JSON.stringify(result,null,2)+'\n');console.log(result);
}finally{c.close();}
