# WANDER

> "Go somewhere you've never been."

A premium, cinematic travel-planning front end built for **DecodeLabs Frontend
Development — Project 4**. Vanilla HTML/CSS/JS, an interactive Three.js globe,
GSAP motion, and a fully validated multi-step trip planner — no framework,
no backend.

## Pages

| File              | What it is                                                         |
| ------------------ | ------------------------------------------------------------------- |
| `index.html`       | Cinematic hero with an interactive 3D globe, editorial destination takeovers, about section |
| `planner.html`     | 8-step journey builder — destination, dates, travelers, interests, budget, preferences, contact, review |
| `itinerary.html`   | Generated day-by-day itinerary + animated route visualization       |

## Structure

```
wander/
├── index.html
├── planner.html
├── itinerary.html
├── css/
│   ├── style.css
│   ├── responsive.css
│   └── animations.css
└── js/
    ├── data.js          # destination + itinerary content
    ├── globe.js          # reusable Three.js globe (markers, focus, route)
    ├── main.js            # homepage: hero globe + destination panels
    ├── planner.js         # multi-step planner state, controls, review, submit
    ├── validation.js       # inline, accessible form validation helpers
    ├── itinerary.js        # renders the generated itinerary from planner output
    └── animations.js       # scroll reveals, compact nav, hero text entrance
```

## Running it

No build step. Any static server works:

```bash
npx serve .
# or
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Stack

- HTML5 / CSS3 / vanilla JavaScript
- [Three.js](https://threejs.org/) r128 — the globe
- [GSAP](https://gsap.com/) 3.12 — hero + micro-interaction motion
- Google Fonts: Fraunces (display) + Inter (body)

## Notes

- Data flows between `planner.html` and `itinerary.html` via
  `sessionStorage` (`wanderJourney`) — no backend required.
- Respects `prefers-reduced-motion` throughout.
- Destination photography is hotlinked from Unsplash; each image has a
  silent `onerror` fallback to a solid brand-color panel.
