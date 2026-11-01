import * as THREE from 'three';
// Sample padded atlas islands in global coordinates. The world pattern spans 8 units,
// rather than restarting every terrain cell or chunk. No extra draw calls per ground type.
export function createPaintedMaterial(atlas,{water=false}={}){
 const material=new THREE.MeshStandardMaterial({map:atlas,roughness:1,flatShading:true,side:THREE.DoubleSide});
 material.onBeforeCompile=shader=>{
  shader.vertexShader='varying vec3 vPaintWorld;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvPaintWorld=(modelMatrix*vec4(position,1.0)).xyz;');
  shader.fragmentShader='varying vec3 vPaintWorld;\n'+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <map_pars_fragment>',`#include <map_pars_fragment>
  vec4 paintedTile(float tile,vec2 p){
   vec2 cell=vec2(mod(tile,4.0),floor(tile/4.0));
   // LOD pinned to the world scale; explicit gradients avoid fract seams in mip selection.
   vec2 uv=(cell*256.0+16.0+fract(p)*224.0)/1024.0;
   return textureGrad(map,uv,dFdx(p)*224.0/1024.0,dFdy(p)*224.0/1024.0);
  }
  float paintedGround(vec2 p){return sin(p.x*.14)*1.25+cos(p.y*.17)*.95+sin((p.x+p.y)*.09)*.8;}
  `);
  shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',water?`
   vec2 p=vPaintWorld.xz/12.0;
   float depth=max(0.0,-1.55-paintedGround(vPaintWorld.xz));
   diffuseColor*=mix(paintedTile(5.0,p),paintedTile(6.0,p),smoothstep(.12,1.1,depth));
  `:`
   vec2 p=vPaintWorld.xz/8.0;
   float meadow=sin(vPaintWorld.x*.15)+cos(vPaintWorld.z*.13);
   vec4 grass=mix(paintedTile(1.0,p),paintedTile(0.0,p),smoothstep(-.7,.8,meadow));
   float soil=smoothstep(1.63,1.93,sin(vPaintWorld.x*.11+1.3)+cos(vPaintWorld.z*.09-.7));
   // A restrained worn band through the origin; surface decoration only, no navigation changes.
   float path=(1.0-smoothstep(.65,1.25,abs(vPaintWorld.x-sin(vPaintWorld.z*.14)*1.2)))*(1.0-smoothstep(9.0,13.0,abs(vPaintWorld.z)));
   vec4 ground=mix(grass,paintedTile(2.0,p),soil*.38);
   ground=mix(ground,paintedTile(3.0,p),path*.78);
   float shore=1.0-smoothstep(-1.20,-.82,vPaintWorld.y);
   diffuseColor*=mix(ground,paintedTile(4.0,p),shore);
  `);
 };
 material.customProgramCacheKey=()=>water?'painted-water-v03':'painted-ground-v03';
 return material;
}
