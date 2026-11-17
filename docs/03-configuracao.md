# 3. Configuração (`hugo.toml`)

O Hugo aceita configuração em TOML, YAML ou JSON. Usamos **TOML**, o padrão do Hugo.
Sintaxe básica:

```toml
chave = 'valor'          # texto
numero = 10              # número
ligado = true            # booleano

[secao]                  # uma tabela (agrupa chaves)
  chave = 'valor'

[[lista]]                # um item de uma lista de tabelas (repita para mais itens)
  nome = 'a'
[[lista]]
  nome = 'b'
```

## O nosso arquivo, explicado

```toml
baseURL = 'https://example.org/'
```
Endereço público do site. Usado para gerar links absolutos (RSS, sitemap, canonical).
**Não precisamos trocar**: o workflow do GitHub Actions passa a URL correta com
`--baseURL` na hora do build.

```toml
locale = 'pt-br'
```
Idioma do site. Vai para `<html lang="pt-br">` e faz o Hugo formatar datas em português
(ex.: "17 de novembro de 2026").

```toml
title = 'Meu Blog'
theme = 'lume'
```
Título (aparece no cabeçalho e na aba do navegador) e qual pasta de `themes/` usar.

```toml
enableRobotsTXT = true
```
Gera um `robots.txt` liberando os buscadores.

### `[params]` — parâmetros livres

Tudo dentro de `[params]` é **inventado pelo tema**. O Hugo não interpreta; ele só
disponibiliza nos templates como `site.Params.nome`.

```toml
[params]
  description = '...'   # meta description padrão (SEO)
  author = 'Seu Nome'   # aparece no rodapé
  homeTitle = 'Olá! 👋' # título grande da página inicial
  homeIntro = '...'     # texto abaixo do título (aceita Markdown)
  homePosts = 10        # quantos posts na página inicial
  toc = true            # sumário nos posts
  # terminalPrompt = 'voce@blog'  # (opcional) texto do prompt no estilo terminal;
                                  # o padrão é 'visitante@blog'
```

Exemplo de uso no template (`home.html`):

```go-html-template
{{ with site.Params.homeIntro }}<p class="lead">{{ . | markdownify }}</p>{{ end }}
```

O tema também tem um `themes/lume/hugo.toml` com valores **padrão**. Se o site não
definir `homePosts`, vale o do tema. O do site sempre ganha.

### `[menu]` — menu de navegação

```toml
[[menu.main]]
  identifier = 'posts'
  name = 'Posts'        # texto do link
  pageRef = '/posts'    # página de destino (o Hugo resolve a URL)
  weight = 10           # ordem: menor vem primeiro
```

Usamos `pageRef` em vez de `url` porque assim o Hugo sabe *qual página* o item aponta e
consegue marcar o item ativo (`aria-current="page"` no `header.html`).

### `[markup]` — como o Markdown vira HTML

```toml
[markup.highlight]
  noClasses = false
```
Por padrão o Hugo pinta o código com estilos *inline* (`style="color:..."`). Com
`noClasses = false` ele usa **classes CSS**, e as cores ficam no nosso `chroma.css` — o
que permite ter cores diferentes no modo claro e no escuro.

```toml
[markup.goldmark.renderer]
  unsafe = false
```
Goldmark é o processador de Markdown do Hugo. Com `unsafe = false` (o padrão), HTML cru
escrito dentro do Markdown é removido. Mude para `true` se quiser colar HTML nos posts.

## Ambientes: desenvolvimento x produção

- `hugo server` roda em **development**.
- `hugo` (build) roda em **production**.

Nos templates dá para testar com `hugo.IsProduction`. O lume usa isso para só
minificar e colocar hash no CSS em produção (`_partials/head.html`).

Referência: <https://gohugo.io/configuration/>

Próximo: [04-conteudo.md](04-conteudo.md)
