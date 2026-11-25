// Terreno do mundo voxel: colunas de blocos sobre a mesma geração do mundo clássico
// (semente 808, heightAt, natureAt e espécies de árvores), sem nova fonte de verdade.
import {CHUNK_SIZE,hash,heightAt} from '../world.js';
import {natureAt} from '../nature.js';
import {FLOWER_IDS} from '../nature-catalog.js';
import {treeTypeAt,TREE_IDS} from '../trees.js';
import {TILE,tileUV} from './voxel-atlas.js';
import {isoScreen} from './voxel-settings.js';

export const WATER_TOP=-2; // Colunas com topo ≤ −2 ficam submersas.
export const WATER_SURFACE=-1.25;
export const BLOCKED_GROUND=-10; // Altura sentinela: água não é caminhável.
const SHADE={px:.8,nx:.8,pz:.64,nz:.64,py:1,ny:.5};
const FLOWER_COLORS=['#f4f1e6','#e2453c','#f2c230','#9a7fd1','#6f8fe0','#e8572f','#5f6fd6','#f6d64a','#7c55b8','#e5476e','#f5d23a','#f2f0e8','#d77ad1','#f4f4ee','#f2a3c0','#f08a3c','#a46ad8','#d9485f','#8fb2ea','#ef7fb0','#7a86d8','#f39a2e','#d6457c'];

export function columnAt(x,z){
 const top=Math.round(heightAt(x+.5,z+.5)),water=top<=WATER_TOP;
 const surface=water||top===WATER_TOP+1?TILE.sand:Math.sin(x*.24)+Math.cos(z*.18)>.2?TILE.grassLightTop:TILE.grassTop;
 return {top,water,surface};
}
// Altura do chão para física e posição da Iara: topo da coluna da célula; água bloqueia.
export function voxelGround(x,z){const c=columnAt(Math.floor(x),Math.floor(z));return c.water?BLOCKED_GROUND:c.top;}

function sideTile(column,y){
 if(column.surface===TILE.sand)return y>=column.top-3?TILE.sand:TILE.stone;
 if(y===column.top-1)return column.surface===TILE.grassLightTop?TILE.grassLightSide:TILE.grassSide;
 return y>=column.top-3?TILE.dirt:TILE.stone;
}

// --- Árvores em blocos (mesmas posições/espécies do mundo clássico) ---
const LEAVES={macieira:{tile:TILE.leavesApple,tint:1},carvalho:{tile:TILE.leaves,tint:.82},cerejeira:{tile:TILE.leavesPink,tint:1},betula:{tile:TILE.leaves,tint:1.08}};
const SHAPES={
 macieira:{trunk:3,layers:[[2,1,false],[3,1,false],[4,1,'plus']]},
 carvalho:{trunk:4,layers:[[2,2,true],[3,2,true],[4,1,false],[5,0,false]]},
 cerejeira:{trunk:3,layers:[[2,2,true],[3,2,true],[4,1,false]]},
 betula:{trunk:5,layers:[[3,1,false],[4,1,false],[5,1,'plus'],[6,0,false]]},
};
export function treeAt(x,z){
 const column=columnAt(x,z);
 if(hash(x,z)<=.975||column.water||column.top<WATER_TOP+1||Math.hypot(x,z)<=3)return null;
 return {type:treeTypeAt(x,z),x,z,base:column.top};
}
export function treeBlocks(tree){
 const id=TREE_IDS[tree.type],shape=SHAPES[id],leaves=LEAVES[id],blocks=[];
 for(let i=0;i<shape.trunk;i++)blocks.push({x:tree.x,y:tree.base+i,z:tree.z,kind:'log',side:id==='betula'?TILE.birchSide:TILE.logSide,cap:TILE.logTop,tint:1});
 for(const [dy,r,mode] of shape.layers)for(let dx=-r;dx<=r;dx++)for(let dz=-r;dz<=r;dz++){
  if(mode===true&&Math.abs(dx)===r&&Math.abs(dz)===r)continue; // Sem cantos.
  if(mode==='plus'&&dx&&dz)continue;
  if(!dx&&!dz&&dy<shape.trunk)continue; // Tronco ocupa o centro.
  blocks.push({x:tree.x+dx,y:tree.base+dy,z:tree.z+dz,kind:'leaves',side:leaves.tile,cap:leaves.tile,tint:leaves.tint});
 }
 return blocks;
}

// --- Construção de malha (dados puros) ---
export function createBuffers(){return {position:[],uv:[],color:[],index:[]};}
const FACES={
 px:(a,b)=>[[b.x,a.y,b.z],[b.x,a.y,a.z],[b.x,b.y,a.z],[b.x,b.y,b.z]],
 nx:(a,b)=>[[a.x,a.y,a.z],[a.x,a.y,b.z],[a.x,b.y,b.z],[a.x,b.y,a.z]],
 pz:(a,b)=>[[a.x,a.y,b.z],[b.x,a.y,b.z],[b.x,b.y,b.z],[a.x,b.y,b.z]],
 nz:(a,b)=>[[b.x,a.y,a.z],[a.x,a.y,a.z],[a.x,b.y,a.z],[b.x,b.y,a.z]],
 py:(a,b)=>[[a.x,b.y,b.z],[b.x,b.y,b.z],[b.x,b.y,a.z],[a.x,b.y,a.z]],
 ny:(a,b)=>[[a.x,a.y,a.z],[b.x,a.y,a.z],[b.x,a.y,b.z],[a.x,a.y,b.z]],
};
export const FACE_NAMES=Object.keys(FACES);
// Quadrilátero com textura: ordem BL, BR, TR, TL vista de fora (anti-horário = face frontal).
export function pushFace(buffers,face,min,max,uvRect,rgb=[1,1,1]){
 const base=buffers.position.length/3,s=SHADE[face];
 for(const p of FACES[face](min,max))buffers.position.push(...p);
 buffers.uv.push(uvRect.u0,uvRect.v1,uvRect.u1,uvRect.v1,uvRect.u1,uvRect.v0,uvRect.u0,uvRect.v0);
 for(let i=0;i<4;i++)buffers.color.push(rgb[0]*s,rgb[1]*s,rgb[2]*s);
 buffers.index.push(base,base+1,base+2,base,base+2,base+3);
}
const tint=(t,rgb=[1,1,1])=>rgb.map(c=>Math.min(1,c*t));
const hexRGB=c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16)/255);

export function buildChunkData(cx,cz){
 const solid=createBuffers(),water=createBuffers(),colliders=[],counts={trees:0,rocks:0,flowers:0};
 const ox=cx*CHUNK_SIZE,oz=cz*CHUNK_SIZE,white=tileUV(TILE.white);
 const neighbours=[['px',1,0],['nx',-1,0],['pz',0,1],['nz',0,-1]];
 for(let lx=0;lx<CHUNK_SIZE;lx++)for(let lz=0;lz<CHUNK_SIZE;lz++){
  const x=ox+lx,z=oz+lz,column=columnAt(x,z);
  pushFace(solid,'py',{x,y:column.top,z},{x:x+1,y:column.top,z:z+1},tileUV(column.surface));
  for(const [face,dx,dz] of neighbours){
   const n=columnAt(x+dx,z+dz);
   for(let y=n.top;y<column.top;y++)pushFace(solid,face,{x,y,z},{x:x+1,y:y+1,z:z+1},tileUV(sideTile(column,y)));
  }
  if(column.water)pushFace(water,'py',{x,y:WATER_SURFACE,z},{x:x+1,y:WATER_SURFACE,z:z+1},tileUV(TILE.water));
  const tree=treeAt(x,z);
  if(tree){
   counts.trees++;
   const blocks=treeBlocks(tree),occupied=new Set(blocks.map(b=>`${b.x},${b.y},${b.z}`));
   const step={px:[1,0,0],nx:[-1,0,0],pz:[0,0,1],nz:[0,0,-1],py:[0,1,0],ny:[0,-1,0]};
   for(const b of blocks)for(const face of FACE_NAMES){
    const [dx,dy,dz]=step[face];
    if(occupied.has(`${b.x+dx},${b.y+dy},${b.z+dz}`))continue;
    if(b.kind==='log'&&face==='ny')continue;
    pushFace(solid,face,{x:b.x,y:b.y,z:b.z},{x:b.x+1,y:b.y+1,z:b.z+1},tileUV(face==='py'||face==='ny'?b.cap:b.side),tint(b.tint));
   }
   colliders.push({type:'box',x:x+.5,z:z+.5,hx:.5,hz:.5,angle:0,kind:'tree'});
   continue;
  }
  for(const item of natureAt(x,z)){
   if(item.kind==='rock'){
    if(column.water)continue;
    counts.rocks++;
    for(const face of FACE_NAMES)if(face!=='ny')pushFace(solid,face,{x,y:column.top,z},{x:x+1,y:column.top+1,z:z+1},tileUV(TILE.cobble));
    colliders.push({type:'box',x:x+.5,z:z+.5,hx:.5,hz:.5,angle:0,kind:'rock'});
   }else{
    const type=FLOWER_IDS.indexOf(item.id.slice(5,-4)),lotus=FLOWER_IDS[type]==='lotus';
    const cell=columnAt(Math.floor(item.x),Math.floor(item.z));
    if(lotus!==cell.water)continue;
    counts.flowers++;
    const y=lotus?WATER_SURFACE+.01:cell.top,color=hexRGB(FLOWER_COLORS[type]??'#ffffff');
    if(lotus){
     boxFaces(solid,{x:item.x-.25,y,z:item.z-.25},{x:item.x+.25,y:y+.05,z:item.z+.25},white,hexRGB('#4f8a3a'));
     boxFaces(solid,{x:item.x-.1,y:y+.05,z:item.z-.1},{x:item.x+.1,y:y+.2,z:item.z+.1},white,color);
    }else{
     boxFaces(solid,{x:item.x-.04,y,z:item.z-.04},{x:item.x+.04,y:y+.3,z:item.z+.04},white,hexRGB('#3f7a30'));
     boxFaces(solid,{x:item.x-.11,y:y+.3,z:item.z-.11},{x:item.x+.11,y:y+.5,z:item.z+.11},white,color);
    }
   }
  }
 }
 return {solid,water,colliders,counts};
}
function boxFaces(buffers,min,max,uv,rgb){for(const face of FACE_NAMES)if(face!=='ny')pushFace(buffers,face,min,max,uv,rgb);}

// Uma copa/tronco encobre a personagem quando, na tela, o bloco cobre o retângulo dela e está mais perto da câmera.
export function treeHidesPoint(tree,x,z,ground){
 const feet=isoScreen(x,ground,z),head=isoScreen(x,ground+2,z);
 return treeBlocks(tree).some(b=>{const p=isoScreen(b.x+.5,b.y+.5,b.z+.5);return p.depth>feet.depth&&Math.abs(p.right-feet.right)<.75+.4&&p.up+.75>feet.up&&p.up-.75<head.up;});
}
// Ponto inicial determinístico perto da origem: chão seco, sem obstáculo e sem bloco de árvore encobrindo
// a Iara (câmera na diagonal +X/+Z), para a criança vê-la logo ao abrir.
export function voxelStart(){
 for(let r=0;r<20;r++)for(let x=-r;x<=r;x++)for(let z=-r;z<=r;z++){
  if(Math.max(Math.abs(x),Math.abs(z))!==r)continue;
  const c=columnAt(x,z);if(c.water||c.surface===TILE.sand||treeAt(x,z)||natureAt(x,z).some(i=>i.kind==='rock'))continue;
  let hidden=false;
  for(let dx=-2;dx<=14&&!hidden;dx++)for(let dz=-2;dz<=14&&!hidden;dz++){const t=treeAt(x+dx,z+dz);if(t&&treeHidesPoint(t,x+.5,z+.5,c.top))hidden=true;}
  if(!hidden)return {x:x+.5,z:z+.5};
 }
 return {x:.5,z:.5};
}
