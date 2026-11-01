# Onça-pintada 2D fantasia — integração v01

O usuário aprovou a imagem e o protótipo isolado e autorizou a integração em 2026-11-01. A mudança de estilo vale para **A01, onça-pintada**. Ambiente, Iara e os outros dez animais mantêm sua direção atual.

## Referência e origem

- [Conceito escolhido](art/onca-fantasia-conceito-v01-aprovado.png).
- Sprite aprovado: `assets/sprites/onca-fantasia-v01.png`; cópia de runtime em `public/assets/sprites/`.
- Arte gerada em 2D, com transparência, baseada no conceito e adaptada para a câmera elevada. Não é modelo Blockbench nem pintura manual humana.
- O PNG do protótipo aprovado foi copiado sem redesenho, recorte ou alteração de cor; SHA-256 registrado no campo `appearance` do manifesto de fauna e conferido por teste.

## Aplicação

`public/assets/fauna-manifest.json` v02 registra a aparência de sprite da onça. Seus campos de modelo 3D, fonte, triângulos e rig permanecem como referência histórica. O catálogo v01 também foi preservado em `public/assets/history/`.

`src/assets.js` carrega uma única textura/material de sprite para a onça e compartilha esses recursos entre clones. O glTF anterior da onça não é carregado no runtime; suas fontes e exports continuam preservados. O restante da fauna mantém o carregamento glTF.

`src/animal-sprites.js` cria um sprite voltado à câmera: transparência, corte de alpha de 0,12, teste de profundidade ativo, escrita de profundidade desativada e neblina. `src/fauna.js` mantém a orientação do grupo sem rotação horizontal e espelha apenas a imagem conforme o movimento para direita/esquerda. Ao parar ou andar quase verticalmente, conserva o último lado para evitar oscilação.

Escala calibrada ao protótipo: com escala do animal de 0,93, a imagem ocupa 2,35 × 1,57 unidades. O tamanho varia com a mesma escala procedural da fauna. Âncora e elevação são preservadas no manifesto.

As onças existentes passam a usar a imagem. Distribuição, semente, velocidade, deslocamento, pausas, território e volume circular de colisão continuam no controlador atual. Não foi adicionado o NPC fixo nem o painel de comparação do protótipo. Há uma onça gerada perto de X 5,66 / Z −5,51 na região inicial (posição de origem, antes de caminhar).

## Limites aprovados nesta versão

Uma pose pintada com espelhamento lateral e leve oscilação; **não há ciclo desenhado de patas, vistas de frente/costas ou rotação 360°**. A imagem tem luz pintada e não recebe a iluminação 3D como os outros animais. A colisão aproxima o corpo e não cobre toda a silhueta da cauda.

O PNG mede 1536 × 1024 com alpha. Com mipmaps em RGBA, representa aproximadamente 8 MiB de textura na GPU, compartilhados pelas onças. Desempenho em aparelho físico permanece pendente.

## Verificação

- `npm test`: 25 testes; arquivo aprovado, cópia de runtime, compartilhamento de recursos, espelhamento, assets históricos, mundo e colisões.
- `node scripts/verify-jaguar.mjs`: onça procedural 2D, outros animais 3D, movimento, colisão com o jogador, ausência de rotação do sprite, material compartilhado após viagens entre regiões e memória estabilizada no retorno.
- As capturas em área livre reposicionam temporariamente a onça apenas na sessão de QA para comparar a leitura com a Iara; isso não adiciona um spawn fixo ao jogo. Uma captura de oclusão natural mostra o teste entre copas.
- Capturas e resultados em `docs/art/validation/onca-2d-v01-*`.
- `npm run build`: versão de produção.

QA em Chromium com renderização por software e toque emulado; não equivale a medição em celular real.
