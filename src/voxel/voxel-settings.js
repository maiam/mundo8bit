// Mundo voxel 3D (?mundo=voxel3d) — protótipo em teste, docs/voxel-3d.md.
// 1 bloco = 1 unidade; texturas 8×8 px por face; isometria 2:1 (topo de bloco = losango 16×8 px).
export const VOXEL_TEXELS=8;
export const ISO_YAW=Math.PI/4; // Câmera na diagonal +X/+Z, olhando para −X/−Z.
export const ISO_PITCH=Math.PI/6; // 30°: sen(30°)=0,5 → linhas 2:1 na pixel art isométrica.
export const VOXEL_PIXELS_PER_UNIT=16/Math.SQRT2; // Diagonal do topo (√2 u) = 16 px.
export const VOXEL_CAMERA_DISTANCE=80;
export const VOXEL_FOCUS_HEIGHT=1;
export const VOXEL_MAX_ZOOM=2.2;
export const VOXEL_CHUNK_RADIUS=4; // 9×9 pedaços de 12×12: a isometria enxerga mais chão que a vista superior.
const SAFE_GROUND=VOXEL_CHUNK_RADIUS*12-2; // Distância garantida até a borda carregada em cada eixo.
const HEIGHT_SPAN=6+VOXEL_FOCUS_HEIGHT; // Terreno de −3 a +3 em relação ao foco.

const sinY=Math.sin(ISO_YAW),cosY=Math.cos(ISO_YAW);
// Direções no chão: direita da tela e "para cima" da tela.
export const SCREEN_RIGHT={x:cosY,z:-sinY};
export const SCREEN_UP={x:-sinY,z:-cosY};

// Coordenadas de tela (em unidades) e profundidade em direção à câmera, para testes de oclusão.
export function isoScreen(x,y,z){
 const along=(x*sinY+z*cosY); // Distância horizontal na direção da câmera.
 return {right:x*SCREEN_RIGHT.x+z*SCREEN_RIGHT.z,up:y*Math.cos(ISO_PITCH)-along*Math.sin(ISO_PITCH),depth:along*Math.cos(ISO_PITCH)+y*Math.sin(ISO_PITCH)};
}
export function voxelScreenMovement(x,down){
 return {x:SCREEN_RIGHT.x*x-SCREEN_UP.x*down,z:SCREEN_RIGHT.z*x-SCREEN_UP.z*down};
}
export function voxelCameraPose(x,groundY,z){
 const target={x,y:groundY+VOXEL_FOCUS_HEIGHT,z},horizontal=Math.cos(ISO_PITCH)*VOXEL_CAMERA_DISTANCE;
 return {target,position:{x:x+sinY*horizontal,y:target.y+Math.sin(ISO_PITCH)*VOXEL_CAMERA_DISTANCE,z:z+cosY*horizontal}};
}
// Na isometria, a meia altura da tela cobre 2× no chão (1/sen 30°). Os cantos do retângulo visível,
// girado 45°, precisam ficar dentro da área carregada em X e Z, inclusive com diferenças de altura.
export function voxelSafeHalfHeight(aspect){
 return (SAFE_GROUND*Math.SQRT2-HEIGHT_SPAN/Math.tan(ISO_PITCH))/(aspect+1/Math.sin(ISO_PITCH));
}
export function voxelCameraLayout(width,height,mobile){
 const aspect=Math.max(1,width)/Math.max(height,1),safe=voxelSafeHalfHeight(aspect);
 // ~20 blocos na vertical no desktop (escala 4) e ~17 no celular horizontal (escala 2).
 const halfHeight=Math.min(mobile?8.6:10,safe*.92);
 return {aspect,halfHeight,minZoom:Math.max(.72,halfHeight/safe),maxZoom:VOXEL_MAX_ZOOM};
}
