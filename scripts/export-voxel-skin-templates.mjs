// Exporta, para cada entidade voxel, a skin provisória e um guia de UV (box UV, 8 px por bloco) em PNG,
// para o usuário pintar as skins definitivas no mesmo layout. Uso: node scripts/export-voxel-skin-templates.mjs
import {writeFileSync,mkdirSync} from 'node:fs';
import {deflateSync} from 'node:zlib';
import {ENTITY_DEFS} from '../src/voxel/entities/entity-defs.js';
import {paintSkin,boxUV} from '../src/voxel/entities/box-model.js';
const OUT='assets/voxel/skins/modelos';
const crcTable=Array.from({length:256},(_,n)=>{let c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;return c>>>0;});
const crc=b=>{let c=~0;for(const x of b)c=crcTable[(c^x)&255]^(c>>>8);return (~c)>>>0;};
function png(w,h,rgba){
 const chunk=(type,data)=>{const t=Buffer.from(type),len=Buffer.alloc(4),c=Buffer.alloc(4);len.writeUInt32BE(data.length);c.writeUInt32BE(crc(Buffer.concat([t,data])));return Buffer.concat([len,t,data,c]);};
 const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(w,0);ihdr.writeUInt32BE(h,4);ihdr[8]=8;ihdr[9]=6;
 const raw=Buffer.alloc((w*4+1)*h);for(let y=0;y<h;y++){raw[y*(w*4+1)]=0;Buffer.from(rgba.buffer,rgba.byteOffset+y*w*4,w*4).copy(raw,y*(w*4+1)+1);}
 return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ihdr),chunk('IDAT',deflateSync(raw)),chunk('IEND',Buffer.alloc(0))]);
}
// Cores do guia por face (mesma convenção do Minecraft): topo, base, direita, frente, esquerda, costas.
const FACE_COLORS={py:[240,220,90],ny:[150,130,60],nx:[90,160,230],pz:[230,90,90],px:[90,200,120],nz:[170,110,210]};
mkdirSync(OUT,{recursive:true});const index=[];
for(const def of ENTITY_DEFS){
 const [W,H]=def.texture,guide=new Uint8Array(W*H*4);
 for(const part of def.parts)for(const [face,[x,y,w,h]] of Object.entries(boxUV(part.uv,part.size)))
  for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++){const edge=xx===x||yy===y||xx===x+w-1||yy===y+h-1,c=FACE_COLORS[face].map(v=>edge?v*.65:v);guide.set([...c,255],(yy*W+xx)*4);}
 writeFileSync(`${OUT}/${def.id}-provisoria.png`,png(W,H,paintSkin(def)));writeFileSync(`${OUT}/${def.id}-guia-uv.png`,png(W,H,guide));
 index.push({id:def.id,name:def.name,size:`${W}×${H}`,parts:def.parts.map(p=>({name:p.name,size:p.size,uv:p.uv,...(p.overlay?{overlay:p.overlay,inflate:p.inflate}:{})}))});
}
writeFileSync(`${OUT}/modelos.json`,JSON.stringify(index,null,1)+'\n');console.log(index.map(i=>`${i.id} ${i.size}`).join('\n'));
