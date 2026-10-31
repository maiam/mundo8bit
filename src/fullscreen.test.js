import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fullscreenAPI} from './fullscreen.js';
test('tela cheia respeita disponibilidade e permissão do navegador',()=>{
 assert.equal(fullscreenAPI({},{}),null);
 assert.equal(fullscreenAPI({requestFullscreen(){}},{fullscreenEnabled:false}),null);
 assert.equal(fullscreenAPI({webkitRequestFullscreen(){}},{webkitFullscreenEnabled:false}),null);
});
test('usa API padrão e opção para esconder navegação; entrada e saída mantêm contexto',async()=>{
 let entered=false,exited=false;
 const root={requestFullscreen(options){assert.equal(this,root);assert.equal(options.navigationUI,'hide');entered=true;return Promise.resolve();}};
 const doc={fullscreenEnabled:true,exitFullscreen(){assert.equal(this,doc);exited=true;return Promise.resolve();}};
 const api=fullscreenAPI(root,doc);await api.request();await api.exit();assert.ok(entered&&exited);
});
test('compatibilidade WebKit suporta entrar e sair sem depender da API padrão',()=>{
 let requests=0,exits=0;
 const root={webkitRequestFullscreen(){assert.equal(this,root);requests++;}};
 const doc={webkitFullscreenEnabled:true,webkitExitFullscreen(){assert.equal(this,doc);exits++;}};
 const api=fullscreenAPI(root,doc);api.request();api.exit();assert.equal(requests,1);assert.equal(exits,1);
});
