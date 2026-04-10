// wheel.js — Aptus Calendar Wheel v2
// Depends on aptus.js (APTUS_DATA, getAptusDate)
//
// Rings (outside → in):
//   Outer bezel (dark, gold indicator arc)  →  Day ticks  →
//   Week phase (colors only)  →  Month names  →  Season arcs  →  Center hub
//
// One needle: year hand sweeps full rotation over 365 days, tip sits in bezel.
// No moon hand. No letter labels.
// Four celestial events marked at the cardinal positions (~12/3/6/9 o'clock).

(function () {
  'use strict';

  const PHASE_COLORS = {
    Orient:    '#6888a8',
    Engage:    '#c08010',
    Amplify:   '#a04820',
    Integrate: '#4e7858',
  };

  // The four celestial events fall at approximately the 12/3/6/9 o'clock positions
  // Spring Equinox = day 1 = New Year = top of wheel (Verna Day 1, ~Sept 22 SH)
  // Summer Solstice ≈ day 91 (~Dec 21) = ~3 o'clock
  // Autumn Equinox  ≈ day 180 (~Mar 20) = ~6 o'clock
  // Winter Solstice ≈ day 272 (~Jun 20) = ~9 o'clock
  const CELESTIAL = [
    { day: 1,   label: 'SPRING EQ · NEW YEAR', color: '#507830' },
    { day: 91,  label: 'SUMMER SOLSTICE',       color: '#b88010' },
    { day: 180, label: 'AUTUMN EQ',             color: '#904018' },
    { day: 272, label: 'WINTER SOLSTICE',       color: '#486080' },
  ];

  class AptusWheel {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx    = canvas.getContext('2d');
      this.dpr    = window.devicePixelRatio || 1;
      this._onResize = this._onResize.bind(this);
      window.addEventListener('resize', this._onResize);
      this._onResize();
    }

    _onResize() {
      const container = this.canvas.parentElement;
      const display   = Math.min(container.clientWidth || 660, 660);
      this.canvas.style.width  = display + 'px';
      this.canvas.style.height = display + 'px';
      this.canvas.width  = display * this.dpr;
      this.canvas.height = display * this.dpr;
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      this.size = display;
      this.cx   = display / 2;
      this.cy   = display / 2;
      // Outer ring of bezel sits at R. 32px outer padding for celestial labels.
      this.R = display / 2 - 32;
      this._computeRings();
      this.draw();
    }

    _computeRings() {
      const R = this.R;
      this.r = {
        bezOut:   R,
        bezIn:    R * 0.900,   // bezel ~10% wide
        dayOut:   R * 0.900,
        dayIn:    R * 0.845,   // day tick ring
        weekOut:  R * 0.845,
        weekIn:   R * 0.710,   // week phase ring
        monthOut: R * 0.710,
        monthIn:  R * 0.462,   // month name ring
        seasOut:  R * 0.462,
        seasIn:   R * 0.278,   // season label ring
        hub:      R * 0.258,   // center hub
      };
    }

    // Day of year 1–365 → canvas angle. Day 1 at 12 o'clock, clockwise.
    _angle(day) {
      return ((day - 1) / 365) * (Math.PI * 2) - Math.PI / 2;
    }

    _segment(r1, r2, a1, a2, fill, stroke, sw) {
      const { ctx, cx, cy } = this;
      ctx.beginPath();
      ctx.arc(cx, cy, r2, a1, a2, false);
      ctx.arc(cx, cy, r1, a2, a1, true);
      ctx.closePath();
      if (fill)   { ctx.fillStyle = fill; ctx.fill(); }
      if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = sw || 1; ctx.stroke(); }
    }

    _spoke(r1, r2, angle, color, width) {
      const { ctx, cx, cy } = this;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * r1, cy + Math.sin(angle) * r1);
      ctx.lineTo(cx + Math.cos(angle) * r2, cy + Math.sin(angle) * r2);
      ctx.strokeStyle = color;
      ctx.lineWidth   = width || 1;
      ctx.stroke();
    }

    // Text rotated radially. Flips in the lower half so it always reads outward.
    _arcText(text, radius, angle, font, color) {
      const { ctx, cx, cy } = this;
      ctx.save();
      ctx.translate(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
      let rot = angle + Math.PI / 2;
      if (Math.sin(angle) > 0) rot += Math.PI;
      ctx.rotate(rot);
      ctx.font            = font;
      ctx.fillStyle       = color;
      ctx.textAlign       = 'center';
      ctx.textBaseline    = 'middle';
      ctx.fillText(text, 0, 0);
      ctx.restore();
    }

    // Small 4-pointed cross for equinox, 8-pointed star for solstice
    _celestialIcon(x, y, r, rays, color) {
      const { ctx } = this;
      ctx.save();
      ctx.translate(x, y);
      ctx.beginPath();
      for (let i = 0; i < rays * 2; i++) {
        const a    = (i / (rays * 2)) * Math.PI * 2 - Math.PI / 4;
        const dist = i % 2 === 0 ? r : r * 0.38;
        if (i === 0) ctx.moveTo(Math.cos(a) * dist, Math.sin(a) * dist);
        else         ctx.lineTo(Math.cos(a) * dist, Math.sin(a) * dist);
      }
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.restore();
    }

    draw() {
      const { ctx, cx, cy, r, R } = this;
      const now = getAptusDate(new Date());

      ctx.clearRect(0, 0, this.size, this.size);

      // ── Face background ───────────────────────────────────────────────
      ctx.beginPath();
      ctx.arc(cx, cy, R + 4, 0, Math.PI * 2);
      ctx.fillStyle = '#f7f4ef';
      ctx.fill();

      // ── Season tints behind month + season rings ──────────────────────
      [
        { key: 'spring', s: 1,   e: 84  },
        { key: 'summer', s: 85,  e: 168 },
        { key: 'autumn', s: 169, e: 252 },
        { key: 'winter', s: 253, e: 364 },
      ].forEach(({ key, s, e }) => {
        const a1  = this._angle(s);
        const a2  = this._angle(e + 0.9);
        const col = APTUS_DATA.SEASON_COLORS[key];
        this._segment(r.monthIn, r.monthOut, a1, a2, col.bg + 'cc');
        this._segment(r.seasIn,  r.seasOut,  a1, a2, col.bg);
      });

      // ── Lacuna — dark threshold sliver at ~12 o'clock ────────────────
      {
        const lA1 = this._angle(364.4);
        const lA2 = this._angle(365.0);
        [
          [r.dayIn,   r.dayOut  ],
          [r.weekIn,  r.weekOut ],
          [r.monthIn, r.monthOut],
          [r.seasIn,  r.seasOut ],
        ].forEach(([ri, ro]) => this._segment(ri, ro, lA1, lA2, '#14101e'));
        this._arcText(
          'Lacuna',
          (r.monthOut + r.monthIn) / 2,
          (lA1 + lA2) / 2,
          `italic ${R * 0.038}px 'Instrument Serif', serif`,
          '#c0a0f0'
        );
      }

      // ── Month ring ────────────────────────────────────────────────────
      APTUS_DATA.MONTHS.forEach((month) => {
        const a1  = this._angle(month.start);
        const mid = (this._angle(month.start) + this._angle(month.end)) / 2;
        const col = APTUS_DATA.SEASON_COLORS[month.season];

        this._spoke(r.monthIn, r.monthOut, a1, '#b0a898', 1.0);
        this._spoke(r.seasIn,  r.seasOut,  a1, '#b0a898', 0.8);

        this._arcText(
          month.name.toUpperCase(),
          (r.monthOut + r.monthIn) / 2,
          mid,
          `600 ${R * 0.044}px 'Space Mono', monospace`,
          col.primary
        );
      });

      // ── Season labels (inner ring) ────────────────────────────────────
      [
        { label: 'SPRING', s: 1,   e: 84,  key: 'spring' },
        { label: 'SUMMER', s: 85,  e: 168, key: 'summer' },
        { label: 'AUTUMN', s: 169, e: 252, key: 'autumn' },
        { label: 'WINTER', s: 253, e: 364, key: 'winter' },
      ].forEach(({ label, s, e, key }) => {
        const mid = (this._angle(s) + this._angle(e)) / 2;
        this._arcText(
          label,
          (r.seasOut + r.seasIn) / 2,
          mid,
          `${R * 0.030}px 'Space Mono', monospace`,
          APTUS_DATA.SEASON_COLORS[key].primary
        );
      });

      // ── Week phase ring — colors only, no text ────────────────────────
      APTUS_DATA.MONTHS.forEach((month) => {
        for (let w = 0; w < 4; w++) {
          const ws    = month.start + w * 7;
          const we    = ws + 6;
          const phase = APTUS_DATA.WEEK_PHASES[w];
          const a1    = this._angle(ws);
          const a2    = this._angle(we + 0.85);
          this._segment(r.weekIn, r.weekOut, a1, a2, PHASE_COLORS[phase] + '28');
          this._spoke(r.weekIn, r.weekOut, a1, w === 0 ? '#b0a898' : '#d8d2ca', w === 0 ? 1 : 0.5);
        }
      });

      // ── Day tick ring ─────────────────────────────────────────────────
      for (let d = 1; d <= 364; d++) {
        const a           = this._angle(d);
        const isMonthStart = APTUS_DATA.MONTHS.some(m => m.start === d);
        const month       = APTUS_DATA.MONTHS.find(m => d >= m.start && d <= m.end);
        const dim         = month ? d - month.start : 0;
        const isWeekStart = !isMonthStart && dim > 0 && dim % 7 === 0;

        if (isMonthStart) {
          this._spoke(r.dayIn - R * 0.018, r.dayOut, a, '#706050', 1.5);
        } else if (isWeekStart) {
          this._spoke(r.dayIn - R * 0.006, r.dayOut, a, '#9a8f80', 1);
        } else {
          this._spoke(r.dayIn + R * 0.028, r.dayOut, a, '#d8d0c8', 0.75);
        }
      }

      // ── Ring borders ──────────────────────────────────────────────────
      [r.dayOut, r.dayIn, r.weekIn, r.monthIn, r.seasIn].forEach(radius => {
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.strokeStyle = '#c8c0b8';
        ctx.lineWidth   = 0.8;
        ctx.stroke();
      });

      // ── Outer bezel ring (dark background) ───────────────────────────
      this._segment(r.bezIn, r.bezOut, -Math.PI, Math.PI, '#201c16');
      // Subtle month notches on bezel
      APTUS_DATA.MONTHS.forEach(month => {
        this._spoke(r.bezIn, r.bezOut, this._angle(month.start), '#3a3228', 1);
      });
      // Bezel border circles
      [r.bezOut, r.bezIn].forEach(radius => {
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.strokeStyle = '#3a3228';
        ctx.lineWidth   = 1;
        ctx.stroke();
      });

      // ── Celestial event markers ───────────────────────────────────────
      // Each falls at a cardinal clock position (~12/3/6/9).
      // Bright notch on bezel + icon outside + label in outer padding.
      CELESTIAL.forEach(({ day, label, color }) => {
        const a   = this._angle(day);
        // Full-height bezel notch in event color
        this._spoke(r.bezIn, r.bezOut + 1, a, color, 2.5);
        // Star icon outside the bezel
        const iconR = r.bezOut + 10;
        this._celestialIcon(
          cx + Math.cos(a) * iconR,
          cy + Math.sin(a) * iconR,
          R * 0.018, 8, color
        );
        // Arc label in outer padding zone
        this._arcText(
          label,
          r.bezOut + 22,
          a,
          `700 ${R * 0.022}px 'Space Mono', monospace`,
          color
        );
      });

      // ── Today indicator on bezel (gold arc + tick) ───────────────────
      if (!now.isLacuna) {
        const ca    = this._angle(now.dayOfYear);
        const span  = (1.6 / 365) * Math.PI * 2;
        // Gold arc fills today's slice of the bezel
        this._segment(r.bezIn, r.bezOut, ca - span, ca + span, '#d4a820');
        // Bright edge line on the arc
        ctx.beginPath();
        ctx.arc(cx, cy, (r.bezOut + r.bezIn) / 2, ca - span, ca + span);
        ctx.strokeStyle = '#f0c840';
        ctx.lineWidth   = R * 0.018;
        ctx.lineCap     = 'butt';
        ctx.stroke();
      }

      // ── Day needle ────────────────────────────────────────────────────
      if (!now.isLacuna) {
        this._drawNeedle(now);
      }

      // ── Center hub ────────────────────────────────────────────────────
      this._drawHub(now);
    }

    _drawNeedle(now) {
      const { ctx, cx, cy, r, R } = this;
      const a     = this._angle(now.dayOfYear);
      const perp  = a + Math.PI / 2;
      const tipR  = r.bezIn - R * 0.005; // tip just inside the bezel gold arc
      const baseR = r.hub   + R * 0.025; // base starts just outside the hub

      // Shadow pass
      ctx.save();
      ctx.shadowColor   = 'rgba(0,0,0,0.35)';
      ctx.shadowBlur    = 10;
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 3;

      // Needle body — classic lancet shape:
      // Wide at 25% of length, tapers to a sharp point at tip
      const len    = tipR - baseR;
      const midR   = baseR + len * 0.22; // widest point
      const bW     = R * 0.011;          // half-width at base
      const mW     = R * 0.007;          // half-width at widest point

      ctx.beginPath();
      // Left edge
      ctx.moveTo(cx + Math.cos(a) * baseR - Math.cos(perp) * bW, cy + Math.sin(a) * baseR - Math.sin(perp) * bW);
      ctx.lineTo(cx + Math.cos(a) * midR  - Math.cos(perp) * mW, cy + Math.sin(a) * midR  - Math.sin(perp) * mW);
      ctx.lineTo(cx + Math.cos(a) * tipR,                         cy + Math.sin(a) * tipR);
      // Right edge
      ctx.lineTo(cx + Math.cos(a) * midR  + Math.cos(perp) * mW, cy + Math.sin(a) * midR  + Math.sin(perp) * mW);
      ctx.lineTo(cx + Math.cos(a) * baseR + Math.cos(perp) * bW, cy + Math.sin(a) * baseR + Math.sin(perp) * bW);
      ctx.closePath();

      // Gold gradient along needle length
      const needleGrad = ctx.createLinearGradient(
        cx + Math.cos(a) * baseR, cy + Math.sin(a) * baseR,
        cx + Math.cos(a) * tipR,  cy + Math.sin(a) * tipR
      );
      needleGrad.addColorStop(0,   '#a88018');
      needleGrad.addColorStop(0.4, '#e8c030');
      needleGrad.addColorStop(1,   '#d4a820');
      ctx.fillStyle = needleGrad;
      ctx.fill();

      // Needle edge highlight
      ctx.strokeStyle = '#f0c840';
      ctx.lineWidth   = 0.5;
      ctx.stroke();

      ctx.restore();

      // Counterweight tail (opposite direction, short blunt stub)
      const tailR = r.hub + R * 0.015;
      const tailEnd = r.hub - R * 0.038;
      const tW = R * 0.015;

      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.20)';
      ctx.shadowBlur  = 4;

      ctx.beginPath();
      ctx.moveTo(cx - Math.cos(a) * tailR    - Math.cos(perp) * tW, cy - Math.sin(a) * tailR    - Math.sin(perp) * tW);
      ctx.lineTo(cx - Math.cos(a) * tailEnd  - Math.cos(perp) * (tW * 0.5), cy - Math.sin(a) * tailEnd  - Math.sin(perp) * (tW * 0.5));
      ctx.lineTo(cx - Math.cos(a) * tailEnd  + Math.cos(perp) * (tW * 0.5), cy - Math.sin(a) * tailEnd  + Math.sin(perp) * (tW * 0.5));
      ctx.lineTo(cx - Math.cos(a) * tailR    + Math.cos(perp) * tW, cy - Math.sin(a) * tailR    + Math.sin(perp) * tW);
      ctx.closePath();
      ctx.fillStyle = '#c09018';
      ctx.fill();
      ctx.restore();
    }

    _drawHub(now) {
      const { ctx, cx, cy, r, R } = this;

      // Hub background gradient
      const grad = ctx.createRadialGradient(cx, cy, r.hub * 0.1, cx, cy, r.hub);
      grad.addColorStop(0, '#302820');
      grad.addColorStop(1, '#1c1510');
      ctx.beginPath();
      ctx.arc(cx, cy, r.hub, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Thin decorative ring inside hub perimeter
      ctx.beginPath();
      ctx.arc(cx, cy, r.hub, 0, Math.PI * 2);
      ctx.strokeStyle = '#4a3c2e';
      ctx.lineWidth   = 1.5;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, r.hub - R * 0.015, 0, Math.PI * 2);
      ctx.strokeStyle = '#382e22';
      ctx.lineWidth   = 0.8;
      ctx.stroke();

      if (now.isLacuna) {
        ctx.font         = `italic ${R * 0.040}px 'Instrument Serif', serif`;
        ctx.fillStyle    = '#c0a0f0';
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Lacuna', cx, cy);
      } else {
        // Month progress arc — thin sweep inside hub showing progress through 28-day month
        const arcR   = r.hub - R * 0.028;
        const progA  = ((now.dayInMonth - 1) / 28) * Math.PI * 2 - Math.PI / 2;
        const col    = APTUS_DATA.SEASON_COLORS[now.season];

        // Track (full circle, dark)
        ctx.beginPath();
        ctx.arc(cx, cy, arcR, 0, Math.PI * 2);
        ctx.strokeStyle = '#302418';
        ctx.lineWidth   = R * 0.016;
        ctx.stroke();

        // Progress fill
        if (now.dayInMonth > 1) {
          ctx.beginPath();
          ctx.arc(cx, cy, arcR, -Math.PI / 2, progA, false);
          ctx.strokeStyle = col.primary;
          ctx.lineWidth   = R * 0.016;
          ctx.lineCap     = 'round';
          ctx.stroke();
        }

        // Day number — large, centered slightly above middle
        ctx.font         = `700 ${R * 0.092}px 'Space Mono', monospace`;
        ctx.fillStyle    = '#f0ebe2';
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(now.dayInMonth, cx, cy - R * 0.020);

        // Month name
        ctx.font         = `${R * 0.038}px 'Space Mono', monospace`;
        ctx.fillStyle    = col.light + 'dd';
        ctx.textBaseline = 'top';
        ctx.fillText(now.month.toUpperCase(), cx, cy + R * 0.058);

        // Week phase
        ctx.font         = `${R * 0.026}px 'Space Mono', monospace`;
        ctx.fillStyle    = '#706050';
        ctx.fillText(now.weekPhase.toUpperCase(), cx, cy + R * 0.104);
      }

      // Gold pivot jewel
      ctx.beginPath();
      ctx.arc(cx, cy, R * 0.016, 0, Math.PI * 2);
      ctx.fillStyle   = '#e8c040';
      ctx.fill();
      ctx.strokeStyle = '#b09020';
      ctx.lineWidth   = 1;
      ctx.stroke();
    }

    start() {
      this.draw();
      const msToNextMinute = 60000 - (Date.now() % 60000);
      this._timeout = setTimeout(() => {
        this.draw();
        this._interval = setInterval(() => this.draw(), 60000);
      }, msToNextMinute);
    }

    destroy() {
      window.removeEventListener('resize', this._onResize);
      clearTimeout(this._timeout);
      clearInterval(this._interval);
    }
  }

  function init() {
    const placeholder = document.getElementById('aptus-wheel-placeholder');
    if (!placeholder) return;

    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'width:100%;max-width:540px;margin:0 auto;';

    const canvas = document.createElement('canvas');
    canvas.id    = 'aptus-wheel';
    canvas.style.display = 'block';
    canvas.setAttribute('aria-label', 'Aptus Calendar Wheel — annual dial showing current date');
    wrapper.appendChild(canvas);
    placeholder.replaceWith(wrapper);

    const wheel = new AptusWheel(canvas);
    wheel.start();
    window._aptusWheel = wheel;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
