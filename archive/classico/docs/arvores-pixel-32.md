# Árvores pixel art 32×32 — v01

As árvores no mundo passam a ser **macieira, carvalho, cerejeira e bétula** em sprites 32×32. Elas substituem as 11 árvores 3D v03 no runtime. Pedido do usuário em 2026-11-22.

## Origem

- **Fonte:** Google Drive do usuário, `Jogos / mundo8bit / assets / natureza` (pasta "02 - projetos digitais / jogos / mundo8bit"). Arquivos “Cópia de Arvore-*.png”.
- **Natureza dos originais:** ilustrações geradas por imagem (Gemini), com a marca ✦ no canto. Não são pintura manual nem modelos Blockbench.
- **Problema dos originais:** vieram com o **xadrez de transparência pintado no fundo**, com alfa 100% opaco.
- **Preservação:** os originais foram mantidos sem alteração em `assets/sprites/arvores-pixel-v01/originais/`. O SHA-256 de cada um está no catálogo e é conferido por teste.

## Produção (`scripts/build-pixel-trees-v01.py`, Pillow)

1. Estimativa dos dois tons do xadrez pela borda e remoção do fundo por preenchimento a partir das bordas. A marca ✦, isolada no fundo, sai junto.
2. Restos do xadrez fora da árvore são descartados: fica só o maior componente.
3. Recorte, redução pré-multiplicada (*box*) até caber em 30 px e base alinhada embaixo, centralizada.
4. Alfa binário, paleta de 16 cores por árvore, sem pontilhado, e contorno escuro de 1 px.

**Saídas:**
- `assets/sprites/arvores-pixel-v01/arvore-<id>-pixel-32-v01.png`, com cópia idêntica em `public/assets/sprites/`;
- catálogo `assets/sprites/arvores-pixel-v01/catalogo.json`;
- manifesto de runtime `public/assets/trees-pixel-manifest.json`;
- [prancha original × 32 px ampliado × 32 px real](art/arvores-pixel-32-v01-prancha.png).

A redução foi automatizada por script. Não houve redesenho pixel a pixel manual.

## Runtime

- **`src/assets.js`:** carrega o manifesto, com textura *nearest*, sem mipmaps. Cria um sprite por espécie, mais uma variante espelhada que compartilha a imagem, já que sprites ignoram escala negativa herdada.
- **Material:** alfa de corte 0,5, opaco, com escrita de profundidade e neblina.
- **`src/trees.js`:** 4 espécies em distribuição uniforme e determinística pela semente. O posicionamento continua o mesmo (`hash > .975`, fora da água, a mais de 3 u da origem).
- **`src/collisions.js`:** um círculo de tronco por espécie: macieira 0,34, carvalho 0,32, cerejeira 0,36 e bétula 0,20. As raízes do mangue saíram com a espécie.
- **O que saiu do runtime:** as 11 árvores 3D v03 não são mais carregadas. Fontes `.bbmodel`, exports glTF e o manifesto continuam preservados. A prancha `art/arvores-v01-aprovada.png` passa a ser referência histórica.

## Limites

- **Detalhe:** em 32 px se perde muito do original. Folhas, frutos e casca viram manchas de 1 a 2 px.
- **Iluminação:** a luz vem pintada na imagem e o sprite fica sempre de frente para a câmera.
- **Colisão:** é um círculo de tronco e não cobre a copa. A jogadora pode passar "atrás" da copa.
- **Palmeira e mangue:** não há equivalentes na água. A margem passou a receber as mesmas 4 espécies.
