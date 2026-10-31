# Mobile horizontal, controles e zoom / v02

> Registro por etapa: versões, contagens e verificações abaixo pertencem às entregas descritas. Consulte o [estado atual consolidado](estado-atual.md) e o [plano de evolução](roadmap.md) para o panorama vigente.

## Experiência

Em dispositivos com ponteiro de toque, o jogo exige uma janela horizontal para jogar. Em retrato, exibe “Jogue na horizontal”, bloqueia a interface e pausa personagem e fauna. A simulação e os controles retomam ao girar. Rotação, perda de foco e interrupção do toque zeram o joystick/corrida e encerram gestos de pinça, evitando movimento preso.

O navegador não pode obrigar fisicamente a rotação do aparelho. A exigência é feita pela tela de orientação e pausa. Onde a API está disponível, o botão de tela cheia solicita fullscreen e tenta travar em landscape; quando o navegador recusa ou não suporta, permanece a orientação para girar manualmente. Isso é particularmente relevante em navegadores embutidos e iOS. Não há promessa de fullscreen ou bloqueio nativo em todos os aparelhos.

## Controles

- Joystick proporcional à esquerda: o ponto do primeiro toque é o centro lógico do gesto, sem deslocamento imediato. Uma zona morta de 10% absorve pequenos movimentos. A captura continua fora do círculo.
- CORRER à direita: segurar com outro dedo. O gesto não participa da pinça.
- Zoom por dois dedos sobre o mundo, ou botões −, porcentagem e +. Tocar na porcentagem restaura o padrão. O zoom mantém o personagem como referência central.
- Menu no topo direito: origem, limites de chunks e tela cheia quando disponível. Informações técnicas ficam escondidas até ativar os chunks.
- Desktop: WASD/setas, Shift, roda do mouse sobre o mundo e teclas +/−. Botões continuam ativáveis por teclado.

Joystick e corrida têm zonas próprias, reservadas aos polegares; a pinça usa apenas contatos do canvas, evitando zoom acidental ao mover e correr. Alvos têm pelo menos 44 pixels CSS. O layout usa `safe-area-inset-*` e se adapta também a 568 × 320. Barras do navegador alterando apenas a altura não zeram o gesto de caminhada.

## Câmera

`src/camera-settings.js` define enquadramento ortográfico mais próximo: referência de meia altura 7 no mobile e 10 no desktop, ajustada à proporção e ao limite de mundo carregado. O máximo é 220% do zoom base. O mínimo é calculado por proporção para limitar a exposição das bordas da janela de 5 × 5 chunks (por exemplo, aproximadamente 85% em 844 × 390). O valor padrão é 100% e o zoom transiciona suavemente.

Mantidos antialiasing, texturas pintadas, mipmaps, DPR até 1,5 e orçamento de 2 milhões de pixels. Modelos, geração, colisões e fontes Blockbench não mudaram.

## Verificação

- `npm test`: 18 testes de mundo, assets, fauna e colisões.
- `npm run qa:browser`: uma única aplicação no canvas, 25 chunks, viagens entre regiões, pausa em retrato, retomada horizontal, joystick/corrida com dois toques e recursos estáveis.
- `npm run qa:mobile`: pausa durante rotação com dedos pressionados, simulação congelada, comandos zerados, pinça, botões e limites de zoom, ausência de zoom da página, menu/origem, layout compacto, mouse e teclado após usar zoom.
- Viewports: 390 × 844 (bloqueado), 844 × 390 e 568 × 320 (jogáveis), além de 1440 × 900 desktop. Mobile com DPR 3 foi limitado a buffer 1266 × 585 no landscape maior.
- Capturas em `docs/art/validation/mundo-mobile-v02-*`.

Validação em Chromium com software rendering e toque emulado. Sensação dos controles, safe areas reais, fullscreen e comportamento de rotação no Safari/iPhone físico ainda precisam ser conferidos.

## Atualização de tela cheia

A entrada e saída agora usam controlador dedicado, convite dispensável no landscape, suporte WebKit e feedback de falha com limite de espera. Consulte `docs/tela-cheia.md` para compatibilidade e limites da validação.
