// Executed in Blockbench Texture.edit; all marks are diffuse paint, without baked lighting.
export const WORLD_PALETTE=[
 ['grama-clara','#91a65b'],['grama-escura','#667e43'],['terra','#b87745'],['trilha','#d2a363'],
 ['areia','#e8ce8a'],['agua-rasa','#67b8ab'],['agua-funda','#347f83'],['pedra','#92927c'],
 ['casca','#805638'],['folhagem-clara','#9ba64e'],['folhagem-escura','#496b40'],['madeira','#b78043'],
 ['betula','#dbd4b5'],['marcas-betula','#4c5142'],['musgo','#788747'],['quartzo','#d9d8c0']
];
export function paintWorldAtlas(canvas,palette){
 const ctx=canvas.getContext('2d'),size=256;ctx.imageSmoothingEnabled=true;
 const hash=(x,y,seed)=>{const n=Math.sin(x*127.1+y*311.7+seed*73.7)*43758.5453;return n-Math.floor(n);};
 const smooth=t=>t*t*(3-2*t),lerp=(a,b,t)=>a+(b-a)*t;
 // Periodic low-frequency value noise: edges match, with no uniform dot pattern.
 function noise(u,v,count,seed){const x=u*count,y=v*count,ix=Math.floor(x),iy=Math.floor(y),fx=smooth(x-ix),fy=smooth(y-iy);const at=(a,b)=>hash((a%count+count)%count,(b%count+count)%count,seed);return lerp(lerp(at(ix,iy),at(ix+1,iy),fx),lerp(at(ix,iy+1),at(ix+1,iy+1),fx),fy);}
 function stroke(points,color,width){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();}
 for(let index=0;index<palette.length;index++){
  const [name,hex]=palette[index],rgb=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));const image=ctx.createImageData(size,size);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
   const u=(x-16)/224,v=(y-16)/224,broad=noise(u,v,4,index+13),detail=noise(u,v,9,index+31);
   const foliage=name.startsWith('folhagem'),stone=name==='pedra'||name==='quartzo';
   let tone=(Math.round(broad*5)/5-.5)*(foliage?28:stone?22:name.startsWith('agua')?20:14)+(Math.round(detail*3)/3-.5)*(foliage?12:4);
   const at=(y*size+x)*4;for(let k=0;k<3;k++)image.data[at+k]=Math.max(0,Math.min(255,rgb[k]+tone));image.data[at+3]=255;
  }
  const ox=index%4*size,oy=Math.floor(index/4)*size;ctx.putImageData(image,ox,oy);ctx.save();ctx.translate(ox,oy);ctx.beginPath();ctx.rect(0,0,size,size);ctx.clip();
  if(name==='casca'||name==='madeira'){
   for(let j=0;j<6;j++){const x=18+j*42;stroke([[x,-12],[x-7,55],[x+8,120],[x-5,192],[x,268]],name==='casca'?'#69472f':'#9e6d3c',name==='casca'?8:5);stroke([[x+12,-12],[x+6,70],[x+15,140],[x+9,205],[x+12,268]],name==='casca'?'#936741':'#c18d51',4);}
  }else if(name.startsWith('agua')){
   const col=name==='agua-rasa'?'#8ac8b8':'#599b9a';stroke([[36,73],[59,77],[82,75]],col,3);stroke([[155,185],[183,189],[210,186]],col,3);
  }else if(name.startsWith('grama')){
   // Only two subtle tufts per large world tile, never five marks per terrain unit.
   ctx.globalAlpha=.35;for(const [x,y] of [[60,87],[185,197]]){stroke([[x,y],[x-4,y-9]],'#637940',2);stroke([[x,y],[x+3,y-12]],'#b4be76',2);}ctx.globalAlpha=1;
  }else if(name==='betula'){
   for(const [x,y] of [[34,60],[146,154],[69,212]])stroke([[x,y],[x+30,y-2]],'#7b7b65',4);
  }ctx.restore();
 }
}
