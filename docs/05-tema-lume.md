# 5. O tema lume

O lume foi feito do zero para este blog. Objetivo: visual minimalista, foco em leitura,
modo claro/escuro e zero dependências externas.

```
themes/lume/
├── hugo.toml                 valores padrão dos params
├── layouts/
│   ├── baseof.html           esqueleto HTML de todas as páginas
│   ├── home.html             página inicial
│   ├── page.html             página individual (post)
│   ├── section.html          lista de uma seção (/posts/)
│   ├── taxonomy.html         lista de tags (/tags/)
│   ├── term.html             posts de uma tag (/tags/hugo/)
│   ├── 404.html              página não encontrada
│   └── _partials/
│       ├── head.html         <head>: meta tags, CSS, JS
│       ├── header.html       cabeçalho com menu e botão de tema
│       ├── footer.html       rodapé
│       ├── post-meta.html    data + tempo de leitura
│       ├── post-list.html    lista de posts agrupada por ano
│       └── tags.html         lista de tags de um post
└── assets/
    ├── css/main.css          estilos
    ├── css/chroma.css        cores do destaque de código
    └── js/tema.js            botão claro/escuro
```

## Go templates em 5 minutos

Os templates são HTML com trechos entre `{{ }}`, a linguagem de templates do Go.

```go-html-template
{{ .Title }}                      imprime o título da página atual
{{ site.Title }}                  imprime o título do site
{{/* comentário */}}

{{ if .Draft }}rascunho{{ end }}  condicional

{{ range .Pages }}                laço: para cada página...
  {{ .Title }}                    ...aqui dentro o "." é a página do laço
{{ end }}

{{ with .Description }}           "se existir": executa e muda o "." para o valor
  <p>{{ . }}</p>
{{ else }}
  <p>sem descrição</p>
{{ end }}

{{ .Date | time.Format ":date_long" }}   pipe: passa o valor para uma função
{{ $posts := where site.RegularPages "Section" "posts" }}   variável
```

**O ponto (`.`) é o contexto** — normalmente a página sendo desenhada. Dentro de
`range` e `with` ele muda. Esse é o conceito que mais confunde no começo.

## Qual template desenha cada página

Toda página tem um *kind* (tipo), e o Hugo escolhe o template pelo tipo:

| Kind | Exemplo | Template |
|------|---------|----------|
| `home` | `/` | `home.html` |
| `page` | `/posts/meu-post/` | `page.html` |
| `section` | `/posts/` | `section.html` |
| `taxonomy` | `/tags/` | `taxonomy.html` |
| `term` | `/tags/hugo/` | `term.html` |

> Hugo v0.146 introduziu esse sistema de templates "novo". Tutoriais antigos usam
> `layouts/_default/single.html`, `list.html` e `layouts/partials/` — no Hugo atual é
> `page.html`, `section.html` e `layouts/_partials/`. Lembre disso ao pesquisar.

## `baseof.html`: o esqueleto

Em vez de repetir `<html>`, `<head>`, cabeçalho e rodapé em todo template, o
`baseof.html` define a estrutura uma vez e deixa um "buraco" chamado `main`:

```go-html-template
<body>
  {{ partial "header.html" . }}
  <main>{{ block "main" . }}{{ end }}</main>
  {{ partial "footer.html" . }}
</body>
```

Os outros templates só preenchem o buraco:

```go-html-template
{{ define "main" }}
  <h1>{{ .Title }}</h1>
  {{ .Content }}
{{ end }}
```

Regra importante: um template que usa o `baseof` **só pode ter blocos `define`** (e
espaços/comentários). Qualquer HTML fora do `define` faz o Hugo ignorar o `baseof`.

## Partials: pedaços reutilizáveis

`{{ partial "post-meta.html" . }}` insere `_partials/post-meta.html` passando a página
atual como contexto. Assim a data e o tempo de leitura são escritos uma vez e usados na
home e no post.

Você pode passar outro contexto: em `section.html`,
`{{ partial "post-list.html" .Pages }}` passa a **lista de páginas** em vez da página.

## CSS e JS com Hugo Pipes (`_partials/head.html`)

```go-html-template
{{ $css := resources.Get "css/main.css" }}
{{ $chroma := resources.Get "css/chroma.css" }}
{{ $styles := slice $css $chroma | resources.Concat "css/estilo.css" }}
{{ if hugo.IsProduction }}
  {{ $styles = $styles | minify | fingerprint }}
{{ end }}
<link rel="stylesheet" href="{{ $styles.RelPermalink }}">
```

1. `resources.Get` lê arquivos de `assets/`.
2. `resources.Concat` junta os dois CSS em um (uma requisição só).
3. Em produção, `minify` remove espaços e `fingerprint` adiciona um hash no nome
   (`estilo.a1b2c3.css`). Quando o CSS muda, o nome muda e o navegador baixa a versão
   nova em vez de usar a do cache.

O JS passa por `js.Build` (esbuild embutido no Hugo), que também minifica em produção.

## Modo claro/escuro

Três peças trabalham juntas:

**1. Variáveis CSS** (`main.css`). Todas as cores são variáveis:

```css
:root { --bg: #fbfaf7; --text: #22201c; ... }          /* claro */

@media (prefers-color-scheme: dark) {                   /* escuro do sistema... */
  :root:not([data-theme="light"]) { --bg: #161513; ... } /* ...se o usuário não forçou claro */
}
:root[data-theme="dark"] { --bg: #161513; ... }         /* escuro forçado pelo botão */
```

O resto do CSS usa `var(--bg)`, `var(--text)` etc., então trocar o tema é só trocar as
variáveis.

**2. Botão** (`tema.js`). Ao clicar, coloca `data-theme="dark"` ou `"light"` no `<html>`
e salva a escolha no `localStorage`.

**3. Script no `<head>`**. Um script pequeno *inline* lê o `localStorage` e aplica o tema
**antes** da página ser desenhada. Sem isso, quem escolheu "escuro" veria a página piscar
em branco a cada carregamento.

## Destaque de código (`chroma.css`)

O Hugo usa a biblioteca **Chroma** para colorir código. Com `noClasses = false` no
`hugo.toml`, ela gera HTML com classes (`<span class="k">func</span>`) e as cores vêm do
CSS. O `chroma.css` foi gerado assim:

```bash
hugo gen chromastyles --style=github       # cores do modo claro
hugo gen chromastyles --style=github-dark  # cores do modo escuro (com prefixo de seletor)
```

As regras escuras foram prefixadas com `:root[data-theme="dark"]` (e a versão com
`@media`) para só valerem no modo escuro. No fim do arquivo há um "reset" que zera as
cores do tema claro no modo escuro — veja no [histórico](historico.md) o bug que motivou
isso. Estilos disponíveis: <https://xyproto.github.io/splash/docs/>

## Ideias para evoluir o tema (bons exercícios)

- Página "Sobre": crie `content/sobre.md` e adicione ao `[menu]`.
- Favicon: coloque um `favicon.ico` em `static/` e um `<link rel="icon">` no `head.html`.
- Imagem de capa nos posts: um campo `cover` no front matter e um `{{ with .Params.cover }}`
  no `page.html`.
- Open Graph (prévia ao compartilhar links): meta tags `og:title`, `og:description` no
  `head.html` — o Hugo tem um template embutido: `{{ partial "opengraph.html" . }}`.

Referências:
- Templates: <https://gohugo.io/templates/introduction/>
- Lookup order: <https://gohugo.io/templates/lookup-order/>
- Hugo Pipes: <https://gohugo.io/hugo-pipes/introduction/>

Próximo: [06-deploy.md](06-deploy.md)
