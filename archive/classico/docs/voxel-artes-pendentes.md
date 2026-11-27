# Artes PNG pendentes (aguardando o usuário)

Regra combinada em 2026-11-25: **as artes em PNG ficam em espera e são pedidas ao usuário**, que as envia. Até lá, o jogo usa versões provisórias geradas por código, no mesmo formato. Todas seguem **8 px por bloco**, sem antialias (pixels nítidos) e com fundo transparente onde indicado.

| # | Arte | Tamanho | Layout / modelo | Onde entra | Estado |
|---|---|---|---|---|---|
| 1 | Skin da Iara | 32×32, com transparência na camada externa | Box UV do jogador do Minecraft ÷ 2. Modelos: `assets/voxel/skins/modelos/iara-voxel-v02-guia-uv.png` e `-provisoria.png` | `IARA.skin` | **pendente** |
| 2 | Skin do NPC Guia (e nome/identidade) | 32×32 | Mesmo layout humanoide: `npc-guia-voxel-v01-*` | `GUIA.skin` | **pendente** |
| 3 | Skin da capivara | 64×32 | `mob-capivara-voxel-v01-*` (pernas compartilhadas) | `CAPIVARA.skin` | **pendente** |
| 4 | Skin do tatu | 32×16 | `mob-tatu-voxel-v01-*` | `TATU.skin` | **pendente** |
| 5 | Skin do tucano | 32×16 | `mob-tucano-voxel-v01-*` | `TUCANO.skin` | **pendente** |
| 6 | Ícone da mão (hotbar e joystick de ação) | 8×8 (ou 16×16), transparente | Livre, legível pequeno | `HOTBAR_ITEMS[0].icon` | **pendente** |
| 7 | Moldura da hotbar e do espaço selecionado (opcional) | 8 px por "pixel" de moldura | Livre | `#hotbar` (CSS) | **pendente** |
| 8 | Texturas dos blocos (opcional, substitui o atlas gerado) | 8×8 por face; atlas 32×32 com 16 texturas | Ordem em `src/voxel/voxel-atlas.js` (`TILE`) | `buildVoxelAtlas` | **pendente** |

Como usar os modelos: pinte sobre o `*-provisoria.png` ou siga as cores do `*-guia-uv.png` (topo amarelo, base oliva, direita azul, frente vermelha, esquerda verde, costas roxa). A frente da entidade é a face vermelha.

Ao receber cada PNG: salvar em `assets/voxel/skins/` (fonte) e `public/assets/voxel/skins/` (runtime), registrar origem e SHA-256 em [entidades](voxel-entidades.md), apontar o campo `skin` e conferir no QA.
