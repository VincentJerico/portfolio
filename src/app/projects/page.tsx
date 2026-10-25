import type { Metadata } from 'next';
import { ProjectCard } from '@/components/content/ProjectCard';
import { ProjectFilter } from '@/components/content/ProjectFilter';
import { profile } from '@/content';
import { projectsInOrder } from '@/lib/content';
import { categoryLabel } from '@/lib/labels';

export const metadata: Metadata = {
  title: 'Projects',
  description: profile.oneLiner,
};

export default function ProjectsPage() {
  const projects = projectsInOrder();
  const categories = [...new Set(projects.map((p) => p.category))].map((value) => ({
    value,
    label: categoryLabel(value),
  }));

  return (
    <div className="flex flex-col gap-10">
      <header className="measure">
        <p className="label-mono text-ink-muted">Test suites · public repos</p>
        <h1 className="mt-4">Projects</h1>
        <p className="mt-5 text-ink-muted">{profile.tagline}</p>
      </header>
      <ProjectFilter
        categories={categories}
        cards={projects.map((project) => ({
          slug: project.slug,
          category: project.category,
          card: <ProjectCard project={project} />,
        }))}
      />
    </div>
  );
}
