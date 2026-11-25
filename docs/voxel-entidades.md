# Entidades voxel — jogadora, NPCs e mobs em box model (v01)

Pedido do usuário em 2026-11-25: personagens, NPCs e mobs feitos de caixas, como no Minecraft, com a mesma arquitetura técnica em 3 camadas: **geometria articulada**, **skin em atlas** e **animação procedural + IA por metas**.

## Escala: 8 px por bloco (regra do mundo)

A referência enviada usa a escala do Minecraft (16 px por bloco, escala 0,9 para chegar a 1,8 bloco). Mas a regra do projeto é **o mundo 100% a 8 px por bloco**, e a Iara foi definida com **2 blocos**. Por isso a v01 adota as **mesmas proporções e pivôs do Minecraft divididos por 2**, sem escala extra:

| Parte (humanoide) | Minecraft (16 px) | Mundo8bit (8 px) | Pivô (8 px) |
|---|---|---|---|
| Cabeça | 8×8×8 | 4×4×4 | base do pescoço, y 12 |
| Tronco | 8×12×4 | 4×6×2 | pescoço, y 12 |
| Braços | 4×12×4 | 2×6×2 | ombro, x ±3, y 11 (1 px abaixo do topo) |
| Pernas | 4×12×4 | 2×6×2 | quadril, x ±1, y 6 |
| Camada externa | +0,5 px | +0,25 px | mesma espessura no mundo (1/32 de bloco) |
| Skin | 64×64 | **32×32** | layout do jogador do Minecraft ÷ 2 |

Altura total: 16 px = **2,0 blocos**. A entidade fica de frente para +Z; o lado direito dela é −X.

## 1. Geometria: hierarquia de caixas (`src/voxel/entities/box-model.js`)

- **Pivô na articulação:** cada parte é um grupo posicionado no pivô (relativo ao pai). A malha é deslocada (`offset`) para girar na junta sem se separar do corpo. Um teste confirma que o ombro fica parado enquanto a mão se move.
- **Hierarquia pai → filho:** a mesma estrutura serve para filhos encadeados (`parent`), como o bico preso à cabeça do tucano.
- **Camada externa** (`overlay` + `inflate`): segunda caixa inflada sobre a parte, para cabelo, chapéu ou roupa, sem triângulos extras. Pixels transparentes são cortados (`alphaTest`).
- **Silhueta:** a Iara recebe uma silhueta clara, desenhada só onde o cenário a encobre (isometria).

## 2. Skin: atlas PNG com box UV

- **Formato:** cada entidade lê **um único PNG**, com 1 px da skin = 1/8 de bloco.
- **Box UV padrão do Minecraft**, para uma caixa w×h×d com origem (u, v):
  - linha de cima: topo `(u+d, v)` e base `(u+d+w, v)`;
  - linha de baixo: direita `(u, v+d)`, frente `(u+d, v+d)`, esquerda `(u+d+w, v+d)` e costas `(u+2d+w, v+d)`.
- **Pixels nunca esticam:** a cabeça 4×4×4 ocupa exatamente 4×4 por face.
- **Pernas compartilhadas:** partes iguais podem compartilhar a mesma área (ex.: as 4 pernas da capivara).
- **Enquanto o PNG não chega:** `skin: null` nas definições, e o jogo pinta uma **skin provisória** no mesmo layout, por regra (grade de letras por face). Isso não é pintura manual.
- **Quando o PNG chegar:** basta apontar `skin` para o arquivo (carregado com nearest, sem mipmaps, `flipY` desligado).
- **Modelos para pintar:** `npm run assets:voxel-skins` exporta para `assets/voxel/skins/modelos/` dois arquivos por entidade:
  - `*-provisoria.png`, a skin atual;
  - `*-guia-uv.png`, com uma cor por face (topo amarelo, base oliva, direita azul, frente vermelha, esquerda verde, costas roxa).
  - Prancha de revisão: [modelos de skin](art/voxel-skins-modelos-v01.png).
- **Variações por camada** (como o aldeão do Minecraft: pele + bioma + profissão): previstas, ainda não implementadas.

## 3. Animação procedural e IA por metas

**Animação (`animation.js`), sem keyframes:**
- **Caminhada:** `walkAngle = cos(limbSwing·0,6662)·1,4·amount`, com pernas opostas.
- **Humanoide:** braços balançam com 0,75 do movimento das pernas, mais uma respiração sutil. O golpe de ação usa o braço direito. Existe também a postura "braços à frente" (−90°), estilo zumbi, ainda sem uso.
- **Quadrúpede:** pernas em diagonal e cauda balançando.
- **Ave:** asas batem com a velocidade e as pernas alternam.

**IA (`goals.js`):** `GoalSelector` com metas em ordem de prioridade (menor número = mais importante), uma ativa por canal (movimento e olhar rodam juntos):

| Prioridade | Meta | Implementação |
|---|---|---|
| 5 | RandomStroll | Escolhe um bloco caminhável num raio ao redor de casa (10 para mobs, 4 para o NPC) e vai até ele por **A\*** na grade de blocos (`pathfinding.js`: 4 vizinhos, sem água, troncos ou pedras, degrau ≤ 1). Depois pausa 2–9 s. |
| 6 | LookAtPlayer | Gira só a cabeça (yaw até ±69°, mais pitch) para encarar a jogadora a menos de 6 blocos. |

**Ainda não implementadas:** Float (não há nado; mobs não entram na água), Panic/Avoid (não há dano) e ataque (não há mobs hostis). A estrutura já comporta essas metas.

## Entidades da v01 (`entity-defs.js`)

| Entidade | Tipo | Skin | Altura | Notas |
|---|---|---|---|---|
| Iara (`iara-voxel-v02`) | jogadora, humanoide | 32×32 | 2,0 | Paleta da referência aprovada; camada externa de cabelo |
| Guia (`npc-guia-voxel-v01`) | NPC, humanoide | 32×32 | 2,0 | **Provisório:** nome, identidade e skin a definir; nasce perto do início, passeia num raio de 4 e olha para a jogadora |
| Capivara | mob, quadrúpede | 64×32 | 0,81 | Os "três amigos" do roadmap |
| Tatu | mob, quadrúpede | 32×16 | 0,5 | Casco em faixas, cauda |
| Tucano | mob, ave | 32×16 | 0,75 | Bico em filho da cabeça, asas |

**Spawn (`entities.js`):**
- Determinístico por pedaço, pela mesma semente: cerca de 40% dos pedaços recebem 1 ou 2 animais de uma espécie, em células livres.
- Os mobs pertencem ao pedaço de origem e saem junto quando ele é descarregado.
- Colisão no mesmo `CollisionWorld` da jogadora, com círculo por espécie.
- No QA, o raio de 9×9 pedaços tinha 54 entidades ativas.

## Limites conhecidos

- Os 11 animais do mundo clássico (inclusive a onça 2D) ainda não têm versão voxel. A v01 traz só capivara, tatu e tucano.
- O A\* usa 4 vizinhos, com limite de 900 nós e sem cache de caminho. Funciona bem para raios curtos.
- As entidades não têm sombra nem iluminação dinâmica (mesmo sombreamento fixo por face do terreno).
