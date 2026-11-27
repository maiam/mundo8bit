# Aldeão e Aldeã — proposta v01

Estado: **aparência e integração inicial aprovadas pelo usuário em 2026-11-27; implementadas.** Data: 2026-11-27.

[Prancha dos modelos](arte/aldeoes-v01.png) · [Visualizador local](arte/aldeoes-v01.html) · [Definições geométricas](../assets/voxel/npcs/aldeoes-v01.mjs)

## Comparação com a Minecraft Wiki

Consulta por trechos indexados de [Villager](https://minecraft.wiki/w/Villager) e [Villagers](https://minecraft.wiki/w/Villagers), em 2026-11-27. Acesso direto bloqueado por robots.txt; consulta parcial, sem auditoria de uma versão específica.

| Aspecto | Wiki | Mundo8bit atual | Proposta |
| --- | --- | --- | --- |
| Identidade/aparência | Aldeãos têm variantes visuais; não foi verificada nesta consulta uma regra de homem/mulher | Um Guia provisório humanoide | Dois adultos: homem e mulher, conforme pedido. Essa identidade é criação de Mundo8bit, sem atribuir à wiki |
| Modelo/colisão | Aldeão adulto Java: hitbox 1,95 de altura × 0,6 de largura; Bedrock: 1,9 × 0,6 | Guia: modelo de 2 blocos e círculo X/Z de raio 0,3, sem colisão vertical | Modelos de 2 blocos; proporções RG-01 e skin 32×32. Para integrar: círculo raio 0,3 como adaptação local, não caixa de Minecraft |
| Passeio/olhar | Aldeãos passeiam e observam jogadores próximos | Guia passeia e olha para Iara | Ambos com mesmo comportamento: velocidade 1,1 bloco/s; destinos até ±4 células X/Z da origem, pausas de 4–9 s e olhar a menos de 6 blocos. Esses parâmetros vêm da implementação local, não são valores verificados de Minecraft |
| Rotina | Existem rotinas de trabalho, reunião e sono, com diferenças Java/Bedrock | Não há casas, camas, trabalho ou sono | Primeiro recorte só passeio e olhar; não conceder profissão, comércio, sono ou resposta ao clima por aparência |
| Criação no mundo | Há aldeãos gerados com aldeias e outras formas de criação | Guia nasce em uma célula livre perto do início | Substituir o Guia provisório por uma instância de cada modelo, procurando duas células secas/livres e sem sobreposição a 3–6 células da origem; se não houver duas, usar apenas as posições válidas, sem forçar spawn em obstáculo |
| Ciclo de vida | A mecânica completa de persistência não foi verificada nesta consulta | Guia sem vínculo a chunk, sem salvamento entre sessões | Manter instâncias durante a sessão, sem multiplicar ao voltar à origem/recarregar chunks; só atualizar IA enquanto a região atual estiver carregada. Nova sessão recria o par. Sem salvamento; adaptação explícita aprovada |

O campo de velocidade numérico mostrado pela wiki não foi convertido diretamente em blocos/s; atributos e velocidade efetiva não são unidades intercambiáveis.

## Fichas dos modelos aprovados

- **Homem:** `npc-aldeao-homem-v01`, nome Aldeão, papel NPC, rig humanoide; camisa verde, gola clara, calça marrom, cabelo curto e barba.
- **Mulher:** `npc-aldeao-mulher-v01`, nome Aldeã, papel NPC, rig humanoide; blusa terracota, gola clara, calça azul-petróleo e cabelo comprido.
- Ambos: cabeça 4³ px, tronco 4×6×2, membros 2×6×2, altura 16 px = 2 blocos; pivôs e box UV reutilizados da base existente. Textura 32×32 gerada por código, nearest, camada externa de cabelo inflada 0,25 px.
- Partes, UV, paleta e pivôs estão nas definições editáveis. A aparência não define profissão, velocidade, força ou privilégios diferentes entre homem e mulher.
- Fonte única no runtime: `entity-defs.js`; o arquivo em `assets/voxel/npcs/` reexporta as definições para a prancha. Colisão raio 0,3; velocidade 1,1; metas passeio ±4 células, pausas 4–9 s e olhar a menos de 6 blocos. Uma instância por tipo, posições válidas a 3–6 células da origem.
- O par substitui o Guia provisório. Fora dos chunks carregados, fica invisível, sem corpo dinâmico e com IA suspensa; ao retornar, retoma as mesmas instâncias. Sem salvamento entre sessões. Os mobs não foram alterados.

## Revisão

Travado: aparência v01 aprovada (cabelo, barba, roupas e cores), geometria articulada e densidade 8 px/bloco. Revisões futuras abrem nova versão. Skins/guias exportados e catálogo atualizado em v02.

**Decisão registrada:** resposta “Sim” em 2026-11-27 à aprovação da aparência e da integração inicial proposta. Inclui o recorte da tabela: par substituindo o Guia, passeio/olhar com parâmetros declarados, colisão circular, criação em posições válidas e suspensão/retomada por área carregada. Não inclui profissões, comércio, sono, reprodução ou reação ao clima.

Validação: 40 testes unitários e build passaram; QA voxel no Chromium confirmou os dois tipos, movimento/ações e toque emulado. Evidências em `docs/art/validation/aldeoes-v01-*`. Uso em aparelho físico continua pendente.
