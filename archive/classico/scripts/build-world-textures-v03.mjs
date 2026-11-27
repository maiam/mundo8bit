import {existsSync,mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {connectCDP} from './cdp.mjs';
import {assetInputs} from './asset-inputs.mjs';
import {natureInputs} from './nature-inputs.mjs';
import {WORLD_PALETTE,paintWorldAtlas} from './paint-world-v03.mjs';
if(existsSync('assets/textures/mundo8bit-painted-v03.png')&&!process.argv.includes('--replace-generated'))throw Error('v03 já existe; crie nova versão ou regenere intencionalmente com --replace-generated');
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const c=await connectCDP(9333,t=>t.url.includes('app.asar/index.html'));
const treeMap={0:8,1:9,2:9,3:10,4:12,5:13};
const trees=assetInputs().filter(a=>a.kind==='tree').map(a=>({...a,id:a.id.replace('-v02','-v03'),parts:a.parts.map(p=>({...p,tiles:p.tiles.map(t=>treeMap[t]??8)}))}));
const rocks=natureInputs().filter(a=>a.kind==='rock').map(a=>({...a,id:a.id.replace('-v01','-v02'),parts:a.parts.map(p=>({...p,tiles:p.tiles.map(t=>[7,7,14,15][t])}))}));
const surfaces=WORLD_PALETTE.slice(0,12).map(([name],tile)=>({id:`superficie-${name}-v03`,name,kind:'surface',tile,parts:[{name,position:[0,0,0,0,0,1,1,0,0,1,0,0,0,0,1,1,0,1],tiles:[tile,tile]}]}));
for(const d of ['assets/blockbench','assets/textures','public/assets/models','public/assets/history'])mkdirSync(d,{recursive:true});
for(const [name,version] of [['manifest',2],['nature-manifest',1]]){const p=`public/assets/history/${name}-v0${version}.json`;if(!existsSync(p))writeFileSync(p,readFileSync(`public/assets/${name}.json`));}
const entries=[];
try{
 for(const input of [...trees,...rocks,...surfaces]){
 const result=await c.evaluate(`(async()=>{
  if(Project)await Project.close(true);newProject(Formats.free);Project.name=${JSON.stringify(input.name)};Project.texture_width=Project.texture_height=1024;
  const blank=document.createElement('canvas');blank.width=blank.height=1024;
  const texture=new Texture({name:'mundo8bit-painted-v03.png'}).fromDataURL(blank.toDataURL()).add(false);await texture.img.decode();
  texture.edit(canvas=>{canvas.width=canvas.height=1024;(${paintWorldAtlas.toString()})(canvas,${JSON.stringify(WORLD_PALETTE)});},{edit_name:'Texturas pintadas aprovadas v03'});await texture.img.decode();
  const input=${JSON.stringify(input)};let triangles=0;
  for(const part of input.parts){const vertices={},faces={};
   for(let i=0;i<part.position.length;i+=9){const points=[0,1,2].map(v=>part.position.slice(i+v*3,i+v*3+3));const a=new THREE.Vector3(...points[0]),b=new THREE.Vector3(...points[1]),d=new THREE.Vector3(...points[2]),normal=b.sub(a).cross(d.sub(a));if(normal.lengthSq()<1e-12)continue;
    const axes=[0,1,2].sort((x,y)=>Math.abs(normal.getComponent(x))-Math.abs(normal.getComponent(y))).slice(0,2),min=axes.map(axis=>Math.min(...points.map(p=>p[axis]))),max=axes.map(axis=>Math.max(...points.map(p=>p[axis]))),keys=points.map((p,v)=>'v'+i+'_'+v),uv={},tile=part.tiles[i/9];
    points.forEach((p,v)=>{vertices[keys[v]]=p.map(n=>n*16);uv[keys[v]]=axes.map((axis,k)=>(k===0?tile%4:Math.floor(tile/4))*256+16+((p[axis]-min[k])/(max[k]-min[k]||1))*224);});faces['f'+i]={vertices:keys,uv,texture:texture.uuid};triangles++;
   }new Mesh({name:part.name,vertices,faces}).init();
  }Canvas.updateAll();Project.saved=true;
  const model=Codecs.project.compile(),gltf=await Codecs.gltf.compile({scale:16,embed_textures:true,animations:false,armature:false,encoding:'ascii'});
  return {model:typeof model==='string'?model:JSON.stringify(model),gltf,atlas:texture.canvas.toDataURL(),triangles};
 })()`);
 writeFileSync(`assets/blockbench/${input.id}.bbmodel`,result.model);writeFileSync(`public/assets/models/${input.id}.gltf`,result.gltf);
 if(!entries.length){const png=Buffer.from(result.atlas.split(',')[1],'base64');writeFileSync('assets/textures/mundo8bit-painted-v03.png',png);writeFileSync('public/assets/mundo8bit-painted-v03.png',png);}
 entries.push({id:input.id,name:input.name,kind:input.kind,...(input.tile===undefined?{}:{tile:input.tile}),...(input.catalogId?{catalogId:input.catalogId}:{}),triangles:result.triangles,source:`assets/blockbench/${input.id}.bbmodel`,url:`/assets/models/${input.id}.gltf`,worldPaint:true});console.log(input.id);
 }
 const manifest={version:3,tool:'Blockbench',toolVersion:await c.evaluate('Blockbench.version'),atlas:'mundo8bit-painted-v03.png',textureSize:1024,palette:WORLD_PALETTE.map(p=>p[0]),assets:entries.filter(a=>a.kind!=='rock')};
 writeFileSync('public/assets/manifest.json',JSON.stringify(manifest,null,2)+'\n');
 const nature=read('public/assets/nature-manifest.json');nature.version=2;nature.assets=[...entries.filter(a=>a.kind==='rock'),...nature.assets.filter(a=>a.kind==='flower')];writeFileSync('public/assets/nature-manifest.json',JSON.stringify(nature,null,2)+'\n');
}finally{c.close();}
