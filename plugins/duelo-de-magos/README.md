# Plugin Duelo de Magos

Plugin local do Codex para trabalhar neste repositório com o planejamento, a especificação e as decisões atuais. A versão `0.1.0` reúne três skills:

| Skill | Uso |
| --- | --- |
| `duelo-entender` | Converter um pedido em escopo e critérios de aceite |
| `duelo-implementar` | Coordenar análise, implementação e revisão de uma alteração |
| `duelo-revisar` | Revisar alterações sem editar arquivos |

As skills consultam os documentos do workspace a cada tarefa; o pacote não mantém cópias das regras ou do estado das entregas. O [mapa de contexto](references/contexto-projeto.md) explica quais fontes consultar. Os agentes continuam em `.codex/agents/` no repositório e são reutilizados pelo coordenador. O plugin precisa deste projeto aberto com seus documentos e perfis disponíveis.

## Instalar e usar no projeto

O catálogo local fica na raiz do repositório em `.agents/plugins/marketplace.json`. Ele aponta para `./plugins/duelo-de-magos`. A entrada de `.codex/config.toml` habilita `duelo-de-magos@duelo-de-magos-local` neste projeto; o carregamento dessa configuração depende de o projeto ser confiável para o Codex.

1. Abra este repositório no Codex e reinicie/recarregue o aplicativo para atualizar a fonte local de plugins.
2. Na lista de plugins, procure **Duelo de Magos** na fonte **Duelo de Magos · Projeto** e instale/ative se o cliente solicitar.
3. Inicie uma nova conversa neste projeto e confirme que as skills aparecem antes de usá-las. Criar o catálogo e a configuração não comprova que o cliente já carregou ou instalou o plugin.

Se a fonte local não aparecer automaticamente, execute estes comandos **na raiz do repositório**:

```powershell
codex plugin marketplace add .
codex plugin add duelo-de-magos@duelo-de-magos-local
codex plugin list --marketplace duelo-de-magos-local --json
```

O primeiro comando cadastra a fonte local na configuração pessoal do Codex; o segundo instala o pacote no cache local. O terceiro permite conferir o registro retornado pelo cliente. Depois, recarregue o aplicativo e confirme as skills na conversa do projeto. Mesmo instalado no cache, o plugin consulta os documentos atuais do workspace.

Exemplos de pedidos:

```text
Use $duelo-entender para detalhar a próxima alteração que vou pedir.
Use $duelo-implementar para ajustar esta mensagem de orientação do laboratório: ...
Use $duelo-revisar para conferir as alterações de captura e os casos de consumo único.
```

O fluxo de alteração é coordenado pelo agente principal: `analista_de_pedidos` → `implementador` → `revisor_codigo`. Os participantes retornam ao principal sem criar outro fluxo recursivo. Uma análise ou revisão isolada permanece somente leitura. O processo respeita os limites atuais de `AGENTS.md`, inclusive a autorização de testes e do commit de cada entrega.

## Atualizar

Edite o pacote em `plugins/duelo-de-magos/` e reinicie/recarregue o cliente para atualizar a instalação local. O cliente pode usar uma cópia em cache; mantenha os arquivos do catálogo apontando para esta pasta. Mudanças nas regras ou no estado do jogo devem entrar nos documentos canônicos do projeto, e não em cópias dentro do plugin.

O pacote contém skills e referências; não depende de servidor MCP, API key ou instalação de bibliotecas adicionais. Não implementa componentes executáveis do jogo.

Formato e registro seguem a [documentação oficial de empacotamento de plugins](https://developers.openai.com/plugins/build/plugins).
