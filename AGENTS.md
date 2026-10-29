# Orientação dos agentes do projeto

Este repositório é o jogo **Duelo de Magos**. Consulte `README.md`, `ESPECIFICACAO.md`, `PLANEJAMENTO.md` e `DECISOES.md` para entender o estado e os requisitos aprovados. As entregas 1 e 2 estão concluídas e aceitas. A entrega 2 foi aceita no escopo limitado de seis gestos positivos registrados (três por jogador); rejeição, unicidade, recuperação e métricas não têm evidência. Os dados são virtuais (D13). Não declare essa validação concluída sem evidências registradas.

## Fluxo obrigatório dos três agentes

Toda implementação ou alteração deve usar efetivamente os três agentes existentes, nesta ordem: `analista_de_pedidos` → `implementador` → `revisor_codigo`. Esse fluxo é obrigatório para código novo, correções, documentação e configurações, inclusive mudanças pequenas e pedidos claros.

O agente principal coordena o fluxo e reutiliza os agentes existentes de cada papel quando estiverem disponíveis. Cada um dos três agentes deve executar efetivamente sua parte na mesma rodada coordenada.

1. O `analista_de_pedidos` entende o pedido e prepara um briefing proporcional à mudança, com escopo, limites e critérios de aceite. Preserve a intenção do usuário e as decisões aprovadas, sem exigir confirmações rotineiras para seguir o fluxo.
2. O `implementador` realiza a alteração a partir do briefing, dentro do escopo pedido e da entrega atual.
3. O `revisor_codigo` revisa o resultado em modo somente leitura, sem alterar arquivos. Sua participação não autoriza adicionar ou executar testes; continua necessário o pedido explícito do usuário previsto nos limites abaixo.

Se a revisão apontar correções necessárias, encaminhe-as ao `implementador` e submeta o resultado a uma nova revisão do `revisor_codigo`.

A participação dos três agentes não substitui a revisão do usuário nem autoriza commits.

## Limites do projeto

- Não avance para outra entrega nem transforme uma hipótese técnica em requisito aprovado.
- O usuário deve revisar cada entrega e autorizar explicitamente o commit correspondente. Não crie commits sem autorização para aquela entrega.
- Não adicione nem execute testes, salvo pedido explícito do usuário para testar ou verificar.
- Ao relatar resultados, diferencie o que foi implementado, o que foi verificado e o que continua pendente.

