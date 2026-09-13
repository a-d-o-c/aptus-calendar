'use client';

import { useEffect, useRef, useState } from 'react';
import { getAptusDate, type AptusDate } from '@/lib/aptus';
import {
  CELEBRATIONS,
  KIND_LABEL,
  daysUntil,
  isActive,
  timingLabel,
} from '@/lib/celebrations';
import Worksheet from './Worksheet';
import { useHemisphere } from '@/lib/hemisphere-context';
import { useIsMobile } from '@/lib/use-mobile';

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: 'var(--font-dm-mono)', fontSize: '0.62rem', letterSpacing: '0.25em',
      textTransform: 'uppercase', color: '#8a7460', marginBottom: '0.6rem',
    }}>
      {children}
    </div>
  );
}

export default function CelebrationsTab() {
  const { hemisphere } = useHemisphere();
  const isMobile = useIsMobile();
  const [today, setToday] = useState<AptusDate | null>(null);
  const [openName, setOpenName] = useState<string | null>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    setToday(getAptusDate(new Date(), hemisphere));
    const id = setInterval(() => setToday(getAptusDate(new Date(), hemisphere)), 60000);
    return () => clearInterval(id);
  }, [hemisphere]);

  // Chips are a jump list: open the card and bring it into view, so tapping one
  // on mobile doesn't expand something off-screen with no visible feedback.
  function jumpTo(name: string) {
    setOpenName(name);
    cardRefs.current[name]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div style={{
      height: '100%',
      overflowY: 'auto',
      padding: isMobile ? '2.5rem 1.25rem 4rem' : '4rem 2rem 6rem',
    }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>

        <Label>Celebrations</Label>
        <h1 style={{
          fontFamily: 'var(--font-cormorant)', fontWeight: 400,
          fontSize: isMobile ? '1.9rem' : '2.4rem', color: '#ede8de', lineHeight: 1.1,
          marginBottom: '0.75rem',
        }}>
          The days the year turns on
        </h1>
        <p style={{
          fontFamily: 'var(--font-libre)', fontSize: isMobile ? '0.9rem' : '0.95rem',
          color: '#9a8870', lineHeight: 1.8, marginBottom: '2rem', maxWidth: 620,
        }}>
          Three days where one year meets the next — <strong style={{ color: '#c0a880', fontWeight: 500 }}>Áramót</strong>.
          Three more mark the solstices and the autumn equinox, each a place to hold the Hayta vow up to the light.
          A seventh, Retta, corrects the calendar every few years. None of it requires belief — the equinoxes and
          solstices happen regardless of whether anyone marks them. This is what marking them can look like.
        </p>

        <div style={{
          borderLeft: '2px solid #2d2e2b',
          paddingLeft: isMobile ? '1rem' : '1.25rem',
          maxWidth: 620,
          marginBottom: '2.5rem',
        }}>
          <div style={{
            fontFamily: 'var(--font-dm-mono)', fontSize: '0.58rem', letterSpacing: '0.18em',
            textTransform: 'uppercase', color: '#8a7460', marginBottom: '0.65rem',
          }}>
            Form follows the act
          </div>
          <p style={{
            fontFamily: 'var(--font-libre)', fontSize: isMobile ? '0.88rem' : '0.92rem',
            color: '#9a8870', lineHeight: 1.8, margin: 0,
          }}>
            Two of the seven run for three days, and the number of names tells you why. The turn of the year
            is three days and three names, because each day is a different act:{' '}
            <strong style={{ color: '#c0a880', fontWeight: 500 }}>Arfa</strong> closes,{' '}
            <strong style={{ color: '#c0a880', fontWeight: 500 }}>Otium</strong> rests,{' '}
            <strong style={{ color: '#c0a880', fontWeight: 500 }}>Hayta</strong> opens. The solstices also run
            three days — the days the sun holds its position — but each carries a single name, because it is
            one sustained moment rather than three separate ones.
          </p>
        </div>

        {today && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2.5rem' }}>
            {CELEBRATIONS.filter(c => c.observed !== null).map(c => {
              const until = daysUntil(today, c);
              const isToday = isActive(today, c);
              return (
                <button
                  key={c.name}
                  onClick={() => jumpTo(c.name)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.4rem 0.85rem', borderRadius: 99,
                    border: `1px solid ${isToday ? c.color : '#2d2e2b'}`,
                    background: isToday ? `${c.color}22` : '#1d1d1c',
                    color: isToday ? '#ede8de' : '#9a8870',
                    fontFamily: 'var(--font-dm-mono)', fontSize: '0.62rem',
                    letterSpacing: '0.06em', cursor: 'pointer',
                    transition: 'border-color 0.2s, color 0.2s',
                  }}
                  onMouseEnter={e => {
                    if (isToday) return;
                    e.currentTarget.style.borderColor = '#8a7460';
                    e.currentTarget.style.color = '#ede8de';
                  }}
                  onMouseLeave={e => {
                    if (isToday) return;
                    e.currentTarget.style.borderColor = '#2d2e2b';
                    e.currentTarget.style.color = '#9a8870';
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
                  {c.name} · {isToday ? 'today' : `${until}d`}
                </button>
              );
            })}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {CELEBRATIONS.map(cel => {
            const until = today ? daysUntil(today, cel) : null;
            const isToday = today ? isActive(today, cel) : false;
            const isOpen = openName === cel.name;
            const timing = today ? timingLabel(today, cel) : cel.position;

            return (
              <div
                key={cel.name}
                ref={el => { cardRefs.current[cel.name] = el; }}
                style={{
                  background: '#1d1d1c',
                  border: `1px solid ${isToday ? cel.color : '#2d2e2b'}`,
                  borderLeft: `3px solid ${cel.color}`,
                  borderRadius: 6,
                  overflow: 'hidden',
                  scrollMarginTop: '1rem',
                }}
              >
                <button
                  onClick={() => setOpenName(isOpen ? null : cel.name)}
                  aria-expanded={isOpen}
                  style={{
                    width: '100%', textAlign: 'left', background: 'none', border: 'none',
                    cursor: 'pointer', padding: isMobile ? '1.1rem 1.2rem' : '1.25rem 1.4rem',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                    gap: '1rem', flexWrap: 'wrap',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.5rem', fontWeight: 400, color: '#ede8de', lineHeight: 1.1 }}>
                        {cel.name}
                      </span>
                      <span style={{
                        fontFamily: 'var(--font-dm-mono)', fontSize: '0.56rem', letterSpacing: '0.1em',
                        textTransform: 'uppercase', color: cel.color,
                      }}>
                        {KIND_LABEL[cel.kind]}
                      </span>
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-dm-mono)', fontSize: '0.62rem', color: '#8a7460',
                      marginTop: '0.35rem', lineHeight: 1.5,
                    }}>
                      {timing}
                    </div>
                  </div>
                  {isToday ? (
                    <span style={{
                      fontFamily: 'var(--font-dm-mono)', fontSize: '0.58rem', letterSpacing: '0.1em',
                      textTransform: 'uppercase', color: cel.color, border: `1px solid ${cel.color}`,
                      borderRadius: 99, padding: '0.2rem 0.6rem', flexShrink: 0,
                    }}>
                      Today
                    </span>
                  ) : until !== null ? (
                    <span style={{
                      fontFamily: 'var(--font-dm-mono)', fontSize: '0.58rem', letterSpacing: '0.1em',
                      textTransform: 'uppercase', color: '#8a7460', flexShrink: 0,
                    }}>
                      {until}d
                    </span>
                  ) : null}
                </button>

                {isOpen && (
                  <div style={{ padding: isMobile ? '0 1.2rem 1.2rem' : '0 1.4rem 1.4rem' }}>
                    <p style={{
                      fontFamily: 'var(--font-libre)', fontSize: isMobile ? '0.88rem' : '0.92rem',
                      color: '#9a8870', lineHeight: 1.8, marginBottom: '1rem',
                    }}>
                      {cel.meaning}
                    </p>
                    <ul style={{ margin: 0, paddingLeft: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {cel.practice.map((p, i) => (
                        <li key={i} style={{
                          fontFamily: 'var(--font-libre)', fontStyle: 'italic',
                          fontSize: isMobile ? '0.85rem' : '0.88rem', color: '#c0a880', lineHeight: 1.7,
                        }}>
                          {p}
                        </li>
                      ))}
                    </ul>
                    {today && <Worksheet cel={cel} neYear={today.year} isMobile={isMobile} />}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
