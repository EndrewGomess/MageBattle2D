# Planejamento — Duelo de Magos

Data: 27/10/2026. Status: planejamento atualizado com visão computacional; implementação pendente.

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
| Classe de armadura (CA) | 12, proposta | Ajustável; mesmo valor para os dois jogadores |

Vida e dano aceitam inteiros positivos. Proposta de faixa da CA: 1 a 19, para sempre existir possibilidade de acerto com a comparação estrita solicitada. O menu deve explicar essa comparação e exibir os danos derivados antes do início da partida. Configurações inválidas impedem o início e recebem uma mensagem clara.

### Iniciativa e turnos

1. Ao iniciar, cada jogador rola 1d20 de iniciativa. Proposta: usar também leitura do dado físico nessa etapa, um jogador por vez.
2. O maior resultado começa. Proposta: em empate, ambos rolam novamente até desempatar.
3. A ordem permanece fixa durante a partida.
4. O jogador ativo faz o gesto da magia diante da câmera e, após a seleção ser confirmada, lança os dados físicos exigidos. O jogo lê e valida a rolagem antes de resolver o ataque.
5. Um erro também consome o turno.
6. Após resolver a ação, o jogo verifica a vitória antes de passar o turno.
7. Ao atingir zero de vida, o jogador é derrotado imediatamente e não realiza outra ação.

### Ataques

O vínculo entre vantagem/desvantagem e as magias abaixo é uma interpretação proposta dos ataques fraco, normal e crítico descritos no pedido.

| Ataque | Magia | Dados | Resultado usado | Dano se acertar | Dano padrão 10 |
| --- | --- | --- | --- | --- | --- |
| Fraco, com vantagem | Mísseis Mágicos | 2d20 | Maior valor | Dano padrão / 2 | 5 |
| Normal | Raio de Fogo | 1d20 | Único valor | Dano padrão | 10 |
| Crítico, com desvantagem | Bola de Fogo | 2d20 | Menor valor | Dano padrão × 2 | 20 |

Acerto: resultado escolhido > CA do alvo. Um resultado igual à CA erra. Um erro causa zero dano. Não haverá modificadores adicionais de ataque na primeira versão.

Exemplo: contra CA 12, rolar 12 erra e rolar 13 acerta. Com dados 7 e 18, Mísseis Mágicos usa 18 e Bola de Fogo usa 7.

Propostas para completar as regras:

- “Crítico” identifica a opção de dano dobrado. Tirar 20 não acrescenta outro multiplicador.
- Valores naturais 1 e 20 seguem a mesma comparação de acerto, sem efeitos extras.
- Quando o dano padrão for ímpar, preservar a metade exata: dano padrão 9 resulta em 4,5 para Mísseis Mágicos.
- A vida exibida nunca fica abaixo de zero.
- Todas as magias podem ser repetidas em qualquer turno, sem custo ou recarga.
- Mísseis Mágicos segue uma única resolução de ataque e o dano indicado na tabela.

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
- Posicionar a câmera dos jogadores de frente, com as mãos visíveis. Proposta: delimitar uma região para cada jogador e aceitar gestos apenas na região correspondente ao turno ativo; a confiabilidade dessa separação deve ser validada no ensaio.
- Posicionar a câmera dos dados acima da área de rolagem, apontando para baixo, em suporte fixo. Ajustar distância, foco e iluminação até que os números da face superior dos d20 estejam legíveis. Essa posição facilita o enquadramento, mas não substitui a validação do reconhecimento.
- Manter as duas prévias disponíveis e executar o reconhecimento necessário à fase: gestos na seleção da magia; dados após a confirmação. Não é necessária sincronização precisa entre os vídeos, pois essas ações acontecem em sequência.
- Validar a abertura simultânea dos dois dispositivos no computador/navegador de destino antes de fechar a configuração. Se uma câmera falhar ou desconectar, suspender a captura da ação e solicitar reconexão, sem aplicar dano nem passar o turno automaticamente. Uma rolagem interrompida deve ser rearmada com a área vazia para evitar resultados antigos.

Referência técnica: o navegador pode listar os dispositivos com [enumerateDevices](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/enumerateDevices) e solicitar cada câmera pelo seu identificador com [getUserMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia). O acesso exige permissão do usuário e contexto seguro (HTTPS ou localhost no desenvolvimento). A disponibilidade simultânea depende também do hardware, dos drivers e dos recursos disponíveis no computador.

Propostas de interação para a primeira versão, ainda não confirmadas pelo usuário:

- Mapear indicador levantado para Mísseis Mágicos, sinal de V para Raio de Fogo e mão aberta para Bola de Fogo. Confirmar a seleção após manter o gesto por cerca de um segundo, com indicação visual do progresso.
- Travar a magia depois da confirmação, enquanto o jogador lança os dados. Gestos observados durante a leitura dos dados não selecionam outro ataque.
- Usar uma área de rolagem delimitada e exigir que esteja vazia antes de armar cada nova captura. A captura só fica habilitada após a confirmação da magia, evitando reaproveitar dados do turno anterior.
- Para vantagem e desvantagem, lançar os dois dados juntos e mantê-los visíveis na mesma área de captura. Rolagens sequenciais não fazem parte dessa proposta inicial.
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

Proposta técnica: HTML, CSS e JavaScript em módulos, com estado da partida no navegador. Validar a viabilidade de executar reconhecimento de gestos e leitura dos dados no navegador antes de confirmar a arquitetura sem backend. A primeira versão pode usar personagens em SVG/CSS, com efeitos visuais simples e sem imagens externas.

Captura: abrir dois fluxos de vídeo com identificadores de dispositivos distintos, sem solicitar áudio. Separar a configuração de resolução/frequência de cada câmera e ajustar conforme os testes de legibilidade e desempenho. Liberar os fluxos ao encerrar a sessão de câmera ou trocar de dispositivo. Incluir seleção incorreta, permissão negada, indisponibilidade de hardware e desconexão no tratamento de falhas.

Separar regras puras de combate da interface e dos módulos de visão computacional. Centralizar configuração, jogadores, iniciativa, jogador ativo, fase, magia confirmada, quantidade esperada de dados, captura consumida e histórico. Estados previstos: menu → preparação da câmera → iniciativa → aguardando gesto → magia confirmada → aguardando área vazia/nova rolagem → aguardando leitura válida → resolvendo ataque → próximo turno ou vitória. Nos testes do motor, fornecer resultados reconhecidos controlados, sem depender de câmera ou sorte. No jogo, os resultados dos ataques vêm dos dados físicos.

| Skill instalada | Aplicação |
| --- | --- |
| Sites | Principal candidata para implementar, visualizar e, quando a etapa de entrega for solicitada, hospedar o jogo no navegador |
| Computer Use | Verificar interações, layout e fluxo no navegador, se necessário; ler suas instruções antes de usar |
| Imagegen | Opcional para arte raster de magos e cenário em uma etapa de refinamento; dispensável para o protótipo com SVG/CSS |
| OpenAI Docs | Consultada nesta etapa para documentação de consumo; usar se forem necessárias orientações sobre modelos |

As regras de combate permanecem determinísticas depois de receber os resultados dos dados. Os módulos de visão computacional ficam responsáveis pelo reconhecimento de gestos e pela leitura dos dados físicos; ferramentas e modelos específicos serão escolhidos após validar a captura de d20. BigQuery e Databricks não têm uso previsto neste escopo.

## 5. Etapas de execução e critérios de conclusão

| Etapa | Trabalho | Critério de conclusão |
| --- | --- | --- |
| 1. Especificação | Consolidar regras, propostas e escopo | Este documento, com decisões não fornecidas pelo usuário identificadas como propostas |
| 2. Validação da visão e motor de combate | Ensaiar gestos e leitura de um/dois d20; implementar iniciativa, três ataques, dano, turnos e vitória | Viabilidade de captura demonstrada e regras funcionando com entradas determinísticas |
| 3. Interface jogável | Integrar câmera, gestos, dados físicos, menu, iniciativa, arena, vida, histórico e resultado | Partida completa; ataques com vantagem/desvantagem bloqueados até ler dois dados válidos |
| 4. Apresentação visual | Magos preto/branco, efeitos, responsividade e acessibilidade | Jogadores reconhecíveis e resultados legíveis em desktop e celular |
| 5. Validação e entrega | Testes do fluxo, correções e instruções; publicação conforme o escopo da implementação | Versão executável, verificações registradas e limitações informadas |

As etapas 2 a 5 ainda não foram executadas. A ordem prioriza validar a leitura dos dados físicos e obter uma partida funcional antes de refinamentos artísticos.

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
- Dano corresponde a metade, padrão e dobro, incluindo padrão ímpar.
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

Próxima etapa proposta: validar a abertura simultânea das duas webcams, a captura de gestos do jogador ativo e a leitura da face superior de um e dois d20 físicos, refinando posição das câmeras e área de rolagem antes da integração ao combate.
