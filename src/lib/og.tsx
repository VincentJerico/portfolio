import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';

// Social cards (spec 9): dark control-panel style, name, page title and one line (a metric or hook).
export const OG_SIZE = { width: 1200, height: 630 };

const font = (pkg: string, file: string) =>
  readFile(join(process.cwd(), 'node_modules/@fontsource', pkg, 'files', file));

const fonts = Promise.all([
  font('ibm-plex-sans', 'ibm-plex-sans-latin-400-normal.woff'),
  font('ibm-plex-sans', 'ibm-plex-sans-latin-600-normal.woff'),
  font('ibm-plex-mono', 'ibm-plex-mono-latin-500-normal.woff'),
  font('instrument-serif', 'instrument-serif-latin-400-normal.woff'),
]);

// Dark theme tokens (src/styles/tokens.css).
const C = {
  bg: '#0B0F14',
  surface: '#11161D',
  border: '#232B36',
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
  const [sans, sansBold, mono, serif] = await fonts;
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
        fontFamily: 'Plex Sans',
        color: C.text,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          fontFamily: 'Plex Mono',
          fontSize: 22,
          color: C.muted,
        }}
      >
        <div style={{ width: 12, height: 12, borderRadius: 999, background: C.accent }} />
        <div style={{ display: 'flex', textTransform: 'uppercase', letterSpacing: 1 }}>
          {kicker}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div
          style={{
            display: 'flex',
            fontFamily: 'Instrument Serif',
            fontSize: 84,
            lineHeight: 1.05,
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
          fontFamily: 'Plex Mono',
          fontSize: 22,
          color: C.muted,
        }}
      >
        <div style={{ display: 'flex', color: C.text, fontFamily: 'Plex Sans', fontWeight: 600 }}>
          Vincent Jerico Alcuran
        </div>
        <div style={{ display: 'flex' }}>Software QA/QC Engineer · path to SDET</div>
      </div>
    </div>,
    {
      ...OG_SIZE,
      fonts: [
        { name: 'Plex Sans', data: sans, weight: 400, style: 'normal' },
        { name: 'Plex Sans', data: sansBold, weight: 600, style: 'normal' },
        { name: 'Plex Mono', data: mono, weight: 500, style: 'normal' },
        { name: 'Instrument Serif', data: serif, weight: 400, style: 'normal' },
      ],
    },
  );
}
