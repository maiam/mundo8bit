import {hash,heightAt,CHUNK_SIZE} from './world.js';
import {ANIMAL_IDS,ANIMAL_SPEEDS} from './fauna-catalog.js';
export function faunaSpawn(cx,cz){
 if(hash(cx+811,cz-41)>.88)return null;
 for(let i=0;i<8;i++){
  const x=cx*CHUNK_SIZE+4+hash(cx+i*11,cz+419)*4;
  const z=cz*CHUNK_SIZE+4+hash(cx-93,cz+i*17)*4;
  const h=heightAt(x,z);
  if(h<-.65||Math.hypot(x,z)<4)continue;
  const species=Math.floor(hash(cx+67,cz-311)*ANIMAL_IDS.length);
  return {id:`animal-${ANIMAL_IDS[species]}-v01`,species,cx,cz,x,z,homeX:x,homeZ:z,y:h,angle:hash(cx+11,cz)*Math.PI*2,scale:.85+hash(cx+23,cz-21)*.15,speed:ANIMAL_SPEEDS[species],seed:hash(cx+17,cz+13),timer:.4+hash(cx+9,cz)*2,turn:0,state:'idle',targetX:x,targetZ:z};
 }return null;
}
export function stepAnimal(animal,dt){
 dt=Math.min(Math.max(dt,0),.05);animal.timer-=dt;
 if(animal.timer<=0){
  animal.turn++;
  if(animal.state==='walk'){
   animal.state='idle';animal.timer=1.2+hash(animal.turn+animal.cx,animal.cz+77)*3;
  }else{
   const angle=hash(animal.turn+animal.cx*17,animal.cz-71)*Math.PI*2;
   const radius=.7+hash(animal.turn+animal.cz,animal.cx+91)*1.5;
   const x=animal.homeX+Math.sin(angle)*radius,z=animal.homeZ+Math.cos(angle)*radius;
   if(heightAt(x,z)>-.65){animal.targetX=x;animal.targetZ=z;animal.state='walk';animal.timer=Math.hypot(x-animal.x,z-animal.z)/animal.speed+1;}
   else{animal.state='idle';animal.timer=1;}
  }
 }
 const dx=animal.targetX-animal.x,dz=animal.targetZ-animal.z,distance=Math.hypot(dx,dz);
 if(animal.state==='walk'&&distance>.04){
  const step=Math.min(animal.speed*dt,distance),x=animal.x+dx/distance*step,z=animal.z+dz/distance*step;
  if(heightAt(x,z)>-.65){animal.x=x;animal.z=z;animal.angle=Math.atan2(dx,dz);}
  else{animal.state='idle';animal.timer=1.5;}
 }else if(animal.state==='walk'){animal.state='idle';animal.timer=1.5;}
 animal.y=heightAt(animal.x,animal.z);
 return animal;
}
