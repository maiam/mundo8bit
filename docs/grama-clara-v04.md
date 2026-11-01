# Grama clara v04 — revisão de fidelidade

Estado: **em revisão artística**. A prancha original continua sendo a referência aprovada; v04 não recebeu aprovação automática. Esta entrega trabalha apenas T01, como primeiro material do novo fluxo. Não representa revisão concluída dos outros 11 materiais.

## Problema corrigido

A produção v03 manteve cores aproximadas, mas substituiu o desenho das pinceladas por ruído matemático suavizado. Ficou com manchas arredondadas e pouco desenho. A correção parte de uma imagem de textura própria, gerada com referência à T01 aprovada, em vez de tentar reconstruir o estilo com o mesmo algoritmo.

- Travados: referência aprovada, câmera, modelos, iluminação, controles e demais materiais.
- Em teste: formas das manchas, contraste, tonalidade, proporção dos tufos, escala no terreno e repetição.
- Tentativa A arquivada: pinceladas excessivamente densas/amareladas; repetição espelhada destacava os tufos. Imagem e projeto editável preservados em `docs/art/estudos/grama-clara-v04-tentativa-a.*`.
- Revisão atual: contraste mais baixo e áreas de descanso entre manchas. Ainda há uma direção diagonal mais consistente nas pinceladas que na referência; não alegar identidade exata ou fidelidade já aprovada.

## Origem e produção

Arte criada pelo gerador de imagens a partir da prancha aprovada e refinada por edição visual. Não é pintura manual humana, extração literal da prancha nem pintura procedural no Blockbench.

O Blockbench 5.2.2 importa a imagem, redimensiona de 1254² para 1024² e exporta o projeto Generic Model e glTF com textura incorporada. O redimensionamento preserva o desenho; não troca as manchas por ruído. Não atribuir ao Blockbench a geração artística original.

- Referência: [texturas aprovadas](art/texturas-v01-aprovada.png).
- Imagem de origem: `assets/textures/source/grama-clara-v04-gerada.png`.
- PNG de produção: `assets/textures/grama-clara-painted-v04.png` e cópia em `public/assets/`.
- Fonte editável: `assets/blockbench/superficie-grama-clara-v04.bbmodel`.
- Amostra glTF: `public/assets/models/superficie-grama-clara-v04.gltf`.
- Catálogo: `public/assets/grass-manifest.json`.
- Reprodução da importação: `node scripts/build-grass-v04.mjs`, com Blockbench no CDP local 9333. Recusa sobrescrita sem `--replace-generated`; preservar estudos ao revisar.

## Aplicação no mundo

A grama clara usa uma textura própria, amostrada em coordenadas globais em `src/painted-materials.js`. Mantém escala de 8 unidades e as misturas existentes com grama escura, terra, trilha e areia. Apenas a amostragem de T01 muda. O atlas v03 e seus modelos/exportações permanecem preservados.

A repetição é **espelhada** nos dois eixos. Isso une os mesmos pixels nas bordas sem borrar ou repintar a imagem. A textura não é declarada como periodicidade natural perfeita: espelhamento pode revelar simetrias, sobretudo nos tufos. Verificar a [repetição 3 × 3](art/grama-clara-v04-repeticao.png) antes de adotar o método para os demais materiais.

O novo PNG tem mipmaps, filtragem linear e anisotropia até 4. Acrescenta uma textura de GPU 1024², aproximadamente 5,33 MiB em RGBA com mipmaps; o desempenho em celular físico continua pendente. A amostra glTF é referência de edição, não um objeto adicional carregado no cenário.

## Comparação e verificação

[Prancha comparativa](art/grama-clara-v04-comparacao.png): referência T01, produção v03 e nova pintura v04; as três imagens usam janelas de mesma proporção, sem distorção (recorte central nas texturas quadradas). Abaixo, dois renders reais usam a mesma cena, câmera, iluminação, resolução e instante; troca-se apenas o material do terreno entre versões.

- `npm test`: 23 testes, incluindo integridade do novo projeto, UVs e export incorporado.
- `node scripts/verify-grass-v04.mjs`: textura 1024², 25 chunks de terreno, um canvas de aplicação, shaders sem falha, mipmaps e repetição espelhada.
- Evidências: `docs/art/validation/grama-clara-v04-*`.

O resultado é uma aproximação revisável. A aprovação de fidelidade depende da comparação visual pelo usuário; os testes técnicos não a substituem. Os outros materiais continuam na versão v03 até a revisão deste primeiro material orientar a sequência.
