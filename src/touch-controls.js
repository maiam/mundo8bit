import {MAX_ZOOM} from './camera-settings.js';
export function createTouchControls(){
 const state={x:0,z:0,running:false,mobile:false,paused:false,zoom:1,minZoom:.72,maxZoom:MAX_ZOOM};
 const pad=document.querySelector('#joystick'),thumb=document.querySelector('#joystick-thumb'),run=document.querySelector('#run');
 const menu=document.querySelector('#game-menu'),menuButton=document.querySelector('#menu-button'),overlay=document.querySelector('#rotate-screen');
 const media=matchMedia('(any-pointer:coarse)');
 let padPointer=null,runPointer=null,origin=null,lastWidth=innerWidth,canvas;
 const pointers=new Map();let pinch=null;
 const zoomOut=document.querySelector('#zoom-out'),zoomIn=document.querySelector('#zoom-in'),zoomReset=document.querySelector('#zoom-reset');
 function updateZoomUI(){zoomOut.disabled=state.zoom<=state.minZoom+.001;zoomIn.disabled=state.zoom>=state.maxZoom-.001;zoomReset.textContent=`${Math.round(state.zoom*100)}%`;}
 state.setZoom=value=>{state.zoom=Math.max(state.minZoom,Math.min(state.maxZoom,value));updateZoomUI();};
 state.setZoomLimits=(min,max)=>{state.minZoom=min;state.maxZoom=max;state.setZoom(state.zoom);};
 zoomOut.onclick=()=>state.setZoom(state.zoom/1.15);zoomIn.onclick=()=>state.setZoom(state.zoom*1.15);zoomReset.onclick=()=>state.setZoom(1);
 function release(element,id){if(id!==null&&element.hasPointerCapture(id))element.releasePointerCapture(id);}
 function resetPad(){const id=padPointer;padPointer=null;origin=null;state.x=state.z=0;thumb.style.transform='translate(0px, 0px)';pad.classList.remove('active');release(pad,id);}
 function resetRun(){const id=runPointer;runPointer=null;state.running=false;run.classList.remove('pressed');run.setAttribute('aria-pressed','false');release(run,id);}
 state.reset=()=>{resetPad();resetRun();const ids=[...pointers.keys()];pointers.clear();pinch=null;if(canvas)ids.forEach(id=>release(canvas,id));};
 function closeMenu(){menu.hidden=true;menuButton.setAttribute('aria-expanded','false');}
 menuButton.onclick=()=>{const open=menu.hidden;menu.hidden=!open;menuButton.setAttribute('aria-expanded',String(open));state.reset();};
 menu.addEventListener('click',event=>{if(event.target.closest('button'))closeMenu();});
 window.addEventListener('keydown',event=>{if(event.key==='Escape')closeMenu();});
 function movePad(event){
  const radius=pad.getBoundingClientRect().width*.32,dx=event.clientX-origin.x,dz=event.clientY-origin.y,distance=Math.hypot(dx,dz),scale=distance>radius?radius/distance:1;
  thumb.style.transform=`translate(${dx*scale}px, ${dz*scale}px)`;
  const strength=Math.max(0,(Math.min(distance/radius,1)-.1)/.9);
  state.x=distance?dx/distance*strength:0;state.z=distance?dz/distance*strength:0;
 }
 pad.addEventListener('pointerdown',event=>{if(state.paused||padPointer!==null||event.button!==0)return;event.preventDefault();closeMenu();padPointer=event.pointerId;origin={x:event.clientX,y:event.clientY};pad.setPointerCapture(padPointer);pad.classList.add('active');});
 pad.addEventListener('pointermove',event=>{if(event.pointerId===padPointer&&origin)movePad(event);});
 run.addEventListener('pointerdown',event=>{if(state.paused||runPointer!==null||event.button!==0)return;event.preventDefault();closeMenu();runPointer=event.pointerId;run.setPointerCapture(runPointer);state.running=true;run.classList.add('pressed');run.setAttribute('aria-pressed','true');});
 for(const type of ['pointerup','pointercancel','lostpointercapture']){
  pad.addEventListener(type,event=>{if(event.pointerId===padPointer)resetPad();});
  run.addEventListener(type,event=>{if(event.pointerId===runPointer)resetRun();});
 }
 state.attachCanvas=element=>{
  canvas=element;canvas.style.touchAction='none';
  canvas.addEventListener('pointerdown',event=>{closeMenu();if(state.paused||event.pointerType!=='touch'||pointers.size>=2)return;event.preventDefault();pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});canvas.setPointerCapture(event.pointerId);if(pointers.size===2){const [a,b]=pointers.values();pinch={distance:Math.max(1,Math.hypot(a.x-b.x,a.y-b.y)),zoom:state.zoom};}});
  canvas.addEventListener('pointermove',event=>{if(!pointers.has(event.pointerId)||state.paused)return;pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});if(pinch&&pointers.size===2){const [a,b]=pointers.values();state.setZoom(pinch.zoom*Math.hypot(a.x-b.x,a.y-b.y)/pinch.distance);}});
  for(const type of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(type,event=>{pointers.delete(event.pointerId);pinch=null;});
  canvas.addEventListener('wheel',event=>{if(state.paused)return;event.preventDefault();state.setZoom(state.zoom*Math.exp(-event.deltaY*.001));},{passive:false});
  canvas.addEventListener('contextmenu',event=>event.preventDefault());
 };
 for(const element of [pad,run])element.addEventListener('contextmenu',event=>event.preventDefault());
 function updateLayout(){
  const mobile=media.matches,paused=mobile&&innerHeight>innerWidth,changed=mobile!==state.mobile||paused!==state.paused||innerWidth!==lastWidth;
  state.mobile=mobile;state.paused=paused;lastWidth=innerWidth;
  document.body.classList.toggle('touch-device',mobile);document.body.classList.toggle('portrait-paused',paused);
  overlay.hidden=!paused;document.querySelector('#game').inert=paused;
  if(changed){state.reset();closeMenu();if(paused)document.querySelector('#rotate-title').focus({preventScroll:true});}
 }
 window.addEventListener('resize',updateLayout);media.addEventListener('change',updateLayout);
 window.addEventListener('blur',state.reset);document.addEventListener('visibilitychange',()=>{if(document.hidden)state.reset();});
 for(const button of document.querySelectorAll('.fullscreen-button')){
  button.hidden=!document.documentElement.requestFullscreen;
  button.addEventListener('click',async()=>{try{if(!document.fullscreenElement)await document.documentElement.requestFullscreen();try{await screen.orientation?.lock?.('landscape');}catch{} }catch{}updateLayout();});
 }
 updateLayout();updateZoomUI();return state;
}
