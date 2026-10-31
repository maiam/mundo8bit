import * as THREE from 'three';
import {ROCK_IDS,ROCK_NAMES,FLOWER_IDS,FLOWER_NAMES} from '../src/nature-catalog.js';
export const NATURE_PALETTE=[
 ['pedra-fria','#87948b','#64756f','#b7bbb0'],['pedra-quente','#a4a18a','#797c6c','#c9c4aa'],['musgo','#798c44','#566c39','#a5ad5c'],['quartzo','#d9d5bc','#a6b9b1','#f4ead1'],
 ['haste','#557541','#395a3c','#77944e'],['folha','#668646','#47683c','#9aa65b'],['marfim','#eee4bf','#c7c4a1','#fff3da'],['amarelo','#e7ba46','#b88c32','#f8d875'],
 ['coral','#ce6247','#a5413c','#ec9370'],['rosa','#d78da4','#ac607f','#ebbdc8'],['violeta','#8c73b5','#665488','#b5a1d0'],['azul','#809ec6','#5d77a2','#b3c8db'],
 ['miolo','#96713e','#654e33','#c09a53'],['laranja','#dc8c39','#b56b32','#edb65f'],['fucsia','#b45188','#8a3c70','#d789af'],['cacto','#638454','#426744','#8f9e62'],
];
export function paintNatureAtlas(canvas,palette){
 const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;
 function path(points,color,width=2){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();}
 for(let i=0;i<palette.length;i++){
  const [name,base,shade,light]=palette[i];ctx.save();ctx.translate(i%4*64,Math.floor(i/4)*64);ctx.fillStyle=base;ctx.fillRect(0,0,64,64);
  if(i<4){
   for(const [x,y] of [[10,13],[33,10],[18,34],[40,44]]){ctx.fillStyle=light;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+12,y-3);ctx.lineTo(x+17,y+4);ctx.lineTo(x+5,y+9);ctx.fill();path([[x+1,y+12],[x+11,y+10],[x+18,y+12]],shade,2);}
   if(name==='musgo'){ctx.fillStyle=shade;ctx.fillRect(12,41,12,7);ctx.fillStyle=light;ctx.fillRect(17,37,10,6);}
  }else if(name==='haste'||name==='cacto'){
   for(const x of [14,31,48]){path([[x,8],[x-2,32],[x,55]],shade,2);path([[x+4,10],[x+3,52]],light,2);}
   if(name==='cacto')for(const y of [17,34,48])path([[12,y],[19,y-2],[16,y+3]],'#dad2a5',1);
  }else if(name==='folha'){
   path([[9,53],[30,32],[52,10]],light,3);for(const y of [19,32,44]){path([[64-y,y],[44-y,y-7]],shade,2);path([[64-y,y],[70-y,y+12]],light,2);}
  }else if(name==='miolo'){
   for(let y=12;y<56;y+=11)for(let x=12;x<56;x+=11){ctx.fillStyle=shade;ctx.fillRect(x,y,4,4);ctx.fillStyle=light;ctx.fillRect(x,y,2,1);}
  }else{
   // Directional strokes read as petal veins rather than repeated noise.
   path([[14,52],[22,35],[24,15]],shade,3);path([[28,53],[34,31],[38,11]],light,4);path([[43,49],[47,31],[50,18]],light,2);
  }ctx.restore();
 }
}
function sculpt(){
 const groups=new Map();
 function part(name,g,tile){const flat=g.index?g.toNonIndexed():g;const p=groups.get(name)??{name,position:[],tiles:[]};p.position.push(...flat.attributes.position.array);p.tiles.push(...Array(flat.attributes.position.count/3).fill(tile));groups.set(name,p);}
 function geo(g,pos,scale,tile,name='forma'){g.scale(...scale).translate(...pos);part(name,g,tile);}
 function ball(pos,scale,tile,name='forma'){geo(new THREE.IcosahedronGeometry(1,0),pos,scale,tile,name);}
 function box(pos,scale,tile){geo(new THREE.BoxGeometry(1,1,1),pos,scale,tile);}
 function line(a,b,r=.025,tile=4,name='hastes'){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),d=bv.clone().sub(av);const g=new THREE.CylinderGeometry(r*.7,r,d.length(),4);g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize()));g.translate(...av.add(bv).multiplyScalar(.5).toArray());part(name,g,tile);}
 function tri(points,tile,name){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(points.flat(),3));part(name,g,tile);}
 function blade(base,tip,width,tile=5,name='folhas'){
   const a=new THREE.Vector3(...base),b=new THREE.Vector3(...tip),delta=b.clone().sub(a),side=new THREE.Vector3(-delta.z,0,delta.x).normalize().multiplyScalar(width);
   if(side.lengthSq()<.001)side.set(width,0,0);
   const mid=a.clone().lerp(b,.52),ridge=mid.clone().add(new THREE.Vector3(0,.035,0));
   const left=mid.clone().add(side),right=mid.clone().sub(side);
   tri([a.toArray(),left.toArray(),ridge.toArray(),left.toArray(),b.toArray(),ridge.toArray(),b.toArray(),right.toArray(),ridge.toArray(),right.toArray(),a.toArray(),ridge.toArray()],tile,name);
 }
 function leaves(h=.7,count=3,wide=.12){for(let j=0;j<count;j++){const a=j*2.5;blade([0,h*(.18+j*.17),0],[Math.cos(a)*.33,h*(.45+j*.14),Math.sin(a)*.33],wide);}}
 function petals(center,count,r,tile,rise=0,width=.35,offset=0){for(let j=0;j<count;j++){const a=j/count*Math.PI*2+offset;const base=[center[0]+Math.cos(a)*r*.12,center[1],center[2]+Math.sin(a)*r*.12],tip=[center[0]+Math.cos(a)*r,center[1]+rise,center[2]+Math.sin(a)*r];blade(base,tip,r*width,tile,'petalas');}}
 function bloom(center,count,r,tile,rise=0,width=.35){petals(center,count,r,tile,rise,width);ball(center,[r*.24,.055,r*.24],count>8?12:7,'miolo');}
 return {groups,part,geo,ball,box,line,blade,leaves,petals,bloom,parts:()=>[...groups.values()]};
}
function rock(type){const s=sculpt(),{ball,box,geo,line}=s;
 switch(type){
 case 0:ball([0,.22,0],[.62,.25,.44],0);break;
 case 1:geo(new THREE.DodecahedronGeometry(1,0),[0,.52,0],[.6,.58,.52],0);break;
 case 2:ball([0,.13,0],[.94,.19,.68],1);break;
 case 3:geo(new THREE.ConeGeometry(.43,1.45,5),[.15,.72,0],[1,1,1],0);break;
 case 4:ball([0,.12,0],[.65,.2,.52],0);ball([-.35,.51,0],[.28,.6,.45],1);ball([.3,.43,0],[.26,.49,.46],0);break;
 case 5:for(let i=0;i<4;i++)box([i*.06,.13+i*.21,0],[1.18-i*.2,.24,.83-i*.1],i%2);break;
 case 6:geo(new THREE.TorusGeometry(.58,.22,4,8,Math.PI),[0,.26,0],[1,1,1],0);line([-.58,0,0],[-.58,.3,0],.23,0,'rocha');line([.58,0,0],[.58,.3,0],.23,1,'rocha');break;
 case 7:ball([0,.32,0],[.7,.42,.57],0);ball([-.19,.6,.05],[.37,.08,.4],2,'musgo');ball([.35,.4,.25],[.22,.08,.24],2,'musgo');break;
 case 8:geo(new THREE.OctahedronGeometry(1,0),[0,.65,0],[.4,.9,.38],3,'cristal');break;
 case 9:geo(new THREE.TorusGeometry(.39,.2,5,9),[0,.53,0],[1,1,1],0);break;
 case 10:ball([-.34,.19,0],[.85,.24,.43],0);ball([.35,.4,0],[.46,.55,.4],1);break;
 }return s.parts();}
function flower(type){
 const s=sculpt(),{ball,geo,line,blade,leaves,petals,bloom}=s;
 const tall=[2,3,6,11,16,20,21].includes(type),h=tall?.95:.65;
 if(![8,10,14,15,18].includes(type)){line([0,0,0],[0,h,0]);leaves(h,type===2?3:2,type===2?.16:.1);}
 switch(type){
 case 0:bloom([0,h,0],10,.3,6,.015,.22);break;
 case 1:petals([0,h-.1,0],6,.18,8,.3,.5);ball([0,h+.02,0],[.13,.15,.13],8,'petalas');break;
 case 2:bloom([0,h,0],13,.36,7,.02,.23);ball([0,h+.025,0],[.18,.065,.18],12,'miolo');break;
 case 3:for(let j=0;j<4;j++){const x=(j-1.5)*.11,z=j%2*.1;line([0,.1,0],[x,h-.12+j*.06,z],.013);for(let k=0;k<5;k++)ball([x,h-.4+k*.08+j*.06,z],[.065,.06,.065],10,'flores');}break;
 case 4:for(let j=0;j<3;j++){const x=(j-1)*.21,y=h-j*.12;line([0,y-.12,0],[x,y+.1,.05],.015);geo(new THREE.ConeGeometry(.115,.19,6),[x,y-.01,.05],[1,1,1],11,'sinos');}break;
 case 5:bloom([0,h,0],4,.32,8,.08,.65);ball([0,h+.025,0],[.075,.035,.075],12,'miolo');break;
 case 6:petals([0,h,0],3,.28,10,.3,.3);petals([0,h,0],3,.35,10,-.15,.3,Math.PI/3);break;
 case 7:bloom([0,h,0],6,.3,6,.01,.32);geo(new THREE.CylinderGeometry(.11,.07,.18,6),[0,h+.08,0],[1,1,1],7,'trombeta');break;
 case 8:leaves(.28,5,.13);for(const [x,z] of [[-.14,0],[.12,.04],[0,-.15]]){line([0,0,0],[x,.25,z],.012);bloom([x,.25,z],5,.15,10,.02,.5);}break;
 case 9:bloom([0,h,0],5,.36,8,.07,.65);line([0,h,0],[.08,h+.3,0],.015,7,'estame');ball([.08,h+.3,0],[.035,.04,.035],7,'estame');break;
 case 10:leaves(.2,7,.07);line([0,0,0],[0,.45,0],.015);for(let ring=0;ring<3;ring++)petals([0,.45+ring*.025,0],12,.22-ring*.055,7,.02,.12,ring*.3);break;
 case 11:bloom([0,h,0],6,.35,6,.2,.25);for(let j=0;j<3;j++)line([0,h+.01,0],[Math.cos(j*2)*.08,h+.19,Math.sin(j*2)*.08],.009,7,'estames');break;
 case 12:for(let j=0;j<2;j++){const x=(j-.5)*.32,y=h-j*.22;line([0,.4,0],[x,y,0],.017);petals([x,y,0],3,.23,9,.08,.6);blade([x,y,0],[x,y-.2,.1],.1,14,'labio');}break;
 case 13:geo(new THREE.CylinderGeometry(.17,.06,.3,8,1,true,0,Math.PI*1.65),[0,h+.06,0],[1,1,1],6,'espata');blade([-.06,h+.1,-.12],[.06,h+.38,-.08],.1,6,'espata');line([0,h-.06,.015],[0,h+.18,.015],.022,7,'espadice');break;
 case 14:ball([0,.03,0],[.44,.045,.4],5,'folha-flutuante');for(let j=0;j<3;j++)petals([0,.15+j*.045,0],8,.34-j*.06,9,.15+j*.03,.32,j*.4);ball([0,.33,0],[.08,.07,.08],7,'miolo');break;
 case 15:ball([0,.26,0],[.27,.3,.24],15,'cacto');ball([-.23,.16,0],[.13,.19,.12],15,'cacto');bloom([0,.55,0],8,.23,14,.08,.35);break;
 case 16:ball([0,h,0],[.17,.17,.17],10,'flores-globo');for(let j=0;j<14;j++){const a=j*2.4,y=1-(j/13)*2,r=Math.sqrt(1-y*y)*.2;ball([Math.cos(a)*r,h+y*.2,Math.sin(a)*r],[.075,.07,.075],10,'flores-globo');}break;
 case 17:for(let j=0;j<4;j++)petals([0,h+j*.025,0],9,.35-j*.07,9,.05,.24,j*.3);break;
 case 18:line([0,0,0],[0,.48,0],.025);leaves(.3,5,.16);ball([0,.4,0],[.2,.16,.2],11,'flores');for(let j=0;j<10;j++){const a=j*2.4,r=j<5?.18:.08,y=j<5?.4:.55;bloom([Math.cos(a)*r,y,Math.sin(a)*r],4,.11,11,.025,.5);}break;
 case 19:bloom([0,h+.12,0],8,.28,9,.02,.35);line([0,.3,0],[.23,.42,0],.012);bloom([.23,.42,0],8,.15,9,.02,.35);break;
 case 20:for(let j=0;j<8;j++){const y=.35+j*.08,r=.12*(1-j/10);for(let k=0;k<3;k++){const a=k*2.1+j*.4;ball([Math.cos(a)*r,y,Math.sin(a)*r],[.065*(1-j*.06),.055,.065*(1-j*.06)],10,'flores-espiga');}}break;
 case 21:blade([0,h,0],[.35,h+.04,0],.09,5,'bractea');for(let j=0;j<3;j++)blade([.06,h,0],[-.16+j*.14,h+.38-j*.05,0],.045,13,'petalas');blade([.02,h,0],[-.3,h+.15,.04],.035,11,'petalas');break;
 case 22:for(let j=0;j<3;j++){const x=(j-1)*.22,y=h-j*.08;line([0,.4,0],[x,y+.1,0],.015);geo(new THREE.ConeGeometry(.12,.17,5),[x,y-.02,0],[1,1,1],14,'saias');petals([x,y+.05,0],4,.17,8,-.2,.23);line([x,y-.1,0],[x,y-.25,0],.008,9,'estames');}break;
 }return s.parts();}
export function natureInputs(){return [...ROCK_IDS.map((id,i)=>({id:`pedra-${id}-v01`,name:ROCK_NAMES[i],kind:'rock',catalogId:`P${String(i+1).padStart(2,'0')}`,parts:rock(i)})),...FLOWER_IDS.map((id,i)=>({id:`flor-${id}-v01`,name:FLOWER_NAMES[i],kind:'flower',catalogId:`F${String(i+1).padStart(2,'0')}`,parts:flower(i)}))];}
