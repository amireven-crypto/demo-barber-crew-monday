document.documentElement.classList.add("js");
/* Set dir/lang before first paint so a later i18n apply does not flip the page (Hebrew CLS).
   Also preload the script font for the chosen language so Hebrew/Cyrillic text does not swap. */
(function () {
  try {
    var lang = new URLSearchParams(location.search).get("lang") || localStorage.getItem("bc-lang");
    if (lang === "en" || lang === "ru" || lang === "he") {
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === "he" ? "rtl" : "ltr";
    } else {
      document.documentElement.dir = "ltr";
    }
    var font = lang === "he" ? "notosanshebrew-var.woff2" : lang === "ru" ? "notosans-cyrillic-var.woff2" : null;
    if (font) {
      var l = document.createElement("link");
      l.rel = "preload";
      l.as = "font";
      l.type = "font/woff2";
      l.crossOrigin = "anonymous";
      l.href = "wp-content/themes/barbercrew-modern/assets/fonts/" + font;
      document.head.appendChild(l);
    }
  } catch (e) {}
})();
