import {collisionWorld,animalRadius,findAnimalSpawn} from './collisions.js';
import {cloneAsset} from './assets.js';
import {faunaSpawn,stepAnimal} from './fauna-simulation.js';
export const activeAnimals=new Map();
export function spawnFauna(cx,cz,scene){
 const data=faunaSpawn(cx,cz);if(!data)return;const point=findAnimalSpawn(data,collisionWorld);if(!point)return;data.x=data.homeX=point.x;data.z=data.homeZ=point.z;data.colliderId=`animal:${cx},${cz}`;collisionWorld.setDynamic(data.colliderId,{type:'circle',x:data.x,z:data.z,radius:animalRadius(data),kind:'animal'});
 const model=cloneAsset(data.id);model.scale.setScalar(data.scale);model.position.set(data.x,data.y,data.z);model.rotation.y=data.angle;
 const limbs=[];model.traverse(node=>{if(node.isMesh&&/^(perna-|asa-|cabeca$|cauda$)/.test(node.name))limbs.push(node);});
 model.userData.animalId=data.id;scene.add(model);activeAnimals.set(`${cx},${cz}`,{data,model,limbs});
}
export function removeFauna(cx,cz,scene){const key=`${cx},${cz}`,animal=activeAnimals.get(key);if(animal){scene.remove(animal.model);collisionWorld.removeDynamic(animal.data.colliderId);activeAnimals.delete(key);}}
export function updateFauna(dt,time){
 for(const {data,model,limbs} of activeAnimals.values()){
  stepAnimal(data,dt,collisionWorld);collisionWorld.setDynamic(data.colliderId,{type:'circle',x:data.x,z:data.z,radius:animalRadius(data),kind:'animal'});const moving=data.state==='walk';const phase=time*(data.species===8?2:6)+data.seed*6.28;
  model.position.set(data.x,data.y+(moving?Math.abs(Math.sin(phase))*.018:Math.sin(time*1.7+data.seed)*.006),data.z);model.rotation.y=data.angle;
  for(const node of limbs){
   if(node.name.startsWith('perna-')){const diagonal=(node.name.includes('frente')?1:-1)*(node.name.includes('esquerda')?1:-1);node.rotation.x=moving?Math.sin(phase)*.3*diagonal:0;}
   else if(node.name.startsWith('asa-'))node.rotation.z=Math.sin(time*2+data.seed)*.035*(node.name.includes('esquerda')?1:-1);
   else if(node.name==='cauda')node.rotation.y=Math.sin(time*2+data.seed)*.08;
   else if(node.name==='cabeca')node.rotation.y=moving?0:Math.sin(time*.8+data.seed)*.12;
  }
 }
}
