// Mundo voxel 3D — mundo padrão desde 2026-11-25 (docs/voxel-3d.md); o clássico fica em ?mundo=classico.
// Reaproveita geração (world.js/nature.js/trees.js), CollisionWorld, filtro pixel art e controles de toque.
// Entidades em box model (docs/voxel-entidades.md); controles e hotbar (docs/voxel-controles.md).
import * as THREE from 'three';
import '../style.css';
import {CHUNK_SIZE,SEED,chunkAt,wantedChunks} from '../world.js';
import {CollisionWorld,PLAYER_RADIUS} from '../collisions.js';
import {createTouchControls} from '../touch-controls.js';
import {createPixelArt,readPixelArtPreference,storePixelArtPreference} from '../pixel-art.js';
import {worldModeSearch} from '../world-mode.js';
import {VOXEL_PIXELS_PER_UNIT,VOXEL_CHUNK_RADIUS,voxelCameraLayout,voxelCameraPose,voxelScreenMovement} from './voxel-settings.js';
import {buildVoxelAtlas,ATLAS_SIZE} from './voxel-atlas.js';
import {buildChunkData,voxelGround,voxelStart} from './voxel-terrain.js';
import {buildBoxModel} from './entities/box-model.js';
import {animateEntity} from './entities/animation.js';
import {IARA} from './entities/entity-defs.js';
import {createEntityManager} from './entities/entities.js';
import {createRunRule,actionTarget} from './controls.js';
import {createHotbar,createActionStick} from './hud.js';

export const worldMode='voxel3d';
document.body.classList.add('voxel-world');
document.querySelector('header .badge').textContent='MUNDO VOXEL 3D';
document.querySelector('#world-switch').textContent='Abrir mundo clássico (legado)';
document.querySelector('.touch-hint').textContent='ARRASTE PARA ANDAR · 3 s PARA CIMA CORRE · GIRE A MÃO PARA ESCOLHER · TOQUE PARA AGIR';
document.querySelector('footer').innerHTML='<span><b>WASD / SETAS</b> mover · <b>W 3 s</b> ou <b>SHIFT</b> correr</span><span><b>Q / E</b> girar parada · <b>F</b> ação</span><span><b>1–9</b> hotbar</span>';
document.querySelector('#world-switch').onclick=()=>{location.search=worldModeSearch(location.search,'classico');};
document.querySelector('#loading').textContent='Montando o mundo de blocos…';

export const touch=createTouchControls();
export const scene=new THREE.Scene();
scene.background=new THREE.Color('#9abbb1');scene.fog=new THREE.Fog('#9abbb1',105,150);
export const camera=new THREE.OrthographicCamera();
export let renderer;
try{renderer=new THREE.WebGLRenderer({antialias:true});}
catch{const e=document.querySelector('#error');e.hidden=false;e.textContent='Este protótipo precisa de WebGL. Abra em um navegador com aceleração gráfica.';throw new Error('WebGL indisponível');}
renderer.setPixelRatio(1);
document.body.prepend(renderer.domElement);touch.attachCanvas(renderer.domElement);renderer.domElement.setAttribute('aria-label','Mundo8bit voxel 3D: área do jogo');
function viewerStorage(){try{return window.localStorage;}catch{return null;}}
export const pixelArt=createPixelArt(renderer,{enabled:readPixelArtPreference(location.search,viewerStorage()),pixelsPerUnit:VOXEL_PIXELS_PER_UNIT,dither:0});

export const atlas=new THREE.DataTexture(buildVoxelAtlas(),ATLAS_SIZE,ATLAS_SIZE);
atlas.colorSpace=THREE.SRGBColorSpace;atlas.magFilter=atlas.minFilter=THREE.NearestFilter;atlas.generateMipmaps=false;atlas.needsUpdate=true;
const solidMaterial=new THREE.MeshBasicMaterial({map:atlas,vertexColors:true,fog:true});
const waterMaterial=new THREE.MeshBasicMaterial({map:atlas,vertexColors:true,transparent:true,opacity:.78,depthWrite:false,fog:true});
export const collision=new CollisionWorld({height:voxelGround});
const MOVE={maxStepHeight:1.01,minGround:-5}; // Sobe/desce um bloco por vez; água (−10) bloqueia.
export const entities=createEntityManager({scene,collision});

function geometryFrom(buffers){
 const g=new THREE.BufferGeometry();
 g.setAttribute('position',new THREE.Float32BufferAttribute(buffers.position,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(buffers.uv,2));
 g.setAttribute('color',new THREE.Float32BufferAttribute(buffers.color,3));g.setIndex(buffers.index);g.computeBoundingSphere();return g;
}
export const chunks=new Map();let showGrid=false;
function makeChunk(cx,cz){
 const data=buildChunkData(cx,cz),group=new THREE.Group();group.name=`chunk ${cx},${cz}`;
 const solid=new THREE.Mesh(geometryFrom(data.solid),solidMaterial);group.add(solid);
 const water=data.water.index.length?new THREE.Mesh(geometryFrom(data.water),waterMaterial):null;if(water){water.renderOrder=1;group.add(water);}
 const x=cx*CHUNK_SIZE,z=cz*CHUNK_SIZE,y=4.05;
 const border=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints([[x,z],[x+12,z],[x+12,z+12],[x,z+12]].map(([px,pz])=>new THREE.Vector3(px,y,pz))),new THREE.LineBasicMaterial({color:0xffe6a0}));
 border.visible=showGrid;group.add(border);
 collision.addChunk(cx,cz,data.colliders);scene.add(group);entities.spawnChunk(cx,cz);
 return {group,solid,water,border,cx,cz,counts:data.counts};
}
function disposeChunk(c){scene.remove(c.group);collision.removeChunk(c.cx,c.cz);entities.removeChunk(c.cx,c.cz);c.solid.geometry.dispose();c.water?.geometry.dispose();c.border.geometry.dispose();c.border.material.dispose();}
function stream(){
 const wanted=new Set();
 for(const [x,z] of wantedChunks(player.position.x,player.position.z,VOXEL_CHUNK_RADIUS)){const key=`${x},${z}`;wanted.add(key);if(!chunks.has(key))chunks.set(key,makeChunk(x,z));}
 for(const [key,c] of chunks)if(!wanted.has(key)){disposeChunk(c);chunks.delete(key);}
}

export const player=new THREE.Group();player.name='Iara voxel';scene.add(player);
export const iara=buildBoxModel(IARA,{silhouette:true});player.add(iara);
export const START=voxelStart();player.position.set(START.x,voxelGround(START.x,START.z),START.z);
collision.setDynamic('player',{type:'circle',x:START.x,z:START.z,radius:PLAYER_RADIUS,kind:'player'});
export function movePlayer(dx,dz){
 if(touch.paused)return {x:player.position.x,z:player.position.z,distance:0,blocked:true};
 const p=collision.move(player.position,dx,dz,PLAYER_RADIUS,{ignoreId:'player',...MOVE});
 player.position.x=p.x;player.position.z=p.z;collision.setDynamic('player',{type:'circle',x:p.x,z:p.z,radius:PLAYER_RADIUS,kind:'player'});return p;
}

const keys=new Set();let lastChunk='',time=performance.now(),limbSwing=0,swingAmount=0,elapsed=0,cameraGround=null,lastCamera=null,layout=null;
// Direção da personagem (yaw). Andando, segue o movimento; parada, o joystick de ação (ou Q/E) a gira no lugar.
export const facing={yaw:0,moving:false};
export const runRule=createRunRule();
export const actionState={swing:0,count:0,last:null};
export function currentTarget(){return actionTarget(player.position.x,player.position.z,facing.yaw,voxelGround(player.position.x,player.position.z));}
export const hotbar=createHotbar(document.querySelector('#game'));
// Por enquanto só a mão e sem efeito no mundo: registra o cubo da frente e balança o braço como resposta.
export function performAction(){
 if(touch.paused)return null;const target=currentTarget();actionState.swing=1;actionState.count++;actionState.last={item:hotbar.item?.id??null,target};
 window.dispatchEvent(new CustomEvent('voxel-acao',{detail:actionState.last}));return actionState.last;
}
export function aimFacing(screenX,screenDown){if(facing.moving)return false;const d=voxelScreenMovement(screenX,screenDown);facing.yaw=Math.atan2(d.x,d.z);return true;}
export const actionStick=createActionStick(document.querySelector('#touch-controls'),{onAim:aimFacing,onAction:performAction,isPaused:()=>touch.paused});
function toggleGrid(){showGrid=!showGrid;document.body.classList.toggle('show-stats',showGrid);for(const c of chunks.values())c.border.visible=showGrid;document.querySelector('#grid').textContent=showGrid?'G · Ocultar chunks':'G · Ver chunks';}
function updatePixelArtUI(){const b=document.querySelector('#pixel-art');b.textContent=pixelArt.enabled?'P · Desligar pixel art':'P · Ligar pixel art';b.setAttribute('aria-pressed',String(pixelArt.enabled));document.body.classList.toggle('pixel-art',pixelArt.enabled);}
export function setPixelArt(enabled){pixelArt.enabled=Boolean(enabled);storePixelArtPreference(pixelArt.enabled,viewerStorage());updatePixelArtUI();resize();}
document.querySelector('#grid').onclick=toggleGrid;document.querySelector('#pixel-art').onclick=()=>setPixelArt(!pixelArt.enabled);
document.querySelector('#home').onclick=()=>{player.position.set(START.x,voxelGround(START.x,START.z),START.z);collision.setDynamic('player',{type:'circle',x:START.x,z:START.z,radius:PLAYER_RADIUS,kind:'player'});lastChunk='';};
window.addEventListener('keydown',e=>{
 if(e.target instanceof Element&&e.target.closest('button')&&[' ','Enter'].includes(e.key))return;if(touch.paused){keys.clear();return;}
 if(['+','=','-','_'].includes(e.key)){if(!e.repeat)touch.setZoom(e.key==='-'||e.key==='_'?touch.zoom/1.15:touch.zoom*1.15);return;}
 if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();keys.add(e.key.toLowerCase());
 const k=e.key.toLowerCase();
 if(k==='g'&&!e.repeat)toggleGrid();if(k==='p'&&!e.repeat)setPixelArt(!pixelArt.enabled);
 if(/^[1-9]$/.test(k)&&!e.repeat)hotbar.select(Number(k)-1);
 if((k==='q'||k==='e')&&!facing.moving)facing.yaw+=(k==='q'?1:-1)*Math.PI/4;
 if((k==='f'||k===' ')&&!e.repeat)performAction();
});
window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));window.addEventListener('blur',()=>keys.clear());

function resize(){
 layout=voxelCameraLayout(innerWidth,innerHeight,touch.mobile);touch.setZoomLimits(layout.minZoom,layout.maxZoom);
 camera.left=-layout.halfHeight*layout.aspect;camera.right=layout.halfHeight*layout.aspect;camera.top=layout.halfHeight;camera.bottom=-layout.halfHeight;camera.near=.1;camera.far=240;
 camera.zoom=Math.max(layout.minZoom,Math.min(layout.maxZoom,camera.zoom));camera.updateProjectionMatrix();
 const ratio=pixelArt.enabled?1:Math.min(window.devicePixelRatio||1,1.5,Math.sqrt(2000000/(innerWidth*innerHeight)));
 renderer.setPixelRatio(ratio);if(pixelArt.enabled)pixelArt.resize(innerWidth,innerHeight,{maxHalfHeight:layout.halfHeight/layout.minZoom});
 renderer.setSize(innerWidth,innerHeight,false);renderer.domElement.style.width='100%';renderer.domElement.style.height='100%';
}
window.addEventListener('resize',resize);matchMedia('(any-pointer:coarse)').addEventListener('change',resize);document.addEventListener('fullscreenchange',resize);document.addEventListener('webkitfullscreenchange',resize);
updatePixelArtUI();resize();stream();export const npc=entities.spawnNpc(START);document.querySelector('#loading').hidden=true;

function frame(now){
 // dt limitado para a física; a regra dos 3 s conta tempo real (aparelhos lentos não atrasam a corrida).
 const realDt=Math.min((now-time)/1000,.25),dt=Math.min(realDt,.05);time=now;if(touch.paused){keys.clear();requestAnimationFrame(frame);return;}
 if(Math.abs(camera.zoom-touch.zoom)>.0001){camera.zoom+=(touch.zoom-camera.zoom)*(1-Math.exp(-12*dt));camera.updateProjectionMatrix();}
 let x=Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft'));
 let down=Number(keys.has('s')||keys.has('arrowdown'))-Number(keys.has('w')||keys.has('arrowup'));
 x+=touch.x;down+=touch.z;
 elapsed+=dt;let walked=0;const length=Math.hypot(x,down);
 // Corrida: 3 s com o joystick/W para cima (Shift continua como atalho no teclado).
 const running=runRule.update(x,down,realDt)||keys.has('shift');
 facing.moving=length>.05;
 if(facing.moving){const l=Math.max(1,length);x/=l;down/=l;const speed=running?8:4,d=voxelScreenMovement(x,down);walked=movePlayer(d.x*speed*dt,d.z*speed*dt).distance;facing.yaw=Math.atan2(d.x,d.z);}
 player.rotation.y+=Math.atan2(Math.sin(facing.yaw-player.rotation.y),Math.cos(facing.yaw-player.rotation.y))*Math.min(1,dt*16);
 limbSwing+=walked*6;swingAmount+=(Math.min(1,walked/Math.max(dt,.001)/4)-swingAmount)*Math.min(1,dt*12);
 actionState.swing=Math.max(0,actionState.swing-dt/.3);
 animateEntity(iara,'humanoid',{limbSwing,amount:swingAmount,time:elapsed,swing:actionState.swing>0?1-actionState.swing:0});
 // Sobe/desce degraus de bloco com transição curta, sem teleporte visual.
 const ground=voxelGround(player.position.x,player.position.z);player.position.y+=(ground-player.position.y)*(1-Math.exp(-18*dt));
 const chunk=chunkAt(player.position.x,player.position.z).join(',');if(chunk!==lastChunk){stream();lastChunk=chunk;}
 const teleported=!lastCamera||Math.hypot(player.position.x-lastCamera.x,player.position.z-lastCamera.z)>8;
 cameraGround=teleported?ground:cameraGround+(ground-cameraGround)*(1-Math.exp(-6*dt));
 const pose=voxelCameraPose(player.position.x,cameraGround,player.position.z);
 camera.position.set(pose.position.x,pose.position.y,pose.position.z);camera.lookAt(pose.target.x,pose.target.y,pose.target.z);lastCamera={x:player.position.x,z:player.position.z};
 entities.update(dt,elapsed,player.position);
 document.querySelector('#stats').textContent=`VOXEL 3D / SEMENTE ${SEED} / CHUNK ${chunk} / ${chunks.size} ATIVOS / X ${player.position.x.toFixed(0)} Z ${player.position.z.toFixed(0)}`;
 if(pixelArt.enabled)pixelArt.render(scene,camera);else renderer.render(scene,camera);requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
