# Aptus Calendar

A calendar aligned to the seasons rather than to Rome: thirteen months of
twenty-eight days, anchored to the equinox, with a Southern Hemisphere
default. Live at [aptuscalendar.com](https://aptuscalendar.com).

It is not a replacement for the Gregorian calendar. It runs alongside one,
for people who want the year to match what is happening outside.

## Structure

13 months × 28 days = 364. **Otium** is day 365, outside the count and
belonging to no month or week. **Retta** is day 366, added every four years to
keep the count true to the sun. Year numbering is Natural Era: Gregorian plus
10,000, so 2026 CE is 12026 NE.

Verna 1 falls on 23 September in the south and 20 March in the north — as a
floating local date, not an instant. Resolving the true equinox per viewer
would put people either side of the date line on permanently different day
numbers, so the anchor is fixed and Retta absorbs the drift.

## Running it

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # vitest
npm run build
```

## Where things live

- `lib/aptus.ts` — the date arithmetic, and the only place it exists. Day
  counts are calendar-based, never raw milliseconds; subtracting timestamps
  drifts across a DST boundary and reports the wrong day.
- `lib/celebrations.ts` — the seven turning points, their timing and copy.
- `lib/ics.ts` — the subscription feed served at `/feed.ics`.
- `lib/use-today.ts` — today, as one store the whole app shares. Components
  never call `getAptusDate(new Date())` themselves.
- `APTUS.md` — what is decided, and why. Read it before changing anything
  structural.

Built with Next.js (App Router), React and TypeScript. Deployed on Vercel.
