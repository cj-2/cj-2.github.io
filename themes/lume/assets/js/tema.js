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
