/**
 * Live GitHub Actions badge: a plain <img> with fixed size (spec 8), never next/image. It loads from an
 * external host, so a pending skeleton holds its place until the image paints over it.
 */
export function CiBadge({ src, href, repo }: { src: string; href?: string; repo: string }) {
  const img = (
    <span className="skeleton inline-flex h-5 min-w-[90px]">
      {/* eslint-disable-next-line @next/next/no-img-element -- SVG badge, sized explicitly */}
      <img src={src} alt={`CI status for ${repo}`} width={90} height={20} className="h-5 w-auto" />
    </span>
  );
  return href ? (
    <a href={href} className="inline-flex min-h-11 items-center">
      {img}
    </a>
  ) : (
    img
  );
}
