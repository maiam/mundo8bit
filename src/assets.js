import * as THREE from 'three';
import {createAnimalSprite} from './animal-sprites.js';
import {createPaintedMaterial} from './painted-materials.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

const templates=new Map();
export let atlas, worldMaterial, waterMaterial, terrainMaterial;
export let assetManifest;
export let natureManifest;
export let faunaManifest;
export let playerManifest;
export let grassManifest,grassClearTexture;
export async function loadAssets(renderer) {
  const anisotropy=Math.min(4,renderer?.capabilities.getMaxAnisotropy()??1);
  const response=await fetch('/assets/manifest.json');
  if(!response.ok)throw Error('Catálogo de assets indisponível');
  assetManifest=await response.json();
  atlas=await new THREE.TextureLoader().loadAsync(`/assets/${assetManifest.atlas}`);
  atlas.colorSpace=THREE.SRGBColorSpace;atlas.flipY=false;
  atlas.magFilter=THREE.LinearFilter;atlas.minFilter=THREE.LinearMipmapLinearFilter;
  atlas.generateMipmaps=true;atlas.anisotropy=anisotropy;
  worldMaterial=new THREE.MeshStandardMaterial({map:atlas,flatShading:true,roughness:1,side:THREE.DoubleSide});
  const grassResponse=await fetch('/assets/grass-manifest.json');
  if(!grassResponse.ok)throw Error('Textura de grama indisponível');
  grassManifest=await grassResponse.json();
  grassClearTexture=await new THREE.TextureLoader().loadAsync(`/assets/${grassManifest.texture}`);
  grassClearTexture.colorSpace=THREE.SRGBColorSpace;grassClearTexture.flipY=false;
  grassClearTexture.magFilter=THREE.LinearFilter;grassClearTexture.minFilter=THREE.LinearMipmapLinearFilter;
  grassClearTexture.generateMipmaps=true;grassClearTexture.anisotropy=anisotropy;
  // Mirror-repeat joins the same edge texels, preserving the painting without blurring borders.
  grassClearTexture.wrapS=grassClearTexture.wrapT=THREE.MirroredRepeatWrapping;
  terrainMaterial=createPaintedMaterial(atlas,{grassClear:grassClearTexture});
  const natureResponse=await fetch('/assets/nature-manifest.json');
  if(!natureResponse.ok)throw Error('Catálogo de pedras e flores indisponível');
  natureManifest=await natureResponse.json();
  const natureAtlas=await new THREE.TextureLoader().loadAsync(`/assets/${natureManifest.atlas}`);
  natureAtlas.colorSpace=THREE.SRGBColorSpace;natureAtlas.flipY=false;
  natureAtlas.magFilter=THREE.LinearFilter;natureAtlas.minFilter=THREE.LinearMipmapLinearFilter;
  natureAtlas.generateMipmaps=true;natureAtlas.anisotropy=anisotropy;
  const natureMaterial=new THREE.MeshStandardMaterial({map:natureAtlas,flatShading:true,roughness:1,side:THREE.DoubleSide});
  const faunaResponse=await fetch('/assets/fauna-manifest.json');
  if(!faunaResponse.ok)throw Error('Catálogo de animais indisponível');
  faunaManifest=await faunaResponse.json();
  const faunaAtlas=await new THREE.TextureLoader().loadAsync(`/assets/${faunaManifest.atlas}`);
  faunaAtlas.colorSpace=THREE.SRGBColorSpace;faunaAtlas.flipY=false;
  faunaAtlas.magFilter=THREE.LinearFilter;faunaAtlas.minFilter=THREE.LinearMipmapLinearFilter;faunaAtlas.generateMipmaps=true;faunaAtlas.anisotropy=anisotropy;
  const faunaMaterial=new THREE.MeshStandardMaterial({map:faunaAtlas,flatShading:true,roughness:1,side:THREE.DoubleSide});
  const playerResponse=await fetch('/assets/player-manifest.json');
  if(!playerResponse.ok)throw Error('Modelo da Iara indisponível');
  playerManifest=await playerResponse.json();
  const playerAtlas=await new THREE.TextureLoader().loadAsync(`/assets/${playerManifest.atlas}`);
  playerAtlas.colorSpace=THREE.SRGBColorSpace;playerAtlas.flipY=false;
  playerAtlas.magFilter=THREE.LinearFilter;playerAtlas.minFilter=THREE.LinearMipmapLinearFilter;
  playerAtlas.generateMipmaps=true;playerAtlas.anisotropy=anisotropy;
  const playerMaterial=new THREE.MeshStandardMaterial({map:playerAtlas,flatShading:true,roughness:1,side:THREE.DoubleSide});
  const loader=new GLTFLoader();
  try {
    const assets=[...assetManifest.assets.filter(a=>a.kind!=='surface'&&a.kind!=='player'&&a.id!=='pedra-v02'),...playerManifest.assets.map(a=>({...a,player:true})),...natureManifest.assets.map(a=>({...a,nature:true})),...faunaManifest.assets.map(a=>({...a,fauna:true}))];
    await Promise.all(assets.map(async asset=>{
      if(asset.appearance?.type==='sprite'){
        const texture=await new THREE.TextureLoader().loadAsync(asset.appearance.url);
        texture.colorSpace=THREE.SRGBColorSpace;texture.magFilter=THREE.LinearFilter;
        texture.minFilter=THREE.LinearMipmapLinearFilter;texture.generateMipmaps=true;texture.anisotropy=anisotropy;
        templates.set(asset.id,createAnimalSprite(texture,asset.appearance));return;
      }
      const {scene}=await loader.loadAsync(asset.url);
      const oldMaterials=new Set(),oldTextures=new Set();
      scene.traverse(node=>{if(node.isMesh){
        for(const material of Array.isArray(node.material)?node.material:[node.material]){oldMaterials.add(material);if(material.map)oldTextures.add(material.map);}
        node.material=asset.worldPaint?worldMaterial:asset.player?playerMaterial:asset.fauna?faunaMaterial:asset.nature?natureMaterial:worldMaterial;
      }});
      oldTextures.forEach(t=>t.dispose());oldMaterials.forEach(m=>m.dispose());
      if(asset.nature){
        scene.updateMatrixWorld(true);const parts=[],originals=new Set();
        scene.traverse(node=>{if(node.isMesh){const g=node.geometry.clone().applyMatrix4(node.matrixWorld);const flat=g.index?g.toNonIndexed():g;if(flat!==g)g.dispose();parts.push(flat);originals.add(node.geometry);}});
        const geometry=mergeGeometries(parts);parts.forEach(g=>g.dispose());originals.forEach(g=>g.dispose());
        templates.set(asset.id,new THREE.Mesh(geometry,asset.worldPaint?worldMaterial:natureMaterial));
      }else templates.set(asset.id,scene);
    }));
    waterMaterial=createPaintedMaterial(atlas,{water:true});
  } catch(error) {throw new Error('Não foi possível carregar os modelos pintados. Recarregue a página.',{cause:error});}
}
export function cloneAsset(id) {
  const template=templates.get(id);if(!template)throw Error(`Asset não carregado: ${id}`);
  // Clones retain the shared geometry, texture and material throughout streaming.
  return template.clone(true);
}
export function appendTileUV(uv,tile,dx,dz) {
  uv.push((tile%4*64+4+dx*56)/256,(Math.floor(tile/4)*64+4+dz*56)/256);
}

export function createAssetInstances(id,placements,originX,originZ){
  const template=templates.get(id);if(!template?.isMesh)throw Error(`Asset não preparado para instâncias: ${id}`);
  const mesh=new THREE.InstancedMesh(template.geometry,template.material,placements.length);
  const transform=new THREE.Object3D();
  placements.forEach((p,i)=>{transform.position.set(p.x-originX,p.y,p.z-originZ);transform.rotation.y=p.angle;transform.scale.setScalar(p.scale);transform.updateMatrix();mesh.setMatrixAt(i,transform.matrix);});
  mesh.computeBoundingSphere();mesh.userData.assetId=id;return mesh;
}

const footprintCache=new Map();
export function assetFootprint(id){
 if(footprintCache.has(id))return footprintCache.get(id);
 const box=new THREE.Box3().setFromObject(templates.get(id));
 const footprint={minX:box.min.x,maxX:box.max.x,minZ:box.min.z,maxZ:box.max.z};footprintCache.set(id,footprint);return footprint;
}
