# Entrega 7 — pacote local para revisão

Registro de implementação: 03/11/2026. Branch `codex/entrega-7-pacote-entrega`. Estado: implementada para revisão, ainda não concluída; instalação e uso por outra pessoa permanecem pendentes.

## Produzido

- `Jogar.cmd` e `scripts/bootstrap.ps1`: duplo clique no Windows x64/ARM64 sem Node instalado ou PATH; obtém o executável oficial Node.js portátil v24.21.0 por HTTPS, valida o SHA-256 fixado por arquitetura antes de substituição atômica e novamente antes de usar o cache `.runtime/`. Mantém erros visíveis. A política de execução do PowerShell aplica-se só ao processo, sem configuração permanente.
- `scripts/start.mjs`: exige Node.js 20 ou superior, inicia servidor em `127.0.0.1`, abre `/jogo.html` somente após o socket deste processo estar escutando e mantém encerramento por Ctrl+C. Porta ocupada falha sem abrir serviço alheio ou encerrá-lo. Falha de abertura automática mostra endereço para abrir manualmente.
- `scripts/serve.mjs`: servidor reutilizável por API `startServer`; execução direta mantém laboratório em `/`, com raiz restrita a `dist/`. Acrescentados tipos MIME de imagem PNG e fonte TTF.
- `scripts/package.mjs`: gerador sem dependências, com allowlist, cópia da árvore local, versão/HEAD/dirty reais, manifesto SHA-256 e ZIP com pasta raiz identificada. Saída em `artifacts/`, ignorada por `.gitignore`. Não inclui Git, testes, handoffs ou registros locais de câmera.
- [Guia de uso](GUIA_USO.md) e [avisos](../AVISOS.md): requisitos, início, configuração, gestos/regras, privacidade, recuperação, problemas, origem/licenças e limites conhecidos. O guia é incluído como `GUIA_RAPIDO.md` no pacote.

## Artefato gerado

Comando de produção efetivamente executado: `node scripts/package.mjs`. Não é execução do jogo nem teste de instalação.

- ZIP: `artifacts/DueloDeMagos-0.2.0-caf555d-local-20261103031014507.zip`.
- SHA-256: `04750abd4e053ce419b4e474493b84f0e8ac0bfe614c40c9013ce6e6bbc06d8a`.
- Pasta de composição: `artifacts/DueloDeMagos-0.2.0-caf555d-local-20261103031014507/`.
- Arquivo externo `.zip.sha256` com a identidade do ZIP; `MANIFESTO.json` interno relaciona 26 arquivos de conteúdo (além do próprio manifesto) com tamanho e hash. `VERSAO.txt` faz parte desse conteúdo.
- Origem: HEAD `caf555d02f537c4c7dce53cbd065e4fa83cd1582`, branch atual e `dirty: true`. O pacote incorpora alterações locais ainda sem commit, identificadas pelos hashes; não é apresentado como release correspondente apenas àquele SHA.

Uma primeira tentativa de geração via Compress-Archive não conseguiu carregar o módulo Microsoft.PowerShell.Archive neste ambiente. O gerador final usa ZIP store escrito pelo Node, com nomes UTF-8, CRC32 e diretório central, evitando esse requisito externo. Gerações preliminares permanecem na saída local ignorada. O ZIP terminado em `20261103025956998.zip` antecedeu o bootstrap; o terminado em `20261103030900586.zip` o incluiu com o hash ARM64 ainda incorreto. Ambos foram superados para entrega pelo ZIP atual listado acima, terminado em `20261103031014507.zip`, regenerado após corrigir esse hash, sem apagar as versões anteriores.

## Decisão sobre os limites D15/D17

O usuário respondeu: “Manter pendentes nesta entrega”. O pacote e o guia preservam os limites da Entrega 6: relato físico qualitativo positivo sobre gesto mantido sem repetição, recuperação com confirmação e histórico retornando ao menu, sem ambiente, método, contagens ou resultados físicos individuais de todos os casos. BFCache efetivo não confirmado, A13 do laboratório diagnóstico parcial e métricas quantitativas de precisão/rejeição/latência não medidas.

O aceite da Entrega 6 permanece. Não foi produzido novo ensaio ou nova evidência dessas pendências na Entrega 7. Antes de fechar a etapa, lembrar a decisão vigente e os limites registrados, sem reabrir automaticamente o trabalho aceito.

## Não executado e pendências de aceite

Não foram executados testes, verificação de sintaxe, servidor, navegador ou ensaio físico nesta rodada. A geração do ZIP é produção do artefato; sua estrutura, extração e os fluxos do novo lançador ainda precisam de evidência de execução quando autorizada. Os 81/81 testes da Entrega 6 antecedem o novo lançador/refatoração de servidor e não os validam.

Ainda falta registrar outra pessoa extraindo o pacote e seguindo o guia para iniciar/preparar uma câmera, sem depender do checkout ou instruções particulares. O [roteiro do plano](PLANO_ENTREGA_07.md) define os dados e resultados a registrar. Não se afirma que o pacote já foi executado por outra pessoa.

Publicação/hospedagem não faz parte deste recorte. Não há licença geral adicional presumida para o projeto ou a arte fornecida; a fonte mantém sua OFL local e os modelos externos continuam dependentes da internet. Não foi criado commit, PR ou handoff desta etapa. Os dois handoffs locais anteriores foram preservados sem staging. A revisão anterior foi concluída somente por leitura, sem novos achados após corrigir o cabeçalho da especificação. A revisão independente final do bootstrap e das atualizações posteriores foi concluída somente por leitura, com o hash ARM64 e o caminho da pasta de composição corrigidos e sem novos achados; não houve execução. A execução e o uso por outra pessoa continuam pendentes.


## Node portátil — atualização de 03/11/2026

O pacote atual inclui o bootstrap PowerShell 5.1 e exclui o cache `.runtime/` por allowlist; esse diretório também é ignorado pelo Git. A origem fixada é `https://nodejs.org/download/release/v24.21.0/win-x64/node.exe` ou `win-arm64/node.exe`. SHA-256 esperado do executável: x64 `ba4e6d110e8c1592a1ecd390f6b05f3da124b13871a5be62b341a07a853c6c32`; ARM64 `dff59da18b6ffe1bf1ca99e1d2af4906080c481740619f5b5098c0fca28bd9b7`. A conferência oficial desses valores foi fornecida pelo coordenador. O gerador não baixa nem executa esse runtime: a obtenção ocorrerá na primeira abertura pelo usuário.

Não houve teste do bootstrap, launcher, download ou cache nesta rodada. Foi executada somente a geração do novo ZIP como produção do artefato; a leitura independente foi concluída sem novos achados, e o ensaio de uso permanece pendente. A primeira abertura precisa de internet, pasta gravável e PowerShell permitido; a alternativa manual usa Node 20 ou superior já instalado. O runtime não é instalado globalmente e o PATH permanece sem alteração.


Correção durante revisão do bootstrap: o hash ARM64 inicialmente informado tinha comprimento incorreto. Foi substituído pelo SHA-256 oficial correto no script e neste registro, e o ZIP foi regenerado. A versão terminada em `20261103030900586.zip` também fica superada pelo artefato atual listado acima. A releitura final confirmou a correção sem novos achados; não houve teste de execução do bootstrap.
