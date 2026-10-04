'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { gregDateFromAptus, MONTHS, SEASON_COLORS, type AptusDate } from '@/lib/aptus';
import { CELEBRATIONS, observedDay } from '@/lib/celebrations';

/**
 * The landing hero: the Gregorian year drawn as a ring, then overwritten by
 * the Aptus year on the same ring. Both rings share one timeline — rotated so
 * Verna 1 sits at twelve o'clock — so the overwrite also shows where each
 * Aptus month falls against the months people already know.
 *
 * Layout only. Nothing here computes an Aptus date; the anchor comes from
 * gregDateFromAptus and today's position from the AptusDate passed in.
 */

type Phase = 'greg' | 'aptus';

const C = 200;            // centre of the 400-unit drawing
const R_RING = 126;
const RING_W = 12;
const R_NAME = 164;
const R_SUB = 180;
const R_TICK = R_RING + RING_W / 2 + 4;   // inner edge of the day scale
const R_SUN = R_RING - RING_W / 2 - 15;   // where the solar markers sit
const BRASS = '#c0a880';
const YEAR = 365;
const SWEEP = 1.7;        // seconds for the overwrite to travel the full circle
const AUTO_DELAY = 3400;  // ms the Gregorian ring is shown before it is overwritten

const GREG = [
  { name: 'January',   days: 31, origin: 'Janus, a god',      note: 'named for Janus' },
  { name: 'February',  days: 28, origin: 'Februa, a rite',    note: 'named for a Roman rite' },
  { name: 'March',     days: 31, origin: 'Mars, a god',       note: 'named for Mars' },
  { name: 'April',     days: 30, origin: 'origin unknown',    note: 'origin unknown' },
  { name: 'May',       days: 31, origin: 'Maia, a goddess',   note: 'named for Maia' },
  { name: 'June',      days: 30, origin: 'Juno, a goddess',   note: 'named for Juno' },
  { name: 'July',      days: 31, origin: 'Julius Caesar',     note: 'named for Julius Caesar' },
  { name: 'August',    days: 31, origin: 'Augustus',          note: 'named for Augustus' },
  { name: 'September', days: 30, origin: '“seventh”',         note: 'means seventh' },
  { name: 'October',   days: 31, origin: '“eighth”',          note: 'means eighth' },
  { name: 'November',  days: 30, origin: '“ninth”',           note: 'means ninth' },
  { name: 'December',  days: 31, origin: '“tenth”',           note: 'means tenth' },
];

const GREG_START: number[] = GREG.reduce<number[]>(
  (acc, m, i) => [...acc, i === 0 ? 0 : acc[i - 1] + GREG[i - 1].days], [],
);

const MONTH_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function point(deg: number, r: number) {
  const a = (deg * Math.PI) / 180;
  return { x: C + r * Math.sin(a), y: C - r * Math.cos(a) };
}

function arc(fromDeg: number, toDeg: number, r: number) {
  const s = point(fromDeg, r);
  const e = point(toDeg, r);
  const large = toDeg - fromDeg > 180 ? 1 : 0;
  return `M ${s.x.toFixed(2)} ${s.y.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${e.x.toFixed(2)} ${e.y.toFixed(2)}`;
}

const dayToDeg = (day: number) => (day / YEAR) * 360;

/** Group transform that sets text tangent to the ring, flipped upright on the lower half. */
function labelTransform(deg: number, r: number) {
  const p = point(deg, r);
  const flip = deg > 90 && deg < 270;
  return `translate(${p.x.toFixed(2)} ${p.y.toFixed(2)}) rotate(${(flip ? deg + 180 : deg).toFixed(2)})`;
}

/**
 * The sun's four stations, drawn the way an instrument would: the solstices
 * as full light and full dark, the equinoxes as light and dark in balance.
 */
const SUN_STATIONS: Record<string, { kind: 'equinox-rise' | 'summer' | 'equinox-fall' | 'winter'; label: string }> = {
  Hayta: { kind: 'equinox-rise', label: 'Spring equinox' },
  Samna: { kind: 'summer',       label: 'Summer solstice' },
  Nesti: { kind: 'equinox-fall', label: 'Autumn equinox' },
  Vona:  { kind: 'winter',       label: 'Winter solstice' },
};

function SunGlyph({ deg, kind, label }: { deg: number; kind: string; label: string }) {
  const p = point(deg, R_SUN);
  const r = 4.2;
  return (
    <g transform={`translate(${p.x.toFixed(2)} ${p.y.toFixed(2)}) rotate(${deg.toFixed(2)})`}>
      <title>{label}</title>
      <circle r={r} fill={kind === 'summer' ? BRASS : '#121110'} stroke={BRASS} strokeWidth={0.9} />
      {kind === 'equinox-rise' && <path d={`M 0 ${-r} A ${r} ${r} 0 0 1 0 ${r} Z`} fill={BRASS} />}
      {kind === 'equinox-fall' && <path d={`M 0 ${-r} A ${r} ${r} 0 0 0 0 ${r} Z`} fill={BRASS} />}
    </g>
  );
}

function RingLabel({
  deg, name, sub, color, subColor, visible, delay, strike, instant,
}: {
  deg: number; name: string; sub: string; color: string; subColor: string;
  visible: boolean; delay: number; strike?: boolean; instant: boolean;
}) {
  const nameR = R_NAME;
  const subR = R_SUB;
  const width = name.length * 6.9 + 4;
  const t = (d: number, extra = 0) => (instant ? { duration: 0 } : { duration: d, delay: delay + extra });

  return (
    <>
      <g transform={labelTransform(deg, nameR)}>
        <motion.text
          initial={false}
          animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : strike ? 0 : 4 }}
          transition={t(strike ? 0.35 : 0.5, strike && !visible ? 0.3 : 0.1)}
          textAnchor="middle"
          dominantBaseline="middle"
          style={{
            fontFamily: 'var(--font-dm-mono)', fontSize: 10.5, letterSpacing: '0.12em',
            textTransform: 'uppercase', fill: color,
          }}
        >
          {name}
        </motion.text>
        {strike && (
          <motion.line
            x1={-width / 2} x2={width / 2} y1={0} y2={0}
            stroke="#c0a880" strokeWidth={1}
            initial={false}
            animate={{ pathLength: visible ? 0 : 1, opacity: visible ? 0 : [0, 1, 1, 0] }}
            transition={instant ? { duration: 0 } : { duration: 0.65, delay, times: visible ? undefined : [0, 0.1, 0.6, 1] }}
          />
        )}
      </g>
      <g transform={labelTransform(deg, subR)}>
        <motion.text
          initial={false}
          animate={{ opacity: visible ? 1 : 0 }}
          transition={t(0.45, visible ? 0.2 : 0.25)}
          textAnchor="middle"
          dominantBaseline="middle"
          style={{
            fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontSize: 12.5,
            fill: subColor,
          }}
        >
          {sub}
        </motion.text>
      </g>
    </>
  );
}

export default function RenameRing({ today, now, isMobile }: {
  today: AptusDate; now: Date; isMobile: boolean;
}) {
  const reduce = useReducedMotion() ?? false;
  const [phase, setPhase] = useState<Phase>('greg');
  // The centre swaps to the Aptus date only once the sweep has come round.
  const [settled, setSettled] = useState(false);
  const touched = useRef(false);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function show(p: Phase) {
    setPhase(p);
    if (settleTimer.current) clearTimeout(settleTimer.current);
    if (p === 'greg') { setSettled(false); return; }
    settleTimer.current = setTimeout(() => setSettled(true), reduce ? 0 : SWEEP * 1000 * 0.55);
  }

  useEffect(() => {
    const id = setTimeout(() => { if (!touched.current) show('aptus'); }, AUTO_DELAY);
    return () => {
      clearTimeout(id);
      if (settleTimer.current) clearTimeout(settleTimer.current);
    };
    // Runs once: the overwrite plays on arrival, then belongs to the toggle.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function choose(p: Phase) {
    touched.current = true;
    show(p);
  }

  const isAptus = phase === 'aptus';
  const hemisphere = today.hemisphere;

  // Where Verna 1 falls in the Gregorian year: the ring's zero.
  const anchor = gregDateFromAptus(1, today.year, hemisphere);
  const anchorDoy = GREG_START[anchor.getMonth()] + anchor.getDate() - 1;
  const gregOffset = (m: number) => (GREG_START[m] - anchorDoy + YEAR) % YEAR;

  const todayDeg = dayToDeg(Math.min(today.dayOfYear, YEAR) - 0.5);
  const month = today.isOutsideCount ? null : MONTHS[today.monthIndex];
  const accent = month?.color ?? '#b8c8c8';
  const glow = today.season ? SEASON_COLORS[today.season].glow : 'rgba(184,200,200,0.12)';
  const delayAt = (deg: number) => (reduce ? 0 : (deg / 360) * SWEEP);
  const GAP = 0.9;  // degrees between segments

  const todayP = point(todayDeg, R_RING);

  return (
    <section style={{ position: 'relative', textAlign: 'center' }}>
      {/* ── The question ── */}
      <div style={{
        fontFamily: 'var(--font-dm-mono)', fontSize: '0.62rem', letterSpacing: '0.28em',
        textTransform: 'uppercase', color: '#8a7460',
      }}>
        A question
      </div>
      <h1 style={{
        fontFamily: 'var(--font-cormorant)',
        fontSize: isMobile ? 'clamp(2.2rem, 10vw, 3rem)' : 'clamp(2.6rem, 4.6vw, 3.6rem)',
        fontWeight: 300, lineHeight: 1.04, letterSpacing: '-0.015em',
        color: '#ede8de', margin: '0.8rem auto 0', maxWidth: 640,
      }}>
        What if we corrected<br />the calendar?
      </h1>

      <div style={{ position: 'relative', height: isMobile ? '3.4rem' : '2.6rem', marginTop: '1rem' }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={phase}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: reduce ? 0 : 0.45 }}
            style={{
              fontFamily: 'var(--font-libre)', fontStyle: 'italic',
              fontSize: isMobile ? '0.95rem' : '1.05rem', lineHeight: 1.6,
              color: '#c0a880', maxWidth: 520, margin: '0 auto',
            }}
          >
            {isAptus
              ? 'Thirteen equal ones, named for what the season is actually doing.'
              : 'Twelve uneven months, named for gods, emperors and numbers that no longer fit.'}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* ── The ring ── */}
      <div style={{ position: 'relative', maxWidth: 480, margin: isMobile ? '0.5rem -0.5rem 0' : '0.25rem auto 0' }}>
        <motion.div
          aria-hidden
          initial={false}
          animate={{ opacity: isAptus ? 1 : 0.35 }}
          transition={{ duration: reduce ? 0 : 1.6 }}
          style={{
            position: 'absolute', inset: '8%',
            background: `radial-gradient(circle at 50% 50%, ${glow}, transparent 68%)`,
            pointerEvents: 'none',
          }}
        />
        <svg
          viewBox="-12 -12 424 424"
          role="img"
          aria-label={isAptus
            ? `The Aptus year: thirteen months of 28 days, from Verna to Lumen. Today is ${today.isOutsideCount ? today.day : `${today.month} ${today.dayInMonth}`}.`
            : 'The Gregorian year: twelve months of 28 to 31 days, named for gods, emperors and numbers.'}
          style={{ display: 'block', width: '100%', height: 'auto', position: 'relative', overflow: 'visible' }}
        >
          {/* hairline track */}
          <circle cx={C} cy={C} r={R_RING + RING_W / 2 + 6} fill="none" stroke="#2d2e2b" strokeWidth={0.6} />
          <circle cx={C} cy={C} r={R_RING - RING_W / 2 - 6} fill="none" stroke="#232322" strokeWidth={0.6} />

          {/* The day scale: 365 days, identical under both calendars. Drawn in
              one by one on arrival, like a dial being engraved. */}
          <style>{`
            .rr-tick { opacity: 0; animation: rr-in 0.5s ease-out forwards; }
            @keyframes rr-in { to { opacity: 1; } }
            @media (prefers-reduced-motion: reduce) { .rr-tick { animation: none; opacity: 1; } }
          `}</style>
          {Array.from({ length: YEAR }, (_, d) => {
            const deg = dayToDeg(d);
            const a = point(deg, R_TICK);
            const b = point(deg, R_TICK + 3.2);
            return (
              <line
                key={d} className="rr-tick"
                x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke={BRASS} strokeWidth={0.45} strokeOpacity={0.45}
                style={{ animationDelay: `${(d / YEAR) * 1.4}s` }}
              />
            );
          })}
          {/* Aptus weeks: every month restarts on a week, so the long ticks repeat exactly */}
          {MONTHS.flatMap((_, i) => [0, 7, 14, 21].map(w => {
            const deg = dayToDeg(i * 28 + w);
            const a = point(deg, R_TICK);
            const b = point(deg, R_TICK + (w === 0 ? 9 : 6));
            return (
              <motion.line
                key={`${i}-${w}`}
                x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke={w === 0 ? '#ede8de' : BRASS} strokeWidth={w === 0 ? 0.9 : 0.7}
                initial={false}
                animate={{ opacity: isAptus ? (w === 0 ? 0.7 : 0.6) : 0 }}
                transition={reduce ? { duration: 0 } : { duration: 0.4, delay: delayAt(deg) + 0.2 }}
              />
            );
          }))}
          {/* Gregorian month boundaries on the same scale */}
          {GREG.map((m, i) => {
            const deg = dayToDeg(gregOffset(i));
            const a = point(deg, R_TICK);
            const b = point(deg, R_TICK + 9);
            return (
              <motion.line
                key={m.name}
                x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke={BRASS} strokeWidth={0.9}
                initial={false}
                animate={{ opacity: isAptus ? 0 : 0.6 }}
                transition={reduce ? { duration: 0 } : { duration: 0.3, delay: delayAt(deg) * 0.8 }}
              />
            );
          })}

          {/* The sun's four stations — where the Aptus year actually hinges */}
          {CELEBRATIONS.filter(c => SUN_STATIONS[c.name]).map(c => {
            const day = observedDay(c, hemisphere);
            if (day === null) return null;
            const st = SUN_STATIONS[c.name];
            return <SunGlyph key={c.name} deg={dayToDeg(day - 0.5)} kind={st.kind} label={`${c.name} · ${st.label}`} />;
          })}

          {/* Gregorian segments: unequal, unnamed by season */}
          {GREG.map((m, i) => {
            const from = dayToDeg(gregOffset(i));
            const to = from + dayToDeg(m.days);
            const mid = (from + to) / 2;
            return (
              <motion.path
                key={m.name}
                d={arc(from + GAP / 2, to - GAP / 2, R_RING)}
                fill="none" stroke={BRASS} strokeWidth={RING_W}
                initial={false}
                animate={{ opacity: isAptus ? 0 : 0.13 }}
                transition={reduce ? { duration: 0 } : { duration: 0.4, delay: delayAt(mid % 360) + 0.15 }}
              />
            );
          })}

          {/* Aptus segments: thirteen equal, coloured by season */}
          {MONTHS.map((m, i) => {
            const from = dayToDeg(i * 28);
            const to = dayToDeg((i + 1) * 28);
            const isNow = i === today.monthIndex;
            return (
              <motion.path
                key={m.name}
                d={arc(from + GAP / 2, to - GAP / 2, R_RING)}
                fill="none" stroke={m.color} strokeWidth={isNow ? RING_W + 5 : RING_W}
                initial={false}
                animate={{ pathLength: isAptus ? 1 : 0, opacity: isAptus ? (isNow ? 1 : 0.82) : 0 }}
                transition={reduce ? { duration: 0 } : { duration: SWEEP / 13 + 0.15, delay: delayAt(from), ease: 'easeOut' }}
              />
            );
          })}

          {/* Otium: the one day outside the months */}
          <motion.circle
            cx={point(dayToDeg(364.5), R_RING).x} cy={point(dayToDeg(364.5), R_RING).y} r={2.6}
            fill="#a080b8"
            initial={false}
            animate={{ opacity: isAptus ? 1 : 0 }}
            transition={reduce ? { duration: 0 } : { duration: 0.4, delay: SWEEP }}
          >
            <title>Otium — day 365, outside the count</title>
          </motion.circle>

          {/* Gregorian labels, struck through as the sweep passes */}
          {GREG.map((m, i) => {
            const mid = (dayToDeg(gregOffset(i)) + dayToDeg(m.days) / 2) % 360;
            return (
              <RingLabel
                key={m.name} deg={mid} name={m.name} sub={m.origin}
                color="#9a8870" subColor="#7a6a58"
                visible={!isAptus} delay={delayAt(mid) * 0.8} strike instant={reduce}
              />
            );
          })}

          {/* Aptus labels */}
          {MONTHS.map((m, i) => {
            const mid = dayToDeg(i * 28 + 14);
            const isNow = i === today.monthIndex;
            return (
              <RingLabel
                key={m.name} deg={mid} name={m.name} sub={m.focus}
                color={isNow ? '#ede8de' : m.color} subColor={isNow ? '#c0a880' : '#7a6a58'}
                visible={isAptus} delay={delayAt(mid) + 0.25} instant={reduce}
              />
            );
          })}

          {/* Today */}
          <line
            x1={point(todayDeg, R_RING - RING_W / 2 - 4).x} y1={point(todayDeg, R_RING - RING_W / 2 - 4).y}
            x2={point(todayDeg, R_TICK + 12).x} y2={point(todayDeg, R_TICK + 12).y}
            stroke="#ede8de" strokeWidth={0.9} strokeOpacity={0.85}
          />
          <circle cx={todayP.x} cy={todayP.y} r={9} fill="#ede8de" opacity={0.12}>
            {!reduce && <animate attributeName="r" values="6;12;6" dur="3.2s" repeatCount="indefinite" />}
          </circle>
          <circle cx={todayP.x} cy={todayP.y} r={3.6} fill="#ede8de" stroke="#121110" strokeWidth={1.5} />
        </svg>

        {/* ── Centre: today, in whichever calendar is showing ── */}
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', pointerEvents: 'none',
        }}>
          <div style={{
            fontFamily: 'var(--font-dm-mono)', fontSize: isMobile ? '0.5rem' : '0.58rem',
            letterSpacing: '0.28em', textTransform: 'uppercase', color: '#8a7460',
          }}>
            Today
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={settled ? 'a' : 'g'}
              initial={{ opacity: 0, filter: 'blur(6px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, filter: 'blur(6px)' }}
              transition={{ duration: reduce ? 0 : 0.5 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
              <div style={{
                fontFamily: 'var(--font-cormorant)', fontWeight: 300,
                fontSize: isMobile ? 'clamp(1.9rem, 9vw, 2.5rem)' : '3rem',
                lineHeight: 1.05, color: '#ede8de', margin: '0.35rem 0 0.4rem',
                whiteSpace: 'nowrap',
              }}>
                {settled
                  ? (today.isOutsideCount ? today.day : `${today.month} ${today.dayInMonth}`)
                  : `${now.getDate()} ${MONTH_FULL[now.getMonth()]}`}
              </div>
              <div style={{
                fontFamily: 'var(--font-dm-mono)', fontSize: isMobile ? '0.52rem' : '0.6rem',
                letterSpacing: '0.16em', textTransform: 'uppercase',
                color: settled ? accent : '#6a5c4c',
              }}>
                {settled
                  ? `${today.year} NE · ${month?.focus ?? (today.isRetta ? 'Calibration day' : 'Outside the count')}`
                  : `${now.getFullYear()} CE · ${GREG[now.getMonth()].note}`}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── Toggle ── */}
      <div
        role="tablist"
        aria-label="Calendar shown on the ring"
        style={{
          display: 'inline-flex', marginTop: isMobile ? '0.75rem' : '0.5rem',
          border: '1px solid #2d2e2b', borderRadius: 99, padding: 3, gap: 2,
        }}
      >
        {(['greg', 'aptus'] as const).map(p => {
          const on = phase === p;
          return (
            <button
              key={p}
              role="tab"
              aria-selected={on}
              onClick={() => choose(p)}
              style={{
                position: 'relative', border: 'none', cursor: 'pointer', background: 'transparent',
                borderRadius: 99, padding: '0.45rem 1.1rem',
                fontFamily: 'var(--font-dm-mono)', fontSize: '0.6rem', letterSpacing: '0.16em',
                textTransform: 'uppercase', color: on ? '#121110' : '#9a8870',
                transition: 'color 0.3s',
              }}
            >
              {on && (
                <motion.span
                  layoutId="ring-toggle"
                  transition={{ duration: reduce ? 0 : 0.35 }}
                  style={{
                    position: 'absolute', inset: 0, borderRadius: 99,
                    background: p === 'aptus' ? accent : '#9a8870',
                  }}
                />
              )}
              <span style={{ position: 'relative' }}>{p === 'greg' ? 'Gregorian' : 'Aptus'}</span>
            </button>
          );
        })}
      </div>

      <div style={{
        fontFamily: 'var(--font-dm-mono)', fontSize: '0.56rem', letterSpacing: '0.12em',
        color: '#6a5c4c', marginTop: '0.9rem', textTransform: 'uppercase',
      }}>
        {hemisphere === 'SH' ? 'Southern' : 'Northern'} Hemisphere · the year opens at the spring equinox, {anchor.getDate()} {MONTH_FULL[anchor.getMonth()]}
      </div>
    </section>
  );
}
