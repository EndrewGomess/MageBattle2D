# Planejamento — Duelo de Magos

**D18 implementada, ainda não testada; revisão independente concluída por leitura, sem achados funcionais acionáveis.** Motor, dados, controlador e interface funcional foram adaptados antes do refinamento visual da Entrega 5. A suíte antiga não foi atualizada nem executada; os 70/70 pertencem à versão anterior. Ver [contrato e limites D18](docs/D18.md).

Data: 27/10/2026. Atualização: 29/10/2026. Status: entregas 1 e 2 concluídas e aceitas; entrega 2 aceita com os limites do ensaio registrados em docs/ENTREGA_02.md. Motor da entrega 3 implementado e testado: 70 testes aprovados e cobertura focada de 100% em combat.js/dice.js após correção dos dois achados de captura de entradas. Nova revisão independente confirmou as correções sem novos achados acionáveis. A Entrega 3 foi integrada à `main` pela [PR #3](https://github.com/EndrewGomess/MageBattle2D/pull/3), no merge `0fd5b20`; a autorização está registrada em D15. Testes de partida integrada e webcam real adiados por decisão explícita (D15).

Artefatos da entrega 1: [especificação do jogo](ESPECIFICACAO.md) e [registro de decisões](DECISOES.md). A versão 1.1 e as decisões D01 a D12 foram aprovadas pelo usuário, incluindo o arredondamento da metade do dano para baixo. Atualização vigente D13 (28/10/2026): uma webcam para gestos e d20 virtuais gerados pelo software. O ensaio de 29/10 registrou seis gestos positivos (três para cada jogador), uma sessão e cerca de 1.957 quadros. Rejeição, unicidade, recuperação e métricas não foram registradas; veja limites em docs/ENTREGA_02.md. Dados físicos/OCR foram retirados do escopo.

## 1. Objetivo e primeira versão

Atualização da Entrega 4 (D16/D17): protótipo integrado implementado em `dist/jogo.html`, com revisão independente por leitura concluída; P2 de BFCache corrigido e confirmado estaticamente, sem outros achados acionáveis. O usuário relatou reconhecimento fácil dos três gestos, ataques alternados passando turno, vida até zero e tela de resultado com opções de encerramento/revanche. É um relato exploratório sem data do ensaio, hardware, configurações, quantidades ou métricas informadas; não valida os demais casos. Nenhum teste, sintaxe ou navegador foi executado pelos agentes nesta entrega. [Arquitetura, relato e pendências](docs/ENTREGA_04.md). Sair encerra a partida sem persistência; retorno por BFCache reinicializa no menu, ainda sem verificação de execução. Commit e PR da Entrega 4 autorizados explicitamente após revisão final do registro conforme D17; execução consultável no histórico Git e na PR correspondente, quando criada. Entregas 5–7 não iniciadas.

Criar um jogo de combate 1v1 por turnos, inspirado em RPG de mesa, com dois jogadores humanos no mesmo dispositivo. Conforme pedido do usuário em 28/10/2026, o jogo deve ter interface gráfica 2D, em português, com menu, arena com os dois magos, indicadores de vida e turno, feedback visual das magias e resultado da partida. O navegador de um computador permanece a plataforma aprovada em D12; as alternativas de execução abaixo são sugestões para avaliação.

Cada jogador controla um mago. O jogador 1 usa roupas pretas e o jogador 2 usa roupas brancas. Nomes, rótulos e indicação de turno complementam as cores para facilitar a identificação.

O primeiro escopo contém configuração de atributos, iniciativa, três ataques selecionados por gestos diante da câmera, rolagens virtuais para os resultados, histórico de combate, vitória, revanche e retorno ao menu. Multiplayer pela internet, adversário automático, outras classes, mana, equipamentos e progressão ficam para possíveis versões futuras.

A visão computacional reconhece o gesto que seleciona a magia. Confirmar a seleção gera uma única rolagem virtual aleatória; a webcam não lê números nem objetos de dados.

Equipamento vigente: um computador e uma webcam voltada para os dois jogadores. Não são necessários d20 físicos ou uma segunda câmera.

## 2. Regras consolidadas em D18 — implementadas, não testadas

O usuário confirmou [D18](DECISOES.md): manter acerto por d20 escolhido estritamente maior que CA, gerar dano em d6 somente após acerto, retirar dano padrão e manter vida/CA configuráveis. Crítico conta o 20 escolhido, dobra somente os dados e preserva o bônus fixo; Bola exige ambos os d20 em 20 e aplica o máximo `48+4=52`. As tabelas desta seção são o contrato confirmado e implementado, ainda sem execução; substituem o dano fixo de D03 e a ausência de efeito extra de D04, retirando de D05 a metade/piso e preservando o limite da vida.

### Menu

| Configuração | Valor inicial | Comportamento |
| --- | --- | --- |
| Vida máxima | 50 | Ajustável; mesmo valor para os dois jogadores |
| Classe de armadura (CA) | 12 | Ajustável; mesmo valor para os dois jogadores |

Vida aceita inteiro positivo. CA aceita inteiros de 1 a 19. Ambos são iguais para os dois jogadores. Retirar o campo `baseDamage` do contrato alvo e do menu; os danos são fórmulas próprias das magias. O menu deve explicar a comparação e exibir fórmulas normais/críticas antes do início. Configurações inválidas impedem o início e identificam o campo. O campo de dano padrão foi retirado do código nesta etapa.

### Iniciativa e turnos

1. Ao iniciar, o sistema gera 1d20 virtual de iniciativa para cada jogador, um jogador por vez, começando pelo jogador 1.
2. O maior resultado começa. Em empate, ambos rolam novamente até desempatar.
3. A ordem permanece fixa durante a partida.
4. O jogador ativo confirma o gesto e o sistema gera uma única vez os d20 de ataque; compara o escolhido com a CA e identifica crítico pelo 20 escolhido.
5. Somente no acerto gera o dano normal/crítico em d6, exceto a Bola crítica maximizada. Erro não gera d6, causa zero dano e também consome turno.
6. Após resolver a ação, o jogo verifica a vitória antes de passar o turno.
7. Ao atingir zero de vida, o jogador é derrotado imediatamente e não realiza outra ação.

### Ataques

O vínculo de gestos e de escolha maior/único/menor é preservado. O dano e o crítico da tabela abaixo foram confirmados em D18 e foram implementados nesta etapa, sem testes.

| Ataque | Magia / gesto | d20 de ataque | Resultado usado | Dano normal no acerto | Crítico natural |
| --- | --- | --- | --- | --- | --- |
| Vantagem | Mísseis Mágicos / indicador | 2d20 | Maior valor | `1d6 + 1` | Escolhido 20: `2d6 + 1` |
| Normal | Raio de Fogo / V | 1d20 | Único valor | `2d6 + 2` | Escolhido 20: `4d6 + 2` |
| Desvantagem | Bola de Fogo / mão aberta | 2d20 | Menor valor | `4d6 + 4` | Ambos 20: máximo de `8d6 + 4 = 52` |

Acerto: resultado escolhido > CA do alvo. Um resultado igual à CA erra. Um erro causa zero dano. Não haverá modificadores adicionais de ataque na primeira versão.

Exemplo: contra CA 12, rolar 12 erra e rolar 13 acerta. Com dados 7 e 18, Mísseis Mágicos usa 18 e Bola de Fogo usa 7.

Regras alvo confirmadas:

- Crítico natural depende do 20 escolhido, depois de acertar. Com CA máxima 19, esse resultado acerta. Um 20 descartado em Bola não ativa crítico.
- Dobram-se apenas os dados, não `+1`, `+2` ou `+4`. Mísseis e Raio rolam seus dados críticos; Bola aplica o máximo dos oito d6 e soma 4, nominal 52.
- Natural 1 segue a comparação comum sem efeito adicional. Igualdade com CA erra e não gera dados de dano.
- O dano aplicado é limitado à vida restante e a vida nunca fica abaixo de zero; registrar dano nominal e aplicado separadamente.
- Todas as magias podem ser repetidas em qualquer turno, sem custo ou recarga.
- Mísseis Mágicos segue uma única resolução de ataque e o dano indicado na tabela.

Histórico: a versão das Entregas 3/4 usa metade do dano padrão com piso, dano padrão e dobro. Essa regra permanece somente nos relatórios e testes históricos; foi substituída no código por D18. Não há campo de dano padrão, metade ou piso nas novas fórmulas.

Estas são as regras próprias do jogo proposto; os nomes das magias não acrescentam efeitos de outros sistemas.

### Sequência de adaptação antes do visual da Entrega 5

1. Adaptar o contrato do motor da Entrega 3 para configuração somente de vida/CA e entradas distintas de d20 de ataque e dano em d6/componente maximizado; derivar acerto/crítico no motor e preservar seus snapshots originais.
2. Adaptar geração e entrada de dados para rolar dano somente no acerto, com a quantidade normal/crítica correta; crítico de Bola usa máximo 52, sem tratá-lo como rolagem aleatória comum. Erros não consomem RNG de d6.
3. Adaptar controlador e histórico para preservar ataque e dano já gerados, sem repetição por quadros/reconexão; registrar escolhido, crítico, fórmula, dados, bônus, dano nominal e aplicado.
4. Retirar dano padrão do menu e atualizar cartões/prévias/resultados. Alinhar os cenários alvo A01–A23 da especificação, mantendo explícito que ainda não foram executados para D18.
5. Somente depois da adaptação funcional, trabalhar o refinamento visual da Entrega 5 usando a referência visual/mockup fornecida pelo usuário, sem inferir que ela modifica as regras. Os itens funcionais 1 a 4 foram implementados e revisados independentemente por leitura, sem achados funcionais acionáveis e sem testes; o item 5 visual permanece futuro.

### Gestos e dados virtuais — D13

- Indicador (Pointing_Up) confirma Mísseis Mágicos; V (Victory), Raio de Fogo; mão aberta (Open_Palm), Bola de Fogo. Manter o gesto por cerca de um segundo, com progresso visível.
- Uma webcam enquadra ambos jogadores, com regiões esquerda/direita e faixa central sem confirmação. Apenas uma mão elegível na região ativa confirma a seleção; ausência, ambiguidade, mudança de gesto ou intervalo excessivo reinicia progresso pendente.
- Cada confirmação gera uma única rolagem automática: normal usa um d20 virtual; vantagem e desvantagem usam dois resultados independentes de 1 a 20. Repetições são válidas; mostrar todos os valores e escolher maior/menor conforme a magia.
- No alvo D18, somente depois de acertar gerar os d6 de dano normal/crítico ou aplicar a Bola crítica maximizada; exibir ataque e dano separadamente e não repetir resultados já gerados.
- Manter o gesto, reconectar ou trocar o jogador não gera novas rolagens. No laboratório, Nova seleção rearma explicitamente uma tentativa; a primeira conexão pode iniciar a primeira seleção.
- Falha, encerramento ou troca da webcam preservam magia confirmada, último resultado e registros, suspendendo novas confirmações. Após reconectar, usar Nova seleção; descartar progresso incompleto e respostas assíncronas antigas. Nenhuma falha aplica dano ou passa turno.
- Permissão e contexto seguro (localhost ou HTTPS) continuam necessários. O modelo de gestos é carregado pela internet; não há garantia de funcionamento totalmente offline.

O ensaio real da webcam deve registrar gestos de ambos jogadores, rejeição da região inativa, ambiguidade, confirmação temporal, unicidade e recuperação. Leitura de faces, calibração de fundo e OCR não pertencem mais ao escopo vigente. Ver [D13](DECISOES.md), [guia](docs/GUIA_ENSAIO.md) e [relatório](docs/ENTREGA_02.md).
## 3. Telas e experiência

Menu alvo D18: título, configuração de vida/CA, fórmulas normais/críticas por magia e início; sem dano padrão. Incluir seleção de uma webcam e instruções de gestos e dados virtuais. A interface funcional recebeu essa adaptação; o refinamento visual continua futuro.

Iniciativa: mostrar os dois resultados, eventuais empates e quem começa. Essa apresentação pode aparecer sobre a arena.

Arena 2D futura: mago preto à esquerda e branco à direita, vida, CA e jogador ativo. Cartões indicam gesto, magia, quantidade virtual e dano. Uma prévia mostra regiões e progresso. A resolução exibe todos os valores gerados e o escolhido, acerto/erro e dano; histórico preserva esses dados. O laboratório atual não implementa combate.

Durante a resolução, bloquear novas ações para impedir ataques duplicados. Usar efeitos curtos para cada magia e permitir reduzir movimento. Garantir contraste das roupas com o cenário e operação por teclado nos menus e controles auxiliares. O fluxo principal de combate depende da câmera; uma eventual alternativa de entrada manual precisa ser definida separadamente e identificada como tal.

Resultado: mostrar vencedor e oferecer Revanche, que reinicia vida e iniciativa com as mesmas configurações, ou Voltar ao menu, que permite editar os valores.

## 4. Tecnologia e skills

Direção técnica aprovada: HTML, CSS e JavaScript em módulos, com estado da partida no navegador. Validar a viabilidade de executar reconhecimento de gestos no navegador antes de confirmar a arquitetura sem backend. A primeira versão pode usar personagens em SVG/CSS, com efeitos visuais simples e sem imagens externas.

### Interface gráfica 2D e opções de execução

| Opção | Onde a interface roda | Vantagem para o projeto | Impacto e situação |
| --- | --- | --- | --- |
| Navegador desktop — recomendação para a versão atual | Em uma aba no computador, servida localmente; hospedagem futura somente conforme escopo acordado | Reaproveita o laboratório HTML/CSS/JavaScript e permite desenhar personagens e arena em SVG/CSS | É a plataforma aprovada em D12. A compatibilidade observada no ensaio da entrega 2 limita-se aos seis gestos positivos registrados; veja os casos não medidos em docs/ENTREGA_02.md |
| Aplicativo desktop com Electron | Em uma janela de aplicativo no computador | Permite reaproveitar a interface HTML/CSS/JavaScript em um aplicativo distribuível | Sugestão não selecionada. Acrescenta empacotamento e manutenção; câmeras e reconhecedores precisam ser validados nesse ambiente |
| Aplicativo Python com pygame-ce | Em uma janela 2D no computador | Oferece desenho, eventos e controle do ciclo do jogo em Python; há a skill instalada `pygame-core` | Sugestão não selecionada. Exige adaptar a interface e integrar os módulos de visão computacional à aplicação Python |
| Godot | Em um aplicativo de jogo exportado para computador | Motor dedicado a jogos 2D, com cenas, animações e efeitos | Sugestão não selecionada. Exige adaptar a interface e a lógica, além de avaliar como integrar a webcam e o reconhecimento de gestos |

Recomenda-se manter o navegador desktop nesta versão para preservar D12 e o trabalho existente. Electron é uma opção futura de distribuição da interface web; pygame-ce e Godot representam mudanças de tecnologia que exigem revisão antes de qualquer migração. Esta comparação não inicia as entregas 3 a 7 nem altera as regras aprovadas.

Na execução web, o acesso às câmeras exige permissão do usuário e contexto seguro, como localhost no desenvolvimento ou HTTPS na hospedagem. O laboratório atual carrega modelos pela internet, conforme o README; execução totalmente offline não está garantida. O alvo funcional continua sendo o computador com uma webcam, sem promessa de combate em celular. O ensaio físico da entrega 2 foi realizado no escopo descrito em docs/ENTREGA_02.md; os casos sem registro permanecem limitações.

Referências das opções: [câmeras no navegador — MDN](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia), [Electron](https://www.electronjs.org/docs/latest/), [pygame-ce](https://pyga.me/docs/) e [recursos 2D do Godot](https://docs.godotengine.org/en/stable/tutorials/2d/introduction_to_2d.html).

Captura vigente: um fluxo de webcam sem áudio, com seleção de dispositivo e resolução. Liberar ao encerrar ou trocar de câmera. A falha preserva resultados e suspende novas seleções; a recuperação exige ação explícita no laboratório.

Separar motor, interface, reconhecimento de gestos e gerador de dados virtuais (dist/dice.js). Estados do jogo: menu → preparação da webcam → iniciativa virtual → gesto → rolagem virtual única → resolução → próximo turno ou vitória. O laboratório entrega apenas gesto → rolagem e registro. O motor independente em dist/combat.js é reutilizado pelo controlador da entrega 4 em dist/game-controller.js e pela entrada dist/jogo.html; verificação sistemática da integração ainda pendente, com o recorte exploratório do usuário registrado em D17.

| Skill instalada | Aplicação |
| --- | --- |
| Sites | Principal candidata para implementar, visualizar e, quando a etapa de entrega for solicitada, hospedar o jogo no navegador |
| Computer Use | Verificar interações, layout e fluxo no navegador, se necessário; ler suas instruções antes de usar |
| Imagegen | Opcional para arte raster de magos e cenário em uma etapa de refinamento; dispensável para o protótipo com SVG/CSS |
| OpenAI Docs | Consultada nesta etapa para documentação de consumo; usar se forem necessárias orientações sobre modelos |
| pygame-core | Aplicável somente se uma futura escolha por pygame-ce for aprovada; não utilizada nesta alteração documental |

As regras de combate permanecem determinísticas após receber os valores virtuais; a visão computacional cuida somente dos gestos. O gerador usa uma chamada pseudoaleatória independente por dado. BigQuery e Databricks não têm uso previsto.

## 5. Plano de entregas

As entregas abaixo seguem uma ordem de dependências. Cada etapa deixa um artefato que pode ser revisado antes de investir na etapa seguinte. As entregas 1 e 2 reduzem os principais riscos de regras e hardware. D16 autoriza implementar o protótipo da entrega 4 mesmo com critérios físicos ainda sem evidência, substituindo o antigo bloqueio de início; a validação integrada/física permanece pendente. O motor da entrega 3 não depende das câmeras.

| # | Entrega | Trabalho incluído | Artefato revisável | Critério para concluir / avançar |
| --- | --- | --- | --- | --- |
| 1 | Especificação de jogo aprovada | Fechar escopo da primeira versão, regras, valores configuráveis, fluxo de telas e decisões | [Especificação](ESPECIFICACAO.md), [registro de decisões](DECISOES.md) e este planejamento atualizado | Concluída: versão 1.1 revisada e aprovada pelo usuário |
| 2 | Ensaio da webcam, gestos e rolagens virtuais | Enquadramento único, regiões, confirmação, gerador de 1/2d20, unicidade e recuperação | Laboratório e relatório separando observações reais e resultados do software | Ensaio físico dos gestos e comportamento do fluxo adaptado registrados, sem exigir leitura de dados físicos |
| 3 | Motor de combate determinístico | Implementar validação da configuração, iniciativa e desempate, três tipos de ataque, cálculo de dano, turnos, histórico e vitória, recebendo resultados de dados como entradas controladas | [Módulo independente](dist/combat.js), testes armazenados e [contrato/evidências](docs/ENTREGA_03.md); revisão independente concluída, commit e PR autorizados pelo usuário com as pendências de D15 | Cenários aplicáveis do motor e gerador aprovados em testes automatizados; suíte completa com 70 aprovações, sem falhas |
| 4 | Protótipo jogável integrado | Menu, webcam, iniciativa virtual, arena e resultado; integrar gestos, RNG e motor | [Protótipo](dist/jogo.html) e [relatório](docs/ENTREGA_04.md), implementados e revisados estaticamente; recorte exploratório do usuário em D17 e commit/PR autorizados após revisão final do registro | Usuário relatou reconhecimento positivo, alternância com dano até vitória e exibição do resultado/opções; unicidade, rejeição, recuperação, cliques, métricas e demais cenários ainda pendentes |
| 5 | Interface visual e acessibilidade | Refinar personagens preto/branco, arena, cartões de magia, barras, feedback de gestos e rolagens, histórico, efeitos, responsividade, contraste e controles por teclado | Versão visual revisável no computador e em telas pequenas, conforme decisão D12 | Identidade dos jogadores, jogador ativo, etapa atual e resultado são legíveis; movimento pode ser reduzido; menus e controles auxiliares operam por teclado |
| 6 | Validação de ponta a ponta | Percorrer verificações essenciais desta seção, corrigir falhas e registrar limites de hardware/reconhecimento encontrados | Registro de verificações, problemas corrigidos e limitações conhecidas | Fluxos essenciais passam, inclusive falhas de câmera, gesto incompleto, consumo único da ação, ataque fatal, revanche e retorno ao menu |
| 7 | Pacote de entrega | Preparar instruções de execução e configuração das câmeras; publicar/hospedar somente se fizer parte do escopo acordado para implementação | Versão executável e guia curto de instalação, uso e limitações | Outra pessoa consegue iniciar o jogo e preparar as câmeras seguindo o guia; versão e limitações estão identificadas |

### Dependências e pontos de decisão

- A entrega 2 foi concluída e aceita com escopo limitado: seis gestos positivos registrados; rejeição, unicidade e recuperação não têm evidência. A investigação de leitura física de d20 foi retirada por D13, sem ter sido validada.
- A entrega 3 pode avançar em paralelo ao ensaio técnico depois que as regras da entrega 1 estiverem consolidadas, porque usa resultados controlados e não depende das câmeras.
- A aparência final da entrega 5 depende do fluxo integrado da entrega 4; arte raster é opcional e pode ser substituída por SVG/CSS.
- A publicação da entrega 7 depende de confirmação do escopo de hospedagem; a versão executável e o guia continuam sendo entregáveis mesmo sem publicação.

### Lembrete obrigatório nas próximas entregas — D15/D17

D15 adiou verificações integradas e físicas; D17 registra um recorte exploratório positivo da partida relatado pelo usuário. Antes de planejar **e** antes de fechar **cada** Entrega 5–7, o coordenador deve relembrar os casos ainda sem evidência e registrar a decisão sobre retomá-los. Permanecem unicidade ao sustentar o gesto, região inativa/central, ambiguidades/duas mãos, falha/recuperação e respostas antigas, cliques de revanche/encerramento/menu, precisão/rejeição/latência, BFCache, testes automatizados da integração e demais cenários A01–A23. Não tratar facilidade percebida como precisão medida nem evidência sintética como física.

| Entrega | Retomada a lembrar ao usuário |
| --- | --- |
| 5 — Interface e acessibilidade | Relembrar os testes integrados e físicos ainda pendentes ao planejar e fechar o refinamento visual |
| 6 — Validação de ponta a ponta | Revisar essas pendências antes de concluir a etapa; adiamento não equivale a fluxo integrado validado |
| 7 — Pacote de entrega | Revisar as pendências antes de preparar e fechar o pacote, incluindo no guia os limites que continuarem sem evidência |

### Estado atual

- Entrega 1: concluída e aprovada; especificação 1.1, fluxo de estados, 23 cenários de aceitação e decisões D01 a D12 aprovados; commit `c9d1d7b`.
- Entrega 2: concluída e aceita no escopo limitado do ensaio; seis gestos positivos (três por jogador), uma sessão e cerca de 1.957 quadros. Rejeição, unicidade, recuperação e métricas não foram registradas; ver relatório. Commit da entrega 2 registrado em `cf988a0`; agentes, plugin e atualização documental registrados em `bcda282`. [Guia](docs/GUIA_ENSAIO.md) e [relatório](docs/ENTREGA_02.md).
- Entrega 3: motor determinístico implementado e cenários aplicáveis verificados com entradas controladas, sem integração ao laboratório. Suíte com 70 testes aprovados; [contrato e evidências](docs/ENTREGA_03.md). Dois achados da revisão sobre captura de entradas foram corrigidos, cobertos por oito regressões e confirmados como resolvidos na nova revisão independente, sem novos achados acionáveis. A Entrega 3 foi integrada à `main` pela [PR #3](https://github.com/EndrewGomess/MageBattle2D/pull/3), no merge `0fd5b20`; a autorização está registrada em D15. Testes integrados/físicos adiados conforme D15.
- Entrega 4: protótipo integrado implementado conforme D16, com controlador independente do DOM, adapter exclusivo de worker e recursos separados do laboratório. Revisão independente concluída por leitura, com P2 de BFCache corrigido e confirmado estaticamente, sem outros achados acionáveis. Reconhecimento positivo dos três gestos, alternância/dano até vitória e exibição do resultado/opções foram observados no relato exploratório do usuário; demais verificações de D17 continuam pendentes. Os agentes não executaram testes/navegador nesta entrega. Commit e PR explicitamente autorizados pelo usuário após revisão final do registro conforme D17; execução consultável no histórico Git e na PR correspondente, quando criada. [Relatório](docs/ENTREGA_04.md).
- Entregas 5 a 7: não iniciadas.

### Revisão e commit por entrega

Conforme solicitado pelo usuário em 27/10/2026, cada entrega terá um commit próprio. Ao concluir o trabalho de uma entrega, mostrar os artefatos, resumir as alterações e as verificações e perguntar se o usuário autoriza criar o commit. Aguardar a autorização explícita antes de executar o commit. A aprovação de uma entrega não autoriza antecipadamente os commits das próximas.

Commit autorizado para a entrega 1: `docs: definir especificacao da entrega 1`. Arquivos: `PLANEJAMENTO.md`, `ESPECIFICACAO.md` e `DECISOES.md`. Por ser o primeiro commit do repositório, também registra o planejamento já existente.

Autorização da entrega 3: criar seu commit e abrir a PR, conforme pedido explícito de 29/10/2026. Registrar o motor testado com as pendências de D15; não solicitar essa autorização novamente. A execução pode ser consultada no histórico Git e na PR correspondente, quando criada. A autorização não antecipa as próximas entregas.

Autorização específica da Entrega 4: o usuário pediu criar seu commit e abrir a PR após a revisão final do registro do relato exploratório e das pendências de D17. A autorização já existe; não solicitar novamente. Consultar a execução no histórico Git e na PR correspondente, quando criada. Isso não autoriza iniciar as Entregas 5–7.

O checklist de aceitação detalhado permanece abaixo e deve ser usado principalmente na entrega 6. A ordem prioriza reduzir o risco de visão computacional e provar uma partida funcional antes do refinamento visual.

Verificações essenciais futuras, somente mediante pedido do usuário:

- Webcam única com prévia, regiões e confirmação temporal; gesto inativo/ambíguo não confirma.
- Cada seleção gera um ou dois inteiros de 1 a 20; dois valores iguais são permitidos; vantagem usa maior e desvantagem menor.
- Gesto mantido não repete rolagem; Nova seleção rearma somente uma tentativa; respostas assíncronas antigas são descartadas.
- Interrupção, vídeo congelado, troca de jogador e reconexão preservam resultado e bloqueiam novas confirmações até recuperação explícita.
- Iniciativa futura respeita maior resultado e novo par em empate.
- No alvo D18, igualdade com CA erra sem gerar d6; escolhido 20 ativa crítico com bônus fixo não dobrado e Bola maximizada; erro consome turno e ataque fatal encerra antes de resposta.
- Revanche, menu e validação de atributos conforme especificação, nas entregas futuras.
Observação histórica de balanceamento, anterior a D18: com CA 12 e dano padrão 10, foram calculadas médias por ação de 3,2 para vantagem, 4 para normal e 3,2 para desvantagem. Esses valores se referem ao dano fixo antigo; não representam o balanceamento das novas fórmulas e críticos. A avaliação do alvo D18 permanece pendente.

## 6. Relatório de consumo — registros históricos e rodada atual

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

Registro histórico anterior a D13 da entrega 2: laboratório de câmeras, gestos, segmentação, OCR experimental, exportação de evidências e guia implementados; 18 testes automatizados e verificação de sintaxe aprovados; modelos carregados no navegador. O ensaio físico aguarda autorização das câmeras e medições. Não foi disponibilizada contagem de tokens por atividade desta execução.

Atualização de 28/10/2026 — interface gráfica 2D: requisito explicitado e opções de execução comparadas no planejamento. Não foi disponibilizada contagem de tokens por etapa de análise, pesquisa, edição ou revisão documental; os percentuais históricos acima não medem esta rodada.

A Entrega 3 foi integrada à `main` pela [PR #3](https://github.com/EndrewGomess/MageBattle2D/pull/3), no merge `0fd5b20`; a autorização está registrada em D15. Os testes foram criados, armazenados e executados mediante pedido explícito, e a revisão independente final confirmou as correções sem novos achados acionáveis; comandos e resultados estão no relatório da entrega. Manter as verificações integradas e físicas restantes pendentes e relembrá-las em cada Entrega 5–7 conforme D15/D17, preservando o recorte exploratório já relatado pelo usuário.

Atualização D13 — 28/10/2026: laboratório adaptado a uma webcam e rolagens virtuais, com preservação de resultados, seleção única e exportação separando software e observações do operador. Tokens por etapa: análise, implementação e revisão não disponibilizados; nenhum total numérico inferido. Nesta alteração não foram adicionados/executados testes, verificação de sintaxe ou ensaio no navegador; nenhum commit criado. Entregas 3 a 7 não iniciadas.
