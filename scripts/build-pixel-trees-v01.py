#!/usr/bin/env python3
"""Árvores pixel art v01: originais do Drive -> sprites 32×32 com transparência real.

Os originais (gerados por imagem, Gemini) vêm com o xadrez de "transparência" pintado
no fundo e alfa 100% opaco. Este script:
  1. estima os dois tons de cinza do xadrez pela borda da imagem;
  2. remove o fundo por preenchimento a partir das bordas (pixels neutros nesses tons),
     o que também elimina a marca ✦ do canto, que fica isolada no fundo;
  3. recorta, reduz para caber em 32×32 (base alinhada embaixo, centralizada),
     binariza o alfa, reduz a paleta e aplica contorno escuro de 1 px.
Requer Pillow (ferramenta de produção; o runtime não depende dele).
Uso: python3 scripts/build-pixel-trees-v01.py
"""
from collections import deque
from pathlib import Path
import hashlib, json
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'assets/sprites/arvores-pixel-v01/originais'
OUT = ROOT / 'assets/sprites/arvores-pixel-v01'
PUBLIC = ROOT / 'public/assets/sprites'
SIZE = 32
COLORS = 16  # por árvore, além da transparência
TREES = [
    ('macieira', 'Macieira', 'Cópia de Arvore-Macieira.png'),
    ('carvalho', 'Carvalho', 'Cópia de Arvore-Carvalho.png'),
    ('cerejeira', 'Cerejeira', 'Cópia de Arvore-Cerejeira.png'),
    ('betula', 'Bétula', 'Cópia de Arvore-Betula.png'),
]


def checker_levels(img):
    w, h = img.size
    px = img.load()
    border = [px[x, y] for x in range(0, w, 3) for y in (0, 1, h - 2, h - 1)]
    border += [px[x, y] for y in range(0, h, 3) for x in (0, 1, w - 2, w - 1)]
    grays = sorted(sum(p[:3]) / 3 for p in border if max(p[:3]) - min(p[:3]) <= 12)
    lo, hi = grays[len(grays) // 10], grays[len(grays) * 9 // 10]
    return lo, hi


def remove_background(img):
    img = img.convert('RGBA')
    w, h = img.size
    px = img.load()
    lo, hi = checker_levels(img)
    tol = max(18, (hi - lo) * .22)

    def is_bg(p):
        r, g, b = p[:3]
        if max(r, g, b) - min(r, g, b) > 16:
            return False
        lum = (r + g + b) / 3
        # Tons do xadrez e meios-tons de compressão entre eles; a marca ✦ é cinza claro.
        return lo - tol <= lum <= max(hi + tol, 235)

    seen = bytearray(w * h)
    queue = deque()
    for x in range(w):
        queue.extend(((x, 0), (x, h - 1)))
    for y in range(h):
        queue.extend(((0, y), (w - 1, y)))
    while queue:
        x, y = queue.popleft()
        i = y * w + x
        if seen[i]:
            continue
        seen[i] = 1
        if not is_bg(px[x, y]):
            continue
        px[x, y] = (0, 0, 0, 0)
        if x > 0: queue.append((x - 1, y))
        if x < w - 1: queue.append((x + 1, y))
        if y > 0: queue.append((x, y - 1))
        if y < h - 1: queue.append((x, y + 1))
    return img


def keep_largest_component(img):
    # Restos fracos do xadrez nas laterais não podem inflar o recorte: fica só a árvore.
    w, h = img.size
    f = max(1, max(w, h) // 512)
    mask = img.getchannel('A').resize((w // f, h // f), Image.NEAREST)
    mw, mh = mask.size
    m = mask.load()
    label = [0] * (mw * mh)
    best, best_size, current = 0, 0, 0
    for sy in range(mh):
        for sx in range(mw):
            if not m[sx, sy] or label[sy * mw + sx]:
                continue
            current += 1
            size, queue = 0, deque([(sx, sy)])
            label[sy * mw + sx] = current
            while queue:
                x, y = queue.popleft()
                size += 1
                for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                    if 0 <= nx < mw and 0 <= ny < mh and m[nx, ny] and not label[ny * mw + nx]:
                        label[ny * mw + nx] = current
                        queue.append((nx, ny))
            if size > best_size:
                best, best_size = current, size
    keep = Image.new('L', (mw, mh), 0)
    keep.putdata([255 if v == best else 0 for v in label])
    keep = keep.resize((w, h), Image.NEAREST)
    alpha = Image.composite(img.getchannel('A'), Image.new('L', (w, h), 0), keep)
    img.putalpha(alpha)
    return img


def to_pixel_sprite(img):
    img = keep_largest_component(img)
    bbox = img.getchannel('A').getbbox()
    img = img.crop(bbox)
    w, h = img.size
    k = (SIZE - 2) / max(w, h)  # 1 px livre para o contorno
    nw, nh = max(1, round(w * k)), max(1, round(h * k))
    # Redução pré-multiplicada: sem franjas escuras vindas do fundo transparente.
    small = img.convert('RGBa').resize((nw, nh), Image.BOX).convert('RGBA')
    canvas = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
    canvas.paste(small, ((SIZE - nw) // 2, SIZE - 1 - nh), small)
    # Alfa binário: pixel art sem bordas semitransparentes.
    alpha = canvas.getchannel('A').point(lambda a: 255 if a >= 110 else 0)
    rgb = canvas.convert('RGB').quantize(COLORS, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.NONE).convert('RGB')
    out = rgb.convert('RGBA')
    out.putalpha(alpha)
    # Contorno de 1 px na cor mais escura de cada vizinhança (escurecida).
    px = out.load()
    edge = []
    for y in range(SIZE):
        for x in range(SIZE):
            if px[x, y][3]:
                continue
            nb = [px[x + dx, y + dy] for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)) if 0 <= x + dx < SIZE and 0 <= y + dy < SIZE and px[x + dx, y + dy][3]]
            if nb:
                d = min(nb, key=lambda p: sum(p[:3]))
                edge.append((x, y, (int(d[0] * .45), int(d[1] * .4), int(d[2] * .38), 255)))
    for x, y, c in edge:
        px[x, y] = c
    return out


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    PUBLIC.mkdir(parents=True, exist_ok=True)
    board = Image.new('RGBA', (len(TREES) * 300, 330), (244, 239, 217, 255))
    catalog = []
    for i, (tree_id, name, filename) in enumerate(TREES):
        src = SRC / filename
        original = Image.open(src)
        clean = remove_background(original)
        sprite = to_pixel_sprite(clean)
        out_name = f'arvore-{tree_id}-pixel-32-v01.png'
        sprite.save(OUT / out_name, optimize=True)
        sprite.save(PUBLIC / out_name, optimize=True)
        preview = clean.copy()
        preview.thumbnail((140, 140))
        board.alpha_composite(preview, (i * 300 + 10, 20 + 140 - preview.size[1]))
        big = sprite.resize((SIZE * 4, SIZE * 4), Image.NEAREST)
        board.alpha_composite(big, (i * 300 + 160, 32))
        board.alpha_composite(sprite, (i * 300 + 160, 190))
        catalog.append({
            'id': tree_id, 'name': name, 'source': f'assets/sprites/arvores-pixel-v01/originais/{filename}',
            'sourceSha256': hashlib.sha256(src.read_bytes()).hexdigest(), 'sourceSize': list(original.size),
            'url': f'/assets/sprites/{out_name}', 'sprite': f'assets/sprites/arvores-pixel-v01/{out_name}',
            'size': [SIZE, SIZE], 'opaquePixels': sum(1 for a in sprite.getchannel('A').get_flattened_data() if a),
        })
    board.save(ROOT / 'docs/art/arvores-pixel-32-v01-prancha.png')
    (OUT / 'catalogo.json').write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps(catalog, ensure_ascii=False, indent=1))


if __name__ == '__main__':
    main()
