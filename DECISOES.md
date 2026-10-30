# Registro de decisões — Duelo de Magos

Histórico: D01 a D12 foram aprovadas na versão 1.1 em 27/10/2026, incluindo piso para metade do dano. Vigente em 28/10/2026: D13 substitui duas webcams e dados físicos por uma webcam de gestos e d20 virtuais. As regras de maior/menor resultado, CA, dano e vitória permanecem. D02 e D10–D12 abaixo devem ser lidas com as substituições de D13.

A [especificação aprovada da entrega 1](ESPECIFICACAO.md) incorpora estas decisões. A viabilidade técnica do reconhecimento será avaliada na entrega 2.

## Decisões D01 a D12 — histórico aprovado da versão 1.1

| ID | Decisão | Regra aprovada desta versão | Motivo / efeito | Aplicação ou validação seguinte |
| --- | --- | --- | --- | --- |
| D01 | Valor inicial e faixa da CA | Começar em 12; aceitar inteiros de 1 a 19 | Mantém uma possibilidade de acerto com a regra resultado > CA | Aplicar no motor, entrega 3 |
| D02 | Captura da iniciativa e empate | Um d20 físico por jogador, primeiro jogador 1 e depois jogador 2; em empate ambos repetem | Usa o mesmo ciclo de captura física e define o desempate | Aplicar no motor, entrega 3 |
| D03 | Correspondência entre ataques e magias | Fraco/Mísseis = vantagem e metade do dano arredondada para baixo; normal/Raio = um dado e dano padrão; crítico/Bola = desvantagem e dobro do dano | Fecha a tabela usada no motor e nos cartões | Aplicar no motor, entrega 3 |
| D04 | Efeitos de 1, 20 e crítico | Naturais seguem a comparação comum; crítico é apenas a opção de dano dobrado | Evita acrescentar multiplicadores ou efeitos não especificados | Aplicar no motor, entrega 3 |
| D05 | Metades e limite inferior da vida | `piso(dano padrão / 2)`; 9 resulta em 4 e 1 resulta em 0; limitar a vida a zero após o dano | Mantém o dano derivado inteiro, incluindo zero; define apresentação da vida | Aplicar no motor, entrega 3 |
| D06 | Repetição e resolução das magias | Sem custo ou recarga; Mísseis Mágicos é uma resolução por turno | Mantém o escopo de três ações de combate | Aplicar no motor, entrega 3 |
| D07 | Gestos e confirmação | Indicador = Mísseis; V = Raio; mão aberta = Bola; manter por cerca de um segundo; perda ou mudança reinicia progresso | Oferece três sinais e feedback de seleção; duração será avaliada no ensaio | Validar reconhecimento e duração na entrega 2 |
| D08 | Identificação do jogador ativo | Uma região visível por jogador; só a região do jogador ativo seleciona; ambiguidades não confirmam | Evita seleção pelo oponente; separação precisa ser validada | Validar separação na entrega 2 |
| D09 | Alteração da magia confirmada | Travar a magia até resolver a ação ou reiniciar a partida | Define o compromisso entre seleção e lançamento dos dados | Aplicar na integração, entrega 4 |
| D10 | Rolagem e consumo de captura | Área vazia após preparar cada ação; quantidade exata; dois dados juntos para vantagem/desvantagem; leitura estável e sem mãos; consumo único | Impede reaproveitamento, captura parcial e duplicação de ações | Validar captura na entrega 2 e aplicar na integração |
| D11 | Recuperação após falha da câmera | Preservar partida e resultados consumidos; descartar leitura pendente e exigir área vazia; gesto não confirmado reinicia | Retoma a ação sem repetir um ataque ou perder o turno | Aplicar na integração, entrega 4 |
| D12 | Plataforma e arquitetura da primeira versão | Jogo no navegador de um computador com duas webcams; HTML/CSS/JavaScript e SVG/CSS; telas pequenas entram na revisão visual; método de visão e necessidade de backend dependem do ensaio | Define o alvo funcional sem presumir suporte de celular ou reconhecimento já disponível | Validar a arquitetura e registrar hardware/navegador na entrega 2 |

## Questões históricas da investigação física — retiradas do escopo vigente por D13

| Questão | Evidência que deverá ser produzida | Situação atual |
| --- | --- | --- |
| Duas webcams simultâneas | Modelos, navegador, configuração de captura e resultado observado no computador-alvo | Não ensaiado |
| Face superior dos d20 | Leituras de 1 a 20, separação de faces laterais, dois objetos distintos e repetição do mesmo valor | Não ensaiado |
| Gestos do jogador ativo | Reconhecimento dos três sinais e rejeição de gestos do jogador inativo | Não ensaiado |
| Qualidade da leitura | Resultados observados, falhas, tempo de confirmação e limiares de estabilidade/confiança adotados | Sem medição |
| Método de reconhecimento | Abordagem escolhida, requisitos, execução no navegador ou necessidade de backend | A definir após ensaio |

Histórico do protótipo anterior a D13, sem aprovação do reconhecimento físico: MediaPipe Gesture Recognizer para gestos; diferença de fundo e OCR central experimental ou face marcada para dados. A inicialização dos modelos foi verificada; a adequação física e a localização automática da face superior continuam pendentes. Evidências e decisão provisória de manter a integração bloqueada estão no [relatório da entrega 2](docs/ENTREGA_02.md).

A investigação de d20 físicos foi retirada do escopo por D13; isso não constitui aprovação das leituras antigas. A pendência física atual é o reconhecimento dos gestos com a webcam.

## Histórico de aprovação

| Data | Evento | Situação |
| --- | --- | --- |
| 27/10/2026 | Especificação e propostas da entrega 1 preparadas para revisão | Aguardando aprovação; nenhum commit criado |
| 27/10/2026 | Usuário solicitou como única alteração arredondar a metade do dano para baixo; documentos e cenários atualizados | Regra de arredondamento confirmada; commit ainda aguarda autorização |
| 27/10/2026 | Usuário aprovou a versão 1.1 revisada e autorizou o commit da entrega 1 | Decisões D01 a D12 aprovadas; entrega 1 concluída; commit autorizado |
| 29/10/2026 | Usuário autorizou criar o commit e abrir a PR da entrega 3, mantendo testes de partida integrada e webcam real pendentes por ora | Autorização para o motor testado, com limites explícitos conforme D15; execução consultável no histórico Git e na PR correspondente, quando criada |
| Rodada do relato exploratório, sem data do ensaio informada | Usuário relatou reconhecimento dos três gestos, alternância com passagem de turno, vida até zero e tela de resultado com opções de encerramento/revanche; autorizou commit e PR da Entrega 4 após revisão final | Observações atribuídas ao usuário, sem ampliar a evidência aos casos não relatados; autorização específica e pendências em D17 |

## D13 — uma webcam e rolagens virtuais (28/10/2026)

Decisão solicitada explicitamente pelo usuário: remover a câmera dos dados e os dados físicos; manter uma webcam para os gestos dos dois jogadores e gerar os d20 aleatoriamente no software. O requisito de interface gráfica 2D no navegador permanece.

| Item substituído | Regra vigente |
| --- | --- |
| D02 — iniciativa | Um d20 virtual por jogador, maior inicia; empate gera novo par. Implementação pertence ao motor futuro |
| D03 — quantidade | Normal gera 1d20; vantagem gera 2d20 e usa maior; desvantagem gera 2d20 e usa menor. Valores independentes de 1 a 20, repetições permitidas |
| D09/D10 — seleção e rolagem | Magia confirmada gera uma única rolagem automática; manter gesto não repete. Não há área vazia, objetos, captura de face ou OCR. Laboratório rearma por Nova seleção |
| D11 — recuperação | Preservar seleção confirmada, valores e registros; suspender novas confirmações por falha/stop/troca de câmera ou jogador. Reconectar não rola; exigir Nova seleção após recuperação. Descartar progresso pendente e resultados assíncronos antigos |
| D12 — equipamento e arquitetura | Navegador desktop, HTML/CSS/JavaScript, interface 2D e uma webcam. Reconhecimento físico de gestos ainda a ensaiar; modelo carregado pela internet |

D01, D04–D08 e demais regras de dano, CA e vitória permanecem. A entrega 2 recebe apenas laboratório de gestos e rolagens, sem dano, vida, combate ou turno automático. Entregas 3 a 7 não iniciadas. Nenhum teste foi adicionado ou executado nesta alteração; nenhum commit criado. As observações históricas de duas câmeras/OCR não validam o fluxo atual.


## D14 — prévia espelhada e limiar específico para mão aberta (29/10/2026)

A prévia da webcam é espelhada para facilitar o posicionamento; a conversão das coordenadas de inferência para a prévia ocorre uma única vez no cálculo da região do jogador. O jogador 1 fica à esquerda e o jogador 2 à direita. Open_Palm usa limiar inicial 0,60; Pointing_Up e Victory permanecem em 0,75. A confirmação continua exigindo um gesto elegível por 1000 ms, intervalo máximo de 500 ms entre observações e rejeição de ambiguidades. Os limiares são ajustes experimentais, sem precisão física comprovada. A exportação inclui o modo espelhado e escores das classes observadas. O ensaio de 29/10 registrou seis gestos positivos, uma sessão e cerca de 1.957 quadros; rejeição, unicidade, recuperação e métricas não foram registradas. A entrega 2 foi aceita com esses limites.

## D15 — registro da entrega 3 e adiamento das verificações integradas e físicas (29/10/2026)

O usuário autorizou explicitamente criar o commit e abrir a PR da entrega 3 para o motor determinístico testado em 29/10/2026, preservando as pendências conhecidas. A execução pode ser consultada no histórico Git e na PR correspondente, quando criada. A autorização não inicia nem libera as entregas 4 a 7 e não altera as regras de combate.

As evidências da entrega 3 permanecem: 70/70 testes aprovados, cobertura focada de 100% de linhas, ramos e funções em `combat.js` e `dice.js`, sintaxe 15/15 e revisão independente final sem novos achados acionáveis após resolver os dois P2. Esses resultados não demonstram uma partida integrada ou a qualidade física dos gestos.

Por decisão explícita do usuário, os testes de partida integrada e de webcam real ficam adiados por ora. Continuam pendentes a unicidade da seleção no aplicativo, descarte de respostas antigas, suspensão/recuperação, partida completa, revanche e retorno ao menu, além de rejeição de gestos inativos/ambíguos e métricas físicas de precisão, rejeição e latência. Evidências sintéticas não devem ser apresentadas como ensaio físico.

Em cada uma das próximas entregas 4, 5, 6 e 7, o coordenador deve lembrar essas pendências ao usuário antes de planejar e antes de fechar a etapa, registrando a decisão atual sobre retomá-las. Atenção especial antes de concluir a validação de ponta a ponta ou preparar o pacote de entrega; o adiamento não equivale à execução ou aprovação desses testes.

Atualização de D15 por D17: o recorte exploratório relatado pelo usuário passa a ser evidência positiva da Entrega 4 nos comportamentos descritos. As verificações integradas e físicas restantes continuam pendentes e devem ser relembradas ao planejar/fechar cada Entrega 5–7; não se considera todo o fluxo validado.

## D16 — implementação do protótipo integrado com validações pendentes (29/10/2026)

O usuário aprovou implementar o plano da Entrega 4, com menu, preparação de uma webcam, iniciativa virtual, arena funcional, gestos, dados, motor, resultado, revanche e retorno ao menu. A autorização permite construir o protótipo apesar das evidências físicas ainda pendentes, substituindo para esta implementação o antigo bloqueio de início da integração. O laboratório e suas evidências permanecem preservados. Não se declara a partida integrada ou o reconhecimento físico validado.

Nesta rodada não adicionar nem executar testes, navegador ou webcam; realizar implementação e revisão estática. Testes da partida integrada e ensaio físico seguem adiados conforme D15, sem transformar os resultados históricos da Entrega 3 em evidência dos novos fluxos. Ao final, apresentar para revisão do usuário; a autorização de commit/PR da Entrega 3 não autoriza commit da Entrega 4. Entregas 5–7 continuam fora desta rodada.

As regras de combate e D13/D14 permanecem: uma webcam, prévia espelhada, confirmação temporal por região e d20 virtuais gerados pelo software. Falhas suspendem sem reaplicar dano, repetir rolagem ou avançar turno; reconectar exige confirmação explícita de retomada. A arquitetura implementada e os critérios pendentes estão em [ENTREGA_04.md](docs/ENTREGA_04.md). O lembrete de D15 vale antes de fechar a Entrega 4 e em cada planejamento/fechamento das Entregas 5–7.

## D17 — relato exploratório e autorização de registro da Entrega 4

O usuário relatou reconhecimento fácil dos três gestos, ataques alternados com passagem de turno, redução da vida até zero e tela de resultado com opções de encerramento e revanche. Esses comportamentos estão observados no relato exploratório do usuário. Não foram informados data do ensaio, hardware, navegador, configurações, quantidades ou métricas; não inferir esses dados nem converter facilidade percebida em precisão medida.

O relato não confirma unicidade ao sustentar gesto, rejeição da região inativa/central, ambiguidade/duas mãos, falha/recuperação, descarte de respostas antigas ou métricas de precisão/rejeição/latência. Exibição dos botões não comprova os cliques de revanche, encerramento ou retorno ao menu. Restam a execução controlada dos demais cenários A01–A23, BFCache e testes automatizados da integração. A correção estática do P2 de BFCache e as evidências históricas da Entrega 3 permanecem preservadas.

O usuário autorizou explicitamente criar o commit e abrir a PR da Entrega 4 após a revisão final deste registro, com essas pendências. A execução pode ser consultada no histórico Git e na PR correspondente, quando criada; não é autorização para iniciar as Entregas 5–7. O coordenador deve lembrar as verificações ainda pendentes antes de planejar e fechar cada uma dessas próximas entregas, conforme a atualização de D15. As regras de combate permanecem inalteradas.
