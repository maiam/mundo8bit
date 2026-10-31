# mundo8bit

Protótipo de um jogo de exploração em mundo aberto **2,5D**, com câmera ortográfica, geometria low poly e apresentação pixelizada inspirada em jogos 8-bit.

## Executar

Requer Node.js 22.12+.

```sh
npm ci
npm run dev
```

Abra o endereço exibido pelo Vite. `npm run build` gera `dist/`; `npm test` valida as regras de geração e streaming.

## Controles

- WASD ou setas: movimento relativo à câmera.
- Shift: correr.
- G: mostrar limites dos chunks.
- Voltar à origem: reiniciar a posição.

## Base técnica

Three.js + Vite, sem assets externos. Terreno determinístico pela semente 808, chunks de 12 × 12 unidades, janela de 5 × 5 chunks ao redor do jogador. Chunks distantes são removidos e seus recursos exclusivos liberados. Alturas usam coordenadas globais, mantendo as bordas contínuas. Árvores e pedras usam geometrias e materiais compartilhados.

Esta é uma base de exploração: ainda não há colisão com objetos, combate, inventário, salvamento, áudio, controles de toque ou multiplayer. O personagem atravessa água e objetos. A geração é síncrona; workers e instancing são próximos passos para mundos mais densos.

Veja [a direção artística](docs/direcao-artistica.md) e [o plano de evolução](docs/roadmap.md).
