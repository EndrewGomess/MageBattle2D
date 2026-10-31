---
name: duelo-revisar
description: Revisa alterações do Duelo de Magos em relação ao pedido, aos cenários de aceite e às decisões atuais, apontando defeitos concretos sem editar arquivos.
---

# Revisar o Duelo de Magos

Consulte o [mapa do contexto do projeto](../../references/contexto-projeto.md) para localizar as fontes atuais. Delimite as alterações a revisar pelo pedido, pelo diff ou pelos arquivos indicados. Não presuma que arquivos não rastreados fazem parte do diff: inspecione seu conteúdo quando estiverem no escopo.

Como coordenador, encaminhe a revisão ao `revisor_codigo` existente, com o pedido, o escopo e a raiz do projeto. Se você já é o revisor em uma rodada coordenada, revise e retorne ao principal sem outra delegação. Uma revisão independente não exige executar analista e implementador quando não há alteração solicitada.

Procure problemas de comportamento sustentados pelo código e pelas decisões aplicáveis: configuração, acerto, escolha dos dados, dano/crítico, turnos e vitória conforme a especificação vigente; região ativa, trava de magia, rearmamento e duplicação; falha e recuperação de câmera; distinção entre rolagens geradas pelo software e evidências físicas do reconhecimento de gestos. Diferencie contratos alvo ainda não implementados do comportamento existente e de suas evidências. Leia somente os pontos que afetem a mudança em análise.

Reporte primeiro os achados por gravidade, com arquivo e linha, condição que provoca o problema, impacto e requisito violado. Evite preferências de estilo sem efeito funcional. Se não houver achados acionáveis, diga isso e identifique os limites relevantes da revisão.

Não edite arquivos nem transforme a revisão em execução de testes. Se a correção for autorizada pelo pedido original, devolva os achados ao coordenador para implementação e nova revisão; não aplique o patch você mesmo.

