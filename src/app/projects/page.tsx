import type { Metadata } from 'next';
import { ProjectFilter } from '@/components/content/ProjectFilter';
import { WorkRowBody } from '@/components/content/WorkList';
import { profile } from '@/content';
import { projectsInOrder } from '@/lib/content';
import { categoryLabel } from '@/lib/labels';
import { pageMetadata } from '@/lib/seo';
import { projectItem } from '@/lib/work-items';

export const metadata: Metadata = pageMetadata({
  title: 'Projects',
  description: profile.tagline,
  path: '/projects',
});

export default function ProjectsPage() {
  const projects = projectsInOrder();
  const categories = [...new Set(projects.map((p) => p.category))].map((value) => ({
    value,
    label: categoryLabel(value),
  }));

  return (
    <div className="flex flex-col gap-rhythm">
      <header>
        <p className="label-mono text-ink-muted">{projects.length} projects</p>
        <h1 className="mt-4">Projects</h1>
        <p className="measure mt-6 text-lg text-ink-muted">{profile.tagline}</p>
      </header>
      <section aria-labelledby="all-projects-heading">
        <h2 id="all-projects-heading" className="sr-only">
          All projects
        </h2>
        <ProjectFilter
          categories={categories}
          cards={projects.map((project, i) => ({
            slug: project.slug,
            category: project.category,
            text: [project.name, project.hook, project.summary, ...project.stack].join(' '),
            card: <WorkRowBody item={projectItem(project)} index={i} />,
          }))}
        />
      </section>
    </div>
  );
}
