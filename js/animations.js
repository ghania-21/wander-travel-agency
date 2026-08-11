/**
 * animations.js
 * Scroll reveals, compact nav, and the hero text entrance.
 * Shared across all pages.
 */

(function () {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function initRevealObserver() {
    const targets = document.querySelectorAll("[data-reveal], [data-reveal-stagger]");
    if (!targets.length) return;

    if (reduced) {
      targets.forEach((el) => el.classList.add("is-in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
    );
    targets.forEach((el) => io.observe(el));
  }

  function initCompactNav() {
    const nav = document.getElementById("siteNav");
    if (!nav) return;
    const onScroll = () => {
      nav.classList.toggle("is-compact", window.scrollY > 60);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  function initNavToggle() {
    const toggle = document.getElementById("navToggle");
    if (!toggle) return;
    toggle.addEventListener("click", () => {
      const open = document.body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    document.querySelectorAll(".nav-links a").forEach((a) =>
      a.addEventListener("click", () => {
        document.body.classList.remove("nav-open");
        toggle.setAttribute("aria-expanded", "false");
      })
    );
  }

  function initHeroTitle() {
    const lines = document.querySelectorAll(".hero-title .line span");
    if (!lines.length) return;

    if (reduced || !window.gsap) {
      lines.forEach((l) => (l.style.transform = "none"));
      return;
    }

    gsap.set(lines, { yPercent: 110 });
    gsap.to(lines, {
      yPercent: 0,
      duration: 1.1,
      ease: "power4.out",
      stagger: 0.12,
      delay: 0.25,
    });
    gsap.fromTo(
      ".hero [data-reveal]",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", delay: 0.7, stagger: 0.08 }
    );
  }

  function initHeroParallax() {
    const img = document.querySelector(".hero-media img");
    if (!img || reduced) return;
    const hero = document.querySelector(".hero");
    const onScroll = () => {
      const rect = hero.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      const offset = window.scrollY * 0.12;
      img.style.transform = `scale(1.08) translateY(${offset}px)`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  document.addEventListener("DOMContentLoaded", () => {
    initRevealObserver();
    initCompactNav();
    initNavToggle();
    initHeroTitle();
    initHeroParallax();
  });
})();
