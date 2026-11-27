# Mundo8bit — convenções do projeto

Direção vigente em 2026-11-27, definida pelo usuário.

## Mundo e arte

- O jogo tem somente o mundo voxel. O mundo clássico foi retirado; não restaurar rota, seletor ou runtime clássico.
- Arte em **8 pixels por bloco**: 1 bloco = 1 unidade, texturas 8×8 por face e 1 pixel de skin = 1/8 de bloco. Isso não limita a imagem inteira da skin a 8×8.
- Personagens, mobs e NPCs são **criações geométricas**, com hierarquia de paralelepípedos, pivôs nas articulações e animação procedural. Usar `src/voxel/entities/`; não usar sprites de personagens ou a exceção histórica da onça 2D.
- Iara continua como personagem jogável. O código atual inclui NPC Guia, capivara, tatu e tucano.
- Skins atuais são geradas por código sobre box UV. PNGs podem texturizar a geometria, mas não substituí-la. Não tratar envio de PNG pelo usuário como bloqueio para criar entidades geométricas.
- Câmera ortográfica isométrica 2:1: yaw 45°, pitch 30°, densidade projetada `16/√2` px/unidade. Manter `src/voxel/voxel-settings.js` como fonte desses parâmetros.

## Antes de implementar regras de mundo

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
