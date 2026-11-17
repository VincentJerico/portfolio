import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';

// Social cards (spec 9, C51): paper and ink, the page title set big, one line, and the name.
export const OG_SIZE = { width: 1200, height: 630 };

const font = (pkg: string, file: string) =>
  readFile(join(process.cwd(), 'node_modules/@fontsource', pkg, 'files', file));

const fonts = Promise.all([
  font('bricolage-grotesque', 'bricolage-grotesque-latin-400-normal.woff'),
  font('bricolage-grotesque', 'bricolage-grotesque-latin-700-normal.woff'),
  font('ibm-plex-mono', 'ibm-plex-mono-latin-400-normal.woff'),
  font('bricolage-grotesque', 'bricolage-grotesque-latin-800-normal.woff'),
]);

// Paper theme tokens (src/styles/tokens.css).
const C = {
  bg: '#efe9de',
  border: '#cdc3b1',
  text: '#20263a',
  muted: '#4c5163',
  accent: '#a5341e',
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
        fontFamily: 'Bricolage Grotesque',
        color: C.text,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          fontFamily: 'IBM Plex Mono',
          fontSize: 22,
          color: C.muted,
        }}
      >
        <div style={{ display: 'flex', color: C.accent }}>{kicker}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div
          style={{
            display: 'flex',
            fontFamily: 'Bricolage Grotesque',
            fontWeight: 800,
            fontSize: 88,
            lineHeight: 0.95,
            letterSpacing: -2,
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
          fontFamily: 'IBM Plex Mono',
          fontSize: 22,
          color: C.muted,
        }}
      >
        <div
          style={{
            display: 'flex',
            color: C.text,
            fontFamily: 'Bricolage Grotesque',
            fontWeight: 700,
          }}
        >
          Vincent Jerico Alcuran
        </div>
        <div style={{ display: 'flex' }}>Software QA/QC Engineer · path to SDET</div>
      </div>
    </div>,
    {
      ...OG_SIZE,
      fonts: [
        { name: 'Bricolage Grotesque', data: sans, weight: 400, style: 'normal' },
        { name: 'Bricolage Grotesque', data: sansBold, weight: 700, style: 'normal' },
        { name: 'Bricolage Grotesque', data: display, weight: 800, style: 'normal' },
        { name: 'IBM Plex Mono', data: mono, weight: 400, style: 'normal' },
      ],
    },
  );
}
