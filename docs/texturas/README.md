# Catálogo de texturas — Mundo8bit

Inventário de 2026-11-27. Esta organização documenta os arquivos e geradores atuais; não aprova novas artes nem mecânicas. Fontes anteriores permanecem intactas. Densidade vigente: **8 px/bloco**; uma skin inteira pode ser maior que 8×8.

## Referências visuais

- [Prancha dos 16 blocos atuais](blocos-atuais-v01.png)
- [Prancha das cinco skins atuais](skins-atuais-v01.png)
- [Prancha de atlas históricos](atlas-historicos-v01.png)

As pranchas mostram arquivos de textura, não renders dos modelos. Ampliações usam nearest; atlas históricos são miniaturas de consulta, sem conversão para o voxel.

## Organização dos arquivos

| Local | Conteúdo | Uso |
| --- | --- | --- |
| `src/voxel/voxel-atlas.js` | Gerador do atlas 32×32 e 16 células 8×8 | Fonte efetiva dos blocos no runtime |
| `src/voxel/entities/entity-defs.js` + `box-model.js` | Definições, paletas e gerador das cinco skins | Fonte efetiva das texturas das entidades |
| [catalogo-v01](../../assets/voxel/texturas/catalogo-v01/manifest.json) | Atlas PNG, 16 blocos separados e cinco skins exportadas; hashes e fontes | Cópias fiéis para referência, não carregadas pelo jogo |
| [modelos](../../assets/voxel/skins/modelos/modelos.json) | Cinco skins provisórias exportadas anteriormente e cinco guias UV | Guias de pintura; não confundir guia colorido com arte final |
| `archive/classico/assets/textures/` | Atlas low poly e estudo de grama | Histórico; não está no runtime voxel |
| `archive/classico/assets/blockbench/` | 98 fontes com texturas embutidas | Histórico editável preservado |
| `archive/classico/public/assets/` | Cópias de exports e sprites antigos | Histórico; não reintegrar automaticamente |

O jogo gera as texturas em memória. Trocar o PNG do catálogo não muda o jogo. Refinamentos futuros precisam de versão nova e integração explícita após revisão.

## Blocos que já temos

Todos abaixo têm textura 8×8 em uso, gerada por código; acabamento ainda pode ser revisto. O número é a posição no atlas atual, não identificador de um novo bloco jogável.

| Tile | Arquivo | Aplicação visual atual |
| --- | --- | --- |
| 00 | `grassTop` | Grama, topo |
| 01 | `grassSide` | Grama com terra, lateral |
| 02 | `dirt` | Terra |
| 03 | `stone` | Pedra do terreno |
| 04 | `sand` | Areia |
| 05 | `water` | Água; transparência vem do material do runtime |
| 06 | `logSide` | Tronco, lateral |
| 07 | `logTop` | Tronco, corte |
| 08 | `birchSide` | Bétula, lateral |
| 09 | `leaves` | Folhagem verde |
| 10 | `leavesPink` | Folhagem rosa |
| 11 | `leavesApple` | Folhagem com maçãs |
| 12 | `grassLightTop` | Grama clara, topo |
| 13 | `grassLightSide` | Grama clara com terra, lateral |
| 14 | `cobble` | Pedra decorativa |
| 15 | `white` | Branco utilitário para tingimento de flores/caules |

Arquivos individuais em [blocos](../../assets/voxel/texturas/catalogo-v01/blocos/). Flores usam geometria com cores sobre o tile branco, não 23 PNGs voxel independentes. Chuva usa segmentos coloridos; dia/noite usa paleta ambiente. O ícone da mão é SVG gerado em `hud.js`, não PNG ausente que impeça o jogo.

## Entidades que já temos

| Entidade | Skin atual | Guia | Próxima revisão artística |
| --- | --- | --- | --- |
| Iara v02 | 32×32 | Disponível | Conferir identidade e leitura em jogo |
| NPC Guia v01 | 32×32 | Disponível | Definir identidade/nome e acabamento |
| Capivara v01 | 64×32 | Disponível | Refinar aparência mantendo UV |
| Tatu v01 | 32×16 | Disponível | Refinar aparência mantendo UV |
| Tucano v01 | 32×16 | Disponível | Refinar aparência mantendo UV |

[Skins exportadas](../../assets/voxel/texturas/catalogo-v01/skins/) e [fichas geométricas](../entidades-atuais.md). Todas são geradas por código. Elas já existem; PNG manual externo não é pré-requisito. Refinamento visual não aprova movimento/IA da entidade.

## O que precisamos criar ou decidir

| Item | O que existe | Lacuna real | Estado |
| --- | --- | --- | --- |
| Blocos básicos | 16 células em uso | Revisão de acabamento, não ausência de textura | Em revisão; sem arte nova aprovada nesta organização |
| Cinco entidades atuais | Skins e guias | Refinamento e identidade do Guia | Em revisão |
| Outros animais do acervo clássico | Fontes/atlas low poly históricos | Modelos geométricos voxel, UV e skins próprios, caso sejam escolhidos | A definir; não converter automaticamente |
| Novos materiais/blocos | Referências históricas variadas | Escolher quais entram no voxel antes de criar suas texturas | A definir e comparar com wiki quando envolver regra |
| Sol, lua, estrelas e nuvens desenhados | Paleta ambiente; sem corpos celestes no horizonte | Arte específica se for incluída na apresentação | Não existente; desenho e integração a definir |
| Novos itens/ícones de hotbar | Mão SVG; demais espaços vazios | Definir itens e suas regras antes da arte | A definir |
| Álbum/figurinhas/recompensas | Proposta no roadmap | Mecânica e artes ainda não entregues | A definir, não material atual |

Não classificar todo arquivo antigo como trabalho pronto para 8 px/bloco. Não redimensionar nem sobrescrever referências aprovadas para preencher lacunas. Elementos travados: densidade 8 px/bloco e entidades geométricas. Em teste: acabamento; novas artes ainda requerem revisão. Nenhuma nova direção foi aprovada por este inventário.

## Inventário verificável

- [CSV](inventario.csv) e [JSON](inventario.json): **59 PNGs** externos nos diretórios de assets (inclui guias, duplicatas e cópias de catálogo; não significa 59 artes únicas).
- [Texturas embutidas](fontes-blockbench.json): **98 registros em 98 fontes** históricos, fora da contagem de PNGs externos.
- [Duplicatas](duplicatas.json): **17 grupos** de PNGs idênticos por SHA-256. Nenhuma cópia apagada.
- [Manifesto voxel](../../assets/voxel/texturas/catalogo-v01/manifest.json): 22 PNGs novos de consulta (1 atlas + 16 células + 5 skins), dimensões, hashes e hashes dos geradores.

Escopo: PNGs em `assets/` e nos assets arquivados; texturas embutidas nos `.bbmodel` históricos. Pranchas aprovadas em `docs/art/` e capturas de QA não são contadas como texturas independentes. Referências artísticas centrais: [texturas v01](../art/texturas-v01-aprovada.png), [Iara](../art/iara-conceito-v01-aprovado.png), [animais](../art/animais-v01-aprovada.png), [pedras/flores](../art/pedras-flores-v01-aprovada.png).

## Atualizar o catálogo

```sh
npm run assets:catalog
python3 scripts/catalog-textures.py
```

O exportador requer as dependências npm instaladas; o inventário/pranchas requer Python 3, Pillow e fonte DejaVu Sans. Executar após mudar os geradores. PNGs do catálogo são derivados: não pintá-los como se fossem a fonte de produção; abrir uma nova versão para alterações artísticas.
