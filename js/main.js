/**
 * main.js — homepage only.
 */

(function () {
  function renderDestinationPanels() {
    const wrap = document.getElementById("destinationPanels");
    if (!wrap) return;

    wrap.innerHTML = DESTINATIONS.map(
      (d) => `
      <div class="dest-panel" data-reveal id="dest-${d.id}">
        <div class="dest-fallback" style="background:${d.fallback}"></div>
        <img src="${d.image}" alt="${d.name}, ${d.country}" loading="lazy"
             onerror="this.style.display='none'">
        <a href="planner.html" class="dest-arrow" aria-label="Plan a trip to ${d.name}">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4 14L14 4M14 4H6M14 4V12" stroke="currentColor" stroke-width="1.4"/></svg>
        </a>
        <div class="dest-info">
          <div>
            <span class="dest-name">${d.name}</span>
            <span class="dest-country">${d.country}</span>
          </div>
          <p class="dest-tagline">&ldquo;${d.tagline}&rdquo;</p>
        </div>
      </div>`
    ).join("");

    // Re-init reveal for the freshly injected panels.
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    wrap.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));
  }

  function initHeroGlobe() {
    const canvas = document.getElementById("heroGlobe");
    if (!canvas || !window.THREE) return;

    const globe = new WanderGlobe(canvas, {
      markers: DESTINATIONS.map((d) => ({ lat: d.lat, lon: d.lon, id: d.id })),
      interactive: true,
      autoRotate: true,
    });

    window.__wanderHeroGlobe = globe;
  }

  function initHomeSearch() {
    const input = document.getElementById("homeSearchInput");
    const goBtn = document.getElementById("homeSearchGo");
    const pills = document.querySelectorAll(".search-suggestions [data-dest]");
    if (!input) return;

    function jumpTo(query) {
      const q = query.trim().toLowerCase();
      if (!q) return;
      const dest =
        DESTINATIONS.find((d) => d.name.toLowerCase() === q) ||
        DESTINATIONS.find((d) => d.name.toLowerCase().includes(q));
      if (!dest) return;

      const panel = document.getElementById(`dest-${dest.id}`);
      if (!panel) return;
      panel.scrollIntoView({ behavior: "smooth", block: "center" });
      panel.classList.add("is-highlighted");
      setTimeout(() => panel.classList.remove("is-highlighted"), 2200);
    }

    goBtn.addEventListener("click", () => jumpTo(input.value));
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        jumpTo(input.value);
      }
    });
    pills.forEach((pill) => {
      pill.addEventListener("click", () => {
        input.value = pill.dataset.dest;
        jumpTo(pill.dataset.dest);
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderDestinationPanels();
    initHeroGlobe();
    initHomeSearch();
  });
})();
