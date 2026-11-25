// Box model (estilo Minecraft) a 8 px por bloco: hierarquia de paralelepípedos com pivô na articulação,
// skin PNG com "box UV" padrão e camada externa inflada. Vale para jogadora, NPCs e mobs (docs/voxel-entidades.md).
import * as THREE from 'three';
import {createBuffers,pushFace,FACE_NAMES} from '../voxel-terrain.js';
export const PX=1/8; // 1 pixel de skin = 1/8 de bloco.
// Partes por modelo em WeakMap (userData é serializado por clone(); não guardar referências ali).
const PARTS=new WeakMap();
export function partsOf(model){
 if(!PARTS.has(model)){const parts={root:model};model.traverse(n=>{if(n.isGroup&&n!==model)parts[n.name]=n;});PARTS.set(model,parts);}
 return PARTS.get(model);
}

// Box UV do Minecraft para uma caixa w×h×d (px) com origem (u,v):
// linha de cima: topo, base; linha de baixo: direita(−X), frente(+Z), esquerda(+X), costas(−Z).
export function boxUV([u,v],[w,h,d]){
 return {py:[u+d,v,w,d],ny:[u+d+w,v,w,d],nx:[u,v+d,d,h],pz:[u+d,v+d,w,h],px:[u+d+w,v+d,d,h],nz:[u+2*d+w,v+d,w,h]};
}
export function uvRegion([u,v],[w,h,d]){return [u,v,2*(w+d),d+h];}

// Pinta a skin provisória (até chegar o PNG) direto no layout box UV.
// face: letra única (cor sólida) ou linhas de letras de cima para baixo, vistas de fora; '.' = transparente.
export function paintSkin(def){
 const [W,H]=def.texture,data=new Uint8Array(W*H*4),rgb=c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16));
 for(const part of def.parts){
  const rects=boxUV(part.uv,part.size);
  for(const face of FACE_NAMES){
   const [x,y,w,h]=rects[face],spec=part.paint?.[face]??part.paint?.all??part.paint?.fill;
   if(spec==null)continue;
   const rows=typeof spec==='string'&&spec.length===1?Array.from({length:h},()=>spec.repeat(w)):spec;
   if(rows.length!==h||rows.some(r=>r.length!==w))throw Error(`${def.id}.${part.name}.${face}: esperado ${w}×${h}`);
   rows.forEach((line,ry)=>[...line].forEach((letter,rx)=>{
    if(letter==='.')return;const color=def.palette[letter];if(!color)throw Error(`${def.id}: cor ${letter} ausente`);
    data.set([...rgb(color),255],((y+ry)*W+x+rx)*4);
   }));
  }
 }
 return data;
}

function faceRect(rect,[W,H]){const [x,y,w,h]=rect;return {u0:x/W,v0:y/H,u1:(x+w)/W,v1:(y+h)/H};}
function boxGeometry(part,texture){
 const b=createBuffers(),[ox,oy,oz]=part.offset,[w,h,d]=part.size,g=part.inflate??0,rects=boxUV(part.uv,part.size);
 const min={x:(ox-g)*PX,y:(oy-g)*PX,z:(oz-g)*PX},max={x:(ox+w+g)*PX,y:(oy+h+g)*PX,z:(oz+d+g)*PX};
 for(const face of FACE_NAMES)pushFace(b,face,min,max,faceRect(rects[face],texture));
 const geometry=new THREE.BufferGeometry();
 geometry.setAttribute('position',new THREE.Float32BufferAttribute(b.position,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(b.uv,2));
 geometry.setAttribute('color',new THREE.Float32BufferAttribute(b.color,3));geometry.setIndex(b.index);return geometry;
}

export function createSkinTexture(def,image=null){
 // PNG do usuário (def.skin) tem prioridade; enquanto for null, usa a skin provisória pintada por regra.
 const texture=image?new THREE.Texture(image):def.skin?new THREE.TextureLoader().load(def.skin):new THREE.DataTexture(paintSkin(def),def.texture[0],def.texture[1]);
 texture.colorSpace=THREE.SRGBColorSpace;texture.magFilter=texture.minFilter=THREE.NearestFilter;texture.generateMipmaps=false;texture.flipY=false;texture.needsUpdate=true;
 return texture;
}

// Monta a hierarquia: cada parte é um grupo posicionado no pivô (px, relativo ao pai); a malha é deslocada
// por `offset` para que a rotação aconteça na junta. Opcional: silhueta visível só quando o cenário encobre.
export function buildBoxModel(def,{texture=createSkinTexture(def),silhouette=false}={}){
 const material=new THREE.MeshBasicMaterial({map:texture,vertexColors:true,alphaTest:.5,fog:true});
 const ghost=silhouette?new THREE.MeshBasicMaterial({color:'#e9d9a6',depthFunc:THREE.GreaterDepth,depthWrite:false,fog:false}):null;
 const root=new THREE.Group();root.name=def.id;const parts={root};
 for(const part of def.parts){
  const pivot=parts[part.name]??new THREE.Group();pivot.name=part.name;pivot.position.set(...part.pivot.map(v=>v*PX));
  const mesh=new THREE.Mesh(boxGeometry(part,def.texture),material);mesh.name=`${part.name}-malha`;mesh.renderOrder=silhouette?2:0;
  if(part.overlay){const target=parts[part.overlay];mesh.position.copy(pivot.position).sub(target.position);target.add(mesh);continue;}
  pivot.add(mesh);
  // Ordem: cenário (0) → silhueta (1) → personagem (2); camadas externas não geram silhueta própria.
  if(ghost){const g=new THREE.Mesh(mesh.geometry,ghost);g.name='silhueta';g.renderOrder=1;pivot.add(g);}
  (parts[part.parent]??root).add(pivot);parts[part.name]=pivot;
 }
 PARTS.set(root,parts);return root;
}
export function modelHeight(def){
 // Altura do topo da parte mais alta (pivôs encadeados), sem camadas externas.
 const top=new Map();let max=0;
 for(const part of def.parts){if(part.overlay)continue;const base=(top.get(part.parent)??0)+part.pivot[1];top.set(part.name,base);max=Math.max(max,(base+part.offset[1]+part.size[1])*PX);}
 return max;
}
