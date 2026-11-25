// A* na grade de blocos (4 vizinhos): célula caminhável = seca, sem tronco/pedra, degrau ≤ 1 bloco.
import {columnAt,treeAt} from '../voxel-terrain.js';
import {natureAt} from '../../nature.js';

const blockedCache=new Map();
export function cellBlocked(x,z){
 const key=`${x},${z}`;if(blockedCache.has(key))return blockedCache.get(key);
 const c=columnAt(x,z),blocked=c.water||Boolean(treeAt(x,z))||natureAt(x,z).some(i=>i.kind==='rock');
 if(blockedCache.size>20000)blockedCache.clear();blockedCache.set(key,blocked);return blocked;
}
export function findPath(start,goal,{maxNodes=900,blocked=cellBlocked}={}){
 if(blocked(goal.x,goal.z))return null;
 const key=(x,z)=>`${x},${z}`,h=(x,z)=>Math.abs(x-goal.x)+Math.abs(z-goal.z);
 const open=[{x:start.x,z:start.z,g:0,f:h(start.x,start.z)}],came=new Map(),cost=new Map([[key(start.x,start.z),0]]);
 let visited=0;
 while(open.length&&visited++<maxNodes){
  let best=0;for(let i=1;i<open.length;i++)if(open[i].f<open[best].f)best=i;
  const n=open.splice(best,1)[0];
  if(n.x===goal.x&&n.z===goal.z){const path=[{x:n.x,z:n.z}];let k=key(n.x,n.z);while(came.has(k)){const p=came.get(k);path.unshift(p);k=key(p.x,p.z);}return path;}
  const top=columnAt(n.x,n.z).top;
  for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){
   const x=n.x+dx,z=n.z+dz;if(blocked(x,z)||Math.abs(columnAt(x,z).top-top)>1)continue;
   const g=n.g+1,k=key(x,z);if(g>=(cost.get(k)??Infinity))continue;
   cost.set(k,g);came.set(k,{x:n.x,z:n.z});open.push({x,z,g,f:g+h(x,z)});
  }
 }
 return null;
}
