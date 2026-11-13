import type { StatEntry } from "./types";

const NASA_CATALOGUE =
  "https://www.nasa.gov/wp-content/uploads/2024/02/final-catalogue-of-manmade-material-on-the-moon.pdf";
const SPACE_ARTEFACTS_MARS = "https://spaceartefacts.com/human-objects-on-mars";
const NASA_APOLLO = "https://www.nasa.gov/the-apollo-program/";
const NASA_MARS = "https://science.nasa.gov/mars/";
const ARTIFICIAL_MOON = "https://en.wikipedia.org/wiki/List_of_artificial_objects_on_the_Moon";
const ARTIFICIAL_MARS = "https://en.wikipedia.org/wiki/List_of_artificial_objects_on_Mars";

/** One entry per soft-landing mission, including tipped landers, through 2 June 2024. */
export const MOON_SOFT_LANDING_MISSIONS = [
  "Luna 9", "Surveyor 1", "Luna 13", "Surveyor 3", "Surveyor 5", "Surveyor 6", "Surveyor 7",
  "Apollo 11", "Apollo 12", "Luna 16", "Luna 17", "Apollo 14", "Apollo 15", "Luna 20",
  "Apollo 16", "Apollo 17", "Luna 21", "Luna 24", "Chang'e 3", "Chang'e 4", "Chang'e 5",
  "Chandrayaan-3", "SLIM", "IM-1 Odysseus", "Chang'e 6",
] as const;

export interface HeadlineStat {
  id: string;
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  planet: "moon" | "mars" | "both";
  kind: "published" | "estimate";
  definition: string;
  source: string;
  sourceUrl: string;
  asOf: string;
}

export const HEADLINES: HeadlineStat[] = [
  {
    id: "moon-items",
    value: 796,
    label: "catalogued items on the Moon",
    planet: "moon",
    kind: "published",
    definition:
      "The published historical line-item count associated with NASA's 2012 Catalogue of Manmade Material on the Moon — spacecraft parts, experiment packages, tools, bags, flags and other material. It is not 796 intact machines or a current inventory.",
    source: "NASA History Program Office, Final Catalogue of Manmade Material on the Moon (5 July 2012)",
    sourceUrl: NASA_CATALOGUE,
    asOf: "2012-07-05",
  },
  {
    id: "mars-objects",
    value: 190,
    prefix: "over ",
    label: "estimated artificial objects on Mars",
    planet: "mars",
    kind: "estimate",
    definition:
      "A non-exhaustive independent inventory of everything humans have sent that reached Mars: landers, rovers, heat shields, parachutes, backshells, ballast, springs, covers and debris. The author explicitly labels it an estimate, not a census.",
    source: "spaceartefacts.com — Human objects on Mars (non-exhaustive estimate, data through Jan 2024)",
    sourceUrl: SPACE_ARTEFACTS_MARS,
    asOf: "2024-01",
  },
  {
    id: "apollo-samples",
    value: 382,
    suffix: " kg",
    label: "lunar samples returned by Apollo",
    planet: "moon",
    kind: "published",
    definition:
      "Total mass of lunar rock and soil returned by the six Apollo landing missions (Apollo 11, 12, 14, 15, 16, 17). Soviet robotic Luna missions returned a further ~301 g.",
    source: "NASA Science — Apollo program",
    sourceUrl: NASA_APOLLO,
    asOf: "2024-01",
  },
  {
    id: "mars-mass",
    value: 16.8,
    suffix: " t",
    label: "estimated mass on the Martian surface",
    planet: "mars",
    kind: "estimate",
    definition:
      "About 16.8 tonnes on the surface out of roughly 19.5 tonnes sent to Mars, per the independent inventory's estimate. Objects that burned up during entry are excluded.",
    source: "spaceartefacts.com — Human objects on Mars (non-exhaustive estimate, data through Jan 2024)",
    sourceUrl: SPACE_ARTEFACTS_MARS,
    asOf: "2024-01",
  },
];

export const MOON_STATS: StatEntry[] = [
  {
    id: "moon-total",
    label: "Catalogued human-made items",
    count: 796,
    kind: "published",
    definition:
      "Every individual object listed in NASA's 2012 catalogue: spacecraft, descent stages, experiment packages, tools, sample bags, flags, cameras and miscellaneous material. This is not a count of intact vehicles.",
    source: "NASA, Final Catalogue of Manmade Material on the Moon",
    sourceUrl: NASA_CATALOGUE,
    asOf: "2012-07-05",
  },
  {
    id: "moon-landers",
    label: "Soft-landing missions through June 2024",
    count: MOON_SOFT_LANDING_MISSIONS.length,
    kind: "counted",
    definition:
      `Historical snapshot: ${MOON_SOFT_LANDING_MISSIONS.join(", ")}. This is 6 Apollo missions, 5 Surveyors, 7 Soviet Luna landings, 4 Chang'e landings, Chandrayaan-3, SLIM and IM-1. Each mission is counted once; SLIM and Odysseus count despite their tipped attitudes. Later landings are outside this cutoff, and this is not a count of intact landers.`,
    source: "Project compilation of landed-mission records, with an explicit 2 June 2024 cutoff",
    sourceUrl: ARTIFICIAL_MOON,
    asOf: "2024-06-02",
  },
  {
    id: "moon-rovers",
    label: "Rovers delivered through 2023",
    count: 8,
    kind: "counted",
    definition:
      "Historical list: Lunokhod 1, Lunokhod 2, Apollo LRV-1, LRV-2, LRV-3, Yutu, Yutu-2 and Pragyan. These eight remain on the Moon. Delivery does not establish current operation; Yutu-2's present status is not confirmed in this archive. This list excludes SLIM's 2024 LEV-1 hopper and LEV-2 micro-rover and later deliveries.",
    source: "Compiled from mission records; LRV count confirmed by NASA",
    sourceUrl: ARTIFICIAL_MOON,
    asOf: "2023-08-24",
  },
  {
    id: "moon-lrv",
    label: "Apollo Lunar Roving Vehicles left behind",
    count: 3,
    kind: "published",
    definition:
      "LRV-1 (Apollo 15), LRV-2 (Apollo 16) and LRV-3 (Apollo 17). Each vehicle massed 210 kg and remains at its landing site.",
    source: "NASA — Lunar Roving Vehicle programme records",
    sourceUrl: "https://www.nasa.gov/history/alsj/",
    asOf: "1972-12-14",
  },
  {
    id: "moon-alsep",
    label: "Automated experiment stations deployed",
    count: 6,
    kind: "counted",
    definition:
      "Five ALSEP stations (Apollo 12, 14, 15, 16, 17) plus Apollo 11's smaller EASEP. The powered stations carried different combinations of seismic, magnetic and other experiments. Apollo laser reflectors are passive instruments: Apollo 11's was part of EASEP, while those on Apollo 14 and 15 were separate from the powered ALSEP stations.",
    source: "NASA Apollo mission records (ALSEP/EASEP)",
    sourceUrl: "https://www.nasa.gov/history/alsj/",
    asOf: "1972-12-14",
  },
  {
    id: "moon-debris",
    label: "Discarded equipment & consumables",
    count: null,
    kind: "estimate",
    definition:
      "Backpacks, cameras, sample bags, waste bags, packaging and tools were discarded to save ascent mass. Widely cited figures (for example 96 waste bags across the Apollo landings) are estimates drawn from mission logs; NASA's catalogue does not publish a category total.",
    source: "NASA catalogue (item-level only); press estimates for waste bags",
    sourceUrl: NASA_CATALOGUE,
    asOf: "2012-07-05",
  },
  {
    id: "moon-impact",
    label: "Impact debris & crashed stages",
    count: null,
    kind: "estimate",
    definition:
      "Spent ascent stages, Ranger and Luna impactors, and failed landers are scattered across the Moon. Several deliberate impacts were tracked by Apollo seismometers, but no consolidated public count of impact sites with debris exists.",
    source: "NASA catalogue (item-level only)",
    sourceUrl: NASA_CATALOGUE,
    asOf: "2012-07-05",
  },
  {
    id: "moon-mass",
    label: "Total mass left on the lunar surface",
    count: 187400,
    kind: "estimate",
    definition:
      "Approximately 187,400 kg of human-made material on the Moon, including the Apollo descent stages and rovers. Derived from summing published dry masses of landed hardware; it is an estimate, not a measured total.",
    source: "Compiled from landed-mission mass records",
    sourceUrl: ARTIFICIAL_MOON,
    asOf: "Inventory cutoff not specified by source",
  },
];

export const MARS_STATS: StatEntry[] = [
  {
    id: "mars-total",
    label: "Estimated artificial objects",
    count: 190,
    kind: "estimate",
    definition:
      "An independent, non-exhaustive inventory of everything that reached Mars: landers, rovers, parachutes, heat shields, backshells, ballast, covers and debris. The author labels it 'over 190' — an estimate, not a census.",
    source: "spaceartefacts.com — Human objects on Mars",
    sourceUrl: SPACE_ARTEFACTS_MARS,
    asOf: "2024-01",
  },
  {
    id: "mars-missions",
    label: "Missions with hardware on the surface",
    count: null,
    kind: "counted",
    definition:
      "A mission total depends on whether rover and lander pairs, separately launched penetrators and failed landings are grouped together. The earlier total of 14 was not supported by an explicit mission list, so no consolidated total is shown. The linked inventory documents the individual objects and attempts.",
    source: "Landed-object inventory; no reproducible consolidated mission total established",
    sourceUrl: ARTIFICIAL_MARS,
    asOf: "2024-01",
  },
  {
    id: "mars-rovers",
    label: "Deployed rovers & rotorcraft through 2021",
    count: 7,
    kind: "counted",
    definition:
      "Sojourner, Spirit, Opportunity, Curiosity, Perseverance, Zhurong (six wheeled rovers) plus the Ingenuity helicopter. This counts deployed mobile vehicles, excluding the two Soviet PROP-M robots that never deployed. Delivery and operational status are separate measures; Curiosity and Perseverance are marked active in this archive.",
    source: "NASA / CNSA mission records",
    sourceUrl: NASA_MARS,
    asOf: "2021-05-22",
  },
  {
    id: "mars-landers",
    label: "Selected stationary landers through 2021",
    count: 7,
    kind: "counted",
    definition:
      "Selected list: Viking 1, Viking 2, Mars Pathfinder, Phoenix, InSight, Mars 3 and the Tianwen-1 landing platform. This is not a census of every stationary object or unsuccessful surface mission; Beagle 2 and impact debris are excluded from this seven-object list.",
    source: "Compiled from landed-object inventories",
    sourceUrl: ARTIFICIAL_MARS,
    asOf: "2021-05-15",
  },
  {
    id: "mars-instruments",
    label: "Scientific instruments & payloads",
    count: null,
    kind: "estimate",
    definition:
      "Dozens of instruments have operated on the surface — spectrometers, seismometers, weather stations, drills and cameras. No public inventory counts individual instruments, so this figure is deliberately left uncounted rather than guessed.",
    source: "No consolidated public count identified",
    sourceUrl: NASA_MARS,
    asOf: "2024-01",
  },
  {
    id: "mars-landing-gear",
    label: "Landing system components",
    count: null,
    kind: "estimate",
    definition:
      "Heat shields, backshells, parachutes, airbags, descent stages, sky-crane hardware and ballast are all on Mars. The inventory lists them by type but does not publish per-type totals; any single number would be a fabrication.",
    source: "spaceartefacts.com — Human objects on Mars (type column, no subtotals)",
    sourceUrl: SPACE_ARTEFACTS_MARS,
    asOf: "2024-01",
  },
  {
    id: "mars-failed",
    label: "Selected failed landing attempts",
    count: 4,
    kind: "counted",
    definition:
      "This selected list counts Mars 2 (1971), Mars 6 (1974), Mars Polar Lander (1999) and Schiaparelli (2016). It is not a complete census of unsuccessful surface missions: Beagle 2 reached the ground but failed to communicate, and the Deep Space 2 penetrators are separate objects. Mars Polar Lander's exact location has never been confirmed.",
    source: "Compiled from ESA, NASA and Roscosmos mission records",
    sourceUrl: ARTIFICIAL_MARS,
    asOf: "2016-10-19",
  },
  {
    id: "mars-mass",
    label: "Estimated mass on the Martian surface",
    count: 16.8,
    suffix: " t",
    kind: "estimate",
    definition:
      "About 16.8 tonnes on the surface out of roughly 19.5 tonnes sent to Mars, per the inventory's estimate. Some objects burned up during entry and are excluded.",
    source: "spaceartefacts.com — Human objects on Mars",
    sourceUrl: SPACE_ARTEFACTS_MARS,
    asOf: "2024-01",
  },
];

export const STAT_NOTES = [
  "Counts of individual items and counts of intact machines are not the same thing. The Moon's 796 is an item catalogue; Mars' 190+ is an estimate of objects including debris.",
  "The NASA catalogue dates from 2012 and predates Chang'e 3/4/5/6, Chandrayaan-3, SLIM and commercial landers. It is a 2012 snapshot, not a live total.",
  "The 25 lunar soft-landing missions are a separate historical compilation through 2 June 2024, not a present-day total. The eight lunar rovers are a delivery list through August 2023; neither figure counts newer missions.",
  "Where no published count exists, AFTERLIGHT shows an em dash rather than inventing a number. Rows marked 'counted' are compiled from landed-mission records by this project and are reproducible from the mission lists.",
];
