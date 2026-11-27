import * as THREE from 'three';
// Scale calibrated to the approved review: at animal.scale=.93, width is 2.35 units.
export function createAnimalSprite(texture,appearance){
 const material=new THREE.SpriteMaterial({map:texture,transparent:true,alphaTest:.12,depthTest:true,depthWrite:false,fog:true});
 const sprite=new THREE.Sprite(material);sprite.name='animal-sprite';
 sprite.center.set(...appearance.center);sprite.position.y=appearance.lift;
 sprite.scale.set(appearance.width,appearance.height,1);
 const group=new THREE.Group();group.name='Onça-pintada 2D';group.userData.billboard=true;group.add(sprite);return group;
}
export function faceAnimalSprite(sprite,angle,moving){
 // Preserve the last side when idle or moving vertically, avoiding flicker at the threshold.
 if(moving&&Math.abs(Math.sin(angle))>.15)sprite.scale.x=Math.abs(sprite.scale.x)*(Math.sin(angle)>0?-1:1);
}
