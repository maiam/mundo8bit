import * as THREE from 'three';
import {cameraLayout,cameraPose,screenMovement} from './camera-settings.js';
import {collisionWorld,PLAYER_RADIUS,treeColliders,rockCollider} from './collisions.js';
import {spawnFauna,removeFauna,updateFauna} from './fauna.js';
import {natureAt} from './nature.js';
import {createTree,treeTypeAt} from './trees.js';
import './style.css';
import {loadAssets,cloneAsset,worldMaterial,waterMaterial,terrainMaterial,appendTileUV,createAssetInstances,assetFootprint} from './assets.js';
import {createTouchControls} from './touch-controls.js';
export const touch = createTouchControls();
import {CHUNK_SIZE, SEED, hash, heightAt, chunkAt, wantedChunks} from './world.js';

export * as gameAssets from './assets.js';

export const scene = new THREE.Scene();
scene.background = new THREE.Color('#9abbb1');
scene.fog = new THREE.Fog('#9abbb1', 35, 75);
export const camera = new THREE.OrthographicCamera();
export let renderer;
try { renderer = new THREE.WebGLRenderer({antialias:true}); }
catch { document.querySelector('#error').hidden=false; document.querySelector('#error').textContent='Este protótipo precisa de WebGL. Abra em um navegador com aceleração gráfica.'; throw new Error('WebGL indisponível'); }
renderer.setPixelRatio(1);
document.body.prepend(renderer.domElement);touch.attachCanvas(renderer.domElement);renderer.domElement.setAttribute('aria-label','Mundo8bit: área do jogo');
scene.add(new THREE.HemisphereLight(0xfff5d7,0x385748,1.8));
const sun = new THREE.DirectionalLight(0xfff1d6,1.5); sun.position.set(-20,35,15);scene.add(sun);
const loading=document.querySelector('#loading');
try {await loadAssets(renderer);loading.hidden=true;}
catch(error){loading.hidden=true;document.querySelector('#error').hidden=false;document.querySelector('#error').textContent=error.message;throw error;}
const chunks = new Map(); let showGrid = false;
function makeChunk(cx,cz) {
  const group=new THREE.Group(); group.position.set(cx*CHUNK_SIZE,0,cz*CHUNK_SIZE);
  const vertices=[],uv=[],placements=new Map(),decorations=[],colliders=[];
  for(let x=0;x<CHUNK_SIZE;x++) for(let z=0;z<CHUNK_SIZE;z++) {
    const wx=cx*CHUNK_SIZE+x,wz=cz*CHUNK_SIZE+z;
    const tile=heightAt(wx,wz)<-1.3?13:Math.sin(wx*.24)+Math.cos(wz*.18)>.2?11:12;
    for(const [dx,dz] of [[0,0],[0,1],[1,0],[1,0],[0,1],[1,1]]) {vertices.push(x+dx,heightAt(wx+dx,wz+dz),z+dz);appendTileUV(uv,tile,dx,dz);}
    const n=hash(wx,wz);
    if(n>.975 && heightAt(wx,wz)>-1.45 && Math.hypot(wx,wz)>3) {
      const tree=createTree(treeTypeAt(wx,wz,heightAt(wx,wz)),wx,wz);
      tree.position.set(x,heightAt(wx,wz),z);group.add(tree);colliders.push(...treeColliders(treeTypeAt(wx,wz,heightAt(wx,wz)),wx,wz,tree.scale.x,tree.rotation.y));
    }
    for(const p of natureAt(wx,wz)){if(!placements.has(p.id))placements.set(p.id,[]);placements.get(p.id).push(p);if(p.kind==='rock')colliders.push(rockCollider(p,assetFootprint(p.id)));}
  }
  for(const [id,items] of placements){const decoration=createAssetInstances(id,items,cx*CHUNK_SIZE,cz*CHUNK_SIZE);decorations.push(decoration);group.add(decoration);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.computeVertexNormals();
  const terrain=new THREE.Mesh(geo,terrainMaterial);group.add(terrain);
  const lineGeometry=new THREE.BufferGeometry().setFromPoints(Array.from({length:49},(_,i)=>{const t=i/12;const x=t<=1?t*12:t<=2?12:t<=3?(3-t)*12:0;const z=t<=1?0:t<=2?(t-1)*12:t<=3?12:(4-t)*12;return new THREE.Vector3(x,heightAt(cx*12+x,cz*12+z)+.05,z);}));
  const border=new THREE.Line(lineGeometry,new THREE.LineBasicMaterial({color:0xffe6a0}));border.visible=showGrid;group.add(border);
  collisionWorld.addChunk(cx,cz,colliders);scene.add(group);spawnFauna(cx,cz,scene);return {group,terrain,border,decorations,cx,cz};
}
function stream() {
  const wanted=new Set();for(const [x,z] of wantedChunks(player.position.x,player.position.z)){const key=`${x},${z}`;wanted.add(key);if(!chunks.has(key))chunks.set(key,makeChunk(x,z));}
  for(const [key,c] of chunks)if(!wanted.has(key)){scene.remove(c.group);collisionWorld.removeChunk(c.cx,c.cz);removeFauna(c.cx,c.cz,scene);c.decorations.forEach(m=>m.dispose());c.terrain.geometry.dispose();c.border.geometry.dispose();c.border.material.dispose();chunks.delete(key);}
}
const water=new THREE.Mesh(new THREE.PlaneGeometry(180,180),waterMaterial);water.position.y=-1.55;water.rotation.x=-Math.PI/2;scene.add(water);
export const player=new THREE.Group();scene.add(player);player.name='Iara';const playerModel=cloneAsset('iara-v01');player.add(playerModel);
const iaraLimbs=['braco-esquerdo','braco-direito','perna-esquerda','perna-direita'].map(name=>playerModel.getObjectByName(name));let walkPhase=0;collisionWorld.setDynamic('player',{type:'circle',x:0,z:0,radius:PLAYER_RADIUS,kind:'player'});
export function movePlayer(dx,dz){
 if(touch.paused)return {x:player.position.x,z:player.position.z,distance:0,blocked:true};
 const position=collisionWorld.move(player.position,dx,dz,PLAYER_RADIUS,{ignoreId:'player'});
 player.position.x=position.x;player.position.z=position.z;
 collisionWorld.setDynamic('player',{type:'circle',x:position.x,z:position.z,radius:PLAYER_RADIUS,kind:'player'});
 return position;
}
const keys=new Set();let lastChunk='';let time=performance.now();let elapsed=0;let cameraGround=null;let lastCameraX=null;let lastCameraZ=null;
function toggleGrid(){showGrid=!showGrid;document.body.classList.toggle('show-stats',showGrid);for(const c of chunks.values())c.border.visible=showGrid;document.querySelector('#grid').textContent=showGrid?'G · Ocultar chunks':'G · Ver chunks';}
window.addEventListener('keydown',e=>{if(e.target instanceof Element&&e.target.closest('button')&&[' ','Enter'].includes(e.key))return;if(touch.paused){keys.clear();return;}if(['+','=','-','_'].includes(e.key)){if(!e.repeat)touch.setZoom(e.key==='-'||e.key==='_'?touch.zoom/1.15:touch.zoom*1.15);return;}if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();keys.add(e.key.toLowerCase());if(e.key.toLowerCase()==='g'&&!e.repeat)toggleGrid();});
window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));window.addEventListener('blur',()=>keys.clear());
document.querySelector('#grid').onclick=toggleGrid;
document.querySelector('#home').onclick=()=>{player.position.set(0,0,0);collisionWorld.setDynamic('player',{type:'circle',x:0,z:0,radius:PLAYER_RADIUS,kind:'player'});lastChunk='';};
function resize(){
 const layout=cameraLayout(innerWidth,innerHeight,touch.mobile);
 touch.setZoomLimits(layout.minZoom,layout.maxZoom);
 camera.left=-layout.halfHeight*layout.aspect;camera.right=layout.halfHeight*layout.aspect;camera.top=layout.halfHeight;camera.bottom=-layout.halfHeight;camera.near=.1;camera.far=180;
 camera.zoom=Math.max(layout.minZoom,Math.min(layout.maxZoom,camera.zoom));camera.updateProjectionMatrix();
 const ratio=Math.min(window.devicePixelRatio||1,1.5,Math.sqrt(2000000/(innerWidth*innerHeight)));
 renderer.setPixelRatio(ratio);renderer.setSize(innerWidth,innerHeight,false);renderer.domElement.style.width='100%';renderer.domElement.style.height='100%';
}window.addEventListener('resize',resize);matchMedia('(any-pointer:coarse)').addEventListener('change',resize);document.addEventListener('fullscreenchange',resize);document.addEventListener('webkitfullscreenchange',resize);resize();
function frame(now){const dt=Math.min((now-time)/1000,.05);time=now;if(touch.paused){keys.clear();requestAnimationFrame(frame);return;}elapsed+=dt;
  if(Math.abs(camera.zoom-touch.zoom)>.0001){camera.zoom+=(touch.zoom-camera.zoom)*(1-Math.exp(-12*dt));camera.updateProjectionMatrix();}
  let x=Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft'));
  let z=Number(keys.has('s')||keys.has('arrowdown'))-Number(keys.has('w')||keys.has('arrowup'));
  x += touch.x; z += touch.z;
  const beforeChunk=chunkAt(player.position.x,player.position.z).join(',');if(beforeChunk!==lastChunk){stream();lastChunk=beforeChunk;}
  let walked=0;const length=Math.hypot(x,z);if(length){const limit=Math.max(1,length);x/=limit;z/=limit;const speed=(keys.has('shift')||touch.running)?8:4;const direction=screenMovement(x,z);const position=movePlayer(direction.x*speed*dt,direction.z*speed*dt);walked=position.distance;player.rotation.y=Math.atan2(direction.x,direction.z);}
  walkPhase+=walked*7;const stride=walked>.001?Math.min(1,walked/Math.max(dt,.001)/4):0;
  iaraLimbs.forEach((limb,i)=>{if(limb)limb.rotation.x=Math.sin(walkPhase+(i%2?Math.PI:0)+(i<2?Math.PI:0))*.42*stride;});
  player.position.y=heightAt(player.position.x,player.position.z)+(walked>.001?Math.sin(elapsed*13)*.06:0);
  const chunk=chunkAt(player.position.x,player.position.z).join(',');if(chunk!==lastChunk){stream();lastChunk=chunk;}
  water.position.x=player.position.x;water.position.z=player.position.z;
  // Follow the ground, not the walking bob. X/Z follow immediately to preserve control response.
  const ground=heightAt(player.position.x,player.position.z);
  const teleported=lastCameraX===null||Math.hypot(player.position.x-lastCameraX,player.position.z-lastCameraZ)>8;
  cameraGround=teleported?ground:Math.max(ground-.5,Math.min(ground+.5,cameraGround+(ground-cameraGround)*(1-Math.exp(-8*dt))));
  const pose=cameraPose(player.position.x,cameraGround,player.position.z);
  camera.position.set(pose.position.x,pose.position.y,pose.position.z);camera.lookAt(pose.target.x,pose.target.y,pose.target.z);
  lastCameraX=player.position.x;lastCameraZ=player.position.z;
  document.querySelector('#stats').textContent=`SEMENTE ${SEED} / CHUNK ${chunk} / ${chunks.size} ATIVOS / X ${player.position.x.toFixed(0)} Z ${player.position.z.toFixed(0)}`;
  collisionWorld.setDynamic('player',{type:'circle',x:player.position.x,z:player.position.z,radius:PLAYER_RADIUS,kind:'player'});
  updateFauna(dt,elapsed);
  renderer.render(scene,camera);requestAnimationFrame(frame);
}requestAnimationFrame(frame);
