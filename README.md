# Duelo de Magos

Projeto de jogo 1v1 por turnos com interface gráfica 2D, seleção de magias por gestos em uma webcam e d20 virtuais gerados pelo software, no mesmo computador (D13).

- [Especificação aprovada](ESPECIFICACAO.md)
- [Plano de entregas](PLANEJAMENTO.md)
- [Registro de decisões](DECISOES.md)
- [Ensaio da entrega 2: preparação e execução](docs/GUIA_ENSAIO.md)
- [Resultados e limites da entrega 2](docs/ENTREGA_02.md)
- [Orientações dos agentes do projeto](AGENTS.md)
- [Motor e critérios da entrega 3](docs/ENTREGA_03.md)
- [Protótipo integrado e limites da entrega 4](docs/ENTREGA_04.md)

## Executar o projeto local

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

O [protótipo integrado da Entrega 4](http://127.0.0.1:4173/jogo.html) fica em `/jogo.html`; o laboratório continua disponível em `/`. No protótipo, configure os atributos, permita/identifique e selecione uma webcam, conecte os recursos e confirme o enquadramento. A iniciativa é automática e o combate usa somente os gestos. Em suspensão, confira os recursos e confirme explicitamente a retomada; conectar a câmera não sorteia dados. O [relatório da entrega 4](docs/ENTREGA_04.md) registra o relato exploratório do usuário: três gestos reconhecidos com facilidade, ataques alternados passando turno, vida até zero e exibição do resultado com opções de encerramento/revanche. O relato não comprova os cliques dessas opções ou os demais casos pendentes.

O navegador precisa de acesso à internet ao carregar os modelos fixados em `dist/config.js`. A execução dos reconhecedores ocorre no dispositivo; o protótipo não envia quadros para um servidor. O relatório JSON é baixado localmente por solicitação do operador e não contém imagens nem identificadores dos dispositivos.

O servidor atende somente em `127.0.0.1` e expõe somente os arquivos de `dist/`. A webcam é solicitada sem áudio e encerrada pelo botão Encerrar câmera ou ao sair da página.

## Motor de combate — Entrega 3

O módulo ESM [dist/combat.js](dist/combat.js) implementa as regras com resultados de dados fornecidos pelo chamador. Exporta validação da configuração, criação da partida, registro da iniciativa e resolução de ações. A [documentação da entrega](docs/ENTREGA_03.md) descreve API, estado, erros, cenários e evidências. Após corrigir dois achados da revisão sobre captura de entradas, a validação final do coordenador aprovou 70 testes, com cobertura focada de 100% de linhas, ramos e funções em `combat.js` e `dice.js`. A nova revisão independente confirmou as correções e não encontrou novos problemas acionáveis. A Entrega 3 foi integrada à `main` pela [PR #3](https://github.com/EndrewGomess/MageBattle2D/pull/3), no merge `0fd5b20`; a autorização está registrada em D15. O laboratório não chama esse motor; o protótipo separado da Entrega 4 o reutiliza, sem estender essas evidências aos novos fluxos.

## Verificações automatizadas

```powershell
node --test tests/*.test.mjs
```

A suíte contém testes do motor e gerador virtual, verificações sintéticas de gestos e recursos de câmera, além de testes legados de dados físicos/OCR, que não fazem parte do fluxo ativo desde D13. Os testes foram armazenados e executados em 29/10/2026 por pedido explícito do usuário: 70 aprovados, zero falhas, cancelamentos ou ignorados. Consulte [os comandos e resultados](docs/evidencias/entrega-03/execucoes.md). Esses resultados não comprovam o reconhecimento físico nem a integração completa do jogo. O ensaio com a webcam segue o [guia](docs/GUIA_ENSAIO.md).

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

A entrega 1 foi aprovada e registrada no commit `c9d1d7b`. Em 28/10/2026, D13 substituiu a câmera dos dados e os d20 físicos por rolagens virtuais. O laboratório da entrega 2 foi adaptado; não há dano, combate ou troca automática de turnos no laboratório. A entrega 2 foi aceita após registro de seis gestos positivos (três para cada jogador), uma sessão e cerca de 1.957 quadros; rejeição, unicidade, recuperação e métricas não foram registradas. Consulte o relatório para os limites. O motor da Entrega 3 foi implementado separadamente, teve seus cenários aplicáveis verificados automaticamente e recebeu revisão independente final sem novos achados acionáveis. A Entrega 3 foi integrada à `main` pela [PR #3](https://github.com/EndrewGomess/MageBattle2D/pull/3), no merge `0fd5b20`; a autorização está registrada em D15. Testes de partida integrada e webcam real ficam adiados por ora e serão relembrados em cada entrega 4 a 7 conforme [D15](DECISOES.md). A Entrega 4 está implementada para revisão conforme D16; Entregas 5 a 7 não iniciadas.

Atualização da Entrega 4: protótipo implementado e revisado estaticamente, com o recorte exploratório relatado pelo usuário em D17. Reconhecimento positivo, alternância/dano até vitória e exibição das opções de resultado têm observação relatada; unicidade com gesto sustentado, rejeição/ambiguidades, falha/recuperação, métricas, cliques de revanche/encerramento/menu, BFCache e testes automatizados integrados continuam pendentes. Os agentes não executaram testes ou navegador nesta entrega. Commit e PR da Entrega 4 foram autorizados explicitamente pelo usuário após revisão final do registro conforme D17; execução consultável no histórico Git e na PR correspondente, quando criada. Entregas 5–7 não iniciadas; relembrar suas pendências ao planejar e fechar cada etapa conforme D15/D17.

Cada entrega deve ser mostrada ao usuário e ter seu commit autorizado antes de ser registrado.

