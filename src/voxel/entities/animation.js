import {partsOf} from './box-model.js';
// Animação procedural (sem keyframes), como no Minecraft: limbSwing = distância acumulada,
// limbSwingAmount = intensidade 0–1 pela velocidade. Mesmas fórmulas para jogadora, NPCs e mobs.
export function walkAngle(limbSwing,amount){return Math.cos(limbSwing*.6662)*1.4*amount;}

// pose: {headYaw, headPitch, swing (0–1 do golpe de ação do braço direito), armsForward (postura tipo zumbi)}
export function animateEntity(model,rig,{limbSwing=0,amount=0,time=0,headYaw=0,headPitch=0,swing=0,armsForward=false}={}){
 const p=partsOf(model),leg=walkAngle(limbSwing,amount),idle=Math.sin(time*2)*.05;
 if(p.cabeca){p.cabeca.rotation.y=headYaw;p.cabeca.rotation.x=headPitch;}
 if(rig==='humanoid'){
  p['perna-direita'].rotation.x=leg;p['perna-esquerda'].rotation.x=-leg;
  const base=armsForward?-Math.PI/2:0;
  p['braco-direito'].rotation.x=base+(armsForward?idle:-leg*.75)-Math.sin(swing*Math.PI)*1.6;
  p['braco-esquerdo'].rotation.x=base+(armsForward?-idle:leg*.75);
  p['braco-direito'].rotation.z=-(idle+.04);p['braco-esquerdo'].rotation.z=idle+.04;
 }else if(rig==='quadruped'){
  p['perna-frente-esquerda'].rotation.x=leg;p['perna-tras-direita'].rotation.x=leg;
  p['perna-frente-direita'].rotation.x=-leg;p['perna-tras-esquerda'].rotation.x=-leg;
  if(p.cauda)p.cauda.rotation.y=Math.sin(time*3)*.25;
 }else if(rig==='bird'){
  p['perna-esquerda'].rotation.x=leg;p['perna-direita'].rotation.x=-leg;
  const flap=amount>.05?Math.sin(time*18)*.5*amount:Math.sin(time*2)*.06;
  p['asa-esquerda'].rotation.z=-flap;p['asa-direita'].rotation.z=flap;
  if(p.cauda)p.cauda.rotation.x=Math.sin(time*2.5)*.12;
 }
}
