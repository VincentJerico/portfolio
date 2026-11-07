/**
 * A label that decodes letter by letter on hover or focus (DecodeHost runs the animation). Screen
 * readers get the real text from the visually hidden copy; the animated copy is hidden from them, so
 * they never hear scrambled glyphs.
 */
export function DecodeLabel({ text, className = '' }: { text: string; className?: string }) {
  return (
    <span className={`decode relative inline-block ${className}`}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" data-decode>
        {text}
      </span>
    </span>
  );
}
