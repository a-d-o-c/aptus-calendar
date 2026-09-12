'use client';

import { useEffect, useState } from 'react';
import {
  MONTHS,
  SEASON_COLORS,
  WEEK_PHASES,
  WEEK_PHASE_DESC,
  getAptusDate,
  type AptusDate,
  type Season,
} from '@/lib/aptus';
import { CELEBRATIONS, formatOccurrence } from '@/lib/celebrations';
import { useHemisphere } from '@/lib/hemisphere-context';

const SEASON_LABELS: Record<Season, string> = {
  spring: 'Spring',
  summer: 'Summer',
  autumn: 'Autumn',
  winter: 'Winter',
};

const seasons: Season[] = ['spring', 'summer', 'autumn', 'winter'];

// ── Typography helpers ────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: 'var(--font-dm-mono)',
      fontSize: '0.6rem',
      letterSpacing: '0.22em',
      textTransform: 'uppercase',
      color: '#8a7460',
      marginBottom: '1rem',
    }}>
      {children}
    </div>
  );
}

function Body({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <p style={{
      fontFamily: 'var(--font-libre)',
      fontSize: '1rem',
      color: '#d4dede',
      lineHeight: 1.9,
      marginBottom: '1.1rem',
      ...style,
    }}>
      {children}
    </p>
  );
}

function Rule() {
  return <div style={{ height: 1, background: '#222e28', margin: '2.5rem 0' }} />;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      fontFamily: 'var(--font-cormorant)',
      fontSize: 'clamp(1.8rem, 3vw, 2.4rem)',
      fontWeight: 300,
      color: '#ede8de',
      lineHeight: 1.1,
      marginBottom: '1.25rem',
    }}>
      {children}
    </h2>
  );
}

function Card({ title, subtitle, body, accent }: {
  title: string;
  subtitle?: string;
  body: string;
  accent?: string;
}) {
  return (
    <div style={{
      padding: '1.25rem 1.4rem',
      background: '#1d1d1c',
      border: '1px solid #222e28',
      borderLeft: accent ? `3px solid ${accent}` : '1px solid #222e28',
      borderRadius: 6,
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.875rem', marginBottom: '0.6rem', flexWrap: 'wrap' }}>
        <span style={{
          fontFamily: 'var(--font-cormorant)',
          fontSize: '1.2rem',
          fontWeight: 400,
          color: '#ede8de',
          lineHeight: 1,
        }}>
          {title}
        </span>
        {subtitle && (
          <span style={{
            fontFamily: 'var(--font-dm-mono)',
            fontSize: '0.58rem',
            color: accent ?? '#8a7460',
            letterSpacing: '0.08em',
          }}>
            {subtitle}
          </span>
        )}
      </div>
      <p style={{
        fontFamily: 'var(--font-libre)',
        fontSize: '0.92rem',
        color: '#908c86',
        lineHeight: 1.82,
        margin: 0,
      }}>
        {body}
      </p>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────

export default function AboutTab() {
  const { hemisphere } = useHemisphere();
  const [today, setToday] = useState<AptusDate | null>(null);

  useEffect(() => {
    setToday(getAptusDate(new Date(), hemisphere));
  }, [hemisphere]);

  /** The Aptus position is structural; the Gregorian dates come from the lib, never hardcoded. */
  const datesFor = (name: string): string | null => {
    const cel = CELEBRATIONS.find(c => c.name === name);
    if (!cel || !today) return null;
    return formatOccurrence(today, cel, hemisphere);
  };

  return (
    <div style={{ height: '100%', overflow: 'hidden auto', display: 'flex', justifyContent: 'center', padding: '3rem 2rem 5rem' }}>
      <div style={{ width: '100%', maxWidth: 700 }}>

        {/* ── Opening ──────────────────────────────────────────── */}
        <div style={{ marginBottom: '3rem' }}>
          <Label>About Aptus</Label>
          <SectionTitle>
            The Gregorian calendar wasn't designed.<br />
            <span style={{ fontStyle: 'italic', color: '#c0a880' }}>It just kept getting patched.</span>
          </SectionTitle>
          <Body>
            Months are 28, 29, 30, or 31 days long with no consistent pattern. The year begins on January 1st,
            which has no astronomical meaning — it was simply when Roman officials started their term. Four months
            are named after numbers that no longer match their position. September means seventh; it is the ninth.
            And for the Southern Hemisphere, the seasonal labels have always been backwards.
          </Body>
          <Body>
            It works well enough for scheduling. But it has no relationship to the natural year — to when
            things actually grow, slow down, peak, or rest. Aptus is a second calendar designed around that.
          </Body>
        </div>

        <Rule />

        {/* ── The evidence ─────────────────────────────────────── */}
        <div style={{ marginBottom: '3rem' }}>
          <Label>The Evidence</Label>
          <SectionTitle>How we got here</SectionTitle>
          <Body>
            The original Roman calendar had <strong style={{ color: '#ede8de', fontWeight: 400 }}>ten months</strong> and
            began in March. In order, they were: Martius, Aprilis, Maius, Junius, Quintilis, Sextilis,
            September, October, November, December. The last four were named after their position —
            the 7th, 8th, 9th, and 10th months.
          </Body>
          <Body>
            Then January and February were added, and the year was shifted to start in January. The last four
            months kept their names. September, which means <em>seventh</em>, became the ninth. October, meaning
            <em> eighth</em>, became the tenth. They have carried the wrong numbers for more than two thousand
            years.
          </Body>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem' }}>
            <Card
              title="Julius Caesar, 46 BCE"
              accent="#e8a020"
              body="The Roman calendar had drifted three months out of alignment with the seasons. Caesar brought in Egyptian astronomers to reform it. He established the 365-day year, the 12-month structure, and the leap year. He also renamed Quintilis (the 5th month) after himself — July. He did not renumber the last four months."
            />
            <Card
              title="Augustus Caesar and the stolen day"
              accent="#c85428"
              body="The month Sextilis was renamed August to honour Augustus. July, named for Julius, had 31 days; August had 30. A month shorter than his predecessor's was taken as an insult, so a day was moved from February to August. February was already the shortest month. It became shorter, and has stayed that way since."
            />
            <Card
              title="The Southern Hemisphere problem"
              accent="#4a6fa5"
              body="The Gregorian calendar was designed in Rome, refined in Europe, and imposed globally through colonisation. Every seasonal reference — spring lamb, autumn harvest, winter solstice, summer heat — is Northern Hemisphere experience treated as universal truth. For New Zealand, Australia, South Africa, South America, and much of the Global South: December is summer, June is winter, and the calendar's seasonal language has never matched the sky outside the window. This is not a minor inconvenience. It is the dominant calendar of the world describing half the world's seasons backwards."
            />
            <Card
              title="The uneven month problem"
              accent="#8a7460"
              body="Month lengths run 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 days, with no repeating pattern and no rule to derive them from. 'Thirty days hath September' exists because the lengths have to be memorised one by one. Aptus has a single rule: every month is 28 days."
            />
          </div>
        </div>

        <Rule />

        {/* ── What Aptus is ────────────────────────────────────── */}
        <div style={{ marginBottom: '3rem' }}>
          <Label>The Alternative</Label>
          <SectionTitle>
            <em>Aptus</em> — fitted, aligned, suited to the time
          </SectionTitle>
          <Body>
            Aptus does not replace the Gregorian calendar. It runs alongside it as a second layer of
            orientation — one grounded in something observable: the actual position of the Earth relative to the sun.
          </Body>
          <Body>
            The seasons are not abstract. Day length, temperature, light angle, and the biological rhythms
            they trigger are measurable and real. Humans are not exempt from them. A calendar that ignores
            these cycles does not make you immune to them — it just leaves you without a map. Aptus is the map.
          </Body>
          <Body>
            Thirteen months of exactly 28 days each = 364 days. Every month has four identical weeks. The year
            begins at the spring equinox — the moment the hemisphere tilts back toward the sun and conditions
            for growth actually begin. Day 365 is Otium: a threshold day outside the structure, for the pause
            between years. Roughly every six years, Retta is added as a calibration day to keep the calendar true to
            the solar year.
          </Body>
          <Body>
            No belief required. No conversion necessary. Keep the Gregorian calendar for appointments and
            taxes. Use Aptus to understand where you actually are in the year.
          </Body>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1.5rem' }}>
            {[
              { n: '13', label: 'Months of exactly 28 days' },
              { n: '4',  label: 'Identical weeks per month' },
              { n: '365', label: 'Days — 364 in months + Otium' },
              { n: '+10,000', label: 'Year offset — Natural Era (NE)' },
            ].map(item => (
              <div key={item.n} style={{
                padding: '1.1rem 1.25rem',
                background: '#1d1d1c',
                border: '1px solid #222e28',
                borderRadius: 6,
              }}>
                <div style={{
                  fontFamily: 'var(--font-cormorant)',
                  fontSize: '2rem',
                  fontWeight: 300,
                  color: '#ede8de',
                  lineHeight: 1,
                  marginBottom: '0.3rem',
                }}>
                  {item.n}
                </div>
                <div style={{
                  fontFamily: 'var(--font-dm-mono)',
                  fontSize: '0.6rem',
                  color: '#8a7460',
                  letterSpacing: '0.08em',
                }}>
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Rule />

        {/* ── The four phases ──────────────────────────────────── */}
        <div style={{ marginBottom: '3rem' }}>
          <Label>The Four Phases</Label>
          <SectionTitle>Every month, the same arc</SectionTitle>
          <Body>
            Every week in Aptus has a phase. Not a name — a function. Orient, Engage, Amplify, Integrate.
            The same four-beat cycle repeats through every month of every year. Once you internalise it,
            you stop fighting the rhythm and start using it.
          </Body>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {WEEK_PHASES.map((phase, i) => (
              <div key={phase} style={{
                display: 'flex', gap: '1.25rem', alignItems: 'flex-start',
                padding: '1rem 1.25rem',
                background: '#1d1d1c', border: '1px solid #222e28', borderRadius: 6,
              }}>
                <div style={{
                  fontFamily: 'var(--font-dm-mono)', fontSize: '0.62rem',
                  color: '#8a7460', paddingTop: '0.15rem', flexShrink: 0, width: 20,
                }}>
                  W{i + 1}
                </div>
                <div>
                  <div style={{
                    fontFamily: 'var(--font-cormorant)', fontSize: '1.25rem',
                    fontWeight: 400, color: '#ede8de', marginBottom: '0.2rem', lineHeight: 1,
                  }}>
                    {phase}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-libre)', fontStyle: 'italic',
                    fontSize: '0.9rem', color: '#c0a880', lineHeight: 1.65,
                  }}>
                    {WEEK_PHASE_DESC[phase]}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Rule />

        {/* ── Celebrations ─────────────────────────────────────── */}
        <div style={{ marginBottom: '3rem' }}>
          <Label>Celebrations</Label>
          <SectionTitle>Seven days the year turns on</SectionTitle>
          <Body>
            The equinoxes and solstices are not invented — they're astronomical events, measurable and precise,
            occurring whether or not anyone acknowledges them. Arfa, Otium and Retta are structural features
            of the Aptus calendar built around those events and around the turn of the year itself. Together
            these seven days are Aptus's calendar of observance.
          </Body>
          <Body>
            What follows is what each moment actually is, and some suggestions for how a person might
            choose to mark it. There is no obligation, no ritual you must perform. The suggestions are
            offered as a starting point — take what is useful, leave the rest.
          </Body>

          {[
            {
              name: 'Arfa',
              position: 'Lumen 28 · Day 364',
              color: '#4e6870',
              what: 'The last day of the year. The estate closes: everything the year left you, wanted or not, comes due for a decision. Not a highlight reel and not a trial — an inventory.',
              ritual: [
                'Go through the year honestly. What did it leave you that you would have chosen anyway? What are you carrying only because you have always carried it?',
                'Decide what crosses into the next year and what you refuse to carry forward.',
                'Do this before Hayta, not after. The vow lands better on a year that has actually been closed out.',
              ],
            },
            {
              name: 'Otium',
              position: 'Day 365 · outside the count',
              color: '#b8c8c8',
              what: 'The threshold day. It exists outside the 13-month structure — not part of any month, not assigned to any season. The only day of the year that asks nothing of you, on purpose: yesterday closed the year, tomorrow opens it, and neither lands if the two ends never stop touching.',
              ritual: [
                'Nothing is required. That is the whole practice.',
                'If you want one thing to do with it: notice you belong to neither year today, and let that be comfortable rather than urgent.',
                'Do not plan the next year yet — that starts tomorrow, at Hayta.',
              ],
            },
            {
              name: 'Hayta',
              position: 'Verna 1 · New Year',
              color: '#5aad3e',
              what: 'Day and night are equal length, and from here light grows. The actual new year — it has more claim to the title than January 1st ever will. This is the day the year’s vow is set: not a list of intentions, one direction the year is for.',
              ritual: [
                'Say the one thing this year is for out loud, to someone. A vow spoken is a different object than one written down.',
                'Name what you will have to refuse in order to keep it. A direction that costs nothing to hold isn’t a direction.',
                'This vow gets checked at each of the year’s other turning points — Samna, Nesti, Vona — and settled at Arfa.',
              ],
            },
            {
              name: 'Samna',
              position: 'Solaris 6–8 · summer solstice · three days',
              color: '#e8a020',
              what: 'Three days at the height of the light, built around other people rather than yourself. The point is togetherness, not duration — being genuinely with people, not merely among them for a set number of hours. In the Southern Hemisphere it sits where Christmas sits, and displaces it honestly, with the same materials: people, food, the long evening.',
              ritual: [
                'Gather. Once across the three days is enough if it is real — a long table, not a long roster.',
                'Give one purposeful thing: something made, something useful, a day of your labour. Not an obligation discharged with an object.',
                'Say the Hayta vow out loud to someone at the gathering. Has it survived the first quarter?',
              ],
            },
            {
              name: 'Nesti',
              position: 'Axia 12 · autumn equinox',
              color: '#c85428',
              what: '“Nesti” is the food packed for a journey. Equal day and night again, but now light is retreating — the balance point before the dark half of the year. Not sentimental: thanks and remembrance sit inside a practical act of provisioning.',
              ritual: [
                'What carried you through this year that you didn’t put there yourself?',
                'Who or what won’t be coming into the dark half — and what do you want to say before it closes?',
                'Name three things you will actually need before the light goes, and get one of them this week.',
              ],
            },
            {
              name: 'Vona',
              position: 'Umbra 20–22 · winter solstice · three days',
              color: '#4a6fa5',
              what: 'Hope — the specific kind that comes from knowing the dark has a floor. Three nights at the bottom of the light, across which the count turns back toward it, whether or not it feels that way yet. Not a vigil and not resolutions — the stretch built for taking the long view on purpose.',
              ritual: [
                'What is furthest from resolved right now — and can it wait for spring without cost?',
                'Name one sign, however small, that the direction is already turning.',
                'Say the Hayta vow once more, plainly, and notice whether it still sounds like what you meant in September.',
              ],
            },
            {
              name: 'Retta',
              position: 'Day 366 · roughly every 6 years · next: 12030 NE',
              color: '#c0a880',
              what: 'The calibration day. The solar year is 365.2422 days, not 365 — each Aptus year accumulates roughly a quarter-day of drift, and Retta is added as Day 366 to bring the calendar back into alignment with the actual equinox.',
              ritual: [
                'Notice it. An extra day outside the ordinary structure of the year is genuinely unusual — most years you don’t get one.',
                'Use it for something on no list. Not productive, not planned, not optimised.',
                'Consider: what would you do with a day no one could schedule over? That is Retta.',
              ],
            },
          ].map(cel => (
            <div key={cel.name} style={{ marginBottom: '2rem' }}>
              <div style={{
                padding: '1.4rem',
                background: '#1d1d1c',
                border: '1px solid #222e28',
                borderLeft: `3px solid ${cel.color}`,
                borderRadius: 6,
                marginBottom: '0.5rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.875rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                  <span style={{
                    fontFamily: 'var(--font-cormorant)',
                    fontSize: '1.4rem', fontWeight: 400, color: '#ede8de', lineHeight: 1,
                  }}>
                    {cel.name}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-dm-mono)', fontSize: '0.58rem',
                    color: cel.color, letterSpacing: '0.08em',
                  }}>
                    {[cel.position, datesFor(cel.name)].filter(Boolean).join(' · ')}
                  </span>
                </div>
                <p style={{
                  fontFamily: 'var(--font-libre)', fontSize: '0.95rem',
                  color: '#908c86', lineHeight: 1.8, margin: 0,
                }}>
                  {cel.what}
                </p>
              </div>

              {/* Ritual suggestions */}
              <div style={{
                paddingLeft: '1rem',
                borderLeft: `1px solid ${cel.color}30`,
              }}>
                <div style={{
                  fontFamily: 'var(--font-dm-mono)', fontSize: '0.62rem',
                  letterSpacing: '0.18em', textTransform: 'uppercase',
                  color: '#8a7460', marginBottom: '0.6rem', marginTop: '0.5rem',
                }}>
                  Some ways to mark it
                  <span style={{
                    marginLeft: '0.75rem',
                    fontFamily: 'var(--font-dm-mono)',
                    fontSize: '0.58rem',
                    letterSpacing: '0.06em',
                    textTransform: 'none',
                    color: '#222e28',
                    fontStyle: 'italic',
                  }}>
                    — suggestions only
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {cel.ritual.map((r, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                      <span style={{
                        fontFamily: 'var(--font-dm-mono)', fontSize: '0.62rem',
                        color: cel.color, flexShrink: 0, paddingTop: '0.35rem',
                        opacity: 0.7,
                      }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <p style={{
                        fontFamily: 'var(--font-libre)', fontStyle: 'italic',
                        fontSize: '0.9rem', color: '#c0a880', lineHeight: 1.75, margin: 0,
                      }}>
                        {r}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <Rule />

        {/* ── Thirteen Months ──────────────────────────────────── */}
        <div style={{ marginBottom: '3rem' }}>
          <Label>Thirteen Months</Label>
          <SectionTitle>The year, named for what it actually is</SectionTitle>
          <Body>
            Each month has a name drawn from its observable quality. Not a dead emperor.
            Not a number that no longer corresponds. Something you can feel.
          </Body>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {seasons.map(season => {
              const col = SEASON_COLORS[season].primary;
              return (
                <div key={season}>
                  <div style={{
                    fontFamily: 'var(--font-dm-mono)', fontSize: '0.58rem',
                    letterSpacing: '0.18em', textTransform: 'uppercase',
                    color: col, marginBottom: '0.6rem',
                    paddingBottom: '0.6rem', borderBottom: `1px solid ${col}20`,
                  }}>
                    {SEASON_LABELS[season]}
                  </div>
                  {MONTHS.filter(m => m.season === season).map(m => (
                    <div key={m.name} style={{
                      display: 'flex', gap: '1.25rem', alignItems: 'baseline',
                      padding: '0.65rem 0', borderBottom: '1px solid #232322',
                    }}>
                      <span style={{
                        fontFamily: 'var(--font-cormorant)', fontSize: '1.2rem',
                        fontWeight: 400, color: '#ede8de', minWidth: 80,
                      }}>
                        {m.name}
                      </span>
                      <span style={{
                        fontFamily: 'var(--font-dm-mono)', fontSize: '0.6rem',
                        color: col, letterSpacing: '0.1em', textTransform: 'uppercase', minWidth: 120,
                      }}>
                        {m.focus}
                      </span>
                      <span style={{
                        fontFamily: 'var(--font-libre)', fontStyle: 'italic',
                        fontSize: '0.88rem', color: '#c0a880', lineHeight: 1.55,
                      }}>
                        {m.intent}
                      </span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        <Rule />

        {/* ── Anchor dates ─────────────────────────────────────── */}
        <div style={{ marginBottom: '3rem' }}>
          <Label>Anchors</Label>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {[
              { label: 'Southern Hemisphere', date: 'Sept 22 = Verna Day 1', color: '#5aad3e' },
              { label: 'Northern Hemisphere', date: 'Mar 20 = Verna Day 1',  color: '#4a6fa5' },
            ].map(a => (
              <div key={a.label} style={{
                flex: 1, minWidth: 200,
                padding: '1.1rem 1.25rem', background: '#1d1d1c',
                border: '1px solid #222e28', borderRadius: 6,
              }}>
                <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '0.6rem', color: '#8a7460', marginBottom: '0.3rem' }}>
                  {a.label}
                </div>
                <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '0.8rem', color: a.color, letterSpacing: '0.06em' }}>
                  {a.date}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          fontFamily: 'var(--font-dm-mono)', fontSize: '0.58rem',
          color: '#222e28', letterSpacing: '0.1em', textAlign: 'center',
        }}>
          Aptus · Interoperable with Gregorian · No belief required · Southern Hemisphere default
        </div>

      </div>
    </div>
  );
}
