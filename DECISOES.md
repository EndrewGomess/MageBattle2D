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
