import {writeFileSync} from 'node:fs';
import {connectCDP} from './cdp.mjs';
const c=await connectCDP(9334,t=>t.url.startsWith('http://127.0.0.1:5173'));
try{
 for(const kind of ['rock','flower'])for(const side of ['frente','costas']){
  const png=await c.evaluate(`(async()=>{
    await import('/src/main.js');const THREE=await import('/node_modules/.vite/deps/three.js');const {cloneAsset,natureManifest}=await import('/src/assets.js');
    const entries=natureManifest.assets.filter(a=>a.kind==='${kind}');const rows=Math.ceil(entries.length/6),sheet=document.createElement('canvas');sheet.width=1800;sheet.height=100+rows*300;const ctx=sheet.getContext('2d');ctx.fillStyle='#f5efd9';ctx.fillRect(0,0,sheet.width,sheet.height);ctx.fillStyle='#414f30';ctx.font='bold 27px monospace';ctx.fillText('MUNDO8BIT / ${kind==='rock'?'PEDRAS':'FLORES'} / MODELOS v01',35,40);ctx.font='15px monospace';ctx.fillText('BLOCKBENCH · TEXTURAS PLANAS PINTADAS · ${side.toUpperCase()} · EM REVISÃO',35,70);
    const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setSize(300,260);renderer.setPixelRatio(1);const scene=new THREE.Scene();scene.background=new THREE.Color('#f5efd9');scene.add(new THREE.HemisphereLight(0xfff5d7,0x385748,1.8));const sun=new THREE.DirectionalLight(0xfff1d6,1.5);sun.position.set(-20,35,15);scene.add(sun);
    const size=${kind==='rock'?1.1:.78};const camera=new THREE.OrthographicCamera(-size,size,size*.866,-size*.866,.1,100);const sign=${side==='frente'?1:-1};camera.position.set(5*sign,4,5*sign);camera.lookAt(0,${kind==='rock'?.5:.58},0);
    for(let i=0;i<entries.length;i++){const asset=entries[i],model=cloneAsset(asset.id);scene.add(model);renderer.render(scene,camera);const row=Math.floor(i/6),count=Math.min(6,entries.length-row*6),x=i%6*300+(6-count)*150,y=90+row*300;ctx.drawImage(renderer.domElement,x,y);ctx.fillStyle='#414f30';ctx.font='bold 15px monospace';ctx.fillText(asset.catalogId+' '+asset.name.toUpperCase(),x+15,y+280);scene.remove(model);}
    renderer.dispose();return sheet.toDataURL();
  })()`);
  writeFileSync(`docs/art/${kind==='rock'?'pedras':'flores'}-modelos-v01-${side}.png`,Buffer.from(png.split(',')[1],'base64'));console.log(`${kind} / ${side}`);
 }
}finally{c.close();}
