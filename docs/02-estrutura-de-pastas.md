# 2. Estrutura de pastas

```
blog/
├── hugo.toml               ← configuração principal do site
├── AGENTS.md               ← regras para agentes de IA
├── CLAUDE.md               ← só importa o AGENTS.md (o Claude Code lê este nome)
├── archetypes/
│   └── default.md          ← modelo de front matter para conteúdo novo
├── assets/                 ← (vazia) CSS/JS/imagens do SITE processados pelo Hugo
├── content/                ← TODO o conteúdo do blog
│   └── posts/
│       └── meu-primeiro-post.md
├── data/                   ← (vazia) arquivos JSON/YAML/TOML para usar nos templates
├── i18n/                   ← (vazia) traduções de textos da interface
├── layouts/                ← (vazia) templates do SITE que sobrescrevem os do tema
├── static/                 ← (vazia) arquivos copiados sem alteração (favicon, imagens)
├── themes/
│   └── lume/               ← nosso tema, feito do zero
│       ├── hugo.toml       ← valores padrão do tema
│       ├── layouts/        ← templates HTML
│       └── assets/         ← CSS e JS do tema
├── docs/                   ← esta documentação (não vai para o site)
├── tests/                  ← testes automáticos (não vão para o site; ver 10-testes.md)
├── .github/workflows/
│   └── hugo.yaml           ← automação de build e deploy
├── .claude/launch.json     ← configuração do servidor de preview no Claude Code
├── .gitignore              ← o que o git deve ignorar
└── public/                 ← (gerada, ignorada pelo git) o site pronto
```

## As pastas que mais importam

### `content/`
Onde você passa a maior parte do tempo. Cada `.md` vira uma página. Subpastas viram
**seções** (`posts/` é uma seção). Veja [04-conteudo.md](04-conteudo.md).

### `themes/lume/`
A aparência do site. Separar o tema do conteúdo permite trocar o visual sem tocar nos
posts. Veja [05-tema-lume.md](05-tema-lume.md).

### `static/` x `assets/`
Os dois guardam arquivos como imagens e CSS, mas:

- **`static/`** — copiado *como está* para `public/`. Use para favicon, `robots.txt`
  manual, imagens que não precisam de processamento.
- **`assets/`** — passa pelo **Hugo Pipes**: pode ser minificado, concatenado,
  redimensionado, ganhar hash no nome (para cache) etc. O CSS do tema fica aqui.

## Sobrescrevendo o tema sem editar o tema

O Hugo procura arquivos primeiro na raiz do projeto e só depois no tema. Então, se você
criar `layouts/_partials/footer.html` **na raiz**, ele substitui o
`themes/lume/layouts/_partials/footer.html`. O mesmo vale para `assets/` e `static/`.

Isso é muito útil com temas de terceiros (você não mexe no código deles). Como o lume é
nosso, podemos editar direto nele — mas é bom saber que o mecanismo existe.

## O que NÃO vai para o git

O `.gitignore` exclui:

- `public/` — é gerado; quem gera em produção é o GitHub Actions.
- `resources/_gen/` — cache de imagens/CSS processados.
- `.hugo_build.lock` — arquivo temporário de trava do build.

Próximo: [03-configuracao.md](03-configuracao.md)
