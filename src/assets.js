import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

const templates=new Map();
export let atlas, worldMaterial, waterMaterial;
export let assetManifest;
export async function loadAssets() {
  const response=await fetch('/assets/manifest.json');
  if(!response.ok)throw Error('Catálogo de assets indisponível');
  assetManifest=await response.json();
  atlas=await new THREE.TextureLoader().loadAsync(`/assets/${assetManifest.atlas}`);
  atlas.colorSpace=THREE.SRGBColorSpace;atlas.flipY=false;
  atlas.magFilter=atlas.minFilter=THREE.NearestFilter;atlas.generateMipmaps=false;
  worldMaterial=new THREE.MeshStandardMaterial({map:atlas,flatShading:true,roughness:1,side:THREE.DoubleSide});
  const loader=new GLTFLoader();
  try {
    await Promise.all(assetManifest.assets.filter(a=>a.kind!=='surface').map(async asset=>{
      const {scene}=await loader.loadAsync(asset.url);
      const oldMaterials=new Set(),oldTextures=new Set();
      scene.traverse(node=>{if(node.isMesh){
        for(const material of Array.isArray(node.material)?node.material:[node.material]){oldMaterials.add(material);if(material.map)oldTextures.add(material.map);}
        node.material=worldMaterial;
      }});
      oldTextures.forEach(t=>t.dispose());oldMaterials.forEach(m=>m.dispose());
      templates.set(asset.id,scene);
    }));
    // Water repeats its painted tile; cropping prevents atlas-neighbor bleeding.
    const tile=document.createElement('canvas');tile.width=tile.height=64;
    tile.getContext('2d').drawImage(atlas.image,128,192,64,64,0,0,64,64);
    const waterMap=new THREE.CanvasTexture(tile);waterMap.colorSpace=THREE.SRGBColorSpace;
    waterMap.magFilter=waterMap.minFilter=THREE.NearestFilter;waterMap.generateMipmaps=false;
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
