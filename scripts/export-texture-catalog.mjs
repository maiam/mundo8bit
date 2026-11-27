// Referências fiéis ao runtime; não modifica a arte nem o carregamento do jogo.
import {writeFileSync,mkdirSync,readFileSync} from 'node:fs';
import {deflateSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {buildVoxelAtlas,ATLAS_SIZE,TILE} from '../src/voxel/voxel-atlas.js';
import {paintSkin} from '../src/voxel/entities/box-model.js';
import {ENTITY_DEFS} from '../src/voxel/entities/entity-defs.js';
const OUT='assets/voxel/texturas/catalogo-v01';
const crcTable=Array.from({length:256},(_,n)=>{let c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;return c>>>0;});
const crc=b=>{let c=~0;for(const x of b)c=crcTable[(c^x)&255]^(c>>>8);return (~c)>>>0;};
function png(w,h,rgba){
 const chunk=(type,data)=>{const t=Buffer.from(type),len=Buffer.alloc(4),c=Buffer.alloc(4);len.writeUInt32BE(data.length);c.writeUInt32BE(crc(Buffer.concat([t,data])));return Buffer.concat([len,t,data,c]);};
 const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(w,0);ihdr.writeUInt32BE(h,4);ihdr[8]=8;ihdr[9]=6;
 const raw=Buffer.alloc((w*4+1)*h);for(let y=0;y<h;y++){raw[y*(w*4+1)]=0;Buffer.from(rgba.buffer,rgba.byteOffset+y*w*4,w*4).copy(raw,y*(w*4+1)+1);}
 return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ihdr),chunk('IDAT',deflateSync(raw)),chunk('IEND',Buffer.alloc(0))]);
}

for(const dir of ['blocos','skins'])mkdirSync(`${OUT}/${dir}`,{recursive:true});
const entries=[],atlas=buildVoxelAtlas();
function save(path,w,h,data,meta){const bytes=png(w,h,data);writeFileSync(path,bytes);entries.push({...meta,path,width:w,height:h,sha256:createHash('sha256').update(bytes).digest('hex'),status:'em uso — gerada por código',delivery:'referência exportada; runtime usa o gerador'});}
save(`${OUT}/atlas-blocos-32.png`,ATLAS_SIZE,ATLAS_SIZE,atlas,{id:'atlas',source:'src/voxel/voxel-atlas.js'});
for(const [name,index] of Object.entries(TILE)){
 const data=new Uint8Array(256),ox=index%4*8,oy=Math.floor(index/4)*8;
 for(let y=0;y<8;y++)data.set(atlas.subarray(((oy+y)*ATLAS_SIZE+ox)*4,((oy+y)*ATLAS_SIZE+ox+8)*4),y*32);
 save(`${OUT}/blocos/${String(index).padStart(2,'0')}-${name}.png`,8,8,data,{id:name,tile:index,source:'src/voxel/voxel-atlas.js'});
}
for(const d of ENTITY_DEFS)save(`${OUT}/skins/${d.id}.png`,...d.texture,paintSkin(d),{id:d.id,name:d.name,source:'src/voxel/entities/entity-defs.js',uvGuide:`assets/voxel/skins/modelos/${d.id}-guia-uv.png`});
const sources=['src/voxel/voxel-atlas.js','src/voxel/entities/entity-defs.js','src/voxel/entities/box-model.js'].map(path=>({path,sha256:createHash('sha256').update(readFileSync(path)).digest('hex')}));
writeFileSync(`${OUT}/manifest.json`,JSON.stringify({version:1,density:'8 px/bloco',sources,entries},null,2)+'\n');
console.log(`${entries.length} PNGs exportados para ${OUT}`);
