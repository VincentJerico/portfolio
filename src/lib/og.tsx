import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';

// Social cards (spec 9): dark control-panel style, name, page title and one line (a metric or hook).
export const OG_SIZE = { width: 1200, height: 630 };

const font = (pkg: string, file: string) =>
  readFile(join(process.cwd(), 'node_modules/@fontsource', pkg, 'files', file));

// The OG renderer reads woff, not woff2; Departure Mono's woff ships beside its woff2 in src/fonts.
const fonts = Promise.all([
  font('host-grotesk', 'host-grotesk-latin-400-normal.woff'),
  font('host-grotesk', 'host-grotesk-latin-700-normal.woff'),
  readFile(join(process.cwd(), 'src/fonts/departure-mono/DepartureMono-Regular.woff')),
  font('host-grotesk', 'host-grotesk-latin-800-normal.woff'),
]);

// Dark theme tokens (src/styles/tokens.css).
const C = {
  bg: '#0B0F14',
  surface: '#10161F',
  border: '#243246',
  text: '#E6EDF3',
  muted: '#9AA4AF',
  accent: '#58A6FF',
};

export async function renderOgImage({
  kicker,
  title,
  line,
}: {
  kicker: string;
  title: string;
  line: string;
}) {
  const [sans, sansBold, mono, display] = await fonts;
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: C.bg,
        padding: 56,
        fontFamily: 'Host Grotesk',
        color: C.text,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          fontFamily: 'Departure Mono',
          fontSize: 22,
          color: C.muted,
        }}
      >
        <div style={{ width: 12, height: 12, borderRadius: 999, background: C.accent }} />
        <div style={{ display: 'flex' }}>{kicker}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div
          style={{
            display: 'flex',
            fontFamily: 'Host Grotesk',
            fontWeight: 800,
            fontSize: 80,
            lineHeight: 1,
            letterSpacing: -1,
            wordBreak: 'break-word',
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 30,
            lineHeight: 1.35,
            color: C.muted,
            maxWidth: 1000,
          }}
        >
          {line}
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: `1px solid ${C.border}`,
          paddingTop: 24,
          fontFamily: 'Departure Mono',
          fontSize: 22,
          color: C.muted,
        }}
      >
        <div
          style={{ display: 'flex', color: C.text, fontFamily: 'Host Grotesk', fontWeight: 700 }}
        >
          Vincent Jerico Alcuran
        </div>
        <div style={{ display: 'flex' }}>Software QA/QC Engineer · path to SDET</div>
      </div>
    </div>,
    {
      ...OG_SIZE,
      fonts: [
        { name: 'Host Grotesk', data: sans, weight: 400, style: 'normal' },
        { name: 'Host Grotesk', data: sansBold, weight: 700, style: 'normal' },
        { name: 'Host Grotesk', data: display, weight: 800, style: 'normal' },
        { name: 'Departure Mono', data: mono, weight: 400, style: 'normal' },
      ],
    },
  );
}
