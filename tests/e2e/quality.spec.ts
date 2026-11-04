import { expect, test } from '../helpers/test';
import { qualityReport as report } from '../../src/lib/quality-report';

// The committed report is a sample until CI on main writes a real one; both must render honestly.
const latestRun = report.sample
  ? { shows: ['Not run yet'], never: /\bPASS\b/ }
  : {
      shows: [report.commit, 'View the GitHub Actions run', ...report.gates.map((g) => g.gate)],
      never: /Not run yet/,
    };

test('/quality explains every gate and its self-test, and never fakes a result', async ({
  page,
}) => {
  await page.goto('/quality');
  const main = page.locator('main');
  await expect(main.locator('h1')).toHaveText('Quality');
  const latest = main.locator('#latest-run');
  for (const text of latestRun.shows) await expect(latest).toContainText(text);
  await expect(latest).not.toContainText(latestRun.never);
  for (const gate of [
    'Lint and format',
    'Types',
    'Unit and content guards',
    'End-to-end',
    'Lighthouse',
    'Link check',
  ]) {
    await expect(main.getByRole('heading', { level: 3, name: new RegExp(gate) })).toBeVisible();
  }
  await expect(main).toContainText("a gate that can't fail isn't a gate");
  await expect(main).toContainText('legatalink.free.nf');
  await expect(main.getByRole('button', { name: 'Run tests on this page' })).toBeVisible();
});
