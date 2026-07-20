// SPAA — interactions légères, sans dépendance
(function () {
  "use strict";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Ombre du header au scroll ---- */
  const header = document.querySelector("header.site");
  if (header) {
    const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---- Fermer le menu mobile après clic ---- */
  const toggle = document.getElementById("nav-toggle");
  if (toggle) {
    document.querySelectorAll("nav.main a").forEach((a) =>
      a.addEventListener("click", () => { toggle.checked = false; })
    );
  }

  /* ---- Apparition au scroll ---- */
  const revealables = document.querySelectorAll(".reveal");
  if (revealables.length && "IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); }
      }),
      { threshold: 0.12 }
    );
    revealables.forEach((el) => io.observe(el));
  } else {
    revealables.forEach((el) => el.classList.add("visible"));
  }

  /* ---- Compteurs animés (bande stats) ---- */
  const counters = document.querySelectorAll("[data-count]");
  if (counters.length) {
    const animate = (el) => {
      const target = parseInt(el.dataset.count, 10);
      if (reduceMotion) { el.textContent = target; return; }
      const dur = 1100; const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / dur, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries) => entries.forEach((e) => {
        if (e.isIntersecting) { animate(e.target); io.unobserve(e.target); }
      }), { threshold: 0.4 });
      counters.forEach((el) => io.observe(el));
    } else {
      counters.forEach(animate);
    }
  }

  /* ---- Filtres de la page animaux ---- */
  const chips = document.querySelectorAll(".chip[data-filter]");
  const cards = document.querySelectorAll(".animal-card[data-species]");
  if (chips.length && cards.length) {
    chips.forEach((chip) => chip.addEventListener("click", () => {
      chips.forEach((c) => { c.classList.remove("active"); c.setAttribute("aria-pressed", "false"); });
      chip.classList.add("active");
      chip.setAttribute("aria-pressed", "true");
      const f = chip.dataset.filter;
      let shown = 0;
      cards.forEach((card) => {
        const match =
          f === "tous" ||
          card.dataset.species === f ||
          (f === "disponible" && card.dataset.status === "disponible");
        card.style.display = match ? "" : "none";
        if (match) shown++;
      });
      const empty = document.getElementById("no-result");
      if (empty) empty.style.display = shown ? "none" : "block";
    }));
  }
})();
