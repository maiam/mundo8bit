import * as THREE from 'three';
import {ANIMAL_IDS,ANIMAL_NAMES,ANIMAL_SPEEDS} from '../src/fauna-catalog.js';
export const FAUNA_PALETTE=[
 ['onca','#c69a48','#795632','#e0ba6b'],['anta','#655e58','#474541','#8c8478'],['veado-quati','#ad784b','#795336','#cd9a63'],['capivara','#987648','#6f573b','#b99a68'],
 ['creme','#dac9a5','#b1a58a','#eee1bd'],['nariz-cascos','#504f49','#353a36','#737166'],['tamandua','#b7a16c','#8f7c53','#d6c18c'],['preto','#393d38','#292e2c','#596057'],
 ['carapaca','#8d8273','#615e55','#b2a48f'],['macaco','#695240','#473e33','#967451'],['preguica','#958773','#726956','#b6aa91'],['bico','#d99837','#af672b','#edb652'],
 ['iris','#c99e42','#997033','#e6bf67'],['marrom-escuro','#61543c','#443e32','#85704d'],['coruja','#9c8456','#716345','#c2ac79'],['olho-azul','#6d9d9c','#4f777c','#9dbfba'],
];
export function paintFaunaAtlas(canvas,palette){
 const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;
 function path(points,color,width=2){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineJoin='round';ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();}
 for(let i=0;i<palette.length;i++){
  const [name,base,shade,light]=palette[i];ctx.save();ctx.translate(i%4*64,Math.floor(i/4)*64);ctx.fillStyle=base;ctx.fillRect(0,0,64,64);
  if(name==='onca'){
   for(const [x,y] of [[16,16],[43,18],[24,43],[49,46]]){path([[x-7,y-3],[x-4,y-8],[x+4,y-7],[x+7,y-1],[x+3,y+6],[x-5,y+6],[x-7,y-3]],'#4d4230',3);ctx.fillStyle=shade;ctx.fillRect(x,y,3,3);}
  }else if(name==='carapaca'){
   for(const y of [11,24,37,50]){path([[6,y],[57,y]],shade,2);for(let x=10;x<58;x+=13){path([[x,y],[x,y+10]],shade,2);path([[x+3,y+3],[x+9,y+3]],light,2);}}
  }else if(name==='coruja'){
   for(const [x,y] of [[13,13],[37,11],[24,32],[44,44],[12,50]]){path([[x-5,y],[x,y+8],[x+5,y]],shade,3);path([[x-4,y-4],[x,y+1]],light,2);}
  }else if(name==='nariz-cascos'||name==='preto'||name==='iris'||name==='olho-azul'){
   ctx.fillStyle=light;ctx.fillRect(14,12,14,3);
  }else if(name==='bico'){
   path([[9,17],[30,13],[54,17]],light,3);path([[11,46],[35,50],[53,44]],shade,2);
  }else{
   for(const [x,y] of [[13,12],[37,16],[22,35],[44,47]]){path([[x,y],[x+5,y+10],[x+8,y+5]],shade,2);path([[x+5,y-2],[x+8,y+4]],light,2);}
  }ctx.restore();
 }
}
function sculpt(){
 const groups=new Map();
 function add(name,g,tile,pivot=null){const flat=g.index?g.toNonIndexed():g,p=groups.get(name)??{name,position:[],tiles:[],pivot};p.position.push(...flat.attributes.position.array);p.tiles.push(...Array(flat.attributes.position.count/3).fill(tile));if(pivot)p.pivot=pivot;groups.set(name,p);}
 function ell(name,pos,scale,tile,detail=0){const g=new THREE.IcosahedronGeometry(1,detail);g.scale(...scale).translate(...pos);add(name,g,tile);}
 function box(name,pos,scale,tile){const g=new THREE.BoxGeometry(...scale);g.translate(...pos);add(name,g,tile);}
 function link(name,a,b,r,tile,tip=r*.72,pivot=null){const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),d=end.clone().sub(start);const g=new THREE.CylinderGeometry(tip,r,d.length(),5);g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize()));g.translate(...start.add(end).multiplyScalar(.5).toArray());add(name,g,tile,pivot);}
 function eyes(head,width,y,z,iris=12){for(const side of [-1,1]){ell(head,[side*width,y,z],[.055,.052,.025],5);ell(head,[side*width,y,z+.022],[.034,.034,.015],iris);ell(head,[side*width,y,z+.037],[.018,.023,.01],7);}}
 function ears(head,width,y,z,tile,pointed=false){for(const side of [-1,1]){if(pointed){const g=new THREE.ConeGeometry(.095,.23,4);g.rotateZ(-side*.22).translate(side*width,y,z);add(head,g,tile);}else ell(head,[side*width,y,z],[.095,.12,.055],tile);ell(head,[side*width,y-.012,z+.04],[.052,.075,.02],13);}}
 function legs(width,front,back,hip,r,tile,footTile=5,shortArms=false){for(const side of [-1,1])for(const forward of [true,false]){
  const name=`perna-${forward?'frente':'tras'}-${side<0?'esquerda':'direita'}`,z=forward?front:back,p=[side*width*.65,hip+.16,z*.65];
  const knee=[side*width,hip*.5,z+(forward?-.035:.06)],ankle=[side*width,.09,z+(forward&&shortArms?.18:.03)];
  link(name,p,knee,r*1.15,tile,r,p);link(name,knee,ankle,r,tile,r*.7);ell(name,[side*width,.055,ankle[2]+.045],[r*1.25,.065,r*1.65],footTile);
 }}
 function tail(points,r,tile,ringed=false){for(let i=1;i<points.length;i++)link('cauda',points[i-1],points[i],r*(1-(i-1)/points.length*.8),ringed?(i%2?tile:7):tile,r*(1-i/points.length*.8),points[0]);}
 function pivot(name,value){const part=groups.get(name);if(part)part.pivot=value;}
 return {ell,box,link,eyes,ears,legs,tail,pivot,parts:()=>[...groups.values()]};
}
function animal(type){const s=sculpt(),{ell,box,link,eyes,ears,legs,tail,pivot}=s;
 switch(type){
 case 0: // Jaguar: heavy paws, rosettes, short ears and long tail.
  ell('corpo',[0,.7,-.1],[.33,.34,.64],0,1);ell('corpo',[0,.53,.05],[.26,.18,.48],4);
  ell('cabeca',[0,.94,.6],[.29,.28,.28],0,1);ell('cabeca',[-.09,.82,.82],[.15,.12,.14],4);ell('cabeca',[.09,.82,.82],[.15,.12,.14],4);ell('cabeca',[0,.89,.93],[.07,.045,.04],5);
  eyes('cabeca',.15,1,.82);ears('cabeca',.2,1.19,.57,0);legs(.24,.35,-.5,.65,.09,0,0);tail([[0,.75,-.64],[.1,.65,-1.02],[.22,.48,-1.38],[.4,.55,-1.52],[.45,.75,-1.48]],.065,0);pivot('cabeca',[0,.85,.42]);break;
 case 1: // Tapir with a short flexible proboscis.
  ell('corpo',[0,.75,-.08],[.45,.5,.72],1,1);ell('corpo',[0,.83,.42],[.34,.36,.4],1);
  ell('cabeca',[0,.94,.72],[.28,.28,.32],1);link('cabeca',[0,.9,.89],[0,.71,1.08],.14,1,.09);link('cabeca',[0,.71,1.08],[0,.57,1.1],.09,1,.07);
  eyes('cabeca',.18,1.02,.91,5);ears('cabeca',.21,1.22,.58,4);legs(.3,.4,-.5,.6,.12,1);tail([[0,.75,-.7],[0,.65,-.88]],.045,1);pivot('cabeca',[0,.9,.5]);break;
 case 2:
  ell('corpo',[0,1.02,-.06],[.28,.31,.52],2);ell('corpo',[0,.89,.02],[.22,.16,.4],4);link('corpo',[0,1.05,.32],[0,1.5,.55],.17,2,.12);
  ell('cabeca',[0,1.59,.61],[.16,.2,.23],2);ell('cabeca',[0,1.53,.83],[.1,.09,.13],2);ell('cabeca',[0,1.55,.95],[.06,.04,.035],5);eyes('cabeca',.105,1.66,.78);ears('cabeca',.22,1.77,.53,2,true);
  for(const side of [-1,1]){link('cabeca',[side*.09,1.75,.55],[side*.17,2.03,.45],.03,13,.019);link('cabeca',[side*.17,2.03,.45],[side*.23,2.22,.49],.02,13,.009);link('cabeca',[side*.13,1.88,.5],[side*.28,2.01,.63],.02,13,.009);}
  legs(.2,.31,-.4,.86,.052,2);tail([[0,1.12,-.51],[0,1.25,-.68]],.065,4);pivot('cabeca',[0,1.43,.49]);break;
 case 3:
  ell('corpo',[0,.48,-.14],[.39,.36,.62],3,1);box('cabeca',[0,.67,.51],[.48,.4,.5],3);ell('cabeca',[0,.59,.79],[.2,.13,.1],3);box('cabeca',[0,.69,.79],[.22,.12,.025],5);eyes('cabeca',.17,.79,.77,5);ears('cabeca',.2,.9,.4,3);legs(.27,.23,-.51,.38,.11,3);pivot('cabeca',[0,.6,.29]);break;
 case 4:
  ell('corpo',[0,.46,-.05],[.23,.27,.46],2);ell('cabeca',[0,.56,.39],[.18,.19,.2],2);link('cabeca',[0,.53,.5],[0,.43,.83],.1,4,.035);ell('cabeca',[0,.43,.84],[.045,.035,.04],5);eyes('cabeca',.105,.62,.54,5);ears('cabeca',.15,.73,.29,4);legs(.17,.26,-.34,.4,.052,2);
  tail([[0,.54,-.42],[.05,.8,-.6],[.1,1.1,-.65],[.12,1.36,-.55],[.1,1.5,-.4]],.07,2,true);pivot('cabeca',[0,.52,.23]);break;
 case 5:
  ell('corpo',[0,.54,-.1],[.29,.31,.54],6,1);ell('corpo',[0,.55,.07],[.3,.32,.25],7);link('corpo',[0,.57,.28],[0,.63,.5],.19,6,.13);
  ell('cabeca',[0,.66,.52],[.15,.16,.2],6);link('cabeca',[0,.64,.62],[0,.45,1.02],.1,6,.025);ell('cabeca',[0,.45,1.04],[.03,.025,.035],7);eyes('cabeca',.09,.7,.66,5);ears('cabeca',.12,.8,.44,6);legs(.22,.24,-.42,.43,.075,6,5);
  for(const side of [-1,1])for(let k=0;k<2;k++)link(`perna-frente-${side<0?'esquerda':'direita'}`,[side*.22+(k-.5)*.04,.11,.35],[side*.22+(k-.5)*.04,.025,.45],.016,4,.007);
  tail([[0,.59,-.6],[.12,.35,-.94],[.25,.16,-1.12],[.4,.18,-1.14],[.46,.3,-1.04]],.11,6);pivot('cabeca',[0,.6,.4]);break;
 case 6:
  ell('corpo',[0,.38,-.08],[.33,.33,.51],8,1);ell('corpo',[0,.25,.06],[.25,.15,.36],13);ell('cabeca',[0,.31,.43],[.15,.14,.22],8);link('cabeca',[0,.28,.51],[0,.17,.74],.1,8,.035);eyes('cabeca',.105,.37,.55,5);ears('cabeca',.1,.52,.36,8,true);legs(.23,.24,-.37,.25,.055,8);
  tail([[0,.26,-.55],[0,.16,-.85],[.05,.1,-1.1]],.06,8);pivot('cabeca',[0,.3,.32]);break;
 case 7:
  ell('corpo',[0,.65,-.05],[.23,.3,.4],9);ell('corpo',[0,.71,.22],[.19,.2,.24],4);ell('cabeca',[0,.96,.38],[.2,.22,.19],9);ell('cabeca',[0,.95,.53],[.155,.17,.06],4);ell('cabeca',[0,.87,.6],[.095,.08,.06],13);eyes('cabeca',.09,1,.59,5);ears('cabeca',.23,1.01,.38,9);ell('cabeca',[0,1.15,.4],[.17,.07,.14],7);
  legs(.18,.24,-.3,.59,.045,9,5,true);tail([[0,.8,-.4],[.11,1.03,-.62],[.16,1.37,-.58],[.13,1.52,-.35],[.06,1.39,-.23]],.055,9);pivot('cabeca',[0,.85,.3]);break;
 case 8:
  ell('corpo',[0,.46,-.13],[.37,.37,.47],10,1);ell('cabeca',[0,.65,.35],[.25,.23,.2],4);for(const side of [-1,1])ell('cabeca',[side*.13,.67,.51],[.095,.06,.02],13);eyes('cabeca',.13,.68,.53,5);ell('cabeca',[0,.59,.56],[.065,.04,.035],5);
  legs(.26,.25,-.36,.45,.065,10,10,true);for(const side of [-1,1])for(let k=0;k<3;k++)link(`perna-frente-${side<0?'esquerda':'direita'}`,[side*.26+(k-1)*.035,.09,.48],[side*.26+(k-1)*.035,.035,.58],.014,4,.008);pivot('cabeca',[0,.56,.25]);break;
 case 9:
  ell('corpo',[0,.43,0],[.2,.29,.27],7);ell('corpo',[0,.5,.2],[.15,.2,.1],4);ell('cabeca',[0,.78,.14],[.18,.18,.18],7);ell('cabeca',[0,.74,.28],[.13,.13,.07],4);ell('cabeca',[0,.8,.54],[.16,.12,.32],11);ell('cabeca',[0,.77,.82],[.115,.085,.12],7);
  for(const side of [-1,1]){ell('cabeca',[side*.15,.84,.27],[.048,.05,.02],15);ell('cabeca',[side*.15,.84,.29],[.023,.029,.01],7);}
  for(const side of [-1,1]){const name=`perna-${side<0?'esquerda':'direita'}`;link(name,[side*.11,.22,0],[side*.11,.065,.03],.023,5,.018,[side*.11,.22,0]);for(let k=0;k<3;k++)link(name,[side*.11,.05,.03],[side*.11+(k-1)*.07,.03,.16],.012,5,.007);ell(`asa-${side<0?'esquerda':'direita'}`,[side*.18,.43,-.04],[.075,.21,.23],7);pivot(`asa-${side<0?'esquerda':'direita'}`,[side*.17,.57,.03]);}
  tail([[0,.31,-.18],[0,.18,-.52]],.09,7);pivot('cabeca',[0,.66,.12]);break;
 case 10:
  ell('corpo',[0,.45,0],[.26,.35,.22],14,1);ell('corpo',[0,.42,.2],[.19,.25,.055],4);ell('cabeca',[0,.86,.04],[.27,.24,.18],14);for(const side of [-1,1]){ell('cabeca',[side*.11,.88,.19],[.12,.14,.035],4);ell('cabeca',[side*.11,.89,.224],[.075,.075,.02],5);ell('cabeca',[side*.11,.89,.245],[.055,.055,.012],12);ell('cabeca',[side*.11,.89,.26],[.026,.038,.009],7);link('cabeca',[side*.2,1.02,.02],[side*.27,1.2,0],.07,14,.005);}
  link('cabeca',[0,.8,.22],[0,.73,.3],.045,11,.005);
  for(const side of [-1,1]){const name=`perna-${side<0?'esquerda':'direita'}`;link(name,[side*.14,.19,0],[side*.14,.06,.04],.03,5,.02,[side*.14,.19,0]);for(let k=0;k<3;k++)link(name,[side*.14,.05,.04],[side*.14+(k-1)*.07,.025,.16],.014,5,.008);ell(`asa-${side<0?'esquerda':'direita'}`,[side*.24,.43,-.02],[.085,.26,.19],14);pivot(`asa-${side<0?'esquerda':'direita'}`,[side*.2,.64,.02]);}tail([[0,.25,-.2],[0,.1,-.4]],.07,14);pivot('cabeca',[0,.74,0]);break;
 }
 return s.parts();}
export function faunaInputs(){return ANIMAL_IDS.map((id,i)=>{const parts=animal(i);return {id:`animal-${id}-v01`,name:ANIMAL_NAMES[i],kind:'animal',catalogId:`A${String(i+1).padStart(2,'0')}`,species:i,speed:ANIMAL_SPEEDS[i],parts,rig:parts.filter(p=>p.pivot).map(p=>({name:p.name,pivot:p.pivot}))};});}
