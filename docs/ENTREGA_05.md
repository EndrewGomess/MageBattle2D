# Entrega 5 — Interface visual e acessibilidade

Data de implementação: 30/10/2026. Branch: `codex/entrega-5-refinamento-visual`, baseada no commit D18 `e81db37`. Implementada para revisão do usuário; revisão independente da apresentação concluída por leitura, sem novos achados acionáveis após correção dos dois P2. Nenhum commit desta entrega foi criado. O complemento experimental de enquadramento forçado e animações foi inspecionado no navegador e revertido, restaurando a interface limpa e estável da Entrega 5.

## Apresentação implementada

A interface de `dist/jogo.html` usa a arte que o usuário forneceu em `dist/assets/interface-base.png`, apresentada por recortes SVG de cenário, magos e ilustrações. Não foi gerado outro bitmap. A fonte pixel VT323 é local, em `dist/assets/fonts/`, com licença OFL correspondente; os textos auxiliares usam fonte de sistema legível.

A composição segue a referência: faixa superior escura/dourada, mago preto à esquerda e branco à direita, HUD com vida vermelha e CA, turno central, cenário panorâmico e console inferior em três colunas. A arte é decorativa; números, nomes, progresso, dados e histórico são elementos vivos do jogo. Nenhum rosto da referência é usado como câmera. Os recortes excluem o HUD e os textos antigos da imagem.

Menu de configuração aparece sobre a arena e oferece somente vida máxima/CA. Preparação dispõe de seleção de webcam, permissão, conexão, resolução, encerramento e confirmação explícita de enquadramento. Os controles ficam em painel nativo expansível, aberto em preparação/suspensão e acessível durante o combate. O menu superior reúne laboratório, retorno ao menu e redução de movimento.

## Preservação dos contratos

Somente `jogo.html`, `game.css` e a apresentação em `game-ui.js` foram alterados. Motor, dados, controlador, reconhecedor, câmera e MediaPipe não receberam alterações desta etapa. Continua uma única prévia espelhada com regiões de 47% / faixa central de 6% / 47%, sem alterar a inferência ou duplicar vídeos.

As cartas indicam os gestos e as fórmulas corretas D18. A faixa equivalente ao botão da referência é um status com progresso; conjuração permanece automática. Não se acrescentaram alcance, área, mana ou recarga. O histórico compacto usa detalhes expansíveis preservando d20, escolhido, CA, crítico, fórmula, d6 ou componente máximo, bônus, dano nominal/aplicado e alvo. Resultados parciais preservados continuam identificados. A iniciativa mantém a lista dos pares e seu resumo fica consultável após iniciar o combate.

Foco visível, controles nativos por teclado, rótulos de jogador ativo e instruções textuais complementam as cores. Layout se reorganiza em duas colunas e depois em uma coluna em telas menores; abaixo de 540 px, as cartas se empilham horizontalmente com arte lateral e texto legível, ambos os magos permanecem no quadro e o menu pode crescer com as regras/erros; isso não muda o alvo funcional desktop. A redução de movimento do sistema e a opção do jogo desativam animações/transições. A última ação tem realce breve por registro novo, sem criar ações do controlador.

## Evidências e limites

O implementador inspecionou por leitura os arquivos, IDs e ouvintes da apresentação. Não executou testes, verificação de sintaxe, navegador ou webcam. O coordenador inspecionou visualmente menu e preparação em desktop e tela estreita no navegador, sem webcam ou suíte. A revisão independente confirmou por leitura a correção dos dois P2: resultado parcial da iniciativa visível durante suspensão e preservação dos nós do log para manter foco de teclado; não encontrou novos achados acionáveis. O revisor não executou testes, sintaxe, navegador ou webcam; não há ensaio de webcam ou partida com a apresentação nova até que seja relatado.

Os relatos manuais anteriores do usuário estão em [ENTREGA_04.md](ENTREGA_04.md#complemento-de-verificações-manuais-relatadas-pelo-usuário--30102026) e [D18.md](D18.md). Rejeição de regiões, duas mãos, log da revanche e cliques têm relato positivo. Precisão/rejeição/latência têm avaliação qualitativa “ok”, sem números. Seguem pendentes gesto sustentado, recuperação, respostas assíncronas antigas, BFCache, métricas quantitativas e execução controlada dos cenários restantes. A suíte antiga permanece incompatível com o contrato D18 e não foi executada nesta etapa.

Capturas da inspeção visual do coordenador: [menu desktop](evidencias/entrega-05/menu-desktop.png) e [preparação desktop](evidencias/entrega-05/preparacao-desktop.png). Elas mostram a apresentação, sem demonstrar reconhecimento de webcam ou uma partida completa.

A entrega fica disponível para revisão do usuário antes de eventual autorização específica de commit. Não foi criado handoff atual, pois depende de commit autorizado e efetivo. Entregas 6 e 7 não foram iniciadas.

## Reversão do complemento experimental de enquadramento e animações

Em 30/10/2026, após inspeção prévia no navegador pelo revisor de código, constatou-se que o complemento de enquadramento forçado (100dvh) e animações adicionais gerou regressões visuais relevantes: surgimento de múltiplas barras de rolagem concorrentes no console inferior, escurecimento indesejado da arena pela sobreposição do ciclo dia/noite, atraso desnecessário na leitura do d20 pela rotação/tumbling e distorções pontuais na silhueta dos magos pela aproximação de respiração.

Por determinação da equipe, o complemento foi revertido, restaurando a interface limpa e estável:

1. **`dist/jogo.html`**: removidos todos os nós decorativos das animações (`.daylight-cycle`, `.celestial-cycle`, `.water-reflections`, `.arcane-particles`) e as máscaras SVG de respiração (`#wizard-black-interior`, `#wizard-white-interior`), mantendo exclusivamente a arte base panorâmica da arena e os elementos vivos do jogo.
2. **`dist/game.css`**: removidas as regras de travamento de altura no viewport (`height: 100vh / 100dvh; overflow: hidden;`), o grid rígido de combate, todas as regras e `@keyframes` de animação (`wizard-breathe`, `day-night-shade`, `day-sun`, `night-moon`, `water-glimmer`, `arcane-drift`, `d20-tumble`) e as regras de compressão que ocultavam notas explicativas (`.spell-note`, `.camera-hint`). Restaurado o fluxo natural de rolagem vertical do documento.
3. **`dist/game-ui.js`**: revertida a rotação 3D de d20 tumbling; a função `paintDice` agora renderiza os dados d20 diretamente e com exibição numérica imediata dos valores já confirmados pela engine/controlador, preservando destaque do d20 escolhido e acessibilidade (`aria-label`), sem atrasos nem sobrecarga de nós. Removidas as complexidades de sincronização de motion pause.

A interface da arena permanece totalmente alinhada à arte de referência fornecida pelo usuário, com visual estável, legível e responsivo, disponível para inspeção e revisão na branch `codex/entrega-5-refinamento-visual`.
