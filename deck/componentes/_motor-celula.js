/* Nutrición.Health · Motor de ilustración celular para slides animados.
 * Se incluye una sola vez por deck (el generador lo inserta con {{INCLUIR:_motor-celula.js}}).
 * Cada componente llama NHCelula.mount(root, cfg) con su propia historia por pasos.
 *
 * cfg = {
 *   receptors: [x...],             // posiciones de receptores de insulina (opcional)
 *   legend: ['glucosa','insulina','receptor','glut4'],
 *   steps: [{ label, caption }],   // 4 pasos recomendados
 *   panels: [{ label, tone: 'green'|'amber', labels: bool, liver: bool, aria,
 *              state(step, t) => ({ G, freeIns, rec:[0..1], fuse:[0..1 x4], glow,
 *                                   signal:{r,a}|null, uptake:{elapsed,every}|null,
 *                                   liver:0..1, tag:{text,alpha}|null }) }]
 * }
 */
window.NHCelula = window.NHCelula || (function () {
  // ── Escena lógica (unidades de dibujo) ──────────────────────────────────
  const LW = 640, LH = 380;
  const LUMEN_B = 118, WALL_B = 138, BI = 22;
  const yM = x => 244 + 24 * Math.pow((x - 320) / 320, 2);   // cara externa de la membrana
  const SLOTS = [80, 240, 400, 560];                         // posiciones de GLUT4
  const DEFAULT_RECEPTORS = [160, 320, 480];

  const C = {
    plasmaTop: '#EAD5CA', plasmaBot: '#DDBAAB',
    wall: '#D6AC9A', wallHi: '#E6C5B6', wallNuc: '#A66F5E', wallLine: '#BF8E7C',
    inter: '#F7F3ED', fiber: '#ECE4D8',
    cytoTop: '#ECF3EF', cytoBot: '#DCE8E1',
    head: '#9E998F', headHi: '#C9C4BA', tail: '#D3CCBF',
    glcFill: '#EBC48B', glcLine: '#C4832B', oxy: '#6B6760',
    insA: '#2B4038', insB: '#3D5C4F',
    rec: '#7D8A83', recOn: '#2B4038',
    glut: '#6B6760', glutHi: '#8A857D',
    signal: '#3D5C4F', label: '#1E1C19',
  };

  // ── Estilos (una vez por documento) ─────────────────────────────────────
  const CSS = `
    .slide-anim { background: var(--cream); }
    .slide-anim .s-header { background: var(--green); padding: 3.2% 6%; display: flex; justify-content: space-between; align-items: center; }
    .slide-anim .s-header-title { font-family: var(--serif); font-size: 1.5em; font-weight: 400; color: var(--white); }
    .slide-anim .s-header-brand { font-size: .7em; font-weight: 600; letter-spacing: .08em; color: var(--green-light); }
    .slide-anim .ga-body { flex: 1; min-height: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 3%; padding: 2% 6% 0; cursor: pointer; }
    .slide-anim .ga-panel { margin: 0; display: flex; flex-direction: column; min-height: 0; min-width: 0; gap: .45em; }
    .slide-anim .ga-panel-head { display: flex; justify-content: space-between; align-items: baseline; gap: 1em; }
    .slide-anim .ga-label { font-size: .72em; font-weight: 600; letter-spacing: .12em; text-transform: uppercase; color: var(--charcoal-60); }
    .slide-anim .ga-reading { font-size: .72em; color: var(--charcoal-60); white-space: nowrap; font-variant-numeric: tabular-nums; }
    .slide-anim .ga-reading b { font-family: var(--serif); font-size: 2.3em; font-weight: 700; color: var(--green); margin-right: .15em; }
    .slide-anim .ga-panel[data-tone="amber"] .ga-reading b { color: var(--amber); }
    .slide-anim .ga-canvas { flex: 1; min-height: 0; position: relative; border-radius: 6px; overflow: hidden; background: #E4EDE8; box-shadow: inset 0 0 0 1px var(--cream-dark); }
    .slide-anim .ga-canvas canvas { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
    .slide-anim .ga-liver { display: flex; align-items: center; gap: .8em; font-size: .66em; color: var(--charcoal-60); }
    .slide-anim .ga-liver svg { width: 2em; height: 1.4em; flex: none; }
    .slide-anim .ga-liver-bars { display: inline-flex; gap: .25em; }
    .slide-anim .ga-liver-bars i { width: 1.1em; height: .9em; border-radius: 2px; background: var(--cream-dark); transition: background .4s; }
    .slide-anim .ga-liver-bars i.on { background: var(--charcoal-60); }
    .slide-anim .ga-liver-txt { color: var(--charcoal); font-weight: 600; }
    .slide-anim .ga-legend { display: flex; flex-wrap: wrap; gap: .4em 1.6em; padding: .8em 6% 0; font-size: .7em; color: var(--charcoal-60); }
    .slide-anim .ga-legend span { display: inline-flex; align-items: center; gap: .5em; }
    .slide-anim .ga-legend svg { width: 1.7em; height: 1.7em; }
    .slide-anim .ga-steps { padding: 1.2% 6% 1.4%; display: grid; grid-template-columns: auto 1fr; gap: .5em 2.2em; align-items: center; }
    .slide-anim .ga-steplist { display: flex; gap: .4em; }
    .slide-anim .ga-step { font: inherit; font-size: .66em; font-weight: 600; letter-spacing: .04em; color: var(--charcoal-30); background: none; border: 0; padding: .35em .2em; cursor: pointer; display: inline-flex; align-items: center; gap: .55em; }
    .slide-anim .ga-step i { width: 1.9em; height: 1.9em; border-radius: 50%; border: 2px solid currentColor; display: inline-grid; place-items: center; font-style: normal; font-size: .9em; }
    .slide-anim .ga-step[data-state="done"] { color: var(--green); }
    .slide-anim .ga-step[data-state="current"] { color: var(--charcoal); }
    .slide-anim .ga-step[data-state="current"] i { background: var(--amber); border-color: var(--amber); color: var(--white); }
    .slide-anim .ga-step:focus-visible { outline: 2px solid var(--amber); outline-offset: 2px; }
    .slide-anim .ga-caption { font-size: .86em; color: var(--charcoal); line-height: 1.4; min-height: 2.8em; display: flex; align-items: center; margin: 0; }
    .slide-anim .ga-caption, .slide-anim .ga-caption * { line-height: 1.4; }
    .slide-anim .s-foot { padding: 1.3% 6%; border-top: 1px solid var(--cream-dark); display: flex; justify-content: space-between; font-size: .62em; color: var(--charcoal-30); }
  `;
  const styleEl = document.createElement('style'); styleEl.textContent = CSS; document.head.appendChild(styleEl);

  const LEGEND = {
    glucosa: ['Glucosa', '<polygon points="12,4 19,8 19,16 12,20 5,16 5,8" fill="#EBC48B" stroke="#C4832B" stroke-width="1.8"/><circle cx="12" cy="4" r="1.8" fill="#6B6760"/>'],
    insulina: ['Insulina', '<circle cx="9" cy="12" r="5" fill="#2B4038"/><circle cx="15" cy="10" r="4.5" fill="#3D5C4F"/><circle cx="14" cy="15.5" r="3.5" fill="#2B4038"/>'],
    receptor: ['Receptor de insulina', '<path d="M9 21V13M15 21V13M9 13 5 5M15 13l4-8" stroke="#2B4038" stroke-width="3" stroke-linecap="round" fill="none"/>'],
    glut4: ['GLUT4, la puerta de la glucosa', '<rect x="5" y="4" width="6" height="16" rx="3" fill="#6B6760"/><rect x="13" y="4" width="6" height="16" rx="3" fill="#6B6760"/>'],
  };
  const LIVER_SVG = '<svg viewBox="0 0 40 28" aria-hidden="true"><path d="M3 11c5-6 24-8 33-3 3 2 1 8-4 11-7 5-17 8-23 7-6-1-9-9-6-15Z" fill="#A66F5E" opacity=".8"/></svg>';

  // ── Utilidades deterministas ────────────────────────────────────────────
  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const hash = (k, s) => { const r = rng(k * 7919 + s * 104729); r(); return r(); };
  const prog = (t, start, dur) => clamp((t - start) / dur, 0, 1);

  // Población fija: igual en cada presentación y en cada slide
  const R = rng(20251122);
  const RBC = Array.from({ length: 7 }, (_, i) => ({ x0: R() * 760, y: 26 + R() * 70, s: i < 3 ? .72 + R() * .1 : .92 + R() * .18, tilt: (R() - .5) * .5, v: 16 + R() * 6 }));
  RBC.sort((a, b) => a.s - b.s);
  const GL = Array.from({ length: 28 }, () => ({ x0: R() * 760, y: 14 + R() * 96, rot: R() * 6.28, v: 20 + R() * 10, spin: (R() - .5) * .6 }));
  const GI = Array.from({ length: 14 }, () => { const x = 24 + R() * 592; return { x, y: 150 + R() * (yM(x) - 172), ph: R() * 6.28, ph2: R() * 6.28, rot: R() * 6.28 }; });
  const FIBERS = Array.from({ length: 7 }, () => ({ x: -40 + R() * 680, y: 150 + R() * 70, len: 120 + R() * 160, amp: 3 + R() * 5, k: .03 + R() * .03, a: (R() - .5) * .35 }));
  const FREE_INS = Array.from({ length: 12 }, () => ({ x0: R() * 760, y: 18 + R() * 92, v: 18 + R() * 8, rot: R() * 6.28 }));

  // ── Capa estática ───────────────────────────────────────────────────────
  function drawStatic(c, g) {
    const X0 = g.x0 - 4, X1 = g.x1 + 4;
    let gr = c.createLinearGradient(0, 230, 0, g.y1);
    gr.addColorStop(0, C.cytoTop); gr.addColorStop(1, C.cytoBot);
    c.fillStyle = gr; c.fillRect(X0, g.y0, X1 - X0, g.y1 - g.y0);
    mito(c, 470, 338, 44, 15, -.18); mito(c, 250, 356, 34, 12, .22);
    c.beginPath(); c.moveTo(X0, WALL_B); c.lineTo(X1, WALL_B);
    for (let x = X1; x >= X0; x -= 6) c.lineTo(x, yM(x) - 5);
    c.closePath(); c.fillStyle = C.inter; c.fill();
    c.save(); c.clip();
    c.strokeStyle = C.fiber; c.lineWidth = 2.2; c.lineCap = 'round';
    FIBERS.forEach(f => {
      c.beginPath();
      for (let i = 0; i <= f.len; i += 6) { const x = f.x + i, y = f.y + i * f.a + Math.sin(i * f.k) * f.amp; i ? c.lineTo(x, y) : c.moveTo(x, y); }
      c.stroke();
    });
    c.restore();
    gr = c.createLinearGradient(0, g.y0, 0, LUMEN_B);
    gr.addColorStop(0, C.plasmaTop); gr.addColorStop(1, C.plasmaBot);
    c.fillStyle = gr; c.fillRect(X0, g.y0, X1 - X0, LUMEN_B - g.y0);
    c.fillStyle = C.wall; c.fillRect(X0, LUMEN_B, X1 - X0, WALL_B - LUMEN_B);
    c.fillStyle = C.wallHi; c.fillRect(X0, LUMEN_B, X1 - X0, 3);
    c.strokeStyle = C.wallLine; c.lineWidth = 1.5; c.beginPath(); c.moveTo(X0, WALL_B + .5); c.lineTo(X1, WALL_B + .5); c.stroke();
    for (let x = Math.floor(X0 / 210) * 210 - 30; x < X1; x += 210) {
      c.fillStyle = C.wallNuc; c.globalAlpha = .75;
      c.beginPath(); c.ellipse(x + 90, 128, 34, 5, 0, 0, 6.283); c.fill();
      c.globalAlpha = 1; c.strokeStyle = C.wallLine; c.lineWidth = 1.4;
      c.beginPath(); c.moveTo(x + 180, LUMEN_B + 3); c.quadraticCurveTo(x + 186, 128, x + 178, WALL_B); c.stroke();
    }
    c.strokeStyle = C.tail; c.lineWidth = 1.3;
    for (let x = Math.floor(X0 / 8) * 8; x <= X1; x += 8) {
      const y = yM(x);
      c.beginPath();
      c.moveTo(x - 1.4, y + 3); c.lineTo(x - 1.8, y + 10); c.moveTo(x + 1.4, y + 3); c.lineTo(x + 1.8, y + 10);
      c.moveTo(x - 1.4, y + BI - 3); c.lineTo(x - 1.8, y + BI - 10); c.moveTo(x + 1.4, y + BI - 3); c.lineTo(x + 1.8, y + BI - 10);
      c.stroke();
    }
    for (let x = Math.floor(X0 / 8) * 8; x <= X1; x += 8) { const y = yM(x); head(c, x, y); head(c, x, y + BI); }
  }
  function head(c, x, y) {
    const gr = c.createRadialGradient(x - 1.2, y - 1.2, .3, x, y, 3.8);
    gr.addColorStop(0, C.headHi); gr.addColorStop(1, C.head);
    c.fillStyle = gr; c.beginPath(); c.arc(x, y, 3.6, 0, 6.283); c.fill();
  }
  function mito(c, x, y, rx, ry, a) {
    c.save(); c.translate(x, y); c.rotate(a); c.globalAlpha = .55;
    c.fillStyle = '#E7DCCD'; c.strokeStyle = '#C8B7A3'; c.lineWidth = 1.6;
    c.beginPath(); c.ellipse(0, 0, rx, ry, 0, 0, 6.283); c.fill(); c.stroke();
    c.lineWidth = 1.2; c.beginPath();
    for (let i = -rx + 10; i < rx - 6; i += 10) { c.moveTo(i, -ry + 4); c.quadraticCurveTo(i + 6, 0, i, ry - 4); }
    c.stroke(); c.restore();
  }
  function tag(c, text, x, y, a) {
    c.save(); c.globalAlpha = a == null ? 1 : a;
    c.font = '600 15px "DM Sans", system-ui, sans-serif';
    const w = c.measureText(text).width + 16;
    c.fillStyle = 'rgba(247,243,237,.9)';
    c.beginPath(); c.roundRect ? c.roundRect(x, y, w, 24, 12) : c.rect(x, y, w, 24); c.fill();
    c.fillStyle = C.label; c.textBaseline = 'middle'; c.fillText(text, x + 8, y + 12.5);
    c.restore();
  }

  // ── Moléculas y estructuras ─────────────────────────────────────────────
  function glucose(c, x, y, rot, a, sc) {
    if (a <= .01) return;
    const s = (sc || 1) * 1.35;
    c.save(); c.globalAlpha = a; c.translate(x, y); c.rotate(rot); c.scale(s, s);
    c.beginPath();
    for (let i = 0; i < 6; i++) { const t = i * Math.PI / 3 - Math.PI / 2; const px = Math.cos(t) * 6.6, py = Math.sin(t) * 6.6; i ? c.lineTo(px, py) : c.moveTo(px, py); }
    c.closePath(); c.fillStyle = C.glcFill; c.fill();
    c.strokeStyle = C.glcLine; c.lineWidth = 1.7; c.lineJoin = 'round'; c.stroke();
    c.beginPath(); c.moveTo(5.7, -3.3); c.lineTo(10, -6.4); c.stroke();
    c.fillStyle = C.oxy; c.beginPath(); c.arc(0, -6.6, 1.9, 0, 6.283); c.fill();
    c.restore();
  }
  function insulin(c, x, y, rot, a) {
    if (a <= .01) return;
    c.save(); c.globalAlpha = a; c.translate(x, y); c.rotate(rot); c.scale(1.3, 1.3);
    const blob = (bx, by, r, col) => {
      const gr = c.createRadialGradient(bx - r * .35, by - r * .35, r * .1, bx, by, r);
      gr.addColorStop(0, '#5E7E70'); gr.addColorStop(1, col);
      c.fillStyle = gr; c.beginPath(); c.arc(bx, by, r, 0, 6.283); c.fill();
    };
    blob(-3.5, 1, 5.2, C.insA); blob(3, -2, 4.6, C.insB); blob(2.5, 4, 3.6, C.insA);
    c.restore();
  }
  function rbc(c, x, y, s, tilt, a) {
    c.save(); c.globalAlpha = a; c.translate(x, y); c.rotate(tilt); c.scale(s, s);
    const gr = c.createRadialGradient(0, 0, 2, 0, 0, 25);
    gr.addColorStop(0, '#8A2F29'); gr.addColorStop(.5, '#A2443B'); gr.addColorStop(.82, '#B9584D'); gr.addColorStop(1, '#93352E');
    c.fillStyle = gr; c.beginPath(); c.ellipse(0, 0, 25, 11.5, 0, 0, 6.283); c.fill();
    c.strokeStyle = 'rgba(255,228,215,.28)'; c.lineWidth = 1.4;
    c.beginPath(); c.ellipse(0, -1, 21, 8.5, 0, Math.PI * 1.1, Math.PI * 1.9); c.stroke();
    c.restore();
  }
  function receptor(c, x, on, glow) {
    const y = yM(x), col = on ? C.recOn : C.rec;
    c.save(); c.strokeStyle = col; c.fillStyle = col; c.lineCap = 'round';
    c.lineWidth = 4; c.beginPath(); c.moveTo(x - 5, y - 2); c.lineTo(x - 5, y + BI + 4); c.moveTo(x + 5, y - 2); c.lineTo(x + 5, y + BI + 4); c.stroke();
    c.lineWidth = 7;
    c.beginPath(); c.moveTo(x - 5, y - 2); c.quadraticCurveTo(x - 9, y - 16, x - 15, y - 32); c.stroke();
    c.beginPath(); c.moveTo(x + 5, y - 2); c.quadraticCurveTo(x + 9, y - 16, x + 15, y - 32); c.stroke();
    c.beginPath(); c.arc(x - 7, y + BI + 11, 6.5, 0, 6.283); c.arc(x + 7, y + BI + 11, 6.5, 0, 6.283); c.fill();
    if (on && glow > 0) {
      c.fillStyle = '#D4E4DD'; c.strokeStyle = C.recOn; c.lineWidth = 1.2; c.globalAlpha = glow;
      [[-11, y + BI + 6], [-3, y + BI + 17], [11, y + BI + 6], [3, y + BI + 17]].forEach(([dx, py]) => { c.beginPath(); c.arc(x + dx, py, 2.6, 0, 6.283); c.fill(); c.stroke(); });
    }
    c.restore();
  }
  function glut(c, x, a) {
    if (a <= .01) return;
    const y = yM(x);
    c.save(); c.globalAlpha = a;
    const half = hx => {
      const gr = c.createLinearGradient(hx, 0, hx + 10, 0);
      gr.addColorStop(0, C.glutHi); gr.addColorStop(1, C.glut);
      c.fillStyle = gr; c.beginPath();
      c.roundRect ? c.roundRect(hx, y - 7, 10, BI + 14, 5) : c.rect(hx, y - 7, 10, BI + 14); c.fill();
    };
    half(x - 12); half(x + 2);
    c.restore();
  }
  function vesicle(c, x, y, r, a) {
    if (a <= .01 || r <= .5) return;
    c.save(); c.globalAlpha = a;
    c.fillStyle = 'rgba(255,255,255,.45)'; c.strokeStyle = C.head; c.lineWidth = 2.4;
    c.beginPath(); c.arc(x, y, r, 0, 6.283); c.fill(); c.stroke();
    c.lineWidth = 1; c.strokeStyle = C.tail; c.beginPath(); c.arc(x, y, Math.max(0, r - 4), 0, 6.283); c.stroke();
    c.fillStyle = C.glut; c.beginPath();
    c.roundRect ? c.roundRect(x - 5, y - r - 4, 10, 9, 3) : c.rect(x - 5, y - r - 4, 10, 9); c.fill();
    c.restore();
  }

  // ── Montaje de un slide ─────────────────────────────────────────────────
  function mount(root, cfg) {
    if (!root || root.dataset.gaReady) return;
    root.dataset.gaReady = '1';
    const RECEPTORS = cfg.receptors || DEFAULT_RECEPTORS;
    const steps = cfg.steps, last = steps.length - 1;

    // Estructura del slide
    root.innerHTML = `
      <div class="s-header"><div class="s-header-title"></div><div class="s-header-brand">Nutrición.Health</div></div>
      <div class="ga-body" title="Clic para avanzar">${cfg.panels.map(p => `
        <figure class="ga-panel" data-tone="${p.tone || 'green'}">
          <figcaption class="ga-panel-head"><span class="ga-label"></span><span class="ga-reading"><b></b>mg/dL</span></figcaption>
          <div class="ga-canvas"><canvas></canvas></div>
          ${p.liver ? `<div class="ga-liver">${LIVER_SVG}<span>Hígado soltando glucosa</span><span class="ga-liver-bars">${'<i></i>'.repeat(5)}</span><span class="ga-liver-txt"></span></div>` : ''}
        </figure>`).join('')}
      </div>
      <div class="ga-legend" aria-hidden="true">${(cfg.legend || Object.keys(LEGEND)).map(k => `<span><svg viewBox="0 0 24 24">${LEGEND[k][1]}</svg>${LEGEND[k][0]}</span>`).join('')}</div>
      <div class="ga-steps">
        <div class="ga-steplist" role="group" aria-label="Pasos de la animación">${steps.map((s, i) => `<button class="ga-step" type="button" data-step="${i}"><i>${i + 1}</i></button>`).join('')}</div>
        <p class="ga-caption" aria-live="polite"></p>
      </div>
      <div class="s-foot"><span class="ga-source"></span><span style="font-style:italic;">Más allá del consultorio.</span></div>`;
    root.querySelector('.s-header-title').textContent = root.dataset.titulo || '';
    root.querySelector('.ga-source').textContent = root.dataset.fuente ? 'Fuente: ' + root.dataset.fuente : '';
    const stepBtns = [...root.querySelectorAll('.ga-step')];
    stepBtns.forEach((b, i) => b.append(steps[i].label));
    const caption = root.querySelector('.ga-caption');

    let step = 0, stepT = 0, running = false, raf = 0, lastT = 0, clock = 0;
    const panels = [...root.querySelectorAll('.ga-panel')].map((fig, i) => {
      const P = cfg.panels[i];
      fig.querySelector('.ga-label').textContent = P.label;
      const canvas = fig.querySelector('canvas');
      canvas.setAttribute('aria-label', P.aria || P.label);
      return { P, canvas, ctx: canvas.getContext('2d'), out: fig.querySelector('.ga-reading b'),
               bars: [...fig.querySelectorAll('.ga-liver-bars i')], liverTxt: fig.querySelector('.ga-liver-txt'),
               aL: GL.map(() => 0), aI: GI.map(() => 0), aF: FREE_INS.map(() => 0), shown: null, liverShown: null, geom: null, bg: null };
    });

    function layout(p) {
      const w = p.canvas.clientWidth, h = p.canvas.clientHeight;
      if (!w || !h) return false;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (p.geom && p.geom.w === w && p.geom.h === h && p.geom.dpr === dpr) return true;
      const s = Math.min(w / LW, h / LH), ox = (w - LW * s) / 2, oy = (h - LH * s) / 2;
      const g = { w, h, dpr, s, ox, oy, x0: -ox / s, x1: LW + ox / s, y0: -oy / s, y1: LH + oy / s };
      p.geom = g;
      p.canvas.width = Math.round(w * dpr); p.canvas.height = Math.round(h * dpr);
      const bg = document.createElement('canvas'); bg.width = p.canvas.width; bg.height = p.canvas.height;
      const b = bg.getContext('2d');
      b.setTransform(dpr * s, 0, 0, dpr * s, dpr * ox, dpr * oy);
      drawStatic(b, g);
      p.bg = bg;
      return true;
    }

    function frame(p, dt) {
      if (!layout(p)) return;
      const { ctx: c, geom: g } = p;
      const st = p.P.state(step, stepT);
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.drawImage(p.bg, 0, 0);
      c.setTransform(g.dpr * g.s, 0, 0, g.dpr * g.s, g.dpr * g.ox, g.dpr * g.oy);
      const span = (g.x1 - g.x0) + 80, wrap = x => ((x % span) + span) % span + g.x0 - 40;
      const k = Math.min(1, dt * 2.2);

      const G = st.G;
      if (p.shown !== Math.round(G)) { p.shown = Math.round(G); p.out.textContent = p.shown; }
      if (p.bars.length && st.liver != null) {
        const n = Math.round(st.liver * 5);
        if (p.liverShown !== n) {
          p.liverShown = n;
          p.bars.forEach((b, i) => b.classList.toggle('on', i < n));
          p.liverTxt.textContent = n >= 4 ? 'mucha' : n >= 2 ? 'moderada' : 'poca';
        }
      }

      // Luz del capilar
      c.save(); c.beginPath(); c.rect(g.x0, g.y0, g.x1 - g.x0, LUMEN_B - g.y0); c.clip();
      RBC.forEach(r => rbc(c, wrap(r.x0 + r.v * clock), r.y + Math.sin(clock * .8 + r.x0) * 2, r.s, r.tilt, r.s < .85 ? .5 : 1));
      const nL = Math.round((G - 60) / 6.5);
      GL.forEach((m, i) => { p.aL[i] = lerp(p.aL[i], i < nL ? 1 : 0, k); glucose(c, wrap(m.x0 + m.v * clock), m.y + Math.sin(clock + i) * 2, m.rot + clock * m.spin, p.aL[i]); });
      const nF = st.freeIns || 0;
      FREE_INS.forEach((m, i) => { p.aF[i] = lerp(p.aF[i], i < nF ? 1 : 0, Math.min(1, dt * 1.4)); insulin(c, wrap(m.x0 + m.v * clock), m.y, m.rot + clock * .3, p.aF[i]); });
      c.restore();

      // Intersticio
      const nI = Math.round((G - 70) / 11);
      GI.forEach((m, i) => { p.aI[i] = lerp(p.aI[i], i < nI ? 1 : 0, Math.min(1, dt * 1.8)); glucose(c, m.x + Math.sin(clock * .4 + m.ph) * 7, m.y + Math.sin(clock * .5 + m.ph2) * 4, m.rot + clock * .15, p.aI[i]); });

      // Vesículas con GLUT4
      const fuse = st.fuse || [0, 0, 0, 0];
      SLOTS.forEach((x, s) => {
        const f = fuse[s] || 0, yb = yM(x) + BI;
        const yv = lerp(yb + 62, yb + 4, ease(clamp(f / .85, 0, 1)));
        const r = f > .85 ? 15 * (1 - (f - .85) / .15) : 15;
        vesicle(c, x + (f > 0 ? 0 : Math.sin(clock * .6 + s) * 2), yv, r, 1);
        glut(c, x, clamp((f - .8) / .2, 0, 1));
      });

      // Señal hacia adentro desde los receptores ocupados
      const rec = st.rec || RECEPTORS.map(() => 0);
      if (st.signal) {
        RECEPTORS.forEach((x, i) => {
          if (rec[i] < 1) return;
          for (let j = 0; j < 3; j++) {
            const base = stepT - (st.signal.start || .2) - j * 1.3 - i * .25;
            if (base < 0) continue;
            const age = base % 3.9; if (age > 1.6) continue;
            const t = age / 1.6;
            c.save(); c.globalAlpha = (1 - t) * st.signal.a; c.strokeStyle = C.signal; c.lineWidth = 2;
            c.beginPath(); c.arc(x, yM(x) + BI + 12, 8 + t * st.signal.r, 0, Math.PI); c.stroke(); c.restore();
          }
        });
      }

      // Receptores e insulina que llega a unirse
      RECEPTORS.forEach((x, i) => {
        const v = rec[i] || 0, bound = v >= 1;
        receptor(c, x, bound, st.glow || 0);
        const cx = x, cy = yM(x) - 26;
        if (bound) { insulin(c, cx, cy, .3, 1); return; }
        if (v > 0) {
          const e = ease(v), sx = x - 130 + (i % 3) * 18, sy = 46 + (i % 3) * 18, qx = x - 34, qy = WALL_B + 6;
          const bx = (1 - e) * (1 - e) * sx + 2 * (1 - e) * e * qx + e * e * cx;
          const by = (1 - e) * (1 - e) * sy + 2 * (1 - e) * e * qy + e * e * cy;
          insulin(c, bx, by, v * 4, clamp(v / .15, 0, 1));
        }
      });

      // Glucosa que entra por GLUT4 (cada molécula k sigue una ruta fija)
      if (st.uptake && st.uptake.elapsed >= 0) {
        const open = SLOTS.map((_, s) => s).filter(s => (fuse[s] || 0) >= 1);
        const dur = 2.3, every = st.uptake.every, el = st.uptake.elapsed;
        const n = Math.floor(el / every) + 1;
        if (open.length) for (let q = Math.max(0, n - Math.ceil(dur / every) - 1); q < n; q++) {
          const age = el - q * every;
          if (age < 0 || age > dur) continue;
          const gx = SLOTS[open[q % open.length]];
          const sx = gx + (hash(q, 1) - .5) * 140, sy = 158 + hash(q, 2) * (yM(sx) - 182);
          const px = gx - 1, py = yM(gx) - 4, ex = gx + (hash(q, 3) - .5) * 60, ey = yM(gx) + BI + 50 + hash(q, 4) * 30;
          const t = age / dur;
          let x, y;
          if (t < .55) { const e = ease(t / .55); x = lerp(sx, px, e); y = lerp(sy, py, e); }
          else { const e = easeOut((t - .55) / .45); x = lerp(px, ex, e); y = lerp(py + 2, ey, e); }
          const a = t < .1 ? t / .1 : t > .8 ? 1 - (t - .8) / .2 : 1;
          glucose(c, x, y, q + t * 2, a, t > .5 && t < .62 ? .8 : 1);
        }
      }

      // Etiquetas encima de todo
      if (p.P.labels) {
        tag(c, 'Sangre (capilar)', 10, 10);
        tag(c, 'Pared del capilar', 10, LUMEN_B - 3);
        tag(c, 'Célula muscular', 10, LH - 34);
      }
      if (st.tag && st.tag.alpha > .01) tag(c, st.tag.text, LW - 10 - (st.tag.text.length * 8 + 16), 10, st.tag.alpha);
    }

    function setStep(n) {
      step = clamp(n, 0, last); stepT = 0;
      stepBtns.forEach((b, i) => b.dataset.state = i < step ? 'done' : i === step ? 'current' : 'todo');
      caption.textContent = steps[step].caption;
    }
    stepBtns.forEach(b => b.addEventListener('click', e => { e.stopPropagation(); setStep(+b.dataset.step); b.blur(); }));
    root.querySelector('.ga-body').addEventListener('click', () => setStep(step < last ? step + 1 : 0));

    // Teclas del deck: la flecha avanza los pasos antes de pasar al próximo slide
    window.addEventListener('keydown', e => {
      if (!root.classList.contains('active')) return;
      const fwd = e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown';
      const back = e.key === 'ArrowLeft' || e.key === 'PageUp';
      if (fwd && step < last) { e.preventDefault(); e.stopImmediatePropagation(); setStep(step + 1); }
      else if (back && step > 0) { e.preventDefault(); e.stopImmediatePropagation(); setStep(step - 1); }
    }, true);

    function loop(now) {
      const dt = Math.min(.05, (now - lastT) / 1000 || 0); lastT = now;
      clock += dt; stepT += dt;
      panels.forEach(p => frame(p, dt));
      if (running) raf = requestAnimationFrame(loop);
    }
    function start() { if (running) return; running = true; lastT = performance.now(); raf = requestAnimationFrame(loop); }
    function stop() { running = false; cancelAnimationFrame(raf); }
    function sync() {
      if (root.classList.contains('active')) {
        if (!running) { setStep(0); panels.forEach(p => { p.aL = GL.map(() => 0); p.aI = GI.map(() => 0); p.aF = FREE_INS.map(() => 0); }); }
        start();
      } else stop();
    }
    new MutationObserver(sync).observe(root, { attributes: true, attributeFilter: ['class'] });
    window.addEventListener('resize', () => panels.forEach(p => p.geom = null));
    setStep(0);
    sync();
    requestAnimationFrame(() => panels.forEach(p => frame(p, 1)));   // cuadro inicial para miniaturas y PDF

    // Para capturas y pruebas: root.gaSet(paso, segundos)
    root.gaSet = (n, secs) => { setStep(n); for (let i = 0; i < Math.round((secs || 0) * 30); i++) { clock += 1 / 30; stepT += 1 / 30; panels.forEach(p => frame(p, 1 / 30)); } };
  }

  // Curva estándar de glucosa por paso
  function curve(levels, step, t, opts) {
    const o = Object.assign({ rise: 4, fallDelay: 1.5, fall: 9 }, opts);
    const L = levels;
    if (step === 0) return L[0];
    if (step === 1) return lerp(L[0], L[1], ease(clamp(t / o.rise, 0, 1)));
    if (step === 2) return L[2];
    return lerp(L[2], L[3], easeOut(clamp((t - o.fallDelay) / o.fall, 0, 1)));
  }

  return { mount, curve, prog, clamp, lerp, ease, easeOut, SLOTS };
})();
