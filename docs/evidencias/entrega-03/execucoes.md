# Execuções da Entrega 3 — 29/10/2026

Ambiente observado: Windows, PowerShell, Node.js `v24.22.1`. `npm` não estava no PATH no levantamento do coordenador; não houve instalação de ferramentas ou dependências. Os testes usam `node:test` e `node:assert/strict`.

## Diagnósticos preservados

1. O coordenador executou o baseline `node --test tests/*.test.mjs`: 26 testes, 25 aprovados e uma falha em `tests/capture.test.mjs:63`. A fixture dizia que inferência `x = 0,8` era inativa para o jogador 1, mas a regra D14 aplica `previewX = 1 - x`, posicionando-a à esquerda e na região ativa desse jogador. Corrigiu-se a fixture e acrescentou-se simetria para ambos jogadores, centro/fronteiras, mãos atravessando a faixa, ambiguidades e limiares; a conversão do produto não foi alterada.
2. Na primeira execução focada do implementador, 46 testes rodaram, com 44 aprovados e duas falhas `Missing expected exception` nos testes “ação ausente, jogador incorreto e magia inválida...” e “quantidade, tipo e faixa...”. O helper `action()` substituía argumentos `undefined` por defaults e gerava entradas válidas. Os testes passaram a montar diretamente os objetos inválidos para preservar o valor `undefined`. As duas falhas eram na preparação do teste, não no comportamento do motor. A execução seguinte passou 46/46; seu TAP está armazenado.
3. A leitura e os testes justificaram duas proteções pequenas: o motor recusa estados que não foram emitidos pelo próprio módulo com `CombatError/INVALID_STATE`, sem percorrer árvores externas; o gerador exige identificador de gesto como string própria conhecida e RNG como função, evitando falhas incidentais por chaves herdadas ou tipo inválido.
4. Depois do checkpoint de 62 testes e cobertura de 100%, o revisor encontrou e reproduziu dois achados P2. Primeiro, `requireDice` validava índices, mas a cópia posterior com spread usava um iterador externo: `[13]` podia produzir `[0]` para a resolução, e `[15, 8]` podia registrar `[21, -1]` para iniciativa. Segundo, configuração e ação eram relidas após validar, permitindo que getters mudassem vida, atacante, magia ou dados. Na configuração reproduzida, a terceira leitura de vida retornava zero e gerava um snapshot com ambos mortos. Os comandos pontuais do revisor não tiveram log bruto salvo; os oito testes persistentes de regressão posteriores foram executados antes da correção e falharam 8/8, conforme [p2-antes-correcao.tap](p2-antes-correcao.tap).
5. A correção captura os campos de configuração/ação uma única vez e lê exatamente a quantidade esperada de índices para um array próprio, validando e usando essa mesma cópia em iniciativa e resolução. Não consome iteradores externos. As oito regressões passaram 8/8 após a correção, incluindo iteradores que substituem dados, iteradores que lançam e contadores de leitura de getters, sem executar iteradores infinitos: [p2-apos-correcao.tap](p2-apos-correcao.tap).

Os diagnósticos 1 e 2 acima transcrevem os resultados observados durante a rodada. O log bruto do baseline e da primeira falha focada não foi salvo; os TAPs posteriores preservam as execuções aprovadas efetivamente realizadas.

Antes de substituir as evidências finais após os P2, o checkpoint anterior foi preservado em [validacao-antes-revisao.tap](validacao-antes-revisao.tap), [suite-antes-revisao.tap](suite-antes-revisao.tap) e [cobertura-antes-revisao.tap](cobertura-antes-revisao.tap). Esses arquivos registram os 62 testes completos/32 focados e mostram por que cobertura de 100% não dispensou a revisão de entradas ainda não exercitadas.

## Comandos e resultados armazenados

Os comandos abaixo foram executados a partir da raiz do projeto. Em PowerShell, o diretório de evidências foi criado previamente com `New-Item -ItemType Directory -Force -Path docs/evidencias/entrega-03`. O código de saída observado foi zero em cada execução aprovada abaixo.

```powershell
node --test --test-reporter=tap --test-reporter-destination=docs/evidencias/entrega-03/focados.tap tests/combat.test.mjs tests/dice.test.mjs tests/capture.test.mjs
```

Checkpoint: 46 testes, 46 aprovados, zero falhas/cancelamentos/ignorados; executado antes de acrescentar os testes de 250 empates, 250 acertos de dano zero e fonte padrão controlada. Evidência: [focados.tap](focados.tap).

```powershell
node --test --test-reporter=tap --test-reporter-destination=docs/evidencias/entrega-03/suite-completa.tap tests/*.test.mjs
```

Execução final do implementador, após correções P2: 70 testes, 70 aprovados, zero falhas/cancelamentos/ignorados. Inclui 30 testes do motor, 10 do gerador, 17 em capture e os 13 testes já existentes de câmeras/segmentação. Evidência: [suite-completa.tap](suite-completa.tap).

```powershell
node --test --experimental-test-coverage --test-coverage-include=dist/combat.js --test-coverage-include=dist/dice.js --test-reporter=tap --test-reporter-destination=docs/evidencias/entrega-03/cobertura.tap tests/combat.test.mjs tests/dice.test.mjs
```

Execução final do implementador, após correções P2: 40 testes, 40 aprovados, zero falhas/cancelamentos/ignorados. Medição V8/Node: `dist/combat.js` e `dist/dice.js`, cada um com 100% de linhas, ramos e funções. Evidência: [cobertura.tap](cobertura.tap). Não se infere cobertura dos módulos legados nem ausência universal de defeitos a partir dessa medição.

As regressões foram executadas antes e após a correção, trocando somente o destino de relatório:

```powershell
node --test --test-name-pattern=P2 --test-reporter=tap --test-reporter-destination=docs/evidencias/entrega-03/p2-antes-correcao.tap tests/combat.test.mjs
node --test --test-name-pattern=P2 --test-reporter=tap --test-reporter-destination=docs/evidencias/entrega-03/p2-apos-correcao.tap tests/combat.test.mjs
```

Primeira execução: código de saída 1, oito falhas. Segunda: código de saída 0, oito aprovações. Nenhum caso foi removido para ocultar as falhas.

## Validação final do coordenador

Após a conclusão do código e dos testes, o coordenador executou a suíte completa com cobertura e timeout por teste, sem modificar esses arquivos:

```powershell
node --test --test-timeout=30000 --experimental-test-coverage --test-coverage-include=dist/combat.js --test-coverage-include=dist/dice.js --test-reporter=spec --test-reporter=tap --test-reporter-destination=stdout --test-reporter-destination=docs/evidencias/entrega-03/validacao-final.tap tests/*.test.mjs
```

Resultado após correções P2: 70 testes aprovados, zero falhas/cancelamentos/ignorados/todo; `combat.js` e `dice.js` com 100% de linhas, ramos e funções. Evidência: [validacao-final.tap](validacao-final.tap).

O coordenador também aplicou `node --check <arquivo>` a todos os 15 arquivos JavaScript/MJS de `dist`, `scripts` e `tests`: 15 aprovados, sem erro de sintaxe. Evidência: [sintaxe-final.txt](sintaxe-final.txt). A validação automática do coordenador é independente da execução do implementador.

## Revisão independente final

Após as correções e execuções finais, o revisor conferiu somente por leitura a implementação, os oito testes de regressão e as evidências. Confirmou os dois P2 como resolvidos: configuração, ação e dados são capturados uma vez. Não encontrou novos achados acionáveis nem divergências nos registros. Não executou testes adicionais. A revisão independente desta rodada está concluída.

Em 29/10/2026, após esses resultados, o usuário autorizou criar o commit e abrir a PR da entrega 3 para o motor testado, mantendo testes de partida integrada e webcam real adiados por ora conforme D15. A execução pode ser consultada no histórico Git e na PR correspondente, quando criada. O lembrete para cada entrega 4 a 7 está registrado em D15; esta atualização documental não acrescentou resultados de teste.

## Limites da evidência

- Não houve ensaio físico de webcam ou teste de navegador nesta ampliação. Gestos são fixtures sintéticas.
- A contagem de chamadas do RNG foi verificada com funções controladas; não houve teste estatístico da distribuição de `Math.random`.
- As sequências são finitas e não são benchmarks. Não há limite artificial de duração da partida nem garantia de término quando ações apenas erram ou causam zero dano.
- Commit e PR autorizados em 29/10/2026 conforme D15; a execução pode ser consultada no histórico Git e na PR correspondente, quando criada. A revisão independente das correções P2 foi concluída. Testes de partida integrada e webcam real foram adiados por decisão explícita, devendo ser relembrados em cada entrega 4 a 7.
