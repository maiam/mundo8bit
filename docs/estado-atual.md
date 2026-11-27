# Estado atual — 2026-11-27

O único mundo é voxel com arte em 8 px por bloco. A aplicação clássica e seus exports foram movidos para `archive/classico/`, fora do build.

| Área | Implementado | Pendências |
| --- | --- | --- |
| Mundo | Geração determinística, semente 808, chunks 12×12, janela 9×9 | Medir streaming síncrono em aparelho físico |
| Arte | Texturas 8×8 por face, atlas gerado por código, câmera isométrica 2:1 | Refinamento visual sem trocar a densidade |
| Entidades | Iara, NPC Guia, capivara, tatu e tucano geométricos; box UV e animação procedural | Identidade do Guia e novos mobs |
| Navegação | A* e metas de passeio/olhar; colisões com jogador, troncos, pedras e água | Ciclo de vida dos animais entre chunks e do NPC inicial precisa de proposta |
| Controles | Joysticks, corrida, orientação, ação, hotbar, zoom, teclado, pausa em retrato | Validar compreensão com criança e aparelho real |
| Ação | Anima o braço, calcula alvo e emite evento `voxel-acao` | Sem efeito em blocos, saudação ou reação dos animais |
| Interface | Menu, pixel art, origem, limites dos chunks e tela cheia condicional | Convites visuais/sonoros compreensíveis sem leitura |
| Áudio e progresso | Sem áudio, missões, figurinhas ou progresso salvo | Ainda propostas |

A alternância de pixel art muda a apresentação; não existe modo clássico. Skins são texturas aplicadas à geometria e não sprites substituindo personagens.

Testes automatizados cobrem geração, colisões, apresentação, controles, terreno e entidades. QA de navegador existe em `scripts/verify-voxel.mjs`; resultados históricos não comprovam o estado atual nem desempenho em dispositivo físico. Não há validação infantil concluída.

Antes de mudar regras de mundo, seguir [consulta à wiki, proposta e aprovação](regras-de-mundo.md).
