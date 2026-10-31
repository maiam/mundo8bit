# Mundo8bit — direção artística

## Direção oficial

**Low poly painted — “Painted using Blockbench with flat textures.”**

Geometria de poucos polígonos, silhuetas claras, cores planas e detalhes pintados em atlas 2D. A paleta retrô combina musgo, sálvia, verde escuro, madeira quente, areia e água dessaturada. Câmera ortográfica 2,5D, apresentação pixelizada e filtragem nearest-neighbor. Texturas não contêm iluminação fotográfica, normal maps ou reflexos pintados; a luz suave vem do jogo.

## Referência aprovada / árvores / v01

A [prancha conceitual v01](art/arvores-v01-aprovada.png) foi aprovada pelo usuário e permanece preservada. Define 11 silhuetas: pinheiro, carvalho, cipreste, salgueiro, palmeira, araucária, baobá, acácia, bétula, mangue e seca.

Travado: identidade das 11 silhuetas, paleta low poly e produção de fontes editáveis no Blockbench. Em teste: refinamento das copas, proporções, densidade e leitura no jogo. Alterações rejeitadas: nenhuma registrada.

## Implementação / assets / v02 — em revisão visual

- 17 fontes Generic Model `.bbmodel` produzidos no Blockbench 5.2.2: 11 árvores, explorador, pedra e quatro amostras de superfície (grama, grama clara, areia e água).
- Atlas plano pintado de 256 × 256 pixels, 16 células de material, com detalhes de casca, folhagem, bétula, tecido, couro e superfícies. PNG externo e cópia incorporada nos fontes.
- Geometria de silhuetas v01 adaptada/importada no editor; UVs e pintura realizadas por scripts usando `Mesh`, `MeshFace`, `Texture.edit`/Painter e exportação nativa `Codecs.project`/`Codecs.gltf` do Blockbench. Trata-se de autoria assistida por código no editor, sem alegação de pintura manual humana.
- glTFs texturizados usados no runtime em substituição às árvores, personagem e pedra criados em Three.js. Instâncias compartilham geometrias e um material com atlas.
- Terreno permanece procedural por chunks, agora com UVs para o atlas. Água repete uma célula pintada recortada do mesmo atlas. As quatro amostras Blockbench documentam essas superfícies; não substituem o sistema de geração do terreno.
- A implementação v02 é uma adaptação simplificada da referência. A aprovação da prancha v01 não equivale à aprovação final destes modelos.

### Comparação com v01

A versão v01 usava cores por vértice nas árvores/terreno e materiais sólidos no personagem, pedras e água. A v02 usa UVs e texturas PNG nesses elementos. Os geradores de silhuetas antigos ficam em `scripts/tree-shapes-v01.js`, fora do runtime.

## Evidências e critérios de aceite

- [Prancha renderizada de frente](art/arvores-v02-frente.png) e [de costas](art/arvores-v02-costas.png): modelos reais com câmera, luz e escala comparáveis.
- [Carvalho reaberto no Blockbench](art/validation/blockbench-carvalho-v02.png).
- [Jogo desktop](art/validation/mundo-painted-v02-desktop.png) e [mobile](art/validation/mundo-painted-v02-mobile.png).
- Fontes e exports conferidos para textura incorporada, UVs dentro do atlas e ausência de cores por vértice nos glTFs.
- No navegador: malhas visíveis texturizadas, 25 chunks ativos após deslocamentos, recursos estáveis ao repetir o percurso e joystick/corrida com dois toques.

Revisar a fidelidade artística e o desempenho em celulares reais antes de considerar a arte final. Prévia WebGL validada em Chromium com renderização por software; animação e colisões continuam fora desta etapa.
