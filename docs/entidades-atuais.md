# Fichas das entidades atuais — RG-01

Inventário técnico em 2026-11-27. Documenta o código existente; não aprova automaticamente as regras particulares dos mobs/NPCs. Referências e escopo: [RG-01](regras-criacao-entidades.md) e [RG-03](regras-movimento-comportamento.md). Fonte única de geometria, pivôs, UV e paleta: `src/voxel/entities/entity-defs.js`.

## Iara

- Tipo/versão: `iara-voxel-v02`; papel: `player`.
- Rig: `humanoid`; altura base: 2 blocos. Partes e pivôs em pixels de 1/8 de bloco.
- Skin: 32×32 pixels, gerada por código, filtro nearest e box UV. Paleta por letras em `palette`; camadas e cores por face em `parts[].paint`.
- Colisão atual: círculo X/Z, raio 0.24; aprovada em RG-03 A7.
- Controle/capacidades: entrada do jogador, orientação e locomoção RG-03 A1–A7; velocidades 4,317/5,612 blocos/s.
- Animações atuais: procedural pelo rig, sincronizada ao deslocamento; cabeça pode orientar separadamente. Sem aprovação implícita de novas ações.
- Criação/ciclo atual: uma Iara no início, posição inicial determinística; nova sessão reinicia.
- Variações: sem catálogo adicional de variantes; não duplicar regra por trocar a textura.

| Parte | Dimensões px | Pivô px | Pai/camada | UV inicial |
| --- | --- | --- | --- | --- |
| perna-direita | 2×6×2 | -1, 6, 0 | raiz | 0, 8 |
| perna-esquerda | 2×6×2 | 1, 6, 0 | raiz | 8, 24 |
| tronco | 4×6×2 | 0, 12, 0 | raiz | 8, 8 |
| braco-direito | 2×6×2 | -3, 11, 0 | raiz | 20, 8 |
| braco-esquerdo | 2×6×2 | 3, 11, 0 | raiz | 16, 24 |
| cabeca | 4×4×4 | 0, 12, 0 | raiz | 0, 0 |
| cabeca-externa | 4×4×4 | 0, 12, 0 | camada de cabeca | 16, 0 |

## Aldeão

- Tipo/versão: `npc-aldeao-homem-v01`; papel: `npc`.
- Rig: `humanoid`; altura base: 2 blocos. Partes e pivôs em pixels de 1/8 de bloco.
- Skin: 32×32 pixels, gerada por código, filtro nearest e box UV. Paleta por letras em `palette`; camadas e cores por face em `parts[].paint`.
- Colisão atual: círculo X/Z, raio 0.3; aprovada para aldeões v01.
- Controle/capacidades: passeio 1,1 bloco/s, destinos ±4 células X/Z, pausas 4–9 s, olhar a menos de 6 blocos; aprovado em aldeoes-v01.md.
- Animações atuais: procedural pelo rig, sincronizada ao deslocamento; cabeça pode orientar separadamente. Sem aprovação implícita de novas ações.
- Criação/ciclo atual: uma instância de cada aldeão por sessão a 3–6 células da origem, em posição válida. Suspensão fora da área carregada e retomada da mesma instância; sem salvar entre sessões.
- Variações: sem catálogo adicional de variantes; não duplicar regra por trocar a textura.

| Parte | Dimensões px | Pivô px | Pai/camada | UV inicial |
| --- | --- | --- | --- | --- |
| perna-direita | 2×6×2 | -1, 6, 0 | raiz | 0, 8 |
| perna-esquerda | 2×6×2 | 1, 6, 0 | raiz | 8, 24 |
| tronco | 4×6×2 | 0, 12, 0 | raiz | 8, 8 |
| braco-direito | 2×6×2 | -3, 11, 0 | raiz | 20, 8 |
| braco-esquerdo | 2×6×2 | 3, 11, 0 | raiz | 16, 24 |
| cabeca | 4×4×4 | 0, 12, 0 | raiz | 0, 0 |
| cabeca-externa | 4×4×4 | 0, 12, 0 | camada de cabeca | 16, 0 |

## Aldeã

- Tipo/versão: `npc-aldeao-mulher-v01`; papel: `npc`.
- Rig: `humanoid`; altura base: 2 blocos. Partes e pivôs em pixels de 1/8 de bloco.
- Skin: 32×32 pixels, gerada por código, filtro nearest e box UV. Paleta por letras em `palette`; camadas e cores por face em `parts[].paint`.
- Colisão atual: círculo X/Z, raio 0.3; aprovada para aldeões v01.
- Controle/capacidades: passeio 1,1 bloco/s, destinos ±4 células X/Z, pausas 4–9 s, olhar a menos de 6 blocos; aprovado em aldeoes-v01.md.
- Animações atuais: procedural pelo rig, sincronizada ao deslocamento; cabeça pode orientar separadamente. Sem aprovação implícita de novas ações.
- Criação/ciclo atual: uma instância de cada aldeão por sessão a 3–6 células da origem, em posição válida. Suspensão fora da área carregada e retomada da mesma instância; sem salvar entre sessões.
- Variações: sem catálogo adicional de variantes; não duplicar regra por trocar a textura.

| Parte | Dimensões px | Pivô px | Pai/camada | UV inicial |
| --- | --- | --- | --- | --- |
| perna-direita | 2×6×2 | -1, 6, 0 | raiz | 0, 8 |
| perna-esquerda | 2×6×2 | 1, 6, 0 | raiz | 8, 24 |
| tronco | 4×6×2 | 0, 12, 0 | raiz | 8, 8 |
| braco-direito | 2×6×2 | -3, 11, 0 | raiz | 20, 8 |
| braco-esquerdo | 2×6×2 | 3, 11, 0 | raiz | 16, 24 |
| cabeca | 4×4×4 | 0, 12, 0 | raiz | 0, 0 |
| cabeca-externa | 4×4×4 | 0, 12, 0 | camada de cabeca | 16, 0 |

## Capivara

- Tipo/versão: `mob-capivara-voxel-v01`; papel: `mob`.
- Rig: `quadruped`; altura base: 0.8125 blocos. Partes e pivôs em pixels de 1/8 de bloco.
- Skin: 64×32 pixels, gerada por código, filtro nearest e box UV. Paleta por letras em `palette`; camadas e cores por face em `parts[].paint`.
- Colisão atual: círculo X/Z, raio 0.4; parâmetro específico ainda pendente de auditoria/aprovação.
- Controle/capacidades: IA atual de passeio e olhar; parâmetros específicos ainda pendentes de auditoria/aprovação.
- Animações atuais: procedural pelo rig, sincronizada ao deslocamento; cabeça pode orientar separadamente. Sem aprovação implícita de novas ações.
- Criação/ciclo atual: NPC Guia perto do início ou mobs gerados por chunk; migração/persistência e regras de spawn ainda pendentes.
- Variações: sem catálogo adicional de variantes; não duplicar regra por trocar a textura.

| Parte | Dimensões px | Pivô px | Pai/camada | UV inicial |
| --- | --- | --- | --- | --- |
| tronco | 5×4×8 | 0, 2, 0 | raiz | 16, 0 |
| cabeca | 3×3×4 | 0, 4, 4 | raiz | 0, 0 |
| perna-frente-esquerda | 2×2×2 | 1.5, 2, 2.5 | raiz | 0, 16 |
| perna-frente-direita | 2×2×2 | -1.5, 2, 2.5 | raiz | 0, 16 |
| perna-tras-esquerda | 2×2×2 | 1.5, 2, -2.5 | raiz | 0, 16 |
| perna-tras-direita | 2×2×2 | -1.5, 2, -2.5 | raiz | 0, 16 |

## Tatu

- Tipo/versão: `mob-tatu-voxel-v01`; papel: `mob`.
- Rig: `quadruped`; altura base: 0.5 blocos. Partes e pivôs em pixels de 1/8 de bloco.
- Skin: 32×16 pixels, gerada por código, filtro nearest e box UV. Paleta por letras em `palette`; camadas e cores por face em `parts[].paint`.
- Colisão atual: círculo X/Z, raio 0.25; parâmetro específico ainda pendente de auditoria/aprovação.
- Controle/capacidades: IA atual de passeio e olhar; parâmetros específicos ainda pendentes de auditoria/aprovação.
- Animações atuais: procedural pelo rig, sincronizada ao deslocamento; cabeça pode orientar separadamente. Sem aprovação implícita de novas ações.
- Criação/ciclo atual: NPC Guia perto do início ou mobs gerados por chunk; migração/persistência e regras de spawn ainda pendentes.
- Variações: sem catálogo adicional de variantes; não duplicar regra por trocar a textura.

| Parte | Dimensões px | Pivô px | Pai/camada | UV inicial |
| --- | --- | --- | --- | --- |
| tronco | 4×3×6 | 0, 1, 0 | raiz | 12, 0 |
| cabeca | 2×2×3 | 0, 2, 3 | raiz | 0, 0 |
| cauda | 1×1×3 | 0, 2, -3 | raiz | 8, 12 |
| perna-frente-esquerda | 1×1×1 | 1.5, 1, 2 | raiz | 0, 12 |
| perna-frente-direita | 1×1×1 | -1.5, 1, 2 | raiz | 0, 12 |
| perna-tras-esquerda | 1×1×1 | 1.5, 1, -2 | raiz | 0, 12 |
| perna-tras-direita | 1×1×1 | -1.5, 1, -2 | raiz | 0, 12 |

## Tucano

- Tipo/versão: `mob-tucano-voxel-v01`; papel: `mob`.
- Rig: `bird`; altura base: 0.75 blocos. Partes e pivôs em pixels de 1/8 de bloco.
- Skin: 32×16 pixels, gerada por código, filtro nearest e box UV. Paleta por letras em `palette`; camadas e cores por face em `parts[].paint`.
- Colisão atual: círculo X/Z, raio 0.2; parâmetro específico ainda pendente de auditoria/aprovação.
- Controle/capacidades: IA atual de passeio e olhar; parâmetros específicos ainda pendentes de auditoria/aprovação.
- Animações atuais: procedural pelo rig, sincronizada ao deslocamento; cabeça pode orientar separadamente. Sem aprovação implícita de novas ações.
- Criação/ciclo atual: NPC Guia perto do início ou mobs gerados por chunk; migração/persistência e regras de spawn ainda pendentes.
- Variações: sem catálogo adicional de variantes; não duplicar regra por trocar a textura.

| Parte | Dimensões px | Pivô px | Pai/camada | UV inicial |
| --- | --- | --- | --- | --- |
| perna-esquerda | 1×1×1 | 0.5, 1, 0 | raiz | 16, 0 |
| perna-direita | 1×1×1 | -0.5, 1, 0 | raiz | 16, 0 |
| tronco | 2×3×2 | 0, 1, 0 | raiz | 0, 4 |
| cabeca | 2×2×2 | 0, 4, 0 | raiz | 0, 0 |
| bico | 1×1×3 | 0, 1, 1 | cabeca | 8, 0 |
| asa-esquerda | 1×2×2 | 1, 4, 0 | raiz | 8, 4 |
| asa-direita | 1×2×2 | -1, 4, 0 | raiz | 8, 4 |
| cauda | 2×1×2 | 0, 1.5, -1 | raiz | 16, 4 |
