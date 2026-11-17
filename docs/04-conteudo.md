# 4. Escrevendo conteúdo

## Criando um post

```bash
hugo new content posts/aprendendo-hugo.md
```

O Hugo cria `content/posts/aprendendo-hugo.md` usando o modelo de
`archetypes/default.md`:

```markdown
---
title: "Aprendendo Hugo"
date: 2026-11-17T15:30:00-03:00
draft: true
tags: []
description: ""
---
```

O título é gerado a partir do nome do arquivo: `aprendendo-hugo` → "Aprendendo Hugo".

## Front matter

O bloco entre `---` no topo é o **front matter**: metadados da página em YAML. O resto
do arquivo é o conteúdo em Markdown.

| Campo | Para que serve |
|-------|----------------|
| `title` | Título do post |
| `date` | Data de publicação (ordena a lista de posts) |
| `draft` | `true` = rascunho, não é publicado em produção |
| `tags` | Lista de tags, ex.: `["hugo", "go"]` — gera páginas em `/tags/...` |
| `description` | Resumo curto: aparece na home e na meta description (SEO) |
| `toc` | (opcional) `false` para esconder o sumário neste post |

Você pode inventar outros campos; nos templates eles ficam em `.Params.nomeDoCampo`.

## Rascunhos

- `draft: true` → aparece no `hugo server -D` (com a flag `-D`), **não** aparece no
  build de produção. O tema mostra um selo "rascunho" para você lembrar.
- `draft: false` → publicado.

Posts com `date` no futuro também não são publicados até a data chegar (útil para
agendar). Para vê-los localmente use `hugo server -D -F`.

## Markdown básico

````markdown
## Subtítulo (vira item do sumário)

Texto com **negrito**, *itálico*, `código` e [um link](https://gohugo.io).

- item de lista
- outro item

> Uma citação.

```python
print("bloco de código com destaque de sintaxe")
```

![Texto alternativo da imagem](/imagens/foto.jpg)
````

Use `##` (H2) como maior nível dentro do post — o `#` (H1) já é o título.

## Imagens

Duas opções:

1. **Em `static/`** — salve em `static/imagens/foto.jpg` e use `/imagens/foto.jpg`.
2. **Page bundle** (mais organizado) — transforme o post numa pasta:
   ```
   content/posts/aprendendo-hugo/
   ├── index.md      ← o post
   └── foto.jpg
   ```
   e use `![descrição](foto.jpg)`. A imagem fica junto do post que a usa.

## Tags

```yaml
tags: ["hugo", "tutorial"]
```

Cada tag ganha uma página automática (`/tags/hugo/`) listando os posts, e `/tags/`
lista todas com a contagem. Isso vem das **taxonomias** do Hugo — `tags` e `categories`
existem por padrão.

## Archetypes

`archetypes/default.md` é o molde de todo conteúdo novo. Para um molde específico de
posts, crie `archetypes/posts.md` — o Hugo usa o arquivo com o nome da seção quando
existir.

Referências:
- Front matter: <https://gohugo.io/content-management/front-matter/>
- Page bundles: <https://gohugo.io/content-management/page-bundles/>

Próximo: [05-tema-lume.md](05-tema-lume.md)
