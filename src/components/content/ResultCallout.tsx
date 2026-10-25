/** Editorial pull-quote carrying the project's headline result (spec 7.3.4). */
export function ResultCallout({ text }: { text: string }) {
  return (
    <figure className="border-l-2 border-accent py-1 pl-6">
      <figcaption className="label-mono text-ink-muted">Result</figcaption>
      <blockquote className="mt-3 font-display text-2xl leading-snug text-ink lg:text-[2rem]">
        {text}
      </blockquote>
    </figure>
  );
}
