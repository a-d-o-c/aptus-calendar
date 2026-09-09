'use client';

import { useEffect, useState } from 'react';
import {
  getAptusDate,
  gregDateFromAptus,
  formatGregorian,
  type AptusDate,
} from '@/lib/aptus';
import { useHemisphere } from '@/lib/hemisphere-context';
import { useIsMobile } from '@/lib/use-mobile';

type CelKind = 'hinge' | 'turn' | 'calibration';

interface Celebration {
  name: string;
  kind: CelKind;
  dayOfYear: number | null;
  position: string;
  color: string;
  meaning: string;
  practice: string[];
}

const CELEBRATIONS: Celebration[] = [
  {
    name: 'Arfa',
    kind: 'hinge',
    dayOfYear: 364,
    position: 'Lumen 28 - the last day of the year',
    color: '#4e6870',
    meaning: 'The year is an estate, and you are its heir. Not everything left to you is wanted - an heir can take or refuse. Today you go through the estate honestly and decide what crosses into the next year.',
    practice: [
      'What did this year ask of me that I did not expect?',
      'What has it left me that I would want even if I had chosen it deliberately?',
      'What have I been quietly telling myself about who I am - and does the evidence still hold?',
      'What am I carrying only because I have always carried it?',
      'What am I ready to refuse?',
    ],
  },
  {
    name: 'Otium',
    kind: 'hinge',
    dayOfYear: 365,
    position: 'Day 365 - outside the count',
    color: '#b8c8c8',
    meaning: 'No month, no week, no number. The only day of the year that asks nothing of you - on purpose. Yesterday settled the estate; tomorrow sets the vow. Today belongs to neither.',
    practice: [
      'Nothing is required. That is the whole practice.',
      'If you want one thing to do with it: notice you are between two years and belong to neither, and let that be comfortable rather than urgent.',
    ],
  },
  {
    name: 'Hayta',
    kind: 'hinge',
    dayOfYear: 1,
    position: "Verna 1 - New Year's Day",
    color: '#5aad3e',
    meaning: 'A vow is not a plan. A plan is a list of things you intend to do; a vow is one thing you intend to be true. Today is when you say it - then hold it up to the light at Samna, Nesti and Vona.',
    practice: [
      'What is the one thing this year is for? Not a list - one direction.',
      'If the year had a single word, what would I want that word to be?',
      'What will I have to refuse in order to keep this?',
      'Who should hear it?',
    ],
  },
  {
    name: 'Samna',
    kind: 'turn',
    dayOfYear: 91,
    position: 'Solaris 7 - summer solstice',
    color: '#e8a020',
    meaning: 'The longest light, and the one day built around other people instead of yourself. In the Southern Hemisphere it lands where Christmas lands - Samna displaces it honestly, with the same materials.',
    practice: [
      'Be somewhere with people, for the length of the day - not an hour, all of it.',
      'Give one purposeful thing: something made, something useful, a day of your labour.',
      'Say one true thing to someone while they are standing in front of you.',
      'The check: say the Hayta vow out loud to someone at the gathering. Has it survived the first quarter?',
    ],
  },
  {
    name: 'Nesti',
    kind: 'turn',
    dayOfYear: 180,
    position: 'Axia 12 - autumn equinox',
    color: '#c85428',
    meaning: 'Nesti is the food packed for a journey. Light is retreating now - the balance point before the dark half of the year. Thanks and remembrance sit inside a practical act of provisioning.',
    practice: [
      'What carried me through this year that I did not put there myself?',
      'Who or what will not be coming into the dark half - and what do I want to say before it closes?',
      'What will I actually need before the light goes? Name three, and get one of them this week.',
      'The check: measured against the Hayta vow, am I still packing for the same journey?',
    ],
  },
  {
    name: 'Vona',
    kind: 'turn',
    dayOfYear: 273,
    position: 'Umbra 21 - winter solstice',
    color: '#4a6fa5',
    meaning: 'Vona is hope - the kind that comes from knowing the dark has a floor. The longest night, and the point the count turns back toward light, whether or not it feels that way yet.',
    practice: [
      'What is furthest from resolved right now - and can it wait for spring without costing me anything?',
      'What is one sign, however small, that the direction is already turning?',
      'What do I want to be true by the time Hayta comes around again?',
      'The check: say the Hayta vow once, plainly. Does it still sound like what I meant in September?',
    ],
  },
  {
    name: 'Retta',
    kind: 'calibration',
    dayOfYear: null,
    position: 'Day 366 - roughly every 6 years - next: 12030 NE',
    color: '#c0a880',
    meaning: 'The solar year is 365.2422 days, not 365. Every Aptus year drifts a little; Retta is added as Day 366 to bring the calendar back into true. Kept an Old Norse name by choice, even though it is pure mechanism.',
    practice: [
      'Notice it. An extra day outside the ordinary structure of the year is genuinely unusual.',
      'Use it for something on no list. Not productive, not planned, not optimised.',
      'Consider: what would you do with a day no one could schedule over?',
    ],
  },
];

const KIND_LABEL: Record<CelKind, string> = {
  hinge: 'Kafla - the hinge',
  turn: 'Vow check',
  calibration: 'Calibration',
};

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

function daysUntil(today: AptusDate, target: number | null): number | null {
  if (target === null) return null;
  const todayDoy = today.isOtium ? 365 : today.dayOfYear;
  const diff = (target - todayDoy + 365) % 365;
  return diff;
}

export default function CelebrationsTab() {
  const { hemisphere } = useHemisphere();
  const isMobile = useIsMobile();
  const [today, setToday] = useState<AptusDate | null>(null);
  const [openName, setOpenName] = useState<string | null>(null);

  useEffect(() => {
    setToday(getAptusDate(new Date(), hemisphere));
    const id = setInterval(() => setToday(getAptusDate(new Date(), hemisphere)), 60000);
    return () => clearInterval(id);
  }, [hemisphere]);

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: isMobile ? '1.5rem 1.25rem 3rem' : '3rem 2rem 5rem' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>

        <Label>Celebrations</Label>
        <h1 style={{
          fontFamily: 'var(--font-cormorant)', fontWeight: 400,
          fontSize: isMobile ? '1.9rem' : '2.4rem', color: '#ede8de', lineHeight: 1.1,
          marginBottom: '0.75rem',
        }}>
          The days the year turns on
        </h1>
        <p style={{
          fontFamily: 'var(--font-libre)', fontSize: '0.95rem', color: '#9a8870',
          lineHeight: 1.8, marginBottom: '2.5rem', maxWidth: 620,
        }}>
          Three days form the hinge where one year becomes the next - <strong style={{ color: '#c0a880', fontWeight: 500 }}>Kafla</strong>.
          Three more mark the solstices and the autumn equinox, each a place to hold the Hayta vow up to the light.
          A seventh, Retta, corrects the calendar every few years. None of it requires belief - the equinoxes and
          solstices happen regardless of whether anyone marks them. This is what marking them can look like.
        </p>

        {today && (
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2.5rem',
          }}>
            {CELEBRATIONS.filter(c => c.dayOfYear !== null).map(c => {
              const until = daysUntil(today, c.dayOfYear);
              const isToday = until === 0;
              return (
                <button
                  key={c.name}
                  onClick={() => setOpenName(c.name)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.4rem 0.85rem', borderRadius: 99,
                    border: `1px solid ${isToday ? c.color : '#2d2e2b'}`,
                    background: isToday ? `${c.color}22` : '#1d1d1c',
                    color: isToday ? '#ede8de' : '#9a8870',
                    fontFamily: 'var(--font-dm-mono)', fontSize: '0.62rem',
                    letterSpacing: '0.06em', cursor: 'pointer',
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
                  {c.name} - {isToday ? 'today' : `${until}d`}
                </button>
              );
            })}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {CELEBRATIONS.map(cel => {
            const until = today ? daysUntil(today, cel.dayOfYear) : null;
            const isToday = until === 0;
            const isOpen = openName === cel.name;
            const dateLabel = cel.dayOfYear !== null
              ? formatGregorian(gregDateFromAptus(cel.dayOfYear, today?.year ?? 12026, hemisphere))
              : null;

            return (
              <div
                key={cel.name}
                style={{
                  background: '#1d1d1c',
                  border: `1px solid ${isToday ? cel.color : '#222e28'}`,
                  borderLeft: `3px solid ${cel.color}`,
                  borderRadius: 6,
                  overflow: 'hidden',
                }}
              >
                <button
                  onClick={() => setOpenName(isOpen ? null : cel.name)}
                  style={{
                    width: '100%', textAlign: 'left', background: 'none', border: 'none',
                    cursor: 'pointer', padding: '1.25rem 1.4rem',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '1rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.5rem', fontWeight: 400, color: '#ede8de' }}>
                        {cel.name}
                      </span>
                      <span style={{
                        fontFamily: 'var(--font-dm-mono)', fontSize: '0.56rem', letterSpacing: '0.1em',
                        textTransform: 'uppercase', color: cel.color,
                      }}>
                        {KIND_LABEL[cel.kind]}
                      </span>
                    </div>
                    <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '0.62rem', color: '#8a7460', marginTop: '0.3rem' }}>
                      {cel.position}{dateLabel ? ` - ${dateLabel}` : ''}
                    </div>
                  </div>
                  {isToday && (
                    <span style={{
                      fontFamily: 'var(--font-dm-mono)', fontSize: '0.58rem', letterSpacing: '0.1em',
                      textTransform: 'uppercase', color: cel.color, border: `1px solid ${cel.color}`,
                      borderRadius: 99, padding: '0.2rem 0.6rem', flexShrink: 0,
                    }}>
                      Today
                    </span>
                  )}
                </button>

                {isOpen && (
                  <div style={{ padding: '0 1.4rem 1.4rem' }}>
                    <p style={{ fontFamily: 'var(--font-libre)', fontSize: '0.92rem', color: '#9a8870', lineHeight: 1.8, marginBottom: '1rem' }}>
                      {cel.meaning}
                    </p>
                    <ul style={{ margin: 0, paddingLeft: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {cel.practice.map((p, i) => (
                        <li key={i} style={{ fontFamily: 'var(--font-libre)', fontStyle: 'italic', fontSize: '0.88rem', color: '#c0a880', lineHeight: 1.7 }}>
                          {p}
                        </li>
                      ))}
                    </ul>
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
