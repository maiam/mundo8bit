# Mundo8bit

Protótipo de exploração em **mundo voxel**, com arte em **8 pixels por bloco**, câmera isométrica e personagens, mobs e NPCs geométricos.

Jogo publicado: https://mundo8bit.vercel.app

O voxel é o único mundo. O clássico foi retirado da aplicação; fontes e referências anteriores estão em [archive/classico](archive/classico/README.md), fora do conteúdo publicado. URLs antigas com `?mundo=classico` também abrem o voxel.

## Executar e verificar

Node.js 22.12+.

```sh
npm ci
npm run dev
npm test
npm run build
```

Vite gera `dist/`. O jogo usa Three.js e não requer Blockbench ou backend para executar. `npm test` executa somente os testes ativos de `src/`.

`npm run qa:voxel` requer o servidor Vite em `http://127.0.0.1:5173` e Chromium com depuração remota na porta 9334; produz evidências em `docs/art/validation/`. Emulação não substitui testes em aparelhos físicos.

## Controles

- WASD/setas ou joystick esquerdo: andar; Shift ou 3 s para cima/frente: correr.
- Q/E ou arrastar joystick direito: orientar a personagem parada; F/espaço ou toque curto no joystick direito: ação no cubo da frente.
- 1–9 ou toque na hotbar: selecionar espaço; somente a mão está disponível.
- Pinça, roda do mouse, botões ou +/−: zoom. P/menu: alternar apresentação pixel art sem trocar o mundo ou a densidade das texturas.
- G/menu: limites dos chunks; menu: voltar à origem e tela cheia quando disponível.
- Celular em retrato pausa e solicita orientação horizontal.

A ação atual anima o braço e registra o alvo; ainda não altera blocos nem interage com animais.

## Base atual

Texturas de bloco 8×8; skins com 1 px por 1/8 de bloco. Iara e NPC Guia usam geometria articulada humanoide; capivara, tatu e tucano também são geométricos. As texturas atuais são geradas por código. A câmera usa isometria 2:1 (yaw 45°, pitch 30°).

Geração determinística, semente 808, chunks 12×12 e janela voxel 9×9. Colisões, navegação A*, metas de IA e animação procedural já existem. Áudio, missões, recompensas e progresso salvo ainda não.

## Regras e documentação

Antes de implementar ou alterar regras de mundo: **consultar a [Minecraft Wiki](https://minecraft.wiki), formular a proposta e perguntar ao usuário; aguardar sua resposta**. A referência não autoriza copiar mecânicas automaticamente.

- [Índice](docs/README.md)
- [Estado atual](docs/estado-atual.md)
- [Mundo e arte](docs/voxel-3d.md)
- [Entidades geométricas](docs/voxel-entidades.md)
- [Controles](docs/voxel-controles.md)
- [Processo para regras de mundo](docs/regras-de-mundo.md)
- [Roadmap](docs/roadmap.md)

Clima e dia/noite: [RG-02](docs/regras-clima-dia-noite.md), implementada inicialmente com ciclo de 20 min e chuva leve independente. `npm run qa:environment` valida estados acelerados, cobertura e pausa, com os mesmos requisitos de Chromium/Vite do QA voxel. Velocidades da Iara: 4,317/5,612 blocos/s, conforme RG-03 bloco A. Aparelho físico e aprovação visual final permanecem pendentes.

## Integração contínua

GitHub Actions executa `npm ci`, `npm test` e `npm run build` em Node.js 22 nos PRs para `main`, nos pushes em `main` e por execução manual. Check: **Tests and build (Node 22)**. Execuções anteriores da mesma referência são canceladas quando substituídas. Os QAs de navegador continuam manuais, pois exigem Vite e Chromium/CDP; suas evidências estão em `docs/art/validation/`.
