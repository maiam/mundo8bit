import {hash} from './world.js';
import {cloneAsset} from './assets.js';
export const TREE_NAMES=['Pinheiro','Carvalho','Cipreste','Salgueiro','Palmeira','Araucária','Baobá','Acácia','Bétula','Mangue','Seca'];
export const TREE_IDS=['pinheiro','carvalho','cipreste','salgueiro','palmeira','araucaria','baoba','acacia','betula','mangue','seca'];
export function treeTypeAt(x,z,height) {
  const value=hash(x+73,z-91);
  if(height<-.85)return value<.65?9:4;
  return Math.floor(value*TREE_NAMES.length);
}
export function createTree(type,x,z) {
  if(!Number.isInteger(type)||type<0||type>=TREE_NAMES.length)throw new RangeError('Espécie inválida');
  const tree=cloneAsset(`arvore-${TREE_IDS[type]}-v03`);
  tree.scale.setScalar(.8+hash(x-51,z+18)*.35);
  tree.rotation.y=hash(x+19,z)*Math.PI*2;
  tree.userData.species=TREE_NAMES[type];return tree;
}
