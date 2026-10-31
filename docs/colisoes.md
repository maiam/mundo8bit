# Colisões / v01

> Registro por etapa: versões, contagens e verificações abaixo pertencem às entregas descritas. Consulte o [estado atual consolidado](estado-atual.md) e o [plano de evolução](roadmap.md) para o panorama vigente.

O personagem agora colide com troncos, raízes de mangues, pedras e corpos de animais. Os animais também evitam esses obstáculos, o personagem e outros animais. Flores continuam atravessáveis. Os assets e a direção de arte permanecem preservados.

## Movimento

`src/collisions.js` implementa colisões em X/Z por volumes simplificados. O personagem usa círculo de raio 0,24; o terreno determina a altura Y. Árvores usam círculos de tronco, mangues acrescentam seis cápsulas para raízes e pedras usam caixas orientadas obtidas dos limites dos modelos glTF, com escala e rotação de cada instância. Animais usam círculos de corpo por espécie/escala; caudas, asas, galhadas e copas não são volumes completos de colisão.

O deslocamento é dividido em passos de até 0,08 unidade. Correções de penetração e alternativas tangenciais/por eixo permitem deslizar ao encostar. Candidatos que continuam dentro de outro obstáculo são rejeitados, evitando expulsão para dentro de objetos em cantos. Não há salto ou simulação de corpo rígido nesta versão. Pedras planas e vãos baixos continuam sólidos pela caixa conservadora; não há colisão por triângulo da malha.

A água está em Y = -1,55. O limite de solo caminhável é -1,70, permitindo 0,15 unidade de profundidade na escala do mundo. Centro e oito pontos ao redor do raio são conferidos. Ao atingir a margem, a projeção tangencial favorece deslocamento ao longo da praia. Desníveis maiores que 0,35 em um subpasso são rejeitados. A altura do personagem segue o solo, sem flutuar artificialmente no plano da água.

## Integração

- `CollisionWorld` mantém índice espacial de células de 4 unidades para obstáculos estáticos, pertencentes aos chunks, e um registro separado de atores dinâmicos.
- Cada chunk registra suas colisões antes de criar fauna. Ao removê-lo, libera entradas de colisão, buffers de instâncias e malhas locais.
- `movePlayer` é o caminho comum para teclado e joystick. A oscilação de caminhada só ocorre quando há deslocamento efetivo.
- Animais procuram ponto inicial livre perto do spawn original, validam destinos e passam pelo mesmo resolvedor de movimento. Pausam e tentam novo destino quando bloqueados.
- O contato não desloca o personagem parado por forças físicas. Não há coleta, dano ou empurrão nesta etapa.

## Verificação

`npm test`: 18 testes passaram. Casos incluem obstáculos finos em deslocamentos grandes, contato diagonal, pedras rotacionadas, cápsulas de raízes, bordas negativas do índice, remoção de chunks, raio na margem da água, contato bilateral com animais e cantos com múltiplos obstáculos.

`npm run qa:collisions`: com Vite no endereço local 5173 e Chromium no CDP 9334, usa o mesmo `movePlayer` do jogo contra tronco, pedra e animal reais. O teste confirmou parada antes dos volumes, nenhuma posição final penetrando os obstáculos e nenhuma fauna em posição inválida após uma simulação de 20 segundos. Mantiveram-se 25 chunks de colisões e 17 atores dinâmicos (16 animais e personagem), sem registros de animais descarregados.

`npm run qa:browser`: verifica ainda carregamento, recursos após viagens repetidas, renderização e joystick/corrida mobile emulados. Capturas desta etapa ficam em `docs/art/validation/mundo-colisoes-v01-*`. Desempenho e sensação do contato em aparelhos físicos ainda precisam ser avaliados.
