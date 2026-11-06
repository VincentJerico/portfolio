import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const SCRIPT = resolve('scripts/push-quality-report.sh');
const REPORT = 'src/generated/quality.json';

let root: string;
let env: NodeJS.ProcessEnv;

function git(cwd: string, ...args: string[]) {
  return execFileSync('git', args, { cwd, env, encoding: 'utf8' }).trim();
}

function commitFile(cwd: string, file: string, content: string, message: string) {
  mkdirSync(join(cwd, file, '..'), { recursive: true });
  writeFileSync(join(cwd, file), content);
  git(cwd, 'add', file);
  git(cwd, 'commit', '-q', '-m', message);
  return git(cwd, 'rev-parse', 'HEAD');
}

/** A bare "GitHub" remote whose main is at the tested commit, and a runner checkout of that commit. */
function setUp() {
  const origin = join(root, 'origin.git');
  const seed = join(root, 'seed');
  git(root, 'init', '-q', '--bare', '-b', 'main', origin);
  git(root, 'init', '-q', '-b', 'main', seed);
  commitFile(seed, REPORT, '{"commit":"old"}\n', 'initial');
  const tested = commitFile(seed, 'src/page.ts', 'v1\n', 'feat: tested change');
  git(seed, 'push', '-q', origin, 'main');
  const runner = join(root, 'runner');
  // Shallow, like actions/checkout in the Release job.
  git(root, 'clone', '-q', '--depth', '1', `file://${origin}`, runner);
  writeFileSync(join(runner, REPORT), '{"commit":"tested"}\n');
  return { origin, seed, runner, tested };
}

function push(runner: string, origin: string, tested: string) {
  return spawnSync('bash', [SCRIPT, origin, tested], { cwd: runner, env, encoding: 'utf8' });
}

function mainReport(origin: string) {
  return git(origin, 'show', `main:${REPORT}`);
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'push-report-'));
  // A fresh HOME and no system config keep the developer's git settings (signing, hooks) out.
  env = {
    ...process.env,
    HOME: root,
    XDG_CONFIG_HOME: root,
    GIT_CONFIG_NOSYSTEM: '1',
    GIT_AUTHOR_NAME: 'test',
    GIT_AUTHOR_EMAIL: 'test@example.test',
    GIT_COMMITTER_NAME: 'test',
    GIT_COMMITTER_EMAIL: 'test@example.test',
  };
});

afterEach(() => rmSync(root, { recursive: true, force: true }));

describe('push-quality-report.sh', () => {
  it('pushes the report when main is still the tested commit', () => {
    const { origin, runner, tested } = setUp();
    expect(push(runner, `file://${origin}`, tested).status).toBe(0);
    expect(mainReport(origin)).toBe('{"commit":"tested"}');
    expect(git(origin, 'rev-parse', 'main^')).toBe(tested);
  });

  it('skips, without failing, when a newer code commit landed on main', () => {
    const { origin, seed, runner, tested } = setUp();
    const newer = commitFile(seed, 'src/page.ts', 'v2\n', 'feat: newer change');
    git(seed, 'push', '-q', origin, 'main');
    const result = push(runner, `file://${origin}`, tested);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('::notice::main moved past');
    expect(git(origin, 'rev-parse', 'main')).toBe(newer);
  });

  it('rebuilds its report on top of a report commit that landed first', () => {
    const { origin, seed, runner, tested } = setUp();
    const earlier = commitFile(seed, REPORT, '{"commit":"scheduled"}\n', 'chore: earlier report');
    git(seed, 'push', '-q', origin, 'main');
    expect(push(runner, `file://${origin}`, tested).status).toBe(0);
    expect(mainReport(origin)).toBe('{"commit":"tested"}');
    expect(git(origin, 'rev-parse', 'main^')).toBe(earlier);
    expect(git(origin, 'show', 'main:src/page.ts')).toBe('v1');
  });

  it('fails when main no longer contains the tested commit', () => {
    const { origin, seed, runner, tested } = setUp();
    git(seed, 'reset', '-q', '--hard', 'HEAD^');
    commitFile(seed, 'src/page.ts', 'rewritten\n', 'feat: rewritten history');
    git(seed, 'push', '-q', '--force', origin, 'main');
    const result = push(runner, `file://${origin}`, tested);
    expect(result.status).toBe(1);
    expect(result.stdout).toContain('::error::main no longer contains');
  });

  it('does nothing when the report is unchanged', () => {
    const { origin, runner, tested } = setUp();
    git(runner, 'checkout', '-q', '--', REPORT);
    expect(push(runner, `file://${origin}`, tested).status).toBe(0);
    expect(git(origin, 'rev-parse', 'main')).toBe(tested);
  });
});
