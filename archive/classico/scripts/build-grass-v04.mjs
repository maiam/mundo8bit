import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {connectCDP} from './cdp.mjs';
const id='superficie-grama-clara-v04';
if(existsSync(`assets/blockbench/${id}.bbmodel`)&&!process.argv.includes('--replace-generated'))throw Error('v04 já existe. Preserve a versão ou regenere explicitamente.');
const image='data:image/png;base64,'+readFileSync('assets/textures/source/grama-clara-v04-gerada.png').toString('base64');
const c=await connectCDP(9333,t=>t.url.includes('app.asar/index.html'));
try{
 const result=await c.evaluate(`(async()=>{
  if(Project)await Project.close(true);newProject(Formats.free);Project.name='Grama clara — pintura v04';Project.texture_width=Project.texture_height=1024;
  const image=new Image();image.src=${JSON.stringify(image)};await image.decode();
  const blank=document.createElement('canvas');blank.width=blank.height=1024;
  const texture=new Texture({name:'grama-clara-painted-v04.png'}).fromDataURL(blank.toDataURL()).add(false);await texture.img.decode();
  texture.edit(canvas=>{canvas.width=canvas.height=1024;const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(image,0,0,1024,1024);},{edit_name:'Importar pintura de grama aprovada como referência'});await texture.img.decode();
  new Mesh({name:'amostra-grama',vertices:{a:[0,0,0],b:[0,0,16],c:[16,0,16],d:[16,0,0]},faces:{f1:{vertices:['a','b','c'],uv:{a:[0,0],b:[0,1024],c:[1024,1024]},texture:texture.uuid},f2:{vertices:['a','c','d'],uv:{a:[0,0],c:[1024,1024],d:[1024,0]},texture:texture.uuid}}}).init();
  Canvas.updateAll();Project.saved=true;const model=Codecs.project.compile(),gltf=await Codecs.gltf.compile({scale:16,embed_textures:true,animations:false,armature:false,encoding:'ascii'});
  return {model:typeof model==='string'?model:JSON.stringify(model),gltf,png:texture.canvas.toDataURL(),version:Blockbench.version};
 })()`);
 writeFileSync(`assets/blockbench/${id}.bbmodel`,result.model);writeFileSync(`public/assets/models/${id}.gltf`,result.gltf);
 for(const dir of ['assets/textures','public/assets'])writeFileSync(`${dir}/grama-clara-painted-v04.png`,Buffer.from(result.png.split(',')[1],'base64'));
 writeFileSync('public/assets/grass-manifest.json',JSON.stringify({version:4,tool:'Blockbench',toolVersion:result.version,method:'Imagem gerada a partir da referência, importada e redimensionada no editor; sem repintura procedural',texture:'grama-clara-painted-v04.png',textureSize:1024,reference:'docs/art/texturas-v01-aprovada.png',status:'em revisão artística',assets:[{id,name:'Grama clara v04',kind:'surface',triangles:2,source:`assets/blockbench/${id}.bbmodel`,url:`/assets/models/${id}.gltf`}]},null,2)+'\n');console.log('Grama v04: PNG 1024 + fonte Blockbench + glTF');
}finally{c.close();}
