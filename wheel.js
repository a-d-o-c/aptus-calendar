// wheel.js — Aptus Calendar Volvelle v3
// Astrolabe-style layered mask discs. Each ring has an opaque disc
// with one slot cut out — only the current state illuminates.
//
// Rings (center → out):
//   Hub  ·  Season (4)  ·  Month (13)  ·  Week (4)  ·  Day (28)  ·  Bezel
//
// 28 outer segments = one full month cycle (1 segment = 1 day of month).
// Week ring aligns with day ring: Orient=days 1–7, Engage=8–14, etc.
// Golden ratio ring proportions throughout.

(function () {
  'use strict';

  const WEEKS = ['Orient', 'Engage', 'Amplify', 'Integrate'];

  const PHASE_COLORS = {
    Orient:    { primary: '#5a7898', light: '#8aaec8' },
    Engage:    { primary: '#c08010', light: '#e0a830' },
    Amplify:   { primary: '#a84020', light: '#d06840' },
    Integrate: { primary: '#3e6848', light: '#60a070' },
  };

  const SEASONS = [
    { key: 'spring', label: 'SPRING' },
    { key: 'summer', label: 'SUMMER' },
    { key: 'autumn', label: 'AUTUMN' },
    { key: 'winter', label: 'WINTER' },
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
      const display   = Math.min(container.clientWidth || 780, 780);
      this.canvas.style.width  = display + 'px';
      this.canvas.style.height = display + 'px';
      this.canvas.width  = display * this.dpr;
      this.canvas.height = display * this.dpr;
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      this.size = display;
      this.cx   = display / 2;
      this.cy   = display / 2;
      this.R    = display / 2 - 18;
      this._computeRings();
      this.draw();
    }

    _computeRings() {
      const R = this.R;
      // Boundaries derived from golden ratio series: 0.190, 0.310, 0.472, 0.650, 0.878
      this.r = {
        hub:     R * 0.190,
        seasIn:  R * 0.190,
        seasOut: R * 0.310,
        monIn:   R * 0.310,
        monOut:  R * 0.472,
        weekIn:  R * 0.472,
        weekOut: R * 0.650,
        dayIn:   R * 0.650,
        dayOut:  R * 0.878,
        bezIn:   R * 0.878,
        bezOut:  R * 1.000,
      };
    }

    // Day-of-month 1–28 → canvas angle (12 o'clock = 0, clockwise)
    _dayAngle(d) {
      return ((d - 1) / 28) * Math.PI * 2 - Math.PI / 2;
    }

    // Quarter index 0–3 → start angle of 90° segment
    _quadAngle(i) {
      return (i / 4) * Math.PI * 2 - Math.PI / 2;
    }

    // Month index 0–12 → start angle of 1/13 segment
    _monthAngle(i) {
      return (i / 13) * Math.PI * 2 - Math.PI / 2;
    }

    // Draw an annular segment
    _segment(r1, r2, a1, a2, fill, stroke, sw) {
      const { ctx, cx, cy } = this;
      ctx.beginPath();
      ctx.arc(cx, cy, r2, a1, a2, false);
      ctx.arc(cx, cy, r1, a2, a1, true);
      ctx.closePath();
      if (fill)   { ctx.fillStyle   = fill;         ctx.fill(); }
      if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = sw || 1; ctx.stroke(); }
    }

    // Draw a radial spoke
    _spoke(r1, r2, angle, color, width) {
      const { ctx, cx, cy } = this;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * r1, cy + Math.sin(angle) * r1);
      ctx.lineTo(cx + Math.cos(angle) * r2, cy + Math.sin(angle) * r2);
      ctx.strokeStyle = color;
      ctx.lineWidth   = width || 1;
      ctx.stroke();
    }

    // Draw text rotated to follow the ring (always reads outward)
    _arcText(text, radius, angle, font, color) {
      const { ctx, cx, cy } = this;
      ctx.save();
      ctx.translate(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
      let rot = angle + Math.PI / 2;
      if (Math.sin(angle) > 0.001) rot += Math.PI;
      ctx.rotate(rot);
      ctx.font         = font;
      ctx.fillStyle    = color;
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 0, 0);
      ctx.restore();
    }

    // Draw ring border circle
    _ringLine(radius, color, width) {
      const { ctx, cx, cy } = this;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = color;
      ctx.lineWidth   = width || 0.7;
      ctx.stroke();
    }

    // Opaque annular mask with one slot gap (slotA1 → slotA2 = the revealed window)
    _mask(r1, r2, slotA1, slotA2, alpha) {
      const { ctx, cx, cy } = this;
      // Draw the ring arc that covers everything EXCEPT the slot
      ctx.beginPath();
      ctx.arc(cx, cy, r2, slotA2, slotA1 + Math.PI * 2, false);
      ctx.arc(cx, cy, r1, slotA1 + Math.PI * 2, slotA2, true);
      ctx.closePath();
      ctx.fillStyle = `rgba(13,10,7,${alpha})`;
      ctx.fill();
    }

    draw() {
      const { ctx, cx, cy, r } = this;
      const now = getAptusDate(new Date());

      ctx.clearRect(0, 0, this.size, this.size);

      // ── Outer disc background ────────────────────────────────────────
      ctx.beginPath();
      ctx.arc(cx, cy, r.bezOut + 1, 0, Math.PI * 2);
      ctx.fillStyle = '#0d0a07';
      ctx.fill();

      this._drawBezel(now);
      this._drawDayRing(now);
      this._drawWeekRing(now);
      this._drawMonthRing(now);
      this._drawSeasonRing(now);
      this._drawHub(now);
    }

    // ── Outer bezel — 28 tick marks ──────────────────────────────────
    _drawBezel(now) {
      const { r } = this;

      this._segment(r.bezIn, r.bezOut, -Math.PI, Math.PI, '#18140f');

      // 28 notch marks; week boundaries are heavier
      for (let d = 1; d <= 28; d++) {
        const a              = this._dayAngle(d);
        const isWeekBoundary = (d - 1) % 7 === 0;
        this._spoke(r.bezIn, r.bezOut, a,
          isWeekBoundary ? '#6a5430' : '#2e2418',
          isWeekBoundary ? 1.5 : 0.5);
      }

      this._ringLine(r.bezOut, '#5a4830', 1.2);
      this._ringLine(r.bezIn,  '#5a4830', 1.0);
    }

    // ── Day ring — 28 equal segments, one slot revealed ───────────────
    _drawDayRing(now) {
      const { r, R } = this;
      const SEG = Math.PI * 2 / 28;
      const GAP = 0.020;

      // Base — all 28 segments, very dark phase-tinted
      for (let d = 1; d <= 28; d++) {
        const a1      = this._dayAngle(d);
        const a2      = a1 + SEG;
        const wk      = Math.floor((d - 1) / 7);
        const col     = PHASE_COLORS[WEEKS[wk]].primary;
        this._segment(r.dayIn, r.dayOut, a1 + GAP, a2 - GAP, col + '1a');
        this._spoke(r.dayIn, r.dayOut, a1,
          (d - 1) % 7 === 0 ? '#3e3020' : '#201a12',
          (d - 1) % 7 === 0 ? 0.9 : 0.3);
      }

      this._ringLine(r.dayOut, '#4a3c24', 0.8);
      this._ringLine(r.dayIn,  '#4a3c24', 0.8);

      if (now.isLacuna) return;

      // Active segment
      const d    = now.dayInMonth;
      const col  = PHASE_COLORS[WEEKS[now.weekIndex]];
      const a1   = this._dayAngle(d);
      const a2   = a1 + SEG;
      const midA = a1 + SEG / 2;
      const midR = (r.dayIn + r.dayOut) / 2;
      const rW   = (r.dayOut - r.dayIn) * 0.50;

      // Glow fill
      this._segment(r.dayIn, r.dayOut, a1 + GAP * 0.3, a2 - GAP * 0.3, col.primary + '55');
      // Centre bar
      this._ringLine(midR, 'rgba(0,0,0,0)'); // reset lineCap
      const { ctx, cx, cy } = this;
      ctx.beginPath();
      ctx.arc(cx, cy, midR, a1 + GAP * 0.8, a2 - GAP * 0.8);
      ctx.strokeStyle = col.primary;
      ctx.lineWidth   = rW;
      ctx.lineCap     = 'butt';
      ctx.stroke();

      // Day number, rotated to follow the arc
      this._arcText(
        String(d),
        midR,
        midA,
        `700 ${R * 0.038}px 'Space Mono', monospace`,
        '#f4efe6'
      );

      // Mask — covers all but the active slot
      this._mask(r.dayIn - 1, r.dayOut + 1, a1 - GAP, a2 + GAP, 0.93);
    }

    // ── Week ring — 4 × 90° phases, aligned with day ring ───────────
    _drawWeekRing(now) {
      const { r, R, ctx, cx, cy } = this;
      const SEG = Math.PI / 2;
      const GAP = 0.022;

      for (let w = 0; w < 4; w++) {
        const a1   = this._quadAngle(w);
        const col  = PHASE_COLORS[WEEKS[w]].primary;
        this._segment(r.weekIn, r.weekOut, a1 + GAP, a1 + SEG - GAP, col + '16');
        this._spoke(r.weekIn, r.weekOut, a1, '#3e3020', 1.0);
        this._arcText(
          WEEKS[w].toUpperCase(),
          (r.weekIn + r.weekOut) / 2,
          a1 + SEG / 2,
          `${R * 0.022}px 'Space Mono', monospace`,
          '#2a201a'
        );
      }

      this._ringLine(r.weekOut, '#4a3c24', 0.8);
      this._ringLine(r.weekIn,  '#4a3c24', 0.8);

      if (now.isLacuna) return;

      const w    = now.weekIndex;
      const col  = PHASE_COLORS[WEEKS[w]];
      const a1   = this._quadAngle(w);
      const a2   = a1 + SEG;
      const midA = a1 + SEG / 2;
      const midR = (r.weekIn + r.weekOut) / 2;
      const rW   = (r.weekOut - r.weekIn) * 0.52;

      this._segment(r.weekIn, r.weekOut, a1 + GAP * 0.4, a2 - GAP * 0.4, col.primary + '45');
      ctx.beginPath();
      ctx.arc(cx, cy, midR, a1 + GAP * 1.2, a2 - GAP * 1.2);
      ctx.strokeStyle = col.primary;
      ctx.lineWidth   = rW;
      ctx.lineCap     = 'butt';
      ctx.stroke();

      this._arcText(
        WEEKS[w].toUpperCase(),
        midR, midA,
        `700 ${R * 0.028}px 'Space Mono', monospace`,
        '#f4efe6'
      );

      this._mask(r.weekIn - 1, r.weekOut + 1, a1 - GAP, a2 + GAP, 0.93);
    }

    // ── Month ring — 13 equal segments (~27.7° each) ─────────────────
    _drawMonthRing(now) {
      const { r, R, ctx, cx, cy } = this;
      const SEG = Math.PI * 2 / 13;
      const GAP = 0.016;

      APTUS_DATA.MONTHS.forEach((month, i) => {
        const a1  = this._monthAngle(i);
        const col = APTUS_DATA.SEASON_COLORS[month.season];
        this._segment(r.monIn, r.monOut, a1 + GAP, a1 + SEG - GAP, col.primary + '18');
        this._spoke(r.monIn, r.monOut, a1, '#302418', 0.5);
        this._arcText(
          month.name.toUpperCase(),
          (r.monIn + r.monOut) / 2,
          a1 + SEG / 2,
          `${R * 0.019}px 'Space Mono', monospace`,
          '#2a201a'
        );
      });

      this._ringLine(r.monOut, '#4a3c24', 0.8);
      this._ringLine(r.monIn,  '#4a3c24', 0.8);

      if (now.isLacuna) return;

      const mi   = now.monthIndex;
      const col  = APTUS_DATA.SEASON_COLORS[now.season];
      const a1   = this._monthAngle(mi);
      const a2   = a1 + SEG;
      const midA = a1 + SEG / 2;
      const midR = (r.monIn + r.monOut) / 2;
      const rW   = (r.monOut - r.monIn) * 0.52;

      this._segment(r.monIn, r.monOut, a1 + GAP * 0.4, a2 - GAP * 0.4, col.bg + 'aa');
      ctx.beginPath();
      ctx.arc(cx, cy, midR, a1 + GAP * 1.2, a2 - GAP * 1.2);
      ctx.strokeStyle = col.primary;
      ctx.lineWidth   = rW;
      ctx.lineCap     = 'butt';
      ctx.stroke();

      this._arcText(
        now.month.toUpperCase(),
        midR, midA,
        `700 ${R * 0.022}px 'Space Mono', monospace`,
        '#f4efe6'
      );

      this._mask(r.monIn - 1, r.monOut + 1, a1 - GAP, a2 + GAP, 0.93);
    }

    // ── Season ring — 4 × 90° sectors ───────────────────────────────
    _drawSeasonRing(now) {
      const { r, R, ctx, cx, cy } = this;
      const SEG = Math.PI / 2;
      const GAP = 0.028;

      SEASONS.forEach((s, i) => {
        const a1  = this._quadAngle(i);
        const col = APTUS_DATA.SEASON_COLORS[s.key];
        this._segment(r.seasIn, r.seasOut, a1 + GAP, a1 + SEG - GAP, col.primary + '18');
        this._spoke(r.seasIn, r.seasOut, a1, '#3e3020', 1.0);
        this._arcText(
          s.label,
          (r.seasIn + r.seasOut) / 2,
          a1 + SEG / 2,
          `${R * 0.020}px 'Space Mono', monospace`,
          '#2a201a'
        );
      });

      this._ringLine(r.seasOut, '#4a3c24', 0.8);
      this._ringLine(r.seasIn,  '#4a3c24', 0.8);

      if (now.isLacuna) return;

      const si   = SEASONS.findIndex(s => s.key === now.season);
      const col  = APTUS_DATA.SEASON_COLORS[now.season];
      const a1   = this._quadAngle(si);
      const a2   = a1 + SEG;
      const midA = a1 + SEG / 2;
      const midR = (r.seasIn + r.seasOut) / 2;
      const rW   = (r.seasOut - r.seasIn) * 0.55;

      this._segment(r.seasIn, r.seasOut, a1 + GAP * 0.4, a2 - GAP * 0.4, col.bg + 'cc');
      ctx.beginPath();
      ctx.arc(cx, cy, midR, a1 + GAP * 1.5, a2 - GAP * 1.5);
      ctx.strokeStyle = col.primary;
      ctx.lineWidth   = rW;
      ctx.lineCap     = 'butt';
      ctx.stroke();

      this._arcText(
        SEASONS[si].label,
        midR, midA,
        `700 ${R * 0.024}px 'Space Mono', monospace`,
        '#f4efe6'
      );

      this._mask(r.seasIn - 1, r.seasOut + 1, a1 - GAP, a2 + GAP, 0.93);
    }

    // ── Center hub — day number, month, year ─────────────────────────
    _drawHub(now) {
      const { ctx, cx, cy, r, R } = this;

      // Hub gradient — offset center gives depth
      const grad = ctx.createRadialGradient(
        cx - R * 0.04, cy - R * 0.05, 0,
        cx, cy, r.hub
      );
      grad.addColorStop(0, '#302418');
      grad.addColorStop(1, '#161008');
      ctx.beginPath();
      ctx.arc(cx, cy, r.hub, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Hub border rings
      this._ringLine(r.hub,       '#6a5428', 1.8);
      this._ringLine(r.hub - 4.5, '#2e2418', 0.6);

      // Subtle geometric motif — 8-point compass rose, very faint
      const rg = r.hub * 0.72;
      ctx.save();
      ctx.strokeStyle = '#251c12';
      ctx.lineWidth   = 0.6;
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(a) * rg, cy + Math.sin(a) * rg);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(cx, cy, rg * 0.42, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, rg * 0.72, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      if (now.isLacuna) {
        ctx.font         = `italic ${R * 0.048}px 'Instrument Serif', serif`;
        ctx.fillStyle    = '#c0a0f0';
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Lacuna', cx, cy);
        this._pivot();
        return;
      }

      const col    = APTUS_DATA.SEASON_COLORS[now.season];
      const hubH   = r.hub;

      // NE year — small, near top of hub
      ctx.font         = `${R * 0.021}px 'Space Mono', monospace`;
      ctx.fillStyle    = '#4a3c28';
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(now.year + ' NE', cx, cy - hubH * 0.36);

      // Day number — dominant
      ctx.font         = `700 ${R * 0.082}px 'Space Mono', monospace`;
      ctx.fillStyle    = '#f4efe6';
      ctx.textBaseline = 'middle';
      ctx.fillText(now.dayInMonth, cx, cy + hubH * 0.04);

      // Month name — italic serif, season-tinted
      ctx.font         = `italic ${R * 0.034}px 'Instrument Serif', serif`;
      ctx.fillStyle    = col.light + 'ee';
      ctx.textBaseline = 'top';
      ctx.fillText(now.month, cx, cy + hubH * 0.32);

      this._pivot();
    }

    // Gold pivot jewel at dead center
    _pivot() {
      const { ctx, cx, cy, R } = this;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 0.014, 0, Math.PI * 2);
      const pg = ctx.createRadialGradient(cx - R * 0.005, cy - R * 0.005, 0, cx, cy, R * 0.014);
      pg.addColorStop(0, '#f8d860');
      pg.addColorStop(1, '#c89020');
      ctx.fillStyle   = pg;
      ctx.fill();
      ctx.strokeStyle = '#a07010';
      ctx.lineWidth   = 0.8;
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
    wrapper.style.cssText = 'width:100%;max-width:780px;margin:0 auto;';

    const canvas = document.createElement('canvas');
    canvas.id    = 'aptus-wheel';
    canvas.style.display = 'block';
    canvas.setAttribute('aria-label', 'Aptus Calendar Volvelle — layered disc instrument showing current date');
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
