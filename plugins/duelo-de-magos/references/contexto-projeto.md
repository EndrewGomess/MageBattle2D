# Contexto atual do Duelo de Magos

Este plugin depende dos arquivos do projeto aberto. Localize a raiz a partir do diretório de trabalho do usuário: confira o diretório atual e seus pais até encontrar `PLANEJAMENTO.md`, `DECISOES.md` e `ESPECIFICACAO.md` juntos. Não procure esses arquivos a partir da pasta instalada do plugin, que pode estar no cache do Codex. Se o workspace não contiver o projeto, peça sua localização antes de executar uma alteração.

Leia os documentos atuais; esta referência é um mapa de leitura e não uma cópia dos requisitos. Uma nova instrução explícita do usuário pode alterar o escopo aprovado. Identifique o impacto e registre a decisão quando isso fizer parte do trabalho autorizado, sem tratar sugestões anteriores como escolhas já feitas.

| Fonte na raiz do projeto | Uso |
| --- | --- |
| [contexto_projeto.md](../../../contexto_projeto.md) | Base curta e estável: escopo geral, stack, padrões e objetivo final |
| [docs/handoffs/README.md](../../../docs/handoffs/README.md) e handoff mais recente aplicável | Protocolo, template e ponto de entrada para continuidade; não substituem fontes atuais |
| [AGENTS.md](../../../AGENTS.md) | Processo obrigatório de trabalho e limites de execução |
| [ESPECIFICACAO.md](../../../ESPECIFICACAO.md) | Comportamento, estados e cenários de aceite A01–A23 |
| [DECISOES.md](../../../DECISOES.md) | Decisões vigentes e históricas, aprovações e questões ainda abertas |
| [PLANEJAMENTO.md](../../../PLANEJAMENTO.md) | Entrega afetada, dependências, tecnologia e critérios para avançar |
| [README.md](../../../README.md) | Execução local, arquivos e comandos disponíveis |
| [docs/ENTREGA_02.md](../../../docs/ENTREGA_02.md) | Evidências de software, ensaio físico e decisão atual sobre integração |
| [docs/ENTREGA_03.md](../../../docs/ENTREGA_03.md) | Motor de combate determinístico, 70 testes automatizados e PR #3 |
| [docs/ENTREGA_04.md](../../../docs/ENTREGA_04.md) | Protótipo jogável integrado, PR #4 e complemento de relatos manuais do usuário |
| [docs/D18.md](../../../docs/D18.md) | Relatório e contrato da adaptação de dano em d6 e crítico natural (commit `e81db37`) |
| [docs/ENTREGA_05.md](../../../docs/ENTREGA_05.md) | Relatório do refinamento visual e acessibilidade (em revisão na branch `codex/entrega-5-refinamento-visual`, sem commit) |
| [docs/GUIA_ENSAIO.md](../../../docs/GUIA_ENSAIO.md) | Preparação e registro de observações físicas, quando esse for o pedido |

Comece pelo pedido, pelo contexto base, por `AGENTS.md` e pelo handoff mais recente aplicável; depois confira as partes relevantes dos documentos canônicos e o estado atual. Se não houver handoff, use as fontes atuais, sem criar um retroativo. Consulte os relatórios de entrega e o guia quando o pedido envolver câmeras, reconhecimento, regras ou prontidão para integrar. Não conclua o estado atual apenas pelas datas, pelo handoff ou por este plugin.

## Pontos de atenção por assunto

- **Combate:** consulte regras e cenários na especificação e decisões vigentes (D18 substitui contratos de dano e acerto anteriores). O ataque compara o d20 escolhido contra a CA (acerto estrito: d20 > CA). O dano é exclusivo em dados d6 por magia (Mísseis Mágicos 1d6 + 1; Raio de Fogo 2d6 + 2; Bola de Fogo 4d6 + 4), sem `baseDamage` padrão. O crítico natural ocorre se o d20 escolhido for 20, dobrando os dados de dano e preservando bônus (Mísseis Mágicos 2d6 + 1; Raio de Fogo 4d6 + 2); Bola de Fogo com ambos os d20 em 20 maximiza sem sorteio de d6 (48 + 4 = 52). A configuração inicial de partida aceita apenas vida máxima (padrão 50) e CA (padrão 12, faixa 1–19), iguais para ambos os magos. A suíte de 70 testes históricos não valida D18.
- **Gestos e captura:** consulte D07–D09, D13 e D14 para região do jogador ativo, confirmação temporal, magia travada e rolagem virtual única. Há uma única prévia espelhada dividida horizontalmente em 47% J1, 6% zona neutra central e 47% J2. Os limiares de confiança são 0,60 para Open_Palm (Bola de Fogo) e 0,75 para Pointing_Up (Mísseis Mágicos) e Victory (Raio de Fogo), com confirmação contínua por 1000 ms (1,0 s) com intervalo máximo de 500 ms entre observações (`gestureHoldMs: 1000`, `gestureMaxGapMs: 500`, D14). D13 substitui o ciclo físico antigo de D10; dois valores virtuais iguais são válidos.
- **Recuperação:** D11, atualizado por D13, preserva seleção confirmada e resultado virtual gerado. Qualquer falha de câmera ou recurso suspende novas confirmações sem rolar dados faltantes e sem avançar o turno. A retomada requer reconexão e retomada explícita do combate pelo usuário (ação de Retomar / `resume`), mantendo os dados parciais já gerados.
- **Plataforma e interface:** D12, D13 e D18 orientam o jogo no navegador desktop (HTML5, CSS3, JS ESM sem build). A Entrega 5 implementa o refinamento visual 2D na arena (`dist/jogo.html`), com pixel art local (`dist/assets/interface-base.png` via recortes SVG e fonte VT323), HUD completo (vida, CA e indicador de turno), cartas de magia servindo exclusivamente como guia visual e de regras (sem clique de seleção), console de combate em três colunas, adaptação responsiva a telas menores e suporte a redução de movimento. Atenção: a Entrega 5 está implementada para revisão na branch `codex/entrega-5-refinamento-visual`, sem commit autorizado.
- **Evidência:** consulte os relatórios de entrega antes de liberar alterações ou concluir prontidão. Diferencie rigorosamente os relatos qualitativos do usuário (como os de 30/10/2026 sobre rejeição, duas mãos, revanche e fluidez) de medições estatísticas formais. Conforme D15 e D17, testes automatizados integrados (E2E), medições quantitativas de taxa/latência de câmera, comportamento de BFCache e descarte de respostas assíncronas atrasadas continuam pendentes de validação formal.

## Coordenação dos papéis

Os perfis pertencem ao repositório em `.codex/agents/`: `analista_de_pedidos`, `implementador` e `revisor_codigo`. O plugin acrescenta fluxos e contexto, sem instalar cópias desses agentes.

O agente principal coordena a sequência exigida em `AGENTS.md`. Ao delegar, forneça o papel, seu arquivo de perfil, a raiz do projeto e a tarefa delimitada; reutilize instâncias existentes quando disponíveis. Um agente que já participa como analista, implementador ou revisor executa apenas seu papel e retorna ao coordenador: não inicia outra sequência dos três agentes.

Se a execução efetiva de um papel não estiver disponível no cliente, informe o impedimento; não apresente uma simulação dos papéis como participação real. Pedidos apenas de análise ou revisão não autorizam alterações. Para alterações, encaminhe achados ao implementador e solicite nova revisão conforme o processo do projeto.

Leia os limites atuais em `AGENTS.md`: a participação dos agentes não autoriza commits nem testes. Ao entregar, identifique alterações, verificações realmente feitas e pendências físicas ou técnicas; não apresente critérios esperados como evidências obtidas.

No encerramento, siga o protocolo de handoff: somente depois da revisão, autorização explícita e criação efetiva do commit da etapa, produzir o registro com branch/SHA reais. Ele fica local até eventual commit posterior autorizado, sem amend ou segundo commit automático; não autoriza avançar de entrega.
