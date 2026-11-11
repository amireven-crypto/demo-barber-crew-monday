/* The Barber Crew – Modern: Header, Menü, Preis-Tabs.
   Animationen laufen über Open Design motion-anything (vendor/motion-anything):
   scroll-reveal (data-reveal), fade-in-up (data-fade), count-up (data-count).
   Dieses Skript läuft VOR den Recipes und übersetzt die alten reveal-*-Klassen
   (auch im WordPress-Inhalt) in deren data-Attribute. */
(function () {
  document.documentElement.classList.add('js');

  // --- Mapping auf motion-anything-Recipes ---
  var STEP = 60, MAX = 240; // Stagger 60ms, gedeckelt (MOTION-SPEC: Sequenz innerhalb "slow")
  document.querySelectorAll('[class*="reveal-"]').forEach(function (el) {
    if (el.closest('.bc-hero')) el.setAttribute('data-fade', '');
    else if (!el.hasAttribute('data-reveal')) el.setAttribute('data-reveal', '');
  });
  var heroFade = document.querySelectorAll('.bc-hero [data-fade]');
  heroFade.forEach(function (el, i) { el.setAttribute('data-fade-delay', String(Math.min(i * STEP, MAX))); });
  document.querySelectorAll('.bc-stagger').forEach(function (p) {
    var kids = p.querySelectorAll(':scope > [data-reveal], :scope > .wp-block-group__inner-container > [data-reveal]');
    Array.prototype.forEach.call(kids, function (c, i) { c.setAttribute('data-reveal-delay', String(Math.min(i * STEP, MAX))); });
  });
  // count-up nur für die eine Kennzahl "120+" (restraint: eine Zahl pro Ansicht)
  document.querySelectorAll('.bc-stat__num').forEach(function (el) {
    var m = el.textContent.trim().match(/^(\d+)\+$/);
    if (m && !el.hasAttribute('data-count')) {
      el.setAttribute('data-count', m[1]); el.setAttribute('data-count-suffix', '+'); el.setAttribute('data-count-duration', '700');
    }
  });

  var header = document.querySelector('.bc-header');
  var sticky = document.querySelector('.bc-sticky-book');
  var hero = document.querySelector('.bc-hero');
  function onScroll() {
    var y = window.scrollY;
    if (header) header.classList.toggle('is-scrolled', y > 40);
    if (sticky) {
      var past = hero ? y > hero.offsetHeight * 0.8 : y > 600;
      sticky.classList.toggle('is-visible', past);
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var burger = document.querySelector('.bc-burger');
  if (burger) {
    burger.addEventListener('click', function () {
      var open = document.body.classList.toggle('nav-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.querySelectorAll('.bc-nav a').forEach(function (a) {
      a.addEventListener('click', function () { document.body.classList.remove('nav-open'); burger.setAttribute('aria-expanded', 'false'); });
    });
  }

  // Preis-Kategorien als Tabs (ohne JS werden alle Gruppen angezeigt)
  var grid = document.querySelector('.bc-price-grid');
  if (grid) {
    var groups = grid.querySelectorAll('.bc-price-group');
    var tabs = document.createElement('div');
    tabs.className = 'bc-tabs'; tabs.setAttribute('role', 'group'); tabs.setAttribute('aria-label', 'Preiskategorien filtern');
    var cats = [{ key: 'all', label: 'Alle' }];
    groups.forEach(function (g) {
      var h = g.querySelector('h3');
      var key = Array.prototype.find.call(g.classList, function (c) { return c.indexOf('cat-') === 0; });
      if (h && key) cats.push({ key: key, label: h.textContent.trim() });
    });
    cats.forEach(function (c, i) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'bc-tab' + (i === 0 ? ' is-active' : ''); b.textContent = c.label; b.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
      b.addEventListener('click', function () {
        tabs.querySelectorAll('.bc-tab').forEach(function (t) { t.classList.remove('is-active'); t.setAttribute('aria-pressed', 'false'); });
        b.classList.add('is-active'); b.setAttribute('aria-pressed', 'true');
        groups.forEach(function (g) {
          var hide = c.key !== 'all' && !g.classList.contains(c.key);
          g.classList.toggle('is-hidden', hide);
          if (!hide) g.classList.add('is-in'); // gefilterte Gruppen sofort sichtbar
        });
      });
      tabs.appendChild(b);
    });
    grid.parentNode.insertBefore(tabs, grid);
    if (window.matchMedia('(max-width: 780px)').matches && tabs.children[1]) tabs.children[1].click();
  }
})();
