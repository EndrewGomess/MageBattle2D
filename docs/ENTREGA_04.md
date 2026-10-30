# Entrega 4 — Protótipo jogável integrado

Data da implementação: 29/10/2026. Status: implementado e revisado estaticamente, com relato exploratório posterior do usuário sobre o recorte descrito abaixo. A revisão independente confirmou a correção do P2 de restauração pelo histórico e não encontrou outros achados acionáveis. O usuário autorizou explicitamente commit e PR da Entrega 4 após a revisão final deste registro, preservando as pendências (D17); a execução pode ser consultada no histórico Git e na PR correspondente, quando criada. O relato não equivale à validação sistemática de todos os fluxos.

## Relato exploratório do usuário

O usuário informou que os três gestos foram reconhecidos com facilidade, os ataques alternaram entre os jogadores com passagem de turno, a vida diminuiu até zero e a tela de resultado exibiu opções de encerramento e revanche. Esse é um relato de uso exploratório, atribuído ao usuário; não foi obtido por execução dos agentes. Não foram informados data do ensaio, hardware, navegador, configurações, quantidades de tentativas ou métricas. A data de implementação acima não deve ser tomada como data desse ensaio.

| Comportamento | Evidência e situação |
| --- | --- |
| Reconhecimento positivo dos três gestos | Observado no relato do usuário; facilidade percebida, sem taxa de precisão medida |
| Alternância de ataques, passagem de turno e redução de vida | Observados no relato do usuário |
| Vida chega a zero e partida alcança resultado | Observado no relato do usuário |
| Exibição das opções de encerramento e revanche | Observada no relato do usuário; cliques e seus efeitos não foram confirmados |

Esses pontos deixam de constar como totalmente sem observação. Permanecem sem evidência específica a unicidade ao sustentar o gesto, rejeição da região inativa/central, ambiguidade/duas mãos, suspensão e recuperação, descarte de respostas antigas, precisão/rejeição/latência, cliques de revanche/encerramento/retorno ao menu e BFCache. Os testes automatizados da integração e a execução controlada dos demais cenários A01–A23 também permanecem pendentes; o relato não comprova configurações ou resultados numéricos que não foram informados.

## Como acessar

Execute `node scripts/serve.mjs` na raiz, conforme o README, e abra [o protótipo local](http://127.0.0.1:4173/jogo.html). O laboratório permanece em `/` e não foi integrado ao combate. Navegador desktop, webcam permitida, localhost/HTTPS e internet para carregar os modelos continuam necessários. A captura não solicita áudio e não envia quadros a um servidor.

O fluxo implementado é: configurar atributos → permitir/selecionar webcam → conectar webcam e reconhecedor → conferir a prévia espelhada → confirmar enquadramento → iniciativa automática → gestos e combate → resultado. Os controles da câmera continuam disponíveis durante a partida para recuperação. Reconexão não retoma automaticamente: o jogador deve conferir o enquadramento e confirmar a retomada.

Sair da página encerra a partida e seus recursos; não há persistência. Voltar pelo histórico após restauração em BFCache reinicializa a página no menu, sem recuperar a partida anterior.

## Arquitetura e proteções implementadas

| Parte | Responsabilidade |
| --- | --- |
| `dist/jogo.html` e `dist/game.css` | Menu, preparação, iniciativa, arena funcional com dois magos, indicadores, cartões, progresso, resultados, histórico e revanche/menu. Refinamento visual e revisão ampla de acessibilidade pertencem à Entrega 5 |
| `dist/game-ui.js` | Adaptar campos e eventos da página, recursos de câmera, novos quadros e renderização. Não oferece entrada manual de magia ou dados |
| `dist/game-controller.js` | Controlador independente do DOM, com RNG, relógio, agendamento/cancelamento e notificação injetáveis. Mantém os snapshots originais de `combat.js`, sem clonar/deserializar estados protegidos pelo `WeakSet` |
| `dist/game-recognizer.js` | Adapter exclusivo da partida para o mesmo `gesture-worker.js` e os mesmos modelos. Isola gerações de worker, requisições e bitmaps pendentes; não duplica inferência ou modifica o adapter do laboratório |
| Módulos existentes | Reutiliza motor, dados virtuais, regras de gestos/limiares e gerenciador de câmera. O laboratório e as evidências da Entrega 3 são preservados |

O controlador expõe `start`, `beginSession`, `connected`, `frame`, `watchdog`, `visibility`, `confirmFraming`, `observe`, `rematch`, `menu` e `dispose`; `view` é a apresentação somente leitura, com o snapshot original do motor. `context`/`current` identificam partida, sessão, seleção, turno e jogador para descartar trabalho antigo. Não há persistência/restauração por JSON nem modo manual.

- Configuração: padrões 50/10/12, validação por campo, bloqueio de início inválido e prévia da metade com piso, padrão e dobro. O formulário converte somente inteiros decimais; não transforma vazio ou fração em padrão.
- Preparação: uma webcam selecionada, resolução, permissão sem áudio, modelo carregado, prévia espelhada e faixa central. Enquadramento exige confirmação explícita e novos quadros.
- Iniciativa: um callback agenda cada dado, primeiro jogador 1 e depois 2; todos os pares ficam no motor. Empates são repetidos por agendamento, sem laço síncrono ilimitado. Uma suspensão após P1 preserva seu dado e retoma em P2.
- Ação: somente uma mão elegível na região ativa passa pela confirmação temporal. O controlador desarma a seleção e invalida seus callbacks **antes** de chamar o RNG. Geração e resolução são síncronas, com uma entrada de histórico. O próximo turno rearma automaticamente uma nova seleção após um intervalo curto.
- Preservação: o último resultado continua identificado por jogador e turno. Se ocorrer falha após gerar a rolagem, a ação pendente usa os mesmos valores na retomada; reconectar nunca gera outra rolagem. Configuração, vida, iniciativa, jogador ativo e histórico ficam preservados.
- Suspensão: interrupção/stop/troca da câmera, falha ou timeout do worker/captura, vídeo sem novos quadros e aba oculta cancelam agendamentos e progresso não confirmado. Voltar à aba, recuperar quadros ou reconectar exige retomada explícita. Resultados assíncronos antigos não confirmam ações.
- Recursos: instância de câmera/worker por conexão, fechamento de tracks e worker, rejeição de requisições pendentes e descarte de `ImageBitmap` atrasado. Modelo tem espera máxima de 60 s; captura e inferência têm prazo inicial de 500 ms cada, e observação com idade total acima de 500 ms não confirma. Esses parâmetros precisam de ensaio no computador alvo.
- Resultado: ataque fatal encerra o motor antes de outra ação. Revanche restaura vida, limpa histórico/seleção e gera nova iniciativa com os atributos anteriores; mantém a câmera disponível quando íntegra. Voltar ao menu cancela callbacks e libera recursos para editar atributos. Sair da página também encerra recursos.

## O que foi feito e o que falta

| Item | Situação desta rodada |
| --- | --- |
| Menu, preparação, iniciativa, arena, seleção, rolagem/resolução, resultado e revanche/menu | Implementados com revisão estática concluída; reconhecimento positivo, alternância, dano/vitória e exibição do resultado observados pelo usuário no recorte exploratório acima |
| Cancelamento, preservação e descarte de callbacks antigos | Implementados e inspecionados por leitura; sem evidência de execução integrada |
| Regras e testes da Entrega 3 | Evidências históricas preservadas: 70/70, cobertura focada 100% e sintaxe 15/15; esses números não validam os arquivos novos |
| Revisão independente desta implementação | Concluída por leitura; P2 de BFCache corrigido e confirmado, sem outros achados acionáveis |
| Testes automatizados da integração e demais cenários A01–A23 nos novos fluxos | Pendentes; nenhum teste automatizado foi adicionado ou executado pelos agentes nesta entrega |
| Webcam: reconhecimento positivo dos três gestos no protótipo | Observado no relato exploratório do usuário, além dos registros históricos da Entrega 2; sem métricas |
| Webcam: rejeição de região inativa/central, ambiguidades/duas mãos, gesto sustentado, recuperação e métricas | Pendentes; o relato positivo não comprova esses casos |
| Cliques de revanche, encerramento/retorno ao menu e restauração BFCache | Pendentes de verificação específica; exibição de opções não comprova seus efeitos |
| Refinamento visual/acessibilidade, ponta a ponta e pacote | Entregas 5–7 não iniciadas |
| Commit e PR da Entrega 4 | Autorizados explicitamente pelo usuário após a revisão final do registro, com as pendências de D17; execução consultável no histórico Git e na PR correspondente, quando criada |

Os agentes fizeram somente leitura cruzada dos módulos, fontes aprovadas e referências de controles/estados. Não executaram comandos de teste, servidor, navegador, webcam ou verificação de sintaxe nesta entrega. As observações de partida são exclusivamente as relatadas pelo usuário, distinguidas da implementação e da revisão estática nas tabelas acima.

### Achado da revisão e correção

O revisor apontou um P2 no retorno pelo histórico do navegador: `pagehide` descartava controlador, polling e recursos, mas uma restauração em BFCache reutilizaria o DOM com esse controlador encerrado. Foi acrescentado `pageshow.persisted` para recarregar a página e reinicializar o protótipo; o carregamento normal não provoca recarga. A saída mantém o encerramento dos recursos e não preserva a partida. A revisão independente confirmou a correção somente por leitura, sem executar navegador ou testes adicionais; o fluxo de histórico continua sem evidência de execução.

## Decisão e retomada das pendências

[D16](../DECISOES.md) registra a autorização para implementar o protótipo apesar das pendências físicas. D17 registra o relato exploratório e a autorização específica de commit/PR da Entrega 4 após revisão final. D15 permanece para as verificações ainda sem evidência: antes de planejar e fechar cada Entrega 5, 6 e 7, relembrá-las ao usuário, especialmente antes do ponta a ponta e do pacote. Essa autorização não inicia as próximas entregas nem declara toda a integração validada.

## Consumo por tarefa

| Tarefa | Tokens efetivamente consumidos |
| --- | --- |
| Leitura e análise do pedido | Não disponibilizados por tarefa |
| Implementação e documentação | Não disponibilizados por tarefa |
| Inspeção estática do implementador | Não disponibilizados por tarefa |
| Revisão independente concluída | Não disponibilizados por tarefa |
| Coordenação | Não disponibilizados por tarefa |
| Total da rodada | Não disponibilizado |

Indisponibilidade não significa consumo zero. Não foram inferidos valores a partir de percentuais de limites da conta, tamanho das mensagens ou soma de estimativas.
