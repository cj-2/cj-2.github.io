# cj-2: Blog

Blog pessoal de estudos, reflexões e vida, feito com [Hugo](https://gohugo.io/) e publicado
no GitHub Pages. O tema visual (**lume**) foi criado do zero para este projeto.

## Sobre o uso de IA

**A estrutura é feita majoritariamente com IA. O conteúdo não.**

- **Estrutura do projeto** (configuração do Hugo, tema, templates, CSS, JavaScript, deploy
  e a documentação técnica em `docs/`): desenvolvida com bastante ajuda de ferramentas de
  IA. Eu uso isso para aprender Hugo e para focar no que importa de verdade: escrever.
- **Conteúdo do blog** (tudo o que está em `content/`: posts, textos, ideias, opiniões e
  reflexões): escrito por mim, **à mão**. Nenhum post é gerado por IA.

Os textos têm erros, dúvidas e opiniões que mudam com o tempo, porque quem escreve é uma
pessoa esforçada e estudiosa, na medida do possível, e não um gerador de texto. Se você
está lendo um post aqui, foi um humano que o escreveu.

## Como rodar localmente

```bash
hugo server -D            # servidor local com rascunhos (http://localhost:1313)
hugo --gc --minify        # build de produção em public/
hugo new content posts/nome-do-post.md   # novo post
```

Requer Hugo **v0.146+** (versão *extended*).

## Documentação

A pasta [`docs/`](docs/README.md) explica como o blog funciona e registra as decisões
tomadas. Ela não é publicada no site.
