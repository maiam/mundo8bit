import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

const templates=new Map();
export let atlas, worldMaterial, waterMaterial;
export let assetManifest;
export let natureManifest;
export let faunaManifest;
export let playerManifest;
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
      const {scene}=await loader.loadAsync(asset.url);
      const oldMaterials=new Set(),oldTextures=new Set();
      scene.traverse(node=>{if(node.isMesh){
        for(const material of Array.isArray(node.material)?node.material:[node.material]){oldMaterials.add(material);if(material.map)oldTextures.add(material.map);}
        node.material=asset.player?playerMaterial:asset.fauna?faunaMaterial:asset.nature?natureMaterial:worldMaterial;
      }});
      oldTextures.forEach(t=>t.dispose());oldMaterials.forEach(m=>m.dispose());
      if(asset.nature){
        scene.updateMatrixWorld(true);const parts=[],originals=new Set();
        scene.traverse(node=>{if(node.isMesh){const g=node.geometry.clone().applyMatrix4(node.matrixWorld);const flat=g.index?g.toNonIndexed():g;if(flat!==g)g.dispose();parts.push(flat);originals.add(node.geometry);}});
        const geometry=mergeGeometries(parts);parts.forEach(g=>g.dispose());originals.forEach(g=>g.dispose());
        templates.set(asset.id,new THREE.Mesh(geometry,natureMaterial));
      }else templates.set(asset.id,scene);
    }));
    // Water repeats its painted tile; cropping prevents atlas-neighbor bleeding.
    const tile=document.createElement('canvas');tile.width=tile.height=64;
    tile.getContext('2d').drawImage(atlas.image,128,192,64,64,0,0,64,64);
    const waterMap=new THREE.CanvasTexture(tile);waterMap.colorSpace=THREE.SRGBColorSpace;
    waterMap.magFilter=THREE.LinearFilter;waterMap.minFilter=THREE.LinearMipmapLinearFilter;
    waterMap.generateMipmaps=true;waterMap.anisotropy=anisotropy;
    waterMap.wrapS=waterMap.wrapT=THREE.RepeatWrapping;waterMap.repeat.set(90,90);
    waterMaterial=new THREE.MeshStandardMaterial({map:waterMap,roughness:1,flatShading:true});
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
