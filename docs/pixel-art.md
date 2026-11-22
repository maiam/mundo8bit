# Modo pixel art — opção experimental (v01)

Pedido do usuário em 2026-11-22: criar uma opção de ligar/desligar pixel art no menu. **Não é uma mudança de direção artística.** A direção oficial continua *low poly painted* ([direção artística](direcao-artistica.md)); o modo pixel art é um filtro de apresentação, desligado por padrão, para avaliação.

## O que muda e o que não muda

| Preservado | Alterado somente com o modo ligado |
| --- | --- |
| Fontes `.bbmodel`, atlas PNG, UVs, exports glTF e materiais | Cena renderizada em baixa resolução (~200 linhas) e ampliada em blocos inteiros |
| Filtragem linear + mipmaps + anisotropia das texturas | Cores quantizadas (20 níveis/canal em sRGB) com pontilhado ordenado leve |
| Câmera, enquadramento, zoom, colisões, streaming, fauna e onça 2D | Contorno escuro de 1 pixel do lado de fora dos objetos (salto de profundidade) |
| Interface HTML (botões, joystick, menu) em resolução normal | Canvas com 1 pixel por pixel CSS e `image-rendering: pixelated` |

As texturas não foram trocadas para filtro *nearest*: a amostragem linear com mipmaps continua estabilizando a pintura em baixa resolução, e o modo desligado fica idêntico ao anterior.

## Como funciona

`src/pixel-art.js` concentra parâmetros e renderização:

1. `pixelArtLayout(largura, altura)` escolhe uma escala inteira (≥ 2) para que cada pixel do jogo tenha o mesmo tamanho na tela: 1440 × 900 → escala 5 (290 × 182); 844 × 390 → escala 2 (424 × 197). Há 1 texel de margem em cada lado.
2. A câmera ortográfica tem o frustum ampliado para cobrir a margem e é **encaixada na grade de texels** ao longo dos seus eixos de tela. Isso evita o “tremor” de pixels em objetos parados enquanto a câmera anda.
3. A cena vai para um render target sem MSAA, com textura de profundidade.
4. Um quad de tela cheia amostra o render target por texel, com a fração do encaixe como deslocamento. A rolagem continua suave e os blocos ficam nítidos. O mesmo passo aplica contorno e quantização.
5. Depois do quadro, posição e frustum da câmera são restaurados: jogo, sprites e QA continuam vendo a pose normal.

## Uso

- Menu → **VISUAL** → “P · Ligar pixel art” / “P · Desligar pixel art” (`aria-pressed` acompanha o estado).
- Tecla **P** alterna no teclado.
- `?pixel=1` ou `?pixel=0` na URL força o estado.
- A escolha fica guardada por navegador (`localStorage`, chave `mundo8bit:pixel-art`). Se o armazenamento estiver bloqueado, o jogo abre normalmente com o modo desligado.

## Verificação

- `npm test`: 28 testes, incluindo escala inteira e cobertura da tela, encaixe da câmera e leitura da preferência com armazenamento indisponível.
- `npm run qa:pixel` (Vite em `127.0.0.1:5173` + Chromium com `--remote-debugging-port=9334`): liga pelo botão real do menu, confere estado, rótulo, armazenamento, canvas, escala e câmera restaurada. Também testa a caminhada, a preferência preservada ao recarregar no celular horizontal e o desligamento pela tecla P. Resultado em `art/validation/pixel-art-v01-result.json`.
- `npm run qa:browser` continua passando com o modo desligado.
- Capturas: [desktop desligado](art/validation/pixel-art-v01-desktop-desligado.png), [desktop ligado](art/validation/pixel-art-v01-desktop-ligado.png) e [celular horizontal ligado](art/validation/pixel-art-v01-mobile-ligado.png).

QA em Chromium com renderização por software (SwiftShader). Desempenho, conforto visual e Safari/iPhone ainda não foram medidos em aparelho físico.

## Limites conhecidos

- A pintura fina das texturas (lâminas de grama, faces das copas) perde detalhe; o pontilhado aparece em grandes áreas de terreno.
- Contornos dependem só da profundidade: objetos encostados no chão, como pedras baixas, recebem contorno parcial.
- Durante o zoom suave, o tamanho do texel muda continuamente e pode haver leve cintilação.
- A onça 2D passa pelo mesmo filtro e perde parte do traço da ilustração aprovada. A arte original fica intacta com o modo desligado.
- Opção técnica e de avaliação, sem relação com a brincadeira para 5 anos. Não deve ser exibida como escolha à criança sem observação em uso.

## Próximos passos possíveis

Se o modo for aprovado como direção: avaliar paleta fixa curada (em vez de quantização por canal), contorno também por normais, ajuste da altura-alvo por dispositivo e eventual atlas *nearest* dedicado. Essas decisões exigem aprovação explícita da mudança de direção artística.
