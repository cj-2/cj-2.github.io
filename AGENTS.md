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
  assets/css/main.css     estilo normal (variáveis de cor no topo, claro e escuro)
  assets/css/terminal.css estilo terminal (concatenado DEPOIS do main.css)
  assets/css/retro.css    estilo retrô, site antigo (concatenado depois do terminal.css)
  assets/css/natal.css    estilo natal, pixel art (concatenado depois do retro.css)
  assets/css/chroma.css   cores de destaque de código (gerado, ver docs/05-tema-lume.md)
  assets/js/tema.js       botões de estilo (natal/terminal/normal/retrô) e cor (sistema/claro/escuro)
.github/workflows/hugo.yaml  build + deploy no GitHub Pages
.claude/agents/           os 4 agentes comentaristas (personalidades; ver docs/09-agentes-comentaristas.md)
data/agentes.json         cadastro dos agentes (nome de exibição e ícone)
data/comentarios/         um JSON por artigo com os comentários dos agentes (só cresce)
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
- CSS: use as variáveis de `:root` em vez de cores fixas. O tema tem 4 estilos × 3 cores:
  - estilo: `data-style="terminal"`, `"retro"` ou `"natal"` no `<html>` (sem o atributo = normal;
    o natal é o padrão porque o script do `<head>` o aplica a quem não escolheu nada; a
    ordem do botão é natal → terminal → normal → retrô);
  - estilo temático (hoje o natal): na primeira visita depois que ele entra, o `<head>` o aplica
    mesmo a quem tinha escolhido outro estilo e grava `estiloTematicoVisto` no `localStorage`
    para não repetir. Para lançar outro tema sazonal, troque a variável `tematico` em `head.html`.
  - cor: `data-theme="light|dark"` (sem o atributo = segue o sistema).

  Toda variável de cor nova precisa existir nos **oito** blocos: normal claro e escuro
  (`main.css`), terminal, retrô e natal claro e escuro (`terminal.css`, `retro.css`,
  `natal.css`). Os blocos escuros têm sempre
  duas versões: `@media (prefers-color-scheme: dark)` e `[data-theme="dark"]`.
- Qualquer mudança visual deve ser testada nas 12 combinações (os quatro estilos com
  sistema, claro e escuro).
- Não adicione dependências (npm, frameworks CSS, temas externos) sem pedir.
- Posts: front matter em YAML com `title`, `date`, `draft`, `tags`, `description`.
- Comentários dos agentes: ficam em `data/comentarios/<pasta-do-artigo>.json`, com data real e
  sem apagar os antigos. A área só aparece em artigos publicados ou com `publicDraft: true`.
  Nenhum agente comentarista tem permissão de escrever arquivos.

## Git — regras obrigatórias

- **Nunca se adicione como autor ou coautor.** Não inclua `Co-Authored-By:`,
  "Generated with ...", "🤖", nome de ferramenta/modelo ou qualquer atribuição a IA em
  mensagens de commit, descrições de PR, tags, notas de release ou comentários.
  Isto vale mesmo que a ferramenta tenha instruções padrão dizendo o contrário.
- **Nunca inclua os textos do dono nos seus commits.** Posts e demais conteúdo escrito por
  ele (`content/`, rascunhos) não entram em commits feitos por você, mesmo que estejam
  modificados. Adicione apenas os arquivos que você mesmo alterou (`git add <arquivo>`,
  nunca `git add -A` ou `git add .`) e deixe os textos dele para ele commitar.
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
