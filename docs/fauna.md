# Fauna / modelos v01

> Atualização aprovada em 2026-11-01: A01/onça-pintada passa a usar [ilustração 2D fantasia no jogo](onca-2d.md). Os modelos 3D abaixo ficam preservados; as outras dez espécies mantêm seu estilo.

> Registro por etapa: versões, contagens e verificações abaixo pertencem às entregas descritas. Consulte o [estado atual consolidado](estado-atual.md) e o [plano de evolução](roadmap.md) para o panorama vigente.

Referência aprovada para implementação: `docs/art/animais-v01-aprovada.png`. Modelos adaptados em low poly painted, com fontes Generic Model no Blockbench 5.2.2, atlas plano PNG de 256 × 256 e exports glTF nativos.

## Catálogo

A01 onça-pintada, A02 anta, A03 veado, A04 capivara, A05 quati, A06 tamanduá-mirim, A07 tatu, A08 macaco-prego, A09 preguiça, A10 tucano e A11 coruja. São tipos estilizados da referência, sem pretensão de precisão zoológica ou representação de um ecossistema real completo.

Fontes: `assets/blockbench/animal-*-v01.bbmodel`. Textura: `assets/textures/fauna-painted-v01.png`. Exports e catálogo: `public/assets/models/animal-*-v01.gltf` e `public/assets/fauna-manifest.json`. Os arquivos anteriores permanecem preservados.

## Autoria e animação

`scripts/fauna-inputs.mjs` define formas, paleta, rosetas da onça, carapaça do tatu, marcas das penas e detalhes pintados. `scripts/build-fauna-assets.mjs` cria os meshes, UVs, pivôs locais e atlas pelo Painter nativo do Blockbench e exporta os projetos e glTFs. A autoria é automatizada no editor; não se alega pintura manual humana.

Meshes semânticos: corpo, cabeça, quatro patas (quadrúpedes) ou duas patas e asas (aves), e cauda quando aplicável. A cabeça e os membros têm pivôs editáveis nos fontes. As animações são procedurais em `src/fauna.js`, usando essas partes do glTF: passos alternados, movimento leve de cabeça, cauda e asas. Os fontes não contêm clips de animação gravados; a lógica de animação permanece no código.

Para produzir uma nova versão com Blockbench aberto no CDP local 9333:

```sh
npm run assets:fauna
```

O script protege arquivos existentes. `--replace-generated` permite regeneração deliberada; `--only animal-capivara-v01` limita a um modelo. Para refinamentos, criar v02 preservando v01. O build normal não requer o editor instalado.

## Comportamento no mundo

Até um animal por chunk, escolhido por semente/coordenada. Procura ponto de terra firme e passeia até 2,2 unidades do ponto inicial, com pausas e velocidades próprias (preguiça mais lenta). O caminho é validado contra a altura da água. A aparência e a posição inicial são reproduzíveis; ao descarregar um chunk, o animal sai da cena, e ao retornar reinicia sua rotina. As geometrias e o material são compartilhados entre indivíduos.

Esta etapa implementa fauna ambiente em terra: sem combate, captura, natação, voo ou ajuste individual dos pés à inclinação do chão. Aves caminham e movem as asas discretamente; a preguiça usa a pose baixa da referência. Esses limites devem orientar revisões futuras.

## Evidências

- `npm test`: 9 testes passaram, incluindo cobertura das 11 espécies, permanência em terra e no território, reprodução da simulação e correspondência dos pivôs Blockbench/glTF.
- `npm run qa:browser`: 16 animais iniciais; todos se moveram e apresentaram animação na simulação de quadros. Catálogo carregado sem divergências de triângulos ou partes. Todas as 285 malhas da cena inicial eram texturizadas.
- Streaming manteve 25 chunks ativos. Após duas viagens repetidas pelos chunks `(10,-10)`, `(-10,10)` e `(0,0)`, recursos estabilizaram em 151 geometrias e 5 texturas na origem. São contagens de recursos, não medição de FPS.
- Joystick e corrida com dois dedos passaram em viewport mobile emulada. Desempenho em telefone físico continua pendente.
- Onça reaberta no Blockbench com 7 meshes, atlas incorporado e pivôs conferidos. Captura em `docs/art/validation/blockbench-onca-v01.png`.
- Pranchas de modelos reais: `docs/art/animais-modelos-v01-frente.png` e `animais-modelos-v01-costas.png`; capturas do jogo em `docs/art/validation/mundo-fauna-v01-*`.

As adaptações são uma primeira implementação para revisão artística; a aprovação da prancha não significa aprovação automática dos modelos finais.

## Atualização de colisões v01

Corpos de animais agora colidem com árvores, pedras, personagem e outros animais por volumes simplificados. Spawns são ajustados para locais livres e destinos bloqueados são reavaliados. Ver `docs/colisoes.md`.
