'use client';

import { useEffect, useState } from 'react';
import {
  getAptusDate,
  formatGregorian,
  MONTHS,
  SEASON_COLORS,
  type AptusDate,
} from '@/lib/aptus';
import { nextCelebration, timingLabel } from '@/lib/celebrations';
import Subscribe from './Subscribe';
import { useHemisphere } from '@/lib/hemisphere-context';
import { useTabNav } from '@/lib/tab-context';
import { useIsMobile } from '@/lib/use-mobile';

const COMPARISON_ROWS = [
  { greg: '12 months, 28–31 days each',        aptus: '13 months × 28 days exactly'          },
  { greg: 'Year begins January 1',              aptus: 'Year begins at spring equinox'         },
  { greg: 'No weekly phase structure',          aptus: 'Orient · Engage · Release · Integrate' },
  { greg: 'Designed for Northern Hemisphere',   aptus: 'Southern Hemisphere default'           },
  { greg: '2026 CE',                            aptus: '12026 NE — Natural Era'                },
];

function MonoLabel({ children, color = '#8a7460' }: { children: React.ReactNode; color?: string }) {
  return (
    <div style={{
      fontFamily: 'var(--font-dm-mono)', fontSize: '0.62rem', letterSpacing: '0.25em',
      textTransform: 'uppercase', color,
    }}>
      {children}
    </div>
  );
}

// ── Hero: the live date ───────────────────────────────────────────
// Rendered only once the client effect has run, so the static prerender
// and the first client paint agree.

function TodayHero({ info, now, isMobile }: { info: AptusDate; now: Date; isMobile: boolean }) {
  const month = info.isOtium ? null : MONTHS.find(m => m.name === info.month) ?? null;
  const accent = month?.color ?? '#b8c8c8';
  const glow = info.season ? SEASON_COLORS[info.season].glow : 'rgba(184, 200, 200, 0.14)';

  const meta = info.isOtium
    ? [`${info.year} NE`, 'Outside the count']
    : [`${info.year} NE`, info.weekPhase, month?.focus].filter(Boolean) as string[];

  return (
    <section style={{ position: 'relative', marginBottom: isMobile ? '1.75rem' : '2.25rem' }}>
      <div
        aria-hidden
        style={{
          position: 'absolute', inset: '-15% -20% -10%',
          background: `radial-gradient(ellipse 55% 65% at 50% 42%, ${glow}, transparent 72%)`,
          pointerEvents: 'none',
        }}
      />
      <div style={{ position: 'relative' }}>
        <MonoLabel>Today</MonoLabel>

        <h1 style={{
          fontFamily: 'var(--font-cormorant)',
          fontSize: isMobile ? 'clamp(2.9rem, 13vw, 4rem)' : 'clamp(3.4rem, 7vw, 5.5rem)',
          fontWeight: 300,
          lineHeight: 1,
          letterSpacing: '-0.015em',
          color: '#ede8de',
          margin: '0.9rem 0 0',
        }}>
          {info.isOtium ? 'Otium' : `${info.month} ${info.dayInMonth}`}
        </h1>

        <div style={{
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          flexWrap: 'wrap', gap: '0.6rem',
          fontFamily: 'var(--font-dm-mono)', fontSize: '0.66rem',
          letterSpacing: '0.14em', textTransform: 'uppercase',
          color: accent, marginTop: '0.9rem',
        }}>
          {meta.map((part, i) => (
            <span key={part} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              {i > 0 && <span style={{ color: '#2d2e2b' }}>·</span>}
              {part}
            </span>
          ))}
        </div>

        <div style={{
          width: 48, height: 1, background: accent, opacity: 0.5,
          margin: '1.4rem auto',
        }} />

        <p style={{
          fontFamily: 'var(--font-libre)', fontStyle: 'italic',
          fontSize: isMobile ? '0.95rem' : '1.02rem',
          color: '#c0a880', lineHeight: 1.75,
          maxWidth: 500, margin: '0 auto',
        }}>
          {info.isOtium
            ? 'No month, no week, no number. The only day of the year that asks nothing of you — on purpose.'
            : month?.intent}
        </p>

        <div style={{
          fontFamily: 'var(--font-dm-mono)', fontSize: '0.62rem',
          letterSpacing: '0.08em', color: '#8a7460', marginTop: '1.25rem',
        }}>
          {formatGregorian(now)}
        </div>
      </div>
    </section>
  );
}

// ── Countdown to the nearest celebration ──────────────────────────

function CelebrationCountdown({
  info, isMobile, onOpen,
}: {
  info: AptusDate;           // carries its own hemisphere
  isMobile: boolean;
  onOpen: () => void;
}) {
  const upcoming = nextCelebration(info);
  if (!upcoming) return null;

  const { celebration: cel, daysAway } = upcoming;
  const isToday = daysAway === 0;
  const when = timingLabel(info, cel);

  return (
    <button
      onClick={onOpen}
      style={{
        width: '100%', textAlign: 'left', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: '1rem',
        background: isToday ? `${cel.color}1a` : '#1d1d1c',
        border: `1px solid ${isToday ? cel.color : '#2d2e2b'}`,
        borderLeft: `3px solid ${cel.color}`,
        borderRadius: 6,
        padding: isMobile ? '1rem 1.1rem' : '1.15rem 1.4rem',
        transition: 'border-color 0.2s, background 0.2s',
      }}
      onMouseEnter={e => { if (!isToday) e.currentTarget.style.borderColor = '#8a7460'; }}
      onMouseLeave={e => { if (!isToday) e.currentTarget.style.borderColor = '#2d2e2b'; }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontFamily: 'var(--font-dm-mono)', fontSize: '0.58rem', letterSpacing: '0.18em',
          textTransform: 'uppercase', color: '#8a7460', marginBottom: '0.45rem',
        }}>
          {isToday ? (cel.days > 1 ? 'Happening now' : 'Today is') : 'Next celebration'}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', flexWrap: 'wrap' }}>
          <span style={{
            fontFamily: 'var(--font-cormorant)', fontSize: '1.6rem',
            fontWeight: 400, color: '#ede8de', lineHeight: 1.05,
          }}>
            {cel.name}
          </span>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: cel.color, flexShrink: 0 }} />
        </div>
        <div style={{
          fontFamily: 'var(--font-dm-mono)', fontSize: '0.6rem', color: '#8a7460',
          marginTop: '0.35rem', lineHeight: 1.5,
        }}>
          {when}
        </div>
      </div>

      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        {isToday ? (
          <span style={{
            fontFamily: 'var(--font-dm-mono)', fontSize: '0.6rem', letterSpacing: '0.12em',
            textTransform: 'uppercase', color: cel.color,
            border: `1px solid ${cel.color}`, borderRadius: 99, padding: '0.25rem 0.7rem',
          }}>
            Today
          </span>
        ) : (
          <>
            <div style={{
              fontFamily: 'var(--font-cormorant)', fontSize: isMobile ? '2.1rem' : '2.5rem',
              fontWeight: 300, color: cel.color, lineHeight: 1,
            }}>
              {daysAway}
            </div>
            <div style={{
              fontFamily: 'var(--font-dm-mono)', fontSize: '0.55rem', letterSpacing: '0.16em',
              textTransform: 'uppercase', color: '#8a7460', marginTop: '0.3rem',
            }}>
              {daysAway === 1 ? 'Day' : 'Days'}
            </div>
          </>
        )}
      </div>
    </button>
  );
}

// ── Birthday finder ───────────────────────────────────────────────

function BirthdayFinder({ hemisphere }: { hemisphere: 'SH' | 'NH' }) {
  const [value, setValue] = useState('');
  const [result, setResult] = useState<AptusDate | null>(null);

  function handleChange(val: string) {
    setValue(val);
    if (!val) { setResult(null); return; }
    const d = new Date(val + 'T12:00:00');
    if (isNaN(d.getTime())) { setResult(null); return; }
    setResult(getAptusDate(d, hemisphere));
  }

  const month = result && !result.isOtium ? MONTHS.find(m => m.name === result.month) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <p style={{
        fontFamily: 'var(--font-dm-mono)',
        fontSize: '0.65rem',
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: '#9a8870',
        marginBottom: '1rem',
      }}>
        Find your Aptus birthday
      </p>
      <input
        type="date"
        value={value}
        onChange={e => handleChange(e.target.value)}
        style={{
          background: '#1d1d1c',
          border: '1px solid #2d2e2b',
          borderRadius: 4,
          color: '#ede8de',
          fontFamily: 'var(--font-dm-mono)',
          fontSize: '0.9rem',
          padding: '0.6rem 1rem',
          outline: 'none',
          cursor: 'pointer',
          width: '100%',
          maxWidth: 260,
          marginBottom: '1.5rem',
        }}
      />
      {result && (
        <div style={{
          borderLeft: `2px solid ${month?.color ?? '#8a7460'}`,
          paddingLeft: '1.25rem',
          textAlign: 'left',
          maxWidth: 360,
        }}>
          {result.isOtium ? (
            <>
              <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2rem', fontWeight: 400, color: '#a080b8', lineHeight: 1 }}>Otium</div>
              <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '0.65rem', color: '#9a8870', letterSpacing: '0.08em', marginTop: '0.5rem' }}>
                {result.year} NE · Threshold day
              </div>
            </>
          ) : (
            <>
              <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2rem', fontWeight: 400, color: '#ede8de', lineHeight: 1 }}>
                {result.month} {result.dayInMonth}
              </div>
              <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '0.65rem', color: month?.color ?? '#9a8870', letterSpacing: '0.08em', marginTop: '0.4rem' }}>
                {result.year} NE · {month?.focus}
              </div>
              {month && (
                <div style={{ fontFamily: 'var(--font-libre)', fontStyle: 'italic', fontSize: '0.9rem', color: '#9a8870', lineHeight: 1.65, marginTop: '0.6rem' }}>
                  {month.intent}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function HomeTab() {
  const { hemisphere } = useHemisphere();
  const [aptusInfo, setAptusInfo] = useState<AptusDate | null>(null);
  const [now, setNow] = useState<Date | null>(null);
  const nav = useTabNav();
  const isMobile = useIsMobile();

  useEffect(() => {
    function tick() {
      const d = new Date();
      setNow(d);
      setAptusInfo(getAptusDate(d, hemisphere));
    }
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [hemisphere]);

  const aptusMonth = aptusInfo && !aptusInfo.isOtium ? MONTHS.find(m => m.name === aptusInfo.month) : null;
  const accentColor = aptusMonth?.color ?? '#4e8845';

  return (
    <div style={{ height: '100%', overflowY: 'auto', overflowX: 'hidden' }}>
      <div style={{
        maxWidth: 720,
        margin: '0 auto',
        padding: isMobile ? '2.5rem 1.25rem 4rem' : '4rem 2rem 6rem',
        textAlign: 'center',
      }}>

        {/* ── Live date + countdown ── */}
        {aptusInfo && now && (
          <>
            <TodayHero info={aptusInfo} now={now} isMobile={isMobile} />
            <div style={{ marginBottom: isMobile ? '2.5rem' : '3.5rem' }}>
              <CelebrationCountdown
                info={aptusInfo}
                isMobile={isMobile}
                onOpen={() => nav('celebrations')}
              />
            </div>
          </>
        )}

        {/* Reserve the hero's height before the client effect resolves, so the
            marketing content below doesn't jump on first paint. */}
        {!aptusInfo && <div style={{ height: isMobile ? 430 : 520 }} />}

        {/* ── Headline ── */}
        <div style={{
          borderTop: '1px solid #2d2e2b',
          paddingTop: isMobile ? '2.5rem' : '3.5rem',
          marginBottom: isMobile ? '2rem' : '2.5rem',
        }}>
          <h2 style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize: isMobile ? 'clamp(2.1rem, 8.5vw, 2.9rem)' : 'clamp(2.4rem, 5vw, 3.6rem)',
            fontWeight: 300,
            fontStyle: 'normal',
            lineHeight: 1.05,
            letterSpacing: '-0.01em',
            color: '#ede8de',
            marginBottom: '1.25rem',
          }}>
            The hidden cost<br />of calendar chaos.
          </h2>
          <p style={{
            fontFamily: 'var(--font-libre)',
            fontSize: isMobile ? '1rem' : '1.05rem',
            color: '#c0a880',
            lineHeight: 1.8,
            maxWidth: 540,
            margin: '0 auto',
          }}>
            Twelve unequal months. A year that starts on an arbitrary date. No weekly rhythm tied to anything natural.
            The cost is invisible — until you notice you&rsquo;re always slightly out of sync.
          </p>

          {/* CTA */}
          <button
            onClick={() => nav('about')}
            style={{
              marginTop: '1.5rem',
              background: 'transparent',
              border: '1px solid #2d2e2b',
              borderRadius: 99,
              padding: '0.5rem 1.25rem',
              fontFamily: 'var(--font-dm-mono)',
              fontSize: '0.62rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#c0a880',
              cursor: 'pointer',
              transition: 'border-color 0.2s, color 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#8a7460'; e.currentTarget.style.color = '#ede8de'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#2d2e2b'; e.currentTarget.style.color = '#c0a880'; }}
          >
            What is Aptus? →
          </button>
        </div>

        {/* ── VS comparison table ── */}
        <div style={{ marginBottom: isMobile ? '2.5rem' : '4rem' }}>
          {isMobile ? (
            /* Mobile: stacked cards */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ background: '#1d1d1c', border: '1px solid #2d2e2b', borderRadius: 6, overflow: 'hidden' }}>
                <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #2d2e2b', fontFamily: 'var(--font-dm-mono)', fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8a7460' }}>Gregorian</div>
                {COMPARISON_ROWS.map((row, i) => (
                  <div key={i} style={{ padding: '0.65rem 1rem', borderBottom: i < COMPARISON_ROWS.length - 1 ? '1px solid #232322' : 'none', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                    <span style={{ color: '#2d2e2b', flexShrink: 0 }}>—</span>
                    <span style={{ fontFamily: 'var(--font-libre)', fontSize: '0.9rem', color: '#9a8870', lineHeight: 1.4 }}>{row.greg}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: '#1d1d1c', border: '1px solid #2d2e2b', borderRadius: 6, overflow: 'hidden' }}>
                <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #2d2e2b', fontFamily: 'var(--font-dm-mono)', fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: accentColor }}>Aptus</div>
                {COMPARISON_ROWS.map((row, i) => (
                  <div key={i} style={{ padding: '0.65rem 1rem', borderBottom: i < COMPARISON_ROWS.length - 1 ? '1px solid #232322' : 'none', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                    <span style={{ color: accentColor, flexShrink: 0 }}>→</span>
                    <span style={{ fontFamily: 'var(--font-libre)', fontSize: '0.9rem', color: '#ede8de', lineHeight: 1.4 }}>{row.aptus}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Desktop: side-by-side table */
            <div style={{ border: '1px solid #2d2e2b', borderRadius: 6, overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 64px 1fr', background: '#121110', borderBottom: '1px solid #2d2e2b' }}>
                <div style={{ padding: '1rem 1.5rem', fontFamily: 'var(--font-dm-mono)', fontSize: '0.62rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#8a7460', textAlign: 'center' }}>Gregorian</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderLeft: '1px solid #2d2e2b', borderRight: '1px solid #2d2e2b' }}>
                  <span style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2rem', fontWeight: 300, fontStyle: 'italic', color: '#8a7460', lineHeight: 1, userSelect: 'none' }}>vs</span>
                </div>
                <div style={{ padding: '1rem 1.5rem', fontFamily: 'var(--font-dm-mono)', fontSize: '0.62rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: accentColor, textAlign: 'center' }}>Aptus</div>
              </div>
              {COMPARISON_ROWS.map((row, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 64px 1fr', borderBottom: i < COMPARISON_ROWS.length - 1 ? '1px solid #232322' : 'none', background: i % 2 === 0 ? '#1d1d1c' : '#212120' }}>
                  <div style={{ padding: '0.9rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem', textAlign: 'left' }}>
                    <span style={{ color: '#2d2e2b', flexShrink: 0, fontSize: '0.9rem' }}>—</span>
                    <span style={{ fontFamily: 'var(--font-libre)', fontSize: '0.95rem', color: '#9a8870', lineHeight: 1.4 }}>{row.greg}</span>
                  </div>
                  <div style={{ borderLeft: '1px solid #232322', borderRight: '1px solid #232322' }} />
                  <div style={{ padding: '0.9rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem', textAlign: 'left' }}>
                    <span style={{ color: accentColor, flexShrink: 0, fontSize: '0.9rem' }}>→</span>
                    <span style={{ fontFamily: 'var(--font-libre)', fontSize: '0.95rem', color: '#ede8de', lineHeight: 1.4 }}>{row.aptus}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Birthday finder ── */}
        <div style={{ borderTop: '1px solid #2d2e2b', paddingTop: '2.5rem' }}>
          <BirthdayFinder hemisphere={hemisphere} />
        </div>

        {/* ── Calendar subscription ── */}
        <div style={{ marginTop: isMobile ? '3rem' : '4rem' }}>
          <Subscribe isMobile={isMobile} />
        </div>

      </div>
    </div>
  );
}
