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

// O clique nos bonequinhos (mensagem + efeito) é tratado mais abaixo, em aoClicarBoneco().
if (balaoNatal) balaoNatal.addEventListener("click", () => (balaoNatal.hidden = true));

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

// ---------- Natal: corações, estrelas e presentes ao clicar ----------
// Cada efeito é um <span> (natal.css) criado na posição de quem foi clicado. --dx, --dy e
// --atraso aleatórios fazem cada um seguir um caminho diferente. Removemos por timeout (e não
// por "animationend") para funcionar também com "reduzir movimento".
//   gnomo da borda (data-natal="danca") -> corações que sobem
//   gnomo do canto (data-natal="gnomo") -> estrelas que sobem
//   Papai Noel     (data-natal="papai") -> presentes que caem
const aleatorio = (min, max) => min + Math.random() * (max - min);

const EFEITOS_NATAL = {
  danca: { classe: () => "natal-coracao", qtd: 4, dx: () => aleatorio(-112, 38), dy: () => -aleatorio(90, 180), x: [-0.4, 1.1], y: [0, 0.6], passo: 0.18 },
  gnomo: { classe: () => "natal-estrela", qtd: 5, dx: () => aleatorio(-100, 60), dy: () => -aleatorio(90, 190), x: [-0.4, 1.1], y: [0, 0.5], passo: 0.16 },
  papai: {
    classe: (i) => `natal-caixa natal-caixa-${i % 3}`,
    qtd: 4,
    dx: () => aleatorio(-30, 20),
    dy: (r) => Math.max(160, window.innerHeight - r.bottom - 30) * aleatorio(0.7, 1),
    // O sprite tem 62 quadradinhos: os 20 primeiros (~32%) são o trenó e o resto são as renas
    // (que vão na frente). Os presentes nascem só na parte do trenó.
    x: [0.03, 0.3],
    y: [0.6, 1],
    passo: 0.5, // um presente a cada meio segundo: bem espaçados no tempo
    espalhar: true, // e no espaço: um em cada "faixa" do trenó
  },
};

function soltarEfeito(origem, quem) {
  const cfg = EFEITOS_NATAL[quem];
  if (!cfg) return;
  const r = origem.getBoundingClientRect();
  for (let i = 0; i < cfg.qtd; i++) {
    const el = document.createElement("span");
    el.className = cfg.classe(i);
    // espalhar: divide a faixa x em qtd fatias e sorteia dentro da fatia i (nunca ficam colados)
    const [x0, x1] = cfg.x;
    const x = cfg.espalhar ? x0 + ((i + aleatorio(0.1, 0.9)) / cfg.qtd) * (x1 - x0) : aleatorio(x0, x1);
    el.style.left = `${r.left + r.width * x}px`;
    el.style.top = `${r.top + r.height * aleatorio(...cfg.y)}px`;
    el.style.setProperty("--dx", `${Math.round(cfg.dx())}px`);
    el.style.setProperty("--dy", `${Math.round(cfg.dy(r))}px`);
    el.style.setProperty("--atraso", `${(i * cfg.passo).toFixed(2)}s`);
    document.body.append(el);
    setTimeout(() => el.remove(), 2500 + i * cfg.passo * 1000); // duração da animação + atraso
  }
}

// ---------- Natal: cliques nos bonequinhos, com "debounce" na mensagem ----------
// Sem isso, quem clica várias vezes seguidas troca a mensagem a cada clique antes de conseguir
// lê-la. Aqui vale o primeiro clique e os seguintes, dentro do
// intervalo, não trocam a mensagem (é o "debounce" que age na borda de subida, também chamado de
// throttle: responde na hora ao primeiro clique, em vez de esperar o fim da sequência).
// O intervalo vale para todos os bonequinhos juntos, pois dividem o mesmo balão.
const INTERVALO_CLIQUE_MS = 2000;
let ultimoCliqueBoneco = 0;

function aoClicarBoneco(el) {
  // Os efeitos (corações, estrelas, presentes) saem a cada clique: só a mensagem tem trava.
  soltarEfeito(el, el.dataset.natal);
  const agora = performance.now();
  if (agora - ultimoCliqueBoneco < INTERVALO_CLIQUE_MS) return;
  ultimoCliqueBoneco = agora;
  if (balaoNatal) mostrarMensagemNatal(el.dataset.natal);
}

document.querySelectorAll("[data-natal]").forEach((el) => {
  el.addEventListener("click", () => aoClicarBoneco(el));
});
