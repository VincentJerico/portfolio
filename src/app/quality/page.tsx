import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { RunSuiteButton } from '@/components/runner/RunSuiteButton';

export const metadata: Metadata = pageMetadata({
  title: 'Quality',
  description: 'How this site is tested: the quality gates it must pass and the latest CI results.',
  path: '/quality',
});

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
