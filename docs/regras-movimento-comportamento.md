# RG-03 — auditoria de movimento e comportamento

Data: 2026-11-27. **Estado: bloco A (A1–A7) aprovado pelo usuário em 2026-11-27; bloco B pendente.** Bloco A implementado em 2026-11-27; bloco B não alterado.

## Fontes e limites

Consulta a trechos indexados da Minecraft Wiki em 2026-11-27. Acesso direto bloqueado por robots.txt; não é leitura integral nem certificação de versão específica. Priorizar mecânicas Java quando indicadas; não misturar com Bedrock/Education sem identificação.

- [Walking](https://minecraft.wiki/w/Walking): caminhada padrão de aproximadamente 4,317 blocos/s; condições de terreno podem alterar velocidade.
- [Sprinting](https://minecraft.wiki/w/Sprinting): aproximadamente 5,612 blocos/s, 30% acima da caminhada.
- [Controls](https://minecraft.wiki/w/Controls): corrida por duplo toque para frente ou tecla própria; Shift é agachar no teclado padrão Java.
- [Attribute — Step Height](https://minecraft.wiki/w/Attribute#Step_Height): altura padrão de passo 0,6 bloco; há diferenças por entidade.
- [Jumping](https://minecraft.wiki/w/Jumping) e [Options](https://minecraft.wiki/w/Options): auto-jump é salto automático, não simples aumento do passo.
- [Swimming](https://minecraft.wiki/w/Swimming): água permite movimento/natação; não é barreira universal.
- [Hitbox](https://minecraft.wiki/w/Hitbox): corpo físico de jogador em pé com aproximadamente 0,6 de largura e 1,8 de altura; caixa Java não gira com o modelo. Interação entre entidades pode empurrá-las.
- [Rotation](https://minecraft.wiki/w/Rotation): orientação por yaw/pitch.
- [Mob AI](https://minecraft.wiki/w/Mob_AI): metas como passeio, olhar e evitar água; navegação depende do tipo.
- [NPC](https://minecraft.wiki/w/NPC): NPC específico de Bedrock/Education não tem locomoção autônoma básica, embora possa olhar para jogador próximo.

Os links de navegação são referências; somente as afirmações resumidas acima foram verificadas nos trechos retornados. Não atribuir à wiki parâmetros locais sem evidência.

## Bloco A — personagem jogável: comparação e proposta

As propostas abaixo são adaptações explícitas; não implicam aprovação dos demais sistemas.

| ID / regra | Minecraft Wiki | Mundo8bit atual | Proposta para decisão |
| --- | --- | --- | --- |
| A1 — velocidade | Caminhar ≈4,317 e correr ≈5,612 blocos/s (+30%) em condições normais | `voxel-main.js`: 4 e 8 blocos/s (+100%); entrada analógica reduz proporcionalmente a velocidade | Adotar 4,317 e 5,612 blocos/s como velocidades nominais em chão seco; conservar controle proporcional e limite de diagonal |
| A2 — ativação da corrida | Duplo toque para frente ou tecla de corrida; Shift é agachar em Java; há condições de fome | `controls.js`: 3 s para cima, magnitude ≥0,6, desvio ≤45°; soltar/desviar zera. Shift corre imediatamente; sem fome | Manter esses controles como adaptação ao toque e à câmera, explicitamente diferente de Minecraft. Não adicionar fome/agachar nesta regra |
| A3 — resposta do movimento | Velocidade resulta de aceleração e atrito; materiais podem modificá-la | Deslocamento direto por velocidade × dt; sem inércia/atrito por material. Diagonal limitada à mesma magnitude | Manter resposta direta e sem modificadores de superfície neste recorte; copiar velocidade nominal não significa copiar física completa |
| A4 — orientação | Yaw/pitch controlam orientação; andar para trás não exige girar o personagem para o sentido do deslocamento | Andando, Iara orienta para o movimento. Parada: Q/E gira 45° e joystick direito orienta continuamente. Corpo suaviza giro | Manter orientação relativa à câmera isométrica, como adaptação; sem copiar controles de câmera em primeira pessoa |
| A5 — degraus/quedas | Passo padrão 0,6; subir bloco inteiro envolve salto ou auto-jump. Existe movimento vertical | `MOVE.maxStepHeight=1.01` e comparação absoluta de altura: sobe/desce uma coluna de 1 bloco; não há salto/gravitacional, apenas interpolação visual Y | Manter subida e descida automáticas de até 1 bloco como adaptação, sem chamar de salto de Minecraft. Não permitir diferenças maiores neste recorte |
| A6 — água | Permite deslocamento/natação, com regras e velocidades próprias | `voxelGround` retorna −10 em coluna submersa e `minGround=-5` bloqueia entrada; margem considera raio. Todos os atuais usam regra terrestre | Manter água bloqueada neste recorte, explicitamente como adaptação provisória. Natação exige proposta própria por entidade |
| A7 — colisão | Caixa do jogador em pé ≈0,6×1,8; entidades podem se empurrar | Jogadora: círculo X/Z de raio 0,24 (diâmetro 0,48); sem volume físico vertical. Troncos/pedras: caixas. Movimento resolve contato sem empurrar entidade parada | Manter círculos e raio atual neste recorte, registrando a diferença. Não afirmar compatibilidade física com Minecraft. Volume 3D/empurrão seriam nova proposta |

Decisão de todos os itens A1–A7: **aprovados pelo usuário em 2026-11-27**, com a resposta “Aprovo sua recomendação”. As propostas da tabela são o escopo aprovado; a coluna de estado atual permanece como evidência anterior à implementação.

### Fórmulas e limites da proposta A

- `m = sqrt(x² + z²)`; entrada limitada: `(x,z) / max(1,m)`.
- Deslocamento solicitado: `direção × velocidade_nominal × dt`; colisão pode reduzir o deslocamento real.
- `velocidade_corrida ≈ 1,3 × velocidade_andar`; os valores 4,317 e 5,612 são referências arredondadas, não igualdade decimal exata.
- 8 px/bloco é densidade artística; não dividir a velocidade por dois ao converter a arte de Minecraft.
- O código atual limita dt de movimento a 0,05 s e o usado na corrida a 0,25 s por frame. Isso pode desacelerar movimento/contagem em FPS muito baixo. Correção de relógio/simulação não está embutida na aprovação das velocidades nominais; requer tratamento separado.
- Subida atual considera a altura central e a margem contra água, não o volume 3D completo do corpo. Aprovar a adaptação não certifica passagem sob tetos.

### Evidências no código atual

- `src/voxel/voxel-main.js`: `MOVE`, `frame`, `movePlayer`, `aimFacing`, teclado e interpolação vertical.
- `src/voxel/controls.js`: `createRunRule` e seus valores padrão.
- `src/voxel/voxel-settings.js`: movimento relativo à câmera.
- `src/collisions.js`: `PLAYER_RADIUS`, `move`, `walkableGround`, `project` e contatos dinâmicos.
- `src/voxel/voxel-terrain.js`: `voxelGround`, `WATER_TOP`, `BLOCKED_GROUND`.

## Bloco B — NPCs e mobs: inventário, ainda sem proposta completa

Não aplicar a eles automaticamente as velocidades de jogador.

| Entidade | Velocidade atual (blocos/s) | Raio atual (blocos) |
| --- | --- | --- |
| Guia | 1,1 | 0,3 |
| Capivara | 1,2 | 0,4 |
| Tatu | 0,9 | 0,25 |
| Tucano | 1,0 | 0,2 |

Fonte: `entity-defs.js`. Todas usam locomoção terrestre, degrau de 1 bloco e água bloqueada. Tucano não possui navegação aérea. Capivara não possui natação. Não presumir equivalência da capivara ou tucano com uma espécie de Minecraft; o tatu local também exige comparação específica, não apenas igualdade de nome.

O Guia atual passeia; isso difere do NPC Bedrock/Education descrito na wiki. Pela RG-01, NPC é um papel autoral no Mundo8bit, logo a escolha de referência entre NPC estacionário e personagem móvel precisa ser explicitada antes de aprovar seu comportamento.

Metas atuais: passeio aleatório e olhar para a jogadora, com navegação A*. A wiki oferece conceitos análogos, mas não valida automaticamente raios, intervalos, prioridades, limites de cabeça e critérios de caminho locais. Comparação por espécie e por meta ainda pendente. Spawn, despawn, migração de chunk, persistência, animações detalhadas e rotinas de clima/horário não foram auditados neste bloco.

## Registro da decisão

Bloco A: **A1–A7 aprovados em 2026-11-27**, pela resposta “Aprovo sua recomendação”. Velocidades nominais aprovadas: caminhada 4,317 e corrida 5,612 blocos/s. As velocidades foram atualizadas em `controls.js` e integradas ao loop em 2026-11-27: 4,317 e 5,612. As adaptações de controles, resposta direta, orientação, degrau de 1 bloco, bloqueio de água e colisão circular foram aprovadas conforme a tabela.

Bloco B: inventário inicial; comparação detalhada e propostas ainda pendentes. A aprovação da Iara não aprova NPCs/mobs, spawn, persistência, física 3D, empurrão, natação ou correções de relógio. Nesta implementação, somente as velocidades da personagem foram alteradas; as demais adaptações aprovadas já existiam.
