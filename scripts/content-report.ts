// Phase 2 DoD report: what the site hides and why, plus random verbatim spot-checks of content
// against docs/01-PORTFOLIO-DATA.md. Usage: pnpm content:report [count]
import { readFileSync } from 'node:fs';
import { allContent, caseStudies, experience, projects, timeline, education } from '../src/content';
import { collectStrings } from '../src/lib/strings';

const HIDDEN: [field: string, reason: string][] = [
  ['profile.linkedin', 'TODO in data §1 (account being recovered)'],
  ['profile.openToWork', 'Not shown: data §1 default (employed; Contact is enough)'],
  ['Custom domain', 'TODO in data §1 (launch on the Vercel URL first)'],
  ['certifications[*].credentialUrl', 'TODO in data §8'],
  ['taskflow-under-test.liveUrl', 'No live demo deployed (data §3.6)'],
  ['legatalink.repo', "Private, on a teammate's account (data §3.8)"],
  ['13th QA checklist area', 'Not on record (data §5.4); site shows 12 and never says 13'],
  ['Case study client names, regions, URLs, staff', 'Confidential (data §5, D5)'],
  ['Phone, street, postal code', 'PRIVATE (data §1)'],
  ['Education GPA outside /resume', 'Data §7: resume page only'],
];

const notVerified = [...projects, ...experience, ...caseStudies, ...timeline, ...education].filter(
  (item) => item.status !== 'verified',
);
const unapproved = caseStudies.filter((item) => !item.approved);

console.log('## Hidden fields\n\n| Field | Why hidden |\n| --- | --- |');
for (const [field, reason] of HIDDEN) console.log(`| ${field} | ${reason} |`);
console.log(`\nItems with status other than verified: ${notVerified.length}`);
console.log(`Unapproved case studies: ${unapproved.length}\n`);

const raw = readFileSync('docs/01-PORTFOLIO-DATA.md', 'utf8');
const lines = raw.split('\n');
const flat = raw.replace(/\s*\n\s*/g, ' ');
const SKIP =
  /(^|\.)(status|category|slug|kind|severity|id|src|href|repo|ciBadge|ciUrl|sourceHref|asOf|photo|cvPdf)$/;
const candidates = collectStrings(allContent).filter(
  ({ path, value }) => !SKIP.test(path) && value.length >= 12,
);

const count = Number(process.argv[2] ?? 10);
const picks = [...candidates].sort(() => Math.random() - 0.5).slice(0, count);

console.log(
  '## Spot-check (random)\n\n| Content path | Value | In data file |\n| --- | --- | --- |',
);
for (const { path, value } of picks) {
  const probe = value.slice(0, 40);
  const line = lines.findIndex((l) => l.replace(/\s+/g, ' ').includes(probe.replace(/\s+/g, ' ')));
  const found = flat.includes(value)
    ? `verbatim, line ${line + 1}`
    : line >= 0
      ? `starts verbatim at line ${line + 1} (split/joined)`
      : 'NOT FOUND';
  const shown = value.length > 70 ? `${value.slice(0, 67)}...` : value;
  console.log(`| ${path} | ${shown.replace(/\|/g, '\\|')} | ${found} |`);
}
