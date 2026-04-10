// wheel.js — Aptus Calendar Volvelle v4
// Design: warm cream face · three rotating discs · reading window fixed at 12 o'clock
// All discs rotate so the current segment rises to the window.
// Physical depth: drop shadow, mask plate colour offset, aperture edge shading.
//
// Rings (centre → out): hub · season (4) · month (13) · day (28) · bezel
// Week phase labelled inside the day window — not a separate ring.
// Year clock: separate small dial showing 365-day position + cardinal events.

(function () {
  'use strict';

  const SEASONS = [
    { key: 'spring', label: 'Spring' },
    { key: 'summer', label: 'Summer' },
    { key: 'autumn', label: 'Autumn' },
    { key: 'winter', label: 'Winter' },
  ];

  const PHASES = ['Orient', 'Engage', 'Amplify', 'Integrate'];

  const PHASE_COL = {
    Orient:    '#426480',
    Engage:    '#a06c10',
    Amplify:   '#804030',
    Integrate: '#3a6048',
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // AptusVolvelle — main rotating-disc calendar
  // ─────────────────────────────────────────────────────────────────────────────

  class AptusVolvelle {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx    = canvas.getContext('2d');
      this.dpr    = window.devicePixelRatio || 1;
      this._resize = this._resize.bind(this);
      window.addEventListener('resize', this._resize);
      this._resize();
    }

    _resize() {
      const d = Math.min(this.canvas.parentElement.clientWidth || 780, 780);
      this.canvas.style.width  = d + 'px';
      this.canvas.style.height = d + 'px';
      this.canvas.width  = d * this.dpr;
      this.canvas.height = d * this.dpr;
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      this.S  = d;
      this.cx = d / 2;
      this.cy = d / 2;
      this.R  = d / 2 - 18;
      const R = this.R;
      // Ring boundaries (centre → out). Small gaps between discs show depth.
      this.r = {
        hub:  R * 0.178,
        sI:   R * 0.208,  sO: R * 0.385,  // season disc
        mI:   R * 0.410,  mO: R * 0.625,  // month disc
        dI:   R * 0.650,  dO: R * 0.872,  // day disc
        bI:   R * 0.872,  bO: R * 1.000,  // bezel
      };
      this.draw();
    }

    // Aperture half-angle — ±0.52 rad (≈ 30°) from 12 o'clock = 60° window
    get AH() { return 0.52; }

    // ── Main draw ──────────────────────────────────────────────────────────────

    draw() {
      const { ctx, S } = this;
      const now = getAptusDate(new Date());
      ctx.clearRect(0, 0, S, S);

      this._face();
      this._ghostDiscs(now);  // faint rotating discs (show mechanism outside window)
      this._masks();           // cream plates cover non-aperture area
      this._activeDiscs(now); // bright content in aperture window
      this._gapLines();        // subtle ring-boundary lines
      this._hub(now);
      this._apertureFrame();
      this._bezel();
    }

    // ── Face ───────────────────────────────────────────────────────────────────

    _face() {
      const { ctx, cx, cy, r } = this;
      const g = ctx.createRadialGradient(cx, cy - r.bO * 0.05, 0, cx, cy, r.bO);
      g.addColorStop(0,   '#faf8f3');
      g.addColorStop(0.6, '#f6f2e8');
      g.addColorStop(1,   '#ede6d5');
      ctx.beginPath();
      ctx.arc(cx, cy, r.bO, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
    }

    // ── Ghost discs — very pale rotating content (visible outside window too) ──

    _ghostDiscs(now) {
      if (now.isLacuna) return;
      const { r } = this;
      const si = SEASONS.findIndex(s => s.key === now.season);

      // Season ghost
      this._discPass(4, -si * Math.PI / 2, (i, a1, a2) => {
        const col = APTUS_DATA.SEASON_COLORS[SEASONS[i].key];
        this._segFill(r.sI, r.sO, a1, a2, col.bg + '60', 0.012);
      });

      // Month ghost
      const mSEG = Math.PI * 2 / 13;
      this._discPass(13, -now.monthIndex * mSEG, (i, a1, a2) => {
        const col = APTUS_DATA.SEASON_COLORS[APTUS_DATA.MONTHS[i].season];
        this._segFill(r.mI, r.mO, a1, a2, col.bg + '48', 0.010);
      });

      // Day ghost — phase-tinted
      const dSEG = Math.PI * 2 / 28;
      this._discPass(28, -(now.dayInMonth - 1) * dSEG, (i, a1, a2) => {
        const col = PHASE_COL[PHASES[Math.floor(i / 7)]];
        this._segFill(r.dI, r.dO, a1, a2, col + '1e', 0.008);
      });
    }

    // ── Cream masks — cover non-aperture area of each disc ─────────────────────

    _masks() {
      const { ctx, cx, cy, r } = this;
      const AH   = this.AH;
      const a1   = -Math.PI / 2 - AH;
      const a2   = -Math.PI / 2 + AH;
      // The mask covers from aperture-end → aperture-start (the long way around)
      const mA1  = a2;
      const mA2  = a1 + Math.PI * 2;

      // Mask plate colour — slightly warmer/darker than face to imply depth
      const plate = '#eae3d0';

      [[r.sI, r.sO], [r.mI, r.mO], [r.dI, r.dO]].forEach(([rI, rO]) => {
        // Main mask plate
        ctx.beginPath();
        ctx.arc(cx, cy, rO, mA1, mA2, false);
        ctx.arc(cx, cy, rI, mA2, mA1, true);
        ctx.closePath();
        ctx.fillStyle = plate;
        ctx.fill();

        // Subtle inner shadow at left aperture edge (light comes from upper-left)
        this._edgeShadow(cx, cy, rI, rO, a1, a1 + 0.22, 'rgba(130,105,65,0.07)');
        // Subtle inner shadow at right aperture edge
        this._edgeShadow(cx, cy, rI, rO, a2 - 0.22, a2, 'rgba(130,105,65,0.07)');
      });
    }

    _edgeShadow(cx, cy, rI, rO, eA1, eA2, col) {
      const { ctx } = this;
      ctx.beginPath();
      ctx.arc(cx, cy, rO, eA1, eA2, false);
      ctx.arc(cx, cy, rI, eA2, eA1, true);
      ctx.closePath();
      ctx.fillStyle = col;
      ctx.fill();
    }

    // ── Active discs — bright content, clipped to aperture window ──────────────

    _activeDiscs(now) {
      if (now.isLacuna) return;
      const { r, R } = this;

      // Season
      const si   = SEASONS.findIndex(s => s.key === now.season);
      const sSEG = Math.PI / 2;
      this._withClip(r.sI, r.sO, () => {
        this._discPass(4, -si * sSEG, (i, a1, a2, midA) => {
          const dist = Math.min(Math.abs(i - si), 4 - Math.abs(i - si));
          const col  = APTUS_DATA.SEASON_COLORS[SEASONS[i].key];
          const curr = dist === 0;
          if (curr) {
            this._segFill(r.sI, r.sO, a1, a2, col.bg, 0.015);
            this._colBand((r.sI + r.sO) / 2, a1, a2, col.primary + 'cc', (r.sO - r.sI) * 0.28);
          }
          const alpha = curr ? 'ff' : dist === 1 ? '50' : '20';
          this._radText(SEASONS[i].label,
            (r.sI + r.sO) / 2, midA,
            `${curr ? '600' : '400'} ${R * 0.036}px 'Lora', Georgia, serif`,
            col.primary + alpha);
        });
      });

      // Month
      const mi   = now.monthIndex;
      const mSEG = Math.PI * 2 / 13;
      this._withClip(r.mI, r.mO, () => {
        this._discPass(13, -mi * mSEG, (i, a1, a2, midA) => {
          const raw  = i - mi;
          const dist = Math.min(Math.abs(raw), 13 - Math.abs(raw));
          const m    = APTUS_DATA.MONTHS[i];
          const col  = APTUS_DATA.SEASON_COLORS[m.season];
          const curr = dist === 0;
          const midR = (r.mI + r.mO) / 2;
          if (curr) {
            this._segFill(r.mI, r.mO, a1, a2, col.bg, 0.012);
            this._colBand(midR, a1, a2, col.primary + 'bb', (r.mO - r.mI) * 0.24);
            this._textBlock(midR, midA, [
              { text: m.name,  font: `700 ${R * 0.031}px 'Space Mono', monospace`, fill: col.primary,       dy: -R * 0.013 },
              { text: m.focus, font: `italic ${R * 0.020}px 'Lora', serif`,        fill: col.primary + 'aa', dy:  R * 0.014 },
            ]);
          } else {
            const alpha = dist === 1 ? '52' : '22';
            this._radText(m.name, midR, midA,
              `${R * 0.021}px 'Space Mono', monospace`, col.primary + alpha);
          }
        });
      });

      // Day
      const d    = now.dayInMonth;
      const dSEG = Math.PI * 2 / 28;
      this._withClip(r.dI, r.dO, () => {
        this._discPass(28, -(d - 1) * dSEG, (i, a1, a2, midA) => {
          const dayN = i + 1;
          const raw  = i - (d - 1);
          const dist = Math.min(Math.abs(raw), 28 - Math.abs(raw));
          const wk   = Math.floor(i / 7);
          const col  = PHASE_COL[PHASES[wk]];
          const curr = dist === 0;
          const midR = (r.dI + r.dO) / 2;

          if (curr) {
            this._segFill(r.dI, r.dO, a1, a2, col + '20', 0.006);
            this._colBand(midR, a1, a2, col + 'bb', (r.dO - r.dI) * 0.30);
            this._textBlock(midR, midA, [
              { text: String(dayN),   font: `700 ${R * 0.054}px 'Space Mono', monospace`, fill: col,         dy: -R * 0.014 },
              { text: PHASES[wk],     font: `${R * 0.019}px 'Space Mono', monospace`,      fill: col + 'bb', dy:  R * 0.017 },
            ]);
          } else {
            const sz    = dist === 1 ? R * 0.030 : R * 0.022;
            const alpha = dist === 1 ? '72' : dist === 2 ? '44' : '22';
            this._radText(String(dayN), midR, midA,
              `${sz}px 'Space Mono', monospace`, col + alpha);
          }
        });
      });
    }

    // ── Structural ring lines (very faint — show disc boundaries) ──────────────

    _gapLines() {
      const { ctx, cx, cy, r } = this;
      [r.sI, r.sO, r.mI, r.mO, r.dI, r.dO, r.bI].forEach(rad => {
        ctx.beginPath();
        ctx.arc(cx, cy, rad, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(170,140,85,0.24)';
        ctx.lineWidth   = 0.8;
        ctx.stroke();
      });
    }

    // ── Hub ────────────────────────────────────────────────────────────────────

    _hub(now) {
      const { ctx, cx, cy, r, R } = this;
      const g = ctx.createRadialGradient(cx - R * 0.03, cy - R * 0.04, 0, cx, cy, r.hub);
      g.addColorStop(0, '#faf8f3');
      g.addColorStop(1, '#f0ebe0');
      ctx.beginPath();
      ctx.arc(cx, cy, r.hub, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
      // Hub border
      ctx.beginPath();
      ctx.arc(cx, cy, r.hub, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(170,140,85,0.55)';
      ctx.lineWidth   = 1.5;
      ctx.stroke();
      // Inner decorative ring
      ctx.beginPath();
      ctx.arc(cx, cy, r.hub - 5, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(170,140,85,0.20)';
      ctx.lineWidth   = 0.6;
      ctx.stroke();

      if (now.isLacuna) {
        ctx.font         = `italic ${R * 0.044}px 'Lora', serif`;
        ctx.fillStyle    = '#7a60a8';
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Lacuna', cx, cy);
      } else {
        // NE year
        ctx.font         = `${R * 0.021}px 'Space Mono', monospace`;
        ctx.fillStyle    = 'rgba(115,95,65,0.65)';
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'alphabetic';
        ctx.fillText(now.year + ' NE', cx, cy - r.hub * 0.30);
        // Gregorian date
        const greg = new Date().toLocaleDateString('en-NZ', { day: 'numeric', month: 'short' });
        ctx.font         = `${R * 0.017}px 'Space Mono', monospace`;
        ctx.fillStyle    = 'rgba(140,115,80,0.48)';
        ctx.textBaseline = 'top';
        ctx.fillText(greg, cx, cy + r.hub * 0.22);
      }

      // Gold pivot jewel
      const pg = ctx.createRadialGradient(cx - R * 0.006, cy - R * 0.007, 0, cx, cy, R * 0.017);
      pg.addColorStop(0, '#f5d56a');
      pg.addColorStop(1, '#c49020');
      ctx.beginPath();
      ctx.arc(cx, cy, R * 0.017, 0, Math.PI * 2);
      ctx.fillStyle   = pg;
      ctx.fill();
      ctx.strokeStyle = 'rgba(155,115,35,0.55)';
      ctx.lineWidth   = 0.8;
      ctx.stroke();
    }

    // ── Aperture frame — visible window outline ─────────────────────────────────

    _apertureFrame() {
      const { ctx, cx, cy, r } = this;
      const AH   = this.AH;
      const gold = 'rgba(170,140,85,0.80)';

      // Radial edge lines at aperture boundaries
      [-AH, AH].forEach(offset => {
        const a    = -Math.PI / 2 + offset;
        const cos  = Math.cos(a);
        const sin  = Math.sin(a);
        ctx.beginPath();
        ctx.moveTo(cx + cos * (r.sI - 6), cy + sin * (r.sI - 6));
        ctx.lineTo(cx + cos * (r.dO + 6), cy + sin * (r.dO + 6));
        ctx.strokeStyle = gold;
        ctx.lineWidth   = 1.2;
        ctx.stroke();
      });

      // Arc along outer edge of aperture
      ctx.beginPath();
      ctx.arc(cx, cy, r.dO + 5, -Math.PI / 2 - AH, -Math.PI / 2 + AH);
      ctx.strokeStyle = gold;
      ctx.lineWidth   = 1.8;
      ctx.stroke();

      // Arc along inner edge of aperture
      ctx.beginPath();
      ctx.arc(cx, cy, r.sI - 5, -Math.PI / 2 - AH, -Math.PI / 2 + AH);
      ctx.strokeStyle = 'rgba(170,140,85,0.45)';
      ctx.lineWidth   = 1.0;
      ctx.stroke();

      // Gold diamond marker at 12 o'clock above the wheel
      const dmY = cy - r.dO - 11;
      ctx.save();
      ctx.translate(cx, dmY);
      ctx.beginPath();
      ctx.moveTo(0, -5); ctx.lineTo(5, 0); ctx.lineTo(0, 5); ctx.lineTo(-5, 0);
      ctx.closePath();
      ctx.fillStyle = 'rgba(175,140,65,0.88)';
      ctx.fill();
      ctx.restore();
    }

    // ── Bezel ──────────────────────────────────────────────────────────────────

    _bezel() {
      const { ctx, cx, cy, r } = this;
      const SEG = Math.PI * 2 / 28;
      // 28 tick marks
      for (let i = 0; i < 28; i++) {
        const a       = i * SEG - Math.PI / 2;
        const isWeek  = i % 7 === 0;
        const rInner  = isWeek ? r.bI : r.bI + (r.bO - r.bI) * 0.45;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * rInner, cy + Math.sin(a) * rInner);
        ctx.lineTo(cx + Math.cos(a) * r.bO,   cy + Math.sin(a) * r.bO);
        ctx.strokeStyle = isWeek
          ? 'rgba(170,140,85,0.65)'
          : 'rgba(170,140,85,0.28)';
        ctx.lineWidth = isWeek ? 1.2 : 0.6;
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(cx, cy, r.bO - 0.5, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(170,140,85,0.55)';
      ctx.lineWidth   = 1.5;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, r.bI, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(170,140,85,0.30)';
      ctx.lineWidth   = 0.8;
      ctx.stroke();
    }

    // ── Primitive helpers ───────────────────────────────────────────────────────

    // Iterate over n segments of a rotating disc.
    // Calls cb(index, a1, a2, midA) in a context translated to (cx,cy) and rotated.
    _discPass(n, rotation, cb) {
      const { ctx, cx, cy } = this;
      const SEG = Math.PI * 2 / n;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rotation);
      for (let i = 0; i < n; i++) {
        const a1 = i * SEG - Math.PI / 2;
        cb(i, a1, a1 + SEG, a1 + SEG / 2);
      }
      ctx.restore();
    }

    // Fill an annular segment (call inside _discPass — origin = ring centre)
    _segFill(rI, rO, a1, a2, fill, gap) {
      const { ctx } = this;
      const g = gap || 0;
      ctx.beginPath();
      ctx.arc(0, 0, rO, a1 + g, a2 - g, false);
      ctx.arc(0, 0, rI, a2 - g, a1 + g, true);
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
    }

    // Draw a colour band (thick arc stroke) — call inside _discPass
    _colBand(radius, a1, a2, color, width) {
      const { ctx } = this;
      ctx.beginPath();
      ctx.arc(0, 0, radius, a1 + 0.022, a2 - 0.022);
      ctx.strokeStyle = color;
      ctx.lineWidth   = width;
      ctx.lineCap     = 'butt';
      ctx.stroke();
    }

    // Radially-oriented text — call inside _discPass (origin = ring centre)
    _radText(text, radius, angle, font, fill) {
      const { ctx } = this;
      ctx.save();
      ctx.translate(Math.cos(angle) * radius, Math.sin(angle) * radius);
      let rot = angle + Math.PI / 2;
      if (Math.sin(angle) > 0.001) rot += Math.PI;
      ctx.rotate(rot);
      ctx.font = font; ctx.fillStyle = fill;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(text, 0, 0);
      ctx.restore();
    }

    // Multiple text lines at the same angle, each offset radially — call inside _discPass
    _textBlock(radius, angle, lines) {
      const { ctx } = this;
      ctx.save();
      ctx.translate(Math.cos(angle) * radius, Math.sin(angle) * radius);
      let rot = angle + Math.PI / 2;
      if (Math.sin(angle) > 0.001) rot += Math.PI;
      ctx.rotate(rot);
      ctx.textAlign = 'center';
      lines.forEach(({ text, font, fill, dy }) => {
        ctx.font = font; ctx.fillStyle = fill;
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 0, dy);
      });
      ctx.restore();
    }

    // Clip context to the aperture window (annular arc at 12 o'clock) then run fn
    _withClip(rI, rO, fn) {
      const { ctx, cx, cy } = this;
      const AH = this.AH;
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, rO + 5, -Math.PI / 2 - AH, -Math.PI / 2 + AH, false);
      ctx.arc(cx, cy, rI - 5, -Math.PI / 2 + AH, -Math.PI / 2 - AH, true);
      ctx.closePath();
      ctx.clip();
      fn();
      ctx.restore();
    }

    start() {
      this.draw();
      const msToNext = 60000 - (Date.now() % 60000);
      this._t = setTimeout(() => {
        this.draw();
        this._i = setInterval(() => this.draw(), 60000);
      }, msToNext);
    }

    destroy() {
      window.removeEventListener('resize', this._resize);
      clearTimeout(this._t);
      clearInterval(this._i);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // AptusYearClock — small 365-day dial showing seasonal position + cardinal events
  // ─────────────────────────────────────────────────────────────────────────────

  class AptusYearClock {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx    = canvas.getContext('2d');
      this.dpr    = window.devicePixelRatio || 1;
      this._resize = this._resize.bind(this);
      window.addEventListener('resize', this._resize);
      this._resize();
    }

    _resize() {
      const d = Math.min(this.canvas.parentElement.clientWidth || 220, 220);
      this.canvas.style.width  = d + 'px';
      this.canvas.style.height = d + 'px';
      this.canvas.width  = d * this.dpr;
      this.canvas.height = d * this.dpr;
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      this.S  = d;
      this.cx = d / 2;
      this.cy = d / 2;
      this.R  = d / 2 - 12;
      this.draw();
    }

    // Day of year (1–365) → canvas angle (12 o'clock = Spring EQ = day 1)
    _angle(day) {
      return ((day - 1) / 365) * Math.PI * 2 - Math.PI / 2;
    }

    draw() {
      const { ctx, cx, cy, R } = this;
      const now = getAptusDate(new Date());
      ctx.clearRect(0, 0, this.S, this.S);

      // Face
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
      g.addColorStop(0, '#faf8f3');
      g.addColorStop(1, '#ece5d5');
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();

      // Season arcs
      const rO = R * 0.82;
      const rI = R * 0.50;
      const YEAR_SEASONS = [
        { key: 'spring', s: 1,   e: 84  },
        { key: 'summer', s: 85,  e: 168 },
        { key: 'autumn', s: 169, e: 252 },
        { key: 'winter', s: 253, e: 364 },
      ];
      YEAR_SEASONS.forEach(({ key, s, e }) => {
        const col = APTUS_DATA.SEASON_COLORS[key];
        const a1  = this._angle(s);
        const a2  = this._angle(e + 0.9);
        ctx.beginPath();
        ctx.arc(cx, cy, rO, a1, a2, false);
        ctx.arc(cx, cy, rI, a2, a1, true);
        ctx.closePath();
        ctx.fillStyle = col.bg + 'cc';
        ctx.fill();
      });

      // Month divider marks on inner ring
      APTUS_DATA.MONTHS.forEach(m => {
        const a = this._angle(m.start);
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * rI, cy + Math.sin(a) * rI);
        ctx.lineTo(cx + Math.cos(a) * rO, cy + Math.sin(a) * rO);
        ctx.strokeStyle = 'rgba(170,140,85,0.28)';
        ctx.lineWidth   = 0.5;
        ctx.stroke();
      });

      // Ring borders
      [R, rO, rI].forEach(rad => {
        ctx.beginPath();
        ctx.arc(cx, cy, rad, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(170,140,85,0.42)';
        ctx.lineWidth   = 0.8;
        ctx.stroke();
      });

      // Cardinal event markers (equinoxes + solstices)
      const EVENTS = [
        { day: 1,   key: 'spring' },
        { day: 91,  key: 'summer' },
        { day: 180, key: 'autumn' },
        { day: 272, key: 'winter' },
      ];
      EVENTS.forEach(({ day, key }) => {
        const col = APTUS_DATA.SEASON_COLORS[key];
        const a   = this._angle(day);
        // Marker line through arc
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * (rI - 2), cy + Math.sin(a) * (rI - 2));
        ctx.lineTo(cx + Math.cos(a) * (R - 1),  cy + Math.sin(a) * (R - 1));
        ctx.strokeStyle = col.primary + 'cc';
        ctx.lineWidth   = 1.5;
        ctx.stroke();
        // Diamond at outer rim
        const dx = cx + Math.cos(a) * (R - 6);
        const dy = cy + Math.sin(a) * (R - 6);
        ctx.save();
        ctx.translate(dx, dy);
        ctx.rotate(a);
        ctx.beginPath();
        ctx.moveTo(0, -3.5); ctx.lineTo(3.5, 0);
        ctx.lineTo(0, 3.5);  ctx.lineTo(-3.5, 0);
        ctx.closePath();
        ctx.fillStyle = col.primary;
        ctx.fill();
        ctx.restore();
        // Season initial letter in arc band
        const lR = (rI + rO) / 2;
        const lx = cx + Math.cos(a + 0.22) * lR;
        const ly = cy + Math.sin(a + 0.22) * lR;
        ctx.save();
        ctx.translate(lx, ly);
        let rot = (a + 0.22) + Math.PI / 2;
        if (Math.sin(a + 0.22) > 0.001) rot += Math.PI;
        ctx.rotate(rot);
        ctx.font         = `700 ${R * 0.095}px 'Space Mono', monospace`;
        ctx.fillStyle    = col.primary + 'dd';
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(key.charAt(0).toUpperCase(), 0, 0);
        ctx.restore();
      });

      // Today — highlight current arc position
      if (!now.isLacuna) {
        const a   = this._angle(now.dayOfYear);
        const col = APTUS_DATA.SEASON_COLORS[now.season];
        const sp  = (2 / 365) * Math.PI * 2;
        // Today marker arc
        ctx.beginPath();
        ctx.arc(cx, cy, (rI + rO) / 2, a - sp, a + sp);
        ctx.strokeStyle = col.primary;
        ctx.lineWidth   = rO - rI - 2;
        ctx.lineCap     = 'round';
        ctx.stroke();
        // Thin needle from centre to arc
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(a) * rI, cy + Math.sin(a) * rI);
        ctx.strokeStyle = col.primary + 'cc';
        ctx.lineWidth   = 1.2;
        ctx.lineCap     = 'round';
        ctx.stroke();
      }

      // Centre: last 2 digits of NE year
      if (now.year) {
        ctx.font         = `${R * 0.22}px 'Space Mono', monospace`;
        ctx.fillStyle    = 'rgba(120,100,70,0.40)';
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(now.year).slice(-2), cx, cy);
      }

      // Centre pivot
      ctx.beginPath();
      ctx.arc(cx, cy, R * 0.052, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(170,140,85,0.65)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(140,110,55,0.50)';
      ctx.lineWidth   = 0.8;
      ctx.stroke();
    }

    start() {
      this.draw();
      this._i = setInterval(() => this.draw(), 60000);
    }

    destroy() {
      window.removeEventListener('resize', this._resize);
      clearInterval(this._i);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Init — create both canvases
  // ─────────────────────────────────────────────────────────────────────────────

  function init() {
    // Main volvelle
    const vEl = document.getElementById('aptus-wheel-placeholder');
    if (vEl) {
      const wrap = document.createElement('div');
      wrap.style.cssText = 'width:100%;max-width:780px;margin:0 auto;';
      const c = document.createElement('canvas');
      c.id = 'aptus-wheel';
      c.style.cssText = [
        'display:block',
        'border-radius:50%',
        'box-shadow:0 8px 48px rgba(110,85,40,0.18),0 2px 10px rgba(110,85,40,0.10)',
      ].join(';');
      c.setAttribute('aria-label', 'Aptus Calendar Volvelle — rotating disc calendar');
      wrap.appendChild(c);
      vEl.replaceWith(wrap);
      const v = new AptusVolvelle(c);
      v.start();
      window._aptusVolvelle = v;
    }

    // Year clock
    const yEl = document.getElementById('aptus-year-clock-placeholder');
    if (yEl) {
      const wrap = document.createElement('div');
      wrap.style.cssText = 'width:100%;max-width:220px;margin:0 auto;';
      const c = document.createElement('canvas');
      c.id = 'aptus-year-clock';
      c.style.cssText = [
        'display:block',
        'border-radius:50%',
        'box-shadow:0 4px 22px rgba(110,85,40,0.14),0 1px 5px rgba(110,85,40,0.08)',
      ].join(';');
      c.setAttribute('aria-label', 'Aptus Year Clock — year position and seasonal events');
      wrap.appendChild(c);
      yEl.replaceWith(wrap);
      const y = new AptusYearClock(c);
      y.start();
      window._aptusYearClock = y;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
