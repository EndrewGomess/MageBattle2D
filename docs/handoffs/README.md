# Pipeline Context Handoff

O contexto de uma etapa é transmitido em duas camadas: [contexto base](../../contexto_projeto.md), curto e estável, e um handoff por etapa que possa ser retomado a partir das fontes e evidências correspondentes. As regras de trabalho continuam em [AGENTS.md](../../AGENTS.md).

## Início de uma etapa

1. Ler o contexto base e as orientações dos agentes.
2. Localizar o handoff mais recente aplicável à etapa e à linha de trabalho. Conferir etapa, branch, commit e pendências; não selecionar apenas pela data do nome. Se não existir handoff aplicável, partir das fontes atuais, sem criar um registro retroativo.
3. Consultar o pedido do usuário, [especificação](../../ESPECIFICACAO.md), [decisões](../../DECISOES.md), [planejamento](../../PLANEJAMENTO.md) e os relatórios/evidências relevantes. Comparar o handoff com o estado atual, inclusive alterações ainda sem commit.

O handoff é um ponto de entrada e um retrato ligado a um commit. Não prevalece sobre instruções, decisões ou evidências posteriores. Divergências devem ser identificadas antes de reutilizar um contrato ou afirmar que um comportamento foi validado. A leitura de um handoff não autoriza iniciar outra entrega.

## Encerramento de uma etapa

Elaborar o handoff imediatamente **somente depois** de a etapa ter sido revisada, o usuário ter autorizado explicitamente o commit correspondente e esse commit ter sido efetivamente criado. Registrar a branch e o SHA reais daquele commit; autorização pendente ou promessa de commit não satisfaz esse requisito.

Salvar em `docs/handoffs/AAAA-MM-DD-etapa-<nome>-<sha-curto>.md`, usando a data real do registro e um nome de etapa identificável. Não preencher um handoff atual nesta instalação do protocolo e não retrocriar handoffs para commits passados.

O arquivo é elaborado após o commit e fica local até um eventual commit posterior também autorizado pelo usuário. Não criar um commit exclusivo para registrá-lo, não fazer amend e não criar automaticamente um segundo commit. Informar que o handoff está local e qual commit ele descreve. Sua criação não altera o aceite da etapa nem autoriza avançar para a próxima.

## Template reutilizável

Copiar somente após satisfazer as condições de encerramento. Substituir os campos pelos fatos da etapa; identificar ausências de evidência em vez de inferir aprovação.

```markdown
# Handoff — <etapa e nome>

- Etapa: <identificador e escopo>
- Data do registro: <AAAA-MM-DD real>
- Branch: <branch real no momento do commit>
- Commit da etapa: <SHA completo real e SHA curto usado no nome>
- Revisão e autorização: <referência à revisão e à autorização explícita do commit>
- Situação do arquivo: local, criado após o commit acima; inclusão futura depende de autorização

## Implementação e arquivos

<O que mudou, com caminhos/links; distinguir o que foi implementado do que foi apenas documentado.>

## Decisões aplicadas

<IDs e links para decisões/especificação vigentes no commit; não copiar fórmulas ou contratos inteiros.>

## Interfaces e contratos

<Entradas, saídas, estados ou integrações relevantes para continuidade, com links às fontes canônicas e arquivos.>

## Verificado e evidências

<Somente verificações efetivamente realizadas, método, resultado e links para evidências identificadas.>

## Não verificado

<Casos não exercitados, hipóteses e alcance limitado das evidências; não tratar revisão por leitura como execução.>

## Pendências e limitações

<Problemas remanescentes, impacto e referências; separar pendência de decisão e de execução.>

## Entradas para a próxima etapa

<Documentos, arquivos, contratos e evidências a consultar primeiro.>

Primeira ação sugerida: <ação concreta, condicionada ao escopo que o usuário autorizar; não autoriza avanço.>
```
