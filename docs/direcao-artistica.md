# Mundo8bit / mundo / base / v01

Estado: rascunho para avaliação.

## Direção inicial

Câmera ortográfica elevada em diagonal (2,5D); volumes tridimensionais simples, árvores cônicas facetadas e personagem de silhueta compacta. Renderização em meia resolução com ampliação nearest-neighbor. A inspiração 8-bit aparece na leitura pixelizada e na paleta reduzida, sem pretensão de emular limitações de um console específico.

Paleta: verde musgo e sálvia para vegetação, azul dessaturado para água e névoa, areia clara nas baixadas, terracota e amarelo no explorador. Luz quente com preenchimento frio. A interface é discreta para preservar a leitura do mundo.

## Critérios de revisão

- Personagem reconhecível em escala de jogo.
- Vegetação com leitura simples e separação de planos.
- Bordas de terreno contínuas entre chunks.
- Mundo estável ao voltar a uma coordenada.
- Quantidade de chunks limitada durante exploração.

Em teste: paleta, escala, câmera e pixelização. Nenhuma direção foi ainda aprovada pelo usuário. Assets atuais são procedurais e editáveis em código; não existem arquivos Blender ou texturas externas.

## Árvores / A01–A11 / v01 — referência aprovada

O usuário aprovou a [prancha de 11 silhuetas](art/arvores-v01-aprovada.png). Preservar esta imagem como referência-base: pinheiro, carvalho, cipreste, salgueiro, palmeira, araucária, baobá, acácia, bétula, mangue e seca.

Implementação procedural v01 em `src/trees.js`: uma geometria compartilhada por espécie, cores por vértice e variação determinística de rotação e escala. Mangues e palmeiras predominam nas baixadas; as demais silhuetas aparecem no terreno seco. Modelos adaptados à escala do jogo, sem arquivos Blender/GLB. A implementação está em revisão visual; a aprovação da referência não implica aprovação automática dos modelos.

Travado: identidade das 11 silhuetas e paleta low poly. Em teste: densidade, proporções no jogo e fidelidade das copas. Alterações rejeitadas: nenhuma registrada.
