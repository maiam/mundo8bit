# RG-01 — criação de personagens, NPCs e mobs

Data: 2026-11-27. **Estado: aprovada pelo usuário em 2026-11-27.**

Escopo: contrato geral de criação de entidades geométricas. Não implementa spawn, persistência, combate, novos comportamentos ou alterações de colisão.

## Decisões já estabelecidas pelo usuário

- Mundo exclusivamente voxel, com arte em 8 pixels por bloco.
- Personagens, NPCs e mobs são criações geométricas, não sprites.
- Antes de implementar regras de mundo, consultar a Minecraft Wiki, formular a proposta e perguntar ao usuário.

O contrato abaixo foi aprovado pelo usuário em 2026-11-27 e orienta as próximas criações. A aprovação não significa que todas as capacidades descritas já estejam implementadas.

## Referências consultadas

Consulta em 2026-11-27 por conteúdo indexado retornado pela busca. O acesso direto à Minecraft Wiki foi bloqueado por robots.txt; não houve leitura integral das páginas nem auditoria de uma versão específica do jogo. Os conceitos abaixo são referência, não promessa de compatibilidade com Java ou Bedrock.

| Fonte | Conceito observado | Adaptação proposta |
| --- | --- | --- |
| [Entity](https://minecraft.wiki/w/Entity) e [Entity format](https://minecraft.wiki/w/Entity_format) | Entidades possuem estado espacial; o formato Java registra posição, rotação e identificador UUID | Separar definição do tipo e estado de cada instância; não exigir formato NBT ou UUID do Minecraft |
| [Skin](https://minecraft.wiki/w/Skin) | Textura distribuída pelas faces do modelo; template comum 64×64 e camada externa | Usar box UV e densidade própria de 8 px por bloco; humanoide atual com atlas 32×32 |
| [Hitbox](https://minecraft.wiki/w/Hitbox) | Volume físico aproxima o corpo e pode diferir do modelo; referências incluem cuboides e variações por estado | Definir colisão separadamente do visual; não trocar o motor atual automaticamente |
| [Mob](https://minecraft.wiki/w/Mob) | Tipos de mobs têm comportamentos próprios; existem classificações passiva, neutra e hostil | Definir comportamento por entidade, sem inferi-lo pela aparência ou importar combate |
| [NPC](https://minecraft.wiki/w/NPC) | NPC é um mob interativo específico de Bedrock/Education | No Mundo8bit, NPC será um papel de personagem; não copiar restrições desse mob específico |
| [Mob spawning](https://minecraft.wiki/w/Mob_spawning) | Há regras por edição/tipo; verificações de espaço e condições de nascimento | Exigir uma política de criação declarada; parâmetros de spawn serão propostas separadas |

## Regra geral aprovada

**Toda entidade é uma definição reutilizável de geometria, aparência e capacidades, mais uma instância identificável no mundo. Jogadora, NPC e mob compartilham a mesma base técnica; diferem em quem os controla e em sua função.**

### 1. Papel e identidade

- `player`: personagem controlado pelo jogador.
- `npc`: personagem com papel autoral, como guia, morador ou participante de atividade; pode ter IA.
- `mob`: criatura autônoma com comportamento definido por espécie/tipo.

Esses nomes são convenções de Mundo8bit, não categorias equivalentes em todas as edições de Minecraft. Ser humanoide não torna uma entidade NPC; ter forma animal não define agressividade. Um NPC pode ter forma animal.

Cada tipo deve declarar identificador, nome, papel e versão. Cada instância tem identificador próprio, referência ao tipo, posição, orientação e estado. Uma skin diferente é variante de aparência, não necessariamente novo comportamento.

### 2. Geometria e articulação

Construir com paralelepípedos organizados numa hierarquia. Declarar tamanho, posição, parte pai, pivô e UV de cada peça. Ombros, quadris, pescoço, asas e cauda articulam em seus próprios pivôs quando existirem.

As proporções seguem a espécie e a silhueta desejada. Não obrigar todos os NPCs ou mobs a usar o corpo humanoide. Reutilizar `src/voxel/entities/` e os rigs adequados; extensões futuras precisam ser declaradas.

### 3. Escala e densidade

- 1 bloco = 1 unidade de mundo.
- 1 pixel de arte = 1/8 de bloco.
- Para dimensão de `n` pixels: `dimensão_em_blocos = n / 8`.
- Para dimensão de `b` blocos: `pixels = 8 × b`.

Dimensões base das peças e coordenadas UV usam pixels inteiros. Posições no mundo e ângulos de animação são contínuos. Ajustes técnicos de camada externa não mudam a densidade artística.

A conversão de uma referência de 16 px/bloco para 8 px/bloco é `n8 = n16 / 2`, preservando o tamanho em blocos. Se resultar em meio pixel, redesenhar a peça na grade de 8 px em vez de esticar a textura.

Exemplo já existente, sem impor nova anatomia: humanoide com 16 pixels de altura = 2 blocos; cabeça 4×4×4, tronco 4×6×2 e membros 2×6×2 pixels. Esse perfil usa skin 32×32, não uma imagem inteira de 8×8. Mobs têm dimensões e atlas próprios.

### 4. Aparência

Aplicar texturas sobre as faces geométricas, com box UV e filtro nearest, sem esticar pixels. Uma textura pode ser gerada por código ou fornecida em PNG. PNG não substitui o corpo geométrico e não é pré-requisito para criá-lo.

Reutilizar UV entre partes somente quando a aparência compartilhada for intencional. Acessórios podem ser peças ou camadas adicionais; a técnica deve ser documentada. A inflação atual de 0,25 px é escolha existente do projeto, não valor universal de Minecraft.

### 5. Modelo visual, colisão e interação separados

Cada definição declara explicitamente seu volume de colisão e, quando houver interação, seu alcance/alvo. Não calcular a colisão automaticamente pela soma das peças visuais. Asas, caudas, cabelos e chapéus não precisam bloquear toda a silhueta.

O jogo atual usa colisões de entidades por círculos no plano X/Z. A wiki descreve outros volumes; esta proposta não autoriza trocar círculos por caixas, acrescentar altura física ou mudar alcances. Esses parâmetros precisam de análise e aprovação próprias.

### 6. Controle, comportamento e animação

Separar entrada do jogador, decisão de IA e animação. As animações respondem ao estado e ao deslocamento; não substituem a lógica de movimento.

NPCs e mobs declaram capacidades e metas adequadas, por exemplo olhar e passear. Não receberão automaticamente ataque, fuga, diálogo, reprodução, fome, recompensas ou coleta por pertencerem a uma categoria. Cada nova capacidade precisa de proposta aprovada.

Reutilizar animação procedural e seleção de metas existentes. Velocidade, prioridade, raio e duração são parâmetros explícitos por tipo; esta regra geral não fixa novos valores.

### 7. Criação e ciclo de vida declarados

A ficha informa a intenção de criação: jogador inicial, NPC colocado ou mob gerado. Deve registrar também o que se espera ao sair da área carregada e ao voltar.

Não confundir descarregar a representação gráfica com decidir a existência da entidade. Identidade estável, migração entre chunks e salvamento ainda exigem decisão específica; o código atual não passa a oferecer essas funções com a aprovação deste contrato.

### 8. Ficha mínima antes de criar uma entidade

1. Identificador do tipo, nome, versão e papel (`player`, `npc` ou `mob`).
2. Silhueta, dimensões em pixels/blocos, partes e pivôs.
3. Rig, UV, tamanho da textura, paleta e variantes.
4. Colisão existente reutilizada ou proposta específica de colisão.
5. Controle/capacidades, estados e animações.
6. Forma de criação e intenção de ciclo de vida; marcar decisões ainda pendentes.
7. Fontes consultadas, diferenças em relação à referência e aprovação correspondente.

### 9. Critérios para aceitar uma criação

- Silhueta legível na câmera isométrica e na escala de jogo.
- Densidade 8 px/bloco, UV dentro do atlas e ausência de esticamento.
- Articulações não soltam partes do corpo durante as animações previstas.
- Colisão consistente com a definição aprovada e espaço de nascimento válido conforme a política aplicável.
- A aparência não adiciona capacidades ou regras implicitamente.
- Validar o que foi implementado; não apresentar pendências como concluídas.

## Decisão registrada

**Aprovada pelo usuário em 2026-11-27**, com a resposta “Aprovo.” à proposta RG-01.

Escopo aprovado: contrato geral de criação, proporções próprias por espécie, base geométrica comum, separação entre aparência, colisão e comportamento, ficha obrigatória e critérios de aceitação por entidade.

Spawn, persistência, hostilidade e parâmetros físicos permanecem decisões separadas. Esta aprovação não autoriza automaticamente novas mecânicas nem altera o comportamento do jogo. Nenhum código foi alterado por este registro.
