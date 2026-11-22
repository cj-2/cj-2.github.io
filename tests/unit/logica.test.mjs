// Testes da lógica pura do tema (sem navegador e sem DOM).
// Rodar: npm --prefix tests run unit   (ou, dentro de tests/:  npm run unit)
// O módulo testado é o mesmo que o site usa: themes/lume/assets/js/logica.js
import test from "node:test";
import assert from "node:assert/strict";
import {
  ESTILOS,
  LARGURAS,
  proximoDaLista,
  codigoVisual,
  lerCodigoVisual,
  permiteMensagem,
  limitarGnomoY,
  escolherSemRepetir,
  posicaoNaFaixa,
} from "../../themes/lume/assets/js/logica.js";

test("o ciclo de estilos é natal → terminal → normal → retrô → natal", () => {
  assert.deepEqual(ESTILOS, ["natal", "terminal", "normal", "retro"]);
  assert.equal(proximoDaLista(ESTILOS, "natal"), "terminal");
  assert.equal(proximoDaLista(ESTILOS, "terminal"), "normal");
  assert.equal(proximoDaLista(ESTILOS, "normal"), "retro");
  assert.equal(proximoDaLista(ESTILOS, "retro"), "natal"); // volta ao começo
});

test("um valor desconhecido cai no primeiro item da lista", () => {
  assert.equal(proximoDaLista(ESTILOS, "xyz"), "natal");
});

test("o código visual junta estilo e largura em 2 letras", () => {
  assert.equal(codigoVisual("natal", "default"), "xp");
  assert.equal(codigoVisual("terminal", "narrow"), "te");
  assert.equal(codigoVisual("normal", "default"), "np");
  assert.equal(codigoVisual("retro", "full"), "rt");
});

test("ler o código devolve o que foi escrito, nas 12 combinações", () => {
  for (const estilo of ESTILOS) {
    for (const largura of LARGURAS) {
      assert.deepEqual(lerCodigoVisual(codigoVisual(estilo, largura)), { estilo, largura });
    }
  }
});

test("códigos inválidos são ignorados (devolvem null)", () => {
  for (const ruim of ["zz", "xz", "", "XP", "xpp", "x", null, undefined, 42]) {
    assert.equal(lerCodigoVisual(ruim), null, `deveria ignorar ${JSON.stringify(ruim)}`);
  }
});

test("a mensagem sempre aparece no primeiro clique, mesmo logo que a página abre", () => {
  // Bug real: o marcador começava em 0 e performance.now() conta desde a abertura da página.
  assert.equal(permiteMensagem(100, -Infinity, 2000), true);
});

test("cliques dentro do intervalo não trocam a mensagem; depois dele, trocam", () => {
  assert.equal(permiteMensagem(5000, 4000, 2000), false);
  assert.equal(permiteMensagem(5999, 4000, 2000), false);
  assert.equal(permiteMensagem(6000, 4000, 2000), true); // exatamente no limite já vale
  assert.equal(permiteMensagem(9000, 4000, 2000), true);
});

test("o gnomo acompanha o meio da tela", () => {
  assert.equal(limitarGnomoY({ topoJanela: 0, alturaJanela: 2000, alturaTela: 800 }), 400);
  // página rolada: o topo da janela subiu 1000px, então o gnomo desce 1000px na janela
  assert.equal(limitarGnomoY({ topoJanela: -1000, alturaJanela: 3000, alturaTela: 800 }), 1400);
});

test("o gnomo nunca sai da janela: mínimo de 80px", () => {
  assert.equal(limitarGnomoY({ topoJanela: 600, alturaJanela: 2000, alturaTela: 800 }), 80);
});

test("o gnomo respeita o fim da janela (altura - 110px)", () => {
  assert.equal(limitarGnomoY({ topoJanela: -5000, alturaJanela: 2000, alturaTela: 800 }), 1890);
});

test("janela muito curta: o gnomo fica no mínimo, sem valores negativos", () => {
  assert.equal(limitarGnomoY({ topoJanela: 0, alturaJanela: 150, alturaTela: 800 }), 80);
});

test("escolherSemRepetir nunca devolve a última opção quando há outras", () => {
  const opcoes = ["a", "b", "c"];
  for (const sorteio of [0, 0.34, 0.5, 0.67, 0.999]) {
    assert.notEqual(escolherSemRepetir(opcoes, "b", sorteio), "b");
  }
});

test("escolherSemRepetir com uma opção só devolve essa opção (não quebra)", () => {
  assert.equal(escolherSemRepetir(["única"], "única", 0.5), "única");
});

test("os presentes nascem em faixas separadas, em ordem, sem se sobrepor", () => {
  const qtd = 4;
  const [x0, x1] = [0.03, 0.3];
  const largura = (x1 - x0) / qtd;
  for (const sorteio of [0, 0.5, 1]) {
    let anterior = -Infinity;
    for (let i = 0; i < qtd; i++) {
      const x = posicaoNaFaixa(i, qtd, x0, x1, sorteio);
      assert.ok(x >= x0 + i * largura && x <= x0 + (i + 1) * largura, `faixa ${i} fora dos limites: ${x}`);
      assert.ok(x > anterior, "as faixas precisam estar em ordem crescente");
      anterior = x;
    }
  }
});
