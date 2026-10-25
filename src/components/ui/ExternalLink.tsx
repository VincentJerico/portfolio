import type { ComponentProps } from 'react';

interface ExternalLinkProps extends ComponentProps<'a'> {
  /** Prefer same-tab (spec 8); a new tab adds a visually hidden notice. */
  newTab?: boolean;
}

export function ExternalLink({ newTab = false, children, ...rest }: ExternalLinkProps) {
  return (
    <a {...rest} {...(newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
      {children}
      {newTab && <span className="sr-only"> (opens in new tab)</span>}
    </a>
  );
}
