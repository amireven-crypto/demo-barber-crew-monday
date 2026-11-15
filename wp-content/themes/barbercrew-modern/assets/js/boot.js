document.documentElement.classList.add("js");
/* Set dir/lang before first paint so a later i18n apply does not flip the page (Hebrew CLS). */
(function () {
  try {
    var lang = new URLSearchParams(location.search).get("lang") || localStorage.getItem("bc-lang");
    if (lang === "en" || lang === "ru" || lang === "he") {
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === "he" ? "rtl" : "ltr";
    } else {
      document.documentElement.dir = "ltr";
    }
  } catch (e) {}
})();
