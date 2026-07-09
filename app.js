/* =========================================================================
   app.js – Sprachwechsel (i18n), Navigation, Menü
   Läuft auf allen Seiten. Sprache wird in localStorage gespeichert.
   ========================================================================= */
(function () {
  "use strict";

  const DEFAULT_LANG = "de";
  const SUPPORTED = ["de", "en", "es"];
  let currentLang = DEFAULT_LANG;

  /* ---------------------------------------------------------------------
     1) i18n – Texte + Meta anwenden, ohne Seitenreload
     --------------------------------------------------------------------- */
  function applyLanguage(lang) {
    const dict = TRANSLATIONS[lang];
    if (!dict) return;
    currentLang = lang;
    document.documentElement.lang = lang;

    // Textinhalte
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      const key = el.getAttribute("data-i18n");
      const value = dict[key];
      if (typeof value === "string") el.textContent = value;
    });

    // Seitentitel + Meta-Description (Schlüssel am <body>)
    const body = document.body;
    const titleKey = body.getAttribute("data-title-key");
    const descKey = body.getAttribute("data-desc-key");
    if (titleKey && dict[titleKey]) document.title = dict[titleKey];
    if (descKey && dict[descKey]) {
      let meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute("content", dict[descKey]);
    }

    // Sprachregler-Zustand
    const buttons = document.querySelectorAll(".lang-switch__btn");
    buttons.forEach(function (btn, index) {
      const active = btn.dataset.lang === lang;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
      if (active) moveThumb(index);
    });

    // Team-Bios nach Sprachwechsel neu auf Abschneiden prüfen
    if (typeof refreshTeamBios === "function") refreshTeamBios();

    try { localStorage.setItem("rosero-lang", lang); } catch (e) {}
  }

  function moveThumb(index) {
    const thumb = document.querySelector(".lang-switch__thumb");
    const btn = document.querySelectorAll(".lang-switch__btn")[index];
    if (thumb && btn) {
      thumb.style.transform = "translateX(" + (btn.offsetLeft - 4) + "px)";
      thumb.style.width = btn.offsetWidth + "px";
    }
  }

  document.querySelectorAll(".lang-switch__btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      applyLanguage(btn.dataset.lang);
    });
  });

  /* ---------------------------------------------------------------------
     2) Navigation – Scroll-Schatten + Burger-Menü
     --------------------------------------------------------------------- */
  const nav = document.querySelector(".nav");
  if (nav) {
    window.addEventListener(
      "scroll",
      function () {
        nav.classList.toggle("is-scrolled", window.scrollY > 12);
      },
      { passive: true }
    );
  }

  const burger = document.getElementById("burger");
  const links = document.querySelector(".nav__links");
  if (burger && links) {
    burger.addEventListener("click", function () {
      const open = links.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        links.classList.remove("is-open");
        burger.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------------------------------------------------------------------
     3) Team-Bios: „Mehr lesen“ / „Weniger anzeigen“
     --------------------------------------------------------------------- */
  var moreButtons = document.querySelectorAll(".team-card__more");

  moreButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var card = btn.closest(".team-card");
      var expanded = card.classList.toggle("is-expanded");
      var key = expanded ? "team.read_less" : "team.read_more";
      btn.setAttribute("aria-expanded", expanded ? "true" : "false");
      btn.setAttribute("data-i18n", key);
      var dict = TRANSLATIONS[currentLang] || {};
      if (dict[key]) btn.textContent = dict[key];
    });
  });

  // Toggle nur zeigen, wenn der Text tatsächlich abgeschnitten ist
  function refreshTeamBios() {
    moreButtons.forEach(function (btn) {
      var card = btn.closest(".team-card");
      if (card.classList.contains("is-expanded")) return;
      var bio = card.querySelector(".team-card__bio");
      btn.hidden = bio.scrollHeight <= bio.clientHeight + 2;
    });
  }
  window.addEventListener("load", refreshTeamBios);

  /* ---------------------------------------------------------------------
     4) Initialisierung
     --------------------------------------------------------------------- */
  let saved = DEFAULT_LANG;
  try { saved = localStorage.getItem("rosero-lang") || DEFAULT_LANG; } catch (e) {}
  applyLanguage(SUPPORTED.indexOf(saved) > -1 ? saved : DEFAULT_LANG);

  function repositionThumb() {
    const buttons = document.querySelectorAll(".lang-switch__btn");
    const activeIndex = Array.prototype.findIndex.call(buttons, function (b) {
      return b.dataset.lang === currentLang;
    });
    if (activeIndex > -1) moveThumb(activeIndex);
  }
  window.addEventListener("load", repositionThumb);
  window.addEventListener("resize", repositionThumb);
})();
