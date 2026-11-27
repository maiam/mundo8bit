# RG-02 — ciclo de dia/noite e clima

Data: 2026-11-27. **Estado: aprovada pelo usuário em 2026-11-27.** Implementação inicial entregue em 2026-11-27; validação em aparelho físico pendente.

## Referência e limites da consulta

Consultados trechos indexados da Minecraft Wiki em 2026-11-27. O acesso direto foi bloqueado por robots.txt; não houve leitura integral nem auditoria de versão específica. As adaptações abaixo são regras de Mundo8bit aprovadas pelo usuário.

- [Daylight cycle](https://minecraft.wiki/w/Daylight_cycle): ciclo completo de 24.000 ticks, equivalente a 20 minutos com 20 ticks/s; fases de dia, pôr do sol, noite e amanhecer. Referência conceitual comum às edições, sem importar detalhes de iluminação ou horários de mobs.
- [Weather](https://minecraft.wiki/w/Weather): na mecânica Java descrita, chuva e trovoada usam temporizadores próprios, distintos do horário. Clima influencia a apresentação do céu; há diferenças entre edições.
- [Rain](https://minecraft.wiki/w/Rain): precipitação depende de condições locais como bioma/temperatura. Isso é referência para uma expansão futura, não regra de biomas já existente no projeto.

## Regra geral aprovada

**Um relógio global determina dia/noite; um estado climático independente determina céu e precipitação. Ambos mudam suavemente, preservam a leitura do jogo e não alteram automaticamente as regras das entidades.**

### 1. Tempo do mundo

Um ciclo completo dura **20 minutos de jogo ativo** (1.200 segundos). Não depende do relógio civil, fuso horário, FPS ou chunk em que a personagem está.

| Fase proposta | Intervalo no ciclo | Duração |
| --- | --- | --- |
| Dia | 0 ≤ t < 600 s | 10 min |
| Entardecer | 600 ≤ t < 660 s | 1 min |
| Noite | 660 ≤ t < 1.140 s | 8 min |
| Amanhecer | 1.140 ≤ t < 1.200 s | 1 min |

A duração total vem da referência; a divisão acima é uma adaptação arredondada de Mundo8bit, não reprodução exata dos limites de Minecraft.

Fórmulas, com `T` em segundos ativos acumulados:

- `t = T mod 1200` e `fase_normalizada = t / 1200`.
- `dia = floor(T / 1200) + 1`.
- `hora_visual = (6 + 24 × fase_normalizada) mod 24`, apenas se uma representação de horário for necessária. As faixas artísticas não precisam coincidir exatamente com nascer/pôr do sol astronômico.

Cada nova sessão começa no dia 1, início do dia, com céu limpo. Nenhum avanço offline nesta primeira versão. Salvar/restaurar relógio entre sessões depende de futura regra de persistência.

### 2. Pausa e continuidade

O relógio e os temporizadores climáticos param quando o jogo está efetivamente pausado e quando a página fica oculta. Ao retomar, não compensar o tempo afastado. Abrir um menu só pausa o ciclo se também pausar o jogo; esta proposta não muda a política geral de pausa do menu.

Usar tempo ativo real, independente da taxa de quadros. Não reutilizar o delta reduzido da física para medir a duração do dia. Atravessar ou recarregar chunks não reinicia hora nem clima.

### 3. Aparência de dia e noite

- Dia claro; entardecer quente; noite azulada e legível; amanhecer gradual.
- Sol, lua, estrelas, nuvens e chuva seguem a linguagem voxel/pixel art. Texturas de blocos continuam 8×8 por face; alterar luz/cor não troca a densidade.
- A câmera isométrica atual mostra principalmente o chão. Não exigir uma nova câmera ou um horizonte visível: a fase deve ser reconhecível também pela paleta e pelo ambiente.
- Nunca apagar a personagem, caminhos, obstáculos ou controles para simular escuridão. Validar leitura em tela pequena antes de considerar a aparência concluída.

Para transições, propõe-se `s(u) = 3u² − 2u³`, com `u = clamp(tempo_decorrido / duração, 0, 1)`, e `valor = início + (fim − início) × s(u)` para cada parâmetro visual. Valores finais de cor/luz exigem revisão visual; esta regra não fixa níveis de luz de Minecraft.

### 4. Clima inicial: limpo, nublado e chuva leve

Ciclo proposto:

`limpo → nublado de entrada → chuva leve → nublado de saída → limpo`

| Estado | Duração proposta | Efeito |
| --- | --- | --- |
| Limpo | Sorteio entre 240 e 480 s | Céu/paleta limpos |
| Nublado de entrada | 30 s | Nuvens e tonalidade aumentam gradualmente |
| Chuva leve | Sorteio entre 60 e 120 s | Precipitação discreta, sem impedir leitura |
| Nublado de saída | 30 s | Chuva termina e céu clareia gradualmente |

Durações e sequência são adaptações para sessões curtas, não valores de Minecraft. Chuva pode ocorrer de dia ou à noite; amanhecer não a cancela. O clima não reinicia o relógio.

Sorteio: `duração = mínimo + U × (máximo − mínimo)`, com `0 ≤ U < 1`. Usar gerador determinístico próprio, inicializado pela semente do mundo, separado dos sorteios de terreno e spawn. Sortear uma vez por entrada no estado, não a cada frame nem por chunk. O estado é global e chuva é exibida somente nas áreas expostas ao céu; se ainda não houver detecção de cobertura, esse limite deve ser implementado antes de considerar a chuva concluída.

Dentro dos 30 s de entrada, a chuva cresce de zero à intensidade leve nos últimos 10 s; na saída, decai a zero nos primeiros 10 s. As demais mudanças visuais usam a duração inteira do estado. Sem salto instantâneo de intensidade nas fronteiras.

### 5. Efeitos autorizáveis neste primeiro recorte

Somente ambiente visual e, quando o sistema de áudio existir, som ambiente suave. Áudio não é dependência para iniciar o ciclo e ainda não existe no jogo.

Não acrescentar implicitamente dano, raios, incêndios, escorregamento, enchentes, alteração do nível de água, bloqueio de caminhos, mudanças de velocidade, spawn noturno, agressividade, sono de NPCs ou crescimento de plantas. Essas interações precisam de propostas específicas.

Tempestades, trovões, neve, estações do ano, temperaturas por bioma, fases da lua e dormir para avançar o tempo ficam fora deste primeiro recorte. São possibilidades futuras, não proibições permanentes nem funcionalidades já entregues.

### 6. Critérios de aceitação para futura implementação

- Após 1.200 s ativos, completar exatamente um ciclo; pausas/página oculta não avançam o estado.
- Sem variação de duração entre FPS diferentes e sem reinício nas bordas de chunks.
- Chuva e noite podem coexistir; mudança do dia não reseta clima.
- Mesmo estado inicial e tempo ativo geram a mesma sequência climática, sem afetar geração/spawn.
- Personagem e obstáculos permanecem legíveis durante noite chuvosa; transições são contínuas.
- Chuva respeita cobertura, com quantidade de partículas limitada e desempenho medido em aparelho real.
- Nenhuma regra física, de entidade ou de progressão muda por consequência não aprovada.

## Decisão registrada

**Aprovada pelo usuário em 2026-11-27**, com a resposta “Aprovo.” à proposta RG-02.

Escopo aprovado: ciclo de 20 minutos (10 dia + 1 entardecer + 8 noite + 1 amanhecer), clima independente com limpo por 4–8 min, transições nubladas de 30 s e chuva leve por 1–2 min; fórmulas, pausa/continuidade, transições e critérios descritos neste documento. Inicialmente sem efeitos físicos ou novos comportamentos de entidades.

Implementada após autorização do usuário em 2026-11-27: `environment.js` controla tempo/clima e `environment-view.js` aplica paleta ambiente e chuva com cobertura de copas, chão, pedras e água. A apresentação atual usa paleta/cor ambiente na câmera isométrica, sem representar corpos celestes no horizonte. Testes em aparelho físico e revisão visual pelo usuário continuam pendentes. Tempestades, neve, estações, persistência entre sessões e demais efeitos excluídos continuam sujeitos a propostas específicas. Não foram adicionadas regras físicas nem comportamentos de entidades.

## Validação da implementação

`npm test`, `npm run build`, QA voxel e `npm run qa:environment` executados. O QA de ambiente acelera o estado para inspecionar dia, noite e noite chuvosa, verifica pausa por visibilidade simulada e por orientação retrato e retomada em horizontal. Capturas e resultados: `docs/art/validation/ambiente-v01-*`; regressão: `regras-aprovadas-v01-*`. Os testes puros verificam cobertura de chuva, transições, determinismo e duração independente de FPS. Isso não substitui medição de desempenho em aparelho físico.
