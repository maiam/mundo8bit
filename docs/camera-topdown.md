# Câmera top-down — referência Brawl Stars

Mudança de direção solicitada em 2026-11-01. Aplicada à câmera e ao mapeamento do movimento; preserva a direção artística low poly painted e os modelos Blockbench.

## Referência e interpretação

A [página oficial de Brawl Stars](https://supercell.com/en/games/brawlstars/) apresenta uma [imagem de gameplay](https://supercell.com/images/1181b23832134c15aefecb7efacbc2ad/bg_intro_brawlstars.31c1276f.webp) com vista superior inclinada, campo alinhado à tela e leitura de topo e frente dos volumes. É essa composição de gameplay que orienta a mudança, em vez das câmeras cinematográficas dos trailers.

A leitura do enquadramento é uma análise visual. A referência não revela projeção, ângulo, distância, algoritmo de acompanhamento ou campo visível internos da Supercell. Os valores abaixo pertencem ao Mundo8bit, sem alegação de reprodução exata do motor de Brawl Stars. Manter projeção ortográfica é uma escolha para obter escala constante e leitura estável.

## Antes e agora

| Item | Antes | Agora |
| --- | --- | --- |
| Direção | Diagonal de 45° no plano X/Z | Eixo X horizontal, Z vertical na tela, sem rotação diagonal |
| Inclinação em relação ao chão | Aproximadamente 38,6° | 55°: vista mais elevada |
| Meia altura de referência | 7 mobile / 10 desktop, com ajuste de segurança | 5,8 mobile / 7,2 desktop, com ajuste de segurança |
| Movimento | Conversão diagonal para acompanhar a câmera | Direita = +X; para cima = −Z; joystick e teclado seguem a tela |
| Acompanhamento | Centro nos pés, copiava o balanço da caminhada | Foco 0,7 acima do chão; acompanha X/Z imediatamente e suaviza apenas a altura do terreno |
| Teleporte/origem | Acompanhamento direto | Reposiciona a referência de altura quando há salto maior que 8 unidades |

[Comparação renderizada](art/camera-topdown-v01-comparacao.png): mesma cena, personagem, iluminação, resolução e instante; variam orientação e enquadramento de cada versão. Não é uma comparação de FPS.

## Proteção e controles

`src/camera-settings.js` concentra ângulo, distância de 42 unidades, foco, enquadramento e conversão de movimento. A câmera mantém orientação fixa ao andar ou girar a personagem; não introduz rotação manual ou inclinação por gesto.

O zoom continua suave, até 220%. O mínimo se adapta à proporção e ao alcance seguro dos 25 chunks: usa margem de 22 unidades por eixo, inclinação e diferença máxima de altura do terreno. Telas muito largas reduzem o enquadramento base para não exibir o fim do terreno carregado. O teste projeta os quatro cantos até planos de altura extrema, incluindo limites mínimo e máximo de zoom.

A oscilação visual da caminhada permanece na personagem, sem mover a câmera. A referência de altura suavizada fica no máximo a 0,5 unidade do solo atual. Pausa em retrato, corrida, pinça, botões de zoom e tela cheia seguem os controladores existentes.

## Verificação

- `npm test`: 23 testes, incluindo alinhamento visual do movimento e cobertura do terreno em proporções de retrato, landscape e ultrawide.
- `node scripts/verify-camera.mjs`: carregamento sem erro, configuração aplicada, tecla D movendo apenas +X e capturas desktop, mobile horizontal e compacto.
- `node scripts/verify-mobile.mjs`: pinça 150%, botões e limites 72–220%, pausa/retomada por rotação, menu/origem, layout compacto, roda do mouse e teclado após zoom.
- Evidências em `docs/art/validation/camera-topdown-v01-*`.
- QA em Chromium com renderização por software e toque emulado. Conforto, desempenho e sensação dos controles em aparelho físico continuam pendentes.

A câmera mais alta pode mostrar mais copa e menos rosto; a faixa amarela e a silhueta devem ser avaliadas em uso. Alterar transparência de árvores ou proporção da personagem exige uma revisão separada, conforme problemas observados.
