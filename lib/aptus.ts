export type Hemisphere = 'SH' | 'NH';
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
export type WeekPhase = 'Orient' | 'Engage' | 'Amplify' | 'Integrate';

export interface AptusMonth {
  name: string;
  focus: string;
  season: Season;
  start: number;
  end: number;
  intent: string;
}

export interface AptusDate {
  isLacuna: boolean;
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
  { name: 'Verna',   focus: 'Initiation',      season: 'spring', start: 1,   end: 28,  intent: 'Begin. What gets initiated now takes root for the whole year. Reduce friction, choose your one direction, and take the first real step.' },
  { name: 'Cresca',  focus: 'Growth',           season: 'spring', start: 29,  end: 56,  intent: "Compound small actions. Growth is invisible until it isn't. Maintain the reps, resist the urge to pivot." },
  { name: 'Flora',   focus: 'Expression',       season: 'spring', start: 57,  end: 84,  intent: 'Let it be seen. The work that has been building wants to surface. Share, publish, show up.' },
  { name: 'Solaris', focus: 'Visibility',       season: 'summer', start: 85,  end: 112, intent: 'Operate at full capacity. The light is long. This is your season for volume and output.' },
  { name: 'Arden',   focus: 'Sustained Effort', season: 'summer', start: 113, end: 140, intent: 'Stay. The temptation to ease off comes early. The work done in Arden outlasts everything.' },
  { name: 'Messia',  focus: 'Harvest',          season: 'summer', start: 141, end: 168, intent: "Collect what you've earned. Review, consolidate, extract value from what's been built." },
  { name: 'Axia',    focus: 'Turning Point',    season: 'autumn', start: 169, end: 196, intent: 'Something shifts. A decision becomes obvious. Trust the turning.' },
  { name: 'Valla',   focus: 'Holding',          season: 'autumn', start: 197, end: 224, intent: 'Maintain what matters. Let the rest fall. Containment is a form of power.' },
  { name: 'Lenia',   focus: 'Softening',        season: 'autumn', start: 225, end: 252, intent: "Release grip. This is not failure — it's preparation. The system is becoming available again." },
  { name: 'Umbra',   focus: 'Stillness',        season: 'winter', start: 253, end: 280, intent: 'Go inward. The most productive thing you can do in Umbra is rest without guilt.' },
  { name: 'Noctis',  focus: 'Insight',          season: 'winter', start: 281, end: 308, intent: 'Think. Read. The dark months generate the ideas that spring will execute.' },
  { name: 'Spira',   focus: 'Readiness',        season: 'winter', start: 309, end: 336, intent: "Prepare the conditions for what's next. Systems, tools, relationships. The coil tightens." },
  { name: 'Lumen',   focus: 'Integration',      season: 'winter', start: 337, end: 364, intent: 'Make sense of the year. What held, what broke, what is worth carrying forward.' },
];

export const WEEK_PHASES: WeekPhase[] = ['Orient', 'Engage', 'Amplify', 'Integrate'];

export const WEEK_PHASE_DESC: Record<WeekPhase, string> = {
  Orient:    'Set direction. Reduce noise. Choose 1–3 priorities and nothing else.',
  Engage:    'Begin. Do the first real reps. Momentum over perfection.',
  Amplify:   'Push output. Ship, produce, add volume. This is the sprint.',
  Integrate: 'Consolidate. Review. Repair and simplify what the sprint revealed.',
};

export const SEASON_COLORS: Record<Season, { primary: string; glow: string }> = {
  spring: { primary: '#5aad3e', glow: 'rgba(90, 173, 62, 0.18)' },
  summer: { primary: '#e8a020', glow: 'rgba(232, 160, 32, 0.18)' },
  autumn: { primary: '#c85428', glow: 'rgba(200, 84, 40, 0.18)' },
  winter: { primary: '#4a6fa5', glow: 'rgba(74, 111, 165, 0.18)' },
};

// Anchors: the Gregorian date that equals Verna Day 1 of 12026 NE
const ANCHORS: Record<Hemisphere, { date: Date; year: number }> = {
  SH: { date: new Date('2026-09-22T00:00:00'), year: 12026 },
  NH: { date: new Date('2026-03-20T00:00:00'), year: 12026 },
};

export function getAptusDate(date: Date = new Date(), hemisphere: Hemisphere = 'SH'): AptusDate {
  const { date: anchor, year: anchorYear } = ANCHORS[hemisphere];
  const msPerDay = 86400000;
  const daysSinceAnchor = Math.floor((date.getTime() - anchor.getTime()) / msPerDay);

  let year: number;
  let dayOfYear: number;

  if (daysSinceAnchor < 0) {
    const daysBack = Math.abs(daysSinceAnchor);
    year = anchorYear - 1 - Math.floor((daysBack - 1) / 365);
    dayOfYear = 365 - ((daysBack - 1) % 365);
  } else {
    year = anchorYear + Math.floor(daysSinceAnchor / 365);
    dayOfYear = (daysSinceAnchor % 365) + 1;
  }

  if (dayOfYear === 365) {
    return {
      isLacuna: true,
      day: 'Lacuna',
      month: null,
      monthIndex: -1,
      year,
      dayOfYear: 365,
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
    isLacuna: false,
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
  const { date: anchor, year: anchorYear } = ANCHORS[hemisphere];
  const totalDays = (neYear - anchorYear) * 365 + (dayOfYear - 1);
  return new Date(anchor.getTime() + totalDays * 86400000);
}

export function formatGregorian(date: Date): string {
  return date.toLocaleDateString('en-NZ', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
  });
}
