# Mundo8bit — convenções do projeto

## Direção de arte aprovada

**Mundo voxel 8 px é o padrão desde 2026-11-25** (validação explícita do usuário): consultar `docs/voxel-3d.md`, `docs/voxel-entidades.md`, `docs/voxel-controles.md` e `docs/voxel-artes-pendentes.md`.

- **Regra: o mundo é 100% em 8 px por bloco.** Blocos com texturas 8×8 por face; entidades com 1 px de skin = 1/8 de bloco. Nada novo em outra densidade.
- **Personagens, NPCs e mobs são box models como no Minecraft:** hierarquia de paralelepípedos com pivô na articulação, skin PNG única com box UV padrão (layout do Minecraft ÷ 2: humanoide 32×32, cabeça 4³, tronco 4×6×2, membros 2×6×2 = 2 blocos), camada externa inflada 0,25 px, animação procedural (sem keyframes) e IA por metas (`GoalSelector`). Usar `src/voxel/entities/`; não criar outro sistema de personagem.
- **Artes PNG ficam em espera e são pedidas ao usuário** (lista em `docs/voxel-artes-pendentes.md`); até chegarem, usar provisórias geradas por código no mesmo layout e marcar `skin: null`. Não alegar pintura manual nas provisórias.
- **Controles:** joystick esquerdo anda; 3 s para cima/frente corre (sem botão CORRER no voxel); joystick de ação à direita gira a personagem 360° no lugar e age sempre no cubo adjacente da frente; **sem seleção visual do cubo**; hotbar de 9 espaços (mão no 1).
- Mundo clássico (vista superior, pixel art 32×32, low poly) passa a **legado** em `?mundo=classico`; preservar funcionando, sem novas features.

### Legado — mundo clássico

**Pixel art 32×32 foi o padrão visual de 2026-11-22 a 2026-11-25** (aprovação explícita do usuário): consultar `docs/pixel-art.md` e `docs/arvores-pixel-32.md`. Densidade fixa de 12 px por unidade (`PIXELS_PER_UNIT` em `src/pixel-art.js`), escala de tela inteira; sprites 32×32 com filtro nearest, sem escala aleatória. Árvores no mundo: macieira, carvalho, cerejeira e bétula (originais do Drive preservados em `assets/sprites/arvores-pixel-v01/originais/`, gerados por imagem — não alegar pintura manual). As árvores 3D v03 saíram do runtime; fontes preservadas.

Base anterior, ainda usada pelos demais modelos e pelo modo desligado: Low poly painted — **Painted using Blockbench with flat textures.**

- Usar Blockbench para os novos assets low poly, com texturas planas pintadas e paleta retrô coesa.
- Preservar fontes editáveis `.bbmodel`, texturas PNG e UVs; conferir leitura na câmera 2,5D.
- Preservar a prancha aprovada `docs/art/arvores-v01-aprovada.png` como referência das 11 silhuetas.
- Os assets de produção v02 estão em `assets/blockbench/` com texturas em `assets/textures/` e exports em `public/assets/`. Preserve os fontes ao editar, criando uma versão nova.
- Geometria procedural v01 em `scripts/tree-shapes-v01.js` é referência histórica de silhuetas; não volta ao runtime.
- A pintura v02 foi executada por script no Painter nativo do Blockbench; não alegar autoria manual humana.
- Pedras P01–P11 e flores F01–F23 estão nos fontes `*-v01.bbmodel`, com atlas independente `natureza-painted-v01.png`; preservar a referência `docs/art/pedras-flores-v01-aprovada.png`.
- Consultar `docs/direcao-artistica.md` antes de criar ou revisar assets.

- Fauna A01–A11: referência `docs/art/animais-v01-aprovada.png`, fontes `animal-*-v01.bbmodel`, atlas `fauna-painted-v01.png`. Preservar nomes e pivôs das partes usados pelas animações de `src/fauna.js`. Refinamentos devem abrir v02.

## Publicação

- Domínio oficial: **https://mundo8bit.vercel.app** (Vercel, integração com o repositório). O endereço antigo `mundo8bit-maiam.pedrosergiomaia.chatgpt.site` não é mais atualizado. Não citar outro domínio como oficial.

## Público e planejamento

- Considerar o público de aproximadamente 5 anos: convites compreensíveis sem leitura, controles tolerantes e respostas claras às ações. Validar essas hipóteses em uso.
- Consultar `docs/estado-atual.md`, `docs/design-crianca-5-anos.md` e `docs/roadmap.md`. O design infantil é uma proposta; não documentar funcionalidades planejadas como implementadas.

## Personagem escolhido

- Iara (opção D) é a personagem jogável. Preservar `docs/art/iara-conceito-v01-aprovado.png`, fonte `iara-v01.bbmodel` e atlas próprio. Consultar `docs/iara.md`; futuras revisões abrem v02.

## Câmera do mundo clássico (legado)

- Vista superior inclinada inspirada no gameplay de Brawl Stars: ortográfica, pitch de 55°, sem yaw diagonal; controles alinhados à tela. Consultar `docs/camera-topdown.md` e centralizar parâmetros em `src/camera-settings.js`. Não restaurar a conversão diagonal de movimento sem revisar a câmera.

## Texturas aprovadas

- Referência `docs/art/texturas-v01-aprovada.png`; produção v03 em `docs/texturas-v03.md`. Árvores v03 e pedras v02 usam atlas `mundo8bit-painted-v03.png` 1024²; preservar fontes anteriores. Terreno/água usam coordenadas globais e margens de atlas. Não reintroduzir repetição por célula de terreno.

## Revisão de fidelidade T01

- Grama clara v04: consultar `docs/grama-clara-v04.md`. Arte gerada por imagem, importada/redimensionada/exportada no Blockbench; não alegar pintura manual nem geração artística no editor. Apenas T01 muda; v04 está em revisão, referência original permanece aprovada. Não generalizar o acabamento aos outros materiais antes de avaliar esta comparação.

## Pixel art — modo e preferência

- `src/pixel-art.js` ligado por padrão; menu/tecla P/`?pixel=0` desligam. Preservar o modo desligado funcional. Novos assets pixel art devem respeitar 12 px/unidade e 1 texel = 1 pixel de jogo.

## Mundo voxel 3D (padrão)

- URL raiz abre o voxel em `src/voxel/` (`?mundo=classico` abre o legado). 1 bloco = 1 unidade, texturas 8×8, isometria 2:1 (yaw 45°, pitch 30°, `VOXEL_PIXELS_PER_UNIT = 16/√2`), Iara em box model com 2 blocos. Reaproveitar geração (`world.js`, `natureAt`, `trees.js`), `CollisionWorld` e `pixel-art.js`; não criar segunda fonte de verdade de terreno. A câmera isométrica vale para o voxel; a top-down abaixo só para o legado.

## Exceção aprovada — onça 2D

- A01/onça-pintada usa ilustração 2D fantasia RPG/anime aprovada, em sprite voltado à câmera; consultar `docs/onca-2d.md`. Preservar PNG aprovado, conceito e fonte 3D histórica. Esta exceção foi autorizada explicitamente pelo usuário e não altera os demais animais/ambiente. Não converter a arte aprovada em aproximação low poly.
