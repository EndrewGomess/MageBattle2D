# Entrega 6 — validação e limites

Registro de fechamento: 02/11/2026. Branch `codex/entrega-6-fechamento`, baseada em `origin/main` após o merge `af061fa` da PR #7. A validação automatizada está registrada em `7594bb1` e o relato manual anterior em `276f0f7`. **Entrega 6 concluída no escopo planejado e aceito pelo usuário, com 81/81 testes aprovados e ensaio físico relatado positivamente.** Este fechamento preserva as limitações de método e métricas descritas abaixo; não representa medição quantitativa nem comprovação individual de todos os casos físicos.

## Alterações e método

Migrada `tests/combat.test.mjs` do dano padrão para D18. Mantidas verificações de configuração, fases/estados de origem, turnos, cópias imutáveis, índices/getters lidos uma vez e iteradores externos ignorados. A enumeração cobre todos os pares de iniciativa (400) e todos os ataques das três magias para CA 1, 12 e 19 (2.460 combinações), com cálculo esperado independente. Foram acrescentados testes de d6 e câmera única, controlador com relógio/RNG/agendador injetados, adapter de reconhecimento com worker/bitmap simulados e ligação da interface com DOM mínimo simulado. Não foi necessária alteração funcional em `dist/` nos cenários exercitados.

As entradas sintéticas são dados/classes/landmarks pré-definidos, não imagens reconhecidas pelo MediaPipe. O DOM mínimo verifica ouvintes e estados da aplicação em Node, sem renderização ou navegador. O teste `pageshow.persisted` comprova que o handler solicita recarga; não comprova entrada/saída real do BFCache. Métricas de cobertura medem execução de código e não qualidade do reconhecimento.

## Execuções e evidências

Ambiente automatizado: Windows, Node v24.22.1, JavaScript ESM, sem dependências instaladas. Os logs usam caminhos do checkout atual; navegador, webcam e condições físicas não foram obtidos para ensaio.

| Evidência | Resultado e alcance |
| --- | --- |
| [baseline.txt](evidencias/entrega-06/baseline.txt) | Suíte anterior: 70 testes, 50 aprovados e 20 falhas por contratos antigos D18 incompatíveis. |
| [testes-primeira-migracao.txt](evidencias/entrega-06/testes-primeira-migracao.txt), [testes-integracao-inicial.txt](evidencias/entrega-06/testes-integracao-inicial.txt) | Execuções intermediárias preservadas: falhas dos helpers de teste (argumento `undefined` substituído por default e relógio regressivo). Corrigidos os helpers; não eram defeitos funcionais. |
| [testes.txt](evidencias/entrega-06/testes.txt) | `node --test --test-reporter=tap tests/*.test.mjs`: 81 aprovados, zero falhas, cancelamentos ou ignorados. Inclui testes legados OCR/segmentação sem uso ativo. |
| [cobertura.txt](evidencias/entrega-06/cobertura.txt) | Nova execução 81/81 com cobertura: combat/dice 100% de linhas, ramos e funções; controlador 99,45% linhas, 90,10% ramos, 94,44% funções; adapter 100% linhas, 82,22% ramos, 88,24% funções. Não é cobertura da integração real nem do projeto inteiro. |
| [sintaxe.txt](evidencias/entrega-06/sintaxe.txt) | `node --check` em 21 arquivos JS/MJS de dist, scripts e testes; todos aprovados. |
| [http-isolado.txt](evidencias/entrega-06/http-isolado.txt) | Servidor/cliente locais na mesma sessão: 19 arquivos correspondem byte a byte ao disco; HEAD sem corpo, POST 405, inexistente 404, travessia 403, `.git` 404, no-store/nosniff. Verificação de transporte, sem renderizar jogo. |
| [http.txt](evidencias/entrega-06/http.txt), [http-final.txt](evidencias/entrega-06/http-final.txt) | Tentativas separadas bloqueadas por EACCES/ETIMEDOUT do ambiente; o ensaio isolado acima passou. Não classificadas como falha da aplicação. |

Comando de cobertura: `node --test --test-reporter=tap --experimental-test-coverage --test-coverage-include=dist/combat.js --test-coverage-include=dist/dice.js --test-coverage-include=dist/game-controller.js --test-coverage-include=dist/game-recognizer.js tests/*.test.mjs`.

## Matriz A01–A23

“Passou sintético” se restringe à camada indicada. O ensaio físico tem relato qualitativo positivo do usuário; as linhas A14, A18 e retorno pelo histórico identificam os fluxos explicitamente incluídos na pergunta respondida. Os demais resultados não recebem detalhamento físico por inferência. Testes são localizáveis pelos IDs/nome nos arquivos indicados. O aceite de fechamento da etapa considera esse conjunto de evidências, com os limites abaixo.

| ID | Status nesta rodada | Evidência e limite |
| --- | --- | --- |
| A01 | Passou sintético | combat/controller/UI: vida/CA inválidas bloqueadas; ausência de baseDamage no contrato; DOM simulado verifica botão/mensagem. |
| A02 | Passou sintético | combat: 400 pares, jogador correto; controlador inicia após confirmação. |
| A03 | Passou sintético | Empates e novo par; iniciativa parcial preservada através de suspensão/reconexão. |
| A04–A09 | Passou sintético | combat: valores exatos da especificação, dano/vida/histórico e maior/menor; controlador A04 comprova ausência de sorteio de d6. |
| A10–A11 | Passou sintético | dice/controller: quantidade de RNG e ordem ataque→dano, normal/crítico/erro e Bola sem d6 no máximo. |
| A12 | Passou sintético | controller/GestureGate: troca, ausência, intervalo e resposta velha reiniciam progresso sem RNG. |
| A13 | Parcial — laboratório diagnóstico | Gate/reset e rolagens independentes cobertos em testes; não há relato específico do botão Nova seleção do laboratório nesta rodada. Limite registrado, sem atribuir execução ao ensaio do jogo integrado. |
| A14 | Passou sintético e relato manual positivo | controller: gesto sustentado, callbacks antigos e região anterior não repetem a ação. O usuário respondeu positivamente à pergunta que incluía gesto mantido gerar apenas um ataque; sem contagem ou método informado. |
| A15–A16 | Passou sintético | Dano mínimo 2; Bola crítica nominal 52/aplicado 50, resultado e bloqueio do derrotado. |
| A17 | Passou sintético | Região inativa/central, duas mãos ativas e tokens anteriores rejeitados. Reconhecimento/rejeição físicos pendentes. |
| A18 | Passou sintético | Falha injetada em cada posição de d20/d6; preservação de resultados; reconectar não rola; retomada completa faltantes; ocultação/watchdog; adapter cancela/descarta capturas/respostas antigas. O usuário respondeu positivamente à pergunta sobre parar/reconectar a câmera, preservar o estado e exigir confirmação de retomada. Não há contagens ou resultados físicos detalhados por subcaso; callbacks antigos permanecem demonstrados sinteticamente. |
| A19 | Passou sintético | controller: limpa vida/histórico/seleção, preserva configuração/câmera disponível, nova iniciativa; preparação se recursos indisponíveis. Cliques no navegador pendentes nesta rodada. |
| A20 | Passou sintético | controller/UI: menu limpa partida e permite editar vida/CA; sem dano padrão no contrato. Navegador pendente. |
| A21 | Passou sintético | Cameras/UI com mediaDevices simulado: um fluxo players, áudio false, seleção de dispositivo, permissão negada e encerramento. Hardware real pendente. |
| A22–A23 | Passou sintético | Críticos exatos da especificação e bônus somado uma vez. |
| Retorno pelo histórico / BFCache (adicional) | Relato manual positivo do retorno; BFCache específico não confirmado | O usuário respondeu positivamente à pergunta sobre voltar pelo histórico retornar ao menu. O DOM mínimo demonstra o handler `pageshow.persisted`; não foi informado se a navegação real usou BFCache ou novo carregamento. |

## Decisão sobre o ensaio físico

Em 02/11/2026, o usuário instruiu: “Deixe o ensaio físico pendente por enquanto”. Esse foi o estado da execução automatizada. O relato manual posterior, registrado abaixo, atualiza a situação do ensaio físico. O bloqueio anterior do navegador do agente permanece como fato daquela execução.

## Bloqueios e não verificado

O coordenador tentou abrir a aplicação no navegador integrado, que retornou `net::ERR_CONNECTION_TIMED_OUT` em localhost. A alternativa via Computer Use foi interrompida por não conseguir confirmar com segurança a URL do Brave; não houve interação adicional para contornar essa restrição. Assim não houve execução desses fluxos pelos agentes nessa rodada automatizada. O primeiro relato físico posterior do usuário, registrado abaixo, ainda não especificava esses fluxos. A resposta contextualizada e o aceite de fechamento subsequentes identificam gesto sustentado, interrupção/reconexão da câmera com retomada explícita e retorno pelo histórico ao menu; ver a seção de fechamento. Os relatos anteriores do usuário em ENTREGAS 4/D18 são preservados com os limites originais.

Precisão, rejeição e latência físicas permanecem sem amostra quantitativa. Também não foram exercitados internet/modelos indisponíveis no navegador, dispositivos alternativos ou vídeo real congelado. O adiamento histórico D15/D17 não torna esses casos aprovados. Entrega 7 permanece fora desta rodada.

## Roteiro para completar o ensaio no computador-alvo

1. Registrar data, sistema, versão do navegador, modelo/resolução da webcam, iluminação/enquadramento e configuração vida/CA. Executar o servidor conforme README e abrir `/jogo.html`. Guardar versão/branch, passos, resultado e evidências por cenário; não gravar imagens pessoais sem necessidade.
2. Exercitar menu válido/inválido, permissão negada, seleção de uma webcam, conexão e confirmação; conferir que conectar não inicia rolagem antes da confirmação. Observar iniciativa e preparar valores controlados em testes, sem acrescentar entrada manual ao jogo.
3. Para cada jogador, fazer os três gestos e registrar número de tentativas, confirmações corretas, incorretas e rejeitadas e tempos observados. Incluir região inativa/central e duas mãos, gesto incompleto, mudança/ausência e sustentação durante e após a passagem do turno. Confirmar um registro por ação e nenhum reaproveitamento de resultados.
4. Encerrar/trocar câmera, ocultar/retornar aba e interromper quadros durante progresso e após resolução. Conferir vida, turno, iniciativa e histórico preservados; reconectar sem confirmar não rola; confirmação explícita retoma sem repetir dano. Cenários de resposta antiga/dado parcial têm evidência sintética acima e precisam ser identificados como tal se não puderem ser provocados fisicamente.
5. Jogar até vida zero; conferir resultado e bloqueio do derrotado. Clicar revanche, conferir vida cheia, histórico limpo, atributos/câmera preservados e nova iniciativa. Voltar ao menu e editar atributos. Fazer ida/volta pelo histórico e registrar se BFCache realmente foi usado ou houve carregamento normal; no primeiro caso, conferir reinicialização no menu.
6. Exercitar Nova seleção do laboratório (A13), registrando uma tentativa por rearmamento. Consolidar resultados, limitações e defeitos; reavaliar casos afetados após correções. Revisar antes de declarar a Entrega 6 concluída. Commit depende de autorização específica posterior.

## Revisão

A primeira revisão identificou que o DOM mínimo criava qualquer ID solicitado, mascarando a ausência de elementos no HTML. O fixture foi corrigido para carregar os IDs reais de `jogo.html`, rejeitar IDs ausentes e conferir arquivos locais referenciados. A inconsistência documental que ainda indicava a Entrega 6 como somente planejada também foi corrigida: o estado daquele momento passou a registrar validação automatizada parcial, bloqueio de navegador e adiamento físico; os relatos e o aceite posteriores estão abaixo.

Após essas alterações funcionais dos testes, o coordenador executou `node --test --test-reporter=tap tests/*.test.mjs`: exit 0, 81/81 aprovados, zero falhas, cancelamentos ou ignorados. A correção posterior de estado foi exclusivamente documental e não exigiu repetição da suíte. A revisão independente final foi concluída somente por leitura, sem defeitos funcionais acionáveis nos testes e nas alterações documentais examinadas. O revisor confirmou a correção do fixture com IDs/recursos do HTML real e a distinção entre evidência sintética, bloqueios de navegador e o estado não concluído da Entrega 6. Não executou navegador ou webcam. A revisão acima antecedeu o commit `7594bb1` e o handoff local correspondente; esta atualização do relato manual não cria novo commit nem altera esse handoff histórico.


## Relato manual posterior do usuário — registro de 02/11/2026

O usuário informou: “realizei ensaio físico, tudo funciona conforme planejado”. Isso constitui relato qualitativo positivo de ensaio real realizado pelo usuário e atualiza a situação anteriormente adiada. A data acima é a do registro; não foram informados data do ensaio, hardware, navegador, configuração, quantidade de tentativas, método, métricas ou resultados por cenário.

A automação 81/81 e os bloqueios do navegador do agente permanecem evidências próprias da execução anterior. O novo relato não é execução dos agentes nem discrimina A01–A23, BFCache ou valores quantitativos de precisão, rejeição e latência. Esse foi o alcance do primeiro relato, anterior à resposta contextualizada e ao aceite de fechamento registrados a seguir. A matriz mantém os resultados por camada efetivamente demonstrados. O roteiro permanece disponível para obter evidências específicas dos itens ainda sem detalhamento.


## Fechamento aceito pelo usuário — registro de 02/11/2026

O usuário mandou finalizar a Entrega 6. Em resposta à pergunta específica sobre gesto mantido produzir um ataque, parar/reconectar a câmera preservar o estado e exigir confirmação para retomar, e voltar pelo histórico retornar ao menu, informou: “realizei ensaio físico, tudo funcionando conforme planejado”. Registra-se relato manual qualitativo positivo desses fluxos e do funcionamento geral conforme o planejamento. O retorno ao menu pelo histórico foi relatado; o mecanismo BFCache não foi identificado pelo usuário.

A Entrega 6 fica concluída no escopo planejado e aceito, apoiada pelos 81/81 testes automatizados, verificações de sintaxe/HTTP e ensaio físico relatado pelo usuário. Permanecem limitações do registro: não foram informados data do ensaio, equipamento, navegador, configuração, método, número de tentativas ou resultados individuais de todos os testes; precisão, rejeição e latência quantitativas não foram medidas. A13 refere-se ao laboratório diagnóstico e mantém alcance parcial, sem impedir o fechamento aceito da integração do jogo. Não inferir execução física individual de todos os cenários nem confirmação do uso efetivo de BFCache.

Os bloqueios do navegador do agente pertencem à execução anterior e continuam registrados como tal. Este fechamento é documental: não houve alteração funcional ou nova execução de testes. A revisão documental do fechamento será registrada após a leitura independente; a conclusão funcional aceita pelo usuário não autoriza iniciar automaticamente a Entrega 7.
