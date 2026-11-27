import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {connectCDP} from './cdp.mjs';
const c=await connectCDP(9334,t=>t.url.startsWith('http://127.0.0.1:5173'));
try{
 await c.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});await c.send('Emulation.setDeviceMetricsOverride',{width:844,height:390,deviceScaleFactor:1,mobile:true});
 const result=await c.evaluate(`(async()=>{
 const game=await import('/src/main.js'),assets=game.gameAssets;window.qa=game;game.player.position.set(0,0,0);game.touch.setZoom(1);
 await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
 const badPrograms=game.renderer.info.programs.filter(p=>p.diagnostics?.runnable===false).map(p=>p.diagnostics);
 const image=assets.atlas.image,canvas=document.createElement('canvas');canvas.width=canvas.height=1024;const ctx=canvas.getContext('2d');ctx.drawImage(image,0,0);
 let maxSeam=0;for(let tile=0;tile<7;tile++){const ox=tile%4*256,oy=Math.floor(tile/4)*256;for(let n=16;n<=240;n++){const pairs=[[[16,n],[240,n]],[[n,16],[n,240]]];for(const [a,b] of pairs){const ca=ctx.getImageData(ox+a[0],oy+a[1],1,1).data,cb=ctx.getImageData(ox+b[0],oy+b[1],1,1).data;for(let k=0;k<3;k++)maxSeam=Math.max(maxSeam,Math.abs(ca[k]-cb[k]));}}}
 const board=document.createElement('canvas');board.width=1400;board.height=1100;const out=board.getContext('2d');out.fillStyle='#f5efd9';out.fillRect(0,0,1400,1100);out.fillStyle='#414f30';out.font='bold 30px monospace';out.fillText('MUNDO8BIT / TEXTURAS DE PRODUÇÃO v03',35,48);out.font='16px monospace';out.fillText('PINTADAS NO BLOCKBENCH 5.2.2 · ATLAS 1024 · 12 MATERIAIS',35,78);
 const labels=['T01 GRAMA CLARA','T02 GRAMA ESCURA','T03 TERRA','T04 TRILHA','T05 AREIA','T06 ÁGUA RASA','T07 ÁGUA FUNDA','T08 PEDRA','T09 CASCA','T10 FOLHAGEM CLARA','T11 FOLHAGEM ESCURA','T12 MADEIRA'];
 for(let i=0;i<12;i++){const x=35+i%4*345,y=110+Math.floor(i/4)*310;out.drawImage(image,i%4*256+16,Math.floor(i/4)*256+16,224,224,x,y,295,250);out.fillStyle='#414f30';out.font='bold 18px monospace';out.fillText(labels[i],x,y+277);}
 const water=(x,z)=>{const h=Math.sin(x*.14)*1.25+Math.cos(z*.17)*.95+Math.sin((x+z)*.09)*.8;return Math.max(0,-1.55-h);};
 let counts={shallow:0,deep:0};for(let x=-24;x<36;x++)for(let z=-24;z<36;z++){const d=water(x,z);if(d>0&&d<.5)counts.shallow++;if(d>1.1)counts.deep++;}
 return {board:board.toDataURL(),maxSeam,badPrograms,atlas:[image.width,image.height],trees:assets.assetManifest.assets.filter(a=>a.kind==='tree').length,rocks:assets.natureManifest.assets.filter(a=>a.worldPaint).length,counts,error:document.querySelector('#error').textContent,canvases:document.querySelectorAll('body>canvas').length};
 })()`);
 assert.equal(result.error,'');assert.equal(result.canvases,1);assert.deepEqual(result.badPrograms,[]);assert.deepEqual(result.atlas,[1024,1024]);assert.equal(result.trees,11);assert.equal(result.rocks,11);assert.equal(result.maxSeam,0);assert.ok(result.counts.shallow&&result.counts.deep);
 writeFileSync('docs/art/texturas-producao-v03.png',Buffer.from(result.board.split(',')[1],'base64'));delete result.board;
 for(const [name,width,height,mobile] of [['landscape',844,390,true],['compact',568,320,true],['desktop',1440,900,false]]){
  await c.send('Emulation.setTouchEmulationEnabled',{enabled:mobile,maxTouchPoints:mobile?5:1});await c.send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile});await c.evaluate('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');
  const shot=await c.send('Page.captureScreenshot',{format:'png'});writeFileSync('docs/art/validation/texturas-v03-'+name+'.png',Buffer.from(shot.data,'base64'));
 }
 writeFileSync('docs/art/validation/texturas-v03-result.json',JSON.stringify(result,null,2)+'\n');console.log(result);
}finally{c.close();}
