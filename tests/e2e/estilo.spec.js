// Estilo, largura, cor e o link compartilhável (?v=). Cada teste abre um navegador "novo", sem
// nada salvo: é como um visitante que nunca entrou no site.
import { test, expect } from "@playwright/test";

const POST = "/posts/publicado/";
const estilo = (page) => page.locator("html").getAttribute("data-style");

test("visitante novo abre no estilo natal", async ({ page }) => {
  await page.goto(POST);
  await expect(page.locator("html")).toHaveAttribute("data-style", "natal");
});

test("o botão de estilo percorre natal → terminal → normal → retrô → natal e atualiza o ?v= da URL", async ({ page }) => {
  await page.goto(POST);
  const botao = page.locator(".style-toggle");
  const esperado = [
    ["terminal", "tp"],
    [null, "np"], // normal = sem o atributo data-style
    ["retro", "rp"],
    ["natal", "xp"],
  ];
  for (const [attr, codigo] of esperado) {
    await botao.click();
    if (attr) await expect(page.locator("html")).toHaveAttribute("data-style", attr);
    else await expect(page.locator("html")).not.toHaveAttribute("data-style", /.+/);
    expect(new URL(page.url()).searchParams.get("v")).toBe(codigo);
  }
});

test("a escolha de estilo é lembrada ao recarregar", async ({ page }) => {
  await page.goto(POST);
  await page.locator(".style-toggle").click(); // terminal
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-style", "terminal");
});

test("primeira visita por um link com ?v= de outro estilo ainda mostra o natal (tema temático)", async ({ page }) => {
  await page.goto(`${POST}?v=tp`);
  await expect(page.locator("html")).toHaveAttribute("data-style", "natal");
});

test("depois da primeira visita, um link com ?v= volta a valer", async ({ page }) => {
  await page.goto(POST); // primeira visita: anota que já viu o tema temático
  await page.goto(`${POST}?v=rp`);
  await expect(page.locator("html")).toHaveAttribute("data-style", "retro");
});

test("o botão de largura percorre os 3 tamanhos e reflete no ?v=", async ({ page }) => {
  await page.goto(POST);
  const botao = page.locator(".width-toggle");
  await botao.click(); // padrão → total
  await expect(page.locator("html")).toHaveAttribute("data-width", "full");
  expect(new URL(page.url()).searchParams.get("v")).toBe("xt");
  await botao.click(); // total → estreita
  await expect(page.locator("html")).toHaveAttribute("data-width", "narrow");
  expect(new URL(page.url()).searchParams.get("v")).toBe("xe");
  await botao.click(); // estreita → padrão
  await expect(page.locator("html")).not.toHaveAttribute("data-width", /.+/);
  expect(new URL(page.url()).searchParams.get("v")).toBe("xp");
});

test("a cor (claro/escuro) é lembrada, mas nunca vai para a URL", async ({ page }) => {
  await page.goto(POST);
  await page.locator(".theme-toggle").click(); // sistema → claro
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  expect(page.url()).not.toMatch(/tema|theme|light|dark/);
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});

test("sem JavaScript de URL: o ?v= é só estilo e largura (2 letras)", async ({ page }) => {
  await page.goto(POST);
  expect(new URL(page.url()).searchParams.get("v")).toMatch(/^[ntrx][ept]$/);
});
