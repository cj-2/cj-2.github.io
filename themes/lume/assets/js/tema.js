// Controles do menu: estilo (normal/terminal) e cor (sistema/claro/escuro).
// O estado fica em atributos do <html>:
//   data-style="terminal"  -> estilo terminal (padrão; o script do <head> o aplica,
//                             a menos que o visitante tenha escolhido "normal")
//   data-theme="light"|"dark" -> cor forçada (sem o atributo = segue o sistema)
// e é salvo no localStorage para valer nas próximas páginas.

const root = document.documentElement;

function salvar(chave, valor) {
  try {
    if (valor) localStorage.setItem(chave, valor);
    else localStorage.removeItem(chave);
  } catch (e) {}
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
function estiloAtual() {
  return root.dataset.style === "terminal" ? "terminal" : "normal";
}

function atualizarBotaoEstilo() {
  const destino = estiloAtual() === "terminal" ? "normal" : "terminal";
  const texto = `Mudar para o estilo ${destino}`;
  document.querySelectorAll(".style-toggle").forEach((btn) => {
    btn.setAttribute("aria-label", texto);
    btn.title = texto;
  });
}

document.querySelectorAll(".style-toggle").forEach((btn) => {
  btn.addEventListener("click", () => {
    if (estiloAtual() === "terminal") delete root.dataset.style;
    else root.dataset.style = "terminal";
    // Terminal é o padrão, então só a escolha "normal" precisa ser lembrada.
    salvar("estilo", estiloAtual() === "normal" ? "normal" : null);
    atualizarBotaoEstilo();
  });
});

// ---------- Largura ----------
// padrão (sem atributo) -> wide (larga) -> full (total) -> padrão
const LARGURAS = ["default", "wide", "full"];
const NOME_LARGURA = { default: "padrão", wide: "larga", full: "total" };

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
  });
});

atualizarBotaoCor();
atualizarBotaoEstilo();
atualizarBotaoLargura();
