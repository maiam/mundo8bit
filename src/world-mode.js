// Seleção de mundo pela URL. Desde 2026-11-25 o mundo voxel é o padrão; ?mundo=classico abre o legado.
export const WORLD_MODES=['voxel3d','classico'];
export function readWorldMode(search=''){return new URLSearchParams(search).get('mundo')==='classico'?'classico':'voxel3d';}
export function worldModeSearch(search,mode){const params=new URLSearchParams(search);if(mode==='classico')params.set('mundo','classico');else params.delete('mundo');const s=params.toString();return s?`?${s}`:'';}
