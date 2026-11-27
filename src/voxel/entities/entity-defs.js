// Definições de jogadora, NPCs e mobs em box model a 8 px por bloco (docs/voxel-entidades.md).
// Proporções humanoides = Minecraft ÷ 2 (cabeça 4³, tronco 4×6×2, membros 2×6×2 → 16 px = 2 blocos).
// `skin`: textura PNG opcional (box UV). Enquanto null, usa `paint` gerado por código no mesmo layout.
// Partes: pivot (px, relativo ao pai), offset da malha em relação ao pivô, size [w,h,d], uv [u,v].

const HUMANOID=(paint)=>[
 {name:'perna-direita',pivot:[-1,6,0],offset:[-1,-6,-1],size:[2,6,2],uv:[0,8],paint:paint.perna},
 {name:'perna-esquerda',pivot:[1,6,0],offset:[-1,-6,-1],size:[2,6,2],uv:[8,24],paint:paint.perna},
 {name:'tronco',pivot:[0,12,0],offset:[-2,-6,-1],size:[4,6,2],uv:[8,8],paint:paint.tronco},
 {name:'braco-direito',pivot:[-3,11,0],offset:[-1,-5,-1],size:[2,6,2],uv:[20,8],paint:paint.braco},
 {name:'braco-esquerdo',pivot:[3,11,0],offset:[-1,-5,-1],size:[2,6,2],uv:[16,24],paint:paint.braco},
 {name:'cabeca',pivot:[0,12,0],offset:[-2,0,-2],size:[4,4,4],uv:[0,0],paint:paint.cabeca},
 // Camada externa (cabelo/chapéu): mesma caixa da cabeça, inflada 0,25 px (= 0,5 px do Minecraft a 16 px).
 {name:'cabeca-externa',overlay:'cabeca',pivot:[0,12,0],offset:[-2,0,-2],size:[4,4,4],uv:[16,0],inflate:.25,paint:paint.externa},
];

export const IARA={
 id:'iara-voxel-v02',name:'Iara',kind:'player',rig:'humanoid',texture:[32,32],skin:null,colliderRadius:.24,
 // Referência aprovada: docs/art/iara-conceito-v01-aprovado.png (cabelo curto, faixa amarela, colete verde,
 // camisa clara, shorts terracota, botas e mochila).
 palette:{H:'#2a1b14',Y:'#f2c230',S:'#8d5a3b',E:'#16100c',V:'#3f7a3a',L:'#efe6d2',B:'#5a3a24',T:'#b5583a',K:'#3d281c',P:'#7a5232'},
 parts:HUMANOID({
  perna:{all:['TT','TT','TT','SS','SS','KK'],py:'T',ny:'K'},
  tronco:{pz:['VLLV','VLLV','VLLV','VVVV','BBBB','TTTT'],nz:['VPPV','VPPV','VPPV','VPPV','BBBB','TTTT'],px:['VV','VV','VV','VV','BB','TT'],nx:['VV','VV','VV','VV','BB','TT'],py:'V',ny:'T'},
  braco:{all:['LL','LL','SS','SS','SS','SS'],py:'L',ny:'S'},
  cabeca:{pz:['HHHH','YYYY','ESSE','SSSS'],nz:['HHHH','YYYY','HHHH','HHHH'],px:['HHHH','YYYY','SSSH','SSSH'],nx:['HHHH','YYYY','HSSS','HSSS'],py:'H',ny:'S'},
  externa:{pz:['HHHH','....','....','....'],nz:['HHHH','....','HHHH','.HH.'],px:['HHHH','....','...H','....'],nx:['HHHH','....','H...','....'],py:'H'},
 }),
};

// NPC provisório (identidade, nome e skin a definir com o usuário).
export const GUIA={
 id:'npc-guia-voxel-v01',name:'Guia (provisório)',kind:'npc',rig:'humanoid',texture:[32,32],skin:null,colliderRadius:.3,speed:1.1,
 palette:{C:'#d9b76a',D:'#b8954a',S:'#c08a5c',E:'#16100c',A:'#3f6fa8',W:'#e8e2d0',N:'#3b3b46',K:'#3d281c'},
 parts:HUMANOID({
  perna:{all:['NN','NN','NN','NN','NN','KK'],py:'N',ny:'K'},
  tronco:{pz:['AWWA','AAAA','AAAA','AAAA','KKKK','NNNN'],fill:'A',py:'A',ny:'N'},
  braco:{all:['AA','AA','AA','SS','SS','SS'],py:'A',ny:'S'},
  cabeca:{pz:['SSSS','ESSE','SSSS','SDDS'],fill:'S'},
  externa:{all:['CCCC','DDDD','....','....'],py:'C'},
 }),
 goals:{stroll:{radius:4,pause:[4,9]},look:{range:6}},
};

const QUAD_LEGS=(uv,size,[fx,fz],[bx,bz],y,paint)=>[
 {name:'perna-frente-esquerda',pivot:[fx,y,fz],offset:[-size[0]/2,-size[1],-size[2]/2],size,uv,paint},
 {name:'perna-frente-direita',pivot:[-fx,y,fz],offset:[-size[0]/2,-size[1],-size[2]/2],size,uv,paint},
 {name:'perna-tras-esquerda',pivot:[bx,y,bz],offset:[-size[0]/2,-size[1],-size[2]/2],size,uv,paint},
 {name:'perna-tras-direita',pivot:[-bx,y,bz],offset:[-size[0]/2,-size[1],-size[2]/2],size,uv,paint},
];

export const CAPIVARA={
 id:'mob-capivara-voxel-v01',name:'Capivara',kind:'mob',rig:'quadruped',texture:[64,32],skin:null,colliderRadius:.4,speed:1.2,
 palette:{B:'#8a5a36',D:'#6b4328',N:'#3a2a20',E:'#111111'},
 parts:[
  {name:'tronco',pivot:[0,2,0],offset:[-2.5,0,-4],size:[5,4,8],uv:[16,0],paint:{fill:'B',py:'D'}},
  {name:'cabeca',pivot:[0,4,4],offset:[-1.5,-.5,0],size:[3,3,4],uv:[0,0],paint:{pz:['BBB','BBB','NNN'],px:['DBBB','BEBB','BBBB'],nx:['BBBD','BBEB','BBBB'],fill:'B',py:'D'}},
  ...QUAD_LEGS([0,16],[2,2,2],[1.5,2.5],[1.5,-2.5],2,{fill:'D'}),
 ],
 goals:{stroll:{radius:10,pause:[3,8]},look:{range:6}},
};

export const TATU={
 id:'mob-tatu-voxel-v01',name:'Tatu',kind:'mob',rig:'quadruped',texture:[32,16],skin:null,colliderRadius:.25,speed:.9,
 palette:{G:'#8f8777',H:'#6f685b',P:'#c9a98a',E:'#111111'},
 parts:[
  {name:'tronco',pivot:[0,1,0],offset:[-2,0,-3],size:[4,3,6],uv:[12,0],paint:{py:['GGGG','HHHH','GGGG','HHHH','GGGG','HHHH'],px:['GHGHGH','GHGHGH','GGGGGG'],nx:['HGHGHG','HGHGHG','GGGGGG'],fill:'G',ny:'P'}},
  {name:'cabeca',pivot:[0,2,3],offset:[-1,-1,0],size:[2,2,3],uv:[0,0],paint:{pz:['PP','PP'],px:['PEP','PPP'],nx:['PEP','PPP'],fill:'P'}},
  {name:'cauda',pivot:[0,2,-3],offset:[-.5,-.5,-3],size:[1,1,3],uv:[8,12],paint:{fill:'H'}},
  ...QUAD_LEGS([0,12],[1,1,1],[1.5,2],[1.5,-2],1,{fill:'P'}),
 ],
 goals:{stroll:{radius:10,pause:[3,8]},look:{range:6}},
};

export const TUCANO={
 id:'mob-tucano-voxel-v01',name:'Tucano',kind:'mob',rig:'bird',texture:[32,16],skin:null,colliderRadius:.2,speed:1,
 palette:{K:'#1d1b1b',W:'#f2efe6',O:'#f08a24',R:'#c43a2a',E:'#2f6fd1',F:'#5b6fae'},
 parts:[
  {name:'perna-esquerda',pivot:[.5,1,0],offset:[-.5,-1,-.5],size:[1,1,1],uv:[16,0],paint:{fill:'F'}},
  {name:'perna-direita',pivot:[-.5,1,0],offset:[-.5,-1,-.5],size:[1,1,1],uv:[16,0],paint:{fill:'F'}},
  {name:'tronco',pivot:[0,1,0],offset:[-1,0,-1],size:[2,3,2],uv:[0,4],paint:{pz:['WW','WW','KK'],fill:'K'}},
  {name:'cabeca',pivot:[0,4,0],offset:[-1,0,-1],size:[2,2,2],uv:[0,0],paint:{pz:['KK','WW'],px:['EK','KK'],nx:['KE','KK'],fill:'K'}},
  {name:'bico',parent:'cabeca',pivot:[0,1,1],offset:[-.5,-.5,0],size:[1,1,3],uv:[8,0],paint:{fill:'O',pz:'R'}},
  {name:'asa-esquerda',pivot:[1,4,0],offset:[0,-2,-1],size:[1,2,2],uv:[8,4],paint:{fill:'K'}},
  {name:'asa-direita',pivot:[-1,4,0],offset:[-1,-2,-1],size:[1,2,2],uv:[8,4],paint:{fill:'K'}},
  {name:'cauda',pivot:[0,1.5,-1],offset:[-1,-.5,-2],size:[2,1,2],uv:[16,4],paint:{fill:'K'}},
 ],
 goals:{stroll:{radius:10,pause:[2,6]},look:{range:6}},
};

export const MOBS=[CAPIVARA,TATU,TUCANO];
export const ENTITY_DEFS=[IARA,GUIA,...MOBS];
