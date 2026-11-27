# Blockbench no ambiente de trabalho

## Instalação verificada

- Blockbench oficial **5.2.2**, Linux x86_64, AppImage extraído (não depende de FUSE).
- Fonte: https://github.com/JannisX11/blockbench/releases/tag/v5.2.2
- SHA-256 do AppImage: `375fb8da33b8b9ad0f1f790836ed83020b6e987a56e23184d31d6ccf3132ac3b` (conferido).
- Diretório: `/workspace/tools/blockbench-5.2.2/`.
- Launcher: `/workspace/tools/bin/blockbench`.
- Launcher com display virtual: `/workspace/tools/bin/blockbench-virtual`.

O ambiente não possui display gráfico ativo ou GPU disponível. Foi extraído localmente o pacote oficial Debian `xvfb_21.1.16-1.3+deb13u4_amd64.deb` em `/workspace/tools/xvfb/`, sem sudo ou instalação global. Xvfb usa o display `:98` sem porta TCP; o launcher virtual ativa SwiftShader para WebGL por software.

## Uso

```sh
/workspace/tools/bin/blockbench-virtual
```

Para abrir um projeto:

```sh
/workspace/tools/bin/blockbench-virtual /caminho/asset.bbmodel
```

O editor roda no display virtual deste ambiente; isso não cria uma janela interativa dentro do chat. Não há integração Blockbench MCP conectada. O display virtual e o processo do aplicativo podem precisar ser reiniciados; o launcher cuida do display.

## Validação realizada

Versão `5.2.2` lida dentro do editor carregado, formato Generic Model (`free`) disponível, criação de um cubo e exportação nativa `.bbmodel` verificadas. Arquivo de teste: `/workspace/tools/blockbench-5.2.2/validacao.bbmodel`. Esse arquivo é somente um teste de instalação, não um asset de produção. A validação usou o depurador Electron restrito ao loopback; o launcher normal não ativa depuração.

Os binários ficam fora do repositório. A instalação pertence a este ambiente e pode desaparecer se ele for recriado. A direção artística permanece versionada em `AGENTS.md` e `docs/direcao-artistica.md`.
