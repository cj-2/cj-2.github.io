# Documentação do blog

Esta pasta explica **como o blog funciona e por que ele foi feito assim**, para servir de
material de estudo. Ela não é publicada no site — o Hugo só lê o que está em `content/`.

## Por onde começar

Leia na ordem se estiver começando do zero:

| # | Arquivo | O que você aprende |
|---|---------|--------------------|
| 1 | [01-visao-geral.md](01-visao-geral.md) | O que é um site estático, o que o Hugo faz e o caminho do Markdown até o navegador |
| 2 | [02-estrutura-de-pastas.md](02-estrutura-de-pastas.md) | Para que serve cada pasta e arquivo do projeto |
| 3 | [03-configuracao.md](03-configuracao.md) | O `hugo.toml` linha por linha |
| 4 | [04-conteudo.md](04-conteudo.md) | Como escrever posts: front matter, rascunhos, tags, archetypes |
| 5 | [05-tema-lume.md](05-tema-lume.md) | Como o tema foi construído: templates, partials, CSS, modo escuro |
| 6 | [06-deploy.md](06-deploy.md) | Como o site vai para o ar com GitHub Actions + GitHub Pages |
| 7 | [07-comandos.md](07-comandos.md) | Cola rápida de comandos do dia a dia |
| 8 | [08-cache.md](08-cache.md) | Cache do navegador: por que o site às vezes aparece velho e como o projeto contorna isso |
| 9 | [09-agentes-comentaristas.md](09-agentes-comentaristas.md) | Os 4 agentes de IA que comentam os artigos e onde os comentários ficam guardados |
| 10 | [10-testes.md](10-testes.md) | Testes e TDD: as 4 camadas (lógica, Python, renderização, navegador) e como desenvolver começando pelo teste |

E sempre que quiser saber **o que mudou e por quê**:

- [historico.md](historico.md) — diário do projeto, com as decisões tomadas e as lições
  de cada etapa (inclusive bugs encontrados e como foram corrigidos).

## Como esta pasta é mantida

O arquivo [`AGENTS.md`](../AGENTS.md) na raiz instrui os agentes de IA a registrar no
`historico.md` cada mudança relevante e a atualizar os demais arquivos quando algo mudar.
Se você mesmo fizer uma mudança, vale anotar lá também — escrever sobre o que fez é uma
ótima forma de fixar o aprendizado.

## Links oficiais úteis

- Documentação do Hugo: <https://gohugo.io/documentation/>
- Templates: <https://gohugo.io/templates/>
- Funções: <https://gohugo.io/functions/>
- Fórum da comunidade: <https://discourse.gohugo.io/>
