# Duelo de Magos

Projeto de jogo 1v1 por turnos com interface gráfica 2D, seleção de magias por gestos em uma webcam e d20 virtuais gerados pelo software, no mesmo computador (D13).

- [Especificação aprovada](ESPECIFICACAO.md)
- [Plano de entregas](PLANEJAMENTO.md)
- [Registro de decisões](DECISOES.md)
- [Ensaio da entrega 2: preparação e execução](docs/GUIA_ENSAIO.md)
- [Resultados e limites da entrega 2](docs/ENTREGA_02.md)
- [Orientações dos agentes do projeto](AGENTS.md)

## Executar o laboratório local

Requisito: Node.js 20 ou superior. O laboratório usa HTML, CSS e JavaScript, sem instalação de pacotes ou etapa de build.

Na pasta do projeto, execute:

```powershell
node scripts/serve.mjs
```

Abra [o laboratório local](http://127.0.0.1:4173) em um navegador desktop. Use `Ctrl+C` no terminal para encerrar o servidor. Se a porta estiver ocupada, configure outra:

```powershell
$env:PORT = '4174'
node scripts/serve.mjs
```

O navegador precisa de acesso à internet ao carregar os modelos fixados em `dist/config.js`. A execução dos reconhecedores ocorre no dispositivo; o protótipo não envia quadros para um servidor. O relatório JSON é baixado localmente por solicitação do operador e não contém imagens nem identificadores dos dispositivos.

O servidor atende somente em `127.0.0.1` e expõe somente os arquivos de `dist/`. A webcam é solicitada sem áudio e encerrada pelo botão Encerrar câmera ou ao sair da página.

## Verificações automatizadas

```powershell
node --test tests/*.test.mjs
```

A suíte existente contém verificações de gestos e recursos de câmera, além de testes legados de dados físicos/OCR, que não fazem parte do fluxo ativo desde D13. Não foi alterada ou executada nesta rodada; não comprova o novo fluxo de rolagens virtuais nem reconhecimento físico de gestos. Execute testes somente mediante pedido explícito do usuário. O ensaio com a webcam segue o [guia](docs/GUIA_ENSAIO.md).

## Agentes do projeto no Codex

Os perfis locais ficam em `.codex/agents/` e são especializados neste projeto:

- `analista_de_pedidos`: interpreta a solicitação, considera a especificação aprovada e prepara escopo e critérios de aceite.
- `implementador`: modifica o código dentro da entrega atual e respeita as regras e decisões registradas.
- `revisor_codigo`: revisa alterações sem editar arquivos e aponta defeitos concretos com evidências.

Peça ao Codex para delegar pelo nome, por exemplo: “Use o `analista_de_pedidos` para transformar este pedido em critérios de aceite” ou “Peça ao `revisor_codigo` para revisar as alterações”. O Codex carrega os perfis do projeto em novas sessões.

## Plugin do projeto no Codex

O [plugin local Duelo de Magos](plugins/duelo-de-magos/README.md) reúne as skills `duelo-entender`, `duelo-implementar` e `duelo-revisar`. Ele consulta os documentos atuais deste repositório e reutiliza os três agentes no fluxo exigido pelo projeto.

O catálogo está em `.agents/plugins/marketplace.json` e a habilitação do projeto em `.codex/config.toml`. Reinicie/recarregue o Codex, encontre **Duelo de Magos** na fonte local **Duelo de Magos · Projeto** e instale/ative se necessário. Se a fonte não aparecer, o [guia do plugin](plugins/duelo-de-magos/README.md) inclui os comandos para cadastrar o marketplace e instalar pelo CLI. O carregamento no cliente precisa ser confirmado após essa atualização.

## Estado do projeto

A entrega 1 foi aprovada e registrada no commit `c9d1d7b`. Em 28/10/2026, D13 substituiu a câmera dos dados e os d20 físicos por rolagens virtuais. O laboratório da entrega 2 foi adaptado; não há dano, combate ou troca automática de turnos. A entrega 2 foi aceita após registro de seis gestos positivos (três para cada jogador), uma sessão e cerca de 1.957 quadros; rejeição, unicidade, recuperação e métricas não foram registradas. Consulte o relatório para os limites. Entregas 3 a 7 não iniciadas.

Cada entrega deve ser mostrada ao usuário e ter seu commit autorizado antes de ser registrado.

