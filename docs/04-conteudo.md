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

O jeito recomendado é o **page bundle**: transforme o post numa pasta e coloque as imagens
ao lado dele.

```
content/posts/aprendendo-hugo/
├── index.md      ← o post
└── foto.jpg
```

No post, use o Markdown normal e escolha o tamanho com um sufixo `#` no caminho. O texto
entre aspas vira a legenda:

```markdown
![descrição](foto.jpg)                    grande, 1000px (padrão)
![descrição](foto.jpg#media)              média, 700px
![descrição](foto.jpg#pequena "Legenda")  pequena, 400px
![descrição](foto.jpg#cheia)              largura toda do texto (até 1600px)
![descrição](foto.jpg#original)           sem reduzir e sem trocar o formato (PNG continua PNG)
![descrição](foto.jpg#300w)               exatamente 300px de largura (altura proporcional)
![descrição](foto.jpg#200h)               exatamente 200px de altura (largura proporcional)
![descrição](foto.jpg#300w,200h)          caixa de 300x200px, recortada no centro
```

As medidas (`300w`, `200h`) nunca ampliam: se pedir mais que o original, usa o tamanho
dele. Com `#original` o arquivo é publicado como está (bom para prints com texto), e
ainda sai uma versão com metade da largura no `srcset` para telas pequenas.

Nos outros tamanhos, o tema redimensiona a imagem no build, converte para `webp` e gera uma versão 2x para
telas de alta resolução. Você pode colocar a foto original da câmera na pasta: o site
publica só as versões leves. Para isso, o front matter do post precisa de:

```yaml
build:
  publishResources: false   # não publica o arquivo original
```

Sempre escreva a descrição (`alt`): ela é lida por leitores de tela. Veja
`content/posts/teste-de-imagens/` como exemplo. Detalhes técnicos em
[05-tema-lume.md](05-tema-lume.md#imagens-render-hook).

Alternativas: arquivos em `static/` (ex.: `/imagens/foto.jpg`) e URLs externas funcionam,
mas aparecem **sem** redimensionamento (o sufixo de tamanho ainda controla a largura
máxima na tela).

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
