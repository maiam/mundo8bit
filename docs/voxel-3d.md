# Mundo voxel e arte de 8 pixels

Desde a decisão de 2026-11-27, este é o único mundo. A entrada `index.html` carrega diretamente `src/voxel/voxel-main.js`. Não há seletor de mundo; o parâmetro antigo `mundo` não seleciona outro runtime.

- 1 bloco = 1 unidade; texturas 8×8 por face.
- 1 pixel de skin = 1/8 de bloco. Uma skin pode ter 32×32 ou 64×32 para acomodar todas as faces.
- Entidades geométricas articuladas, sem personagens ou animais em sprites.
- Câmera ortográfica: yaw 45°, pitch 30°, topo projetado em losango 2:1; `VOXEL_PIXELS_PER_UNIT = 16/√2`.
- Atlas em `voxel-atlas.js`; construção de malhas e árvores em `voxel-terrain.js`; parâmetros de câmera em `voxel-settings.js`.
- Semente 808, chunks 12×12, raio ativo 4 (81 chunks). Geração e colisões existentes foram preservadas na limpeza.

`world.js`, `nature.js` e `trees.js` fornecem distribuição determinística. `CollisionWorld` é o motor de colisão. `pixel-art.js` controla a apresentação e mantém preferência local; desligá-la não troca o mundo nem suas texturas.

O acervo antigo está em [arquivo histórico](../archive/classico/README.md). Regras novas ou alterações de terreno, física, água e geração exigem [consulta à Minecraft Wiki, proposta e resposta do usuário](regras-de-mundo.md).
