# Entrega 2 — Resultado do ensaio e aceite

Atualização: 29/10/2026. **Status: concluída e aceita no escopo vigente de D13/D14**, com limitações documentadas abaixo. O aceite cobre a demonstração observada de seleção por gesto para os dois jogadores e geração de dados virtuais; não representa precisão estatística ou aprovação de cenários que não foram registrados.

## Evidência recebida

O relatório `ensaio-duelo-2026-10-29T17-32-45.359Z` registra uma sessão de webcam, aproximadamente **1.957 novos quadros** e seis gestos aprovados pelo operador: indicador, V e mão aberta para cada jogador. A sessão usou prévia espelhada e limiares D14: Open_Palm 0,60; Pointing_Up e Victory 0,75. Os d20 são gerados pelo software.

O JSON não contém registros de rejeição da região inativa, faixa central ou duas mãos; manutenção após confirmação para verificar unicidade; falha e recuperação; nem medições agregadas de precisão, rejeição ou latência. Esses comportamentos não são declarados aprovados com base neste relatório.

## Escopo entregue

- Laboratório de uma webcam para os dois jogadores, com prévia espelhada e seleção por região alinhada à imagem exibida.
- Três gestos associados às magias, com limiares por classe e confirmação temporal.
- Uma rolagem virtual por seleção confirmada: 1d20 para Raio de Fogo; 2d20 e maior para Mísseis Mágicos; 2d20 e menor para Bola de Fogo.
- Exportação JSON com sessão, quadros observados, escores por classe, rolagens e avaliações do operador.

A entrega 2 não inclui motor de combate, dano, iniciativa ou troca automática de turno. A entrega 3 pode começar conforme o planejamento; as limitações deste ensaio devem permanecer visíveis durante a integração da câmera.

## Verificações e limites

Não foram adicionados nem executados testes nesta alteração documental. Os aproximadamente 1.957 quadros são contagem da sessão, não uma métrica de acurácia. Os seis registros aprovados sustentam os gestos positivos descritos; ausências de registros para rejeição, unicidade e recuperação significam que esses casos continuam sem evidência.

O ensaio antigo de duas webcams e d20 físicos foi removido do escopo por D13 e não valida o fluxo atual. O [guia](GUIA_ENSAIO.md) permanece disponível para registrar ensaios adicionais e cobrir as limitações acima.

O conjunto desta entrega deve ser mostrado ao usuário para revisão. O commit permanece aguardando autorização explícita.
## Histórico anterior a D13

O material abaixo preserva observações e relatos anteriores da investigação de duas câmeras/d20 físicos. Não é evidência de execução ou aprovação da versão atual. Naquele registro histórico, anterior ao ensaio de 29/10/2026, o ensaio real dos gestos ainda estava pendente. As pendências relativas a dados físicos foram retiradas do escopo vigente por D13.
# Entrega 2 — Resultados do ensaio técnico

Data: 27/10/2026. Situação: protótipo implementado e verificações de software executadas; ensaio físico e aceite da entrega pendentes. Commit ainda não autorizado.

## Artefatos preparados

- Laboratório local em `dist/`: duas prévias, seleção de dispositivos distintos, resolução por câmera, tratamento de falhas, modos de diagnóstico, reconhecimento dos três gestos e seleção por região ativa.
- Ciclo de captura: área vazia, contagem exata de componentes, estabilidade, rejeição de movimento/obstrução, descarte de resultado atrasado e consumo único de amostra candidata.
- OCR de d20: recorte central experimental e face triangular marcada para investigação assistida; ambos identificados como não liberados para combate.
- Registro local de observações, valores reais, candidatos, escores, tempo de leitura, método, origem da imagem e exportação JSON.
- [Guia de posicionamento e execução do ensaio](GUIA_ENSAIO.md), testes automatizados e instruções no [README](../README.md).

## Evidências já observadas

| Verificação | Resultado observado | Limite da evidência |
| --- | --- | --- |
| Runtime local | Node.js v24.22.1 disponível | Pré-requisito de execução, não reconhecimento |
| Servidor local | Resposta HTTP 200 em `http://127.0.0.1:4173/` | Confirma acesso ao laboratório |
| Interface | Página carregada e controles inspecionados no navegador integrado | Fluxo físico ainda precisa ser exercitado |
| Carregamento dos modelos | Interface exibiu **Gestos: pronto · OCR: pronto** | Inicialização; nenhuma precisão física inferida |
| Testes de software | 26 testes passaram na revisão de 28/10/2026; módulos JavaScript passaram na verificação de sintaxe | Observações controladas, sem comprovação de precisão física |
| Dependências | MediaPipe Tasks Vision 0.10.21 e Tesseract.js 7.0.0 fixados | Arquivos externos exigem internet no carregamento |
| Inventário inicial do Windows | Uma câmera listada: Integrated Webcam | Fotografia do momento; não substitui a lista do navegador após conectar e autorizar as duas webcams |
| Disponibilidade informada pelo usuário | Duas webcams e dois d20 disponíveis | Ensaio com as prévias ainda pendente |
| Acesso às câmeras | Solicitação iniciada no laboratório | Aguardando permissão do usuário no navegador |

O carregamento inicialmente falhou com MediaPipe 1.1.1 e com o uso de exportações nomeadas no módulo ESM do Tesseract. A revisão fixou MediaPipe 0.10.21, usou worker clássico compatível com o carregador WASM e a exportação padrão do Tesseract. A inicialização dos dois reconhecedores foi então observada no navegador.

Os 26 testes automatizados usam observações e componentes sintéticos para verificar bloqueios de estado e recursos, incluindo falta ou excesso de dados, caixa duplicada, captura antiga, OCR atrasado, conflito 6/9, região inativa, encerramento de fluxos e falsos objetos causados por ruído ou mudanças globais de iluminação. Eles não demonstram leitura de um d20 real.

## Ensaios físicos ainda necessários

| Evidência requerida | Estado |
| --- | --- |
| Dois fluxos de dispositivos distintos simultâneos, com resolução e novos quadros registrados | Pendente |
| Três gestos reconhecidos para cada jogador e rejeição da região inativa | Pendente |
| Faces superiores de 1 a 20 reconhecidas e comparadas com valores reais | Pendente |
| Dois d20 distintos com valores diferentes e iguais | Pendente |
| Movimento, mão, sobreposição, iluminação e faces laterais | Pendente |
| Falha e reconexão durante uma captura real | Pendente |
| Métricas físicas de acurácia, rejeição e latência | Sem medição |

## Decisão sobre a abordagem

**Gestos:** MediaPipe Gesture Recognizer foi escolhido para o ensaio porque o modelo já contém as classes `Pointing_Up`, `Victory` e `Open_Palm`. O aplicativo acrescenta região por jogador e confirmação temporal. A adequação ao enquadramento e às mãos dos jogadores permanece a validar. [Guia oficial do MediaPipe](https://developers.google.com/edge/mediapipe/solutions/vision/gesture_recognizer).

**Dados:** diferença de fundo conta componentes; OCR extrai candidatos numéricos dos recortes. Esta combinação é uma hipótese experimental. Ainda não há evidência de que o recorte central isole a face superior, e a segmentação não distingue todo objeto de um d20. O OCR assistido ajuda a separar falhas de localização da face e de reconhecimento do número. [API oficial do Tesseract.js](https://github.com/naptha/tesseract.js/blob/master/docs/api.md).

**Decisão para a integração:** manter a integração do reconhecimento dos dados bloqueada até observar os casos físicos. Candidatos experimentais têm `validatedForCombat: false`. Nenhuma câmera ou leitura incompleta aplica dano, e nenhum resultado de dado é gerado aleatoriamente pelo laboratório.

Se a abordagem central falhar, a alternativa técnica é avaliar um detector específico da face superior seguido de reconhecimento/classificação de 1 a 20, com amostras reais do enquadramento e dados usados. Isso exige coletar e rotular imagens e medir resultados; não há dataset nem modelo próprio treinado nesta entrega. A arquitetura sem backend permanece condicionada a esse resultado. Uma alternativa que mude a interação do jogo volta para revisão do usuário.

As duas câmeras usam `deviceId: { exact: ... }` e a captura não solicita áudio. O navegador só expõe os dispositivos disponíveis e autorizados; duas entradas na lista não comprovam abertura simultânea. [getUserMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia), [enumerateDevices](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/enumerateDevices).

## Fechamento e commit

Revisão de 28/10/2026: o usuário relatou objetos inexistentes na mesa branca vazia. A revisão elevou os requisitos de contraste, área, dimensões e preenchimento dos componentes, reforçou a limpeza de ruído e adicionou compensação de exposição/balanço de branco global. Mudança extrema de iluminação passa a exigir nova calibração. O efeito sobre as imagens da bancada ainda precisa ser conferido pelo usuário após recarregar e calibrar o fundo vazio.

O protótipo está disponível para o ensaio físico descrito no guia. O aceite da entrega depende das evidências acima ou do registro de uma limitação técnica observada e sua alternativa, conforme o planejamento.

O resultado deve ser mostrado ao usuário antes de solicitar autorização para o commit `feat: adicionar laboratorio de visao da entrega 2`. A autorização da entrega 1 não autoriza este commit.

