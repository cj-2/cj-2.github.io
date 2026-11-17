// Botão de alternar tema claro/escuro. Salva a escolha no navegador.
const root = document.documentElement;

function temaAtual() {
  if (root.dataset.theme) return root.dataset.theme;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

document.querySelectorAll(".theme-toggle").forEach((btn) => {
  btn.addEventListener("click", () => {
    const novo = temaAtual() === "dark" ? "light" : "dark";
    root.dataset.theme = novo;
    try {
      localStorage.setItem("tema", novo);
    } catch (e) {}
  });
});
