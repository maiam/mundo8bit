# Mundo8bit — direção artística

> Atualização aprovada em 2026-11-01: A01/onça-pintada passa a usar [ilustração 2D fantasia no jogo](onca-2d.md). Os modelos 3D abaixo ficam preservados; as outras dez espécies mantêm seu estilo.

> Registro por etapa: versões, contagens e verificações abaixo pertencem às entregas descritas. Consulte o [estado atual consolidado](estado-atual.md) e o [plano de evolução](roadmap.md) para o panorama vigente.

## Direção oficial

**Low poly painted — “Painted using Blockbench with flat textures.”**

Geometria de poucos polígonos, silhuetas claras, cores planas e detalhes pintados em atlas 2D. A paleta retrô combina musgo, sálvia, verde escuro, madeira quente, areia e água dessaturada. Câmera ortográfica 2,5D, renderização na resolução CSS da tela, antialiasing e filtragem linear com mipmaps para estabilizar a pintura em movimento. Densidade de pixels limitada a 1,5 e orçamento de 2 milhões de pixels para conter o custo em telas densas. Texturas não contêm iluminação fotográfica, normal maps ou reflexos pintados; a luz suave vem do jogo.

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

## Apresentação / renderização / v03

A ampliação pixelizada em meia resolução foi substituída por renderização na resolução CSS, com antialiasing, filtragem linear, mipmaps e anisotropia até 4×. O DPR é limitado a 1,5 e o buffer a 2 milhões de pixels. Esses parâmetros são os mesmos parado e em movimento. As fontes Blockbench, a geometria low poly e o atlas v02 foram preservados.

Verificação em Chromium: desktop 1440 × 900 e viewport mobile 390 × 844 com DPR do dispositivo 3 (buffer limitado a 585 × 1266). Joystick com dois toques, liberação dos controles, streaming e estabilidade de recursos passaram. Capturas: [desktop](art/validation/mundo-painted-v03-desktop.png), [mobile parado](art/validation/mundo-painted-v03-mobile.png) e [mobile em movimento](art/validation/mundo-painted-v03-mobile-moving.png). A filtragem reduz serrilhado e variação de amostragem; não elimina todas as diferenças percebidas em movimento. Desempenho e aparência no Safari/iPhone físico ainda precisam ser conferidos.

## Pedras e flores / referência v01 / modelos v01

A [prancha de 11 pedras e 23 flores](art/pedras-flores-v01-aprovada.png) foi aceita como referência para implementação. Preserve a referência e os assets anteriores. As novas adaptações são uma primeira passagem para o jogo, em revisão visual.

- Pedras P01–P11: seixo, bloco, laje, agulha, fendida, estratos, arco, musgosa, cristal, furada e dorso.
- Flores F01–F23: catálogo completo em `src/nature-catalog.js`, com arquitetura de pétalas, folhas e inflorescências adaptada de cada desenho. Nomes representam tipos estilizados da prancha; não são identificações científicas ou um bioma botânico real.
- 34 fontes Generic Model no Blockbench 5.2.2, UVs e atlas `natureza-painted-v01.png` (256 × 256). Texturas de pedra, musgo, quartzo, caule, folhas e pétalas em 16 células. Pintura automatizada no Painter nativo, sem alegação de trabalho manual humano.
- Grupos semânticos de rocha/musgo e hastes/folhas/pétalas/miolo nos fontes. Fontes editáveis e texturas incorporadas, exportação glTF nativa. Fontes anteriores permanecem intactos; a pedra genérica v02 foi retirada do carregamento ativo.
- Mundo: manchas pequenas de 2–4 flores, pedras de escala e rotação variadas, lótus apenas acima de água com terreno submerso. Decoração determinística por coordenada. As demais flores ficam fora da água.
- Runtime: partes de cada novo asset são unidas no carregamento; instâncias agrupadas por tipo e chunk. Buffers de instâncias são liberados ao descarregar o chunk, preservando geometrias e materiais compartilhados.

Pranchas dos modelos reais: [pedras de frente](art/pedras-modelos-v01-frente.png), [pedras de costas](art/pedras-modelos-v01-costas.png), [flores de frente](art/flores-modelos-v01-frente.png) e [flores de costas](art/flores-modelos-v01-costas.png). Todas mantêm câmera, iluminação e escala comparáveis dentro da categoria.

## Fauna / referência v01 / modelos v01

A [prancha de animais](art/animais-v01-aprovada.png) orienta os 11 novos modelos. Fontes Blockbench com UVs, atlas pintado próprio e pivôs editáveis em cabeça, membros, asas e cauda. As marcas incluem rosetas, carapaça e penas pintadas. As formas foram simplificadas para leitura na câmera do jogo; implementação em revisão.

[Modelos de frente](art/animais-modelos-v01-frente.png), [modelos de costas](art/animais-modelos-v01-costas.png), [fonte no Blockbench](art/validation/blockbench-onca-v01.png) e [jogo mobile](art/validation/mundo-fauna-v01-mobile.png). Ver [produção e comportamento](fauna.md). Travado: 11 identidades, fontes editáveis e direção low poly painted. Em teste: refinamento de anatomia/silhuetas, passos e desempenho em aparelhos físicos.
