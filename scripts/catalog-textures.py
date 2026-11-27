"""Inventário e pranchas documentais. Python 3 + Pillow; não modifica fontes."""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import json,hashlib,csv
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'docs/texturas';OUT.mkdir(exist_ok=True)
rows=[]
for base in ['assets','archive/classico/assets','archive/classico/public/assets']:
 for p in sorted((ROOT/base).rglob('*.png')):
  with Image.open(p) as im:w,h=im.size
  role='histórico — fora do runtime' if base.startswith('archive') else ('guia UV — não é textura final' if 'guia-uv' in p.name else 'referência exportada — runtime procedural')
  rows.append(dict(path=p.relative_to(ROOT).as_posix(),width=w,height=h,sha256=hashlib.sha256(p.read_bytes()).hexdigest(),status=role))
(OUT/'inventario.json').write_text(json.dumps(rows,indent=2,ensure_ascii=False)+'\n')
with (OUT/'inventario.csv').open('w') as f:
 writer=csv.DictWriter(f,fieldnames=['path','width','height','sha256','status']);writer.writeheader();writer.writerows(rows)
font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',15)
small=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',12)
def board(items,name,title,cols=4,cellw=240,cellh=190):
 canvas=Image.new('RGB',(cols*cellw,100+((len(items)+cols-1)//cols)*cellh),'#142923');d=ImageDraw.Draw(canvas);d.text((22,18),title,font=font,fill='#fff2cc');d.text((22,48),'Consulta • nearest • não são novos assets aprovados',font=small,fill='#c1cbb5')
 for i,(p,label) in enumerate(items):
  x=i%cols*cellw;y=100+i//cols*cellh
  im=Image.open(p).convert('RGBA');factor=max(1,min(128//im.width,128//im.height))
  if im.width>128 or im.height>128:im.thumbnail((128,128),Image.Resampling.NEAREST)
  else:im=im.resize((im.width*factor,im.height*factor),Image.Resampling.NEAREST)
  for yy in range(0,128,8):
   for xx in range(0,128,8):d.rectangle((x+16+xx,y+yy,x+23+xx,y+yy+7),fill='#34433a' if (xx//8+yy//8)%2 else '#29382e')
  canvas.paste(im,(x+16+(128-im.width)//2,y+(128-im.height)//2),im)
  d.text((x+16,y+136),label,font=small,fill='#fff2cc')
 canvas.save(OUT/name)
cat=ROOT/'assets/voxel/texturas/catalogo-v01'
board([(p,p.stem) for p in sorted((cat/'blocos').glob('*.png'))],'blocos-atuais-v01.png','Mundo8bit • 16 texturas de blocos em uso (8×8)')
board([(p,p.stem.replace('-voxel','')) for p in sorted((cat/'skins').glob('*.png'))],'skins-atuais-v01.png','Mundo8bit • 5 skins atuais sobre modelos geométricos',cols=3,cellw=300)
board([(p,p.stem) for p in sorted((ROOT/'archive/classico/assets/textures').glob('*.png'))],'atlas-historicos-v01.png','Acervo clássico • referências históricas, fora do runtime',cols=3,cellw=320)
print(f'{len(rows)} PNGs inventariados; 3 pranchas geradas.')
# Fontes editáveis podem conter texturas sem um PNG externo correspondente.
import base64,collections
embedded=[]
for p in sorted((ROOT/'archive/classico/assets/blockbench').glob('*.bbmodel')):
 for i,t in enumerate(json.loads(p.read_text()).get('textures',[])):
  source=t.get('source','');packed=source.startswith('data:')
  embedded.append(dict(model=p.relative_to(ROOT).as_posix(),texture_index=i,name=t.get('name'),width=t.get('width'),height=t.get('height'),embedded=packed,sha256=hashlib.sha256(base64.b64decode(source.split(',',1)[1])).hexdigest() if packed else None,status='histórico — textura de fonte Blockbench; fora do runtime'))
(OUT/'fontes-blockbench.json').write_text(json.dumps(embedded,ensure_ascii=False,indent=2)+'\n')
groups=collections.defaultdict(list)
for r in rows:groups[r['sha256']].append(r['path'])
(OUT/'duplicatas.json').write_text(json.dumps([dict(sha256=k,paths=v) for k,v in groups.items() if len(v)>1],ensure_ascii=False,indent=2)+'\n')
