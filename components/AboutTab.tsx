'use client';

import { MONTHS, SEASON_COLORS, WEEK_PHASES, WEEK_PHASE_DESC, type Season } from '@/lib/aptus';

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
      color: '#5a5248',
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
      color: '#c0bcb6',
      lineHeight: 1.9,
      marginBottom: '1.1rem',
      ...style,
    }}>
      {children}
    </p>
  );
}

function Rule() {
  return <div style={{ height: 1, background: '#2a2520', margin: '2.5rem 0' }} />;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      fontFamily: 'var(--font-cormorant)',
      fontSize: 'clamp(1.8rem, 3vw, 2.4rem)',
      fontWeight: 300,
      color: '#f0ede8',
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
      background: '#191714',
      border: '1px solid #2a2520',
      borderLeft: accent ? `3px solid ${accent}` : '1px solid #2a2520',
      borderRadius: 6,
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.875rem', marginBottom: '0.6rem', flexWrap: 'wrap' }}>
        <span style={{
          fontFamily: 'var(--font-cormorant)',
          fontSize: '1.2rem',
          fontWeight: 400,
          color: '#f0ede8',
          lineHeight: 1,
        }}>
          {title}
        </span>
        {subtitle && (
          <span style={{
            fontFamily: 'var(--font-dm-mono)',
            fontSize: '0.58rem',
            color: accent ?? '#5a5248',
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
  return (
    <div style={{ height: '100%', overflow: 'hidden auto', display: 'flex', justifyContent: 'center', padding: '3rem 2rem 5rem' }}>
      <div style={{ width: '100%', maxWidth: 700 }}>

        {/* ── Opening ──────────────────────────────────────────── */}
        <div style={{ marginBottom: '3rem' }}>
          <Label>About Aptus</Label>
          <SectionTitle>
            The Gregorian calendar wasn't designed.<br />
            <span style={{ fontStyle: 'italic', color: '#7a7368' }}>It just kept getting patched.</span>
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
            The original Roman calendar had <strong style={{ color: '#f0ede8', fontWeight: 400 }}>ten months</strong> and
            began in March. In order, they were: Martius, Aprilis, Maius, Junius, Quintilis, Sextilis,
            September, October, November, December. The last four were simply named after their position —
            the 7th, 8th, 9th, and 10th months. This was honest. It made sense.
          </Body>
          <Body>
            Then January and February were added. The year was shifted to start in January. Nobody renamed the
            last four months. September, which means <em>seventh</em>, became the ninth. October, meaning
            <em> eighth</em>, became the tenth. The calendar had been factually incorrect for over two thousand
            years before anyone reading this was born — and the chance that anyone in your lifetime will fix it
            is essentially zero. We just all agree to live with the lie.
          </Body>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem' }}>
            <Card
              title="Julius Caesar, 46 BCE"
              accent="#e8a020"
              body="The Roman calendar had drifted so badly it was three months out of alignment with the seasons. Caesar brought in Egyptian astronomers to reform it. He invented the 365-day year, established the 12-month structure, and introduced the leap year. He also renamed Quintilis (the 5th month) after himself — July. A reasonable man might have renumbered the months while he was at it. He did not."
            />
            <Card
              title="Augustus Caesar and the stolen day"
              accent="#c85428"
              body="The month Sextilis was renamed August to honour Augustus. But July, named for Julius, had 31 days. August only had 30. This was considered an insult — his month was shorter than his predecessor's. Augustus solved this by taking a day from February, giving August 31 days. February was already the shortest month. It became shorter. This is why February exists as it does: not astronomy, not logic, but the bruised ego of a Roman emperor."
            />
            <Card
              title="The Southern Hemisphere problem"
              accent="#4a6fa5"
              body="The Gregorian calendar was designed in Rome, refined in Europe, and imposed globally through colonisation. Every seasonal reference — spring lamb, autumn harvest, winter solstice, summer heat — is Northern Hemisphere experience treated as universal truth. For New Zealand, Australia, South Africa, South America, and much of the Global South: December is summer, June is winter, and the calendar's seasonal language has never matched the sky outside the window. This is not a minor inconvenience. It is the dominant calendar of the world describing half the world's seasons backwards."
            />
            <Card
              title="The uneven month problem"
              accent="#5a5248"
              body="Months consist of 28, 29, 30, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 days. There is no pattern. There is no reason. 'Thirty days hath September' exists as a mnemonic because the calendar is so arbitrary it needs a nursery rhyme to remember how long its months are. Aptus has one rule: every month is 28 days. You will never need the rhyme again."
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
            for growth actually begin. Day 365 is Lacuna: a threshold day outside the structure, for the pause
            between years. Every six years, Aequa is added as a calibration day to keep the calendar true to
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
              { n: '365', label: 'Days — 364 in months + Lacuna' },
              { n: '+10,000', label: 'Year offset — Natural Era (NE)' },
            ].map(item => (
              <div key={item.n} style={{
                padding: '1.1rem 1.25rem',
                background: '#191714',
                border: '1px solid #2a2520',
                borderRadius: 6,
              }}>
                <div style={{
                  fontFamily: 'var(--font-cormorant)',
                  fontSize: '2rem',
                  fontWeight: 300,
                  color: '#f0ede8',
                  lineHeight: 1,
                  marginBottom: '0.3rem',
                }}>
                  {item.n}
                </div>
                <div style={{
                  fontFamily: 'var(--font-dm-mono)',
                  fontSize: '0.6rem',
                  color: '#5a5248',
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
                background: '#191714', border: '1px solid #2a2520', borderRadius: 6,
              }}>
                <div style={{
                  fontFamily: 'var(--font-dm-mono)', fontSize: '0.55rem',
                  color: '#3d3830', paddingTop: '0.15rem', flexShrink: 0, width: 20,
                }}>
                  W{i + 1}
                </div>
                <div>
                  <div style={{
                    fontFamily: 'var(--font-cormorant)', fontSize: '1.25rem',
                    fontWeight: 400, color: '#f0ede8', marginBottom: '0.2rem', lineHeight: 1,
                  }}>
                    {phase}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-libre)', fontStyle: 'italic',
                    fontSize: '0.9rem', color: '#7a7368', lineHeight: 1.65,
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
          <SectionTitle>Six moments the sky actually marks</SectionTitle>
          <Body>
            These are not invented. Every culture that has lived close enough to the land to pay attention
            has marked these six turning points. The equinoxes and solstices are astronomical events —
            measurable, precise, occurring whether or not anyone acknowledges them. Lacuna and Aequa are
            structural features of the Aptus calendar built around those events.
          </Body>
          <Body>
            What follows is what each moment actually is, and some suggestions for how a person might
            choose to mark it. There is no obligation, no ritual you must perform. The suggestions are
            offered as a starting point — take what is useful, leave the rest.
          </Body>

          {[
            {
              name: 'Spring Equinox — New Year',
              timing: 'Verna Day 1 · Sept 22 SH / Mar 20 NH',
              color: '#5aad3e',
              what: 'Day and night are equal length. From this point, light grows. The hemisphere is tilting back toward the sun — not metaphorically, literally. Energy is increasing. The biological pressure to begin is real.',
              ritual: [
                'Write one intention for the year. Not a list — one thing. The thing that, if it happened, would make the year feel like it meant something.',
                'Go outside at or before dawn. Watch the light arrive. This is the actual new year. It has more claim to that title than January 1st ever will.',
                'Clear something you have been putting off. The equinox is a hinge. What you do in the first week of Verna tends to compound.',
              ],
            },
            {
              name: 'Summer Solstice',
              timing: 'Around Solaris 15 · Dec 21–22 SH / Jun 20–21 NH',
              color: '#e8a020',
              what: 'The longest day. Maximum light. Peak solar energy. The solstice lands in the middle of Solaris — the month of Visibility — by design. This is the apex of the year\'s output phase.',
              ritual: [
                'Be outside for as much of the long day as possible. The solstice is the one day you should not spend inside.',
                'Audit what you started in spring. Is it growing? Is it what you actually wanted? The solstice is the last good moment to correct course before harvest.',
                'Mark the evening with fire if you can. Bonfire, candle, whatever the context allows. Cultures across history have done exactly this on this night because it works.',
              ],
            },
            {
              name: 'Autumn Equinox',
              timing: 'Around Axia 1 · Mar 20–21 SH / Sept 22 NH',
              color: '#c85428',
              what: 'Equal day and night again, but now light is retreating. The balance point before the dark half of the year. Axia means turning point — because this is one.',
              ritual: [
                'Take honest stock of the year so far. What did you build? What did you abandon? What are you proud of? Write it down, not to judge but to see clearly.',
                'Decide what to carry into winter. Winter is not a time for new projects — it is a time for depth. Choose what deserves your depth.',
                'Share a meal with people who matter. The autumn equinox is the harvest moment. The old harvest festivals were not sentimental — they were practical: what did we grow, and who do we share it with?',
              ],
            },
            {
              name: 'Winter Solstice',
              timing: 'Around Umbra 15 · Jun 20–21 SH / Dec 21–22 NH',
              color: '#4a6fa5',
              what: 'The longest night. The nadir. Every pre-industrial culture marked this night because it is the bottom of the arc — after this, the light returns. That is genuinely worth acknowledging.',
              ritual: [
                'Rest. Not "unwind" — actually rest. The solstice night is the one night of the year that has the most biological and astronomical permission for stillness. Use it.',
                'Turn off screens earlier than usual. Sit with the dark. Most of us have never actually experienced intentional darkness. The solstice night is the right occasion.',
                'Write nothing. Plan nothing. Do not make lists or set intentions. The time for that is Lacuna and the equinox. Tonight, let the year be what it was.',
              ],
            },
            {
              name: 'Lacuna',
              timing: 'Day 365 · Sept 21 SH / Mar 19 NH',
              color: '#9a9390',
              what: 'The threshold day. It exists outside the 13-month structure — not part of any month, not assigned to any season. The solar year is not exactly 364 days, so rather than distorting a month to absorb the remainder, Aptus gives it its own name and identity.',
              ritual: [
                'Conduct a year review. Not a performance review — a genuine accounting. What happened? What worked? What broke? What surprised you? Write it in whatever form suits you.',
                'Do not plan the next year yet. Lacuna is not for planning — it is for witnessing. The intention-setting happens on Verna Day 1. Today is for looking back.',
                'Treat it as genuinely liminal. You are between years. Nothing is due. Nothing is urgent. This is one of the few days the calendar actually gives you.',
              ],
            },
            {
              name: 'Aequa',
              timing: 'Day 366 · Next: 12030 NE (Gregorian ~Sept 2031)',
              color: '#7a7368',
              what: 'The calibration day. The solar year is 365.2422 days — not 365. Each Aptus year accumulates roughly a quarter-day of drift. After about five years that drift exceeds a full day, and Aequa is added as Day 366 to bring the calendar back into alignment with the actual equinox. It occurs approximately every 4–5 years. The next one falls in 12030 NE.',
              ritual: [
                'When Aequa comes, notice it. An extra day outside the ordinary structure of the year is genuinely unusual. Most years you do not get one.',
                'Use it for something that is on no list. Not productive, not planned, not optimised. Aequa is the gift of an unclaimed day. The only rule is that you do not waste it on the ordinary.',
                'Consider: what would you do if you had a day that no one could schedule over? That is Aequa. The answer to that question probably tells you something.',
              ],
            },
          ].map(cel => (
            <div key={cel.name} style={{ marginBottom: '2rem' }}>
              <div style={{
                padding: '1.4rem',
                background: '#191714',
                border: '1px solid #2a2520',
                borderLeft: `3px solid ${cel.color}`,
                borderRadius: 6,
                marginBottom: '0.5rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.875rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                  <span style={{
                    fontFamily: 'var(--font-cormorant)',
                    fontSize: '1.4rem', fontWeight: 400, color: '#f0ede8', lineHeight: 1,
                  }}>
                    {cel.name}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-dm-mono)', fontSize: '0.58rem',
                    color: cel.color, letterSpacing: '0.08em',
                  }}>
                    {cel.timing}
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
                  fontFamily: 'var(--font-dm-mono)', fontSize: '0.55rem',
                  letterSpacing: '0.18em', textTransform: 'uppercase',
                  color: '#3d3830', marginBottom: '0.6rem', marginTop: '0.5rem',
                }}>
                  Some ways to mark it
                  <span style={{
                    marginLeft: '0.75rem',
                    fontFamily: 'var(--font-dm-mono)',
                    fontSize: '0.5rem',
                    letterSpacing: '0.06em',
                    textTransform: 'none',
                    color: '#2a2520',
                    fontStyle: 'italic',
                  }}>
                    — suggestions only
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {cel.ritual.map((r, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                      <span style={{
                        fontFamily: 'var(--font-dm-mono)', fontSize: '0.55rem',
                        color: cel.color, flexShrink: 0, paddingTop: '0.35rem',
                        opacity: 0.7,
                      }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <p style={{
                        fontFamily: 'var(--font-libre)', fontStyle: 'italic',
                        fontSize: '0.9rem', color: '#7a7368', lineHeight: 1.75, margin: 0,
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
                      padding: '0.65rem 0', borderBottom: '1px solid #1e1b18',
                    }}>
                      <span style={{
                        fontFamily: 'var(--font-cormorant)', fontSize: '1.2rem',
                        fontWeight: 400, color: '#f0ede8', minWidth: 80,
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
                        fontSize: '0.88rem', color: '#7a7368', lineHeight: 1.55,
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
                padding: '1.1rem 1.25rem', background: '#191714',
                border: '1px solid #2a2520', borderRadius: 6,
              }}>
                <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '0.6rem', color: '#5a5248', marginBottom: '0.3rem' }}>
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
          color: '#2a2520', letterSpacing: '0.1em', textAlign: 'center',
        }}>
          Aptus · Interoperable with Gregorian · No belief required · Southern Hemisphere default
        </div>

      </div>
    </div>
  );
}
