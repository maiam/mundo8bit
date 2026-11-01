import {hash,heightAt} from './world.js';
import {ROCK_IDS,FLOWER_IDS} from './nature-catalog.js';
// Sampling depends only on global coordinates, so reloaded chunks are identical.
export function natureAt(x,z){
 const h=heightAt(x,z),n=hash(x,z);
 if(Math.hypot(x,z)<3||h< -2.6||n>.975)return [];
 if(n<.018&&h> -1.45){
  const type=Math.floor(hash(x+105,z-71)*ROCK_IDS.length);
  return [{id:`pedra-${ROCK_IDS[type]}-v02`,kind:'rock',x,z,y:h,scale:.65+hash(x+2,z+7)*.6,angle:hash(x-2,z+9)*Math.PI*2}];
 }
 if(x%2||z%2||hash(x-44,z+77)>.1)return [];
 let type=Math.floor(hash(x+31,z-151)*FLOWER_IDS.length);
 if(h< -1.55)type=14;
 else if(h<-.85)return []; // Low-lying lotus patches float just above the water.
 if(type===14&&h> -1.55)return []; // Lotus stays on the shoreline.
 const result=[],count=2+Math.floor(hash(x-14,z+82)*3);
 for(let i=0;i<count;i++){
  const px=x+(hash(x+i*13,z+91)-.5)*1.15,pz=z+(hash(x+81,z-i*9)-.5)*1.15;
  const ground=heightAt(px,pz);
  if(type!==14&&ground<-.85)continue;
  // The lotus source has a shallow leaf; avoid spawning it over dry ground.
  if(type===14&&ground> -1.55)continue;
  result.push({id:`flor-${FLOWER_IDS[type]}-v01`,kind:'flower',x:px,z:pz,y:type===14?-1.53:ground,scale:.8+hash(x+i*19,z-5)*.3,angle:hash(x+63,z+i*7)*Math.PI*2});
 }return result;
}
