import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRunRule,frontCell,actionTarget,RUN_HOLD_SECONDS} from './controls.js';
import {columnAt,treeAt} from './voxel-terrain.js';

test('corrida: 3 s com joystick para cima/frente; soltar ou desviar zera',()=>{
 const r=createRunRule();assert.equal(RUN_HOLD_SECONDS,3);
 for(let t=0;t<2.9;t+=.1)assert.equal(r.update(0,-1,.1),false);
 r.update(0,-1,.2);assert.equal(r.running,true);assert.equal(r.update(.3,-.9,.1),true);
 assert.equal(r.update(0,0,.1),false);assert.equal(r.held,0);
 for(let t=0;t<4;t+=.1)assert.equal(r.update(1,0,.1),false,'para o lado não corre');
 for(let t=0;t<4;t+=.1)assert.equal(r.update(0,1,.1),false,'para baixo não corre');
 for(let t=0;t<4;t+=.1)assert.equal(r.update(0,-.4,.1),false,'empurrão fraco não corre');
});
test('cubo de ação: sempre o adjacente à frente, em 8 direções, girando 360° no lugar',()=>{
 const seen=new Set();
 for(let a=0;a<Math.PI*2;a+=Math.PI/36){const c=frontCell(.5,.5,a);assert.ok(Math.max(Math.abs(c.x),Math.abs(c.z))===1);seen.add(`${c.x},${c.z}`);}
 assert.equal(seen.size,8);assert.deepEqual(frontCell(.5,.5,0),{x:0,z:1});assert.deepEqual(frontCell(.5,.5,Math.PI/2),{x:1,z:0});assert.deepEqual(frontCell(.5,.5,Math.PI),{x:0,z:-1});
 // Altura: chão à frente (top−1) em terreno plano; parede no nível dos pés quando a coluna é mais alta; tronco quando há árvore.
 let flat=null,wall=null,tree=null;
 for(let x=-30;x<30;x++)for(let z=-30;z<30;z++){const a=columnAt(x,z),b=columnAt(x,z+1);if(a.water||b.water||treeAt(x,z))continue;
  if(!flat&&b.top===a.top&&!treeAt(x,z+1))flat={x,z,g:a.top};if(!wall&&b.top===a.top+1&&!treeAt(x,z+1))wall={x,z,g:a.top};const t=treeAt(x,z+1);if(!tree&&t&&t.base===a.top)tree={x,z,g:a.top};}
 const f=actionTarget(flat.x+.5,flat.z+.5,0,flat.g);assert.deepEqual([f.x,f.z,f.y,f.kind],[flat.x,flat.z+1,flat.g-1,'chao']);
 const w=actionTarget(wall.x+.5,wall.z+.5,0,wall.g);assert.deepEqual([w.y,w.kind],[wall.g,'parede']);
 const t=actionTarget(tree.x+.5,tree.z+.5,0,tree.g);assert.deepEqual([t.y,t.kind],[tree.g,'tronco']);
});
