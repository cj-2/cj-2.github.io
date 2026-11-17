# 1. Visão geral

## Site estático x site dinâmico

Um site **dinâmico** (WordPress, por exemplo) monta cada página *na hora em que alguém
acessa*: o servidor consulta um banco de dados, roda código e devolve o HTML.

Um site **estático** já tem todas as páginas prontas como arquivos `.html`. O servidor só
entrega arquivos — não roda código, não tem banco de dados.

Vantagens do estático para um blog:

- **Rápido** — entregar um arquivo pronto é a coisa mais rápida que um servidor faz.
- **Barato/grátis** — serviços como o GitHub Pages hospedam de graça.
- **Seguro** — sem banco de dados nem código no servidor, quase não há o que atacar.
- **Versionável** — todo o conteúdo é texto (Markdown) dentro de um repositório git.

A desvantagem: alterou um post, precisa **gerar o site de novo**. É aí que entra o Hugo
(e a automação do GitHub Actions, que faz isso sozinho a cada `push`).

## O que o Hugo faz

O Hugo é um **gerador de sites estáticos**. Ele pega:

1. **Conteúdo** — arquivos Markdown em `content/`
2. **Templates** — arquivos HTML com marcações especiais em `themes/lume/layouts/`
3. **Configuração** — `hugo.toml`
4. **Assets** — CSS e JS em `themes/lume/assets/`

…e junta tudo, gerando a pasta `public/` com o site pronto.

```
content/posts/meu-post.md ─┐
themes/lume/layouts/*.html ┼──►  hugo  ──►  public/posts/meu-post/index.html
hugo.toml                  │
themes/lume/assets/*       ┘
```

Ele é escrito em Go e é famoso por ser muito rápido — este blog compila em menos de
100 ms.

## O caminho completo de um post

1. Você cria `content/posts/aprendendo-hugo.md` e escreve em Markdown.
2. Roda `hugo server -D` e vê o resultado em `http://localhost:1313` (atualiza sozinho
   a cada salvamento).
3. Quando estiver pronto, muda `draft: true` para `draft: false`.
4. Faz `git commit` e `git push` para o GitHub.
5. O GitHub Actions percebe o push, instala o Hugo, roda o build e publica `public/`
   no GitHub Pages.
6. Em ~1 minuto o post está no ar.

## Como o Hugo decide o endereço de cada página

O endereço segue a estrutura de pastas de `content/`:

| Arquivo | URL gerada |
|---------|-----------|
| `content/_index.md` (ou nada) | `/` (página inicial) |
| `content/posts/` | `/posts/` (lista de posts) |
| `content/posts/meu-post.md` | `/posts/meu-post/` |
| tag `hugo` em algum post | `/tags/hugo/` |

Cada página tem um **tipo** (*kind*), e o tipo define qual template a desenha — isso é
explicado em [05-tema-lume.md](05-tema-lume.md).

Próximo: [02-estrutura-de-pastas.md](02-estrutura-de-pastas.md)
