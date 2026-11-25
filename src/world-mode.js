// Seleção de mundo pela URL: ?mundo=voxel3d abre o protótipo voxel; qualquer outro valor, o clássico.
export const WORLD_MODES=['classico','voxel3d'];
export function readWorldMode(search=''){return new URLSearchParams(search).get('mundo')==='voxel3d'?'voxel3d':'classico';}
export function worldModeSearch(search,mode){const params=new URLSearchParams(search);if(mode==='voxel3d')params.set('mundo','voxel3d');else params.delete('mundo');const s=params.toString();return s?`?${s}`:'';}
