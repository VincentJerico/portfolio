import type { Finding } from '@/content/schema';
import { SeverityChip } from '@/components/ui/SeverityChip';
import { DataTable } from './DataTable';

export function FindingsTable({ findings }: { findings: readonly Finding[] }) {
  return (
    <DataTable
      caption="Findings index"
      columns={['ID', 'Issue', 'Reference', 'Severity']}
      rows={findings.map((f) => [
        <a key="id" href={`#ticket-${f.id}`} className="font-mono whitespace-nowrap">
          {f.id}
        </a>,
        f.title,
        f.reference ?? '',
        <SeverityChip key="sev" severity={f.severity} />,
      ])}
    />
  );
}
