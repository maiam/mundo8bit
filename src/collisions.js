import {heightAt,CHUNK_SIZE} from './world.js';
export const PLAYER_RADIUS=.24;
export const MIN_WALK_HEIGHT=-1.7; // Water is at -1.55: up to 15 cm of wading.
const CELL=4,EPS=.00001;
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
function bounds(shape){
 if(shape.type==='box'){const c=Math.abs(Math.cos(shape.angle)),s=Math.abs(Math.sin(shape.angle));return [shape.x-c*shape.hx-s*shape.hz,shape.z-s*shape.hx-c*shape.hz,shape.x+c*shape.hx+s*shape.hz,shape.z+s*shape.hx+c*shape.hz];}
 if(shape.type==='capsule')return [Math.min(shape.ax,shape.bx)-shape.radius,Math.min(shape.az,shape.bz)-shape.radius,Math.max(shape.ax,shape.bx)+shape.radius,Math.max(shape.az,shape.bz)+shape.radius];
 return [shape.x-shape.radius,shape.z-shape.radius,shape.x+shape.radius,shape.z+shape.radius];
}
function cells(box){const keys=[];for(let x=Math.floor(box[0]/CELL);x<=Math.floor(box[2]/CELL);x++)for(let z=Math.floor(box[1]/CELL);z<=Math.floor(box[3]/CELL);z++)keys.push(`${x},${z}`);return keys;}
// Return the smallest outward correction for a circle footprint against a proxy.
export function penetration(x,z,radius,shape){
 if(shape.type==='box'){
  const c=Math.cos(shape.angle),s=Math.sin(shape.angle),dx=x-shape.x,dz=z-shape.z;
  const lx=c*dx-s*dz,lz=s*dx+c*dz,qx=clamp(lx,-shape.hx,shape.hx),qz=clamp(lz,-shape.hz,shape.hz);
  let nx=lx-qx,nz=lz-qz,d=Math.hypot(nx,nz),amount;
  if(d>=radius-EPS)return null;
  if(d>EPS){nx/=d;nz/=d;amount=radius-d+EPS;}
  else if(shape.hx-Math.abs(lx)<shape.hz-Math.abs(lz)){nx=lx<0?-1:1;nz=0;amount=shape.hx-Math.abs(lx)+radius+EPS;}
  else{nx=0;nz=lz<0?-1:1;amount=shape.hz-Math.abs(lz)+radius+EPS;}
  return {x:(c*nx+s*nz)*amount,z:(-s*nx+c*nz)*amount};
 }
 let cx=shape.x,cz=shape.z;
 if(shape.type==='capsule'){
  const dx=shape.bx-shape.ax,dz=shape.bz-shape.az,t=clamp(((x-shape.ax)*dx+(z-shape.az)*dz)/(dx*dx+dz*dz||1),0,1);
  cx=shape.ax+t*dx;cz=shape.az+t*dz;
 }
 const dx=x-cx,dz=z-cz,d=Math.hypot(dx,dz),total=radius+shape.radius;
 if(d>=total-EPS)return null;
 const amount=total-d+EPS;return {x:(d>EPS?dx/d:1)*amount,z:(d>EPS?dz/d:0)*amount};
}
export function walkableGround(x,z,radius,minHeight=MIN_WALK_HEIGHT,height=heightAt){
 if(height(x,z)<minHeight)return false;
 for(let i=0;i<8;i++){const a=i*Math.PI/4;if(height(x+Math.cos(a)*radius,z+Math.sin(a)*radius)<minHeight)return false;}
 return true;
}
export class CollisionWorld {
 // `height` is pluggable: the classic world uses the smooth heightAt, the voxel world its block columns.
 constructor({height=heightAt}={}){this.height=height;this.chunks=new Map();this.buckets=new Map();this.dynamic=new Map();}
 addChunk(cx,cz,shapes){
  this.removeChunk(cx,cz);const entries=shapes.map(shape=>({shape,keys:cells(bounds(shape))}));
  this.chunks.set(`${cx},${cz}`,entries);
  for(const entry of entries)for(const key of entry.keys){if(!this.buckets.has(key))this.buckets.set(key,new Set());this.buckets.get(key).add(entry);}
 }
 removeChunk(cx,cz){const key=`${cx},${cz}`,entries=this.chunks.get(key);if(!entries)return;for(const entry of entries)for(const cell of entry.keys){const bucket=this.buckets.get(cell);bucket.delete(entry);if(!bucket.size)this.buckets.delete(cell);}this.chunks.delete(key);}
 setDynamic(id,shape){this.dynamic.set(id,shape);}
 removeDynamic(id){this.dynamic.delete(id);}
 query(x,z,radius,ignoreId){
  const found=new Set();for(const key of cells([x-radius,z-radius,x+radius,z+radius]))for(const entry of this.buckets.get(key)??[])found.add(entry.shape);
  for(const [id,shape] of this.dynamic)if(id!==ignoreId){const b=bounds(shape);if(x+radius>=b[0]&&x-radius<=b[2]&&z+radius>=b[1]&&z-radius<=b[3])found.add(shape);}
  return [...found];
 }
 isFree(x,z,radius,{ignoreId,minGround=MIN_WALK_HEIGHT}={}){return walkableGround(x,z,radius,minGround,this.height)&&!this.query(x,z,radius,ignoreId).some(s=>penetration(x,z,radius,s));}
 project(x,z,radius,ignoreId){
  for(let pass=0;pass<8;pass++){
   let hit=false;for(const shape of this.query(x,z,radius,ignoreId)){const correction=penetration(x,z,radius,shape);if(correction){x+=correction.x;z+=correction.z;hit=true;}}
   if(!hit)break;
  }return {x,z};
 }
 move(start,dx,dz,radius,{ignoreId,minGround=MIN_WALK_HEIGHT,maxStepHeight=.35}={}){
  let x=start.x,z=start.z;const steps=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.08)),sx=dx/steps,sz=dz/steps;
  for(let i=0;i<steps;i++){
   const oldX=x,oldZ=z,oldHeight=this.height(x,z),height=this.height;
   const candidates=[[x+sx,z+sz]];
   // Project inward movement onto the shoreline tangent before trying axis slides.
   if(!walkableGround(x+sx,z+sz,radius,minGround,height)){
    const h=.05,gx=(height(x+h,z)-height(x-h,z))/(2*h),gz=(height(x,z+h)-height(x,z-h))/(2*h),dot=sx*gx+sz*gz,norm=gx*gx+gz*gz;
    if(dot<0&&norm>EPS)candidates.push([x+sx-gx*dot/norm,z+sz-gz*dot/norm]);
   }
   candidates.push([x+sx,z],[x,z+sz]);
   let best=null,bestProgress=-Infinity;
   for(const [tx,tz] of candidates){
    const p=this.project(tx,tz,radius,ignoreId);
    if(Math.hypot(p.x-oldX,p.z-oldZ)>Math.hypot(sx,sz)+radius*2)continue;
    if(Math.abs(height(p.x,p.z)-oldHeight)>maxStepHeight||!this.isFree(p.x,p.z,radius,{ignoreId,minGround}))continue;
    const progress=(p.x-oldX)*sx+(p.z-oldZ)*sz;
    if(progress>bestProgress){best=p;bestProgress=progress;}
   }
   if(best&&bestProgress>=-EPS){x=best.x;z=best.z;}
  }
  return {x,z,distance:Math.hypot(x-start.x,z-start.z),blocked:Math.hypot((x-start.x)-dx,(z-start.z)-dz)>.001};
 }
}
export const collisionWorld=new CollisionWorld();
// Conservative trunk/root proxies; crowns stay traversable overhead.
export function treeColliders(type,x,z,scale,angle){
 // Trunk circles for the pixel art 32×32 trees (same order as TREE_IDS in trees.js).
 const radii=[.34,.32,.36,.2];
 if(!(type in radii))throw new RangeError('Espécie inválida');
 return [{type:'circle',x,z,radius:radii[type]*scale,kind:'tree'}];
}
export function rockCollider(placement,box){
 const c=Math.cos(placement.angle),s=Math.sin(placement.angle),scale=placement.scale,cx=(box.minX+box.maxX)*.5*scale,cz=(box.minZ+box.maxZ)*.5*scale;
 return {type:'box',x:placement.x+c*cx+s*cz,z:placement.z-s*cx+c*cz,hx:(box.maxX-box.minX)*.5*scale,hz:(box.maxZ-box.minZ)*.5*scale,angle:placement.angle,kind:'rock'};
}
export const ANIMAL_RADII=[.55,.61,.39,.52,.34,.48,.4,.36,.46,.3,.32];
export function animalRadius(data){return ANIMAL_RADII[data.species]*data.scale;}
export function findAnimalSpawn(data,world){
 const radius=animalRadius(data),id=`animal:${data.cx},${data.cz}`;
 for(let ring=0;ring<5;ring++)for(let i=0;i<(ring?12:1);i++){
  const angle=i*Math.PI/6,x=data.x+Math.cos(angle)*ring*.22,z=data.z+Math.sin(angle)*ring*.22;
  if(x-radius<data.cx*CHUNK_SIZE||x+radius>(data.cx+1)*CHUNK_SIZE||z-radius<data.cz*CHUNK_SIZE||z+radius>(data.cz+1)*CHUNK_SIZE)continue;
  if(world.isFree(x,z,radius,{ignoreId:id,minGround:-.65}))return {x,z};
 }return null;
}
