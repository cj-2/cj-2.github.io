# Histórico do projeto

Diário das mudanças, com **o que** foi feito, **por quê** e **o que dá para aprender**.
Entradas mais recentes no topo.

---

## 2026-11-17 — Largura do meio como padrão

**O quê:** o tamanho padrão da área de texto passou a ser o do meio (64rem). A antiga
largura padrão (42rem) virou a opção **estreita**; a **total** continua igual. O botão agora
cicla estreita → padrão → total.

**Por quê:** 64rem lê melhor em telas grandes, e quem prefere linhas curtas ainda tem a
estreita.

**Como:** `--measure` no `:root` agora vale 64rem, e o atributo `data-width` ganhou os
valores `narrow` (42rem) e `full` (100%). Sem atributo = padrão. O `localStorage` só guarda
`narrow` ou `full`; quem tinha `wide` salvo volta ao padrão, que agora tem o mesmo tamanho.

**Aprendizado:** o *padrão* é só "o que vale quando nada foi escolhido". Trocar qual opção
é o padrão é mexer na variável base, não nas opções.

---

## 2026-11-17 — Botão de largura do texto

**O quê:** novo botão no menu (ao lado de estilo e cor) que alterna a largura da área de
texto entre **padrão** (42rem), **larga** (64rem) e **total** (100% da janela). A escolha
fica salva no `localStorage` (chave `largura`).

**Por quê:** facilitar a leitura em telas grandes sem mexer no padrão, que já era bonito.

**Como:** o tema já controlava a largura por uma única variável CSS, `--measure`, usada em
`.container`. Então o botão só troca o atributo `data-width` no `<html>`
(`wide` / `full`; sem atributo = padrão), e o CSS redefine a variável:
`:root[data-width="wide"] { --measure: 64rem; }`. O script do `<head>` aplica o valor salvo
antes da primeira pintura, para a página não "pular" de tamanho. Em telas até 720px o botão
some, porque a largura já é a da tela.

**Aprendizado:** quando um valor de layout vive numa *variável CSS*, mudar o comportamento
do site inteiro vira trocar um atributo. É o mesmo padrão usado para estilo e cor.

---

## 2026-11-17 — Terminal como estilo padrão

**O quê:** quem abre o blog pela primeira vez agora vê o estilo terminal; o botão do menu
leva ao normal.

**Como:** antes só guardávamos `estilo = terminal` no `localStorage` (ausente = normal).
Com o padrão invertido, ausente passou a significar terminal e o que se guarda é
`estilo = normal`. Mudou o script do `<head>` (`head.html`) e o clique em `tema.js`.

**Aprendizado:** ao inverter um padrão, a "ausência de valor" muda de significado. Quem
já tinha salvo `terminal` continua no terminal; quem estava no normal sem ter salvo nada
passa a ver o terminal uma vez (e a escolha dele vale dali em diante).

---

## 2026-11-17 — Estilo "terminal" e cor "sistema"

**O quê:** o tema ganhou um segundo estilo visual, **terminal** (fonte monoespaçada,
janela com barra de título, linhas de prompt como `$ cat post.md`, títulos com `#`,
cursor piscando). O botão de cor passou a ter três estados: **sistema → claro → escuro**.
Os dois controles ficam no menu e funcionam juntos (6 combinações).

**Como funciona:**
- Dois atributos no `<html>`: `data-style="terminal"` (sem ele = normal) e
  `data-theme="light|dark"` (sem ele = segue o sistema). Ficam salvos no `localStorage`
  (`estilo` e `tema`) e são aplicados por um script no `<head>` antes de pintar a página.
- `assets/css/terminal.css` tem tudo do estilo terminal e é concatenado **depois** do
  `main.css`, porque com especificidade igual a última regra ganha.
- `_partials/prompt.html` gera as linhas de prompt; elas existem no HTML sempre, mas o
  CSS só as mostra no terminal.

**Ajustes feitos nos testes:** a lista de posts no terminal mostrava a data antes das
permissões (corrigido com `order` no flexbox para imitar o `ls -l`), e a 404 mostrava o
caminho `~/404.html` no prompt (trocado por `~`).

**Aprendizado:** no Go template, `cond` avalia os dois lados antes de escolher, então
`cond (ne .File nil) .File.ContentBaseName "x"` quebra numa página sem arquivo. Use
`with` quando um dos lados pode não existir.

---

## 2026-11-17 — AGENTS.md e documentação de aprendizado

**O quê:** criados `AGENTS.md` (regras para agentes de IA), `CLAUDE.md` e esta pasta
`docs/`.

**Por quê:**
- `AGENTS.md` é um padrão aberto lido por várias ferramentas de IA (Codex, Cursor e
  outras). Ele descreve o projeto, os comandos e as regras — por exemplo, que o agente
  **não deve se adicionar como coautor nos commits**.
- O Claude Code lê `CLAUDE.md`, não `AGENTS.md`. Em vez de duplicar o conteúdo, o
  `CLAUDE.md` tem uma única linha, `@AGENTS.md`, que **importa** o outro arquivo. Uma fonte
  da verdade, várias ferramentas.
- `docs/` fica fora de `content/`, então o Hugo não publica nada daqui.

**Aprendizado:** documentar decisões enquanto elas são tomadas é muito mais fácil do
que reconstruí-las depois.

---

## 2026-11-17 — Removido o tema PaperMod

**O quê:** removido o submódulo `themes/PaperMod`, o `.gitmodules`, a configuração do
submódulo em `.git/config` e a opção `submodules: recursive` do workflow.

**Por quê:** com o tema próprio pronto, o PaperMod virou código morto. Remover um
submódulo deixa rastros em vários lugares, por isso a limpeza teve várias etapas:

```bash
git rm -f themes/PaperMod                         # tira do índice e apaga a pasta
rm -rf .git/modules/themes/PaperMod               # apaga o clone interno do git
git config --remove-section submodule.themes/PaperMod   # tira do .git/config
```

**Aprendizado:** submódulos git são práticos para temas de terceiros (dá para atualizar
com um comando), mas adicionam complexidade. Com um tema próprio, versionar os arquivos
direto no repositório é mais simples.

---

## 2026-11-17 — Tema próprio "lume"

**O quê:** criado o tema `themes/lume/` do zero e ativado no `hugo.toml`. Removida a
página de busca (dependia do PaperMod).

**Por quê:** ter controle total do visual e aprender como um tema Hugo funciona por
dentro. Detalhes da construção em [05-tema-lume.md](05-tema-lume.md).

**Decisões:**
- Sistema de templates novo do Hugo (v0.146+): `home.html`, `page.html`, `section.html`,
  `_partials/`. Confirmado na documentação oficial antes de começar, porque muitos
  tutoriais na internet ainda usam a estrutura antiga (`_default/single.html`).
- Cores em variáveis CSS para o modo escuro ser só uma troca de variáveis.
- Nenhuma dependência externa (nem fontes do Google): fontes do sistema, um CSS e um JS
  pequenos.
- No `hugo.toml`, o menu passou a usar `pageRef` em vez de `url`, para o Hugo saber qual
  item está ativo.

**Bug encontrado e corrigido:** ao testar no navegador, a pontuação dos blocos de código
(`(`, `)`, `{`, `.`) **sumia no modo escuro**.

- *Causa:* o `chroma.css` tem as regras do tema claro (`github`) e, por cima, as do
  escuro (`github-dark`). O tema claro define cor para a classe `.p` (pontuação); o escuro
  **não define**. Então, no modo escuro, a cor escura do tema claro continuava valendo —
  texto escuro sobre fundo escuro.
- *Investigação:* no navegador, `getComputedStyle()` mostrou a cor `rgb(31, 35, 40)`
  (quase preto) nos `<span class="p">`.
- *Correção:* no fim do `chroma.css`, uma regra que, no modo escuro, faz todo token
  herdar a cor do texto (`color: inherit`). As regras específicas do github-dark são mais
  específicas e continuam ganhando; o que não tem regra escura cai na cor padrão.

**Aprendizado:** *especificidade CSS* — quando duas regras se aplicam ao mesmo
elemento, ganha a mais específica (`:root[data-theme="dark"] .chroma .k` ganha de
`:root[data-theme="dark"] .chroma span`, que ganha de `.chroma .p`). E: sempre teste os
dois modos de cor; bugs de contraste não aparecem no build.

---

## 2026-11-17 — Configuração inicial

**O quê:**
- `hugo new site . --force --format toml` para criar a estrutura.
- `git init -b main`.
- Tema PaperMod como submódulo (depois substituído pelo lume).
- `hugo.toml` em pt-br, post de exemplo e archetype com `tags` e `description`.
- Workflow `.github/workflows/hugo.yaml` baseado no oficial do Hugo, com a versão do Hugo
  fixada em 0.168.0 (a mesma instalada localmente).
- `.gitignore` para `public/`, `resources/_gen/` e `.hugo_build.lock`.

**Por quê:** deixar o projeto pronto para escrever localmente e publicar com um `git push`.

**Aprendizado:** o `--force` no `hugo new site .` permite criar o site numa pasta que já
existe; e fixar a versão do Hugo no CI evita surpresas quando uma versão nova muda algum
comportamento.
