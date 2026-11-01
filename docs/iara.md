# Iara — personagem jogável v01

A opção D foi escolhida pelo usuário. Referência: [prancha de desenvolvimento aprovada](art/iara-conceito-v01-aprovado.png). O modelo é uma adaptação low poly simplificada; [vistas do modelo exportado](art/iara-modelo-v01.png) permitem comparar a produção com o conceito.

## Produção e integração

- Generic Model criado e exportado no Blockbench 5.2.2 através das APIs nativas `Mesh`, `MeshFace`, `Texture.edit` e codec glTF. Pintura automatizada, não pintura manual humana.
- Fonte editável: `assets/blockbench/iara-v01.bbmodel`; export: `public/assets/models/iara-v01.gltf`.
- Atlas próprio `iara-painted-v01.png`, 256 × 256, 16 células; manifesto `public/assets/player-manifest.json`.
- 1.704 triângulos; altura aproximada de 1,77 unidade; pés no plano zero; rosto orientado para +Z.
- Cabelo curto, faixa amarela, colete verde, camisa clara, shorts terracota, botas e mochila. Olhos e sorriso são geometria simples com UVs no atlas.
- Braços e pernas independentes com pivôs nos ombros/quadris; animação procedural de caminhada proporcional à distância percorrida. Sem clips nativos ou animação facial nesta versão.
- `src/assets.js` carrega o novo manifesto/material sem carregar o explorador antigo. `src/main.js` instancia Iara como personagem jogável. O explorador v02 permanece preservado como fonte histórica.
- Raio físico do jogador permanece em 0,24: exclui braços/cabelo, como antes. Movimento, câmera, joystick, corrida e zoom continuam no controlador existente.

## Reprodução e verificação

Com Blockbench no CDP local 9333: `node scripts/build-iara-assets.mjs`. O script recusa substituir fontes existentes sem `--replace-generated`; revisões artísticas devem criar uma versão nova.

Com jogo no Vite e Chromium no CDP 9334: `node scripts/render-iara-board.mjs`. O script confere carregamento, quatro partes móveis, altura e contato dos pés, e renderiza frente/perfil/costas/3⁄4. Resultado em [validação](art/validation/iara-v01-result.json).

A suíte de integridade agora inclui o manifesto da personagem para conferir UVs, texturas incorporadas, faces e exportação. O modelo ainda precisa de avaliação em aparelho físico. Aceno, expressões, saudações, álbum e recompensas continuam planejados, não implementados nesta entrega.
