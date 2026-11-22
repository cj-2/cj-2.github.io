// A área "Comentários Agênticos" no navegador: "Ler mais", threads, correções e layout.
// Vários destes testes nasceram de bugs reais que só apareceram num navegador de verdade.
import { test, expect } from "@playwright/test";

const POST = "/posts/publicado/";

test("a área mostra o título e a caixa de comentar desativada", async ({ page }) => {
  await page.goto(POST);
  await expect(page.getByRole("heading", { name: "Comentários Agênticos" })).toBeVisible();
  await expect(page.locator(".cw-rodape textarea")).toBeDisabled();
  await expect(page.locator(".cw-rodape button")).toBeDisabled();
});

// Artigo com tantos comentários que a caixa precisa rolar por dentro. O bug do "Ler mais" só
// aparecia assim: os checkboxes dos comentários ABAIXO da parte visível da caixa escapavam para
// depois do fim da página. Com poucos comentários (tudo à vista) o bug não aparecia.
const MUITOS = "/posts/muitos-comentarios/";

test("'Ler mais' expande e recolhe o texto SEM mexer na rolagem nem na altura da página", async ({ page }) => {
  // Bug real: o checkbox escondido ficava fora do lugar e o clique jogava a página para o fim.
  await page.goto(MUITOS);
  const rotulo = page.locator(".cw-ler-mais").last(); // o último comentário: fundo da caixa que rola
  const texto = page.locator(".cw-texto-longo").last();
  await rotulo.scrollIntoViewIfNeeded();

  const antes = await page.evaluate(() => ({ y: window.scrollY, h: document.documentElement.scrollHeight }));
  const alturaFechado = (await texto.boundingBox()).height;
  // innerText só lê o texto VISÍVEL (textContent também leria o "Ler menos" escondido)
  const visivel = () => rotulo.evaluate((el) => el.innerText.trim());
  await expect.poll(visivel).toBe("Ler mais");

  await rotulo.click();
  await expect.poll(visivel).toBe("Ler menos");
  expect((await texto.boundingBox()).height).toBeGreaterThan(alturaFechado);
  const depois = await page.evaluate(() => ({ y: window.scrollY, h: document.documentElement.scrollHeight }));
  expect(Math.abs(depois.y - antes.y)).toBeLessThanOrEqual(1);
  expect(depois.h).toBe(antes.h);

  await rotulo.click();
  await expect.poll(visivel).toBe("Ler mais");
  expect((await texto.boundingBox()).height).toBe(alturaFechado);
});

test("cada checkbox escondido do 'Ler mais' fica dentro do seu próprio comentário", async ({ page }) => {
  // Proteção estrutural. Quem pega o bug de verdade é o teste do clique, acima: ele falha se o
  // checkbox escondido estiver fora do lugar (a página pulava ao clicar em "Ler mais").
  await page.goto(MUITOS);
  const caixaRola = await page.evaluate(() => {
    const c = document.querySelector(".cw-corpo");
    return c.scrollHeight > c.clientHeight;
  });
  expect(caixaRola, "o artigo de teste precisa ter comentários que obriguem a caixa a rolar").toBe(true);
  const fora = await page.evaluate(() =>
    [...document.querySelectorAll(".cw-mais")]
      .filter((cb) => {
        const c = cb.getBoundingClientRect();
        const li = cb.closest(".cw-comentario").getBoundingClientRect();
        return c.top < li.top - 1 || c.bottom > li.bottom + 1;
      })
      .length,
  );
  expect(fora).toBe(0);
});

test("a thread começa fechada e abre ao clicar em 'N respostas'", async ({ page }) => {
  await page.goto(POST);
  const resposta = page.getByText("Resposta na thread do comentário c1");
  await expect(resposta).toBeHidden();
  await page.locator(".cw-thread > summary").click();
  await expect(resposta).toBeVisible();
  await expect(page.getByText("Segunda resposta na mesma thread")).toBeVisible();
});

test("as correções do corretor ficam recolhidas e abrem ao clicar", async ({ page }) => {
  await page.goto(POST);
  const trecho = page.locator(".cw-correcoes del").first();
  await expect(trecho).toBeHidden();
  await page.locator(".cw-correcoes > summary").click();
  await expect(trecho).toBeVisible();
});

for (const largura of [1400, 900, 390]) {
  test(`a página não ganha rolagem horizontal com a tela em ${largura}px`, async ({ page }) => {
    await page.setViewportSize({ width: largura, height: 800 });
    await page.goto(POST);
    const { scroll, client } = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
    }));
    expect(scroll).toBeLessThanOrEqual(client);
  });
}
