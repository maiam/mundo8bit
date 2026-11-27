# Personagens, mobs e NPCs geométricos

Direção vigente em 2026-11-27: todas as entidades são criações geométricas. Não usar sprites no lugar de personagens, mobs ou NPCs.

Contrato de criação aprovado: [RG-01](regras-criacao-entidades.md). Toda nova entidade deve seguir sua ficha e critérios de aceitação.

## Implementação atual

`src/voxel/entities/entity-defs.js` define Iara, Aldeão e Aldeã, capivara, tatu e tucano. `box-model.js` constrói hierarquias de paralelepípedos, pivôs de articulação e UVs. `animation.js` anima proceduralmente. `entities.js` gerencia as instâncias; `goals.js` seleciona metas de passeio e olhar; `pathfinding.js` calcula caminhos A*.

A unidade de arte é 1/8 de bloco por pixel. Humanoides têm 2 blocos de altura e skin 32×32 com box UV. O tamanho total da skin acomoda as faces e não altera a densidade de 8 px por bloco. A camada externa usa inflação de 0,25 px.

As texturas atuais são geradas por código (`paintSkin`, `skin: null`). A geometria existe independentemente de receber PNGs externos. Um PNG futuro poderá substituir a textura mantendo geometria, UV e densidade. Não há obrigação de aguardar envio do usuário para criar entidades.

`npm run assets:voxel-skins` exporta guias e texturas para inspeção. São resultados gerados por código, sem alegação de pintura manual.

## Limites atuais

Animais passeiam e olham para a jogadora, mas não cumprimentam nem concedem recompensas. O vínculo de mobs ao chunk de nascimento e o ciclo de vida do NPC inicial precisam ser revistos em proposta própria. A limpeza do clássico não alterou esses comportamentos.

Antes de mudar spawn, IA, navegação, colisões ou interação, seguir [o processo de regras](regras-de-mundo.md).

Fichas das definições atuais: [identidade, dimensões, articulações e limites de aprovação](entidades-atuais.md).
