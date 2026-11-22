// O tema de Natal: trenó, gnomos, mensagens, efeitos (corações, estrelas, presentes) e o "debounce".
// A tela é de 1400px de largura (config), onde o gnomo do canto fica fixo no canto da tela.
import { test, expect } from "@playwright/test";

const POST = "/posts/publicado/";
const balao = (page) => page.locator(".natal-msg");

/** Congela o trenó numa posição visível (a animação real o faria atravessar a tela em 40s). */
async function pararTrenoNaTela(page) {
  await page.addStyleTag({ content: ".natal-trineo { animation: none !important; transform: translateX(300px) !important; }" });
}

test("clicar no Papai Noel mostra uma mensagem dele e solta presentes", async ({ page }) => {
  await page.goto(POST);
  await pararTrenoNaTela(page);
  await page.locator(".natal-trineo").click();
  await expect(balao(page)).toBeVisible();
  await expect(balao(page).locator("strong")).toHaveText("Papai Noel");
  await expect(page.locator(".natal-caixa")).toHaveCount(4);
});

test("o trenó recebe o clique de verdade (nada por cima dele, pointer-events não herdado)", async ({ page }) => {
  // Bug real: pointer-events: none na faixa do céu foi herdado pelo trenó, que perdeu o clique.
  await page.goto(POST);
  await pararTrenoNaTela(page);
  const noTopo = await page.evaluate(() => {
    const r = document.querySelector(".natal-trineo").getBoundingClientRect();
    const el = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return el?.classList.contains("natal-trineo");
  });
  expect(noTopo).toBe(true);
});

test("o trenó saindo pela direita não cria rolagem horizontal", async ({ page }) => {
  // Bug real: o trenó fora da tela alargava a página e empurrava o balão de mensagem.
  await page.goto(POST);
  await page.addStyleTag({ content: ".natal-trineo { animation: none !important; transform: translateX(130vw) !important; }" });
  const { scroll, client } = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    client: document.documentElement.clientWidth,
  }));
  expect(scroll).toBeLessThanOrEqual(client);
});

test("o gnomo do canto solta 5 estrelas e o gnomo da borda solta 4 corações", async ({ page }) => {
  await page.goto(POST);
  await page.locator(".natal-gnomo").click();
  await expect(page.locator(".natal-estrela")).toHaveCount(5);
  await page.locator(".natal-gnomo-borda").click();
  await expect(page.locator(".natal-coracao")).toHaveCount(4);
});

test("a primeira mensagem aparece mesmo se o clique vier logo que a página abre", async ({ page }) => {
  // Bug real: o relógio do debounce começava em 0 e ignorava cliques nos 2 primeiros segundos.
  await page.goto(POST);
  await page.locator(".natal-gnomo").click();
  await expect(balao(page)).toBeVisible();
});

test("debounce: cliques seguidos NÃO trocam a mensagem, mas os efeitos continuam saindo", async ({ page }) => {
  await page.goto(POST);
  const gnomo = page.locator(".natal-gnomo");
  await gnomo.click();
  const primeira = await balao(page).innerText();
  await gnomo.click();
  await gnomo.click();
  expect(await balao(page).innerText()).toBe(primeira);
  await expect(page.locator(".natal-estrela")).toHaveCount(15); // 3 cliques × 5 estrelas
});

test("passado o intervalo (2s), um novo clique troca para outra mensagem", async ({ page }) => {
  await page.goto(POST);
  const gnomo = page.locator(".natal-gnomo");
  await gnomo.click();
  const primeira = await balao(page).innerText();
  await page.waitForTimeout(2100);
  await gnomo.click();
  expect(await balao(page).innerText()).not.toBe(primeira); // nunca repete a anterior
});

test("clicar no balão fecha a mensagem", async ({ page }) => {
  await page.goto(POST);
  await page.locator(".natal-gnomo").click();
  await expect(balao(page)).toBeVisible();
  await balao(page).click();
  await expect(balao(page)).toBeHidden();
});

test("fora do natal, o trenó, os gnomos e o balão ficam escondidos", async ({ page }) => {
  await page.goto(POST);
  await page.locator(".style-toggle").click(); // terminal
  for (const seletor of [".natal-trineo", ".natal-gnomo", ".natal-gnomo-borda", ".natal-msg"]) {
    await expect(page.locator(seletor)).toBeHidden();
  }
});

test("o gnomo da borda acompanha a rolagem mas nunca sai da janela do post", async ({ page }) => {
  await page.goto("/");
  // deixa a página bem alta para haver rolagem
  await page.addStyleTag({ content: ".term-body { min-height: 3000px; }" });
  const dentroDaJanela = async () =>
    page.evaluate(() => {
      const j = document.querySelector(".term-window").getBoundingClientRect();
      const g = document.querySelector(".natal-gnomo-borda").getBoundingClientRect();
      return g.top >= j.top && g.bottom <= j.bottom + 1;
    });
  expect(await dentroDaJanela()).toBe(true);
  const y0 = (await page.locator(".natal-gnomo-borda").boundingBox()).y + (await page.evaluate(() => window.scrollY));
  await page.mouse.wheel(0, 1500);
  await page.waitForTimeout(900); // a transição do gnomo dura 0,6s
  expect(await dentroDaJanela()).toBe(true);
  const y1 = (await page.locator(".natal-gnomo-borda").boundingBox()).y + (await page.evaluate(() => window.scrollY));
  expect(y1).toBeGreaterThan(y0 + 500); // escorregou para baixo junto com a rolagem
});
