# Mundo8bit — convenções do projeto

Direção vigente em 2026-11-27, definida pelo usuário.

## Mundo e arte

- O jogo tem somente o mundo voxel. O mundo clássico foi retirado; não restaurar rota, seletor ou runtime clássico.
- Arte em **8 pixels por bloco**: 1 bloco = 1 unidade, texturas 8×8 por face e 1 pixel de skin = 1/8 de bloco. Isso não limita a imagem inteira da skin a 8×8.
- Personagens, mobs e NPCs são **criações geométricas**, com hierarquia de paralelepípedos, pivôs nas articulações e animação procedural. Usar `src/voxel/entities/`; não usar sprites de personagens ou a exceção histórica da onça 2D.
- Iara continua como personagem jogável. O código atual inclui NPC Guia, capivara, tatu e tucano.
- Skins atuais são geradas por código sobre box UV. PNGs podem texturizar a geometria, mas não substituí-la. Não tratar envio de PNG pelo usuário como bloqueio para criar entidades geométricas.
- Câmera ortográfica isométrica 2:1: yaw 45°, pitch 30°, densidade projetada `16/√2` px/unidade. Manter `src/voxel/voxel-settings.js` como fonte desses parâmetros.

## Criação de entidades — RG-01 aprovada

- Seguir `docs/regras-criacao-entidades.md`, aprovada pelo usuário em 2026-11-27. Fichas atuais em `docs/entidades-atuais.md`. Toda criação tem ficha de identidade/papel, geometria e pivôs, textura/UV, colisão, capacidades/animação e intenção de ciclo de vida.
- Separar definição do tipo e estado da instância, aparência, colisão e comportamento; manter proporções próprias por espécie e densidade de 8 px/bloco.
- A aprovação da RG-01 não aprova automaticamente spawn, persistência, hostilidade, parâmetros físicos ou novas capacidades. Seguir o processo abaixo para essas decisões.

## Clima e dia/noite — RG-02 aprovada

- Seguir `docs/regras-clima-dia-noite.md`, aprovada em 2026-11-27 com implementação inicial em 2026-11-27 (aparelho físico pendente). Ciclo de 20 min: 10 dia, 1 entardecer, 8 noite, 1 amanhecer.
- Clima independente: limpo 4–8 min, nublado de entrada 30 s, chuva leve 1–2 min, nublado de saída 30 s. Transições graduais e noite legível; relógios param durante pausa efetiva ou página oculta.
- O escopo inicial é ambiental, sem efeitos físicos, mudanças de spawn ou comportamento de entidades. Tempestades, neve, estações e persistência precisam de propostas específicas.

## Movimento da Iara — RG-03 bloco A aprovado

- A1–A7 de `docs/regras-movimento-comportamento.md` aprovados em 2026-11-27. Velocidades nominais aprovadas: andar 4,317 e correr 5,612 blocos/s; implementadas em `controls.js` e `voxel-main.js`.
- Manter adaptações aprovadas: corrida por 3 s/Shift, resposta direta sem inércia, orientação relativa à câmera, subida/descida automática de 1 bloco, água bloqueada e colisão circular de raio 0,24. Não atribuir essas adaptações ao Minecraft.
- Aprovação restrita à Iara; movimento e comportamento dos NPCs/mobs, spawn, persistência, natação, física 3D e correções de relógio permanecem pendentes.

## Antes de implementar regras de mundo

**Exigência ampliada pelo usuário em 2026-11-27:** nenhuma regra do jogo é aceita apenas por já existir no código. Auditar também as implementadas. Sempre apresentar ao usuário a comparação explícita **Minecraft Wiki → estado atual do Mundo8bit → proposta e diferenças → decisão**, com fontes e parâmetros, antes de considerar a regra aprovada ou implementar novidades.

- Regras existentes sem comparação e aprovação específica ficam **pendentes de auditoria**, não implicitamente aprovadas. Não expandir nem usar seu comportamento como precedente aprovado.
- RG-01, RG-02 e RG-03 bloco A mantêm somente seus escopos aprovados; não validam o restante do runtime.
- Não apresentar resumo só da adaptação: o usuário deve ver como funciona na wiki e como funciona/funcionará aqui. Se não houver equivalente verificável na wiki, declarar isso e pedir decisão sobre a adaptação original.
- Auditoria documental não autoriza remover/desativar silenciosamente sistemas existentes. Apresentar também o tratamento proposto para cada divergência e aguardar a decisão antes da mudança.

**Obrigatório por instrução do usuário:** antes de implementar ou alterar regras de mundo, consultar https://minecraft.wiki como referência, formular a proposta e perguntar ao usuário. Aguardar sua resposta antes de implementar a regra.

Aplica-se a geração, terreno, água, colisões, movimento, spawn, comportamento de entidades, interação com blocos, itens e progressão. Apresentar os links consultados, o comportamento de referência, a adaptação proposta, fórmulas/parâmetros quando pertinentes e a decisão que precisa de aprovação. Minecraft é referência, não especificação automaticamente aprovada. Se a fonte estiver indisponível, informar e não inventar seu conteúdo.

Limpeza de arquivos e documentação já solicitada está autorizada. Preservar as regras atuais durante essa limpeza; não aproveitar para introduzir mecânicas ou corrigir comportamentos de mundo sem seguir o processo acima. Ver `docs/regras-de-mundo.md`.

## Estrutura e validação

- Entrada única: `index.html` → `src/voxel/voxel-main.js`. Parâmetros antigos de seleção de mundo não carregam o clássico.
- Reutilizar `world.js`, `nature.js`, `trees.js`, `CollisionWorld`, controles de toque e apresentação pixel art. Não duplicar a geração do terreno.
- Joystick esquerdo move; segurar para cima por 3 s corre; joystick direito orienta parada e toque curto age. Teclado: WASD/setas, Shift, Q/E, F/espaço, 1–9. Hotbar tem nove espaços, mão no primeiro. Sem seleção visual de cubo.
- `npm ci`, `npm test`, `npm run build`. QA de navegador: `npm run qa:voxel`, com requisitos descritos no README.
- O acervo clássico está em `archive/classico/`, fora de `public/` e do build. É histórico, não orientação ativa. Não editar fontes antigas para produzir novos assets.

## Produto e publicação

- Público de aproximadamente 5 anos; compreensão sem leitura e diversão ainda precisam ser validadas em uso.
- Não descrever objetivos, áudio, recompensas ou progresso salvo como implementados. Consultar `docs/estado-atual.md` e `docs/roadmap.md`.
- Domínio oficial: https://mundo8bit.vercel.app (Vercel). Não usar o domínio antigo como oficial.
