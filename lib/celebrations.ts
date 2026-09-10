import { gregDateFromAptus, type AptusDate, type Hemisphere } from './aptus';

// ── Data ──────────────────────────────────────────────────────────
// Kafla: the three-day hinge. Turns: the other three vow-check points.
// Retta: the rare calibration day, outside the annual cycle.

export type CelKind = 'hinge' | 'turn' | 'calibration';

export interface Celebration {
  name: string;
  kind: CelKind;
  dayOfYear: number | null; // null for Retta — not a fixed annual day
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
    position: 'Solaris 7 · summer solstice',
    color: '#e8a020',
    meaning: 'The longest light, and the one day built around other people instead of yourself. In the Southern Hemisphere it lands where Christmas lands — Samna displaces it honestly, with the same materials.',
    practice: [
      'Be somewhere with people, for the length of the day — not an hour, all of it.',
      'Give one purposeful thing: something made, something useful, a day of your labour.',
      'Say one true thing to someone while they are standing in front of you.',
      'The check: say the Hayta vow out loud to someone at the gathering. Has it survived the first quarter?',
    ],
  },
  {
    name: 'Nesti',
    kind: 'turn',
    dayOfYear: 180,
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
    position: 'Umbra 21 · winter solstice',
    color: '#4a6fa5',
    meaning: '“Vona” is hope — the kind that comes from knowing the dark has a floor. The longest night, and the point the count turns back toward light, whether or not it feels that way yet.',
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
    position: 'Day 366 · roughly every 6 years · next: 12030 NE',
    color: '#c0a880',
    meaning: 'The solar year is 365.2422 days, not 365. Every Aptus year drifts a little; Retta is added as Day 366 to bring the calendar back into true. Kept an Old Norse name by choice, even though it is pure mechanism.',
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

/** Days from today until the next occurrence. null when there is no fixed annual day. */
export function daysUntil(today: AptusDate, target: number | null): number | null {
  if (target === null) return null;
  return (target - doyOf(today) + 365) % 365;
}

/** The NE year the next occurrence falls in — next year once the day has passed. */
export function yearOfNext(today: AptusDate, target: number): number {
  return target >= doyOf(today) ? today.year : today.year + 1;
}

/** Gregorian date of the next occurrence. null for celebrations with no fixed day. */
export function nextGregorian(
  today: AptusDate,
  cel: Celebration,
  hemisphere: Hemisphere,
): Date | null {
  if (cel.dayOfYear === null) return null;
  return gregDateFromAptus(cel.dayOfYear, yearOfNext(today, cel.dayOfYear), hemisphere);
}

export interface UpcomingCelebration {
  celebration: Celebration;
  daysAway: number;
}

/** The soonest celebration with a fixed annual day — today's, if one lands today. */
export function nextCelebration(today: AptusDate): UpcomingCelebration | null {
  let soonest: UpcomingCelebration | null = null;
  for (const celebration of CELEBRATIONS) {
    const daysAway = daysUntil(today, celebration.dayOfYear);
    if (daysAway === null) continue;
    if (!soonest || daysAway < soonest.daysAway) soonest = { celebration, daysAway };
  }
  return soonest;
}
