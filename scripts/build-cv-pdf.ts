// Generates the downloadable CV from /resume (spec 7.7), so the PDF always matches the site and
// never carries the phone number or postal code. Run after `pnpm build`: `pnpm cv`.
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { chromium } from '@playwright/test';

const PORT = 3211;
const URL = `http://localhost:${PORT}/resume`;
const OUT = 'public/cv/Vincent-Jerico-Alcuran-CV.pdf';

async function waitForServer(timeoutMs = 60_000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      if ((await fetch(URL)).ok) return;
    } catch {
      // not up yet
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`next start did not serve ${URL} within ${timeoutMs / 1000}s`);
}

async function main() {
  const server = spawn('pnpm', ['exec', 'next', 'start', '-p', String(PORT)], {
    stdio: 'inherit',
    detached: true,
  });

  try {
    await waitForServer();
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(URL, { waitUntil: 'networkidle' });
    await page.emulateMedia({ media: 'print', colorScheme: 'light' });
    mkdirSync('public/cv', { recursive: true });
    await page.pdf({ path: OUT, format: 'A4', printBackground: false, preferCSSPageSize: true });
    await browser.close();
    console.log(`Wrote ${OUT}`);
  } finally {
    process.kill(-server.pid!, 'SIGTERM');
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
