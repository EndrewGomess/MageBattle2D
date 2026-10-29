# Contexto atual do Duelo de Magos

Este plugin depende dos arquivos do projeto aberto. Localize a raiz a partir do diretório de trabalho do usuário: confira o diretório atual e seus pais até encontrar `PLANEJAMENTO.md`, `DECISOES.md` e `ESPECIFICACAO.md` juntos. Não procure esses arquivos a partir da pasta instalada do plugin, que pode estar no cache do Codex. Se o workspace não contiver o projeto, peça sua localização antes de executar uma alteração.

Leia os documentos atuais; esta referência é um mapa de leitura e não uma cópia dos requisitos. Uma nova instrução explícita do usuário pode alterar o escopo aprovado. Identifique o impacto e registre a decisão quando isso fizer parte do trabalho autorizado, sem tratar sugestões anteriores como escolhas já feitas.

| Fonte na raiz do projeto | Uso |
| --- | --- |
| `AGENTS.md` | Processo obrigatório de trabalho e limites de execução |
| `ESPECIFICACAO.md` | Comportamento, estados e cenários de aceite A01–A23 |
| `DECISOES.md` | Decisões D01–D13, aprovações e questões ainda abertas |
| `PLANEJAMENTO.md` | Entrega afetada, dependências, tecnologia e critérios para avançar |
| `README.md` | Execução local, arquivos e comandos disponíveis |
| `docs/ENTREGA_02.md` | Evidências de software, ensaio físico e decisão atual sobre integração |
| `docs/GUIA_ENSAIO.md` | Preparação e registro de observações físicas, quando esse for o pedido |

Comece pelo pedido, por `AGENTS.md` e pelas partes relevantes dos três documentos canônicos. Consulte o relatório e o guia quando o pedido envolver câmeras, reconhecimento ou prontidão para integrar. Não conclua o estado atual apenas pelas datas ou por este plugin.

## Pontos de atenção por assunto

- **Combate:** confira configuração e acerto estritamente maior que a CA na especificação; iniciativa e empate em D02; vantagem/desvantagem e cálculo de dano em D03–D06. As metades usam piso; os naturais 1 e 20 não ganham efeitos extras.
- **Gestos e captura:** consulte D07–D09 e D13 para região do jogador ativo, confirmação temporal, magia travada e rolagem virtual única. D13 substitui o ciclo físico antigo de D10. Dois valores virtuais iguais são válidos.
- **Recuperação:** D11, atualizado por D13, preserva seleção confirmada e resultado virtual; falhas suspendem novas confirmações até reconexão e Nova seleção explícita, sem repetir rolagem ou alterar turno.
- **Plataforma e interface:** confira D12 atualizado por D13 e a seção de tecnologia do planejamento. Navegador, Electron, pygame-ce e Godot podem aparecer com estados diferentes; preserve a distinção entre plataforma aprovada, requisito visual e alternativa sugerida.
- **Evidência:** consulte o relatório atual antes de liberar integração. Carregar modelos e verificar observações sintéticas não comprova reconhecimento físico. Resultados virtuais têm origem no software; mantenha o laboratório identificado como diagnóstico, sem inferir precisão física a partir de uma rolagem.

## Coordenação dos papéis

Os perfis pertencem ao repositório em `.codex/agents/`: `analista_de_pedidos`, `implementador` e `revisor_codigo`. O plugin acrescenta fluxos e contexto, sem instalar cópias desses agentes.

O agente principal coordena a sequência exigida em `AGENTS.md`. Ao delegar, forneça o papel, seu arquivo de perfil, a raiz do projeto e a tarefa delimitada; reutilize instâncias existentes quando disponíveis. Um agente que já participa como analista, implementador ou revisor executa apenas seu papel e retorna ao coordenador: não inicia outra sequência dos três agentes.

Se a execução efetiva de um papel não estiver disponível no cliente, informe o impedimento; não apresente uma simulação dos papéis como participação real. Pedidos apenas de análise ou revisão não autorizam alterações. Para alterações, encaminhe achados ao implementador e solicite nova revisão conforme o processo do projeto.

Leia os limites atuais em `AGENTS.md`: a participação dos agentes não autoriza commits nem testes. Ao entregar, identifique alterações, verificações realmente feitas e pendências físicas ou técnicas; não apresente critérios esperados como evidências obtidas.

