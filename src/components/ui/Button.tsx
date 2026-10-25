import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-accent text-bg hover:brightness-110',
  secondary: 'border border-line bg-surface text-ink hover:bg-surface-2',
  ghost: 'text-accent hover:bg-surface-2',
};

const BASE =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-chip px-4 text-[0.9375rem] font-semibold no-underline transition-[filter,background-color]';

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
