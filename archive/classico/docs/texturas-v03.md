# Texturas pintadas v03 — prancha aprovada

A [prancha de texturas v01](art/texturas-v01-aprovada.png) foi aprovada pelo usuário em 2026-11-01. Esta entrega adapta sua paleta e linguagem para texturas de produção, com manchas amplas e menos marcas miúdas. A imagem aprovada é referência visual; não foi recortada para funcionar como atlas.

## Produção

Atlas `mundo8bit-painted-v03.png`: 1024 × 1024, 16 células de 256 pixels, UVs com margem de 16 pixels. Pintura feita por script na API nativa `Texture.edit` do Blockbench 5.2.2; geometria e UVs criadas com `Mesh`/`MeshFace` e exportadas pelo codec glTF. São pinturas automatizadas, não pintura manual humana. Os padrões de cor não contêm iluminação ou sombra projetada.

| Código | Material | Aplicação |
| --- | --- | --- |
| T01/T02 | Grama clara e escura | Terreno, com transição suave entre manchas |
| T03 | Terra | Variação discreta em regiões do solo |
| T04 | Trilha | Faixa curta de chão gasto junto à origem; apenas decoração |
| T05 | Areia | Margens da água com transição por altura |
| T06/T07 | Água rasa e funda | Mistura de turquesas conforme profundidade do terreno |
| T08 | Pedra | As 11 pedras existentes, mantendo musgo e quartzo como variantes |
| T09 | Casca | Troncos e galhos das 11 árvores |
| T10/T11 | Folhagem clara e escura | Copas; oclusão continua geométrica |
| T12 | Madeira | Amostra editável/exportada pronta; ainda não há construções no mundo |

Quatro células adicionais preservam materiais próprios para bétula, suas marcas, musgo e quartzo. Iara, animais e flores conservam seus atlas específicos.

## Fontes e versões

- `scripts/paint-world-v03.mjs`: paleta e pintura das células.
- `scripts/build-world-textures-v03.mjs`: produção nativa no Blockbench via CDP local 9333. Recusa sobrescrever v03 sem `--replace-generated`; mudanças artísticas posteriores devem abrir nova versão.
- `assets/blockbench/arvore-*-v03.bbmodel`: 11 árvores; mesma geometria e UVs redimensionadas.
- `assets/blockbench/pedra-*-v02.bbmodel`: 11 pedras; mesma geometria e nova pintura.
- `assets/blockbench/superficie-*-v03.bbmodel`: 12 amostras de materiais.
- PNG em `assets/textures/` e `public/assets/`; exports em `public/assets/models/`.
- Manifestos atuais apontam para as versões novas. Catálogos anteriores preservados em `public/assets/history/`; fontes, exports e atlas anteriores continuam disponíveis.

São 34 novas fontes/exports, totalizando 97 versões de assets no repositório. O runtime continua com 57 templates de objetos, sem carregar simultaneamente as versões antigas. Árvores e pedras compartilham o novo atlas; flores continuam com seu material anterior, inclusive em instâncias.

## Terreno e água

`src/painted-materials.js` usa material padrão iluminado do Three.js com amostragem do atlas por coordenadas globais. O padrão do chão ocupa 8 unidades, não recomeça a cada quadrado de terreno nem ao cruzar um chunk. A água usa 12 unidades e calcula profundidade pela mesma função global de altura do mundo; não há nova simulação de fluidos ou mudança nas colisões.

Os canais de cor do padrão periódico coincidem nos limites da área útil das células de chão/água. Gradientes explícitos de UV mantêm o nível de mipmap estável ao atravessar a repetição. As margens das células evitam mistura com materiais vizinhos na escala de visualização do jogo. Antialiasing, filtragem linear, mipmaps e anisotropia permanecem ativos.

A faixa de trilha é pintura decorativa: não conduz a uma missão nem cria destinos ou muda o terreno físico. Não há alteração na câmera aprovada, velocidades, fauna, vegetação ou controles.

## Verificação

- `npm test`: 23 testes aprovados de integridade de fontes/exports, UVs, texturas incorporadas, câmera, geração e colisões.
- `node scripts/verify-world-textures.mjs`: atlas 1024, modelos novos, bordas periódicas de grama/terra/trilha/areia/água, programas gráficos compilados e capturas desktop/horizontal/compacto.
- `node scripts/verify-game.mjs`: viagens entre regiões, 25 chunks ativos, memória estabilizada, pausa em retrato, joystick/corrida e mipmaps. Resultado preservado em `texturas-v03-world-result.json`.
- Prancha de produção: [12 materiais](art/texturas-producao-v03.png).
- Evidências em `docs/art/validation/texturas-v03-*`.

Validação em Chromium com renderização por software e toque emulado. Desempenho e aparência no celular físico permanecem pendentes. A implementação aproxima a pintura aprovada dentro da geometria atual; não transforma a ilustração de referência em uma captura literal do jogo.
