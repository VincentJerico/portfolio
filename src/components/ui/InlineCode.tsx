import { splitInlineCode } from '@/lib/format';

/** Content text with `code` spans rendered as <code>. */
export function InlineCode({ text }: { text: string }) {
  return (
    <>
      {splitInlineCode(text).map((part, i) =>
        part.code ? (
          <code
            key={i}
            className="rounded-[3px] bg-surface-2 px-1 py-px font-mono text-[1em] [font-size-adjust:ex-height_0.52] text-ink"
          >
            {part.text}
          </code>
        ) : (
          part.text
        ),
      )}
    </>
  );
}
