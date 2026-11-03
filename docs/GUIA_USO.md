# Duelo de Magos — guia rápido

## Preparar e iniciar

Para o duplo clique: Windows x64 ou ARM64, PowerShell 5.1, navegador desktop, uma webcam para os dois jogadores, acesso à internet e permissão de escrita na pasta extraída. Não é necessário instalar Node.js ou alterar PATH: o lançador obtém Node.js portátil v24.21.0 de nodejs.org na primeira abertura e valida o SHA-256 fixado antes de usar o arquivo. O cache fica em `.runtime/` e é validado novamente em toda abertura. Não é necessário instalar pacotes npm. Funcionamento totalmente offline não está garantido; celular não é o alvo funcional.

1. Extraia o ZIP inteiro em uma pasta; não execute arquivos dentro do ZIP. Mantenha a estrutura de pastas.
2. No Windows, dê duplo clique em `Jogar.cmd`. Na primeira abertura, aguarde o download do Node.js portátil. Uma janela de terminal mostrará o endereço local e o navegador abrirá o jogo depois que o servidor estiver pronto. Mantenha a janela aberta.
3. Se o navegador não abrir, use o endereço mostrado no terminal, normalmente `http://127.0.0.1:4173/jogo.html`.
4. Para encerrar o servidor, pressione `Ctrl+C` na janela dele. Se o Windows perguntar se deseja encerrar o arquivo em lotes, confirme. Fechar só o navegador não encerra o servidor.

O mesmo `Jogar.cmd` também funciona na raiz de um clone completo do repositório. O PowerShell é chamado com política de execução limitada ao processo do lançador; nenhuma política permanente do computador é alterada. Se a organização bloquear esse processo, use a alternativa manual com Node instalado, sem alterar políticas da máquina.

Alternativa pelo terminal com Node.js 20 ou superior já instalado, estando na pasta extraída:

```powershell
node scripts/start.mjs
```

Para usar outra porta no PowerShell:

```powershell
$env:PORT = '4174'
.\Jogar.cmd
```

O lançador usa apenas `127.0.0.1`. Se a porta já estiver ocupada, ele informa erro e não abre a página de outro serviço nem encerra servidores alheios. Para o laboratório diagnóstico, execute `node scripts/serve.mjs` e abra `/`; a entrada do jogo é `/jogo.html`. Não abra o HTML diretamente pelo explorador.

## Configurar a partida e a câmera

Vida máxima começa em 50 e aceita inteiro positivo; CA começa em 12 e aceita inteiro de 1 a 19. São iguais para os dois jogadores. Não existe configuração de dano padrão.

Inicie a preparação, permita/identifique a câmera e selecione o dispositivo e a resolução. Clique para conectar recursos, confira a prévia espelhada e confirme o enquadramento. Jogador 1 (mago preto) fica à esquerda da prévia; jogador 2 (mago branco), à direita. A faixa central não confirma gestos. Use uma mão elegível na região do jogador ativo. Apenas conectar a câmera não inicia rolagens; a confirmação explícita libera a iniciativa.

## Jogar

A iniciativa gera um d20 virtual por jogador; maior começa, empate gera novo par. No turno, mantenha o gesto por cerca de um segundo. Mudança, ausência ou ambiguidade reinicia o progresso. A seleção estável conjura automaticamente; as cartas são instruções de gesto, não botões de ataque.

| Gesto | Magia e ataque | Dano no acerto / crítico natural |
| --- | --- | --- |
| Indicador | Mísseis Mágicos: maior de 2d20 | `1d6+1` / `2d6+1` |
| V | Raio de Fogo: 1d20 | `2d6+2` / `4d6+2` |
| Mão aberta | Bola de Fogo: menor de 2d20 | `4d6+4` / máximo `8d6+4 = 52`, sem sortear d6 |

Acerta somente se o d20 escolhido for maior que a CA; igualdade erra. Erro não gera d6 e consome turno. Crítico exige escolhido 20: em Bola, ambos os d20 precisam ser 20. O bônus fixo não dobra. O histórico mostra dados, dano nominal e aplicado; a vida não passa de zero. O turno troca automaticamente após a ação válida. Vitória oferece revanche e retorno ao menu. Revanche limpa vida/histórico e gera nova iniciativa com os mesmos atributos e câmera disponível. Há opção de reduzir movimento e controles auxiliares por teclado.

## Interrupção, recuperação e privacidade

Falha, parada ou troca da câmera e ocultação da aba suspendem confirmações. Confira os recursos e confirme explicitamente a retomada. Resultados já válidos são preservados; reconectar sozinho não sorteia dados nem repete dano. Sair da página encerra recursos; o retorno pelo histórico reinicializa no menu.

A webcam é solicitada sem áudio. O reconhecimento roda no dispositivo; o jogo não envia quadros para um servidor. O navegador acessa serviços externos para obter os modelos e bibliotecas fixados no código. O laboratório pode baixar relatório JSON local por solicitação, sem imagens ou identificadores de dispositivo. Ao encerrar a câmera ou sair da página, suas tracks são liberadas.

## Problemas comuns

| Problema | Ação |
| --- | --- |
| Download/integridade do Node portátil falhou | Confira internet, acesso HTTPS a nodejs.org e escrita na pasta; abra o lançador novamente. Arquivo com hash divergente não é executado. |
| Arquitetura não suportada ou PowerShell bloqueado | O lançador suporta Windows x64/ARM64. A alternativa manual requer Node.js 20 ou superior instalado. |
| Porta ocupada | Encerre apenas seu servidor anterior ou use outra porta conforme acima. |
| Câmera negada | Autorize a câmera para a página local no navegador e tente novamente. |
| Câmera ausente/ocupada | Confira conexão, dispositivo selecionado e apps usando a câmera; reconecte e confirme a retomada. |
| Modelo não carrega | Confira internet e acesso aos serviços indicados em AVISOS.md; reconecte os recursos. |
| Vídeo parado ou partida suspensa | Aguarde novos quadros, confira câmera/aba visível e confirme explicitamente a retomada. |
| Pasta movida/arquivo faltando | Extraia novamente o pacote inteiro; não use só o lançador ou HTML. |

## Versão e limites conhecidos

`VERSAO.txt` e `MANIFESTO.json` identificam a origem real, se havia alterações locais e o SHA-256 de cada arquivo incluído. Um pacote de trabalho pode conter alterações além do commit indicado; consulte `source.dirty`. O SHA do ZIP identifica o artefato, não certifica seu comportamento.

A Entrega 6 foi aceita com 81/81 testes e relato físico qualitativo positivo do usuário, incluindo gesto mantido sem repetição, recuperação com confirmação e histórico retornando ao menu. Não foram informados ambiente, método ou contagens do ensaio. O uso efetivo de BFCache não foi confirmado, A13 do laboratório diagnóstico tem alcance parcial e precisão/rejeição/latência quantitativas não foram medidas. Por decisão do usuário, esses pontos permanecem pendentes nesta entrega. A instalação/uso deste novo pacote por outra pessoa ainda precisa ser registrada; o pacote está para revisão. Publicação/hospedagem não foi incluída.
