import type { Metadata } from 'next';
import { RunSuiteButton } from '@/components/runner/RunSuiteButton';

export const metadata: Metadata = { title: 'Quality' };

export default function QualityPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1>Quality</h1>
      <div>
        <RunSuiteButton />
      </div>
    </div>
  );
}
