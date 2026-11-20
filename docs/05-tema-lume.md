# 5. O tema lume

O lume foi feito do zero para este blog. Objetivo: visual minimalista, foco em leitura,
modo claro/escuro e zero dependências externas.

Ele tem **dois estilos** (normal e terminal) e **três opções de cor** (sistema, claro e
escuro). Os dois botões do menu controlam isso de forma independente, o que dá 6
combinações.

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
│   ├── _markup/
│   │   └── render-image.html  como cada imagem do Markdown vira HTML
│   └── _partials/
│       ├── head.html         <head>: meta tags, CSS, JS
│       ├── header.html       cabeçalho com menu e botões de estilo e cor
│       ├── footer.html       rodapé
│       ├── prompt.html       linha de prompt do estilo terminal
│       ├── post-meta.html    data + tempo de leitura
│       ├── post-list.html    lista de posts agrupada por ano
│       └── tags.html         lista de tags de um post
└── assets/
    ├── css/main.css          estilo normal (e a base de tudo)
    ├── css/terminal.css      estilo terminal
    ├── css/chroma.css        cores do destaque de código
    └── js/tema.js            botões de estilo e de cor
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
{{ $terminal := resources.Get "css/terminal.css" }}
{{ $chroma := resources.Get "css/chroma.css" }}
{{ $styles := slice $css $terminal $chroma | resources.Concat "css/estilo.css" }}
{{ if hugo.IsProduction }}
  {{ $styles = $styles | minify | fingerprint }}
{{ end }}
<link rel="stylesheet" href="{{ $styles.RelPermalink }}">
```

1. `resources.Get` lê arquivos de `assets/`.
2. `resources.Concat` junta os três CSS em um (uma requisição só). A ordem da lista é a
   ordem no arquivo final, e isso importa: veja "Estilo terminal" abaixo.
3. Em produção, `minify` remove espaços e `fingerprint` adiciona um hash no nome
   (`estilo.a1b2c3.css`). Quando o CSS muda, o nome muda e o navegador baixa a versão
   nova em vez de usar a do cache.

O JS passa por `js.Build` (esbuild embutido no Hugo), que também minifica em produção.

## Estilo e cor: dois atributos no `<html>`

Todo o estado visual fica em dois atributos da tag `<html>`:

| Atributo | Valores | Sem o atributo |
|----------|---------|----------------|
| `data-style` | `terminal` | estilo normal (mas o script do `<head>` aplica `terminal` por padrão) |
| `data-theme` | `light`, `dark` | segue a cor do sistema |

O CSS reage a esses atributos, e o JavaScript só liga e desliga os atributos. Separar
assim deixa cada parte simples.

### Cor: sistema, claro ou escuro

**1. Variáveis CSS** (`main.css`). Todas as cores são variáveis:

```css
:root { --bg: #fbfaf7; --text: #22201c; ... }          /* claro */

@media (prefers-color-scheme: dark) {                   /* escuro do sistema... */
  :root:not([data-theme="light"]) { --bg: #161513; ... } /* ...se o usuário não forçou claro */
}
:root[data-theme="dark"] { --bg: #161513; ... }         /* escuro forçado pelo botão */
```

O resto do CSS usa `var(--bg)`, `var(--text)` etc., então trocar a cor é só trocar as
variáveis. Repare que **"sistema" não precisa de regra própria**: é simplesmente não ter
`data-theme`, e aí quem decide é o `@media (prefers-color-scheme: dark)`.

**2. Botão** (`tema.js`). Cada clique avança no ciclo sistema → claro → escuro →
sistema. Em "sistema" o atributo é removido (`delete root.dataset.theme`) e a chave
`tema` sai do `localStorage`. O ícone do botão mostra a cor atual (monitor, sol ou lua),
e o texto de ajuda (`title`) diz qual é a próxima.

**3. Script no `<head>`**. Um script pequeno *inline* lê o `localStorage` e aplica cor e
estilo **antes** da página ser desenhada. Sem isso, quem escolheu "escuro" ou "terminal"
veria a página piscar no visual errado a cada carregamento.

### Estilo terminal

**É o estilo padrão.** O script do `<head>` põe `data-style="terminal"` em quem nunca
escolheu nada. Só quem clicou no botão para voltar ao normal fica com o normal: nesse
caso o `localStorage` guarda `estilo = normal`. (Sem JavaScript o site aparece no estilo
normal, porque é o que o CSS faz quando o atributo não existe.)

Fica todo em `assets/css/terminal.css`, com regras que começam por
`[data-style="terminal"]`. Ele tem as próprias variáveis de cor (claro e escuro) e troca
as fontes: `--font-sans` e `--font-serif` passam a valer `var(--font-mono)`, então o site
inteiro vira monoespaçado sem mexer em cada regra.

**Por que `terminal.css` vem depois do `main.css`:** quando duas regras têm a mesma
*especificidade*, ganha a que aparece por último. `:root[data-style="terminal"]` (cores
claras do terminal) tem a mesma especificidade que `:root[data-theme="dark"]` (cores
escuras do estilo normal). Se o terminal viesse antes, o estilo normal "vazaria" por cima
dele. As cores escuras do terminal usam dois atributos
(`:root[data-style="terminal"][data-theme="dark"]`), têm especificidade maior e ganham
sempre.

**Elementos que só aparecem no terminal:**
- A **janela**: `baseof.html` envolve o conteúdo em `.term-window`, com uma `.term-bar`
  (as três bolinhas e o caminho da página). No estilo normal a barra fica com
  `display: none` e a janela não tem moldura, então é como se não existisse.
- As **linhas de prompt**: `_partials/prompt.html` gera `visitante@blog:~/posts$ ls -l`.
  Cada template chama o partial com um comando que combina com a página:
  ```go-html-template
  {{ partial "prompt.html" (dict "page" . "cmd" "ls -l") }}
  ```
  `dict` cria um "dicionário" para passar **mais de um valor** a um partial. Dentro dele,
  os valores ficam em `.page` e `.cmd`.
- O texto do prompt pode ser trocado no `hugo.toml` com `terminalPrompt = 'voce@blog'`
  dentro de `[params]`.

**Enfeites feitos só com CSS** (pseudo-elementos `::before` e `::after`, sem mexer no HTML):
`# ` antes dos títulos, `./` antes dos links do menu, o cursor piscando depois do nome do
site e as permissões `-rw-r--r--` na lista de posts. O cursor para de piscar para quem
ativou "reduzir movimento" no sistema (`prefers-reduced-motion`).

## Imagens (render hook)

Um *render hook* é um template que **substitui o HTML que o Hugo gera** para um pedaço do
Markdown. `layouts/_markup/render-image.html` roda para cada `![alt](caminho "legenda")`.

O que ele faz:
1. Lê o sufixo do caminho (`#media`, `#original`, `#300w,200h`) com `urls.Parse` e escolhe a largura numa tabela
   (`dict`): pequena 400, média 700, grande 1000 (padrão), cheia 1600.
2. Procura o arquivo nos recursos da própria página (`.PageInner.Resources.Get`, que só
   funciona em page bundles) e, se não achar, em `assets/`.
3. Com `.Resize "700x webp q80"` gera a versão pequena e, se o original for grande o
   bastante, outra com o dobro da largura para o `srcset` (o navegador escolhe). Nunca
   amplia além do original.
4. Escreve `width` e `height` no `<img>` (a página não "pula" quando a imagem carrega) e
   `loading="lazy"` (só baixa quando chega perto).
5. O CSS (`.img-pequena`, `.img-media`...) limita a largura de exibição. SVG, GIF e URLs
   externas não são processados, só exibidos.

Usamos `<span>` e não `<figure>` porque o Markdown já coloca a imagem dentro de um `<p>`,
e `<figure>` ali é HTML inválido. No terminal a legenda ganha um `# ` na frente.

Referência: <https://gohugo.io/render-hooks/images/> e
<https://gohugo.io/methods/resource/resize/>

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
