# Pedras e flores / implementação v01

Referência: `docs/art/pedras-flores-v01-aprovada.png`. Fontes: `assets/blockbench/pedra-*-v01.bbmodel` e `assets/blockbench/flor-*-v01.bbmodel`. Manifesto: `public/assets/nature-manifest.json`. Atlas externo: `assets/textures/natureza-painted-v01.png`, também incorporado nos fontes e exports.

## Produção

`scripts/nature-inputs.mjs` define as 34 silhuetas, grupos semânticos, paleta e pinceladas. `scripts/build-nature-assets.mjs` executa a autoria no Blockbench local, cria UVs e exporta `.bbmodel` e glTF pelos codecs nativos. Requer Blockbench 5.2.2 no depurador local 9333, como o fluxo anterior. Os modelos são triangulados; cristal e rochas são opacos e estilizados. Os furos de arco e pedra furada são geometria real, sem transparência recortada.

```sh
node scripts/build-nature-assets.mjs
```

O script protege os arquivos existentes. Para uma regeneração deliberada, `--replace-generated` sobrescreve os fontes desta coleção; `--only flor-hortensia-v01` limita a um asset e atualiza seu manifesto. Para refinamentos de arte, prefira criar v02 e preservar v01.

## Distribuição e desempenho

`src/nature.js` retorna posições, escala, orientação e tipo a partir de coordenadas globais. Pedras substituem o objeto genérico anterior. Flores aparecem em manchas pequenas; o lótus flutua sobre água, com sua folha acima do plano da água. Há uma área livre na origem.

`src/assets.js` combina as partes dos novos glTFs em uma geometria por asset e reutiliza um material/atlas para a coleção. `InstancedMesh` agrupa plantas e pedras repetidas por tipo dentro de cada chunk. Não há duplicação de geometria por flor e os buffers de instâncias são descartados ao remover chunks. A filtragem suave e os limites de renderização existentes foram mantidos.

Na atualização de colisões v01, pedras bloqueiam a passagem por caixas orientadas; flores permanecem atravessáveis. Coleta e outras interações continuam fora desta etapa. Ver `docs/colisoes.md`.

## Verificação

`npm test` confere os 51 fontes/exports de ambas as coleções (incluindo a pedra antiga preservada), UVs, texturas e cobertura dos 11 tipos de pedra e 23 de flores num recorte de coordenadas. Verifica também lótus apenas sobre terreno submerso e plantas terrestres fora da água.

`npm run qa:browser` verifica WebGL, streaming e controles móveis. Na região inicial: 44 pedras e 200 flores, agrupadas em instâncias; todas as 177 malhas visíveis usam texturas. Após duas viagens pelos chunks `(10,-10)`, `(-10,10)` e `(0,0)`, os recursos retornaram a 76 geometrias e 4 texturas na origem. As contagens dependem dos assets efetivamente enviados à GPU, não representam FPS.

Reabertura dos fontes de arco, copo-de-leite e lupino foi conferida no editor. `docs/art/validation/blockbench-lupino-v01.png` registra o editor real. Pranchas comparativas e capturas do jogo ficam em `docs/art/`. A inspeção WebGL foi em Chromium/SwiftShader, com controles mobile emulados; desempenho em celulares físicos permanece a verificar.
