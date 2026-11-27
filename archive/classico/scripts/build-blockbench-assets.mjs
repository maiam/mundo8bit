// Run with Blockbench 5.2.2 open locally on CDP port 9333.
import {existsSync,mkdirSync,writeFileSync} from 'node:fs';
import {connectCDP} from './cdp.mjs';
import {assetInputs} from './asset-inputs.mjs';
import {PALETTE,paintAtlas} from './paint-atlas.js';
if(existsSync('public/assets/manifest.json')&&!process.argv.includes('--replace-generated'))throw Error('Assets v02 já existem. Preserve edições: crie uma versão nova ou use --replace-generated apenas para regeneração intencional.');
const c=await connectCDP(9333,t=>t.url.includes('app.asar/index.html'));
for(const dir of ['assets/blockbench','assets/textures','public/assets/models'])mkdirSync(dir,{recursive:true});
const manifest={version:2,tool:'Blockbench',toolVersion:await c.evaluate('Blockbench.version'),atlas:'mundo8bit-painted-v02.png',palette:PALETTE.map(p=>p[0]),assets:[]};
try{
 for(const input of assetInputs()){
  const result=await c.evaluate(`(async()=>{
    if(Project)await Project.close(true);
    newProject(Formats.free);Project.name=${JSON.stringify(input.name)};Project.texture_width=256;Project.texture_height=256;
    const blank=document.createElement('canvas');blank.width=blank.height=256;
    const texture=new Texture({name:'mundo8bit-painted-v02.png'}).fromDataURL(blank.toDataURL()).add(false);
    await texture.img.decode();
    texture.edit(canvas=>{canvas.width=canvas.height=256;(${paintAtlas.toString()})(canvas,${JSON.stringify(PALETTE)});},{edit_name:'Pintura plana Mundo8bit v02'});
    await texture.img.decode();
    const input=${JSON.stringify(input)};let triangles=0;
    for(const part of input.parts){
      const vertices={},faces={};
      for(let i=0;i<part.position.length;i+=9){
        const points=[0,1,2].map(v=>part.position.slice(i+v*3,i+v*3+3));
        const a=new THREE.Vector3(...points[0]),b=new THREE.Vector3(...points[1]),d=new THREE.Vector3(...points[2]);
        const normal=b.sub(a).cross(d.sub(a));if(normal.lengthSq()<1e-12)continue;
        const axes=[0,1,2].sort((x,y)=>Math.abs(normal.getComponent(x))-Math.abs(normal.getComponent(y))).slice(0,2);
        const min=axes.map(axis=>Math.min(...points.map(p=>p[axis]))),max=axes.map(axis=>Math.max(...points.map(p=>p[axis])));
        const keys=points.map((p,v)=>'v'+i+'_'+v);const uv={};const tile=part.tiles[i/9];
        points.forEach((p,v)=>{vertices[keys[v]]=p.map(n=>n*16);uv[keys[v]]=axes.map((axis,k)=>(k===0?tile%4:Math.floor(tile/4))*64+4+((p[axis]-min[k])/(max[k]-min[k]||1))*56);});
        faces['f'+i]={vertices:keys,uv,texture:texture.uuid};triangles++;
      }
      new Mesh({name:part.name,vertices,faces}).init();
    }
    Canvas.updateAll();Project.saved=true;
    const model=Codecs.project.compile();
    const gltf=await Codecs.gltf.compile({scale:16,embed_textures:true,animations:false,armature:false,encoding:'ascii'});
    return {model:typeof model==='string'?model:JSON.stringify(model),gltf,atlas:texture.canvas.toDataURL(),triangles,version:Blockbench.version};
  })()`);
  const model=JSON.parse(result.model),gltf=JSON.parse(result.gltf);
  if(!model.textures.length||!gltf.images?.length)throw Error('Export sem textura');
  writeFileSync(`assets/blockbench/${input.id}.bbmodel`,result.model);
  writeFileSync(`public/assets/models/${input.id}.gltf`,result.gltf);
  const png=Buffer.from(result.atlas.split(',')[1],'base64');
  writeFileSync('assets/textures/mundo8bit-painted-v02.png',png);
  writeFileSync('public/assets/mundo8bit-painted-v02.png',png);
  manifest.assets.push({id:input.id,name:input.name,kind:input.kind,tile:input.tile,triangles:result.triangles,source:`assets/blockbench/${input.id}.bbmodel`,url:`/assets/models/${input.id}.gltf`});
  console.log(`${input.id}: ${result.triangles} triângulos; .bbmodel + glTF texturizado`);
 }
 writeFileSync('public/assets/manifest.json',JSON.stringify(manifest,null,2)+'\n');
}finally{c.close();}
