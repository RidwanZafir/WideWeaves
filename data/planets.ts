import type { Planet } from "./types";
import { MOON_STATS, MARS_STATS } from "./stats";
export { DEEP_SPACE } from "./deep-space";

const lunarLandings = MOON_STATS.find((stat) => stat.id === "moon-landers")!;
const marsMobile = MARS_STATS.find((stat) => stat.id === "mars-rovers")!;

export interface PlanetMeta {
  id: Planet;
  name: string;
  subtitle: string;
  countLine: string;
  catalogued: string;
  missions: string;
  intro: string;
  detail: string;
  /** Equirectangular 2:1 map used for the 3D spheres and atmospheres. */
  texture: string;
  /** Pre-projected circular globe for crisp 2D thumbnails. */
  globe: string;
  accent: string;
  accentSoft: string;
  sky: [string, string, string];
  facts: { label: string; value: string }[];
}

export const PLANETS: Record<Planet, PlanetMeta> = {
  moon: {
    id: "moon",
    name: "The Moon",
    subtitle: "Earth's oldest museum of exploration",
    countLine: `${lunarLandings.count} soft landings through June 2024 · historical snapshot`,
    catalogued: "796 items · NASA's 2012 catalogue",
    missions: `${lunarLandings.count} landings through June 2024`,
    intro:
      "Six crews walked here, three drove across it, and robots from many nations sit in the dust. The Moon holds the only place where humans have left footprints on another world — and the hardware that made it possible.",
    detail:
      "A world with an extremely tenuous exosphere and no wind or rain. Hardware can persist for decades, but sunlight, temperature cycles, radiation and micrometeoroid impacts gradually alter exposed material.",
    texture: "/textures/moon.jpg",
    globe: "/textures/moon-globe.png",
    accent: "#8fc3ff",
    accentSoft: "#2f7dff",
    sky: ["#040a18", "#0a1d3f", "#16324f"],
    facts: [
      { label: "Surface gravity", value: "1.62 m/s² (16.6% of Earth)" },
      { label: "Solar day", value: "29.5 Earth days" },
      { label: "Mean distance", value: "384,400 km" },
      { label: "Daytime max", value: "About 120 °C" },
    ],
  },
  mars: {
    id: "mars",
    name: "Mars",
    subtitle: "The planet of silent explorers",
    countLine: `${marsMobile.count} deployed mobile vehicles through 2021 · rovers and rotorcraft`,
    catalogued: "190+ estimated objects",
    missions: "Surface missions and landing attempts",
    intro:
      "No humans have stood on Mars — yet. Telescopes and spacecraft reveal its history: rovers that outlived their planned missions, landers that listened to the planet's interior, and one helicopter that flew in air about one percent as dense as Earth's.",
    detail:
      "A cold desert with a thin CO₂ atmosphere, planet-wide dust storms and evidence of ancient rivers. Every wheel track here was made by a robot.",
    texture: "/textures/mars.jpg",
    globe: "/textures/mars-globe.png",
    accent: "#ff9a52",
    accentSoft: "#ff6a2c",
    sky: ["#0d0705", "#2a1208", "#7a2f12"],
    facts: [
      { label: "Surface gravity", value: "3.72 m/s² (38% of Earth)" },
      { label: "Day length", value: "24 h 39 m (one sol)" },
      { label: "Distance from Earth", value: "Varies with both planets' orbits" },
      { label: "Surface extremes", value: "About −153 to 20 °C" },
    ],
  },
};
