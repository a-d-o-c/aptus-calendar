'use client';

import { useState } from 'react';
import {
  getAptusDate,
  MONTHS,
  SEASON_COLORS,
  WEEK_PHASES,
  WEEK_PHASE_SEASON,
  type AptusDate,
} from '@/lib/aptus';
import { nextCelebration, timingLabel } from '@/lib/celebrations';
import RenameRing from './RenameRing';
import Subscribe from './Subscribe';
import { useHemisphere } from '@/lib/hemisphere-context';
import { useTabNav } from '@/lib/tab-context';
import { useIsMobile } from '@/lib/use-mobile';
import { useNow, useToday } from '@/lib/use-today';

// ── Three ideas, each a picture first and a sentence second ───────

function EqualMonthsGlyph() {
  return (
    <svg viewBox="0 0 120 44" width="120" height="44" aria-hidden>
      {MONTHS.map((m, i) => (
        <rect key={m.name} x={i * 8.6} y={6} width={6} height={32} rx={1} fill={m.color} opacity={0.85} />
      ))}
      <circle cx={13 * 8.6 + 3} cy={22} r={2.2} fill="#a080b8" />
    </svg>
  );
}

function EquinoxGlyph() {
  return (
    <svg viewBox="0 0 120 44" width="120" height="44" aria-hidden>
      <path d="M 36 34 A 24 24 0 0 1 84 34" fill="none" stroke="#2d2e2b" strokeWidth={1} strokeDasharray="2 3" />
      <line x1={14} y1={34} x2={106} y2={34} stroke="#8a7460" strokeWidth={1} />
      <circle cx={60} cy={34} r={9} fill={SEASON_COLORS.spring.primary} />
      <rect x={50} y={34} width={20} height={10} fill="#121110" />
      <line x1={60} y1={6} x2={60} y2={18} stroke="#c0a880" strokeWidth={1} />
    </svg>
  );
}

function SmallYearGlyph() {
  return (
    <svg viewBox="0 0 120 44" width="120" height="44" aria-hidden>
      {WEEK_PHASES.map((w, i) => (
        <g key={w}>
          {Array.from({ length: 7 }, (_, d) => (
            <rect
              key={d}
              x={4 + i * 29 + (d % 4) * 6.4}
              y={10 + Math.floor(d / 4) * 13}
              width={4.6} height={10} rx={0.8}
              fill={SEASON_COLORS[WEEK_PHASE_SEASON[w]].primary}
              opacity={0.85}
            />
          ))}
        </g>
      ))}
    </svg>
  );
}

const IDEAS = [
  {
    glyph: <EqualMonthsGlyph />,
    title: 'Thirteen equal months',
    line: 'Twenty-eight days each, exactly four weeks. One day, Otium, sits outside the count.',
  },
  {
    glyph: <EquinoxGlyph />,
    title: 'The year opens at the equinox',
    line: 'Day one is the spring equinox, when light starts to outlast the dark.',
  },
  {
    glyph: <SmallYearGlyph />,
    title: 'Every month is a small year',
    line: 'Orient, Engage, Release, Integrate. Four weeks that rehearse the four seasons.',
  },
];

function Ideas({ isMobile }: { isMobile: boolean }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
      gap: isMobile ? '2.25rem' : '2rem',
    }}>
      {IDEAS.map(idea => (
        <div key={idea.title} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ height: 44, display: 'flex', alignItems: 'center' }}>{idea.glyph}</div>
          <div style={{
            fontFamily: 'var(--font-cormorant)', fontSize: '1.35rem', fontWeight: 400,
            color: '#ede8de', marginTop: '1rem', lineHeight: 1.15,
          }}>
            {idea.title}
          </div>
          <p style={{
            fontFamily: 'var(--font-libre)', fontSize: '0.86rem', lineHeight: 1.65,
            color: '#9a8870', marginTop: '0.5rem', maxWidth: 260,
          }}>
            {idea.line}
          </p>
        </div>
      ))}
    </div>
  );
}

function PillLink({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'transparent', border: '1px solid #2d2e2b', borderRadius: 99,
        padding: '0.55rem 1.3rem', cursor: 'pointer',
        fontFamily: 'var(--font-dm-mono)', fontSize: '0.62rem', letterSpacing: '0.12em',
        textTransform: 'uppercase', color: '#c0a880',
        transition: 'border-color 0.2s, color 0.2s',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = '#8a7460'; e.currentTarget.style.color = '#ede8de'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#2d2e2b'; e.currentTarget.style.color = '#c0a880'; }}
    >
      {children}
    </button>
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

  const month = result && !result.isOutsideCount ? MONTHS.find(m => m.name === result.month) : null;

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
        What month were you really born in?
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
          {result.isOutsideCount ? (
            <>
              <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2rem', fontWeight: 400, color: '#a080b8', lineHeight: 1 }}>{result.day}</div>
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
  const today = useToday(hemisphere);
  const now = useNow();
  const nav = useTabNav();
  const isMobile = useIsMobile();

  const divider = { borderTop: '1px solid #2d2e2b', paddingTop: isMobile ? '2.75rem' : '3.5rem' };

  return (
    <div style={{ height: '100%', overflowY: 'auto', overflowX: 'hidden' }}>
      <div style={{
        maxWidth: 760,
        margin: '0 auto',
        padding: isMobile ? '2.25rem 1rem 4rem' : '3.25rem 2rem 6rem',
        textAlign: 'center',
      }}>

        {/* ── Hero: the months, renamed ── */}
        {today && now
          ? <RenameRing today={today} now={now} isMobile={isMobile} />
          // Hold the hero's space until the clock and hemisphere resolve on the client.
          : <div style={{ height: isMobile ? 560 : 820 }} />}

        {/* ── Three ideas ── */}
        <div style={{ ...divider, marginTop: isMobile ? '3rem' : '4rem' }}>
          <Ideas isMobile={isMobile} />
          <div style={{
            fontFamily: 'var(--font-dm-mono)', fontSize: '0.58rem', letterSpacing: '0.16em',
            textTransform: 'uppercase', color: '#6a5c4c', marginTop: isMobile ? '2.25rem' : '2.75rem',
          }}>
            Optional · runs alongside the calendar you already use · no belief required
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1.5rem' }}>
            <PillLink onClick={() => nav('year')}>See the whole year →</PillLink>
            <PillLink onClick={() => nav('about')}>Why Aptus →</PillLink>
          </div>
        </div>

        {/* ── Next celebration ── */}
        {today && (
          <div style={{ marginTop: isMobile ? '3rem' : '4rem' }}>
            <CelebrationCountdown info={today} isMobile={isMobile} onOpen={() => nav('celebrations')} />
          </div>
        )}

        {/* ── Birthday finder ── */}
        <div style={{ ...divider, marginTop: isMobile ? '3rem' : '4rem' }}>
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
