# Registro de decisões — Duelo de Magos

Data: 27/10/2026. As decisões D01 a D12 foram aprovadas pelo usuário na versão 1.1, com a alteração de D05: a metade do dano é arredondada para baixo. Os requisitos de gestos antes da rolagem, duas webcams, dados físicos e escolha do maior/menor resultado permanecem os definidos no planejamento.

A [especificação aprovada da entrega 1](ESPECIFICACAO.md) incorpora estas decisões. A viabilidade técnica do reconhecimento será avaliada na entrega 2.

## Decisões aprovadas

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

## Questões técnicas para a entrega 2

| Questão | Evidência que deverá ser produzida | Situação atual |
| --- | --- | --- |
| Duas webcams simultâneas | Modelos, navegador, configuração de captura e resultado observado no computador-alvo | Não ensaiado |
| Face superior dos d20 | Leituras de 1 a 20, separação de faces laterais, dois objetos distintos e repetição do mesmo valor | Não ensaiado |
| Gestos do jogador ativo | Reconhecimento dos três sinais e rejeição de gestos do jogador inativo | Não ensaiado |
| Qualidade da leitura | Resultados observados, falhas, tempo de confirmação e limiares de estabilidade/confiança adotados | Sem medição |
| Método de reconhecimento | Abordagem escolhida, requisitos, execução no navegador ou necessidade de backend | A definir após ensaio |

Se o ensaio não sustentar a leitura dos dados, a entrega 2 deve registrar o bloqueio e alternativas antes da integração. Uma alternativa que mude a interação prevista precisa voltar para revisão do usuário.

## Histórico de aprovação

| Data | Evento | Situação |
| --- | --- | --- |
| 27/10/2026 | Especificação e propostas da entrega 1 preparadas para revisão | Aguardando aprovação; nenhum commit criado |
| 27/10/2026 | Usuário solicitou como única alteração arredondar a metade do dano para baixo; documentos e cenários atualizados | Regra de arredondamento confirmada; commit ainda aguarda autorização |
| 27/10/2026 | Usuário aprovou a versão 1.1 revisada e autorizou o commit da entrega 1 | Decisões D01 a D12 aprovadas; entrega 1 concluída; commit autorizado |
