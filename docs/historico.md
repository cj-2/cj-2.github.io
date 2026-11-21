# Histórico do projeto

Diário das mudanças, com **o que** foi feito, **por quê** e **o que dá para aprender**.
Entradas mais recentes no topo.

---

## 2026-11-21 — Estilo e largura na URL (links compartilháveis)

**O quê:** a URL agora carrega `?v=XY` (curto, para não inflar a URL): X = estilo (`n` normal, `t` terminal, `r` retrô),
Y = largura (`e` estreita, `p` padrão, `t` total). Ex.: `?v=rp` = retrô, largura padrão.
O script do `<head>` (`head.html`) lê esses parâmetros, aplica e salva no `localStorage`;
o `tema.js` mantém a URL em dia a cada clique nos botões (`sincronizarUrl()`).
A cor (claro/escuro) **não** vai na URL: é preferência de quem visita.

**Por quê:** quem recebe um link deve ver o site como quem o enviou viu (estilo e área de
leitura), mas respeitando o gosto dele para claro/escuro.

**Aprendizado:** `history.replaceState` troca a URL sem recarregar nem criar entrada no
histórico; `URLSearchParams` lê e escreve parâmetros sem montar string na mão. Como os
valores padrão também vão na URL, o link vale mesmo para quem tem outra preferência salva.
Docs: https://developer.mozilla.org/pt-BR/docs/Web/API/History/replaceState

## 2026-11-21 — Aviso de "rascunho público"

**O quê:** nova propriedade de front matter `publicDraft: true`. Quando ligada, o post
mostra um aviso no topo (`aside.aviso` em `page.html`) e um selo "rascunho público" na
listagem (`post-list.html`) e nos metadados (`post-meta.html`). O archetype já vem com
`publicDraft: false`.

**Por quê:** `draft: true` esconde o post do site publicado; para deixar um texto inacabado
visível é preciso `draft: false`, e o leitor precisa saber que ele ainda pode mudar.

**Aprendizado:** o Hugo expõe qualquer chave do front matter em `.Params` (nomes em
minúsculas), então `{{ if .Params.publicDraft }}` basta, sem configurar nada. O CSS usa
só variáveis de cor, por isso funciona nos três estilos e nas três cores.
Docs: https://gohugo.io/content-management/front-matter/

## 2026-11-20 — Terceiro estilo: retrô (site da internet antiga)

**O quê:** novo estilo visual **retrô**, com cara de página dos anos 90: fundo
quadriculado/estrelado, janela estilo Windows 95, botões em relevo, links azuis e roxos,
linha arco-íris e "NOVO!" piscando. O botão de estilo agora percorre **normal → terminal →
retrô**; ficam 3 estilos × 3 cores = 9 combinações.

**Como:** `assets/css/retro.css` (concatenado depois do `terminal.css`), `data-style="retro"`,
o script do `<head>` e o `tema.js` passaram a aceitar o valor `retro`, e o `header.html`
ganhou um ícone de globo. Nada de HTML novo nas páginas: o retrô reaproveita a
`term-window` como janela do Windows 95.

**Aprendizado:**
- Cada estilo novo precisa dos blocos de cor claro e escuro (agora **seis**), e a ordem de
  concatenação do CSS importa quando a especificidade empata.
- Contraste não se adivinha: o selo "rascunho" ficou com 2,1:1 (branco sobre laranja) no
  escuro até medir; trocar o texto para preto subiu para 9,9:1.
- Um `sed`/script com várias linhas falhou porque o `head.html` usa quebra de linha CRLF
  (Windows) e os outros arquivos, LF. Ao editar por script, trate as duas.

---

## 2026-11-20 — Spoiler `>!texto!<` (censurado, como no Reddit)

**O quê:** `>!texto!<` vira uma tarja que some ao clicar (ou Enter/Espaço com o foco).

**Como:** o Markdown não conhece essa sintaxe e escapa os sinais (`&gt;!texto!&lt;`).
O partial `_partials/conteudo.html` pega o `.Content` já renderizado e troca esse padrão
por `<span class="spoiler">` com `replaceRE`; o `page.html` passou a chamá-lo no lugar de
`.Content`. O CSS (`main.css`) pinta a tarja com `var(--text)`, então funciona nas 6
combinações de cor; o `tema.js` acrescenta a classe `revelado` ao clicar.

**Aprendizado:** a primeira medição das cores deu o mesmo valor em todas as combinações
porque o CSS tinha `transition`: `getComputedStyle` logo após a troca devolve o valor
*inicial* da transição. Para testar, desligue a transição (`transition: none`) ou espere.
Também: acessibilidade do spoiler (`role="button"`, `tabindex`, `title`) para quem usa
teclado.

---

## 2026-11-20 — Destaque `==texto==` e inserido `++texto++`

**O quê:** `==texto==` vira `<mark>` (realce amarelo, como no Obsidian) e `++texto++` vira
`<ins>` (sublinhado na cor de destaque do tema).

**Como:** duas chaves no `hugo.toml`, `markup.goldmark.extensions.extras.mark` e
`...extras.insert`, ambas com `enable = true`. No tema, a variável nova `--mark-bg` entrou
nos **quatro** blocos de cor (normal claro/escuro, terminal claro/escuro) e as regras de
`.prose mark` e `.prose ins` ficam no fim do `main.css`.

**Aprendizado:** o contraste do destaque foi medido nas 6 combinações (mínimo 6,3:1, acima
dos 4,5:1 recomendados). Nos temas escuros o fundo do destaque é um amarelo bem escuro,
porque amarelo vivo ofuscaria. As extensões do Goldmark vêm desligadas até serem ativadas.

---

## 2026-11-20 — Posts novos já nascem em pasta

**O quê:** criado `archetypes/posts/index.md` e ajustado o tipo de conteúdo `default` no
`frontmatter.json` (Front Matter CMS), com `pageBundle: true`.

**Por quê:** as imagens com tamanho controlado precisam do post em pasta (page bundle), e o
original pesado não deve ser publicado (`build.publishResources: false`). Com o modelo nos
dois lugares, `hugo new content` e o editor geram a mesma coisa.

**Aprendizado:** se um archetype é uma **pasta**, o Hugo cria um bundle em vez de um
arquivo; ele é escolhido pelo nome da seção. O `frontmatter.json` não lê archetypes: as
duas definições precisam ser mantidas em sincronia. A parte do editor ainda não foi
testada dentro do VS Code. Na primeira tentativa o painel ainda criou um arquivo solto: tinha
tanto o tipo `default` (arquivo) quanto o `posts` (pasta), e o `default` foi usado. Por
isso o `default` passou a ser o único tipo e é ele que tem `pageBundle: true`.

---

## 2026-11-20 — Controle de tamanho das imagens

**O quê:** imagens nos posts agora têm tamanho escolhido por sufixo (`foto.jpg#media`),
legenda opcional, redimensionamento automático para `webp`, `srcset` 2x e carregamento
preguiçoso. Criado `layouts/_markup/render-image.html`, classes `.img-*` no `main.css` e
um post de exemplo (rascunho, depois removido).

**Por quê:** só havia `img { max-width: 100% }`; uma foto de vários MB seria publicada
inteira e não dava para controlar a largura. Fazer o Hugo gerar as versões leves no build
poupa editar as imagens à mão.

**Decisões:** a escolha do tamanho fica no Markdown (`#media`), que continua legível em
qualquer editor; usamos page bundles (a imagem mora junto do post). Os posts antigos
(arquivos soltos) não foram mexidos: só precisam virar pasta quando tiverem imagens.


**Medidas exatas e `#original` (hook estendido):** `#300w`, `#200h` e `#300w,200h` fixam o
tamanho na tela (com as duas, a imagem é recortada no centro com `.Fill`). `#original`
mantém formato e dimensões. Armadilha encontrada: `cond` avalia os **dois** lados, então
`cond (...) ($img.Fill ...) ($img.Resize ...)` chamava `Fill` mesmo só com a largura e o
build quebrava; trocamos por `if`/`else`.

**Aprendizado:** render hooks mudam o HTML de elementos do Markdown sem tocar nos posts.
`build.publishResources: false` evita publicar o original pesado. O Hugo cacheia o
resultado em `resources/_gen/`, então só reprocessa o que mudou.

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
