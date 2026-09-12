import {
  gregDateFromAptus,
  formatGregorian,
  formatGregorianShort,
  type AptusDate,
  type Hemisphere,
} from './aptus';

// ── Data ──────────────────────────────────────────────────────────
// Kafla: the three-day hinge. Turns: the other three vow-check points.
// Retta: the rare calibration day, outside the annual cycle.

export type CelKind = 'hinge' | 'turn' | 'calibration';

export interface Celebration {
  name: string;
  kind: CelKind;
  dayOfYear: number | null; // the observed day; null for Retta — no fixed annual day
  days: number;             // length of the celebration; the observed day sits in the middle
  position: string;
  color: string;
  meaning: string;
  practice: string[];
}

export const CELEBRATIONS: Celebration[] = [
  {
    name: 'Arfa',
    kind: 'hinge',
    dayOfYear: 364,
    days: 1,
    position: 'Lumen 28 · the last day of the year',
    color: '#4e6870',
    meaning: 'The year is an estate, and you are its heir. Not everything left to you is wanted — an heir can take or refuse. Today you go through the estate honestly and decide what crosses into the next year.',
    practice: [
      'What did this year ask of me that I didn’t expect?',
      'What has it left me that I’d want even if I had chosen it deliberately?',
      'What have I been quietly telling myself about who I am — and does the evidence still hold?',
      'What am I carrying only because I have always carried it?',
      'What am I ready to refuse?',
    ],
  },
  {
    name: 'Otium',
    kind: 'hinge',
    dayOfYear: 365,
    days: 1,
    position: 'Day 365 · outside the count',
    color: '#b8c8c8',
    meaning: 'No month, no week, no number. The only day of the year that asks nothing of you — on purpose. Yesterday settled the estate; tomorrow sets the vow. Today belongs to neither.',
    practice: [
      'Nothing is required. That is the whole practice.',
      'If you want one thing to do with it: notice you are between two years and belong to neither, and let that be comfortable rather than urgent.',
    ],
  },
  {
    name: 'Hayta',
    kind: 'hinge',
    dayOfYear: 1,
    days: 1,
    position: 'Verna 1 · New Year’s Day',
    color: '#5aad3e',
    meaning: 'A vow is not a plan. A plan is a list of things you intend to do; a vow is one thing you intend to be true. Today is when you say it — then hold it up to the light at Samna, Nesti and Vona.',
    practice: [
      'What is the one thing this year is for? Not a list — one direction.',
      'If the year had a single word, what would I want that word to be?',
      'What will I have to refuse in order to keep this?',
      'Who should hear it?',
    ],
  },
  {
    name: 'Samna',
    kind: 'turn',
    dayOfYear: 91,
    days: 3,
    position: 'Solaris 6–8 · summer solstice',
    color: '#e8a020',
    meaning: 'Three days at the height of the light, built around other people rather than yourself. The point is togetherness, not duration — being genuinely with people, not merely among them for a set number of hours. In the Southern Hemisphere it lands where Christmas lands, and displaces it honestly, with the same materials.',
    practice: [
      'Gather. Once across the three days is enough if it is real — a long table, not a long roster.',
      'Give one purposeful thing: something made, something useful, a day of your labour.',
      'Say one true thing to someone while they are standing in front of you.',
      'The check: say the Hayta vow out loud to someone at the gathering. Has it survived the first quarter?',
    ],
  },
  {
    name: 'Nesti',
    kind: 'turn',
    dayOfYear: 180,
    days: 1,
    position: 'Axia 12 · autumn equinox',
    color: '#c85428',
    meaning: '“Nesti” is the food packed for a journey. Light is retreating now — the balance point before the dark half of the year. Thanks and remembrance sit inside a practical act of provisioning.',
    practice: [
      'What carried me through this year that I didn’t put there myself?',
      'Who or what won’t be coming into the dark half — and what do I want to say before it closes?',
      'What will I actually need before the light goes? Name three, and get one of them this week.',
      'The check: measured against the Hayta vow, am I still packing for the same journey?',
    ],
  },
  {
    name: 'Vona',
    kind: 'turn',
    dayOfYear: 273,
    days: 3,
    position: 'Umbra 20–22 · winter solstice',
    color: '#4a6fa5',
    meaning: 'Hope — the kind that comes from knowing the dark has a floor. Three nights at the bottom of the light, across which the count turns back toward it, whether or not it feels that way yet.',
    practice: [
      'What is furthest from resolved right now — and can it wait for spring without costing me anything?',
      'What is one sign, however small, that the direction is already turning?',
      'What do I want to be true by the time Hayta comes around again?',
      'The check: say the Hayta vow once, plainly. Does it still sound like what I meant in September?',
    ],
  },
  {
    name: 'Retta',
    kind: 'calibration',
    dayOfYear: null,
    days: 1,
    position: 'Day 366 · roughly every 6 years · next: 12030 NE',
    color: '#c0a880',
    meaning: 'The solar year is 365.2422 days, not 365. Every Aptus year drifts a little; Retta is added as Day 366 to bring the calendar back into true.',
    practice: [
      'Notice it. An extra day outside the ordinary structure of the year is genuinely unusual.',
      'Use it for something on no list. Not productive, not planned, not optimised.',
      'Consider: what would you do with a day no one could schedule over?',
    ],
  },
];

export const KIND_LABEL: Record<CelKind, string> = {
  hinge: 'Kafla — the hinge',
  turn: 'Vow check',
  calibration: 'Calibration',
};

// ── Timing ────────────────────────────────────────────────────────
// Celebrations recur annually, so a day already past this year resolves
// to next year's occurrence. Retta has no fixed day and is excluded.

function doyOf(today: AptusDate): number {
  return today.isOtium ? 365 : today.dayOfYear;
}

const wrap = (doy: number): number => ((doy - 1 + 365) % 365) + 1;

/** First day of the celebration. A multi-day span is centred on the observed day. */
export function startDay(cel: Celebration): number | null {
  if (cel.dayOfYear === null) return null;
  return wrap(cel.dayOfYear - Math.floor((cel.days - 1) / 2));
}

/** Last day of the celebration. Same as the first for a single-day celebration. */
export function endDay(cel: Celebration): number | null {
  const start = startDay(cel);
  return start === null ? null : wrap(start + cel.days - 1);
}

/** True while today falls anywhere inside the celebration. */
export function isActive(today: AptusDate, cel: Celebration): boolean {
  const start = startDay(cel);
  if (start === null) return false;
  return (doyOf(today) - start + 365) % 365 < cel.days;
}

/** Days until the celebration begins; 0 for every day it is running. */
export function daysUntil(today: AptusDate, cel: Celebration): number | null {
  const start = startDay(cel);
  if (start === null) return null;
  if (isActive(today, cel)) return 0;
  return (start - doyOf(today) + 365) % 365;
}

/** The NE year the next occurrence falls in — next year once the day has passed. */
export function yearOfNext(today: AptusDate, target: number): number {
  return target >= doyOf(today) ? today.year : today.year + 1;
}

/**
 * Gregorian dates of the current or next occurrence. While a celebration is
 * running, this is the occurrence in progress, not next year's.
 */
export function occurrence(
  today: AptusDate,
  cel: Celebration,
  hemisphere: Hemisphere,
): { start: Date; end: Date } | null {
  const start = startDay(cel);
  if (start === null) return null;
  const year = isActive(today, cel) ? today.year : yearOfNext(today, start);
  const startDate = gregDateFromAptus(start, year, hemisphere);
  return {
    start: startDate,
    end: new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate() + cel.days - 1,
    ),
  };
}

/** "Sun, 20 Dec 2026", or "Sun, 20 Dec – Tue, 22 Dec 2026" across a span. */
export function formatOccurrence(
  today: AptusDate,
  cel: Celebration,
  hemisphere: Hemisphere,
): string | null {
  const when = occurrence(today, cel, hemisphere);
  if (!when) return null;
  if (cel.days === 1) return formatGregorian(when.start);
  return `${formatGregorianShort(when.start)} – ${formatGregorian(when.end)}`;
}

export interface UpcomingCelebration {
  celebration: Celebration;
  daysAway: number;
}

/** The soonest celebration with a fixed annual day — today's, if one is running. */
export function nextCelebration(today: AptusDate): UpcomingCelebration | null {
  let soonest: UpcomingCelebration | null = null;
  for (const celebration of CELEBRATIONS) {
    const daysAway = daysUntil(today, celebration);
    if (daysAway === null) continue;
    if (!soonest || daysAway < soonest.daysAway) soonest = { celebration, daysAway };
  }
  return soonest;
}
