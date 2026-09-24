import { test, expect } from 'vitest';
import { getAptusDate, yearLength, isRettaYear, gregDateFromAptus } from './aptus';
import { CELEBRATIONS, occurrence, isActive } from './celebrations';
import { buildFeed, DEFAULT_OPTIONS } from './ics';

/**
 * The turning points, pinned against real astronomy.
 *
 * Aptus anchors Verna 1 to a *floating local date* — 23 September, whatever
 * that means in the viewer's own zone — not to the equinox instant. Resolving
 * the instant per viewer would put people either side of the date line on
 * permanently different day numbers. These tests pin both halves of that: the
 * instant really does land on different local dates, and the calendar really
 * is a pure function of the local date.
 *
 * Instants verified with astronomy-engine.
 */
const SEP_EQUINOX_2026 = new Date('2026-09-23T00:05:38.617Z');

/** The calendar date a given zone is showing at a given instant. */
function localDateIn(instant: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(instant);
}

/**
 * A viewer in `timeZone` at `instant`, as getAptusDate sees them. It reads only
 * local year/month/day, so rebuilding those parts is a faithful stand-in — and
 * keeps these tests independent of the machine's own timezone.
 */
function viewerIn(instant: Date, timeZone: string): Date {
  const [y, m, d] = localDateIn(instant, timeZone).split('-').map(Number);
  return new Date(y, m - 1, d, 12);
}

const localDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

test('one equinox instant reads as two local dates across the date line', () => {
  expect(localDateIn(SEP_EQUINOX_2026, 'Pacific/Auckland')).toBe('2026-09-23');
  expect(localDateIn(SEP_EQUINOX_2026, 'America/New_York')).toBe('2026-09-22');
});

test('each side reads its own local date, and both stay self-consistent', () => {
  // NZ has ticked over: the new year has started.
  const nz = getAptusDate(viewerIn(SEP_EQUINOX_2026, 'Pacific/Auckland'), 'SH');
  expect(nz.year).toBe(12026);
  expect(nz.dayOfYear).toBe(1);
  expect(nz.month).toBe('Verna');
  expect(isActive(nz, CELEBRATIONS.find(c => c.name === 'Hayta')!)).toBe(true);

  // US Eastern is still on the 22nd, so still closing the old year. 12025 is a
  // Retta year, so that last day is Retta rather than Otium — any rule that
  // puts Retta in 12030 makes 12025 366 days long. Not a bug: the same
  // instant, read where the reader is standing.
  const us = getAptusDate(viewerIn(SEP_EQUINOX_2026, 'America/New_York'), 'SH');
  expect(us.year).toBe(12025);
  expect(us.isOutsideCount).toBe(true);
  expect(us.dayOfYear).toBe(yearLength(12025));
});

test('the day count survives the NZ DST transition on 27 Sept 2026', () => {
  // NZDT begins 02:00 Sunday 27 September 2026. Raw-millisecond arithmetic
  // loses an hour here and reports the previous day for any time before 01:00,
  // so these are sampled just after local midnight — the hour it would corrupt.
  const expected: Array<[string, number]> = [
    ['2026-09-23', 1], ['2026-09-26', 4], ['2026-09-27', 5],
    ['2026-09-28', 6], ['2026-10-05', 13],
  ];
  for (const [iso, doy] of expected) {
    const [y, m, d] = iso.split('-').map(Number);
    expect(getAptusDate(new Date(y, m - 1, d, 0, 30), 'SH').dayOfYear, iso).toBe(doy);
  }
});

test('the sun-anchored celebrations land on the true astronomical event', () => {
  // True events in NZ local terms:
  //   Dec solstice 2026-12-21T20:50Z -> 2026-12-22 NZDT
  //   Mar equinox  2027-03-20T22:24Z -> 2027-03-21 NZDT
  //   Jun solstice 2027-06-21T14:10Z -> 2027-06-22 NZST
  const today = getAptusDate(new Date(2026, 8, 23, 12), 'SH');
  const cases: Array<[string, string]> = [
    ['Samna', '2026-12-22'], ['Nesti', '2027-03-21'], ['Vona', '2027-06-22'],
  ];
  for (const [name, truth] of cases) {
    const cel = CELEBRATIONS.find(c => c.name === name)!;
    const when = occurrence(today, cel)!;
    // A multi-day span is centred on the observed day.
    const observed = new Date(
      when.start.getFullYear(), when.start.getMonth(),
      when.start.getDate() + Math.floor((cel.days - 1) / 2),
    );
    expect(localDate(observed), name).toBe(truth);
  }
});

test('Retta falls on the years the spec names, and nowhere else', () => {
  const years = Array.from({ length: 25 }, (_, i) => 12026 + i).filter(isRettaYear);
  expect(years).toEqual([12030, 12034, 12038, 12042, 12046, 12050]);
  expect(yearLength(12029)).toBe(365);
  expect(yearLength(12030)).toBe(366);
});

test('Retta is day 366, after Otium, and only in a Retta year', () => {
  const otium = getAptusDate(gregDateFromAptus(365, 12030, 'SH'), 'SH');
  expect(otium.isOtium).toBe(true);
  expect(otium.isRetta).toBe(false);

  const retta = getAptusDate(gregDateFromAptus(366, 12030, 'SH'), 'SH');
  expect(retta.isRetta).toBe(true);
  expect(retta.isOtium).toBe(false);
  expect(retta.day).toBe('Retta');
  expect(retta.month).toBeNull();
  expect(retta.isOutsideCount).toBe(true);

  // The day after Retta is the next new year, not a 367th day.
  const after = getAptusDate(gregDateFromAptus(367, 12030, 'SH'), 'SH');
  expect(after.year).toBe(12031);
  expect(after.dayOfYear).toBe(1);
});

test('every day of a Retta year round-trips', () => {
  for (let doy = 1; doy <= 366; doy++) {
    const back = getAptusDate(gregDateFromAptus(doy, 12030, 'SH'), 'SH');
    expect(back.year, `day ${doy}`).toBe(12030);
    expect(back.dayOfYear, `day ${doy}`).toBe(doy);
  }
});

test('Retta holds the year start within a day of the true equinox', () => {
  // Without a backwards-correcting rule a 1950 date lands 18 days out, which
  // matters because the converter takes birthdays. Pinned equinox dates (NZ
  // local) from astronomy-engine.
  const known: Array<[number, string]> = [
    [11950, '1950-09-23'], [11985, '1985-09-23'],
    [12026, '2026-09-23'], [12075, '2075-09-22'],
  ];
  for (const [neYear, equinox] of known) {
    const start = gregDateFromAptus(1, neYear, 'SH');
    const days = Math.round(
      (start.getTime() - new Date(`${equinox}T00:00:00`).getTime()) / 86400000,
    );
    expect(Math.abs(days), `${neYear} NE`).toBeLessThanOrEqual(1);
  }
});

test('the feed carries Retta in Retta years and nowhere else', () => {
  const feed = buildFeed(12027, { ...DEFAULT_OPTIONS, celebrations: true });
  const emitted = feed
    .split('\r\n')
    .filter(l => l.startsWith('UID:cel-') && l.includes('-Retta-'));
  // buildFeed covers ten years, so the horizon holds two Retta years.
  const expected = Array.from({ length: 10 }, (_, i) => 12027 + i).filter(isRettaYear);
  expect(expected).toEqual([12030, 12034]);
  expect(emitted).toHaveLength(expected.length);

  // Retta is the last day of its year, so it sits the day before the next Hayta.
  const rettaStart = gregDateFromAptus(366, 12030, 'SH');
  const nextHayta = gregDateFromAptus(1, 12031, 'SH');
  expect(nextHayta.getTime() - rettaStart.getTime()).toBe(86400000);
});
