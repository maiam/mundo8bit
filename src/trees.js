import {hash} from './world.js';
import {cloneAsset} from './assets.js';
// Pixel art 32×32 v01 (public/assets/trees-pixel-manifest.json). The eleven 3D v03 trees stay as
// preserved sources/exports but are no longer placed in the world.
export const TREE_NAMES=['Macieira','Carvalho','Cerejeira','Bétula'];
export const TREE_IDS=['macieira','carvalho','cerejeira','betula'];
export const TREE_COLLIDER_RADII=[.34,.32,.36,.2];
export function treeAssetId(type){return `arvore-${TREE_IDS[type]}-pixel-32-v01`;}
export function treeTypeAt(x,z){return Math.floor(hash(x+73,z-91)*TREE_NAMES.length);}
export function createTree(type,x,z) {
  if(!Number.isInteger(type)||type<0||type>=TREE_NAMES.length)throw new RangeError('Espécie inválida');
  // No random scale: each sprite pixel stays one game pixel. Mirroring keeps that and adds variety.
  const tree=cloneAsset(treeAssetId(type)+(hash(x+19,z)<.5?'-espelho':''));
  tree.userData.species=TREE_NAMES[type];return tree;
}
