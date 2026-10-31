// Local Electron/Chromium debugging transport; no third-party plugin required.
export async function connectCDP(port, match = () => true) {
  const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  const target = targets.find(t => t.type === 'page' && match(t));
  if (!target) throw Error('Janela de destino não encontrada');
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve,reject) => {ws.onopen=resolve;ws.onerror=reject;});
  let id=0; const pending=new Map();
  ws.onmessage = event => {const m=JSON.parse(event.data);if(pending.has(m.id)){const {resolve,reject,timer}=pending.get(m.id);clearTimeout(timer);pending.delete(m.id);m.error?reject(Error(JSON.stringify(m.error))):resolve(m.result);}};
  function send(method,params={}) {return new Promise((resolve,reject)=>{const key=++id;const timer=setTimeout(()=>{pending.delete(key);reject(Error(`Tempo esgotado: ${method}`));},45000);pending.set(key,{resolve,reject,timer});ws.send(JSON.stringify({id:key,method,params}));});}
  return {send,close:()=>ws.close(),async evaluate(expression){const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description??r.exceptionDetails.text);return r.result.value;}};
}
