/**
 * itinerary.js
 * Reads the journey saved by the planner (sessionStorage) and
 * renders a day-by-day itinerary, plus the route visualisation.
 */

(function () {
  const el = (id) => document.getElementById(id);

  function loadJourney() {
    try {
      const raw = sessionStorage.getItem("wanderJourney");
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function fallbackJourney() {
    const dest = DESTINATIONS[0];
    return {
      destination: dest,
      departureDate: "",
      returnDate: "",
      adults: 2,
      children: 0,
      interests: ["Culture", "Food"],
      budget: 280000,
    };
  }

  function buildDays(destination, duration) {
    const base = destination.itinerary;
    const count = duration && duration >= 2 && duration <= 10 ? duration : base.length;
    const days = [];
    for (let i = 0; i < count; i++) {
      if (i < base.length) {
        days.push(base[i]);
      } else {
        days.push({
          title: "Leisure & Discovery",
          spots: ["Free morning to explore at your own pace", "Local recommendation from your host", "Relaxed evening, no itinerary required"],
        });
      }
    }
    return days;
  }

  function formatDateRange(dep, ret) {
    if (!dep || !ret) return null;
    const d = new Date(dep);
    const r = new Date(ret);
    const depStr = d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    const retStr = r.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    return `${depStr} — ${retStr}`.toUpperCase();
  }

  function render() {
    const journey = loadJourney() || fallbackJourney();
    const dest = journey.destination;
    if (!dest) return;

    const duration =
      journey.departureDate && journey.returnDate
        ? Math.round((new Date(journey.returnDate) - new Date(journey.departureDate)) / 86400000)
        : dest.itinerary.length;

    el("heroImage").src = dest.image;
    el("heroImage").alt = `${dest.name}, ${dest.country}`;
    el("heroFallback").style.background = dest.fallback;
    el("heroEyebrow").textContent = `${dest.country} · Your Journey`;
    el("heroTitle").textContent = dest.name;

    const dateRange = formatDateRange(journey.departureDate, journey.returnDate);
    el("metaDuration").textContent = `${duration} Days`;
    el("metaDates").textContent = dateRange || "Flexible";
    el("metaTravelers").textContent = `${journey.adults} Adult${journey.adults > 1 ? "s" : ""}${
      journey.children ? ` · ${journey.children} Child${journey.children > 1 ? "ren" : ""}` : ""
    }`;
    el("metaInterests").textContent = (journey.interests || []).join(" · ") || "—";

    const days = buildDays(dest, duration);
    el("dayList").innerHTML = days
      .map(
        (d, i) => `
      <div class="day-row" data-reveal>
        <div class="day-num">DAY ${String(i + 1).padStart(2, "0")}</div>
        <div>
          <h3 class="day-title">${d.title}</h3>
          <ul class="day-spots">
            ${d.spots.map((s) => `<li>${s}</li>`).join("")}
          </ul>
        </div>
      </div>`
      )
      .join("");

    initRevealForInjected();
    initRoute(dest);
  }

  function initRevealForInjected() {
    const targets = document.querySelectorAll("#dayList [data-reveal]");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    targets.forEach((t) => io.observe(t));
  }

  function initRoute(dest) {
    const canvas = el("routeGlobe");
    if (!canvas || !window.THREE) return;
    const globe = new WanderGlobe(canvas, {
      markers: [
        { lat: ORIGIN.lat, lon: ORIGIN.lon, id: "origin" },
        { lat: dest.lat, lon: dest.lon, id: dest.id },
      ],
      interactive: true,
      autoRotate: false,
    });
    globe.focusOn(dest.lat, dest.lon);
    setTimeout(() => globe.showRoute(ORIGIN, dest), 900);

    el("routeOrigin").textContent = ORIGIN.name;
    el("routeDest").textContent = dest.name;
  }

  document.addEventListener("DOMContentLoaded", render);
})();
