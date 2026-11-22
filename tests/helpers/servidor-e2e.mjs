// Servidor usado pelos testes de navegador: monta o site temporário (tema real + artigos
// fictícios de tests/fixtures) e roda o `hugo server` nele. O Playwright inicia e encerra este
// script sozinho (ver webServer em playwright.config.js).
import { spawn } from "node:child_process";
import { criarSite, limpar } from "./site-temporario.mjs";

const dir = criarSite();
const hugo = spawn(
  "hugo",
  ["server", "--source", dir, "--port", "1399", "--bind", "127.0.0.1", "--disableLiveReload", "-D", "--quiet"],
  { stdio: "inherit" },
);

function encerrar() {
  hugo.kill();
  limpar(dir);
}
process.on("exit", encerrar);
process.on("SIGINT", () => process.exit(0));
process.on("SIGTERM", () => process.exit(0));
hugo.on("exit", () => process.exit(0));
