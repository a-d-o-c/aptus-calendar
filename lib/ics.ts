import {
  MONTHS, WEEK_PHASES, WEEK_PHASE_DESC, gregDateFromAptus, yearLength, isRettaYear,
  type Hemisphere,
} from './aptus';
import { CELEBRATIONS, startDay, aptusPosition } from './celebrations';

/**
 * The subscription feed. A calendar client polls one URL and folds Aptus into
 * whatever calendar someone already lives in, which is the only way this
 * becomes a layer rather than a site you remember to visit.
 *
 * Everything here is all-day (DATE-valued) rather than timed. An Aptus day is
 * a local-date idea with no hour attached, and DATE values are floating — no
 * timezone, no drift when someone travels, no VTIMEZONE block to get wrong.
 */

export interface FeedOptions {
  hemisphere: Hemisphere;
  months: boolean;
  seasons: boolean;
  celebrations: boolean;
  vow: boolean;
  weeks: boolean;
  days: boolean;
  /** Days before the event to fire a reminder. 0 is the morning of; null is none. */
  alarm: number | null;
}

export const DEFAULT_OPTIONS: FeedOptions = {
  hemisphere: 'SH',
  months: true,
  seasons: false,
  celebrations: true,
  vow: false,
  weeks: false,
  days: false,
  alarm: null,
};

/** The five celebrations the Hayta vow is set, checked and settled at. */
const VOW_THREAD = ['Hayta', 'Samna', 'Nesti', 'Vona', 'Arfa'];

/** The month that opens each season. */
const SEASON_OPENERS = ['Verna', 'Solaris', 'Axia', 'Umbra'];

// ── RFC 5545 plumbing ─────────────────────────────────────────────

/** Escape per RFC 5545: backslash, semicolon, comma and newline are special. */
function esc(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Fold to 75 octets per line. Counting octets rather than characters matters —
 * the month intents contain em dashes and curly quotes, which are 3 bytes each
 * in UTF-8, so a character count would emit over-long lines.
 */
function fold(line: string): string {
  const bytes = Buffer.from(line, 'utf8');
  if (bytes.length <= 75) return line;

  const out: string[] = [];
  let start = 0;
  let limit = 75;
  while (start < bytes.length) {
    let end = Math.min(start + limit, bytes.length);
    // Never split a multi-byte character: back off to a leading byte.
    while (end < bytes.length && (bytes[end] & 0xc0) === 0x80) end--;
    out.push(bytes.subarray(start, end).toString('utf8'));
    start = end;
    limit = 74; // continuation lines carry a leading space
  }
  return out.join('\r\n ');
}

/** YYYYMMDD in local terms — never via toISOString, which shifts by timezone. */
function dateValue(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

function addDays(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
}

interface Event {
  uid: string;
  start: Date;
  /** Number of days the event covers. */
  length: number;
  summary: string;
  description?: string;
}

function renderEvent(ev: Event, stamp: string, alarm: number | null): string[] {
  const lines = [
    'BEGIN:VEVENT',
    `UID:${ev.uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${dateValue(ev.start)}`,
    // DTEND is exclusive for DATE values: the day after the last day.
    `DTEND;VALUE=DATE:${dateValue(addDays(ev.start, ev.length))}`,
    fold(`SUMMARY:${esc(ev.summary)}`),
    'TRANSP:TRANSPARENT',
  ];
  if (ev.description) lines.push(fold(`DESCRIPTION:${esc(ev.description)}`));
  if (alarm !== null) {
    lines.push(
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      fold(`DESCRIPTION:${esc(ev.summary)}`),
      alarm === 0 ? 'TRIGGER;RELATED=START:PT0S' : `TRIGGER;RELATED=START:-P${alarm}D`,
      'END:VALARM',
    );
  }
  lines.push('END:VEVENT');
  return lines;
}

// ── Event building ────────────────────────────────────────────────

function eventsForYear(neYear: number, o: FeedOptions): Event[] {
  const events: Event[] = [];
  const greg = (doy: number) => gregDateFromAptus(doy, neYear, o.hemisphere);
  const id = (kind: string, n: number | string) =>
    `${kind}-${neYear}-${n}-${o.hemisphere}@aptuscalendar.com`;

  // A coarse toggle wins over its own subset: seasons are four of the thirteen
  // months and the vow thread is five of the seven celebrations, so emitting
  // both would put two events on one day.
  if (o.months) {
    for (const m of MONTHS) {
      events.push({
        uid: id('month', m.start),
        start: greg(m.start),
        length: 1,
        summary: `${m.name} begins · ${m.focus}`,
        description: m.intent,
      });
    }
  } else if (o.seasons) {
    for (const m of MONTHS.filter(m => SEASON_OPENERS.includes(m.name))) {
      events.push({
        uid: id('season', m.start),
        start: greg(m.start),
        length: 1,
        summary: `${m.season[0].toUpperCase()}${m.season.slice(1)} begins · ${m.name}`,
        description: m.intent,
      });
    }
  }

  if (o.celebrations || o.vow) {
    const wanted = o.celebrations
      ? CELEBRATIONS
      : CELEBRATIONS.filter(c => VOW_THREAD.includes(c.name));
    for (const cel of wanted) {
      const start = startDay(cel, o.hemisphere);
      if (start === null) continue;            // Retta has no fixed annual day
      events.push({
        uid: id('cel', cel.name),
        start: greg(start),
        length: cel.days,
        summary: `${cel.name} · ${cel.position}`,
        description: [
          aptusPosition(cel, o.hemisphere),
          '',
          cel.meaning,
          '',
          ...cel.practice.map(p => `— ${p}`),
        ].filter(l => l !== null).join('\n'),
      });
    }

    // Retta has no fixed annual day, so the loop above skips it. In a Retta
    // year it has one: day 366, appended after Otium.
    const retta = CELEBRATIONS.find(c => c.name === 'Retta');
    if (o.celebrations && retta && isRettaYear(neYear)) {
      events.push({
        uid: id('cel', 'Retta'),
        start: greg(366),
        length: 1,
        summary: 'Retta · the calibration day',
        description: [
          'Day 366 — outside the count, and outside the ordinary year.',
          '',
          retta.meaning,
          '',
          ...retta.practice.map(pr => `— ${pr}`),
        ].join('\n'),
      });
    }
  }

  if (o.weeks) {
    for (const m of MONTHS) {
      for (let w = 0; w < 4; w++) {
        const doy = m.start + w * 7;
        const phase = WEEK_PHASES[w];
        events.push({
          uid: id('week', doy),
          start: greg(doy),
          length: 1,
          summary: `${m.name} · week ${w + 1} · ${phase}`,
          description: WEEK_PHASE_DESC[phase],
        });
      }
    }
  }

  if (o.days) {
    for (let doy = 1; doy <= yearLength(neYear); doy++) {
      const m = MONTHS.find(x => doy >= x.start && doy <= x.end);
      const outside = doy === 366 ? 'Retta · the calibration day' : 'Otium · outside the count';
      events.push({
        uid: id('day', doy),
        start: greg(doy),
        length: 1,
        summary: m
          ? `${m.name} ${doy - m.start + 1} · ${WEEK_PHASES[Math.ceil((doy - m.start + 1) / 7) - 1]}`
          : outside,
      });
    }
  }

  return events;
}

/**
 * Ten years of events, or three when every day is included — 365 events a year
 * is already a lot to hand a calendar client, and nobody plans a decade of them.
 */
export function buildFeed(fromNeYear: number, o: FeedOptions): string {
  const horizon = o.days ? 3 : 10;
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Aptus Calendar//aptuscalendar.com//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:Aptus (${o.hemisphere})`,
    fold('X-WR-CALDESC:Thirteen months of twenty-eight days, anchored to the equinox.'),
    'REFRESH-INTERVAL;VALUE=DURATION:P1D',
    'X-PUBLISHED-TTL:P1D',
  ];

  for (let i = 0; i < horizon; i++) {
    for (const ev of eventsForYear(fromNeYear + i, o)) {
      lines.push(...renderEvent(ev, stamp, o.alarm));
    }
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n') + '\r\n';
}

/** Read options off a subscription URL, falling back to the defaults. */
export function optionsFromParams(params: URLSearchParams): FeedOptions {
  const flag = (key: string, fallback: boolean) => {
    const v = params.get(key);
    return v === null ? fallback : v === '1' || v === 'true';
  };
  const alarmRaw = params.get('alarm');
  const alarm = alarmRaw === null || alarmRaw === 'none' ? null : Number(alarmRaw);

  return {
    hemisphere: params.get('h') === 'NH' ? 'NH' : 'SH',
    months: flag('months', DEFAULT_OPTIONS.months),
    seasons: flag('seasons', DEFAULT_OPTIONS.seasons),
    celebrations: flag('celebrations', DEFAULT_OPTIONS.celebrations),
    vow: flag('vow', DEFAULT_OPTIONS.vow),
    weeks: flag('weeks', DEFAULT_OPTIONS.weeks),
    days: flag('days', DEFAULT_OPTIONS.days),
    alarm: alarm === null || Number.isNaN(alarm) || alarm < 0 || alarm > 30 ? null : alarm,
  };
}
