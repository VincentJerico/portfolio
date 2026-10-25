import { z } from 'zod';

// Spec Section 6. Extensions are marked "ext:" and logged in docs/04-DECISIONS.md (C14, C15).

export const Status = z.enum(['verified', 'confirm', 'todo', 'approval']);
// Only 'verified' values render. Anything else is hidden by the content helpers.

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const yearMonth = z.string().regex(/^\d{4}(-\d{2})?$/);

export const Link = z.object({ label: z.string(), href: z.url() });

export const Profile = z.object({
  fullName: z.string(),
  displayName: z.string(),
  role: z.string(),
  company: z.string(),
  headline: z.string(),
  oneLiner: z.string(),
  intro: z.string(),
  background: z.string().optional(), // ext: data §1 Background line, used by /resume (C14)
  tagline: z.string(),
  goal: z.string(),
  nextDirections: z.array(z.string()),
  location: z.string(),
  email: z.email(),
  github: z.url(),
  linkedin: z.url().optional(),
  photo: z.string().optional(),
  openToWork: z.string().optional(),
  cvPdf: z.string(),
  languages: z.array(z.string()).default([]), // ext: D7
  // ext: siteUrl removed; getEnv().NEXT_PUBLIC_SITE_URL is the single source (C15)
});

export const Metric = z.object({
  id: z.string(),
  value: z.string(),
  label: z.string(),
  context: z.string().optional(),
  source: z.object({ label: z.string(), href: z.url() }),
  asOf: isoDate,
});

export const Severity = z.enum([
  'critical',
  'serious',
  'high',
  'medium',
  'moderate',
  'low',
  'info',
]);

export const Finding = z.object({
  id: z.string(),
  title: z.string(),
  reference: z.string().optional(),
  severity: Severity,
  note: z.string().optional(),
  steps: z.array(z.string()).optional(),
  expected: z.string().optional(),
  actual: z.string().optional(),
  trackedBy: z.string().optional(),
  ticketStatus: z.string().optional(),
  evidenceIndex: z.number().int().optional(),
  sourceHref: z.url(),
});

export const PlantedBug = z.object({
  id: z.string(),
  route: z.string(),
  targetId: z.string(),
  hint: z.string(),
  title: z.string(),
  severity: Severity,
  steps: z.array(z.string()),
  expected: z.string(),
  actual: z.string(),
  wouldBeCaughtBy: z.string(),
});

export const Image = z.object({
  src: z.string(),
  alt: z.string().min(20),
  caption: z.string().optional(),
  width: z.number(),
  height: z.number(),
});

export const ProjectCategory = z.enum([
  'accessibility',
  'security',
  'performance',
  'api',
  'ui-automation',
  'full-stack-testing',
  'hub',
  'capstone',
]);

export const Project = z.object({
  slug: z.string(),
  name: z.string(),
  category: ProjectCategory,
  featured: z.boolean(),
  order: z.number().int(),
  summary: z.string(),
  hook: z.string(),
  repo: z.url().optional(),
  liveUrl: z.url().optional(),
  team: z.boolean().default(false),
  role: z.array(z.string()).default([]),
  ciBadge: z.url().optional(),
  ciUrl: z.url().optional(),
  startDate: isoDate.optional(),
  endDate: isoDate.optional(),
  year: z
    .string()
    .regex(/^\d{4}$/)
    .optional(), // ext: C3
  commits: z.number().int().optional(),
  target: z.string().optional(),
  stack: z.array(z.string()),
  context: z.array(z.string()),
  approach: z.array(z.string()),
  findings: z.array(Finding).default([]),
  // ext: body optional, for decision bullets with no "title: body" split (C14)
  decisions: z.array(z.object({ title: z.string(), body: z.string().optional() })).default([]),
  limits: z.array(z.string()).default([]),
  evidence: z.array(Image).default([]),
  extraTables: z
    .array(
      z.object({
        title: z.string(),
        columns: z.array(z.string()),
        rows: z.array(z.array(z.string())),
      }),
    )
    .default([]),
  status: Status,
});

export const Experience = z.object({
  slug: z.string(),
  company: z.string(),
  companyDescription: z.string().optional(),
  location: z.string().optional(),
  title: z.string(),
  start: yearMonth.or(isoDate),
  end: yearMonth.optional(),
  kind: z.enum(['job', 'internship', 'scholarship']),
  bullets: z.array(z.string()),
  hasCaseStudies: z.boolean().default(false),
  status: Status,
});

export const Certification = z.object({
  name: z.string(),
  issuer: z.string(),
  date: z.string(),
  credentialUrl: z.url().optional(),
});

export const CaseStudy = z.object({
  slug: z.string(),
  title: z.string(),
  industry: z.string(),
  system: z.string(),
  period: z.string().optional(),
  activities: z.array(z.string()),
  outcomes: z.array(z.string()).default([]),
  method: z.array(z.string()).default([]),
  approved: z.boolean(),
  status: Status,
  currentlyTesting: z.boolean().default(false), // ext: data 5.3 (C14)
});

export const SkillGroup = z.object({
  group: z.string(),
  skills: z.array(z.string()),
  evidence: z.array(z.object({ label: z.string(), href: z.string() })),
  learning: z.boolean().default(false),
});

export const TimelineEvent = z.object({
  date: z.string(),
  title: z.string(),
  kind: z.enum(['education', 'work', 'project', 'milestone', 'next']),
  href: z.string().optional(),
  status: Status,
});

export const Education = z.object({
  degree: z.string(),
  school: z.string(),
  graduated: yearMonth,
  gpa: z.string().optional(),
  honors: z.array(z.string()).default([]),
  coursework: z.array(z.string()).default([]),
  capstoneSlug: z.string().optional(),
  status: Status,
});

export const QaArea = z.string(); // ext: data 5.4 checklist areas (C14)

export type Status = z.output<typeof Status>;
export type Profile = z.output<typeof Profile>;
export type Metric = z.output<typeof Metric>;
export type Severity = z.output<typeof Severity>;
export type Finding = z.output<typeof Finding>;
export type PlantedBug = z.output<typeof PlantedBug>;
export type Image = z.output<typeof Image>;
export type ProjectCategory = z.output<typeof ProjectCategory>;
export type Project = z.output<typeof Project>;
export type Experience = z.output<typeof Experience>;
export type Certification = z.output<typeof Certification>;
export type CaseStudy = z.output<typeof CaseStudy>;
export type SkillGroup = z.output<typeof SkillGroup>;
export type TimelineEvent = z.output<typeof TimelineEvent>;
export type Education = z.output<typeof Education>;
