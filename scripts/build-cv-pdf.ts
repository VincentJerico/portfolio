// Generates the downloadable CV from /resume (spec 7.7), so the PDF always matches the site and
// never carries the phone number or postal code. Run after `pnpm build`: `pnpm cv`.
import { spawn, type ChildProcess } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { chromium } from '@playwright/test';

const PORT = 3211;
const URL = `http://localhost:${PORT}/resume`;
const OUT = 'public/cv/Vincent-Jerico-Alcuran-CV.pdf';

async function isServing(): Promise<boolean> {
  try {
    return (await fetch(URL)).ok;
  } catch {
    return false;
  }
}

/** Waits for our own server; fails fast if it exits (e.g. EADDRINUSE) instead of trusting another. */
async function waitForServer(server: ChildProcess, timeoutMs = 60_000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (server.exitCode !== null) {
      throw new Error(`next start exited with code ${server.exitCode} before serving ${URL}`);
    }
    if (await isServing()) return;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`next start did not serve ${URL} within ${timeoutMs / 1000}s`);
}

function stop(server: ChildProcess) {
  try {
    process.kill(-server.pid!, 'SIGTERM');
  } catch {
    // Already exited.
  }
}

async function main() {
  // A server left on the port (e.g. an orphan from an interrupted run) would serve an old build,
  // and the PDF would silently be rendered from it.
  if (await isServing()) {
    throw new Error(
      `Port ${PORT} is already serving ${URL}. Stop that server and run pnpm cv again.`,
    );
  }

  const server = spawn('pnpm', ['exec', 'next', 'start', '-p', String(PORT)], {
    stdio: 'inherit',
    detached: true,
  });
  for (const signal of ['SIGINT', 'SIGTERM'] as const) {
    process.on(signal, () => {
      stop(server);
      process.exit(130);
    });
  }

  try {
    await waitForServer(server);
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(URL, { waitUntil: 'networkidle' });
    await page.emulateMedia({ media: 'print', colorScheme: 'light' });
    mkdirSync('public/cv', { recursive: true });
    await page.pdf({ path: OUT, format: 'A4', printBackground: false, preferCSSPageSize: true });
    await browser.close();
    console.log(`Wrote ${OUT}`);
  } finally {
    stop(server);
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
