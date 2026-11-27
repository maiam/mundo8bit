// RG-02: relógio ativo e clima determinístico, independentes da física e dos chunks.
export const DAY_SECONDS=1200;
export const smooth=u=>{u=Math.max(0,Math.min(1,u));return u*u*(3-2*u);};
export function daylightAt(seconds){
 const time=seconds%DAY_SECONDS;
 const phase=time<600?'dia':time<660?'entardecer':time<1140?'noite':'amanhecer';
 return {time,phase,day:Math.floor(seconds/DAY_SECONDS)+1,hour:(6+time/50)%24};
}
function randomSource(seed){let a=seed>>>0;return()=>{a=(a+0x6d2b79f5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};}
export function createEnvironment(seed){
 const random=randomSource(seed);let seconds=0,index=0,start=0,duration=240+random()*240;
 const states=['limpo','nublado-entrada','chuva','nublado-saida'];
 function next(){start+=duration;index=(index+1)%4;duration=index===0?240+random()*240:index===2?60+random()*60:30;}
 function snapshot(){
  const age=seconds-start;
  const cloud=index===0?0:index===1?smooth(age/30):index===2?1:1-smooth(age/30);
  const rain=index===1?smooth((age-20)/10):index===2?1:index===3?1-smooth(age/10):0;
  return {...daylightAt(seconds),seconds,weather:states[index],weatherAge:age,weatherDuration:duration,cloud,rain};
 }
 return {advance(dt){if(!Number.isFinite(dt)||dt<0)throw new RangeError('Tempo ativo deve ser finito e não negativo');seconds+=dt;while(seconds>=start+duration)next();return snapshot();},snapshot};
}
// A transição de pausa/visibilidade também deve amostrar o relógio no instante do evento.
export function createActiveClock(now=0,paused=false){
 let last=now,stopped=paused;
 return {sample(now,paused=false){const dt=Math.max(0,(now-last)/1000);last=Math.max(last,now);const active=stopped?0:dt;stopped=paused;return active;}};
}
