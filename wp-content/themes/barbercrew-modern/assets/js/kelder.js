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
      if (h && key) cats.push({ key: key, label: (W.bcDe ? W.bcDe(h) : h.textContent).trim() });
    });
    cats.forEach(function (c, i) {
      var b = d.createElement('button');
      b.type = 'button'; b.className = 'bc-tab' + (i === 0 ? ' is-active' : ''); b.textContent = W.bcTr ? W.bcTr(c.label) : c.label; b._de = c.label; b.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
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
    // Tabs are built after the language script ran, so they follow every language switch here.
    var tabsLang = function () {
      if (!W.bcTr) return;
      tabs.setAttribute('aria-label', W.bcTr('Preiskategorien filtern'));
      $$('.bc-tab', tabs).forEach(function (t) { t.textContent = W.bcTr(t._de); });
    };
    tabsLang();
    d.addEventListener('bc:lang', tabsLang);
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

  // Preisspannen-Balken (KELDER "You set the floor"): dunkel = ab-Preis, hell = bis-Preis
  $$('[data-floor]').forEach(function (el) {
    var v = el.getAttribute('data-floor').split(',').map(function (x) { return x.split(':').map(Number); });
    var mx = Math.max.apply(null, v.map(function (x) { return x[1]; }));
    v.forEach(function (x) {
      var b = d.createElement('i'); b.className = 'k-floor__bar';
      b.innerHTML = '<b class="k-floor__hi" style="--h:' + ((x[1] - x[0]) / mx * 100).toFixed(1) + '%"></b><b class="k-floor__lo" style="--h:' + Math.max(6, x[0] / mx * 100).toFixed(1) + '%"></b>';
      el.appendChild(b);
    });
  });
  // Legenden-Balken im Dashboard: Breite = Anzahl Leistungen
  $$('.k-dash__legend i').forEach(function (i) { i.style.flexGrow = i.style.getPropertyValue('--w') || 1; });

  // Wortmarke im Footer in Buchstaben (dekorativ, aria-hidden)
  var wm = $('.k-wordmark');
  if (wm) wm.innerHTML = wm.textContent.split('').map(function (c) { return '<span class="k-ch">' + (c === ' ' ? '\u00a0' : c) + '</span>'; }).join('');

  /* ================= Header, Menü, Schnellbuchung ================= */
  var header = $('.bc-header'), sticky = $('.bc-sticky-book'), hero = $('.k-hero');
  function footerOccludes() {
    var ft = d.querySelector('.k-footer');
    if (!ft) return false;
    if (ft.classList.contains('is-fixed')) {
      var rem = d.documentElement.scrollHeight - (W.scrollY + W.innerHeight);
      return rem < 80;
    }
    return ft.getBoundingClientRect().top < W.innerHeight - 60;
  }
  function onScroll() {
    var y = W.scrollY;
    if (header) header.classList.toggle('is-scrolled', y > 40);
    if (sticky) sticky.classList.toggle('is-visible', W.innerWidth < 961 && y > (hero ? hero.offsetHeight * 0.6 : 400) && !footerOccludes());
  }
  W.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  var burger = $('.bc-burger'), mainEl = $('.k-main'), footer = $('.k-footer'), quick = $('.bc-quick'), gate = $('.k-foot-gate');
  var tr = function (s) { return W.bcTr ? W.bcTr(s) : s; };
  function tabbables(root) {
    return $$('a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])', root).filter(function (el) {
      return el.offsetParent !== null && getComputedStyle(el).visibility !== 'hidden' && !el.closest('[inert]');
    });
  }
  function navOpen() { return d.body.classList.contains('nav-open'); }
  function setNav(open, focusBurger) {
    d.body.classList.toggle('nav-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', tr(open ? 'Menü schließen' : 'Menü öffnen'));
    [mainEl, quick].forEach(function (el) { if (el) el.inert = open; });
    footState();
    if (open) { var f = $('.bc-nav a'); if (f) { f.focus(); setTimeout(function () { if (navOpen() && d.activeElement !== f && !$('.bc-header').contains(d.activeElement) || d.activeElement === burger) f.focus(); }, 80); } }
    else if (focusBurger) burger.focus();
  }
  if (burger) {
    burger.addEventListener('click', function () { setNav(!navOpen()); });
    d.addEventListener('keydown', function (e) {
      if (!navOpen()) return;
      if (e.key === 'Escape') { setNav(false, true); return; }
      if (e.key !== 'Tab') return;
      var list = tabbables($('.bc-header')); if (!list.length) return;
      var first = list[0], last = list[list.length - 1];
      if (e.shiftKey && d.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && d.activeElement === last) { e.preventDefault(); first.focus(); }
      else if (list.indexOf(d.activeElement) < 0) { e.preventDefault(); first.focus(); }
    });
    W.matchMedia('(min-width: 961px)').addEventListener('change', function (m) { if (m.matches && navOpen()) setNav(false); });
    $$('.bc-nav a').forEach(function (a) { a.addEventListener('click', function () { if (navOpen()) setNav(false); }); });
    d.addEventListener('bc:lang', function () { burger.setAttribute('aria-label', tr(navOpen() ? 'Menü schließen' : 'Menü öffnen')); });
  }

  /* ================= Footer: fixiert unter der Seite (KELDER-Vorhang) =================
     Der Footer liegt fixiert hinter <main>; <main> bekommt unten genau die Footer-Höhe als Abstand.
     Solange er verdeckt ist, ist er inert (kein Fokus auf unsichtbare Links). Ein Fokus-Tor davor
     scrollt bei Tab ans Ende, gibt den Footer frei und setzt den Fokus hinein. Ist der Footer höher
     als das Fenster (kleine Handys), bleibt er im normalen Fluss. */
  var fin = $('.k-footer__in'), footH = 0, fixedFoot = false, wmPlayed = false, footP = -1;
  function footLayout() {
    if (!footer) return;
    var desk = W.innerWidth >= 961;
    footH = Math.round(fin ? fin.offsetHeight : footer.offsetHeight);
    /* Desktop curtain is already position:fixed in CSS; only unfix if the footer is taller than the viewport. */
    fixedFoot = desk && footH > 0 && footH < W.innerHeight - 40;
    footer.classList.toggle('is-fixed', fixedFoot);
    footer.classList.toggle('is-unfixed', desk && !fixedFoot);
    if (fixedFoot) html.style.setProperty('--foot-h', footH + 'px');
    else html.style.removeProperty('--foot-h');
    footP = -1; footState();
  }
  function footState() {
    if (!footer) return;
    var rem = d.documentElement.scrollHeight - (W.scrollY + W.innerHeight);
    var p = fixedFoot ? Math.max(0, Math.min(1, 1 - rem / footH)) : 1;
    footer.inert = navOpen() || (fixedFoot && p < 0.5);
    /* No inner parallax: the -30% translate hid the footer heading under <main>. The curtain is the main/footer overlap alone. */
    if (fin) fin.style.transform = '';
    footP = p;
    if (ANIM && !wmPlayed && p > 0.55 && (fixedFoot || footer.getBoundingClientRect().top < W.innerHeight * 0.75)) { wmPlayed = true; playWordmark(); }
  }
  function playWordmark() { var chs = $$('.k-wordmark .k-ch'); if (chs.length && G) G.fromTo(chs, { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, ease: 'power3.out', duration: 0.7, stagger: 0.03 }); }
  if (ANIM) G.set('.k-wordmark .k-ch', { yPercent: 110, opacity: 0 });
  var lenisRef = null;
  function scrollToY(y, cb) {
    if (lenisRef) lenisRef.scrollTo(y, { duration: 0.8, easing: function (t) { return 1 - Math.pow(1 - t, 4); }, onComplete: cb, force: true });
    else { W.scrollTo(0, y); if (cb) cb(); }
  }
  function revealFooter(focusEl) {
    var max = d.documentElement.scrollHeight - W.innerHeight;
    if (lenisRef) lenisRef.scrollTo(max, { immediate: true, force: true }); else W.scrollTo(0, max);
    footState(); footer.inert = false;
    (focusEl || tabbables(footer)[0] || footer).focus({ preventScroll: true });
  }
  if (gate && footer) {
    gate.addEventListener('focus', function (e) {
      if (e.relatedTarget && footer.contains(e.relatedTarget)) {
        var back = tabbables(quick).concat([]).filter(function (x) { return getComputedStyle(x).opacity !== '0'; });
        var prev = back.length ? back[back.length - 1] : tabbables(mainEl).pop();
        if (prev) prev.focus(); return;
      }
      revealFooter();
    });
  }
  // Anker: #kontakt (fixierter Footer) und #top brauchen eigene Ziele; übrige Anker sanft (Lenis)
  function goto(id, e) {
    var t = id && d.getElementById(id); if (!t) return;
    if (e) e.preventDefault();
    if (navOpen()) setNav(false);
    if (t === footer) {
      var max = d.documentElement.scrollHeight - W.innerHeight;
      scrollToY(max, function () { footState(); footer.inert = false; footer.focus({ preventScroll: true }); });
      history.replaceState(null, '', '#' + id); return;
    }
    if (id === 'top') { scrollToY(0, function () { var l = $('.bc-header__logo'); if (l) l.focus({ preventScroll: true }); }); return; }
    if (lenisRef) lenisRef.scrollTo(t, { offset: -72, duration: 1.4 }); else t.scrollIntoView();
    if (!t.hasAttribute('tabindex')) t.setAttribute('tabindex', '-1');
    t.focus({ preventScroll: true }); history.replaceState(null, '', '#' + id);
  }
  $$('a[href^="#"]:not(.bc-skip)').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href').slice(1);
      if (lenisRef || id === 'kontakt' || id === 'top') goto(id, e);
    });
  });
  W.addEventListener('scroll', footState, { passive: true });
  d.addEventListener('bc:lang', function () { requestAnimationFrame(footLayout); });
  W.addEventListener('resize', function () { footLayout(); });

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
    var hostDir = getComputedStyle(this.el).direction, ta = getComputedStyle(this.el).textAlign;
    if (ta === 'start') ta = hostDir === 'rtl' ? 'right' : 'left'; else if (ta === 'end') ta = hostDir === 'rtl' ? 'left' : 'right';
    rows.forEach(function (r) {
      var line = d.createElement('span'); line.className = 'k-line';
      // RTL-Seite, aber Zeile ohne hebräische Zeichen (z. B. Markenname): Wörter in LTR-Reihenfolge halten
      if (hostDir === 'rtl' && !/[\u0590-\u05FF]/.test(r.map(function (w) { return w.textContent; }).join(''))) { line.style.direction = 'ltr'; line.style.textAlign = ta; }
      var inn = d.createElement('span'); inn.className = 'k-line__in';
      r.forEach(function (w, i) { if (i && w._sp) inn.appendChild(d.createTextNode(' ')); inn.appendChild(w); });
      line.appendChild(inn); box.appendChild(line); inners.push(inn);
    });
    this.lines = box; this.inners = inners;
    if (this.played) G.set(inners, { yPercent: 0 }); else G.set(inners, { yPercent: 110 });
  };
  Split.prototype.play = function (delay) {
    var self = this; if (this.done || this.played) return; this.played = true;
    G.to(this.inners, { yPercent: 0, duration: 0.65, ease: 'power3.out', stagger: 0.06, delay: delay || 0, onComplete: function () { self.finish(); } });
  };
  Split.prototype.finish = function () { this.done = true; this.el.classList.add('is-split-done'); if (this.lines) this.lines.remove(); this.lines = null; };
  Split.prototype.finishNow = function () {
    if (this.inners && G) G.set(this.inners, { yPercent: 0 });
    this.played = true;
    this.finish();
  };

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
      ctx.fillStyle = 'rgba(255,255,255,.95)'; ctx.fill(hot);
    }
    var lastPtr = performance.now();
    function active() { return on && (W.scrollY < W.innerHeight * 0.6) && (performance.now() - lastPtr < 6000); }
    function loop(now) { if (active()) { frame++; if (frame % 2) draw(now); cm += ((mx > -999 ? 1 : 0) - cm) * 0.08; } requestAnimationFrame(loop); }
    size(); W.addEventListener('resize', function () { size(); if (!ANIM) draw(t0); });
    if (!ANIM) { draw(t0); return; }
    if (FINE) {
      host.addEventListener('pointermove', function (e) { var r = host.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; lastPtr = performance.now(); });
      host.addEventListener('pointerleave', function () { mx = my = -9999; });
    }
    lastPtr = performance.now();
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
    G.to(paths, { strokeDashoffset: 0, duration: 1.2, ease: 'power3.out', stagger: 0.04, scrollTrigger: { trigger: svg.parentNode, start: 'top 80%', once: true } });
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
      var xb = $('.k-chart__x', wrap); if (xb) xb.innerHTML = state.items.map(function (it) { var du = $('.bc-item__dur', it.el); return '<span>' + (du ? du.textContent.replace(/</g, '') : '') + '</span>'; }).join('');
      if (xb) requestAnimationFrame(function () { var sp = $$('span', xb), tot = 0; sp.forEach(function (x) { tot += x.offsetWidth + 10; }); var step = tot > xb.clientWidth ? Math.ceil(tot / Math.max(1, xb.clientWidth)) : 1; sp.forEach(function (x, i) { x.style.visibility = i % step === 0 ? '' : 'hidden'; }); });
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
      refresh: function () { moveInd($('.k-seg__b.is-on')); setCat(state.cat, false); }
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
  // KELDER "Swept every business day": Datumschips der aktuellen Woche (Wien); vergangene Werktage blau, heute Orange, kommende umrandet, Wochenende grau
  function Days(ul) {
    var lis = $$('li', ul), v = viennaNow(), today = v.wd, base;
    try { base = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Vienna' })); } catch (e) { base = new Date(); }
    lis.forEach(function (l, j) {
      var dt = new Date(base); dt.setDate(base.getDate() - today + j); l.textContent = dt.getDate();
      l.classList.add(j > 4 ? 'is-off' : j < today ? 'is-past' : j === today ? 'is-today' : 'is-next');
    });
    if (!ANIM) return;
    G.from(lis, { scale: 0.6, opacity: 0, duration: 0.7, ease: 'back.out(2)', stagger: 0.07, scrollTrigger: { trigger: ul, start: 'top 90%' } });
  }

  /* ================= Öffnungszeiten-Fortschritt ================= */
  function Hours(card) {
    var bar = $('.k-progress', card); if (!bar) return; /* Fortschritt des heutigen Öffnungstags (Wien) */
    function frac() { var v = viennaNow(); if (v.wd > 4) return 0; return Math.max(0, Math.min(1, (v.min - 540) / (1110 - 540))); }
    var o = { p: ANIM ? 0 : frac() }; bar.style.setProperty('--p', o.p);
    if (ANIM) G.to(o, { p: frac(), duration: 0.7, ease: 'power3.out', onUpdate: function () { bar.style.setProperty('--p', o.p); }, scrollTrigger: { trigger: card, start: 'top 85%', once: true } });
    setInterval(function () { o.p = frac(); bar.style.setProperty('--p', o.p); }, 60000);
  }

  /* ================= Init nach i18n ================= */
  function init() {
    // Canvas & SVG-Effekte (auch statisch bei reduzierter Bewegung)
    $$('.k-halftone').forEach(Halftone);
    $$('[data-silk]').forEach(Silk);
    $$('.k-dotsicon').forEach(DotIcon);
    var chart = Chart();
    if (!ANIM && chart) d.addEventListener('bc:lang', function () { chart.refresh(); });
    $$('.k-days').forEach(Days);
    footLayout();
    $$('.k-hourscard').forEach(Hours);
    if (!ANIM) return;

    // Native scroll — no Lenis delay on desktop. Touch was already native.
    lenisRef = null;

    function showEl(el) {
      if (!el) return;
      el.classList.remove('is-pending');
      el.style.opacity = '1';
      el.style.transform = 'none';
      el.style.clipPath = 'none';
      el.style.filter = 'none';
    }
    function flushReveals() {
      $$('[data-reveal],[data-intro],[data-mask],.k-dash,.k-step,.k-flow,.k-ticks li').forEach(showEl);
      splits.forEach(function (s) { if (!s.done) s.finishNow(); });
    }
    function belowFold(el) { return !!(el && el.getBoundingClientRect && el.getBoundingClientRect().top > W.innerHeight * 0.98); }
    $$('[data-reveal],[data-mask]').forEach(function (el) { if (belowFold(el)) el.classList.add('is-pending'); });
    if (W.IntersectionObserver) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { showEl(e.target); io.unobserve(e.target); } });
      }, { rootMargin: '12% 0px' });
      $$('[data-reveal].is-pending, [data-mask].is-pending').forEach(function (el) { io.observe(el); });
    }

    $$('[data-split]').forEach(function (el) {
      if (el.closest('.k-hero')) return; // keep the hero heading stable (no CLS)
      splits.push(new Split(el));
    });
    splits.forEach(function (s) {
      if (!belowFold(s.el)) { s.finishNow(); return; }
      ST.create({ trigger: s.el, start: 'top 92%', once: true, onEnter: function () { s.play(); }, onRefresh: function (self) { if (self && self.progress > 0 && !s.done) s.finishNow(); } });
    });

    var dash = $('.k-dash');
    if (dash) G.fromTo(dash, { rotationX: 12, scale: 0.98 }, { rotationX: 0, scale: 1, ease: 'none', immediateRender: false, scrollTrigger: { trigger: '.k-dash-wrap', start: 'top 85%', end: 'top 25%', scrub: 0.4 } });

    ST.batch('[data-reveal]', {
      start: 'top 95%', once: true, interval: 0.05,
      onEnter: function (els) {
        els.forEach(function (el) { el.classList.remove('is-pending'); });
        G.to(els, { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out', stagger: 0.05, overwrite: true, clearProps: 'transform,filter' });
      }
    });
    ST.batch('[data-mask]', {
      start: 'top 95%', once: true,
      onEnter: function (els) {
        els.forEach(function (el) { el.classList.remove('is-pending'); });
        G.to(els, { clipPath: 'inset(0% 0 0 0 round 16px)', opacity: 1, duration: 0.7, ease: 'power3.out', stagger: 0.06 });
        var imgs = els.map(function (e) { return $('img', e); }).filter(Boolean);
        if (imgs.length) G.fromTo(imgs, { scale: 1.08 }, { scale: 1, duration: 0.9, ease: 'power3.out', stagger: 0.06, clearProps: 'transform' });
      }
    });
    if (W.matchMedia('(min-width:781px)').matches) {
      $$('[data-parallax]').forEach(function (img) { G.fromTo(img, { yPercent: -4 }, { yPercent: 4, ease: 'none', scrollTrigger: { trigger: img.parentNode, start: 'top bottom', end: 'bottom top', scrub: true } }); });
    }

    var steps = $$('.k-step'), glow = $('.k-steps__glow'), rail = $('.k-steps__rail i');
    function activate(s) {
      steps.forEach(function (x) { x.classList.toggle('is-active', x === s); });
      if (glow) G.to(glow, { y: s.offsetTop, height: s.offsetHeight, duration: 0.35, ease: 'power2.inOut' });
    }
    if (steps.length) {
      G.set(glow, { y: steps[0].offsetTop, height: steps[0].offsetHeight });
      steps.forEach(function (s) { ST.create({ trigger: s, start: 'top 62%', end: 'bottom 62%', onToggle: function (st) { if (st.isActive) activate(s); } }); });
      activate(steps[0]);
      if (rail) G.to(rail, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.k-steps', start: 'top 62%', end: 'bottom 62%', scrub: true } });
    }

    function relayout() { splits.forEach(function (s) { if (!s.done) s.build(); }); if (chart) chart.refresh(); footLayout(); ST.refresh(); flushReveals(); }
    d.addEventListener('bc:lang', function () { requestAnimationFrame(relayout); });
    var rt; W.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { relayout(); }, 200); });
    d.addEventListener('visibilitychange', function () { if (!d.hidden) { flushReveals(); if (ST) ST.refresh(); } });
    W.addEventListener('pageshow', function () { flushReveals(); });
    setTimeout(flushReveals, 1800);
    if (d.fonts && d.fonts.ready) d.fonts.ready.then(function () { splits.forEach(function (s) { if (!s.done) s.build(); }); ST.refresh(); });
  }
  function boot() { setTimeout(init, 0); }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', boot); else boot();
})();
