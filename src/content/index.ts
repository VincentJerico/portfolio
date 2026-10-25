import { z } from 'zod';
import { caseStudies as rawCaseStudies } from './case-studies';
import { certifications as rawCertifications } from './certifications';
import { education as rawEducation } from './education';
import { experience as rawExperience } from './experience';
import { qaAreas as rawQaAreas } from './method';
import { metrics as rawMetrics } from './metrics';
import { profile as rawProfile } from './profile';
import { projects as rawProjects } from './projects';
import {
  CaseStudy,
  Certification,
  Education,
  Experience,
  Metric,
  Profile,
  Project,
  QaArea,
  SkillGroup,
  TimelineEvent,
} from './schema';
import { skills as rawSkills } from './skills';
import { timeline as rawTimeline } from './timeline';

// Parsed at import: invalid content throws, which fails `next build` and `pnpm test`.
function parse<S extends z.ZodType>(name: string, schema: S, data: unknown): z.output<S> {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(`Invalid content in src/content/${name}:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}

export const profile = parse('profile.ts', Profile, rawProfile);
export const metrics = parse('metrics.ts', z.array(Metric), rawMetrics);
export const projects = parse('projects.ts', z.array(Project), rawProjects);
export const experience = parse('experience.ts', z.array(Experience), rawExperience);
export const caseStudies = parse('case-studies.ts', z.array(CaseStudy), rawCaseStudies);
export const skills = parse('skills.ts', z.array(SkillGroup), rawSkills);
export const certifications = parse('certifications.ts', z.array(Certification), rawCertifications);
export const timeline = parse('timeline.ts', z.array(TimelineEvent), rawTimeline);
export const education = parse('education.ts', z.array(Education), rawEducation);
export const qaAreas = parse('method.ts', z.array(QaArea), rawQaAreas);

export const allContent = {
  profile,
  metrics,
  projects,
  experience,
  caseStudies,
  skills,
  certifications,
  timeline,
  education,
  qaAreas,
};
