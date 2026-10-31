# Proposta de jogo para uma criança de 5 anos

Estado: proposta de design, ainda não implementada nem validada com a criança. A faixa etária orienta hipóteses iniciais; habilidades motoras, leitura, preferências e familiaridade com jogos variam. Manter a direção low poly painted aprovada.

## Promessa da brincadeira

**“Passeie, conheça os bichinhos e complete seu álbum de amigos da floresta.”**

O nome de trabalho do primeiro passeio é **Amigos da Floresta**. Usar os assets existentes, começando por capivara, tucano e tatu. O mundo aberto permanece como base e possibilidade de expansão; a primeira sessão acontece em uma pequena região preparada para descobertas garantidas.

## Ciclo principal proposto

**Ver um convite → caminhar até um animal → tocar em Acenar → receber uma reação e uma figurinha → descobrir o próximo convite.**

Um único objetivo por vez. A criança pode repetir a saudação por diversão, mas cada amigo concede a figurinha uma vez. O personagem e o animal respondem imediatamente, mesmo quando a figurinha já foi obtida.

### Primeiros minutos

| Momento | Experiência pretendida | Resposta do jogo |
| --- | --- | --- |
| Entrada | Tocar em um botão grande de brincar | Liberar áudio com o gesto; orientar rotação com imagem e fala curta, se necessária. Tela cheia é uma opção |
| Começo | Ver uma capivara próxima e uma imagem dela | Voz: “Vamos dar oi para a capivara?”; caminho curto, claro e sem travessia de água |
| Aproximação | Arrastar o joystick com um dedo | Câmera acompanha; alvo permanece visível; ícone de mão aparece com antecedência |
| Encontro | Tocar uma vez no botão de acenar | Personagem acena, animal olha/responde, som curto e brilho discreto |
| Recompensa | Ver a figurinha da capivara entrar no álbum | Imagem grande e fala: “Você conheceu a capivara!”; progresso por três espaços visuais |
| Continuação | Encontrar tucano e tatu, um de cada vez | Convites equivalentes, pequenas variações na reação e marcos visuais próximos |
| Fechamento | Completar os três espaços | Comemoração curta e opção simples de continuar passeando ou repetir as saudações |

“Primeiro encontro em cerca de um minuto” e “passeio completo em 3–5 minutos” são metas para testar, não tempos impostos ao jogador. Não mostrar cronômetro regressivo.

## Controles e tolerância

- Priorizar caminhada com **um dedo no joystick**. Considerar caminhada/corrida pela intensidade do arrasto; a corrida com segundo botão existente pode ficar como opção avançada. Velocidade final será ajustada observando a criança.
- Oferecer **uma ação contextual grande** à direita, com mão/gesto e rótulo curto “Oi!”. Começar com alvo de toque de pelo menos 64 pixels CSS e validar em aparelho físico.
- Selecionar automaticamente o amigo elegível mais próximo. Não exigir tocar no corpo pequeno do animal nem mirar na cabeça.
- Usar alcance de interação maior que a soma dos volumes de colisão, de modo que a saudação funcione antes de o personagem bater no animal. Não exigir contato exato.
- Fazer o animal desacelerar/parar durante o encontro. Repetir o gesto deve continuar agradável, sem acumular popups ou figurinhas duplicadas.
- Manter câmera inicial pronta para jogar, com o personagem e o alvo legíveis. Zoom, fullscreen e ferramentas técnicas ficam disponíveis ao adulto, mas não entram como habilidades exigidas pelo primeiro desafio.
- Guiar por um marco e uma trilha curta. Se ficar parado/andando em círculos, oferecer uma dica suave e repetível; não transportar o jogador abruptamente sem ação dele.
- “Voltar à clareira” deve ficar fácil de reconhecer, preservar figurinhas e resolver perda de orientação. A opção atual “Voltar à origem” ainda não possui essa apresentação infantil.

Valores de velocidade, distância, atraso da dica e tamanho do botão são parâmetros de teste. O caminho inicial deve ser generoso o bastante para atravessar sem habilidade de desviar de raízes estreitas.

## Área inicial preparada

Preparar uma clareira e três pequenos pontos de encontro usando o terreno, as árvores e as flores já existentes. Garantir solo caminhável, corredores largos, boa separação de cores e ausência de pedras bloqueando o percurso. Posicionar os três amigos por identificadores estáveis da atividade, sem depender de sorte no sorteio de fauna.

Não transformar a busca em varredura do mundo infinito. Os demais animais podem continuar como ambientação, mas não devem confundir o alvo da primeira tarefa. Animais do encontro podem permanecer no local durante a atividade em vez de vagar para fora de vista.

Verificar oclusão da câmera: primeiro ajustar a posição/densidade das copas nos encontros; se não bastar, considerar transparência temporária apenas nos objetos que escondem personagem ou alvo. Não começar com uma reforma geral da vegetação.

## Imagem, fala e feedback

- A tarefa precisa poder ser compreendida sem ler: imagem do amigo + frase curta falada + indicação no cenário.
- Liberar o áudio pelo toque em Brincar, respeitando as restrições do navegador. Oferecer volume e repetição da instrução; a parte visual deve permitir jogar sem som.
- Usar poucas falas em português, revisadas e claras. Sons de resposta podem começar com efeitos simples; vocalizações reais exigem seleção de arquivos e conferência de licença.
- Recompensa com início e fim claros: animação curta, figurinha e mudança visível do espaço no álbum. Não cobrir a partida com uma sequência longa de janelas.
- Sem derrota ou perda de figurinhas ao esbarrar, girar o aparelho ou interromper a sessão. O ritmo não exige pressa.

O gesto é uma saudação dentro de uma floresta estilizada, não uma instrução de se aproximar ou tocar em animais selvagens reais.

## Progresso e repetição

O primeiro álbum terá **três figurinhas**; expandir para os 11 animais depois de validar a brincadeira. A criança pode abrir uma figurinha, ver o animal e ouvir seu nome novamente. Alternar entre descoberta e repetição, sem exigir uma nova recompensa em toda ação.

Salvar localmente versão do progresso, figurinhas obtidas e etapa da introdução. Para o recorte inicial, priorizar restaurar uma posição segura na clareira, evitando salvar dentro de obstáculos. Recarga de chunks não pode apagar recompensas nem concedê-las novamente.

O álbum deve usar identificadores estáveis de missão/espécie, não a identidade temporária do mesh ou a posição atual do animal. Tratar armazenamento indisponível/corrompido com recuperação segura; a partida deve continuar. Avisos de persistência pertencem às opções do adulto, não ao fluxo de saudação da criança.

## O que adicionar depois da primeira brincadeira

Após confirmar que a criança entende e quer repetir os encontros, experimentar uma atividade curta por vez: observar o tatu cavar, seguir pegadas até um amigo ou regar uma flor com a mesma lógica de aproximar e tocar. Introduzir uma variação por entrega para entender o que funciona.

Mais biomas, construção, inventário complexo, fome, combate e expansão técnica do streaming não são prioridades deste recorte. O acervo atual já permite testar o que torna o jogo interessante.

## Como validar

Começar com o aparelho em que a criança realmente vai jogar. Um adulto apresenta a entrada e observa; evitar ditar cada movimento. Uma sessão curta já revela problemas, mas uma única criança não comprova adequação a toda a faixa etária.

| Pergunta | O que observar | Meta inicial / decisão |
| --- | --- | --- |
| Entendeu o convite? | Reconhece qual animal procurar após imagem/fala | Entender sem ler o texto; se não, revisar convite antes de acrescentar tarefas |
| Conseguiu chegar? | Ajuda pedida, batidas, tempo procurando caminho | Primeiro encontro em cerca de 60 s, com no máximo uma orientação inicial do adulto |
| Conseguiu agir? | Vê a mão, toca e percebe a resposta | Saudação em um toque amplo, sem precisar acertar o mesh |
| Ficou frustrada? | Longas tentativas contra obstáculo, perda de orientação | Reduzir bloqueios e oferecer dica quando ficar presa, antes de aumentar dificuldade |
| Percebeu a conquista? | Relaciona figurinha ao animal encontrado | Reconhecer a primeira figurinha e o próximo espaço do álbum |
| Quis continuar? | Escolhe espontaneamente mais um encontro ou repete a saudação | Interesse voluntário; não usar tempo de tela como objetivo |
| Conseguiu retomar? | Reabrir a partida em outro momento | Encontrar as figurinhas e continuar de uma posição segura |
| Funcionou no aparelho? | Toque, rotação, áudio, pausas e fluidez | Meta técnica inicial de 30 FPS no primeiro passeio, a medir; sem travadas recorrentes no contato |

Registrar observações simples e anônimas, sem necessidade de SDK de analytics ou gravação da criança. Ajustar uma fonte de dificuldade por vez: controle, leitura visual, percurso ou resposta da ação. Os critérios e tempos acima são hipóteses do projeto, não marcos de desenvolvimento infantil.
