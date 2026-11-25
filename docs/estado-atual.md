# Estado atual do Mundo8bit

Revisão em 2026-10-31. Código auditado: `775a182` (última entrega funcional antes desta revisão de documentação). Público considerado nesta revisão: criança de aproximadamente 5 anos. A proposta de brincadeira ainda precisa ser validada em uso; não houve teste observado com crianças.

> Atualização em 2026-11-01: [Iara](iara.md) substitui o explorador no runtime e acrescenta caminhada de braços/pernas, uma fonte e um atlas. O inventário abaixo registra a auditoria de 2026-10-31; agora há 63 fontes/exports e quatro atlas.

> Atualização de câmera em 2026-11-01: [top-down inspirado em Brawl Stars](camera-topdown.md), controles alinhados à tela e 23 testes atuais.

> Atualização de texturas em 2026-11-01: [coleção v03](texturas-v03.md) aplicada ao terreno, água, árvores e pedras; 97 fontes históricas/atuais e 57 templates de objetos no runtime. O inventário original abaixo descreve a auditoria de outubro.

> Revisão T01: [grama clara v04](grama-clara-v04.md), em revisão de fidelidade, substitui apenas a grama clara no terreno. Demais materiais seguem v03.

> Integração aprovada: [onça-pintada 2D fantasia](onca-2d.md) no lugar da aparência 3D, com geração e colisões existentes. Demais animais mantidos; 25 testes atuais.

> Mudança de direção em 2026-11-22: [pixel art 32×32](pixel-art.md) é o padrão (12 px/unidade, escala inteira; menu/tecla P desligam). As árvores do mundo são 4 sprites 32×32 — [macieira, carvalho, cerejeira e bétula](arvores-pixel-32.md) — no lugar das 11 árvores 3D (fontes preservadas). 29 testes atuais.

> **Padrão desde 2026-11-25 (validado):** [mundo voxel](voxel-3d.md) na URL raiz, 100% a 8 px por bloco; [entidades em box model](voxel-entidades.md) (Iara, NPC provisório, capivara, tatu, tucano) com IA por metas; [hotbar, corrida em 3 s e joystick de ação](voxel-controles.md) sem seleção visual. Skins e ícones PNG [aguardam o usuário](voxel-artes-pendentes.md). Clássico em `?mundo=classico` (legado). 46 testes atuais.

> Protótipo em teste em 2026-11-25: [mundo voxel 3D](voxel-3d.md) em `?mundo=voxel3d` — blocos 8×8, isometria 2:1, Iara em cubos (2 blocos), mesma geração do clássico; sem fauna. O mundo clássico segue padrão. 38 testes atuais.

Jogo publicado: **https://mundo8bit.vercel.app** (domínio oficial desde 2026-11-25; mundo voxel na raiz, clássico em `?mundo=classico`). Endereço anterior, não mais atualizado: https://mundo8bit-maiam.pedrosergiomaia.chatgpt.site

## Diagnóstico

O projeto já oferece exploração de um ambiente com identidade visual própria. Ainda falta um ciclo de brincadeira que explique o que fazer, responda à ação e dê vontade de repetir. Caminhar entre objetos e animais é a atividade disponível hoje; encontrar um animal ainda não produz uma descoberta registrada ou uma reação contextual ao jogador.

Para o público proposto, a próxima entrega deve tornar um encontro com um animal divertido e compreensível, antes de ampliar a extensão do mundo ou a quantidade de assets.

## Inventário confirmado

| Área | Implementado | Limite ou pendência |
| --- | --- | --- |
| Mundo | Three.js + Vite, câmera ortográfica 2,5D, terreno por coordenadas globais, semente fixa 808, chunks de 12 × 12, janela ativa de 25 chunks | Não há área inicial desenhada para uma atividade, missões, biomas diferenciados ou destinos de exploração |
| Arte | Low poly painted, fontes Generic Model no Blockbench 5.2.2, UVs e texturas PNG planas, exportação glTF | Adaptações simplificadas das pranchas; revisão artística dos modelos continua aberta |
| Acervo | 11 árvores, 11 pedras, 23 flores, 11 animais e explorador | Variedade já suficiente para construir a primeira brincadeira; não há objetos interativos de missão |
| Fontes | 62 `.bbmodel`, 62 exports catalogados e três atlas de 256 × 256 | Cinco arquivos são auxiliares/históricos: quatro superfícies e a pedra antiga. O carregador seleciona 57 templates de objetos ativos |
| Fauna | Passeios curtos, pausas, partes com pivôs e animação procedural de patas/cabeça/cauda/asas | Não cumprimenta, segue, conversa, registra descoberta nem reage especificamente à aproximação do jogador |
| Explorador | Movimento, corrida, orientação e oscilação de caminhada | Não há gesto de acenar ou outra animação de interação |
| Colisões | Troncos, raízes de mangue, caixas orientadas de pedras e corpos de animais; bloqueio de água profunda; deslizamento em contato | Volumes aproximados, sem salto, colisão por triângulos, ajuste individual dos pés ou navegação que planeje desvios |
| Mobile | Horizontal obrigatório por tela de rotação, pausa em retrato, joystick proporcional, corrida com segundo dedo, pinça e botões de zoom | Não foi validado com criança nem em aparelho físico. Corrida simultânea e zoom podem aumentar a exigência motora |
| Câmera/UI | Zoom suave e limitado, menu compacto, informações técnicas ocultas por padrão | Não há modo infantil de apresentação, indicação de objetivo, orientação por marcos ou recuperação guiada quando se perde |
| Tela cheia | Convite quando há suporte declarado, entrar/sair, variantes WebKit, limpeza de controles e fallback | Entrada nativa não foi confirmada no ambiente de teste; não é garantida em Safari/WebViews nem deve ser requisito para iniciar uma brincadeira |
| Áudio | Não implementado | Sem voz de instrução, efeitos de ação, sons de animais ou controle de volume |
| Interação e recompensa | Não implementadas | Sem ação contextual, desafios, figurinhas, álbum ou comemoração de descoberta |
| Persistência | Não implementada | Sem progresso salvo; posição e rotinas reiniciam ao recarregar/recriar a sessão. A fauna também reinicia ao recarregar chunks |

### Fontes inspecionadas

- [Mundo e carregamento](../src/world.js), [loop e movimento](../src/main.js), [seleção e compartilhamento de assets](../src/assets.js).
- [Manifesto base](../public/assets/manifest.json), [natureza](../public/assets/nature-manifest.json), [fauna](../public/assets/fauna-manifest.json).
- [Comportamento dos animais](../src/fauna-simulation.js), [animação/instâncias](../src/fauna.js), [colisões](../src/collisions.js).
- [Controles](../src/touch-controls.js), [câmera](../src/camera-settings.js), [tela cheia](../src/fullscreen.js).

## O que funciona bem para aproveitar

A identidade low poly painted é coerente e os animais dão um tema fácil de reconhecer. O movimento já tem colisões e os gestos móveis foram separados para evitar zoom acidental ao correr. Recursos compartilhados e streaming dão uma base para expandir depois. A origem tem uma pequena área livre, útil como ponto de partida, mas não constitui ainda uma fase de introdução.

As figuras existentes podem sustentar descobertas, observação e pequenas ajudas. O ganho mais imediato vem de dar comportamento e propósito a poucos desses elementos.

## Atritos prováveis para 5 anos

São hipóteses de design a validar, não resultados de pesquisa com a criança:

1. **Sem uma intenção visível, pode não saber o que fazer.** O jogo não comunica uma tarefa ao começar.
2. **Locomoção pode virar a própria dificuldade.** Dois dedos para correr, pinça e colisões conservadoras podem competir com a atenção à brincadeira.
3. **Pode se perder ou procurar por muito tempo.** Distribuição procedural não garante um animal específico próximo, visível e acessível.
4. **O encontro não tem consequência perceptível.** Aproximar-se de uma capivara não gera um gesto, som, figurinha ou objetivo concluído.
5. **A interface depende de leitura.** Menu, orientação, corrida e mensagens de tela cheia são textuais; faltam imagem e voz para a tarefa principal.
6. **A sessão não deixa uma lembrança persistente.** Não há álbum ou progresso para reencontrar depois.
7. **Vegetação pode esconder personagem/alvo.** A câmera próxima melhora a leitura de modelos, mas copas e decoração precisam ser avaliadas no percurso inicial.

## Verificação e confiança

Nesta revisão, `npm test` passou com **21 testes**. A contagem valida regras de mundo, assets, fauna, colisões e seleção da API de tela cheia; não comprova diversão ou adequação etária.

As etapas anteriores registraram QA de teclado, toque emulado, rotação, zoom, streaming e recursos estabilizados. Os resultados são específicos das respectivas versões e viewports. As contagens históricas de geometrias não são medições de FPS.

O [resultado de tela cheia](art/validation/fullscreen-v01-result.json) registra `nativeEntryConfirmed: false`, fallback funcional e estados de entrada/saída exercitados com API simulada. Aparelhos físicos, Safari/iPhone, desempenho real e interação da criança permanecem pendentes.

## Próxima decisão recomendada

Construir um recorte “Amigos da Floresta”: uma clareira pequena, uma ação de cumprimentar e três encontros curtos com capivara, tucano e tatu. O plano detalhado está em [design para 5 anos](design-crianca-5-anos.md) e a ordem de entrega em [roadmap](roadmap.md). Essa direção de brincadeira é proposta; a direção visual aprovada continua preservada.
