import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {cameraLayout,cameraPose,screenMovement} from './camera-settings.js';
function cameraAt(width,height,mobile,zoom=1){const l=cameraLayout(width,height,mobile),p=cameraPose(0,0,0),c=new THREE.OrthographicCamera(-l.halfHeight*l.aspect,l.halfHeight*l.aspect,l.halfHeight,-l.halfHeight,.1,180);c.position.set(...Object.values(p.position));c.lookAt(...Object.values(p.target));c.zoom=zoom;c.updateProjectionMatrix();c.updateMatrixWorld();return c;}
test('movimento segue os eixos visuais e câmera mantém orientação ao viajar',()=>{
 const c=cameraAt(844,390,true),origin=new THREE.Vector3(0,0,0).project(c);
 for(const [x,z] of [[1,0],[-1,0],[0,1],[0,-1]]){const d=screenMovement(x,z),p=new THREE.Vector3(d.x,0,d.z).project(c).sub(origin);assert.ok(x===0?Math.abs(p.x)<1e-8:Math.sign(p.x)===x);assert.ok(z===0?Math.abs(p.y)<1e-8:Math.sign(p.y)===-z);}
 const a=cameraPose(-120,-2,120),b=cameraPose(120,2,-120);for(const axis of ['x','y','z'])assert.ok(Math.abs((a.position[axis]-a.target[axis])-(b.position[axis]-b.target[axis]))<1e-8);
});
test('limites de zoom mantêm terreno carregado em telas estreitas e ultrawide',()=>{
 for(const [w,h,mobile] of [[390,844,true],[844,390,true],[568,320,true],[1440,900,false],[2560,720,false],[4000,500,false]]){
  const l=cameraLayout(w,h,mobile);assert.ok(l.minZoom<=1&&l.maxZoom>=1);
  for(const zoom of [l.minZoom,1,l.maxZoom]){const c=cameraAt(w,h,mobile,zoom);for(const y of [-6.5,6.5])for(const x of [-1,1])for(const z of [-1,1]){
   const ray=new THREE.Raycaster();ray.setFromCamera(new THREE.Vector2(x,z),c);const hit=ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,1,0),-y),new THREE.Vector3());assert.ok(hit);assert.ok(Math.abs(hit.x)<=22.001&&Math.abs(hit.z)<=22.001,`${w}×${h} zoom ${zoom}: ${hit.toArray()}`);
  }}
 }
});
