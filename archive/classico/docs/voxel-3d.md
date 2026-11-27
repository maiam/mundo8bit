# Mundo voxel 3D — padrão desde 2026-11-25

> **Validado pelo usuário em 2026-11-25:** o voxel vira o mundo padrão (URL raiz). Regra: **mundo 100% a 8 px por bloco**. O clássico passa a legado em `?mundo=classico` (`?mundo=voxel3d` continua abrindo o voxel). Entidades em box model: [voxel-entidades](voxel-entidades.md); controles, hotbar e ação: [voxel-controles](voxel-controles.md); PNGs aguardando o usuário: [artes pendentes](voxel-artes-pendentes.md). A seção "Iara voxel" abaixo descreve a v01, substituída pela Iara v02 em box model com skin box UV.

## Histórico — protótipo v01 (`?mundo=voxel3d`)

Pedido do usuário em 2026-11-25, para testar antes de qualquer decisão de virar padrão. Decisões do usuário:

- 1 bloco = 1 unidade, com a Iara medindo cerca de 2 blocos;
- 8 px por bloco;
- isometria 2:1 (recomendação aceita);
- personagens feitos de cubos e paralelepípedos, como no Minecraft.

**O mundo clássico continua sendo o padrão.** Ele não carrega nada do voxel, e o voxel não carrega o `src/main.js`.

## Como abrir

- **Pela URL:** `/?mundo=voxel3d`.
- **Pelo menu:** **MUNDO** → “Abrir mundo voxel 3D (teste)”. No voxel, o mesmo botão volta ao clássico e preserva os outros parâmetros (ex.: `?pixel=0`).
- **Controles:** iguais aos do clássico — WASD/setas, Shift, joystick e CORRER, pinça, +/− e G para ver os pedaços. P liga ou desliga o pixel art, com a mesma preferência salva.
- **Roteamento:** fica no `index.html`, por import dinâmico. Os scripts de QA passam a importar `/src/main.js` diretamente.

## Escala e câmera (`src/voxel/voxel-settings.js`)

- **Texturas:** 8×8 px por face (`VOXEL_TEXELS`).
- **Câmera:** ortográfica, girada 45° (fica na diagonal +X/+Z) e inclinada 30°. Como sen 30° = 0,5, as linhas saem em 2:1, a pixel art isométrica clássica.
- **Densidade:** `VOXEL_PIXELS_PER_UNIT = 16/√2`, então o topo de cada bloco é um losango de 16×8 px de jogo (conferido por teste). As arestas verticais medem cerca de 9,8 px; a isometria 2:1 não permite os dois valores inteiros ao mesmo tempo.
- **Enquadramento:** cerca de 20 blocos na vertical no desktop (escala inteira 4 em 1440×900) e cerca de 17 no celular horizontal (escala 2 em 844×390). Zoom de 72% a 220%.
- **Pedaços carregados:** 9×9 (raio 4) de 12×12. Por ver mais chão que a vista superior, a isometria precisa de mais pedaços. Um teste projeta os cantos da tela em alturas extremas e confirma que nunca aparece a borda carregada.
- **Controles alinhados à tela:** direita na tela = (+X, −Z)/√2 e para cima = (−X, −Z)/√2 (`voxelScreenMovement`). A câmera do clássico (`camera-settings.js`, vista superior sem giro) não foi alterada.
- **Filtro pixel art:** é o mesmo `src/pixel-art.js`, agora com densidade configurável (`pixelsPerUnit`) e sem pontilhado (`dither: 0`) nas texturas de 8 px.

## Terreno e objetos (`src/voxel/voxel-terrain.js`)

A geração é a mesma do clássico, sem nova fonte de verdade: semente 808, `heightAt`, `natureAt` e as espécies de `trees.js`.

- **Colunas:** altura = `round(heightAt(centro da célula))`, de −3 a +3. Topo com grama, grama clara ou areia, depois terra e pedra abaixo. Paredes laterais só onde a coluna vizinha é mais baixa, sem faces duplicadas na borda entre pedaços.
- **Água:** colunas com topo ≤ −2 ficam submersas (superfície a −1,25, semitransparente). A areia da praia fica no topo −1.
- **Árvores:** mesmas posições e as mesmas 4 espécies do clássico, montadas com blocos de tronco e folhas:

  | Espécie | Tronco | Folhas |
  |---|---|---|
  | Macieira | 3 blocos | Folhas com maçãs |
  | Carvalho | 4 blocos | Copa larga e escura |
  | Cerejeira | 3 blocos | Copa rosa |
  | Bétula | 5 blocos, casca branca | Copa estreita |

  Faces internas da árvore são descartadas.
- **Pedras:** um bloco de pedregulho nas posições de `natureAt`.
- **Flores:** caule e cabeça em paralelepípedos pequenos, com a cor de cada espécie. Lótus sobre a água.
- **Atlas:** `src/voxel/voxel-atlas.js` monta uma imagem de 32×32 com 16 texturas de 8×8, geradas por regra determinística (paleta + ruído). Não é pintura manual. As faces recebem sombreamento fixo (topo 100%, laterais 80% e 64%), sem iluminação dinâmica.
- **Custo medido em Node:** os 81 pedaços somam cerca de 83 mil triângulos e 176 ms de geração (239 árvores, 176 pedras, 657 flores). Cada pedaço é uma malha opaca, mais uma de água.

## Física

- **`CollisionWorld`:** recebeu uma função de altura plugável (`new CollisionWorld({height})`). O clássico continua com `heightAt`; o voxel usa `voxelGround`, o topo da coluna da célula, com a água valendo −10.
- **Movimento:** sobe e desce 1 bloco por vez (`maxStepHeight` 1,01), com transição visual curta. A água bloqueia.
- **Obstáculos:** troncos e pedras são caixas de 1×1. As copas não colidem.

## Iara voxel (`src/voxel/voxel-models.js`)

Modelo em dados (`IARA_VOXEL`), seguindo a referência aprovada (`docs/iara.md`): cabelo curto, faixa amarela, colete verde, camisa clara, shorts terracota, botas e mochila.

- **Proporções:** pernas 0,25×0,75×0,25, tronco 0,5×0,75×0,25, braços 0,25×0,75×0,25 e cabeça 0,5³. Total de **2,0 blocos**.
- **Resolução:** a 8 px por bloco, o rosto tem 4×4 px.
- **Textura:** cada face é uma grade de letras da paleta, empacotada numa imagem 64×64 com filtro nearest.
- **Animação:** as partes usam os mesmos nomes da Iara clássica (`braco-esquerdo`, `perna-direita` etc.), com o mesmo balanço de caminhada.
- **Silhueta:** na isometria, copas e blocos à frente escondem a personagem. Por isso a Iara tem uma silhueta clara desenhada só onde o cenário a encobre, para a criança nunca perder a personagem.
- **Ponto inicial (`voxelStart`):** escolhido perto da origem, sem nenhum bloco de árvore cobrindo a Iara na tela.

## Verificação

- `npm test`: 38 testes. Os 9 do voxel cobrem:
  - URL e troca de mundo;
  - losango 16×8 e controles alinhados à tela;
  - cobertura do terreno carregado em 5 proporções e 3 zooms;
  - atlas;
  - colunas, água e continuidade entre pedaços;
  - árvores e colisores;
  - física (tronco, água);
  - ponto inicial sem oclusão;
  - Iara com 2 blocos, partes e silhueta.
- `npm run qa:voxel` (Vite em `127.0.0.1:5173` + Chromium em `--remote-debugging-port=9334`):
  - carrega sem erro e sem carregar o mundo clássico: 81 pedaços com colisão, escala 4;
  - tecla D move para a direita da tela e W para cima;
  - tronco e água bloqueiam, sobe um degrau;
  - celular horizontal com escala 2;
  - o botão do menu volta ao clássico.
  - Resultado em `art/validation/voxel-3d-v01-result.json`.
- Regressão do clássico: `qa:browser`, `qa:collisions` e `qa:pixel` passam.
- Capturas: [desktop](art/validation/voxel-3d-v01-desktop.png), [celular](art/validation/voxel-3d-v01-mobile.png) e [silhueta atrás das copas](art/validation/voxel-3d-v01-silhueta.png).

QA feito em Chromium com SwiftShader. FPS, aquecimento e Safari/iPhone ainda não foram medidos em aparelho físico.

## Fora desta versão

- **Fauna:** não há animais no voxel. Os 11 animais e a onça 2D precisariam de modelos em cubos.
- **Assets:** sem fontes Blockbench. A Iara e os blocos são dados em código. Se o voxel for aprovado, abrir fontes `.bbmodel` estilo bloco e entidade e exportar a partir deles.
- **Mundo:** sem cavar, construir, salvar progresso ou áudio.
- **Duplicação temporária:** o laço de jogo, os controles de teclado, o redimensionamento e o menu estão repetidos em `voxel-main.js`. Se o voxel virar padrão, extrair um módulo comum com o `main.js`.
- **Visual:** as arestas verticais não caem na grade de pixels (9,8 px), então pode haver variação de 1 px em degraus durante o movimento.
