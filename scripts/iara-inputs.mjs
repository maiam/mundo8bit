import * as THREE from 'three';
export const IARA_PALETTE=[['pele','#c98250','#b76c40','#db9b64'],['cabelo','#302924','#231f1d','#493a30'],['colete','#697044','#535c36','#828957'],['camisa','#eee0b9','#d5c69e','#fff0ce'],['shorts','#b65e38','#93482d','#ce7950'],['botas','#59402d','#3e3025','#77563b'],['faixa','#e6ae41','#c18b2f','#f4cb68'],['mochila','#805735','#62432e','#a27749'],['olhos','#252824','#1d211e','#393f32'],['brilho','#fff3d5','#e5d4b3','#fff9e7'],['boca','#874a35','#713d2f','#ab6345'],['meias','#d6c7a7','#bdae90','#eee0bf'],['sobrancelha','#423027','#30231e','#62432f'],['fivela','#c79643','#a77a36','#dfb764'],['bolso','#768051','#5e683e','#909965'],['sola','#362e24','#29251f','#514333']];
export function paintIaraAtlas(canvas,palette){const ctx=canvas.getContext('2d');for(let i=0;i<palette.length;i++){const [,base,shade,light]=palette[i],x=i%4*64,y=Math.floor(i/4)*64;ctx.fillStyle=base;ctx.fillRect(x,y,64,64);if([8,9,10,12].includes(i))continue;ctx.globalAlpha=.35;ctx.fillStyle=light;ctx.fillRect(x+10,y+10,39,5);ctx.fillRect(x+16,y+17,22,3);ctx.fillStyle=shade;ctx.fillRect(x+11,y+46,40,5);ctx.globalAlpha=1;}}
export function iaraInputs(){const groups=new Map();
 function add(name,g,tile,pivot){const flat=g.index?g.toNonIndexed():g;let p=groups.get(name);if(!p){p={name,position:[],tiles:[],pivot};groups.set(name,p);}p.position.push(...flat.attributes.position.array);p.tiles.push(...Array(flat.attributes.position.count/3).fill(tile));}
 function box(n,pos,size,t,pivot){add(n,new THREE.BoxGeometry(...size).translate(...pos),t,pivot);}
 function ell(n,pos,size,t,detail=0){add(n,new THREE.IcosahedronGeometry(1,detail).scale(...size).translate(...pos),t);}
 function link(n,a,b,r1,r2,t,pivot){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),d=bv.clone().sub(av);add(n,new THREE.CylinderGeometry(r2,r1,d.length(),6).applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize())).translate(...av.add(bv).multiplyScalar(.5).toArray()),t,pivot);}
 // +Z is the face; total height 1.76 m, boots on ground; independent limb pivots.
 box('tronco',[0,.88,0],[.43,.43,.28],3);box('shorts',[0,.61,0],[.43,.19,.30],4);
 for(const side of [-1,1]){const leg=side<0?'perna-esquerda':'perna-direita',x=side*.125,p=[x,.64,0];link(leg,p,[x,.20,.015],.092,.074,0,p);box(leg,[x,.535,.005],[.19,.18,.30],4);box(leg,[x,.19,.015],[.15,.14,.19],11);box(leg,[x,.085,.065],[.19,.16,.33],5);box(leg,[x,.025,.065],[.20,.05,.34],15);
 const arm=side<0?'braco-esquerdo':'braco-direito',shoulder=[side*.265,1.035,0],elbow=[side*.34,.83,.035];link(arm,shoulder,elbow,.095,.077,3,shoulder);link(arm,elbow,[side*.38,.64,.08],.067,.055,0);ell(arm,[side*.38,.615,.085],[.071,.085,.062],0);ell(arm,[side*.325,.64,.12],[.028,.045,.03],0);
 box('colete',[side*.154,.89,.168],[.135,.42,.065],2);box('colete',[side*.154,.79,.208],[.11,.115,.025],14);box('colete',[side*.154,.98,.207],[.10,.085,.02],14);
 box('alcas',[side*.185,.99,.214],[.045,.28,.028],7);box('alcas',[side*.185,.91,.234],[.052,.04,.012],13);}
 box('colete-costas',[0,.9,-.159],[.46,.43,.04],2);box('mochila',[0,.86,-.265],[.32,.35,.18],7);box('mochila',[0,.80,-.365],[.23,.13,.045],7);box('mochila',[0,.91,-.367],[.055,.17,.025],5);box('mochila',[0,.87,-.387],[.066,.04,.016],13);
 link('pescoco',[0,1.08,0],[0,1.2,0],.085,.085,0);
 ell('cabeca',[0,1.43,.012],[.29,.30,.255],0,1);
 // Back/side panels leave the face open and form a readable bob silhouette.
 ell('cabelo-coroa',[0,1.59,-.045],[.31,.18,.26],1,1);
 box('cabelo-costas',[0,1.40,-.195],[.53,.44,.13],1);
 for(const side of [-1,1]){link('cabelo-lateral',[side*.245,1.57,-.035],[side*.29,1.19,-.045],.092,.105,1);ell('orelha',[side*.276,1.40,.015],[.052,.08,.045],0);}
 // Swept faceted fringe; eyes are painted-color geometry close to the face.
 const fringe=new THREE.BoxGeometry(.30,.13,.065);fringe.rotateZ(.22).translate(-.09,1.62,.195);add('franja',fringe,1);
 for(const side of [-1,1]){ell('olhos',[side*.11,1.46,.241],[.048,.065,.018],9,1);ell('olhos',[side*.106,1.46,.255],[.027,.046,.012],8,1);ell('olhos',[side*.106-.008,1.48,.267],[.009,.014,.005],9);box('sobrancelhas',[side*.11,1.55,.226],[.083,.023,.024],12);}
 ell('nariz',[0,1.385,.266],[.038,.032,.038],0);link('sorriso',[-.06,1.333,.225],[0,1.317,.242],.009,.009,10);link('sorriso',[0,1.317,.242],[.06,1.333,.225],.009,.009,10);
 // Headband arches over the hair, including visible rear section.
 for(let i=0;i<10;i++){const a=Math.PI*i/10,b=Math.PI*(i+1)/10;link('faixa',[Math.cos(a)*.309,1.43+Math.sin(a)*.31,-.015],[Math.cos(b)*.309,1.43+Math.sin(b)*.31,-.015],.028,.028,6);}
 for(let i=0;i<8;i++){const a=-1+i/4,b=-1+(i+1)/4;link('faixa-frontal',[a*.267,1.65+.055*(1-a*a),.14+.075*(1-a*a)],[b*.267,1.65+.055*(1-b*b),.14+.075*(1-b*b)],.025,.025,6);}
 return [{id:'iara-v01',name:'Iara',kind:'player',parts:[...groups.values()]}];}
