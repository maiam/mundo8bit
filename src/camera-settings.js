// Fixed, screen-aligned top-down framing, inspired by the readability of Brawl Stars.
// These are Mundo8bit parameters, not Supercell's internal camera settings.
export const CAMERA_PITCH=Math.PI*55/180;
export const CAMERA_DISTANCE=42;
export const CAMERA_FOCUS_HEIGHT=.7;
export const MAX_ZOOM=2.2;
const LOADED_GROUND_RADIUS=22; // 5x5 chunks guarantee at least 24 units in each direction.
const MAX_TERRAIN_DELTA=6.5; // Global height range is ±3; includes elevation-follow smoothing.
export function cameraLayout(width,height,mobile){
 const aspect=Math.max(1,width)/Math.max(height,1);
 // Bound every ground-plane corner, including height changes and the focus offset.
 const safeHalfHeight=Math.min(LOADED_GROUND_RADIUS/aspect,
  (LOADED_GROUND_RADIUS-(MAX_TERRAIN_DELTA+CAMERA_FOCUS_HEIGHT)/Math.tan(CAMERA_PITCH))*Math.sin(CAMERA_PITCH));
 const halfHeight=Math.min(mobile?5.8:7.2,safeHalfHeight*.9);
 return {aspect,halfHeight,minZoom:Math.max(.72,halfHeight/safeHalfHeight),maxZoom:MAX_ZOOM};
}
export function screenMovement(x,down){return {x,z:down};}
export function cameraPose(x,groundY,z){
 const target={x,y:groundY+CAMERA_FOCUS_HEIGHT,z};
 return {target,position:{x,y:target.y+Math.sin(CAMERA_PITCH)*CAMERA_DISTANCE,z:z+Math.cos(CAMERA_PITCH)*CAMERA_DISTANCE}};
}
