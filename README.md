# mundo8bit

Protótipo de exploração em mundo aberto **2,5D**, com câmera ortográfica e direção de arte **low poly painted — Painted using Blockbench with flat textures**.

## Executar

Requer Node.js 22.12+.

```sh
npm ci
npm run dev
```

`npm run build` gera `dist/`. `npm test` valida geração, streaming e integridade dos assets/UVs. O build normal usa os exports versionados e não requer Blockbench instalado.

## Controles

- WASD ou setas: movimento relativo à câmera.
- Shift: correr.
- Celular/tablet: arraste o joystick esquerdo; segure CORRER com o outro dedo.
- G: mostrar limites dos chunks.
- Voltar à origem: reiniciar a posição.

## Arte e fontes

A v02 inclui 11 árvores, explorador, pedra e quatro amostras de superfícies produzidos/exportados no **Blockbench 5.2.2**, com UVs e texturas planas pintadas.

- `assets/blockbench/`: 17 fontes `.bbmodel`, com textura incorporada para abrir e editar.
- `assets/textures/`: atlas PNG de 256 × 256, com 16 células de material.
- `public/assets/models/`: exports glTF texturizados; a aplicação carrega árvores, explorador e pedra.
- `public/assets/manifest.json`: catálogo, versão da ferramenta e contagem de triângulos.
- `docs/art/`: referência aprovada v01, pranchas renderizadas v02 e evidências de validação.

A geometria anterior foi adaptada no editor; UVs e pinceladas foram automatizadas com a API nativa do Painter/Blockbench. Os arquivos são editáveis. Não se trata de pintura manual humana nem de identidade visual já aprovada como final.

Veja [a direção artística](docs/direcao-artistica.md), [o fluxo de assets](docs/assets-blockbench.md) e [a instalação no ambiente](docs/blockbench-ambiente.md).

## Base técnica

Three.js + Vite. Terreno determinístico pela semente 808, chunks de 12 × 12 unidades e janela de 5 × 5 chunks. Alturas globais mantêm bordas contínuas. Chunks distantes liberam suas malhas de terreno; os assets glTF compartilham geometria, textura e material. Terreno e água usam o atlas pintado, mantendo a geração procedural.

Esta é uma base de exploração: ainda não há colisão com objetos, combate, inventário, salvamento, áudio ou multiplayer. O personagem atravessa água e objetos. Geração síncrona; workers e instancing são próximos passos para mundos mais densos. O desempenho em aparelhos reais ainda precisa ser medido.
