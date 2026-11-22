import * as THREE from 'three';

// Pixel art presentation — default visual since 2026-11-22 (docs/pixel-art.md); can be turned off.
// Fixed density: one 32×32 tree sprite texel = one game pixel = 1/12 world unit.
export const PIXELS_PER_UNIT=12;
export const PIXEL_MARGIN=1; // Extra texel on each side for sub-pixel scroll compensation.
export const PIXEL_COLOR_LEVELS=20; // Per channel, in sRGB space, with light ordered dithering.
export const PIXEL_DITHER=.35; // Fraction of one color step; low to keep painted detail readable.
export const PIXEL_OUTLINE_DEPTH=.6; // World units of depth jump that produce a contour.
// The contour is drawn on the farther texel (outside the object), so thin petals/limbs keep their color.
export const PIXEL_STORAGE_KEY='mundo8bit:pixel-art';

// Integer scale (CSS px per game pixel) closest to the requested framing; the visible world is then
// derived from the fixed density, never exceeding maxHalfHeight (loaded-terrain safety from cameraLayout).
export function pixelArtLayout(width,height,{halfHeight,zoom=1,maxHalfHeight=Infinity}={}){
 width=Math.max(1,width);height=Math.max(1,height);halfHeight=halfHeight??height/(2*2*PIXELS_PER_UNIT);
 const ideal=height*zoom/(2*halfHeight*PIXELS_PER_UNIT);
 const minimum=Math.max(1,Math.ceil(height/(2*PIXELS_PER_UNIT*maxHalfHeight)-1e-9));
 const scale=Math.max(minimum,Math.round(ideal));
 return {scale,width:Math.ceil(width/scale)+PIXEL_MARGIN*2,height:Math.ceil(height/scale)+PIXEL_MARGIN*2,halfHeight:height/(2*scale*PIXELS_PER_UNIT)};
}

// Snap a coordinate (along a camera axis) to the texel grid; fraction is in texels, [0,1).
export function snapToTexel(value,texel){
 const cell=Math.floor(value/texel);
 const fraction=Math.min(Math.max(value/texel-cell,0),1-1e-9);
 return {snapped:cell*texel,fraction};
}

// ?pixel=1|0 wins over the per-viewer stored preference. Default: on.
export function readPixelArtPreference(search='',storage=null){
 const param=new URLSearchParams(search).get('pixel');
 if(param==='1'||param==='0')return param==='1';
 try{return storage?.getItem(PIXEL_STORAGE_KEY)!=='0';}catch{return true;}
}
export function storePixelArtPreference(enabled,storage=null){
 try{storage?.setItem(PIXEL_STORAGE_KEY,enabled?'1':'0');}catch{/* storage unavailable: preference lasts for the session only */}
}

const vertexShader=`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`;
const fragmentShader=`
uniform sampler2D tColor;uniform sampler2D tDepth;uniform vec2 targetSize;uniform vec2 viewSize;uniform float scale;
uniform vec2 offset;uniform float depthRange;uniform float outlineDepth;uniform float levels;uniform float dither;
float bayer(vec2 p){int x=int(mod(p.x,4.)),y=int(mod(p.y,4.));int i=x+y*4;
 int m[16];m[0]=0;m[1]=8;m[2]=2;m[3]=10;m[4]=12;m[5]=4;m[6]=14;m[7]=6;m[8]=3;m[9]=11;m[10]=1;m[11]=9;m[12]=15;m[13]=7;m[14]=13;m[15]=5;
 for(int k=0;k<16;k++)if(k==i)return float(m[k])/16.-.46875;return 0.;}
vec3 toSRGB(vec3 c){c=clamp(c,0.,1.);return mix(c*12.92,1.055*pow(c,vec3(1./2.4))-.055,step(.0031308,c));}
float depthAt(vec2 texel){return texture2D(tDepth,(texel+.5)/targetSize).r*depthRange;}
void main(){
 vec2 t=(gl_FragCoord.xy-viewSize*.5)/scale+targetSize*.5+offset;
 vec2 texel=clamp(floor(t),vec2(0.),targetSize-1.);
 vec3 color=toSRGB(texture2D(tColor,(texel+.5)/targetSize).rgb);
 float d=depthAt(texel);
 float nearest=min(min(depthAt(texel+vec2(1.,0.)),depthAt(texel-vec2(1.,0.))),min(depthAt(texel+vec2(0.,1.)),depthAt(texel-vec2(0.,1.))));
 if(d-nearest>outlineDepth)color*=vec3(.5,.54,.46);
 color=floor(color*(levels-1.)+.5+bayer(texel)*dither*2.)/(levels-1.);
 gl_FragColor=vec4(clamp(color,0.,1.),1.);
}`;

export function createPixelArt(renderer,{enabled=true}={}){
 const target=new THREE.WebGLRenderTarget(1,1,{minFilter:THREE.NearestFilter,magFilter:THREE.NearestFilter,generateMipmaps:false,depthBuffer:true});
 target.texture.colorSpace=THREE.SRGBColorSpace;target.depthTexture=new THREE.DepthTexture(1,1);
 const material=new THREE.ShaderMaterial({vertexShader,fragmentShader,depthTest:false,depthWrite:false,uniforms:{
  tColor:{value:target.texture},tDepth:{value:target.depthTexture},targetSize:{value:new THREE.Vector2(1,1)},viewSize:{value:new THREE.Vector2(1,1)},
  scale:{value:2},offset:{value:new THREE.Vector2()},depthRange:{value:180},outlineDepth:{value:PIXEL_OUTLINE_DEPTH},levels:{value:PIXEL_COLOR_LEVELS},dither:{value:PIXEL_DITHER}}});
 const quad=new THREE.Mesh(new THREE.PlaneGeometry(2,2),material);quad.frustumCulled=false;
 const quadScene=new THREE.Scene();quadScene.add(quad);const quadCamera=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
 const right=new THREE.Vector3(),up=new THREE.Vector3(),saved=new THREE.Vector3();
 const state={enabled,layout:pixelArtLayout(1,1),view:{width:1,height:1,maxHalfHeight:Infinity}};
 function applyLayout(layout){
  if(layout.width!==state.layout.width||layout.height!==state.layout.height)target.setSize(layout.width,layout.height);
  state.layout=layout;material.uniforms.targetSize.value.set(layout.width,layout.height);material.uniforms.scale.value=layout.scale;
 }
 state.resize=(width,height,{maxHalfHeight=Infinity}={})=>{state.view={width,height,maxHalfHeight};material.uniforms.viewSize.value.set(width,height);};
 // Renders with a texel-snapped camera, then restores the camera so gameplay/QA see the normal pose.
 // Zoom steps through integer scales, so sprites always stay one texel per game pixel.
 state.render=(scene,camera)=>{
  const {width,height,maxHalfHeight}=state.view;
  applyLayout(pixelArtLayout(width,height,{halfHeight:camera.top,zoom:camera.zoom,maxHalfHeight}));
  const {width:tw,height:th}=state.layout,texel=1/PIXELS_PER_UNIT;
  const frustum=[camera.left,camera.right,camera.top,camera.bottom],zoom=camera.zoom;
  camera.zoom=1;camera.left=-tw*texel/2;camera.right=tw*texel/2;camera.top=th*texel/2;camera.bottom=-th*texel/2;
  camera.updateProjectionMatrix();camera.updateMatrixWorld();
  saved.copy(camera.position);right.setFromMatrixColumn(camera.matrixWorld,0);up.setFromMatrixColumn(camera.matrixWorld,1);
  const x=snapToTexel(camera.position.dot(right),texel),y=snapToTexel(camera.position.dot(up),texel);
  camera.position.addScaledVector(right,-x.fraction*texel).addScaledVector(up,-y.fraction*texel);camera.updateMatrixWorld();
  material.uniforms.offset.value.set(x.fraction,y.fraction);material.uniforms.depthRange.value=camera.far-camera.near;
  renderer.setRenderTarget(target);renderer.render(scene,camera);renderer.setRenderTarget(null);renderer.render(quadScene,quadCamera);
  camera.position.copy(saved);camera.zoom=zoom;[camera.left,camera.right,camera.top,camera.bottom]=frustum;camera.updateProjectionMatrix();camera.updateMatrixWorld();
 };
 state.dispose=()=>{target.depthTexture.dispose();target.dispose();material.dispose();quad.geometry.dispose();};
 return state;
}
