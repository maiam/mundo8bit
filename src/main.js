import * as THREE from 'three';
import {createTree,treeTypeAt} from './trees.js';
import './style.css';
import {loadAssets,cloneAsset,worldMaterial,waterMaterial,appendTileUV} from './assets.js';
import {createTouchControls} from './touch-controls.js';
const touch = createTouchControls();
import {CHUNK_SIZE, SEED, hash, heightAt, chunkAt, wantedChunks} from './world.js';

export const scene = new THREE.Scene();
scene.background = new THREE.Color('#9abbb1');
scene.fog = new THREE.Fog('#9abbb1', 35, 75);
export const camera = new THREE.OrthographicCamera();
export let renderer;
try { renderer = new THREE.WebGLRenderer({antialias:true}); }
catch { document.querySelector('#error').hidden=false; document.querySelector('#error').textContent='Este protótipo precisa de WebGL. Abra em um navegador com aceleração gráfica.'; throw new Error('WebGL indisponível'); }
renderer.setPixelRatio(1);
document.body.prepend(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xfff5d7,0x385748,1.8));
const sun = new THREE.DirectionalLight(0xfff1d6,1.5); sun.position.set(-20,35,15);scene.add(sun);
const loading=document.querySelector('#loading');
try {await loadAssets(renderer);loading.hidden=true;}
catch(error){loading.hidden=true;document.querySelector('#error').hidden=false;document.querySelector('#error').textContent=error.message;throw error;}
const chunks = new Map(); let showGrid = false;
function makeChunk(cx,cz) {
  const group=new THREE.Group(); group.position.set(cx*CHUNK_SIZE,0,cz*CHUNK_SIZE);
  const vertices=[],uv=[];
  for(let x=0;x<CHUNK_SIZE;x++) for(let z=0;z<CHUNK_SIZE;z++) {
    const wx=cx*CHUNK_SIZE+x,wz=cz*CHUNK_SIZE+z;
    const tile=heightAt(wx,wz)<-1.3?13:Math.sin(wx*.24)+Math.cos(wz*.18)>.2?11:12;
    for(const [dx,dz] of [[0,0],[0,1],[1,0],[1,0],[0,1],[1,1]]) {vertices.push(x+dx,heightAt(wx+dx,wz+dz),z+dz);appendTileUV(uv,tile,dx,dz);}
    const n=hash(wx,wz);
    if(n>.975 && heightAt(wx,wz)>-1.45 && Math.hypot(wx,wz)>3) {
      const tree=createTree(treeTypeAt(wx,wz,heightAt(wx,wz)),wx,wz);
      tree.position.set(x,heightAt(wx,wz),z);group.add(tree);
    } else if(n<.009) {const rock=cloneAsset('pedra-v02');rock.position.set(x,heightAt(wx,wz),z);group.add(rock);}
  }
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.computeVertexNormals();
  const terrain=new THREE.Mesh(geo,worldMaterial);group.add(terrain);
  const lineGeometry=new THREE.BufferGeometry().setFromPoints(Array.from({length:49},(_,i)=>{const t=i/12;const x=t<=1?t*12:t<=2?12:t<=3?(3-t)*12:0;const z=t<=1?0:t<=2?(t-1)*12:t<=3?12:(4-t)*12;return new THREE.Vector3(x,heightAt(cx*12+x,cz*12+z)+.05,z);}));
  const border=new THREE.Line(lineGeometry,new THREE.LineBasicMaterial({color:0xffe6a0}));border.visible=showGrid;group.add(border);
  scene.add(group);return {group,terrain,border};
}
function stream() {
  const wanted=new Set();for(const [x,z] of wantedChunks(player.position.x,player.position.z)){const key=`${x},${z}`;wanted.add(key);if(!chunks.has(key))chunks.set(key,makeChunk(x,z));}
  for(const [key,c] of chunks)if(!wanted.has(key)){scene.remove(c.group);c.terrain.geometry.dispose();c.border.geometry.dispose();c.border.material.dispose();chunks.delete(key);}
}
const water=new THREE.Mesh(new THREE.PlaneGeometry(180,180),waterMaterial);water.position.y=-1.55;water.rotation.x=-Math.PI/2;scene.add(water);
export const player=new THREE.Group();scene.add(player);player.add(cloneAsset('explorador-v02'));
const keys=new Set();let lastChunk='';let time=performance.now();let elapsed=0;
function toggleGrid(){showGrid=!showGrid;for(const c of chunks.values())c.border.visible=showGrid;document.querySelector('#grid').textContent=showGrid?'G · Ocultar chunks':'G · Ver chunks';}
window.addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();keys.add(e.key.toLowerCase());if(e.key.toLowerCase()==='g'&&!e.repeat)toggleGrid();});
window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));window.addEventListener('blur',()=>keys.clear());
document.querySelector('#grid').onclick=toggleGrid;
document.querySelector('#home').onclick=()=>{player.position.set(0,0,0);lastChunk='';};
function resize(){const aspect=innerWidth/innerHeight;camera.left=-18*aspect;camera.right=18*aspect;camera.top=18;camera.bottom=-18;camera.near=.1;camera.far=180;camera.updateProjectionMatrix();// Keep native CSS resolution, with bounded supersampling on dense screens.
const ratio=Math.min(window.devicePixelRatio||1,1.5,Math.sqrt(2000000/(innerWidth*innerHeight)));
renderer.setPixelRatio(ratio);renderer.setSize(innerWidth,innerHeight,false);renderer.domElement.style.width='100%';renderer.domElement.style.height='100%';}window.addEventListener('resize',resize);resize();
function frame(now){const dt=Math.min((now-time)/1000,.05);time=now;elapsed+=dt;
  let x=Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft'));
  let z=Number(keys.has('s')||keys.has('arrowdown'))-Number(keys.has('w')||keys.has('arrowup'));
  x += touch.x; z += touch.z;
  const length=Math.hypot(x,z);if(length){const limit=Math.max(1,length);x/=limit;z/=limit;const speed=(keys.has('shift')||touch.running)?8:4;player.position.x+=(x+z)*.7071*speed*dt;player.position.z+=(z-x)*.7071*speed*dt;player.rotation.y=Math.atan2(x+z,z-x);}
  player.position.y=Math.max(heightAt(player.position.x,player.position.z),-1.5)+(length?Math.sin(elapsed*13)*.06:0);
  const chunk=chunkAt(player.position.x,player.position.z).join(',');if(chunk!==lastChunk){stream();lastChunk=chunk;}
  water.position.x=player.position.x;water.position.z=player.position.z;
  camera.position.copy(player.position).add(new THREE.Vector3(23,26,23));camera.lookAt(player.position);
  document.querySelector('#stats').textContent=`SEMENTE ${SEED} / CHUNK ${chunk} / ${chunks.size} ATIVOS / X ${player.position.x.toFixed(0)} Z ${player.position.z.toFixed(0)}`;
  renderer.render(scene,camera);requestAnimationFrame(frame);
}requestAnimationFrame(frame);
