// Regras de controle do mundo voxel (docs/voxel-controles.md). Funções puras, testáveis em Node.
import {columnAt,treeAt} from './voxel-terrain.js';
import {natureAt} from '../nature.js';

export const PLAYER_WALK_SPEED=4.317;
export const PLAYER_RUN_SPEED=5.612;

// Corrida: manter o joystick (ou W/↑) para cima/frente por 3 s, sem soltar nem desviar mais de 45°.
export const RUN_HOLD_SECONDS=3;
export function createRunRule({hold=RUN_HOLD_SECONDS,minMagnitude=.6,maxAngle=Math.PI/4}={}){
 let held=0,running=false;
 return {
  update(x,down,dt){
   const m=Math.hypot(x,down),forward=m>=minMagnitude&&down<0&&Math.abs(Math.atan2(x,-down))<=maxAngle;
   if(!forward){held=0;running=false;return false;}
   held+=dt;if(held>=hold)running=true;return running;
  },
  get held(){return held;},get running(){return running;},reset(){held=0;running=false;},
 };
}

// Cubo de ação: sempre o cubo adjacente à frente da personagem (8 direções a partir do ângulo contínuo).
// Altura: o bloco no nível dos pés se houver obstáculo/parede; senão, o bloco do chão logo à frente.
export function frontCell(x,z,yaw){
 const step=Math.round(yaw/(Math.PI/4))*(Math.PI/4);
 return {x:Math.floor(x)+Math.round(Math.sin(step)),z:Math.floor(z)+Math.round(Math.cos(step))};
}
export function actionTarget(x,z,yaw,ground){
 const cell=frontCell(x,z,yaw),column=columnAt(cell.x,cell.z),tree=treeAt(cell.x,cell.z);
 const rock=!column.water&&natureAt(cell.x,cell.z).some(i=>i.kind==='rock');
 if(tree&&tree.base<=ground)return {...cell,y:Math.max(ground,tree.base),kind:'tronco'};
 if(rock&&column.top<=ground)return {...cell,y:column.top,kind:'pedra'};
 if(column.top>ground)return {...cell,y:ground,kind:'parede'};
 if(column.water)return {...cell,y:column.top-1,kind:'agua'};
 return {...cell,y:column.top-1,kind:'chao'};
}
