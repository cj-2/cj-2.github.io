// Lógica PURA do tema: funções que só recebem valores e devolvem valores, sem tocar no DOM,
// no localStorage nem no relógio. É por isso que dá para testá-las rápido, só com o Node
// (tests/unit/logica.test.mjs). O tema.js importa daqui e cuida de ligar tudo à tela.
// O Hugo (js.Build) resolve o `import` e junta tudo em um arquivo só.

export const ESTILOS = ["natal", "terminal", "normal", "retro"];
export const LARGURAS = ["narrow", "default", "full"];

// Código curto da URL (?v=XY): X = estilo, Y = largura. O script do <head> (head.html) lê o mesmo código.
export const COD_ESTILO = { normal: "n", terminal: "t", retro: "r", natal: "x" };
export const COD_LARGURA = { narrow: "e", default: "p", full: "t" };

/** Próximo item de uma lista circular. Valor desconhecido cai no primeiro item. */
export function proximoDaLista(lista, atual) {
  return lista[(lista.indexOf(atual) + 1) % lista.length];
}

/** Junta estilo e largura no código da URL. Ex.: ("natal", "default") → "xp". */
export function codigoVisual(estilo, largura) {
  return COD_ESTILO[estilo] + COD_LARGURA[largura];
}

/** Lê o código da URL. Devolve { estilo, largura } ou null se for inválido. */
export function lerCodigoVisual(codigo) {
  if (typeof codigo !== "string" || codigo.length !== 2) return null;
  const estilo = Object.keys(COD_ESTILO).find((k) => COD_ESTILO[k] === codigo[0]);
  const largura = Object.keys(COD_LARGURA).find((k) => COD_LARGURA[k] === codigo[1]);
  return estilo && largura ? { estilo, largura } : null;
}

/**
 * "Debounce" da mensagem (variante que responde ao primeiro clique): só deixa trocar a mensagem
 * se já passou o intervalo desde a última. `ultimo` começa em -Infinity para que o primeiro clique
 * sempre funcione (performance.now() conta desde a abertura da página: com 0, cliques nos
 * primeiros segundos seriam ignorados).
 */
export function permiteMensagem(agora, ultimo, intervaloMs) {
  return agora - ultimo >= intervaloMs;
}

/**
 * Altura (em px, dentro da janela do post) em que o gnomo da borda deve ficar: acompanha o meio
 * da tela, nunca menos de 80px e nunca além do fim da janela (altura - 110px).
 */
export function limitarGnomoY({ topoJanela, alturaJanela, alturaTela }) {
  const alvo = alturaTela * 0.5 - topoJanela;
  const maximo = Math.max(80, alturaJanela - 110);
  return Math.min(Math.max(alvo, 80), maximo);
}

/** Escolhe uma opção por sorteio (0 a <1), evitando repetir a última quando há outras. */
export function escolherSemRepetir(opcoes, ultima, sorteio) {
  const outras = opcoes.filter((o) => o !== ultima);
  const base = outras.length ? outras : opcoes;
  return base[Math.min(Math.floor(sorteio * base.length), base.length - 1)];
}

/**
 * Posição (entre x0 e x1) do efeito de número `i` entre `qtd`, dentro da sua "fatia" da faixa:
 * assim os efeitos não ficam colados. `sorteio` (0 a 1) escolhe o ponto dentro da fatia, sem
 * encostar nas bordas dela.
 */
export function posicaoNaFaixa(i, qtd, x0, x1, sorteio) {
  const dentro = 0.1 + 0.8 * sorteio;
  return x0 + ((i + dentro) / qtd) * (x1 - x0);
}
