// Ground projection of the fixed isometric camera; keep the 5x5 chunk horizon out of view.
export const MAX_ZOOM=2.2;
export function cameraLayout(width,height,mobile){
 const aspect=width/Math.max(height,1);
 const safeHalfHeight=22/(Math.SQRT1_2*(aspect+1.61));
 const halfHeight=Math.min(mobile?7:10,safeHalfHeight*.9);
 return {aspect,halfHeight,minZoom:Math.max(.72,halfHeight/safeHalfHeight),maxZoom:MAX_ZOOM};
}
