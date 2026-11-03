# Plano da Entrega 7 — pacote de entrega

Planejamento inicial: 02/11/2026; implementação para revisão registrada em 03/11/2026. Branch de trabalho: `codex/entrega-7-pacote-entrega`. Estado: pacote local, lançador e guia implementados para revisão; ver [registro da Entrega 7](ENTREGA_07.md). Ensaio de instalação por outra pessoa pendente. Fontes: [README](../README.md), [especificação](../ESPECIFICACAO.md), [planejamento](../PLANEJAMENTO.md), [decisões](../DECISOES.md) e [fechamento da Entrega 6](ENTREGA_06.md).

## Objetivo e artefatos

Entregar uma versão local executável do Duelo de Magos e um guia curto que permita a outra pessoa iniciar o jogo, preparar uma webcam e jogar. A arquitetura permanece navegador desktop, HTML/CSS/JavaScript e servidor Node.js, sem build ou instalação de pacotes. O duplo clique Windows x64/ARM64 obtém Node portátil oficial fixado e validado por SHA-256; não depende de Node instalado ou PATH. A alternativa manual continua exigindo Node 20 ou superior.

Artefatos previstos para a execução posterior:

- Pacote local com `dist/`, `scripts/serve.mjs`, instruções de início, identificação da versão e licenças aplicáveis aos recursos incluídos. Proposta de distribuição: arquivo ZIP com uma pasta raiz identificada; formato final registrado ao preparar o pacote.
- Guia curto de requisitos, extração, início/encerramento do servidor, configuração e uso do jogo, recuperação e soluções para problemas comuns.
- Registro da composição do pacote, versão/commit de origem reais, verificações realizadas e limitações conhecidas. Hash do pacote pode identificar o arquivo efetivamente entregue, sem substituir o SHA do código.

Publicação e hospedagem permanecem decisões explícitas de escopo. Este plano prevê entrega local; não presume implantação, conta de hospedagem ou endereço público.

## Estado de entrada e limites herdados — D15/D17

A Entrega 6 está concluída no escopo planejado e aceito pelo usuário: 81/81 testes automatizados aprovados, sintaxe e HTTP verificados no alcance do relatório, mais ensaio físico qualitativo positivo do usuário. O relato respondeu especificamente a gesto mantido gerar um ataque, parar/reconectar a câmera preservar o estado e exigir confirmação de retomada, e voltar pelo histórico retornar ao menu.

Não foram informados data do ensaio, equipamento, navegador, configuração, método ou número de tentativas; não inferir resultados físicos individuais de todos os casos. O retorno pelo histórico tem relato positivo, mas o mecanismo BFCache não foi confirmado. A13 permanece parcial por se referir ao laboratório diagnóstico. Precisão, rejeição e latência quantitativas não foram medidas. Os bloqueios anteriores do navegador do agente pertencem àquela execução.

Decisão explícita do usuário para a Entrega 7: “Manter pendentes nesta entrega”. Os limites D15/D17 foram transportados para o guia e o registro do pacote, preservando o aceite da Entrega 6. Não houve retomada dessas verificações ou coleta de métricas nesta rodada. Relembrar essa decisão e os limites antes de fechar o pacote; o aceite anterior não constitui nova evidência.

## Sequência de realização

1. **Fixar a origem:** conferir branch, commit real, alterações locais e artefatos aprovados. Identificar a versão que efetivamente será empacotada. Manter handoffs locais e arquivos de desenvolvimento fora do pacote de uso, salvo inclusão expressamente necessária.
2. **Definir a composição:** relacionar os arquivos necessários para servir `dist/`, incluindo módulos, imagem e fonte locais, licenças e servidor. Preservar caminhos relativos. Evitar dependência de arquivos externos ao pacote ou da estrutura da máquina de desenvolvimento.
3. **Redigir o guia:** apresentar Node.js 20 ou superior, navegador desktop, uma webcam e internet para carregamento dos modelos. Instruir a abrir um terminal na pasta extraída, executar `node scripts/serve.mjs` e acessar `http://127.0.0.1:4173/jogo.html`; explicar `Ctrl+C` e a alternativa de porta já descrita no README. Informar que abrir o HTML diretamente não substitui o servidor.
4. **Documentar o uso:** vida/CA, permissão/seleção da câmera, prévia espelhada e regiões, conexão e confirmação de enquadramento, três gestos, iniciativa/dados virtuais, histórico, vitória, revanche e menu. Explicar suspensão e confirmação explícita da retomada; reconectar não sorteia novamente. O laboratório em `/` é diagnóstico, não a entrada principal do jogo.
5. **Documentar recursos e problemas:** modelos carregados pela internet e inferência local, áudio não solicitado, permissões negadas, dispositivo ausente/ocupado, falta de novos quadros, falha de carregamento e porta ocupada. Incluir os limites herdados acima; não prometer funcionamento offline, suporte funcional a celular ou desempenho físico medido.
6. **Montar o pacote:** produzir o arquivo de distribuição acordado e conferir sua relação de arquivos, extração e identidade da versão. Não acrescentar funcionalidade ao jogo para empacotar. Problemas de composição/guia encontrados nessa etapa devem ser corrigidos no próprio pacote ou documentação.
7. **Validar início fora do checkout:** seguir o roteiro abaixo usando somente o pacote entregue, registrar resultados e corrigir o que impedir o uso documentado. A execução e quaisquer testes adicionais ficam para o pedido posterior de realização da etapa.
8. **Revisar e entregar:** submeter pacote, guia e registro ao fluxo de revisão do projeto e ao usuário. Distinguir o que foi produzido, verificado e relatado por outra pessoa. Registrar a decisão sobre limites remanescentes antes do fechamento. Commit somente com autorização específica; handoff somente após revisão, autorização e commit efetivo.

## Roteiro de início por outra pessoa

Objetivo posterior: demonstrar que o pacote funciona fora do checkout e que uma pessoa consegue seguir o guia sem instruções particulares do desenvolvedor.

| Ação do participante | Evidência a registrar |
| --- | --- |
| Receber e extrair o pacote em outra pasta, sem usar arquivos do repositório | Identidade do pacote, caminho de extração sem dados pessoais desnecessários e versão identificada |
| Conferir requisitos e executar o comando do guia | Sistema e versões informadas, comando, resultado e qualquer dúvida encontrada |
| Abrir `/jogo.html`, configurar e conectar uma webcam | Navegador, dispositivo/resolução quando disponíveis, permissão e resultado observado; distinguir relato de observação direta |
| Confirmar enquadramento e realizar o fluxo básico do jogo | Resultado observado de iniciativa, gestos, turno, dano, vitória, revanche e menu, conforme o alcance realmente exercitado |
| Encerrar e iniciar de novo conforme o guia | Resultado e dificuldades; nenhum arquivo do checkout deve ser necessário |

Registrar também casos não executados e motivos. Se não houver participante ou equipamento disponível, não declarar que outra pessoa conseguiu usar o pacote: manter a verificação pendente e apresentar esse limite na revisão do usuário. Não converter o ensaio anterior da Entrega 6 em prova de instalação desta nova distribuição.

## Critérios de aceite

- Pacote contém os arquivos necessários e uma identificação de versão rastreável à origem real.
- Guia curto cobre requisitos, início, preparação da única câmera, uso, encerramento, recuperação e limitações.
- Início a partir de cópia extraída e uso do guia têm registro com método e resultado; o critério de outra pessoa conseguir iniciar/preparar a câmera depende da participação efetivamente registrada.
- Dependência de internet e limitações físicas/BFCache/laboratório permanecem visíveis, sem ampliar as evidências da Entrega 6.
- Publicação/hospedagem só entra no resultado se for acordada explicitamente. Entrega local continua sendo o produto previsto na ausência dessa decisão.
- O usuário revisa o resultado e autoriza seu commit; o planejamento não conclui a Entrega 7.

## Situação desta rodada

Implementados lançador Windows, início via Node, gerador de pacote, guia e avisos; artefato ZIP gerado localmente para revisão. Não foram executados testes, servidor, navegador ou ensaio físico nesta rodada. Verificação por outra pessoa permanece pendente. Não foi criado commit ou handoff da Entrega 7; os handoffs locais anteriores foram preservados.


Atualização de implementação — 03/11/2026: o lançador passou a preparar automaticamente Node.js portátil v24.21.0 oficial para Windows x64/ARM64, com hash fixado por arquitetura, download temporário, substituição atômica e validação do cache antes da execução. `.runtime/` fica fora do Git e do ZIP; clone mais internet passa a ser o caminho previsto. O bootstrap não foi executado nesta rodada; ver registro atualizado da Entrega 7.
