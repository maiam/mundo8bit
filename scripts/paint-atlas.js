// Executed inside Blockbench's Painter on its native texture canvas.
// Deliberately drawn motifs and flat colors; no lighting baked into the atlas.
export const PALETTE = [
  ['casca','#76543b','#594331','#a0794e'],
  ['folha','#648148','#4b693b','#899a55'],
  ['folha-clara','#94a454','#778e49','#b0b968'],
  ['folha-escura','#365f49','#2c4d40','#527755'],
  ['betula','#dedbc3','#b4b69f','#f0e8ce'],
  ['marcas-betula','#454c43','#343e38','#65715c'],
  ['camisa','#c66d43','#a65336','#df925a'],
  ['pele','#f3d49b','#d9b57c','#ffe3b0'],
  ['chapeu','#e9b85f','#c69748','#f7d586'],
  ['calca','#354b58','#293b48','#536b72'],
  ['pedra','#8c9b89','#728574','#adbaa2'],
  ['grama','#6e965d','#60834f','#91ad6b'],
  ['grama-clara','#7da467','#6b9259','#9bb779'],
  ['areia','#bfbd89','#aaa877','#d3ce9a'],
  ['agua','#68a7ac','#5a969f','#8fbdba'],
  ['couro','#73503b','#563d30','#a07b4c'],
];
export function paintAtlas(canvas, palette) {
  const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;
  function stroke(points,color,width=2){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='square';ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();}
  for(let index=0;index<palette.length;index++){
    const [name,base,shadow,highlight]=palette[index];
    ctx.save();ctx.translate(index%4*64,Math.floor(index/4)*64);ctx.fillStyle=base;ctx.fillRect(0,0,64,64);
    // Leave a uniform gutter to avoid painted details bleeding across UV islands.
    if(name==='casca'){
      for(const [x,y,h] of [[12,8,19],[27,20,31],[43,8,24],[52,37,16],[15,42,13]]){
        stroke([[x,y],[x-2,y+h*.45],[x+1,y+h]],shadow,3);
        stroke([[x+4,y+3],[x+3,y+h-3]],highlight,2);
      }
      stroke([[29,30],[35,25],[37,31],[32,36],[29,30]],shadow);
    }else if(name.startsWith('folha')){
      for(const [x,y] of [[12,14],[34,9],[45,32],[16,39],[31,49]]){
        stroke([[x,y+4],[x+5,y],[x+12,y+2]],highlight,3);
        stroke([[x+4,y+11],[x+10,y+13],[x+14,y+9]],shadow,2);
      }
    }else if(name==='betula'||name==='marcas-betula'){
      for(const [x,y,w] of [[8,13,16],[31,28,23],[10,43,19],[39,52,14]]){
        ctx.fillStyle=name==='betula'?'#596052':shadow;ctx.fillRect(x,y,w,2);ctx.fillRect(x+3,y+2,w*.5,2);
      }
    }else if(name==='grama'||name==='grama-clara'){
      for(const [x,y] of [[12,14],[39,9],[28,34],[46,47],[10,48]]){
        stroke([[x-3,y+3],[x-4,y-1]],shadow);stroke([[x,y+3],[x+1,y-4],[x+3,y-2]],highlight);
      }
    }else if(name==='agua'){
      stroke([[8,18],[21,18],[24,16],[35,16]],highlight,2);
      stroke([[30,43],[42,43],[44,41],[55,41]],highlight,2);
      stroke([[12,51],[22,51]],shadow,2);
    }else if(name==='areia'||name==='pedra'){
      stroke([[10,18],[19,14],[27,15]],highlight,3);
      stroke([[32,39],[40,35],[52,37]],shadow,2);
      ctx.fillStyle=highlight;ctx.fillRect(17,45,4,2);ctx.fillRect(44,17,3,2);
    }else if(name==='pele'){
      ctx.fillStyle=highlight;ctx.fillRect(14,12,24,5);ctx.fillStyle=shadow;ctx.fillRect(20,45,25,3);
    }else{
      stroke([[10,9],[10,54],[54,54]],shadow,2);
      stroke([[14,11],[48,11]],highlight,2);
      for(let x=17;x<49;x+=8){ctx.fillStyle=highlight;ctx.fillRect(x,49,3,1);}
      if(name==='chapeu'){ctx.fillStyle=shadow;ctx.fillRect(8,40,48,5);}
    }
    ctx.restore();
  }
}
