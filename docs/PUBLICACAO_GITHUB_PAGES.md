# Publicação do jogo no GitHub Pages

O fluxo foi preparado para disponibilizar o jogo em um site público do repositório `EndrewGomess/MageBattle2D`. O endereço previsto após a primeira publicação é [endrewgomess.github.io/MageBattle2D/jogo.html](https://endrewgomess.github.io/MageBattle2D/jogo.html). A [página inicial](https://endrewgomess.github.io/MageBattle2D/) abre o laboratório existente em `index.html`.

O [workflow](../.github/workflows/pages.yml) envia apenas `dist/` como artefato estático. HTML, módulos, estilos e imagens conservam os caminhos relativos no subdiretório `/MageBattle2D/`. O GitHub Actions prepara o artefato quando há um push em `main` ou quando alguém inicia o fluxo manualmente nessa branch. O job de publicação usa o ambiente `github-pages` e recebe as permissões de Pages e OIDC necessárias. Cada publicação em andamento termina antes de outra da mesma branch.

## Ativar e publicar

1. A origem já está configurada como **GitHub Actions** em **Settings → Pages → Build and deployment → Source**. O GitHub confirmou que salvou a alteração e exibe HTTPS como obrigatório. [Configurar a origem da publicação no GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
2. O ambiente `github-pages` já existe em **Settings → Environments**. A regra **Selected branches and tags** permite exatamente a branch `main`. A interface mostrou os campos **Required reviewers** e **Wait timer** desmarcados e a lista de segredos do ambiente vazia. A configuração conferida já atende ao fluxo preparado. [Publicação por workflow no GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
3. Após revisar os arquivos, registre as alterações autorizadas e integre-as a `main` pelo fluxo Git do projeto. Acompanhe o job **Publicar artefato** e use o endereço fornecido pelo GitHub ao concluir. Para disparar novamente, abra **Actions → Publicar jogo no GitHub Pages → Run workflow**, selecione `main` e inicie a execução.

O jogo publicado é acessado por HTTPS em um navegador de computador. A partida pede permissão para usar uma webcam. O reconhecimento roda no navegador e requer acesso à internet para carregar o MediaPipe e o WASM do jsDelivr e o modelo de gestos do Google Cloud Storage, conforme [configuração da aplicação](../dist/config.js). O site estático dispensa o servidor Node local e o lançador do pacote Windows.

## Estado desta preparação

O workflow e este guia estão preparados localmente. Os ajustes de responsividade da branch também estão no diretório de trabalho. O Actions usa a revisão registrada em `main`, portanto esses ajustes só entram no site quando seu commit for integrado à branch de publicação. A origem do Pages foi alterada de desativada para **GitHub Actions**. O ambiente `github-pages` já tinha a configuração necessária e foi conferido sem alterações. Commit, envio e primeira publicação permanecem pendentes.

A conferência desta rodada foi por leitura do workflow, dos caminhos em `dist/` e da configuração de modelos externos, além da observação da origem e do ambiente na interface do GitHub. A revisão independente confirmou a correção do registro sobre a origem do Pages e encerrou sem novos achados. A execução do workflow, o envio do artefato e a verificação do endereço, do jogo e da webcam no site publicado permanecem pendentes.
