# APTUS.md — source of truth

What Aptus is, what has been decided, and what has not. This document records
decisions; it does not invent them. Anything never actually settled is listed
under **Open questions** rather than given an answer here.

Created 12 Sept 2026. Reconstructed from the shipped code, the live site, and
the project CLAUDE.md — there was no prior APTUS.md.

**Precedence:** this document for intent and decisions; the live site
(aptuscalendar.com) for what is currently shipped. Where they disagree, the
site is the fact and this document is the intent — reconcile deliberately,
don't let either drift silently.

---

## 1. What Aptus is

A second calendar aligned to observable natural cycles, run alongside the
Gregorian one rather than replacing it. Optional, non-exclusive, no belief
required.

**Tone:** practical, systems-oriented, composed. Not mystical, not
spiritual, not axe-grinding. State facts flatly and let them persuade on their
own — this applies especially to the Gregorian critique, where the history is
strong enough without verdicts attached to it.

---

## 2. Structure — settled, do not change

- 13 months × 28 days = 364 days.
- **Otium** — day 365, outside the count, belongs to no month or week.
- **Retta** — day 366, calibration, roughly every 6 years. Next: 12030 NE.
- Anchor: Verna 1 = 22 Sept (Southern Hemisphere) / 20 March (Northern).
- Year numbering: Natural Era (NE) = Gregorian + 10,000.
- Weekly cadence, repeating every 7 days within each month:
  Orient → Engage → Amplify → Integrate.
- Southern Hemisphere is the default.

### The 13 months

| # | Name | Focus | Season |
|---|------|-------|--------|
| 1 | Verna | Initiation | spring |
| 2 | Cresca | Growth | spring |
| 3 | Flora | Expression | spring |
| 4 | Solaris | Visibility | summer |
| 5 | Arden | Sustained Effort | summer |
| 6 | Plena | Harvest | summer |
| 7 | Axia | Turning Point | autumn |
| 8 | Valla | Holding | autumn |
| 9 | Lenia | Softening | autumn |
| 10 | Umbra | Stillness | winter |
| 11 | Noctis | Insight | winter |
| 12 | Spyra | Readiness | winter |
| 13 | Lumen | Integration | winter |

Naming is final as of 12026 NE: **Lacuna → Otium**, **Messia → Plena**,
**Spira → Spyra**. No further renaming without an explicit decision recorded
here.

---

## 3. The seven celebrations

| Name | Observed day | Length | Span | Kind |
|------|--------------|--------|------|------|
| Arfa | 364 (Lumen 28) | 1 day | 364 | year-turn |
| Otium | 365 | 1 day | 365 | year-turn |
| Hayta | 1 (Verna 1) | 1 day | 1 | year-turn |
| Samna | 91 (Solaris 7) | **3 days** | 90–92 (Solaris 6–8) | solstice |
| Nesti | 180 (Axia 12) | 1 day | 180 | equinox |
| Vona | 273 (Umbra 21) | **3 days** | 272–274 (Umbra 20–22) | solstice |
| Retta | — (no fixed day) | 1 day | — | calibration |

**The solstices run three days; everything else is one day.** Decided 12 Sept
2026. The three days are the days the sun suspends — it holds its rising and
setting position either side of the solstice. The span is centred on the
observed solstice day, so the solstice is the middle day, not the first.

### Form follows the act

A celebration carries multiple named days only when it contains multiple
distinct acts in sequence. The year-turn is the only one: **Arfa → Otium →
Hayta** — close, rest, open. Three acts, three names.

A celebration carries a single name when it is one sustained moment, however
many days it runs. The solstices are three days under one name each; the
equinox is one day.

### Name meanings

Meaning only. **Do not state language or etymology anywhere in the product.**

- **Arfa** — the inheritance; what you keep of the year that's ending.
- **Otium** — the rest; the one day that asks nothing of you.
- **Hayta** — the vow; one direction, spoken aloud, for the year ahead.
- **Samna** — the gathering; the days given to other people. The three days
  are about togetherness, not duration: one real gathering across the span,
  a long table rather than a long roster.
- **Nesti** — provisions for the journey; what you'll want with you for the
  season ahead.
- **Vona** — hope; the light turns and returns. Honour the recession; this
  too shall pass.
- **Retta** — the setting-right; the day that returns the calendar to true.

### The vow thread

The Hayta vow is set at Hayta, checked at Samna, Nesti and Vona, and settled
at Arfa. This is the spine connecting the seven.

---

## 4. Gregorian critique — facts that must stay exact

These are load-bearing and verifiable. Keep them; state them flatly.

- The original Roman calendar had **ten months** and began in **March**.
- The last four are still misnumbered: **September means seventh and sits
  ninth**; October means eighth and sits tenth.
- **Julius Caesar, 46 BCE** — corrected roughly three months of seasonal
  drift; established the 365-day year, the 12-month structure and the leap
  year; renamed Quintilis to July; did not renumber the last four months.
- **Augustus** — Sextilis renamed August; a day moved from February to August
  so it would not be shorter than July. February has stayed short since.
- Gregorian month lengths: 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 —
  no repeating pattern, no rule to derive them from.
- Southern Hemisphere seasonal language is inverted relative to the sky.

---

## 5. Technical decisions

- **Stack:** Next.js App Router, React 19, TypeScript, Framer Motion.
  Inline styles, not Tailwind utility classes, in the tab components.
- **Fonts:** `--font-cormorant` (display), `--font-dm-mono` (labels, data),
  `--font-libre` (body prose).
- **Palette:** background `#121110`, card `#1d1d1c`, border `#2d2e2b`,
  primary text `#ede8de`, muted `#9a8870`, label `#8a7460`, accent `#c0a880`.
  Per-month and per-celebration accent colours live in `lib/aptus.ts` and
  `lib/celebrations.ts`.
- **Card radius is 6.** Pills and chips are 99.
- **Date logic** lives only in `lib/aptus.ts`; celebration data and timing
  only in `lib/celebrations.ts`. Do not duplicate either into components.
  Components hold the Aptus position only ("Solaris 6–8 · three days") and
  derive every Gregorian date through `formatOccurrence` for the selected
  hemisphere. Hardcoded dates in `AboutTab` were wrong for six of seven
  celebrations in NH before this rule was enforced (13 Sept 2026).
- **Celebration length** is the `days` field. `startDay`/`endDay` derive the
  span, centred on the observed day; `isActive` is true for every day of it;
  `daysUntil` counts to the first day and returns 0 throughout. A celebration
  in progress shows the occurrence in progress, not next year's.
- **Day arithmetic must be calendar-based, never raw milliseconds.** Both
  functions previously drifted across DST boundaries and displayed dates a
  day early in the Northern Hemisphere. Fixed 11 Sept 2026; keep it that way.
- **Hydration:** the page prerenders statically, so anything date-dependent
  resolves in a `useEffect`, never during render.

### Deployment — one repo, two live products

`github.com/a-d-o-c/aptus-calendar`, branch `main`, feeds **both**:

- **Vercel** builds `aptus-next/` → aptuscalendar.com (the v2 app).
- **GitHub Pages** serves the repo-root `index.html` + `aptus.js` +
  `wheel.js` + `styles.css` → a-d-o-c.github.io/aptus-calendar (the v1
  static site, still live).

A push to `main` deploys both. The root static files are **not** dead — they
serve real traffic. Duplicate copies of `aptus.js`/`wheel.js` also exist in
the parent `Aptus Calendar/` folder, outside the repo; those are not
deployed and are a known divergence trap.

Editing through the GitHub web editor commits straight to `main` and deploys
each commit with no local build to catch errors. In Sept 2026 this produced
seven consecutive failed production deploys. Pull, build locally, push once.

---

## 6. Open questions — not decided, do not guess

1. **Is the v1 GitHub Pages site deliberately still live?** If yes, it needs
   to stay in sync with naming changes. If it is superseded, it should come
   down. Currently it receives renames by accident of sharing a branch.
2. **The celebrations are described twice** — in `CelebrationsTab.tsx` and
   again in `AboutTab.tsx`, with different prose. Which is canonical, and
   should the other defer to it or be cut?
3. **`index.html` links to `calendar.html`**, which does not exist in the
   repo. Dead link on the live v1 site.
4. **Northern Hemisphere celebrations miss their astronomical events.** Not
   a copy problem — the fixed day-of-year offsets only land on the solstices
   from the SH anchor. Equinox→solstice is ~90 days Sept→Dec but ~93 days
   March→June, because Earth's orbit is elliptical. Measured from the 20
   March anchor:

   | Celebration | Aptus day | NH date | Actual event | Out by |
   |---|---|---|---|---|
   | Samna | 90–92 | 17–19 Jun | 21 Jun | 2–4 days early, event outside the span |
   | Vona | 272–274 | 16–18 Dec | 21 Dec | 3–5 days early, event outside the span |
   | Nesti | 180 | 15 Sept | 22 Sept | 7 days early |

   As of 13 Sept 2026 the UI states these dates honestly rather than the
   wrong ones it claimed before. Two ways out, both Adan's call: give NH its
   own day-of-year offsets (which reopens §2, currently settled), or reword
   the astronomical claim for NH. Separately, Samna's prose still describes
   displacing Christmas, which is Southern-specific.

### Closed

- **Samna and Vona copy** — rewritten 13 Sept 2026 to match the three-day
  span, on the intent recorded in §3.
- **Etymology statements** — the last one (Retta's "Old Norse name") removed
  13 Sept 2026. Shipped copy now states meaning only.
