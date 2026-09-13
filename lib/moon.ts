/**
 * Where the moon actually is — a separate layer, not part of the structure.
 *
 * Aptus does not track the moon and cannot: its months are 28 days against the
 * moon's 29.53, so the two drift 1.53 days a month and are fully out of phase
 * inside ten. Rather than claim an alignment that isn't there, the calendar
 * shows the moon where it is and leaves it at that.
 *
 * Anchored to the measured new moon of 11 Sept 2026 03:27 UTC and advanced by
 * the mean synodic month. Checked against published new moons for Oct 2026,
 * Jun 2027 and Dec 2027: within +0.4h, -21.6h and -5.0h. The true new moon
 * swings up to about a day either side of the mean, which is ample for naming
 * a phase and the reason nothing here reports an exact time.
 */

const SYNODIC = 29.530588853;
const EPOCH = Date.UTC(2026, 8, 11, 3, 27);

export type MoonPhase =
  | 'New' | 'Waxing crescent' | 'First quarter' | 'Waxing gibbous'
  | 'Full' | 'Waning gibbous' | 'Last quarter' | 'Waning crescent';

const PHASES: MoonPhase[] = [
  'New', 'Waxing crescent', 'First quarter', 'Waxing gibbous',
  'Full', 'Waning gibbous', 'Last quarter', 'Waning crescent',
];

/** Days since the last new moon, 0 to 29.53. */
export function moonAge(date: Date = new Date()): number {
  const days = (date.getTime() - EPOCH) / 86400000;
  return ((days % SYNODIC) + SYNODIC) % SYNODIC;
}

/** Which of the eight phases the moon is nearest. */
export function moonPhase(date: Date = new Date()): MoonPhase {
  const age = moonAge(date);
  return PHASES[Math.floor((age / SYNODIC) * 8 + 0.5) % 8];
}

/** Lit fraction of the disc, 0 to 1. Coarse — see the note above. */
export function moonIllumination(date: Date = new Date()): number {
  return (1 - Math.cos((2 * Math.PI * moonAge(date)) / SYNODIC)) / 2;
}

/** True while the moon is filling rather than emptying. */
export function moonWaxing(date: Date = new Date()): boolean {
  return moonAge(date) < SYNODIC / 2;
}
