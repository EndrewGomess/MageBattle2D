# Especificação — Duelo de Magos

Versão vigente: 1.2, atualizada em 28/10/2026 pelo pedido de uma webcam e d20 virtuais (D13). A versão 1.1 da entrega 1 foi aprovada e registrada no commit `c9d1d7b`; essa aprovação e suas evidências são históricas. A entrega 2 foi concluída e aceita no escopo limitado do ensaio de 29/10/2026: seis gestos positivos, três por jogador. Rejeição, unicidade, recuperação e métricas não foram registradas; consulte docs/ENTREGA_02.md. Em 29/10/2026, o usuário autorizou commit e PR do motor testado da entrega 3, mantendo testes integrados e físicos adiados por ora (D15); isso não libera as entregas 4 a 7.

## 1. Escopo e equipamento

Jogo 1v1 por turnos, em português, com interface gráfica 2D no navegador de um computador. Dois jogadores humanos: mago preto à esquerda e mago branco à direita, com nomes, posição e indicação de turno além da cor. Uma única webcam observa os gestos dos dois jogadores. Os resultados dos d20 são gerados aleatoriamente pelo software; não há dados físicos, câmera de dados, OCR ou entrada manual de números no fluxo vigente.

A versão futura do jogo inclui menu, preparação da webcam, iniciativa, magias, vida, histórico, vitória, revanche e retorno ao menu. O laboratório atual da entrega 2 demonstra somente gestos e rolagens virtuais, sem aplicar dano, decidir acerto ou alternar turnos de combate. O motor independente da entrega 3 foi implementado e os cenários aplicáveis ao motor e gerador foram verificados automaticamente; dois achados de captura de entradas foram corrigidos com regressões e confirmados como resolvidos na revisão independente final, sem novos achados acionáveis. Commit e PR autorizados em 29/10/2026 conforme D15; a execução pode ser consultada no histórico Git e na PR correspondente, quando criada. Testes de partida integrada e webcam real seguem adiados conforme D15. Consulte [o contrato e as evidências](docs/ENTREGA_03.md). Entregas 4 a 7 não iniciadas.

Multiplayer online, IA adversária, outras classes, mana, equipamentos e progressão permanecem fora do escopo. Celular não é alvo funcional; telas pequenas entram apenas na revisão visual. O modelo de gestos atual exige internet no carregamento, com reconhecimento executado localmente.

## 2. Regras preservadas

| Item | Regra |
| --- | --- |
| Vida máxima | Inicial 50; inteiro positivo, igual para os dois jogadores |
| Dano padrão | Inicial 10; inteiro positivo, igual para os dois jogadores |
| CA | Inicial 12; inteiro de 1 a 19, igual para os dois jogadores |
| Configuração inválida | Bloqueia início e identifica campo; vazio, zero, negativo, fração e texto são inválidos |
| Acerto | Resultado escolhido estritamente maior que CA; igualdade erra |
| Erro | Dano zero; consome o turno após a resolução válida |
| Vitória | Vida limitada a zero; encerrar antes de outra ação do derrotado |

### Iniciativa futura — entrega 3

O sistema gera 1d20 virtual para cada jogador, em ordem jogador 1 e jogador 2. O maior inicia; empate gera um novo par até desempatar. Não há seleção de magia ou dano na iniciativa. Exibir todos os resultados; a ordem permanece fixa no combate. Esta regra não representa uma iniciativa já implementada no laboratório.

### Magias

| Tipo | Gesto / classe reconhecida | Magia | Dados virtuais | Escolha | Dano no acerto |
| --- | --- | --- | --- | --- | --- |
| Vantagem / fraco | Indicador / Pointing_Up | Mísseis Mágicos | 2d20 | Maior | piso(padrão / 2) |
| Normal | V / Victory | Raio de Fogo | 1d20 | Único | Padrão |
| Desvantagem / crítico | Mão aberta / Open_Palm | Bola de Fogo | 2d20 | Menor | Padrão × 2 |

Com dano padrão 10, os danos são 5, 10 e 20. Com padrão 9, a metade é 4; com padrão 1, é 0. Acertar com dano zero ainda consome o turno. Naturais 1 e 20 seguem comparação comum, sem efeitos extras; o crítico já é o dano dobrado. Magias sem custo ou recarga; Mísseis Mágicos resolve uma única ação.

## 3. Webcam, gestos e dados virtuais

Selecionar uma webcam sem áudio e conferir a prévia espelhada: região esquerda para jogador 1 e direita para jogador 2, com faixa central sem confirmação. Apenas uma mão elegível na região ativa pode confirmar magia. Manter o gesto reconhecido por cerca de um segundo; mudança, ausência, ambiguidade ou intervalo excessivo reinicia progresso ainda não confirmado. As coordenadas da imagem de inferência são convertidas uma vez para corresponder à prévia. Limiares iniciais: Open_Palm 0,60; Pointing_Up e Victory 0,75. Escore e duração são parâmetros de ensaio, sem precisão física demonstrada.

Confirmar a magia gera uma única rolagem automática: um valor de 1 a 20 para normal; dois valores independentes de 1 a 20 para vantagem/desvantagem. Cada face tem probabilidade 1/20 sob a fonte pseudoaleatória utilizada. Valores iguais são permitidos. Mostrar todos os valores e destacar o escolhido; não escolher novamente em quadros seguintes, por manter o gesto, reconectar ou trocar o jogador ativo. Resultados não são informados pelo operador.

No laboratório, Nova seleção rearma explicitamente a tentativa. A primeira conexão pode iniciar a primeira seleção; trocar jogador, reconectar ou recuperar falha exige Nova seleção. O último resultado continua visível com seu jogador e identificador; registros anteriores são preservados. No jogo futuro, a mudança regular para o próximo turno deverá rearmar uma nova ação sem reutilizar a rolagem anterior.

### Falha e recuperação

Permissão negada, indisponibilidade, vídeo sem novos quadros, aba oculta e falha do reconhecedor suspendem novas confirmações. Encerrar ou trocar câmera também suspende. Preservar magia já confirmada, rolagem gerada e registros; descartar progresso não confirmado. Reconectar não sorteia novamente. Após recuperar a câmera, exigir Nova seleção no laboratório. Resultados assíncronos de uma sessão, jogador ou seleção anterior devem ser descartados.

No jogo futuro, preservar também configuração, vida, jogador ativo e iniciativa já resolvida, sem aplicar dano ou passar turno por falha. D13 substitui a antiga exigência de área vazia e recaptura física de D10/D11.

## 4. Telas e estados do jogo futuro

| Estado | Conteúdo e avanço |
| --- | --- |
| Menu | Vida, dano, CA e prévia dos danos; início somente com configuração válida |
| Preparação | Seletor de uma webcam e prévia com regiões; confirmar enquadramento |
| Iniciativa | Gerar um d20 virtual por jogador e repetir o par em empate |
| Aguardando gesto | Jogador ativo, cartões e progresso; confirmar gesto estável |
| Rolagem virtual | Uma geração por ação confirmada, com todos os valores e escolhido |
| Resolução | Comparar CA e aplicar dano uma vez; registrar histórico |
| Próximo turno | Se alvo vivo, limpar seleção e preparar nova ação do oponente |
| Resultado | Vencedor, Revanche e Voltar ao menu |
| Suspenso | Preservar estado e recuperar webcam sem repetir resultado |

Arena 2D: dois magos, nome, vida atual/máxima, barras, CA, turno, uma prévia de gestos e resultados virtuais. Histórico: turno, atacante, magia, todos os valores gerados, valor escolhido, CA, acerto/erro e dano. Bloquear ações durante resolução. Menus por teclado, contraste legível e opção de reduzir movimento.

Revanche preserva atributos e câmera disponível, restaura vida, limpa histórico e seleção e gera nova iniciativa. Voltar ao menu permite editar atributos. O laboratório não implementa esses fluxos de combate.

## 5. Cenários de aceitação e evidências por entrega

Cenários do motor usam alvo com 50 de vida, CA 12 e dano padrão 10, salvo indicação contrária. Em 29/10/2026, mediante pedido explícito do usuário, os cenários aplicáveis ao motor e gerador foram executados com entradas controladas. O [relatório da entrega 3](docs/ENTREGA_03.md) separa os resultados automatizados dos casos de integração e webcam física ainda pendentes. A tabela abaixo preserva os resultados esperados do jogo.

| ID | Situação | Resultado esperado |
| --- | --- | --- |
| A01 | Vida 0, dano 1,5 ou CA 20 | Bloquear início e identificar campo |
| A02 | Iniciativa virtual 15 e 8 | Jogador 1 inicia |
| A03 | Iniciativa virtual 11 e 11 | Gerar novo par até desempatar |
| A04 | Raio gera 12 | Erra; vida 50; passa turno |
| A05 | Raio gera 13 | Acerta; vida 40; passa turno |
| A06 | Mísseis geram 7 e 18 | Usa 18; vida 45 |
| A07 | Bola gera 7 e 18 | Usa 7; erra; vida 50 |
| A08 | Bola gera 13 e 20 | Usa 13; vida 30 |
| A09 | Mísseis geram 15 e 15 | Dois valores mantidos; usa 15; vida 45 |
| A10 | Seleção normal confirmada | Gera exatamente um inteiro entre 1 e 20 |
| A11 | Seleção vantagem/desvantagem confirmada | Duas chamadas independentes; usa maior/menor respectivamente |
| A12 | Gesto muda, some ou intervalo excede limite antes da confirmação | Reinicia progresso; não gera dados |
| A13 | Nova seleção explícita no laboratório | Rearma tentativa sem reutilizar a rolagem anterior |
| A14 | Gesto confirmado permanece por vários quadros | Apenas uma rolagem para a seleção; no jogo, uma resolução/histórico |
| A15 | Padrão 9 e Mísseis acertam | Dano 4; vida 46 |
| A16 | Alvo com 5 e Raio acerta | Vida 0; atacante vence; derrotado não age |
| A17 | Jogador inativo gesticula ou muda sinal após confirmar | Não altera magia nem gera outra rolagem |
| A18 | Falha/reconexão após confirmação ou durante progresso | Preserva resultado confirmado; progresso pendente descartado; exige Nova seleção; nenhum dano/turno por falha |
| A19 | Revanche futura | Restaura vida, limpa histórico e gera nova iniciativa |
| A20 | Voltar ao menu futuro | Permite editar atributos |
| A21 | Só uma webcam conectada | Preparação não exige segundo dispositivo; falha da única câmera suspende seleção |
| A22 | Raio gera 20 | Dano 10, sem multiplicador extra |
| A23 | Padrão 1 e Mísseis acertam | Dano 0; vida 50; passa turno |

## 6. Histórico e limite da entrega

A versão 1.1, aprovada em 27/10/2026, previa duas webcams e d20 físicos; D13 altera esses pontos por solicitação do usuário, sem declarar a antiga leitura física aprovada. As evidências antigas continuam identificadas em docs/ENTREGA_02.md. O ensaio de 29/10/2026 sustenta somente os seis gestos positivos registrados; rejeição, unicidade, recuperação e métricas permanecem sem evidência. A entrega 2 foi aceita com esses limites. Código do motor e integração pertencem às entregas 3 e 4.
