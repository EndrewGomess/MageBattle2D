# Entrega 2 — Guia de ensaio da webcam e dados virtuais

Versão D14, 29/10/2026. Uma webcam observa os dois jogadores; d20 são gerados pelo software. Esta configuração foi ensaiada e aceita no escopo limitado de seis gestos positivos (três por jogador). Rejeição, unicidade, recuperação e métricas continuam sem evidência, conforme o [relatório](ENTREGA_02.md). Este guia permite registrar ensaios adicionais.

## Preparação

1. Inicie o servidor e abra o laboratório conforme o README.
2. Posicione a câmera de frente para ambos, mãos visíveis e iluminação uniforme. A prévia é espelhada: jogador 1 aparece à esquerda e jogador 2 à direita. A conversão de coordenadas alinha a seleção com essa prévia; a faixa central não seleciona.
3. Identifique a câmera, autorize a permissão no navegador, selecione o dispositivo e conecte. Confira a prévia e a resolução/frequência exibida.
4. Carregue o reconhecedor e aguarde **Gestos: pronto**. É necessária internet para baixar o modelo; a inferência ocorre no dispositivo.

## Matriz de gestos

Em cada linha, selecione o jogador ativo, clique **Nova seleção**, faça o gesto na região indicada e mantenha cerca de um segundo. Anote o resultado observado em **Evidências**; o relatório não calcula acurácia física automaticamente.

| Jogador ativo | Região na prévia | Indicador (Pointing_Up) | V (Victory) | Mão aberta (Open_Palm) |
|---|---|---|---|---|
| Jogador 1 | Esquerda | Mísseis Mágicos · 2d20, maior | Raio de Fogo · 1d20 | Bola de Fogo · 2d20, menor |
| Jogador 2 | Direita | Mísseis Mágicos · 2d20, maior | Raio de Fogo · 1d20 | Bola de Fogo · 2d20, menor |

Limiar inicial: Open_Palm **0,60**; Pointing_Up e Victory **0,75**. Manutenção **1000 ms**, intervalo máximo entre observações **500 ms**. São parâmetros iniciais, não precisão validada.

## Rejeição, unicidade e recuperação

- **Região inativa:** com jogador 1 ativo, mostre um gesto somente à direita; repita com jogador 2 ativo e gesto somente à esquerda. Nenhum deve confirmar.
- **Ambiguidade:** tente a faixa central e duas mãos na região ativa; nenhuma seleção deve ocorrer. Mude ou retire o gesto antes de um segundo; o progresso deve reiniciar.
- **Unicidade:** após uma confirmação, mantenha o gesto. O número da seleção e os dados não podem mudar. Nova tentativa requer clique em **Nova seleção**.
- **Recuperação após confirmação:** anote a seleção, encerre e reconecte a webcam. Seleção e dados devem permanecer e reconectar não pode sortear novamente; rearme com **Nova seleção**.
- **Recuperação antes da confirmação:** interrompa a câmera enquanto o progresso está incompleto. Não deve haver confirmação nem rolagem.
- Se possível, observe também troca do jogador ativo, alteração de resolução, ocultação da aba e congelamento do vídeo. Tentativas incompletas e respostas antigas não podem confirmar a seleção atual.

## Registro e exportação

Em **Caso observado**, selecione o cenário, indique o gesto feito, marque **Comportamento esperado** ou **Falha observada** e descreva jogador, posição, luz e resultado nas notas. Clique **Registrar observação**. Exporte o JSON antes de fechar ou recarregar a página. Ele registra espelhamento, limiares, escores das classes detectadas, rolagens e observações; não inclui quadros de vídeo nem identificadores de dispositivos.

O ensaio de 29/10/2026 registrou seis gestos positivos para os dois jogadores; a entrega foi aceita nesse escopo limitado. Rejeição, unicidade, recuperação e métricas seguem sem evidência neste ensaio; use os passos acima se for necessário medi-los depois. A sequência de números virtuais não comprova a distribuição estatística do gerador nem o reconhecimento físico dos gestos.
