// Testa o script inline do <head> (themes/lume/layouts/_partials/head.html), que decide o estilo,
// a largura e a cor ANTES de a página aparecer. Em vez de copiar a lógica, extraímos o código
// real do head.html e o rodamos num ambiente falso (document, location e localStorage de mentira).
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { ESTILOS, LARGURAS, codigoVisual, lerCodigoVisual } from "../../themes/lume/assets/js/logica.js";

const html = fs.readFileSync(new URL("../../themes/lume/layouts/_partials/head.html", import.meta.url), "utf8");
const codigo = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const MARCA = { estiloTematicoVisto: "natal" }; // "já viu o tema temático"

/** Roda o script do <head> e devolve o que ele deixou no <html> e no localStorage. */
function rodar({ search = "", salvo = {}, quebrado = false } = {}) {
  const store = new Map(Object.entries(salvo));
  const localStorage = quebrado
    ? { getItem() { throw new Error("bloqueado"); }, setItem() { throw new Error("bloqueado"); }, removeItem() { throw new Error("bloqueado"); } }
    : {
        getItem: (k) => (store.has(k) ? store.get(k) : null),
        setItem: (k, v) => store.set(k, String(v)),
        removeItem: (k) => store.delete(k),
      };
  const root = { dataset: {} };
  vm.runInNewContext(codigo, { document: { documentElement: root }, location: { search }, localStorage, URLSearchParams });
  return { style: root.dataset.style, width: root.dataset.width, theme: root.dataset.theme, store };
}

test("visitante novo: abre no natal e anota que já viu o tema temático", () => {
  const r = rodar();
  assert.equal(r.style, "natal");
  assert.equal(r.store.get("estiloTematicoVisto"), "natal");
});

test("primeira visita com ?v= de outro estilo: o tema temático vence (o ?v= reescrito pelo site não é escolha)", () => {
  const r = rodar({ search: "?v=tp" });
  assert.equal(r.style, "natal");
  assert.equal(r.store.get("estilo"), "natal");
});

test("primeira visita: a largura do ?v= continua valendo", () => {
  assert.equal(rodar({ search: "?v=te" }).width, "narrow");
  assert.equal(rodar({ search: "?v=xt" }).width, "full");
});

test("quem tinha o retrô salvo e nunca viu o tema temático vê o natal uma vez", () => {
  const r = rodar({ salvo: { estilo: "retro" } });
  assert.equal(r.style, "natal");
  assert.equal(r.store.get("estilo"), "natal"); // o natal passa a ser o estilo salvo
});

test("depois da primeira vez, a escolha da pessoa volta a valer (retrô)", () => {
  assert.equal(rodar({ salvo: { ...MARCA, estilo: "retro" } }).style, "retro");
});

test("depois da primeira vez, terminal e normal também são respeitados", () => {
  assert.equal(rodar({ salvo: { ...MARCA, estilo: "terminal" } }).style, "terminal");
  assert.equal(rodar({ salvo: { ...MARCA, estilo: "normal" } }).style, undefined); // normal = sem atributo
});

test("depois da primeira vez, o ?v= de um link vence o estilo salvo", () => {
  const r = rodar({ search: "?v=tp", salvo: { ...MARCA, estilo: "retro" } });
  assert.equal(r.style, "terminal");
  assert.equal(r.store.get("estilo"), "terminal");
});

test("?v= inválido é ignorado", () => {
  assert.equal(rodar({ search: "?v=zz", salvo: { ...MARCA, estilo: "retro" } }).style, "retro");
});

test("a cor (claro/escuro) vem só do que a pessoa salvou, nunca da URL", () => {
  assert.equal(rodar({ salvo: { ...MARCA, tema: "dark" } }).theme, "dark");
  assert.equal(rodar({ salvo: { ...MARCA, tema: "light" } }).theme, "light");
  assert.equal(rodar({ salvo: MARCA }).theme, undefined); // sem valor = segue o sistema
  assert.equal(rodar({ search: "?v=xp&tema=dark", salvo: MARCA }).theme, undefined);
});

test("largura salva é aplicada, e ?v=..p volta para a largura padrão", () => {
  assert.equal(rodar({ salvo: { ...MARCA, largura: "narrow" } }).width, "narrow");
  const r = rodar({ search: "?v=xp", salvo: { ...MARCA, largura: "narrow" } });
  assert.equal(r.width, undefined);
  assert.equal(r.store.has("largura"), false);
});

test("localStorage bloqueado (ex.: navegação privada): não quebra e cai no natal", () => {
  assert.equal(rodar({ quebrado: true }).style, "natal");
});

test("o script do <head> e o tema.js entendem o ?v= do mesmo jeito, nas 12 combinações", () => {
  for (const estilo of ESTILOS) {
    for (const largura of LARGURAS) {
      const codigoUrl = codigoVisual(estilo, largura);
      const r = rodar({ search: `?v=${codigoUrl}`, salvo: MARCA });
      const esperado = lerCodigoVisual(codigoUrl);
      assert.equal(r.style ?? "normal", esperado.estilo, `estilo de ?v=${codigoUrl}`);
      assert.equal(r.width ?? "default", esperado.largura, `largura de ?v=${codigoUrl}`);
    }
  }
});
