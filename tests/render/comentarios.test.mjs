// Testes de RENDERIZAÇÃO: rodam o Hugo de verdade num site temporário (tema real + artigos
// fictícios de tests/fixtures) e conferem o HTML gerado. Não precisam de navegador.
import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { criarSite, construir, lerPagina, limpar } from "../helpers/site-temporario.mjs";

const contar = (html, regex) => (html.match(regex) ?? []).length;

let dirPrincipal, saida, log;
let dirRenomeado, saidaRenomeada;

before(() => {
  dirPrincipal = criarSite();
  ({ saida, log } = construir(dirPrincipal));
  // Segundo site: igual, mas um agente com outro nome (só em data/agentes.json).
  dirRenomeado = criarSite((dir) => {
    const arq = path.join(dir, "data", "agentes.json");
    const agentes = JSON.parse(fs.readFileSync(arq, "utf8"));
    agentes["critico-cetico"].nome = "Nome Novo";
    fs.writeFileSync(arq, JSON.stringify(agentes));
  });
  ({ saida: saidaRenomeada } = construir(dirRenomeado));
});

after(() => {
  limpar(dirPrincipal);
  limpar(dirRenomeado);
});

test("o build não emite avisos nem erros (WARN/ERROR)", () => {
  assert.doesNotMatch(log, /\bWARN\b|\bERROR\b/, log);
});

test("artigo publicado mostra a área 'Comentários Agênticos' com o aviso de que são agentes", () => {
  const html = lerPagina(saida, "posts/publicado");
  assert.match(html, /<h2 id="comentarios-titulo">Comentários Agênticos<\/h2>/);
  assert.match(html, /não são leitores de verdade/i);
});

test("a barra mostra o total de comentários, contando as respostas", () => {
  const html = lerPagina(saida, "posts/publicado");
  assert.match(html, /<span class="cw-barra-titulo">6 comentários<\/span>/);
});

test("comentários principais e respostas ficam separados: 4 principais e 2 respostas", () => {
  const html = lerPagina(saida, "posts/publicado");
  assert.equal(contar(html, /<li class="cw-comentario"/g), 4);
  assert.equal(contar(html, /<li class="cw-comentario cw-resposta"/g), 2);
});

test("as respostas ficam DENTRO da thread do comentário principal", () => {
  const html = lerPagina(saida, "posts/publicado");
  assert.equal(contar(html, /<details class="cw-thread">/g), 1);
  assert.match(html, /<span class="cw-thread-rotulo">2 respostas<\/span>/);
  const thread = html.match(/<details class="cw-thread">[\s\S]*?<\/details>/)[0];
  assert.match(thread, /Resposta na thread do comentário c1/);
  assert.match(thread, /Segunda resposta na mesma thread/);
});

test("o nome exibido vem de data/agentes.json (e o comentário guarda só o ID)", () => {
  const html = lerPagina(saida, "posts/publicado");
  assert.match(html, /<strong class="cw-nome">Cético de Teste<\/strong>/);
  assert.match(html, /<span class="cw-papel">O Corretor<\/span>/);
});

test("renomear um agente em data/agentes.json muda o nome em todos os comentários", () => {
  const html = lerPagina(saidaRenomeada, "posts/publicado");
  assert.doesNotMatch(html, /Cético de Teste/);
  // o cético tem um comentário principal e uma resposta na thread: os dois mudam
  assert.equal(contar(html, /<strong class="cw-nome">Nome Novo<\/strong>/g), 2);
});

test("'Ler mais' só aparece nos comentários longos (mais de 280 caracteres)", () => {
  const html = lerPagina(saida, "posts/publicado");
  assert.equal(contar(html, /<label class="cw-ler-mais">/g), 1);
  assert.equal(contar(html, /cw-texto-longo/g), 1);
});

test("o checkbox do 'Ler mais' fica DENTRO do rótulo (fora dele, a página pulava para o fim)", () => {
  const html = lerPagina(saida, "posts/publicado");
  const checkboxes = contar(html, /<input class="cw-mais" type="checkbox"/g);
  const dentroDoRotulo = contar(html, /<label class="cw-ler-mais"><input class="cw-mais" type="checkbox">/g);
  assert.equal(checkboxes, 1);
  assert.equal(dentroDoRotulo, 1);
});

test("as correções do corretor ficam recolhidas em um <details> com a contagem", () => {
  const html = lerPagina(saida, "posts/publicado");
  assert.match(html, /<summary>2 correções<\/summary>/);
  assert.match(html, /<del>perca<\/del> → <ins>perda<\/ins>/);
});

test("referências viram links seguros (rel e target)", () => {
  const html = lerPagina(saida, "posts/publicado");
  assert.match(html, /<a href="https:\/\/exemplo\.test\/ref" rel="noopener nofollow" target="_blank">Referência de teste<\/a>/);
});

test("a data do comentário é formatada em português: dd/mm/aaaa às hh:mm", () => {
  const html = lerPagina(saida, "posts/publicado");
  assert.match(html, /21\/11\/2026 às 10:30/);
});

test("a caixa de comentar do rodapé está desativada (comentários de leitores virão depois)", () => {
  const html = lerPagina(saida, "posts/publicado");
  assert.match(html, /<textarea[^>]* disabled/);
  assert.match(html, /<button[^>]* disabled[^>]*>Comentar<\/button>/);
});

test("rascunho público também mostra a área de comentários", () => {
  const html = lerPagina(saida, "posts/rascunho-publico");
  assert.match(html, /Comentários Agênticos/);
  assert.match(html, /Comentário em rascunho público/);
});

test("rascunho comum NÃO mostra a área, mesmo existindo comentários guardados para ele", () => {
  const html = lerPagina(saida, "posts/rascunho-comum");
  assert.doesNotMatch(html, /Comentários Agênticos/);
  assert.doesNotMatch(html, /NÃO pode aparecer/);
});

test("artigo sem comentários mostra a mensagem de área vazia", () => {
  const html = lerPagina(saida, "posts/sem-comentarios");
  assert.match(html, /Ainda não há comentários dos agentes neste artigo\./);
  assert.match(html, /<span class="cw-barra-titulo">0 comentários<\/span>/);
});

test("CSS e JavaScript saem com hash no nome (evita cache antigo no navegador)", () => {
  const html = lerPagina(saida, "posts/publicado");
  assert.match(html, /\/css\/estilo\.min\.[0-9a-f]{64}\.css/);
  assert.match(html, /<script src="\/js\/tema\.[0-9a-f]{64}\.js" defer integrity="sha256-[^"]+"/);
});

test("os botões do trenó e dos gnomos existem no HTML (só o CSS do natal os mostra)", () => {
  const html = lerPagina(saida, "posts/publicado");
  assert.match(html, /<button class="natal-only natal-gnomo-borda"[^>]*data-natal="danca"/);
  assert.match(html, /<button class="natal-trineo"[^>]*data-natal="papai"/);
  assert.match(html, /<button class="natal-only natal-gnomo"[^>]*data-natal="gnomo"/);
});
