# Pixel art 32×32 — direção visual padrão (v02)

> Histórico: a v01 (2026-11-22) foi um filtro experimental desligado por padrão, com ~200 linhas de pixels por tela. A v02 o substitui.

**Mudança de direção aprovada pelo usuário em 2026-11-22:** “tornar como padrão visual estilo pixel art 32x32px” e trocar as árvores do mundo pelas novas, fornecidas no Google Drive. O modo pixel art passa a vir **ligado por padrão**. O visual low poly painted continua disponível pelo menu e por `?pixel=0`.

## Escala 32×32

- **Densidade fixa:** 12 pixels de jogo por unidade do mundo (`PIXELS_PER_UNIT` em `src/pixel-art.js`).
- **Árvores:** sprites 32×32 que ocupam 32/12 ≈ 2,67 × 2,67 unidades. Cada texel do sprite corresponde a um pixel do jogo, sem escala aleatória e com espelhamento horizontal para dar variedade. Detalhes em [árvores pixel art 32×32](arvores-pixel-32.md).
- **Escala de tela:** a quantidade de pixels CSS por pixel de jogo é **inteira**, escolhida pela mais próxima do enquadramento da câmera (`cameraLayout`). Desktop 1440×900 fica com escala 5 (meia altura visível de 7,5 u); celular 844×390, com escala 3 (5,42 u). A área visível nunca passa do limite seguro do terreno carregado: se passar, a escala sobe.
- **Zoom:** a porcentagem continua suave na interface, mas a imagem avança em degraus de escala inteira, preservando 1:1 nos sprites.

## Renderização

O pipeline da v01 foi mantido:

- render target sem MSAA;
- câmera encaixada na grade de texels (1/12 u), com compensação de fração para a rolagem continuar suave;
- contorno do lado de fora dos objetos;
- quantização leve com pontilhado ordenado;
- canvas com 1 pixel por pixel CSS e `image-rendering: pixelated`.

Os modelos 3D restantes (terreno, pedras, flores, fauna e Iara) continuam sendo os mesmos assets Blockbench, só que desenhados nessa densidade. As árvores são sprites com filtro *nearest*, sem mipmaps, alfa binário e escrita de profundidade.

## Preferência e menu

- Menu → **VISUAL** → “P · Desligar pixel art” / “P · Ligar pixel art”, ou a tecla **P**.
- `?pixel=0` ou `?pixel=1` na URL força o estado.
- A escolha fica salva por navegador (`localStorage`, chave `mundo8bit:pixel-art`). Sem valor salvo, ou com o armazenamento bloqueado, o modo fica **ligado**.

## Verificação

- `npm test`: 29 testes. Cobrem a densidade fixa com escala inteira e o limite do terreno em várias proporções e zooms, o encaixe da câmera, o padrão ligado da preferência, o catálogo das árvores (32×32, cópia de runtime idêntica, SHA-256 dos originais) e a distribuição das 4 espécies.
- `npm run qa:pixel`: menu, rótulo, `aria-pressed`, armazenamento, escala 5 no desktop e 3 no celular, câmera restaurada, caminhada, sprites *nearest* de 2,67 u, preferência preservada ao recarregar e tecla P. Resultado em `art/validation/pixel-art-v02-result.json`.
- `npm run qa:browser` valida o caminho low poly (desliga o pixel art no início).
- `npm run qa:collisions` passa.
- Capturas: [desktop pixel art](art/validation/pixel-art-v02-desktop-ligado.png), [celular pixel art](art/validation/pixel-art-v02-mobile-ligado.png) e [desktop low poly](art/validation/pixel-art-v02-desktop-desligado.png).

QA feito em Chromium com SwiftShader. Desempenho, conforto visual e Safari/iPhone ainda não foram medidos em aparelho físico.

## Limites conhecidos

- Só as árvores são pixel art nativa. Terreno, pedras, flores, fauna, Iara e a onça 2D são reduzidos pelo filtro. Para ficar coeso, cada coleção precisa de sprites próprios.
- Iara mede cerca de 11 pixels de altura na tela. Precisa ser avaliado com a criança, em uso.
- As árvores-sprite não recebem a luz 3D (a luz vem pintada) e sempre ficam de frente para a câmera.
- O ponto vertical do sprite não é encaixado na grade. Em movimento, pode surgir de vez em quando uma linha duplicada.
- Com o pixel art desligado, as árvores continuam sendo os sprites 32×32 ampliados. As árvores 3D v03 não voltam ao mundo.
