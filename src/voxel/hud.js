// HUD do mundo voxel: hotbar de 9 espaços e joystick de ação (substitui o botão CORRER à direita).
// Ícones definitivos em PNG ficam pendentes (docs/voxel-artes-pendentes.md); até lá, ícone provisório em SVG 8×8.
export const HOTBAR_SLOTS=9;
export const HOTBAR_ITEMS=[{id:'mao',name:'Mão',icon:null}]; // icon: PNG enviado pelo usuário.
const HAND_8PX=['..XX.X..','.XXXXXX.','.XXXXXX.','XXXXXXX.','XXXXXXX.','.XXXXXX.','..XXXX..','..XXXX..'];
function pixelIcon(rows,color){
 const rects=rows.flatMap((r,y)=>[...r].map((c,x)=>c==='X'?`<rect x="${x}" y="${y}" width="1" height="1"/>`:'')).join('');
 return `<svg viewBox="0 0 8 8" shape-rendering="crispEdges" aria-hidden="true" fill="${color}">${rects}</svg>`;
}

export function createHotbar(root=document.body,{onSelect=()=>{}}={}){
 const bar=document.createElement('nav');bar.id='hotbar';bar.setAttribute('aria-label','Hotbar');
 let selected=0;
 const slots=Array.from({length:HOTBAR_SLOTS},(_,i)=>{
  const item=HOTBAR_ITEMS[i],b=document.createElement('button');b.className='hotbar-slot';b.dataset.slot=String(i);
  b.setAttribute('aria-label',item?`${i+1}: ${item.name}`:`${i+1}: vazio`);
  b.innerHTML=item?(item.icon?`<img src="${item.icon}" alt="">`:pixelIcon(HAND_8PX,'#e8b98f')):'';
  b.onclick=()=>select(i);bar.append(b);return b;
 });
 function select(i){selected=Math.max(0,Math.min(HOTBAR_SLOTS-1,i));slots.forEach((s,n)=>s.setAttribute('aria-pressed',String(n===selected)));onSelect(selected,HOTBAR_ITEMS[selected]??null);}
 root.append(bar);select(0);
 return {element:bar,select,get selected(){return selected;},get item(){return HOTBAR_ITEMS[selected]??null;}};
}

// Joystick de ação: girar → a personagem gira 360° sem sair do lugar (só parada); toque curto → ação
// no cubo da frente. Sem destaque visual do cubo escolhido (pedido do usuário).
export function createActionStick(root=document.querySelector('#touch-controls'),{onAim=()=>{},onAction=()=>{},isPaused=()=>false}={}){
 const pad=document.createElement('div');pad.id='action-stick';pad.setAttribute('role','group');pad.setAttribute('aria-label','Ação: gire para escolher o cubo da frente, toque para agir');
 const thumb=document.createElement('span');thumb.id='action-thumb';thumb.innerHTML=pixelIcon(HAND_8PX,'#183e35');pad.append(thumb);root.append(pad);
 let pointer=null,origin=null,start=0,travel=0;
 function reset(){if(pointer!==null&&pad.hasPointerCapture(pointer))pad.releasePointerCapture(pointer);pointer=null;origin=null;thumb.style.transform='';pad.classList.remove('active');}
 pad.addEventListener('pointerdown',e=>{if(isPaused()||pointer!==null||e.button!==0)return;e.preventDefault();pointer=e.pointerId;pad.setPointerCapture(pointer);
  const r=pad.getBoundingClientRect();origin={x:r.left+r.width/2,y:r.top+r.height/2};start=performance.now();travel=0;pad.classList.add('active');});
 pad.addEventListener('pointermove',e=>{if(e.pointerId!==pointer)return;const dx=e.clientX-origin.x,dy=e.clientY-origin.y,d=Math.hypot(dx,dy),max=pad.getBoundingClientRect().width*.32,k=d>max?max/d:1;
  thumb.style.transform=`translate(${dx*k}px, ${dy*k}px)`;travel=Math.max(travel,d);if(d>14)onAim(dx/d,dy/d);});
 for(const type of ['pointerup','pointercancel']){pad.addEventListener(type,e=>{if(e.pointerId!==pointer)return;if(type==='pointerup'&&travel<14&&performance.now()-start<500)onAction();reset();});}
 pad.addEventListener('contextmenu',e=>e.preventDefault());
 return {element:pad,reset};
}
