# Histórico do projeto

Diário das mudanças, com **o que** foi feito, **por quê** e **o que dá para aprender**.
Entradas mais recentes no topo.

---

## 2026-11-21 — Estilo temático aparece uma vez, mesmo para quem escolheu outro

**O quê:** no `head.html`, a variável `tematico` (hoje `"natal"`) define o estilo da temporada. Na
primeira visita depois que ele entra, o script grava `estilo = tematico` mesmo que a pessoa
tivesse salvo outro, e guarda `estiloTematicoVisto = tematico` no `localStorage`. Nas visitas
seguintes essa marca já existe e vale a escolha da pessoa (ou o `?v=` de um link).
**Bug da primeira versão:** o `?v=` vencia a regra, mas o `tema.js` reescreve o `?v=` na barra de
endereço a cada visita com o estilo atual. Favoritos, histórico e links já carregavam o estilo
antigo, que "ganhava" da regra e ainda marcava como visto: o natal nunca aparecia para quem já
tinha visitado. Agora, na primeira visita, a regra vence até o `?v=` do estilo (a largura do
`?v=` continua valendo). Lição: se o próprio site escreve na URL, a URL não é prova de escolha.

**Por quê:** o tema de Natal é um evento: quem já tinha preferência salva (ex.: retrô) também
precisa vê-lo, sem perder a liberdade de trocar logo em seguida.

**Aprendizado:** guardar *qual* tema temático já foi apresentado (e não apenas "sim/não") faz a
regra renascer sozinha: quando a variável mudar para outro nome (ex.: `"pascoa"`), a marca
antiga não coincide e o novo tema aparece de novo uma vez. `localStorage` guarda só texto, então
a comparação é de strings.

## 2026-11-21 — Natal vira o estilo padrão (e a nova ordem do botão)

**O quê:** quem ainda não escolheu nada agora vê o estilo **natal**. O botão de estilo cicla
natal → terminal → normal (moderno) → retrô (site antigo) → natal. Mudanças: o script do
`<head>` (`head.html`) aplica `natal` por padrão; o `tema.js` tem a nova ordem em `ESTILOS` e
passou a lembrar o *terminal* (antes era o padrão e não precisava ser salvo) em vez do natal;
no `main.css` o ícone do botão (que mostra o próximo estilo) foi remapeado para a nova ordem.

**Por quê:** o tema de Natal é a vitrine do momento.

**Aprendizado:** "padrão" é só "o que vale quando não há nada salvo". Trocar o padrão muda o que
o `localStorage` precisa guardar: o antigo padrão (terminal) agora precisa ser salvo e o novo
(natal) não. Quem usava o terminal sem nunca ter clicado no botão passa a ver o natal.
Isso é esperado; o link com `?v=` (ver entrada de URL) continua mandando em qualquer padrão.

## 2026-11-21 — Quarto estilo: natal (pixel art)

**O quê:** novo `data-style="natal"` em `assets/css/natal.css`, no ciclo do botão de estilo
(normal → terminal → retrô → natal) e na URL como `?v=Xp` com `X = x`. Visual de jogo de
8 bits: bordas grossas, sombras duras, botões que afundam, cabeçalho vermelho com franja de
neve, árvores de Natal no título e no rodapé e neve caindo ao fundo. Tem versão clara
(céu de inverno) e escura (noite).

**Por quê:** um tema sazonal que reaproveita toda a estrutura do site, só trocando o CSS.

**Papai Noel:** um trenó com três renas (sprite 62×9) cruza a faixa de céu entre o
cabeçalho e a janela, em `.site-header::after` (colado embaixo do cabeçalho, qualquer que seja a altura dele; `body { overflow-x: clip }` evita rolagem horizontal quando ele sai da tela). Duas animações no mesmo elemento: `natal-voa`
(`transform`, horizontal, em `steps()`) e `natal-pula` (`margin-top`, o galope). Não dá para
usar duas animações na mesma propriedade, por isso cada uma mexe numa propriedade diferente.
Primeiro ele estava `fixed` e atrás da janela, ou seja, invisível: o fix foi prendê-lo ao
cabeçalho.

**Gnomo dançante:** sprite de 2 quadros lado a lado, preso no canto inferior direito
(`.site-footer::after`, `position: fixed`) em telas ≥ 1200px; em telas estreitas ele fica em pé
em cima do rodapé (`position: absolute; bottom: 100%`), para não cobrir o texto.
`steps(1)` troca o quadro (`background-position`) e outra animação faz o pulinho.
O cabeçalho ganhou `margin-bottom` maior neste estilo para o trenó não "bater a cabeça".

**Mensagem ao clicar:** o trenó e o gnomo deixaram de ser pseudo-elementos (`::after`, que
não recebem clique) e viraram `<button class="natal-only">` de verdade, em `header.html` e
`footer.html`. `.natal-only { display: none }` no `main.css` os esconde nos outros estilos e o
`natal.css` os mostra. O `tema.js` sorteia uma mensagem (sem repetir a anterior) e a exibe
num balão `role="status"` (leitores de tela anunciam), que some em 6 s ou ao clicar nele.
O trenó desceu: `top: 100%` do elemento absoluto não conta a borda de 4px nem a sombra de
6px do cabeçalho, por isso ele "batia" na borda; agora é `calc(100% + 22px)`.

**Gnomo agarrado na borda (dançando funk):** um segundo gnomo, visto de lado e olhando para a
tela, com uma mão e os pés na borda esquerda da janela e a bunda para fora (`.term-window::before`).
Sprite de 4 quadros em que **só o quadril se mexe**, para trás e para a frente (em direção à
borda), só 1 quadradinho para cada lado (2 era exagero); tronco, pernas e botas ficam parados.
O rosto não tem nariz: um pixel rosa isolado na frente do rosto parecia outra coisa. Em pixel
art, cada pixel solto conta, então cuidado com as pontas das silhuetas. Lições das versões anteriores: agachar fazia
parecer que ele balançava as pernas (desenhe parado tudo o que não deve mexer); e quando uma
parte do sprite se move, as peças fixas em volta (cintura, coxa) precisam cobrir o espaço que
ela deixa, senão aparecem "vazinhos" no corpo.
Ele também **escorrega pela borda acompanhando a rolagem**: o `tema.js` calcula a altura ideal e
grava na variável CSS `--gnomo-y` (via `requestAnimationFrame`, no máximo uma vez por quadro), e o
CSS usa `top: var(--gnomo-y)` com `transition` em `steps()` para o deslize "em quadros".
**Papai Noel alargava a página:** ao sair pela direita, o trenó (que ficava solto no cabeçalho)
aumentava a largura rolável da página; no celular o navegador ampliava a área visível e o balão
de mensagem (`position: fixed; left: 50%`) ia junto para a direita. O `overflow-x: clip` no
`body` não bastou. A correção é prender o trenó num "céu" (`.natal-ceu`, largura total,
`overflow: hidden`): o recorte é do próprio contêiner, que nunca passa da largura da tela.
Pegadinha: ao pôr `pointer-events: none` no céu (para só o trenó receber clique), o trenó herdou
o `none` e perdeu o clique, pois `pointer-events` é uma propriedade herdada; foi preciso `pointer-events: auto`
no próprio trenó.
O gnomo da borda ficou maior (5× em telas largas, 3× até 1130px, 2× abaixo de 560px).

**Gnomo da borda minúsculo e com "buraco" no celular:** (1) ele encolhia porque as laterais do
celular são estreitas; agora a janela ganha uma margem esquerda extra e o gnomo fica 3× (≤560px),
4× (até 1130px) ou 5×. (2) O "buraco" era um defeito de escala: sprites em SVG (`<rect>` por
pixel) com `crispEdges` deixam frestas quando o navegador escala em proporção quebrada (celulares
com densidade 2,625, por exemplo). Para este gnomo o sprite virou **PNG** em base64: com
`image-rendering: pixelated`, o navegador amplia pixel a pixel, sem frestas. Os outros sprites
(trenó, corações etc.) ainda são SVG; se aparecer o mesmo problema neles, o remédio é o mesmo.
Só que o PNG não resolveu o "buraco na cabeça": ele estava no desenho. O pixel escuro do olho
encostava na aba do gorro e, ampliado, parecia um furo. Agora o rosto é um bloco de pele 4×2
com o olho no meio, cercado de pele, e a barba por baixo. Lição: em pixel art, um pixel escuro
na borda de uma forma lê como "buraco"; olhos precisam de pele em volta.
O buraco de verdade, porém, era outro: atrás da cabeça (à esquerda), o gorro ficava "no ar" porque
a cabeça começava mais à direita que a aba. Agora o cabelo e a barba se estendem para trás até
ficar sob o gorro. Lição: quando o usuário diz "buraco", confirme em qual lado; e em sprites,
confira se cada peça (gorro, cabeça, tronco) tem apoio logo abaixo dela.
Sobre o nariz, três tentativas: 1 pixel rosa solto (parecia outra coisa), um bloco rosa 1×2
(parecia a Peppa Pig) e, por fim, o nariz **da cor da pele**, como um degrau na parte de baixo
do rosto (a linha de baixo do rosto é 1 pixel mais longa). Lição: em perfil, o nariz é parte da
silhueta do rosto; um bloco grande de outra cor o transforma em outro objeto. Por pedido, só a
**ponta** do nariz (1 pixel) tem o rosado do outro gnomo, o resto continua cor de pele.

**Ajustes no celular:** o gnomo da borda ficou 4× (48px), entra 8px pela borda (`left: -40px`) e a
margem extra da janela é de 27px (gnomo maior pede lateral maior: é uma troca, não dá para ter os dois).
Bug: a 1ª mensagem não aparecia se o clique viesse nos 2 primeiros segundos da página, porque
`ultimoCliqueBoneco` começava em 0 e `performance.now()` conta desde a abertura da página; o inicial
agora é `-Infinity`. Além disso, o gnomo do canto fica em pé no
rodapé e o balão de mensagem (no pé da tela) o tapava; abaixo de 1200px o `tema.js` põe a classe
`natal-msg-topo` para levar o balão ao topo quando é ele quem fala (`classList.toggle` com uma
condição, e `matchMedia` para saber a largura da tela dentro do JS).

**Efeitos ao clicar:** como pseudo-elementos não recebem clique, o gnomo da borda virou um
`<button class="natal-only natal-gnomo-borda">` (em `baseof.html`). Ao clicar, o `tema.js`
(`soltarEfeito`, guiado por uma tabela `EFEITOS_NATAL`) cria `<span>`s na posição de quem foi
clicado, cada um com `--dx`, `--dy` e `--atraso` aleatórios (via `style.setProperty`) e em
passos de pixel: o gnomo da borda solta 4 corações que sobem, o gnomo do canto solta 5 estrelas
que sobem e o Papai Noel solta 4 presentes (3 cores) que caem do trenó (a faixa de x vai de 3% a 30%
da largura do sprite, antes das renas, um presente por "fatia" e a cada 0,5 s) até perto do pé da tela. O gnomo da
borda também fala (`data-natal="danca"` reaproveita o balão). Os spans são removidos por
`setTimeout`, que funciona até com "reduzir movimento". Uma tabela de configuração evita
repetir o mesmo código três vezes.
**Debounce na mensagem:** vários cliques seguidos trocavam a mensagem antes de dar para ler. Agora
`aoClicarBoneco()` só troca a mensagem no primeiro clique e a ignora nos seguintes por 2 s
(`INTERVALO_CLIQUE_MS`), valendo para todos os bonequinhos juntos, já que dividem o balão. Os
efeitos (corações, estrelas, presentes) continuam saindo a cada clique. Tecnicamente é a variante
"leading edge" do debounce (também chamada de throttle): responde na hora ao primeiro clique, em
vez de esperar a pessoa parar de clicar, o que faria a mensagem demorar a aparecer.
Detalhe: `left` de um elemento absoluto conta a partir da borda *interna* (padding box), então
é preciso descontar os 4px da borda. Abaixo de ~1130px de largura ele fica menor e entra no padding, porque as laterais não comportam o grande.

**Aprendizado:**
- Pixel art sem imagens: sprites são SVGs de `<rect>` 1×1 com `shape-rendering="crispEdges"`,
  embutidos no CSS como `url("data:image/svg+xml,...")` e guardados em variáveis (`--natal-arvore`).
- A neve é `body::before` fixo com `z-index: -1`; por isso o fundo foi para o `<html>`
  (senão o fundo do `body` ficaria por cima). `steps()` na animação dá o movimento "em
  quadros" e `prefers-reduced-motion` desliga a animação.
- Sombras sem blur (`box-shadow: 4px 4px 0 cor`) criam o relevo de pixel.
Docs: https://developer.mozilla.org/pt-BR/docs/Web/CSS/animation-timing-function

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
