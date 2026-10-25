import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { projects } from '@/content';
import { projectBySlug, projectsInOrder } from '@/lib/content';
import anchors from '../fixtures/finding-anchors.json';

const dataFile = readFileSync('docs/01-PORTFOLIO-DATA.md', 'utf8').replace(/\s*\n\s*/g, ' ');

function imageSize(path: string): { width: number; height: number } {
  const bytes = readFileSync(path);
  if (path.endsWith('.png'))
    return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
  // JPEG: walk segments to the first start-of-frame marker (SOF0–SOF15, except DHT/JPG/DAC).
  let offset = 2;
  while (offset < bytes.length) {
    const marker = bytes[offset + 1]!;
    const length = bytes.readUInt16BE(offset + 2);
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return { width: bytes.readUInt16BE(offset + 7), height: bytes.readUInt16BE(offset + 5) };
    }
    offset += 2 + length;
  }
  throw new Error(`No image size found in ${path}`);
}

describe('projects', () => {
  it('lists the eight data-file projects in display order', () => {
    expect(projectsInOrder().map((p) => p.slug)).toEqual([
      'accessibility-testing',
      'security-testing',
      'performance-testing',
      'api-testing-framework',
      'playwright-framework-template',
      'taskflow-under-test',
      'qa-engineering-journey',
      'legatalink',
    ]);
    expect(new Set(projects.map((p) => p.order)).size).toBe(8);
  });

  it.each(projects.map((p) => [p.slug, p] as const))(
    '%s summary and hook are verbatim from the data file',
    (_slug, project) => {
      expect(dataFile).toContain(project.summary);
      expect(dataFile).toContain(project.hook);
    },
  );

  it('has the data-file finding counts', () => {
    const counts = Object.fromEntries(projects.map((p) => [p.slug, p.findings.length]));
    expect(counts).toMatchObject({
      'accessibility-testing': 7,
      'security-testing': 8,
      'performance-testing': 3,
    });
  });

  it('has the accessibility severities from the data file', () => {
    const severities = projectBySlug('accessibility-testing')!.findings.map((f) => f.severity);
    expect(severities.filter((s) => s === 'critical')).toHaveLength(1);
    expect(severities.filter((s) => s === 'serious')).toHaveLength(3);
    expect(severities.filter((s) => s === 'moderate')).toHaveLength(3);
  });

  it('points every finding at a heading that exists in its source file', () => {
    const known = anchors as Record<string, { anchors: string[] }>;
    for (const finding of projects.flatMap((p) => p.findings)) {
      const [file, anchor] = finding.sourceHref.split('#');
      expect(known[file!], `${finding.id}: unknown source ${file}`).toBeDefined();
      expect(known[file!]!.anchors, `${finding.id}: missing anchor`).toContain(anchor);
    }
  });

  it('ships every evidence image at its declared size', () => {
    for (const image of projects.flatMap((p) => p.evidence)) {
      const path = `public${image.src}`;
      expect(existsSync(path), path).toBe(true);
      expect(imageSize(path), path).toEqual({ width: image.width, height: image.height });
    }
  });

  it('links evidence indexes to images that exist', () => {
    for (const project of projects) {
      for (const finding of project.findings) {
        if (finding.evidenceIndex === undefined) continue;
        expect(project.evidence[finding.evidenceIndex], finding.id).toBeDefined();
      }
    }
  });

  it('never links the private LegataLink repository', () => {
    const legatalink = projectBySlug('legatalink')!;
    expect(legatalink.repo).toBeUndefined();
    expect(legatalink.team).toBe(true);
    expect(JSON.stringify(legatalink)).not.toContain('KyleReginaldo');
  });

  it('shows no live demo for TaskFlow (none deployed)', () => {
    expect(projectBySlug('taskflow-under-test')!.liveUrl).toBeUndefined();
  });
});
