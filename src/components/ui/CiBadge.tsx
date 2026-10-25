/** Live GitHub Actions badge: a plain <img> with fixed size (spec 8), never next/image. */
export function CiBadge({ src, href, repo }: { src: string; href?: string; repo: string }) {
  const img = (
    // eslint-disable-next-line @next/next/no-img-element -- SVG badge, sized explicitly
    <img src={src} alt={`CI status for ${repo}`} width={90} height={20} className="h-5 w-auto" />
  );
  return href ? (
    <a href={href} className="inline-flex min-h-11 items-center">
      {img}
    </a>
  ) : (
    img
  );
}
