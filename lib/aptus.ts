export type Hemisphere = 'SH' | 'NH';
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
export type WeekPhase = 'Orient' | 'Engage' | 'Release' | 'Integrate';

export interface AptusMonth {
  name: string;
  focus: string;
  season: Season;
  start: number;
  end: number;
  intent: string;
  color: string;
}

export interface AptusDate {
  hemisphere: Hemisphere;
  /** Otium and Retta both sit outside the months, weeks and seasons. */
  isOutsideCount: boolean;
  isOtium: boolean;
  isRetta: boolean;
  day: number | string;
  month: string | null;
  monthIndex: number;
  monthFocus?: string;
  year: number;
  dayOfYear: number;
  dayInMonth: number;
  weekIndex: number;
  weekPhase: WeekPhase | null;
  season: Season | null;
}

export const MONTHS: AptusMonth[] = [
  { name: 'Verna',   focus: 'Initiation',      season: 'spring', start: 1,   end: 28,  color: '#4e8845', intent: 'Begin. What gets initiated now takes root for the whole year. Reduce friction, choose your one direction, and take the first real step.' },
  { name: 'Cresca',  focus: 'Growth',           season: 'spring', start: 29,  end: 56,  color: '#638c3a', intent: "Compound small actions. Growth is invisible until it isn't. Maintain the reps, resist the urge to pivot." },
  { name: 'Flora',   focus: 'Expression',       season: 'spring', start: 57,  end: 84,  color: '#829030', intent: 'Let it be seen. The work that has been building wants to surface. Share, publish, show up.' },
  { name: 'Solaris', focus: 'Visibility',       season: 'summer', start: 85,  end: 112, color: '#c8920c', intent: 'Operate at full capacity. The light is long. This is your season for volume and output.' },
  { name: 'Arden',   focus: 'Sustained Effort', season: 'summer', start: 113, end: 140, color: '#b09420', intent: 'Stay. The temptation to ease off comes early. The work done in Arden outlasts everything.' },
  { name: 'Plena',  focus: 'Harvest',          season: 'summer', start: 141, end: 168, color: '#be8c1e', intent: "Collect what you've earned. Review, consolidate, extract value from what's been built." },
  { name: 'Axia',    focus: 'Turning Point',    season: 'autumn', start: 169, end: 196, color: '#b06e25', intent: 'Something shifts. A decision becomes obvious. Trust the turning.' },
  { name: 'Valla',   focus: 'Holding',          season: 'autumn', start: 197, end: 224, color: '#a05820', intent: 'Maintain what matters. Let the rest fall. Containment is a form of power.' },
  { name: 'Lenia',   focus: 'Softening',        season: 'autumn', start: 225, end: 252, color: '#8a4820', intent: "Release grip. This is not failure — it's preparation. The system is becoming available again." },
  { name: 'Umbra',   focus: 'Stillness',        season: 'winter', start: 253, end: 280, color: '#486888', intent: 'Go inward. The most productive thing you can do in Umbra is rest without guilt.' },
  { name: 'Noctis',  focus: 'Insight',          season: 'winter', start: 281, end: 308, color: '#406280', intent: 'Think. Read. The dark months generate the ideas that spring will execute.' },
  { name: 'Spyra',   focus: 'Readiness',        season: 'winter', start: 309, end: 336, color: '#3c5c78', intent: "Prepare the conditions for what's next. Systems, tools, relationships. The coil tightens." },
  { name: 'Lumen',   focus: 'Integration',      season: 'winter', start: 337, end: 364, color: '#4e6870', intent: 'Make sense of the year. What held, what broke, what is worth carrying forward.' },
];

export const WEEK_PHASES: WeekPhase[] = ['Orient', 'Engage', 'Release', 'Integrate'];

/**
 * The month as the year in miniature: the four weeks carry the shape of the
 * four seasons. A suggestion for reading the month, not a rule for working
 * through it.
 */
export const WEEK_PHASE_DESC: Record<WeekPhase, string> = {
  Orient:    'Spring. Choose the direction and take the first step.',
  Engage:    'Summer. The work itself, at whatever volume is yours.',
  Release:   'Autumn. Let go of what isn’t holding. Stopping counts as progress.',
  Integrate: 'Winter. Consolidate what remains and make sense of it.',
};

/** The season each week rehearses — used where the mapping is shown explicitly. */
export const WEEK_PHASE_SEASON: Record<WeekPhase, Season> = {
  Orient: 'spring', Engage: 'summer', Release: 'autumn', Integrate: 'winter',
};

export const SEASON_COLORS: Record<Season, { primary: string; glow: string }> = {
  spring: { primary: '#4e8845', glow: 'rgba(78, 136, 69, 0.18)' },
  summer: { primary: '#c8920c', glow: 'rgba(200, 146, 12, 0.18)' },
  autumn: { primary: '#a05820', glow: 'rgba(160, 88, 32, 0.18)' },
  winter: { primary: '#406280', glow: 'rgba(64, 98, 128, 0.18)' },
};

// Anchors: the Gregorian date that equals Verna Day 1 of 12026 NE.
//
// Deliberately a floating local date rather than an instant — no Z, so
// everyone's 23 September is Day 1 in their own zone. Resolving the true
// equinox instant per viewer would put people either side of the date line on
// permanently different day numbers, and "it is Hayta today" would stop
// meaning one thing. Retta absorbs the drift instead.
//
// The southern date is the 23rd because the ordinals in celebrations.ts encode
// it: day 91 counted from 23 Sept is 22 Dec, the true solstice. From the 22nd
// it lands a day early, as do Nesti and Vona.
const ANCHOR_YEAR = 12026;

const ANCHORS: Record<Hemisphere, { date: Date; year: number }> = {
  SH: { date: new Date('2026-09-23T00:00:00'), year: ANCHOR_YEAR },
  NH: { date: new Date('2026-03-20T00:00:00'), year: ANCHOR_YEAR },
};

// The solar year is 365.2422 days and the counted year is 365, so every Aptus
// year loses about a quarter of a day. Retta is the day given back.
const DRIFT_PER_YEAR = 0.2422;

/**
 * Retta days absorbed before `neYear` begins. Flooring the accumulated drift
 * puts the calibration day in the year the drift completes — 12030, 12034,
 * 12038 and so on — without needing a table or a start epoch.
 *
 * Floor runs in both directions, which is the point: the converter takes
 * birthdays, and a rule that only corrects forwards puts a 1950 date 18 days
 * out. This holds the year start within a day of the true equinox from at
 * least 1900 to 2150.
 */
function rettaDaysBefore(neYear: number): number {
  return Math.floor((neYear - ANCHOR_YEAR) * DRIFT_PER_YEAR);
}

/** Days from the anchor to the first day of `neYear`. */
function daysToYearStart(neYear: number): number {
  return (neYear - ANCHOR_YEAR) * 365 + rettaDaysBefore(neYear);
}

/** 365, or 366 when the year carries a Retta day. */
export function yearLength(neYear: number): number {
  return daysToYearStart(neYear + 1) - daysToYearStart(neYear);
}

export function isRettaYear(neYear: number): boolean {
  return yearLength(neYear) === 366;
}

// Aptus days are local calendar days, so day arithmetic has to ignore
// time-of-day. Subtracting raw timestamps drifts by an hour across a DST
// changeover, which is enough to report the wrong day.
function daysBetween(from: Date, to: Date): number {
  const a = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  const b = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((b - a) / 86400000);
}

export function getAptusDate(date: Date = new Date(), hemisphere: Hemisphere = 'SH'): AptusDate {
  const { date: anchor } = ANCHORS[hemisphere];
  const daysSinceAnchor = daysBetween(anchor, date);

  // Years are 365 or 366 days, so start from the mean length and settle it.
  // The estimate is never more than one year out in either direction.
  let year = ANCHOR_YEAR + Math.floor(daysSinceAnchor / (365 + DRIFT_PER_YEAR));
  while (daysToYearStart(year) > daysSinceAnchor) year--;
  while (daysToYearStart(year + 1) <= daysSinceAnchor) year++;
  const dayOfYear = daysSinceAnchor - daysToYearStart(year) + 1;

  // Day 365 closes every year; day 366 exists only in a Retta year.
  if (dayOfYear >= 365) {
    const isRetta = dayOfYear === 366;
    return {
      hemisphere,
      isOutsideCount: true,
      isOtium: !isRetta,
      isRetta,
      day: isRetta ? 'Retta' : 'Otium',
      month: null,
      monthIndex: -1,
      year,
      dayOfYear,
      dayInMonth: 0,
      weekIndex: -1,
      weekPhase: null,
      season: null,
    };
  }

  const monthData = MONTHS.find(m => dayOfYear >= m.start && dayOfYear <= m.end)!;
  const monthIndex = MONTHS.indexOf(monthData);
  const dayInMonth = dayOfYear - monthData.start + 1;
  const weekIndex = Math.ceil(dayInMonth / 7) - 1;

  return {
    hemisphere,
    isOutsideCount: false,
    isOtium: false,
    isRetta: false,
    day: dayInMonth,
    month: monthData.name,
    monthIndex,
    monthFocus: monthData.focus,
    year,
    dayOfYear,
    dayInMonth,
    weekIndex,
    weekPhase: WEEK_PHASES[weekIndex],
    season: monthData.season,
  };
}

export function gregDateFromAptus(dayOfYear: number, neYear: number, hemisphere: Hemisphere = 'SH'): Date {
  const { date: anchor } = ANCHORS[hemisphere];
  const totalDays = daysToYearStart(neYear) + (dayOfYear - 1);
  // Step by calendar date rather than milliseconds so the result stays at
  // local midnight even when a DST boundary falls in between.
  return new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate() + totalDays);
}

export function formatGregorian(date: Date): string {
  return date.toLocaleDateString('en-NZ', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
  });
}

/** Same, without the year — for the opening end of a date range. */
export function formatGregorianShort(date: Date): string {
  return date.toLocaleDateString('en-NZ', {
    weekday: 'short', month: 'short', day: 'numeric',
  });
}
