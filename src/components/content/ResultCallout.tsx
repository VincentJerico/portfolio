/** Editorial pull-quote carrying the project's headline result (spec 7.3.4). */
export function ResultCallout({ text }: { text: string }) {
  return (
    <figure className="border-t border-line pt-6">
      <figcaption className="label-mono text-ink-muted">Result</figcaption>
      <blockquote className="measure mt-4 text-[clamp(1.75rem,1rem+2.6vw,3.25rem)] leading-[1.08] font-bold tracking-[-0.02em] text-ink [font-variation-settings:'opsz'_72,'wdth'_85]">
        {text}
      </blockquote>
    </figure>
  );
}
