/* The Barber Crew – Modern: Header, Menü, Preis-Tabs, Scroll-Reveal */
(function () {
  document.documentElement.classList.add('js');
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
    tabs.className = 'bc-tabs'; tabs.setAttribute('role', 'tablist');
    var cats = [{ key: 'all', label: 'Alle' }];
    groups.forEach(function (g) {
      var h = g.querySelector('h3');
      var key = Array.prototype.find.call(g.classList, function (c) { return c.indexOf('cat-') === 0; });
      if (h && key) cats.push({ key: key, label: h.textContent.trim() });
    });
    cats.forEach(function (c, i) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'bc-tab' + (i === 0 ? ' is-active' : ''); b.textContent = c.label;
      b.addEventListener('click', function () {
        tabs.querySelectorAll('.bc-tab').forEach(function (t) { t.classList.remove('is-active'); });
        b.classList.add('is-active');
        groups.forEach(function (g) { g.classList.toggle('is-hidden', c.key !== 'all' && !g.classList.contains(c.key)); });
      });
      tabs.appendChild(b);
    });
    grid.parentNode.insertBefore(tabs, grid);
    // Auf dem Handy startet die Liste mit der ersten Kategorie (kürzer zum Scrollen)
    if (window.matchMedia('(max-width: 780px)').matches && tabs.children[1]) tabs.children[1].click();
  }

  // Scroll-Reveal (fadeIn / slideInDown wie im Original)
  var els = document.querySelectorAll('[class*="reveal-"]');
  document.querySelectorAll('.bc-stagger').forEach(function (p) {
    Array.prototype.forEach.call(p.children, function (c, i) { c.style.setProperty('--d', (i * 0.12) + 's'); });
  });
  if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('is-in'); }); return; }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  els.forEach(function (e) { io.observe(e); });
})();
