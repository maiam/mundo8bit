import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {hash} from '../src/world.js';

export const TREE_NAMES = ['Pinheiro', 'Carvalho', 'Cipreste', 'Salgueiro', 'Palmeira', 'Araucária', 'Baobá', 'Acácia', 'Bétula', 'Mangue', 'Seca'];
const bark = '#76543b', green = '#648148', light = '#94a454', dark = '#365f49';
const material = new THREE.MeshStandardMaterial({vertexColors:true, flatShading:true, roughness:1});
const templates = new Map();
const up = new THREE.Vector3(0,1,0);

// A single shared, vertex-colored geometry per species keeps draw calls bounded.
export function treeGeometry(type) {
  if (!Number.isInteger(type) || type < 0 || type >= TREE_NAMES.length) throw new RangeError('Espécie inválida');
  if (templates.has(type)) return templates.get(type);
  const parts = [];
  function part(geometry, color, position, scale = [1,1,1], rotation = new THREE.Quaternion()) {
    geometry.deleteAttribute('uv');
    geometry.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(...position),rotation,new THREE.Vector3(...scale)));
    const c = new THREE.Color(color), colors = [];
    for(let i=0;i<geometry.attributes.position.count;i++) colors.push(c.r,c.g,c.b);
    geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
    const flat = geometry.index ? geometry.toNonIndexed() : geometry;
    if(flat !== geometry) geometry.dispose();
    parts.push(flat);
  }
  function branch(a,b,r=.14,color=bark,tip=r*.6) {
    const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),delta=end.clone().sub(start);
    part(new THREE.CylinderGeometry(tip,r,delta.length(),5),color,start.add(end).multiplyScalar(.5).toArray(),[1,1,1],new THREE.Quaternion().setFromUnitVectors(up,delta.normalize()));
  }
  function crown(x,y,z,sx=1,sy=.8,sz=sx,color=green) {
    part(new THREE.IcosahedronGeometry(1,0),color,[x,y,z],[sx,sy,sz]);
  }
  function cone(x,y,z,r,h,color=dark) {part(new THREE.ConeGeometry(r,h,7),color,[x,y,z]);}
  function radial(count,callback) {for(let i=0;i<count;i++){const a=i/count*Math.PI*2;callback(Math.cos(a),Math.sin(a),i);}}
  switch(type) {
    case 0: // Tiered pine.
      branch([0,0,0],[0,3.7,0],.22);
      for(let i=0;i<4;i++)cone(0,1.55+i*.65,0,1.25-i*.25,1.65,i%2?green:dark);
      break;
    case 1: // Broad oak with exposed forked limbs.
      branch([0,0,0],[0,2.2,0],.35);
      radial(5,(x,z,i)=>{branch([0,1.3,0],[x*1.15,2.6,z*1.15],.18);crown(x*1.1,2.9+(i%2)*.3,z*1.1,1.1,1,1.05,i%2?light:green);});
      crown(0,3.65,0,1.15,.95,1.1,light);break;
    case 2:
      branch([0,0,0],[0,3.7,0],.16);crown(0,2.3,0,.57,1.85,.57,dark);cone(0,3.7,0,.4,1.4,dark);break;
    case 3: // Willow: long pendant foliage, not a spherical crown.
      branch([0,0,0],[0,2.6,0],.28);
      radial(7,(x,z,i)=>{branch([0,1.6,0],[x*1.3,2.8,z*1.3],.13);crown(x,2.9,z,.85,.5,.8,i%2?light:green);crown(x*1.5,1.95,z*1.5,.4,1.05,.4,light);});break;
    case 4: // Curved palm and angular folded fronds.
      branch([0,0,0],[.25,1.5,0],.21);branch([.25,1.5,0],[.65,3.25,0],.17);
      radial(7,(x,z)=>{
        const a=[.65,3.3,0],b=[.65+x*.9,3.65,z*.9],c=[.65+x*2,2.8,z*2];
        branch(a,b,.055,dark);branch(b,c,.04,dark);
        const side=[-z*.35,0,x*.35];
        const vertices=[...a,b[0]+side[0],b[1],b[2]+side[2],...c,...a,...c,b[0]-side[0],b[1]-.12,b[2]-side[2]];
        const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.computeVertexNormals();
        // Explicit reverse faces make fronds readable from below as well.
        const reversed=new THREE.BufferGeometry();reversed.setAttribute('position',new THREE.Float32BufferAttribute([...vertices.slice(6,9),...vertices.slice(3,6),...vertices.slice(0,3),...vertices.slice(15,18),...vertices.slice(12,15),...vertices.slice(9,12)],3));reversed.computeVertexNormals();
        part(g,green,[0,0,0]);part(reversed,green,[0,0,0]);
      });break;
    case 5:
      branch([0,0,0],[0,4,0],.22);
      for(let tier=0;tier<3;tier++)radial(5,(x,z,i)=>{const r=tier===2?1.05:1.4;const y=2.1+tier*.85;branch([0,y-.3,0],[x*r,y,z*r],.09);crown(x*r,y+.2,z*r,.8,.35,.7,i%2?green:dark);});crown(0,4.15,0,1,.35,1,dark);break;
    case 6:
      part(new THREE.CylinderGeometry(.5,.85,2.7,7),bark,[0,1.35,0]);
      radial(5,(x,z,i)=>{branch([x*.3,2, z*.3],[x*1.15,3.3+(i%2)*.3,z*1.15],.25);crown(x*1.2,3.5+(i%2)*.3,z*1.2,.8,.45,.7,green);});break;
    case 7:
      branch([0,0,0],[.3,1.6,0],.24);
      radial(5,(x,z,i)=>{branch([.3,1.4,0],[x*1.65,2.5+(i%2)*.25,z*1.65],.13);crown(x*1.5,2.85+(i%2)*.25,z*1.5,1.2,.35,1,light);});break;
    case 8:
      branch([0,0,0],[0,3.5,0],.16,'#dedbc3');
      for(let i=0;i<6;i++) {const y=.4+i*.48;branch([-.12,y,0],[.12,y+.08,0],.035,'#454c43');}
      radial(5,(x,z,i)=>{branch([0,1.3+i*.28,0],[x*.7,2.3+i*.3,z*.7],.065,'#dedbc3');crown(x*.65,2.65+i*.27,z*.65,.58,.95,.6,i%2?light:green);});break;
    case 9:
      radial(6,(x,z)=>{branch([x*.25,1.3,z*.25],[x*.8,.6,z*.8],.11);branch([x*.8,.6,z*.8],[x*1.2,-.2,z*1.2],.085);});
      branch([0,.6,0],[0,2.4,0],.24);
      radial(4,(x,z,i)=>{branch([0,1.6,0],[x,2.5,z],.13);crown(x,2.8,z,1,.65,.9,i%2?light:green);});crown(0,3,0,1,.7,1);break;
    case 10:
      branch([0,0,0],[-.25,1.4,0],.28);branch([-.25,1.4,0],[.15,2.6,.1],.2);branch([.15,2.6,.1],[0,3.8,.2],.1,bark,.025);
      radial(5,(x,z,i)=>{const y=1.3+i*.28;branch([0,y,0],[x*1.1,y+.5,z*1.1],.12);branch([x*1.1,y+.5,z*1.1],[x*1.5,y+1.2,z*1.5],.06,bark,.015);branch([x*1.1,y+.5,z*1.1],[x*1.7,y+.65,z*.9],.045,bark,.01);});break;
  }
  const geometry=mergeGeometries(parts);for(const p of parts)p.dispose();
  geometry.computeBoundingSphere();templates.set(type,geometry);return geometry;
}
export function treeTypeAt(x,z,height) {
  const value=hash(x+73,z-91);
  if(height < -.85) return value < .65 ? 9 : 4;
  return Math.floor(value*TREE_NAMES.length);
}
export function createTree(type,x,z) {
  const tree=new THREE.Mesh(treeGeometry(type),material);
  const scale=.8+hash(x-51,z+18)*.35;
  tree.scale.setScalar(scale);tree.rotation.y=hash(x+19,z)*Math.PI*2;
  tree.userData.species=TREE_NAMES[type];return tree;
}
