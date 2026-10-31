import {writeFileSync} from 'node:fs';
import {connectCDP} from './cdp.mjs';
const c=await connectCDP(9334,t=>t.url.startsWith('http://127.0.0.1:5173'));
try{
 for(const view of ['frente','costas']){
  const png=await c.evaluate(`(async()=>{
    const THREE=await import('/node_modules/.vite/deps/three.js');
    const {cloneAsset}=await import('/src/assets.js');const {TREE_IDS,TREE_NAMES}=await import('/src/trees.js');
    const sheet=document.createElement('canvas');sheet.width=1600;sheet.height=1200;const ctx=sheet.getContext('2d');
    ctx.fillStyle='#f5efd9';ctx.fillRect(0,0,1600,1200);ctx.fillStyle='#414f30';ctx.font='bold 30px monospace';ctx.fillText('MUNDO8BIT / ÁRVORES / v02',50,50);ctx.font='15px monospace';ctx.fillText('MODELOS BLOCKBENCH · TEXTURAS PLANAS PINTADAS · ${view.toUpperCase()} · EM REVISÃO',50,82);
    const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setSize(390,315);renderer.setPixelRatio(1);
    const scene=new THREE.Scene();scene.background=new THREE.Color('#f5efd9');scene.add(new THREE.HemisphereLight(0xfff5d7,0x385748,1.8));const sun=new THREE.DirectionalLight(0xfff1d6,1.5);sun.position.set(-20,35,15);scene.add(sun);
    const camera=new THREE.OrthographicCamera(-3.25,3.25,2.65,-2.65,.1,100);const side=${view==='frente'?1:-1};camera.position.set(6*side,6,6*side);camera.lookAt(0,2.1,0);
    const ground=new THREE.Mesh(new THREE.PlaneGeometry(4.8,4.8),new THREE.MeshStandardMaterial({color:'#e8e2c8',roughness:1}));ground.rotation.x=-Math.PI/2;ground.position.y=-.22;scene.add(ground);
    for(let i=0;i<11;i++){
      const model=cloneAsset('arvore-'+TREE_IDS[i]+'-v02');scene.add(model);renderer.render(scene,camera);
      const col=i%4,row=Math.floor(i/4),offset=row===2?200:0,x=col*400+offset,y=110+row*350;
      ctx.drawImage(renderer.domElement,x,y);ctx.fillStyle='#414f30';ctx.font='bold 17px monospace';ctx.fillText(String(i+1).padStart(2,'0')+'  '+TREE_NAMES[i].toUpperCase(),x+30,y+332);scene.remove(model);
    }
    renderer.dispose();ground.geometry.dispose();ground.material.dispose();return sheet.toDataURL();
  })()`);
  writeFileSync(`docs/art/arvores-v02-${view}.png`,Buffer.from(png.split(',')[1],'base64'));console.log(`Prancha renderizada: ${view}`);
 }
}finally{c.close();}
