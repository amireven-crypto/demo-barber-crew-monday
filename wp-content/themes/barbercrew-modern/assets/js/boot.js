document.documentElement.classList.add("js");
/* Set dir/lang before first paint so a later i18n apply does not flip the page (Hebrew CLS).
   Also preload the script font for the chosen language so Hebrew/Cyrillic text does not swap. */
(function () {
  try {
    var lang = new URLSearchParams(location.search).get("lang") || localStorage.getItem("bc-lang");
    if (lang === "en" || lang === "ru" || lang === "he") {
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === "he" ? "rtl" : "ltr";
      /* The HTML is German; hide the page until i18n.js has swapped the text, so the first paint
         is already in the chosen language (the Hebrew page used to jump while it loaded). */
      document.documentElement.classList.add("bc-i18n-wait");
      setTimeout(function () { document.documentElement.classList.remove("bc-i18n-wait"); }, 2500);
    } else {
      document.documentElement.dir = "ltr";
    }
    /* body font + heading serif for the script (font-display:optional, so they must be early) */
    var fonts = lang === "he" ? ["notosanshebrew-var.woff2", "frank-ruhl-libre-hebrew-var.woff2"] : lang === "ru" ? ["notosans-cyrillic-var.woff2", "source-serif-4-cyrillic-var.woff2"] : [];
    fonts.forEach(function (font) {
      var l = document.createElement("link");
      l.rel = "preload";
      l.as = "font";
      l.type = "font/woff2";
      l.crossOrigin = "anonymous";
      l.href = "wp-content/themes/barbercrew-modern/assets/fonts/" + font;
      document.head.appendChild(l);
    });
  } catch (e) {}
})();
