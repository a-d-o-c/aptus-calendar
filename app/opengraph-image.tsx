import { ImageResponse } from 'next/og';
import { MONTHS } from '@/lib/aptus';

export const alt = 'Aptus — thirteen months of twenty-eight days, anchored to the equinox';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Satori has no access to the app's webfonts, so this card is built from the
// palette and the month colours rather than the display typeface.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#121110',
          padding: '72px',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 86,
            letterSpacing: 38,
            color: '#ede8de',
            // The wordmark is letterspaced, which pads the right edge; offset it
            // by half so the text still reads as optically centred.
            paddingLeft: 38,
          }}
        >
          APTUS
        </div>

        <div style={{ display: 'flex', width: 420, height: 1, background: '#2d2e2b', margin: '44px 0' }} />

        <div
          style={{
            display: 'flex',
            fontSize: 30,
            color: '#9a8870',
            textAlign: 'center',
            lineHeight: 1.5,
            maxWidth: 760,
          }}
        >
          Thirteen months of twenty-eight days, anchored to the equinox.
        </div>

        {/* The year as its thirteen months, in season order. */}
        <div style={{ display: 'flex', width: '100%', marginTop: 84, gap: 4 }}>
          {MONTHS.map(month => (
            <div key={month.name} style={{ display: 'flex', flex: 1, height: 14, background: month.color }} />
          ))}
        </div>

        <div
          style={{
            display: 'flex',
            width: '100%',
            justifyContent: 'space-between',
            marginTop: 22,
            fontSize: 20,
            letterSpacing: 4,
            color: '#8a7460',
          }}
        >
          <div style={{ display: 'flex' }}>VERNA 1 · EQUINOX</div>
          <div style={{ display: 'flex' }}>NATURAL ERA</div>
        </div>
      </div>
    ),
    size,
  );
}
