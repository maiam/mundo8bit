import {hash} from './world.js';

export const TREE_NAMES=['Macieira','Carvalho','Cerejeira','Bétula'];
export const TREE_IDS=['macieira','carvalho','cerejeira','betula'];
export function treeTypeAt(x,z){return Math.floor(hash(x+73,z-91)*TREE_NAMES.length);}
