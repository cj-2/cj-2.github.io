# 10. Testes e TDD

Este capítulo explica **como o projeto é testado** e **como desenvolver uma feature nova
começando pelo teste** (TDD). Os testes ficam na pasta `tests/`, que **não faz parte do site**:
o Hugo não a lê e nada dela é publicado.

## O que é TDD (Test-Driven Development)

TDD é escrever o teste **antes** do código, em ciclos curtos:

1. 🔴 **Vermelho:** escreva um teste do comportamento que você quer e veja ele **falhar**.
2. 🟢 **Verde:** escreva o **mínimo** de código para ele passar.
3. 🔵 **Refatorar:** melhore o código com calma; se algo quebrar, o teste avisa na hora.

Por que ver o teste falhar primeiro? Porque um teste que nunca falhou **não prova nada**:
ele pode estar passando só porque não testa o que você pensa.

Exemplo real deste projeto (`tests/unit/logica.test.mjs`): escrevemos os testes de
`permiteMensagem` e `limitarGnomoY` antes de existir o arquivo `logica.js`. O primeiro `npm run
unit` falhou com `Cannot find module` (vermelho); depois criamos o módulo com o mínimo (verde); só
então o `tema.js` passou a usá-lo (refatorar) com os testes de navegador protegendo.

## As 4 camadas de teste

Cada tipo de problema precisa de um tipo de teste. Quanto mais embaixo, mais lento e mais
parecido com o uso real:

| Camada | O que testa | Ferramenta | Comando (dentro de `tests/`) | Nº de testes |
|---|---|---|---|---|
| 1. **Lógica pura** (`tests/unit/`) | funções sem tela: ciclo de estilos, código `?v=`, debounce, posição do gnomo, e o script do `<head>` | `node:test` (já vem no Node) | `npm run unit` | 26 |
| 2. **Python** (`tests/python/`) | o script da skill `/comentar`: datas, threads, validações | `unittest` (já vem no Python) | `npm run python` | 22 |
| 3. **Renderização** (`tests/render/`) | o HTML que o Hugo gera: quando a área de comentários aparece, threads, "Ler mais", nomes | Hugo de verdade + conferência do HTML | `npm run render` | 18 |
| 4. **Navegador** (`tests/e2e/`) | cliques, rolagem, `localStorage`, URL, layout, o tema de Natal | Playwright (abre o Edge) | `npm run e2e` | 26 |

`npm test` roda as quatro em sequência.

### Quando usar cada uma

- Uma **conta ou regra** ("qual é o próximo estilo?", "essa data é válida?") → camada 1 ou 2.
  São rápidas (milissegundos) e dão o ciclo de TDD mais gostoso.
- **"O HTML certo foi gerado?"** (um bloco só aparece se...) → camada 3.
- **"Funciona na tela?"** (clicar, rolar, layout, o que o usuário vê e faz) → camada 4.
  É a única que pega problemas de CSS e de navegador.

## Como rodar

Pré-requisitos: Node, Python, Hugo e o Microsoft Edge (todos já usados no projeto).

```bash
cd tests
npm install        # só na primeira vez (instala o Playwright, dependência só de desenvolvimento)
npm test           # tudo
npm run unit       # só uma camada (unit, python, render ou e2e)
```

- O `npm run e2e` usa o **Edge instalado** (nada para baixar). Para outro navegador:
  `PW_CHANNEL=chrome npm run e2e`.
- Para um teste só: `npx playwright test comentarios -g "Ler mais"` (arquivo + parte do nome).
- Quando um teste de navegador falha, ele guarda um *trace* (gravação passo a passo) em
  `tests/test-results/`; abra com `npx playwright show-trace <arquivo>/trace.zip`.

### "Dependência só de desenvolvimento" (o que o `npm install` instala)

O site é gerado pelo Hugo e não usa npm. O Playwright é uma ferramenta que **só serve para
testar**: ele fica em `tests/package.json` (como `devDependencies`), instala em
`tests/node_modules/` (ignorada pelo Git) e nunca entra no site publicado.

## Estrutura da pasta `tests/`

```
tests/
  package.json            scripts (unit, python, render, e2e) e o Playwright
  playwright.config.js    configuração dos testes de navegador
  unit/                   camada 1: lógica pura e script do <head>
  python/                 camada 2: script da skill /comentar
  render/                 camada 3: HTML gerado pelo Hugo
  e2e/                    camada 4: Playwright
  helpers/                site-temporario.mjs (monta o site de teste), servidor-e2e.mjs
  fixtures/               artigos e comentários FICTÍCIOS usados pelas camadas 3 e 4
```

### Por que os testes usam um "site temporário" e dados fictícios

As camadas 3 e 4 **copiam o tema real** (`themes/lume`) e o `hugo.toml` para uma pasta
temporária (`tests/.tmp/`), junto com artigos e comentários inventados de `tests/fixtures/`. Assim:

- o teste roda o **mesmo código** do site, mas com dados que você controla;
- seus textos e os comentários reais **nunca são lidos nem alterados**;
- o resultado não muda quando você escreve um artigo novo.

## O fluxo TDD para uma feature nova (passo a passo)

Exemplo: "o gnomo deve soltar balas de coco ao ser clicado duas vezes seguidas".

1. **Descreva o comportamento em uma frase** e escolha a camada. Aqui: regra de contagem
   (camada 1) + o que aparece na tela (camada 4).
2. **Escreva o teste** que descreve o comportamento. Ele deve usar o nome do que ainda não existe.
3. **Rode e veja falhar** pelo motivo certo (`Cannot find module`, elemento não encontrado...).
   Se passar de primeira, o teste está errado.
4. **Escreva o mínimo** para passar. Resista à vontade de fazer mais.
5. **Rode a camada** e depois `npm test`: nada mais quebrou?
6. **Refatore** (separe lógica de DOM, renomeie, simplifique) com os testes verdes.
7. **Registre** no `docs/historico.md` e, se for um comportamento novo, deixe o teste como
   documentação viva do que ele faz.

### Exemplos curtos de cada camada

**Camada 1: lógica pura** (`node:test`):

```js
import test from "node:test";
import assert from "node:assert/strict";
import { permiteMensagem } from "../../themes/lume/assets/js/logica.js";

test("o primeiro clique sempre mostra a mensagem", () => {
  assert.equal(permiteMensagem(100, -Infinity, 2000), true);
});
```

**Camada 2: Python** (`unittest`):

```python
def test_data_no_futuro_e_recusada(self):
    with self.assertRaises(SystemExit):
        self.anexar("a", "corretor", data=(AGORA + timedelta(hours=1)).isoformat())
```

**Camada 3: renderização** (Hugo + HTML):

```js
test("rascunho comum NÃO mostra a área de comentários", () => {
  const html = lerPagina(saida, "posts/rascunho-comum");
  assert.doesNotMatch(html, /Comentários Agênticos/);
});
```

**Camada 4: navegador** (Playwright):

```js
test("'Ler mais' não mexe na rolagem", async ({ page }) => {
  await page.goto("/posts/muitos-comentarios/");
  const antes = await page.evaluate(() => window.scrollY);
  await page.locator(".cw-ler-mais").last().click();
  expect(await page.evaluate(() => window.scrollY)).toBe(antes);
});
```

## Para tornar o JavaScript testável: separar lógica de tela

O `tema.js` mistura dois tipos de código: **decisões** ("qual o próximo estilo?") e **ligação com
a tela** (`document.querySelector`, `addEventListener`). Decisões são fáceis de testar; a tela
não. Por isso as decisões foram para `themes/lume/assets/js/logica.js` (funções que só recebem
valores e devolvem valores) e o `tema.js` as importa. O Hugo (`js.Build`) junta os dois arquivos
em um só, então o deploy não muda.

Regra prática: **se dá para escrever como função pura, escreva em `logica.js` e teste na
camada 1.** O que sobra no `tema.js` é testado pela camada 4.

O script inline do `<head>` (que decide o estilo antes de a página aparecer) não pode importar
nada; por isso `tests/unit/head-script.test.mjs` **extrai o código real** de `head.html` e o roda
num ambiente falso (`document`, `location` e `localStorage` de mentira, com o módulo `vm` do
Node). Assim testamos o código que vai ao ar, sem copiá-lo.

## Os bugs reais que viraram testes

Todos estes bugs apareceram durante o desenvolvimento do tema de Natal. Cada um tem agora um
teste que falha se o bug voltar:

| Bug que tivemos | Teste que o protege |
|---|---|
| A primeira mensagem não aparecia se o clique viesse nos 2 primeiros segundos (relógio do debounce começava em 0) | `permiteMensagem(100, -Infinity…)` (camada 1) e "a primeira mensagem aparece…" (camada 4) |
| O trenó perdeu o clique porque herdou `pointer-events: none` da faixa do céu | "o trenó recebe o clique de verdade" e "clicar no Papai Noel…" (camada 4) |
| O trenó saindo pela direita criava rolagem horizontal | "o trenó saindo pela direita não cria rolagem horizontal" e "a página não ganha rolagem horizontal" em 3 larguras (camada 4) |
| "Ler mais" jogava a página para o fim (checkbox escondido fora do lugar) | "'Ler mais' expande e recolhe… SEM mexer na rolagem" (camada 4) e "o checkbox fica DENTRO do rótulo" (camada 3) |
| `?v=` de um favorito antigo impedia o tema temático de aparecer | testes da regra do tema temático (camadas 1 e 4) |
| O nome de um agente teria de ser trocado em cada comentário | "renomear um agente… muda o nome em todos os comentários" (camadas 2 e 3) |
| Rascunho comum mostrando comentários | "rascunho comum NÃO mostra a área…" (camada 3) |

## Teste que nunca falha não protege: a "checagem por mutação"

Depois de escrever um teste para um bug que já corrigimos, **reintroduza o bug de propósito**
e confira que o teste falha. Fizemos isso nos três bugs acima e a checagem revelou um problema
real: o primeiro teste do "Ler mais" **passava mesmo com o bug de volta**. O motivo: nossos
dados de teste tinham poucos comentários, que cabiam na caixa que rola, e o bug só aparecia com
comentários **abaixo da parte visível** da caixa. A correção foi criar o artigo fictício
`muitos-comentarios`, com 8 comentários longos.

Como fazer:

```bash
git checkout <commit-antes-da-correção> -- caminho/do/arquivo   # volta ao código com bug
npm run e2e                                                     # o teste TEM que falhar
git checkout HEAD -- caminho/do/arquivo                         # desfaz a brincadeira
```

## Armadilhas que já encontramos escrevendo estes testes

- **`toHaveText` lê o texto escondido.** O botão "Ler mais" tem dois textos (um escondido por
  CSS); o `toHaveText` do Playwright usa `textContent`, que inclui o escondido. Para o que o
  usuário vê, use `innerText`.
- **Elemento em movimento não é clicável.** O Playwright espera o elemento ficar parado antes de
  clicar; o trenó anda o tempo todo, então os testes o congelam com `addStyleTag`
  (`animation: none`) antes de clicar.
- **Dados de teste precisam provocar o bug.** Veja a seção anterior.
- **O primeiro acesso é especial.** Todo teste de navegador começa sem nada salvo, como um
  visitante novo; por isso o natal (tema temático) aparece, mesmo em links com `?v=`. Para
  testar "depois da primeira visita", abra a página uma vez antes.

## O que não vale a pena testar com TDD

- **Aparência** (pixel art, animações, "ficou bonito?"): os testes verificam **regras**
  (posição, tamanho, cliques, ausência de rolagem lateral), não beleza. Isso continua sendo
  olho humano. Capturas de tela automáticas (*visual regression*) são frágeis e ficaram para
  uma etapa futura.
- **O conteúdo dos agentes de IA**: o texto que eles escrevem muda a cada rodada. Testamos o
  **formato** (o script valida o JSON, as datas e as threads), não o que eles dizem.

## Próximos passos possíveis

- Rodar `npm test` no **GitHub Actions** antes do deploy, para um teste quebrado impedir a
  publicação (o workflow atual só faz o build). No CI, o Playwright usa o Chromium dele
  (`npx playwright install --with-deps chromium`).
- Testar os 12 estilos × cores (hoje os testes de navegador cobrem os comportamentos em natal e
  trocam de estilo, mas não conferem cada combinação visualmente).
- Mais testes de `tema.js`: spoiler, largura, atualização dos botões.

## Referências

- Executor de testes do Node: <https://nodejs.org/api/test.html>
- Playwright (testes de navegador): <https://playwright.dev/docs/intro>
- `unittest` do Python: <https://docs.python.org/3/library/unittest.html>
- Fingerprint e cache (por que o JS tem hash no nome): [08-cache.md](08-cache.md)
- Agentes e a skill `/comentar` (testadas aqui): [09-agentes-comentaristas.md](09-agentes-comentaristas.md)

Voltar: [09-agentes-comentaristas.md](09-agentes-comentaristas.md) · Índice: [README.md](README.md)
