import type { z } from 'zod';
import type { SkillGroup } from './schema';

// docs/01-PORTFOLIO-DATA.md Section 6. Evidence labels map to the pages or repos that prove them.
const GITHUB = 'https://github.com/VincentJerico';
const ev = {
  journey: { label: 'qa-engineering-journey', href: '/projects/qa-engineering-journey' },
  clientWork: { label: 'Client work', href: '/work' },
  cv: { label: 'CV', href: '/resume' },
  framework: {
    label: 'playwright-framework-template',
    href: '/projects/playwright-framework-template',
  },
  api: { label: 'api-testing-framework', href: '/projects/api-testing-framework' },
  taskflow: { label: 'taskflow-under-test', href: '/projects/taskflow-under-test' },
  a11y: { label: 'accessibility-testing', href: '/projects/accessibility-testing' },
  security: { label: 'security-testing', href: '/projects/security-testing' },
  performance: { label: 'performance-testing', href: '/projects/performance-testing' },
  legatalink: { label: 'LegataLink', href: '/projects/legatalink' },
  internship: { label: 'Internship', href: '/about' },
  repos: { label: 'Repos', href: GITHUB },
  coursework: { label: 'Coursework', href: '/about' },
  fortinet: { label: 'Fortinet cert', href: '/about#certifications' },
  profileReadme: { label: 'Profile README', href: GITHUB },
};

export const skills: z.input<typeof SkillGroup>[] = [
  {
    group: 'Testing',
    skills: [
      'Manual and exploratory testing',
      'functional testing',
      'regression testing',
      'test planning',
      'test case development',
      'test design (EP, BVA, decision tables, state transition)',
      'bug reporting',
      'UAT',
      'UI/UX validation',
    ],
    evidence: [ev.journey, ev.clientWork, ev.cv],
  },
  {
    group: 'UI automation',
    skills: [
      'Playwright',
      'Page Object Model',
      'fixtures',
      'cross-browser (Chromium, Firefox, WebKit)',
    ],
    evidence: [ev.framework],
  },
  {
    group: 'API testing',
    skills: [
      'Playwright request API',
      'Postman',
      'REST',
      'contract/schema testing (Zod)',
      'Supertest',
    ],
    evidence: [ev.api, ev.taskflow],
  },
  { group: 'Unit testing', skills: ['Vitest', 'coverage (v8)'], evidence: [ev.taskflow] },
  {
    group: 'Accessibility',
    skills: ['WCAG 2.2 AA', 'axe-core', 'keyboard audits', 'ARIA'],
    evidence: [ev.a11y],
  },
  {
    group: 'Security testing',
    skills: [
      'OWASP Top 10',
      'OWASP ZAP',
      'Trivy',
      'npm audit',
      'security headers',
      'session/cookie checks',
      'access control',
    ],
    evidence: [ev.security, ev.taskflow],
  },
  {
    group: 'Performance',
    skills: ['k6', 'SLO thresholds', 'load/stress/spike/soak/breakpoint', 'root-cause experiments'],
    evidence: [ev.performance],
  },
  {
    group: 'Data and databases',
    skills: [
      'SQL',
      'MySQL',
      'SQLite',
      'database testing',
      'data validation',
      'relational database design',
    ],
    evidence: [ev.journey, ev.legatalink, ev.internship, ev.cv],
  },
  {
    group: 'AI testing',
    skills: ['LLM eval harness (classification, extraction, safety, schema)'],
    evidence: [ev.journey],
  },
  {
    group: 'Languages and web',
    skills: ['TypeScript', 'JavaScript (Node 22)', 'PHP', 'Laravel', 'HTML/CSS', 'Bash'],
    evidence: [ev.repos, ev.legatalink, ev.cv],
  },
  {
    group: 'CI/CD and tooling',
    skills: [
      'GitHub Actions',
      'Docker',
      'Git',
      'GitHub',
      'ESLint',
      'Prettier',
      'Dependabot',
      'VS Code',
      'XAMPP',
    ],
    evidence: [ev.repos, ev.cv],
  },
  {
    group: 'IT and systems',
    skills: [
      'Windows 10/11',
      'Linux (basic)',
      'TCP/IP',
      'LAN/WAN',
      'OSI',
      'system troubleshooting',
      'Active Directory (basic)',
      'hardware/software installation',
    ],
    evidence: [ev.internship, ev.cv],
  },
  {
    group: 'Security foundations',
    skills: ['Information assurance', 'network security', 'access control', 'data protection'],
    evidence: [ev.cv, ev.coursework, ev.fortinet],
  },
  {
    group: 'Learning',
    skills: ['AWS', 'Cloud Engineering', 'Cybersecurity'],
    evidence: [ev.profileReadme],
    learning: true,
  },
];
