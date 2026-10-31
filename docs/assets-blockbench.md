# Assets Blockbench / v02

## Abrir e editar

Abra um arquivo de `assets/blockbench/` no Blockbench. O PNG está incorporado em cada fonte; o atlas externo original está em `assets/textures/mundo8bit-painted-v02.png`. São Generic Models com faces trianguladas e UVs por face, compartilhando células por material. Texturas planas têm padrões reutilizados, sem bake de luz. O atlas é uma primeira passagem estilizada.

Preserve v01 (referência conceitual) e v02 (primeira implementação pintada). Para refinamentos, crie fontes e exports v03. Evite regenerar sobre ajustes manuais.

## Autoria e exportação reproduzível

Os scripts usam exclusivamente o Blockbench oficial instalado neste ambiente, controlado pelo depurador local Electron. Não instalam plugins nem requerem MCP de terceiros. A forma base das árvores vem do gerador v01 preservado; `scripts/asset-inputs.mjs` prepara também o explorador, pedra e amostras de superfícies.

`scripts/paint-atlas.js` define paleta e pinceladas desenhadas no canvas do Painter nativo (`Texture.edit`). `scripts/build-blockbench-assets.mjs` cria meshes com UVs no editor e usa os codecs nativos de projeto e glTF. Triângulos degenerados são descartados na importação. Cada fonte e export contém o atlas, dispensando caminhos externos na abertura.

Para nova exportação, abra o aplicativo:

```sh
/workspace/tools/bin/blockbench-virtual --remote-debugging-port=9333 --remote-debugging-address=127.0.0.1
```

E execute o script de autoria a partir da raiz do projeto. Por padrão, ele protege exports v02 já existentes. `--replace-generated` permite regeneração intencional e sobrescreve esses arquivos, descartando alterações manuais; para nova arte, prefira mudar os identificadores para v03.

```sh
npm run assets:blockbench
```

O depurador deve permanecer apenas no loopback e ser encerrado ao terminar. A aplicação pública não expõe essa interface. `npm run build` e `npm test` não dependem do editor.

## Integração

`src/assets.js` carrega o atlas e os exports glTF de 13 objetos; as quatro superfícies são amostras editáveis, enquanto o terreno recebe UVs diretamente na geração por chunks. A água recorta e repete apenas a célula correspondente. O runtime não usa os geradores históricos de formas e não depende de materiais com cores por vértice.

Clones dos objetos reutilizam geometrias e material. O descarregamento de chunks libera apenas terreno e bordas, preservando recursos compartilhados. O atlas tem margem por célula para evitar amostras dos materiais vizinhos. Escala de autoria: 16 unidades Blockbench = 1 unidade do mundo; exportação nativa usa escala 16.

## Verificação

- `npm test`: integridade dos 17 fontes/exports, texturas incorporadas, UVs e distribuição das 11 árvores.
- `npm run qa:browser`: com Vite em `127.0.0.1:5173` e Chromium local no CDP 9334, verifica carregamento WebGL, chunks, recursos e joystick/corrida por dois toques em viewport 390 × 844. Atualiza capturas desktop/mobile.
- `npm run qa:pranchas`: no mesmo navegador, renderiza os 11 modelos de frente e de costas para comparação. Saídas em `docs/art/`.

Validação realizada em Chromium com SwiftShader. Na origem: 100 malhas visíveis texturizadas, 25 chunks ativos. Após duas viagens repetidas entre chunks `(10,-10)`, `(-10,10)` e `(0,0)`, contagens de recursos retornaram aos mesmos valores (43 geometrias e 3 texturas na origem). Nenhuma falha de carregamento foi exibida. O joystick moveu o personagem, aceitou corrida com segundo dedo e parou após soltar os toques.

As pranchas e capturas são renders dos assets reais. Não substituem aprovação artística do usuário nem medição de desempenho em celulares físicos.
