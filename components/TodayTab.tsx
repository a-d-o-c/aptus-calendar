'use client';

import { useEffect, useState } from 'react';
import { moonPhase } from '@/lib/moon';
import {
  getAptusDate,
  yearLength,
  formatGregorian,
  MONTHS,
  SEASON_COLORS,
  WEEK_PHASE_DESC,
  type AptusDate,
  type Season,
  type WeekPhase,
} from '@/lib/aptus';
import { useHemisphere } from '@/lib/hemisphere-context';
import { useIsMobile } from '@/lib/use-mobile';

const SEASON_LABELS: Record<Season, string> = {
  spring: 'Spring',
  summer: 'Summer',
  autumn: 'Autumn',
  winter: 'Winter',
};

function YearArc({ dayOfYear, total, season, size = 106 }: { dayOfYear: number; total: number; season: Season | null; size?: number }) {
  const pct = dayOfYear / total;
  const color = season ? SEASON_COLORS[season].primary : '#8a7460';
  const r = size * 0.415;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct);
  const dotAngleDeg = pct * 360 - 90;
  const dotRad = (dotAngleDeg * Math.PI) / 180;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" style={{ flexShrink: 0 }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#232322" strokeWidth="1.5" />
      <circle
        cx={cx} cy={cy} r={r}
        fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset}
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: 'stroke-dashoffset 1s ease, stroke 0.6s ease' }}
      />
      <circle
        cx={cx + r * Math.cos(dotRad)} cy={cy + r * Math.sin(dotRad)}
        r={size * 0.033} fill={color}
        style={{ transition: 'fill 0.6s ease' }}
      />
      <text x={cx} y={cy - 4} textAnchor="middle" fill="#8a7460" fontSize={size * 0.075} fontFamily="var(--font-dm-mono)" letterSpacing="0.05em">DAY</text>
      <text x={cx} y={cy + size * 0.13} textAnchor="middle" fill="#ede8de" fontSize={size * 0.15} fontFamily="var(--font-dm-mono)">{dayOfYear}</text>
    </svg>
  );
}

export default function TodayTab() {
  const { hemisphere } = useHemisphere();
  const [info, setInfo] = useState<AptusDate | null>(null);
  const [greg, setGreg] = useState('');
  const [moon, setMoon] = useState('');
  const isMobile = useIsMobile();

  useEffect(() => {
    function refresh() {
      const now = new Date();
      setInfo(getAptusDate(now, hemisphere));
      setGreg(formatGregorian(now));
      setMoon(moonPhase(now).toLowerCase());
    }
    refresh();
    const id = setInterval(refresh, 60_000);
    return () => clearInterval(id);
  }, [hemisphere]);

  if (!info) return null;

  const season = info.season;
  const colors = season ? SEASON_COLORS[season] : null;
  const glow = colors?.glow ?? 'transparent';
  const monthData = info.month ? MONTHS.find(m => m.name === info.month) : null;
  const accent = monthData?.color ?? colors?.primary ?? '#8a7460';

  if (isMobile) {
    return (
      <div style={{
        height: '100%',
        overflowY: 'auto',
        position: 'relative',
        padding: '2rem 1.25rem',
      }}>
        <div aria-hidden="true" style={{
          position: 'fixed', inset: 0, pointerEvents: 'none',
          background: `radial-gradient(ellipse 70% 40% at 50% 0%, ${glow}, transparent)`,
          transition: 'background 1.2s ease',
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 480, margin: '0 auto' }}>

          {/* Season + arc row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              {season && (
                <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '0.58rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: accent, marginBottom: '0.3rem' }}>
                  {SEASON_LABELS[season]}
                </div>
              )}
              <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '0.62rem', color: '#8a7460', letterSpacing: '0.08em' }}>{greg}</div>
            </div>
            <YearArc dayOfYear={info.dayOfYear} total={yearLength(info.year)} season={info.season} size={84} />
          </div>

          {/* Big date */}
          {info.isOutsideCount ? (
            <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(3.5rem, 18vw, 5rem)', fontWeight: 300, lineHeight: 0.9, color: '#ede8de', fontStyle: 'italic', marginBottom: '1rem' }}>
              {info.day}
            </h1>
          ) : (
            <div style={{ marginBottom: '1rem' }}>
              <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(3.5rem, 18vw, 5rem)', fontWeight: 300, lineHeight: 0.88, letterSpacing: '-0.02em', color: '#ede8de' }}>
                {info.month}
              </h1>
              <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(2rem, 12vw, 3rem)', fontWeight: 300, color: accent, lineHeight: 1, transition: 'color 0.6s ease' }}>
                {info.dayInMonth}
              </div>
            </div>
          )}

          <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '0.62rem', color: '#9a8870', letterSpacing: '0.14em', marginBottom: '0.45rem' }}>
            {info.year} NE · {Math.round((info.dayOfYear / yearLength(info.year)) * 100)}% through the year
          </div>

          {/* The moon is its own layer — Aptus doesn't track it, it just doesn't ignore it. */}
          <div
            title="Aptus months are 28 days and the moon's are 29.5, so the two drift apart. Shown as its own cycle, not part of the count."
            style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '0.58rem', color: '#8a7460', letterSpacing: '0.14em', marginBottom: '1rem' }}
          >
            Moon · {moon}
          </div>

          {!info.isOutsideCount && (
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
              {[info.weekPhase, `Week ${(info.weekIndex ?? 0) + 1} of 4`, info.monthFocus].map(tag => (
                <span key={String(tag)} style={{ padding: '0.3rem 0.75rem', border: '1px solid #2d2e2b', borderRadius: 99, fontFamily: 'var(--font-dm-mono)', fontSize: '0.62rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9a8870', background: '#1d1d1c' }}>
                  {tag}
                </span>
              ))}
            </div>
          )}

          {!info.isOutsideCount && info.weekPhase && (
            <p style={{ fontFamily: 'var(--font-libre)', fontStyle: 'italic', fontSize: '0.95rem', color: '#c0a880', lineHeight: 1.7, borderLeft: `2px solid ${accent}`, paddingLeft: '1rem', marginBottom: '1rem' }}>
              {WEEK_PHASE_DESC[info.weekPhase as WeekPhase]}
            </p>
          )}

          {monthData && (
            <p style={{ fontFamily: 'var(--font-libre)', fontSize: '0.9rem', color: '#9a8870', lineHeight: 1.75 }}>
              {monthData.intent}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem 2rem' }}>
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `radial-gradient(ellipse 55% 45% at 10% 15%, ${glow}, transparent), radial-gradient(ellipse 55% 45% at 90% 85%, ${glow}, transparent)`,
        transition: 'background 1.2s ease',
      }} />

      <div style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center', width: '100%', maxWidth: 900 }}>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {season && (
            <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '0.58rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: accent, transition: 'color 0.6s ease' }}>
              {SEASON_LABELS[season]}
            </div>
          )}
          {info.isOutsideCount ? (
            <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(3.5rem, 8vw, 6.5rem)', fontWeight: 300, lineHeight: 0.9, color: '#ede8de', fontStyle: 'italic' }}>{info.day}</h1>
          ) : (
            <div>
              <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(3.5rem, 8vw, 6.5rem)', fontWeight: 300, lineHeight: 0.88, letterSpacing: '-0.02em', color: '#ede8de' }}>{info.month}</h1>
              <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 300, color: accent, lineHeight: 1, marginTop: '0.1em', transition: 'color 0.6s ease' }}>{info.dayInMonth}</div>
            </div>
          )}
          <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '0.62rem', color: '#9a8870', letterSpacing: '0.14em' }}>{info.year} NE</div>
          {!info.isOutsideCount && (
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {[info.weekPhase, `Week ${(info.weekIndex ?? 0) + 1} of 4`, info.monthFocus].map(tag => (
                <span key={String(tag)} style={{ padding: '0.25rem 0.7rem', border: '1px solid #2d2e2b', borderRadius: 99, fontFamily: 'var(--font-dm-mono)', fontSize: '0.64rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9a8870', background: '#1d1d1c' }}>{tag}</span>
              ))}
            </div>
          )}
          <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '0.64rem', color: '#8a7460', letterSpacing: '0.08em' }}>{greg}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <YearArc dayOfYear={info.dayOfYear} total={yearLength(info.year)} season={info.season} />
            <div>
              <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '0.62rem', color: '#8a7460', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Year {info.year} NE</div>
              <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '0.7rem', color: '#ede8de' }}>{Math.round((info.dayOfYear / yearLength(info.year)) * 100)}% complete</div>
            </div>
          </div>
          {!info.isOutsideCount && info.weekPhase && (
            <p style={{ fontFamily: 'var(--font-libre)', fontStyle: 'italic', fontSize: '0.92rem', color: '#c0a880', lineHeight: 1.7, borderLeft: `2px solid ${accent}`, paddingLeft: '1rem', transition: 'border-color 0.6s ease' }}>
              {WEEK_PHASE_DESC[info.weekPhase as WeekPhase]}
            </p>
          )}
          {monthData && (
            <p style={{ fontFamily: 'var(--font-libre)', fontSize: '0.95rem', color: '#9a8870', lineHeight: 1.75 }}>{monthData.intent}</p>
          )}
        </div>
      </div>
    </div>
  );
}
