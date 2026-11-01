import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {connectCDP} from './cdp.mjs';
const c=await connectCDP(9334,t=>t.url.startsWith('http://127.0.0.1:5173'));
try{
 await c.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});await c.send('Emulation.setDeviceMetricsOverride',{width:844,height:390,deviceScaleFactor:1,mobile:true});
 const result=await c.evaluate(`(async()=>{
 const game=await import(document.querySelector('script[src*="/src/main.js"]').src),a=game.gameAssets,THREE=await import('/node_modules/.vite/deps/three.js'),{createPaintedMaterial}=await import('/src/painted-materials.js');window.qa=game;
 game.player.position.set(0,0,0);game.touch.setZoom(1);await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
 const image=a.grassClearTexture.image,reference=new Image();reference.src='/docs/art/texturas-v01-aprovada.png';await reference.decode();
 const board=document.createElement('canvas');board.width=1600;board.height=1150;const ctx=board.getContext('2d');ctx.fillStyle='#f5efd9';ctx.fillRect(0,0,1600,1150);ctx.fillStyle='#414f30';ctx.font='bold 29px monospace';ctx.fillText('MUNDO8BIT / GRAMA CLARA / REVISÃO v04',35,48);ctx.font='17px monospace';ctx.fillText('COMPARAÇÃO VISUAL · v04 EM REVISÃO · DEMAIS MATERIAIS MANTIDOS',35,80);
 const captions=['REFERÊNCIA APROVADA T01','PRODUÇÃO ANTERIOR v03','NOVA PINTURA v04'];
 for(let i=0;i<3;i++){ctx.fillStyle='#414f30';ctx.font='bold 20px monospace';ctx.fillText(captions[i],40+i*530,125);}
 // Fit the original rectangular swatch without stretching it into a square.
 ctx.drawImage(reference,126,96,289,190,40,180,470,309);
 ctx.drawImage(a.atlas.image,16,54,224,147,570,180,470,309);
 ctx.drawImage(image,0,175,image.width,674,1100,180,470,309);
 ctx.font='16px monospace';ctx.fillStyle='#414f30';ctx.fillText('Referência ilustrada, proporção preservada',40,525);ctx.fillText('Manchas arredondadas e pouco desenho',570,525);ctx.fillText('Recorte central, sem deformação',1100,525);
 const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setSize(780,360);renderer.setPixelRatio(1);
 const terrain=[];game.scene.traverse(n=>{if(n.isMesh&&n.material===a.terrainMaterial)terrain.push(n);});
 const previous=createPaintedMaterial(a.atlas);ctx.font='bold 22px monospace';ctx.fillText('ANTES / MESMA CENA E CÂMERA',20,585);ctx.fillText('AGORA / APENAS T01 ALTERADA',820,585);
 try{terrain.forEach(n=>n.material=previous);renderer.render(game.scene,game.camera);ctx.drawImage(renderer.domElement,10,610);}
 finally{terrain.forEach(n=>n.material=a.terrainMaterial);}
 renderer.render(game.scene,game.camera);ctx.drawImage(renderer.domElement,810,610);
 const programs=[...renderer.info.programs,...game.renderer.info.programs],badPrograms=programs.filter(p=>p.diagnostics?.runnable===false).length;previous.dispose();renderer.dispose();
 ctx.font='17px monospace';ctx.fillStyle='#414f30';ctx.fillText('O chão mantém a mistura com grama escura, terra e trilha v03; câmera e iluminação idênticas.',30,1010);ctx.fillText('Textura de origem gerada por imagem · importada no Blockbench · export 1024 × 1024',30,1045);ctx.fillText('Repetição espelhada evita emendas duras; conferir simetrias em áreas grandes.',30,1080);
 const repeat=document.createElement('canvas');repeat.width=repeat.height=900;const rctx=repeat.getContext('2d');
 for(let y=0;y<3;y++)for(let x=0;x<3;x++){rctx.save();rctx.translate(x*300+(x%2?300:0),y*300+(y%2?300:0));rctx.scale(x%2?-1:1,y%2?-1:1);rctx.drawImage(image,0,0,300,300);rctx.restore();}
 return {board:board.toDataURL(),repeat:repeat.toDataURL(),size:[image.width,image.height],badPrograms,canvases:document.querySelectorAll('body>canvas').length,terrainChunks:terrain.length,mirrored:a.grassClearTexture.wrapS===THREE.MirroredRepeatWrapping&&a.grassClearTexture.wrapT===THREE.MirroredRepeatWrapping,mipmaps:a.grassClearTexture.generateMipmaps,error:document.querySelector('#error').textContent};
 })()`);
 assert.deepEqual(result.size,[1024,1024]);assert.equal(result.badPrograms,0);assert.equal(result.canvases,1);assert.equal(result.terrainChunks,25);assert.ok(result.mirrored&&result.mipmaps);assert.equal(result.error,'');
 for(const [key,path] of [['board','docs/art/grama-clara-v04-comparacao.png'],['repeat','docs/art/grama-clara-v04-repeticao.png']]){writeFileSync(path,Buffer.from(result[key].split(',')[1],'base64'));delete result[key];}
 const shot=await c.send('Page.captureScreenshot',{format:'png'});writeFileSync('docs/art/validation/grama-clara-v04-mobile.png',Buffer.from(shot.data,'base64'));
 writeFileSync('docs/art/validation/grama-clara-v04-result.json',JSON.stringify(result,null,2)+'\n');console.log(result);
}finally{c.close();}
