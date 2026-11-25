// Modelos de cubos/paralelepípedos (estilo Minecraft) para o mundo voxel, a 8 px por bloco.
// Definidos como dados versionados; a pintura é uma grade de letras por face (pixel art por regra, não manual).
import * as THREE from 'three';
import {VOXEL_TEXELS} from './voxel-settings.js';
import {createBuffers,pushFace,FACE_NAMES} from './voxel-terrain.js';

// Iara v01 voxel — referência: docs/art/iara-conceito-v01-aprovado.png e docs/iara.md
// (cabelo curto, faixa amarela, colete verde, camisa clara, shorts terracota, botas e mochila).
export const IARA_VOXEL={
 id:'iara-voxel-v01',
 palette:{H:'#2a1b14',Y:'#f2c230',S:'#8d5a3b',E:'#16100c',V:'#3f7a3a',L:'#efe6d2',B:'#5a3a24',T:'#b5583a',K:'#3d281c',P:'#7a5232'},
 parts:[
  // name, pivot, box min/max relativos ao pivô, faces (letra única = cor sólida; linhas = pixels de cima para baixo)
  {name:'perna-esquerda',pivot:[.125,.75,0],min:[-.125,-.75,-.125],max:[.125,0,.125],faces:{all:['TT','TT','TT','SS','SS','KK'],py:'T',ny:'K'}},
  {name:'perna-direita',pivot:[-.125,.75,0],min:[-.125,-.75,-.125],max:[.125,0,.125],faces:{all:['TT','TT','TT','SS','SS','KK'],py:'T',ny:'K'}},
  {name:'tronco',pivot:[0,.75,0],min:[-.25,0,-.125],max:[.25,.75,.125],faces:{pz:['VLLV','VLLV','VLLV','VVVV','BBBB','TTTT'],nz:['VPPV','VPPV','VPPV','VPPV','BBBB','TTTT'],px:['VV','VV','VV','VV','BB','TT'],nx:['VV','VV','VV','VV','BB','TT'],py:'V',ny:'T'}},
  {name:'braco-esquerdo',pivot:[.375,1.5,0],min:[-.125,-.75,-.125],max:[.125,0,.125],faces:{all:['LL','LL','SS','SS','SS','SS'],py:'L',ny:'S'}},
  {name:'braco-direito',pivot:[-.375,1.5,0],min:[-.125,-.75,-.125],max:[.125,0,.125],faces:{all:['LL','LL','SS','SS','SS','SS'],py:'L',ny:'S'}},
  {name:'cabeca',pivot:[0,1.5,0],min:[-.25,0,-.25],max:[.25,.5,.25],faces:{pz:['HHHH','YYYY','ESSE','SSSS'],nz:['HHHH','YYYY','HHHH','HHHH'],px:['HHHH','YYYY','SSSH','SSSH'],nx:['HHHH','YYYY','HSSS','HSSS'],py:'H',ny:'S'}},
 ],
};

const ATLAS=64;
function faceSize(part,face){
 const d=[0,1,2].map(i=>Math.round((part.max[i]-part.min[i])*VOXEL_TEXELS));
 return face==='px'||face==='nx'?[d[2],d[1]]:face==='py'||face==='ny'?[d[0],d[2]]:[d[0],d[1]];
}
function faceRows(part,face,[w,h]){
 const spec=part.faces[face]??part.faces.all;
 if(typeof spec==='string')return Array.from({length:h},()=>spec.repeat(w));
 if(spec.length!==h||spec.some(r=>r.length!==w))throw Error(`${part.name}.${face}: esperado ${w}×${h}`);
 return spec;
}
// Empacota as faces em linhas de uma textura 64×64; devolve pixels RGBA e retângulos UV.
export function packModel(model){
 const data=new Uint8Array(ATLAS*ATLAS*4),rects={};let x=0,y=0,row=0;
 const rgb=c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16));
 for(const part of model.parts)for(const face of FACE_NAMES){
  const size=faceSize(part,face),rows=faceRows(part,face,size);
  if(x+size[0]>ATLAS){x=0;y+=row;row=0;}
  if(y+size[1]>ATLAS)throw Error('Atlas do modelo cheio');
  rows.forEach((line,ry)=>[...line].forEach((letter,rx)=>{
   const color=model.palette[letter];if(!color)throw Error(`Cor ${letter} ausente`);
   const i=((y+ry)*ATLAS+x+rx)*4;data.set([...rgb(color),255],i);
  }));
  rects[`${part.name}.${face}`]={u0:x/ATLAS,v0:y/ATLAS,u1:(x+size[0])/ATLAS,v1:(y+size[1])/ATLAS};
  x+=size[0];row=Math.max(row,size[1]);
 }
 return {data,rects,size:ATLAS};
}
export function modelHeight(model){return Math.max(...model.parts.map(p=>p.pivot[1]+p.max[1]));}

// silhouette: na isometria, copas e blocos à frente escondem a personagem; a silhueta só aparece
// onde ela está encoberta (GreaterDepth), mantendo a Iara sempre localizável pela criança.
export function buildVoxelModel(model,{silhouette=false}={}){
 const packed=packModel(model),texture=new THREE.DataTexture(packed.data,packed.size,packed.size);
 texture.colorSpace=THREE.SRGBColorSpace;texture.magFilter=texture.minFilter=THREE.NearestFilter;texture.generateMipmaps=false;texture.needsUpdate=true;
 const material=new THREE.MeshBasicMaterial({map:texture,vertexColors:true,fog:true});
 // Ordem: cenário (0) → silhueta (1) → personagem (2). Opaca, para não ir à fila de transparentes;
 // assim só o cenário aciona a silhueta e o próprio corpo não a revela.
 if(silhouette)silhouette=new THREE.MeshBasicMaterial({color:'#e9d9a6',depthFunc:THREE.GreaterDepth,depthWrite:false,fog:false});
 const group=new THREE.Group();group.name=model.id;
 for(const part of model.parts){
  const buffers=createBuffers(),[a,b]=[part.min,part.max].map(v=>({x:v[0],y:v[1],z:v[2]}));
  for(const face of FACE_NAMES)pushFace(buffers,face,a,b,packed.rects[`${part.name}.${face}`]);
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(buffers.position,3));
  geometry.setAttribute('uv',new THREE.Float32BufferAttribute(buffers.uv,2));
  geometry.setAttribute('color',new THREE.Float32BufferAttribute(buffers.color,3));
  geometry.setIndex(buffers.index);
  const pivot=new THREE.Group();pivot.name=part.name;pivot.position.set(...part.pivot);const mesh=new THREE.Mesh(geometry,material);mesh.renderOrder=silhouette?2:0;pivot.add(mesh);
  if(silhouette){const ghost=new THREE.Mesh(geometry,silhouette);ghost.name='silhueta';ghost.renderOrder=1;pivot.add(ghost);}
  group.add(pivot);
 }
 return group;
}
