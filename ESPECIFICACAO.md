# Especificação — Duelo de Magos

**D18 implementada, ainda não testada.** Motor, gerador, controlador e interface funcional foram adaptados para dano em d6 e crítico natural, sem `baseDamage`. Revisão independente concluída por leitura, sem achados funcionais acionáveis. Os 70/70 históricos não validam D18; a suíte antiga não foi atualizada nem executada. Contrato e limites em [D18.md](docs/D18.md). O refinamento visual da Entrega 5 permanece separado.

Base histórica anterior à adaptação D18: versão 1.2, atualizada em 28/10/2026 pelo pedido de uma webcam e d20 virtuais (D13). A versão 1.1 da entrega 1 foi aprovada e registrada no commit `c9d1d7b`; essa aprovação e suas evidências são históricas. A entrega 2 foi concluída e aceita no escopo limitado do ensaio de 29/10/2026: seis gestos positivos, três por jogador. Rejeição, unicidade, recuperação e métricas não foram registradas; consulte docs/ENTREGA_02.md. Em 29/10/2026, o usuário autorizou commit e PR do motor testado da entrega 3, mantendo testes integrados e físicos adiados por ora (D15); isso não libera as entregas 4 a 7.

## 1. Escopo e equipamento

Jogo 1v1 por turnos, em português, com interface gráfica 2D no navegador de um computador. Dois jogadores humanos: mago preto à esquerda e mago branco à direita, com nomes, posição e indicação de turno além da cor. Uma única webcam observa os gestos dos dois jogadores. Os resultados dos d20 são gerados aleatoriamente pelo software; não há dados físicos, câmera de dados, OCR ou entrada manual de números no fluxo vigente.

A versão futura do jogo inclui menu, preparação da webcam, iniciativa, magias, vida, histórico, vitória, revanche e retorno ao menu. O laboratório atual da entrega 2 demonstra somente gestos e rolagens virtuais, sem aplicar dano, decidir acerto ou alternar turnos de combate. O motor independente da entrega 3 foi implementado e os cenários aplicáveis ao motor e gerador foram verificados automaticamente; dois achados de captura de entradas foram corrigidos com regressões e confirmados como resolvidos na revisão independente final, sem novos achados acionáveis. A Entrega 3 foi integrada à `main` pela [PR #3](https://github.com/EndrewGomess/MageBattle2D/pull/3), no merge `0fd5b20`; a autorização está registrada em D15. Testes de partida integrada e webcam real seguem adiados conforme D15. Consulte [o contrato e as evidências](docs/ENTREGA_03.md). A Entrega 4 está implementada para revisão conforme D16; Entregas 5 a 7 não iniciadas.

Multiplayer online, IA adversária, outras classes, mana, equipamentos e progressão permanecem fora do escopo. Celular não é alvo funcional; telas pequenas entram apenas na revisão visual. O modelo de gestos atual exige internet no carregamento, com reconhecimento executado localmente.

Atualização da entrega 4 — D16/D17: `dist/jogo.html` implementa separadamente menu, preparação de webcam, iniciativa, arena, combate, resultado e revanche/menu. O usuário relatou reconhecimento fácil dos três gestos, ataques alternados passando turno, redução da vida até zero e tela de resultado com opções de encerramento/revanche. Esse recorte exploratório não comprova unicidade sustentada, rejeição/ambiguidades, falha/recuperação, métricas ou efeitos dos cliques; demais cenários controlados, BFCache e testes automatizados integrados continuam pendentes. Os agentes não executaram testes, navegador ou webcam nesta entrega. Consulte [o relato e as pendências](docs/ENTREGA_04.md). Commit e PR da Entrega 4 foram autorizados explicitamente após revisão final do registro conforme D17; execução consultável no histórico Git e na PR correspondente, quando criada. Entregas 5–7 não iniciadas.

## 2. Regras alvo confirmadas — D18

[D18](DECISOES.md) consolida as respostas: ataque por d20 contra CA, dados de dano somente após acerto, fórmulas próprias por magia, crítico pelo 20 escolhido e retirada do dano padrão. Substitui o dano fixo de D03 e a ausência de efeito para 20 natural de D04; de D05 preserva o limite da vida, retirando a derivação por metade/piso. Os registros dessas decisões e da versão 1.2 permanecem históricos; o código foi adaptado nesta etapa, sem evidência de execução.

| Item | Regra |
| --- | --- |
| Vida máxima | Inicial 50; inteiro positivo, igual para os dois jogadores |
| Dano padrão | Retirado do menu e do contrato alvo; não há `baseDamage` configurável |
| CA | Inicial 12; inteiro de 1 a 19, igual para os dois jogadores |
| Configuração inválida | Bloqueia início e identifica campo; vazio, zero, negativo, fração e texto são inválidos |
| Acerto | Resultado escolhido estritamente maior que CA; igualdade erra |
| Erro | Dano zero; consome o turno após a resolução válida |
| Dados de dano | Gerados somente no acerto; erro não gera d6 |
| Crítico natural | Resultado escolhido do ataque igual a 20, após acerto; dobra a quantidade de dados, mantém o bônus fixo; Bola usa dano maximizado |
| Vitória | Vida limitada a zero; encerrar antes de outra ação do derrotado |

### Iniciativa

O sistema gera 1d20 virtual para cada jogador, em ordem jogador 1 e jogador 2. O maior inicia; empate gera um novo par até desempatar. Não há seleção de magia ou dano na iniciativa. Exibir todos os resultados; a ordem permanece fixa no combate. O laboratório não possui iniciativa; o motor recebe os pares e o protótipo da entrega 4 implementa sua geração/apresentação. O relato exploratório não descreveu uma verificação específica da iniciativa e de seus empates.

### Magias

| Ataque | Gesto / classe reconhecida | Magia | d20 de ataque / escolhido | Dano normal no acerto | Crítico natural |
| --- | --- | --- | --- | --- | --- |
| Vantagem | Indicador / Pointing_Up | Mísseis Mágicos | 2d20 / maior | `1d6 + 1` | Maior igual a 20; rolar `2d6 + 1` |
| Normal | V / Victory | Raio de Fogo | 1d20 / único | `2d6 + 2` | Único igual a 20; rolar `4d6 + 2` |
| Desvantagem | Mão aberta / Open_Palm | Bola de Fogo | 2d20 / menor | `4d6 + 4` | Ambos iguais a 20; máximo de `8d6 + 4 = 52` |

Cada d6 rolado fornece um inteiro de 1 a 6, com chamadas independentes; valores repetidos são válidos. Os bônus `+1`, `+2` e `+4` entram uma única vez, sem dobramento. Mísseis e Raio rolam os dados críticos; o crítico de Bola aplica o máximo dos oito d6, `48`, somando `4`, em vez de uma rolagem comum de oito dados. O dano nominal é limitado à vida restante para obter o dano aplicado; o histórico distingue ambos. Natural 1 segue a comparação comum; 20 escolhido supera qualquer CA configurável vigente e ativa o crítico. Em Bola, um 20 descartado por haver outro d20 menor não causa crítico. Magias sem custo ou recarga; cada seleção resolve uma única ação.

## 3. Webcam, gestos e dados virtuais

Selecionar uma webcam sem áudio e conferir a prévia espelhada: região esquerda para jogador 1 e direita para jogador 2, com faixa central sem confirmação. Apenas uma mão elegível na região ativa pode confirmar magia. Manter o gesto reconhecido por cerca de um segundo; mudança, ausência, ambiguidade ou intervalo excessivo reinicia progresso ainda não confirmado. As coordenadas da imagem de inferência são convertidas uma vez para corresponder à prévia. Limiares iniciais: Open_Palm 0,60; Pointing_Up e Victory 0,75. Escore e duração são parâmetros de ensaio, sem precisão física demonstrada.

Confirmar a magia gera uma única rolagem automática: um valor de 1 a 20 para normal; dois valores independentes de 1 a 20 para vantagem/desvantagem. Cada face tem probabilidade 1/20 sob a fonte pseudoaleatória utilizada. Valores iguais são permitidos. Mostrar todos os valores e destacar o escolhido; não escolher novamente em quadros seguintes, por manter o gesto, reconectar ou trocar o jogador ativo. Resultados não são informados pelo operador.

No contrato alvo D18, esses d20 decidem o acerto contra CA e o crítico. Somente depois de acertar, gerar os d6 exigidos pela tabela, exceto o crítico maximizado da Bola. Erro não chama o gerador de dano. Mostrar ataque e dano separadamente, identificando fórmula, bônus e maximização quando aplicável. Preservar dados já gerados durante falhas, sem sortear novamente ou duplicar dano. O laboratório permanece diagnóstico de gestos/d20, sem combate.

No laboratório, Nova seleção rearma explicitamente a tentativa. A primeira conexão pode iniciar a primeira seleção; trocar jogador, reconectar ou recuperar falha exige Nova seleção. O último resultado continua visível com seu jogador e identificador; registros anteriores são preservados. No jogo futuro, a mudança regular para o próximo turno deverá rearmar uma nova ação sem reutilizar a rolagem anterior.

### Falha e recuperação

Permissão negada, indisponibilidade, vídeo sem novos quadros, aba oculta e falha do reconhecedor suspendem novas confirmações. Encerrar ou trocar câmera também suspende. Preservar magia já confirmada, rolagem gerada e registros; descartar progresso não confirmado. Reconectar não sorteia novamente. Após recuperar a câmera, exigir Nova seleção no laboratório. Resultados assíncronos de uma sessão, jogador ou seleção anterior devem ser descartados.

No jogo futuro, preservar também configuração, vida, jogador ativo e iniciativa já resolvida, sem aplicar dano ou passar turno por falha. D13 substitui a antiga exigência de área vazia e recaptura física de D10/D11.

## 4. Telas e estados do jogo

| Estado | Conteúdo e avanço |
| --- | --- |
| Menu | Vida e CA configuráveis, fórmulas de dano/crítico por magia; sem campo de dano padrão; início somente com configuração válida |
| Preparação | Seletor de uma webcam e prévia com regiões; confirmar enquadramento |
| Iniciativa | Gerar um d20 virtual por jogador e repetir o par em empate |
| Aguardando gesto | Jogador ativo, cartões e progresso; confirmar gesto estável |
| Rolagem virtual | Uma geração de ataque por ação confirmada; d6 de dano somente após acerto, com quantidade normal/crítica ou máximo da Bola |
| Resolução | Comparar CA, identificar crítico e aplicar dano uma vez, limitado à vida; registrar histórico |
| Próximo turno | Se alvo vivo, limpar seleção e preparar nova ação do oponente |
| Resultado | Vencedor, Revanche e Voltar ao menu |
| Suspenso | Preservar estado e recuperar webcam sem repetir resultado |

Arena 2D: dois magos, nome, vida atual/máxima, barras, CA, turno, uma prévia de gestos e resultados virtuais. Histórico alvo: turno, atacante, magia, todos os d20 de ataque, escolhido, CA, acerto/erro, crítico, fórmula de dano, resultados dos d6 rolados ou componente maximizado, bônus fixo, dano nominal e dano aplicado. Bloquear ações durante resolução. Menus por teclado, contraste legível e opção de reduzir movimento.

Revanche preserva vida máxima, CA e câmera disponível, restaura vida, limpa histórico e seleção e gera nova iniciativa. Voltar ao menu permite editar vida e CA, sem dano padrão. O laboratório não implementa esses fluxos de combate. As alterações funcionais D18 desses fluxos estão implementadas, ainda sem verificação de execução.

## 5. Cenários alvo A01–A23 — D18, não executados

Cenários alvo usam vida 50 e CA 12, salvo indicação. Ataque e dano são entradas controladas distintas para futura verificação autorizada. **Nenhum cenário desta revisão D18 foi executado.** Os IDs foram preservados, mas os casos de dano e crítico foram atualizados: A15 e A23 deixam de usar dano padrão/metade e A22 passa a exigir crítico. Os resultados históricos de 70/70 em [ENTREGA_03.md](docs/ENTREGA_03.md) pertencem à versão anterior e não são evidência da tabela abaixo. O relato exploratório D17 também ocorreu antes desta adaptação.

| ID | Situação | Resultado esperado |
| --- | --- | --- |
| A01 | Vida 0 ou 1,5; CA 20 | Bloquear início e identificar campo; menu alvo não oferece dano padrão |
| A02 | Iniciativa virtual 15 e 8 | Jogador 1 inicia |
| A03 | Iniciativa virtual 11 e 11 | Gerar novo par até desempatar |
| A04 | Raio: ataque 12 | Erra; não gera d6; dano 0; vida 50; passa turno |
| A05 | Raio: ataque 13; d6 de dano `[3,4]` | Acerto normal; dano `3+4+2=9`; vida 41; passa turno |
| A06 | Mísseis: ataque `[7,18]`; dano `[4]` | Usa 18; sem crítico; dano `4+1=5`; vida 45 |
| A07 | Bola: ataque `[7,18]` | Usa 7; erra; não gera d6; vida 50; passa turno |
| A08 | Bola: ataque `[13,20]`; dano `[1,2,3,4]` | Usa 13; o 20 descartado não ativa crítico; dano `1+2+3+4+4=14`; vida 36 |
| A09 | Mísseis: ataque `[15,15]`; dano `[5]` | Preserva ambos os d20; usa 15; dano `5+1=6`; vida 44 |
| A10 | Seleção de Raio confirmada | Gera um d20 de ataque; somente no acerto gera 2d6 normais ou 4d6 se ataque 20; bônus +2 uma vez |
| A11 | Seleção de Mísseis/Bola confirmada | Duas chamadas independentes de d20; usa maior/menor; dano posterior segue fórmula normal/crítica apenas no acerto |
| A12 | Gesto muda, some ou intervalo excede limite antes da confirmação | Reinicia progresso; não gera dados |
| A13 | Nova seleção explícita no laboratório | Rearma tentativa sem reutilizar a rolagem anterior |
| A14 | Gesto confirmado permanece por vários quadros | Um conjunto de ataque/dano para a seleção e uma resolução/histórico; não repete d20, d6 ou dano |
| A15 | Mísseis: ataque `[7,13]`; dano `[1]` | Acerto normal; dano mínimo `1+1=2`; vida 48, sem usar metade ou dano padrão |
| A16 | Bola: ataque `[20,20]`; alvo com 50 | Crítico maximizado: nominal 52, aplicado 50; vida 0; atacante vence e derrotado não age |
| A17 | Jogador inativo gesticula ou muda sinal após confirmar | Não altera magia nem gera outra rolagem |
| A18 | Falha/reconexão após confirmação ou durante progresso | Preserva ataque/dano já confirmados; descarta progresso pendente; retomada explícita no jogo/Nova seleção no laboratório; nenhum sorteio repetido, dano ou turno por falha |
| A19 | Revanche | Preserva vida máxima/CA e câmera disponível; restaura vida, limpa histórico/seleção e gera nova iniciativa |
| A20 | Voltar ao menu | Permite editar vida/CA; campo de dano padrão ausente |
| A21 | Só uma webcam conectada | Preparação não exige segundo dispositivo; falha da única câmera suspende seleção |
| A22 | Raio: ataque 20; d6 críticos `[1,2,3,4]` | Crítico `4d6+2`: nominal/aplicado 12; vida 38; bônus não dobrado |
| A23 | Mísseis: ataque `[1,20]`; d6 críticos `[2,5]` | Escolhido 20 ativa crítico `2d6+1`: dano 8; vida 42; um 20 basta |

## 6. Histórico e limite da entrega

A versão 1.1, aprovada em 27/10/2026, previa duas webcams e d20 físicos; D13 altera esses pontos por solicitação do usuário, sem declarar a antiga leitura física aprovada. As evidências antigas continuam identificadas em docs/ENTREGA_02.md. O ensaio de 29/10/2026 sustenta somente os seis gestos positivos registrados; rejeição, unicidade, recuperação e métricas permanecem sem evidência. A entrega 2 foi aceita com esses limites. Código do motor e integração pertencem às entregas 3 e 4.
