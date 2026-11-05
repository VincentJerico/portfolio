import type { MDXComponents } from 'mdx/types';
import Link from 'next/link';
import type { ComponentProps } from 'react';

// Prose styles reuse the site's existing classes (see the project and case-study pages); no new design.
const list = 'measure flex flex-col gap-2 pl-5 text-ink marker:text-ink-muted';

const components: MDXComponents = {
  h2: (props) => <h2 {...props} className="mt-6" />,
  h3: (props) => <h3 {...props} className="mt-4" />,
  p: (props) => <p {...props} className="measure text-ink" />,
  ul: (props) => <ul {...props} className={`${list} list-disc`} />,
  ol: (props) => <ol {...props} className={`${list} list-decimal`} />,
  // Underlined so links are distinguishable from the text around them without relying on colour.
  a: ({ href = '', ...props }: ComponentProps<'a'>) =>
    href.startsWith('/') ? (
      <Link href={href} {...props} className="underline" />
    ) : (
      <a href={href} rel="noreferrer" {...props} className="underline" />
    ),
  // Inline code only: code inside a fenced block sits in <pre> and drops the chip styling.
  code: (props) => (
    <code
      {...props}
      className="rounded-[3px] bg-surface-2 px-1 py-px font-mono text-[0.875em] text-ink [pre_&]:bg-transparent [pre_&]:p-0"
    />
  ),
  pre: (props) => (
    <pre
      {...props}
      tabIndex={0}
      className="measure overflow-x-auto rounded-card border border-line bg-surface-2 p-4 font-mono text-sm text-ink"
    />
  ),
  blockquote: (props) => (
    <blockquote
      {...props}
      className="measure border-l-2 border-line pl-4 text-ink-muted [&>p]:text-ink-muted"
    />
  ),
};

export function useMDXComponents(): MDXComponents {
  return components;
}
