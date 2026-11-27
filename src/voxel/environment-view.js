import * as THREE from 'three';
import {smooth} from './environment.js';
import {natureAt} from '../nature.js';
import {columnAt,treeAt,treeBlocks,WATER_SURFACE} from './voxel-terrain.js';

// Superfície mais alta na coluna: chão/água ou peças de copa/tronco dos modelos atuais.
// Árvores de células vizinhas podem cobrir a célula consultada (inclusive entre chunks).
export function rainRoofAt(x,z){
 x=Math.floor(x);z=Math.floor(z);const c=columnAt(x,z);let roof=c.water?WATER_SURFACE:c.top;
 if(!c.water&&!treeAt(x,z)&&natureAt(x,z).some(i=>i.kind==='rock'))roof=Math.max(roof,c.top+1);
 for(let dx=-2;dx<=2;dx++)for(let dz=-2;dz<=2;dz++){
  const t=treeAt(x+dx,z+dz);if(!t)continue;
  for(const b of treeBlocks(t))if(b.x===x&&b.z===z)roof=Math.max(roof,b.y+1);
 }
 return roof;
}
const KEYS=[
 [0,'#9abbb1','#ffffff'],[600,'#9abbb1','#ffffff'],[630,'#c59c93','#ffe0c1'],
 [660,'#657d9c','#6989bf'],[1140,'#657d9c','#6989bf'],[1170,'#c59c93','#ffe0c1'],[1200,'#9abbb1','#ffffff'],
].map(([t,sky,tint])=>[t,new THREE.Color(sky),new THREE.Color(tint)]);
export const MAX_RAIN_DROPS=320;
export function createEnvironmentView(scene){
 const materials=new Set(),roofCache=new Map(),sky=new THREE.Color(),tint=new THREE.Color(),cloudSky=new THREE.Color('#8f9fa9');
 const positions=new Float32Array(MAX_RAIN_DROPS*6),geometry=new THREE.BufferGeometry();
 geometry.setAttribute('position',new THREE.BufferAttribute(positions,3).setUsage(THREE.DynamicDrawUsage));
 const material=new THREE.LineBasicMaterial({color:'#bbd6ea',transparent:true,opacity:0,depthWrite:false,fog:true});
 const rain=new THREE.LineSegments(geometry,material);rain.name='chuva-leve';rain.frustumCulled=false;rain.visible=false;scene.add(rain);
 function refreshMaterials(){materials.clear();scene.traverse(n=>{if(n.isMesh)for(const m of Array.isArray(n.material)?n.material:[n.material])if(m?.map&&m.color)materials.add(m);});}
 function roof(x,z){const key=`${Math.floor(x)},${Math.floor(z)}`;if(!roofCache.has(key)){if(roofCache.size>4096)roofCache.clear();roofCache.set(key,rainRoofAt(x,z));}return roofCache.get(key);}
 const hash=n=>{const h=Math.sin(n*127.1+31.7)*43758.5453;return h-Math.floor(h);};
 function update(state,player){
  let k=0;while(k<KEYS.length-2&&state.time>=KEYS[k+1][0])k++;
  const a=KEYS[k],b=KEYS[k+1],u=smooth((state.time-a[0])/(b[0]-a[0]));
  sky.copy(a[1]).lerp(b[1],u);tint.copy(a[2]).lerp(b[2],u);
  // Nebulosidade atenua sem multiplicar a noite até apagar a personagem.
  sky.lerp(cloudSky,.28*state.cloud);tint.multiplyScalar(1-.08*state.cloud);
  scene.background.copy(sky);scene.fog?.color.copy(sky);for(const m of materials)m.color.copy(tint);
  const count=Math.floor(MAX_RAIN_DROPS*state.rain);rain.visible=count>0;material.opacity=.65*state.rain;
  geometry.setDrawRange(0,count*2);
  for(let i=0;i<count;i++){
   const x=Math.floor(player.x)+hash(i*3+1)*48-24,z=Math.floor(player.z)+hash(i*3+2)*48-24;
   const floor=roof(x,z),top=Math.max(player.y+16,floor+10),span=top-floor;
   const y=top-((state.seconds*9+hash(i*3+3)*span)%span);
   // Recorta a gota no teto: nunca desenhar segmento abaixo da copa/chão/água.
   positions.set([x,y,z,x,Math.max(floor,y-.45),z],i*6);
  }
  geometry.attributes.position.needsUpdate=true;
 }
 return {rain,refreshMaterials,update,dispose(){scene.remove(rain);geometry.dispose();material.dispose();materials.clear();roofCache.clear();}};
}
