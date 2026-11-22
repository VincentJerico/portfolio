import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';

// C51: pills in the mono voice. Primary is solid ink on paper, secondary an outline, ghost a link.
const VARIANTS: Record<Variant, string> = {
  primary: 'bg-ink text-bg hover:bg-accent',
  secondary: 'border border-line text-ink hover:border-ink',
  ghost: 'text-accent underline-offset-4 hover:underline',
};

const BASE =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 font-mono text-[0.8125rem] no-underline [text-box:trim-both_cap_alphabetic]';

interface ButtonLinkProps extends Omit<ComponentProps<'a'>, 'href'> {
  href: string;
  variant?: Variant;
  children: ReactNode;
}

/** A link styled as a button: internal paths use next/link, everything else a plain anchor. */
export function ButtonLink({
  href,
  variant = 'secondary',
  className = '',
  ...rest
}: ButtonLinkProps) {
  const classes = `${BASE} ${VARIANTS[variant]} ${className}`;
  const internal = href.startsWith('/') && !rest.download && !/\.(pdf)$/.test(href);
  return internal ? (
    <Link href={href} className={classes} {...rest} />
  ) : (
    <a href={href} className={classes} {...rest} />
  );
}

interface ButtonProps extends ComponentProps<'button'> {
  variant?: Variant;
}

export function Button({
  variant = 'secondary',
  className = '',
  type = 'button',
  ...rest
}: ButtonProps) {
  return <button type={type} className={`${BASE} ${VARIANTS[variant]} ${className}`} {...rest} />;
}
