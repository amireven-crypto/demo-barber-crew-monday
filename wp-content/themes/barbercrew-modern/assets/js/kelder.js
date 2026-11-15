/* The Barber Crew – KELDER-Stil: Bewegung & Interaktion (eigener Code, Nov 2026)
   Bibliotheken (lokal, kostenlos): GSAP 3 + ScrollTrigger (Standard "no charge" License), Lenis (MIT).
   Läuft VOR i18n.js: baut nur Struktur (Tabs, Ziffernwalzen, Balken), damit die Übersetzung alle Texte findet.
   Animationen starten nach DOMContentLoaded + i18n (setTimeout 0), damit Zeilen-Splits schon übersetzt sind.
   prefers-reduced-motion: kein Preloader, kein Smooth-Scroll, alles sofort sichtbar, Canvas statisch. */
(function () {
  'use strict';
  var d = document, html = d.documentElement, W = window;
  var RM = W.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var MOBILE = W.matchMedia('(max-width: 780px)').matches;
  var FINE = W.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var G = W.gsap, ST = W.ScrollTrigger;
  var ANIM = !RM && !!G && !!ST;
  if (ANIM) { html.classList.add('k-anim'); G.registerPlugin(ST); }
  var $ = function (s, r) { return (r || d).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); };
  var loader = $('.k-loader');
  if (!ANIM && loader) loader.parentNode.removeChild(loader);

  /* ================= Struktur (vor i18n) ================= */

  // Preis-Tabs (wie bisher; ohne JS bleiben alle Gruppen sichtbar)
  var grid = $('.bc-price-grid');
  if (grid) {
    var groups = $$('.bc-price-group', grid);
    var tabs = d.createElement('div');
    tabs.className = 'bc-tabs'; tabs.setAttribute('role', 'group'); tabs.setAttribute('aria-label', 'Preiskategorien filtern');
    var cats = [{ key: 'all', label: 'Alle' }];
    groups.forEach(function (g) {
      var h = $('h3', g), key = Array.prototype.find.call(g.classList, function (c) { return c.indexOf('cat-') === 0; });
      if (h && key) cats.push({ key: key, label: h.textContent.trim() });
    });
    cats.forEach(function (c, i) {
      var b = d.createElement('button');
      b.type = 'button'; b.className = 'bc-tab' + (i === 0 ? ' is-active' : ''); b.textContent = c.label; b.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
      b.addEventListener('click', function () {
        $$('.bc-tab', tabs).forEach(function (t) { t.classList.remove('is-active'); t.setAttribute('aria-pressed', 'false'); });
        b.classList.add('is-active'); b.setAttribute('aria-pressed', 'true');
        groups.forEach(function (g) {
          var hide = c.key !== 'all' && !g.classList.contains(c.key);
          g.classList.toggle('is-hidden', hide);
          if (!hide && ANIM) G.fromTo(g, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: .6, ease: 'expo.out', overwrite: true });
        });
        if (ANIM) ST.refresh();
      });
      tabs.appendChild(b);
    });
    grid.parentNode.insertBefore(tabs, grid);
    if (W.matchMedia('(max-width: 780px)').matches && tabs.children[1]) tabs.children[1].click();
  }

  // Ziffernwalzen (Odometer): sichtbarer Text bleibt für Screenreader erhalten
  var odos = $$('[data-odo]');
  odos.forEach(function (el) {
    var txt = el.textContent.trim();
    var out = '<span class="k-sr">' + txt + '</span><span class="k-odo" aria-hidden="true">';
    txt.split('').forEach(function (ch) {
      if (/\d/.test(ch)) {
        var s = '';
        for (var r = 0; r < 20; r++) s += '<span>' + (r % 10) + '</span>';
        out += '<span class="k-odo__d"><span class="k-odo__s" data-d="' + ch + '">' + s + '</span></span>';
      } else out += '<span class="k-odo__x">' + (ch === ' ' ? '\u00a0' : ch) + '</span>';
    });
    el.innerHTML = out + '</span>';
    if (!ANIM) $$('.k-odo__s', el).forEach(function (s) { s.style.transform = 'translateY(' + (-(10 + +s.getAttribute('data-d')) * 5) + '%)'; });
  });
  function rollOdo(el, dur, delay) {
    var strips = $$('.k-odo__s', el), n = strips.length;
    strips.forEach(function (s, i) {
      var target = 10 + +s.getAttribute('data-d');
      G.fromTo(s, { yPercent: -(Math.max(0, target - 10 - (n - i) * 2 - 3)) * 5 },
        { yPercent: -target * 5, duration: (dur || 1.6) + (n - i) * 0.12, delay: (delay || 0) + i * 0.05, ease: 'expo.out' });
    });
  }
  function setOdo(el, zero) {
    $$('.k-odo__s', el).forEach(function (s) { G.set(s, { yPercent: zero ? 0 : -(10 + +s.getAttribute('data-d')) * 5 }); });
  }

  // Balken
  $$('[data-bars]').forEach(function (el) {
    var v = el.getAttribute('data-bars').split(',').map(Number), mx = Math.max.apply(null, v);
    v.forEach(function (x, i) {
      var b = d.createElement('i'); b.style.setProperty('--h', Math.max(8, x / mx * 100) + '%');
      if (x === mx && i === v.lastIndexOf(mx) && el.classList.contains('k-bars')) b.className = 'is-max';
      el.appendChild(b);
    });
  });

  // Wortmarke im Footer in Buchstaben (dekorativ, aria-hidden)
  var wm = $('.k-wordmark');
  if (wm) wm.innerHTML = wm.textContent.split('').map(function (c) { return '<span class="k-ch">' + (c === ' ' ? '\u00a0' : c) + '</span>'; }).join('');

  /* ================= Header, Menü, Schnellbuchung ================= */
  var header = $('.bc-header'), sticky = $('.bc-sticky-book'), hero = $('.k-hero');
  function onScroll() {
    var y = W.scrollY;
    if (header) header.classList.toggle('is-scrolled', y > 40);
    if (sticky) sticky.classList.toggle('is-visible', y > (hero ? hero.offsetHeight * 0.75 : 600));
  }
  W.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  var burger = $('.bc-burger');
  if (burger) {
    burger.addEventListener('click', function () {
      var open = d.body.classList.toggle('nav-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && d.body.classList.contains('nav-open')) { d.body.classList.remove('nav-open'); burger.setAttribute('aria-expanded', 'false'); burger.focus(); } });
  }

  /* ================= Zeilen-Split (Maske pro Zeile) =================
     Originalknoten bleiben erhalten (in .k-orig verschoben) → i18n-Referenzen bleiben gültig.
     Darüber liegt eine aria-hidden Kopie mit Zeilenmasken; nach der Animation wird sie entfernt. */
  var splits = [];
  function Split(el) {
    this.el = el; this.done = false;
    var orig = d.createElement('span'); orig.className = 'k-orig';
    while (el.firstChild) orig.appendChild(el.firstChild);
    el.appendChild(orig); el.classList.add('k-split-host');
    this.orig = orig; this.build();
  }
  Split.prototype.build = function () {
    if (this.done) return;
    if (this.lines) this.lines.remove();
    var box = d.createElement('span'); box.className = 'k-lines'; box.setAttribute('aria-hidden', 'true');
    var words = [], pendSp = false;
    function addWords(text, wrapTag) {
      text.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) { box.appendChild(d.createTextNode(' ')); pendSp = true; return; }
        var w = d.createElement('span'); w.style.display = 'inline-block'; w._sp = pendSp; pendSp = false;
        if (wrapTag) { var em = d.createElement(wrapTag); em.textContent = part; w.appendChild(em); } else w.textContent = part;
        box.appendChild(w); words.push(w);
      });
    }
    Array.prototype.forEach.call(this.orig.childNodes, function (n) {
      if (n.nodeType === 3) addWords(n.nodeValue);
      else if (n.nodeType === 1) addWords(n.textContent, n.tagName.toLowerCase());
    });
    this.el.appendChild(box);
    // nach Zeilen gruppieren
    var rows = [], last = null;
    words.forEach(function (w) { var t = Math.round(w.offsetTop); if (t !== last) { rows.push([]); last = t; } rows[rows.length - 1].push(w); });
    box.innerHTML = '';
    var inners = [];
    rows.forEach(function (r) {
      var line = d.createElement('span'); line.className = 'k-line';
      var inn = d.createElement('span'); inn.className = 'k-line__in';
      r.forEach(function (w, i) { if (i && w._sp) inn.appendChild(d.createTextNode(' ')); inn.appendChild(w); });
      line.appendChild(inn); box.appendChild(line); inners.push(inn);
    });
    this.lines = box; this.inners = inners;
    if (this.played) G.set(inners, { yPercent: 0 }); else G.set(inners, { yPercent: 110 });
  };
  Split.prototype.play = function (delay) {
    var self = this; if (this.done || this.played) return; this.played = true;
    G.to(this.inners, { yPercent: 0, duration: 1.15, ease: 'expo.out', stagger: 0.09, delay: delay || 0, onComplete: function () { self.finish(); } });
  };
  Split.prototype.finish = function () { this.done = true; this.el.classList.add('is-split-done'); if (this.lines) this.lines.remove(); this.lines = null; };

  /* ================= Halbton-Punktfeld (Hero) ================= */
  function Halftone(cv) {
    var ctx = cv.getContext('2d'), host = cv.parentNode, w = 0, h = 0, dpr = Math.min(W.devicePixelRatio || 1, MOBILE ? 1.5 : 2);
    var sp = MOBILE ? 12 : 11, maxR = sp * 0.36, mx = -9999, my = -9999, cm = 0, on = true, t0 = performance.now(), frame = 0;
    var accent = [255, 106, 19];
    function size() { var r = host.getBoundingClientRect(); w = r.width; h = r.height; cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function ss(a, b, x) { x = Math.min(1, Math.max(0, (x - a) / (b - a))); return x * x * (3 - 2 * x); }
    function draw(now) {
      var t = (now - t0) / 1000; ctx.clearRect(0, 0, w, h);
      var white = new Path2D(), hot = new Path2D(), R = 130, cx = w / 2;
      for (var y = sp / 2; y < h; y += sp) {
        var ny = y / h, vert = ss(0.03, 0.2, ny) * (1 - ss(0.72, 0.9, ny));
        if (vert <= 0.01) continue;
        for (var x = sp / 2; x < w; x += sp) {
          var nx = Math.abs(x - cx) / cx; // 0 Mitte, 1 Rand
          var side = MOBILE ? ss(0.5, 1, nx) * 0.6 + 0.4 * ss(0.62, 0.8, ny) : ss(0.28, 0.85, nx) * 0.95 + 0.05 * ss(0.5, 1, ny);
          var wave = 0.5 + 0.5 * Math.sin(t * 1.3 - nx * 7 + ny * 3) * Math.cos(t * 0.7 + x * 0.004 - y * 0.006);
          var r = maxR * side * vert * (0.45 + 0.55 * wave);
          var hit = 0;
          if (cm > 0.01) { var dx = x - mx, dy = y - my, dd = Math.sqrt(dx * dx + dy * dy); if (dd < R) { hit = (1 - dd / R) * cm; r = Math.max(r, maxR * 0.95 * hit + r * (1 - hit)); } }
          if (r < 0.35) continue;
          var p = hit > 0.25 ? hot : white;
          p.moveTo(x + r, y); p.arc(x, y, r, 0, 6.2832);
        }
      }
      ctx.fillStyle = 'rgba(255,255,255,.82)'; ctx.fill(white);
      ctx.fillStyle = 'rgb(' + accent.join(',') + ')'; ctx.fill(hot);
    }
    function loop(now) { if (on) { frame++; if (!MOBILE || frame % 2) draw(now); cm += ((mx > -999 ? 1 : 0) - cm) * 0.08; } requestAnimationFrame(loop); }
    size(); W.addEventListener('resize', function () { size(); if (!ANIM) draw(t0); });
    if (!ANIM) { draw(t0); return; }
    if (FINE) {
      host.addEventListener('pointermove', function (e) { var r = host.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
      host.addEventListener('pointerleave', function () { mx = my = -9999; });
    }
    new IntersectionObserver(function (es) { on = es[0].isIntersecting && !d.hidden; }).observe(host);
    requestAnimationFrame(loop);
  }

  /* ================= Seidenlinien ================= */
  function Silk(svg) {
    var n = +svg.getAttribute('data-silk') || 12, vb = svg.viewBox.baseVal, VW = vb.width, VH = vb.height, paths = [], on = false, last = 0;
    for (var i = 0; i < n; i++) {
      var p = d.createElementNS('http://www.w3.org/2000/svg', 'path');
      p.setAttribute('pathLength', '1'); p.style.strokeOpacity = (0.12 + 0.6 * Math.pow(Math.sin((i + 1) / (n + 1) * Math.PI), 2)).toFixed(2);
      svg.appendChild(p); paths.push(p);
    }
    function shape(t) {
      paths.forEach(function (p, i) {
        var ph = i * 0.21, dd = 'M';
        for (var k = 0; k <= 28; k++) {
          var y = k / 28 * VH, u = k / 28;
          var x = VW * 0.5 + VW * 0.22 * Math.sin(u * Math.PI * 1.7 + t * 0.55 + ph) + VW * 0.1 * Math.sin(u * Math.PI * 3.3 - t * 0.35 + ph * 1.9) + (i - n / 2) * VW * 0.012 * Math.sin(u * Math.PI);
          dd += (k ? ' L' : '') + x.toFixed(1) + ' ' + y.toFixed(1);
        }
        p.setAttribute('d', dd);
      });
    }
    shape(0);
    if (!ANIM) return;
    paths.forEach(function (p) { p.style.strokeDasharray = '1'; p.style.strokeDashoffset = '1'; });
    G.to(paths, { strokeDashoffset: 0, duration: 2.4, ease: 'power2.inOut', stagger: 0.05, scrollTrigger: { trigger: svg.parentNode, start: 'top 80%' } });
    new IntersectionObserver(function (es) { on = es[0].isIntersecting; }).observe(svg.parentNode);
    G.ticker.add(function (time) { if (on && time - last > 1 / 30) { last = time; shape(time); } });
  }

  /* ================= Punktmatrix-Icons ================= */
  function drawIcon(c, type, S) {
    c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = c.fillStyle = '#fff';
    if (type === 'scissors') {
      c.lineWidth = S * 0.09;
      c.beginPath(); c.arc(S * 0.3, S * 0.78, S * 0.13, 0, 7); c.stroke();
      c.beginPath(); c.arc(S * 0.7, S * 0.78, S * 0.13, 0, 7); c.stroke();
      c.lineWidth = S * 0.1;
      c.beginPath(); c.moveTo(S * 0.38, S * 0.66); c.lineTo(S * 0.72, S * 0.08); c.stroke();
      c.beginPath(); c.moveTo(S * 0.62, S * 0.66); c.lineTo(S * 0.28, S * 0.08); c.stroke();
    } else if (type === 'razor') {
      c.save(); c.translate(S * 0.5, S * 0.5); c.rotate(-0.6);
      c.fillRect(-S * 0.42, -S * 0.16, S * 0.5, S * 0.22);           // Klinge
      c.lineWidth = S * 0.1; c.beginPath(); c.moveTo(S * 0.06, -S * 0.02); c.lineTo(S * 0.44, S * 0.02); c.stroke(); // Griff
      c.beginPath(); c.arc(S * 0.06, -S * 0.04, S * 0.06, 0, 7); c.fill();
      c.restore();
    } else { // comb
      c.fillRect(S * 0.1, S * 0.2, S * 0.8, S * 0.16);
      c.lineWidth = S * 0.06;
      for (var k = 0; k < 8; k++) { var x = S * (0.15 + k * 0.1); c.beginPath(); c.moveTo(x, S * 0.36); c.lineTo(x, S * (k % 2 ? 0.66 : 0.8)); c.stroke(); }
    }
  }
  function DotIcon(cv) {
    var ctx = cv.getContext('2d'), type = cv.getAttribute('data-icon'), dpr = Math.min(W.devicePixelRatio || 1, 2);
    var w, h, sp, pts = [], bg = [], prog = { p: ANIM ? 0 : 1 }, mx = -999, my = -999, active = false, raf = 0;
    function build() {
      var r = cv.getBoundingClientRect(); w = r.width; h = r.height; if (!w) return;
      cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sp = Math.max(8, Math.round(w / 34));
      var cols = Math.floor(w / sp), rows = Math.floor(h / sp), S = Math.min(cols, rows) * 0.72;
      var off = d.createElement('canvas'), q = 6; off.width = cols * q; off.height = rows * q;
      var oc = off.getContext('2d'); oc.translate((cols - S) / 2 * q, (rows - S) / 2 * q); drawIcon(oc, type, S * q);
      var data = oc.getImageData(0, 0, off.width, off.height).data;
      pts = []; bg = [];
      for (var j = 0; j < rows; j++) for (var i = 0; i < cols; i++) {
        var a = data[((j * q + q / 2) * off.width + (i * q + q / 2)) * 4 + 3];
        var tx = (i + 0.5) * sp + (w - cols * sp) / 2, ty = (j + 0.5) * sp + (h - rows * sp) / 2;
        if (a > 100) pts.push({ tx: tx, ty: ty, sx: Math.random() * w, sy: Math.random() * h, dl: Math.random() * 0.5, ox: 0, oy: 0 });
        else if ((i + j) % 2 === 0) bg.push([tx, ty]);
      }
      render();
    }
    function render() {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.beginPath();
      bg.forEach(function (b) { ctx.moveTo(b[0] + 1.2, b[1]); ctx.arc(b[0], b[1], 1.2, 0, 6.2832); }); ctx.fill();
      var moving = false; ctx.fillStyle = '#fff'; ctx.beginPath();
      var r0 = sp * 0.34;
      pts.forEach(function (p) {
        var k = Math.min(1, Math.max(0, (prog.p - p.dl) / 0.5)); k = 1 - Math.pow(1 - k, 3);
        var x = p.sx + (p.tx - p.sx) * k, y = p.sy + (p.ty - p.sy) * k;
        if (active) { var dx = x - mx, dy = y - my, dd = Math.sqrt(dx * dx + dy * dy), R = sp * 4.5; if (dd < R && dd > 0.01) { var f = (1 - dd / R) * sp * 1.6; p.ox += (dx / dd * f - p.ox) * 0.25; p.oy += (dy / dd * f - p.oy) * 0.25; } else { p.ox *= 0.86; p.oy *= 0.86; } }
        else { p.ox *= 0.86; p.oy *= 0.86; }
        if (Math.abs(p.ox) + Math.abs(p.oy) > 0.05) moving = true;
        var rr = r0 * (0.4 + 0.6 * k);
        ctx.moveTo(x + p.ox + rr, y + p.oy); ctx.arc(x + p.ox, y + p.oy, rr, 0, 6.2832);
      });
      ctx.fill();
      return moving;
    }
    function tick() { var m = render(); raf = (active || m) ? requestAnimationFrame(tick) : 0; }
    build(); W.addEventListener('resize', function () { var p = prog.p; build(); prog.p = p; render(); });
    if (!ANIM) return;
    G.to(prog, { p: 1.0, duration: 2.0, ease: 'power2.out', onUpdate: render, scrollTrigger: { trigger: cv, start: 'top 85%' } });
    if (FINE) {
      var host = cv.closest('.k-inst') || cv;
      host.addEventListener('pointermove', function (e) { var r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; active = true; if (!raf) raf = requestAnimationFrame(tick); });
      host.addEventListener('pointerleave', function () { active = false; if (!raf) raf = requestAnimationFrame(tick); });
    }
  }

  /* ================= Dashboard-Diagramm ================= */
  function Chart() {
    var wrap = $('.k-chart'); if (!wrap) return null;
    var svg = $('.k-chart__svg', wrap), line = $('.k-chart__line', wrap), area = $('.k-chart__area', wrap), cur = $('.k-chart__cursor', wrap);
    var pt = $('.k-chart__pt', wrap), end = $('.k-chart__end', wrap), tip = $('.k-chart__tip', wrap), axis = $$('.k-chart__axis span', wrap);
    var N = 60, ys = new Array(N).fill(200), state = { cat: 'cat-hair', items: [], max: 1 };
    function items(cat) {
      return $$('.' + cat + ' .bc-item').map(function (it) {
        return { el: it, price: parseFloat($('.bc-item__price', it).textContent) || 0 };
      });
    }
    function targetYs(its, max) {
      var n = its.length, out = [];
      for (var k = 0; k < N; k++) {
        var u = k / (N - 1) * (n - 1), i = Math.min(n - 2, Math.floor(u)), f = u - i;
        var a = its[Math.max(0, i)].price, b = its[Math.min(n - 1, i + 1)].price;
        var m = (1 - Math.cos(f * Math.PI)) / 2, v = a + (b - a) * m;
        out.push(215 - v / max * 185);
      }
      return out;
    }
    function render() {
      var dd = '';
      for (var k = 0; k < N; k++) dd += (k ? ' L' : 'M') + (k / (N - 1) * 600).toFixed(1) + ' ' + ys[k].toFixed(1);
      line.setAttribute('d', dd); area.setAttribute('d', dd + ' L600 220 L0 220 Z');
      var e = ys[N - 1]; place(end, 600, e);
    }
    function place(node, x, y) { var h = svg.getBoundingClientRect().height || 1, wv = svg.getBoundingClientRect().width || 1; node.style.transform = 'translate(' + (x / 600 * wv) + 'px,' + (y / 220 * h) + 'px)'; }
    function showTip(idx) {
      var its = state.items, n = its.length; if (!n) return;
      var it = its[idx], x = n === 1 ? 300 : idx / (n - 1) * 600, y = 215 - it.price / state.max * 185;
      place(pt, x, y); place(tip, x, y);
      tip.style.transform += ' translate(' + (idx === 0 ? '0%' : idx === n - 1 ? '-100%' : '-50%') + ',calc(-100% - 14px))';
      $('b', tip).textContent = $('.bc-item__price', it.el).textContent;
      $('span', tip).textContent = $('.bc-item__name', it.el).textContent;
      cur.setAttribute('x1', x); cur.setAttribute('x2', x);
    }
    function setCat(cat, animate) {
      state.cat = cat; state.items = items(cat);
      var max = Math.max.apply(null, state.items.map(function (i) { return i.price; }));
      state.max = Math.ceil(max * 1.15 / 10) * 10;
      axis.forEach(function (s, i) { s.textContent = Math.round(state.max * (1 - i / 3) * (185 / 195)) + ' €'; });
      var tg = targetYs(state.items, state.max);
      var mi = 0; state.items.forEach(function (it, i) { if (it.price >= state.items[mi].price) mi = i; });
      if (animate && ANIM) {
        var o = { k: 0 }, from = ys.slice();
        G.to(o, { k: 1, duration: 0.9, ease: 'expo.inOut', onUpdate: function () { for (var i = 0; i < N; i++) ys[i] = from[i] + (tg[i] - from[i]) * o.k; render(); } });
        G.fromTo(tip, { opacity: 0 }, { opacity: 1, duration: .4, delay: .6 });
      } else { ys = tg; render(); }
      showTip(mi); state.def = mi;
    }
    wrap.addEventListener('pointermove', function (e) {
      var r = svg.getBoundingClientRect(), u = (e.clientX - r.left) / r.width, n = state.items.length;
      wrap.classList.add('is-hover'); showTip(Math.max(0, Math.min(n - 1, Math.round(u * (n - 1)))));
    });
    wrap.addEventListener('pointerleave', function () { wrap.classList.remove('is-hover'); showTip(state.def); });
    var seg = $('.k-seg'), ind = $('.k-seg__ind');
    function moveInd(b) { if (!b) return; ind.style.width = b.offsetWidth + 'px'; ind.style.transform = 'translateX(' + b.offsetLeft + 'px)'; }
    $$('.k-seg__b').forEach(function (b) {
      b.addEventListener('click', function () {
        $$('.k-seg__b').forEach(function (x) { x.classList.remove('is-on'); x.setAttribute('aria-pressed', 'false'); });
        b.classList.add('is-on'); b.setAttribute('aria-pressed', 'true'); moveInd(b); setCat(b.getAttribute('data-cat'), true);
      });
    });
    setCat('cat-hair', false);
    var api = {
      draw: function (delay) {
        if (!ANIM) return;
        G.fromTo(line, { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.8, delay: delay, ease: 'power2.inOut' });
        line.setAttribute('pathLength', '1');
        G.fromTo(area, { opacity: 0 }, { opacity: 1, duration: 1.2, delay: delay + 0.6 });
        G.fromTo([end, tip], { opacity: 0 }, { opacity: 1, duration: 0.6, delay: delay + 1.5, ease: 'power2.out' });
        G.fromTo('.k-dash__legend i', { scaleX: 0 }, { scaleX: 1, duration: 1.2, delay: delay + 0.4, stagger: 0.12, ease: 'expo.out' });
      },
      refresh: function () { moveInd($('.k-seg__b.is-on')); render(); showTip(wrap.classList.contains('is-hover') ? state.def : state.def); }
    };
    moveInd($('.k-seg__b.is-on'));
    W.addEventListener('resize', api.refresh);
    return api;
  }

  /* ================= Wochentage ================= */
  function viennaNow() {
    try {
      var parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Vienna', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date());
      var o = {}; parts.forEach(function (p) { o[p.type] = p.value; });
      var wd = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(o.weekday);
      return { wd: wd, min: (+o.hour % 24) * 60 + +o.minute };
    } catch (e) { var n = new Date(); return { wd: (n.getDay() + 6) % 7, min: n.getHours() * 60 + n.getMinutes() }; }
  }
  function Days(ul) {
    var lis = $$('li', ul), today = viennaNow().wd, i = -1, timer = 0;
    function set(k) { lis.forEach(function (l, j) { l.classList.toggle('is-hot', j === k); }); }
    if (!ANIM) { set(today); return; }
    function step() { i++; if (i > 4) { set(today); i = -1; timer = setTimeout(step, 2400); return; } set(i); timer = setTimeout(step, 360); }
    ST.create({ trigger: ul, start: 'top 90%', end: 'bottom top', onToggle: function (s) { clearTimeout(timer); if (s.isActive) { i = -1; step(); } else set(today); } });
  }

  /* ================= Öffnungszeiten-Fortschritt ================= */
  function Hours(card) {
    var bar = $('.k-progress', card); if (!bar) return;
    function frac() { var v = viennaNow(); if (v.wd > 4) return 0; return Math.max(0, Math.min(1, (v.min - 540) / (1110 - 540))); }
    var o = { p: ANIM ? 0 : frac() }; bar.style.setProperty('--p', o.p);
    if (ANIM) G.to(o, { p: frac(), duration: 1.6, ease: 'expo.out', onUpdate: function () { bar.style.setProperty('--p', o.p); }, scrollTrigger: { trigger: card, start: 'top 85%' } });
    setInterval(function () { o.p = frac(); bar.style.setProperty('--p', o.p); }, 60000);
  }

  /* ================= Init nach i18n ================= */
  function init() {
    // Canvas & SVG-Effekte (auch statisch bei reduzierter Bewegung)
    $$('.k-halftone').forEach(Halftone);
    $$('[data-silk]').forEach(Silk);
    $$('.k-dotsicon').forEach(DotIcon);
    var chart = Chart();
    $$('.k-days').forEach(Days);
    $$('.k-hourscard').forEach(Hours);
    if (!ANIM) return;

    // Smooth Scroll (Lenis) – Touch bleibt nativ
    var lenis = null;
    if (W.Lenis) {
      lenis = new W.Lenis({ lerp: 0.1, smoothWheel: true, wheelMultiplier: 1 });
      lenis.on('scroll', ST.update);
      G.ticker.add(function (t) { lenis.raf(t * 1000); }); G.ticker.lagSmoothing(0);
      $$('a[href^="#"]:not(.bc-skip)').forEach(function (a) {
        a.addEventListener('click', function (e) {
          var id = a.getAttribute('href').slice(1), t = id && d.getElementById(id); if (!t) return;
          e.preventDefault(); d.body.classList.remove('nav-open'); if (burger) burger.setAttribute('aria-expanded', 'false');
          lenis.scrollTo(t, { offset: -72, duration: 1.4 });
          if (!t.hasAttribute('tabindex')) t.setAttribute('tabindex', '-1');
          t.focus({ preventScroll: true }); history.replaceState(null, '', '#' + id);
        });
      });
    }

    // Zeilen-Splits
    $$('[data-split]').forEach(function (el) { splits.push(new Split(el)); });
    var heroSplit = splits.filter(function (s) { return s.el.closest('.k-hero'); })[0];
    splits.forEach(function (s) { if (s !== heroSplit) ST.create({ trigger: s.el, start: 'top 88%', once: true, onEnter: function () { s.play(); } }); });

    // Hero-Intro (nach Preloader)
    var intro = $$('[data-intro]').filter(function (e) { return !e.hasAttribute('data-split'); });
    var dash = $('.k-dash');
    G.set(intro, { opacity: 0, y: 24, filter: 'blur(8px)' });
    G.set(header, { yPercent: -100, opacity: 0 });
    if (dash) G.set(dash, { opacity: 0, y: 140, rotationX: 42, scale: 0.92 });
    function heroIntro() {
      var tl = G.timeline({ defaults: { ease: 'expo.out' } });
      tl.to(header, { yPercent: 0, opacity: 1, duration: 1.1 }, 0);
      tl.to(intro[0], { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.1, clearProps: 'filter' }, 0.05);
      if (heroSplit) { G.set(heroSplit.el, { opacity: 1 }); tl.add(function () { heroSplit.play(); }, 0.12); }
      tl.to(intro.slice(1), { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.1, stagger: 0.09, clearProps: 'filter' }, 0.35);
      if (dash) tl.to(dash, { opacity: 1, y: 0, rotationX: 24, scale: 0.96, duration: 1.6, ease: 'expo.out' }, 0.45);
      tl.add(function () {
        $$('.k-dash [data-odo]').forEach(function (o, i) { rollOdo(o, 1.8, i * 0.1); });
        if (chart) chart.draw(0);
      }, 0.7);
      tl.add(startScrollFx, 0.9);
    }
    // Karte kippt beim Scrollen flach (scrub)
    function startScrollFx() {
      if (dash) G.fromTo(dash, { rotationX: 24, scale: 0.96 }, { rotationX: 0, scale: 1, ease: 'none', immediateRender: false, scrollTrigger: { trigger: '.k-dash-wrap', start: 'top 85%', end: 'top 25%', scrub: 0.6 } });
    }

    // Preloader
    $$('.k-loader [data-odo], .k-dash [data-odo]').forEach(function (o) { setOdo(o, true); });
    if (loader) {
      if (lenis) lenis.stop();
      var bars = $$('.k-loader__mark i'), lnum = $('.k-loader [data-odo]'), short = MOBILE ? 0.65 : 1;
      var lt = G.timeline({ defaults: { ease: 'expo.out' } });
      lt.from(bars, { scaleY: 0, transformOrigin: '50% 100%', duration: 0.7 * short, stagger: 0.18 * short }, 0.1)
        .from('.k-loader__label, .k-loader__num', { opacity: 0, y: 10, duration: .6, stagger: .08 }, 0.15)
        .add(function () { rollOdo(lnum, 1.25 * short); }, 0.2)
        .to(loader, { opacity: 0, scale: 1.04, duration: 0.8, ease: 'power2.inOut' }, 1.55 * short + 0.25)
        .add(function () { heroIntro(); }, 1.55 * short + 0.3)
        .add(function () { loader.remove(); loader = null; if (lenis) lenis.start(); });
      loader.style.animation = 'none';
      // Tastatur: Preloader sofort beenden, damit der Skip-Link nie blockiert
      d.addEventListener('keydown', function kill(e) { if (e.key === 'Tab' && loader) { lt.progress(1); } d.removeEventListener('keydown', kill); });
    } else heroIntro();

    // Allgemeine Reveals
    ST.batch('[data-reveal]', { start: 'top 90%', once: true, onEnter: function (els) { G.to(els, { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.08, overwrite: true, clearProps: 'transform' }); } });
    // Bild-Masken
    ST.batch('[data-mask]', { start: 'top 88%', once: true, onEnter: function (els) {
      G.to(els, { clipPath: 'inset(0% 0 0 0 round 16px)', duration: 1.4, ease: 'expo.inOut', stagger: 0.1 });
      G.fromTo(els.map(function (e) { return $('img', e); }), { scale: 1.35 }, { scale: 1.12, duration: 1.8, ease: 'expo.out', stagger: 0.1 });
    } });
    // Parallaxe in Bildern
    $$('[data-parallax]').forEach(function (img) { G.fromTo(img, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: img.parentNode, start: 'top bottom', end: 'bottom top', scrub: true } }); });
    // Ziffernwalzen außerhalb von Hero/Preloader
    $$('[data-odo]').forEach(function (o) {
      if (o.closest('.k-loader') || o.closest('.k-dash')) return;
      setOdo(o, true);
      ST.create({ trigger: o, start: 'top 90%', once: true, onEnter: function () { rollOdo(o, 1.6); } });
    });
    // Balken wachsen
    $$('[data-bars]').forEach(function (el) { G.from($$('i', el), { scaleY: 0, duration: 1.2, ease: 'expo.out', stagger: 0.06, scrollTrigger: { trigger: el, start: 'top 90%' } }); });
    // Sprachen-Kette
    $$('.k-flow').forEach(function (f) { G.from(f.children, { opacity: 0, x: -10, duration: 0.6, stagger: 0.08, ease: 'power3.out', scrollTrigger: { trigger: f, start: 'top 92%' } }); });
    // Zitat-Zeichen zeichnen
    $$('.k-quote path').forEach(function (p) { p.setAttribute('pathLength', '1'); G.fromTo(p, { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut', scrollTrigger: { trigger: p.closest('.k-review'), start: 'top 85%' } }); });
    // Ticks in der blauen Karte
    $$('.k-ticks li').forEach(function (li, i) { G.from(li, { opacity: 0, x: -14, duration: .7, delay: i * .12, ease: 'expo.out', scrollTrigger: { trigger: li, start: 'top 95%' } }); });

    // Zickzack-Schritte: aktiver Schritt + gleitender Glas-Balken + Fortschrittslinie
    var steps = $$('.k-step'), glow = $('.k-steps__glow'), rail = $('.k-steps__rail i');
    function activate(s) {
      steps.forEach(function (x) { x.classList.toggle('is-active', x === s); });
      if (glow) G.to(glow, { y: s.offsetTop, height: s.offsetHeight, duration: 0.7, ease: 'expo.out' });
    }
    if (steps.length) {
      G.set(glow, { y: steps[0].offsetTop, height: steps[0].offsetHeight });
      steps.forEach(function (s) { ST.create({ trigger: s, start: 'top 62%', end: 'bottom 62%', onToggle: function (st) { if (st.isActive) activate(s); } }); });
      activate(steps[0]);
      if (rail) G.to(rail, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.k-steps', start: 'top 62%', end: 'bottom 62%', scrub: true } });
      G.from(steps, { opacity: 0, y: 30, duration: 1, stagger: 0.12, ease: 'expo.out', scrollTrigger: { trigger: '.k-steps', start: 'top 80%' } });
    }

    // 3D-Würfel: Leerlauf-Rotation + Scroll-Neigung
    var cube = $('.k-cube');
    if (cube) {
      G.set(cube, { rotationX: -24, rotationY: 38 });
      var spin = G.to(cube, { rotationY: '+=360', duration: 26, ease: 'none', repeat: -1 });
      G.fromTo(cube, { rotationX: -48 }, { rotationX: -8, ease: 'none', scrollTrigger: { trigger: '.k-cubecard', start: 'top bottom', end: 'bottom top', scrub: true } });
      ST.create({ trigger: '.k-cubecard', start: 'top bottom', end: 'bottom top', onToggle: function (s) { s.isActive ? spin.play() : spin.pause(); } });
      G.from('.k-cube-scene', { scale: 0.6, opacity: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.k-cubecard', start: 'top 80%' } });
    }

    // 3D-Terminkarte: schwebt, kippt mit der Maus
    var ticket = $('.k-ticket'), tv = $('.k-ctacard__vis');
    if (ticket) {
      G.from(ticket, { y: 120, rotationX: 60, opacity: 0, duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: tv, start: 'top 85%' } });
      G.to(ticket, { y: -10, duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      G.fromTo('.k-ticket__flap', { rotationX: 0 }, { rotationX: -24, duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      if (FINE) {
        var rx = G.quickTo(ticket, 'rotationX', { duration: 0.8, ease: 'power3.out' }), ry = G.quickTo(ticket, 'rotationY', { duration: 0.8, ease: 'power3.out' });
        G.set(ticket, { rotationX: 22, rotationY: -22, rotationZ: 10 });
        tv.addEventListener('pointermove', function (e) { var r = tv.getBoundingClientRect(), u = (e.clientX - r.left) / r.width - 0.5, v = (e.clientY - r.top) / r.height - 0.5; ry(-22 + u * 30); rx(22 - v * 24); });
        tv.addEventListener('pointerleave', function () { rx(22); ry(-22); });
      }
    }

    // Footer: Vorhang-Reveal + Wortmarke steigt Buchstabe für Buchstabe
    var fin = $('.k-footer__in');
    if (fin) G.fromTo(fin, { yPercent: -30 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: '.k-footer', start: 'top bottom', end: 'bottom bottom', scrub: true } });
    var chs = $$('.k-wordmark .k-ch');
    if (chs.length) G.from(chs, { yPercent: 110, opacity: 0, ease: 'expo.out', duration: 1.4, stagger: 0.045, scrollTrigger: { trigger: '.k-footer', start: 'top 75%' } });

    // Sprache/Größe: offene Zeilen-Splits neu aufbauen, Diagramm & Trigger aktualisieren
    function relayout() { splits.forEach(function (s) { if (!s.done) s.build(); }); if (chart) chart.refresh(); ST.refresh(); }
    d.addEventListener('bc:lang', function () { requestAnimationFrame(relayout); });
    var rt; W.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(relayout, 200); });
    if (d.fonts && d.fonts.ready) d.fonts.ready.then(function () { splits.forEach(function (s) { if (!s.done) s.build(); }); ST.refresh(); });
  }
  function boot() { setTimeout(init, 0); }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', boot); else boot();
})();
