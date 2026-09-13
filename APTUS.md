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
  Orient → Engage → Release → Integrate.
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

| Name | Observed day SH | Observed day NH | Length | Kind |
|------|-----------------|-----------------|--------|------|
| Arfa | 364 (Lumen 28) | same | 1 day | year-turn |
| Otium | 365 | same | 1 day | year-turn |
| Hayta | 1 (Verna 1) | same | 1 day | year-turn |
| Samna | 91 (Solaris 7) | **94 (Solaris 10)** | **3 days** | solstice |
| Nesti | 180 (Axia 12) | **187 (Axia 19)** | 1 day | equinox |
| Vona | 273 (Umbra 21) | **277 (Umbra 25)** | **3 days** | solstice |
| Retta | — (no fixed day) | — | 1 day | calibration |

### The sun-anchored three carry a day per hemisphere

Decided 13 Sept 2026. Arfa, Otium and Hayta are defined by the count, so they
are the same number in both hemispheres — Hayta *is* the anchor equinox.
Samna, Nesti and Vona are defined by the sun, and one offset from the anchor
cannot reach the sun in both hemispheres, because the equinoxes are not the
midpoints between the solstices: Sept→Mar is 179 days and Mar→Sept is 186.
Earth is at perihelion in early January and moves fastest there.

The numbers stay fixed rather than being computed per year. The anchor itself
is fixed while the true equinox moves between the 22nd and 23rd, so chasing
the sun annually for celebrations but not for the anchor would be two
philosophies in one calendar. Retta is what absorbs accumulated drift, and the
three-day spans absorb the solstice's one-day wobble. Nesti, being a single
day, is a day off in some years — equally in both hemispheres.

**Consequence worth keeping:** once each hemisphere points at the sun, the two
coincide exactly. On 20–22 June the north keeps Samna while the south keeps
Vona; at the September equinox the south opens its year at Hayta while the
north packs provisions at Nesti. One event, two honest readings. Under the
old single-number scheme they missed each other by three days.

Rejected: averaging the two day numbers (wrong in both hemispheres instead of
one), and moving the turning points outside the count as intercalary days.
The latter is arithmetically sound — 8 space days leaves 357 counted, which is
12 months of 28 plus one of 21, and 1 and 8 are the only two counts that close
at all — but it costs the four-week month, and it does not fix the hemispheres
anyway, since intercalation does not move the sun.

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

### The four weeks are the year in miniature

Changed 13 Sept 2026: **Amplify → Release**, and the cadence is now framed as a
reading of the month rather than a rule for working through it.

Every other structural claim in Aptus points at something external — the
equinox, the solar year, 364 dividing by 28. The cadence pointed at nothing:
it was a productivity opinion asserted inside a product whose case against the
Gregorian is that arrangements should be derived, not asserted.

The fix is self-similarity. The four weeks carry the shape of the four
seasons, so the month is justified by the year, which is justified by the sky:

| Week | Phase | Season | |
|---|---|---|---|
| 1 | Orient | spring | choose the direction, take the first step |
| 2 | Engage | summer | the work itself, at whatever volume is yours |
| 3 | Release | autumn | let go of what isn't holding |
| 4 | Integrate | winter | consolidate what remains |

Amplify was the one to drop. The old arc had no autumn — it ran Orient,
Engage, Amplify, Integrate, which is three beats of output and a rest, not a
cycle. Amplify also carried the heaviest value judgement in the set ("push
output, ship, add volume, this is the sprint"), which is the tone the
suggestion framing exists to remove. Orient absorbs the first step, as spring
does, so week 2 is free to be the work.

Rejected: Review at week 3 — Integrate already means review, and it would
leave autumn still missing.

### The moon is a layer, not a claim

Aptus months are 28 days; the synodic month is 29.53. They drift 1.53 days a
month and are fully out of phase inside ten, so the calendar cannot track the
moon and must not imply it does. `lib/moon.ts` shows where the moon actually
is, as its own cycle beside the Aptus date. Mean-synodic model anchored to the
measured new moon of 11 Sept 2026 03:27 UTC; checked against published new
moons for Oct 2026, Jun 2027 and Dec 2027 at +0.4h, −21.6h and −5.0h. Good
enough to name a phase, which is why nothing reports an exact time.

### Worksheets

Added 13 Sept 2026, a week before Arfa. Every celebration whose practice list
contains a question gets a fillable worksheet inside its card — Arfa 5 prompts,
Hayta 4, Nesti 4, Vona 4, Samna and Retta 1 each. Otium has none by design: its
practice is "nothing is required," and a worksheet for that would be a joke at
the day's expense.

The prompts are **derived** from `practice`, not duplicated: anything
containing a question mark is fillable, the rest stays guidance. Match anywhere
in the string rather than at the end — Hayta's central prompt is "What is the
one thing this year is for? Not a list — one direction," and an end-anchored
test drops the vow.

Answers live in `localStorage`, keyed by celebration and NE year, so last
year's Arfa stays readable beside this year's. No account, no server, nothing
leaves the device — and every access is guarded, because storage can be absent.

Printing is the same worksheet on paper: `@media print` in `globals.css` hides
the app shell, swaps each textarea for ruled space, and carries whatever was
typed onto the lines. One set of prompts feeds both, so paper and screen cannot
drift.

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
- **The apex is canonical.** `aptuscalendar.com`, not www — decided 13 Sept
  2026. Every absolute URL in `app/` says apex, and `next.config.ts` 308s any
  request arriving on `www.aptuscalendar.com` to it. That redirect lives in
  code rather than Vercel's dashboard so it is reviewable and survives a
  project being relinked. Prefer relative URLs (`/`) wherever an absolute one
  isn't required, so the choice only lives in one place.
- **Date logic** lives only in `lib/aptus.ts`; celebration data and timing
  only in `lib/celebrations.ts`. Do not duplicate either into components.
  Components hold the Aptus position only ("Solaris 6–8 · three days") and
  derive every Gregorian date through `formatOccurrence` for the selected
  hemisphere. Hardcoded dates in `AboutTab` were wrong for six of seven
  celebrations in NH before this rule was enforced (13 Sept 2026).
- **`observed` is a number or a per-hemisphere pair.** A plain number means
  the count defines the day; a pair means the sun does. `observedDay`,
  `startDay`, `endDay` and `aptusPosition` take a hemisphere; everything
  taking an `AptusDate` reads `today.hemisphere` instead, so a mismatched
  pair is unrepresentable.
- **`timingLabel` builds the one line every tab shows** under a celebration —
  Aptus position, what the day is, length, Gregorian dates. Tabs must not
  assemble that themselves; three copies is how the hemispheres drifted.
- **Celebration length** is the `days` field. `startDay`/`endDay` derive the
  span, centred on the observed day; `isActive` is true for every day of it;
  `daysUntil` counts to the first day and returns 0 throughout. A celebration
  in progress shows the occurrence in progress, not next year's.
- **Day arithmetic must be calendar-based, never raw milliseconds.** Both
  functions previously drifted across DST boundaries and displayed dates a
  day early in the Northern Hemisphere. Fixed 11 Sept 2026; keep it that way.
- **Hemisphere is guessed, then remembered.** A stored choice always wins; a
  first-time visitor is detected in `lib/detect-hemisphere.ts`. Until 13 Sept
  2026 everyone got SH regardless of location, which meant every Northern
  visitor met a calendar inverted from their sky and had to find the toggle
  before deciding it was broken. Detection is the DST direction first (the
  southern summer is in January, so a southern zone's January offset is the
  smaller one), then a table for southern zones without DST — Brazil abolished
  it in 2009, Argentina in 2009, northern Australia never had it. Argentina is
  listed under both spellings: browsers report `America/Argentina/*` but some
  runtimes canonicalise to the older `America/Buenos_Aires`, and the prefix
  alone missed every Argentine visitor. Checked against 32 zones.
- **Hydration:** the page prerenders statically, so anything date-dependent
  resolves in a `useEffect`, never during render.

### The subscription feed

Added 13 Sept 2026. `/feed.ics` serves an RFC 5545 calendar that Google, Apple
or Outlook polls and folds into the calendar someone already lives in. This is
what makes Aptus a layer rather than a site you remember to visit.

Every event is **all-day (DATE-valued), never timed**. An Aptus day is a local
date with no hour attached; DATE values are floating, so there is no timezone
to get wrong and no drift when someone travels.

Options ride in the URL because a feed has no session: `h`, `months`,
`seasons`, `celebrations`, `vow`, `weeks`, `days`, `alarm`. Defaults are months
+ celebrations — 19 events a year. **A coarse toggle wins over its own subset**:
seasons are 4 of the 13 months and the vow thread is 5 of the 7 celebrations,
so enabling both would put two events on one day. The UI disables the subset
rather than hiding the rule.

Horizon is 10 years, or 3 when `days` is on — 365 events a year is already a
lot to hand a client, and nobody plans a decade of them. Fixed celebration
dates are what make emitting a decade in one pass possible at all; a per-year
astronomical model would have needed the same maths in the generator.

Two things that are easy to get wrong and are handled: **folding counts octets,
not characters** (em dashes and curly quotes are 3 bytes in UTF-8, and a
character count emits over-long lines), and it backs off to a leading byte so a
multi-byte character is never split. UIDs are stable per kind, year, day and
hemisphere, so a client updates events rather than duplicating them.

**Get the event shape right before promoting it.** Google caches subscription
feeds hard, sometimes over a day, so changes reach existing subscribers slowly.

### Deployment — one repo, two live products

`github.com/a-d-o-c/aptus-calendar`, branch `main`, feeds **both**:

- **Vercel** builds `aptus-next/` → aptuscalendar.com (the v2 app).
- **GitHub Pages** serves the repo-root `index.html` →
  a-d-o-c.github.io/aptus-calendar.

**v1 is retired.** As of 13 Sept 2026 the root `index.html` is a redirect to
aptuscalendar.com, nothing more. Its four nav links — `about.html`,
`calendar.html`, `converter.html`, `guide.html` — never existed in the repo
and were 404s on the live site for as long as it was up, so the old page was
a working homepage attached to a broken menu. `aptus.js`, `wheel.js` and
`styles.css` remain in the repo but nothing references them now; git history
holds the full v1 site if it is ever wanted back.

The duplicate copies of these files in the parent `Aptus Calendar/` folder
are gone (13 Sept 2026). They were identical to the repo's, one commit
behind, and carried nothing unique. `wheel.svg`, which existed only there
and was in no backup, moved into the repo.

Editing through the GitHub web editor commits straight to `main` and deploys
each commit with no local build to catch errors. In Sept 2026 this produced
seven consecutive failed production deploys. Pull, build locally, push once.

---

## 6. Open questions — not decided, do not guess

1. **The celebrations are described twice** — in `CelebrationsTab.tsx` and
   again in `AboutTab.tsx`, with different prose. Which is canonical, and
   should the other defer to it or be cut?
2. **Samna's prose still describes displacing Christmas**, which is
   Southern-specific. The dates are now right in both hemispheres; the
   framing is not.
3. **Tabs are client state, not routes.** Nothing is linkable but the
   homepage — no sharing a specific tab, and one page for search engines to
   index. Making tabs routable is a structural change, not a polish pass.

### Closed

- **Samna and Vona copy** — rewritten 13 Sept 2026 to match the three-day
  span, on the intent recorded in §3.
- **Etymology statements** — the last one (Retta's "Old Norse name") removed
  13 Sept 2026. Shipped copy now states meaning only.
- **Northern Hemisphere celebration dates** — the sun-anchored three got a day
  per hemisphere on 13 Sept 2026. See §3.
- **Is v1 deliberately still live?** No. Retired to a redirect 13 Sept 2026,
  which also closes its four dead nav links. See §5.
- **Which domain is canonical?** The apex, 13 Sept 2026. See §5.
