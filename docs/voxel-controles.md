> Direção vigente em 2026-11-27: único mundo voxel, arte 8 px e entidades geométricas. Controles abaixo descrevem o comportamento existente; alterações exigem [proposta e aprovação](regras-de-mundo.md).

# Controles do mundo voxel — hotbar, corrida e joystick de ação (v01)

Regras pedidas pelo usuário em 2026-11-25. Implementadas em `src/voxel/controls.js` (regras puras, testadas), `src/voxel/hud.js` (interface) e `src/voxel/voxel-main.js` (integração).

## Movimento e corrida

- **Andar:** joystick à esquerda (toque) ou WASD/setas, alinhados à tela isométrica.
- **Correr:** manter o joystick **para cima/frente por 3 segundos** contínuos.
  - "Para cima" aceita até 45° de desvio e exige pelo menos 60% do curso do joystick.
  - Soltar, desviar ou reduzir o empurrão volta a andar e zera o tempo.
  - A contagem usa **tempo real**: aparelhos lentos não atrasam a corrida.
  - No teclado, segurar W/↑ segue a mesma regra; Shift continua como atalho imediato.
- **Botão CORRER:** removido no mundo voxel. O mundo clássico foi retirado.

## Joystick de ação (substitui o CORRER, à direita)

- **Cubo de ação:** com a personagem parada, o cubo de ação é **sempre o cubo adjacente à frente dela**.
- **Escolher outro cubo:** girar o joystick de ação faz a personagem **girar 360° sem sair do lugar** (a direção acompanha o joystick). O cubo da frente passa a ser o novo alvo.
  - Com o ângulo contínuo, o alvo cai em uma das 8 células vizinhas.
  - Enquanto ela anda, a direção segue o movimento e o joystick de ação não gira.
- **Agir:** **toque curto** no joystick de ação (menos de 14 px de arraste e 0,5 s) executa a ação do item da hotbar.
  - **Por enquanto, só a mão, sem efeito no mundo:** a Iara balança o braço e o jogo emite o evento `voxel-acao` com `{item, target}`, para as próximas mecânicas.
- **Sem seleção visual:** o cubo escolhido não é destacado. O QA confirma que nenhum objeto é criado na cena ao mirar ou agir.
- **Altura do alvo:**
  - **tronco** ou **pedra** à frente, no nível dos pés;
  - **parede**, se a coluna à frente for mais alta;
  - senão, o **chão** logo à frente (ou a água).
- **Teclado:** Q/E giram 45° com a personagem parada; F ou Espaço agem.

## Hotbar

- **9 espaços** na parte de baixo da tela. O espaço 1 é a **mão**, selecionada por padrão; os outros estão vazios.
- **Trocar de espaço:** tocar no espaço ou usar as teclas 1–9. Itens e ações virão com as próximas mecânicas.
- **Ícone:** o da mão é um desenho provisório de 8×8 em SVG. Pode ser refinado mantendo a arte em 8 px ([artes pendentes](voxel-artes-pendentes.md)).

## Verificação

- `npm test`:
  - corrida: 3 s para cima ativa; lado, para baixo, empurrão fraco ou soltar não ativam;
  - giro de 360° passa pelas 8 células vizinhas;
  - alvo correto: chão, parede e tronco.
- `npm run qa:voxel`:
  - hotbar com 9 espaços, mão no 1 e tecla 3;
  - botão CORRER ausente;
  - W segurado: aos 1,5 s ainda não corre, aos 3,4 s corre, ao soltar para;
  - mira à direita da tela gira sem sair do lugar, F age no cubo da frente, sem objetos novos na cena;
  - no toque: arrastar o joystick de ação gira a personagem, toque curto age.

Os tempos (3 s), o raio do toque e o tamanho dos botões são hipóteses para uma criança de 5 anos e precisam ser observados em aparelho físico.
