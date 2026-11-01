# mundo8bit

Protótipo de exploração em mundo aberto **2,5D**, com câmera ortográfica top-down inclinada, inspirada no enquadramento de Brawl Stars, e direção de arte **low poly painted — Painted using Blockbench with flat textures**.

## Estado e próximo passo

Hoje é um protótipo de exploração: mundo, fauna, colisões e controles estão implementados; objetivos, interação com animais, áudio, recompensas e progresso salvo ainda não. Para uma criança de aproximadamente 5 anos, a proposta é começar com um encontro guiado com a capivara e uma figurinha, depois ampliar para três amigos. Essa brincadeira ainda precisa ser implementada e observada em uso.

Veja o [estado atual auditado](docs/estado-atual.md), o [design para 5 anos](docs/design-crianca-5-anos.md), o [plano de entregas](docs/roadmap.md) e o [índice da documentação](docs/README.md).

## Executar

Requer Node.js 22.12+.

```sh
npm ci
npm run dev
```

`npm run build` gera `dist/`. `npm test` valida geração, streaming, colisões e integridade dos assets/UVs. O build normal usa os exports versionados e não requer Blockbench instalado.

Veja a [mudança de câmera e comparação visual](docs/camera-topdown.md).

## Controles

- WASD ou setas: movimento relativo à câmera.
- Shift: correr.
- Celular/tablet: jogue na horizontal; em retrato o jogo pausa e pede para girar. Arraste o joystick esquerdo e segure CORRER com o outro dedo.
- Zoom: pinça sobre o mundo, botões +/−, roda do mouse ou teclas +/−. Toque na porcentagem para restaurar.
- G: mostrar limites dos chunks.
- Tela cheia: use a faixa no celular ou a opção do menu quando o navegador permitir. O menu também permite sair.
- Menu: voltar à origem e ver chunks.

Veja [o modo horizontal e os controles](docs/mobile-horizontal.md) e [a tela cheia](docs/tela-cheia.md).

A personagem jogável agora é **Iara**, escolhida na opção D: [modelo, fonte e integração](docs/iara.md).

## Arte e fontes

A **onça-pintada** agora usa o [sprite 2D fantasia aprovado](docs/onca-2d.md), com movimento e colisões existentes. Os outros dez animais continuam em 3D. A coleção original Blockbench está preservada como fonte histórica.

A [grama clara v04](docs/grama-clara-v04.md) revisa a fidelidade à prancha, com pintura gerada por imagem e importada no Blockbench. Apenas T01 foi alterada nesta etapa; os demais materiais seguem na v03. [Comparação visual](docs/art/grama-clara-v04-comparacao.png).

A coleção de [texturas v03](docs/texturas-v03.md), aprovada na prancha, atualiza árvores, pedras, terreno e água. Preserva as fontes anteriores e acrescenta 12 amostras de material.

A base histórica v02 inclui 11 árvores, explorador anterior e quatro amostras de superfícies. A coleção de natureza v01 acrescenta **11 pedras e 23 flores**. A fauna v01 acrescenta **11 animais com movimento e animação simples**, produzidos/exportados no **Blockbench 5.2.2**, com UVs e texturas planas pintadas.

- `assets/blockbench/`: 98 fontes `.bbmodel` (incluindo a pedra antiga e o explorador anterior preservados), com textura incorporada para abrir e editar.
- `assets/textures/`: atlas PNG de 256 × 256 e 1024 × 1024, com 16 células de material.
- `public/assets/models/`: exports glTF texturizados; a aplicação carrega árvores, explorador, 11 pedras, 23 flores e 11 animais.
- `public/assets/manifest.json` e `nature-manifest.json` e `fauna-manifest.json`: catálogos, versão da ferramenta e contagem de triângulos.
- `docs/art/`: referência aprovada v01, pranchas renderizadas v02 e evidências de validação.

A geometria anterior foi adaptada no editor; UVs e pinceladas foram automatizadas com a API nativa do Painter/Blockbench. Os arquivos são editáveis. Não se trata de pintura manual humana nem de identidade visual já aprovada como final.

Veja [a fauna](docs/fauna.md), [a coleção de pedras e flores](docs/pedras-flores.md), [a direção artística](docs/direcao-artistica.md), [o fluxo de assets](docs/assets-blockbench.md) e [a instalação no ambiente](docs/blockbench-ambiente.md).

## Base técnica

Three.js + Vite. Terreno determinístico pela semente 808, chunks de 12 × 12 unidades e janela de 5 × 5 chunks. Alturas globais mantêm bordas contínuas. Chunks distantes liberam suas malhas de terreno; os assets glTF compartilham geometria, textura e material. Terreno e água usam o atlas pintado v03 com amostragem contínua em coordenadas globais, mantendo a geração procedural.

O personagem colide com troncos, raízes, pedras e animais; água profunda bloqueia a passagem e flores são atravessáveis. Os animais também evitam obstáculos e o personagem. Veja [as regras de colisão](docs/colisoes.md). Ainda não há combate, inventário, salvamento, áudio ou multiplayer. Geração síncrona; elementos de natureza já usam instancing. Workers e outras otimizações dependem de gargalos medidos. O desempenho em aparelhos reais ainda precisa ser medido.
