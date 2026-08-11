/**
 * data.js
 * Static destination and itinerary data. No backend — everything
 * the planner and itinerary pages need lives here.
 */

const DESTINATIONS = [
  {
    id: "istanbul",
    name: "Istanbul",
    country: "Türkiye",
    tagline: "Where continents meet.",
    lat: 41.0082,
    lon: 28.9784,
    image: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1600&q=80",
    fallback: "#5a4a3a",
    itinerary: [
      { title: "Arrival", spots: ["Istanbul Airport transfer", "Check in near Sultanahmet", "Evening walk along the Bosphorus"] },
      { title: "Old City", spots: ["Hagia Sophia at sunrise", "Blue Mosque", "Grand Bazaar"] },
      { title: "The Bosphorus", spots: ["Morning ferry cruise", "Karaköy waterfront", "Galata Tower at dusk"] },
      { title: "Asian Side", spots: ["Kadıköy market streets", "Moda seafront", "Rooftop dinner overlooking the strait"] },
    ],
  },
  {
    id: "tokyo",
    name: "Tokyo",
    country: "Japan",
    tagline: "Tradition, at the speed of light.",
    lat: 35.6762,
    lon: 139.6503,
    image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1600&q=80",
    fallback: "#3a3d4a",
    itinerary: [
      { title: "Arrival", spots: ["Narita Express into the city", "Check in, Shinjuku", "Omoide Yokocho for dinner"] },
      { title: "Shibuya & Harajuku", spots: ["Shibuya Crossing", "Takeshita Street", "Meiji Shrine"] },
      { title: "Old Tokyo", spots: ["Senso-ji Temple", "Nakamise shopping street", "Sumida River evening walk"] },
      { title: "Day Trip", spots: ["Hakone ropeway", "Mt. Fuji viewpoint", "Onsen soak before returning"] },
    ],
  },
  {
    id: "bali",
    name: "Bali",
    country: "Indonesia",
    tagline: "Slow mornings, warm water.",
    lat: -8.3405,
    lon: 115.0920,
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1600&q=80",
    fallback: "#3f4a3a",
    itinerary: [
      { title: "Arrival", spots: ["Denpasar transfer to Ubud", "Rice-field villa check-in", "Sunset at a rooftop café"] },
      { title: "Ubud", spots: ["Tegallalang rice terraces", "Sacred Monkey Forest", "Traditional Balinese dinner"] },
      { title: "The Coast", spots: ["Uluwatu cliffside temple", "Surf lesson at Padang Padang", "Kecak fire dance at dusk"] },
      { title: "Island Time", spots: ["Sunrise at Mount Batur", "Hot springs", "Slow afternoon by the water"] },
    ],
  },
  {
    id: "paris",
    name: "Paris",
    country: "France",
    tagline: "Every street, a rehearsal for romance.",
    lat: 48.8566,
    lon: 2.3522,
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1600&q=80",
    fallback: "#3a3a3d",
    itinerary: [
      { title: "Arrival", spots: ["CDG transfer to Le Marais", "Check in", "Evening along the Seine"] },
      { title: "The Icons", spots: ["Eiffel Tower at golden hour", "Trocadéro gardens", "Dinner in Saint-Germain"] },
      { title: "Art & Light", spots: ["Musée d'Orsay", "Tuileries Garden", "Louvre by night lights"] },
      { title: "Montmartre", spots: ["Sacré-Cœur", "Place du Tertre artists", "Wine bar nightcap"] },
    ],
  },
  {
    id: "dubai",
    name: "Dubai",
    country: "UAE",
    tagline: "The desert, reimagined in glass.",
    lat: 25.2048,
    lon: 55.2708,
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1600&q=80",
    fallback: "#4a4436",
    itinerary: [
      { title: "Arrival", spots: ["Airport transfer to Downtown", "Check in", "Dubai Fountain show"] },
      { title: "Skyline", spots: ["Burj Khalifa observation deck", "Dubai Mall", "Old Town souks"] },
      { title: "The Desert", spots: ["Dune drive at sunset", "Bedouin camp dinner", "Stargazing"] },
      { title: "The Coast", spots: ["Jumeirah Beach morning", "Marina walk", "Rooftop dinner"] },
    ],
  },
  {
    id: "rome",
    name: "Rome",
    country: "Italy",
    tagline: "Three thousand years, one afternoon.",
    lat: 41.9028,
    lon: 12.4964,
    image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1600&q=80",
    fallback: "#4a3d36",
    itinerary: [
      { title: "Arrival", spots: ["Fiumicino transfer", "Check in near Trastevere", "Aperitivo at dusk"] },
      { title: "Ancient Rome", spots: ["Colosseum", "Roman Forum", "Palatine Hill sunset"] },
      { title: "Vatican", spots: ["Sistine Chapel", "St. Peter's Basilica", "Castel Sant'Angelo"] },
      { title: "Trastevere", spots: ["Morning market", "Trevi Fountain", "Late dinner, cobblestone streets"] },
    ],
  },
  {
    id: "london",
    name: "London",
    country: "United Kingdom",
    tagline: "Old stone, new stories.",
    lat: 51.5072,
    lon: -0.1276,
    image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1600&q=80",
    fallback: "#393b3f",
    itinerary: [
      { title: "Arrival", spots: ["Heathrow Express", "Check in near Covent Garden", "Evening on the South Bank"] },
      { title: "Westminster", spots: ["Big Ben & Parliament", "Westminster Abbey", "St. James's Park"] },
      { title: "Museums", spots: ["Tate Modern", "Borough Market lunch", "Tower Bridge at dusk"] },
      { title: "Notting Hill", spots: ["Portobello Road", "Kensington Gardens", "Farewell dinner in Soho"] },
    ],
  },
];

function findDestination(idOrName) {
  if (!idOrName) return null;
  const key = idOrName.toLowerCase();
  return (
    DESTINATIONS.find((d) => d.id === key) ||
    DESTINATIONS.find((d) => d.name.toLowerCase() === key) ||
    null
  );
}

// Origin used for the route visualization — Karachi, Pakistan.
const ORIGIN = { name: "Karachi", lat: 24.8607, lon: 67.0011 };
