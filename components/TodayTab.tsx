'use client';

import { useEffect, useState } from 'react';
import {
  getAptusDate,
  formatGregorian,
  MONTHS,
  SEASON_COLORS,
  WEEK_PHASE_DESC,
  type AptusDate,
  type Season,
  type WeekPhase,
} from '@/lib/aptus';
import { useHemisphere } from '@/lib/hemisphere-context';

const SEASON_LABELS: Record<Season, string> = {
  spring: 'Spring',
  summer: 'Summer',
  autumn: 'Autumn',
  winter: 'Winter',
};

function YearArc({ dayOfYear, season }: { dayOfYear: number; season: Season | null }) {
  const pct = dayOfYear / 365;
  const color = season ? SEASON_COLORS[season].primary : '#3d3830';
  const r = 44;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct);
  const dotAngleDeg = pct * 360 - 90;
  const dotRad = (dotAngleDeg * Math.PI) / 180;

  return (
    <svg width="106" height="106" viewBox="0 0 106 106" aria-hidden="true" style={{ flexShrink: 0 }}>
      <circle cx="53" cy="53" r={r} fill="none" stroke="#1e1b18" strokeWidth="1.5" />
      <circle
        cx="53" cy="53" r={r}
        fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset}
        transform="rotate(-90 53 53)"
        style={{ transition: 'stroke-dashoffset 1s ease, stroke 0.6s ease' }}
      />
      <circle
        cx={53 + r * Math.cos(dotRad)} cy={53 + r * Math.sin(dotRad)}
        r="3.5" fill={color}
        style={{ transition: 'fill 0.6s ease' }}
      />
      <text x="53" y="49" textAnchor="middle" fill="#3d3830" fontSize="8" fontFamily="var(--font-dm-mono)" letterSpacing="0.05em">DAY</text>
      <text x="53" y="64" textAnchor="middle" fill="#f0ede8" fontSize="16" fontFamily="var(--font-dm-mono)">{dayOfYear}</text>
    </svg>
  );
}

export default function TodayTab() {
  const { hemisphere } = useHemisphere();
  const [info, setInfo] = useState<AptusDate | null>(null);
  const [greg, setGreg] = useState('');

  useEffect(() => {
    function refresh() {
      const now = new Date();
      setInfo(getAptusDate(now, hemisphere));
      setGreg(formatGregorian(now));
    }
    refresh();
    const id = setInterval(refresh, 60_000);
    return () => clearInterval(id);
  }, [hemisphere]);

  if (!info) return null;

  const season = info.season;
  const colors = season ? SEASON_COLORS[season] : null;
  const glow = colors?.glow ?? 'transparent';
  const accent = colors?.primary ?? '#3d3830';
  const monthData = info.month ? MONTHS.find(m => m.name === info.month) : null;

  return (
    <div style={{
      height: '100%',
      overflow: 'hidden',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem 2rem',
    }}>
      {/* Atmospheric glow */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `radial-gradient(ellipse 55% 45% at 10% 15%, ${glow}, transparent),
                     radial-gradient(ellipse 55% 45% at 90% 85%, ${glow}, transparent)`,
        transition: 'background 1.2s ease',
      }} />

      {/* Two-column layout */}
      <div style={{
        position: 'relative', zIndex: 1,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '4rem',
        alignItems: 'center',
        width: '100%',
        maxWidth: 900,
      }}>

        {/* ── Left: Date display ─────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {season && (
            <div style={{
              fontFamily: 'var(--font-dm-mono)',
              fontSize: '0.58rem',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: accent,
              transition: 'color 0.6s ease',
            }}>
              {SEASON_LABELS[season]}
            </div>
          )}

          {info.isLacuna ? (
            <h1 style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: 'clamp(3.5rem, 8vw, 6.5rem)',
              fontWeight: 300,
              lineHeight: 0.9,
              color: '#f0ede8',
              fontStyle: 'italic',
            }}>
              Lacuna
            </h1>
          ) : (
            <div>
              <h1 style={{
                fontFamily: 'var(--font-cormorant)',
                fontSize: 'clamp(3.5rem, 8vw, 6.5rem)',
                fontWeight: 300,
                lineHeight: 0.88,
                letterSpacing: '-0.02em',
                color: '#f0ede8',
              }}>
                {info.month}
              </h1>
              <div style={{
                fontFamily: 'var(--font-cormorant)',
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                fontWeight: 300,
                color: accent,
                lineHeight: 1,
                marginTop: '0.1em',
                transition: 'color 0.6s ease',
              }}>
                {info.dayInMonth}
              </div>
            </div>
          )}

          <div style={{
            fontFamily: 'var(--font-dm-mono)',
            fontSize: '0.62rem',
            color: '#4d4740',
            letterSpacing: '0.14em',
          }}>
            {info.year} NE
          </div>

          {/* Tags */}
          {!info.isLacuna && (
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {[info.weekPhase, `Week ${(info.weekIndex ?? 0) + 1} of 4`, info.monthFocus].map(tag => (
                <span key={String(tag)} style={{
                  padding: '0.25rem 0.7rem',
                  border: '1px solid #2e2924',
                  borderRadius: 99,
                  fontFamily: 'var(--font-dm-mono)',
                  fontSize: '0.57rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#4d4740',
                  background: '#1a1816',
                }}>
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div style={{
            fontFamily: 'var(--font-dm-mono)',
            fontSize: '0.57rem',
            color: '#2e2924',
            letterSpacing: '0.08em',
          }}>
            {greg}
          </div>
        </div>

        {/* ── Right: Arc + descriptions ──────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <YearArc dayOfYear={info.dayOfYear} season={info.season} />
            <div>
              <div style={{
                fontFamily: 'var(--font-dm-mono)',
                fontSize: '0.55rem',
                color: '#3d3830',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '0.3rem',
              }}>
                Year {info.year} NE
              </div>
              <div style={{
                fontFamily: 'var(--font-dm-mono)',
                fontSize: '0.7rem',
                color: '#f0ede8',
              }}>
                {Math.round((info.dayOfYear / 365) * 100)}% complete
              </div>
            </div>
          </div>

          {!info.isLacuna && info.weekPhase && (
            <p style={{
              fontFamily: 'var(--font-libre)',
              fontStyle: 'italic',
              fontSize: '0.92rem',
              color: '#7a7368',
              lineHeight: 1.7,
              borderLeft: `2px solid ${accent}`,
              paddingLeft: '1rem',
              transition: 'border-color 0.6s ease',
            }}>
              {WEEK_PHASE_DESC[info.weekPhase as WeekPhase]}
            </p>
          )}

          {monthData && (
            <p style={{
              fontFamily: 'var(--font-libre)',
              fontSize: '0.85rem',
              color: '#4d4740',
              lineHeight: 1.75,
            }}>
              {monthData.intent}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
