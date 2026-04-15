'use client';

import { useEffect, useState } from 'react';
import {
  MONTHS,
  WEEK_PHASES,
  SEASON_COLORS,
  getAptusDate,
  gregDateFromAptus,
  type AptusDate,
  type Season,
} from '@/lib/aptus';
import { useHemisphere } from '@/lib/hemisphere-context';

const SEASON_LABELS: Record<Season, string> = {
  spring: 'Spring',
  summer: 'Summer',
  autumn: 'Autumn',
  winter: 'Winter',
};

const SEASON_ORDER: Season[] = ['spring', 'summer', 'autumn', 'winter'];

interface MonthCardProps {
  monthIndex: number;
  today: AptusDate | null;
  neYear: number;
}

function MonthCard({ monthIndex, today, neYear }: MonthCardProps) {
  const { hemisphere } = useHemisphere();
  const month = MONTHS[monthIndex];
  const color = SEASON_COLORS[month.season].primary;
  const isCurrentMonth = !!(today && !today.isLacuna && today.monthIndex === monthIndex);

  return (
    <div style={{
      background: '#1a1816',
      border: `1px solid ${isCurrentMonth ? color + '40' : '#2e2924'}`,
      borderTop: `2px solid ${isCurrentMonth ? color : color + '30'}`,
      borderRadius: 6,
      overflow: 'hidden',
    }}>
      {/* Month header */}
      <div style={{
        padding: '0.75rem 0.875rem 0.6rem',
        borderBottom: '1px solid #222018',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize: '1.25rem',
            fontWeight: 300,
            color: isCurrentMonth ? '#f0ede8' : '#c4c0ba',
            lineHeight: 1,
          }}>
            {month.name}
          </span>
          <span style={{
            fontFamily: 'var(--font-dm-mono)',
            fontSize: '0.52rem',
            color: color,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            opacity: isCurrentMonth ? 1 : 0.6,
          }}>
            {month.focus}
          </span>
        </div>
        <div style={{
          fontFamily: 'var(--font-dm-mono)',
          fontSize: '0.5rem',
          color: '#3d3830',
          letterSpacing: '0.08em',
          marginTop: '0.2rem',
        }}>
          Days {month.start}–{month.end}
        </div>
      </div>

      {/* Day grid */}
      <div style={{ padding: '0.5rem 0.6rem 0.75rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '44px repeat(7, 1fr)',
          gap: '1px',
        }}>
          {/* Week rows */}
          {WEEK_PHASES.map((phase, wi) => {
            const isCurrentWeek = isCurrentMonth && !!(today && today.weekIndex === wi);
            const dayStart = wi * 7 + 1;

            return [
              /* Phase label */
              <div key={`label-${wi}`} style={{
                display: 'flex', alignItems: 'center',
                paddingRight: '0.4rem',
                fontFamily: 'var(--font-dm-mono)',
                fontSize: '0.48rem',
                color: isCurrentWeek ? color : '#3d3830',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                height: 24,
                transition: 'color 0.3s',
              }}>
                {phase.slice(0, 3)}
              </div>,

              /* 7 day cells */
              ...Array.from({ length: 7 }, (_, di) => {
                const dayInMonth = dayStart + di;
                const dayOfYear = month.start + dayStart + di - 1;
                const isToday = !!(today && !today.isLacuna &&
                  today.monthIndex === monthIndex &&
                  today.dayInMonth === dayInMonth);
                const isThisWeek = isCurrentWeek;

                const gregDate = gregDateFromAptus(dayOfYear, neYear, hemisphere);
                const gregStr = gregDate.toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' });

                return (
                  <div
                    key={`day-${wi}-${di}`}
                    title={gregStr}
                    style={{
                      height: 24,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      borderRadius: 3,
                      background: isToday
                        ? color
                        : isThisWeek
                          ? color + '14'
                          : 'transparent',
                      fontFamily: 'var(--font-dm-mono)',
                      fontSize: '0.52rem',
                      color: isToday
                        ? '#0f0e0c'
                        : isThisWeek
                          ? color
                          : '#3d3830',
                      fontWeight: isToday ? '500' : '400',
                      cursor: 'default',
                      transition: 'background 0.2s',
                      userSelect: 'none',
                    }}
                    onMouseEnter={e => {
                      if (!isToday) e.currentTarget.style.background = color + '28';
                    }}
                    onMouseLeave={e => {
                      if (!isToday) e.currentTarget.style.background = isThisWeek ? color + '14' : 'transparent';
                    }}
                  >
                    {dayInMonth}
                  </div>
                );
              }),
            ];
          })}
        </div>
      </div>
    </div>
  );
}

export default function CalendarTab() {
  const { hemisphere } = useHemisphere();
  const [today, setToday] = useState<AptusDate | null>(null);

  useEffect(() => {
    setToday(getAptusDate(new Date(), hemisphere));
  }, [hemisphere]);

  const neYear = today?.year ?? 12026;

  return (
    <div style={{
      height: '100%',
      overflow: 'hidden auto',
      padding: '2rem',
    }}>
      <div style={{ maxWidth: 1160, margin: '0 auto' }}>

        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          marginBottom: '2rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid #2e2924',
        }}>
          <h2 style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize: 'clamp(1.8rem, 3vw, 2.4rem)',
            fontWeight: 300,
            color: '#f0ede8',
            lineHeight: 1,
          }}>
            {neYear} NE
          </h2>
          <div style={{
            fontFamily: 'var(--font-dm-mono)',
            fontSize: '0.55rem',
            color: '#3d3830',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}>
            13 months · 28 days each · hover for Gregorian date
          </div>
        </div>

        {/* Seasons */}
        {SEASON_ORDER.map(season => {
          const seasonMonths = MONTHS
            .map((m, i) => ({ ...m, index: i }))
            .filter(m => m.season === season);
          const color = SEASON_COLORS[season].primary;

          return (
            <div key={season} style={{ marginBottom: '2.5rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '0.875rem',
              }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />
                <span style={{
                  fontFamily: 'var(--font-dm-mono)',
                  fontSize: '0.58rem',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color,
                }}>
                  {SEASON_LABELS[season]}
                </span>
                <div style={{ flex: 1, height: 1, background: color + '20' }} />
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${seasonMonths.length}, 1fr)`,
                gap: '0.875rem',
              }}>
                {seasonMonths.map(m => (
                  <MonthCard
                    key={m.name}
                    monthIndex={m.index}
                    today={today}
                    neYear={neYear}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {/* Lacuna */}
        <div style={{
          padding: '1.25rem 1.5rem',
          background: '#1a1816',
          border: '1px solid #2e2924',
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '2rem',
        }}>
          <div>
            <div style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: '1.4rem',
              fontWeight: 300,
              color: '#f0ede8',
              lineHeight: 1,
              marginBottom: '0.3rem',
            }}>
              Lacuna
            </div>
            <div style={{
              fontFamily: 'var(--font-dm-mono)',
              fontSize: '0.55rem',
              color: '#3d3830',
              letterSpacing: '0.1em',
            }}>
              Day 365 · Outside the structure
            </div>
          </div>
          <div style={{
            fontFamily: 'var(--font-libre)',
            fontStyle: 'italic',
            fontSize: '0.85rem',
            color: '#4d4740',
            maxWidth: 400,
            textAlign: 'right',
          }}>
            The threshold day. For reflection, review, and renewal. A pause between years.
          </div>
        </div>

      </div>
    </div>
  );
}
