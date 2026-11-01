import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {connectCDP} from './cdp.mjs';
const c=await connectCDP(9334,t=>t.url.startsWith('http://127.0.0.1:5173'));
try{
 await c.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});
 await c.send('Emulation.setDeviceMetricsOverride',{width:844,height:390,deviceScaleFactor:2,mobile:true});
 const result=await c.evaluate(`(async()=>{
 const game=await import(document.querySelector('script[src*="/src/main.js"]').src),THREE=await import('/node_modules/.vite/deps/three.js');window.qa=game;game.player.position.set(0,0,0);game.touch.setZoom(1);
 await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
 const canvas=document.createElement('canvas');canvas.width=1688;canvas.height=440;const ctx=canvas.getContext('2d');ctx.fillStyle='#f5efd9';ctx.fillRect(0,0,1688,440);ctx.fillStyle='#414f30';ctx.font='bold 22px monospace';ctx.fillText('ANTES / DIAGONAL 45°',25,32);ctx.fillText('AGORA / TOP-DOWN ALINHADO',869,32);
 const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setSize(844,390);renderer.setPixelRatio(1);
 const old=new THREE.OrthographicCamera(-7*844/390,7*844/390,7,-7,.1,180);old.position.copy(game.player.position).add(new THREE.Vector3(23,26,23));old.lookAt(game.player.position);renderer.render(game.scene,old);ctx.drawImage(renderer.domElement,0,50);
 renderer.render(game.scene,game.camera);ctx.drawImage(renderer.domElement,844,50);renderer.dispose();
 return {board:canvas.toDataURL(),camera:{position:game.camera.position.toArray(),zoom:game.camera.zoom,halfHeight:game.camera.top},player:game.player.position.toArray(),paused:game.touch.paused,error:document.querySelector('#error').textContent};
 })()`);
 assert.equal(result.error,'');assert.equal(result.paused,false);assert.ok(Math.abs(result.camera.position[0]-result.player[0])<.001);assert.ok(result.camera.halfHeight<=5.8);
 writeFileSync('docs/art/camera-topdown-v01-comparacao.png',Buffer.from(result.board.split(',')[1],'base64'));delete result.board;
 // Exercise actual keyboard input and screen projection, avoiding random collision obstacles.
 await c.send('Emulation.setTouchEmulationEnabled',{enabled:false,maxTouchPoints:1});
 await c.send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
 const start=await c.evaluate(`(()=>{qa.player.position.set(0,0,0);return {x:0,z:0};})()`);
 await c.send('Input.dispatchKeyEvent',{type:'keyDown',key:'d',code:'KeyD',windowsVirtualKeyCode:68});
 await c.evaluate('new Promise(r=>setTimeout(r,350))');
 await c.send('Input.dispatchKeyEvent',{type:'keyUp',key:'d',code:'KeyD',windowsVirtualKeyCode:68});
 const end=await c.evaluate('({x:qa.player.position.x,z:qa.player.position.z})');assert.ok(end.x>start.x);assert.ok(Math.abs(end.z-start.z)<.001);result.screenRight={start,end};
 for(const [name,width,height,mobile] of [['desktop',1440,900,false],['landscape',844,390,true],['compact',568,320,true]]){
  await c.send('Emulation.setTouchEmulationEnabled',{enabled:mobile,maxTouchPoints:mobile?5:1});await c.send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile});
  await c.evaluate('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');const shot=await c.send('Page.captureScreenshot',{format:'png'});writeFileSync('docs/art/validation/camera-topdown-v01-'+name+'.png',Buffer.from(shot.data,'base64'));
 }
 writeFileSync('docs/art/validation/camera-topdown-v01-result.json',JSON.stringify(result,null,2)+'\n');console.log(result);
}finally{c.close();}
