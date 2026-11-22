// Configuração dos testes de navegador (Playwright). Ver docs/10-testes.md.
//
// Navegador: por padrão usa o Microsoft Edge já instalado (nada para baixar). Para trocar:
//   PW_CHANNEL=chrome npm run e2e   (Chrome)   |   PW_CHANNEL= npm run e2e   (Chromium do Playwright,
//   que se baixa uma vez com: npx playwright install chromium). No CI (CI=true) já usa o Chromium.
import { defineConfig } from "@playwright/test";

const PORTA = 1399;

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  fullyParallel: true,
  reporter: [["list"]],
  outputDir: "./test-results",
  use: {
    baseURL: `http://127.0.0.1:${PORTA}`,
    // Localmente usa o Edge já instalado (nada para baixar); no CI (CI=true) usa o Chromium do Playwright.
    channel: process.env.PW_CHANNEL ?? (process.env.CI ? undefined : "msedge"),
    viewport: { width: 1400, height: 900 },
    locale: "pt-BR",
    trace: "retain-on-failure",
  },
  // Sobe o site temporário (tema real + artigos fictícios) antes dos testes e derruba depois.
  webServer: {
    command: "node helpers/servidor-e2e.mjs",
    url: `http://127.0.0.1:${PORTA}/`,
    timeout: 60_000,
    reuseExistingServer: false,
    stderr: "pipe",
  },
});
