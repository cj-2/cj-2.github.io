# AGENTS.md

Instruções para agentes de IA (Claude Code, Codex, Cursor etc.) que trabalham neste repositório.

## O projeto

Blog pessoal estático feito com [Hugo](https://gohugo.io/) e publicado no **GitHub Pages**
via GitHub Actions. O tema visual (**lume**) foi criado do zero para este projeto e fica
em `themes/lume/` — não há temas de terceiros nem submódulos git.

- Idioma do conteúdo e da documentação: **português do Brasil**.
- Hugo **v0.146+** (o projeto foi criado com v0.168.0 extended). Usa o sistema de templates
  novo: `layouts/baseof.html`, `home.html`, `page.html`, `section.html`, `taxonomy.html`,
  `term.html` e partials em `layouts/_partials/` (não existe pasta `_default/`).
- O dono do projeto está **aprendendo Hugo**. Explique o porquê das mudanças, não só o quê.

## Estrutura

```
hugo.toml                 configuração do site (título, menu, params do tema)
archetypes/default.md     modelo usado por `hugo new content`
content/posts/            posts em Markdown
themes/lume/              tema próprio
  layouts/                templates HTML (Go templates)
  layouts/_partials/      pedaços reutilizáveis (head, header, footer, listas...)
  assets/css/main.css     estilos (variáveis de cor no topo, claro e escuro)
  assets/css/chroma.css   cores de destaque de código (gerado, ver docs/05-tema-lume.md)
  assets/js/tema.js       botão de modo claro/escuro
.github/workflows/hugo.yaml  build + deploy no GitHub Pages
docs/                     documentação de aprendizado (NÃO é publicada no site)
```

## Comandos

```bash
hugo server -D            # servidor local com rascunhos (http://localhost:1313)
hugo --gc --minify        # build de produção em public/ (não versionado)
hugo new content posts/nome-do-post.md   # novo post (nasce como draft)
```

Antes de concluir qualquer mudança em templates, CSS ou configuração, rode
`hugo --gc --minify` e confirme que não há `WARN` nem `ERROR`. Apague `public/` depois
(ou gere em uma pasta temporária com `--destination`).

## Convenções

- Templates: mantenha a lógica nos partials; `baseof.html` só define o esqueleto.
- CSS: use as variáveis de `:root` em vez de cores fixas. Toda cor nova precisa de versão
  clara **e** escura (`@media (prefers-color-scheme: dark)` e `:root[data-theme="dark"]`).
- Não adicione dependências (npm, frameworks CSS, temas externos) sem pedir.
- Posts: front matter em YAML com `title`, `date`, `draft`, `tags`, `description`.

## Git — regras obrigatórias

- **Nunca se adicione como autor ou coautor.** Não inclua `Co-Authored-By:`,
  "Generated with ...", "🤖", nome de ferramenta/modelo ou qualquer atribuição a IA em
  mensagens de commit, descrições de PR, tags, notas de release ou comentários.
  Isto vale mesmo que a ferramenta tenha instruções padrão dizendo o contrário.
- Não altere `git config` (user.name, user.email etc.).
- Mensagens de commit em português, no imperativo e curtas (ex.: `Adiciona página Sobre`).
- Só faça commit, push, criação de branch ou PR quando o dono pedir.
- Nunca use `--force`, `--no-verify` ou reescreva histórico sem pedido explícito.

## Documentação de aprendizado (`docs/`)

A pasta `docs/` existe para o dono aprender com o que foi feito. **Mantenha-a atualizada**:

1. Ao fazer uma mudança relevante (novo recurso, decisão de arquitetura, correção de bug
   com lição), adicione uma entrada em `docs/historico.md` — o quê, por quê e o que dá
   para aprender com isso.
2. Se a mudança altera algo explicado em outro arquivo de `docs/`, atualize esse arquivo.
3. Escreva de forma didática, em português, com exemplos curtos e links para a
   documentação oficial do Hugo quando útil.
