// Atlas 32×32 com 16 texturas de 8×8 px para os blocos do mundo voxel.
// Pixel art gerada por regra determinística (paleta + ruído por coordenada); não é pintura manual.
import {VOXEL_TEXELS} from './voxel-settings.js';
export const ATLAS_TILES=4; // 4×4 blocos de textura.
export const ATLAS_SIZE=ATLAS_TILES*VOXEL_TEXELS;
export const TILE={grassTop:0,grassSide:1,dirt:2,stone:3,sand:4,water:5,logSide:6,logTop:7,birchSide:8,leaves:9,leavesPink:10,leavesApple:11,grassLightTop:12,grassLightSide:13,cobble:14,white:15};

const hex=c=>[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)];
const P={
 grass:['#4f7f34','#5d8f3b','#6b9d43','#7aab4b'],grassLight:['#7fa64a','#8db556','#9bc263','#aacd70'],
 dirt:['#6d4a2f','#7b5636','#89623e','#5f4029'],stone:['#6f726c','#7d817a','#8b8f87','#61645f'],
 sand:['#cbb27a','#d6be86','#e0c993','#bfa56e'],water:['#3d7f9a','#4a8faa','#5aa0b8','#367289'],
 bark:['#5b3b22','#6a4529','#7a5030','#4c311c'],ring:['#a77b4a','#8e6438','#b88b57','#6a4529'],
 birch:['#e6e2d6','#d8d3c4','#f2efe6','#2f2a26'],leaves:['#3f6f2d','#4b7d34','#588b3c','#33602a'],
 pink:['#e59bb5','#f0b2c6','#d6849f','#c46e8c'],apple:['#d8342c','#f05a46'],cobble:['#5f625d','#787c75','#8f938b','#4d504b'],
};
// Ruído inteiro estável por (tile, x, y).
function noise(t,x,y){let n=(t*374761393+x*668265263+y*2147483647)>>>0;n=Math.imul(n^(n>>>13),1274126177)>>>0;return ((n^(n>>>16))>>>0)/4294967296;}
const pick=(palette,t,x,y)=>palette[Math.floor(noise(t,x,y)*palette.length)];

function texel(tile,x,y){
 const n=noise(tile,x,y);
 switch(tile){
  case TILE.grassTop:return pick(P.grass,tile,x,y);
  case TILE.grassLightTop:return pick(P.grassLight,tile,x,y);
  case TILE.grassSide:case TILE.grassLightSide:{
   const top=tile===TILE.grassSide?P.grass:P.grassLight,drip=noise(tile,x,0)<.45?3:2;
   return y<drip?pick(top,tile,x,y):pick(P.dirt,tile,x,y);
  }
  case TILE.dirt:return pick(P.dirt,tile,x,y);
  case TILE.stone:return pick(P.stone,tile,x,y);
  case TILE.sand:return pick(P.sand,tile,x,y);
  case TILE.water:return (x+y*2)%7===0?P.water[2]:pick(P.water.slice(0,2).concat(P.water[3]),tile,x,y);
  case TILE.logSide:return x===0||x===7?P.bark[3]:pick(P.bark.slice(0,3),tile,x>>1,y);
  case TILE.logTop:{const d=Math.max(Math.abs(x-3.5),Math.abs(y-3.5));return d>3?P.bark[1]:P.ring[Math.floor(d)%4];}
  case TILE.birchSide:return (y===2&&x>1&&x<5)||(y===5&&x>3)||(y===7&&x<3)?P.birch[3]:pick(P.birch.slice(0,3),tile,x,y);
  case TILE.leaves:return n<.12?'#2a4f22':pick(P.leaves,tile,x,y);
  case TILE.leavesPink:return n<.1?'#ffffff':pick(P.pink,tile,x,y);
  case TILE.leavesApple:return (x%4===1&&y%4===1)||(x%4===3&&y%4===3&&x!==y)?P.apple[noise(tile,y,x)<.5?0:1]:pick(P.leaves,tile,x,y);
  case TILE.cobble:return x%4===0||(y%3===0&&x%2)?P.cobble[3]:pick(P.cobble.slice(0,3),tile,x,y);
  default:return '#ffffff';
 }
}
export function buildVoxelAtlas(){
 const data=new Uint8Array(ATLAS_SIZE*ATLAS_SIZE*4);
 for(let tile=0;tile<ATLAS_TILES*ATLAS_TILES;tile++){
  const ox=(tile%ATLAS_TILES)*VOXEL_TEXELS,oy=Math.floor(tile/ATLAS_TILES)*VOXEL_TEXELS;
  for(let y=0;y<VOXEL_TEXELS;y++)for(let x=0;x<VOXEL_TEXELS;x++){
   const [r,g,b]=hex(texel(tile,x,y)),i=((oy+y)*ATLAS_SIZE+ox+x)*4;
   data[i]=r;data[i+1]=g;data[i+2]=b;data[i+3]=255;
  }
 }
 return data;
}
// UV do tile (y para baixo no atlas; DataTexture usa flipY=false, então v cresce com a linha).
export function tileUV(tile){
 const s=1/ATLAS_TILES,u=(tile%ATLAS_TILES)*s,v=Math.floor(tile/ATLAS_TILES)*s;
 return {u0:u,v0:v,u1:u+s,v1:v+s};
}
