'use client';

import { useMemo, useState } from 'react';
import {
  MONTHS,
  SEASON_COLORS,
  WEEK_PHASES,
  gregDateFromAptus,
  formatGregorian,
  type Season,
} from '@/lib/aptus';
import { useHemisphere } from '@/lib/hemisphere-context';
import { useToday } from '@/lib/use-today';
import { useIsMobile } from '@/lib/use-mobile';

// ── SVG geometry ─────────────────────────────────────────────────

const CX = 240;
const CY = 240;
const R_OUT = 190;
const R_IN  = 142;
const TOTAL = 365;
const DEG_PER_DAY = 360 / TOTAL;
const GAP = 0.5;

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function lerpColor(a: string, b: string, t: number): string {
  const p = (h: string, o: number) => parseInt(h.slice(o, o + 2), 16);
  const hex = (n: number) => Math.round(n).toString(16).padStart(2, '0');
  return `#${hex(p(a,1)+(p(b,1)-p(a,1))*t)}${hex(p(a,3)+(p(b,3)-p(a,3))*t)}${hex(p(a,5)+(p(b,5)-p(a,5))*t)}`;
}

function donut(cx: number, cy: number, ro: number, ri: number, s: number, e: number): string {
  const p1 = polar(cx, cy, ro, s);
  const p2 = polar(cx, cy, ro, e);
  const p3 = polar(cx, cy, ri, e);
  const p4 = polar(cx, cy, ri, s);
  const lg = e - s > 180 ? 1 : 0;
  const f = (n: number) => n.toFixed(3);
  return [
    `M ${f(p1.x)} ${f(p1.y)}`,
    `A ${ro} ${ro} 0 ${lg} 1 ${f(p2.x)} ${f(p2.y)}`,
    `L ${f(p3.x)} ${f(p3.y)}`,
    `A ${ri} ${ri} 0 ${lg} 0 ${f(p4.x)} ${f(p4.y)}`,
    'Z',
  ].join(' ');
}

interface MonthSegment {
  index: number;
  startDeg: number;
  endDeg: number;
  midDeg: number;
  path: string;
  season: Season;
  name: string;
  focus: string;
  intent: string;
  dayStart: number;
  dayEnd: number;
}

function buildSegments(): MonthSegment[] {
  return MONTHS.map((m, i) => {
    const s = (m.start - 1) * DEG_PER_DAY + GAP / 2;
    const e = m.end * DEG_PER_DAY - GAP / 2;
    return {
      index: i,
      startDeg: s,
      endDeg: e,
      midDeg: (s + e) / 2,
      path: donut(CX, CY, R_OUT, R_IN, s, e),
      season: m.season,
      name: m.name,
      focus: m.focus,
      intent: m.intent,
      dayStart: m.start,
      dayEnd: m.end,
    };
  });
}

const SEGMENTS = buildSegments();

const OTIUM_PATH = donut(
  CX, CY, R_OUT, R_IN,
  364 * DEG_PER_DAY + GAP / 2,
  365 * DEG_PER_DAY - GAP / 2,
);

// ── Season label positions (outside ring) ────────────────────────

const SEASON_MID_DAYS: Record<Season, number> = {
  spring: 14 + 28,   // mid Cresca
  summer: 85 + 42,   // mid Arden
  autumn: 169 + 42,  // mid Valla
  winter: 253 + 56,  // mid Noctis
};

// ── Component ────────────────────────────────────────────────────

export default function YearTab() {
  const { hemisphere } = useHemisphere();

  const [hovered, setHovered] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const isMobile = useIsMobile();

  const today = useToday(hemisphere);

  const activeIndex = selected ?? (today && !today.isOutsideCount ? today.monthIndex : null);
  const activeSegment = activeIndex !== null ? SEGMENTS[activeIndex] : null;

  const weekRows = useMemo(() => {
    if (activeIndex === null) return [];
    const month = MONTHS[activeIndex];
    return WEEK_PHASES.map((phase, wi) => {
      const dayStart = month.start + wi * 7;
      const dayEnd   = dayStart + 6;
      const isCurrent =
        !!(today && !today.isOutsideCount &&
           today.monthIndex === activeIndex &&
           today.weekIndex === wi);
      const gregStart = formatGregorian(gregDateFromAptus(dayStart, today?.year ?? 12026, hemisphere));
      const gregEnd   = formatGregorian(gregDateFromAptus(dayEnd,   today?.year ?? 12026, hemisphere));
      return { phase, wi, isCurrent, gregStart, gregEnd, dayStart, dayEnd };
    });
  }, [activeIndex, today, hemisphere]);

  const currentDayAngle = today && !today.isOutsideCount
    ? (today.dayOfYear - 0.5) * DEG_PER_DAY
    : today?.isOutsideCount ? 364.5 * DEG_PER_DAY : null;

  const dotPos = currentDayAngle !== null
    ? polar(CX, CY, (R_OUT + R_IN) / 2, currentDayAngle)
    : null;

  const displayIndex = hovered !== null ? hovered : activeIndex;
  const displaySegment = displayIndex !== null ? SEGMENTS[displayIndex] : null;

  return (
    <div style={{
      height: '100%',
      overflow: 'hidden auto',
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      alignItems: isMobile ? 'center' : 'center',
      justifyContent: 'center',
      padding: isMobile ? '1.5rem 1rem' : '2rem',
      gap: isMobile ? '1.5rem' : '4rem',
    }}>

      {/* ── Ring ─────────────────────────────────────────────────── */}
      <div style={{ flexShrink: 0 }}>
        <svg
          width="480"
          height="480"
          viewBox="0 0 480 480"
          style={{ display: 'block', maxWidth: isMobile ? '88vw' : '45vw', maxHeight: isMobile ? '50vw' : '80vh' }}
          aria-label="Aptus year ring — 13 months"
        >
          <defs>
            {Object.entries(SEASON_COLORS).map(([s, c]) => (
              <radialGradient key={s} id={`glow-${s}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={c.primary} stopOpacity="0.25" />
                <stop offset="100%" stopColor={c.primary} stopOpacity="0" />
              </radialGradient>
            ))}
            {SEGMENTS.map((seg, i) => {
              const n = MONTHS.length;
              const c0 = lerpColor(MONTHS[(i - 1 + n) % n].color, MONTHS[i].color, 0.5);
              const c1 = lerpColor(MONTHS[i].color, MONTHS[(i + 1) % n].color, 0.5);
              const r = (R_OUT + R_IN) / 2;
              const p1 = polar(CX, CY, r, seg.startDeg);
              const p2 = polar(CX, CY, r, seg.endDeg);
              return (
                <linearGradient key={`omg${i}`} id={`omg${i}`} gradientUnits="userSpaceOnUse"
                  x1={p1.x.toFixed(2)} y1={p1.y.toFixed(2)}
                  x2={p2.x.toFixed(2)} y2={p2.y.toFixed(2)}
                >
                  <stop offset="0%" stopColor={c0} />
                  <stop offset="100%" stopColor={c1} />
                </linearGradient>
              );
            })}
          </defs>

          {/* Month segments — ombre gradient ring */}
          {SEGMENTS.map(seg => {
            const isActive = seg.index === activeIndex;
            const isHovered = seg.index === hovered;
            return (
              <path
                key={seg.index}
                d={seg.path}
                fill={`url(#omg${seg.index})`}
                stroke="none"
                opacity={isActive || isHovered ? 1 : 0.32}
                style={{ cursor: 'pointer', transition: 'opacity 0.25s' }}
                onMouseEnter={() => setHovered(seg.index)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => setSelected(prev => prev === seg.index ? null : seg.index)}
                aria-label={`${seg.name} — ${seg.focus}`}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && setSelected(prev => prev === seg.index ? null : seg.index)}
              />
            );
          })}

          {/* Otium sliver */}
          <path
            d={OTIUM_PATH}
            fill="#2d2e2b"
            stroke="#2d2e2b"
            strokeWidth="0.5"
            opacity="0.7"
          />

          {/* Season label ticks */}
          {(Object.entries(SEASON_MID_DAYS) as [Season, number][]).map(([season, day]) => {
            const angle = (day - 0.5) * DEG_PER_DAY;
            const inner = polar(CX, CY, R_OUT + 8, angle);
            const outer = polar(CX, CY, R_OUT + 22, angle);
            const label = polar(CX, CY, R_OUT + 38, angle);
            return (
              <g key={season}>
                <line
                  x1={inner.x} y1={inner.y}
                  x2={outer.x} y2={outer.y}
                  stroke={SEASON_COLORS[season].primary}
                  strokeWidth="1"
                  opacity="0.5"
                />
                <text
                  x={label.x} y={label.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={SEASON_COLORS[season].primary}
                  fontSize="11"
                  fontFamily="var(--font-dm-mono)"
                  letterSpacing="0.15em"
                  opacity="0.9"
                  style={{ textTransform: 'uppercase' }}
                >
                  {season.toUpperCase()}
                </text>
              </g>
            );
          })}

          {/* Current day dot */}
          {dotPos && (
            <circle
              cx={dotPos.x}
              cy={dotPos.y}
              r="4"
              fill="#ede8de"
              style={{ filter: 'drop-shadow(0 0 4px rgba(240,237,232,0.8))' }}
            />
          )}

          {/* Center */}
          {displaySegment ? (
            <>
              <text
                x={CX} y={CY - 28}
                textAnchor="middle"
                fill="#c0a880"
                fontSize="8"
                fontFamily="var(--font-dm-mono)"
                letterSpacing="0.15em"
              >
                {displaySegment.season.toUpperCase()}
              </text>
              <text
                x={CX} y={CY + 4}
                textAnchor="middle"
                fill="#ede8de"
                fontSize="28"
                fontFamily="var(--font-cormorant)"
                fontWeight="300"
              >
                {displaySegment.name}
              </text>
              <text
                x={CX} y={CY + 26}
                textAnchor="middle"
                fill={SEASON_COLORS[displaySegment.season].primary}
                fontSize="9"
                fontFamily="var(--font-dm-mono)"
                letterSpacing="0.1em"
              >
                {displaySegment.focus.toUpperCase()}
              </text>
            </>
          ) : (
            <text
              x={CX} y={CY + 6}
              textAnchor="middle"
              fill="#8a7460"
              fontSize="10"
              fontFamily="var(--font-dm-mono)"
              letterSpacing="0.1em"
            >
              SELECT A MONTH
            </text>
          )}

        </svg>
      </div>

      {/* ── Month detail panel ───────────────────────────────────── */}
      <div style={{
        flex: isMobile ? 'none' : 1,
        width: isMobile ? '100%' : 'auto',
        maxWidth: isMobile ? 480 : 380,
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        opacity: activeSegment ? 1 : 0.2,
        transition: 'opacity 0.3s ease',
      }}>
        {activeSegment ? (
          <>
            <div>
              <div style={{
                fontFamily: 'var(--font-dm-mono)',
                fontSize: '0.58rem',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: SEASON_COLORS[activeSegment.season].primary,
                marginBottom: '0.5rem',
              }}>
                Month {activeSegment.index + 1} of 13 · {activeSegment.season.charAt(0).toUpperCase() + activeSegment.season.slice(1)}
              </div>
              <h2 style={{
                fontFamily: 'var(--font-cormorant)',
                fontSize: 'clamp(2.2rem, 4vw, 3.2rem)',
                fontWeight: 300,
                color: '#ede8de',
                lineHeight: 0.95,
                marginBottom: '0.4rem',
              }}>
                {activeSegment.name}
              </h2>
              <p style={{
                fontFamily: 'var(--font-dm-mono)',
                fontSize: '0.62rem',
                color: '#c0a880',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
              }}>
                {activeSegment.focus}
              </p>
            </div>

            <p style={{
              fontFamily: 'var(--font-libre)',
              fontStyle: 'italic',
              fontSize: '0.9rem',
              color: '#c0a880',
              lineHeight: 1.75,
            }}>
              {activeSegment.intent}
            </p>

            <div style={{
              borderTop: '1px solid #2d2e2b',
              paddingTop: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}>
              <div style={{
                fontFamily: 'var(--font-dm-mono)',
                fontSize: '0.58rem',
                color: '#8a7460',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                marginBottom: '0.5rem',
              }}>
                Four Weeks
              </div>
              {weekRows.map(row => (
                <div
                  key={row.wi}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '0.6rem 0.75rem',
                    borderRadius: 6,
                    background: row.isCurrent ? '#232322' : 'transparent',
                    border: row.isCurrent ? `1px solid ${SEASON_COLORS[activeSegment.season].primary}22` : '1px solid transparent',
                  }}
                >
                  <span style={{
                    fontFamily: 'var(--font-dm-mono)',
                    fontSize: '0.58rem',
                    letterSpacing: '0.1em',
                    color: row.isCurrent
                      ? SEASON_COLORS[activeSegment.season].primary
                      : '#9a8870',
                    textTransform: 'uppercase',
                    minWidth: 60,
                  }}>
                    {row.phase}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-dm-mono)',
                    fontSize: '0.62rem',
                    color: '#8a7460',
                    letterSpacing: '0.06em',
                  }}>
                    Days {row.dayStart}–{row.dayEnd}
                  </span>
                  {row.isCurrent && (
                    <span style={{
                      marginLeft: 'auto',
                      fontFamily: 'var(--font-dm-mono)',
                      fontSize: '0.6rem',
                      color: SEASON_COLORS[activeSegment.season].primary,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                    }}>
                      Now
                    </span>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div style={{
            fontFamily: 'var(--font-dm-mono)',
            fontSize: '0.62rem',
            color: '#8a7460',
            letterSpacing: '0.1em',
            textAlign: 'center',
            marginTop: '4rem',
          }}>
            Click a month to explore
          </div>
        )}
      </div>

    </div>
  );
}
