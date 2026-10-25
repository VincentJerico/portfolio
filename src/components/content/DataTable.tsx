import type { ReactNode } from 'react';
import { InlineCode } from '@/components/ui/InlineCode';

interface DataTableProps {
  caption: string;
  columns: readonly string[];
  rows: readonly (readonly (string | ReactNode)[])[];
}

/** Table that scrolls inside its own focusable region on narrow screens, never the page. */
export function DataTable({ caption, columns, rows }: DataTableProps) {
  return (
    <div
      role="region"
      aria-label={caption}
      tabIndex={0}
      className="overflow-x-auto rounded-card border border-line bg-surface"
    >
      <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
        <caption className="label-mono border-b border-line px-4 py-3 text-left text-ink-muted">
          {caption}
        </caption>
        <thead className="bg-surface-2">
          <tr>
            {columns.map((column) => (
              <th
                key={column}
                scope="col"
                className="px-4 py-2.5 font-mono text-xs font-medium text-ink-muted"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((row, r) => (
            <tr key={r}>
              {row.map((cell, c) => (
                <td key={c} className="px-4 py-3 align-top text-ink">
                  {typeof cell === 'string' ? <InlineCode text={cell} /> : cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
