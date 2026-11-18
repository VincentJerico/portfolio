import type { Metadata } from 'next';
import { DataTable } from '@/components/content/DataTable';
import { Section } from '@/components/content/Section';
import { StatusChip } from '@/components/ui/StatusChip';
import type { CSSProperties } from 'react';
import { formatDay } from '@/lib/format';
import { qualityReport } from '@/lib/quality-report';
import { pageMetadata } from '@/lib/seo';
import { LetterTitle } from '@/components/motion/Letters';

export const metadata: Metadata = pageMetadata({
  title: 'Quality',
  description: 'How this site is tested: the quality gates it must pass and the latest CI results.',
  path: '/quality',
});

// Each gate and the self-test that proves it can fail (spec 12).
const GATES: { name: string; what: string; selfTest: string }[] = [
  {
    name: 'Lint and format',
    what: 'ESLint with zero warnings allowed, Prettier on every file.',
    selfTest: 'CI fails on the first warning; there is no "warn but pass" setting.',
  },
  {
    name: 'Types',
    what: 'TypeScript in strict mode, including unchecked index access.',
    selfTest: 'Content that does not match its schema fails the build as well as the type check.',
  },
  {
    name: 'Unit and content guards',
    what: 'Every content file parses with its schema; no placeholder text, emojis, unapproved case studies or private terms reach the site.',
    selfTest:
      'A planted fixture with a placeholder marker, emojis and an unapproved case study must be caught by each guard.',
  },
  {
    name: 'End-to-end and accessibility',
    what: 'Every route on Chromium, WebKit and mobile Chrome: one h1, landmarks, no overflow from 320 to 2560 px, axe with zero WCAG 2.2 AA violations in both themes, and keyboard guards written against the defects I found in SauceDemo.',
    selfTest:
      'A self-test page with planted contrast and focus defects must make axe and the focus guard fail.',
  },
  {
    name: 'Security headers',
    what: 'Every response carries the CSP, Referrer-Policy, Permissions-Policy, nosniff, frame, HSTS and COOP headers, with no wildcard CORS.',
    selfTest: 'The header checker is fed a non-compliant set and must report every defect.',
  },
  {
    name: 'Lighthouse',
    what: 'Mobile, median of five runs on five routes: performance at least 94, accessibility 100, best practices at least 95, SEO 100, LCP within 2 s, CLS within 0.05, blocking time within 300 ms, JavaScript on the overview within 180 KB. Each preview and production deployment is measured again with the same budgets, except performance at least 93, because the CI runner measures page startup slower against the live host than against a local server for the same build.',
    selfTest: 'Budgets are assertions: CI fails the moment a route goes over.',
  },
  {
    name: 'Link check',
    what: 'lychee checks every link in the built pages, on every pull request and weekly. legatalink.free.nf is excluded: its free host shows bots a browser check, so it always fails automated checks while working for people.',
    selfTest:
      'A broken link fails the job. Timeouts and server errors are retried; a rate-limited answer (HTTP 429) counts as reachable.',
  },
];

/** A 0 to 100 Lighthouse score with a bar filled to the score. */
function Score({ value }: { value: number }) {
  return (
    <span className="inline-flex min-w-[3.5rem] flex-col gap-1">
      <span>{value}</span>
      <span
        aria-hidden="true"
        className="score-bar"
        style={{ '--v': value / 100 } as CSSProperties}
      />
    </span>
  );
}

export default function QualityPage() {
  const report = qualityReport;
  const real = !report.sample;

  return (
    <div className="flex flex-col gap-rhythm">
      <header className="flex flex-col gap-6">
        <p className="label-mono text-ink-muted">How this site is tested</p>
        <LetterTitle text="Quality" />
        <p className="measure text-lg text-ink-muted">
          This site is tested like the software I test for clients. Every push runs the gates below,
          and each gate has a self-test, because a gate that can&apos;t fail isn&apos;t a gate.
        </p>
      </header>

      <Section id="latest-run" title="Latest run">
        {real ? (
          <div className="flex flex-col gap-6">
            <dl className="grid gap-x-8 gap-y-3 border-t border-line pt-4 sm:grid-cols-[8rem_1fr]">
              <dt className="label-mono pt-0.5 text-ink-muted">Result</dt>
              <dd>
                <StatusChip status={report.overall} />
              </dd>
              <dt className="label-mono pt-0.5 text-ink-muted">Date</dt>
              <dd className="text-ink">{formatDay(report.generatedAt.slice(0, 10))}</dd>
              <dt className="label-mono pt-0.5 text-ink-muted">Commit</dt>
              <dd className="font-mono text-ink">{report.commit}</dd>
              <dt className="label-mono pt-0.5 text-ink-muted">Run</dt>
              <dd>
                <a href={report.runUrl} className="inline-flex min-h-11 items-center">
                  View the GitHub Actions run
                </a>
              </dd>
            </dl>
            <DataTable
              caption="Gates"
              columns={['Gate', 'Tool', 'Result', 'Details']}
              rows={report.gates.map((g) => [g.gate, g.tool, g.result.toUpperCase(), g.details])}
            />
            {report.lighthouse.length > 0 && (
              <div>
                <DataTable
                  caption="Lighthouse (mobile, median of 5 runs)"
                  columns={['Route', 'Performance', 'Accessibility', 'Best practices', 'SEO']}
                  rows={report.lighthouse.map((l) => [
                    l.route,
                    <Score key="p" value={l.performance} />,
                    <Score key="a" value={l.accessibility} />,
                    <Score key="b" value={l.bestPractices} />,
                    <Score key="s" value={l.seo} />,
                  ])}
                />
              </div>
            )}
            {Object.keys(report.routes).length > 0 && (
              <DataTable
                caption="Per-route checks (integrity and axe, Chromium)"
                columns={['Route', 'Result', 'Duration']}
                rows={Object.entries(report.routes).map(([route, r]) => [
                  route,
                  r.status.toUpperCase(),
                  `${(r.durationMs / 1000).toFixed(1)} s`,
                ])}
              />
            )}
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3 border-t border-line pt-4">
            <StatusChip status="not-run" label="Not run yet" />
            <p className="text-ink-muted">
              Results appear here after the first run of the full pipeline on the main branch.
            </p>
          </div>
        )}
        <p className="measure mt-6 text-sm text-ink-muted">
          Production is deployed from GitHub Actions only after every gate passes. The deployed
          build is rebuilt from the same commit and differs from the tested one only in this report
          and the CV PDF; the page with planted defects that the self-tests use is left out.
        </p>
      </Section>

      <Section id="gates" title="The gates and how each proves itself">
        <ul className="border-t border-line">
          {GATES.map((gate) => (
            <li
              key={gate.name}
              className="grid gap-x-8 gap-y-2 border-b border-line py-4 md:grid-cols-[14rem_minmax(0,1fr)]"
            >
              <h3>{gate.name}</h3>
              <div className="measure flex flex-col gap-2">
                <p className="text-[0.9375rem] text-ink">{gate.what}</p>
                <p className="text-sm text-ink-muted">
                  <span className="label-mono text-ink-muted">Self-test · </span>
                  {gate.selfTest}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}
