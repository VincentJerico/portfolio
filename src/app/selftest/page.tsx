import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

// Spec 12.3: a page with planted defects that the gate self-tests run against, to prove the gates can
// fail. It exists only in builds with E2E_SELFTEST=1 (CI's test build); production builds 404 it.
export const metadata: Metadata = {
  title: 'Gate self-test',
  robots: { index: false, follow: false },
};

export default function SelfTestPage() {
  if (process.env.E2E_SELFTEST !== '1') notFound();
  return (
    <div>
      <h1>Gate self-test</h1>
      <ul className="mt-6 flex flex-col gap-2">
        {['First', 'Second', 'Third', 'Fourth'].map((label) => (
          <li key={label}>
            <a href="#planted">{label} link under the overlay</a>
          </li>
        ))}
      </ul>
      {/* Planted defects: text far below 4.5:1 contrast, and an overlay that covers the links above
          without trapping focus, so Tab moves onto controls nobody can see (SC 2.4.11). */}
      <div
        id="planted"
        style={{ position: 'fixed', inset: 0, zIndex: 20, background: '#ffffff', padding: '2rem' }}
      >
        <p style={{ color: '#d0d0d0', background: '#ffffff' }}>Planted low-contrast text</p>
      </div>
    </div>
  );
}
