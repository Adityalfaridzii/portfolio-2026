/* Progressive enhancement only. Every page is fully readable with JS off,
   and every effect below switches off with the footer control or the OS
   "reduce motion" setting. */
(function () {
  "use strict";

  var root = document.documentElement;
  var STORE = "af-motion";
  var bar = null;
  /* declared before anything can call into them: drawProgress() runs markToc()
     during init, and a var that is only assigned later in the file is undefined
     at that moment */
  var tocHeads = [];
  var tocLinks = [];

  function motionOn() {
    return root.dataset.motion !== "off";
  }

  function store(value) {
    try {
      localStorage.setItem(STORE, value);
    } catch (e) {
      /* private mode: the choice simply does not persist */
    }
  }

  /* ---------------- dynamic-island nav ---------------- */

  var header = document.querySelector(".site-head");
  var inner = document.querySelector(".head-inner");

  if (header && inner) {
    var wide = window.matchMedia("(min-width: 721px)");
    var pinned = false;

    var setCollapsed = function (on) {
      header.dataset.collapsed = on ? "true" : "false";
    };

    var onScrollIsland = function () {
      if (!wide.matches) {
        setCollapsed(false);
        return;
      }
      setCollapsed(window.scrollY > 120 && !pinned);
    };

    inner.addEventListener("pointerenter", function () {
      pinned = true;
      setCollapsed(false);
    });
    inner.addEventListener("pointerleave", function () {
      pinned = false;
      onScrollIsland();
    });
    inner.addEventListener("focusin", function () {
      pinned = true;
      setCollapsed(false);
    });
    inner.addEventListener("focusout", function () {
      pinned = false;
      onScrollIsland();
    });

    window.addEventListener("scroll", onScrollIsland, { passive: true });
    if (wide.addEventListener) wide.addEventListener("change", onScrollIsland);
    onScrollIsland();
  }

  /* ---------------- which section am I in ---------------- */

  var spySections = [].slice.call(
    document.querySelectorAll("#work, #numbers, #experience, #contact")
  );
  var spyLinks = [].slice.call(document.querySelectorAll(".nav a[href^='#']"));

  function markCurrentSection() {
    if (!spySections.length || !spyLinks.length) return;
    var best = null;
    var bestDistance = Infinity;
    for (var i = 0; i < spySections.length; i++) {
      var d = Math.abs(spySections[i].getBoundingClientRect().top - 130);
      if (d < bestDistance) {
        bestDistance = d;
        best = spySections[i];
      }
    }
    for (var j = 0; j < spyLinks.length; j++) {
      if (best && spyLinks[j].getAttribute("href") === "#" + best.id) {
        spyLinks[j].setAttribute("aria-current", "true");
      } else {
        spyLinks[j].removeAttribute("aria-current");
      }
    }
  }

  /* ---------------- section rules ---------------- */

  var sections = [].slice.call(document.querySelectorAll(".sec"));

  function drawSections() {
    var vh = window.innerHeight;
    for (var i = 0; i < sections.length; i++) {
      var s = sections[i];
      var r = s.getBoundingClientRect();
      var span = r.height - vh;
      var p;
      if (span > 0) {
        p = -r.top / span;
      } else {
        /* short section: full once its top passes the middle of the screen */
        p = (vh * 0.6 - r.top) / Math.max(1, vh * 0.6);
      }
      s.style.setProperty("--sp", Math.min(1, Math.max(0, p)).toFixed(3));
    }
  }

  /* ---------------- reading progress ---------------- */

  bar = document.createElement("div");
  bar.className = "progress";
  bar.setAttribute("aria-hidden", "true");
  document.body.appendChild(bar);

  var ticking = false;

  function drawProgress() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    bar.style.transform = "scaleX(" + p.toFixed(4) + ")";
    drawSections();
    markCurrentSection();
    markToc();
    ticking = false;
  }

  function requestProgress() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(drawProgress);
  }

  window.addEventListener("scroll", requestProgress, { passive: true });
  window.addEventListener("resize", requestProgress, { passive: true });
  drawProgress();
  drawSections();

  /* ---------------- the lamp ---------------- */

  var lamp = document.createElement("div");
  lamp.className = "lamp";
  lamp.setAttribute("aria-hidden", "true");
  document.body.appendChild(lamp);

  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    document.addEventListener(
      "pointermove",
      function (e) {
        if (!motionOn()) return;
        root.style.setProperty("--mx", ((e.clientX / window.innerWidth) * 100).toFixed(1) + "%");
        root.style.setProperty("--my", ((e.clientY / window.innerHeight) * 100).toFixed(1) + "%");
      },
      { passive: true }
    );
  }

  /* ---------------- running head ---------------- */

  var SHEETS = {
    "": "01 · Index",
    "index.html": "01 · Index",
    "amb-copilot.html": "02 · CF-01",
    "qa-dashboard.html": "03 · CF-02",
    "automation.html": "04 · CF-03",
    "traveloka-automation.html": "05 · TF-01",
    "traveloka-identity.html": "06 · TF-02",
    "cv.html": "07 · Curriculum Vitae",
  };

  var head0 = document.querySelector(".site-head");
  if (head0 && head0.parentNode) {
    var page = location.pathname.split("/").pop();
    var line = document.createElement("div");
    line.className = "sheet-line";
    var inner = document.createElement("div");
    inner.className = "wrap sheet-line-in";
    inner.innerHTML =
      "<span>Aditya R. Al-Faridzi · Portfolio</span>" +
      "<span>" +
      (SHEETS[page] || "Sheet") +
      "</span>" +
      "<span>Rev 2026-11-13 · Jakarta</span>";
    line.appendChild(inner);
    head0.parentNode.insertBefore(line, head0);
  }

  /* ---------------- sticky header hairline ---------------- */

  var head = document.querySelector(".site-head");
  if (head) {
    var onScroll = function () {
      head.dataset.scrolled = window.scrollY > 8 ? "true" : "false";
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------------- reveal on enter ---------------- */

  var revealables = [].slice.call(document.querySelectorAll(".reveal"));

  function revealAll() {
    revealables.forEach(function (el) {
      el.classList.add("is-in");
    });
  }

  if (revealables.length && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
    );

    revealables.forEach(function (el, i) {
      el.style.transitionDelay = Math.min(i % 4, 3) * 50 + "ms";
      io.observe(el);
    });

    /* Safety net: no content may stay invisible if the observer never fires. */
    window.setTimeout(function () {
      revealables.forEach(function (el) {
        if (!el.classList.contains("is-in")) el.classList.add("is-in");
      });
    }, 4000);
  } else {
    revealAll();
  }

  /* ---------------- figures ---------------- */

  /* Deliberately no count-up. A number that climbs through 209 on its way to
     211 is, for those 900 ms, simply wrong — and this site's whole argument is
     that figures are exact and sourced. The reveal is done in CSS instead:
     the value is in the DOM, correct, from the first frame. */

  /* ---------------- cursor spotlight on work rows ---------------- */

  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    [].forEach.call(document.querySelectorAll(".work-item"), function (row) {
      row.addEventListener(
        "pointermove",
        function (ev) {
          var r = row.getBoundingClientRect();
          row.style.setProperty("--mx", (((ev.clientX - r.left) / r.width) * 100).toFixed(1) + "%");
          row.style.setProperty("--my", (((ev.clientY - r.top) / r.height) * 100).toFixed(1) + "%");
        },
        { passive: true }
      );
    });
  }

  /* ---------------- portrait parallax ---------------- */

  var portrait = document.querySelector("[data-parallax]");
  var parallaxRaf = false;

  function drawParallax() {
    parallaxRaf = false;
    if (!portrait) return;

    if (!motionOn()) {
      portrait.style.transform = "";
      return;
    }

    var clip = portrait.parentElement;
    var box = clip.getBoundingClientRect();
    var vh = window.innerHeight;

    /* 0 when the image starts entering from the bottom, 1 when it has fully
       left the top. The image lags the page by a share of that progress. */
    var track = vh + box.height;
    var progress = (vh - box.top) / track;
    progress = Math.min(1, Math.max(0, progress));

    var amplitude = Math.min(14, Math.max(6, box.height * 0.04));
    var shift = (progress - 0.5) * 2 * amplitude;

    portrait.style.transform =
      "translate3d(0," + shift.toFixed(2) + "px,0) scale(1.08)";
  }

  function requestParallax() {
    if (parallaxRaf) return;
    parallaxRaf = true;
    requestAnimationFrame(drawParallax);
  }

  if (portrait) {
    window.addEventListener("scroll", requestParallax, { passive: true });
    window.addEventListener("resize", requestParallax, { passive: true });
    requestParallax();
  }

  /* ---------------- section rail on case pages ---------------- */

  var prose = document.querySelector(".prose");

  if (prose) {
    var headings = [].slice.call(prose.querySelectorAll("h2"));

    if (headings.length > 2) {
      var rail = document.createElement("nav");
      rail.className = "toc-bar";
      rail.setAttribute("aria-label", "Sections in this case file");

      headings.forEach(function (h, i) {
        if (!h.id) {
          h.id =
            "s" +
            (i + 1) +
            "-" +
            h.textContent
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-|-$/g, "")
              .slice(0, 30);
        }
        var a = document.createElement("a");
        a.href = "#" + h.id;
        a.textContent = h.textContent;
        rail.appendChild(a);
        tocHeads.push(h);
        tocLinks.push(a);
      });

      var caseHead = document.querySelector(".case-head");
      if (caseHead && caseHead.parentNode) {
        caseHead.parentNode.insertBefore(rail, caseHead.nextSibling);
      }
    }
  }

  /* The rail marks the section you are actually in. It is computed on scroll,
     not left to an IntersectionObserver: an observer only reports headings that
     enter its band, so scrolling back to the top left the last one marked. */
  function markToc() {
    if (!tocHeads || !tocHeads.length) return;
    var active = -1;
    for (var i = 0; i < tocHeads.length; i++) {
      if (tocHeads[i].getBoundingClientRect().top - 132 <= 0) active = i;
    }
    /* at the end of the document the last heading never crosses the line, so
       the reader gets no marker for the section they are actually reading */
    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4) {
      active = tocHeads.length - 1;
    }
    for (var j = 0; j < tocLinks.length; j++) {
      if (j === active) tocLinks[j].setAttribute("aria-current", "true");
      else tocLinks[j].removeAttribute("aria-current");
    }
  }

  /* ---------------- footer controls: theme + motion ---------------- */

  var foot = document.querySelector(".foot-inner");
  var toggle = null;
  var themeBtn = null;

  function syncToggle() {
    if (!toggle) return;
    toggle.textContent = motionOn() ? "Motion: on" : "Motion: off";
    toggle.setAttribute("aria-pressed", motionOn() ? "true" : "false");
    toggle.setAttribute(
      "title",
      motionOn()
        ? "Turn animation off. The page stays identical; nothing moves."
        : "Turn animation on."
    );
  }

  function currentTheme() {
    return root.dataset.theme === "amber" ? "amber" : "paper";
  }

  function syncTheme() {
    if (!themeBtn) return;
    var amber = currentTheme() === "amber";
    themeBtn.textContent = "Theme: " + (amber ? "amber" : "paper");
    themeBtn.setAttribute("aria-pressed", amber ? "true" : "false");
    themeBtn.setAttribute(
      "title",
      amber
        ? "Back to the paper theme. Same content, neutral palette."
        : "Amber paper theme. Same content, warmer palette."
    );
  }

  if (foot) {
    var controls = document.createElement("div");
    controls.className = "foot-controls";
    foot.appendChild(controls);

    themeBtn = document.createElement("button");
    themeBtn.type = "button";
    themeBtn.className = "foot-btn";
    /* the exhibit skin owns the palette; a paper/amber switch would be a
       control that does nothing, so it is not rendered */
    if (!root.dataset.exhibit) {
      controls.appendChild(themeBtn);
      syncTheme();

      themeBtn.addEventListener("click", function () {
        var next = currentTheme() === "amber" ? "paper" : "amber";
        if (next === "paper") delete root.dataset.theme;
        else root.dataset.theme = "amber";
        try {
          localStorage.setItem("af-theme", next);
        } catch (e) {}
        syncTheme();
        requestProgress();
      });
    }

    toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "motion-toggle";
    controls.appendChild(toggle);
    syncToggle();

    toggle.addEventListener("click", function () {
      var on = !motionOn();
      store(on ? "on" : "off");
      root.dataset.motion = on ? "on" : "off";
      root.classList.toggle("motion", on);
      syncToggle();

      if (!on) {
        revealAll();
        bar.style.transform = "";
      } else {
        drawProgress();
      }
      requestParallax();
    });
  }

  /* follow the OS setting while the visitor has not chosen explicitly */
  var mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  var onPrefChange = function () {
    var stored = null;
    try {
      stored = localStorage.getItem(STORE);
    } catch (e) {}
    if (stored) return;
    var on = !mq.matches;
    root.dataset.motion = on ? "on" : "off";
    root.classList.toggle("motion", on);
    if (!on) {
      revealAll();
      bar.style.transform = "";
    }
    syncToggle();
    requestParallax();
  };

  if (mq.addEventListener) mq.addEventListener("change", onPrefChange);
  else if (mq.addListener) mq.addListener(onPrefChange);

  /* ---------------- small things ---------------- */

  var year = document.querySelector("[data-year]");
  if (year) year.textContent = String(new Date().getFullYear());

  var print = document.querySelector("[data-print]");
  if (print) {
    print.addEventListener("click", function () {
      window.print();
    });
  }

  /* ---------------- "only verified" ledger filter ---------------- */

  var verifyToggle = document.querySelector("[data-verify-toggle]");
  var ledger = document.querySelector("[data-ledger]");

  if (verifyToggle && ledger) {
    var status = document.querySelector("[data-verify-status]");
    var reported = ledger.querySelectorAll('tbody tr[data-claim="reported"]');

    verifyToggle.addEventListener("click", function () {
      var on = verifyToggle.getAttribute("aria-checked") === "true";
      verifyToggle.setAttribute("aria-checked", on ? "false" : "true");
      ledger.classList.toggle("on-verified", !on);
      if (status) {
        status.textContent = !on
          ? reported.length +
            " reported figures dimmed. " +
            (ledger.querySelectorAll("tbody tr").length - reported.length) +
            " verified figures remain."
          : "Showing all figures. Toggle to isolate what has been checked against source.";
      }
    });
  }
})();
