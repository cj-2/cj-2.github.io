# 6. Deploy: GitHub Actions + GitHub Pages

## As duas peças

- **GitHub Pages** — hospedagem gratuita de sites estáticos do GitHub.
- **GitHub Actions** — automação que roda comandos nos servidores do GitHub quando algo
  acontece no repositório (um `push`, por exemplo).

Juntando: a cada `push` na `main`, o Actions instala o Hugo, gera o site e entrega a
pasta `public/` para o Pages publicar. Você nunca precisa versionar o `public/`.

## Configuração única no GitHub (feita uma vez)

1. Crie o repositório no GitHub.
   - Nome `SEU-USUARIO.github.io` → site em `https://SEU-USUARIO.github.io/`
   - Qualquer outro nome → `https://SEU-USUARIO.github.io/NOME-DO-REPO/`
2. Em **Settings → Pages → Build and deployment → Source**, escolha **GitHub Actions**.
3. Conecte o repositório local e envie:
   ```bash
   git remote add origin https://github.com/SEU-USUARIO/NOME-DO-REPO.git
   git push -u origin main
   ```
4. Acompanhe na aba **Actions** do repositório. Quando ficar verde, o site está no ar.

## O workflow (`.github/workflows/hugo.yaml`) explicado

```yaml
on:
  push:
    branches: [main]
  workflow_dispatch:
```
Roda a cada push na `main` e também manualmente (botão "Run workflow" na aba Actions).

```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```
Permissões mínimas: ler o código e publicar no Pages.

```yaml
concurrency:
  group: pages
  cancel-in-progress: false
```
Se dois pushes acontecerem em seguida, os deploys rodam um de cada vez.

### Job `build`

```yaml
env:
  HUGO_VERSION: 0.168.0
```
Fixa a versão do Hugo — a mesma usada localmente — para o resultado ser igual ao que
você viu no `hugo server`. Ao atualizar o Hugo na sua máquina, atualize aqui também.

Passos:
1. **Install Hugo CLI** — baixa o `.deb` do Hugo extended no Ubuntu do GitHub.
2. **Checkout** — baixa o código do repositório. `fetch-depth: 0` traz o histórico
   completo (o Hugo pode usar datas do git, se você ativar `enableGitInfo`).
3. **Setup Pages** — descobre a URL final do site.
4. **Build with Hugo** — `hugo --gc --minify --baseURL "<url do pages>/"`. É aqui que o
   `baseURL` correto é injetado, por isso o `hugo.toml` pode ficar com `example.org`.
5. **Upload artifact** — empacota `public/`.

### Job `deploy`

Pega o pacote e publica no GitHub Pages. `needs: build` garante que só roda se o build
der certo — **se o build falhar, o site antigo continua no ar**.

## Quando algo dá errado

- Aba **Actions** → clique na execução vermelha → abra o passo que falhou e leia o log.
- Erro comum: rodar `hugo --gc --minify` localmente antes do push pega 99% dos problemas.
- Site com CSS quebrado/links errados geralmente é `baseURL` — confira se o Pages está
  com Source = "GitHub Actions".

## Domínio próprio (opcional)

Em **Settings → Pages → Custom domain**, informe o domínio e configure o DNS conforme a
documentação do GitHub: <https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site>

Referência oficial do Hugo: <https://gohugo.io/host-and-deploy/host-on-github-pages/>

Próximo: [07-comandos.md](07-comandos.md)
