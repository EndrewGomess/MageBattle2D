# Avisos e recursos incluídos

A distribuição inclui o código do Duelo de Magos e recursos locais preservados do projeto. Nenhuma licença geral adicional do jogo é concedida por este aviso. A imagem `dist/assets/interface-base.png` é a referência fornecida pelo usuário; não há licença de redistribuição pública identificada neste repositório. A entrega local não representa autorização automática de publicação pública desses recursos.

A fonte VT323 vem acompanhada da licença SIL Open Font License em `dist/assets/fonts/OFL-VT323.txt`; mantenha-a junto à fonte. O pacote inclui os arquivos originais do projeto, sem baixar novos recursos no empacotamento.

No carregamento dos gestos, o navegador obtém MediaPipe Tasks Vision 0.10.21 por `cdn.jsdelivr.net` e o modelo Gesture Recognizer por `storage.googleapis.com`, conforme `dist/config.js`. Esses recursos externos não estão embutidos neste ZIP; suas condições e disponibilidade continuam aplicáveis. A inferência é local. O laboratório também preserva componentes legados de investigação, sem tornar OCR/dados físicos parte do jogo vigente.


O lançador Windows obtém somente o executável oficial Node.js v24.21.0 para x64/ARM64 de `https://nodejs.org/download/release/v24.21.0/`, com SHA-256 fixado em `scripts/bootstrap.ps1`. Node.js é software de terceiros; licença e avisos oficiais estão em [LICENSE da versão](https://github.com/nodejs/node/blob/v24.21.0/LICENSE). O executável baixado é cache local em `.runtime/`, não parte deste ZIP, e não altera o PATH nem instala um serviço.
