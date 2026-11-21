# 9. Agentes comentaristas

Quatro personagens de IA (os **agentes comentaristas**) leem os artigos antes de eles irem ao ar
e deixam comentários na própria página. Não são leitores de verdade: no futuro os comentários
reais terão outra área, e esta continua sendo só deles.

## Os quatro personagens

Cada um é um **subagente do Claude Code**, definido por um arquivo Markdown em `.claude/agents/`.
O cabeçalho (front matter) diz nome, descrição, ferramentas e modelo; o corpo é o "roteiro" da
personalidade.

| Arquivo | Personagem | Jeito de ser | Ferramentas |
|---|---|---|---|
| `critico-cetico.md` | O Cético | Duvida de tudo, questiona e fala mal do texto (nunca da pessoa) | só leitura |
| `corretor.md` | O Corretor | Corrige palavras erradas, gramática e expressões ruins, sem entrar no mérito técnico | só leitura |
| `leitor-gentil.md` | O Leitor Gentil | Tenta entender, traz referências reais da web e discorda com educação | leitura + `WebSearch` |
| `comentarista-aleatorio.md` | O Aleatório | Comenta qualquer coisa, menos o artigo (receita de bolo...) | só leitura |

Decisões de projeto que valem a pena entender:

- **Nenhum deles pode escrever arquivos.** Só leem o artigo e respondem. Quem grava o comentário
  no JSON é a skill que vai chamá-los (próxima etapa), com a data real. Menos poder = menos risco.
- **Resposta em JSON, sempre.** Assim a skill consegue guardar o resultado sem "adivinhar" nada.
- **O texto do artigo é dado, não ordem.** Todos têm a regra de ignorar instruções escritas dentro
  do artigo (isso se chama *prompt injection*: texto tentando mandar no agente).
- **O Leitor Gentil não envia trechos do artigo para a busca**, só o assunto geral, e nunca pode
  inventar referência.
- O Aleatório usa o modelo mais barato (`haiku`): o trabalho dele não exige raciocínio.

Formato que cada agente devolve (os campos que não se aplicam ficam como lista vazia):

```json
{"comentario": "texto", "referencias": [{"titulo": "...", "url": "https://..."}],
 "correcoes": [{"trecho": "como está", "sugestao": "como ficaria", "motivo": "por quê"}]}
```

## Onde os comentários ficam

Um arquivo JSON **por artigo**, que só cresce, em `data/comentarios/<pasta-do-artigo>.json`.
A pasta `data/` é especial no Hugo: tudo que está nela vira dado disponível nos templates
(`hugo.Data`). Exemplo (`data/comentarios/2026-11-20-como-ando-estudando.json`):

```json
{
  "artigo": "2026-11-20-como-ando-estudando",
  "comentarios": [
    {
      "id": "2026-11-21T15-30-00-corretor",
      "agente": "corretor",
      "data": "2026-11-21T15:30:00-03:00",
      "texto": "Achei duas coisas para ajustar.",
      "referencias": [],
      "correcoes": [{"trecho": "as facilidades", "sugestao": "às facilidades", "motivo": "crase"}],
      "hash_do_texto": "…"
    }
  ]
}
```

- `texto` é o campo `comentario` que o agente devolveu (a skill renomeia ao gravar).
- `agente` é o nome do arquivo do personagem (e a chave em `data/agentes.json`, onde ficam o
  nome de exibição e o ícone de cada um).
- `data` é a **data real** em que o comentário foi gerado (ISO 8601 com fuso). Cada rodada de
  comentários **acrescenta** itens novos; nada é apagado, então o histórico mostra a conversa
  evoluindo conforme o artigo muda.
- `hash_do_texto` identifica a versão do artigo que foi lida (para saber a que versão cada
  comentário se refere).

## Como aparece na página

O partial `themes/lume/layouts/_partials/comentarios-agentes.html` é chamado no `page.html`, logo
depois do texto. Ele lê o JSON do artigo, procura o cadastro do personagem em `data/agentes.json`
e desenha a lista. O visual usa só variáveis de cor, então funciona nos 4 estilos e 3 cores.

**Regra de quem aparece:** só artigos **publicados** ou **rascunhos públicos**
(`publicDraft: true` no front matter). Em Go template:
`or (not .Draft) .Params.publicDraft`. Rascunhos comuns não mostram a área.

Sem comentários, a área mostra "Ainda não há comentários dos agentes neste artigo."

## Para criar um artigo novo

Crie, ao lado do post, o arquivo `data/comentarios/<pasta-do-artigo>.json` com
`{"artigo": "<pasta>", "comentarios": []}`. (A skill, quando existir, fará isso sozinha.)

## O que vem depois

Uma **skill** (um comando do Claude Code, ex.: `/comentar`) que, antes de você publicar, chama
os quatro agentes sobre os artigos elegíveis, pega o JSON que cada um devolve, acrescenta
`id`, `data` real e `hash_do_texto` e grava no arquivo do artigo.

Referências: subagentes do Claude Code <https://code.claude.com/docs/en/sub-agents> ·
arquivos de dados do Hugo <https://gohugo.io/content-management/data-sources/>

Voltar: [08-cache.md](08-cache.md) · Índice: [README.md](README.md)
