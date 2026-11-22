// Monta um SITE TEMPORÁRIO para os testes: copia o tema real (themes/lume) e o hugo.toml, e usa
// artigos e comentários FICTÍCIOS de tests/fixtures. Assim os testes rodam o Hugo de verdade,
// com o mesmo tema do site, mas nunca leem nem alteram os textos e comentários reais.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

export const RAIZ = path.resolve(fileURLToPath(new URL("../..", import.meta.url)));
export const TESTES = path.join(RAIZ, "tests");

/** Cria a pasta do site temporário. `ajustar(dir)` deixa o teste mexer nos arquivos antes do build. */
export function criarSite(ajustar) {
  const base = path.join(TESTES, ".tmp");
  fs.mkdirSync(base, { recursive: true });
  const dir = fs.mkdtempSync(path.join(base, "site-"));
  fs.copyFileSync(path.join(RAIZ, "hugo.toml"), path.join(dir, "hugo.toml"));
  fs.cpSync(path.join(RAIZ, "themes"), path.join(dir, "themes"), { recursive: true });
  fs.cpSync(path.join(TESTES, "fixtures", "content"), path.join(dir, "content"), { recursive: true });
  fs.cpSync(path.join(TESTES, "fixtures", "data"), path.join(dir, "data"), { recursive: true });
  if (ajustar) ajustar(dir);
  return dir;
}

/** Roda o Hugo (com rascunhos, como no `hugo server -D`) e devolve a pasta gerada e o que ele escreveu. */
export function construir(dir, extra = []) {
  const saida = path.join(dir, "public");
  const r = spawnSync("hugo", ["--source", dir, "--destination", saida, "-D", ...extra], { encoding: "utf8" });
  const log = `${r.stdout}\n${r.stderr}`;
  if (r.status !== 0) throw new Error(`hugo falhou:\n${log}`);
  return { saida, log };
}

/** Lê o HTML de uma página gerada (ex.: "posts/publicado"). */
export function lerPagina(saida, caminho) {
  return fs.readFileSync(path.join(saida, caminho, "index.html"), "utf8");
}

export function limpar(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}
