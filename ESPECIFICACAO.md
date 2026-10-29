# Entrega 1 — Especificação do Duelo de Magos

Versão: 1.1, aprovada pelo usuário com o arredondamento da metade do dano para baixo. Data: 27/10/2026.

Status: entrega 1 concluída e aprovada; commit autorizado pelo usuário. Nenhum código do jogo ou ensaio com câmeras faz parte desta entrega.

Este documento define o comportamento aprovado para a primeira versão. O [planejamento](PLANEJAMENTO.md) organiza as entregas e o [registro de decisões](DECISOES.md) identifica as decisões D01 a D12 aprovadas pelo usuário e as validações técnicas que permanecem para a entrega 2.

## 1. Escopo da primeira versão

Dois jogadores humanos disputam um combate 1v1 por turnos, em português, no mesmo computador. O jogador 1 controla o mago de roupas pretas à esquerda; o jogador 2, o mago de roupas brancas à direita. Nome, posição e indicação de turno complementam a identificação por cor.

O jogo inclui menu de configuração, preparação de duas webcams, iniciativa, três magias escolhidas por gestos, resolução com d20 físicos, vida, histórico, vitória, revanche e retorno ao menu.

Equipamento necessário: um computador, duas webcams distintas, dois d20 físicos e uma área de rolagem delimitada. Uma câmera observa os jogadores; a outra observa os dados. A viabilidade de reconhecer a face superior dos d20 será medida na entrega 2.

Multiplayer pela internet, adversário automático, outras classes, mana, equipamentos, progressão e entrada manual de resultados ficam fora da primeira versão. Entradas controladas serão usadas apenas para verificar o motor na entrega 3.

O alvo funcional é o computador com duas webcams. A entrega 5 também revisará a legibilidade do layout em telas pequenas; executar o combate em celular não é um critério funcional desta versão. Navegador e configuração de hardware suportados serão registrados a partir do ensaio da entrega 2 (D12).

## 2. Configuração e regras

| Item | Regra | Situação |
| --- | --- | --- |
| Vida máxima | Valor inicial 50; inteiro positivo; igual para os dois jogadores | Consolidada no planejamento |
| Dano padrão | Valor inicial 10; inteiro positivo; igual para os dois jogadores | Consolidada no planejamento |
| CA | Valor inicial 12; inteiro de 1 a 19; igual para os dois jogadores | Decisão aprovada D01 |
| Configuração inválida | Bloqueia o início e identifica o campo a corrigir; valores vazios, zero, negativos, fracionários ou não numéricos são inválidos | Detalhamento da validação |
| Prévia do dano | Mostra metade arredondada para baixo, valor padrão e dobro antes do início | Consolidada no planejamento; arredondamento definido pelo usuário |
| Acerto | O resultado escolhido deve ser estritamente maior que a CA; igualdade erra | Requisito consolidado |
| Erro | Dano zero; consome o turno após uma rolagem válida | Requisito consolidado |
| Vitória | Vida do alvo chega a zero após resolver o ataque; a partida termina antes de outra ação | Requisito consolidado |

### Iniciativa

Cada jogador obtém um resultado de 1d20; o maior começa e a ordem permanece fixa. A decisão D02 usa a câmera dos dados, com uma captura do jogador 1 e depois uma do jogador 2. Em empate, ambos repetem a rolagem até desempatar. A iniciativa usa o mesmo ciclo de área vazia e captura única dos ataques, sem seleção de magia e sem causar dano.

### Magias

O vínculo entre tipo de ataque, nome da magia e vantagem/desvantagem segue a decisão aprovada D03.

| Tipo | Magia | Quantidade física exigida | Resultado escolhido | Dano quando acerta | Com dano padrão 10 |
| --- | --- | --- | --- | --- | --- |
| Fraco com vantagem | Mísseis Mágicos | 2d20 | Maior valor | Padrão / 2, arredondado para baixo | 5 |
| Normal | Raio de Fogo | 1d20 | Único valor | Padrão | 10 |
| Crítico com desvantagem | Bola de Fogo | 2d20 | Menor valor | Padrão × 2 | 20 |

Regra de arredondamento definida pelo usuário (D05): calcular `piso(dano padrão / 2)` para Mísseis Mágicos. Dano padrão 9 resulta em 4; dano padrão 1 resulta em 0. Um ataque válido que acerta com dano derivado zero consome o turno normalmente.

Regras complementares aprovadas: 1 e 20 naturais seguem a comparação comum de acerto; o ataque chamado crítico já corresponde ao dano dobrado e não recebe multiplicador extra (D04). A vida é limitada a zero após o dano (D05). Todas as magias podem ser repetidas sem custo ou recarga, e Mísseis Mágicos resolve um único ataque por turno (D06).

## 3. Seleção de magia e leitura dos dados

### Gestos

Decisão D07: indicador levantado seleciona Mísseis Mágicos, sinal de V seleciona Raio de Fogo e mão aberta seleciona Bola de Fogo. O mesmo gesto deve permanecer reconhecido por cerca de um segundo, com progresso visível. Se o gesto mudar ou deixar de ser reconhecido antes da confirmação, o progresso reinicia.

Decisão D08: cada jogador ocupa uma região indicada na prévia da câmera. Só a região do jogador ativo pode confirmar uma magia. Uma leitura ambígua não confirma seleção. A separação e o tempo de confirmação precisam ser avaliados no ensaio da entrega 2.

Após a confirmação, a magia fica travada até a resolução ou reinício da partida. Gestos durante a rolagem não a alteram (D09).

### Ciclo de captura

O ciclo aprovado em D10 é aplicado a cada rolagem de iniciativa e de ataque:

1. Preparar a ação: definir quem rola e quantos dados são esperados. Em um ataque, a magia já deve estar confirmada.
2. Aguardar a câmera observar a área de rolagem vazia. Dados já presentes não contam para a nova ação.
3. Armar a captura e pedir o lançamento de um ou dois dados. Quando forem dois, ambos devem ficar visíveis juntos.
4. Aguardar exatamente a quantidade exigida de objetos físicos distintos, todos parados, com valores inteiros de 1 a 20 legíveis na face superior e sem mãos na área.
5. Confirmar a leitura somente quando todos os dados estiverem válidos na mesma observação estável. Dois dados com o mesmo valor são aceitos. Um único objeto não pode ser contado duas vezes.
6. Consumir a captura uma única vez. Manter os dados na área não gera outra ação.

Dados extras, ausentes, em movimento, sobrepostos ou ilegíveis mantêm a ação aguardando, com o motivo exibido. Uma leitura incompleta não aplica dano nem passa o turno. Uma rolagem válida que erra a CA consome o turno normalmente.

Os limiares de estabilidade, confiança e desempenho serão medidos e registrados na entrega 2. Esta especificação não declara uma precisão que ainda não foi demonstrada.

### Falha e recuperação das câmeras

A mesma webcam não pode ser usada nas duas funções. Se uma câmera estiver indisponível, a preparação não libera a partida. Se falhar durante a partida, a captura da ação é suspensa, com orientação para reconexão, sem aplicar dano nem passar o turno automaticamente.

Decisão D11: preservar configuração, vida, jogador ativo, magia já confirmada e resultados de iniciativa já consumidos. Após reconectar e verificar as duas prévias, descartar apenas a leitura ainda não consumida e exigir área vazia para rearmá-la. Uma resolução já consumida continua registrada e não é repetida. Se a falha acontecer antes de confirmar a magia, reiniciar o progresso do gesto.

## 4. Fluxo de telas e estados

| Estado | O que o jogador vê ou faz | Condição para avançar |
| --- | --- | --- |
| Menu | Configura vida, dano e CA; vê os três danos derivados | Configuração válida e solicitação de início |
| Preparação | Seleciona duas câmeras distintas, confere prévias e enquadramento | Ambas as câmeras disponíveis e preparação confirmada |
| Iniciativa | Rola um d20 por jogador; vê os resultados | Resultados válidos e desempate concluído |
| Aguardando gesto | Vê jogador ativo, cartões de magia e progresso do gesto | Gesto válido confirmado |
| Aguardando área vazia | Vê a magia travada e instrução para retirar os dados anteriores | Área observada vazia após preparar a ação |
| Aguardando nova rolagem/leitura | Vê quantidade esperada, objetos detectados, valores e motivo de espera | Quantidade exata e todos os valores estáveis e válidos |
| Resolvendo | Vê dados reconhecidos, valor escolhido, CA, acerto/erro e dano | Captura consumida e vida atualizada uma única vez |
| Próximo turno | Vê destaque passar ao outro jogador | Alvo ainda tem vida; limpar seleção e iniciar novo gesto |
| Resultado | Vê vencedor e opções Revanche e Voltar ao menu | Escolha do jogador |
| Captura suspensa | Vê a falha da câmera e instrução de recuperação | Câmeras recuperadas; retomar conforme D11 |

Na iniciativa, os estados de área vazia e leitura se repetem dentro da tela de iniciativa. Após confirmar os dois resultados, um empate inicia um novo par de capturas. O resultado sem empate abre o primeiro turno.

Na arena, os dois magos têm nome, vida atual/máxima, barra de vida e CA. As prévias são identificadas por função e destacam a etapa ativa. Durante a resolução, novas ações ficam bloqueadas. Cada entrada do histórico registra turno, atacante, magia, todos os dados físicos, valor escolhido, CA, acerto/erro e dano.

Revanche preserva configuração e seleção de câmeras disponíveis, restaura a vida, limpa histórico, magia e capturas anteriores e refaz a iniciativa com novas rolagens. Voltar ao menu permite editar os atributos. Se houver falha de câmera, a preparação precisa ser regularizada antes de outra partida.

Menus e controles auxiliares operam por teclado, resultados têm contraste legível e os efeitos permitem reduzir movimento. O fluxo de combate usa as câmeras conforme o escopo.

## 5. Cenários de aceitação

Estes são exemplos para orientar a implementação e a validação das próximas entregas. São resultados esperados, não testes executados. Salvo indicação contrária, o alvo começa com 50 de vida, CA 12 e dano padrão 10.

| ID | Entrada ou situação | Resultado esperado |
| --- | --- | --- |
| A01 | Vida 0, dano 1,5 ou CA 20 | Início bloqueado; campo inválido identificado, conforme faixa aprovada em D01 |
| A02 | Iniciativa: jogador 1 = 15; jogador 2 = 8 | Jogador 1 começa |
| A03 | Iniciativa: 11 e 11 | Ambos rolam novamente; partida ainda não começa, conforme D02 |
| A04 | Raio de Fogo: 12 | Erro; alvo permanece com 50; turno passa |
| A05 | Raio de Fogo: 13 | Acerto; alvo fica com 40; turno passa |
| A06 | Mísseis Mágicos: 7 e 18 | Usa 18; acerta; alvo fica com 45 |
| A07 | Bola de Fogo: 7 e 18 | Usa 7; erra; alvo permanece com 50 |
| A08 | Bola de Fogo: 13 e 20 | Usa 13; acerta por 20 de dano; alvo fica com 30 |
| A09 | Mísseis Mágicos: dois objetos distintos com 15 e 15 | Captura aceita; usa 15; alvo fica com 45 |
| A10 | Ataque exige dois dados; só um objeto é detectado | Aguarda; nenhum dano e nenhuma troca de turno |
| A11 | Ataque normal; dois dados na área | Aguarda exatamente um dado, conforme D10 |
| A12 | Dado em movimento, sobreposto ou ilegível | Aguarda leitura válida; informa o motivo |
| A13 | Dados antigos permanecem após a troca de turno | Não arma a próxima rolagem até observar a área vazia |
| A14 | Mesma captura válida aparece em vários quadros | Apenas uma resolução e uma entrada no histórico |
| A15 | Dano padrão 9; Mísseis Mágicos acerta | Dano 4; alvo fica com 46, conforme arredondamento definido em D05 |
| A16 | Alvo com 5 de vida; Raio de Fogo acerta | Vida termina em 0; atacante vence; derrotado não age |
| A17 | Jogador inativo faz o gesto ou troca-se o gesto após confirmar | Nenhuma nova magia é selecionada, conforme D08/D09 |
| A18 | Câmera falha durante uma leitura ainda não consumida | Sem dano e sem troca de turno; recuperação exige área vazia |
| A19 | Revanche após vitória | Mesmos atributos; vida restaurada; histórico limpo; nova iniciativa |
| A20 | Voltar ao menu | Campos podem ser editados; nova partida usa a nova configuração |
| A21 | Selecionar a mesma webcam para as duas funções | Preparação bloqueada até selecionar dispositivos distintos |
| A22 | Raio de Fogo: 20 natural | Dano 10, sem multiplicador adicional, conforme D04 |
| A23 | Dano padrão 1; Mísseis Mágicos acerta | Dano 0; alvo permanece com 50; turno passa, conforme arredondamento definido em D05 |

## 6. Limite e conclusão desta entrega

Entregue e aprovado: escopo da primeira versão, regras, decisões identificadas, fluxo de telas e estados, 23 cenários de aceitação e [registro de decisões](DECISOES.md).

A revisão documental conferiu a coerência entre quantidade de dados, escolha do resultado, cálculo de dano, consumo único de captura, passagem de turno e vitória. A viabilidade das câmeras, a precisão do reconhecimento e a execução do jogo permanecem sem demonstração e pertencem às entregas seguintes.

A entrega 1 foi aprovada pelo usuário após a revisão do arredondamento do dano, com autorização explícita para criar seu commit. As próximas entregas continuam sujeitas à apresentação do resultado e à autorização do usuário antes de cada commit.
