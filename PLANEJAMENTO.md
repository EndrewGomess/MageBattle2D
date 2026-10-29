# Planejamento — Duelo de Magos

Data: 27/10/2026. Status: entrega 1 aprovada e concluída; commit autorizado pelo usuário; implementação ainda não iniciada.

Artefatos da entrega 1: [especificação do jogo](ESPECIFICACAO.md) e [registro de decisões](DECISOES.md). A versão 1.1 e as decisões D01 a D12 foram aprovadas pelo usuário, incluindo o arredondamento da metade do dano para baixo. A validação técnica das câmeras e do reconhecimento pertence à entrega 2.

## 1. Objetivo e primeira versão

Criar um jogo de combate 1v1 por turnos, inspirado em RPG de mesa, com dois jogadores humanos no mesmo dispositivo. A proposta inicial é um jogo 2D no navegador, em português, com menu, arena e resultado da partida.

Cada jogador controla um mago. O jogador 1 usa roupas pretas e o jogador 2 usa roupas brancas. Nomes, rótulos e indicação de turno complementam as cores para facilitar a identificação.

O primeiro escopo contém configuração de atributos, iniciativa, três ataques selecionados por gestos diante da câmera, leitura de dados físicos para os resultados, histórico de combate, vitória, revanche e retorno ao menu. Multiplayer pela internet, adversário automático, outras classes, mana, equipamentos e progressão ficam para possíveis versões futuras.

A visão computacional participa de duas etapas da jogabilidade: reconhecer o gesto que seleciona a magia e reconhecer a quantidade e os valores dos dados físicos lançados. Detectar apenas a presença do dado não basta para resolver um ataque.

O equipamento previsto é composto por duas webcams conectadas ao mesmo computador: uma voltada para os jogadores, destinada aos gestos, e outra dedicada à área de rolagem dos dados. Cada função recebe um fluxo de vídeo independente.

## 2. Regras consolidadas

### Menu

| Configuração | Valor inicial | Comportamento |
| --- | --- | --- |
| Vida máxima | 50 | Ajustável; mesmo valor para os dois jogadores |
| Dano padrão | 10 | Ajustável; mesmo valor para os dois jogadores |
| Classe de armadura (CA) | 12 | Ajustável; mesmo valor para os dois jogadores |

Vida e dano aceitam inteiros positivos. Faixa aprovada da CA: 1 a 19, para sempre existir possibilidade de acerto com a comparação estrita solicitada. O menu deve explicar essa comparação e exibir os danos derivados antes do início da partida. Configurações inválidas impedem o início e recebem uma mensagem clara.

### Iniciativa e turnos

1. Ao iniciar, cada jogador rola 1d20 físico de iniciativa, um jogador por vez, começando pelo jogador 1.
2. O maior resultado começa. Em empate, ambos rolam novamente até desempatar.
3. A ordem permanece fixa durante a partida.
4. O jogador ativo faz o gesto da magia diante da câmera e, após a seleção ser confirmada, lança os dados físicos exigidos. O jogo lê e valida a rolagem antes de resolver o ataque.
5. Um erro também consome o turno.
6. Após resolver a ação, o jogo verifica a vitória antes de passar o turno.
7. Ao atingir zero de vida, o jogador é derrotado imediatamente e não realiza outra ação.

### Ataques

O vínculo entre vantagem/desvantagem e as magias abaixo foi aprovado na entrega 1.

| Ataque | Magia | Dados | Resultado usado | Dano se acertar | Dano padrão 10 |
| --- | --- | --- | --- | --- | --- |
| Fraco, com vantagem | Mísseis Mágicos | 2d20 | Maior valor | Dano padrão / 2, arredondado para baixo | 5 |
| Normal | Raio de Fogo | 1d20 | Único valor | Dano padrão | 10 |
| Crítico, com desvantagem | Bola de Fogo | 2d20 | Menor valor | Dano padrão × 2 | 20 |

Acerto: resultado escolhido > CA do alvo. Um resultado igual à CA erra. Um erro causa zero dano. Não haverá modificadores adicionais de ataque na primeira versão.

Exemplo: contra CA 12, rolar 12 erra e rolar 13 acerta. Com dados 7 e 18, Mísseis Mágicos usa 18 e Bola de Fogo usa 7.

Regras complementares aprovadas:

- “Crítico” identifica a opção de dano dobrado. Tirar 20 não acrescenta outro multiplicador.
- Valores naturais 1 e 20 seguem a mesma comparação de acerto, sem efeitos extras.
- A vida exibida nunca fica abaixo de zero.
- Todas as magias podem ser repetidas em qualquer turno, sem custo ou recarga.
- Mísseis Mágicos segue uma única resolução de ataque e o dano indicado na tabela.

Regra de dano definida pelo usuário: a metade do dano padrão é sempre arredondada para baixo. Dano padrão 9 resulta em 4 para Mísseis Mágicos; dano padrão 1 resulta em 0. O cálculo é `piso(dano padrão / 2)`.

Estas são as regras próprias do jogo proposto; os nomes das magias não acrescentam efeitos de outros sistemas.

### Gestos e dados físicos

Requisitos definidos pelo usuário:

- Primeiro o jogador seleciona a magia por gesto diante da câmera; depois lança o dado físico para determinar o resultado.
- Ataque normal exige um d20 físico com resultado reconhecido.
- Ataques com vantagem ou desvantagem só podem ser resolvidos depois que os dois dados físicos forem lançados e seus resultados reconhecidos. Reconhecer apenas um dado não valida o ataque.
- Vantagem usa o maior dos dois valores; desvantagem usa o menor. O critério de acerto e os danos permanecem os definidos acima.
- Usar duas webcams: uma para os jogadores/gestos e outra para os dados físicos.

### Preparação das duas webcams

- Exibir dois seletores no menu: “Câmera dos jogadores” e “Câmera dos dados”, com prévias independentes, impedindo atribuir o mesmo dispositivo às duas funções.
- Posicionar a câmera dos jogadores de frente, com as mãos visíveis. Delimitar uma região para cada jogador e aceitar gestos apenas na região correspondente ao turno ativo; a confiabilidade dessa separação deve ser validada no ensaio.
- Posicionar a câmera dos dados acima da área de rolagem, apontando para baixo, em suporte fixo. Ajustar distância, foco e iluminação até que os números da face superior dos d20 estejam legíveis. Essa posição facilita o enquadramento, mas não substitui a validação do reconhecimento.
- Manter as duas prévias disponíveis e executar o reconhecimento necessário à fase: gestos na seleção da magia; dados após a confirmação. Não é necessária sincronização precisa entre os vídeos, pois essas ações acontecem em sequência.
- Validar a abertura simultânea dos dois dispositivos no computador/navegador de destino antes de fechar a configuração. Se uma câmera falhar ou desconectar, suspender a captura da ação e solicitar reconexão, sem aplicar dano nem passar o turno automaticamente. Uma rolagem interrompida deve ser rearmada com a área vazia para evitar resultados antigos.

Referência técnica: o navegador pode listar os dispositivos com [enumerateDevices](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/enumerateDevices) e solicitar cada câmera pelo seu identificador com [getUserMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia). O acesso exige permissão do usuário e contexto seguro (HTTPS ou localhost no desenvolvimento). A disponibilidade simultânea depende também do hardware, dos drivers e dos recursos disponíveis no computador.

Interações da primeira versão aprovadas pelo usuário, com viabilidade técnica a validar na entrega 2:

- Mapear indicador levantado para Mísseis Mágicos, sinal de V para Raio de Fogo e mão aberta para Bola de Fogo. Confirmar a seleção após manter o gesto por cerca de um segundo, com indicação visual do progresso.
- Travar a magia depois da confirmação, enquanto o jogador lança os dados. Gestos observados durante a leitura dos dados não selecionam outro ataque.
- Usar uma área de rolagem delimitada e exigir que esteja vazia antes de armar cada nova captura. A captura só fica habilitada após a confirmação da magia, evitando reaproveitar dados do turno anterior.
- Para vantagem e desvantagem, lançar os dois dados juntos e mantê-los visíveis na mesma área de captura. Rolagens sequenciais ficam fora desta versão.
- Só aceitar a quantidade exata de dados exigida e todos os resultados legíveis e estáveis, com as mãos fora da área. Dois dados com o mesmo valor são válidos: a contagem deve distinguir os objetos físicos, sem exigir valores diferentes.
- Com um dado ausente, em movimento, sobreposto ou com resultado ilegível, exibir o motivo e continuar aguardando a regularização da leitura. Uma leitura incompleta não aplica dano nem consome o turno; um ataque validado que erra consome o turno normalmente.
- Consumir cada captura válida uma única vez. Exigir uma nova seleção e uma nova rolagem no próximo turno.

Ponto técnico a validar antes de fechar a implementação: identificar a face superior de d20 reais, distinguindo seus números das faces laterais, em uma posição de câmera adequada. Proposta de ensaio: dois d20 com números contrastantes, superfície fosca e iluminação uniforme. O ensaio deve verificar valores de 1 a 20, dois dados de mesmo valor, movimento e oclusão. A escolha do método de leitura fica pendente desse ensaio; não há reconhecimento implementado ou desempenho medido.

## 3. Telas e experiência

Menu: título, explicação curta, campos de vida/dano/CA, prévia dos três danos e botão Iniciar combate. Incluir seleção e preparação das duas webcams e da área de rolagem, com instruções sobre os gestos e a quantidade de dados físicos necessária.

Iniciativa: mostrar os dois resultados, eventuais empates e quem começa. Essa apresentação pode aparecer sobre a arena.

Arena: mago preto à esquerda e mago branco à direita; vida atual/máxima, barras de vida, CA e destaque do jogador ativo. Três cartões explicam gesto, magia, tipo de rolagem e dano. Duas prévias identificadas mostram os jogadores e a área dos dados, com destaque para a etapa ativa. A prévia dos jogadores indica o gesto reconhecido e a magia confirmada; a dos dados indica quantidade esperada/detectada e valores lidos. A interface distingue claramente “Faça o gesto”, “Lance 1 dado”, “Lance 2 dados” e “Aguardando leitura válida”. A resolução exibe todos os valores físicos reconhecidos, destaca o selecionado, informa acerto ou erro e atualiza a vida. O histórico registra atacante, magia, dados, resultado, CA e dano.

Durante a resolução, bloquear novas ações para impedir ataques duplicados. Usar efeitos curtos para cada magia e permitir reduzir movimento. Garantir contraste das roupas com o cenário e operação por teclado nos menus e controles auxiliares. O fluxo principal de combate depende da câmera; uma eventual alternativa de entrada manual precisa ser definida separadamente e identificada como tal.

Resultado: mostrar vencedor e oferecer Revanche, que reinicia vida e iniciativa com as mesmas configurações, ou Voltar ao menu, que permite editar os valores.

## 4. Tecnologia e skills

Direção técnica aprovada: HTML, CSS e JavaScript em módulos, com estado da partida no navegador. Validar a viabilidade de executar reconhecimento de gestos e leitura dos dados no navegador antes de confirmar a arquitetura sem backend. A primeira versão pode usar personagens em SVG/CSS, com efeitos visuais simples e sem imagens externas.

Captura: abrir dois fluxos de vídeo com identificadores de dispositivos distintos, sem solicitar áudio. Separar a configuração de resolução/frequência de cada câmera e ajustar conforme os testes de legibilidade e desempenho. Liberar os fluxos ao encerrar a sessão de câmera ou trocar de dispositivo. Incluir seleção incorreta, permissão negada, indisponibilidade de hardware e desconexão no tratamento de falhas.

Separar regras puras de combate da interface e dos módulos de visão computacional. Centralizar configuração, jogadores, iniciativa, jogador ativo, fase, magia confirmada, quantidade esperada de dados, captura consumida e histórico. Estados previstos: menu → preparação da câmera → iniciativa → aguardando gesto → magia confirmada → aguardando área vazia/nova rolagem → aguardando leitura válida → resolvendo ataque → próximo turno ou vitória. Nos testes do motor, fornecer resultados reconhecidos controlados, sem depender de câmera ou sorte. No jogo, os resultados dos ataques vêm dos dados físicos.

| Skill instalada | Aplicação |
| --- | --- |
| Sites | Principal candidata para implementar, visualizar e, quando a etapa de entrega for solicitada, hospedar o jogo no navegador |
| Computer Use | Verificar interações, layout e fluxo no navegador, se necessário; ler suas instruções antes de usar |
| Imagegen | Opcional para arte raster de magos e cenário em uma etapa de refinamento; dispensável para o protótipo com SVG/CSS |
| OpenAI Docs | Consultada nesta etapa para documentação de consumo; usar se forem necessárias orientações sobre modelos |

As regras de combate permanecem determinísticas depois de receber os resultados dos dados. Os módulos de visão computacional ficam responsáveis pelo reconhecimento de gestos e pela leitura dos dados físicos; ferramentas e modelos específicos serão escolhidos após validar a captura de d20. BigQuery e Databricks não têm uso previsto neste escopo.

## 5. Plano de entregas

As entregas abaixo seguem uma ordem de dependências. Cada etapa deixa um artefato que pode ser revisado antes de investir na etapa seguinte. As entregas 1 e 2 reduzem os principais riscos de regras e hardware; a integração completa só começa depois que os critérios de visão computacional estiverem demonstrados. O motor da entrega 3 pode avançar depois da consolidação das regras, independentemente do ensaio de câmeras.

| # | Entrega | Trabalho incluído | Artefato revisável | Critério para concluir / avançar |
| --- | --- | --- | --- | --- |
| 1 | Especificação de jogo aprovada | Fechar escopo da primeira versão, regras, valores configuráveis, fluxo de telas e decisões | [Especificação](ESPECIFICACAO.md), [registro de decisões](DECISOES.md) e este planejamento atualizado | Concluída: versão 1.1 revisada e aprovada pelo usuário |
| 2 | Ensaio técnico das câmeras e reconhecimento | Verificar abertura simultânea das duas webcams; testar gestos; testar leitura da face superior de 1 e 2 d20, incluindo repetição de valores, movimento, oclusão e iluminação | Protótipo de ensaio com instruções de posicionamento, resultados observados e decisão registrada sobre abordagem de reconhecimento | As duas câmeras funcionam ao mesmo tempo no dispositivo-alvo; gestos são distinguíveis; leitura de um e dois dados atende aos casos essenciais ou o bloqueio/alternativa técnica fica documentado antes da integração |
| 3 | Motor de combate determinístico | Implementar validação da configuração, iniciativa e desempate, três tipos de ataque, cálculo de dano, turnos, histórico e vitória, recebendo resultados de dados como entradas controladas | Módulo de regras executável sem câmera e tabela de cenários de aceitação | Casos de acerto/erro na CA, vantagem/desvantagem, dano ímpar, empate de iniciativa, ataque fatal e troca de turno produzem os resultados especificados |
| 4 | Protótipo jogável integrado | Montar menu, seleção de duas câmeras, prévias, iniciativa, arena e resultado; integrar gesto e leitura dos dados ao motor; tratar permissão negada e desconexão | Partida completa local, do menu à vitória, com ambas as câmeras | Ataque normal só resolve com um dado válido; vantagem/desvantagem só resolvem com dois dados válidos; leitura incompleta ou câmera indisponível não aplica dano nem consome turno |
| 5 | Interface visual e acessibilidade | Refinar personagens preto/branco, arena, cartões de magia, barras, feedback de leitura, histórico, efeitos, responsividade, contraste e controles por teclado | Versão visual revisável no computador e em telas pequenas, conforme decisão D12 | Identidade dos jogadores, jogador ativo, etapa atual e resultado são legíveis; movimento pode ser reduzido; menus e controles auxiliares operam por teclado |
| 6 | Validação de ponta a ponta | Percorrer verificações essenciais desta seção, corrigir falhas e registrar limites de hardware/reconhecimento encontrados | Registro de verificações, problemas corrigidos e limitações conhecidas | Fluxos essenciais passam, inclusive falhas de câmera, leituras incompletas, consumo único da captura, ataque fatal, revanche e retorno ao menu |
| 7 | Pacote de entrega | Preparar instruções de execução e configuração das câmeras; publicar/hospedar somente se fizer parte do escopo acordado para implementação | Versão executável e guia curto de instalação, uso e limitações | Outra pessoa consegue iniciar o jogo e preparar as câmeras seguindo o guia; versão e limitações estão identificadas |

### Dependências e pontos de decisão

- A entrega 2 é um portão técnico: se o reconhecimento de d20 não for confiável no hardware disponível, registrar as alternativas e seu impacto antes de começar a integração da entrega 4.
- A entrega 3 pode avançar em paralelo ao ensaio técnico depois que as regras da entrega 1 estiverem consolidadas, porque usa resultados controlados e não depende das câmeras.
- A aparência final da entrega 5 depende do fluxo integrado da entrega 4; arte raster é opcional e pode ser substituída por SVG/CSS.
- A publicação da entrega 7 depende de confirmação do escopo de hospedagem; a versão executável e o guia continuam sendo entregáveis mesmo sem publicação.

### Estado atual

- Entrega 1: concluída e aprovada; especificação 1.1, fluxo de estados, 23 cenários de aceitação e decisões D01 a D12 aprovados; commit autorizado pelo usuário.
- Entregas 2 a 7: não iniciadas.

### Revisão e commit por entrega

Conforme solicitado pelo usuário em 27/10/2026, cada entrega terá um commit próprio. Ao concluir o trabalho de uma entrega, mostrar os artefatos, resumir as alterações e as verificações e perguntar se o usuário autoriza criar o commit. Aguardar a autorização explícita antes de executar o commit. A aprovação de uma entrega não autoriza antecipadamente os commits das próximas.

Commit autorizado para a entrega 1: `docs: definir especificacao da entrega 1`. Arquivos: `PLANEJAMENTO.md`, `ESPECIFICACAO.md` e `DECISOES.md`. Por ser o primeiro commit do repositório, também registra o planejamento já existente.

O checklist de aceitação detalhado permanece abaixo e deve ser usado principalmente na entrega 6. A ordem prioriza reduzir o risco de visão computacional e provar uma partida funcional antes do refinamento visual.

Verificações essenciais:

- As duas webcams abrem simultaneamente e cada prévia corresponde à função escolhida.
- A mesma webcam não pode ocupar as duas funções; ausência de dispositivo, permissão negada ou desconexão não resolve ataques automaticamente.
- Gestos do jogador fora do turno não selecionam magias; validar a delimitação das regiões dos jogadores.
- Iniciativa respeita maior valor e resolve empates.
- Vantagem usa o maior dado; desvantagem usa o menor.
- O gesto seleciona uma única magia e a seleção permanece travada durante a rolagem.
- Ataque normal exige um dado válido; vantagem e desvantagem exigem dois dados físicos distintos com valores reconhecidos.
- Dois dados com valores iguais são aceitos; um único dado não é contado duas vezes.
- Leituras incompletas, dados em movimento ou números ilegíveis não resolvem o ataque nem consomem o turno.
- Dados do turno anterior não são aceitos como uma nova rolagem.
- Cada captura válida resolve exatamente um ataque, mesmo se os dados permanecerem diante da câmera.
- Igualar a CA erra; ultrapassar a CA acerta.
- Dano corresponde à metade arredondada para baixo, ao padrão e ao dobro, incluindo padrão ímpar; 9 / 2 resulta em 4 e 1 / 2 resulta em 0.
- Acerto e erro alternam corretamente o jogador ativo.
- Um ataque fatal encerra a partida sem permitir resposta do derrotado.
- Cliques repetidos durante a resolução geram uma única ação.
- Configurações inválidas não iniciam partida.
- Revanche limpa vida/histórico e refaz iniciativa; menu permite nova configuração.

Observação de balanceamento: com CA 12, cada d20 tem 40% de chance de passar a CA. Vantagem acerta em 64% dos casos e desvantagem em 16%. Com dano padrão 10, os danos médios por ação são, respectivamente, 3,2 (vantagem), 4 (normal) e 3,2 (desvantagem). São probabilidades teóricas calculadas a partir das regras. O ataque normal tem maior média nesse valor de CA, enquanto os outros oferecem maior frequência de acerto ou maior dano por acerto. Manter as regras pedidas e avaliar o equilíbrio em partidas antes de propor ajustes.

## 6. Relatório de consumo

A ferramenta de consulta disponível retornou percentuais das janelas de uso da conta, sem contagem de tokens desta conversa ou discriminação por etapa. Portanto, não é possível declarar números reais de tokens por etapa com os dados obtidos. Indisponível não significa zero.

| Atividade desta rodada | Status | Tokens efetivamente consumidos |
| --- | --- | --- |
| Leitura do pedido e inspeção inicial do projeto | Concluída | Não disponibilizados por etapa |
| Consulta das skills e documentação de consumo | Concluída | Não disponibilizados por etapa |
| Consolidação das regras e elaboração do planejamento | Concluída | Não disponibilizados por etapa |
| Redação do relatório | Concluída | Não disponibilizados por etapa |
| Implementação, arte, testes do jogo e publicação | Não iniciados | Sem medição de execução dessas etapas |

Fotografia inicial retornada pela consulta: 2% usados na janela de 5 horas e 8% usados na janela de 7 dias. Os valores são da conta, podem incluir outras conversas e não representam o consumo deste planejamento. Não permitem conversão confiável em tokens.

Para as próximas etapas, registrar o trabalho realizado e qualquer telemetria efetivamente disponível. Se houver contadores acumulados de tokens, usar diferenças entre limites de etapas, distinguindo entrada, entrada em cache e saída conforme os campos fornecidos. Não inferir tokens a partir de percentuais ou apenas do tamanho da resposta.

A documentação oficial explica que contexto, raciocínio, ferramentas e cache influenciam o uso: [OpenAI — Pricing](https://learn.chatgpt.com/docs/pricing).

Próxima entrega prevista: a entrega 2 validará a abertura simultânea das duas webcams, a captura de gestos do jogador ativo e a leitura da face superior de um e dois d20 físicos, refinando posição das câmeras e área de rolagem antes da integração ao combate.
