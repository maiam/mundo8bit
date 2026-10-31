import {writeFileSync} from 'node:fs';
import {connectCDP} from './cdp.mjs';
const c=await connectCDP(9334,t=>t.url.startsWith('http://127.0.0.1:5173'));
try{
 for(const side of ['frente','costas']){
 const png=await c.evaluate(`(async()=>{
  await import('/src/main.js');const THREE=await import('/node_modules/.vite/deps/three.js');const {cloneAsset,faunaManifest}=await import('/src/assets.js');
  const sheet=document.createElement('canvas');sheet.width=1600;sheet.height=1200;const ctx=sheet.getContext('2d');ctx.fillStyle='#f5efd9';ctx.fillRect(0,0,1600,1200);ctx.fillStyle='#414f30';ctx.font='bold 28px monospace';ctx.fillText('MUNDO8BIT / ANIMAIS / MODELOS v01',40,45);ctx.font='15px monospace';ctx.fillText('BLOCKBENCH · TEXTURAS PLANAS PINTADAS · ${side.toUpperCase()} · EM REVISÃO',40,78);
  const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setSize(390,310);renderer.setPixelRatio(1);const scene=new THREE.Scene();scene.background=new THREE.Color('#f5efd9');scene.add(new THREE.HemisphereLight(0xfff5d7,0x385748,1.8));const sun=new THREE.DirectionalLight(0xfff1d6,1.5);sun.position.set(-20,35,15);scene.add(sun);const camera=new THREE.OrthographicCamera(-1.75,1.75,1.4,-1.4,.1,100);const sign=${side==='frente'?1:-1};camera.position.set(5*sign,3.6,6*sign);camera.lookAt(0,.9,0);
  for(let i=0;i<faunaManifest.assets.length;i++){const asset=faunaManifest.assets[i],model=cloneAsset(asset.id);scene.add(model);renderer.render(scene,camera);const row=Math.floor(i/4),x=i%4*400+(row===2?200:0),y=100+row*350;ctx.drawImage(renderer.domElement,x,y);ctx.fillStyle='#414f30';ctx.font='bold 17px monospace';ctx.fillText(asset.catalogId+' '+asset.name.toUpperCase(),x+22,y+333);scene.remove(model);}
  renderer.dispose();return sheet.toDataURL();
 })()`);
 writeFileSync(`docs/art/animais-modelos-v01-${side}.png`,Buffer.from(png.split(',')[1],'base64'));console.log(side);
 }
}finally{c.close();}
