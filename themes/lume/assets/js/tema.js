// Controles do menu: estilo (normal/terminal/retrô), largura e cor (sistema/claro/escuro).
// O estado fica em atributos do <html>:
//   data-style="terminal"  -> estilo terminal (padrão; o script do <head> o aplica,
//                             a menos que o visitante tenha escolhido outro)
//   data-style="retro"     -> estilo retrô (site antigo)
//   data-style="natal"     -> estilo natal (pixel art)
//   sem data-style         -> estilo normal
//   data-theme="light"|"dark" -> cor forçada (sem o atributo = segue o sistema)
// e é salvo no localStorage para valer nas próximas páginas.

const root = document.documentElement;

function salvar(chave, valor) {
  try {
    if (valor) localStorage.setItem(chave, valor);
    else localStorage.removeItem(chave);
  } catch (e) {}
}

// ---------- Link compartilhável ----------
// Mantém ?v=XY na barra de endereço (curto de propósito), para que copiar o link
// compartilhe o visual. X = estilo (n/t/r/x), Y = largura (e/p/t); ver o script do head.html.
// A cor (claro/escuro) fica de fora de propósito.
// replaceState troca a URL sem recarregar a página nem poluir o histórico.
const COD_ESTILO = { normal: "n", terminal: "t", retro: "r", natal: "x" };
const COD_LARGURA = { narrow: "e", default: "p", full: "t" };

function sincronizarUrl() {
  const url = new URL(location.href);
  url.searchParams.delete("estilo");
  url.searchParams.delete("largura");
  url.searchParams.set("v", COD_ESTILO[estiloAtual()] + COD_LARGURA[larguraAtual()]);
  history.replaceState(null, "", url);
}

// ---------- Cor ----------
const CORES = ["system", "light", "dark"];
const NOME_COR = { system: "segue o sistema", light: "claro", dark: "escuro" };

function corAtual() {
  return root.dataset.theme || "system";
}

function atualizarBotaoCor() {
  const atual = corAtual();
  const proxima = CORES[(CORES.indexOf(atual) + 1) % CORES.length];
  const texto = `Cor: ${NOME_COR[atual]} (clique para ${NOME_COR[proxima]})`;
  document.querySelectorAll(".theme-toggle").forEach((btn) => {
    btn.setAttribute("aria-label", texto);
    btn.title = texto;
  });
}

document.querySelectorAll(".theme-toggle").forEach((btn) => {
  btn.addEventListener("click", () => {
    const proxima = CORES[(CORES.indexOf(corAtual()) + 1) % CORES.length];
    if (proxima === "system") delete root.dataset.theme;
    else root.dataset.theme = proxima;
    salvar("tema", proxima === "system" ? null : proxima);
    atualizarBotaoCor();
  });
});

// ---------- Estilo ----------
// Ciclo do botão: normal -> terminal -> retrô -> natal -> normal
const ESTILOS = ["normal", "terminal", "retro", "natal"];
const NOME_ESTILO = { normal: "normal", terminal: "terminal", retro: "retrô", natal: "natal" };

function estiloAtual() {
  return ESTILOS.includes(root.dataset.style) ? root.dataset.style : "normal";
}

function proximoEstilo() {
  return ESTILOS[(ESTILOS.indexOf(estiloAtual()) + 1) % ESTILOS.length];
}

function atualizarBotaoEstilo() {
  const texto = `Mudar para o estilo ${NOME_ESTILO[proximoEstilo()]}`;
  document.querySelectorAll(".style-toggle").forEach((btn) => {
    btn.setAttribute("aria-label", texto);
    btn.title = texto;
  });
}

document.querySelectorAll(".style-toggle").forEach((btn) => {
  btn.addEventListener("click", () => {
    const proximo = proximoEstilo();
    if (proximo === "normal") delete root.dataset.style;
    else root.dataset.style = proximo;
    // Terminal é o padrão, então só "normal" e "retro" precisam ser lembrados.
    salvar("estilo", proximo === "terminal" ? null : proximo);
    atualizarBotaoEstilo();
    sincronizarUrl();
  });
});

// ---------- Largura ----------
// narrow (estreita) -> padrão (sem atributo, a do meio) -> full (total) -> narrow
const LARGURAS = ["narrow", "default", "full"];
const NOME_LARGURA = { narrow: "estreita", default: "padrão", full: "total" };

function larguraAtual() {
  return root.dataset.width || "default";
}

function atualizarBotaoLargura() {
  const atual = larguraAtual();
  const proxima = LARGURAS[(LARGURAS.indexOf(atual) + 1) % LARGURAS.length];
  const texto = `Largura: ${NOME_LARGURA[atual]} (clique para ${NOME_LARGURA[proxima]})`;
  document.querySelectorAll(".width-toggle").forEach((btn) => {
    btn.setAttribute("aria-label", texto);
    btn.title = texto;
  });
}

document.querySelectorAll(".width-toggle").forEach((btn) => {
  btn.addEventListener("click", () => {
    const proxima = LARGURAS[(LARGURAS.indexOf(larguraAtual()) + 1) % LARGURAS.length];
    if (proxima === "default") delete root.dataset.width;
    else root.dataset.width = proxima;
    salvar("largura", proxima === "default" ? null : proxima);
    atualizarBotaoLargura();
    sincronizarUrl();
  });
});

atualizarBotaoCor();
atualizarBotaoEstilo();
atualizarBotaoLargura();
sincronizarUrl();

// ---------- Spoiler ----------
// Clicar (ou Enter/Espaço, com o foco no spoiler) revela o texto de forma permanente.
function revelar(el) {
  el.classList.add("revelado");
  el.removeAttribute("role");
  el.removeAttribute("tabindex");
  el.removeAttribute("title");
}

document.querySelectorAll(".spoiler").forEach((el) => {
  el.addEventListener("click", () => revelar(el));
  el.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      revelar(el);
    }
  });
});

// ---------- Natal: mensagem ao clicar no Papai Noel ou no gnomo ----------
// Os dois são <button class="natal-only"> (escondidos fora do estilo natal). O balão
// (.natal-msg) é uma região aria-live, então leitores de tela anunciam a mensagem.
const MENSAGENS_NATAL = {
  papai: {
    nome: "Papai Noel",
    textos: [
      "Ho ho ho! Feliz Natal! Que o seu dia seja cheio de paz e de boas leituras.",
      "Ho ho ho! Este ano você foi um ótimo leitor. Continue curioso!",
      "Passando só para deixar um abraço. Boas festas!",
    ],
  },
  danca: {
    nome: "Gnomo dançarino",
    textos: [
      "Estou tentando aprender aquilo que os brasileiros chamam de sarrada!",
      "Acho que estou começando a pegar o jeito...",
      "Estou arrasando, pode falar!",
    ],
  },
  gnomo: {
    nome: "Gnomo",
    textos: [
      "Shhh... estou dançando só para você. Boas festas!",
      "Feliz Natal! Que o ano novo venha com muita saúde e poucos bugs.",
      "Dizem que quem lê no Natal ganha um presente extra. Eu não vi nada, tá?",
    ],
  },
};

const balaoNatal = document.querySelector(".natal-msg");
let timerBalao;
let ultimaMensagem = "";

function mostrarMensagemNatal(quem) {
  const { nome, textos } = MENSAGENS_NATAL[quem];
  // Sorteia sem repetir a mensagem anterior.
  const opcoes = textos.filter((t) => t !== ultimaMensagem);
  const texto = opcoes[Math.floor(Math.random() * opcoes.length)];
  ultimaMensagem = texto;
  balaoNatal.replaceChildren();
  const titulo = document.createElement("strong");
  titulo.textContent = nome;
  balaoNatal.append(titulo, texto);
  balaoNatal.hidden = false;
  clearTimeout(timerBalao);
  timerBalao = setTimeout(() => (balaoNatal.hidden = true), 6000);
}

if (balaoNatal) {
  document.querySelectorAll("[data-natal]").forEach((el) => {
    el.addEventListener("click", () => mostrarMensagemNatal(el.dataset.natal));
  });
  balaoNatal.addEventListener("click", () => (balaoNatal.hidden = true));
}

// ---------- Natal: gnomo escorregando pela borda da janela ----------
// O gnomo (.term-window::before, ver natal.css) lê a variável --gnomo-y. Aqui calculamos
// onde ele deve ficar para acompanhar a rolagem: mais ou menos no meio da tela, sem sair
// da janela. requestAnimationFrame evita recalcular mais de uma vez por quadro.
const janelaGnomo = document.querySelector(".term-window");
let gnomoAgendado = false;

function posicionarGnomo() {
  gnomoAgendado = false;
  const r = janelaGnomo.getBoundingClientRect();
  const alvo = window.innerHeight * 0.5 - r.top;
  const maximo = Math.max(80, r.height - 80);
  janelaGnomo.style.setProperty("--gnomo-y", `${Math.min(Math.max(alvo, 80), maximo)}px`);
}

function agendarGnomo() {
  if (gnomoAgendado) return;
  gnomoAgendado = true;
  requestAnimationFrame(posicionarGnomo);
}

if (janelaGnomo) {
  window.addEventListener("scroll", agendarGnomo, { passive: true });
  window.addEventListener("resize", agendarGnomo);
  posicionarGnomo();
}

// ---------- Natal: corações ao clicar no gnomo da borda ----------
// Cada coração é um <span class="natal-coracao"> (natal.css) criado na posição do gnomo.
// --dx e --atraso aleatórios fazem cada um subir por um caminho diferente. Removemos por
// timeout (e não por "animationend") para funcionar também com "reduzir movimento".
const gnomoBorda = document.querySelector(".natal-gnomo-borda");

function soltarCoracoes() {
  const r = gnomoBorda.getBoundingClientRect();
  for (let i = 0; i < 4; i++) {
    const c = document.createElement("span");
    c.className = "natal-coracao";
    // Espalhados: ponto de partida, deriva lateral e altura da subida variam em cada coração.
    c.style.left = `${r.left + r.width * (-0.4 + Math.random() * 1.5)}px`;
    c.style.top = `${r.top + r.height * (0 + Math.random() * 0.6)}px`;
    c.style.setProperty("--dx", `${Math.round((Math.random() - 0.75) * 150)}px`);
    c.style.setProperty("--dy", `-${Math.round(90 + Math.random() * 90)}px`);
    c.style.setProperty("--atraso", `${(i * 0.18).toFixed(2)}s`);
    document.body.append(c);
    setTimeout(() => c.remove(), 2200);
  }
}

if (gnomoBorda) gnomoBorda.addEventListener("click", soltarCoracoes);
// (a fala do gnomo da borda vem do listener genérico de [data-natal], mais acima)
