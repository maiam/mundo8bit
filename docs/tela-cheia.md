# Tela cheia no mobile / v01

## Comportamento

Quando o navegador informa suporte à Fullscreen API e o celular está na horizontal, uma faixa oferece “Jogar em tela cheia”. Pode ser dispensada por ×; a opção continua no menu. Não há solicitação automática sem toque do usuário.

Ao entrar, a faixa desaparece e as opções passam a “Sair da tela cheia”. A saída pelo menu ou pelo próprio navegador atualiza o estado e zera joystick, corrida e pinça. A câmera se reajusta após eventos de fullscreen. A tentativa de travar a orientação horizontal é opcional e não bloqueia os botões caso o navegador recuse a trava.

O controlador verifica capacidade e permissões expostas pelo documento, incluindo API padrão e variantes WebKit. Em contextos sem permissão (por exemplo, alguns navegadores embutidos ou iframes), não oferece um botão sem suporte declarado. O menu explica a limitação e sugere adicionar à Tela de Início quando essa opção existir no navegador. Esta mudança não adiciona instalação PWA, offline ou cache de aplicativo.

Quando o pedido é recusado, não é confirmado ou fica pendente, apresenta uma mensagem e mantém a partida horizontal disponível. A espera da chamada é limitada a três segundos, com uma conferência adicional da mudança de modo. Os eventos do navegador continuam sendo a fonte do estado real, inclusive após uma resposta tardia. A simulação e o bloqueio em retrato existentes foram mantidos.

Em modo standalone instalado, a faixa não aparece; o menu ainda pode oferecer fullscreen se a API existir. Não se promete a remoção das barras do sistema nem suporte a fullscreen de página no Safari/iPhone.

## Implementação

`src/fullscreen.js` concentra seleção da API, entrada/saída, limites de espera, sincronização dos botões, convite e feedback. `src/touch-controls.js` fornece o reset de gestos e atualização da orientação. `src/main.js` escuta eventos padrão/WebKit para redimensionar a câmera. O zoom e os limites de renderização permanecem os mesmos.

## Verificação e limites

- `npm test`: 21 testes, incluindo seleção de API, permissão negada e compatibilidade de entrada/saída WebKit.
- `npm run qa:fullscreen`: tenta entrada nativa em Chromium com toque emulado. Se o ambiente não confirma fullscreen, verifica o fallback e usa API simulada para exercitar entrada/saída, rótulos, limpeza de controles, recusa e indisponibilidade.
- Neste ambiente, a entrada nativa não foi confirmada, mesmo em sessão gráfica virtual. O fallback por solicitação sem resposta funcionou. Os estados de entrada e saída foram validados com a API simulada; isso não equivale a confirmação em Safari ou Android físicos.
- Resultado verificável: `docs/art/validation/fullscreen-v01-result.json`. A captura `mundo-fullscreen-v01-mobile.png` mostra a interface no estado fullscreen simulado.
- Controles móveis, pinça, pausa ao girar e zoom são conferidos também por `npm run qa:mobile`.

A confirmação de fullscreen nativo e da trava de orientação continua pendente em celular real.
