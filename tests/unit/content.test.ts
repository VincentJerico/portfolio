import { describe, expect, it } from 'vitest';
import {
  allContent,
  caseStudies,
  certifications,
  education,
  experience,
  metrics,
  profile,
  qaAreas,
  skills,
  timeline,
} from '@/content';
import { approvedCaseStudies } from '@/lib/content';
import { navItems } from '@/lib/nav-items';
import { findBanned } from '@/lib/strings';

describe('content integrity', () => {
  it('contains no placeholder markers or emojis', () => {
    expect(findBanned(allContent)).toEqual([]);
  });

});

describe('profile', () => {
  it('omits fields that are TODO or not shown', () => {
    expect(profile.linkedin).toBeUndefined();
    expect(profile.openToWork).toBeUndefined();
  });

  it('carries the verified identity', () => {
    expect(profile.fullName).toBe('Vincent Jerico Alcuran');
    expect(profile.headline).toBe('Software QA/QC Engineer on the path to SDET.');
    expect(profile.languages).toEqual(['English', 'Tagalog']);
  });
});

describe('metrics', () => {
  it('has the ten data-file metrics with unique ids, all as of 2026-10-24', () => {
    expect(metrics).toHaveLength(10);
    expect(new Set(metrics.map((m) => m.id)).size).toBe(10);
    expect(metrics.every((m) => m.asOf === '2026-10-24')).toBe(true);
  });
});

describe('collections', () => {
  it('lists experience BossLabs first, then internship, then scholarship', () => {
    expect(experience.map((e) => e.kind)).toEqual(['job', 'internship', 'scholarship']);
    expect(experience[0]?.hasCaseStudies).toBe(true);
  });

  it('has the 12 QA checklist areas on record and never claims 13', () => {
    expect(qaAreas).toHaveLength(12);
  });

  it('has the eight certifications without credential URLs', () => {
    expect(certifications).toHaveLength(8);
    expect(certifications.every((c) => c.credentialUrl === undefined)).toBe(true);
  });

  it('marks only the Learning skill group as learning', () => {
    expect(skills.filter((s) => s.learning).map((s) => s.group)).toEqual(['Learning']);
  });

  it('links every skill to evidence that is a URL or a site path', () => {
    for (const { href } of skills.flatMap((s) => s.evidence)) {
      expect(href).toMatch(/^(https:\/\/|\/)/);
    }
  });

  it('has the 17 timeline events ending with Next', () => {
    expect(timeline).toHaveLength(17);
    expect(timeline.at(-1)?.date).toBe('Next');
  });

  it('has one education entry with the capstone linked', () => {
    expect(education).toHaveLength(1);
    expect(education[0]?.capstoneSlug).toBe('legatalink');
  });
});

describe('case studies and navigation', () => {
  it('has three approved case studies, the third currently testing', () => {
    expect(approvedCaseStudies().map((c) => c.slug)).toEqual([
      'warehouse-operations-platform',
      'project-accounting-platform',
      'retail-operations-platform',
    ]);
    expect(caseStudies[2]?.currentlyTesting).toBe(true);
  });

  it('shows Client Work in the nav while a case study is approved', () => {
    expect(navItems().map((n) => n.label)).toContain('Client Work');
  });
});
