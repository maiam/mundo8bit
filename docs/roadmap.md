# Plano de evolução — do protótipo ao primeiro passeio infantil

Revisado em 2026-10-31 para o público de aproximadamente 5 anos. As etapas abaixo são propostas, ainda não implementadas. Estado confirmado em [estado atual](estado-atual.md); experiência-alvo em [design para 5 anos](design-crianca-5-anos.md).

## Base já entregue

- Mundo 2,5D com geração e descarregamento por chunks.
- Direção low poly painted, fontes Blockbench, UVs, três atlas e acervo de árvores, pedras, flores e fauna.
- Fauna com passeio/animação simples; colisões com obstáculos e água profunda.
- Joystick, corrida, modo horizontal obrigatório, zoom e tela cheia condicional.
- 21 testes automatizados atuais e scripts de QA de navegador. Validação de diversão e de aparelho físico ainda pendente.

## Prioridade 0 — uma brincadeira completa: “Dê oi à capivara”

**Resultado:** a criança entende um convite, chega ao animal, acena e recebe uma figurinha.

1. Preparar uma clareira pequena e um encontro fixo e acessível com capivara, reutilizando assets existentes. Garantir percurso largo e alvo visível.
2. Criar entrada Brincar com imagem e áudio curto. Fullscreen é opcional; a falha do navegador não bloqueia a atividade horizontal.
3. Simplificar a locomoção inicial para um dedo; testar velocidade e câmera no telefone real. Conservar os controles avançados nas opções.
4. Implementar seleção por proximidade e uma ação contextual grande “Oi!”, com alcance maior que a colisão. Dar identidade estável ao encontro.
5. Acrescentar aceno do explorador, reação da capivara, efeito sonoro e uma primeira figurinha. Repetir a saudação continua funcionando sem duplicar a recompensa.

**Critério de saída:** primeiro encontro compreensível sem leitura, uma ação ampla produz resposta clara e a criança percebe o que conquistou. Colisões não impedem a aproximação; rotação pausa/retoma sem perder o estado da atividade. A meta de primeiro encontro em aproximadamente um minuto precisa ser observada em uso.

**Dependências técnicas sugeridas:** separar estado da brincadeira e interação contextual do loop de renderização; não reescrever geração, trocar engine ou criar um backend para este recorte. Áudio necessita de ativação por gesto.

## Prioridade 1 — passeio de três amigos e lembrança da sessão

**Resultado:** capivara, tucano e tatu formam um pequeno passeio com começo, meio e conclusão.

1. Garantir os três encontros, com um objetivo de cada vez e indicação por imagem, voz e marcos próximos.
2. Montar álbum visual de três espaços e comemoração curta da conclusão. Permitir continuar passeando e rever as respostas dos amigos.
3. Salvar progresso local versionado e restaurar uma posição segura. A recarga de chunks não reinicia missões concluídas; múltiplos exemplares da mesma espécie não duplicam a figurinha.
4. Incluir repetição de instrução e retorno reconhecível à clareira. Oferecer dica discreta quando houver dificuldade, sem cronômetro ou perda de recompensa.

**Critério de saída:** completar o passeio curto sem instrução contínua do adulto e retomar as figurinhas após reabrir. Dados inválidos ou armazenamento indisponível não impedem jogar. A duração de 3–5 minutos é alvo de design, não limite da partida.

## Prioridade 2 — observação com a criança e refinamento

**Resultado:** confirmar quais partes ela entende, consegue fazer e quer repetir.

- Observar uma sessão curta no aparelho real, com um adulto presente e sem dirigir cada passo.
- Registrar reconhecimento do convite, chegada, uso da ação, percepção da recompensa, frustrações e desejo espontâneo de continuar.
- Ajustar velocidade, alcance de interação, tamanho de ícones, voz e obstrução por copas conforme a observação.
- Medir carregamento e fluidez no dispositivo. A meta inicial é 30 FPS na área de introdução; reduzir custo/densidade se necessário, antes de adicionar novas áreas.

**Critério de saída:** a criança consegue repetir o ciclo com autonomia crescente e sem obstáculos recorrentes. Se não entender ou não quiser repetir, revisar o ciclo antes de ampliar conteúdo. Os critérios são hipóteses; não há validação infantil concluída hoje.

## Prioridade 3 — variedade com a mesma linguagem de ação

**Resultado:** mais motivos para voltar, usando controles que a criança já conhece.

Experimentar uma atividade por entrega: acompanhar uma animação especial, seguir pegadas ou regar uma flor. Só depois expandir o álbum para os demais animais e abrir outras pequenas áreas. Manter uma tarefa simples por vez.

**Critério de saída de cada atividade:** compreensível pela imagem/fala, resposta imediata e vontade de repetir. Novas mecânicas devem justificar novas exigências motoras.

## Prioridade 4 — expansão do mundo e produção

Depois de validar o passeio: marcos e biomas, otimização de streaming, carregamento por região, refinamento de modelos/animações, instalação/offline quando fizer sentido e avaliação de suporte em mais aparelhos. A ordem depende do gargalo medido, não da disponibilidade de novas ferramentas.

## Fora da sequência — mundo voxel 3D (protótipo)

Implementado a pedido em 2026-11-25 como mundo separado (`?mundo=voxel3d`, [voxel 3D](voxel-3d.md)) para teste antes de decidir o padrão. Se aprovado: fauna em cubos (começando pela capivara da prioridade 0), fontes Blockbench estilo bloco/entidade, módulo comum de laço/controles com o clássico e medição em aparelho físico. Até lá, não altera as prioridades.

## Fora da sequência — pixel art 32×32

Aprovado como padrão visual em 2026-11-22 ([pixel art](pixel-art.md), [árvores](arvores-pixel-32.md)). Não altera as prioridades acima, mas novos assets da brincadeira (capivara, figurinha, marcos) devem nascer em 32×32 a 12 px/unidade. Pendências: sprites para fauna, Iara, pedras, flores e terreno; leitura da Iara (~11 px) com a criança; desempenho em aparelho físico.

## Próxima entrega concreta recomendada

Implementar apenas a prioridade 0 como primeiro recorte jogável: **clareira → convite da capivara → aproximação → aceno → reação → figurinha**. Isso permite avaliar diversão e compreensão usando a base que já existe. Álbum completo, salvamento e expansão vêm na sequência descrita acima.
