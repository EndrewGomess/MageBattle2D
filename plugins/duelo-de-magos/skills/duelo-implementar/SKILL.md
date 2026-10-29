---
name: duelo-implementar
description: Desenvolve alterações de código, documentação ou configuração do Duelo de Magos com os agentes do projeto e o contexto atual de especificação, decisões e planejamento.
---

# Implementar no Duelo de Magos

Consulte o [mapa do contexto do projeto](../../references/contexto-projeto.md), localize o repositório do usuário e leia as fontes relevantes antes de alterar arquivos. Identifique a entrega afetada e suas dependências, sem presumir que requisitos de visão computacional já foram demonstrados.

Como agente principal, execute efetivamente o fluxo do repositório:

1. Encaminhe o pedido ao `analista_de_pedidos` para obter um briefing de escopo e critérios de aceite.
2. Encaminhe o briefing ao `implementador`, com a raiz do projeto e as referências necessárias. Preserve alterações existentes do usuário e siga os padrões encontrados no código.
3. Encaminhe o resultado e o escopo ao `revisor_codigo`, para revisão somente leitura. Se houver correções necessárias, devolva-as ao implementador e submeta o resultado à nova revisão.

Reutilize os agentes existentes quando disponíveis. Se você já foi chamado como um desses participantes, execute somente a parte atribuída e retorne ao coordenador, sem iniciar outro fluxo completo.

Para mudanças em combate, use os cenários da especificação como critérios esperados; para reconhecimento, respeite as proteções e as evidências registradas no relatório atual. Uma alternativa de tecnologia ou entrada de dados sugerida nos documentos não autoriza sua adoção. Uma instrução explícita nova do usuário deve ser considerada com seu impacto nas decisões existentes.

Siga os limites de testes e commits registrados em `AGENTS.md`. A entrega deve informar o comportamento alterado, os arquivos relevantes, o resultado da revisão, as verificações realmente realizadas e as pendências. Não avance outra entrega apenas porque a implementação atual terminou.
