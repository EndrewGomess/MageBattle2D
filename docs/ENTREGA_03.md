# Entrega 3 — Motor de combate determinístico

Data: 29/10/2026. Estado: motor e testes implementados; suíte completa com 70 testes aprovados e cobertura focada dos dois módulos com 40 testes aprovados, após corrigir os dois achados P2 da revisão sobre captura de entradas. A revisão independente final confirmou ambos como resolvidos e não encontrou novos achados acionáveis ou divergências nas evidências. Commit e PR deste motor testado autorizados em 29/10/2026 conforme D15, mantendo testes integrados e de webcam real adiados por ora. A execução pode ser consultada no histórico Git e na PR correspondente, quando criada.

## Artefato e limites

O [módulo de combate](../dist/combat.js) contém as regras de configuração, iniciativa, magias, dano, turnos, histórico e vitória. É um módulo ESM independente de câmera, interface, relógio e fonte aleatória, compatível com a arquitetura JavaScript do projeto. Os resultados dos dados chegam como entradas controladas; o motor não gera dados nem recebe resultados digitados por jogadores em uma interface.

O laboratório da Entrega 2 permanece com seu fluxo de gestos e rolagens. Menu, integração do gerador e webcam, arena, revanche e retorno ao menu pertencem à Entrega 4 ou seguintes. Os seis gestos positivos da Entrega 2 não comprovam os casos ainda sem evidência de rejeição, unicidade, recuperação ou métricas.

## Contrato público

| Exportação | Entrada e retorno |
| --- | --- |
| `DEFAULT_CONFIG` | Configuração congelada `{ maxHealth: 50, baseDamage: 10, armorClass: 12 }`; deve ser passada explicitamente para usar os padrões |
| `COMBAT_SPELLS` | Catálogo congelado com nome, quantidade de dados e regra de escolha; identificadores compatíveis com `dice.js` |
| `validateConfig(config)` | Retorna `{ valid, errors }`; `errors` associa os campos inválidos a mensagens em português |
| `createCombat(config)` | Valida e copia a configuração; retorna um novo estado com vida cheia e iniciativa pendente |
| `applyInitiativeRoll(state, values)` | Recebe exatamente `[d20Jogador1, d20Jogador2]` e retorna o próximo estado, preservando cada par; empate aguarda outro par |
| `resolveAction(state, action)` | Recebe `{ attacker, spell, values }` e retorna o próximo estado, incluindo uma entrada de histórico |
| `CombatError` | Erro com `code` e `errors`, além de `message`, para identificar uma operação rejeitada |

`config` exige todos os campos numéricos; omissão, vazio, texto numérico, booleano, zero, valor negativo ou fração não viram padrões. Vida e dano aceitam inteiros positivos seguros de JavaScript, até `Number.MAX_SAFE_INTEGER`, para preservar a precisão. CA aceita inteiros de 1 a 19. Campos adicionais não são copiados para a configuração do estado.

`state` deve ser um snapshot original devolvido por esta instância do módulo. Uma coleção privada `WeakSet` reconhece esses snapshots em tempo constante, antes de ler seus campos. Objetos forjados, clones e estados reconstruídos de JSON são recusados com `INVALID_STATE`; persistência e restauração de partidas não fazem parte deste contrato. Todos os snapshots retornados, seus objetos e arrays são congelados. As funções copiam a configuração e os dados recebidos, sem congelar objetos do chamador; operações seguintes não modificam snapshots anteriores. O chamador deve substituir sua referência pelo estado retornado. Entradas inválidas lançam `CombatError` antes de criar a transição e preservam o estado recebido.

| Código de erro | Condição |
| --- | --- |
| `INVALID_CONFIG` | Configuração rejeitada; `errors` identifica `config`, `maxHealth`, `baseDamage` ou `armorClass` |
| `INVALID_STATE` | Entrada que não seja um snapshot original devolvido por esta instância do módulo |
| `INVALID_PHASE` | Iniciativa fora da fase de iniciativa, ação antes do desempate ou após a vitória |
| `INVALID_VALUES` | Quantidade incorreta ou resultado que não seja inteiro de 1 a 20; `errors.values` identifica o problema |
| `INVALID_ACTION` | Ação ausente ou sem formato de objeto |
| `INVALID_ATTACKER` | Atacante diferente do jogador ativo; `errors.attacker` identifica o problema |
| `INVALID_SPELL` | Identificador fora das três magias; `errors.spell` identifica o problema |

### Estado e transições

- `config`: atributos compartilhados pelos jogadores.
- `phase`: `initiative`, `combat` ou `finished`.
- `players`: dois objetos `{ id, health }`, com identificadores 1 e 2; a vida máxima está em `config.maxHealth`.
- `initiative`: `rolls` guarda os pares na ordem recebida e `order` guarda a ordem definitiva, ou `[]` enquanto houver empate.
- `turn`: começa em 0; o desempate inicia o turno 1. Cada ação válida não fatal incrementa o turno. A ação fatal mantém o número do último turno resolvido.
- `activePlayer`: `null` durante a iniciativa e após a vitória; durante o combate, 1 ou 2.
- `winner`: `null` até a vitória, depois o identificador do vencedor.
- `history`: registros de ações resolvidas, na ordem dos turnos.

Um par empatado não altera vida, turno ou histórico de ataques. O primeiro par distinto fixa a ordem, que não muda mais nessa partida. Não é possível registrar novos pares depois disso.

| `action.spell` | Magia | `values` | Resultado | Dano no acerto |
| --- | --- | --- | --- | --- |
| `Pointing_Up` | Mísseis Mágicos | Dois d20 | Maior | `Math.floor(baseDamage / 2)` |
| `Victory` | Raio de Fogo | Um d20 | Único | `baseDamage` |
| `Open_Palm` | Bola de Fogo | Dois d20 | Menor | Dobro de `baseDamage` |

Os identificadores são strings primitivas e reaproveitam as classes do laboratório, mas o motor recebe apenas a seleção já confirmada. Valores repetidos de dois dados são válidos. Cada posição do array é lida uma vez para uma cópia própria e validada, inclusive posições ausentes em arrays incompletos; iteradores definidos pelo chamador não são consumidos. Configuração e campos da ação também são capturados uma única vez antes de validar e resolver, para que getters não mudem os valores entre as etapas. O motor calcula o escolhido, sem aceitar um resultado escolhido pelo chamador.

Acerto exige `selected > armorClass`. Igualdade erra; naturais 1 e 20 não acrescentam efeitos. O dano aplicado é limitado à vida restante do alvo, conforme o plano aprovado, e a vida nunca fica negativa. Erro ou acerto com dano zero ainda consome o turno. Se o alvo continuar vivo, ele passa a ser o jogador ativo; se chegar a zero, o motor define o vencedor e rejeita ações posteriores.

Cada entrada de `history` contém `turn`, `attacker`, `target`, `spell`, `spellName`, `values`, `selected`, `armorClass`, `hit` e `damage`. `damage` representa a vida efetivamente removida: por exemplo, Raio de Fogo contra um alvo com 5 registra dano 5, mesmo com dano padrão 10. A iniciativa mantém seu próprio registro em `initiative.rolls`.

O chamador é responsável por fornecer dados gerados corretamente e encaminhar cada seleção confirmada uma única vez ao estado atual. O motor aplica uma ação por chamada válida e rejeita o atacante inativo. Controle de seleção, respostas antigas e repetição entre quadros continua pertencendo à integração.

## Correspondência com os cenários de aceitação

Os casos abaixo foram executados com entradas controladas em `tests/combat.test.mjs` e aprovados na suíte completa registrada em [suite-completa.tap](evidencias/entrega-03/suite-completa.tap). Configuração padrão: vida 50, dano 10 e CA 12, salvo indicação. A aprovação automática é evidência dos componentes e não representa aceite do usuário ou validação física da webcam.

| Referência | Entrada / situação | Resultado esperado no motor | Situação |
| --- | --- | --- | --- |
| A01 | Vida 0, dano 1,5 ou CA 20 | Validação identifica o campo; início rejeitado | Aprovado |
| A02 | Iniciativa `[15, 8]` | Ordem `[1, 2]`, jogador 1 ativo no turno 1 | Aprovado |
| A03 | Iniciativa `[11, 11]`, depois `[8, 15]` | Guarda os dois pares; primeiro mantém a fase, segundo define ordem `[2, 1]` | Aprovado |
| A04 | Raio `[12]` | Erro, dano 0, alvo com 50; alterna jogador | Aprovado |
| A05 | Raio `[13]` | Acerto, dano 10, alvo com 40; alterna jogador | Aprovado |
| A06 | Mísseis `[7, 18]` | Escolhe 18, dano 5, alvo com 45 | Aprovado |
| A07 | Bola `[7, 18]` | Escolhe 7, erro, alvo com 50 | Aprovado |
| A08 | Bola `[13, 20]` | Escolhe 13, dano 20, alvo com 30 | Aprovado |
| A09 | Mísseis `[15, 15]` | Preserva os dois valores, escolhe 15, alvo com 45 | Aprovado |
| A15 | Dano padrão 9; Mísseis acertam | Dano 4, alvo com 46 | Aprovado |
| A16 | Alvo com 5; Raio acerta | Dano aplicado 5, vida 0, fase `finished`, vencedor definido; próxima ação rejeitada | Aprovado |
| A22 | Raio `[20]` | Dano 10, sem multiplicador adicional | Aprovado |
| A23 | Dano padrão 1; Mísseis acertam | Dano 0, alvo com 50; alterna jogador | Aprovado |
| Complementar | Configuração vazia, texto, fração, negativo ou fora da precisão inteira | Erros por campo; nenhum estado iniciado | Aprovado |
| Complementar | Jogador 2 vence iniciativa; erro e dano zero em turnos seguintes | Ordem inicial preservada, alternância e histórico correspondem às ações | Aprovado |
| Complementar | Dados ausentes, excedentes, fracionários, texto, 0 ou 21; magia desconhecida ou atacante inativo | Operação rejeitada; estado e histórico recebidos preservados | Aprovado |
| Complementar | Comparar snapshots anteriores e entradas após uma transição | Configuração e arrays de entrada preservados; snapshots anteriores não alterados | Aprovado |

A10/A11 foram verificados no gerador com fonte injetada: um ou dois d20 conforme a magia, uma chamada por dado, maior/menor e valores repetidos preservados. Os testes controlam a sequência e a contagem de chamadas; não constituem teste estatístico de `Math.random`. A14/A17 têm cobertura parcial para uma resolução por chamada, bloqueio do atacante inativo e confirmação única do `GestureGate` em observações sintéticas; unicidade da seleção no aplicativo e resultados assíncronos antigos exigem integração. A12 tem evidência sintética de reinício do progresso por mudança, ausência e intervalo excessivo; A13/A18–A21 e validação física permanecem pendentes nas entregas correspondentes.

## Testes armazenados e execuções

Após a implementação inicial, que recebeu revisão estática sem achados e não executou testes, o usuário autorizou explicitamente criar, armazenar e executar os testes. A ampliação acrescenta `tests/combat.test.mjs` e `tests/dice.test.mjs`, corrige a fixture espelhada em `tests/capture.test.mjs` e reforça as entradas do motor e do gerador. A [memória das execuções](evidencias/entrega-03/execucoes.md) registra baseline, comandos, correções e evidências. Ambiente: Windows/PowerShell e Node.js `v24.22.1`; os comandos usam Node diretamente, sem dependências adicionais.

| Execução | Resultado observado | Evidência |
| --- | --- | --- |
| Baseline do coordenador, antes da ampliação | 26 testes: 25 aprovados e 1 falha na fixture antiga de espelhamento | Diagnóstico e correção descritos na memória das execuções |
| Primeira execução dos novos testes focados | 46 testes: 44 aprovados e 2 falhas no helper que substituía `undefined` por defaults; helper corrigido | Diagnóstico descrito na memória das execuções |
| Checkpoint focado após correção do helper | 46/46 aprovados, antes dos três testes adicionais finais | [focados.tap](evidencias/entrega-03/focados.tap) |
| Checkpoint antes dos achados da revisão | 62/62 na suíte completa e 32/32 no foco; cobertura de 100% não revelou os casos depois encontrados | [validacao-antes-revisao.tap](evidencias/entrega-03/validacao-antes-revisao.tap), [cobertura-antes-revisao.tap](evidencias/entrega-03/cobertura-antes-revisao.tap) |
| Oito regressões P2 antes e após correção | Antes: 8 falhas em 8; depois: 8/8 aprovados | [p2-antes-correcao.tap](evidencias/entrega-03/p2-antes-correcao.tap), [p2-apos-correcao.tap](evidencias/entrega-03/p2-apos-correcao.tap) |
| Suíte completa final do implementador | 70/70 aprovados, zero falhas/cancelamentos/ignorados | [suite-completa.tap](evidencias/entrega-03/suite-completa.tap) |
| Cobertura focada do motor e gerador | 40/40 aprovados; ambos com 100% de linhas, ramos e funções na medição V8/Node | [cobertura.tap](evidencias/entrega-03/cobertura.tap) |
| Validação final independente do coordenador, após correções P2 | 70/70 aprovados, zero falhas/cancelamentos/ignorados; 100% de linhas, ramos e funções em ambos os módulos focados | [validacao-final.tap](evidencias/entrega-03/validacao-final.tap) |
| Sintaxe de todos os arquivos JS/MJS em dist, scripts e tests | 15/15 aprovados com `node --check` | [sintaxe-final.txt](evidencias/entrega-03/sintaxe-final.txt) |

As contagens de testes são as reportadas pelo Node. As matrizes internas exercitam 400 pares de iniciativa, 380 combinações de face/CA normal, 15.200 combinações de dois dados/CA, 105 combinações extremas comparadas com oráculo `BigInt` e 800 pares do gerador. Também há 12 partidas determinísticas limitadas a 150 ações cada, 250 empates antes do desempate, 250 acertos de dano zero e 100 erros consecutivos. Os laços internos não são contados como milhares de testes separados.

A revisão independente identificou dois problemas P2 que não eram exercitados pela cobertura de 100%: arrays podiam validar os índices e depois substituir dados por iterador, e getters podiam alterar configuração ou ação entre validação e uso. Os oito testes novos reproduziram as falhas antes da correção e passaram depois da captura única dos campos e índices. Iteradores que lançam também foram usados como prova de que não são chamados; nenhum iterador infinito foi executado. O [registro das execuções](evidencias/entrega-03/execucoes.md) detalha o diagnóstico e a correção.

A nova revisão independente foi realizada somente por leitura e confirmou a captura única de configuração, ação e dados, a resolução dos dois P2 e a cobertura das regressões. Não encontrou novos achados acionáveis nem divergências nos registros de execução. Essa revisão não executou testes adicionais nem substitui o aceite do usuário.

A cobertura medida não prova ausência de todos os defeitos. Os testes verificam sequências finitas e não impõem uma vitória artificial em partidas que só erram ou causam dano zero. O histórico e os pares de iniciativa crescem conforme a partida; não foi imposto limite de turnos, truncagem ou persistência.

## Concluído e pendente

| Item | Situação |
| --- | --- |
| Motor, API, histórico, turnos e vitória | Implementados e cobertos pelos testes automatizados descritos |
| Configuração, entradas, estados forjados e imutabilidade | Testados; erros controlados e snapshots/entradas preservados, incluindo regressões de iteradores e getters |
| Gerador virtual e quantidade de chamadas | Testados com RNG injetado e `Math.random` controlado; gestos inválidos/chaves herdadas e RNG não função têm rejeição explícita |
| Regressão de espelhamento e confirmação temporal | Fixtures sintéticas aprovadas; produto mantém a conversão de D14 |
| Revisão independente das correções P2 | Concluída por leitura; dois achados resolvidos, sem novos problemas acionáveis ou divergências nas evidências |
| Decisão do usuário sobre o motor testado | Commit e PR autorizados explicitamente em 29/10/2026 com as pendências de D15 |
| Commit e PR da entrega 3 | Autorizados em 29/10/2026 conforme D15; execução consultável no histórico Git e na PR correspondente, quando criada |
| Integração com menu, webcam, arena, recuperação, revanche e retorno ao menu | Entrega 4 e posteriores não iniciadas; testes de partida integrada adiados por decisão explícita, incluindo unicidade no aplicativo e descarte de respostas antigas |
| Ensaio físico de rejeição, unicidade, recuperação e métricas da webcam | Adiado por decisão explícita; os testes sintéticos não fornecem essa evidência |

As limitações físicas da Entrega 2 permanecem registradas em [ENTREGA_02.md](ENTREGA_02.md). As Entregas 4 a 7 não foram iniciadas. Na implementação inicial, o coordenador também executou `git diff --check` sem erros de whitespace, com apenas avisos LF/CRLF; isso não substitui testes de comportamento.

O adiamento e a autorização de registro estão em [D15](../DECISOES.md). Em cada próxima entrega 4 a 7, o coordenador deve relembrar ao usuário, antes de planejar e fechar a etapa, os testes de partida integrada e webcam real ainda pendentes; o planejamento contém o lembrete persistente. Esta autorização não libera essas próximas entregas nem declara os testes executados.
