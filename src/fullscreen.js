export function fullscreenAPI(root,doc){
 if(typeof root.requestFullscreen==='function')return doc.fullscreenEnabled===false?null:{request:()=>root.requestFullscreen({navigationUI:'hide'}),exit:()=>(doc.exitFullscreen??doc.webkitExitFullscreen??doc.webkitCancelFullScreen)?.call(doc)};
 const request=root.webkitRequestFullscreen??root.webkitRequestFullScreen;
 const exit=doc.webkitExitFullscreen??doc.webkitCancelFullScreen;
 if(typeof request==='function'&&doc.webkitFullscreenEnabled!==false)return {request:()=>request.call(root),exit:()=>exit?.call(doc)};
 return null;
}
export function createFullscreenController({resetInput,onChange}){
 const root=document.documentElement,buttons=[...document.querySelectorAll('.fullscreen-button')];
 const invite=document.querySelector('#fullscreen-invite'),help=document.querySelector('#fullscreen-help'),feedback=document.querySelector('#fullscreen-feedback');
 const media=matchMedia('(any-pointer:coarse)'),appMode=matchMedia('(display-mode: standalone)');
 const state={active:false,supported:false,busy:false};let dismissed=false,feedbackTimer,orientationLocked=false;
 const active=()=>Boolean(document.fullscreenElement||document.webkitFullscreenElement||document.webkitIsFullScreen);
 function sync(){
  state.active=active();state.supported=Boolean(fullscreenAPI(root,document));
  const standalone=appMode.matches||navigator.standalone===true;
  for(const button of buttons){button.hidden=!state.active&&!state.supported;button.disabled=state.busy;button.textContent=state.active?'Sair da tela cheia':button.dataset.fullscreenLabel||'Entrar em tela cheia';button.setAttribute('aria-pressed',String(state.active));}
  invite.hidden=!(media.matches&&innerWidth>innerHeight&&state.supported&&!standalone&&!state.active&&!dismissed);
  help.hidden=state.supported||standalone||state.active;
  help.textContent='Tela cheia não está disponível neste navegador. Se houver a opção, adicione o jogo à Tela de Início para abrir com mais espaço.';
 }
 function notify(text){clearTimeout(feedbackTimer);feedback.textContent=text;feedback.hidden=false;feedbackTimer=setTimeout(()=>{feedback.hidden=true;},5000);}
 function waitForMode(expected){
  if(active()===expected)return Promise.resolve(true);
  return new Promise(resolve=>{let timer;const finish=()=>{clearTimeout(timer);document.removeEventListener('fullscreenchange',check);document.removeEventListener('webkitfullscreenchange',check);resolve(active()===expected);};const check=()=>{if(active()===expected)finish();};document.addEventListener('fullscreenchange',check);document.addEventListener('webkitfullscreenchange',check);timer=setTimeout(finish,1500);});
 }
 function bounded(operation){let timer;return Promise.race([Promise.resolve(operation),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Fullscreen request timed out')),3000);})]).finally(()=>clearTimeout(timer));}
 function unlock(){if(orientationLocked){try{screen.orientation?.unlock?.();}catch{}orientationLocked=false;}}
 function changed(){resetInput();if(!active())unlock();sync();onChange();}
 state.toggle=async()=>{
  if(state.busy)return;const api=fullscreenAPI(root,document);if(!api){sync();notify('Seu navegador não oferece tela cheia. Continue jogando na horizontal.');return;}
  state.busy=true;feedback.hidden=true;resetInput();sync();
  try{
   if(active()){await bounded(api.exit());if(!await waitForMode(false))throw Error('Fullscreen exit failed');unlock();}
   else{
    await bounded(api.request());if(!await waitForMode(true))throw Error('Fullscreen entry failed');
    dismissed=true;
    try{if(screen.orientation?.lock)Promise.resolve(screen.orientation.lock('landscape')).then(()=>{orientationLocked=true;if(!active())unlock();},()=>{});}catch{}
   }
  }catch{dismissed=true;notify('Não foi possível mudar para tela cheia. Você pode continuar na horizontal.');}
  finally{state.busy=false;sync();onChange();}
 };
 for(const button of buttons){button.dataset.fullscreenLabel=button.textContent;button.addEventListener('click',state.toggle);}
 document.querySelector('#fullscreen-dismiss').onclick=()=>{dismissed=true;sync();};
 document.addEventListener('fullscreenchange',changed);document.addEventListener('webkitfullscreenchange',changed);
 window.addEventListener('resize',sync);media.addEventListener('change',sync);appMode.addEventListener('change',sync);
 state.refresh=sync;sync();return state;
}
