# 7. Cola de comandos

## Hugo

| Comando | O que faz |
|---------|-----------|
| `hugo server -D` | Servidor local com rascunhos; recarrega a cada salvamento |
| `hugo server -D -F` | Idem, incluindo posts com data futura |
| `hugo server --disableFastRender` | Rebuild completo a cada mudança (quando algo não atualiza) |
| `hugo` | Build de produção em `public/` |
| `hugo --gc --minify` | Build de produção limpando cache e minificando (igual ao deploy) |
| `hugo new content posts/nome.md` | Cria um post a partir do archetype |
| `hugo list drafts` | Lista os rascunhos |
| `hugo list future` | Lista posts agendados |
| `hugo version` | Versão instalada |
| `hugo gen chromastyles --style=NOME` | Gera CSS de destaque de código |

O servidor local usa a porta **1313**; se ela estiver ocupada, o Hugo escolhe outra e
mostra no terminal (`Web Server is available at http://localhost:XXXX/`).

## Testes (dentro de `tests/`; veja [10-testes.md](10-testes.md))

| Comando | O que faz |
|---------|-----------|
| `npm install` | Instala o Playwright (só na primeira vez) |
| `npm test` | Roda as 4 camadas: lógica, Python, renderização e navegador |
| `npm run unit` | Lógica pura e script do `<head>` (rápido) |
| `npm run python` | Script da skill `/comentar` |
| `npm run render` | HTML gerado pelo Hugo |
| `npm run e2e` | Navegador de verdade (abre o Edge) |
| `npx playwright test comentarios -g "Ler mais"` | Só um arquivo / parte do nome |

## Git (fluxo do dia a dia)

```bash
git status                       # o que mudou
git add content/posts/novo.md    # prepara um arquivo
git add .                        # prepara tudo
git commit -m "Adiciona post sobre X"
git push                         # envia → dispara o deploy
git log --oneline                # histórico resumido
```

## Fluxo para publicar um post

```bash
hugo new content posts/meu-post.md   # 1. cria
hugo server -D                       # 2. escreve vendo o resultado
# 3. muda draft: true → draft: false
hugo --gc --minify                   # 4. confere se o build passa
git add . && git commit -m "Publica post: Meu post" && git push   # 5. publica
```
