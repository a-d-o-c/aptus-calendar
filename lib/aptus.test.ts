import { test, expect } from 'vitest';
import { getAptusDate } from './aptus';
import { CELEBRATIONS, occurrence, isActive } from './celebrations';

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

  // US Eastern is still on the 22nd, so still in Otium — the day outside the
  // count that closes the old year. Not a bug: the same instant, read where
  // the reader is standing.
  const us = getAptusDate(viewerIn(SEP_EQUINOX_2026, 'America/New_York'), 'SH');
  expect(us.year).toBe(12025);
  expect(us.dayOfYear).toBe(365);
  expect(us.isOtium).toBe(true);
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

test('Retta is not implemented yet: day 366 is unreachable', () => {
  // Documents a known gap rather than endorsing it. Retta is described in the
  // copy, but no arithmetic path can produce a 366th day, so the calendar does
  // not calibrate and drifts ~0.24 days a year. Delete this when Retta ships.
  let max = 0;
  for (let i = 0; i < 365 * 12; i++) {
    max = Math.max(max, getAptusDate(new Date(2026, 8, 23 + i), 'SH').dayOfYear);
  }
  expect(max).toBe(365);
});
