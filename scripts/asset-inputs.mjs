import * as THREE from 'three';
import {treeGeometry,TREE_NAMES} from './tree-shapes-v01.js';
import {PALETTE} from './paint-atlas.js';
export const TREE_IDS=['pinheiro','carvalho','cipreste','salgueiro','palmeira','araucaria','baoba','acacia','betula','mangue','seca'];
function geometryPart(geometry,color,name){const flat=geometry.index?geometry.toNonIndexed():geometry;const position=Array.from(flat.attributes.position.array);return {name,position,tiles:Array(position.length/9).fill(PALETTE.findIndex(p=>p[1]===color))};}
export function assetInputs(){
 const inputs=TREE_IDS.map((id,i)=>{
  const geo=treeGeometry(i),pos=geo.attributes.position,colors=geo.attributes.color;
  const tiles=[];for(let v=0;v<pos.count;v+=3){const color=new THREE.Color().fromBufferAttribute(colors,v).getHexString();const tile=PALETTE.findIndex(p=>p[1]===`#${color}`);if(tile<0)throw Error(`Cor sem textura ${color}`);tiles.push(tile);}
  return {id:`arvore-${id}-v02`,name:TREE_NAMES[i],kind:'tree',parts:[{name:'tronco-galhos-copa',position:Array.from(pos.array),tiles}]};
 });
 const parts=[];
 for(const [name,w,h,d,x,y,z,color] of [
 ['camisa',.5,.65,.35,0,.8,0,'#c66d43'],['rosto',.43,.43,.43,0,1.34,0,'#f3d49b'],['aba-chapeu',.58,.16,.55,0,1.57,0,'#e9b85f'],['copa-chapeu',.42,.2,.38,0,1.72,0,'#e9b85f'],['pernas',.38,.35,.28,0,.3,0,'#354b58'],['mochila',.32,.4,.16,0,.85,-.23,'#73503b'],
 ]){parts.push(geometryPart(new THREE.BoxGeometry(w,h,d).translate(x,y,z),color,name));}
 inputs.push({id:'explorador-v02',name:'Explorador',kind:'player',parts});
 inputs.push({id:'pedra-v02',name:'Pedra',kind:'rock',parts:[geometryPart(new THREE.DodecahedronGeometry(.5,0).translate(0,.25,0),'#8c9b89','pedra') ]});
 for(const [id,tile] of [['grama',11],['grama-clara',12],['areia',13],['agua',14]]) inputs.push({id:`superficie-${id}-v02`,name:`Superfície ${id}`,kind:'surface',tile,parts:[geometryPart(new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2),PALETTE[tile][1],id)]});
 return inputs;
}
