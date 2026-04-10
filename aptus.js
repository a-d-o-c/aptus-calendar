// aptus.js — Core date calculation for the Aptus Calendar
// Southern Hemisphere default. Anchor: Verna Day 1 = Sept 22, 2026 = 12026 NE.

const APTUS_DATA = {
  ANCHOR: new Date('2026-09-22T00:00:00'),
  ANCHOR_NE_YEAR: 12026,

  MONTHS: [
    { name: 'Verna',   focus: 'Initiation',      season: 'spring', start: 1,   end: 28  },
    { name: 'Cresca',  focus: 'Growth',           season: 'spring', start: 29,  end: 56  },
    { name: 'Flora',   focus: 'Expression',       season: 'spring', start: 57,  end: 84  },
    { name: 'Solaris', focus: 'Visibility',       season: 'summer', start: 85,  end: 112 },
    { name: 'Arden',   focus: 'Sustained Effort', season: 'summer', start: 113, end: 140 },
    { name: 'Messia',  focus: 'Harvest',          season: 'summer', start: 141, end: 168 },
    { name: 'Axia',    focus: 'Turning Point',    season: 'autumn', start: 169, end: 196 },
    { name: 'Valla',   focus: 'Holding',          season: 'autumn', start: 197, end: 224 },
    { name: 'Lenia',   focus: 'Softening',        season: 'autumn', start: 225, end: 252 },
    { name: 'Umbra',   focus: 'Stillness',        season: 'winter', start: 253, end: 280 },
    { name: 'Noctis',  focus: 'Insight',          season: 'winter', start: 281, end: 308 },
    { name: 'Spira',   focus: 'Readiness',        season: 'winter', start: 309, end: 336 },
    { name: 'Lumen',   focus: 'Integration',      season: 'winter', start: 337, end: 364 },
  ],

  WEEK_PHASES: ['Orient', 'Engage', 'Amplify', 'Integrate'],

  SEASON_COLORS: {
    spring: { primary: '#4e8033', light: '#70b050', bg: '#eaf5e4' },
    summer: { primary: '#c48818', light: '#e0a830', bg: '#fdf3dc' },
    autumn: { primary: '#a04c24', light: '#c06838', bg: '#f7ece4' },
    winter: { primary: '#485e7a', light: '#6478a0', bg: '#e4eaf2' },
  },
};

function getAptusDate(date) {
  date = date || new Date();
  const msPerDay = 86400000;
  const daysSinceAnchor = Math.floor((date - APTUS_DATA.ANCHOR) / msPerDay);

  let year, dayOfYear;

  if (daysSinceAnchor < 0) {
    const daysBack = Math.abs(daysSinceAnchor);
    year = APTUS_DATA.ANCHOR_NE_YEAR - 1 - Math.floor((daysBack - 1) / 365);
    dayOfYear = 365 - ((daysBack - 1) % 365);
  } else {
    year = APTUS_DATA.ANCHOR_NE_YEAR + Math.floor(daysSinceAnchor / 365);
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

  const monthData = APTUS_DATA.MONTHS.find(m => dayOfYear >= m.start && dayOfYear <= m.end);
  const monthIndex = APTUS_DATA.MONTHS.indexOf(monthData);
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
    weekPhase: APTUS_DATA.WEEK_PHASES[weekIndex],
    season: monthData.season,
  };
}
