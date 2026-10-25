import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { projects } from '@/content';
import type { Finding } from '@/content/schema';

// Spec 4.4 D: ticket bodies are quoted or closely paraphrased from each repo's docs/FINDINGS.md.
// The fixtures are verbatim copies of those reports; every ticket string must appear in its report.

const SOURCED = ['accessibility-testing', 'security-testing', 'performance-testing'] as const;

const TEXT_FIELDS = ['expected', 'actual', 'impact', 'recommendation', 'trackedBy'] as const;

// UI statuses, not quotes: exempt from the substring check.
const STATUS_LITERALS = new Set(['Pinned by test', 'Report only']);

// Findings whose source states an expected result. None of the three reports does.
const STATES_EXPECTED = new Set<string>();

/** Strip markdown emphasis and backticks, collapse whitespace. */
function normalise(text: string): string {
  return text
    .replace(/`/g, '')
    .replace(/\*\*/g, '')
    .replace(/(?<![A-Za-z0-9])_|_(?![A-Za-z0-9])/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function ticketStrings(finding: Finding): { field: string; text: string }[] {
  const out: { field: string; text: string }[] = [];
  for (const [i, step] of (finding.steps ?? []).entries())
    out.push({ field: `steps[${i}]`, text: step });
  for (const field of TEXT_FIELDS) {
    const value = finding[field];
    if (value !== undefined) out.push({ field, text: value });
  }
  if (finding.ticketStatus !== undefined && !STATUS_LITERALS.has(finding.ticketStatus)) {
    out.push({ field: 'ticketStatus', text: finding.ticketStatus });
  }
  return out;
}

const report = (slug: string) =>
  normalise(readFileSync(`tests/fixtures/findings/${slug}.md`, 'utf8'));

const findingsOf = (slug: string) => {
  const project = projects.find((p) => p.slug === slug);
  expect(project, slug).toBeDefined();
  expect(project!.findings.length, `${slug} has findings`).toBeGreaterThan(0);
  return project!.findings;
};

describe('normalise (self-test)', () => {
  const source = normalise('- **Observed:** The `token` cookie is _not_ set\n  with `HttpOnly`.');

  it('matches a quote across emphasis, backticks and line breaks', () => {
    expect(source).toContain(normalise('The token cookie is not set with `HttpOnly`.'));
  });

  it('keeps underscores inside identifiers', () => {
    expect(normalise('log in as `standard_user`')).toBe('log in as standard_user');
  });

  it('rejects a reworded quote', () => {
    expect(source).not.toContain(normalise('The token cookie lacks HttpOnly.'));
  });
});

describe('defect tickets quote their FINDINGS report', () => {
  it.each(SOURCED)('every ticket string in %s appears in its report', (slug) => {
    const text = report(slug);
    for (const finding of findingsOf(slug)) {
      for (const { field, text: quote } of ticketStrings(finding)) {
        expect(text.includes(normalise(quote)), `${finding.id}.${field}: "${quote}"`).toBe(true);
      }
    }
  });

  it.each(SOURCED)('%s sets expected only where the source states one', (slug) => {
    for (const finding of findingsOf(slug)) {
      if (!STATES_EXPECTED.has(finding.id)) expect(finding.expected, finding.id).toBeUndefined();
    }
  });

  it.each(SOURCED)('%s marks a ticket "Pinned by test" only when a test tracks it', (slug) => {
    for (const finding of findingsOf(slug)) {
      if (finding.ticketStatus === 'Pinned by test') {
        expect(finding.trackedBy, finding.id).toBeDefined();
      }
    }
  });

  it('gives every accessibility finding an observed result and its tracking test', () => {
    const byId = new Map(findingsOf('accessibility-testing').map((f) => [f.id, f]));
    for (const id of ['F-1', 'F-2', 'F-3', 'F-4', 'F-5', 'F-6', 'F-7']) {
      expect(byId.get(id)?.actual, `${id}.actual`).toBeDefined();
      expect(byId.get(id)?.trackedBy, `${id}.trackedBy`).toBeDefined();
    }
  });
});
