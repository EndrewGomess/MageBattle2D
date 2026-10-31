# Handoff — D18, dano em d6 e crítico natural

- Etapa: adaptação funcional D18 anterior ao refinamento visual da Entrega 5
- Data do registro: 2026-10-30
- Branch: `codex/d18-dano-critico`
- Commit da etapa: `e81db3720d293a9eb834e86784fbb3fa49f6edf7` (`e81db37`), `feat: implementar dano em d6 e critico natural da D18`
- Revisão e autorização: fluxo efetivo analista → implementador → revisor; revisão independente final somente por leitura, sem achados funcionais acionáveis, seguida de correção e revisão documental sem pendências. O usuário autorizou nesta rodada: “abra outra branch para implementar o D18 que falta, e quando terminar e commitar, nós continuamos com a interface”. O coordenador criou efetivamente o commit acima após a revisão.
- Situação do arquivo: local, criado após o commit acima; inclusão futura depende de autorização. Não foi criado commit adicional nem amend para este handoff.

## Implementação e arquivos

O commit contém 11 arquivos. A implementação funcional alterou [combat.js](../../dist/combat.js), [dice.js](../../dist/dice.js), [game-controller.js](../../dist/game-controller.js), [game-ui.js](../../dist/game-ui.js) e [jogo.html](../../dist/jogo.html): ataque/dano separados, dano em d6, crítico natural, máximo da Bola, retirada de dano padrão, preservação parcial de dados e apresentação de nominal/aplicado.

Foram atualizados [DECISOES.md](../../DECISOES.md), [ESPECIFICACAO.md](../../ESPECIFICACAO.md) e [PLANEJAMENTO.md](../../PLANEJAMENTO.md); criado o relatório [D18.md](../D18.md); e adicionados avisos históricos em [ENTREGA_03.md](../ENTREGA_03.md) e [ENTREGA_04.md](../ENTREGA_04.md). O refinamento visual da Entrega 5 não foi iniciado.

Alterações preexistentes em `AGENTS.md`, `README.md`, referências/skill do plugin, `contexto_projeto.md` e protocolo `docs/handoffs/README.md` ficaram fora deste commit. Devem ser preservadas e comparadas às fontes atuais na retomada.

## Decisões aplicadas

[D18](../../DECISOES.md) substitui dano fixo e efeito antigo do 20, conforme as regras e cenários da [especificação](../../ESPECIFICACAO.md). Permanecem uma webcam e dados virtuais (D13), prévia espelhada e gestos (D14), além dos limites de evidência e adiamento D15/D17. A imagem fornecida para a próxima etapa é referência estética, sem substituir fórmulas, gestos ou confirmação automática.

## Interfaces e contratos

O contrato atual completo está em [D18.md](../D18.md). `DEFAULT_CONFIG` contém vida máxima e CA; `resolveAction` recebe `attackValues` e `damageValues` distintos, valida entradas e deriva acerto/crítico. `planAttack` fornece o plano puro compartilhado com o controlador. Snapshots do motor continuam congelados e reconhecidos por `WeakSet`.

O controlador registra `pendingAction` antes do primeiro RNG e persiste cada valor válido antes do próximo sorteio. Retomada explícita completa somente dados faltantes; reconectar não rola. `rollD6` foi acrescentado sem alterar o contrato `rollForGesture` do laboratório. Erro e Bola crítica maximizada não sorteiam d6. Histórico e interface distinguem ataque, dano rolado/máximo, bônus, dano nominal e aplicado.

## Verificado e evidências

Implementador e revisor fizeram leitura estática dos arquivos e diffs. O revisor não encontrou achados funcionais acionáveis; a expressão documental “base histórica ainda implementada” foi corrigida para distinguir o contrato anterior, com revisão final documental sem pendências. O [relatório D18](../D18.md) registra método e limites.

A criação efetiva do commit e seus 11 arquivos foi conferida pelo histórico Git; a branch foi conferida como `codex/d18-dano-critico`. Essas inspeções não são evidência de execução do jogo.

## Não verificado

Nenhum teste foi adicionado, atualizado ou executado, nem verificação de sintaxe, navegador ou webcam. Os cenários A01–A23 não foram executados para D18. A suíte antiga não foi migrada e contém expectativas/contratos incompatíveis com a adaptação; os 70/70 e cobertura históricos da Entrega 3 não validam D18. O relato exploratório D17 também antecede estas regras.

## Pendências e limitações

Permanecem verificações de unicidade com gesto sustentado, rejeição da região inativa/central e ambiguidades, suspensão/recuperação e respostas antigas, cliques de revanche/encerramento/menu, BFCache e métricas físicas. Precisão e integração completa não foram demonstradas. A atualização/execução dos testes depende de pedido explícito, conforme os limites do projeto; revisão estática não substitui essa evidência.

O refinamento visual, a validação de ponta a ponta e o pacote continuam etapas distintas. A criação deste handoff não inicia nenhuma delas nem altera o aceite das evidências anteriores.

## Entradas para a próxima etapa

Consultar [contexto base](../../contexto_projeto.md), [AGENTS.md](../../AGENTS.md), [especificação](../../ESPECIFICACAO.md), [decisões](../../DECISOES.md), [planejamento](../../PLANEJAMENTO.md) e [contrato D18](../D18.md), comparando o commit com alterações locais posteriores. A referência visual é `C:/Users/endrew.gomes/Downloads/interface_base_jogo_rpg_turno_2d.png`. A preparação identificou a branch `codex/entrega-5-interface-visual`, anterior a D18; sua existência não significa que contenha este commit. A skill `frontend-design` foi instalada na preparação, e `imagegen`/`computer-use` já estavam disponíveis.

Primeira ação sugerida: quando o usuário iniciar o trabalho visual, confirmar que a linha de trabalho contém `e81db37`, reler a referência estética e preparar o briefing da Entrega 5 preservando os contratos D18 e as pendências D15/D17. Este registro não autoriza avanço automático.
