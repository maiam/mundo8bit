# Propostas de regras de mundo

Instrução do usuário em 2026-11-27: antes de implementar regras de mundo, consultar a Minecraft Wiki como referência, formular a proposta e perguntar ao usuário.

## Processo obrigatório

1. Identificar a regra desejada e consultar páginas relevantes em https://minecraft.wiki. Diferenciar Java/Bedrock e versões quando isso afetar a referência.
2. Apresentar comparação explícita: **como funciona na Minecraft Wiki → como está no código atual → proposta para Mundo8bit → diferenças e motivo**. Incluir links, edição/versão quando relevante e parâmetros. O usuário deve ver a referência, não apenas a adaptação.
3. Formular a regra: gatilhos, condições, limites, exceções e fórmulas/parâmetros quando aplicáveis. Explicar o efeito visível e a adequação ao público infantil.
4. Perguntar ao usuário sobre a proposta concreta e aguardar sua resposta. Só implementar o escopo aprovado.
5. Registrar a decisão e validar os cenários relevantes. Alterações posteriores na regra seguem o mesmo processo.

Abrange terreno, geração, água, física/colisões, movimento, spawn, IA, blocos, itens, ações e progressão. Se a wiki não estiver acessível, explicitar a limitação e aguardar; não atribuir regras não verificadas à fonte.

## Modelo de proposta

- Regra e objetivo:
- Páginas consultadas e data:
- Comportamento de referência (edição/versão, se necessário):
- Estado atual no código, com arquivos e parâmetros:
- Adaptação para Mundo8bit:
- Diferenças em relação à wiki e justificativa:
- Fórmula/parâmetros, unidades e limites:
- Exemplos e exceções:
- Pergunta de aprovação:
- Resposta do usuário e escopo aprovado:

## Situação da limpeza de 2026-11-27

A remoção do clássico e a atualização documental foram solicitadas. As regras voxel existentes foram mantidas; esta limpeza não constitui aprovação de novas regras da Minecraft Wiki. Correções de ciclo de vida dos mobs/NPC e novas interações continuam pendentes de proposta e resposta do usuário.

## Regras aprovadas

- **RG-03, bloco A — locomoção da Iara:** A1–A7 aprovados em 2026-11-27. [Comparação e decisão](regras-movimento-comportamento.md). NPCs e mobs não incluídos.

- **RG-01 — criação de personagens, NPCs e mobs:** aprovada pelo usuário em 2026-11-27. [Contrato e escopo](regras-criacao-entidades.md). Não inclui aprovação de novas regras de spawn, persistência, hostilidade ou parâmetros físicos.

- **RG-02 — clima e ciclo de dia/noite:** aprovada pelo usuário em 2026-11-27. [Regras, fórmulas e escopo](regras-clima-dia-noite.md). Implementação inicial em 2026-11-27 (validação física pendente); sem efeitos físicos ou novos comportamentos de entidades.

## Exigência geral e auditoria do que já existe

Em 2026-11-27, o usuário determinou: “Não quero nada do jogo que ainda não tenha sido comparado com Wiki. Quero sempre ver como está na Wiki comparar e aprovar novos.”

O processo abrange também regras já implementadas. Existência no código, testes passando, publicação anterior ou aprovação de uma regra geral não substituem comparação e aprovação específica do comportamento. RG-01 e RG-02 mantêm seus escopos; não aprovam automaticamente as demais mecânicas.

Cada item deve distinguir:

- **Implementação:** existe, parcial ou ausente.
- **Comparação:** fonte consultada, parâmetros verificados, diferenças e limitações da consulta.
- **Decisão:** pendente, aprovada no escopo registrado ou recusada.

Até concluir essa auditoria, o runtime não pode ser descrito como integralmente comparado/aprovado. Regras sem evidência específica são pendentes; não inventar equivalências nem expandi-las como precedente. Não remover ou desativar silenciosamente sistemas: apresentar a divergência e a proposta de tratamento para decisão do usuário.

### Primeiro bloco de auditoria: movimento e comportamento

Pendentes de comparação detalhada e aprovação específica: velocidades de andar/correr, ativação de corrida, giro, degraus, bloqueio de água, volumes de colisão, animações de locomoção, passeio por metas, olhar para a jogadora, navegação, spawn e ciclo de vida de personagens/NPCs/mobs. Os valores atuais não se tornam aprovados pela RG-01.

Também auditar posteriormente geração/terreno, árvores/natureza, ação/alcance, itens/hotbar e demais regras existentes. Esta lista é inicial, não um certificado de completude.

### Formato obrigatório apresentado ao usuário

| Regra | Minecraft Wiki (fonte, edição e parâmetros) | Mundo8bit atual (arquivo e parâmetros) | Proposta e diferenças | Decisão do usuário |
| --- | --- | --- | --- | --- |
| Cada comportamento, separadamente | Somente fatos verificados; declarar acesso parcial ou ausência de equivalente | Descrever o código sem presumir aprovação | Manter, adaptar, substituir ou retirar, com efeito concreto | Pendente até resposta explícita |

Se a referência estiver indisponível ou insuficiente, registrar a limitação e manter o item pendente. Não declarar a auditoria concluída com base em suposições.

## Auditorias em análise

- [RG-03 — movimento e comportamento](regras-movimento-comportamento.md): bloco A (A1–A7, Iara) aprovado em 2026-11-27; velocidades implementadas em 2026-11-27. Bloco B (NPCs e mobs) continua pendente de comparação detalhada e aprovação.
